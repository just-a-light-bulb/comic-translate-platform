<script lang="ts">
	import type { PageData } from './$types';
	import { base } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import Input from '$lib/components/ui/input/input.svelte';

	let { data }: { data: PageData } = $props();
	const statuses = ['draft', 'in_progress', 'review', 'done'];
</script>

<svelte:head>
	<title>{data.chapter.title} · Chapter · ComicTranslate</title>
</svelte:head>

<div class="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
	<a href="{base}/chapters" class="text-sm text-muted-foreground hover:underline"
		>← Back to chapters</a
	>

	<Card>
		<CardHeader>
			<CardTitle>Chapter {data.chapter.chapterNumber}</CardTitle>
			<CardDescription>Edit chapter details and project assignment.</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/update" class="space-y-3 rounded-lg border p-4">
				<label class="grid gap-2">
					<span class="text-sm font-medium">Project</span>
					<select
						name="projectId"
						class="rounded-md border bg-background px-3 py-2 text-sm"
						required
					>
						{#each data.projects as projectItem (projectItem.id)}
							<option value={projectItem.id} selected={projectItem.id === data.chapter.projectId}>
								{projectItem.name}
							</option>
						{/each}
					</select>
				</label>

				<label class="grid gap-2">
					<span class="text-sm font-medium">Title</span>
					<Input name="title" value={data.chapter.title} required />
				</label>

				<label class="grid gap-2">
					<span class="text-sm font-medium">Chapter number</span>
					<Input
						name="chapterNumber"
						type="number"
						min="1"
						value={data.chapter.chapterNumber}
						required
					/>
				</label>

				<label class="grid gap-2">
					<span class="text-sm font-medium">Status</span>
					<select name="status" class="rounded-md border bg-background px-3 py-2 text-sm" required>
						{#each statuses as status (status)}
							<option value={status} selected={status === data.chapter.status}>{status}</option>
						{/each}
					</select>
				</label>

				<div class="flex gap-2">
					<Button type="submit" variant="outline">Save changes</Button>
					<Button type="submit" formaction="?/delete" variant="destructive">Delete chapter</Button>
				</div>
			</form>
		</CardContent>
	</Card>
</div>
