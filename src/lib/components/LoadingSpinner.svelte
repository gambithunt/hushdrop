<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg';
		color?: string;
	}
	
	let { size = 'md', color = 'blue-500' }: Props = $props();
	
	const sizeClasses = {
		sm: 'h-4 w-4',
		md: 'h-8 w-8', 
		lg: 'h-12 w-12'
	};
</script>

<div class="flex items-center justify-center">
	<div class="animate-spin rounded-full border-2 border-gray-200 border-t-{color} {sizeClasses[size]}"></div>
</div>