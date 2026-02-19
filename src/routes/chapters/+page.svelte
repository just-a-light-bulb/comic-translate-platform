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
	import BookOpenTextIcon from '@lucide/svelte/icons/book-open-text';
	import FolderKanbanIcon from '@lucide/svelte/icons/folder-kanban';
	import SearchIcon from '@lucide/svelte/icons/search';
	import ChevronLeftIcon from '@lucide/svelte/icons/chevron-left';
	import ChevronRightIcon from '@lucide/svelte/icons/chevron-right';
	import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';
	import ArrowUpIcon from '@lucide/svelte/icons/arrow-up';
	import ArrowDownIcon from '@lucide/svelte/icons/arrow-down';
	import XIcon from '@lucide/svelte/icons/x';
	import FilterIcon from '@lucide/svelte/icons/filter';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let searchInput = $state(data.search);
	let showFilters = $state(false);

	const statusOptions = [
		{ value: 'draft', label: 'Draft', color: 'bg-secondary text-secondary-foreground' },
		{ value: 'in_progress', label: 'In Progress', color: 'bg-blue-500/20 text-blue-600' },
		{ value: 'review', label: 'Review', color: 'bg-yellow-500/20 text-yellow-600' },
		{ value: 'done', label: 'Done', color: 'bg-green-500/20 text-green-600' }
	];

	const projectNameById = (id: number) =>
		data.projects.find((item) => item.id === id)?.name || 'Unknown';

	const getStatusColor = (status: string) => {
		const option = statusOptions.find((o) => o.value === status);
		return option?.color || 'bg-secondary text-secondary-foreground';
	};

	function buildUrl(params: Record<string, string | number | undefined | string[]>) {
		const url = new URL(window.location.href);
		Object.entries(params).forEach(([key, value]) => {
			url.searchParams.delete(key);
			if (Array.isArray(value)) {
				value.forEach((v) => url.searchParams.append(key, v));
			} else if (value !== undefined && value !== '') {
				url.searchParams.set(key, String(value));
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

	function handleStatusToggle(status: string) {
		const newStatuses = data.statuses.includes(status as never)
			? data.statuses.filter((s) => s !== status)
			: [...data.statuses, status];
		window.location.href = buildUrl({ status: newStatuses, page: 1 });
	}

	function handleProjectFilter(projectId: number | null) {
		window.location.href = buildUrl({ projectId: projectId?.toString() || undefined, page: 1 });
	}

	function clearSearch() {
		searchInput = '';
		window.location.href = buildUrl({ search: undefined, page: 1 });
	}

	function clearFilters() {
		window.location.href = buildUrl({
			search: undefined,
			status: [],
			projectId: undefined,
			page: 1
		});
	}

	function getSortIcon(field: string) {
		if (data.sort !== field) return ArrowUpDownIcon;
		return data.dir === 'asc' ? ArrowUpIcon : ArrowDownIcon;
	}

	const hasActiveFilters = data.search || data.statuses.length > 0 || data.projectId;
</script>

<svelte:head>
	<title>Chapters · ComicTranslate</title>
</svelte:head>

<div class="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
	<div class="flex items-center gap-3">
		<div class="flex h-12 w-12 items-center justify-center rounded-lg bg-ink">
			<BookOpenTextIcon class="h-6 w-6 text-paper" />
		</div>
		<div>
			<h1 class="font-display text-3xl">Chapters</h1>
			<p class="text-sm text-muted-foreground">Browse and manage chapters across all projects</p>
		</div>
	</div>

	<Card class="manga-panel manga-shadow">
		<CardHeader>
			<CardTitle class="font-display">Create New Chapter</CardTitle>
			<CardDescription>Add a new chapter to your project</CardDescription>
		</CardHeader>
		<CardContent>
			{#if data.projects.length === 0}
				<div class="rounded-lg border-2 border-dashed p-6 text-center">
					<FolderKanbanIcon class="mx-auto h-8 w-8 text-muted-foreground" />
					<p class="mt-2 text-sm text-muted-foreground">
						<a href="{base}/projects" class="text-primary hover:underline">Create a project first</a
						> to add chapters.
					</p>
				</div>
			{:else}
				<form method="POST" action="?/create" class="grid gap-3 md:grid-cols-5">
					<select
						name="projectId"
						class="rounded-md border-2 border-ink/20 bg-background px-3 py-2 text-sm"
						required
					>
						<option value="" disabled selected>Select project</option>
						{#each data.projects as projectItem (projectItem.id)}
							<option value={projectItem.id}>{projectItem.name}</option>
						{/each}
					</select>
					<Input name="title" placeholder="Chapter title" class="md:col-span-2" required />
					<Input name="chapterNumber" type="number" min="1" value="1" required />
					<Button
						type="submit"
						class="manga-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
					>
						<PlusIcon class="mr-2 h-4 w-4" />
						Create
					</Button>
					<input type="hidden" name="status" value="draft" />
				</form>
			{/if}
			{#if form?.error}
				<p class="mt-3 text-sm text-destructive">{form.error}</p>
			{/if}
		</CardContent>
	</Card>

	<Card class="manga-panel">
		<CardContent class="p-4">
			<div class="space-y-4">
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
						<Input bind:value={searchInput} placeholder="Search chapters..." class="pr-9 pl-9" />
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
					<div class="flex items-center gap-2">
						<Button variant="outline" size="sm" onclick={() => (showFilters = !showFilters)}>
							<FilterIcon class="mr-2 h-4 w-4" />
							Filters
							{#if hasActiveFilters}
								<span class="ml-1 rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
									{[data.search && 1, data.statuses.length, data.projectId && 1]
										.filter(Boolean)
										.reduce((a, b) => (a || 0) + (b || 0), 0)}
								</span>
							{/if}
						</Button>
						{#if hasActiveFilters}
							<Button variant="ghost" size="sm" onclick={clearFilters}>Clear</Button>
						{/if}
					</div>
				</div>

				{#if showFilters}
					<div class="grid gap-4 rounded-lg border p-4 md:grid-cols-2">
						<div>
							<label class="mb-2 block text-sm font-medium">Filter by Project</label>
							<select
								class="w-full rounded-md border bg-background px-3 py-2 text-sm"
								value={data.projectId || ''}
								onchange={(e) => {
									const target = e.target as HTMLSelectElement;
									handleProjectFilter(target.value ? parseInt(target.value) : null);
								}}
							>
								<option value="">All projects</option>
								{#each data.projects as projectItem (projectItem.id)}
									<option value={projectItem.id}>{projectItem.name}</option>
								{/each}
							</select>
						</div>
						<div>
							<label class="mb-2 block text-sm font-medium">Filter by Status</label>
							<div class="flex flex-wrap gap-2">
								{#each statusOptions as option (option.value)}
									<button
										type="button"
										onclick={() => handleStatusToggle(option.value)}
										class="rounded-full px-3 py-1 text-sm transition-colors {data.statuses.includes(
											option.value as never
										)
											? option.color
											: 'border bg-background hover:bg-secondary'}"
									>
										{option.label}
									</button>
								{/each}
							</div>
						</div>
					</div>
				{/if}

				<p class="text-sm text-muted-foreground">
					{data.pagination.totalItems} chapter{data.pagination.totalItems !== 1 ? 's' : ''}
				</p>
			</div>
		</CardContent>
	</Card>

	{#if data.chapters.length === 0}
		<div class="rounded-lg border-2 border-dashed p-12 text-center">
			<BookOpenTextIcon class="mx-auto h-12 w-12 text-muted-foreground" />
			<p class="mt-4 font-display text-lg text-muted-foreground">
				{data.search || hasActiveFilters ? 'No chapters found' : 'No chapters yet'}
			</p>
			<p class="mt-1 text-sm text-muted-foreground">
				{data.search || hasActiveFilters
					? 'Try adjusting your search or filters'
					: 'Create your first chapter to get started'}
			</p>
		</div>
	{:else}
		<div class="space-y-3">
			{#each data.chapters as item (item.id)}
				<Card class="manga-panel group transition-transform hover:translate-y-[-2px]">
					<CardContent class="p-4">
						<div class="flex items-center justify-between gap-3">
							<div class="flex-1">
								<a href="{base}/chapter/{item.id}" class="group/title">
									<h3 class="font-display text-lg group-hover/title:text-manga-accent">
										Chapter {item.chapterNumber}: {item.title}
									</h3>
								</a>
								<div class="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
									<span class="flex items-center gap-1">
										<FolderKanbanIcon class="h-3 w-3" />
										{projectNameById(item.projectId)}
									</span>
									<span class="rounded-full px-2 py-0.5 text-xs {getStatusColor(item.status)}">
										{item.status.replace('_', ' ')}
									</span>
								</div>
							</div>
							<div class="flex items-center gap-1">
								<button
									type="button"
									onclick={() => handleSort('status')}
									class="rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
									title="Sort by status"
								>
									<svelte:component this={getSortIcon('status')} class="h-4 w-4" />
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
