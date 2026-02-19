<script lang="ts">
	import { resolve } from '$app/paths';
	import LanguagesIcon from '@lucide/svelte/icons/languages';
	import GithubIcon from '@lucide/svelte/icons/github';
	import TwitterIcon from '@lucide/svelte/icons/twitter';
</script>

<footer class="border-t-3 border-ink bg-paper">
	<div class="mx-auto max-w-7xl px-4 py-12">
		<div class="grid gap-8 md:grid-cols-4">
			<div class="md:col-span-2">
				<div class="flex items-center gap-2">
					<div class="flex h-10 w-10 items-center justify-center rounded-lg bg-ink">
						<LanguagesIcon class="h-6 w-6 text-paper" />
					</div>
					<span class="font-display text-xl tracking-tight">ComicTranslate</span>
				</div>
				<p class="mt-4 max-w-sm font-body text-sm text-muted-foreground">
					The unified platform for manga and comic translation. OCR, translation, and typesetting in
					one seamless workflow.
				</p>
				<div class="mt-4 flex gap-4">
					<a
						href="https://github.com"
						class="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-ink transition-transform hover:scale-105"
						aria-label="GitHub"
					>
						<GithubIcon class="h-5 w-5" />
					</a>
					<a
						href="https://twitter.com"
						class="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-ink transition-transform hover:scale-105"
						aria-label="Twitter"
					>
						<TwitterIcon class="h-5 w-5" />
					</a>
				</div>
			</div>

			<div>
				<h4 class="font-display text-sm tracking-wide uppercase">Product</h4>
				<ul class="mt-4 space-y-2 font-body text-sm">
					<li>
						<a href={resolve('/#features')} class="text-muted-foreground hover:text-foreground"
							>Features</a
						>
					</li>
					<li>
						<a href={resolve('/#pricing')} class="text-muted-foreground hover:text-foreground"
							>Pricing</a
						>
					</li>
					<li>
						<button type="button" class="text-muted-foreground hover:text-foreground"
							>Roadmap</button
						>
					</li>
					<li>
						<button type="button" class="text-muted-foreground hover:text-foreground"
							>Changelog</button
						>
					</li>
				</ul>
			</div>

			<div>
				<h4 class="font-display text-sm tracking-wide uppercase">Company</h4>
				<ul class="mt-4 space-y-2 font-body text-sm">
					<li>
						<button type="button" class="text-muted-foreground hover:text-foreground">About</button>
					</li>
					<li>
						<button type="button" class="text-muted-foreground hover:text-foreground">Blog</button>
					</li>
					<li>
						<button type="button" class="text-muted-foreground hover:text-foreground"
							>Contact</button
						>
					</li>
					<li>
						<button type="button" class="text-muted-foreground hover:text-foreground"
							>Privacy</button
						>
					</li>
				</ul>
			</div>
		</div>

		<div class="mt-12 border-t-2 border-ink pt-8">
			<p class="text-center font-body text-xs text-muted-foreground">
				&copy; {new Date().getFullYear()} ComicTranslate. All rights reserved.
			</p>
		</div>
	</div>
</footer>
