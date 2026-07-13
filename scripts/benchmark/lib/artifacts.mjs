import { createHash } from 'node:crypto';
import {
	copyFile,
	cp,
	lstat,
	mkdir,
	opendir,
	readFile,
	rename,
	rm,
	stat,
	writeFile
} from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';

export const CONTRACT_VERSION = 1;
export const MAX_FILE_COUNT = 2_000;
export const MAX_TREE_BYTES = 100 * 1024 * 1024;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_TEXT_PATTERN = /^[^\u0000-\u001f\u007f]+$/;

export function parseCli(argv, valueFlags, booleanFlags = new Set()) {
	const result = { _: [] };

	for (let index = 0; index < argv.length; index += 1) {
		const argument = argv[index];
		if (!argument.startsWith('--')) {
			result._.push(argument);
			continue;
		}

		const equalsAt = argument.indexOf('=');
		const name = argument.slice(2, equalsAt === -1 ? undefined : equalsAt);
		if (booleanFlags.has(name)) {
			if (equalsAt !== -1) throw new Error(`--${name} does not take a value`);
			result[name] = true;
			continue;
		}

		if (!valueFlags.has(name)) throw new Error(`Unknown option: --${name}`);
		const value = equalsAt === -1 ? argv[++index] : argument.slice(equalsAt + 1);
		if (!value || value.startsWith('--')) throw new Error(`--${name} requires a value`);
		result[name] = value;
	}

	return result;
}

export function requireOption(options, name) {
	const value = options[name];
	if (typeof value !== 'string' || value.length === 0) {
		throw new Error(`Missing required option: --${name}`);
	}
	return value;
}

export function toPosixPath(path) {
	return path.split(sep).join('/');
}

function assertPlainText(value, name, maxLength) {
	if (typeof value !== 'string' || value.length === 0 || value.length > maxLength) {
		throw new Error(`${name} must be a non-empty string no longer than ${maxLength} characters`);
	}
	if (!SAFE_TEXT_PATTERN.test(value)) throw new Error(`${name} contains control characters`);
	return value;
}

export async function readSiteManifest(submissionDirectory) {
	const manifestPath = join(submissionDirectory, 'site.json');
	let manifest;
	try {
		const manifestStatus = await lstat(manifestPath);
		if (manifestStatus.isSymbolicLink() || !manifestStatus.isFile()) {
			throw new Error('site.json must be a regular, non-symlinked file');
		}
		manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
	} catch (error) {
		if (error?.code === 'ENOENT') throw new Error(`Missing manifest: ${manifestPath}`);
		throw new Error(`Invalid site.json: ${error.message}`);
	}

	if (!manifest || Array.isArray(manifest) || typeof manifest !== 'object') {
		throw new Error('site.json must contain one JSON object');
	}
	if (manifest.schemaVersion !== CONTRACT_VERSION) {
		throw new Error(`site.json schemaVersion must be ${CONTRACT_VERSION}`);
	}
	if (!Number.isSafeInteger(manifest.id) || manifest.id < 1) {
		throw new Error('site.json id must be a positive integer');
	}

	const slug = assertPlainText(manifest.slug, 'site.json slug', 80);
	if (!SLUG_PATTERN.test(slug)) throw new Error('site.json slug must be lowercase kebab-case');
	const artifactDirectory = manifest.artifactDirectory ?? slug;
	assertPlainText(artifactDirectory, 'site.json artifactDirectory', 96);
	if (!SLUG_PATTERN.test(artifactDirectory)) {
		throw new Error('site.json artifactDirectory must be one lowercase kebab-case path segment');
	}

	return {
		schemaVersion: CONTRACT_VERSION,
		id: manifest.id,
		slug,
		artifactDirectory,
		title: assertPlainText(manifest.title, 'site.json title', 120),
		category: assertPlainText(manifest.category, 'site.json category', 80),
		tagline: assertPlainText(manifest.tagline ?? manifest.title, 'site.json tagline', 180),
		description: assertPlainText(
			manifest.description ?? manifest.tagline ?? manifest.title,
			'site.json description',
			600
		)
	};
}

export async function listTreeFiles(rootDirectory, options = {}) {
	const root = resolve(rootDirectory);
	const maxFiles = options.maxFiles ?? MAX_FILE_COUNT;
	const maxBytes = options.maxBytes ?? MAX_TREE_BYTES;
	const allowMissing = options.allowMissing ?? false;
	const files = [];
	let totalBytes = 0;
	let rootStatus;
	try {
		rootStatus = await lstat(root);
	} catch (error) {
		if (allowMissing && error?.code === 'ENOENT') return { root, files, totalBytes };
		throw error;
	}
	if (rootStatus.isSymbolicLink() || !rootStatus.isDirectory()) {
		throw new Error(`Artifact tree must be a real directory, not a link: ${root}`);
	}

	async function visit(directory) {
		let handle;
		try {
			handle = await opendir(directory);
		} catch (error) {
			throw error;
		}

		const entries = [];
		for await (const entry of handle) entries.push(entry);
		entries.sort((a, b) => Buffer.from(a.name).compare(Buffer.from(b.name)));

		for (const entry of entries) {
			const absolutePath = join(directory, entry.name);
			const fileStatus = await lstat(absolutePath);
			if (fileStatus.isSymbolicLink()) {
				throw new Error(`Symbolic links are not allowed: ${absolutePath}`);
			}
			if (fileStatus.isDirectory()) {
				await visit(absolutePath);
				continue;
			}
			if (!fileStatus.isFile()) throw new Error(`Unsupported filesystem entry: ${absolutePath}`);

			const relativePath = toPosixPath(relative(root, absolutePath));
			if (!relativePath || relativePath.startsWith('../')) {
				throw new Error(`File escaped artifact root: ${absolutePath}`);
			}
			files.push({ absolutePath, relativePath, size: fileStatus.size });
			totalBytes += fileStatus.size;
			if (files.length > maxFiles) throw new Error(`${root} exceeds ${maxFiles} files`);
			if (totalBytes > maxBytes) throw new Error(`${root} exceeds ${maxBytes} bytes`);
		}
	}

	await visit(root);
	return { root, files, totalBytes };
}

function uint64(value) {
	const buffer = Buffer.allocUnsafe(8);
	buffer.writeBigUInt64BE(BigInt(value));
	return buffer;
}

export async function canonicalTreeHash(rootDirectory, options = {}) {
	const tree = await listTreeFiles(rootDirectory, options);
	const hash = createHash('sha256');
	hash.update('sitegeist-canonical-tree-v1\0');

	for (const file of tree.files) {
		const pathBytes = Buffer.from(file.relativePath, 'utf8');
		const contents = await readFile(file.absolutePath);
		hash.update(uint64(pathBytes.length));
		hash.update(pathBytes);
		hash.update(uint64(contents.length));
		hash.update(contents);
	}

	return {
		hash: hash.digest('hex'),
		fileCount: tree.files.length,
		totalBytes: tree.totalBytes
	};
}

export async function sha256File(path) {
	const contents = await readFile(path);
	return createHash('sha256').update(contents).digest('hex');
}

export async function assertStaticEntry(distDirectory) {
	const entryPath = join(distDirectory, 'index.html');
	let entryStatus;
	try {
		entryStatus = await stat(entryPath);
	} catch (error) {
		if (error?.code === 'ENOENT') throw new Error(`Missing static entry point: ${entryPath}`);
		throw error;
	}
	if (!entryStatus.isFile()) throw new Error(`Static entry point is not a file: ${entryPath}`);

	const html = await readFile(entryPath, 'utf8');
	if (!/<html(?:\s|>)/i.test(html) || !/<body(?:\s|>)/i.test(html)) {
		throw new Error('The static index.html must contain html and body elements');
	}

	const remoteReference = /(?:src|href|poster|action)\s*=\s*["']\s*(?:https?:)?\/\//i;
	const remoteCssReference = /(?:url\(|@import\s+)["']?\s*(?:https?:)?\/\//i;
	if (remoteReference.test(html) || remoteCssReference.test(html)) {
		throw new Error('The static index.html contains a remote asset or navigation dependency');
	}
	return entryPath;
}

export async function assertStaticPoster(previewDirectory) {
	const posterPath = join(previewDirectory, 'poster.svg');
	if (!(await isRegularFile(posterPath))) {
		throw new Error(`Missing authored gallery poster: ${posterPath}`);
	}
	const svg = await readFile(posterPath, 'utf8');
	const root = svg.match(/<svg\b[^>]*>/i)?.[0];
	if (!root) throw new Error('preview/poster.svg must contain an SVG root');
	const viewBoxAttribute = root.match(/\bviewBox\s*=\s*["']([^"']+)["']/i)?.[1];
	const viewBox = viewBoxAttribute ? viewBoxAttribute.split(/[\s,]+/).map(Number) : null;
	if (
		!viewBox ||
		viewBox.length !== 4 ||
		viewBox.some((value) => !Number.isFinite(value)) ||
		viewBox[2] <= 0 ||
		viewBox[3] <= 0 ||
		Math.abs(viewBox[2] / viewBox[3] - 4 / 3) > 0.001
	) {
		throw new Error('preview/poster.svg must have a 4:3 viewBox');
	}
	if (/<(?:script|foreignObject|animate|animateMotion|animateTransform|set)(?:\s|>)/i.test(svg)) {
		throw new Error('preview/poster.svg must be static and cannot contain executable content');
	}
	if (
		/(?:href|src)\s*=\s*["']\s*(?:https?:)?\/\//i.test(svg) ||
		/url\(\s*["']?\s*(?:https?:)?\/\//i.test(svg) ||
		/@import\s+["']?\s*(?:https?:)?\/\//i.test(svg)
	) {
		throw new Error('preview/poster.svg cannot contain remote assets');
	}
	return posterPath;
}

export async function validateSubmission(submissionDirectory, options = {}) {
	const root = resolve(submissionDirectory);
	const rootStatus = await lstat(root);
	if (rootStatus.isSymbolicLink() || !rootStatus.isDirectory()) {
		throw new Error(`Submission must be a real directory, not a link: ${root}`);
	}

	const manifest = await readSiteManifest(root);
	const sourceDirectory = join(root, 'source');
	const distDirectory = join(root, 'dist');
	const source = await canonicalTreeHash(sourceDirectory, options);
	const dist = await canonicalTreeHash(distDirectory, options);
	if (source.fileCount === 0) throw new Error('source/ must contain at least one file');
	if (dist.fileCount === 0) throw new Error('dist/ must contain at least one file');
	await assertStaticEntry(distDirectory);

	const previewDirectory = join(root, 'preview');
	await listTreeFiles(previewDirectory, { ...options, allowMissing: true });
	const previewEntry = join(previewDirectory, 'index.html');
	const previewPoster = await assertStaticPoster(previewDirectory);
	const previewAuthored = await isRegularFile(previewEntry);

	const auditDirectory = join(root, 'audit');
	await listTreeFiles(auditDirectory, { ...options, allowMissing: true });
	const desktopAudit = join(auditDirectory, 'desktop.webp');
	const mobileAudit = join(auditDirectory, 'mobile.webp');
	const audit = {
		desktop: await isRegularFile(desktopAudit),
		mobile: await isRegularFile(mobileAudit)
	};
	const preview = {
		authored: previewAuthored,
		poster: true
	};

	return {
		root,
		manifest,
		sourceDirectory,
		distDirectory,
		previewDirectory,
		auditDirectory,
		preview,
		audit,
		previewPaths: { entry: previewEntry, poster: previewPoster },
		auditPaths: { desktop: desktopAudit, mobile: mobileAudit },
		source,
		dist
	};
}

export async function isRegularFile(path) {
	try {
		return (await lstat(path)).isFile();
	} catch (error) {
		if (error?.code === 'ENOENT') return false;
		throw error;
	}
}

export async function atomicWrite(path, contents) {
	const outputPath = resolve(path);
	await mkdir(dirname(outputPath), { recursive: true });
	const temporaryPath = `${outputPath}.tmp-${process.pid}-${Date.now()}`;
	try {
		await writeFile(temporaryPath, contents, { encoding: 'utf8', mode: 0o644 });
		await rename(temporaryPath, outputPath);
	} finally {
		await rm(temporaryPath, { force: true });
	}
}

export async function atomicCopyDirectory(source, destination, replace = false) {
	const destinationPath = resolve(destination);
	const parent = dirname(destinationPath);
	const temporaryPath = join(parent, `.sitegeist-import-${process.pid}-${Date.now()}`);
	const backupPath = join(parent, `.sitegeist-backup-${process.pid}-${Date.now()}`);
	await mkdir(parent, { recursive: true });

	try {
		const destinationExists = await pathExists(destinationPath);
		if (!replace && destinationExists) {
			throw new Error(`Destination already exists (use --replace to update it): ${destinationPath}`);
		}
		await cp(source, temporaryPath, { recursive: true, errorOnExist: true, force: false });
		if (destinationExists) {
			await rename(destinationPath, backupPath);
		}
		try {
			await rename(temporaryPath, destinationPath);
		} catch (error) {
			if (destinationExists && (await pathExists(backupPath))) {
				await rename(backupPath, destinationPath);
			}
			throw error;
		}
		await rm(backupPath, { recursive: true, force: true });
	} finally {
		await rm(temporaryPath, { recursive: true, force: true });
	}
}

export async function copyOptionalFile(source, destination) {
	if (!(await isRegularFile(source))) return false;
	await mkdir(dirname(destination), { recursive: true });
	await copyFile(source, destination);
	return true;
}

export async function pathExists(path) {
	try {
		await lstat(path);
		return true;
	} catch (error) {
		if (error?.code === 'ENOENT') return false;
		throw error;
	}
}
