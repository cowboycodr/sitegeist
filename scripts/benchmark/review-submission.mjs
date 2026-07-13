#!/usr/bin/env node

import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
	atomicWrite,
	listTreeFiles,
	parseCli,
	requireOption,
	sha256File,
	validateSubmission
} from './lib/artifacts.mjs';

const TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.mjs', '.svg', '.txt']);
const ALLOWED_EXTENSIONS = new Set([
	'.avif', '.css', '.gif', '.html', '.jpeg', '.jpg', '.js', '.json', '.m4a', '.mjs',
	'.mp3', '.mp4', '.ogg', '.otf', '.png', '.svg', '.ttf', '.txt', '.wav', '.webm',
	'.webp', '.woff', '.woff2'
]);
const FORBIDDEN_PATH_SEGMENTS = new Set([
	'.env', '.git', '.hg', '.svn', 'node_modules', 'package-lock.json', 'pnpm-lock.yaml',
	'yarn.lock'
]);
const CSP_REQUIREMENTS = [
	/default-src\s+'self'/i,
	/connect-src\s+'none'/i,
	/frame-src\s+'none'/i,
	/object-src\s+'none'/i,
	/base-uri\s+'none'/i,
	/form-action\s+'none'/i
];
const FORBIDDEN_COMMAND = /(?:^|[\s;&|])(?:curl|wget|aria2c|ssh|scp|sftp|nc|ncat|telnet|gh)(?:\s|$)|\bgit\s+(?:clone|fetch|pull)\b|\b(?:npm|pnpm|yarn|bun|pip|pip3|uv)\s+(?:add|install|i)\b|(?:^|\s)(?:\/home\/codex|\/root|\/proc|\/sys|\/nix\/store|\/etc)(?:\/|\s|$)|auth\.json|\.codex/i;

function lexicalCompare(a, b) {
	return Buffer.from(a).compare(Buffer.from(b));
}

function pushMismatch(errors, label, actual, expected) {
	if (actual !== expected) errors.push(`${label} does not match its private brief`);
}

async function readJson(path, label) {
	try {
		return JSON.parse(await readFile(path, 'utf8'));
	} catch (error) {
		throw new Error(`${label} is not valid JSON: ${error.message}`);
	}
}

function scriptSources(html) {
	return [...html.matchAll(/<script\b[^>]*>/gi)].map((match) => ({
		tag: match[0],
		src: match[0].match(/\bsrc\s*=\s*["']([^"']+)["']/i)?.[1] ?? null
	}));
}

function reviewIndex(html, label, errors) {
	if (!/<html\b[^>]*\blang\s*=\s*["'][^"']+["']/i.test(html)) {
		errors.push(`${label} must declare an html language`);
	}
	if (!/<meta\b[^>]*\bname\s*=\s*["']viewport["']/i.test(html)) {
		errors.push(`${label} must include a responsive viewport`);
	}
	if (!/<title\b[^>]*>[^<]+<\/title>/i.test(html)) errors.push(`${label} must include a title`);
	if (!/<main(?:\s|>)/i.test(html)) errors.push(`${label} must include a main landmark`);
	if (!/<h1(?:\s|>)/i.test(html)) errors.push(`${label} must include one primary heading`);
	if (!/http-equiv\s*=\s*["']Content-Security-Policy["']/i.test(html)) {
		errors.push(`${label} must include a Content-Security-Policy meta tag`);
	}
	for (const requirement of CSP_REQUIREMENTS) {
		if (!requirement.test(html)) errors.push(`${label} has an incomplete Content-Security-Policy`);
	}
	const scripts = scriptSources(html);
	const bridgeIndex = scripts.findIndex((script) => script.src === 'sitegeist-bridge.js' || script.src === './sitegeist-bridge.js');
	if (bridgeIndex !== 0) {
		errors.push(`${label} must load sitegeist-bridge.js before every site script`);
	}
	if (/http-equiv\s*=\s*["']refresh["']/i.test(html)) errors.push(`${label} cannot redirect`);
}

function reviewText(contents, path, errors) {
	const withoutSvgNamespace = contents.replaceAll('http://www.w3.org/2000/svg', '');
	if (/https?:\/\//i.test(withoutSvgNamespace) || /(?:href|src)\s*=\s*["']\s*\/\//i.test(withoutSvgNamespace)) {
		errors.push(`${path} contains a remote URL`);
	}
	if (/\b(?:fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon\s*\(|importScripts\s*\(|serviceWorker\.register)/i.test(contents)) {
		errors.push(`${path} contains a runtime network API`);
	}
	if (/<\s*(?:iframe|object|embed)(?:\s|>)/i.test(contents)) {
		errors.push(`${path} contains nested active content`);
	}
	if (/\b(?:eval\s*\(|document\.write\s*\(|new\s+Function\s*\()/i.test(contents)) {
		errors.push(`${path} contains dynamic code execution`);
	}
	if (/javascript\s*:/i.test(contents)) errors.push(`${path} contains a javascript URL`);
	if (/\b(?:TODO|FIXME|lorem ipsum|placeholder content)\b/i.test(contents)) {
		errors.push(`${path} contains unfinished placeholder content`);
	}
}

function collectLogEvidence(value, evidence) {
	if (!value || typeof value !== 'object') return;
	if (value.type === 'web_search') evidence.webSearches += 1;
	if (value.type === 'command_execution' && typeof value.command === 'string') {
		evidence.commands.push(value.command);
	}
	for (const nested of Object.values(value)) collectLogEvidence(nested, evidence);
}

async function reviewWorkerLog(workerLogPath, errors) {
	const evidence = { commands: [], webSearches: 0 };
	if (!workerLogPath) return evidence;
	const log = await readFile(workerLogPath, 'utf8');
	for (const line of log.split('\n')) {
		if (!line.trim()) continue;
		try {
			collectLogEvidence(JSON.parse(line), evidence);
		} catch {
			errors.push('worker log contains a non-JSON event');
		}
	}
	if (evidence.webSearches > 0) errors.push('worker attempted web search');
	for (const command of evidence.commands) {
		if (FORBIDDEN_COMMAND.test(command)) errors.push('worker attempted an out-of-scope command');
	}
	return evidence;
}

export async function reviewSubmission({ submission, brief, workerLog = null }) {
	const submissionPath = resolve(submission);
	const briefPath = resolve(brief);
	const errors = [];
	const warnings = [];
	const expected = await readJson(briefPath, 'brief');
	let validated;
	try {
		validated = await validateSubmission(submissionPath);
	} catch (error) {
		return { accepted: false, errors: [error.message], warnings, evidence: null };
	}

	for (const [field, label] of [
		['id', 'site id'], ['slug', 'site slug'], ['artifactDirectory', 'artifact directory'],
		['title', 'site title'], ['category', 'site category'], ['tagline', 'site tagline'],
		['description', 'site description']
	]) {
		pushMismatch(errors, label, validated.manifest[field], expected[field]);
	}

	const scriptDirectory = resolve(fileURLToPath(new URL('.', import.meta.url)));
	const starterBridge = join(scriptDirectory, '../../benchmark/starter/sitegeist-bridge.js');
	const bridgeHash = await sha256File(starterBridge);
	for (const tree of ['source', 'dist']) {
		const bridge = join(submissionPath, tree, 'sitegeist-bridge.js');
		try {
			if (await sha256File(bridge) !== bridgeHash) errors.push(`${tree}/sitegeist-bridge.js was modified`);
		} catch {
			errors.push(`${tree}/sitegeist-bridge.js is missing`);
		}
	}

	let totalBytes = 0;
	let totalFiles = 0;
	for (const treeName of ['source', 'dist', 'preview']) {
		const tree = await listTreeFiles(join(submissionPath, treeName));
		totalBytes += tree.totalBytes;
		totalFiles += tree.files.length;
		for (const file of tree.files) {
			const reviewPath = `${treeName}/${file.relativePath}`;
			const segments = file.relativePath.split('/');
			if (segments.some((segment) => segment.startsWith('.') || FORBIDDEN_PATH_SEGMENTS.has(segment))) {
				errors.push(`${reviewPath} is not an allowed artifact path`);
			}
			const extension = extname(file.relativePath).toLowerCase();
			if (!ALLOWED_EXTENSIONS.has(extension)) errors.push(`${reviewPath} has an unsupported file type`);
			if (((await stat(file.absolutePath)).mode & 0o111) !== 0) errors.push(`${reviewPath} is executable`);
			if (TEXT_EXTENSIONS.has(extension)) {
				const contents = await readFile(file.absolutePath, 'utf8');
				reviewText(contents, reviewPath, errors);
			}
		}
	}
	if (totalFiles > 500) errors.push('submission exceeds the review file-count limit');
	if (totalBytes > 25 * 1024 * 1024) errors.push('submission exceeds the review size limit');

	for (const treeName of ['source', 'dist']) {
		const indexPath = join(submissionPath, treeName, 'index.html');
		const html = await readFile(indexPath, 'utf8');
		reviewIndex(html, `${treeName}/index.html`, errors);
	}
	if (validated.source.totalBytes < 1_500 || validated.dist.totalBytes < 1_500) {
		errors.push('website output is too small to be a complete demonstration');
	}
	if (validated.source.hash !== validated.dist.hash) {
		warnings.push('source and dist differ; retained as a built static artifact');
	}

	const evidence = await reviewWorkerLog(workerLog, errors);
	return {
		accepted: errors.length === 0,
		errors: [...new Set(errors)].sort(lexicalCompare),
		warnings: [...new Set(warnings)].sort(lexicalCompare),
		evidence: {
			commandCount: evidence.commands.length,
			webSearchCount: evidence.webSearches,
			fileCount: totalFiles,
			totalBytes,
			sourceHash: validated.source.hash,
			distHash: validated.dist.hash
		}
	};
}

async function main() {
	const options = parseCli(
		process.argv.slice(2),
		new Set(['submission', 'brief', 'worker-log', 'output']),
		new Set(['help'])
	);
	if (options.help) {
		console.log('Usage: node scripts/benchmark/review-submission.mjs --submission <dir> --brief <file> [--worker-log <jsonl>] [--output <json>]');
		return;
	}
	const report = await reviewSubmission({
		submission: requireOption(options, 'submission'),
		brief: requireOption(options, 'brief'),
		workerLog: options['worker-log'] ?? null
	});
	if (options.output) await atomicWrite(options.output, `${JSON.stringify(report, null, '\t')}\n`);
	console.log(JSON.stringify(report, null, 2));
	if (!report.accepted) process.exitCode = 2;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	main().catch((error) => {
		console.error(`review-submission: ${error.message}`);
		process.exitCode = 1;
	});
}
