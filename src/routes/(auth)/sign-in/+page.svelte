<script lang="ts">
	import Card from '$lib/components/ui/card/card.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import GithubIcon from '@lucide/svelte/icons/github';

	let { data }: { data: { error?: string } } = $props();
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-12">
	<Card class="manga-panel manga-shadow w-full max-w-md">
		<CardHeader class="text-center">
			<CardTitle class="font-display text-2xl">Welcome back</CardTitle>
			<CardDescription>Sign in to your account to continue</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			{#if data.error}
				<div class="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
					{data.error}
				</div>
			{/if}
			<div class="space-y-2">
				<Button
					href="/api/auth/login"
					class="manga-shadow-sm w-full hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
				>
					Sign in with Email
				</Button>
				<Button
					href="/api/auth/login?connection_id=github"
					variant="outline"
					class="ink-border w-full"
				>
					<GithubIcon class="mr-2 h-4 w-4" />
					Sign in with GitHub
				</Button>
				<Button
					href="/api/auth/login?connection_id=google"
					variant="outline"
					class="ink-border w-full"
				>
					<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
						<path
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
						/>
					</svg>
					Sign in with Google
				</Button>
			</div>
		</CardContent>
		<div class="p-6 pt-0 text-center">
			<p class="text-sm text-muted-foreground">
				Don't have an account?
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href="/api/auth/register" class="text-primary underline-offset-4 hover:underline"
					>Sign up</a
				>
			</p>
		</div>
	</Card>
</div>
