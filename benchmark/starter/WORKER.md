# Isolated website work order

You are creating exactly one standalone website from `brief.md`.

This worker intentionally contains no earlier websites, shared design system,
layout library, examples, screenshots, or repository history. Do not search for
any. Design from the brief itself.

## Required output

Create this structure under `submission/`:

```text
submission/
  site.json
  source/
    index.html
    sitegeist-bridge.js
    ...
  dist/
    index.html
    sitegeist-bridge.js
    ...
  preview/               # authored gallery poster, separate from the website
    poster.svg           # required 4:3, static, self-contained artwork
    index.html           # optional authoring/inspection wrapper
    ...
  audit/                 # optional; always captured by the evaluator later
    desktop.webp
    mobile.webp
```

`source/` is the complete authored source. `dist/` is a browser-ready static
build. Prefer dependency-free HTML, CSS, JavaScript, SVG, and local raster/font
assets. When no build is needed, copy `source/` to `dist/` byte-for-byte.

`preview/poster.svg` is a static 4:3 gallery poster for this site. Author it with
a `viewBox` of `0 0 1200 900` using the site's own name, palette, typography, and
distinctive motif. It should read clearly when reduced to a small card. It is
promotional artwork, not a screenshot and not part of the real website; never
alter the website just to make the poster work. Keep the poster motionless and
self-contained. Do not use scripts, `foreignObject`, or remote assets inside it.

The evaluator supplies `/workspace/sitegeist-bridge.js`. Copy it byte-for-byte
into both `source/` and `dist/`, then load it from `index.html` with a deferred
script tag before the site's own scripts. Do not modify it. The bridge is neutral
viewer infrastructure for touch dismissal and does not contain another site's
design or content.

`site.json` must be valid JSON with these fields:

```json
{
  "schemaVersion": 1,
  "id": 1,
  "slug": "brief-provided-public-slug",
  "artifactDirectory": "001-brief-provided-public-slug",
  "title": "Brief-provided title",
  "category": "Brief-provided category",
  "tagline": "Brief-provided tagline",
  "description": "Brief-provided description"
}
```

Use the identity values supplied by the brief; do not reuse the illustrative
values above. `artifactDirectory` is optional and defaults to `slug`.

## Constraints

- The website must work by loading `dist/index.html` from a nested static URL.
- The poster must work as a standalone image loaded from `preview/poster.svg`.
- Use relative asset URLs. Include every runtime asset in `dist/`.
- Do not use CDNs, remote fonts, analytics, APIs, or runtime network requests.
- Put a Content-Security-Policy meta tag in both entry points with at least
  `default-src 'self'`, `connect-src 'none'`, `frame-src 'none'`,
  `object-src 'none'`, `base-uri 'none'`, and `form-action 'none'`.
- Do not use nested frames, executable downloads, dynamic code evaluation,
  service workers, popups, redirects, or external navigation.
- Do not add a server, package cache, dependency directory, Git repository, or
  generated commentary to the submission.
- Do not read outside this worker. Do not attempt to discover prior outputs.
- Make the page responsive and usable with touch, mouse, and keyboard.
- At a 390 CSS-pixel viewport, the document itself must not scroll horizontally
  or exceed the viewport width; keep every essential control and content region
  fully reachable without clipping it behind a blanket overflow workaround.
- Honor `prefers-reduced-motion` for nonessential motion.
- Finish the site completely; do not leave placeholder text or TODOs.

The evaluator validates and imports the artifact only after this run ends. It
may discover duplicates later, but duplicate feedback is never returned to this
or subsequent generation workers.
