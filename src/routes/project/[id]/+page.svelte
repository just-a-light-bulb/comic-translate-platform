<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import { base } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import Input from '$lib/components/ui/input/input.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
	const statuses = ['draft', 'in_progress', 'review', 'done'];
</script>

<svelte:head>
	<title>{data.project.name} · Project · ComicTranslate</title>
</svelte:head>

<div class="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
	<a href="{base}/projects" class="text-sm text-muted-foreground hover:underline"
		>← Back to projects</a
	>

	<Card>
		<CardHeader>
			<CardTitle>{data.project.name}</CardTitle>
			<CardDescription>Project details and chapter list.</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<form method="POST" action="?/updateProject" class="grid gap-3 rounded-lg border p-4">
				<Input name="name" value={data.project.name} required />
				<Input name="description" value={data.project.description || ''} />
				<div class="flex gap-2">
					<Button type="submit" variant="outline">Save</Button>
					<Button type="submit" formaction="?/deleteProject" variant="destructive"
						>Delete project</Button
					>
				</div>
			</form>

			{#if form?.error}
				<p class="text-sm text-destructive">{form.error}</p>
			{/if}
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>Chapters</CardTitle>
			<CardDescription>Create and manage chapters in this project.</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<form
				method="POST"
				action="?/createChapter"
				class="grid gap-3 rounded-lg border p-4 md:grid-cols-4"
			>
				<Input name="title" placeholder="Chapter title" class="md:col-span-2" required />
				<Input name="chapterNumber" type="number" min="1" value="1" required />
				<select name="status" class="rounded-md border bg-background px-3 py-2 text-sm" required>
					{#each statuses as status (status)}
						<option value={status}>{status}</option>
					{/each}
				</select>
				<Button type="submit" class="md:col-span-4 md:w-fit">Create chapter</Button>
			</form>

			<div class="space-y-3">
				{#if data.chapters.length === 0}
					<p class="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
						No chapters in this project yet.
					</p>
				{:else}
					{#each data.chapters as item (item.id)}
						<div class="rounded-lg border p-4">
							<div class="flex items-center justify-between gap-3">
								<a href="{base}/chapter/{item.id}" class="font-medium hover:underline">
									Chapter {item.chapterNumber}: {item.title}
								</a>
								<form method="POST" action="?/deleteChapter">
									<input type="hidden" name="id" value={item.id} />
									<Button type="submit" variant="destructive">Delete</Button>
								</form>
							</div>
							<p class="text-sm text-muted-foreground">Status: {item.status}</p>
						</div>
					{/each}
				{/if}
			</div>
		</CardContent>
	</Card>
</div>
