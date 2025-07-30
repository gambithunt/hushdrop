<script lang="ts">
	import { theme, type Theme } from '$lib/stores/theme';
	import { onMount } from 'svelte';
	
	let currentTheme: Theme = $state('system');
	let isOpen = $state(false);
	
	onMount(() => {
		theme.init();
		const unsubscribe = theme.subscribe(value => {
			currentTheme = value;
		});
		
		return unsubscribe;
	});
	
	function setTheme(newTheme: Theme) {
		theme.setTheme(newTheme);
		isOpen = false;
	}
	
	function toggleDropdown() {
		isOpen = !isOpen;
	}
	
	// Close dropdown when clicking outside
	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.theme-dropdown')) {
			isOpen = false;
		}
	}
	
	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});
</script>

<div class="relative theme-dropdown">
	<button
		onclick={toggleDropdown}
		class="p-2 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-gray-800/50 dark:hover:bg-gray-700/50 transition-colors duration-200 backdrop-blur-sm"
		title="Toggle theme"
	>
		{#if currentTheme === 'light'}
			<!-- Sun icon -->
			<svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
			</svg>
		{:else if currentTheme === 'dark'}
			<!-- Moon icon -->
			<svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
			</svg>
		{:else}
			<!-- System/Auto icon -->
			<svg class="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
			</svg>
		{/if}
	</button>
	
	{#if isOpen}
		<div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
			<button
				onclick={() => setTheme('light')}
				class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 {currentTheme === 'light' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
				</svg>
				Light
			</button>
			
			<button
				onclick={() => setTheme('dark')}
				class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 {currentTheme === 'dark' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
				</svg>
				Dark
			</button>
			
			<button
				onclick={() => setTheme('system')}
				class="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-3 text-gray-700 dark:text-gray-300 {currentTheme === 'system' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''}"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
				</svg>
				System
			</button>
		</div>
	{/if}
</div>