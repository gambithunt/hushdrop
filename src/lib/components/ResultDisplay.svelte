<script lang="ts">
	import { onMount } from 'svelte';

	interface AnalysisResult {
		transcript: string;
		summary: string;
		duration: number;
		language: string;
		model: string;
	}

	interface Props {
		result: AnalysisResult;
	}

	let { result }: Props = $props();
	let visible = $state(false);
	let copied = $state(false);

	onMount(() => {
		// Trigger animation after component mounts
		setTimeout(() => {
			visible = true;
		}, 100);
	});

	async function copyToClipboard() {
		try {
			const fullText = `SUMMARY:\n${result.summary}\n\nFULL TRANSCRIPT:\n${result.transcript}`;
			await navigator.clipboard.writeText(fullText);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	}

	function downloadAsText() {
		const fullText = `AUDIO ANALYSIS RESULTS
Generated: ${new Date().toLocaleString()}
Duration: ${result.duration}s
Language: ${result.language}
Model: ${result.model}

SUMMARY:
${result.summary}

FULL TRANSCRIPT:
${result.transcript}`;
		
		const blob = new Blob([fullText], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `audio-analysis-${new Date().toISOString().split('T')[0]}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}
</script>

<div
	class="transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-lg dark:shadow-gray-900/20 transition-all duration-700 {visible
		? 'translate-y-0 opacity-100'
		: 'translate-y-8 opacity-0'}"
>
	<!-- Header -->
	<div class="bg-gradient-to-r from-green-500 to-blue-500 px-8 py-6">
		<div class="flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div class="rounded-full bg-white/20 p-2">
					<svg class="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
				</div>
				<h2 class="text-2xl font-bold text-white">Analysis Complete</h2>
			</div>

			<div class="flex gap-2">
				<button
					onclick={copyToClipboard}
					class="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-white/30"
					title="Copy to clipboard"
				>
					{#if copied}
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M5 13l4 4L19 7"
							></path>
						</svg>
						Copied!
					{:else}
						<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
							></path>
						</svg>
						Copy
					{/if}
				</button>

				<button
					onclick={downloadAsText}
					class="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 font-medium text-white transition-colors duration-200 hover:bg-white/30"
					title="Download as text file"
				>
					<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
						></path>
					</svg>
					Download
				</button>
			</div>
		</div>
	</div>

	<!-- Content -->
	<div class="p-8">
		<div class="prose prose-lg max-w-none space-y-6">
			<!-- Summary Section -->
			<div class="rounded-xl border-l-4 border-green-500 dark:border-green-400 bg-green-50 dark:bg-green-900/20 p-6">
				<h3 class="text-lg font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
					</svg>
					AI Summary
				</h3>
				<div class="leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
					{result.summary}
				</div>
			</div>

			<!-- Transcript Section -->
			<div class="rounded-xl border-l-4 border-blue-500 dark:border-blue-400 bg-gray-50 dark:bg-gray-700/50 p-6">
				<h3 class="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-3 flex items-center gap-2">
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path>
					</svg>
					Full Transcript
				</h3>
				<div class="leading-relaxed whitespace-pre-wrap text-gray-800 dark:text-gray-200">
					{result.transcript || 'No speech detected in the audio file.'}
				</div>
			</div>
		</div>

		<!-- Stats -->
		<div class="mt-6 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
			<div class="flex items-center gap-2">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
					></path>
				</svg>
				Processed at {new Date().toLocaleTimeString()}
			</div>
			<div class="flex items-center gap-2">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
					></path>
				</svg>
				{result.transcript.split(' ').length} words
			</div>
			<div class="flex items-center gap-2">
				<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
				</svg>
				{result.duration}s • {result.language} • {result.model}
			</div>
		</div>
	</div>
</div>
