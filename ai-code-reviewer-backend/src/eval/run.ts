import fs from 'fs/promises';
import path from 'path';
import { config, hasOpenAIKey } from '../config';
import agentService from '../services/agent.service';
import { loadFixtures, reportPath } from './load';
import { aggregateScores, scoreFixture } from './score';
import { EvalReport } from './types';

export async function runEval(): Promise<EvalReport> {
  const fixtures = await loadFixtures();
  const scores = [];

  for (const fixture of fixtures) {
    const review = await agentService.reviewWorkspace(fixture.inputDir);
    scores.push(scoreFixture(fixture, review.findings));
  }

  const totals = aggregateScores(scores);
  const report: EvalReport = {
    generatedAt: new Date().toISOString(),
    reviewMode: hasOpenAIKey() ? config.review.mode : 'deterministic',
    usedOpenAI: hasOpenAIKey(),
    fixtureCount: fixtures.length,
    ...totals,
    fixtures: scores,
    notes: 'Precision/recall are computed on must_fix labels vs critical/high findings.',
  };

  const out = reportPath();
  await fs.mkdir(path.dirname(out), { recursive: true });
  await fs.writeFile(out, JSON.stringify(report, null, 2), 'utf8');
  return report;
}

function printReport(report: EvalReport): void {
  const pct = (value: number) => `${(value * 100).toFixed(1)}%`;
  console.log('Codebird eval');
  console.log(`fixtures: ${report.fixtureCount}`);
  console.log(`mode: ${report.reviewMode}${report.usedOpenAI ? '' : ' (no OpenAI key)'}`);
  console.log(`precision: ${pct(report.precision)}`);
  console.log(`recall: ${pct(report.recall)}`);
  console.log(`f1: ${pct(report.f1)}`);
  console.log(`tp=${report.truePositives} fp=${report.falsePositives} fn=${report.falseNegatives}`);
  console.log(`report: ${reportPath()}`);
}

if (require.main === module) {
  runEval()
    .then((report) => {
      printReport(report);
    })
    .catch((error) => {
      console.error('Eval failed:', error);
      process.exit(1);
    });
}
