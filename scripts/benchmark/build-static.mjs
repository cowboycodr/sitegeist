#!/usr/bin/env node

import { join, resolve } from 'node:path';
import {
	assertStaticEntry,
	atomicCopyDirectory,
	listTreeFiles,
	parseCli,
	requireOption
} from './lib/artifacts.mjs';

const usage = `Usage:
  node scripts/benchmark/build-static.mjs --submission <directory> [--replace]

For dependency-free submissions, validates source/ and copies it byte-for-byte
to dist/. This helper never installs packages or executes submitted code.`;

async function main() {
	const options = parseCli(
		process.argv.slice(2),
		new Set(['submission']),
		new Set(['help', 'replace'])
	);
	if (options.help) {
		console.log(usage);
		return;
	}
	if (options._.length > 0) throw new Error(`Unexpected argument: ${options._[0]}`);

	const submissionDirectory = resolve(requireOption(options, 'submission'));
	const sourceDirectory = join(submissionDirectory, 'source');
	const distDirectory = join(submissionDirectory, 'dist');
	const source = await listTreeFiles(sourceDirectory);
	if (source.files.length === 0) throw new Error('source/ must contain at least one file');
	await assertStaticEntry(sourceDirectory);
	await atomicCopyDirectory(sourceDirectory, distDirectory, Boolean(options.replace));
	console.log(
		JSON.stringify(
			{
				submission: submissionDirectory,
				copiedFiles: source.files.length,
				copiedBytes: source.totalBytes,
				dist: distDirectory
			},
			null,
			2
		)
	);
}

main().catch((error) => {
	console.error(`build-static: ${error.message}`);
	process.exitCode = 1;
});
