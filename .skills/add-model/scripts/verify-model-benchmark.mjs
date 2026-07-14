#!/usr/bin/env node

import { lstat, readFile, readdir } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve } from 'node:path';

const START_MARKER = '/* SITEGEIST_REGISTRY_JSON_START */';
const END_MARKER = '/* SITEGEIST_REGISTRY_JSON_END */';
const usage = `Usage:
  node verify-model-benchmark.mjs \\
    --summary <generation-summary.json> --registry <registry.ts|json> \\
    --static-root <directory> --duplicate-reports <a.json,b.json> \\
    --volume-report <code-volume.json> [--runtime-report <runtime.json>] \\
    [--expected-count 100]`;

function parseCli(argv) {
	const options = {};
	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (argument === '--help') {
			options.help = true;
			continue;
		}
		if (!argument.startsWith('--')) throw new Error(`Unexpected argument: ${argument}`);
		const key = argument.slice(2);
		const value = argv[index + 1];
		if (!value || value.startsWith('--')) throw new Error(`Missing value for ${argument}`);
		if (key in options) throw new Error(`Duplicate option: ${argument}`);
		options[key] = value;
		index += 1;
	}
	return options;
}

function requireOption(options, key) {
	if (!options[key]) throw new Error(`Missing --${key}`);
	return options[key];
}

async function readJson(path) {
	return JSON.parse(await readFile(path, 'utf8'));
}

async function readRegistry(path) {
	const contents = await readFile(path, 'utf8');
	if (extname(path) === '.json') return JSON.parse(contents);
	if (extname(path) !== '.ts') throw new Error('Registry must end in .ts or .json');
	const start = contents.indexOf(START_MARKER);
	const end = contents.indexOf(END_MARKER);
	if (start === -1 || end <= start) throw new Error('Registry JSON markers are missing');
	return JSON.parse(contents.slice(start + START_MARKER.length, end).trim());
}

async function auditTree(root) {
	const totals = { files: 0, bytes: 0 };
	async function visit(directory) {
		const entries = await readdir(directory, { withFileTypes: true });
		for (const entry of entries) {
			const path = join(directory, entry.name);
			const stats = await lstat(path);
			if (stats.isSymbolicLink()) throw new Error(`Static tree contains a symbolic link: ${path}`);
			if (stats.isDirectory()) await visit(path);
			else if (stats.isFile()) {
				totals.files += 1;
				totals.bytes += stats.size;
			} else throw new Error(`Static tree contains a special file: ${path}`);
		}
	}
	await visit(root);
	return totals;
}

function duplicateFailures(report) {
	if (report.exactDuplicates) return Number(report.exactDuplicates.matchCount ?? 0);
	return Number(report.sourceMatchCount ?? 0) + Number(report.distMatchCount ?? 0);
}

function runtimeFailures(report) {
	const finalAudit = report.finalAudit ?? report.replacementAudit ?? report.audit ?? report.initialAudit;
	if (!finalAudit || typeof finalAudit !== 'object') return ['Runtime report has no final audit'];
	const failures = [];
	if (Number(finalAudit.consoleErrorCount ?? 0) !== 0) failures.push('runtime console errors remain');
	if (Number(finalAudit.horizontalOverflowCount ?? 0) !== 0) failures.push('mobile overflow remains');
	if ('failedCount' in finalAudit && Number(finalAudit.failedCount) !== 0) failures.push('runtime failures remain');
	if (
		'testedCount' in finalAudit &&
		'passedCount' in finalAudit &&
		Number(finalAudit.testedCount) !== Number(finalAudit.passedCount)
	) failures.push('not every replacement passed runtime audit');
	return failures;
}

async function main() {
	const options = parseCli(process.argv.slice(2));
	if (options.help) {
		console.log(usage);
		return;
	}
	const expectedCount = Number(options['expected-count'] ?? 100);
	if (!Number.isSafeInteger(expectedCount) || expectedCount < 1) {
		throw new Error('--expected-count must be a positive integer');
	}

	const summaryPath = resolve(requireOption(options, 'summary'));
	const registryPath = resolve(requireOption(options, 'registry'));
	const staticRoot = resolve(requireOption(options, 'static-root'));
	const duplicatePaths = requireOption(options, 'duplicate-reports')
		.split(',')
		.map((path) => resolve(path.trim()))
		.filter(Boolean);
	const volumePath = resolve(requireOption(options, 'volume-report'));
	const runtimePath = options['runtime-report'] ? resolve(options['runtime-report']) : null;
	const errors = [];

	const [summary, registry, volume, duplicateReports, runtime] = await Promise.all([
		readJson(summaryPath),
		readRegistry(registryPath),
		readJson(volumePath),
		Promise.all(duplicatePaths.map(readJson)),
		runtimePath ? readJson(runtimePath) : null
	]);
	if (!Array.isArray(summary.records) || summary.records.length !== expectedCount) {
		errors.push(`summary record count is not ${expectedCount}`);
	}
	const accepted = Array.isArray(summary.records)
		? summary.records.filter((record) => record.status === 'accepted').length
		: 0;
	if (accepted !== expectedCount) errors.push(`accepted summary count is ${accepted}, expected ${expectedCount}`);
	if (!summary.completedAt) errors.push('summary is not marked complete');
	if (!Array.isArray(registry) || registry.length !== expectedCount) {
		errors.push(`registry count is ${Array.isArray(registry) ? registry.length : 0}, expected ${expectedCount}`);
	}

	const ids = new Set();
	const slugs = new Set();
	const directories = new Set();
	for (const record of Array.isArray(registry) ? registry : []) {
		if (ids.has(record.id)) errors.push(`duplicate registry id: ${record.id}`);
		if (slugs.has(record.slug)) errors.push(`duplicate registry slug: ${record.slug}`);
		ids.add(record.id);
		slugs.add(record.slug);
		const directory = basename(dirname(record.artifactUrl ?? ''));
		if (!directory || directory === '.' || directory === '/') {
			errors.push(`invalid artifact URL for ${record.slug}`);
			continue;
		}
		directories.add(directory);
		for (const relative of ['index.html', join('_preview', 'poster.svg')]) {
			try {
				const stats = await lstat(join(staticRoot, directory, relative));
				if (!stats.isFile()) errors.push(`${directory}/${relative} is not a file`);
			} catch {
				errors.push(`${directory}/${relative} is missing`);
			}
		}
	}
	if (directories.size !== expectedCount) {
		errors.push(`unique static directory count is ${directories.size}, expected ${expectedCount}`);
	}
	if (volume.accepted !== true || Number(volume.submissionCount) !== expectedCount) {
		errors.push('code-volume report is missing, rejected, or has the wrong count');
	}
	for (const [index, report] of duplicateReports.entries()) {
		const matches = duplicateFailures(report);
		if (matches !== 0) errors.push(`duplicate report ${index + 1} contains ${matches} exact matches`);
	}
	if (runtime) errors.push(...runtimeFailures(runtime));

	const staticTotals = await auditTree(staticRoot);
	const result = {
		accepted: errors.length === 0,
		expectedCount,
		summaryAccepted: accepted,
		registryCount: Array.isArray(registry) ? registry.length : 0,
		staticDirectories: directories.size,
		staticFiles: staticTotals.files,
		staticBytes: staticTotals.bytes,
		duplicateReports: duplicateReports.length,
		runtimeReport: Boolean(runtime),
		errors
	};
	console.log(JSON.stringify(result, null, 2));
	if (errors.length > 0) process.exitCode = 1;
}

main().catch((error) => {
	console.error(`verify-model-benchmark: ${error.message}`);
	process.exitCode = 1;
});
