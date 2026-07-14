# Sitegeist isolated-site artifact contract

Contract version: **1**

This benchmark generates each website in a fresh, one-site filesystem and only
compares results after generation. A worker receives the neutral starter and one
private brief. It must not receive the gallery source, Git history, prior sites,
screenshots, caches, duplicate reports, or feedback from earlier runs.

## Submission artifact

Every completed worker emits one directory:

```text
submission/
  site.json              required identity manifest
  source/                required complete authored source
  dist/                  required self-contained static build
    index.html            required browser entry point
  preview/               required authored 4:3 gallery poster
    poster.svg            required static, self-contained artwork
    index.html            optional authoring/inspection wrapper
  audit/                 optional canonical evaluator captures
    desktop.webp
    mobile.webp
```

`source/` captures what the worker authored. `dist/` captures what the gallery
ships. They are deliberately hashed separately: two sources can build to the
same site, and identical source can theoretically produce different builds.

`preview/` is a separate, art-directed gallery poster. It must represent the
site's own identity at a fixed 4:3 aspect ratio, but it is not benchmark evidence
and must never force changes to the real website. The gallery loads
`preview/poster.svg` directly, so isolated workers do not need a screenshot
renderer or raster export step.

`audit/` contains unembellished, standardized screenshots of the real site.
These captures are the visual inputs to exact-duplicate detection and are never
used as the normal gallery thumbnail.

The submission directory is an evaluator workspace, not a second persisted
collection. Keep batch submissions outside Git (the repository ignores
`.benchmark-work/` and `benchmark/*-submissions/`). After review and duplicate
auditing, import each accepted submission once into `static/sites/<model>/`.
That model-specific static tree is the canonical deployable website collection;
the generated registry retains the source and distribution hashes, and the
benchmark reports retain the audit result.

For a dependency-free site, `source/` may already be deployable. The evaluator
can create `dist/` without executing submitted code:

```sh
node scripts/benchmark/build-static.mjs \
  --submission /path/to/submission
```

Pass `--replace` only when intentionally rebuilding an existing `dist/`.

### `site.json`

```json
{
  "schemaVersion": 1,
  "id": 2,
  "slug": "form-haus",
  "artifactDirectory": "002-form-haus",
  "title": "Form Haus",
  "category": "Architecture",
  "tagline": "Space, reduced to its essence.",
  "description": "A Copenhagen practice creating monumental spaces with a disciplined, deeply human point of view."
}
```

- `schemaVersion` is exactly `1`.
- `id` is a positive, collection-unique integer.
- `slug` is the public, collection-unique lowercase kebab-case identity.
- `artifactDirectory` is an optional lowercase kebab-case storage directory. It
  defaults to `slug` and does not change the public identity.
- `title` and `category` are nonempty plain-text strings.
- `tagline` and `description` provide the gallery-facing copy. For legacy
  artifacts they default to `title`, but new workers should always provide both.

### Static-site requirements

- `dist/index.html` contains `html` and `body` elements.
- All runtime files are inside `dist/`; URLs are relative so the site works at
  `/sites/<model>/<artifactDirectory>/index.html`.
- No CDN assets, remote fonts, analytics, API calls, or runtime network
  dependencies are allowed.
- Symbolic links and special filesystem entries are forbidden in artifact trees.
- Each of `source/` and `dist/` is limited to 2,000 files and 100 MiB by default.
- The importer's lightweight HTML check catches common remote `src`, `href`,
  `poster`, `action`, CSS `url()`, and `@import` references in `index.html`. This
  is validation, not a security sandbox; untrusted sites must still be rendered
  in a sandboxed iframe with an appropriately restrictive CSP.
- `preview/poster.svg` must declare a 4:3 `viewBox` and cannot contain remote
  assets, scripts, `foreignObject`, or SVG animation elements.

The SVG poster is required during import. Audit WebPs are optional and their
registry URLs are nullable. The importer never substitutes an audit capture for
a missing poster: gallery artwork and benchmark evidence remain separate by
construction.

## Isolated generation lifecycle

Prepare a fresh worker from one brief:

```sh
worker="$(node scripts/benchmark/prepare-run.mjs --brief briefs/001.md)"
```

The resulting mode-0700 temporary directory contains only:

```text
WORKER.md
brief.md
sitegeist-bridge.js
```

On Linux, run the future worker through Bubblewrap:

```sh
CODEX_RUNTIME_ROOT=/opt/sitegeist-codex-runtime \
OPENAI_API_KEY="$OPENAI_API_KEY" \
scripts/benchmark/run-isolated-worker.sh "$worker"
```

The equivalent Grok Build worker uses the same one-site mount boundary and a
fresh temporary Grok home:

```sh
GROK_AUTH_FILE="$HOME/.grok/auth.json" \
GROK_MODEL=grok-4.5 \
scripts/benchmark/run-isolated-grok-worker.sh "$worker"
```

The runner invokes exactly this Codex mode inside the OS boundary:

```sh
codex exec --ephemeral --ignore-user-config --ignore-rules \
  --sandbox workspace-write --skip-git-repo-check \
  -c 'web_search="disabled"' \
  -C /workspace '<isolated work order>'
```

Bubblewrap receives only system libraries, a caller-supplied self-contained Codex
runtime mounted read-only, and that single worker mounted at `/workspace`. It
does not mount `$HOME`, the Sitegeist repository, sibling workers, Git objects,
or user configuration. Host environment variables are cleared except for the
API key. Networking remains available because `codex exec` needs its control
plane, so the work order also forbids runtime web research and remote assets.

`CODEX_RUNTIME_ROOT` must be a dedicated runtime bundle, not a parent directory
that also contains repositories or previous outputs. On systems without
Bubblewrap, use an equivalently sparse container or VM mount namespace; a Git
branch, worktree, subprocess working directory, or prompt instruction alone is
not an isolation boundary.

Do not run many workers against a shared output directory. Give each worker its
own temporary directory, wait for completion, validate its submission, and move
the completed artifact to an evaluator-owned collection that later workers
cannot mount. The included runner is ready for future orchestration but is not
invoked by any benchmark script.

## Import

Import one completed artifact into the gallery's static tree and update either a
JSON or TypeScript registry selected by the caller:

```sh
node scripts/benchmark/import-site.mjs \
  --submission .benchmark-work/grok-4.5/002-form-haus \
  --registry src/lib/generated/grok-site-artifacts.ts \
  --static-root static/sites/grok-4.5 \
  --public-base /sites/grok-4.5
```

`--static-root` defaults to `static/sites`; override it for tests or alternate
deployments. `--public-base` defaults to `/sites` and controls the URLs written
to the registry. Benchmark collections must always provide matching
model-specific values for both options so one model cannot overwrite another.
Existing destinations and registry entries are rejected unless `--replace` is
supplied. A generated TypeScript registry exports:

- `SiteArtifact`
- `siteArtifacts`
- `siteArtifactBySlug`

Each record contains `id`, `slug`, `title`, `category`, `artifactUrl`,
`tagline`, `description`, `posterUrl`, `desktopAuditUrl`, `mobileAuditUrl`,
`sourceHash`, and `distHash`.
Gallery import requires `preview/poster.svg`. Audit URLs are nullable because
audit captures are evidence, not UI dependencies; the importer never
substitutes an audit capture for a missing poster.

## Exact duplicate audit

```sh
node scripts/benchmark/audit-duplicates.mjs \
  --submissions /isolated-results \
  --output /reports/exact-duplicates.json
```

The audit validates every immediate child and evaluates every unordered pair.
Its report includes poster and audit-capture presence, SHA-256 for the optional
poster and both audit captures, exact matching pairs, and grouped source, dist,
and visual duplicates. Poster hashes are informational only.
`visualExact` is true only when both sites have desktop and mobile captures and
both corresponding file hashes match. This is an exact encoded-file lane, not
yet a normalized raw-pixel or perceptual comparison. The audit intentionally
does not remove duplicates or feed results back into generation.

The canonical tree hash is SHA-256 over a version prefix followed by every file
in bytewise relative-path order. Each entry is framed by an unsigned 64-bit path
length, UTF-8 POSIX relative path, unsigned 64-bit content length, and raw file
bytes. Timestamps, permissions, directory entries, and host path separators do
not affect it. Empty directories are ignored. Thus a matching hash means equal
file paths and bytes for benchmark purposes; it does not detect reskins or other
perceptual near-duplicates.
