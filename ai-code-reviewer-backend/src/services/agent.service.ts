import fs from 'fs/promises';
import path from 'path';
import OpenAI from 'openai';
import { config, hasOpenAIKey, ReviewMode } from '../config';
import logger from '../utils/logger';
import {
  AgentReviewResult,
  Finding,
  FindingSeverity,
  ToolCallRecord,
} from '../types/finding';
import { ALL_TOOLS, ToolContext, executeTool, previewOutput, listFilesTool } from '../tools';
import { deterministicReview } from './deterministic.reviewer';
import aiService from './ai.service';

const MAX_TOOL_CALLS = 8;

const SEVERITIES: FindingSeverity[] = ['critical', 'high', 'medium', 'low'];

function normalizeFinding(raw: Partial<Finding>, fallbackFile = 'unknown'): Finding {
  const severity = SEVERITIES.includes(raw.severity as FindingSeverity)
    ? (raw.severity as FindingSeverity)
    : 'medium';
  const line =
    typeof raw.line === 'number' && Number.isFinite(raw.line) ? raw.line : null;
  return {
    severity,
    file: String(raw.file || fallbackFile),
    line,
    message: String(raw.message || 'Issue detected'),
    evidence: String(raw.evidence || ''),
    suggestion: String(raw.suggestion || ''),
    rule: raw.rule ? String(raw.rule) : undefined,
  };
}

function scoreFromFindings(findings: Finding[]): number {
  const penalty = findings.reduce((sum, finding) => {
    if (finding.severity === 'critical') return sum + 25;
    if (finding.severity === 'high') return sum + 15;
    if (finding.severity === 'medium') return sum + 6;
    return sum + 2;
  }, 0);
  return Math.max(0, Math.min(100, 100 - penalty));
}

function openaiTools(): OpenAI.Chat.ChatCompletionTool[] {
  return ALL_TOOLS.map((tool) => ({
    type: 'function',
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    },
  }));
}

async function runToolAgent(workspacePath: string): Promise<AgentReviewResult> {
  const openai = new OpenAI({ apiKey: config.openai.apiKey });
  const ctx: ToolContext = { workspaceRoot: workspacePath };
  const toolCalls: ToolCallRecord[] = [];

  const listed = await listFilesTool.execute({ path: '.' }, ctx);
  const filePreview =
    listed.ok && listed.data
      ? JSON.stringify(listed.data).slice(0, 1500)
      : 'Unable to list files';

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `You are a read-only code reviewer. First write a short plan, then call tools (max ${MAX_TOOL_CALLS} total), then return structured findings.

Available tools: ${ALL_TOOLS.map((t) => t.name).join(', ')}.
You can ONLY inspect the job workspace. Do not invent writes, pushes, or deletes.

When finished, return JSON:
{
  "summary": "string",
  "findings": [
    {
      "severity": "critical|high|medium|low",
      "file": "relative/path",
      "line": 12,
      "message": "what is wrong",
      "evidence": "snippet",
      "suggestion": "how to fix"
    }
  ]
}

Must-fix issues are critical/high (bugs, secrets, injection, XSS, eval, traversal, weak JWT, open redirect, unused await, off-by-one). Style issues are low.`,
    },
    {
      role: 'user',
      content: `Review the workspace. Start with a brief plan, then inspect with tools.

Workspace file listing:
${filePreview}`,
    },
  ];

  let forcedFinal = false;

  for (let turn = 0; turn < 10; turn++) {
    const atLimit = toolCalls.length >= MAX_TOOL_CALLS || forcedFinal;
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      temperature: 0.2,
      messages,
      tools: atLimit ? undefined : openaiTools(),
      tool_choice: atLimit ? undefined : 'auto',
      response_format: atLimit ? { type: 'json_object' } : undefined,
    });

    const message = response.choices[0]?.message;
    if (!message) {
      break;
    }

    messages.push(message);

    if (message.tool_calls && message.tool_calls.length > 0 && !atLimit) {
      for (const call of message.tool_calls) {
        if (toolCalls.length >= MAX_TOOL_CALLS) break;
        let args: Record<string, unknown> = {};
        try {
          args = JSON.parse(call.function.arguments || '{}');
        } catch {
          args = {};
        }
        const started = Date.now();
        const result = await executeTool(call.function.name, args, ctx);
        toolCalls.push({
          name: call.function.name,
          input: args,
          outputPreview: result.ok ? previewOutput(result.data) : result.error || 'error',
          durationMs: Date.now() - started,
          ok: result.ok,
        });
        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          content: JSON.stringify(result).slice(0, 8000),
        });
      }
      continue;
    }

    const content = message.content || '';
    try {
      const parsed = JSON.parse(content) as {
        summary?: string;
        findings?: Partial<Finding>[];
      };
      const findings = (parsed.findings || []).map((item) => normalizeFinding(item));
      return {
        findings,
        toolCalls,
        summary: parsed.summary || `Tool review with ${findings.length} finding(s).`,
        score: scoreFromFindings(findings),
        reviewMode: 'tools',
      };
    } catch {
      if (!forcedFinal) {
        forcedFinal = true;
        messages.push({
          role: 'user',
          content:
            'Stop calling tools. Return the final JSON object with summary and findings now.',
        });
        continue;
      }
      return {
        findings: [],
        toolCalls,
        summary: content.slice(0, 2000) || 'Review completed without structured findings.',
        score: 0,
        reviewMode: 'tools',
      };
    }
  }

  return {
    findings: [],
    toolCalls,
    summary: 'Review ended before structured findings were produced.',
    score: 0,
    reviewMode: 'tools',
  };
}

async function runLegacyDump(workspacePath: string): Promise<AgentReviewResult> {
  const listed = await listFilesTool.execute({ path: '.' }, { workspaceRoot: workspacePath });
  const files =
    listed.ok && listed.data && typeof listed.data === 'object'
      ? ((listed.data as { files?: string[] }).files || [])
      : [];

  const payloads: Array<{ fileName: string; filePath: string; content: string }> = [];
  for (const rel of files.slice(0, 20)) {
    const abs = path.join(workspacePath, rel);
    try {
      const content = await fs.readFile(abs, 'utf8');
      payloads.push({
        fileName: path.basename(rel),
        filePath: rel,
        content: content.slice(0, 80_000),
      });
    } catch {
      // skip unreadable
    }
  }

  const results = await aiService.validateMultipleFiles(payloads);
  const findings: Finding[] = [];
  for (const result of results) {
    for (const issue of result.issues || []) {
      findings.push(
        normalizeFinding({
          severity: issue.severity,
          file: result.filePath || result.fileName,
          line: issue.line,
          message: issue.message,
          evidence: '',
          suggestion: issue.suggestion,
        })
      );
    }
  }

  const summary = await aiService.generateSummary(results);
  return {
    findings,
    toolCalls: [],
    summary,
    score:
      results.length > 0
        ? results.reduce((sum, r) => sum + r.score, 0) / results.length
        : scoreFromFindings(findings),
    reviewMode: 'legacy',
  };
}

export class AgentService {
  async reviewWorkspace(workspacePath: string, mode?: ReviewMode): Promise<AgentReviewResult> {
    const reviewMode = mode || config.review.mode;
    logger.info(`Agent review starting mode=${reviewMode} workspace=${workspacePath}`);

    if (!hasOpenAIKey()) {
      const result = await deterministicReview(workspacePath);
      return { ...result, reviewMode: 'deterministic' };
    }

    if (reviewMode === 'legacy') {
      return runLegacyDump(workspacePath);
    }

    try {
      return await runToolAgent(workspacePath);
    } catch (error) {
      logger.error('Tool agent failed, falling back to deterministic reviewer:', error);
      const result = await deterministicReview(workspacePath);
      return { ...result, reviewMode: 'deterministic' };
    }
  }
}

export default new AgentService();
