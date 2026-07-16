<script lang="ts">
	import { Check, ExternalLink, X } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import type { BenchmarkBrief } from '$lib/brief-types';

	let {
		brief,
		onclose
	}: {
		brief: BenchmarkBrief;
		onclose: () => void;
	} = $props();

	let panelElement: HTMLElement;
	let sourceUrl = $derived(
		`https://github.com/cowboycodr/sitegeist/blob/main/benchmark/briefs/generated/${brief.artifactDirectory}.json`
	);
	let requirements = $derived([
		{ label: 'Responsive layout', met: brief.requirements.responsive },
		{ label: 'Accessible markup', met: brief.requirements.accessible },
		{ label: 'No runtime network', met: !brief.requirements.runtimeNetwork },
		{ label: 'Standalone static build', met: brief.requirements.standaloneStaticBuild }
	]);

	onMount(() => panelElement.focus());
</script>

<section
	id="site-brief-panel"
	class="brief-panel"
	bind:this={panelElement}
	tabindex="-1"
	aria-labelledby="site-brief-title"
>
	<header class="brief-header">
		<div class="brief-kicker">
			<span>Benchmark brief</span>
			<i aria-hidden="true"></i>
			<span>{brief.category}</span>
		</div>
		<button onclick={onclose} aria-label="Close brief" title="Close brief">
			<X size={17} strokeWidth={2.2} />
		</button>
	</header>

	<div class="brief-intro">
		<h2 id="site-brief-title">{brief.title}</h2>
		<p class="brief-tagline">{brief.tagline}</p>
		<p class="brief-description">{brief.description}</p>
	</div>

	<section class="brief-section" aria-labelledby="brief-content-title">
		<h3 id="brief-content-title">Requested content</h3>
		<dl class="content-list">
			<div>
				<dt>Eyebrow</dt>
				<dd>{brief.content.eyebrow}</dd>
			</div>
			<div>
				<dt>Primary action</dt>
				<dd>{brief.content.primaryAction}</dd>
			</div>
			<div>
				<dt>Secondary action</dt>
				<dd>{brief.content.secondaryAction}</dd>
			</div>
		</dl>
	</section>

	<section class="brief-section" aria-labelledby="brief-requirements-title">
		<h3 id="brief-requirements-title">Delivery requirements</h3>
		<ul class="requirement-list">
			{#each requirements as requirement}
				<li class:unmet={!requirement.met}>
					<span><Check size={13} strokeWidth={2.5} /></span>
					{requirement.label}
				</li>
			{/each}
		</ul>
	</section>

	<footer class="brief-footer">
		<a href={sourceUrl} target="_blank" rel="noopener noreferrer">
			View source JSON
			<ExternalLink size={13} strokeWidth={2.1} />
		</a>
	</footer>
</section>

<style>
	.brief-panel {
		position: fixed;
		z-index: 1110;
		right: max(16px, env(safe-area-inset-right));
		bottom: 76px;
		width: min(430px, calc(100vw - 32px));
		max-height: calc(100dvh - 96px);
		padding: 18px;
		overflow-y: auto;
		border: 1px solid rgba(17, 18, 16, 0.13);
		border-radius: 25px;
		outline: none;
		background: #f2f0e9;
		color: #111210;
		box-shadow: 0 30px 90px rgba(0, 0, 0, 0.42), inset 0 1px rgba(255, 255, 255, 0.8);
		font-family: 'Inter Variable', Inter, sans-serif;
		animation: brief-panel-enter 240ms cubic-bezier(.22, 1, .36, 1) both;
	}

	.brief-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.brief-kicker {
		display: flex;
		min-width: 0;
		align-items: center;
		gap: 9px;
		color: #6f716b;
		font: 750 9px/1 ui-monospace, monospace;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.brief-kicker span:last-child {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.brief-kicker i {
		width: 18px;
		height: 1px;
		flex: none;
		background: #b4b5af;
	}

	.brief-header button {
		display: grid;
		width: 34px;
		height: 34px;
		flex: none;
		padding: 0;
		place-items: center;
		border: 1px solid #d3d2ca;
		border-radius: 50%;
		background: transparent;
		color: #111210;
		cursor: pointer;
		transition: border-color 160ms ease, background 160ms ease;
	}

	.brief-header button:hover,
	.brief-header button:focus-visible {
		border-color: #111210;
		background: #111210;
		color: #f2f0e9;
		outline: none;
	}

	.brief-intro {
		padding: 22px 2px 24px;
	}

	h2 {
		margin: 0;
		font-size: clamp(34px, 4vw, 48px);
		font-weight: 620;
		line-height: 0.92;
		letter-spacing: -0.06em;
	}

	.brief-tagline {
		margin: 18px 0 0;
		font: 500 21px/1.08 'EB Garamond', Georgia, serif;
		letter-spacing: -0.015em;
	}

	.brief-description {
		margin: 12px 0 0;
		color: #5e605b;
		font-size: 13px;
		font-weight: 520;
		line-height: 1.55;
	}

	.brief-section {
		padding: 18px 2px;
		border-top: 1px solid #d7d6cf;
	}

	h3 {
		margin: 0 0 13px;
		color: #74766f;
		font: 750 9px/1 ui-monospace, monospace;
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}

	.content-list {
		display: grid;
		gap: 0;
		margin: 0;
	}

	.content-list div {
		display: grid;
		grid-template-columns: 115px minmax(0, 1fr);
		gap: 16px;
		padding: 9px 0;
		border-bottom: 1px solid rgba(17, 18, 16, 0.08);
	}

	.content-list div:last-child {
		border-bottom: 0;
	}

	dt {
		color: #85877f;
		font-size: 10px;
		font-weight: 650;
	}

	dd {
		margin: 0;
		font-size: 12px;
		font-weight: 650;
		line-height: 1.35;
	}

	.requirement-list {
		display: flex;
		flex-wrap: wrap;
		gap: 7px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.requirement-list li {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 7px 10px 7px 7px;
		border: 1px solid #d4d3cc;
		border-radius: 999px;
		font-size: 10px;
		font-weight: 650;
	}

	.requirement-list li > span {
		display: grid;
		width: 19px;
		height: 19px;
		place-items: center;
		border-radius: 50%;
		background: #111210;
		color: #f2f0e9;
	}

	.requirement-list li.unmet {
		opacity: 0.42;
	}

	.brief-footer {
		padding: 17px 2px 2px;
		border-top: 1px solid #d7d6cf;
	}

	.brief-footer a {
		display: inline-flex;
		align-items: center;
		gap: 7px;
		color: #111210;
		font-size: 11px;
		font-weight: 700;
		text-decoration: none;
	}

	.brief-footer a:hover {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.brief-footer a:focus-visible {
		border-radius: 3px;
		outline: 2px solid #3858e9;
		outline-offset: 3px;
	}

	@keyframes brief-panel-enter {
		from { opacity: 0; transform: translate3d(0, 12px, 0) scale(.98); }
		to { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
	}

	@media (max-width: 720px) {
		.brief-panel {
			right: max(8px, env(safe-area-inset-right));
			bottom: 68px;
			left: max(8px, env(safe-area-inset-left));
			width: auto;
			max-height: min(72dvh, 640px);
			border-radius: 22px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.brief-panel { animation: none; }
	}
</style>
