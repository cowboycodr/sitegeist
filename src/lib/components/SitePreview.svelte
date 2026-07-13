<script lang="ts">
	import { ArrowUpRight, Ellipsis } from '@lucide/svelte';
	import type { ShowcaseSite } from '$lib/site-types';

	let { site }: { site: ShowcaseSite } = $props();
</script>

<div
	class="preview {site.layout} {site.pattern} {site.typeface}"
	style="--site-bg:{site.palette.bg}; --site-ink:{site.palette.ink}; --site-accent:{site.palette.accent}; --site-accent-2:{site.palette.accent2}; --site-muted:{site.palette.muted};"
>
	<div class="preview-nav">
		<span class="mini-logo">{site.name.slice(0, 2)}</span>
		<span class="mini-nav-line"></span>
		<Ellipsis class="mini-menu" size={12} strokeWidth={2.2} />
	</div>

	<div class="preview-copy">
		<span class="preview-kicker">{site.eyebrow}</span>
		<h3>{site.tagline}</h3>
		<span class="preview-button">{site.cta} <ArrowUpRight size={10} strokeWidth={2.4} /></span>
	</div>

	<div class="preview-art" aria-hidden="true">
		<span class="shape shape-a"></span>
		<span class="shape shape-b"></span>
		<span class="shape shape-c"></span>
	</div>

	<div class="preview-footer">
		<span>{site.category}</span>
		<span>{String(site.id).padStart(3, '0')}</span>
	</div>
</div>

<style>
	.preview {
		position: relative;
		height: 100%;
		min-height: 220px;
		overflow: hidden;
		background: var(--site-bg);
		color: var(--site-ink);
		font-family: Arial, Helvetica, sans-serif;
		isolation: isolate;
	}

	.preview::before,
	.preview::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.preview::after {
		z-index: 8;
		opacity: 0.08;
		background-image: repeating-linear-gradient(0deg, currentColor 0 1px, transparent 1px 3px);
		mix-blend-mode: overlay;
	}

	.preview-nav,
	.preview-footer {
		position: absolute;
		z-index: 6;
		left: 18px;
		right: 18px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-family: ui-monospace, monospace;
		font-size: 7px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.preview-nav { top: 15px; }
	.preview-footer { bottom: 14px; }

	.mini-logo {
		display: grid;
		width: 22px;
		height: 22px;
		place-items: center;
		border-radius: 50%;
		background: var(--site-ink);
		color: var(--site-bg);
		font-size: 7px;
	}

	.mini-nav-line {
		width: 30%;
		height: 1px;
		margin-left: auto;
		margin-right: 10px;
		background: currentColor;
		opacity: 0.4;
	}

	.preview-copy {
		position: absolute;
		z-index: 4;
		left: 18px;
		top: 57px;
		width: 58%;
	}

	.preview-kicker {
		display: block;
		margin-bottom: 7px;
		font: 600 6px/1 ui-monospace, monospace;
		letter-spacing: 0.14em;
		text-transform: uppercase;
	}

	h3 {
		max-width: 220px;
		margin: 0;
		font-size: clamp(24px, 3.7vw, 46px);
		font-weight: 660;
		line-height: 0.88;
		letter-spacing: -0.07em;
		text-wrap: balance;
	}

	.preview-button {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		margin-top: 14px;
		padding: 7px 10px;
		border: 1px solid currentColor;
		border-radius: 999px;
		font: 700 6px/1 ui-monospace, monospace;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.preview-art {
		position: absolute;
		z-index: 2;
		inset: 0;
	}

	.shape {
		position: absolute;
		display: block;
	}

	.shape-a {
		width: 42%;
		aspect-ratio: 1;
		right: -5%;
		top: 22%;
		border-radius: 50%;
		background: var(--site-accent);
	}

	.shape-b {
		width: 22%;
		aspect-ratio: 1;
		right: 22%;
		bottom: -6%;
		background: var(--site-accent-2);
		transform: rotate(22deg);
	}

	.shape-c {
		width: 12%;
		aspect-ratio: 1;
		right: 8%;
		top: 13%;
		border: 1px solid currentColor;
		border-radius: 50%;
	}

	.serif h3 { font-family: Georgia, 'Times New Roman', serif; font-weight: 500; letter-spacing: -0.06em; }
	.mono h3 { font-family: ui-monospace, monospace; font-weight: 600; letter-spacing: -0.08em; text-transform: uppercase; }
	.rounded h3 { font-family: 'Arial Rounded MT Bold', system-ui, sans-serif; letter-spacing: -0.06em; }
	.condensed h3 { font-family: Impact, 'Arial Narrow', sans-serif; font-weight: 500; letter-spacing: -0.035em; text-transform: uppercase; }
	.display h3 { font-family: 'Bodoni 72', Didot, serif; font-weight: 500; letter-spacing: -0.07em; }
	.humanist h3 { font-family: Optima, Candara, sans-serif; font-weight: 600; letter-spacing: -0.055em; }

	.centered .preview-copy { left: 15%; top: 29%; width: 70%; text-align: center; }
	.centered h3 { margin-inline: auto; }
	.centered .shape-a { width: 55%; right: 22%; top: 11%; opacity: 0.76; }
	.centered .shape-b { width: 13%; right: 4%; bottom: 14%; border-radius: 50%; }

	.editorial .preview-copy { top: 44%; width: 48%; }
	.editorial h3 { font-size: clamp(25px, 3.3vw, 39px); }
	.editorial .shape-a { width: 39%; right: 7%; top: 18%; border-radius: 0; }
	.editorial .shape-b { right: 34%; bottom: 12%; width: 9%; }

	.poster .preview-copy { top: 21%; width: 76%; }
	.poster h3 { font-size: clamp(35px, 5.6vw, 68px); line-height: 0.74; text-transform: uppercase; }
	.poster .preview-button { display: none; }
	.poster .shape-a { width: 24%; right: 8%; top: 49%; border-radius: 0; mix-blend-mode: multiply; }

	.catalog .preview-copy { top: 22%; width: 45%; }
	.catalog .shape-a { width: 39%; right: 7%; top: 22%; border-radius: 46% 46% 12% 12%; }
	.catalog .shape-b { right: 15%; width: 28%; bottom: 3%; border-radius: 50% 50% 8% 8%; }

	.dashboard .preview-copy { top: 30%; width: 42%; }
	.dashboard .shape-a { width: 42%; right: 5%; top: 25%; border: 1px solid currentColor; border-radius: 8px; background: color-mix(in srgb, var(--site-accent) 75%, transparent); box-shadow: -18px 22px 0 color-mix(in srgb, var(--site-accent-2) 75%, transparent); }

	.cinematic .preview-copy { top: auto; bottom: 37px; width: 75%; }
	.cinematic .shape-a { width: 90%; right: -25%; top: -42%; border-radius: 50%; filter: blur(1px); }
	.cinematic .shape-b { width: 36%; right: 9%; bottom: -12%; border-radius: 50%; }

	.brutalist { border: 3px solid var(--site-ink); }
	.brutalist .preview-nav { border-bottom: 2px solid currentColor; padding-bottom: 8px; }
	.brutalist .preview-copy { width: 70%; }
	.brutalist .shape-a { border: 3px solid currentColor; border-radius: 0; box-shadow: 8px 8px 0 var(--site-accent-2); }
	.brutalist .preview-button { border-width: 2px; border-radius: 0; background: var(--site-accent); }

	.luxury .preview-copy { left: 13%; top: 31%; width: 74%; text-align: center; }
	.luxury h3 { margin-inline: auto; }
	.luxury .preview-button { border-width: 0 0 1px; border-radius: 0; padding-inline: 0; }
	.luxury .shape-a { width: 62%; right: 19%; top: 13%; background: transparent; border: 1px solid var(--site-accent); }
	.luxury .shape-b { right: 37%; width: 26%; border-radius: 50%; opacity: 0.55; }

	.orbital .preview-copy { top: 26%; width: 45%; }
	.orbital .shape-a { width: 52%; right: -3%; top: 13%; background: transparent; border: 11px solid var(--site-accent); }
	.orbital .shape-b { right: 13%; bottom: 25%; width: 9%; border-radius: 50%; }
	.orbital .shape-c { width: 38%; right: 4%; top: 20%; }

	.mesh::before { background: radial-gradient(circle at 75% 30%, var(--site-accent), transparent 38%), radial-gradient(circle at 25% 80%, var(--site-accent-2), transparent 33%); filter: blur(13px); }
	.grid::before { background-image: linear-gradient(color-mix(in srgb, var(--site-ink) 18%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--site-ink) 18%, transparent) 1px, transparent 1px); background-size: 22px 22px; }
	.rings::before { background: repeating-radial-gradient(circle at 82% 47%, transparent 0 15px, color-mix(in srgb, var(--site-ink) 25%, transparent) 16px 17px); }
	.stripes::before { background: repeating-linear-gradient(115deg, transparent 0 19px, color-mix(in srgb, var(--site-ink) 13%, transparent) 20px 22px); }
	.dots::before { background-image: radial-gradient(color-mix(in srgb, var(--site-ink) 35%, transparent) 1px, transparent 1px); background-size: 13px 13px; }
	.sun::before { background: conic-gradient(from 18deg at 78% 48%, transparent 0 6deg, color-mix(in srgb, var(--site-accent) 55%, transparent) 6deg 13deg, transparent 13deg 19deg); }
	.checker::before { background: conic-gradient(from 90deg, color-mix(in srgb, var(--site-ink) 12%, transparent) 25%, transparent 0 50%, color-mix(in srgb, var(--site-ink) 12%, transparent) 0 75%, transparent 0); background-size: 35px 35px; }
	.aurora::before { background: linear-gradient(120deg, transparent 24%, color-mix(in srgb, var(--site-accent) 72%, transparent) 43%, color-mix(in srgb, var(--site-accent-2) 62%, transparent) 57%, transparent 74%); filter: blur(16px); transform: rotate(-12deg) scale(1.35); }
	.blocks::before { background: linear-gradient(90deg, transparent 68%, color-mix(in srgb, var(--site-accent) 24%, transparent) 68%), linear-gradient(0deg, transparent 57%, color-mix(in srgb, var(--site-ink) 9%, transparent) 57%); background-size: 70px 100%, 100% 56px; }
	.halo::before { background: radial-gradient(circle at 76% 42%, transparent 0 22%, var(--site-accent) 22.4% 23%, transparent 23.4% 31%, var(--site-accent-2) 31.4% 32%, transparent 32.4%); }
	.noise::before { background: linear-gradient(135deg, color-mix(in srgb, var(--site-accent) 38%, transparent), transparent 55%); }
	.waves::before { background: repeating-radial-gradient(ellipse at 95% 120%, transparent 0 18px, color-mix(in srgb, var(--site-ink) 22%, transparent) 19px 21px); }
	.type::before { content: 'Aa'; inset: auto -5% -33%; font: 700 200px/1 Impact, sans-serif; letter-spacing: -0.08em; color: var(--site-accent); opacity: 0.3; }
</style>
