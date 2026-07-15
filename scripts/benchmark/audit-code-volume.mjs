#!/usr/bin/env node

import { opendir, readFile } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import {
	atomicWrite,
	listTreeFiles,
	parseCli,
	requireOption,
	validateSubmission
} from './lib/artifacts.mjs';

const DEFAULT_MAX_CANONICAL_FILES = 2_000;
const DEFAULT_MAX_CANONICAL_BYTES = 25 * 1024 * 1024;
const DEFAULT_MAX_CANONICAL_TEXT_LINES = 250_000;
const TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.md', '.svg', '.txt', '.xml']);
const usage = `Usage:
  node scripts/benchmark/audit-code-volume.mjs \\
    --submissions <directory> --output <report.json> \\
    [--expected-count 100] [--max-canonical-files 2000] \\
    [--max-canonical-bytes 26214400] [--max-canonical-text-lines 250000]

Measures the source trees and the canonical deployable payload (dist plus
preview) for every accepted submission. Exits nonzero before import when the
collection exceeds a configured limit.`;

function lexicalCompare(a, b) {
	return Buffer.from(a).compare(Buffer.from(b));
}

function positiveInteger(value, label, fallback) {
	if (value === undefined) return fallback;
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 1) throw new Error(`${label} must be a positive integer`);
	return number;
}

async function immediateDirectories(root) {
	const names = [];
	const directory = await opendir(root);
	for await (const entry of directory) {
		if (entry.isDirectory()) names.push(entry.name);
		else if (entry.isSymbolicLink()) throw new Error(`Submission root contains a symbolic link: ${entry.name}`);
		else throw new Error(`Submission root contains an unsupported entry: ${entry.name}`);
	}
	names.sort(lexicalCompare);
	return names;
}

async function textLineCount(files) {
	let lines = 0;
	for (const file of files) {
		if (!TEXT_EXTENSIONS.has(extname(file.relativePath).toLowerCase())) continue;
		const contents = await readFile(file.absolutePath);
		if (contents.includes(0)) continue;
		const text = contents.toString('utf8');
		lines += text.length === 0 ? 0 : text.split('\n').length;
	}
	return lines;
}

async function main() {
	const options = parseCli(
		process.argv.slice(2),
		new Set([
			'submissions', 'output', 'expected-count', 'max-canonical-files',
			'max-canonical-bytes', 'max-canonical-text-lines'
		]),
		new Set(['help'])
	);
	if (options.help) {
		console.log(usage);
		return;
	}
	if (options._.length > 0) throw new Error(`Unexpected argument: ${options._[0]}`);

	const submissions = resolve(requireOption(options, 'submissions'));
	const output = resolve(requireOption(options, 'output'));
	const limits = {
		canonicalFiles: positiveInteger(options['max-canonical-files'], '--max-canonical-files', DEFAULT_MAX_CANONICAL_FILES),
		canonicalBytes: positiveInteger(options['max-canonical-bytes'], '--max-canonical-bytes', DEFAULT_MAX_CANONICAL_BYTES),
		canonicalTextLines: positiveInteger(
			options['max-canonical-text-lines'],
			'--max-canonical-text-lines',
			DEFAULT_MAX_CANONICAL_TEXT_LINES
		)
	};
	const expectedCount = positiveInteger(options['expected-count'], '--expected-count', 100);
	const directories = await immediateDirectories(submissions);
	if (directories.length !== expectedCount) {
		throw new Error(`Expected ${expectedCount} accepted submissions, received ${directories.length}`);
	}

	const records = [];
	const totals = {
		sourceFiles: 0,
		sourceBytes: 0,
		canonicalFiles: 0,
		canonicalBytes: 0,
		canonicalTextLines: 0
	};
	for (const directory of directories) {
		const root = join(submissions, directory);
		const validated = await validateSubmission(root);
		const preview = await listTreeFiles(join(root, 'preview'));
		const dist = await listTreeFiles(join(root, 'dist'));
		const canonicalFiles = [...dist.files, ...preview.files];
		const record = {
			id: validated.manifest.id,
			slug: validated.manifest.slug,
			directory,
			sourceFiles: validated.source.fileCount,
			sourceBytes: validated.source.totalBytes,
			canonicalFiles: canonicalFiles.length,
			canonicalBytes: dist.totalBytes + preview.totalBytes,
			canonicalTextLines: await textLineCount(canonicalFiles)
		};
		records.push(record);
		for (const key of Object.keys(totals)) totals[key] += record[key];
	}

	const violations = [];
	for (const [metric, maximum] of Object.entries(limits)) {
		if (totals[metric] > maximum) {
			violations.push(`${metric} is ${totals[metric]}, above the limit of ${maximum}`);
		}
	}
	const largest = [...records]
		.sort((a, b) => b.canonicalBytes - a.canonicalBytes || lexicalCompare(a.directory, b.directory))
		.slice(0, 10);
	const report = {
		schemaVersion: 1,
		submissionCount: records.length,
		canonicalPayload: 'dist plus preview; source is measured but not imported',
		limits,
		totals,
		accepted: violations.length === 0,
		violations,
		largestCanonicalPayloads: largest,
		records
	};
	await atomicWrite(output, `${JSON.stringify(report, null, '\t')}\n`);
	console.log(JSON.stringify({ output, accepted: report.accepted, totals, violations }, null, 2));
	if (violations.length > 0) process.exitCode = 1;
}

main().catch((error) => {
	console.error(`audit-code-volume: ${error.message}`);
	process.exitCode = 1;
});
