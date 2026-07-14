#!/usr/bin/env node

import { spawn } from 'node:child_process';
import {
	mkdir,
	open,
	opendir,
	readFile,
	rm
} from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	atomicCopyDirectory,
	atomicWrite,
	parseCli,
	pathExists,
	requireOption
} from './lib/artifacts.mjs';
import { reviewSubmission } from './review-submission.mjs';

const DEFAULT_CONCURRENCY = 10;
const DEFAULT_MAX_ATTEMPTS = 8;
const WORKER_TIMEOUT_MS = 25 * 60 * 1000;
const usage = `Usage:
  node scripts/benchmark/run-neutral-batch.mjs \\
    --briefs benchmark/briefs/generated \\
		--submissions .benchmark-work/gpt-5.6-sol \\
		--registry src/lib/generated/site-artifacts.ts \\
		[--static-root static/sites/gpt-5.6-sol] \\
		[--public-base /sites/gpt-5.6-sol] \\
    [--runner scripts/benchmark/run-isolated-worker.sh] \\
    [--model gpt-5.6-sol] [--harness codex] \\
    [--concurrency 10] [--max-attempts 8] \\
    [--summary benchmark/reports/generation-summary.json] \\
    [--duplicate-output benchmark/reports/exact-duplicates.json]

Runs design-isolated model workers in fixed-size waves. Every worker is reviewed
in quarantine. Rejected workers are deleted and regenerated from a fresh
workspace; accepted submissions are promoted into the requested working
directory, audited, and imported once into the canonical static collection.
The submissions directory is resumable evaluator state and should not be committed.`;

const activeChildren = new Set();
let stopping = false;

function lexicalCompare(a, b) {
	return Buffer.from(a).compare(Buffer.from(b));
}

function positiveInteger(value, label, fallback) {
	if (value === undefined) return fallback;
	const number = Number(value);
	if (!Number.isSafeInteger(number) || number < 1) throw new Error(`${label} must be a positive integer`);
	return number;
}

function logProgress(message, fields = {}) {
	console.log(JSON.stringify({ at: new Date().toISOString(), message, ...fields }));
}

function cleanDiagnostic(value) {
	return value
		.replaceAll(/\x1b\[[0-9;]*m/g, '')
		.replaceAll(/[\u0000-\u001f\u007f]+/g, ' ')
		.replaceAll(/\s+/g, ' ')
		.trim()
		.slice(-700);
}

async function lastDiagnostic(path) {
	try {
		return cleanDiagnostic(await readFile(path, 'utf8')) || 'no diagnostic output';
	} catch {
		return 'diagnostic output unavailable';
	}
}

function terminateChildren() {
	stopping = true;
	for (const child of activeChildren) child.kill('SIGTERM');
}

for (const signal of ['SIGINT', 'SIGTERM']) {
	process.once(signal, () => {
		terminateChildren();
		setTimeout(() => {
			for (const child of activeChildren) child.kill('SIGKILL');
		}, 5_000).unref();
	});
}

async function spawnToFiles(command, args, { cwd, stdoutPath, stderrPath, timeout = WORKER_TIMEOUT_MS }) {
	const stdout = await open(stdoutPath, 'wx', 0o600);
	const stderr = await open(stderrPath, 'wx', 0o600);
	const startedAt = Date.now();
	try {
		return await new Promise((resolvePromise, rejectPromise) => {
			const child = spawn(command, args, {
				cwd,
				stdio: ['ignore', stdout.fd, stderr.fd],
				env: process.env
			});
			activeChildren.add(child);
			let timedOut = false;
			const timer = setTimeout(() => {
				timedOut = true;
				child.kill('SIGTERM');
				setTimeout(() => child.kill('SIGKILL'), 5_000).unref();
			}, timeout);
			child.once('error', (error) => {
				clearTimeout(timer);
				activeChildren.delete(child);
				rejectPromise(error);
			});
			child.once('exit', (code, signal) => {
				clearTimeout(timer);
				activeChildren.delete(child);
				resolvePromise({
					code: code ?? 1,
					signal,
					timedOut,
					elapsedMs: Date.now() - startedAt
				});
			});
		});
	} finally {
		await Promise.allSettled([stdout.close(), stderr.close()]);
	}
}

async function spawnCaptured(command, args, { cwd, timeout = 5 * 60 * 1000 } = {}) {
	const startedAt = Date.now();
	return new Promise((resolvePromise, rejectPromise) => {
		const child = spawn(command, args, {
			cwd,
			stdio: ['ignore', 'pipe', 'pipe'],
			env: process.env
		});
		activeChildren.add(child);
		let stdout = '';
		let stderr = '';
		const limit = 2 * 1024 * 1024;
		child.stdout.on('data', (chunk) => {
			stdout = `${stdout}${chunk}`.slice(-limit);
		});
		child.stderr.on('data', (chunk) => {
			stderr = `${stderr}${chunk}`.slice(-limit);
		});
		const timer = setTimeout(() => {
			child.kill('SIGTERM');
			setTimeout(() => child.kill('SIGKILL'), 5_000).unref();
		}, timeout);
		child.once('error', (error) => {
			clearTimeout(timer);
			activeChildren.delete(child);
			rejectPromise(error);
		});
		child.once('exit', (code, signal) => {
			clearTimeout(timer);
			activeChildren.delete(child);
			const result = { code: code ?? 1, signal, stdout, stderr, elapsedMs: Date.now() - startedAt };
			if (result.code === 0) resolvePromise(result);
			else rejectPromise(new Error(`${basename(command)} exited ${result.code}: ${cleanDiagnostic(stderr)}`));
		});
	});
}

async function readBriefs(directory) {
	const entries = [];
	const handle = await opendir(directory);
	for await (const entry of handle) {
		if (entry.isFile() && entry.name.endsWith('.json')) entries.push(entry.name);
		else throw new Error(`Brief directory contains an unsupported entry: ${entry.name}`);
	}
	entries.sort(lexicalCompare);
	if (entries.length !== 100) throw new Error(`Expected exactly 100 neutral briefs, received ${entries.length}`);

	const briefs = [];
	for (const name of entries) {
		const path = join(directory, name);
		const value = JSON.parse(await readFile(path, 'utf8'));
		briefs.push({ path, ...value });
	}
	const ids = new Set(briefs.map((brief) => brief.id));
	const slugs = new Set(briefs.map((brief) => brief.slug));
	if (ids.size !== 100 || slugs.size !== 100) throw new Error('Neutral briefs must have unique ids and slugs');
	for (let id = 2; id <= 101; id += 1) {
		if (!ids.has(id)) throw new Error(`Neutral brief id ${id} is missing`);
	}
	return briefs.sort((a, b) => a.id - b.id);
}

function freshRecord(brief, previous = null) {
	return {
		id: brief.id,
		slug: brief.slug,
		title: brief.title,
		artifactDirectory: brief.artifactDirectory,
		status: 'pending',
		attempts: Number.isSafeInteger(previous?.attempts) ? previous.attempts : 0,
		rejections: Array.isArray(previous?.rejections) ? previous.rejections : [],
		acceptedReview: previous?.acceptedReview ?? null
	};
}

async function writeSummary(path, records, startedAt, configuration, complete = false) {
	const counts = records.reduce(
		(result, record) => ({ ...result, [record.status]: (result[record.status] ?? 0) + 1 }),
		{}
	);
	await atomicWrite(path, `${JSON.stringify({
		schemaVersion: 1,
		startedAt,
		updatedAt: new Date().toISOString(),
		completedAt: complete ? new Date().toISOString() : null,
		model: configuration.model,
		harness: configuration.harness,
		modelReasoningEffort: 'medium',
		approvalPolicy: configuration.approvalPolicy,
		approvalsReviewer: configuration.approvalsReviewer,
		automaticArtifactReview: true,
		webSearch: 'disabled',
		workerConcurrency: configuration.concurrency,
		counts,
		records
	}, null, '\t')}\n`);
}

async function runAttempt({ brief, attempt, repoRoot, tempRoot, runner }) {
	const prefix = `${brief.artifactDirectory}-attempt-${attempt}-`;
	const prepared = await spawnCaptured(
		process.execPath,
		[
			join(repoRoot, 'scripts/benchmark/prepare-run.mjs'),
			'--brief', brief.path,
			'--temp-parent', tempRoot,
			'--prefix', prefix
		],
		{ cwd: repoRoot }
	);
	const worker = resolve(prepared.stdout.trim());
	if (dirname(worker) !== tempRoot || !basename(worker).startsWith(prefix)) {
		throw new Error('prepare-run returned an unexpected worker path');
	}
	const stdoutPath = join(tempRoot, `.${basename(worker)}.jsonl`);
	const stderrPath = join(tempRoot, `.${basename(worker)}.stderr`);
	try {
		const execution = await spawnToFiles(
			runner,
			[worker],
			{ cwd: repoRoot, stdoutPath, stderrPath }
		);
		if (execution.code !== 0) {
			return {
				accepted: false,
				kind: execution.timedOut ? 'timeout' : 'runner',
				errors: [execution.timedOut ? 'worker exceeded the 25-minute limit' : await lastDiagnostic(stderrPath)],
				warnings: [],
				evidence: null,
				elapsedMs: execution.elapsedMs
			};
		}
		const report = await reviewSubmission({
			submission: join(worker, 'submission'),
			brief: brief.path,
			workerLog: stdoutPath
		});
		if (!report.accepted) {
			return { ...report, kind: 'review', elapsedMs: execution.elapsedMs };
		}
		return {
			...report,
			kind: 'accepted',
			elapsedMs: execution.elapsedMs,
			submissionPath: join(worker, 'submission')
		};
	} finally {
		await Promise.allSettled([
			rm(stdoutPath, { force: true }),
			rm(stderrPath, { force: true })
		]);
		// The accepted submission is copied by the caller before this method's
		// worker is removed. Rejected workers never leave quarantine.
	}
}

async function main() {
	const options = parseCli(
		process.argv.slice(2),
		new Set([
			'briefs', 'submissions', 'registry', 'static-root', 'public-base', 'runner', 'model', 'harness',
			'approval-policy', 'approvals-reviewer', 'concurrency', 'max-attempts',
			'summary', 'duplicate-output'
		]),
		new Set(['help'])
	);
	if (options.help) {
		console.log(usage);
		return;
	}
	if (options._.length > 0) throw new Error(`Unexpected argument: ${options._[0]}`);

	const scriptDirectory = dirname(fileURLToPath(import.meta.url));
	const repoRoot = resolve(scriptDirectory, '../..');
	const briefsDirectory = resolve(requireOption(options, 'briefs'));
	const submissionsDirectory = resolve(requireOption(options, 'submissions'));
	const registry = resolve(requireOption(options, 'registry'));
	const staticRoot = options['static-root'] ? resolve(options['static-root']) : null;
	const publicBase = options['public-base'] ?? null;
	const runner = resolve(options.runner ?? join(repoRoot, 'scripts/benchmark/run-isolated-worker.sh'));
	const summary = resolve(options.summary ?? join(repoRoot, 'benchmark/reports/generation-summary.json'));
	const duplicateOutput = resolve(options['duplicate-output'] ?? join(repoRoot, 'benchmark/reports/exact-duplicates.json'));
	const concurrency = positiveInteger(options.concurrency, '--concurrency', DEFAULT_CONCURRENCY);
	const maxAttempts = positiveInteger(options['max-attempts'], '--max-attempts', DEFAULT_MAX_ATTEMPTS);
	const configuration = {
		model: options.model ?? process.env.CODEX_MODEL ?? 'gpt-5.6-sol',
		harness: options.harness ?? 'codex',
		approvalPolicy: options['approval-policy'] ?? 'on-request',
		approvalsReviewer: options['approvals-reviewer'] ?? 'auto_review',
		concurrency
	};
	if (concurrency !== DEFAULT_CONCURRENCY) {
		throw new Error(`This benchmark is fixed at ${DEFAULT_CONCURRENCY} simultaneous workers for comparability`);
	}
	let startedAt = new Date().toISOString();
	const tempRoot = resolve('/tmp/sitegeist-neutral-workers');
	await mkdir(tempRoot, { recursive: true, mode: 0o700 });
	await mkdir(submissionsDirectory, { recursive: true });

	const briefs = await readBriefs(briefsDirectory);
	let previousSummary = null;
	if (await pathExists(summary)) {
		try {
			previousSummary = JSON.parse(await readFile(summary, 'utf8'));
			if (previousSummary?.schemaVersion !== 1 || !Array.isArray(previousSummary.records)) {
				throw new Error('unsupported summary format');
			}
			if (typeof previousSummary.startedAt === 'string') startedAt = previousSummary.startedAt;
		} catch (error) {
			throw new Error(`Cannot resume from ${summary}: ${error.message}`);
		}
	}
	const previousById = new Map(
		(previousSummary?.records ?? []).map((record) => [record.id, record])
	);
	const records = briefs.map((brief) => freshRecord(brief, previousById.get(brief.id)));
	const byId = new Map(records.map((record) => [record.id, record]));
	const pending = [];

	for (const brief of briefs) {
		const record = byId.get(brief.id);
		const destination = join(submissionsDirectory, brief.artifactDirectory);
		if (await pathExists(destination)) {
			const review = await reviewSubmission({ submission: destination, brief: brief.path });
			if (review.accepted) {
				record.status = 'accepted';
				record.acceptedReview = record.acceptedReview
					? { ...record.acceptedReview, resumed: true }
					: { ...review, resumed: true };
				continue;
			}
			await rm(destination, { recursive: true, force: true });
			record.rejections.push({ attempt: 0, kind: 'resume-review', errors: review.errors });
		}
		pending.push(brief);
	}

	await writeSummary(summary, records, startedAt, configuration);
	logProgress('batch-started', {
		model: configuration.model,
		harness: configuration.harness,
		accepted: records.filter((record) => record.status === 'accepted').length,
		pending: pending.length
	});
	let wave = 0;
	while (pending.length > 0) {
		if (stopping) throw new Error('Batch interrupted');
		wave += 1;
		const jobs = pending.splice(0, concurrency);
		for (const brief of jobs) {
			const record = byId.get(brief.id);
			record.status = 'running';
			record.attempts += 1;
		}
		logProgress('wave-started', { wave, size: jobs.length, ids: jobs.map((brief) => brief.id) });
		const results = await Promise.all(jobs.map(async (brief) => {
			const record = byId.get(brief.id);
			let result;
			try {
				result = await runAttempt({ brief, attempt: record.attempts, repoRoot, tempRoot, runner });
				if (result.accepted) {
					const destination = join(submissionsDirectory, brief.artifactDirectory);
					await atomicCopyDirectory(result.submissionPath, destination, false);
				}
				return { brief, result };
			} catch (error) {
				return {
					brief,
					result: {
						accepted: false,
						kind: 'orchestrator',
						errors: [cleanDiagnostic(error.message)],
						warnings: [],
						evidence: null,
						elapsedMs: 0
					}
				};
			} finally {
				for (const entry of await (async () => {
					const matches = [];
					const handle = await opendir(tempRoot);
					for await (const entry of handle) {
						if (entry.isDirectory() && entry.name.startsWith(`${brief.artifactDirectory}-attempt-${record.attempts}-`)) {
							matches.push(join(tempRoot, entry.name));
						}
					}
					return matches;
				})()) {
					await rm(entry, { recursive: true, force: true });
				}
			}
		}));

		const allInfrastructureFailures = results.every(({ result }) =>
			!result.accepted && ['runner', 'orchestrator'].includes(result.kind) && result.elapsedMs < 45_000
		);
		for (const { brief, result } of results) {
			const record = byId.get(brief.id);
			if (result.accepted) {
				record.status = 'accepted';
				record.acceptedReview = {
					accepted: true,
					warnings: result.warnings,
					evidence: result.evidence,
					elapsedMs: result.elapsedMs,
					resumed: false
				};
				logProgress('candidate-accepted', { id: brief.id, slug: brief.slug, attempt: record.attempts });
			} else {
				record.status = 'pending';
				record.rejections.push({
					attempt: record.attempts,
					kind: result.kind,
					errors: result.errors,
					warnings: result.warnings,
					elapsedMs: result.elapsedMs
				});
				if (record.attempts >= maxAttempts) {
					throw new Error(`${brief.artifactDirectory} exceeded ${maxAttempts} clean regeneration attempts`);
				}
				pending.push(brief);
				logProgress('candidate-rejected-and-requeued', {
					id: brief.id,
					slug: brief.slug,
					attempt: record.attempts,
					kind: result.kind,
					errors: result.errors
				});
			}
		}
		await writeSummary(summary, records, startedAt, configuration);
		if (allInfrastructureFailures) {
			throw new Error('Every worker in the wave failed at the isolation/runner boundary; stopped before blind retries');
		}
		logProgress('wave-finished', {
			wave,
			accepted: records.filter((record) => record.status === 'accepted').length,
			pending: pending.length
		});
	}

	logProgress('import-started', { count: briefs.length });
	for (const brief of briefs) {
		await spawnCaptured(
			process.execPath,
			[
				join(repoRoot, 'scripts/benchmark/import-site.mjs'),
				'--submission', join(submissionsDirectory, brief.artifactDirectory),
				'--registry', registry,
				...(staticRoot ? ['--static-root', staticRoot] : []),
				...(publicBase ? ['--public-base', publicBase] : []),
				'--replace'
			],
			{ cwd: repoRoot }
		);
	}
	await spawnCaptured(
		process.execPath,
		[
			join(repoRoot, 'scripts/benchmark/audit-duplicates.mjs'),
			'--submissions', submissionsDirectory,
			'--output', duplicateOutput
		],
		{ cwd: repoRoot }
	);
	await writeSummary(summary, records, startedAt, configuration, true);
	logProgress('batch-complete', { accepted: 100, imported: 100 });
}

main().catch((error) => {
	terminateChildren();
	console.error(`run-neutral-batch: ${cleanDiagnostic(error.message)}`);
	process.exitCode = 1;
});
