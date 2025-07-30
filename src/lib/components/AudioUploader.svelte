<script lang="ts">
	import { onMount } from 'svelte';
	import ErrorMessage from './ErrorMessage.svelte';
	
	interface AnalysisResult {
		transcript: string;
		summary: string;
		duration: number;
		language: string;
		model: string;
	}

	interface Props {
		isAnalyzing: boolean;
		onAnalysisStart: () => void;
		onAnalysisComplete: (result: AnalysisResult) => void;
	}
	
	let { isAnalyzing, onAnalysisStart, onAnalysisComplete }: Props = $props();
	
	let fileInput: HTMLInputElement;
	let dragActive = $state(false);
	let uploadProgress = $state(0);
	let selectedFile = $state<File | null>(null);
	let errorMessage = $state<string | null>(null);
	
	const acceptedTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg', 'audio/opus', 'audio/webm'];
	
	function handleDragEnter(e: DragEvent) {
		e.preventDefault();
		dragActive = true;
	}
	
	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		if (!e.currentTarget?.contains(e.relatedTarget as Node)) {
			dragActive = false;
		}
	}
	
	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}
	
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragActive = false;
		
		const files = e.dataTransfer?.files;
		if (files && files.length > 0) {
			handleFileSelection(files[0]);
		}
	}
	
	function handleFileInputChange(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			handleFileSelection(target.files[0]);
		}
	}
	
	function handleFileSelection(file: File) {
		errorMessage = null;
		
		if (!acceptedTypes.includes(file.type)) {
			errorMessage = 'Please select a valid audio file (MP3, WAV, M4A, OGG, OPUS, WebM)';
			return;
		}
		
		if (file.size > 50 * 1024 * 1024) { // 50MB limit
			errorMessage = 'File size must be less than 50MB';
			return;
		}
		
		selectedFile = file;
	}
	
	async function uploadAndAnalyze() {
		if (!selectedFile) return;
		
		onAnalysisStart();
		uploadProgress = 0;
		
		const formData = new FormData();
		formData.append('audio', selectedFile);
		
		try {
			const response = await fetch('/api/transcribe', {
				method: 'POST',
				body: formData
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
				throw new Error(errorData.error || `Upload failed with status ${response.status}`);
			}
			
			const result = await response.json();
			onAnalysisComplete(result);
			selectedFile = null;
			uploadProgress = 0;
		} catch (error) {
			console.error('Upload error:', error);
			errorMessage = error instanceof Error ? error.message : 'Failed to analyze audio. Please try again.';
		}
	}
	
	function clearSelection() {
		selectedFile = null;
		errorMessage = null;
		if (fileInput) fileInput.value = '';
	}
	
	function dismissError() {
		errorMessage = null;
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-2xl shadow-lg dark:shadow-gray-900/20 p-8 mb-8 transition-colors duration-300">
	{#if errorMessage}
		<ErrorMessage message={errorMessage} onDismiss={dismissError} />
	{/if}
	<!-- Upload Area -->
	<div
		role="button"
		tabindex="0"
		aria-label="Drag and drop audio files here or click to select files"
		class="relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 {dragActive
			? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-500'
			: selectedFile
				? 'border-green-400 bg-green-50 dark:bg-green-900/20 dark:border-green-500'
				: 'border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700/30'}"
		ondragenter={handleDragEnter}
		ondragleave={handleDragLeave}
		ondragover={handleDragOver}
		ondrop={handleDrop}
		onclick={() => fileInput.click()}
		onkeydown={(e) => e.key === 'Enter' && fileInput.click()}
	>
		{#if isAnalyzing}
			<!-- Analyzing State -->
			<div class="flex flex-col items-center">
				<div class="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mb-4"></div>
				<h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Analyzing your audio...</h3>
				<p class="text-gray-500 dark:text-gray-400">This may take a few moments</p>
			</div>
		{:else if selectedFile}
			<!-- File Selected State -->
			<div class="flex flex-col items-center">
				<div class="bg-green-100 dark:bg-green-900/30 rounded-full p-4 mb-4">
					<svg class="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
					</svg>
				</div>
				<h3 class="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">Ready to analyze</h3>
				<p class="text-gray-600 dark:text-gray-300 mb-4">{selectedFile.name}</p>
				<p class="text-sm text-gray-500 dark:text-gray-400 mb-6">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
				
				<div class="flex gap-3">
					<button
						onclick={uploadAndAnalyze}
						class="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
						</svg>
						Analyze Audio
					</button>
					<button
						onclick={clearSelection}
						class="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
					>
						Clear
					</button>
				</div>
			</div>
		{:else}
			<!-- Default Upload State -->
			<div class="flex flex-col items-center">
				<div class="bg-blue-100 dark:bg-blue-900/30 rounded-full p-6 mb-6">
					<svg class="w-12 h-12 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
					</svg>
				</div>
				
				<h3 class="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-3">
					Drop your audio file here
				</h3>
				<p class="text-gray-500 dark:text-gray-400 mb-6">
					or click to browse your files
				</p>
				
				<button
					onclick={() => fileInput.click()}
					class="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
					</svg>
					Choose File
				</button>
				
				<p class="text-sm text-gray-400 dark:text-gray-500 mt-4">
					Supports MP3, WAV, M4A, OGG, OPUS, WebM • Max 50MB
				</p>
			</div>
		{/if}
		
		<!-- Hidden file input -->
		<input
			bind:this={fileInput}
			type="file"
			accept="audio/*"
			onchange={handleFileInputChange}
			class="hidden"
		/>
	</div>
</div>

<style>
	/* Component styles if needed */
</style>