<script lang="ts">
	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="preload" href="/fonts/eb-garamond-500.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
	<link rel="preload" href="/fonts/inter-variable.woff2" as="font" type="font/woff2" crossorigin="anonymous" />
</svelte:head>
{@render children()}
