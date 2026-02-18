<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	let { children }: { children: import('svelte').Snippet } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>ComicTranslate - Sign In</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-paper">
	<main class="flex-1">
		{@render children()}
	</main>
</div>
