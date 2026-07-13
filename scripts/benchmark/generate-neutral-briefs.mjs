#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import ts from 'typescript';
import { atomicWrite, parseCli, requireOption } from './lib/artifacts.mjs';

const usage = `Usage:
  node scripts/benchmark/generate-neutral-briefs.mjs --output <directory> [--replace]

Creates 100 identity-and-content-only briefs with ids 2-101. The historical
seed catalog is used only as neutral copy input; no visual instructions or
example-site material is included in any worker brief.`;

async function historicalSeeds() {
	const revisions = execFileSync('git', ['rev-list', 'HEAD', '--', 'src/lib/sites.ts'], { encoding: 'utf8' })
		.trim()
		.split('\n')
		.filter(Boolean);
	let source = '';
	let start = -1;
	for (const revision of revisions) {
		source = execFileSync('git', ['show', `${revision}:src/lib/sites.ts`], { encoding: 'utf8' });
		start = source.indexOf('const seeds: SiteSeed[] = ');
		if (start !== -1) break;
	}
	if (start === -1) throw new Error('Historical neutral seed catalog is unavailable');
	const literalStart = source.indexOf('[', start);
	const literalEnd = source.indexOf('\n];', literalStart);
	if (literalStart === -1 || literalEnd === -1) throw new Error('Could not parse historical seed catalog');
	const literal = source.slice(literalStart, literalEnd + 2);
	const compiled = ts.transpileModule(`const seeds = ${literal};\nexport default seeds;`, {
		compilerOptions: { module: ts.ModuleKind.ES2022, target: ts.ScriptTarget.ES2022 }
	}).outputText;
	const module = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);
	if (!Array.isArray(module.default) || module.default.length !== 100) {
		throw new Error('Historical seed catalog did not contain 100 entries');
	}
	return module.default;
}

function briefId(id, slug) {
	return createHash('sha256').update(`sitegeist-neutral-v1:${id}:${slug}`).digest('hex').slice(0, 16);
}

async function main() {
	const options = parseCli(process.argv.slice(2), new Set(['output']), new Set(['help', 'replace']));
	if (options.help) {
		console.log(usage);
		return;
	}
	if (options._.length > 0) throw new Error(`Unexpected argument: ${options._[0]}`);
	const output = resolve(requireOption(options, 'output'));
	if (options.replace) await rm(output, { recursive: true, force: true });

	const seeds = (await historicalSeeds()).slice(1);
	seeds.push([
		'clearwater-index',
		'Clearwater Index',
		'Water Infrastructure',
		'Know where every drop goes.',
		'A public information service explaining water supply, maintenance, quality, and long-term infrastructure planning.',
		'Water systems · Public data',
		'Explore the system',
		'Read the methodology'
	]);
	if (seeds.length !== 100) throw new Error(`Expected 100 non-Lumen briefs, received ${seeds.length}`);

	const slugs = new Set();
	for (let index = 0; index < seeds.length; index += 1) {
		const [slug, title, category, tagline, description, eyebrow, primaryAction, secondaryAction] = seeds[index];
		if (slugs.has(slug)) throw new Error(`Duplicate neutral brief slug: ${slug}`);
		slugs.add(slug);
		const id = index + 2;
		const artifactDirectory = `${String(id).padStart(3, '0')}-${slug}`;
		const brief = {
			schemaVersion: 1,
			briefId: briefId(id, slug),
			id,
			slug,
			artifactDirectory,
			title,
			category,
			tagline,
			description,
			content: { eyebrow, primaryAction, secondaryAction },
			requirements: {
				responsive: true,
				accessible: true,
				runtimeNetwork: false,
				standaloneStaticBuild: true
			}
		};
		await atomicWrite(join(output, `${artifactDirectory}.json`), `${JSON.stringify(brief, null, '\t')}\n`);
	}
	console.log(JSON.stringify({ output, briefCount: seeds.length, firstId: 2, lastId: 101 }, null, 2));
}

main().catch((error) => {
	console.error(`generate-neutral-briefs: ${error.message}`);
	process.exitCode = 1;
});
