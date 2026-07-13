#!/usr/bin/env node

import { opendir } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import {
	atomicWrite,
	parseCli,
	requireOption,
	sha256File,
	validateSubmission
} from './lib/artifacts.mjs';

const usage = `Usage:
  node scripts/benchmark/audit-duplicates.mjs --submissions <directory> --output <report.json>

Validates every immediate child submission, computes canonical SHA-256 hashes of
source/ and dist/, hashes canonical audit captures, and writes a deterministic
pairwise exact-duplicate report. Gallery posters are reported but never used as
the site's visual-duplicate evidence.`;

function lexicalCompare(a, b) {
	return Buffer.from(a).compare(Buffer.from(b));
}

function duplicateGroups(records, hashKey) {
	const byHash = new Map();
	for (const record of records) {
		const hash = record[hashKey];
		const members = byHash.get(hash) ?? [];
		members.push(record.slug);
		byHash.set(hash, members);
	}
	return [...byHash.entries()]
		.filter(([, members]) => members.length > 1)
		.map(([hash, members]) => ({ hash, sites: members.sort(lexicalCompare) }))
		.sort((a, b) => lexicalCompare(a.hash, b.hash));
}

function visualDuplicateGroups(records) {
	const byPair = new Map();
	for (const record of records) {
		if (!record.desktopAuditHash || !record.mobileAuditHash) continue;
		const key = `${record.desktopAuditHash}:${record.mobileAuditHash}`;
		const group = byPair.get(key) ?? {
			desktopHash: record.desktopAuditHash,
			mobileHash: record.mobileAuditHash,
			sites: []
		};
		group.sites.push(record.slug);
		byPair.set(key, group);
	}
	return [...byPair.values()]
		.filter((group) => group.sites.length > 1)
		.map((group) => ({ ...group, sites: group.sites.sort(lexicalCompare) }))
		.sort(
			(a, b) =>
				lexicalCompare(a.desktopHash, b.desktopHash) || lexicalCompare(a.mobileHash, b.mobileHash)
		);
}

async function submissionDirectories(root) {
	const entries = [];
	const directory = await opendir(root);
	for await (const entry of directory) {
		if (entry.isDirectory()) entries.push(entry.name);
		else if (entry.isSymbolicLink()) {
			throw new Error(`Submission root contains a symbolic link: ${join(root, entry.name)}`);
		}
	}
	entries.sort(lexicalCompare);
	if (entries.length === 0) throw new Error(`No submissions found in ${root}`);
	return entries.map((name) => ({ name, path: join(root, name) }));
}

async function main() {
	const options = parseCli(
		process.argv.slice(2),
		new Set(['submissions', 'output']),
		new Set(['help'])
	);
	if (options.help) {
		console.log(usage);
		return;
	}
	if (options._.length > 0) throw new Error(`Unexpected argument: ${options._[0]}`);

	const root = resolve(requireOption(options, 'submissions'));
	const output = resolve(requireOption(options, 'output'));
	const directories = await submissionDirectories(root);
	const records = [];

	for (const directory of directories) {
		const validated = await validateSubmission(directory.path);
		const posterHash = validated.preview.poster
			? await sha256File(validated.previewPaths.poster)
			: null;
		const desktopAuditHash = validated.audit.desktop
			? await sha256File(validated.auditPaths.desktop)
			: null;
		const mobileAuditHash = validated.audit.mobile
			? await sha256File(validated.auditPaths.mobile)
			: null;
		records.push({
			id: validated.manifest.id,
			slug: validated.manifest.slug,
			directory: directory.name,
			sourceHash: validated.source.hash,
			distHash: validated.dist.hash,
			sourceFileCount: validated.source.fileCount,
			distFileCount: validated.dist.fileCount,
			sourceBytes: validated.source.totalBytes,
			distBytes: validated.dist.totalBytes,
			previewPresent: validated.preview,
			auditCapturesPresent: validated.audit,
			posterHash,
			desktopAuditHash,
			mobileAuditHash
		});
	}
	records.sort((a, b) => lexicalCompare(a.directory, b.directory));
	for (let index = 0; index < records.length; index += 1) {
		for (let previous = 0; previous < index; previous += 1) {
			if (records[previous].id === records[index].id) {
				throw new Error(`Duplicate site id ${records[index].id} in the submission collection`);
			}
			if (records[previous].slug === records[index].slug) {
				throw new Error(`Duplicate site slug ${records[index].slug} in the submission collection`);
			}
		}
	}

	const matches = [];
	let pairCountEvaluated = 0;
	for (let left = 0; left < records.length; left += 1) {
		for (let right = left + 1; right < records.length; right += 1) {
			pairCountEvaluated += 1;
			const sourceExact = records[left].sourceHash === records[right].sourceHash;
			const distExact = records[left].distHash === records[right].distHash;
			const visualExact = Boolean(
				records[left].desktopAuditHash &&
					records[left].mobileAuditHash &&
				records[right].desktopAuditHash &&
					records[right].mobileAuditHash &&
					records[left].desktopAuditHash === records[right].desktopAuditHash &&
					records[left].mobileAuditHash === records[right].mobileAuditHash
			);
			if (sourceExact || distExact || visualExact) {
				matches.push({
					a: records[left].slug,
					b: records[right].slug,
					sourceExact,
					distExact,
					visualExact
				});
			}
		}
	}

	const report = {
		schemaVersion: 1,
		hashAlgorithm: 'sha256/sitegeist-canonical-tree-v1',
		submissionCount: records.length,
		pairCountEvaluated,
		submissions: records,
		exactDuplicates: {
			matchCount: matches.length,
			matches,
			sourceGroups: duplicateGroups(records, 'sourceHash'),
			distGroups: duplicateGroups(records, 'distHash'),
			visualGroups: visualDuplicateGroups(records)
		}
	};

	await atomicWrite(output, `${JSON.stringify(report, null, '\t')}\n`);
	console.log(
		JSON.stringify(
			{
				output,
				submissionCount: records.length,
				pairCountEvaluated,
				exactDuplicateMatches: matches.length
			},
			null,
			2
		)
	);
}

main().catch((error) => {
	console.error(`audit-duplicates: ${error.message}`);
	process.exitCode = 1;
});
