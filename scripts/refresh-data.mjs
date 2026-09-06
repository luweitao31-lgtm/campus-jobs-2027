import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const write = process.argv.includes('--write');
const registryPath = path.resolve('data/source-registry.json');
const outputPath = path.resolve('data/source-health.json');
const registry = JSON.parse(await readFile(registryPath, 'utf8'));

const results = [];
for (const source of registry.sources) {
  const started = Date.now();
  try {
    const response = await fetch(source.url, { redirect: 'follow', signal: AbortSignal.timeout(15000), headers: { 'user-agent': 'NanningCampusInfoBot/1.0 (+public-source-check)' } });
    const text = await response.text();
    const matched = source.expected.some((pattern) => new RegExp(pattern, 'i').test(text));
    results.push({ id: source.id, checkedAt: new Date().toISOString(), httpStatus: response.status, health: response.ok && matched ? '正常' : response.ok ? '内容待确认' : '异常', elapsedMs: Date.now() - started });
  } catch (error) {
    results.push({ id: source.id, checkedAt: new Date().toISOString(), httpStatus: null, health: '异常', elapsedMs: Date.now() - started, message: error instanceof Error ? error.message : '未知错误' });
  }
}

const report = { schemaVersion: 1, mode: write ? 'write' : 'dry-run', completedAt: new Date().toISOString(), results };
if (write) await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
console.log(JSON.stringify(report, null, 2));
if (results.every((result) => result.health === '异常')) process.exitCode = 1;
