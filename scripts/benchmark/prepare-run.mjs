#!/usr/bin/env node

import { cp, lstat, mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { parseCli, requireOption } from './lib/artifacts.mjs';

const usage = `Usage:
  node scripts/benchmark/prepare-run.mjs --brief <brief.md> [--temp-parent <directory>] [--prefix <name>] [--json]

Creates a new mode-0700 temporary worker containing exactly the design-neutral
starter and one copied brief. Prints the worker path to stdout.`;

async function main() {
	const options = parseCli(
		process.argv.slice(2),
		new Set(['brief', 'temp-parent', 'prefix']),
		new Set(['help', 'json'])
	);
	if (options.help) {
		console.log(usage);
		return;
	}
	if (options._.length > 0) throw new Error(`Unexpected argument: ${options._[0]}`);

	const briefPath = resolve(requireOption(options, 'brief'));
	const briefStatus = await lstat(briefPath);
	if (!briefStatus.isFile() || briefStatus.isSymbolicLink()) {
		throw new Error(`Brief must be a regular, non-symlinked file: ${briefPath}`);
	}
	if (briefStatus.size > 1024 * 1024) throw new Error('Brief exceeds the 1 MiB limit');
	const brief = await readFile(briefPath);
	if (brief.includes(0)) throw new Error('Brief must be a text file without NUL bytes');

	const scriptDirectory = dirname(fileURLToPath(import.meta.url));
	const starterDirectory = resolve(scriptDirectory, '../../benchmark/starter');
	const parent = resolve(options['temp-parent'] ?? tmpdir());
	await mkdir(parent, { recursive: true, mode: 0o700 });
	const rawPrefix = options.prefix ?? 'sitegeist-worker-';
	const prefix = basename(rawPrefix).replace(/[^a-zA-Z0-9._-]/g, '-');
	if (!prefix) throw new Error('--prefix must contain at least one safe filename character');

	const workerDirectory = await mkdtemp(join(parent, prefix), { encoding: 'utf8' });
	await cp(starterDirectory, workerDirectory, {
		recursive: true,
		errorOnExist: false,
		force: true
	});
	await writeFile(join(workerDirectory, 'brief.md'), brief, { flag: 'wx', mode: 0o600 });

	if (options.json) {
		console.log(JSON.stringify({ workerDirectory, brief: basename(briefPath) }, null, 2));
	} else {
		console.log(workerDirectory);
	}
}

main().catch((error) => {
	console.error(`prepare-run: ${error.message}`);
	process.exitCode = 1;
});
