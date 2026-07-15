#!/usr/bin/env node

import { readFile, rm } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { atomicWrite, parseCli, requireOption } from './lib/artifacts.mjs';

const usage = `Usage:
  node scripts/benchmark/requeue-batch-records.mjs \\
    --submissions <directory> --summary <report.json> --ids <id,id,...> \\
    [--reason <audit rejection reason>]

Deletes selected accepted artifacts and returns their summary records to the
pending queue without erasing attempt or rejection history. Use this when a
post-generation evaluator rejects individual sites rather than a whole wave.`;

function parseIds(value) {
	const ids = String(value)
		.split(',')
		.map((part) => Number(part.trim()));
	if (
		ids.length === 0 ||
		ids.some((id) => !Number.isSafeInteger(id) || id < 1) ||
		new Set(ids).size !== ids.length
	) {
		throw new Error('--ids must be a comma-separated list of unique positive integers');
	}
	return ids;
}

async function main() {
	const options = parseCli(
		process.argv.slice(2),
		new Set(['submissions', 'summary', 'ids', 'reason']),
		new Set(['help'])
	);
	if (options.help) {
		console.log(usage);
		return;
	}
	if (options._.length > 0) throw new Error(`Unexpected argument: ${options._[0]}`);

	const submissions = resolve(requireOption(options, 'submissions'));
	const summaryPath = resolve(requireOption(options, 'summary'));
	const ids = parseIds(requireOption(options, 'ids'));
	const reason = options.reason ?? 'Rejected by post-generation artifact audit';
	const summary = JSON.parse(await readFile(summaryPath, 'utf8'));
	if (summary?.schemaVersion !== 1 || !Array.isArray(summary.records)) {
		throw new Error('Summary must use the generation-summary schema version 1');
	}

	const byId = new Map(summary.records.map((record) => [record.id, record]));
	const selected = ids.map((id) => {
		const record = byId.get(id);
		if (!record) throw new Error(`Summary does not contain record ${id}`);
		if (record.status !== 'accepted') throw new Error(`Record ${id} is not accepted`);
		if (
			typeof record.artifactDirectory !== 'string' ||
			basename(record.artifactDirectory) !== record.artifactDirectory
		) {
			throw new Error(`Record ${id} has an unsafe artifact directory`);
		}
		return record;
	});

	for (const record of selected) {
		await rm(join(submissions, record.artifactDirectory), { recursive: true, force: true });
		record.status = 'pending';
		record.rejections = Array.isArray(record.rejections) ? record.rejections : [];
		record.rejections.push({
			attempt: record.attempts,
			kind: 'artifact-audit',
			errors: [reason]
		});
		record.acceptedReview = null;
	}

	const counts = {};
	for (const record of summary.records) counts[record.status] = (counts[record.status] ?? 0) + 1;
	summary.updatedAt = new Date().toISOString();
	summary.completedAt = null;
	summary.counts = counts;
	await atomicWrite(summaryPath, `${JSON.stringify(summary, null, '\t')}\n`);
	console.log(JSON.stringify({ requeued: ids, reason, counts }, null, 2));
}

main().catch((error) => {
	console.error(`requeue-batch-records: ${error.message}`);
	process.exitCode = 1;
});
