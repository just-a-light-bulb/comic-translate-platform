<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import ScanIcon from '@lucide/svelte/icons/scan';
	import LanguagesIcon from '@lucide/svelte/icons/languages';
	import TypeIcon from '@lucide/svelte/icons/type';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import UsersIcon from '@lucide/svelte/icons/users';
	import ZapIcon from '@lucide/svelte/icons/zap';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CheckIcon from '@lucide/svelte/icons/check';
	import type { UserType } from '@kinde-oss/kinde-typescript-sdk';

	let { data }: { data: { user: UserType | null } } = $props();
</script>

<svelte:head>
	<title>ComicTranslate - Unified Manga Translation Platform</title>
	<meta
		name="description"
		content="Translate manga and comics 10x faster. OCR, translation, and typesetting in one seamless workflow."
	/>
</svelte:head>

<section class="relative overflow-hidden bg-paper">
	<div class="speed-lines pointer-events-none absolute inset-0"></div>
	<div class="relative mx-auto max-w-7xl px-4 py-20 md:py-32">
		<div class="grid items-center gap-12 lg:grid-cols-2">
			<div>
				<div class="speech-bubble inline-block px-4 py-2">
					<span class="font-body text-sm font-medium">Now in Beta</span>
				</div>
				<h1 class="mt-6 font-display text-5xl leading-tight md:text-7xl">
					Translate Comics
					<span class="text-manga-accent">10x Faster</span>
				</h1>
				<p class="mt-6 max-w-lg font-body text-lg text-muted-foreground">
					OCR, translation, and typesetting in one seamless workflow. Stop juggling multiple apps
					and start translating like a pro.
				</p>
				<div class="mt-8 flex flex-col gap-4 sm:flex-row">
					{#if data.user}
						<Button
							size="lg"
							href="/dashboard"
							class="manga-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
						>
							Go to Dashboard
							<ArrowRightIcon class="ml-2 h-5 w-5" />
						</Button>
					{:else}
						<Button
							size="lg"
							href="/sign-up"
							class="manga-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
						>
							Start Free
							<ArrowRightIcon class="ml-2 h-5 w-5" />
						</Button>
						<Button size="lg" variant="outline" href="#how-it-works" class="ink-border">
							See How it Works
						</Button>
					{/if}
				</div>
				<div class="mt-8 flex items-center gap-6">
					<div class="flex -space-x-2">
						{#each [1, 2, 3, 4] as i (i)}
							<div
								class="flex h-10 w-10 items-center justify-center rounded-full border-2 border-ink bg-secondary font-display text-sm"
							>
								{['A', 'B', 'C', 'D'][i - 1]}
							</div>
						{/each}
					</div>
					<p class="font-body text-sm text-muted-foreground">
						<strong class="text-foreground">500+</strong> translators already onboard
					</p>
				</div>
			</div>
			<div class="relative hidden lg:block">
				<div class="manga-panel manga-shadow overflow-hidden rounded-lg p-4">
					<div class="aspect-[3/4] rounded bg-secondary">
						<div class="grid h-full grid-cols-2 gap-2 p-4">
							<div class="rounded border-2 border-dashed border-ink/20"></div>
							<div class="rounded border-2 border-dashed border-ink/20"></div>
							<div class="col-span-2 rounded border-2 border-dashed border-ink/20"></div>
							<div class="col-span-2 rounded border-2 border-dashed border-ink/20"></div>
						</div>
					</div>
				</div>
				<div class="speech-bubble absolute -top-8 -right-8 rotate-6 px-4 py-2">
					<span class="font-display text-sm">Hello!</span>
				</div>
				<div class="speech-bubble absolute -bottom-4 -left-8 -rotate-6 px-4 py-2">
					<span class="font-display text-sm">nihao!</span>
				</div>
			</div>
		</div>
	</div>
</section>

<section id="features" class="bg-secondary/50 py-20">
	<div class="mx-auto max-w-7xl px-4">
		<div class="text-center">
			<h2 class="font-display text-4xl md:text-5xl">Everything You Need</h2>
			<p class="mt-4 font-body text-lg text-muted-foreground">
				One platform, complete translation workflow
			</p>
		</div>
		<div class="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
			{#each [{ icon: ScanIcon, title: 'Smart OCR', description: 'Extract text from any manga panel with 99% accuracy. Supports handwritten and stylized fonts.' }, { icon: LanguagesIcon, title: 'AI Translation', description: 'Context-aware translations that preserve the original meaning and tone of the dialogue.' }, { icon: TypeIcon, title: 'Typesetting Tools', description: 'Professional typesetting with font matching, bubble fitting, and style preservation.' }, { icon: SparklesIcon, title: 'Quality Assurance', description: 'Built-in proofreading and consistency checks to ensure top-quality translations.' }, { icon: UsersIcon, title: 'Team Collaboration', description: 'Work together with your team in real-time. Assign roles and track progress.' }, { icon: ZapIcon, title: 'Export Anywhere', description: 'Export to all major formats. PNG, PSD, CBZ, or directly to your CMS.' }] as feature (feature.title)}
				<Card class="manga-panel group transition-transform hover:translate-y-[-4px]">
					<CardContent class="p-6">
						<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-ink">
							<feature.icon class="h-6 w-6 text-paper" />
						</div>
						<h3 class="mt-4 font-display text-xl">{feature.title}</h3>
						<p class="mt-2 font-body text-muted-foreground">{feature.description}</p>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
</section>

<section id="how-it-works" class="py-20">
	<div class="mx-auto max-w-7xl px-4">
		<div class="text-center">
			<h2 class="font-display text-4xl md:text-5xl">How It Works</h2>
			<p class="mt-4 font-body text-lg text-muted-foreground">
				Three simple steps to professional translations
			</p>
		</div>
		<div class="mt-16 grid gap-8 md:grid-cols-3">
			{#each [{ step: '01', title: 'Upload', description: 'Upload your manga images or import from URL. We support all major image formats.' }, { step: '02', title: 'Translate', description: 'Our AI extracts text and provides translations. Review and edit as needed.' }, { step: '03', title: 'Export', description: 'Typeset your translations and export in your preferred format.' }] as item (item.step)}
				<div class="relative">
					<div class="manga-panel manga-shadow rounded-lg p-8 text-center">
						<span class="font-display text-6xl text-manga-accent">{item.step}</span>
						<h3 class="mt-4 font-display text-2xl">{item.title}</h3>
						<p class="mt-2 font-body text-muted-foreground">{item.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<section id="pricing" class="bg-secondary/50 py-20">
	<div class="mx-auto max-w-7xl px-4">
		<div class="text-center">
			<h2 class="font-display text-4xl md:text-5xl">Simple Pricing</h2>
			<p class="mt-4 font-body text-lg text-muted-foreground">Start free, upgrade when you need</p>
		</div>
		<div class="mt-16 grid gap-8 md:grid-cols-3">
			<Card class="manga-panel">
				<CardContent class="p-6">
					<h3 class="font-display text-xl">Free</h3>
					<div class="mt-4">
						<span class="font-display text-4xl">$0</span>
						<span class="font-body text-muted-foreground">/month</span>
					</div>
					<ul class="mt-6 space-y-3 font-body text-sm">
						{#each ['10 pages/month', 'Basic OCR', '5 languages', 'PNG export'] as feature (feature)}
							<li class="flex items-center gap-2">
								<CheckIcon class="h-4 w-4 text-manga-accent" />
								{feature}
							</li>
						{/each}
					</ul>
					<Button variant="outline" class="ink-border mt-6 w-full">Get Started</Button>
				</CardContent>
			</Card>
			<Card class="manga-panel manga-shadow relative">
				<div class="absolute -top-3 left-1/2 -translate-x-1/2">
					<span class="rounded-full bg-manga-accent px-4 py-1 font-display text-xs text-paper">
						POPULAR
					</span>
				</div>
				<CardContent class="p-6">
					<h3 class="font-display text-xl">Pro</h3>
					<div class="mt-4">
						<span class="font-display text-4xl">$19</span>
						<span class="font-body text-muted-foreground">/month</span>
					</div>
					<ul class="mt-6 space-y-3 font-body text-sm">
						{#each ['Unlimited pages', 'Advanced OCR', '20+ languages', 'All export formats', 'Priority support'] as feature (feature)}
							<li class="flex items-center gap-2">
								<CheckIcon class="h-4 w-4 text-manga-accent" />
								{feature}
							</li>
						{/each}
					</ul>
					<Button class="mt-6 w-full">Start Free Trial</Button>
				</CardContent>
			</Card>
			<Card class="manga-panel">
				<CardContent class="p-6">
					<h3 class="font-display text-xl">Team</h3>
					<div class="mt-4">
						<span class="font-display text-4xl">$49</span>
						<span class="font-body text-muted-foreground">/month</span>
					</div>
					<ul class="mt-6 space-y-3 font-body text-sm">
						{#each ['Everything in Pro', '5 team members', 'Collaboration tools', 'Admin dashboard', 'API access'] as feature (feature)}
							<li class="flex items-center gap-2">
								<CheckIcon class="h-4 w-4 text-manga-accent" />
								{feature}
							</li>
						{/each}
					</ul>
					<Button variant="outline" class="ink-border mt-6 w-full">Contact Sales</Button>
				</CardContent>
			</Card>
		</div>
	</div>
</section>

<section class="py-20">
	<div class="mx-auto max-w-4xl px-4 text-center">
		<div class="manga-panel manga-shadow rounded-xl p-12">
			<h2 class="font-display text-3xl md:text-4xl">Ready to Translate Faster?</h2>
			<p class="mt-4 font-body text-lg text-muted-foreground">
				Join hundreds of translators already using ComicTranslate
			</p>
			<div class="mt-8">
				{#if data.user}
					<Button
						size="lg"
						href="/dashboard"
						class="manga-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
					>
						Go to Dashboard
					</Button>
				{:else}
					<Button
						size="lg"
						href="/sign-up"
						class="manga-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
					>
						Start Free Today
					</Button>
				{/if}
			</div>
		</div>
	</div>
</section>
