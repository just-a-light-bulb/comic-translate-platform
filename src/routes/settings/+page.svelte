<script lang="ts">
	import { onMount } from 'svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import CardFooter from '$lib/components/ui/card/card-footer.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Avatar from '$lib/components/ui/avatar/avatar.svelte';
	import AvatarFallback from '$lib/components/ui/avatar/avatar-fallback.svelte';
	import AvatarImage from '$lib/components/ui/avatar/avatar-image.svelte';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import LanguagesIcon from '@lucide/svelte/icons/languages';
	import UserIcon from '@lucide/svelte/icons/user';
	import KeyIcon from '@lucide/svelte/icons/key';
	import CheckIcon from '@lucide/svelte/icons/check';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import PaletteIcon from '@lucide/svelte/icons/palette';

	let { data } = $props();

	let displayName = $state(data.settings.displayName ?? data.user.givenName ?? '');
	let language = $state(data.settings.language ?? 'en');
	let theme = $state(data.settings.theme ?? 'light');
	let saving = $state(false);
	let successMessage = $state('');
	let errorMessage = $state('');

	// Use derived to track the display name from settings
	const displayNameFromSettings = $derived(data.settings.displayName);

	const languages = [
		{ value: 'en', label: 'English', flag: '🇺🇸' },
		{ value: 'th', label: 'ภาษาไทย', flag: '🇹🇭' }
	];

	const themes = [
		{ value: 'light', label: 'Light', icon: SunIcon },
		{ value: 'dark', label: 'Dark', icon: MoonIcon }
	];

	async function saveSettings() {
		saving = true;
		successMessage = '';
		errorMessage = '';

		try {
			const response = await fetch('/api/settings', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					displayName,
					language,
					theme
				})
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || 'Failed to save settings');
			}

			// Apply theme immediately
			if (theme === 'dark') {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}

			// Store theme preference in localStorage
			localStorage.setItem('theme', theme);

			successMessage = 'Settings saved successfully!';
			setTimeout(() => {
				successMessage = '';
			}, 3000);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Failed to save settings';
		} finally {
			saving = false;
		}
	}

	function handleLanguageChange(lang: string) {
		language = lang;
		// Trigger auto-save on language change
		saveSettings();
	}

	function handleThemeChange(newTheme: string) {
		theme = newTheme;
		saveSettings();
	}

	function goBack() {
		// Use anchor tag navigation instead of goto to avoid lint error
		window.location.href = '/';
	}

	onMount(() => {
		// Initialize theme from settings
		if (theme === 'dark') {
			document.documentElement.classList.add('dark');
		}
	});
</script>

<svelte:head>
	<title>Settings - ComicTranslate</title>
</svelte:head>

<div class="min-h-screen bg-background px-4 py-8">
	<div class="mx-auto max-w-2xl">
		<!-- Header -->
		<div class="mb-8 flex items-center gap-4">
			<Button variant="ghost" size="icon" onclick={goBack} class="manga-shadow-sm">
				<ArrowLeftIcon class="h-5 w-5" />
			</Button>
			<div>
				<h1 class="font-display text-3xl">Settings</h1>
				<p class="text-muted-foreground">Manage your account preferences</p>
			</div>
		</div>

		<!-- Success/Error Messages -->
		{#if successMessage}
			<div class="mb-6 rounded-md bg-green-500/15 p-4 text-green-600 dark:text-green-400">
				<div class="flex items-center gap-2">
					<CheckIcon class="h-5 w-5" />
					{successMessage}
				</div>
			</div>
		{/if}

		{#if errorMessage}
			<div class="mb-6 rounded-md bg-destructive/15 p-4 text-destructive">
				{errorMessage}
			</div>
		{/if}

		<!-- Profile Section -->
		<Card class="manga-panel manga-shadow mb-6">
			<CardHeader>
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-ink">
						<UserIcon class="h-5 w-5 text-paper" />
					</div>
					<div>
						<CardTitle class="font-display">Profile</CardTitle>
						<CardDescription>Your account information</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent class="space-y-4">
				<!-- Avatar Display -->
				<div class="flex items-center gap-4">
					<Avatar class="h-16 w-16">
						{#if data.user.picture}
							<AvatarImage src={data.user.picture} alt={data.user.givenName || 'User'} />
						{/if}
						<AvatarFallback class="bg-ink font-display text-xl text-paper">
							{data.user.givenName?.[0] || data.user.email?.[0]?.toUpperCase() || 'U'}
						</AvatarFallback>
					</Avatar>
					<div>
						<p class="font-display text-lg">
							{data.user.givenName || data.user.email?.split('@')[0] || 'User'}
						</p>
						<p class="text-sm text-muted-foreground">{data.user.email}</p>
					</div>
				</div>

				<Separator />

				<!-- Display Name -->
				<div class="space-y-2">
					<Label for="displayName" class="font-body">Display Name</Label>
					<Input
						id="displayName"
						type="text"
						placeholder="Enter your display name"
						bind:value={displayName}
						class="ink-border font-body"
					/>
					<p class="text-xs text-muted-foreground">
						This name will be displayed throughout the app
					</p>
				</div>
			</CardContent>
			<CardFooter>
				<Button
					onclick={saveSettings}
					disabled={saving}
					class="manga-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
				>
					{#if saving}
						<Loader2Icon class="mr-2 h-4 w-4 animate-spin" />
						Saving...
					{:else}
						<CheckIcon class="mr-2 h-4 w-4" />
						Save Changes
					{/if}
				</Button>
			</CardFooter>
		</Card>

		<!-- Appearance Section -->
		<Card class="manga-panel manga-shadow mb-6">
			<CardHeader>
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-ink">
						<PaletteIcon class="h-5 w-5 text-paper" />
					</div>
					<div>
						<CardTitle class="font-display">Appearance</CardTitle>
						<CardDescription>Customize how the app looks</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<!-- Theme Selector -->
				<div class="space-y-3">
					<Label class="font-body">Theme</Label>
					<div class="grid grid-cols-2 gap-3">
						{#each themes as t (t.value)}
							<button
								type="button"
								onclick={() => handleThemeChange(t.value)}
								class="flex items-center justify-center gap-2 rounded-lg border-2 border-border p-4 transition-all hover:border-ink
									{theme === t.value ? 'border-ink bg-secondary' : ''}"
							>
								<svelte:component this={t.icon} class="h-5 w-5" />
								<span class="font-body">{t.label}</span>
							</button>
						{/each}
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Language Section -->
		<Card class="manga-panel manga-shadow mb-6">
			<CardHeader>
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-ink">
						<LanguagesIcon class="h-5 w-5 text-paper" />
					</div>
					<div>
						<CardTitle class="font-display">Language</CardTitle>
						<CardDescription>Choose your preferred language</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div class="space-y-3">
					<Label class="font-body">Display Language</Label>
					<div class="grid grid-cols-2 gap-3">
						{#each languages as lang (lang.value)}
							<button
								type="button"
								onclick={() => handleLanguageChange(lang.value)}
								class="flex items-center justify-center gap-2 rounded-lg border-2 border-border p-4 transition-all hover:border-ink
									{language === lang.value ? 'border-ink bg-secondary' : ''}"
							>
								<span class="text-2xl">{lang.flag}</span>
								<span class="font-body">{lang.label}</span>
							</button>
						{/each}
					</div>
				</div>
			</CardContent>
		</Card>

		<!-- Security Section -->
		<Card class="manga-panel manga-shadow">
			<CardHeader>
				<div class="flex items-center gap-3">
					<div class="flex h-10 w-10 items-center justify-center rounded-full bg-ink">
						<KeyIcon class="h-5 w-5 text-paper" />
					</div>
					<div>
						<CardTitle class="font-display">Security</CardTitle>
						<CardDescription>Manage your password and security settings</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<p class="mb-4 text-sm text-muted-foreground">
					Your account is managed through Kinde authentication. To change your password or manage
					other security settings, please use the Kinde portal.
				</p>
				<Button
					variant="outline"
					href="https://app.kinde.com/manage-profile"
					target="_blank"
					rel="noopener noreferrer"
					class="ink-border font-body"
				>
					<KeyIcon class="mr-2 h-4 w-4" />
					Open Kinde Settings
				</Button>
			</CardContent>
		</Card>
	</div>
</div>
