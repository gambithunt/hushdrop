<script lang="ts">
	import AudioUploader from '$lib/components/AudioUploader.svelte';
	import ResultDisplay from '$lib/components/ResultDisplay.svelte';
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	
	interface AnalysisResult {
		transcript: string;
		summary: string;
		duration: number;
		language: string;
		model: string;
	}

	let analysisResult = $state<AnalysisResult | null>(null);
	let isAnalyzing = $state(false);
	
	function handleAnalysisComplete(result: AnalysisResult) {
		analysisResult = result;
		isAnalyzing = false;
	}
	
	function handleAnalysisStart() {
		isAnalyzing = true;
		analysisResult = null;
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 transition-colors duration-300">
	<div class="container mx-auto px-4 py-8">
		<!-- Theme Toggle -->
		<div class="flex justify-end mb-8">
			<ThemeToggle />
		</div>
		
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl font-bold text-gray-800 dark:text-white mb-4">
				🎵 HushDrop
			</h1>
			<p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
				Drop your audio files and get instant AI-powered transcription and summaries. 
				Simple, fast, and secure.
			</p>
		</div>
		
		<!-- Main Content -->
		<div class="max-w-4xl mx-auto">
			<AudioUploader 
				{isAnalyzing}
				onAnalysisStart={handleAnalysisStart}
				onAnalysisComplete={handleAnalysisComplete}
			/>
			
			{#if analysisResult}
				<ResultDisplay result={analysisResult} />
			{/if}
		</div>
	</div>
</div>
