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
	let briefSource = $derived(JSON.stringify(brief, null, '\t'));
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
			<span>{brief.category}</span>
		</div>
		<button onclick={onclose} aria-label="Close brief" title="Close brief">
			<X size={17} strokeWidth={2.2} />
		</button>
	</header>

	<div class="brief-intro">
		<h2 id="site-brief-title">{brief.title}</h2>
		<p>Exact JSON payload supplied to every model.</p>
	</div>

	<pre class="brief-source" aria-label={`Source brief for ${brief.title}`}><code>{briefSource}</code></pre>

	<footer class="brief-footer">
		<a href={sourceUrl} target="_blank" rel="noopener noreferrer">
			Open source file
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
		outline: none;
		background: #111210;
		color: #f2f0e9;
	}

	.brief-intro {
		display: flex;
		align-items: end;
		justify-content: space-between;
		gap: 24px;
		padding: 22px 2px 18px;
	}

	h2 {
		margin: 0;
		font-size: clamp(32px, 4vw, 44px);
		font-weight: 620;
		line-height: 0.92;
		letter-spacing: -0.06em;
	}

	.brief-intro p {
		width: 145px;
		flex: none;
		margin: 0;
		color: #74766f;
		font-size: 10px;
		font-weight: 600;
		line-height: 1.35;
		text-align: right;
	}

	.brief-source {
		margin: 0;
		padding: 17px 18px;
		overflow-wrap: anywhere;
		border: 1px solid #d1d0c8;
		border-radius: 16px;
		background: #e8e6de;
		color: #30312e;
		font: 600 10px/1.55 ui-monospace, 'SFMono-Regular', Consolas, monospace;
		letter-spacing: -0.015em;
		tab-size: 2;
		white-space: pre-wrap;
	}

	.brief-footer {
		padding: 17px 2px 2px;
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

		.brief-intro {
			display: block;
		}

		.brief-intro p {
			width: auto;
			margin-top: 10px;
			text-align: left;
		}

		.brief-source {
			padding: 15px;
			font-size: 9px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.brief-panel { animation: none; }
	}
</style>
