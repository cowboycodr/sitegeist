<script lang="ts">
	import { browser } from '$app/environment';
	import { ArrowUp, ChevronDown, ChevronLeft, ChevronRight, Columns2, X } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import SiteExperience from '$lib/components/SiteExperience.svelte';
	import SitePreview from '$lib/components/SitePreview.svelte';
	import {
		siteArtifactByModel,
		type BenchmarkModel
	} from '$lib/generated/site-artifacts';
	import { sitesByModel } from '$lib/sites';
	import type { ShowcaseSite } from '$lib/site-types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	type BenchmarkFilter = BenchmarkModel;
	const filters: Array<{ name: BenchmarkFilter; available: boolean }> = [
		{ name: '5.6 Sol', available: true },
		{ name: 'Opus 4.8', available: true },
		{ name: 'Grok 4.5', available: true }
	];
	const PAGE_THEME_COLOR = 'rgb(242, 240, 233)';
	const SHELL_THEME_COLOR = 'rgb(17, 18, 16)';
	const TRIPLE_COMPARE_MIN_WIDTH = 1260;
	const TRIPLE_COMPARE_LIMIT_MESSAGE = 'This screen is not large enough to reliably show three websites side by side.';

	type PreviewPointerGesture = {
		pointerId: number;
		trigger: HTMLElement;
		startX: number;
		startY: number;
		startScrollY: number;
		blocked: boolean;
	};
	type PreviewOrigin = { x: number; y: number; width: number; height: number };
	type PullPoint = { identifier: number; x: number; y: number; time: number };
	type PendingArtifactPull = { point: PullPoint; scrollTop: number };
	type ArtifactBridgeMessage = {
		protocol: 'sitegeist-embed';
		version: 1;
		slug: string;
		channel: string;
		kind: 'ready' | 'scroll' | 'pull-start' | 'pull-move' | 'pull-end' | 'pull-cancel' | 'key' | 'wheel';
		identifier?: number;
		screenX?: number;
		screenY?: number;
		timeStamp?: number;
		scrollTop?: number;
		claimed?: boolean;
		key?: string;
		deltaY?: number;
	};

	type PullGesture = {
		identifier: number;
		phase: 'pending' | 'dragging';
		startX: number;
		startY: number;
		rawY: number;
		renderedY: number;
		surfaceX: number;
		surfaceY: number;
		viewportWidth: number;
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
	let filter = $state<BenchmarkFilter>('5.6 Sol');
	let expandOrigin = $state<{ x: number; y: number; scaleX: number; scaleY: number } | null>(null);
	let collectionElement: HTMLElement;
	let collectionTopSentinelElement: HTMLDivElement;
	let filterSentinelElement: HTMLDivElement;
	let filterRowElement: HTMLDivElement;
	let stickyBrandElement: HTMLDivElement;
	let shellMasksElement: HTMLDivElement;
	let viewerEntryElement = $state<HTMLDivElement>();
	let viewerSurfaceElement = $state<HTMLDivElement>();
	let viewerContentElement = $state<HTMLDivElement>();
	let viewerSiteElement = $state<HTMLDivElement>();
	let viewerFrameElement = $state<HTMLIFrameElement>();
	let viewerBackdropElement = $state<HTMLDivElement>();
	let viewerControlsElement = $state<HTMLDivElement>();
	let compareControlElement = $state<HTMLDivElement>();
	let showReturnToTop = $state(false);
	let filtersPinned = $state(false);
	let shellThemeActive = $state(false);
	let viewerGesturePrepared = $state(false);
	let viewerDragActive = $state(false);
	let viewerSettling = $state(false);
	let viewerArtifactReady = $state(false);
	let comparisonArtifactReady = $state(false);
	let thirdArtifactReady = $state(false);
	let desktopCompareAvailable = $state(false);
	let tripleCompareAvailable = $state(false);
	let modelMenuOpen = $state(false);
	let compareMenuOpen = $state(false);
	let thirdMenuOpen = $state(false);
	let compareModel = $state<BenchmarkModel | null>(null);
	let thirdModel = $state<BenchmarkModel | null>(null);
	let viewerToast = $state<string | null>(null);
	let artifactChannel = $state('');
	let previewPointerGesture: PreviewPointerGesture | null = null;
	let blockedPreviewTrigger: HTMLElement | null = null;
	let blockedPreviewUntil = 0;
	let returnPreviewElement: HTMLElement | null = null;
	let returnPreviewOrigin: PreviewOrigin | null = null;
	let pullGesture: PullGesture | null = null;
	let pendingArtifactPull: PendingArtifactPull | null = null;
	let viewerAnimations: Animation[] = [];
	let viewerGestureSequence = 0;
	let viewerToastTimeout: ReturnType<typeof setTimeout> | null = null;

	let activeModel = $derived<BenchmarkModel>(filter);
	let visibleSites = $derived(sitesByModel[activeModel]);
	let activeArtifactBySlug = $derived(siteArtifactByModel[activeModel]);
	let selectedArtifact = $derived(selected ? activeArtifactBySlug.get(selected.slug) ?? null : null);
	let selectedArtifactUrl = $derived(
		selectedArtifact && artifactChannel
			? `${selectedArtifact.artifactUrl}?sitegeistSlug=${encodeURIComponent(selectedArtifact.slug)}&sitegeistChannel=${encodeURIComponent(artifactChannel)}`
			: ''
	);
	let viewerModels = $derived(
		filters
			.filter((item) => item.available && (!selected || siteArtifactByModel[item.name].has(selected.slug)))
			.map((item) => item.name)
	);
	let comparisonModels = $derived(
		viewerModels.filter((model) => model !== activeModel && model !== thirdModel)
	);
	let thirdComparisonModels = $derived(
		viewerModels.filter((model) => model !== activeModel && model !== compareModel)
	);
	let comparisonArtifact = $derived(
		compareModel && selected
			? siteArtifactByModel[compareModel].get(selected.slug) ?? null
			: null
	);
	let thirdArtifact = $derived(
		thirdModel && selected
			? siteArtifactByModel[thirdModel].get(selected.slug) ?? null
			: null
	);
	let themeColor = $derived(Boolean(selected) || shellThemeActive ? SHELL_THEME_COLOR : PAGE_THEME_COLOR);

	const clamp = (minimum: number, value: number, maximum: number) =>
		Math.min(maximum, Math.max(minimum, value));
	const lerp = (start: number, end: number, progress: number) =>
		start + (end - start) * progress;

	function createPreviewReturnKeyframes(
		gesture: PullGesture,
		origin: PreviewOrigin,
		targetScaleX: number,
		targetScaleY: number,
		releaseSurfaceVelocity: number,
		duration: number
	) {
		const surface: Keyframe[] = [];
		const content: Keyframe[] = [];
		const targetContentScale = Math.max(targetScaleX, targetScaleY);
		const momentumY = Math.min(
			releaseSurfaceVelocity * duration,
			gesture.viewportHeight * 0.75
		);
		const steps = 32;

		for (let index = 0; index <= steps; index += 1) {
			const offset = index / steps;
			const squared = offset * offset;
			const cubed = squared * offset;
			const startWeight = 2 * cubed - 3 * squared + 1;
			const momentumWeight = cubed - 2 * squared + offset;
			const endWeight = -2 * cubed + 3 * squared;
			const scaleProgress = 1 - Math.pow(1 - offset, 3);
			const scaleX = lerp(gesture.scale, targetScaleX, scaleProgress);
			const scaleY = lerp(gesture.scale, targetScaleY, scaleProgress);
			const contentScale = lerp(gesture.scale, targetContentScale, scaleProgress);
			const x = startWeight * gesture.surfaceX + endWeight * origin.x;
			const y =
				startWeight * gesture.surfaceY +
				momentumWeight * momentumY +
				endWeight * origin.y;
			surface.push({
				offset,
				transform: `translate3d(${x}px, ${y}px, 0) scale3d(${scaleX}, ${scaleY}, 1)`
			});
			content.push({
				offset,
				transform: `scale3d(${contentScale / scaleX}, ${contentScale / scaleY}, 1)`
			});
		}

		return { surface, content };
	}

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
		pendingArtifactPull = null;
		viewerGesturePrepared = false;
	}

	function clearViewerGestureStyles() {
		viewerSurfaceElement?.style.removeProperty('transform');
		viewerContentElement?.style.removeProperty('transform');
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

	function resolveReturnPreviewElement() {
		if (
			returnPreviewElement?.isConnected &&
			returnPreviewElement.dataset.siteSlug === selected?.slug
		) return returnPreviewElement;
		if (!selected || !collectionElement) return null;
		return collectionElement.querySelector<HTMLElement>(`[data-site-slug="${selected.slug}"]`);
	}

	function captureReturnPreviewOrigin(trigger = resolveReturnPreviewElement()) {
		if (!trigger?.isConnected) {
			returnPreviewElement = null;
			returnPreviewOrigin = null;
			return;
		}
		returnPreviewElement = trigger;
		const preview = trigger.querySelector('.preview-viewport') as HTMLElement | null;
		const rect = (preview ?? trigger).getBoundingClientRect();
		returnPreviewOrigin = rect.width > 0 && rect.height > 0
			? { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
			: null;
	}

	function createArtifactChannel(site: ShowcaseSite | null) {
		if (!browser || !site || !activeArtifactBySlug.has(site.slug)) return '';
		try {
			if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
		} catch {
			// LAN HTTP and older embedded WebViews can expose crypto without randomUUID.
		}
		const bytes = crypto.getRandomValues(new Uint8Array(24));
		return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
	}

	function postArtifactControl(kind: 'pull-settled') {
		if (!selectedArtifact || !artifactChannel || !viewerFrameElement?.contentWindow) return;
		viewerFrameElement.contentWindow.postMessage(
			{
				protocol: 'sitegeist-embed',
				version: 1,
				slug: selectedArtifact.slug,
				channel: artifactChannel,
				kind
			},
			'*'
		);
	}

	function syncFromHash() {
		if (!browser) return;
		const slug = window.location.hash.startsWith('#site/') ? window.location.hash.slice(6) : '';
		const nextSite = slug ? visibleSites.find((site) => site.slug === slug) ?? null : null;
		if (nextSite?.slug === selected?.slug) return;
		resetViewerGesture();
		returnPreviewElement = null;
		returnPreviewOrigin = null;
		expandOrigin = null;
		viewerArtifactReady = false;
		comparisonArtifactReady = false;
		thirdArtifactReady = false;
		artifactChannel = createArtifactChannel(nextSite);
		selected = nextSite;
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

		const preview = trigger.querySelector('.preview-viewport') as HTMLElement | null;
		const rect = (preview ?? trigger).getBoundingClientRect();
		returnPreviewElement = trigger;
		returnPreviewOrigin = { x: rect.left, y: rect.top, width: rect.width, height: rect.height };
		viewerArtifactReady = false;
		comparisonArtifactReady = false;
		thirdArtifactReady = false;
		artifactChannel = createArtifactChannel(site);
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
		selected = null;
		viewerArtifactReady = false;
		comparisonArtifactReady = false;
		thirdArtifactReady = false;
		modelMenuOpen = false;
		compareMenuOpen = false;
		thirdMenuOpen = false;
		compareModel = null;
		thirdModel = null;
		viewerToast = null;
		if (viewerToastTimeout) clearTimeout(viewerToastTimeout);
		viewerToastTimeout = null;
		artifactChannel = '';
		expandOrigin = null;
		returnPreviewElement = null;
		returnPreviewOrigin = null;
		if (browser) history.pushState(null, '', window.location.pathname + window.location.search);
	}

	function closeSite() {
		resetViewerGesture();
		completeCloseSite();
	}

	function showViewerToast(message: string) {
		viewerToast = message;
		if (viewerToastTimeout) clearTimeout(viewerToastTimeout);
		viewerToastTimeout = setTimeout(() => {
			viewerToast = null;
			viewerToastTimeout = null;
		}, 3200);
	}

	function selectComparisonModel(model: BenchmarkModel) {
		if (model === compareModel) {
			compareMenuOpen = false;
			return;
		}
		comparisonArtifactReady = false;
		compareModel = model;
		modelMenuOpen = false;
		compareMenuOpen = false;
		thirdMenuOpen = false;
	}

	function selectThirdComparisonModel(model: BenchmarkModel) {
		if (model === thirdModel) {
			thirdMenuOpen = false;
			return;
		}
		thirdArtifactReady = false;
		thirdModel = model;
		modelMenuOpen = false;
		compareMenuOpen = false;
		thirdMenuOpen = false;
	}

	function selectPrimaryModel(model: BenchmarkModel) {
		if (model === activeModel) {
			modelMenuOpen = false;
			return;
		}
		const previousModel = activeModel;
		filter = model;
		if (compareModel === model) compareModel = previousModel;
		else if (thirdModel === model) thirdModel = previousModel;
		viewerArtifactReady = false;
		comparisonArtifactReady = false;
		thirdArtifactReady = false;
		modelMenuOpen = false;
		compareMenuOpen = false;
		thirdMenuOpen = false;
		artifactChannel = createArtifactChannel(selected);
	}

	function toggleModelMenu() {
		modelMenuOpen = !modelMenuOpen;
		compareMenuOpen = false;
		thirdMenuOpen = false;
	}

	function toggleCompareMenu() {
		if (!compareModel) return;
		compareMenuOpen = !compareMenuOpen;
		modelMenuOpen = false;
		thirdMenuOpen = false;
	}

	function toggleThirdMenu() {
		if (!thirdModel) return;
		thirdMenuOpen = !thirdMenuOpen;
		modelMenuOpen = false;
		compareMenuOpen = false;
	}

	function handleCompareControl() {
		if (compareModel) {
			toggleCompareMenu();
			return;
		}
		const currentModelIndex = viewerModels.indexOf(activeModel);
		const nextModel = viewerModels[(currentModelIndex + 1) % viewerModels.length];
		if (nextModel && nextModel !== activeModel) selectComparisonModel(nextModel);
	}

	function addThirdComparison() {
		modelMenuOpen = false;
		compareMenuOpen = false;
		thirdMenuOpen = false;
		if (!tripleCompareAvailable) {
			showViewerToast(TRIPLE_COMPARE_LIMIT_MESSAGE);
			return;
		}
		const nextModel = viewerModels.find(
			(model) => model !== activeModel && model !== compareModel
		);
		if (!nextModel) return;
		thirdArtifactReady = false;
		thirdModel = nextModel;
	}

	function stopComparison() {
		modelMenuOpen = false;
		compareMenuOpen = false;
		thirdMenuOpen = false;
		compareModel = thirdModel;
		thirdModel = null;
		comparisonArtifactReady = false;
		thirdArtifactReady = false;
	}

	function stopThirdComparison() {
		modelMenuOpen = false;
		compareMenuOpen = false;
		thirdMenuOpen = false;
		thirdModel = null;
		thirdArtifactReady = false;
	}

	function clearComparisons() {
		modelMenuOpen = false;
		compareMenuOpen = false;
		thirdMenuOpen = false;
		compareModel = null;
		thirdModel = null;
		comparisonArtifactReady = false;
		thirdArtifactReady = false;
	}

	function handleWindowPointerDown(event: PointerEvent) {
		if ((!modelMenuOpen && !compareMenuOpen && !thirdMenuOpen) || !(event.target instanceof Node)) return;
		if (!compareControlElement?.contains(event.target)) {
			modelMenuOpen = false;
			compareMenuOpen = false;
			thirdMenuOpen = false;
		}
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
		gesture.surfaceX = reducedMotion ? 0 : gesture.viewportWidth * 0.5 * (1 - gesture.scale);
		gesture.surfaceY = distance + (reducedMotion ? 0 : gesture.viewportHeight * 0.1 * (1 - gesture.scale));
		gesture.backdropOpacity = reducedMotion ? 1 : 1 - easedProgress * 0.82;
		gesture.controlsOpacity = reducedMotion ? 1 : Math.max(0, 1 - progress * 1.7);
		gesture.controlsOffset = reducedMotion ? 0 : Math.min(22, distance * 0.075);
		gesture.surfaceTransform = `translate3d(${gesture.surfaceX}px, ${gesture.surfaceY}px, 0) scale(${gesture.scale})`;
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

	function beginPullGesture(point: PullPoint, scrollTop: number) {
		if (viewerSettling || scrollTop > 1) return;
		stopViewerAnimations();
		clearPullGesture();
		captureReturnPreviewOrigin();
		pullGesture = {
			identifier: point.identifier,
			phase: 'pending',
			startX: point.x,
			startY: point.y,
			rawY: 0,
			renderedY: 0,
			surfaceX: 0,
			surfaceY: 0,
			viewportWidth: Math.max(1, viewerSurfaceElement?.clientWidth ?? window.innerWidth),
			viewportHeight: Math.max(1, viewerSurfaceElement?.clientHeight ?? window.innerHeight),
			scale: 1,
			backdropOpacity: 1,
			controlsOpacity: 1,
			controlsOffset: 0,
			surfaceTransform: 'translate3d(0, 0, 0) scale(1)',
			controlsTransform: 'translate3d(-50%, 0, 0) scale(1)',
			samples: [{ y: 0, time: point.time }],
			frame: 0
		};
		// Give WebKit the touch-slop window to promote the full-screen surface before it moves.
		viewerGesturePrepared = true;
	}

	function updatePullGesture(point: PullPoint, scrollTop: number) {
		const gesture = pullGesture;
		if (!gesture || gesture.identifier !== point.identifier) return false;
		const deltaX = point.x - gesture.startX;
		const deltaY = point.y - gesture.startY;
		if (gesture.phase === 'pending') {
			const movement = Math.hypot(deltaX, deltaY);
			if (movement < 9) return false;
			if (deltaY <= 0 || deltaY <= Math.abs(deltaX) * 1.15 || scrollTop > 1) {
				clearPullGesture();
				return false;
			}
			activatePullGesture(gesture);
		}

		gesture.rawY = Math.max(0, deltaY);
		gesture.samples.push({ y: gesture.rawY, time: point.time });
		while (gesture.samples.length > 2 && gesture.samples[0].time < point.time - 120) {
			gesture.samples.shift();
		}
		requestPullGestureRender();
		return true;
	}

	function finishPullGesture(point: PullPoint) {
		const gesture = pullGesture;
		if (!gesture || gesture.identifier !== point.identifier) return;
		if (gesture.phase !== 'dragging') {
			clearPullGesture();
			return;
		}

		gesture.rawY = Math.max(0, point.y - gesture.startY);
		gesture.samples.push({ y: gesture.rawY, time: point.time });
		while (gesture.samples.length > 2 && gesture.samples[0].time < point.time - 120) {
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

	function handleViewerTouchStart(event: TouchEvent) {
		if (event.touches.length !== 1 || !viewerSiteElement) return;
		const touch = event.changedTouches.item(0);
		if (!touch) return;
		beginPullGesture(
			{ identifier: touch.identifier, x: touch.clientX, y: touch.clientY, time: event.timeStamp },
			viewerSiteElement.scrollTop
		);
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
		const claimed = updatePullGesture(
			{ identifier: touch.identifier, x: touch.clientX, y: touch.clientY, time: event.timeStamp },
			viewerSiteElement.scrollTop
		);
		if (claimed) event.preventDefault();
	}

	async function settlePullGesture(shouldDismiss: boolean) {
		const gesture = pullGesture;
		if (
			!gesture ||
			gesture.phase !== 'dragging' ||
			viewerSettling ||
			!viewerSurfaceElement ||
			!viewerContentElement ||
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
				postArtifactControl('pull-settled');
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
		const previewOrigin = shouldDismiss ? returnPreviewOrigin : null;
		const previewScaleX = previewOrigin ? previewOrigin.width / gesture.viewportWidth : null;
		const previewScaleY = previewOrigin ? previewOrigin.height / gesture.viewportHeight : null;
		const fallbackScale = Math.max(0.93, gesture.scale - 0.012);
		const fallbackX = gesture.viewportWidth * 0.5 * (1 - fallbackScale);
		const targetSurfaceTransform = shouldDismiss
			? previewOrigin && previewScaleX && previewScaleY
				? `translate3d(${previewOrigin.x}px, ${previewOrigin.y}px, 0) scale(${previewScaleX}, ${previewScaleY})`
				: `translate3d(${fallbackX}px, ${offscreenY}px, 0) scale(${fallbackScale})`
			: 'translate3d(0, 0, 0) scale(1)';
		const targetControlsTransform = shouldDismiss
			? 'translate3d(-50%, 28px, 0) scale(0.96)'
			: 'translate3d(-50%, 0, 0) scale(1)';
		const returnTravel = previewOrigin && previewScaleX && previewScaleY
			? Math.hypot(previewOrigin.x - gesture.surfaceX, previewOrigin.y - gesture.surfaceY) +
				Math.max(
					Math.abs(previewScaleX - gesture.scale) * gesture.viewportWidth,
					Math.abs(previewScaleY - gesture.scale) * gesture.viewportHeight
				) * 0.35
			: 0;
		const duration = shouldDismiss
			? previewOrigin
				? clamp(300, 420 + Math.min(90, returnTravel * 0.1) - Math.min(150, velocity * 75), 520)
				: clamp(220, (offscreenY - gesture.renderedY) / Math.max(velocity, 1.8), 390)
			: clamp(280, 300 + gesture.renderedY * 0.18, 380);
		const easing = shouldDismiss
			? 'cubic-bezier(.22,1,.36,1)'
			: 'cubic-bezier(.2,.85,.25,1)';
		const releaseSurfaceVelocity = velocity * (
			gesture.rawY <= gesture.viewportHeight * 0.36 ? 1 : 0.32
		);
		const previewReturnKeyframes = previewOrigin && previewScaleX && previewScaleY
			? createPreviewReturnKeyframes(
				gesture,
				previewOrigin,
				previewScaleX,
				previewScaleY,
				releaseSurfaceVelocity,
				duration
			)
			: null;

		const surfaceAnimation = viewerSurfaceElement.animate(
			previewReturnKeyframes?.surface ?? [
				{ transform: gesture.surfaceTransform },
				{ transform: targetSurfaceTransform }
			],
			{ duration, easing: previewReturnKeyframes ? 'linear' : easing, fill: 'forwards' }
		);
		const contentAnimation = previewReturnKeyframes
			? viewerContentElement.animate(
				previewReturnKeyframes.content,
				{ duration, easing: 'linear', fill: 'forwards' }
			)
			: null;
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
		const surfaceHandoffAnimation = shouldDismiss && previewOrigin
			? viewerSurfaceElement.animate(
				[
					{ opacity: 1 },
					{ opacity: 1, offset: 0.84 },
					{ opacity: 0 }
				],
				{ duration, easing: 'linear', fill: 'forwards' }
			)
			: null;
		viewerAnimations = [
			surfaceAnimation,
			...(contentAnimation ? [contentAnimation] : []),
			backdropAnimation,
			controlsAnimation,
			...(surfaceHandoffAnimation ? [surfaceHandoffAnimation] : [])
		];

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
			postArtifactControl('pull-settled');
			clearPullGesture();
			clearViewerGestureStyles();
		}
	}

	function handleViewerTouchEnd(event: TouchEvent) {
		const gesture = pullGesture;
		if (!gesture) return;
		const touch = findTouch(event.changedTouches, gesture.identifier);
		if (!touch) return;
		finishPullGesture({
			identifier: touch.identifier,
			x: touch.clientX,
			y: touch.clientY,
			time: event.timeStamp
		});
	}

	function handleViewerTouchCancel() {
		if (pullGesture?.phase === 'dragging') void settlePullGesture(false);
		else clearPullGesture();
	}

	function readArtifactPullPoint(message: ArtifactBridgeMessage): PullPoint | null {
		if (
			typeof message.identifier !== 'number' || !Number.isFinite(message.identifier) ||
			typeof message.screenX !== 'number' || !Number.isFinite(message.screenX) || Math.abs(message.screenX) > 100_000 ||
			typeof message.screenY !== 'number' || !Number.isFinite(message.screenY) || Math.abs(message.screenY) > 100_000 ||
			typeof message.timeStamp !== 'number' || !Number.isFinite(message.timeStamp) || message.timeStamp < 0
		) return null;
		return {
			identifier: message.identifier,
			x: message.screenX,
			y: message.screenY,
			time: message.timeStamp
		};
	}

	function handleArtifactMessage(event: MessageEvent) {
		if (
			!selected ||
			!selectedArtifact ||
			!artifactChannel ||
			!viewerFrameElement ||
			event.source !== viewerFrameElement.contentWindow ||
			event.origin !== 'null'
		) return;
		const message = event.data as Partial<ArtifactBridgeMessage> | null;
		if (
			!message ||
			message.protocol !== 'sitegeist-embed' ||
			message.version !== 1 ||
			message.slug !== selected.slug ||
			message.channel !== artifactChannel ||
			typeof message.kind !== 'string'
		) return;
		if (message.kind === 'ready') {
			viewerArtifactReady = true;
			return;
		}
		if (message.kind === 'key') {
			if (message.key === 'Escape' || message.key === 'ArrowLeft' || message.key === 'ArrowRight') {
				handleViewerShortcut(message.key);
			}
			return;
		}
		if (message.kind === 'scroll' || message.kind === 'wheel') return;

		const point = readArtifactPullPoint(message as ArtifactBridgeMessage);
		const scrollTop = typeof message.scrollTop === 'number' && Number.isFinite(message.scrollTop)
			? clamp(0, message.scrollTop, 1_000_000)
			: 0;
		if (message.kind === 'pull-start' && point) {
			// Keep touch intent inert until the iframe has rejected native scrolling and
			// explicitly claimed a downward pull from the top of its document.
			pendingArtifactPull = { point, scrollTop };
			return;
		}
		if (message.kind === 'pull-move' && message.claimed === true && point) {
			const pending = pendingArtifactPull;
			pendingArtifactPull = null;
			if (!pullGesture && pending?.point.identifier === point.identifier) {
				beginPullGesture(pending.point, pending.scrollTop);
			}
			updatePullGesture(point, scrollTop);
			return;
		}
		if (message.kind === 'pull-end' && point) {
			pendingArtifactPull = null;
			finishPullGesture(point);
			return;
		}
		if (message.kind === 'pull-cancel') {
			pendingArtifactPull = null;
			handleViewerTouchCancel();
		}
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

	function step(direction: number) {
		if (!selected || viewerSettling) return;
		modelMenuOpen = false;
		compareMenuOpen = false;
		thirdMenuOpen = false;
		resetViewerGesture();
		expandOrigin = null;
		returnPreviewElement = null;
		returnPreviewOrigin = null;
		viewerArtifactReady = false;
		comparisonArtifactReady = false;
		thirdArtifactReady = false;
		const current = visibleSites.findIndex((site) => site.id === selected?.id);
		const next = visibleSites[(current + direction + visibleSites.length) % visibleSites.length];
		if (compareModel && !siteArtifactByModel[compareModel].has(next.slug)) stopComparison();
		if (thirdModel && !siteArtifactByModel[thirdModel].has(next.slug)) stopThirdComparison();
		artifactChannel = createArtifactChannel(next);
		selected = next;
		if (browser) history.replaceState(null, '', `#site/${next.slug}`);
	}

	function handleViewerShortcut(key: string) {
		if (!selected || viewerSettling) return;
		if (key === 'Escape' && (modelMenuOpen || compareMenuOpen || thirdMenuOpen)) {
			modelMenuOpen = false;
			compareMenuOpen = false;
			thirdMenuOpen = false;
			return;
		}
		if (key === 'Escape') closeSite();
		if (key === 'ArrowLeft') step(-1);
		if (key === 'ArrowRight') step(1);
	}

	function handleKeydown(event: KeyboardEvent) {
		handleViewerShortcut(event.key);
	}

	onMount(() => {
		const desktopCompareMedia = window.matchMedia('(min-width: 721px) and (hover: hover) and (pointer: fine)');
		const tripleCompareMedia = window.matchMedia(`(min-width: ${TRIPLE_COMPARE_MIN_WIDTH}px)`);
		const syncDesktopCompare = () => {
			desktopCompareAvailable = desktopCompareMedia.matches;
			tripleCompareAvailable = desktopCompareAvailable && tripleCompareMedia.matches;
			if (!desktopCompareAvailable) clearComparisons();
			else if (!tripleCompareAvailable && thirdModel) {
				stopThirdComparison();
				showViewerToast(TRIPLE_COMPARE_LIMIT_MESSAGE);
			}
		};
		syncDesktopCompare();
		desktopCompareMedia.addEventListener('change', syncDesktopCompare);
		tripleCompareMedia.addEventListener('change', syncDesktopCompare);
		return () => {
			desktopCompareMedia.removeEventListener('change', syncDesktopCompare);
			tripleCompareMedia.removeEventListener('change', syncDesktopCompare);
		};
	});

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

<svelte:window onkeydown={handleKeydown} onmessage={handleArtifactMessage} onpointerdown={handleWindowPointerDown} />

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
				<div class="preview-disclaimer" role="note">
					<span aria-hidden="true">*</span>
					<span>Previews do not reflect the exact content of each website.</span>
				</div>
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
				{@const artifact = activeArtifactBySlug.get(site.slug)}
				<article class="site-card" style={`--delay:${(site.id % 8) * 35}ms`}>
					<button
						class="preview-button-wrap"
						data-site-slug={site.slug}
						onpointerdown={handlePreviewPointerDown}
						onpointermove={handlePreviewPointerMove}
						onpointerup={handlePreviewPointerUp}
						onpointercancel={handlePreviewPointerCancel}
						onclick={(event) => openSite(site, event)}
						aria-label={`Open ${site.name}: ${site.tagline}`}
					>
						<div class="preview-window">
							<div class="window-chrome"><i></i><i></i><i></i><span>{site.slug}.studio</span></div>
							<div class="preview-viewport">
								{#if artifact}
									<div class="artifact-card-preview">
										<img src={artifact.posterUrl} alt="" loading="lazy" decoding="async" />
									</div>
								{:else}
									<SitePreview {site} />
								{/if}
							</div>
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
					class="viewer-content"
					class:comparing={Boolean(comparisonArtifact)}
					class:triple={Boolean(comparisonArtifact && thirdArtifact)}
					bind:this={viewerContentElement}
				>
					<div class="viewer-pane primary-pane">
						{#if selectedArtifact}
							<div class="viewer-site artifact-shell" class:ready={viewerArtifactReady} role="document">
								<img
									class="artifact-viewer-poster"
									src={selectedArtifact.posterUrl}
									alt=""
									aria-hidden="true"
								/>
								<iframe
									class="artifact-frame"
									bind:this={viewerFrameElement}
									src={selectedArtifactUrl}
									title={`${selected.name} ${activeModel} website`}
									sandbox="allow-scripts"
									referrerpolicy="no-referrer"
									allow="camera 'none'; geolocation 'none'; microphone 'none'; payment 'none'"
									loading="eager"
									onload={() => (viewerArtifactReady = true)}
								></iframe>
							</div>
						{:else}
							<div
								class="viewer-site"
								bind:this={viewerSiteElement}
								use:pullToDismiss
								role="document"
							>
								<SiteExperience site={selected} />
							</div>
						{/if}
					</div>
					{#if desktopCompareAvailable}
						<div class="viewer-pane comparison-pane" aria-hidden={!comparisonArtifact}>
							{#if comparisonArtifact && compareModel}
								<div class="viewer-site artifact-shell" class:ready={comparisonArtifactReady} role="document">
									<img
										class="artifact-viewer-poster"
										src={comparisonArtifact.posterUrl}
										alt=""
										aria-hidden="true"
									/>
									<iframe
										class="artifact-frame"
										src={comparisonArtifact.artifactUrl}
										title={`${selected.name} ${compareModel} comparison website`}
										sandbox="allow-scripts"
										referrerpolicy="no-referrer"
										allow="camera 'none'; geolocation 'none'; microphone 'none'; payment 'none'"
										loading="eager"
										onload={() => (comparisonArtifactReady = true)}
									></iframe>
								</div>
							{/if}
						</div>
						<div class="viewer-pane third-pane" aria-hidden={!thirdArtifact}>
							{#if thirdArtifact && thirdModel}
								<div class="viewer-site artifact-shell" class:ready={thirdArtifactReady} role="document">
									<img
										class="artifact-viewer-poster"
										src={thirdArtifact.posterUrl}
										alt=""
										aria-hidden="true"
									/>
									<iframe
										class="artifact-frame"
										src={thirdArtifact.artifactUrl}
										title={`${selected.name} ${thirdModel} third comparison website`}
										sandbox="allow-scripts"
										referrerpolicy="no-referrer"
										allow="camera 'none'; geolocation 'none'; microphone 'none'; payment 'none'"
										loading="eager"
										onload={() => (thirdArtifactReady = true)}
									></iframe>
								</div>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
		{#if viewerToast}
			<div class="viewer-toast" role="status">{viewerToast}</div>
		{/if}
		<div class="viewer-controls" bind:this={viewerControlsElement}>
			<div class="viewer-controls-cluster" bind:this={compareControlElement}>
				<div class="close-control-pill">
					<button class="close-control" onclick={closeSite} aria-label="Close site and return to gallery" title="Close"><X size={16} strokeWidth={2.2} /></button>
				</div>
				{#if desktopCompareAvailable}
					<div class="model-control-wrap">
						<button
							class="model-control model-segment"
							class:open={modelMenuOpen}
							onclick={toggleModelMenu}
							aria-label={`${activeModel} is visible. Choose visible model`}
							aria-haspopup="menu"
							aria-expanded={modelMenuOpen}
							title="Choose visible model"
						>
							<span>{activeModel}</span>
							<ChevronDown class="model-control-chevron" size={14} strokeWidth={2.2} />
						</button>
						{#if compareModel}
							<i class="model-separator" aria-hidden="true">|</i>
							<button
								class="comparison-model-control model-segment"
								class:open={compareMenuOpen}
								onclick={toggleCompareMenu}
								aria-label={`${compareModel} is the comparison model. Choose comparison model`}
								aria-haspopup="menu"
								aria-expanded={compareMenuOpen}
								title="Choose comparison model"
							>
								<span>{compareModel}</span>
								<ChevronDown class="model-control-chevron" size={14} strokeWidth={2.2} />
							</button>
						{/if}
						{#if thirdModel}
							<i class="model-separator" aria-hidden="true">|</i>
							<button
								class="third-model-control model-segment"
								class:open={thirdMenuOpen}
								onclick={toggleThirdMenu}
								aria-label={`${thirdModel} is the third comparison model. Choose third model`}
								aria-haspopup="menu"
								aria-expanded={thirdMenuOpen}
								title="Choose third model"
							>
								<span>{thirdModel}</span>
								<ChevronDown class="model-control-chevron" size={14} strokeWidth={2.2} />
							</button>
						{/if}
						<button
							class="compare-control"
							class:active={Boolean(compareModel)}
							onclick={handleCompareControl}
							aria-label={compareModel ? 'Change or remove comparison model' : 'Add comparison model'}
							aria-haspopup="menu"
							aria-expanded={compareMenuOpen}
							aria-pressed={Boolean(compareModel)}
							title={compareModel ? 'Change comparison' : 'Compare models'}
						><Columns2 size={17} strokeWidth={2.1} /></button>
						{#if modelMenuOpen}
							<div class="compare-picker" role="menu" aria-label="Choose the visible model">
								<div class="compare-picker-label">View model</div>
								{#each viewerModels as model}
									<button
										class="compare-option"
										class:selected={activeModel === model}
										role="menuitemradio"
										aria-checked={activeModel === model}
										onclick={() => selectPrimaryModel(model)}
									>
										<span>{model}</span><i aria-hidden="true"></i>
									</button>
								{/each}
							</div>
						{/if}
						{#if compareMenuOpen && compareModel}
							<div class="compare-picker" role="menu" aria-label="Choose a model to compare">
								<div class="compare-picker-label">Compare with</div>
								{#each comparisonModels as model}
									<button
										class="compare-option"
										class:selected={compareModel === model}
										role="menuitemradio"
										aria-checked={compareModel === model}
										onclick={() => selectComparisonModel(model)}
									>
										<span>{model}</span><i aria-hidden="true"></i>
									</button>
								{/each}
								{#if !thirdModel && viewerModels.length >= 3}
									<button class="compare-option" role="menuitem" onclick={addThirdComparison}>
										<span>Add third model</span><i aria-hidden="true"></i>
									</button>
								{/if}
								<button class="compare-option" role="menuitem" onclick={stopComparison}>
									<span>Remove model</span><i aria-hidden="true"></i>
								</button>
							</div>
						{/if}
						{#if thirdMenuOpen && thirdModel}
							<div class="compare-picker" role="menu" aria-label="Choose the third model">
								<div class="compare-picker-label">Third model</div>
								{#each thirdComparisonModels as model}
									<button
										class="compare-option"
										class:selected={thirdModel === model}
										role="menuitemradio"
										aria-checked={thirdModel === model}
										onclick={() => selectThirdComparisonModel(model)}
									>
										<span>{model}</span><i aria-hidden="true"></i>
									</button>
								{/each}
								<button class="compare-option" role="menuitem" onclick={stopThirdComparison}>
									<span>Remove model</span><i aria-hidden="true"></i>
								</button>
							</div>
						{/if}
					</div>
				{/if}
				<div class="navigation-control-pill">
					<div class="right-controls">
						<button class="step-control" onclick={() => step(-1)} aria-label="Previous website" title="Previous site"><ChevronLeft size={19} strokeWidth={2.3} /></button>
						<div class="viewer-id"><span>{String(selected.id).padStart(3, '0')}</span></div>
						<button class="step-control" onclick={() => step(1)} aria-label="Next website" title="Next site"><ChevronRight size={19} strokeWidth={2.3} /></button>
					</div>
				</div>
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
	.collection-head { padding-bottom: 22px; }
	.collection h2 { margin: 0; font-size: clamp(36px, 3.7vw, 58px); font-weight: 610; line-height: 0.9; letter-spacing: -0.065em; }

	.filter-sticky-sentinel { height: 1px; margin-bottom: -1px; pointer-events: none; }
	.filter-row { position: relative; z-index: 40; display: block; margin: 0 clamp(-34px, -3vw, -24px); padding: 12px clamp(24px, 3vw, 34px) 14px; overflow-x: auto; background: #111210; scrollbar-width: none; }
	.filter-row.pinned { position: sticky; top: 0; }
	.filter-row::-webkit-scrollbar { display: none; }
	.filter-track { position: relative; width: max-content; min-width: 100%; padding-right: var(--sticky-brand-shift, 86px); }
	.filter-buttons { display: flex; width: max-content; align-items: center; gap: 8px; transform: translate3d(0, 0, 0); will-change: transform; transition: transform 520ms cubic-bezier(.4,0,.2,1) 60ms; }
	.sticky-brand { position: absolute; top: 50%; left: 0; display: flex; width: max-content; align-items: center; gap: 8px; color: #f3f1e9; opacity: 0; transform: translate3d(-18px, -50%, 0) scale(.985); transform-origin: left center; backface-visibility: hidden; will-change: transform, opacity; pointer-events: none; transition: transform 320ms cubic-bezier(.4,0,.2,1), opacity 170ms ease-out; }
	.sticky-brand span { flex: none; font-size: 15px; font-weight: 650; letter-spacing: -0.035em; }
	.sticky-brand i { width: 1px; height: 22px; flex: none; background: #474843; }
	.filter-row.pinned .sticky-brand { opacity: 1; transform: translate3d(0, -50%, 0) scale(1); transition: transform 600ms cubic-bezier(.22,0,.16,1) 70ms, opacity 300ms cubic-bezier(.2,0,.2,1) 130ms; }
	.filter-row.pinned .filter-buttons { transform: translate3d(var(--sticky-brand-shift, 86px), 0, 0); transition: transform 720ms cubic-bezier(.22,0,.16,1); }
	.filter-row button { display: inline-flex; flex: none; align-items: center; padding: 10px 15px; border: 1px solid #474843; border-radius: 99px; background: transparent; color: #a3a59d; font: 600 11px/1 'Inter Variable', Inter, sans-serif; letter-spacing: -0.015em; cursor: pointer; transition: background 180ms ease, color 180ms ease, border-color 180ms ease; }
	.filter-row button:hover, .filter-row button.active { border-color: #f3f1e9; background: #f3f1e9; color: #111210; }
	.filter-row button:disabled { opacity: 0.42; cursor: not-allowed; }
	.filter-row button:disabled:hover { border-color: #474843; background: transparent; color: #a3a59d; }

	.site-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); column-gap: clamp(16px, 2vw, 32px); row-gap: clamp(45px, 6vw, 88px); }
	.site-card { min-width: 0; content-visibility: auto; contain-intrinsic-size: auto calc(clamp(230px, 24vw, 360px) + 55px); }
	.preview-button-wrap { display: block; width: 100%; padding: 0; border: 0; background: transparent; color: inherit; text-align: left; touch-action: pan-y; cursor: pointer; }
	.preview-window { position: relative; overflow: hidden; border-radius: 7px; background: #292a27; box-shadow: 0 18px 42px rgba(0, 0, 0, 0.25); transition: transform 350ms cubic-bezier(.2,.8,.2,1), box-shadow 350ms ease; }
	.preview-button-wrap:hover .preview-window, .preview-button-wrap:focus-visible .preview-window { transform: scale(1.018); box-shadow: 0 32px 70px rgba(0, 0, 0, 0.42); }
	.preview-button-wrap:focus-visible { outline: 2px solid var(--gallery-accent); outline-offset: 4px; }
	.window-chrome { display: flex; align-items: center; gap: 5px; height: 24px; padding: 0 9px; background: #e7e5dd; color: #111; }
	.window-chrome i { width: 5px; height: 5px; border-radius: 50%; background: #aaa79e; }
	.window-chrome i:first-child { background: #ff5b3a; }
	.window-chrome span { margin-left: auto; margin-right: auto; transform: translateX(-10px); color: #77746d; font: 600 6px/1 ui-monospace, monospace; letter-spacing: 0.03em; }
	.preview-viewport { aspect-ratio: 4 / 3; height: auto; }
	.artifact-card-preview, .artifact-card-preview img { display: block; width: 100%; height: 100%; }
	.artifact-card-preview img { background: #06110f; object-fit: contain; }
	@media (hover: none) and (pointer: coarse) {
		.preview-button-wrap:hover .preview-window { transform: none; box-shadow: 0 18px 42px rgba(0, 0, 0, 0.25); }
	}
	.card-caption { display: flex; align-items: start; justify-content: space-between; gap: 15px; padding-top: 15px; }
	.card-caption > div { display: flex; align-items: baseline; gap: 11px; min-width: 0; }
	.card-caption span { flex: none; color: #74766f; font: 700 8px ui-monospace, monospace; }
	.card-caption h3 { margin: 0; overflow: hidden; font-size: 16px; font-weight: 650; letter-spacing: -0.035em; text-overflow: ellipsis; white-space: nowrap; }
	.card-caption p { flex: none; margin: 2px 0 0; color: #85877f; font: 700 8px/1 ui-monospace, monospace; letter-spacing: 0.07em; text-transform: uppercase; }

	.gallery-footer { margin-top: 80px; padding: 40px 0 50px; }
	.gallery-footer > p { margin: 0; font-size: clamp(42px, 6vw, 90px); font-weight: 600; line-height: 0.88; letter-spacing: -0.07em; }
	.preview-disclaimer { display: flex; width: min(100%, 420px); justify-content: flex-start; gap: 7px; margin: 14px 0 0; color: #85877f; font: 600 clamp(10px, 0.8vw, 12px)/1.45 'Inter Variable', Inter, sans-serif; letter-spacing: -0.01em; text-align: left; }
	.preview-disclaimer span:first-child { flex: none; }
	.return-to-top { position: fixed; z-index: 80; right: clamp(16px, 2vw, 28px); bottom: clamp(16px, 2vw, 28px); display: inline-flex; width: 48px; height: 48px; align-items: center; justify-content: center; border-radius: 50%; background: #f3f1e9; color: #111210; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.18); text-decoration: none; opacity: 0; visibility: hidden; transform: translateY(10px) scale(0.92); pointer-events: none; transition: opacity 240ms ease, visibility 0s linear 240ms, transform 320ms cubic-bezier(.2,.8,.2,1), background 180ms ease; }
	.return-to-top.visible { opacity: 1; visibility: visible; transform: translateY(0) scale(1); pointer-events: auto; transition-delay: 0s; }
	.return-to-top:hover { background: #fff; transform: translateY(-3px) scale(1); }
	.return-to-top:focus-visible { outline: 2px solid var(--gallery-accent); outline-offset: 3px; }

	.viewer { position: fixed; z-index: 1000; inset: 0; overflow: hidden; background: transparent; }
	.viewer-backdrop { position: absolute; z-index: 0; inset: 0; background: #0c0c0b; }
	.viewer-entry, .viewer-surface, .viewer-content { position: absolute; inset: 0; }
	.viewer-entry { z-index: 1; overflow: hidden; }
	.viewer-surface { overflow: hidden; background: #0c0c0b; transform-origin: top left; backface-visibility: hidden; }
	.viewer-content { display: flex; transform-origin: top left; backface-visibility: hidden; }
	.viewer-pane { position: relative; height: 100%; min-width: 0; overflow: hidden; }
	.primary-pane { flex: 1 1 auto; }
	.comparison-pane, .third-pane { flex: 0 0 0; opacity: 0; transform: translate3d(18px, 0, 0); box-shadow: inset 1px 0 rgba(255, 255, 255, 0); pointer-events: none; transition: flex-basis 520ms cubic-bezier(.22,1,.36,1), box-shadow 220ms ease, opacity 240ms ease, transform 520ms cubic-bezier(.22,1,.36,1); }
	.viewer-content.comparing .comparison-pane { flex-basis: 50%; opacity: 1; transform: translate3d(0, 0, 0); box-shadow: inset 1px 0 rgba(255, 255, 255, 0.18); pointer-events: auto; }
	.viewer-content.triple .comparison-pane, .viewer-content.triple .third-pane { flex-basis: 33.3333%; opacity: 1; transform: translate3d(0, 0, 0); box-shadow: inset 1px 0 rgba(255, 255, 255, 0.18); pointer-events: auto; }
	.viewer-site { height: 100%; overflow: auto; overscroll-behavior: contain; touch-action: pan-y; -webkit-overflow-scrolling: touch; }
	.artifact-shell { position: relative; overflow: hidden; background: #07090d; }
	.artifact-viewer-poster, .artifact-frame { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
	.artifact-viewer-poster { z-index: 2; background: #06110f; object-fit: contain; opacity: 1; pointer-events: none; transition: opacity 220ms ease; }
	.artifact-frame { z-index: 1; border: 0; background: #07090d; opacity: 0; pointer-events: none; transition: opacity 220ms ease; }
	.artifact-shell.ready .artifact-viewer-poster { opacity: 0; }
	.artifact-shell.ready .artifact-frame { opacity: 1; pointer-events: auto; }
	.viewer.preparing .viewer-surface { border-radius: 0; box-shadow: 0 24px 70px rgba(0, 0, 0, 0); will-change: transform; }
	.viewer.preparing .viewer-content { will-change: transform; }
	.viewer.preparing .viewer-backdrop { will-change: opacity; }
	@media (hover: none) and (pointer: coarse) {
		.viewer-surface, .viewer-content { will-change: transform; }
		.viewer-backdrop { will-change: opacity; }
	}
	.viewer.dragging .viewer-surface, .viewer.settling .viewer-surface { border-radius: clamp(14px, 4vw, 22px); box-shadow: 0 24px 70px rgba(0, 0, 0, 0.42); }
	.viewer.dragging .viewer-controls, .viewer.settling .viewer-controls { will-change: transform, opacity; }
	.viewer.dragging .close-control-pill, .viewer.dragging .model-control-wrap, .viewer.dragging .navigation-control-pill, .viewer.settling .close-control-pill, .viewer.settling .model-control-wrap, .viewer.settling .navigation-control-pill { background: #141413; -webkit-backdrop-filter: none; backdrop-filter: none; }
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
	.viewer-controls { position: fixed; z-index: 1100; left: 50%; bottom: 14px; width: max-content; max-width: calc(100vw - 24px); color: #fff; transform: translateX(-50%); pointer-events: none; }
	.viewer-toast { position: fixed; z-index: 1090; left: 50%; bottom: 74px; width: max-content; max-width: min(440px, calc(100vw - 32px)); padding: 11px 15px; border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 999px; background: #141413; color: rgba(255, 255, 255, 0.9); box-shadow: 0 14px 44px rgba(0, 0, 0, 0.34); font: 650 11px/1.35 'Inter Variable', Inter, sans-serif; text-align: center; transform: translateX(-50%); animation: viewer-toast-enter 220ms cubic-bezier(.22,1,.36,1) both; pointer-events: none; }
	@keyframes viewer-toast-enter { from { opacity: 0; transform: translate(-50%, 8px) scale(.97); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
	.viewer-controls-cluster { display: flex; max-width: 100%; align-items: center; justify-content: center; gap: 8px; pointer-events: auto; }
	.close-control-pill, .model-control-wrap, .navigation-control-pill { position: relative; display: flex; align-items: center; gap: 2px; padding: 4px; border: 1px solid rgba(255, 255, 255, 0.13); border-radius: 999px; background: rgba(20, 20, 19, 0.96); box-shadow: 0 14px 44px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08); -webkit-backdrop-filter: blur(18px) saturate(140%); backdrop-filter: blur(18px) saturate(140%); }
	.viewer-controls button, .viewer-id { height: 34px; border: 0; border-radius: 999px; background: transparent; color: #fff; box-shadow: none; pointer-events: auto; }
	.viewer-controls button { transition: background 160ms ease, color 160ms ease; }
	.viewer-controls button:hover, .viewer-controls button:focus-visible { background: rgba(255, 255, 255, 0.1); }
	.viewer-controls button:focus-visible { outline: 1px solid rgba(255, 255, 255, 0.7); outline-offset: -1px; }
	.close-control { display: grid; width: 34px; min-width: 34px; place-items: center; padding: 0; background: #fff !important; color: #111 !important; cursor: pointer; }
	.model-segment { display: flex; max-width: min(145px, calc(50vw - 135px)); align-items: center; gap: 7px; padding: 0 8px 0 11px; font: 700 10px/1 'Inter Variable', Inter, sans-serif; letter-spacing: -0.01em; white-space: nowrap; cursor: pointer; }
	.model-segment > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; }
	.model-separator { flex: none; margin: 0 -2px; color: rgba(255, 255, 255, 0.34); font: 600 10px/1 'Inter Variable', Inter, sans-serif; font-style: normal; }
	.model-control-wrap > .compare-control { display: grid; width: 34px; min-width: 34px; padding: 0; place-items: center; cursor: pointer; }
	.model-control-wrap > .compare-control.active { background: rgba(255, 255, 255, 0.14); }
	.model-segment :global(.model-control-chevron) { flex: none; color: rgba(255, 255, 255, 0.62); transition: transform 180ms cubic-bezier(.22,1,.36,1); }
	.model-segment.open :global(.model-control-chevron) { transform: rotate(180deg); }
	.compare-picker { position: absolute; z-index: 2; bottom: calc(100% + 12px); left: 50%; display: grid; width: 184px; gap: 3px; padding: 7px; border: 1px solid rgba(255, 255, 255, 0.14); border-radius: 15px; background: #141413; box-shadow: 0 18px 48px rgba(0, 0, 0, 0.46), inset 0 1px 0 rgba(255, 255, 255, 0.06); transform: translateX(-50%); transform-origin: 50% 100%; animation: compare-picker-enter 180ms cubic-bezier(.22,1,.36,1) both; }
	@keyframes compare-picker-enter { from { opacity: 0; transform: translate(-50%, 7px) scale(.96); } to { opacity: 1; transform: translate(-50%, 0) scale(1); } }
	.compare-picker-label { padding: 6px 8px 5px; color: rgba(255, 255, 255, 0.48); font: 700 9px/1 'Inter Variable', Inter, sans-serif; letter-spacing: 0.07em; text-transform: uppercase; }
	.viewer-controls .compare-picker button { display: flex; width: 100%; height: 36px; align-items: center; justify-content: space-between; padding: 0 10px; border-radius: 9px; color: rgba(255, 255, 255, 0.78); font: 650 11px/1 'Inter Variable', Inter, sans-serif; text-align: left; cursor: pointer; }
	.viewer-controls .compare-picker button:hover, .viewer-controls .compare-picker button:focus-visible, .viewer-controls .compare-picker button.selected { background: rgba(255, 255, 255, 0.1); color: #fff; }
	.compare-option i { width: 6px; height: 6px; border-radius: 50%; background: transparent; }
	.compare-option.selected i { background: #fff; box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.12); }
	.right-controls { display: flex; align-items: center; gap: 2px; pointer-events: auto; }
	.right-controls button { display: grid; min-width: 32px; padding: 0; place-items: center; cursor: pointer; }
	.right-controls .step-control { min-width: 35px; }
	.viewer-id { display: flex; min-width: 35px; align-items: center; justify-content: center; padding: 0 5px; font: 750 11px/1 ui-monospace, monospace; pointer-events: none; }

	@media (max-width: 1500px) {
		.intro h1 { font-size: clamp(64px, 6.8vw, 102px); }
	}

	@media (max-width: 1040px) {
		.site-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
		.site-card { contain-intrinsic-size: auto calc(clamp(250px, 34vw, 370px) + 55px); }
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
		.card-caption h3 { font-size: 18px; }
		.model-control-wrap { display: none; }
	}

	@media (hover: none), (pointer: coarse) {
		.model-control-wrap { display: none; }
	}

	@media (max-width: 430px) {
		.card-caption p { display: none; }
		.viewer-controls { bottom: 8px; max-width: calc(100vw - 12px); }
		.viewer-id { min-width: 31px; padding-inline: 3px; }
		.right-controls button { min-width: 30px; }
		.right-controls .step-control { min-width: 33px; }
	}

	@media (prefers-reduced-motion: reduce) {
		:global(html) { scroll-behavior: auto; }
		.preview-window, .return-to-top, .sticky-brand, .filter-buttons, .artifact-viewer-poster, .artifact-frame { transition: none; }
		.preview-button-wrap:hover .preview-window, .preview-button-wrap:focus-visible .preview-window { transform: none; }
		.collection-shell-side { animation: none !important; transform: scaleX(0) !important; }
		.collection-shell-corner { animation: none !important; transform: scale(0) !important; }
		.viewer.from-card .viewer-entry, .viewer.from-card .viewer-controls, .viewer-toast { animation: none; }
	}
</style>
