<script lang="ts">
	interface Props {
		message: string;
		onDismiss?: () => void;
	}
	
	let { message, onDismiss }: Props = $props();
</script>

<div class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
	<div class="flex items-center justify-between">
		<div class="flex items-center">
			<svg class="w-5 h-5 text-red-500 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
			</svg>
			<p class="text-red-800 dark:text-red-200 font-medium">{message}</p>
		</div>
		
		{#if onDismiss}
			<button
				onclick={onDismiss}
				aria-label="Dismiss error message"
				class="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors duration-200"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
				</svg>
			</button>
		{/if}
	</div>
</div>