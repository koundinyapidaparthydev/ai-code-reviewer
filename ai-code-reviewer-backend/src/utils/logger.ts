import winston from 'winston';
import { config } from '../config';

function redactSecrets(value: string): string {
  return value
    .replace(/sk-(?:live|test)-[A-Za-z0-9_-]+/gi, 'sk-[redacted]')
    .replace(/SuperSecret123/g, '[redacted]')
    .replace(
      /(password|api[_-]?key|secret|token)\s*[:=]\s*['"][^'"]+['"]/gi,
      '$1=[redacted]'
    );
}

const redactFormat = winston.format((info) => {
  if (typeof info.message === 'string') {
    info.message = redactSecrets(info.message);
  }
  if (info.stack && typeof info.stack === 'string') {
    info.stack = redactSecrets(info.stack);
  }
  return info;
})();

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    redactFormat,
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'ai-code-validator' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (config.env === 'development') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        redactFormat,
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

export default logger;
