import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

process.env.START_QUEUE_WORKER = '0';
process.env.EVAL_FIXTURES_PATH =
  process.env.EVAL_FIXTURES_PATH || path.resolve(__dirname, '../../fixtures/eval');
process.env.EVAL_REPORT_PATH =
  process.env.EVAL_REPORT_PATH || path.resolve(__dirname, '../eval/last-report.json');

fs.mkdirSync(path.resolve(__dirname, '../logs'), { recursive: true });
