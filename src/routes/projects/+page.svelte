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
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import FolderKanbanIcon from '@lucide/svelte/icons/folder-kanban';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import XIcon from '@lucide/svelte/icons/x';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let searchInput = $state(data.search);

	const formatDate = (value: Date | string) =>
		new Date(value).toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});

	function buildUrl(params: Record<string, string | number | undefined>) {
		const url = new URL(window.location.href);
		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== '') {
				url.searchParams.set(key, String(value));
			} else {
				url.searchParams.delete(key);
			}
		});
		return url.toString();
	}

	function handleSearch() {
		window.location.href = buildUrl({ search: searchInput || undefined, page: 1 });
	}

	function handleSort(field: string) {
		const newDir = data.sort === field && data.dir === 'asc' ? 'desc' : 'asc';
		window.location.href = buildUrl({ sort: field, dir: newDir, page: 1 });
	}

	function handlePageChange(page: number) {
		window.location.href = buildUrl({ page });
	}

	function clearSearch() {
		searchInput = '';
		window.location.href = buildUrl({ search: undefined, page: 1 });
	}

	function getSortIcon(field: string) {
		if (data.sort !== field) return ArrowUpDownIcon;
		return data.dir === 'asc' ? ArrowUpIcon : ArrowDownIcon;
	}
</script>

<svelte:head>
	<title>Projects · ComicTranslate</title>
</svelte:head>

<div class="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
	<div class="flex items-center gap-3">
		<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-ink">
			<FolderKanbanIcon class="h-6 w-6 text-paper" />
		</div>
		<div>
			<h1 class="font-display text-3xl">Projects</h1>
			<p class="text-sm text-muted-foreground">Manage all your comic translation projects</p>
		</div>
	</div>

	<Card class="manga-panel manga-shadow">
		<CardHeader>
			<CardTitle class="font-display">Create New Project</CardTitle>
			<CardDescription>Start a new manga translation project</CardDescription>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/create" class="flex flex-col gap-3 sm:flex-row">
				<Input name="name" placeholder="Project name" class="flex-1" required />
				<Input name="description" placeholder="Description (optional)" class="flex-1" />
				<Button
					type="submit"
					class="manga-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
				>
					<PlusIcon class="mr-2 h-4 w-4" />
					Create
				</Button>
			</form>
			{#if form?.error}
				<p class="mt-3 text-sm text-destructive">{form.error}</p>
			{/if}
		</CardContent>
	</Card>

	<Card class="manga-panel">
		<CardContent class="p-4">
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<form
					onsubmit={(e) => {
						e.preventDefault();
						handleSearch();
					}}
					class="relative flex-1"
				>
					<SearchIcon
						class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input bind:value={searchInput} placeholder="Search projects..." class="pr-9 pl-9" />
					{#if searchInput}
						<button
							type="button"
							onclick={clearSearch}
							class="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
						>
							<XIcon class="h-4 w-4" />
						</button>
					{/if}
				</form>
				<p class="text-sm text-muted-foreground">
					{data.pagination.totalItems} project{data.pagination.totalItems !== 1 ? 's' : ''}
				</p>
			</div>
		</CardContent>
	</Card>

	{#if data.projects.length === 0}
		<div class="rounded-lg border-2 border-dashed p-12 text-center">
			<FolderKanbanIcon class="mx-auto h-12 w-12 text-muted-foreground" />
			<p class="mt-4 font-display text-lg text-muted-foreground">
				{data.search ? 'No projects found' : 'No projects yet'}
			</p>
			<p class="mt-1 text-sm text-muted-foreground">
				{data.search ? 'Try a different search term' : 'Create your first project to get started'}
			</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each data.projects as item (item.id)}
				<Card class="manga-panel group transition-transform hover:translate-y-[-2px]">
					<CardContent class="p-4">
						<div class="flex items-center justify-between gap-3">
							<div class="flex-1">
								<a href="{base}/project/{item.id}" class="block">
									<h3 class="font-display text-lg hover:text-manga-accent">{item.name}</h3>
								</a>
								<p class="mt-1 line-clamp-1 text-sm text-muted-foreground">
									{item.description || 'No description'}
								</p>
								<div class="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
									<span class="flex items-center gap-1">
										<CalendarIcon class="h-3 w-3" />
										{formatDate(item.createdAt)}
									</span>
								</div>
							</div>
							<div class="flex items-center gap-2">
								<button
									type="button"
									onclick={() => handleSort('name')}
									class="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
									title="Sort by name"
								>
									<svelte:component this={getSortIcon('name')} class="h-4 w-4" />
								</button>
								<form method="POST" action="?/delete">
									<input type="hidden" name="id" value={item.id} />
									<Button
										type="submit"
										variant="ghost"
										size="icon"
										class="opacity-0 transition-opacity group-hover:opacity-100"
									>
										<Trash2Icon class="h-4 w-4 text-destructive" />
									</Button>
								</form>
							</div>
						</div>
					</CardContent>
				</Card>
			{/each}
		</div>

		{#if data.pagination.totalPages > 1}
			<div class="flex items-center justify-center gap-2">
				<Button
					variant="outline"
					size="icon"
					disabled={data.pagination.page <= 1}
					onclick={() => handlePageChange(data.pagination.page - 1)}
				>
					<ChevronLeftIcon class="h-4 w-4" />
				</Button>

				{#each Array.from({ length: Math.min(5, data.pagination.totalPages) }, (_, i) => {
					const start = Math.max(1, Math.min(data.pagination.page - 2, data.pagination.totalPages - 4));
					return start + i;
				}) as page (page)}
					<Button
						variant={page === data.pagination.page ? 'default' : 'outline'}
						size="icon"
						onclick={() => handlePageChange(page)}
					>
						{page}
					</Button>
				{/each}

				<Button
					variant="outline"
					size="icon"
					disabled={data.pagination.page >= data.pagination.totalPages}
					onclick={() => handlePageChange(data.pagination.page + 1)}
				>
					<ChevronRightIcon class="h-4 w-4" />
				</Button>
			</div>
		{/if}
	{/if}
</div>
