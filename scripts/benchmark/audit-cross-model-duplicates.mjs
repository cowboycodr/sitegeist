#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';
import { atomicWrite, parseCli, requireOption } from './lib/artifacts.mjs';

const START_MARKER = '/* SITEGEIST_REGISTRY_JSON_START */';
const END_MARKER = '/* SITEGEIST_REGISTRY_JSON_END */';
const usage = `Usage:
  node scripts/benchmark/audit-cross-model-duplicates.mjs \\
    --left-registry <registry.ts|json> --left-model <name> \\
    --right-registry <registry.ts|json> --right-model <name> \\
    --output <report.json>

Compares canonical source and distribution hashes across two generated model
registries. Every left/right pair is evaluated exactly once.`;

async function readRegistry(path) {
	const contents = await readFile(path, 'utf8');
	let records;
	if (extname(path) === '.json') {
		records = JSON.parse(contents);
	} else if (extname(path) === '.ts') {
		const start = contents.indexOf(START_MARKER);
		const end = contents.indexOf(END_MARKER);
		if (start === -1 || end <= start) throw new Error(`${path} is not a generated Sitegeist registry`);
		records = JSON.parse(contents.slice(start + START_MARKER.length, end).trim());
	} else {
		throw new Error('Registry paths must end in .ts or .json');
	}
	if (!Array.isArray(records)) throw new Error(`${path} does not contain a registry array`);
	for (const record of records) {
		if (
			!Number.isSafeInteger(record?.id) ||
			typeof record.slug !== 'string' ||
			typeof record.sourceHash !== 'string' ||
			typeof record.distHash !== 'string'
		) {
			throw new Error(`${path} contains an invalid registry record`);
		}
	}
	return records;
}

function identity(record) {
	return { id: record.id, slug: record.slug };
}

async function main() {
	const options = parseCli(
		process.argv.slice(2),
		new Set(['left-registry', 'left-model', 'right-registry', 'right-model', 'output']),
		new Set(['help'])
	);
	if (options.help) {
		console.log(usage);
		return;
	}
	if (options._.length > 0) throw new Error(`Unexpected argument: ${options._[0]}`);

	const leftRegistry = resolve(requireOption(options, 'left-registry'));
	const rightRegistry = resolve(requireOption(options, 'right-registry'));
	const output = resolve(requireOption(options, 'output'));
	const leftModel = requireOption(options, 'left-model');
	const rightModel = requireOption(options, 'right-model');
	if (leftModel === rightModel) throw new Error('Model names must be distinct');

	const [left, right] = await Promise.all([readRegistry(leftRegistry), readRegistry(rightRegistry)]);
	const sourceMatches = [];
	const distMatches = [];
	for (const leftRecord of left) {
		for (const rightRecord of right) {
			if (leftRecord.sourceHash === rightRecord.sourceHash) {
				sourceMatches.push({ left: identity(leftRecord), right: identity(rightRecord) });
			}
			if (leftRecord.distHash === rightRecord.distHash) {
				distMatches.push({ left: identity(leftRecord), right: identity(rightRecord) });
			}
		}
	}

	const report = {
		schemaVersion: 1,
		hashAlgorithm: 'sha256/sitegeist-canonical-tree-v1',
		leftModel,
		rightModel,
		leftSubmissionCount: left.length,
		rightSubmissionCount: right.length,
		pairCountEvaluated: left.length * right.length,
		sourceMatchCount: sourceMatches.length,
		sourceMatches,
		distMatchCount: distMatches.length,
		distMatches
	};
	await atomicWrite(output, `${JSON.stringify(report, null, '\t')}\n`);
	console.log(JSON.stringify(report, null, 2));
}

main().catch((error) => {
	console.error(`audit-cross-model-duplicates: ${error.message}`);
	process.exitCode = 1;
});
