<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import Label from '$lib/components/ui/label/label.svelte';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Avatar from '$lib/components/ui/avatar/avatar.svelte';
	import AvatarFallback from '$lib/components/ui/avatar/avatar-fallback.svelte';
	import AvatarImage from '$lib/components/ui/avatar/avatar-image.svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import SunIcon from '@lucide/svelte/icons/sun';
	import MoonIcon from '@lucide/svelte/icons/moon';
	import UserIcon from '@lucide/svelte/icons/user';
	import KeyIcon from '@lucide/svelte/icons/key';
	import CheckIcon from '@lucide/svelte/icons/check';
	import Loader2Icon from '@lucide/svelte/icons/loader-2';
	import ArrowLeftIcon from '@lucide/svelte/icons/arrow-left';
	import PaletteIcon from '@lucide/svelte/icons/palette';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import RotateCcwIcon from '@lucide/svelte/icons/rotate-ccw';
	import ShieldIcon from '@lucide/svelte/icons/shield';

	let { data, form } = $props();

	let saving = $state(false);
	let displayName = $state(data.settings.displayName ?? data.user.givenName ?? '');
	let language = $state(data.settings.language ?? 'en');
	let theme = $state(data.settings.theme ?? 'light');

	const languages = [
		{ value: 'en', label: 'English', flag: '🇺🇸' },
		{ value: 'th', label: 'ภาษาไทย', flag: '🇹🇭' }
	];

	const themes = [
		{ value: 'light', label: 'Light', icon: SunIcon, description: 'Clean and bright' },
		{ value: 'dark', label: 'Dark', icon: MoonIcon, description: 'Easy on the eyes' }
	];

	function applyTheme(newTheme: string) {
		if (newTheme === 'dark') {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
		localStorage.setItem('theme', newTheme);
	}

	function handleThemeChange(newTheme: string) {
		theme = newTheme;
		applyTheme(newTheme);
	}

	function resetToDefaults() {
		displayName = data.user.givenName ?? '';
		language = 'en';
		theme = 'light';
		applyTheme('light');
		toast.info('Settings reset to defaults', {
			description: 'Click Save Changes to apply the reset.'
		});
	}

	$effect(() => {
		if (form?.success) {
			toast.success('Settings saved successfully!', {
				description: 'Your preferences have been updated.'
			});
			invalidateAll();
		}
	});

	$effect(() => {
		if (form?.error) {
			toast.error('Failed to save settings', {
				description: form.error
			});
		}
	});

	$effect(() => {
		applyTheme(theme);
	});
</script>

<svelte:head>
	<title>Settings - ComicTranslate</title>
</svelte:head>

<div class="min-h-screen bg-background px-4 py-8">
	<div class="mx-auto max-w-2xl">
		<!-- Header -->
		<div class="mb-8 flex items-center gap-4">
			<Button variant="ghost" size="icon" href="/" class="manga-shadow-sm">
				<ArrowLeftIcon class="h-5 w-5" />
			</Button>
			<div>
				<h1 class="font-display text-3xl">Settings</h1>
				<p class="text-muted-foreground">Manage your account preferences</p>
			</div>
		</div>

		<form
			method="POST"
			use:enhance={() => {
				saving = true;
				return async ({ update }) => {
					await update();
					saving = false;
				};
			}}
		>
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
						<Avatar class="h-16 w-16 border-2 border-ink">
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
							name="displayName"
							type="text"
							placeholder="Enter your display name"
							bind:value={displayName}
							maxlength={50}
							class="ink-border font-body"
						/>
						<p class="text-xs text-muted-foreground">
							This name will be displayed throughout the app. Maximum 50 characters.
						</p>
						{#if form?.errors?.displayName}
							<p class="text-xs text-destructive">{form.errors.displayName}</p>
						{/if}
					</div>
				</CardContent>
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
				<CardContent class="space-y-6">
					<!-- Theme Selector -->
					<div class="space-y-3">
						<Label class="font-body">Theme</Label>
						<div class="grid grid-cols-2 gap-3">
							{#each themes as t (t.value)}
								<button
									type="button"
									onclick={() => handleThemeChange(t.value)}
									class="flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all hover:border-ink
                                        {theme === t.value
										? 'border-ink bg-secondary'
										: 'border-border'}"
								>
									<svelte:component this={t.icon} class="h-6 w-6" />
									<div class="text-center">
										<span class="block font-body font-medium">{t.label}</span>
										<span class="text-xs text-muted-foreground">{t.description}</span>
									</div>
									<input
										type="radio"
										name="theme"
										value={t.value}
										checked={theme === t.value}
										class="sr-only"
									/>
								</button>
							{/each}
						</div>
						{#if form?.errors?.theme}
							<p class="text-xs text-destructive">{form.errors.theme}</p>
						{/if}
					</div>
				</CardContent>
			</Card>

			<!-- Language Section -->
			<Card class="manga-panel manga-shadow mb-6">
				<CardHeader>
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-ink">
							<GlobeIcon class="h-5 w-5 text-paper" />
						</div>
						<div>
							<CardTitle class="font-display">Language</CardTitle>
							<CardDescription>Choose your preferred language</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<div class="space-y-3">
						<Label for="language" class="font-body">Display Language</Label>
						<Select.Root type="single" name="language" bind:value={language}>
							<Select.Trigger class="ink-border w-full font-body">
								<span class="flex items-center gap-2">
									{#if language}
										{@const selectedLang = languages.find((l) => l.value === language)}
										<span class="text-xl">{selectedLang?.flag}</span>
										<span>{selectedLang?.label}</span>
									{:else}
										<span>Select a language</span>
									{/if}
								</span>
							</Select.Trigger>
							<Select.Content>
								{#each languages as lang (lang.value)}
									<Select.Item value={lang.value}>
										<span class="flex items-center gap-2">
											<span class="text-xl">{lang.flag}</span>
											<span>{lang.label}</span>
										</span>
									</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
						<p class="text-xs text-muted-foreground">
							This will change the language of the user interface.
						</p>
						{#if form?.errors?.language}
							<p class="text-xs text-destructive">{form.errors.language}</p>
						{/if}
					</div>
				</CardContent>
			</Card>

			<!-- Security Section -->
			<Card class="manga-panel manga-shadow mb-6">
				<CardHeader>
					<div class="flex items-center gap-3">
						<div class="flex h-10 w-10 items-center justify-center rounded-full bg-ink">
							<ShieldIcon class="h-5 w-5 text-paper" />
						</div>
						<div>
							<CardTitle class="font-display">Security</CardTitle>
							<CardDescription>Manage your account security</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent class="space-y-4">
					<div class="flex items-center justify-between">
						<div>
							<p class="font-body font-medium">Password & Account</p>
							<p class="text-sm text-muted-foreground">
								Your account is managed through Kinde authentication
							</p>
						</div>
						<Button
							variant="outline"
							href="https://app.kinde.com/manage-profile"
							target="_blank"
							rel="noopener noreferrer"
							class="ink-border font-body"
						>
							<KeyIcon class="mr-2 h-4 w-4" />
							Manage
						</Button>
					</div>
				</CardContent>
			</Card>

			<!-- Action Buttons -->
			<div class="flex flex-col gap-3 sm:flex-row sm:justify-between">
				<Button
					type="button"
					variant="outline"
					onclick={resetToDefaults}
					disabled={saving}
					class="ink-border font-body"
				>
					<RotateCcwIcon class="mr-2 h-4 w-4" />
					Reset to Defaults
				</Button>
				<Button
					type="submit"
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
			</div>
		</form>
	</div>
</div>
