<script lang="ts">
	import type { ActionData, PageData } from './$types';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Avatar, AvatarFallback } from '$lib/components/ui/avatar';
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import UserIcon from '@lucide/svelte/icons/user';
	import LogOutIcon from '@lucide/svelte/icons/log-out';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import FolderKanbanIcon from '@lucide/svelte/icons/folder-kanban';
	import BookOpenTextIcon from '@lucide/svelte/icons/book-open-text';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	const getDisplayName = () => data.profile?.displayName || data.user.given_name || '';

	const formatDate = (value: Date | string) =>
		new Date(value).toLocaleString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});

	const statusOptions = ['draft', 'in_progress', 'review', 'done'];
	const getProjectName = (projectId: number) =>
		data.projects.find((item) => item.id === projectId)?.name || `Project #${projectId}`;
</script>

<svelte:head>
	<title>Dashboard · ComicTranslate</title>
</svelte:head>

<div
	class="mx-auto grid w-full max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
>
	<section class="space-y-6">
		<Card class="manga-panel">
			<CardHeader>
				<CardTitle class="font-display text-2xl">Translation tasks</CardTitle>
				<CardDescription>
					Create, edit, and remove your current chapter tasks in one place.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					method="POST"
					action="?/createTask"
					class="grid gap-3 rounded-lg border-2 border-dashed p-4 sm:grid-cols-[1fr_100px_auto]"
				>
					<Input name="title" placeholder="Add task title..." required />
					<Input name="priority" type="number" min="1" max="5" value="1" required />
					<Button type="submit" class="w-full sm:w-auto">
						<PlusIcon class="mr-2 h-4 w-4" />
						Add
					</Button>
				</form>

				{#if form?.error}
					<p class="mt-3 text-sm text-destructive">{form.error}</p>
				{/if}

				<div class="mt-6 space-y-3">
					{#if data.tasks.length === 0}
						<p class="rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
							No tasks yet. Create your first translation task.
						</p>
					{:else}
						{#each data.tasks as item (item.id)}
							<form
								method="POST"
								action="?/updateTask"
								class="grid gap-3 rounded-lg border-2 p-4 sm:grid-cols-[1fr_100px_auto_auto]"
							>
								<input type="hidden" name="id" value={item.id} />
								<Input name="title" value={item.title} required />
								<Input
									name="priority"
									type="number"
									min="1"
									max="5"
									value={item.priority}
									required
								/>
								<Button type="submit" variant="outline">Save</Button>
								<Button type="submit" formaction="?/deleteTask" variant="destructive">
									<Trash2Icon class="mr-2 h-4 w-4" />
									Delete
								</Button>
								<p class="text-xs text-muted-foreground sm:col-span-4">
									Created {formatDate(item.createdAt)} · Priority {item.priority}/5
								</p>
							</form>
						{/each}
					{/if}
				</div>
			</CardContent>
		</Card>

		<Card class="manga-panel">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 font-display text-2xl">
					<FolderKanbanIcon class="h-5 w-5" />
					Projects CRUD
				</CardTitle>
				<CardDescription>
					Manage manga projects and chapter grouping from this dashboard.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					method="POST"
					action="?/createProject"
					class="grid gap-3 rounded-lg border-2 border-dashed p-4"
				>
					<Input name="name" placeholder="Project name" required />
					<Input name="description" placeholder="Optional project description" />
					<Button type="submit" class="w-full sm:w-fit">
						<PlusIcon class="mr-2 h-4 w-4" />
						Create project
					</Button>
				</form>

				<div class="mt-6 space-y-3">
					{#if data.projects.length === 0}
						<p class="rounded-lg border-2 border-dashed p-6 text-center text-muted-foreground">
							No projects yet.
						</p>
					{:else}
						{#each data.projects as item (item.id)}
							<form
								method="POST"
								action="?/updateProject"
								class="space-y-3 rounded-lg border-2 p-4"
							>
								<input type="hidden" name="id" value={item.id} />
								<Input name="name" value={item.name} required />
								<Input
									name="description"
									value={item.description || ''}
									placeholder="Description"
								/>
								<div class="flex flex-wrap gap-2">
									<Button type="submit" variant="outline">Save</Button>
									<Button type="submit" formaction="?/deleteProject" variant="destructive">
										<Trash2Icon class="mr-2 h-4 w-4" />
										Delete
									</Button>
								</div>
								<p class="text-xs text-muted-foreground">Created {formatDate(item.createdAt)}</p>
							</form>
						{/each}
					{/if}
				</div>
			</CardContent>
		</Card>

		<Card class="manga-panel">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 font-display text-2xl">
					<BookOpenTextIcon class="h-5 w-5" />
					Chapters CRUD
				</CardTitle>
				<CardDescription>Track chapter metadata by project, number, and status.</CardDescription>
			</CardHeader>
			<CardContent>
				{#if data.projects.length === 0}
					<p class="rounded-lg border-2 border-dashed p-6 text-center text-muted-foreground">
						Create a project first before adding chapters.
					</p>
				{:else}
					<form
						method="POST"
						action="?/createChapter"
						class="grid gap-3 rounded-lg border-2 border-dashed p-4"
					>
						<select
							name="projectId"
							class="rounded-md border-2 bg-background px-3 py-2 text-sm"
							required
						>
							<option value="" disabled selected>Select project</option>
							{#each data.projects as item (item.id)}
								<option value={item.id}>{item.name}</option>
							{/each}
						</select>
						<Input name="title" placeholder="Chapter title" required />
						<Input name="chapterNumber" type="number" min="1" value="1" required />
						<select
							name="status"
							class="rounded-md border-2 bg-background px-3 py-2 text-sm"
							required
						>
							{#each statusOptions as option (option)}
								<option value={option}>{option}</option>
							{/each}
						</select>
						<Button type="submit" class="w-full sm:w-fit">
							<PlusIcon class="mr-2 h-4 w-4" />
							Create chapter
						</Button>
					</form>
				{/if}

				<div class="mt-6 space-y-3">
					{#if data.chapters.length === 0}
						<p class="rounded-lg border-2 border-dashed p-6 text-center text-muted-foreground">
							No chapters yet.
						</p>
					{:else}
						{#each data.chapters as item (item.id)}
							<form
								method="POST"
								action="?/updateChapter"
								class="space-y-3 rounded-lg border-2 p-4"
							>
								<input type="hidden" name="id" value={item.id} />
								<select
									name="projectId"
									class="rounded-md border-2 bg-background px-3 py-2 text-sm"
									required
								>
									{#each data.projects as projectItem (projectItem.id)}
										<option value={projectItem.id} selected={projectItem.id === item.projectId}>
											{projectItem.name}
										</option>
									{/each}
								</select>
								<Input name="title" value={item.title} required />
								<Input
									name="chapterNumber"
									type="number"
									min="1"
									value={item.chapterNumber}
									required
								/>
								<select
									name="status"
									class="rounded-md border-2 bg-background px-3 py-2 text-sm"
									required
								>
									{#each statusOptions as option (option)}
										<option value={option} selected={option === item.status}>{option}</option>
									{/each}
								</select>
								<div class="flex flex-wrap gap-2">
									<Button type="submit" variant="outline">Save</Button>
									<Button type="submit" formaction="?/deleteChapter" variant="destructive">
										<Trash2Icon class="mr-2 h-4 w-4" />
										Delete
									</Button>
								</div>
								<p class="text-xs text-muted-foreground">
									{getProjectName(item.projectId)} · Chapter {item.chapterNumber} · {item.status}
								</p>
							</form>
						{/each}
					{/if}
				</div>
			</CardContent>
		</Card>
	</section>

	<aside id="account" class="space-y-6">
		<Card class="manga-panel manga-shadow">
			<CardHeader>
				<CardTitle class="flex items-center gap-2 font-display text-2xl">
					<UserIcon class="h-5 w-5" />
					Your account
				</CardTitle>
				<CardDescription>Display user information and manage your account profile.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex items-center gap-3">
					<Avatar class="h-12 w-12">
						<AvatarFallback class="bg-ink font-display text-paper">
							{data.user.given_name?.[0] || data.user.email?.[0]?.toUpperCase() || 'U'}
						</AvatarFallback>
					</Avatar>
					<div>
						<p class="font-medium">{getDisplayName() || 'Comic translator'}</p>
						<p class="text-sm text-muted-foreground">{data.user.email}</p>
					</div>
				</div>

				<Separator />

				<form method="POST" action="?/updateProfile" class="space-y-3">
					<label for="displayName" class="text-sm font-medium">Display name</label>
					<Input
						id="displayName"
						name="displayName"
						value={getDisplayName()}
						placeholder="How should we call you?"
					/>
					<Button type="submit" class="w-full" variant="outline">
						<ShieldCheckIcon class="mr-2 h-4 w-4" />
						Manage account profile
					</Button>
				</form>

				<Button href="/api/auth/logout" variant="destructive" class="w-full">
					<LogOutIcon class="mr-2 h-4 w-4" />
					Logout
				</Button>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle class="font-display text-lg">Quick tips</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2 text-sm text-muted-foreground">
				<p>• Priority 5 is urgent (release blocker).</p>
				<p>• Keep task titles short and action-oriented.</p>
				<p>• Group chapters under projects for cleaner tracking.</p>
			</CardContent>
		</Card>
	</aside>
</div>
