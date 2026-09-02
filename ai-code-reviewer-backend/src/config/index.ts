import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function pathResolveDefault(_envKey: string, relativeFromConfig: string): string {
  return path.resolve(__dirname, relativeFromConfig);
}

export type ReviewMode = 'tools' | 'legacy';

function resolveReviewMode(value?: string): ReviewMode {
  return value === 'legacy' ? 'legacy' : 'tools';
}

export function hasOpenAIKey(apiKey = process.env.OPENAI_API_KEY): boolean {
  const key = (apiKey || '').trim();
  if (!key) return false;
  if (/^your[-_]?openai/i.test(key)) return false;
  if (/^sk-your/i.test(key)) return false;
  if (key === 'changeme' || key === 'sk-xxx') return false;
  return true;
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  review: {
    mode: resolveReviewMode(process.env.REVIEW_MODE),
  },
  eval: {
    fixturesPath:
      process.env.EVAL_FIXTURES_PATH ||
      pathResolveDefault('EVAL_FIXTURES_PATH', '../../../fixtures/eval'),
    reportPath:
      process.env.EVAL_REPORT_PATH ||
      pathResolveDefault('EVAL_REPORT_PATH', '../../eval/last-report.json'),
  },
  
  database: {
    url: process.env.DATABASE_URL || '',
  },
  
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || '',
  },
  
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  },
  
  aws: {
    region: process.env.AWS_REGION || 'us-east-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    s3Bucket: process.env.AWS_S3_BUCKET || '',
  },
  
  email: {
    from: process.env.EMAIL_FROM || 'noreply@aivalidator.com',
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      user: process.env.SMTP_USER || '',
      password: process.env.SMTP_PASSWORD || '',
    },
  },
  
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '15', 10) * 60 * 1000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    validationLimitPerHour: parseInt(process.env.VALIDATION_LIMIT_PER_HOUR || '20', 10),
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '1048576', 10), // 1MB
    maxFiles: parseInt(process.env.MAX_FILES_PER_VALIDATION || '20', 10),
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },
};
