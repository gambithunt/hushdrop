<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme';

	let { children } = $props();
	
	onMount(() => {
		theme.init();
	});
</script>

<main class="min-h-screen">
	{@render children()}
</main>
