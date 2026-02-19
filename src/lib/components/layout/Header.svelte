<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import LayoutDashboardIcon from '@lucide/svelte/icons/layout-dashboard';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import XIcon from '@lucide/svelte/icons/x';
	import LanguagesIcon from '@lucide/svelte/icons/languages';
	import FolderKanbanIcon from '@lucide/svelte/icons/folder-kanban';
	import BookOpenTextIcon from '@lucide/svelte/icons/book-open-text';
	import type { UserType } from '@kinde-oss/kinde-typescript-sdk';

	let mobileMenuOpen = $state(false);
	let user = $state<UserType | null>(null);

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}

	async function handleSignOut() {
		window.location.href = '/api/auth/logout';
	}

	onMount(async () => {
		try {
			const response = await fetch('/api/auth/health');
			if (response.ok) {
				const data = await response.json();
				user = data.user;
			}
		} catch {
			user = null;
		}
	});
</script>

<header class="sticky top-0 z-50 border-b-3 border-ink bg-paper/95 backdrop-blur-sm">
	<div class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
		<a href="/" class="flex items-center gap-2">
			<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-ink">
				<LanguagesIcon class="h-6 w-6 text-paper" />
			</div>
			<span class="font-display text-xl tracking-tight">ComicTranslate</span>
		</a>

		<!-- eslint-disable svelte/no-navigation-without-resolve -->
		<nav class="hidden items-center gap-8 md:flex">
			{#if user}
				<a
					href="/projects"
					class="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					Projects
				</a>
				<a
					href="/chapters"
					class="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					Chapters
				</a>
			{:else}
				<a
					href="/#features"
					class="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					Features
				</a>
				<a
					href="/#how-it-works"
					class="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					How it Works
				</a>
				<a
					href="/#pricing"
					class="font-body text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					Pricing
				</a>
			{/if}
		</nav>
		<!-- eslint-enable svelte/no-navigation-without-resolve -->

		<div class="hidden items-center gap-4 md:flex">
			{#if user}
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						<Button variant="ghost" class="gap-2">
							<Avatar class="h-8 w-8">
								<AvatarFallback class="bg-ink font-display text-sm text-paper">
									{user.given_name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
								</AvatarFallback>
							</Avatar>
							<span class="font-body">{user.given_name || user.email?.split('@')[0] || 'User'}</span
							>
						</Button>
					</DropdownMenu.Trigger>
					<DropdownMenu.Content align="end">
						<DropdownMenu.Item>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href="/dashboard" class="flex items-center">
								<LayoutDashboardIcon class="mr-2 h-4 w-4" />
								Dashboard
							</a>
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href="/projects" class="flex items-center">
								<FolderKanbanIcon class="mr-2 h-4 w-4" />
								Projects
							</a>
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href="/chapters" class="flex items-center">
								<BookOpenTextIcon class="mr-2 h-4 w-4" />
								Chapters
							</a>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item>
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a href="/settings" class="flex items-center">
								<SettingsIcon class="mr-2 h-4 w-4" />
								Settings
							</a>
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onclick={handleSignOut}>
							<LogOutIcon class="mr-2 h-4 w-4" />
							Sign Out
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			{:else}
				<Button variant="ghost" href="/api/auth/login">Sign In</Button>
				<Button
					href="/api/auth/register"
					class="manga-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
				>
					Get Started
				</Button>
			{/if}
		</div>

		<button
			class="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-ink md:hidden"
			onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			aria-label="Toggle menu"
		>
			{#if mobileMenuOpen}
				<XIcon class="h-5 w-5" />
			{:else}
				<MenuIcon class="h-5 w-5" />
			{/if}
		</button>
	</div>

	{#if mobileMenuOpen}
		<div class="border-t-2 border-ink bg-paper p-4 md:hidden">
			<nav class="flex flex-col gap-4">
				{#if user}
					<Button href="/dashboard" onclick={closeMobileMenu} variant="outline" class="w-full">
						<LayoutDashboardIcon class="mr-2 h-4 w-4" />
						Dashboard
					</Button>
					<Button href="/projects" onclick={closeMobileMenu} variant="outline" class="w-full">
						<FolderKanbanIcon class="mr-2 h-4 w-4" />
						Projects
					</Button>
					<Button href="/chapters" onclick={closeMobileMenu} variant="outline" class="w-full">
						<BookOpenTextIcon class="mr-2 h-4 w-4" />
						Chapters
					</Button>
					<hr class="border-ink" />
					<Button href="/settings" onclick={closeMobileMenu} variant="outline" class="w-full">
						<SettingsIcon class="mr-2 h-4 w-4" />
						Settings
					</Button>
					<Button onclick={handleSignOut} variant="destructive" class="w-full">Sign Out</Button>
				{:else}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href="/#features" class="font-body font-medium" onclick={closeMobileMenu}>Features</a>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href="/#how-it-works" class="font-body font-medium" onclick={closeMobileMenu}
						>How it Works</a
					>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href="/#pricing" class="font-body font-medium" onclick={closeMobileMenu}>Pricing</a>
					<hr class="border-ink" />
					<div class="flex flex-col gap-2">
						<Button href="/api/auth/login" variant="outline" class="w-full">Sign In</Button>
						<Button href="/api/auth/register" class="w-full">Get Started</Button>
					</div>
				{/if}
			</nav>
		</div>
	{/if}
</header>
