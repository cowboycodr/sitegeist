#!/usr/bin/env node

import { readFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { atomicWrite, parseCli, requireOption } from './lib/artifacts.mjs';

const usage = `Usage:
  node scripts/benchmark/reset-batch-to-checkpoint.mjs \\
    --submissions <directory> --summary <report.json> --checkpoint-id <id>

Deletes every accepted artifact after a known-good contiguous checkpoint and
resets every later summary record to an unattempted pending state. Use this
after a whole concurrent wave is invalidated by a shared infrastructure or
usage-limit failure.`;

function positiveInteger(value, label) {
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 1) throw new Error(`${label} must be a positive integer`);
	return number;
}

async function main() {
	const options = parseCli(
		process.argv.slice(2),
		new Set(['submissions', 'summary', 'checkpoint-id']),
		new Set(['help'])
	);
	if (options.help) {
		console.log(usage);
		return;
	}
	if (options._.length > 0) throw new Error(`Unexpected argument: ${options._[0]}`);

	const submissions = resolve(requireOption(options, 'submissions'));
	const summaryPath = resolve(requireOption(options, 'summary'));
	const checkpointId = positiveInteger(requireOption(options, 'checkpoint-id'), '--checkpoint-id');
	const summary = JSON.parse(await readFile(summaryPath, 'utf8'));
	if (summary?.schemaVersion !== 1 || !Array.isArray(summary.records)) {
		throw new Error('Summary must use the generation-summary schema version 1');
	}
	const before = summary.records.filter((record) => record.id <= checkpointId);
	if (before.length === 0 || before.some((record) => record.status !== 'accepted')) {
		throw new Error('Every record through --checkpoint-id must already be accepted');
	}
	const reset = summary.records.filter((record) => record.id > checkpointId);
	if (reset.length === 0) throw new Error('Checkpoint does not leave any records to reset');

	const removed = [];
	for (const record of reset) {
		const directory = join(submissions, record.artifactDirectory);
		await rm(directory, { recursive: true, force: true });
		if (record.status === 'accepted') removed.push(record.artifactDirectory);
		record.status = 'pending';
		record.attempts = 0;
		record.rejections = [];
		record.acceptedReview = null;
	}
	summary.updatedAt = new Date().toISOString();
	summary.completedAt = null;
	summary.counts = { accepted: before.length, pending: reset.length };
	await atomicWrite(summaryPath, `${JSON.stringify(summary, null, '\t')}\n`);
	console.log(JSON.stringify({ checkpointId, accepted: before.length, pending: reset.length, removed }, null, 2));
}

main().catch((error) => {
	console.error(`reset-batch-to-checkpoint: ${error.message}`);
	process.exitCode = 1;
});
