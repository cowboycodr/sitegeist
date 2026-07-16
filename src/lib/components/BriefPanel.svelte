<script lang="ts">
	import { ExternalLink, X } from '@lucide/svelte';
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
	let contentFields = $derived([
		{ key: 'eyebrow', value: brief.content.eyebrow },
		{ key: 'primaryAction', value: brief.content.primaryAction },
		{ key: 'secondaryAction', value: brief.content.secondaryAction }
	]);
	let requirementFields = $derived([
		{ key: 'responsive', value: brief.requirements.responsive },
		{ key: 'accessible', value: brief.requirements.accessible },
		{ key: 'runtimeNetwork', value: brief.requirements.runtimeNetwork },
		{ key: 'standaloneStaticBuild', value: brief.requirements.standaloneStaticBuild }
	]);
	let sourceUrl = $derived(
		`https://github.com/cowboycodr/sitegeist/blob/main/benchmark/briefs/generated/${brief.artifactDirectory}.json`
	);

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
			<span><code>category</code> {brief.category}</span>
		</div>
		<button onclick={onclose} aria-label="Close brief" title="Close brief">
			<X size={17} strokeWidth={2.2} />
		</button>
	</header>

	<div class="brief-intro">
		<span class="field-key">title</span>
		<h2 id="site-brief-title">{brief.title}</h2>
		<div class="identity-copy">
			<div>
				<span class="field-key">tagline</span>
				<p class="brief-tagline">{brief.tagline}</p>
			</div>
			<div>
				<span class="field-key">description</span>
				<p class="brief-description">{brief.description}</p>
			</div>
		</div>
	</div>

	<section class="brief-section" aria-labelledby="brief-content-title">
		<h3 id="brief-content-title">content</h3>
		<dl class="field-list">
			{#each contentFields as field}
				<div>
					<dt>{field.key}</dt>
					<dd>{field.value}</dd>
				</div>
			{/each}
		</dl>
	</section>

	<section class="brief-section" aria-labelledby="brief-requirements-title">
		<h3 id="brief-requirements-title">requirements</h3>
		<ul class="requirement-list">
			{#each requirementFields as field}
				<li>
					<code>{field.key}</code>
					<span class:true-value={field.value}>{String(field.value)}</span>
				</li>
			{/each}
		</ul>
	</section>

	<footer class="brief-footer">
		<div class="brief-meta" aria-label="Brief metadata">
			<span><code>id</code> {brief.id}</span>
			<span><code>slug</code> {brief.slug}</span>
			<span><code>schemaVersion</code> {brief.schemaVersion}</span>
			<span><code>briefId</code> {brief.briefId}</span>
			<span><code>artifactDirectory</code> {brief.artifactDirectory}</span>
		</div>
		<a href={sourceUrl} target="_blank" rel="noopener noreferrer">
			View raw JSON
			<ExternalLink size={13} strokeWidth={2.1} />
		</a>
	</footer>
</section>

<style>
	.brief-panel {
		position: fixed;
		z-index: 1110;
		bottom: 76px;
		left: 50%;
		width: min(480px, calc(100vw - 32px));
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
		transform: translateX(-50%);
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
		letter-spacing: 0.07em;
		text-transform: uppercase;
	}

	.brief-kicker span:last-child {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.brief-kicker code {
		color: #a0a19a;
		font: inherit;
		text-transform: none;
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
		outline: none;
		background: #111210;
		color: #f2f0e9;
	}

	.brief-intro {
		padding: 22px 2px 24px;
	}

	.field-key,
	h3,
	dt,
	.brief-meta code {
		color: #8a8c85;
		font: 700 9px/1 ui-monospace, monospace;
		letter-spacing: 0.035em;
	}

	h2 {
		margin: 5px 0 0;
		font-size: clamp(34px, 4vw, 48px);
		font-weight: 620;
		line-height: 0.92;
		letter-spacing: -0.06em;
	}

	.identity-copy {
		display: grid;
		grid-template-columns: 0.9fr 1.35fr;
		gap: 24px;
		margin-top: 22px;
	}

	.brief-tagline,
	.brief-description {
		margin: 7px 0 0;
	}

	.brief-tagline {
		font: 500 19px/1.08 'EB Garamond', Georgia, serif;
		letter-spacing: -0.015em;
	}

	.brief-description {
		color: #565852;
		font-size: 11px;
		font-weight: 560;
		line-height: 1.48;
	}

	.brief-section {
		padding: 17px 2px;
		border-top: 1px solid #d7d6cf;
	}

	h3 {
		margin: 0 0 11px;
		color: #676963;
		font-size: 10px;
	}

	.field-list {
		margin: 0;
	}

	.field-list div {
		display: grid;
		grid-template-columns: 120px minmax(0, 1fr);
		gap: 14px;
		padding: 8px 0;
		border-bottom: 1px solid rgba(17, 18, 16, 0.07);
	}

	.field-list div:last-child {
		border-bottom: 0;
	}

	dt {
		padding-top: 2px;
	}

	dd {
		margin: 0;
		font-size: 12px;
		font-weight: 650;
		line-height: 1.35;
	}

	.requirement-list {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 7px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.requirement-list li {
		display: flex;
		min-width: 0;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 9px 10px;
		border: 1px solid #d4d3cc;
		border-radius: 11px;
		background: rgba(255, 255, 255, 0.23);
	}

	.requirement-list code {
		overflow: hidden;
		color: #5f615b;
		font: 650 9px/1 ui-monospace, monospace;
		text-overflow: ellipsis;
	}

	.requirement-list span {
		flex: none;
		padding: 4px 6px;
		border-radius: 999px;
		background: #deddd6;
		color: #6d6f68;
		font: 750 8px/1 ui-monospace, monospace;
	}

	.requirement-list span.true-value {
		background: #111210;
		color: #f2f0e9;
	}

	.brief-footer {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 18px;
		padding: 17px 2px 2px;
		border-top: 1px solid #d7d6cf;
	}

	.brief-meta {
		display: flex;
		min-width: 0;
		flex-wrap: wrap;
		gap: 5px 11px;
		color: #666861;
		font: 650 8px/1.25 ui-monospace, monospace;
	}

	.brief-meta span {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.brief-footer a {
		display: inline-flex;
		flex: none;
		align-items: center;
		gap: 7px;
		color: #111210;
		font-size: 10px;
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
		from { opacity: 0; transform: translate3d(-50%, 12px, 0) scale(.98); }
		to { opacity: 1; transform: translate3d(-50%, 0, 0) scale(1); }
	}

	@media (max-width: 720px) {
		.brief-panel {
			bottom: 68px;
			width: calc(100vw - 16px);
			max-height: min(72dvh, 640px);
			border-radius: 22px;
		}

		.identity-copy {
			grid-template-columns: 1fr;
			gap: 17px;
		}

		.requirement-list {
			grid-template-columns: 1fr;
		}

		.brief-footer {
			align-items: start;
			flex-direction: column;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.brief-panel { animation: none; }
	}
</style>
