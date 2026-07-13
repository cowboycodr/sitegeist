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
	const PAGE_THEME_COLOR = 'rgb(242, 240, 233)';
	const SHELL_THEME_COLOR = 'rgb(17, 18, 16)';

	type PreviewPointerGesture = {
		pointerId: number;
		trigger: HTMLElement;
		startX: number;
		startY: number;
		startScrollY: number;
		blocked: boolean;
	};

	type PullGesture = {
		identifier: number;
		phase: 'pending' | 'dragging';
		startX: number;
		startY: number;
		rawY: number;
		renderedY: number;
		viewportHeight: number;
		scale: number;
		backdropOpacity: number;
		controlsOpacity: number;
		controlsOffset: number;
		surfaceTransform: string;
		controlsTransform: string;
		samples: Array<{ y: number; time: number }>;
		frame: number;
	};

	let selected = $state<ShowcaseSite | null>(null);
	let filter = $state('5.6 Sol');
	let expandOrigin = $state<{ x: number; y: number; scaleX: number; scaleY: number } | null>(null);
	let collectionElement: HTMLElement;
	let collectionTopSentinelElement: HTMLDivElement;
	let filterSentinelElement: HTMLDivElement;
	let filterRowElement: HTMLDivElement;
	let stickyBrandElement: HTMLDivElement;
	let shellMasksElement: HTMLDivElement;
	let viewerEntryElement = $state<HTMLDivElement>();
	let viewerSurfaceElement = $state<HTMLDivElement>();
	let viewerSiteElement = $state<HTMLDivElement>();
	let viewerBackdropElement = $state<HTMLDivElement>();
	let viewerControlsElement = $state<HTMLDivElement>();
	let showReturnToTop = $state(false);
	let filtersPinned = $state(false);
	let shellThemeActive = $state(false);
	let viewerGesturePrepared = $state(false);
	let viewerDragActive = $state(false);
	let viewerSettling = $state(false);
	let wheelPull = 0;
	let wheelResetTimer: ReturnType<typeof setTimeout> | undefined;
	let previewPointerGesture: PreviewPointerGesture | null = null;
	let blockedPreviewTrigger: HTMLElement | null = null;
	let blockedPreviewUntil = 0;
	let pullGesture: PullGesture | null = null;
	let viewerAnimations: Animation[] = [];
	let viewerGestureSequence = 0;

	let visibleSites = $derived(sites);
	let themeColor = $derived(Boolean(selected) || shellThemeActive ? SHELL_THEME_COLOR : PAGE_THEME_COLOR);

	const clamp = (minimum: number, value: number, maximum: number) =>
		Math.min(maximum, Math.max(minimum, value));

	function findTouch(touches: TouchList, identifier: number) {
		for (let index = 0; index < touches.length; index += 1) {
			const touch = touches.item(index);
			if (touch?.identifier === identifier) return touch;
		}
		return null;
	}

	function stopViewerAnimations() {
		viewerGestureSequence += 1;
		for (const animation of viewerAnimations) animation.cancel();
		viewerAnimations = [];
	}

	function clearPullGesture() {
		if (pullGesture?.frame) cancelAnimationFrame(pullGesture.frame);
		pullGesture = null;
		viewerGesturePrepared = false;
	}

	function clearViewerGestureStyles() {
		viewerSurfaceElement?.style.removeProperty('transform');
		viewerBackdropElement?.style.removeProperty('opacity');
		viewerControlsElement?.style.removeProperty('opacity');
		viewerControlsElement?.style.removeProperty('transform');
		viewerDragActive = false;
		viewerSettling = false;
	}

	function resetViewerGesture() {
		stopViewerAnimations();
		clearPullGesture();
		clearViewerGestureStyles();
	}

	function syncFromHash() {
		if (!browser) return;
		const slug = window.location.hash.startsWith('#site/') ? window.location.hash.slice(6) : '';
		resetViewerGesture();
		expandOrigin = null;
		selected = slug ? siteBySlug.get(slug) ?? null : null;
	}

	function openSite(site: ShowcaseSite, event: MouseEvent) {
		const trigger = event.currentTarget as HTMLElement;
		if (
			event.detail !== 0 &&
			blockedPreviewTrigger === trigger &&
			performance.now() < blockedPreviewUntil
		) {
			event.preventDefault();
			event.stopPropagation();
			blockedPreviewTrigger = null;
			return;
		}

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

	function handlePreviewPointerDown(event: PointerEvent) {
		// A new intentional interaction supersedes any synthesized click we were waiting to suppress.
		blockedPreviewTrigger = null;
		if (event.pointerType !== 'touch' || !event.isPrimary) return;
		previewPointerGesture = {
			pointerId: event.pointerId,
			trigger: event.currentTarget as HTMLElement,
			startX: event.clientX,
			startY: event.clientY,
			startScrollY: window.scrollY,
			blocked: false
		};
	}

	function handlePreviewPointerMove(event: PointerEvent) {
		const gesture = previewPointerGesture;
		if (!gesture || gesture.pointerId !== event.pointerId) return;
		const moved = Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) > 9;
		const scrolled = Math.abs(window.scrollY - gesture.startScrollY) > 2;
		if (moved || scrolled) gesture.blocked = true;
	}

	function finishPreviewPointer(event: PointerEvent, cancelled = false) {
		const gesture = previewPointerGesture;
		if (!gesture || gesture.pointerId !== event.pointerId) return;
		const moved = Math.hypot(event.clientX - gesture.startX, event.clientY - gesture.startY) > 9;
		const scrolled = Math.abs(window.scrollY - gesture.startScrollY) > 2;
		if (gesture.blocked || moved || scrolled || cancelled) {
			blockedPreviewTrigger = gesture.trigger;
			// Safari may cancel the pointer as soon as scrolling begins, long before the finger lifts.
			// Keep that click blocked until the next pointerdown rather than expiring mid-scroll.
			blockedPreviewUntil = cancelled ? Number.POSITIVE_INFINITY : performance.now() + 700;
		}
		previewPointerGesture = null;
	}

	function handlePreviewPointerUp(event: PointerEvent) {
		finishPreviewPointer(event);
	}

	function handlePreviewPointerCancel(event: PointerEvent) {
		finishPreviewPointer(event, true);
	}

	function completeCloseSite() {
		clearPullGesture();
		viewerDragActive = false;
		viewerSettling = false;
		wheelPull = 0;
		if (wheelResetTimer) clearTimeout(wheelResetTimer);
		selected = null;
		expandOrigin = null;
		if (browser) history.pushState(null, '', window.location.pathname + window.location.search);
	}

	function closeSite() {
		resetViewerGesture();
		completeCloseSite();
	}

	function activatePullGesture(gesture: PullGesture) {
		gesture.phase = 'dragging';
		expandOrigin = null;
		for (const animation of viewerEntryElement?.getAnimations() ?? []) animation.cancel();
		for (const animation of viewerControlsElement?.getAnimations() ?? []) animation.cancel();
		viewerDragActive = true;
	}

	function renderPullGesture() {
		const gesture = pullGesture;
		if (
			!gesture ||
			gesture.phase !== 'dragging' ||
			!viewerSurfaceElement ||
			!viewerBackdropElement ||
			!viewerControlsElement
		) return;
		gesture.frame = 0;
		const linearLimit = gesture.viewportHeight * 0.36;
		const distance = gesture.rawY <= linearLimit
			? gesture.rawY
			: linearLimit + (gesture.rawY - linearLimit) * 0.32;
		const progress = Math.min(1, distance / (gesture.viewportHeight * 0.42));
		const easedProgress = progress * progress * (3 - 2 * progress);
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		gesture.renderedY = distance;
		gesture.scale = reducedMotion ? 1 : 1 - easedProgress * 0.035;
		gesture.backdropOpacity = reducedMotion ? 1 : 1 - easedProgress * 0.82;
		gesture.controlsOpacity = reducedMotion ? 1 : Math.max(0, 1 - progress * 1.7);
		gesture.controlsOffset = reducedMotion ? 0 : Math.min(22, distance * 0.075);
		gesture.surfaceTransform = `translate3d(0, ${distance}px, 0) scale(${gesture.scale})`;
		gesture.controlsTransform = `translate3d(-50%, ${gesture.controlsOffset}px, 0) scale(${1 - easedProgress * 0.025})`;

		viewerSurfaceElement.style.transform = gesture.surfaceTransform;
		viewerBackdropElement.style.opacity = String(gesture.backdropOpacity);
		viewerControlsElement.style.opacity = String(gesture.controlsOpacity);
		viewerControlsElement.style.transform = gesture.controlsTransform;
	}

	function requestPullGestureRender() {
		if (!pullGesture || pullGesture.frame) return;
		pullGesture.frame = requestAnimationFrame(renderPullGesture);
	}

	function handleViewerTouchStart(event: TouchEvent) {
		if (viewerSettling || event.touches.length !== 1 || !viewerSiteElement || viewerSiteElement.scrollTop > 1) return;
		const touch = event.changedTouches.item(0);
		if (!touch) return;
		stopViewerAnimations();
		clearPullGesture();
		pullGesture = {
			identifier: touch.identifier,
			phase: 'pending',
			startX: touch.clientX,
			startY: touch.clientY,
			rawY: 0,
			renderedY: 0,
			viewportHeight: Math.max(1, window.innerHeight),
			scale: 1,
			backdropOpacity: 1,
			controlsOpacity: 1,
			controlsOffset: 0,
			surfaceTransform: 'translate3d(0, 0, 0) scale(1)',
			controlsTransform: 'translate3d(-50%, 0, 0) scale(1)',
			samples: [{ y: 0, time: event.timeStamp }],
			frame: 0
		};
		// Give WebKit the touch-slop window to promote the full-screen surface before it moves.
		viewerGesturePrepared = true;
	}

	function handleViewerTouchMove(event: TouchEvent) {
		const gesture = pullGesture;
		if (!gesture || !viewerSiteElement) return;
		if (event.touches.length !== 1) {
			if (gesture.phase === 'dragging') void settlePullGesture(false);
			else clearPullGesture();
			return;
		}

		const touch = findTouch(event.touches, gesture.identifier);
		if (!touch) return;
		const deltaX = touch.clientX - gesture.startX;
		const deltaY = touch.clientY - gesture.startY;
		if (gesture.phase === 'pending') {
			const movement = Math.hypot(deltaX, deltaY);
			if (movement < 9) return;
			if (deltaY <= 0 || deltaY <= Math.abs(deltaX) * 1.15 || viewerSiteElement.scrollTop > 1) {
				clearPullGesture();
				return;
			}
			activatePullGesture(gesture);
		}

		event.preventDefault();
		gesture.rawY = Math.max(0, deltaY);
		gesture.samples.push({ y: gesture.rawY, time: event.timeStamp });
		while (gesture.samples.length > 2 && gesture.samples[0].time < event.timeStamp - 120) {
			gesture.samples.shift();
		}
		requestPullGestureRender();
	}

	async function settlePullGesture(shouldDismiss: boolean) {
		const gesture = pullGesture;
		if (
			!gesture ||
			gesture.phase !== 'dragging' ||
			viewerSettling ||
			!viewerSurfaceElement ||
			!viewerBackdropElement ||
			!viewerControlsElement
		) return;
		if (gesture.frame) {
			cancelAnimationFrame(gesture.frame);
			gesture.frame = 0;
			renderPullGesture();
		}

		stopViewerAnimations();
		const sequence = viewerGestureSequence;
		viewerDragActive = false;
		viewerSettling = true;
		const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reducedMotion) {
			if (shouldDismiss) completeCloseSite();
			else {
				clearPullGesture();
				clearViewerGestureStyles();
			}
			return;
		}

		const samples = gesture.samples;
		const firstSample = samples[0];
		const lastSample = samples[samples.length - 1];
		const elapsed = Math.max(1, lastSample.time - firstSample.time);
		const velocity = Math.max(0, (lastSample.y - firstSample.y) / elapsed);
		const offscreenY = gesture.viewportHeight + 48;
		const targetSurfaceTransform = shouldDismiss
			? `translate3d(0, ${offscreenY}px, 0) scale(${Math.max(0.93, gesture.scale - 0.012)})`
			: 'translate3d(0, 0, 0) scale(1)';
		const targetControlsTransform = shouldDismiss
			? 'translate3d(-50%, 28px, 0) scale(0.96)'
			: 'translate3d(-50%, 0, 0) scale(1)';
		const duration = shouldDismiss
			? clamp(220, (offscreenY - gesture.renderedY) / Math.max(velocity, 1.8), 390)
			: clamp(280, 300 + gesture.renderedY * 0.18, 380);
		const easing = shouldDismiss
			? 'cubic-bezier(.22,1,.36,1)'
			: 'cubic-bezier(.2,.85,.25,1)';

		const surfaceAnimation = viewerSurfaceElement.animate(
			[
				{ transform: gesture.surfaceTransform },
				{ transform: targetSurfaceTransform }
			],
			{ duration, easing, fill: 'forwards' }
		);
		const backdropAnimation = viewerBackdropElement.animate(
			[
				{ opacity: gesture.backdropOpacity },
				{ opacity: shouldDismiss ? 0 : 1 }
			],
			{ duration, easing, fill: 'forwards' }
		);
		const controlsAnimation = viewerControlsElement.animate(
			[
				{ opacity: gesture.controlsOpacity, transform: gesture.controlsTransform },
				{ opacity: shouldDismiss ? 0 : 1, transform: targetControlsTransform }
			],
			{ duration: Math.min(duration, 320), easing, fill: 'forwards' }
		);
		viewerAnimations = [surfaceAnimation, backdropAnimation, controlsAnimation];

		try {
			await surfaceAnimation.finished;
		} catch {
			return;
		}
		if (sequence !== viewerGestureSequence) return;
		if (shouldDismiss) {
			viewerAnimations = [];
			completeCloseSite();
		} else {
			for (const animation of viewerAnimations) animation.cancel();
			viewerAnimations = [];
			clearPullGesture();
			clearViewerGestureStyles();
		}
	}

	function handleViewerTouchEnd(event: TouchEvent) {
		const gesture = pullGesture;
		if (!gesture) return;
		const touch = findTouch(event.changedTouches, gesture.identifier);
		if (!touch) return;
		if (gesture.phase !== 'dragging') {
			clearPullGesture();
			return;
		}

		gesture.rawY = Math.max(0, touch.clientY - gesture.startY);
		gesture.samples.push({ y: gesture.rawY, time: event.timeStamp });
		while (gesture.samples.length > 2 && gesture.samples[0].time < event.timeStamp - 120) {
			gesture.samples.shift();
		}
		const firstSample = gesture.samples[0];
		const lastSample = gesture.samples[gesture.samples.length - 1];
		const velocity = Math.max(0, (lastSample.y - firstSample.y) / Math.max(1, lastSample.time - firstSample.time));
		const projectedY = gesture.rawY + velocity * 160;
		const threshold = Math.min(180, gesture.viewportHeight * 0.24);
		const fastFlick = velocity > 0.75 && gesture.rawY > 44;
		void settlePullGesture(fastFlick || projectedY >= threshold);
	}

	function handleViewerTouchCancel() {
		if (pullGesture?.phase === 'dragging') void settlePullGesture(false);
		else clearPullGesture();
	}

	function pullToDismiss(node: HTMLDivElement) {
		node.addEventListener('touchstart', handleViewerTouchStart, { passive: true });
		node.addEventListener('touchmove', handleViewerTouchMove, { passive: false });
		node.addEventListener('touchend', handleViewerTouchEnd, { passive: true });
		node.addEventListener('touchcancel', handleViewerTouchCancel, { passive: true });
		return {
			destroy() {
				node.removeEventListener('touchstart', handleViewerTouchStart);
				node.removeEventListener('touchmove', handleViewerTouchMove);
				node.removeEventListener('touchend', handleViewerTouchEnd);
				node.removeEventListener('touchcancel', handleViewerTouchCancel);
				stopViewerAnimations();
				clearPullGesture();
			}
		};
	}

	function handleViewerWheel(event: WheelEvent) {
		if (viewerSettling) return;
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
		if (!selected || viewerSettling) return;
		resetViewerGesture();
		expandOrigin = null;
		const current = sites.findIndex((site) => site.id === selected?.id);
		const next = sites[(current + direction + sites.length) % sites.length];
		selected = next;
		if (browser) history.replaceState(null, '', `#site/${next.slug}`);
	}

	function handleKeydown(event: KeyboardEvent) {
		if (!selected || viewerSettling) return;
		if (event.key === 'Escape') closeSite();
		if (event.key === 'ArrowLeft') step(-1);
		if (event.key === 'ArrowRight') step(1);
	}

	onMount(() => {
		const syncNavigation = () => {
			syncFromHash();
			if (!collectionElement) return;
			const collectionTop = collectionElement.getBoundingClientRect().top + window.scrollY;
			shellThemeActive = window.scrollY >= collectionTop;
		};

		syncNavigation();
		window.addEventListener('hashchange', syncNavigation);
		window.addEventListener('popstate', syncNavigation);
		window.addEventListener('pageshow', syncNavigation);
		return () => {
			window.removeEventListener('hashchange', syncNavigation);
			window.removeEventListener('popstate', syncNavigation);
			window.removeEventListener('pageshow', syncNavigation);
		};
	});

	onMount(() => {
		let frame = 0;
		let framePending = false;
		let lastRawProgress = -1;
		let lastViewportWidth = -1;
		let collectionTop = 1;
		let isMobileLayout = window.innerWidth <= 720;
		let listeningForScroll = false;
		let mounted = true;
		const shellSides = Array.from(collectionElement.querySelectorAll<HTMLElement>('.collection-shell-side'));
		const shellCorners = Array.from(collectionElement.querySelectorAll<HTMLElement>('.collection-shell-corner'));
		const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		const supportsNativeScrollTimeline =
			CSS.supports('animation-timeline: scroll(root block)') &&
			CSS.supports('animation-range: 0px 1px');
		const usesNativeScrollTimeline = () =>
			isMobileLayout && !prefersReducedMotion && supportsNativeScrollTimeline;

		const setMobileShellProgress = (rawProgress: number) => {
			const clampedProgress = Math.min(1, Math.max(0, rawProgress));
			if (Math.abs(clampedProgress - lastRawProgress) <= 0.0001) return;
			const easedProgress = clampedProgress * clampedProgress * (3 - 2 * clampedProgress);
			const remaining = 1 - easedProgress;
			for (const side of shellSides) side.style.transform = `scaleX(${remaining})`;
			for (const corner of shellCorners) corner.style.transform = `scale(${remaining})`;
			lastRawProgress = clampedProgress;
		};

		const setDesktopShellProgress = (rawProgress: number) => {
			const clampedProgress = Math.min(1, Math.max(0, rawProgress));
			if (Math.abs(clampedProgress - lastRawProgress) <= 0.0001) return;
			const easedProgress = clampedProgress * clampedProgress * (3 - 2 * clampedProgress);
			const maximumInset = Math.min(36, Math.max(24, window.innerWidth * 0.02));
			const maximumRadius = Math.min(34, Math.max(22, window.innerWidth * 0.02));
			collectionElement.style.setProperty('--collection-inset', `${maximumInset * (1 - easedProgress)}px`);
			collectionElement.style.setProperty('--collection-radius', `${maximumRadius * (1 - easedProgress)}px`);
			lastRawProgress = clampedProgress;
		};

		const updateShell = () => {
			framePending = false;
			const rawProgress = Math.max(0, window.scrollY) / Math.max(collectionTop, 1);
			if (isMobileLayout) setMobileShellProgress(rawProgress);
			else setDesktopShellProgress(rawProgress);
		};

		const requestShellUpdate = () => {
			if (framePending || usesNativeScrollTimeline() || (prefersReducedMotion && isMobileLayout)) return;
			if (window.scrollY >= collectionTop && lastRawProgress >= 1) return;
			framePending = true;
			frame = requestAnimationFrame(updateShell);
		};

		const syncScrollListener = () => {
			const shouldListen = !usesNativeScrollTimeline() && (!prefersReducedMotion || !isMobileLayout);
			if (shouldListen && !listeningForScroll) {
				window.addEventListener('scroll', requestShellUpdate, { passive: true });
				listeningForScroll = true;
			} else if (!shouldListen && listeningForScroll) {
				window.removeEventListener('scroll', requestShellUpdate);
				listeningForScroll = false;
			}
		};

		const measureLayout = (force = false) => {
			const viewportWidth = Math.round(window.innerWidth);
			if (!force && viewportWidth === lastViewportWidth) return;

			// Keep all geometry reads together so none of the writes below can force a second layout.
			const scrollPosition = Math.max(0, window.scrollY);
			const measuredCollectionTop = collectionElement.getBoundingClientRect().top + scrollPosition;
			const filterStickyStart = filterSentinelElement.getBoundingClientRect().top + scrollPosition;
			const stickyBrandWidth = Math.ceil(stickyBrandElement.getBoundingClientRect().width);

			cancelAnimationFrame(frame);
			framePending = false;
			collectionTop = Math.max(1, measuredCollectionTop);
			lastViewportWidth = viewportWidth;
			isMobileLayout = viewportWidth <= 720;
			filterRowElement.style.setProperty('--sticky-brand-shift', `${stickyBrandWidth + 8}px`);
			shellMasksElement.style.setProperty('--shell-scroll-end', `${collectionTop}px`);
			showReturnToTop = scrollPosition > collectionTop;
			shellThemeActive = scrollPosition >= collectionTop;
			filtersPinned = scrollPosition >= filterStickyStart;
			lastRawProgress = -1;

			if (isMobileLayout) {
				collectionElement.style.removeProperty('--collection-inset');
				collectionElement.style.removeProperty('--collection-radius');
			}
			if (usesNativeScrollTimeline()) {
				for (const mask of [...shellSides, ...shellCorners]) mask.style.removeProperty('transform');
			} else {
				const initialProgress = prefersReducedMotion && isMobileLayout ? 1 : scrollPosition / collectionTop;
				if (isMobileLayout) setMobileShellProgress(initialProgress);
				else setDesktopShellProgress(initialProgress);
			}
			syncScrollListener();
		};

		const sentinelObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					const hasPassedViewportTop = !entry.isIntersecting && entry.boundingClientRect.top < 0;
					if (entry.target === collectionTopSentinelElement) {
						if (showReturnToTop !== hasPassedViewportTop) showReturnToTop = hasPassedViewportTop;
						if (shellThemeActive !== hasPassedViewportTop) shellThemeActive = hasPassedViewportTop;
					}
					if (entry.target === filterSentinelElement && filtersPinned !== hasPassedViewportTop) {
						filtersPinned = hasPassedViewportTop;
					}
				}
			},
			{ threshold: 0 }
		);

		sentinelObserver.observe(collectionTopSentinelElement);
		sentinelObserver.observe(filterSentinelElement);
		measureLayout(true);
		const handleResize = () => measureLayout();
		window.addEventListener('resize', handleResize);
		void document.fonts?.ready.then(() => {
			if (mounted) measureLayout(true);
		});

		return () => {
			mounted = false;
			cancelAnimationFrame(frame);
			sentinelObserver.disconnect();
			window.removeEventListener('scroll', requestShellUpdate);
			window.removeEventListener('resize', handleResize);
		};
	});

	$effect(() => {
		if (!browser) return;
		document.documentElement.style.overflow = selected ? 'hidden' : '';
		return () => (document.documentElement.style.overflow = '');
	});

	$effect(() => {
		if (!browser) return;
		const previousHtmlBackground = document.documentElement.style.backgroundColor;
		const previousBodyBackground = document.body.style.backgroundColor;
		document.documentElement.style.backgroundColor = themeColor;
		document.body.style.backgroundColor = themeColor;
		return () => {
			document.documentElement.style.backgroundColor = previousHtmlBackground;
			document.body.style.backgroundColor = previousBodyBackground;
		};
	});
</script>

<svelte:head>
	<title>100 Sites — Can AI create without repeating itself?</title>
	<meta name="description" content="One hundred generated websites testing how well leading models maintain visual quality, consistency, and originality." />
	<meta name="theme-color" content={themeColor} />
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
		<div class="collection-shell-masks" bind:this={shellMasksElement} aria-hidden="true">
			<i class="collection-shell-side left"></i>
			<i class="collection-shell-side right"></i>
			<i class="collection-shell-corner left"></i>
			<i class="collection-shell-corner right"></i>
		</div>
		<div class="collection-top-sentinel" bind:this={collectionTopSentinelElement} aria-hidden="true"></div>

		<div class="collection-head">
			<div>
				<h2>The benchmark.</h2>
			</div>
		</div>

		<div class="filter-sticky-sentinel" bind:this={filterSentinelElement} aria-hidden="true"></div>
		<div class="filter-row" class:pinned={filtersPinned} bind:this={filterRowElement} aria-label="Choose benchmark model">
			<div class="filter-track">
				<div class="sticky-brand" bind:this={stickyBrandElement} aria-hidden={!filtersPinned}>
					<span>Sitegeist</span>
					<i></i>
				</div>
				<div class="filter-buttons">
					{#each filters as item}
						<button
							class:active={filter === item.name}
							disabled={!item.available}
							title={item.available ? item.name : `${item.name} benchmark coming soon`}
							onclick={() => (filter = item.name)}
						>{item.name}</button>
					{/each}
				</div>
			</div>
		</div>

		<div class="site-grid">
			{#each visibleSites as site (site.id)}
				<article class="site-card" style={`--delay:${(site.id % 8) * 35}ms`}>
					<button
						class="preview-button-wrap"
						onpointerdown={handlePreviewPointerDown}
						onpointermove={handlePreviewPointerMove}
						onpointerup={handlePreviewPointerUp}
						onpointercancel={handlePreviewPointerCancel}
						onclick={(event) => openSite(site, event)}
						aria-label={`Open ${site.name}: ${site.tagline}`}
					>
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
		class:preparing={viewerGesturePrepared}
		class:dragging={viewerDragActive}
		class:settling={viewerSettling}
		style={expandOrigin ? `--expand-x:${expandOrigin.x}px; --expand-y:${expandOrigin.y}px; --expand-scale-x:${expandOrigin.scaleX}; --expand-scale-y:${expandOrigin.scaleY};` : ''}
		role="dialog"
		aria-modal="true"
		aria-label={`${selected.name} website`}
	>
		<div class="viewer-backdrop" bind:this={viewerBackdropElement} aria-hidden="true"></div>
		<div class="viewer-entry" bind:this={viewerEntryElement}>
			<div class="viewer-surface" bind:this={viewerSurfaceElement}>
				<div
					class="viewer-site"
					bind:this={viewerSiteElement}
					use:pullToDismiss
					role="document"
					onwheel={handleViewerWheel}
				>
					<SiteExperience site={selected} />
				</div>
			</div>
		</div>
		<div class="viewer-controls" bind:this={viewerControlsElement}>
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

	.gallery-shell { --gallery-accent: rgba(56, 88, 233, 1); --gallery-page: #f2f0e9; overflow: clip; background: var(--gallery-page); font-family: 'Inter Variable', Inter, sans-serif; }
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

	.collection { --shell-inset-max: clamp(24px, 2vw, 36px); --shell-radius-max: clamp(22px, 2vw, 34px); position: relative; margin: 0 var(--collection-inset, clamp(24px, 2vw, 36px)); padding: clamp(24px, 3vw, 34px) clamp(24px, 3vw, 34px) 0; border-radius: var(--collection-radius, clamp(22px, 2vw, 34px)) var(--collection-radius, clamp(22px, 2vw, 34px)) 0 0; background: #111210; color: #f3f1e9; }
	.collection-shell-masks { position: absolute; z-index: 50; inset: 0 0 auto; display: none; height: 100vh; height: 100lvh; overflow: hidden; pointer-events: none; }
	.collection-shell-side, .collection-shell-corner { position: absolute; top: 0; display: block; margin: 0; will-change: transform; backface-visibility: hidden; }
	.collection-shell-side { width: var(--shell-inset-max); height: 100%; background: var(--gallery-page); }
	.collection-shell-side.left { left: 0; transform: scaleX(1); transform-origin: left center; }
	.collection-shell-side.right { right: 0; transform: scaleX(1); transform-origin: right center; }
	.collection-shell-corner { width: calc(var(--shell-inset-max) + var(--shell-radius-max)); height: var(--shell-radius-max); }
	.collection-shell-corner.left { left: 0; background: radial-gradient(circle var(--shell-radius-max) at 100% 100%, transparent calc(var(--shell-radius-max) - 0.75px), var(--gallery-page) var(--shell-radius-max)); transform: scale(1); transform-origin: left top; }
	.collection-shell-corner.right { right: 0; background: radial-gradient(circle var(--shell-radius-max) at 0 100%, transparent calc(var(--shell-radius-max) - 0.75px), var(--gallery-page) var(--shell-radius-max)); transform: scale(1); transform-origin: right top; }
	@supports (animation-timeline: scroll(root block)) and (animation-range: 0px 1px) {
		.collection-shell-side { animation: shell-side-open 1ms cubic-bezier(.333333,0,.666667,1) both; animation-timeline: scroll(root block); animation-range: 0px var(--shell-scroll-end, 1px); }
		.collection-shell-corner { animation: shell-corner-open 1ms cubic-bezier(.333333,0,.666667,1) both; animation-timeline: scroll(root block); animation-range: 0px var(--shell-scroll-end, 1px); }
	}
	@keyframes shell-side-open { from { transform: scaleX(1); } to { transform: scaleX(0); } }
	@keyframes shell-corner-open { from { transform: scale(1); } to { transform: scale(0); } }
	.collection-top-sentinel { position: absolute; top: 0; left: 0; width: 1px; height: 1px; pointer-events: none; }
	.collection-head { padding-bottom: 8px; }
	.collection h2 { margin: 0; font-size: clamp(36px, 3.7vw, 58px); font-weight: 610; line-height: 0.9; letter-spacing: -0.065em; }

	.filter-sticky-sentinel { height: 1px; margin-bottom: -1px; pointer-events: none; }
	.filter-row { position: relative; z-index: 40; display: block; margin: 0 clamp(-34px, -3vw, -24px); padding: 12px clamp(24px, 3vw, 34px) 14px; overflow-x: auto; background: #111210; scrollbar-width: none; }
	.filter-row.pinned { position: sticky; top: 0; }
	.filter-row::-webkit-scrollbar { display: none; }
	.filter-track { position: relative; width: max-content; min-width: 100%; padding-right: var(--sticky-brand-shift, 86px); }
	.filter-buttons { display: flex; width: max-content; align-items: center; gap: 8px; transform: translateX(0); transition: transform 620ms cubic-bezier(.16,1,.3,1); }
	.sticky-brand { position: absolute; top: 50%; left: 0; display: flex; width: max-content; align-items: center; gap: 8px; color: #f3f1e9; opacity: 0; transform: translate(-6px, -50%); pointer-events: none; transition: opacity 420ms ease, transform 620ms cubic-bezier(.16,1,.3,1); }
	.sticky-brand span { flex: none; font-size: 15px; font-weight: 650; letter-spacing: -0.035em; }
	.sticky-brand i { width: 1px; height: 22px; flex: none; background: #474843; }
	.filter-row.pinned .sticky-brand { opacity: 1; transform: translate(0, -50%); }
	.filter-row.pinned .filter-buttons { transform: translateX(var(--sticky-brand-shift, 86px)); }
	.filter-row button { display: inline-flex; flex: none; align-items: center; padding: 10px 15px; border: 1px solid #474843; border-radius: 99px; background: transparent; color: #a3a59d; font: 600 11px/1 'Inter Variable', Inter, sans-serif; letter-spacing: -0.015em; cursor: pointer; transition: background 180ms ease, color 180ms ease, border-color 180ms ease; }
	.filter-row button:hover, .filter-row button.active { border-color: #f3f1e9; background: #f3f1e9; color: #111210; }
	.filter-row button:disabled { opacity: 0.42; cursor: not-allowed; }
	.filter-row button:disabled:hover { border-color: #474843; background: transparent; color: #a3a59d; }

	.site-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: clamp(16px, 2vw, 32px); row-gap: clamp(45px, 6vw, 88px); }
	.site-card { min-width: 0; content-visibility: auto; contain-intrinsic-size: auto calc(clamp(230px, 24vw, 360px) + 55px); }
	.preview-button-wrap { display: block; width: 100%; padding: 0; border: 0; background: transparent; color: inherit; text-align: left; touch-action: pan-y; cursor: pointer; }
	.preview-window { position: relative; overflow: hidden; border-radius: 7px; background: #292a27; box-shadow: 0 18px 42px rgba(0, 0, 0, 0.25); transition: transform 350ms cubic-bezier(.2,.8,.2,1), box-shadow 350ms ease; }
	.preview-button-wrap:hover .preview-window, .preview-button-wrap:focus-visible .preview-window { transform: translateY(-9px) rotate(-0.35deg); box-shadow: 0 32px 70px rgba(0, 0, 0, 0.42); }
	.preview-button-wrap:focus-visible { outline: 2px solid var(--gallery-accent); outline-offset: 4px; }
	.window-chrome { display: flex; align-items: center; gap: 5px; height: 24px; padding: 0 9px; background: #e7e5dd; color: #111; }
	.window-chrome i { width: 5px; height: 5px; border-radius: 50%; background: #aaa79e; }
	.window-chrome i:first-child { background: #ff5b3a; }
	.window-chrome span { margin-left: auto; margin-right: auto; transform: translateX(-10px); color: #77746d; font: 600 6px/1 ui-monospace, monospace; letter-spacing: 0.03em; }
	.preview-viewport { height: clamp(230px, 24vw, 360px); }
	.open-cue { position: absolute; z-index: 20; inset: 24px 0 0; display: flex; align-items: center; justify-content: center; gap: 10px; background: rgba(17, 18, 16, 0.7); color: #fff; font: 650 11px/1 'Inter Variable', Inter, sans-serif; letter-spacing: 0.035em; opacity: 0; transition: opacity 220ms ease; }
	.cue-icon { display: grid; width: 32px; aspect-ratio: 1; place-items: center; border-radius: 50%; background: var(--gallery-accent); color: #fff; }
	.preview-button-wrap:hover .open-cue, .preview-button-wrap:focus-visible .open-cue { opacity: 1; }
	@media (hover: hover) and (pointer: fine) {
		.open-cue { backdrop-filter: blur(8px) saturate(90%); }
	}
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

	.viewer { position: fixed; z-index: 1000; inset: 0; overflow: hidden; background: transparent; }
	.viewer-backdrop { position: absolute; z-index: 0; inset: 0; background: #0c0c0b; }
	.viewer-entry, .viewer-surface { position: absolute; inset: 0; }
	.viewer-entry { z-index: 1; overflow: hidden; }
	.viewer-surface { overflow: hidden; background: #0c0c0b; transform-origin: 50% 10%; backface-visibility: hidden; }
	.viewer-site { height: 100%; overflow: auto; overscroll-behavior: contain; touch-action: pan-y; -webkit-overflow-scrolling: touch; }
	.viewer.preparing .viewer-surface { will-change: transform; }
	.viewer.preparing .viewer-backdrop { will-change: opacity; }
	.viewer.dragging .viewer-surface, .viewer.settling .viewer-surface { border-radius: clamp(20px, 5vw, 28px); box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42); }
	.viewer.dragging .viewer-controls, .viewer.settling .viewer-controls { background: rgba(20, 20, 19, 0.985); -webkit-backdrop-filter: none; backdrop-filter: none; will-change: transform, opacity; }
	.viewer.settling { pointer-events: none; }
	.viewer.from-card .viewer-entry { transform-origin: top left; animation: site-expand 640ms cubic-bezier(0.22, 1, 0.36, 1) both; will-change: transform, border-radius, box-shadow; }
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
		.site-card { contain-intrinsic-size: auto calc(clamp(250px, 34vw, 370px) + 55px); }
		.preview-viewport { height: clamp(250px, 34vw, 370px); }
	}

	@media (max-width: 720px) {
		.collection { --shell-inset-max: clamp(8px, 3vw, 12px); --shell-radius-max: 20px; margin: 0; border-radius: 0; }
		.collection-shell-masks { display: block; }
		.intro-grid { gap: 24px; padding: 42px 0 30px; }
		.intro h1 { font-size: clamp(48px, 12vw, 64px); line-height: 0.86; }
		.intro-aside { gap: 18px; }
		.collection-head { padding-bottom: 8px; }
		.collection h2 { font-size: clamp(38px, 9vw, 52px); }
		.filter-row { padding-top: 11px; padding-bottom: 13px; }
		.site-grid { grid-template-columns: 1fr; row-gap: 55px; }
		.site-card { contain-intrinsic-size: auto calc(clamp(280px, 71vw, 460px) + 58px); }
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
		.preview-window, .open-cue, .return-to-top, .sticky-brand, .filter-buttons { transition: none; }
		.collection-shell-side { animation: none !important; transform: scaleX(0) !important; }
		.collection-shell-corner { animation: none !important; transform: scale(0) !important; }
		.viewer.from-card .viewer-entry, .viewer.from-card .viewer-controls { animation: none; }
	}
</style>
