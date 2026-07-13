<script lang="ts">
	import { browser } from '$app/environment';
	import { ArrowUp, ArrowUpRight, ChevronLeft, ChevronRight, X } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import SiteExperience from '$lib/components/SiteExperience.svelte';
	import SitePreview from '$lib/components/SitePreview.svelte';
	import { siteBySlug, sites } from '$lib/sites';
	import type { ShowcaseSite } from '$lib/site-types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const filters = [
		{ name: '5.6 Sol', available: true },
		{ name: 'Fable 5', available: false },
		{ name: 'Grok 4.5', available: false }
	];

	let selected = $state<ShowcaseSite | null>(null);
	let filter = $state('5.6 Sol');
	let expandOrigin = $state<{ x: number; y: number; scaleX: number; scaleY: number } | null>(null);
	let collectionElement: HTMLElement;
	let filterSentinelElement: HTMLDivElement;
	let stickyBrandElement: HTMLDivElement;
	let showReturnToTop = $state(false);
	let filtersPinned = $state(false);
	let pullStartY: number | null = null;
	let pullDistance = 0;
	let wheelPull = 0;
	let wheelResetTimer: ReturnType<typeof setTimeout> | undefined;

	let visibleSites = $derived(sites);

	function syncFromHash() {
		if (!browser) return;
		const slug = window.location.hash.startsWith('#site/') ? window.location.hash.slice(6) : '';
		expandOrigin = null;
		selected = slug ? siteBySlug.get(slug) ?? null : null;
	}

	function openSite(site: ShowcaseSite, event: MouseEvent) {
		const trigger = event.currentTarget as HTMLElement;
		const preview = trigger.querySelector('.preview-window') as HTMLElement | null;
		const rect = (preview ?? trigger).getBoundingClientRect();
		expandOrigin = {
			x: rect.left,
			y: rect.top,
			scaleX: rect.width / window.innerWidth,
			scaleY: rect.height / window.innerHeight
		};
		selected = site;
		if (browser) history.pushState(null, '', `#site/${site.slug}`);
	}

	function closeSite() {
		pullStartY = null;
		pullDistance = 0;
		wheelPull = 0;
		if (wheelResetTimer) clearTimeout(wheelResetTimer);
		selected = null;
		expandOrigin = null;
		if (browser) history.pushState(null, '', window.location.pathname + window.location.search);
	}

	function handleViewerTouchStart(event: TouchEvent) {
		const viewerSite = event.currentTarget as HTMLDivElement;
		pullStartY = viewerSite.scrollTop <= 0 ? event.touches[0]?.clientY ?? null : null;
		pullDistance = 0;
	}

	function handleViewerTouchMove(event: TouchEvent) {
		const viewerSite = event.currentTarget as HTMLDivElement;
		if (pullStartY === null || viewerSite.scrollTop > 0) return;
		pullDistance = Math.max(0, (event.touches[0]?.clientY ?? pullStartY) - pullStartY);
		if (pullDistance >= 110) closeSite();
	}

	function handleViewerTouchEnd() {
		pullStartY = null;
		pullDistance = 0;
	}

	function handleViewerWheel(event: WheelEvent) {
		const viewerSite = event.currentTarget as HTMLDivElement;
		if (viewerSite.scrollTop > 0 || event.deltaY >= 0) {
			wheelPull = 0;
			return;
		}

		wheelPull += -event.deltaY;
		if (wheelResetTimer) clearTimeout(wheelResetTimer);
		wheelResetTimer = setTimeout(() => (wheelPull = 0), 180);
		if (wheelPull >= 180) closeSite();
	}

	function step(direction: number) {
		if (!selected) return;
		const current = sites.findIndex((site) => site.id === selected?.id);
		const next = sites[(current + direction + sites.length) % sites.length];
		selected = next;
		if (browser) history.replaceState(null, '', `#site/${next.slug}`);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!selected) return;
		if (event.key === 'Escape') closeSite();
		if (event.key === 'ArrowLeft') step(-1);
		if (event.key === 'ArrowRight') step(1);
	}

	onMount(() => {
		syncFromHash();
		window.addEventListener('hashchange', syncFromHash);
		return () => window.removeEventListener('hashchange', syncFromHash);
	});

	onMount(() => {
		let frame = 0;
		const measureStickyBrand = () => {
			if (!stickyBrandElement) return;
			stickyBrandElement.style.setProperty('--sticky-brand-width', `${stickyBrandElement.scrollWidth}px`);
		};
		const updateCollectionInset = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				if (!collectionElement) return;
				const collectionTop = collectionElement.offsetTop;
				const scrollPosition = Math.max(0, window.scrollY);
				showReturnToTop = scrollPosition > collectionTop;
				filtersPinned = filterSentinelElement?.getBoundingClientRect().top <= 0 && scrollPosition > 0;
				const rawProgress = Math.min(1, scrollPosition / Math.max(collectionTop, 1));
				const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
				const maximumInset = window.innerWidth <= 720
					? Math.min(12, Math.max(8, window.innerWidth * 0.03))
					: Math.min(36, Math.max(24, window.innerWidth * 0.02));
				const maximumRadius = window.innerWidth <= 720
					? 20
					: Math.min(34, Math.max(22, window.innerWidth * 0.02));
				collectionElement.style.setProperty('--collection-inset', `${maximumInset * (1 - progress)}px`);
				collectionElement.style.setProperty('--collection-radius', `${maximumRadius * (1 - progress)}px`);
			});
		};
		const updateLayout = () => {
			measureStickyBrand();
			updateCollectionInset();
		};

		updateLayout();
		window.addEventListener('scroll', updateCollectionInset, { passive: true });
		window.addEventListener('resize', updateLayout);
		return () => {
			cancelAnimationFrame(frame);
			window.removeEventListener('scroll', updateCollectionInset);
			window.removeEventListener('resize', updateLayout);
		};
	});

	$effect(() => {
		if (!browser) return;
		document.documentElement.style.overflow = selected ? 'hidden' : '';
		return () => (document.documentElement.style.overflow = '');
	});
</script>

<svelte:head>
	<title>100 Sites — Can AI create without repeating itself?</title>
	<meta name="description" content="One hundred generated websites testing how well leading models maintain visual quality, consistency, and originality." />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="100 Sites — Can AI create without repeating itself?" />
	<meta property="og:description" content="One hundred generated websites testing how well leading models maintain visual quality, consistency, and originality." />
	<meta property="og:image" content={`${data.origin}/og.png`} />
	<meta property="og:image:width" content="1728" />
	<meta property="og:image:height" content="972" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="100 Sites — Can AI create without repeating itself?" />
	<meta name="twitter:description" content="One hundred generated websites testing how well leading models maintain visual quality, consistency, and originality." />
	<meta name="twitter:image" content={`${data.origin}/og.png`} />
</svelte:head>

<svelte:window onkeydown={handleKeydown} />

<main class="gallery-shell">
	<section class="intro" id="top">
		<div class="intro-grid">
			<div class="hero-title">
				<h1>Can AI create without repeating itself?</h1>
			</div>
			<aside class="intro-aside">
				<p>One hundred generated websites testing how well leading models maintain visual quality, consistency, and originality.</p>
				<div class="profile-links" aria-label="Creator links">
					<a class="profile-pill x-profile" href="https://x.com/kianmckenn" target="_blank" rel="noreferrer" aria-label="Follow @kianmckenn on X">
						<span class="profile-icon"><svg class="x-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.9 2h3.7l-8.1 9.2L24 22h-7.4l-5.8-7.6L4.2 22H.5l8.6-9.8L0 2h7.6l5.2 6.9L18.9 2Zm-1.3 18.1h2L6.5 3.8H4.4l13.2 16.3Z" /></svg></span>
						<span class="profile-divider" aria-hidden="true">/</span>
						<span>kianmckenn</span>
					</a>
					<a class="profile-pill site-profile" href="https://kian.im" target="_blank" rel="noreferrer" aria-label="Visit Kian McKenna's personal website">
						<span class="profile-icon avatar-icon"><img src="/kian-avatar.png" alt="" /></span>
						<span class="profile-divider" aria-hidden="true">/</span>
						<span>Kian McKenna</span>
					</a>
				</div>
			</aside>
		</div>

	</section>

	<section class="collection" id="collection" bind:this={collectionElement}>
		<div class="collection-head">
			<div>
				<h2>The benchmark.</h2>
			</div>
		</div>

		<div class="filter-sticky-sentinel" bind:this={filterSentinelElement} aria-hidden="true"></div>
		<div class="filter-row" class:pinned={filtersPinned} aria-label="Choose benchmark model">
			<div class="sticky-brand" bind:this={stickyBrandElement} aria-hidden={!filtersPinned}>
				<span>Sitegeist</span>
				<i></i>
			</div>
			{#each filters as item}
				<button
					class:active={filter === item.name}
					disabled={!item.available}
					title={item.available ? item.name : `${item.name} benchmark coming soon`}
					onclick={() => (filter = item.name)}
				>{item.name}</button>
			{/each}
		</div>

		<div class="site-grid">
			{#each visibleSites as site (site.id)}
				<article class="site-card" style={`--delay:${(site.id % 8) * 35}ms`}>
					<button class="preview-button-wrap" onclick={(event) => openSite(site, event)} aria-label={`Open ${site.name}: ${site.tagline}`}>
						<div class="preview-window">
							<div class="window-chrome"><i></i><i></i><i></i><span>{site.slug}.studio</span></div>
							<div class="preview-viewport"><SitePreview {site} /></div>
							<div class="open-cue"><span>OPEN SITE</span><span class="cue-icon"><ArrowUpRight size={16} strokeWidth={2.2} /></span></div>
						</div>
					</button>
					<footer class="card-caption"><div><span>{String(site.id).padStart(3, '0')}</span><h3>{site.name}</h3></div><p>{site.category}</p></footer>
				</article>
			{/each}
		</div>

		<footer class="gallery-footer">
			<p>A study in style, repetition, and surprise.</p>
		</footer>
	</section>

	<a
		class="return-to-top"
		class:visible={showReturnToTop}
		href="#top"
		aria-label="Back to the top"
		title="Back to the top"
		aria-hidden={!showReturnToTop}
		tabindex={showReturnToTop ? 0 : -1}
	><ArrowUp size={20} strokeWidth={2.2} /></a>
</main>

{#if selected}
	<div
		class="viewer"
		class:from-card={Boolean(expandOrigin)}
		style={expandOrigin ? `--expand-x:${expandOrigin.x}px; --expand-y:${expandOrigin.y}px; --expand-scale-x:${expandOrigin.scaleX}; --expand-scale-y:${expandOrigin.scaleY};` : ''}
		role="dialog"
		aria-modal="true"
		aria-label={`${selected.name} website`}
	>
		<div
			class="viewer-site"
			role="document"
			onwheel={handleViewerWheel}
			ontouchstart={handleViewerTouchStart}
			ontouchmove={handleViewerTouchMove}
			ontouchend={handleViewerTouchEnd}
			ontouchcancel={handleViewerTouchEnd}
		>
			<SiteExperience site={selected} />
		</div>
		<div class="viewer-controls">
			<button class="close-control" onclick={closeSite} aria-label="Close site and return to gallery" title="Close"><X size={16} strokeWidth={2.2} /></button>
			<div class="viewer-id"><span>{String(selected.id).padStart(3, '0')}</span></div>
			<div class="right-controls">
				<button class="step-control" onclick={() => step(-1)} aria-label="Previous website" title="Previous site"><ChevronLeft size={19} strokeWidth={2.3} /></button>
				<button class="step-control" onclick={() => step(1)} aria-label="Next website" title="Next site"><ChevronRight size={19} strokeWidth={2.3} /></button>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(html) { scroll-behavior: smooth; }
	:global(body) { margin: 0; background: #f2f0e9; color: #10100f; }
	:global(*) { box-sizing: border-box; }
	:global(button), :global(a) { -webkit-tap-highlight-color: transparent; }

	.gallery-shell { --gallery-accent: rgba(56, 88, 233, 1); overflow: clip; background: #f2f0e9; font-family: 'Inter Variable', Inter, sans-serif; }
	.intro { position: relative; padding: 0 clamp(20px, 3vw, 48px); overflow: hidden; background: #f2f0e9; }

	.intro-grid { display: flex; flex-direction: column; align-items: center; gap: clamp(26px, 3.5vh, 38px); padding: clamp(54px, 8vh, 88px) 0 clamp(36px, 5vh, 54px); text-align: center; }
	.hero-title { width: 100%; min-width: 0; }
	.intro h1 { max-width: 10.5em; margin: 0 auto; font-family: 'EB Garamond', Garamond, Georgia, serif; font-size: clamp(64px, 6.6vw, 118px); font-weight: 500; line-height: 0.84; letter-spacing: -0.04em; text-wrap: balance; }
	.intro-aside { display: flex; max-width: 820px; flex-direction: column; align-items: center; gap: 20px; }
	.intro-aside p { margin: 0; font-size: clamp(15px, 1.12vw, 18px); line-height: 1.55; letter-spacing: -0.018em; text-wrap: balance; }
	.profile-links { display: flex; flex-wrap: wrap; justify-content: center; gap: 7px; }
	.profile-pill { display: inline-flex; height: 38px; align-items: center; gap: 8px; padding: 0 15px; border: 0; border-radius: 999px; color: #fff; font-size: 11px; font-weight: 650; text-decoration: none; transform-origin: center; transition: filter 160ms ease, transform 180ms cubic-bezier(.2,.8,.2,1); }
	.profile-pill:hover { filter: brightness(1.1); transform: scale(1.035); }
	.profile-pill:focus-visible { outline: 2px solid var(--gallery-accent); outline-offset: 2px; }
	.x-profile { background: #1b1c19; }
	.site-profile { background: var(--gallery-accent); }
	.profile-icon { display: grid; width: 16px; flex: none; place-items: center; }
	.profile-icon .x-mark { width: 14px; height: 14px; fill: currentColor; }
	.avatar-icon { width: 20px; height: 20px; overflow: hidden; border-radius: 50%; background: #fff; }
	.avatar-icon img { display: block; width: 100%; height: 100%; object-fit: cover; }
	.profile-divider { opacity: 0.32; font-weight: 500; }

	.collection { margin: 0 var(--collection-inset, clamp(24px, 2vw, 36px)); padding: clamp(24px, 3vw, 34px) clamp(24px, 3vw, 34px) 0; border-radius: var(--collection-radius, clamp(22px, 2vw, 34px)) var(--collection-radius, clamp(22px, 2vw, 34px)) 0 0; background: #111210; color: #f3f1e9; will-change: margin-inline, border-radius; }
	.collection-head { padding-bottom: 8px; }
	.collection h2 { margin: 0; font-size: clamp(36px, 3.7vw, 58px); font-weight: 610; line-height: 0.9; letter-spacing: -0.065em; }

	.filter-sticky-sentinel { height: 0; }
	.filter-row { position: sticky; z-index: 40; top: 0; display: flex; align-items: center; gap: 8px; margin: 0 clamp(-34px, -3vw, -24px); padding: 12px clamp(24px, 3vw, 34px) 14px; overflow-x: auto; background: #111210; scrollbar-width: none; }
	.filter-row::-webkit-scrollbar { display: none; }
	.sticky-brand { display: flex; width: 0; flex: none; align-items: center; gap: 8px; overflow: hidden; color: #f3f1e9; opacity: 0; transform: translateX(-6px); transition: width 620ms cubic-bezier(.16,1,.3,1), opacity 420ms ease, transform 620ms cubic-bezier(.16,1,.3,1); }
	.sticky-brand span { flex: none; font-size: 15px; font-weight: 650; letter-spacing: -0.035em; }
	.sticky-brand i { width: 1px; height: 22px; flex: none; background: #474843; }
	.filter-row.pinned .sticky-brand { width: var(--sticky-brand-width, 78px); opacity: 1; transform: translateX(0); }
	.filter-row button { display: inline-flex; flex: none; align-items: center; padding: 10px 15px; border: 1px solid #474843; border-radius: 99px; background: transparent; color: #a3a59d; font: 600 11px/1 'Inter Variable', Inter, sans-serif; letter-spacing: -0.015em; cursor: pointer; transition: background 180ms ease, color 180ms ease, border-color 180ms ease; }
	.filter-row button:hover, .filter-row button.active { border-color: #f3f1e9; background: #f3f1e9; color: #111210; }
	.filter-row button:disabled { opacity: 0.42; cursor: not-allowed; }
	.filter-row button:disabled:hover { border-color: #474843; background: transparent; color: #a3a59d; }

	.site-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: clamp(16px, 2vw, 32px); row-gap: clamp(45px, 6vw, 88px); }
	.site-card { min-width: 0; }
	.preview-button-wrap { display: block; width: 100%; padding: 0; border: 0; background: transparent; color: inherit; text-align: left; cursor: pointer; }
	.preview-window { position: relative; overflow: hidden; border-radius: 7px; background: #292a27; box-shadow: 0 18px 42px rgba(0, 0, 0, 0.25); transition: transform 350ms cubic-bezier(.2,.8,.2,1), box-shadow 350ms ease; }
	.preview-button-wrap:hover .preview-window, .preview-button-wrap:focus-visible .preview-window { transform: translateY(-9px) rotate(-0.35deg); box-shadow: 0 32px 70px rgba(0, 0, 0, 0.42); }
	.preview-button-wrap:focus-visible { outline: 2px solid var(--gallery-accent); outline-offset: 4px; }
	.window-chrome { display: flex; align-items: center; gap: 5px; height: 24px; padding: 0 9px; background: #e7e5dd; color: #111; }
	.window-chrome i { width: 5px; height: 5px; border-radius: 50%; background: #aaa79e; }
	.window-chrome i:first-child { background: #ff5b3a; }
	.window-chrome span { margin-left: auto; margin-right: auto; transform: translateX(-10px); color: #77746d; font: 600 6px/1 ui-monospace, monospace; letter-spacing: 0.03em; }
	.preview-viewport { height: clamp(230px, 24vw, 360px); }
	.open-cue { position: absolute; z-index: 20; inset: 24px 0 0; display: flex; align-items: center; justify-content: center; gap: 10px; background: rgba(17, 18, 16, 0.7); color: #fff; font: 650 11px/1 'Inter Variable', Inter, sans-serif; letter-spacing: 0.035em; opacity: 0; backdrop-filter: blur(8px) saturate(90%); transition: opacity 220ms ease; }
	.cue-icon { display: grid; width: 32px; aspect-ratio: 1; place-items: center; border-radius: 50%; background: var(--gallery-accent); color: #fff; }
	.preview-button-wrap:hover .open-cue, .preview-button-wrap:focus-visible .open-cue { opacity: 1; }
	.card-caption { display: flex; align-items: start; justify-content: space-between; gap: 15px; padding-top: 15px; }
	.card-caption > div { display: flex; align-items: baseline; gap: 11px; min-width: 0; }
	.card-caption span { flex: none; color: #74766f; font: 700 8px ui-monospace, monospace; }
	.card-caption h3 { margin: 0; overflow: hidden; font-size: 16px; font-weight: 650; letter-spacing: -0.035em; text-overflow: ellipsis; white-space: nowrap; }
	.card-caption p { flex: none; margin: 2px 0 0; color: #85877f; font: 700 8px/1 ui-monospace, monospace; letter-spacing: 0.07em; text-transform: uppercase; }

	.gallery-footer { margin-top: 80px; padding: 40px 0 50px; }
	.gallery-footer p { margin: 0; font-size: clamp(42px, 6vw, 90px); font-weight: 600; line-height: 0.88; letter-spacing: -0.07em; }
	.return-to-top { position: fixed; z-index: 80; right: clamp(16px, 2vw, 28px); bottom: clamp(16px, 2vw, 28px); display: inline-flex; width: 48px; height: 48px; align-items: center; justify-content: center; border-radius: 50%; background: #f3f1e9; color: #111210; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18); text-decoration: none; opacity: 0; visibility: hidden; transform: translateY(10px) scale(0.92); pointer-events: none; transition: opacity 240ms ease, visibility 0s linear 240ms, transform 320ms cubic-bezier(.2,.8,.2,1), background 180ms ease; }
	.return-to-top.visible { opacity: 1; visibility: visible; transform: translateY(0) scale(1); pointer-events: auto; transition-delay: 0s; }
	.return-to-top:hover { background: #fff; transform: translateY(-3px) scale(1); }
	.return-to-top:focus-visible { outline: 2px solid var(--gallery-accent); outline-offset: 3px; }

	.viewer { position: fixed; z-index: 1000; inset: 0; overflow: hidden; background: #0c0c0b; }
	.viewer-site { height: 100%; overflow: auto; overscroll-behavior: contain; }
	.viewer.from-card .viewer-site { transform-origin: top left; animation: site-expand 640ms cubic-bezier(0.22, 1, 0.36, 1) both; will-change: transform, border-radius, box-shadow; }
	.viewer.from-card .viewer-controls { animation: toolbar-enter 220ms ease 430ms both; }
	@keyframes site-expand {
		0% { border-radius: 7px; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45); transform: translate(var(--expand-x), var(--expand-y)) scale(var(--expand-scale-x), var(--expand-scale-y)); }
		65% { border-radius: 3px; }
		100% { border-radius: 0; box-shadow: none; transform: translate(0, 0) scale(1); }
	}
	@keyframes toolbar-enter {
		from { opacity: 0; transform: translate(-50%, 10px) scale(0.96); }
		to { opacity: 1; transform: translate(-50%, 0) scale(1); }
	}
	.viewer-controls { position: fixed; z-index: 1100; left: 50%; bottom: 14px; display: flex; width: max-content; max-width: calc(100vw - 24px); align-items: center; justify-content: center; gap: 2px; padding: 4px; border: 1px solid rgba(255, 255, 255, 0.13); border-radius: 999px; background: rgba(20, 20, 19, 0.94); color: #fff; box-shadow: 0 14px 44px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08); backdrop-filter: blur(18px) saturate(140%); transform: translateX(-50%); pointer-events: auto; }
	.viewer-controls button, .viewer-id { height: 34px; border: 0; border-radius: 999px; background: transparent; color: #fff; box-shadow: none; pointer-events: auto; }
	.viewer-controls button { transition: background 160ms ease, color 160ms ease; }
	.viewer-controls button:hover, .viewer-controls button:focus-visible { background: rgba(255, 255, 255, 0.1); }
	.viewer-controls button:focus-visible { outline: 1px solid rgba(255, 255, 255, 0.7); outline-offset: -1px; }
	.close-control { display: grid; width: 34px; place-items: center; margin-right: 4px; padding: 0; background: #fff !important; color: #111 !important; box-shadow: 5px 0 0 -4px rgba(255, 255, 255, 0.18) !important; cursor: pointer; }
	.viewer-id { display: flex; align-items: center; margin-right: 2px; padding: 0 13px 0 10px; border-radius: 0; box-shadow: 1px 0 0 rgba(255, 255, 255, 0.14); font: 750 11px/1 ui-monospace, monospace; pointer-events: none; }
	.right-controls { display: flex; gap: 2px; pointer-events: auto; }
	.right-controls button { display: grid; min-width: 32px; padding: 0; place-items: center; cursor: pointer; }
	.right-controls .step-control { min-width: 35px; }

	@media (max-width: 1500px) {
		.intro h1 { font-size: clamp(64px, 6.8vw, 102px); }
	}

	@media (max-width: 1040px) {
		.site-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.preview-viewport { height: clamp(250px, 34vw, 370px); }
	}

	@media (max-width: 720px) {
		.collection { --collection-inset: clamp(8px, 3vw, 12px); --collection-radius: 20px; }
		.intro-grid { gap: 24px; padding: 42px 0 30px; }
		.intro h1 { font-size: clamp(48px, 12vw, 64px); line-height: 0.86; }
		.intro-aside { gap: 18px; }
		.collection-head { padding-bottom: 8px; }
		.collection h2 { font-size: clamp(38px, 9vw, 52px); }
		.filter-row { padding-top: 11px; padding-bottom: 13px; }
		.site-grid { grid-template-columns: 1fr; row-gap: 55px; }
		.preview-viewport { height: clamp(280px, 71vw, 460px); }
		.card-caption h3 { font-size: 18px; }
	}

	@media (max-width: 430px) {
		.preview-viewport { height: 280px; }
		.card-caption p { display: none; }
		.viewer-controls { bottom: 8px; max-width: calc(100vw - 12px); }
		.viewer-id { padding-inline: 9px 11px; }
		.right-controls button { min-width: 30px; }
		.right-controls .step-control { min-width: 33px; }
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html) { scroll-behavior: auto; }
		.preview-window, .open-cue, .return-to-top, .sticky-brand { transition: none; }
		.viewer.from-card .viewer-site, .viewer.from-card .viewer-controls { animation: none; }
	}
</style>
