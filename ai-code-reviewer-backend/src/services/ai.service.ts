import OpenAI from 'openai';
import { config } from '../config';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';

interface FileValidationRequest {
  fileName: string;
  content: string;
  filePath: string;
}

interface ValidationResult {
  fileName: string;
  filePath: string;
  score: number;
  aiAnalysis: string;
  issuesFound: number;
  issues: Array<{
    severity: 'critical' | 'high' | 'medium' | 'low';
    line: number | null;
    message: string;
    suggestion: string;
  }>;
  recommendations: string[];
}

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
  }

  async validateCode(file: FileValidationRequest): Promise<ValidationResult> {
    try {
      const prompt = this.buildValidationPrompt(file);

      const response = await this.openai.chat.completions.create({
        model: config.openai.model,
        messages: [
          {
            role: 'system',
            content: `You are an expert code reviewer. Analyze the code and provide:
1. A quality score (0-100)
2. Detailed analysis of issues
3. Specific recommendations
4. Each issue should have severity, line number (if applicable), message, and suggestion

Return your response in JSON format with this structure:
{
  "score": number,
  "summary": "string",
  "issues": [
    {
      "severity": "critical|high|medium|low",
      "line": number or null,
      "message": "string",
      "suggestion": "string"
    }
  ],
  "recommendations": ["string"]
}`,
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new AppError(500, 'AI response was empty');
      }

      const result = JSON.parse(content);

      logger.info(`AI validation completed for file: ${file.fileName}`);

      return {
        fileName: file.fileName,
        filePath: file.filePath,
        score: result.score || 0,
        aiAnalysis: result.summary || '',
        issuesFound: result.issues?.length || 0,
        issues: result.issues || [],
        recommendations: result.recommendations || [],
      };
    } catch (error) {
      logger.error(`AI validation failed for file ${file.fileName}:`, error);
      
      if (error instanceof AppError) throw error;
      
      throw new AppError(
        500,
        `Failed to validate code with AI: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private buildValidationPrompt(file: FileValidationRequest): string {
    return `
File: ${file.fileName}
Path: ${file.filePath}

Code to analyze:
\`\`\`
${file.content}
\`\`\`

Please analyze this code for:
1. Code quality and best practices
2. Potential bugs and security issues
3. Performance concerns
4. Maintainability and readability
5. Proper error handling
6. Code complexity

Provide a detailed analysis with specific line references where applicable.
    `.trim();
  }

  async validateMultipleFiles(
    files: FileValidationRequest[]
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    // Process files sequentially to avoid rate limits
    for (const file of files) {
      try {
        const result = await this.validateCode(file);
        results.push(result);
      } catch (error) {
        logger.error(`Failed to validate file ${file.fileName}:`, error);
        // Continue with other files even if one fails
        results.push({
          fileName: file.fileName,
          filePath: file.filePath,
          score: 0,
          aiAnalysis: 'Failed to validate this file',
          issuesFound: 0,
          issues: [],
          recommendations: [],
        });
      }
    }

    return results;
  }

  async generateSummary(fileResults: ValidationResult[]): Promise<string> {
    try {
      const totalFiles = fileResults.length;
      const averageScore =
        fileResults.reduce((sum, r) => sum + r.score, 0) / totalFiles;
      const totalIssues = fileResults.reduce((sum, r) => sum + r.issuesFound, 0);

      const criticalIssues = fileResults.reduce(
        (sum, r) =>
          sum + r.issues.filter((i) => i.severity === 'critical').length,
        0
      );

      const summary = `
Code Validation Summary:
- Files Analyzed: ${totalFiles}
- Average Score: ${averageScore.toFixed(1)}/100
- Total Issues Found: ${totalIssues}
- Critical Issues: ${criticalIssues}

${
  averageScore >= 80
    ? '✅ Great job! The code quality is excellent.'
    : averageScore >= 60
    ? '⚠️  Code quality is acceptable but could be improved.'
    : '❌ Significant improvements needed in code quality.'
}

Top Issues:
${fileResults
  .filter((r) => r.issues.length > 0)
  .slice(0, 5)
  .map((r) => `- ${r.fileName}: ${r.issues[0].message}`)
  .join('\n')}
      `.trim();

      return summary;
    } catch (error) {
      logger.error('Failed to generate summary:', error);
      return 'Failed to generate validation summary';
    }
  }
}

export default new AIService();
