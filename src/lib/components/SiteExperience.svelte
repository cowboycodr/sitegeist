<script lang="ts">
	import { ArrowRight, ArrowUpRight, Ellipsis, Menu, Play, TrendingUp } from '@lucide/svelte';
	import type { ShowcaseSite } from '$lib/site-types';

	let { site }: { site: ShowcaseSite } = $props();

	let metrics = $derived([
		`${(site.id * 7) % 41 + 9}K`,
		`${(site.id * 13) % 89 + 10}%`,
		`0${(site.id % 8) + 1}`
	]);
</script>

<article
	class="experience {site.layout} {site.pattern} {site.typeface}"
	style="--site-bg:{site.palette.bg}; --site-ink:{site.palette.ink}; --site-accent:{site.palette.accent}; --site-accent-2:{site.palette.accent2}; --site-muted:{site.palette.muted};"
>
	<div class="atmosphere" aria-hidden="true"></div>
	<div class="experience-art" aria-hidden="true">
		<span class="art art-a"></span>
		<span class="art art-b"></span>
		<span class="art art-c"></span>
		<span class="art art-d"></span>
	</div>

	<header class="site-nav">
		<a class="brand" href="#top" aria-label={site.name}>
			<span class="brand-mark">{site.name.slice(0, 2)}</span>
			<span>{site.name}</span>
		</a>
		<nav aria-label="Site navigation">
			<a href="#story">Story</a>
			<a href="#work">Work</a>
			<a href="#contact">Contact</a>
		</nav>
		<button class="menu-button" aria-label="Open menu"><Menu size={17} strokeWidth={2} /></button>
	</header>

	{#if site.layout === 'split'}
		<main class="site-main split-main" id="top">
			<div class="hero-copy">
				<p class="eyebrow"><span></span>{site.eyebrow}</p>
				<h1>{site.tagline}</h1>
				<p class="lede">{site.description}</p>
				<div class="actions"><a class="primary" href="#work">{site.cta}<ArrowUpRight size={17} strokeWidth={2.2} /></a><a class="text-link" href="#story">{site.secondary}<ArrowRight size={13} strokeWidth={2.2} /></a></div>
			</div>
			<div class="visual-stage"><span class="stage-label">{String(site.id).padStart(3, '0')} / 100</span></div>
		</main>
	{:else if site.layout === 'centered'}
		<main class="site-main centered-main" id="top">
			<p class="eyebrow"><span></span>{site.eyebrow}</p>
			<h1>{site.tagline}</h1>
			<p class="lede">{site.description}</p>
			<div class="actions"><a class="primary" href="#work">{site.cta}<ArrowUpRight size={17} strokeWidth={2.2} /></a></div>
			<div class="orbit-copy"><span>Independent thinking</span><span>Made for right now</span><span>Est. 2026</span></div>
		</main>
	{:else if site.layout === 'editorial'}
		<main class="site-main editorial-main" id="top">
			<div class="issue"><span>Issue</span><strong>{String(site.id).padStart(2, '0')}</strong></div>
			<div class="hero-copy">
				<p class="eyebrow">{site.eyebrow}</p>
				<h1>{site.tagline}</h1>
			</div>
			<div class="editorial-note"><span class="dropcap">{site.description.charAt(0)}</span><p>{site.description.slice(1)} Read the full story and meet the people turning an ambitious idea into a living, breathing practice.</p><a href="#story">Continue reading <ArrowUpRight size={12} strokeWidth={2.2} /></a></div>
			<div class="editorial-line"><span>{site.category}</span><span>{site.name} / Journal</span></div>
		</main>
	{:else if site.layout === 'poster'}
		<main class="site-main poster-main" id="top">
			<div class="poster-meta"><span>{site.eyebrow}</span><span>{site.category}</span><span>MMXXVI</span></div>
			<h1>{site.tagline}</h1>
			<div class="poster-bottom"><p>{site.description}</p><a class="square-cta" href="#work" aria-label={site.cta}><ArrowUpRight size={30} strokeWidth={1.8} /></a></div>
		</main>
	{:else if site.layout === 'catalog'}
		<main class="site-main catalog-main" id="top">
			<div class="hero-copy">
				<p class="eyebrow">New collection · {site.eyebrow}</p>
				<h1>{site.tagline}</h1>
				<p class="lede">{site.description}</p>
				<a class="primary" href="#work">{site.cta}<ArrowUpRight size={17} strokeWidth={2.2} /></a>
			</div>
			<div class="product-card"><span class="product-no">No. {site.id}</span><div class="product-shape"></div><div class="product-meta"><span>{site.name} Original</span><strong>${site.id + 80}</strong></div></div>
		</main>
	{:else if site.layout === 'dashboard'}
		<main class="site-main dashboard-main" id="top">
			<div class="dash-copy">
				<p class="eyebrow"><span class="live-dot"></span>{site.eyebrow}</p>
				<h1>{site.tagline}</h1>
				<p class="lede">{site.description}</p>
				<a class="primary" href="#work">{site.cta}<ArrowUpRight size={17} strokeWidth={2.2} /></a>
			</div>
			<div class="dash-panel">
				<div class="panel-top"><span>LIVE SYSTEM</span><Ellipsis size={16} strokeWidth={2.2} /></div>
				<div class="big-number">{metrics[0]}</div><span class="up"><TrendingUp size={13} strokeWidth={2.3} /> {metrics[1]} this month</span>
				<div class="chart-bars">{#each [37, 54, 42, 68, 61, 83, 74, 96] as height}<i style={`height:${height}%`}></i>{/each}</div>
			</div>
			<div class="mini-panel"><span>Signal health</span><strong>{metrics[1]}</strong><i></i></div>
		</main>
	{:else if site.layout === 'cinematic'}
		<main class="site-main cinematic-main" id="top">
			<div class="cinema-index">{String(site.id).padStart(3, '0')}</div>
			<div class="hero-copy">
				<p class="eyebrow">{site.eyebrow}</p>
				<h1>{site.tagline}</h1>
				<div class="cinema-bottom"><p>{site.description}</p><a class="play-button" href="#story"><span><Play size={12} strokeWidth={2} fill="currentColor" /></span> Play story</a></div>
			</div>
			<div class="cinema-stamp">{site.name}<br />Original</div>
		</main>
	{:else if site.layout === 'brutalist'}
		<main class="site-main brutal-main" id="top">
			<div class="brutal-label">{site.eyebrow} // {site.category}</div>
			<h1>{site.tagline}</h1>
			<div class="brutal-grid">
				<p>{site.description}</p>
				<div class="brutal-stats"><span><b>{metrics[0]}</b>PEOPLE</span><span><b>{metrics[1]}</b>ENERGY</span></div>
				<a href="#work">{site.cta}<ArrowUpRight size={15} strokeWidth={2.2} /></a>
			</div>
		</main>
	{:else if site.layout === 'luxury'}
		<main class="site-main luxury-main" id="top">
			<p class="eyebrow">{site.eyebrow} · Since 2026</p>
			<h1>{site.tagline}</h1>
			<p class="lede">{site.description}</p>
			<a class="fine-link" href="#story">{site.cta}<ArrowRight size={15} strokeWidth={2.2} /></a>
			<div class="luxury-caption"><span>{String(site.id).padStart(2, '0')}</span><i></i><span>{site.category}</span></div>
		</main>
	{:else}
		<main class="site-main orbital-main" id="top">
			<div class="coordinates"><span>{(41 + site.id / 100).toFixed(2)}° N</span><span>{(72 + site.id / 90).toFixed(2)}° W</span></div>
			<div class="hero-copy">
				<p class="eyebrow">{site.eyebrow}</p>
				<h1>{site.tagline}</h1>
				<p class="lede">{site.description}</p>
				<div class="actions"><a class="primary" href="#work">{site.cta}<ArrowUpRight size={17} strokeWidth={2.2} /></a><a class="text-link" href="#story">Explore system<ArrowRight size={13} strokeWidth={2.2} /></a></div>
			</div>
			<div class="radar"><span></span><span></span><span></span><i></i><b>{metrics[2]}</b></div>
		</main>
	{/if}

	<footer class="site-footer">
		<span>© 2026 {site.name}</span>
		<div><span>{site.category}</span><i></i><span>Scroll to explore</span></div>
	</footer>
</article>

<style>
	.experience {
		position: relative;
		min-height: 100dvh;
		overflow: hidden;
		background: var(--site-bg);
		color: var(--site-ink);
		isolation: isolate;
	}

	.experience::after {
		content: '';
		position: absolute;
		z-index: 20;
		inset: 0;
		pointer-events: none;
		opacity: 0.045;
		background-image: repeating-linear-gradient(0deg, currentColor 0 1px, transparent 1px 3px);
		mix-blend-mode: overlay;
	}

	.atmosphere,
	.experience-art { position: absolute; inset: 0; pointer-events: none; }
	.atmosphere { z-index: -2; }
	.experience-art { z-index: -1; }

	.site-nav {
		position: absolute;
		z-index: 10;
		top: 0;
		left: 0;
		right: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: clamp(22px, 3vw, 44px) clamp(24px, 5vw, 76px);
		font-size: 12px;
		font-weight: 700;
		letter-spacing: -0.01em;
	}

	a { color: inherit; text-decoration: none; }

	.brand { display: flex; align-items: center; gap: 12px; font-size: 13px; }
	.brand-mark { display: grid; width: 34px; aspect-ratio: 1; place-items: center; border: 1px solid currentColor; border-radius: 50%; font: 700 9px/1 ui-monospace, monospace; text-transform: uppercase; }
	.site-nav nav { display: flex; gap: clamp(18px, 3vw, 48px); }
	.site-nav nav a { opacity: 0.7; transition: opacity 180ms ease; }
	.site-nav nav a:hover { opacity: 1; }
	.menu-button { display: none; width: 38px; height: 38px; place-items: center; border: 1px solid currentColor; border-radius: 50%; background: transparent; color: inherit; }

	.site-main { position: relative; min-height: 100dvh; padding: 120px clamp(24px, 5vw, 76px) 74px; }
	.eyebrow { display: flex; align-items: center; gap: 10px; margin: 0 0 23px; font: 700 10px/1.2 ui-monospace, monospace; letter-spacing: 0.13em; text-transform: uppercase; }
	.eyebrow > span:not(.live-dot) { width: 28px; height: 1px; background: currentColor; }
	h1 { margin: 0; max-width: 1000px; font-size: clamp(64px, 9.1vw, 148px); font-weight: 650; line-height: 0.84; letter-spacing: -0.078em; text-wrap: balance; }
	.lede { max-width: 490px; margin: 30px 0 0; font-size: clamp(15px, 1.25vw, 19px); line-height: 1.55; opacity: 0.72; }
	.actions { display: flex; align-items: center; flex-wrap: wrap; gap: 25px; margin-top: 36px; }
	.primary { display: inline-flex; align-items: center; justify-content: space-between; gap: 30px; min-width: 176px; padding: 16px 20px; border-radius: 999px; background: var(--site-ink); color: var(--site-bg); font-size: 11px; font-weight: 800; letter-spacing: 0.04em; text-transform: uppercase; transition: transform 180ms ease; }
	.primary:hover { transform: translateY(-3px); }
	.primary :global(svg) { flex: none; }
	.text-link { display: inline-flex; align-items: center; gap: 7px; border-bottom: 1px solid currentColor; padding-bottom: 5px; font-size: 12px; font-weight: 750; }

	.site-footer { position: absolute; z-index: 6; left: clamp(24px, 5vw, 76px); right: clamp(24px, 5vw, 76px); bottom: 24px; display: flex; align-items: center; justify-content: space-between; font: 700 8px/1 ui-monospace, monospace; letter-spacing: 0.1em; text-transform: uppercase; }
	.site-footer > div { display: flex; align-items: center; gap: 13px; }
	.site-footer i { width: 40px; height: 1px; background: currentColor; opacity: 0.5; }

	.art { position: absolute; display: block; }
	.art-a { width: min(43vw, 660px); aspect-ratio: 1; right: -3vw; top: 17vh; border-radius: 50%; background: var(--site-accent); }
	.art-b { width: min(25vw, 360px); aspect-ratio: 1; right: 25vw; bottom: -12vh; background: var(--site-accent-2); transform: rotate(24deg); }
	.art-c { width: min(13vw, 180px); aspect-ratio: 1; right: 7vw; top: 12vh; border: 1px solid currentColor; border-radius: 50%; }
	.art-d { display: none; }

	/* Layout 01: split */
	.split-main { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(350px, 0.95fr); align-items: center; gap: 5vw; }
	.split-main .hero-copy { position: relative; z-index: 2; }
	.split-main h1 { font-size: clamp(68px, 8.5vw, 136px); }
	.visual-stage { position: relative; align-self: stretch; min-height: 540px; border-left: 1px solid color-mix(in srgb, var(--site-ink) 30%, transparent); }
	.stage-label { position: absolute; right: 0; bottom: 5%; font: 700 10px ui-monospace, monospace; letter-spacing: 0.1em; }

	/* Layout 02: centered */
	.centered-main { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
	.centered-main h1 { max-width: 1050px; }
	.centered-main .lede { max-width: 600px; }
	.orbit-copy { position: absolute; inset: 49% 5vw auto; display: flex; justify-content: space-between; font: 700 8px ui-monospace, monospace; letter-spacing: 0.12em; text-transform: uppercase; transform: rotate(-5deg); }
	.centered .art-a { width: min(58vw, 850px); right: 21vw; top: 7vh; opacity: 0.72; }
	.centered .art-b { width: min(12vw, 170px); right: 6vw; bottom: 14vh; border-radius: 50%; }

	/* Layout 03: editorial */
	.editorial-main { display: grid; grid-template-columns: 0.22fr 1.3fr 0.55fr; align-items: center; gap: 3vw; }
	.issue { align-self: start; margin-top: 18vh; display: flex; flex-direction: column; font: 700 9px ui-monospace, monospace; text-transform: uppercase; }
	.issue strong { font-size: clamp(54px, 7vw, 110px); line-height: 1; letter-spacing: -0.07em; }
	.editorial-main .hero-copy { align-self: end; margin-bottom: 12vh; }
	.editorial-main h1 { font-size: clamp(65px, 8vw, 130px); font-weight: 500; }
	.editorial-note { position: relative; align-self: end; margin-bottom: 13vh; font-family: Georgia, serif; font-size: 15px; line-height: 1.55; }
	.editorial-note p { margin: 0; }
	.dropcap { float: left; margin: -5px 9px -5px 0; font-size: 58px; line-height: 1; }
	.editorial-note a { display: inline-flex; align-items: center; gap: 6px; margin-top: 24px; border-bottom: 1px solid currentColor; font: 700 9px ui-monospace, monospace; text-transform: uppercase; }
	.editorial-line { position: absolute; top: 15vh; left: 25%; right: 5vw; display: flex; justify-content: space-between; border-top: 1px solid currentColor; padding-top: 8px; font: 700 8px ui-monospace, monospace; text-transform: uppercase; }
	.editorial .art-a { width: 33vw; right: 18vw; top: 13vh; border-radius: 0; opacity: 0.82; }
	.editorial .art-b { width: 13vw; right: 8vw; bottom: 7vh; }

	/* Layout 04: poster */
	.poster-main { display: flex; flex-direction: column; justify-content: space-between; }
	.poster-main h1 { position: relative; z-index: 2; max-width: none; font-family: Impact, 'Arial Narrow', sans-serif; font-size: clamp(110px, 17.5vw, 280px); font-weight: 500; line-height: 0.67; letter-spacing: -0.045em; text-transform: uppercase; }
	.poster-meta { display: flex; justify-content: space-between; padding-top: 7vh; border-top: 2px solid currentColor; font: 800 10px ui-monospace, monospace; text-transform: uppercase; }
	.poster-bottom { position: relative; z-index: 3; display: flex; align-items: flex-end; justify-content: space-between; }
	.poster-bottom p { width: 360px; margin: 0; font-size: 14px; line-height: 1.5; }
	.square-cta { display: grid; width: 86px; aspect-ratio: 1; place-items: center; background: var(--site-ink); color: var(--site-bg); font-size: 32px; }
	.poster .art-a { width: 36vw; right: 7vw; top: 30vh; border-radius: 0; mix-blend-mode: multiply; }
	.poster .art-b { width: 17vw; right: 34vw; bottom: 6vh; }

	/* Layout 05: catalog */
	.catalog-main { display: grid; grid-template-columns: 0.85fr 1.15fr; align-items: center; gap: 7vw; }
	.catalog-main h1 { font-size: clamp(64px, 7.3vw, 118px); }
	.product-card { position: relative; height: min(68vh, 740px); max-width: 620px; padding: 22px; border: 1px solid color-mix(in srgb, var(--site-ink) 28%, transparent); background: color-mix(in srgb, var(--site-bg) 75%, white 7%); box-shadow: 0 35px 80px color-mix(in srgb, var(--site-ink) 14%, transparent); transform: rotate(2.5deg); }
	.product-no { font: 700 9px ui-monospace, monospace; text-transform: uppercase; }
	.product-shape { position: absolute; inset: 12% 14% 17%; border-radius: 48% 48% 13% 13%; background: linear-gradient(145deg, var(--site-accent), var(--site-accent-2)); box-shadow: inset -20px -20px 60px color-mix(in srgb, var(--site-ink) 20%, transparent); }
	.product-meta { position: absolute; left: 22px; right: 22px; bottom: 20px; display: flex; justify-content: space-between; font-size: 12px; }
	.product-meta strong { font-family: ui-monospace, monospace; }
	.catalog .art-a { width: 17vw; right: -4vw; top: 3vh; opacity: 0.5; }

	/* Layout 06: dashboard */
	.dashboard-main { display: grid; grid-template-columns: 0.8fr 1.2fr; grid-template-rows: 1fr auto; align-items: center; gap: 24px 7vw; }
	.dashboard-main h1 { max-width: 690px; font-size: clamp(64px, 7vw, 114px); }
	.live-dot { width: 7px; height: 7px; border-radius: 50%; background: var(--site-accent); box-shadow: 0 0 0 5px color-mix(in srgb, var(--site-accent) 18%, transparent); }
	.dash-panel { position: relative; height: min(58vh, 620px); padding: 30px; overflow: hidden; border: 1px solid color-mix(in srgb, var(--site-ink) 24%, transparent); border-radius: 20px; background: color-mix(in srgb, var(--site-bg) 82%, var(--site-ink) 6%); box-shadow: 0 40px 100px color-mix(in srgb, var(--site-ink) 14%, transparent); }
	.panel-top { display: flex; justify-content: space-between; font: 700 9px ui-monospace, monospace; letter-spacing: 0.12em; }
	.big-number { margin-top: 7vh; font-size: clamp(88px, 11vw, 180px); font-weight: 650; line-height: 1; letter-spacing: -0.08em; }
	.up { display: inline-flex; align-items: center; gap: 5px; padding: 8px 10px; border-radius: 20px; background: var(--site-accent); color: var(--site-bg); font: 700 10px ui-monospace, monospace; }
	.chart-bars { position: absolute; left: 30px; right: 30px; bottom: 30px; display: flex; align-items: end; gap: 8px; height: 26%; border-bottom: 1px solid currentColor; }
	.chart-bars i { flex: 1; min-width: 8px; background: linear-gradient(to top, var(--site-accent-2), var(--site-accent)); opacity: 0.85; }
	.mini-panel { grid-column: 2; display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 7px 15px; padding: 20px 24px; border-radius: 14px; background: var(--site-ink); color: var(--site-bg); font-size: 11px; }
	.mini-panel strong { font-size: 23px; }
	.mini-panel i { grid-column: 1 / -1; height: 3px; border-radius: 3px; background: linear-gradient(90deg, var(--site-accent) 72%, color-mix(in srgb, var(--site-bg) 25%, transparent) 72%); }
	.dashboard .art-a { width: 36vw; right: -15vw; top: -24vh; opacity: 0.3; }

	/* Layout 07: cinematic */
	.cinematic-main { display: flex; align-items: flex-end; background: linear-gradient(to top, color-mix(in srgb, var(--site-ink) 42%, transparent), transparent 60%); }
	.cinematic-main .hero-copy { position: relative; z-index: 2; width: 100%; padding-bottom: 4vh; }
	.cinematic-main h1 { max-width: 1180px; font-size: clamp(72px, 10vw, 164px); }
	.cinema-index { position: absolute; top: 14vh; right: 5vw; font: 500 clamp(86px, 15vw, 240px)/1 Georgia, serif; letter-spacing: -0.08em; opacity: 0.17; }
	.cinema-bottom { display: flex; align-items: flex-end; gap: 5vw; margin-top: 30px; }
	.cinema-bottom p { max-width: 520px; margin: 0; font-size: 16px; line-height: 1.5; }
	.play-button { display: inline-flex; align-items: center; gap: 10px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
	.play-button span { display: grid; width: 44px; aspect-ratio: 1; place-items: center; border: 1px solid currentColor; border-radius: 50%; font-size: 10px; }
	.cinema-stamp { position: absolute; right: 5vw; bottom: 5vh; padding-left: 12px; border-left: 2px solid currentColor; font: 700 10px/1.4 ui-monospace, monospace; text-transform: uppercase; }
	.cinematic .art-a { width: 74vw; right: -10vw; top: -50vh; background: radial-gradient(circle at 35% 65%, var(--site-accent-2), var(--site-accent) 55%, transparent 70%); filter: blur(1px); }
	.cinematic .art-b { width: 30vw; right: 3vw; bottom: -14vh; border-radius: 50%; filter: blur(5px); }

	/* Layout 08: brutalist */
	.brutalist { border: clamp(5px, 0.7vw, 12px) solid var(--site-ink); }
	.brutalist .site-nav { border-bottom: 3px solid currentColor; padding-top: 19px; padding-bottom: 19px; }
	.brutalist .brand-mark { border-width: 2px; border-radius: 0; background: var(--site-ink); color: var(--site-bg); }
	.brutal-main { display: flex; flex-direction: column; justify-content: center; padding-inline: 3.4vw; }
	.brutal-label { align-self: flex-start; margin-bottom: 20px; padding: 8px 11px; border: 2px solid currentColor; background: var(--site-accent); font: 800 10px ui-monospace, monospace; text-transform: uppercase; transform: rotate(-2deg); }
	.brutal-main h1 { position: relative; z-index: 2; max-width: none; font-family: Impact, sans-serif; font-size: clamp(95px, 14vw, 225px); font-weight: 500; line-height: 0.72; letter-spacing: -0.045em; text-transform: uppercase; }
	.brutal-grid { display: grid; grid-template-columns: 0.8fr 1fr auto; align-items: end; gap: 3vw; margin-top: 38px; padding-top: 18px; border-top: 3px solid currentColor; }
	.brutal-grid p { margin: 0; max-width: 500px; font-size: 15px; font-weight: 650; }
	.brutal-stats { display: flex; gap: 3vw; }
	.brutal-stats span { display: flex; flex-direction: column; font: 800 9px ui-monospace, monospace; }
	.brutal-stats b { font: 800 35px/1 system-ui, sans-serif; letter-spacing: -0.06em; }
	.brutal-grid > a { display: inline-flex; align-items: center; gap: 10px; padding: 18px 22px; border: 3px solid currentColor; background: var(--site-ink); color: var(--site-bg); font: 800 11px ui-monospace, monospace; text-transform: uppercase; }
	.brutalist .art-a { width: 31vw; right: 4vw; top: 23vh; border: 4px solid currentColor; border-radius: 0; box-shadow: 18px 18px 0 var(--site-accent-2); }
	.brutalist .art-b { width: 12vw; right: 35vw; bottom: 12vh; border: 4px solid currentColor; }

	/* Layout 09: luxury */
	.luxury-main { display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; }
	.luxury-main h1 { position: relative; z-index: 2; max-width: 1000px; font-family: 'Bodoni 72', Didot, Georgia, serif; font-size: clamp(75px, 10.5vw, 170px); font-weight: 400; line-height: 0.82; letter-spacing: -0.065em; }
	.luxury-main .lede { max-width: 500px; }
	.fine-link { display: flex; align-items: center; gap: 70px; margin-top: 35px; padding: 10px 0; border-bottom: 1px solid currentColor; font: 700 10px ui-monospace, monospace; letter-spacing: 0.12em; text-transform: uppercase; }
	.luxury-caption { position: absolute; left: 7vw; right: 7vw; top: 49%; display: flex; align-items: center; gap: 15px; font: 700 8px ui-monospace, monospace; letter-spacing: 0.12em; text-transform: uppercase; transform: rotate(-6deg); }
	.luxury-caption i { flex: 1; height: 1px; background: currentColor; }
	.luxury .art-a { width: min(58vw, 850px); right: 21vw; top: 5vh; border: 1px solid var(--site-accent); background: transparent; }
	.luxury .art-b { width: min(23vw, 340px); right: 38vw; bottom: -3vh; border-radius: 50%; opacity: 0.45; filter: blur(2px); }
	.luxury .art-c { right: auto; left: 9vw; top: 18vh; width: 7vw; border-color: var(--site-accent-2); }

	/* Layout 10: orbital */
	.orbital-main { display: grid; grid-template-columns: 0.9fr 1.1fr; align-items: center; }
	.orbital-main .hero-copy { position: relative; z-index: 4; }
	.orbital-main h1 { font-size: clamp(68px, 8vw, 130px); }
	.coordinates { position: absolute; top: 16vh; right: 5vw; display: flex; gap: 35px; font: 700 9px ui-monospace, monospace; }
	.radar { position: relative; justify-self: end; width: min(43vw, 630px); aspect-ratio: 1; border: 1px solid color-mix(in srgb, var(--site-ink) 42%, transparent); border-radius: 50%; background: radial-gradient(circle, var(--site-accent) 0 5%, transparent 5.5% 29%, color-mix(in srgb, var(--site-ink) 18%, transparent) 29.5% 30%, transparent 30.5% 60%, color-mix(in srgb, var(--site-ink) 18%, transparent) 60.5% 61%, transparent 61.5%); }
	.radar span { position: absolute; inset: 12%; border: 1px solid color-mix(in srgb, var(--site-ink) 27%, transparent); border-radius: 50%; }
	.radar span:nth-child(2) { inset: 25%; }
	.radar span:nth-child(3) { inset: 38%; }
	.radar::before, .radar::after { content: ''; position: absolute; left: 50%; top: 0; bottom: 0; width: 1px; background: color-mix(in srgb, var(--site-ink) 27%, transparent); }
	.radar::after { left: 0; right: 0; top: 50%; bottom: auto; width: auto; height: 1px; }
	.radar i { position: absolute; left: 50%; top: 50%; width: 44%; height: 44%; transform-origin: 0 0; transform: rotate(-36deg); background: conic-gradient(from 270deg, color-mix(in srgb, var(--site-accent-2) 70%, transparent), transparent 25%); border-radius: 100% 0 0 0; }
	.radar b { position: absolute; right: 18%; top: 24%; display: grid; width: 44px; aspect-ratio: 1; place-items: center; border-radius: 50%; background: var(--site-ink); color: var(--site-bg); font: 700 10px ui-monospace, monospace; }
	.orbital .art-a { display: none; }

	/* Surface patterns */
	.mesh .atmosphere { background: radial-gradient(circle at 78% 30%, color-mix(in srgb, var(--site-accent) 70%, transparent), transparent 34%), radial-gradient(circle at 23% 85%, color-mix(in srgb, var(--site-accent-2) 60%, transparent), transparent 31%); filter: blur(32px); }
	.grid .atmosphere { background-image: linear-gradient(color-mix(in srgb, var(--site-ink) 14%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in srgb, var(--site-ink) 14%, transparent) 1px, transparent 1px); background-size: 54px 54px; }
	.rings .atmosphere { background: repeating-radial-gradient(circle at 80% 50%, transparent 0 35px, color-mix(in srgb, var(--site-ink) 17%, transparent) 36px 38px); }
	.stripes .atmosphere { background: repeating-linear-gradient(115deg, transparent 0 44px, color-mix(in srgb, var(--site-ink) 10%, transparent) 45px 49px); }
	.dots .atmosphere { background-image: radial-gradient(color-mix(in srgb, var(--site-ink) 28%, transparent) 1.5px, transparent 1.5px); background-size: 24px 24px; }
	.sun .atmosphere { background: conic-gradient(from 13deg at 77% 48%, transparent 0 5deg, color-mix(in srgb, var(--site-accent) 43%, transparent) 5deg 11deg, transparent 11deg 17deg); }
	.checker .atmosphere { background: conic-gradient(from 90deg, color-mix(in srgb, var(--site-ink) 10%, transparent) 25%, transparent 0 50%, color-mix(in srgb, var(--site-ink) 10%, transparent) 0 75%, transparent 0); background-size: 70px 70px; }
	.aurora .atmosphere { background: linear-gradient(120deg, transparent 24%, color-mix(in srgb, var(--site-accent) 66%, transparent) 43%, color-mix(in srgb, var(--site-accent-2) 54%, transparent) 57%, transparent 74%); filter: blur(35px); transform: rotate(-11deg) scale(1.35); }
	.blocks .atmosphere { background: linear-gradient(90deg, transparent 68%, color-mix(in srgb, var(--site-accent) 20%, transparent) 68%), linear-gradient(0deg, transparent 57%, color-mix(in srgb, var(--site-ink) 8%, transparent) 57%); background-size: 180px 100%, 100% 120px; }
	.halo .atmosphere { background: radial-gradient(circle at 76% 42%, transparent 0 22%, color-mix(in srgb, var(--site-accent) 85%, transparent) 22.2% 22.8%, transparent 23% 31%, color-mix(in srgb, var(--site-accent-2) 80%, transparent) 31.2% 31.8%, transparent 32%); }
	.noise .atmosphere { background: linear-gradient(135deg, color-mix(in srgb, var(--site-accent) 34%, transparent), transparent 55%); }
	.waves .atmosphere { background: repeating-radial-gradient(ellipse at 95% 120%, transparent 0 42px, color-mix(in srgb, var(--site-ink) 18%, transparent) 43px 46px); }
	.type .atmosphere::after { content: 'Aa'; position: absolute; right: -4vw; bottom: -25vh; font: 700 min(52vw, 780px)/1 Impact, sans-serif; letter-spacing: -0.09em; color: var(--site-accent); opacity: 0.23; }

	.serif h1 { font-family: Georgia, 'Times New Roman', serif; font-weight: 500; letter-spacing: -0.066em; }
	.mono h1 { font-family: ui-monospace, 'SFMono-Regular', monospace; font-weight: 600; letter-spacing: -0.085em; text-transform: uppercase; }
	.rounded h1 { font-family: 'Arial Rounded MT Bold', system-ui, sans-serif; letter-spacing: -0.07em; }
	.condensed h1 { font-family: Impact, 'Arial Narrow', sans-serif; font-weight: 500; letter-spacing: -0.045em; text-transform: uppercase; }
	.display h1 { font-family: 'Bodoni 72', Didot, Georgia, serif; font-weight: 500; letter-spacing: -0.075em; }
	.humanist h1 { font-family: Optima, Candara, sans-serif; font-weight: 600; letter-spacing: -0.06em; }

	@media (max-width: 860px) {
		.site-nav nav { display: none; }
		.menu-button { display: grid; }
		.site-main { padding-top: 110px; padding-bottom: 90px; }
		.site-footer > div { display: none; }
		h1 { font-size: clamp(54px, 15.5vw, 105px); }
		.split-main, .catalog-main, .dashboard-main, .orbital-main { display: flex; flex-direction: column; justify-content: center; align-items: stretch; }
		.visual-stage { position: absolute; inset: 0; min-height: 0; border: 0; z-index: -1; }
		.product-card { position: absolute; z-index: -1; right: -12vw; bottom: -8vh; width: 55vw; height: 48vh; opacity: 0.6; }
		.dash-panel { height: 38vh; }
		.mini-panel { display: none; }
		.editorial-main { display: block; padding-top: 22vh; }
		.issue { position: absolute; top: 12vh; right: 7vw; margin: 0; }
		.editorial-main .hero-copy { margin: 0; }
		.editorial-note { margin-top: 35px; max-width: 480px; }
		.editorial-line { display: none; }
		.poster-main h1, .brutal-main h1 { font-size: clamp(76px, 22vw, 150px); }
		.poster-meta { padding-top: 1vh; }
		.brutal-grid { grid-template-columns: 1fr auto; }
		.brutal-stats { display: none; }
		.radar { position: absolute; z-index: -1; right: -20vw; width: 75vw; opacity: 0.6; }
		.cinema-bottom { display: block; }
		.play-button { margin-top: 24px; }
		.cinema-stamp { display: none; }
	}

	@media (max-width: 540px) {
		.site-nav { padding-inline: 20px; }
		.site-main { padding-inline: 20px; }
		.site-footer { left: 20px; right: 20px; }
		.brand > span:last-child { display: none; }
		.lede { font-size: 14px; }
		.poster-bottom p { width: calc(100% - 80px); font-size: 12px; }
		.square-cta { width: 62px; }
		.brutal-grid { grid-template-columns: 1fr; }
		.brutal-grid > a { justify-self: start; }
		.dash-panel { padding: 20px; }
		.big-number { margin-top: 4vh; }
		.chart-bars { left: 20px; right: 20px; bottom: 20px; }
	}

	@media (prefers-reduced-motion: reduce) {
		.primary { transition: none; }
	}
</style>
