<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import { resolve } from '$app/paths';
	import Button from '$lib/components/ui/button/button.svelte';
	import Card from '$lib/components/ui/card/card.svelte';
	import CardContent from '$lib/components/ui/card/card-content.svelte';
	import CardDescription from '$lib/components/ui/card/card-description.svelte';
	import CardHeader from '$lib/components/ui/card/card-header.svelte';
	import CardTitle from '$lib/components/ui/card/card-title.svelte';
	import Input from '$lib/components/ui/input/input.svelte';
	import { PaneGroup, Pane, Handle } from '$lib/components/ui/resizable';
	import CanvasEditor from '$lib/components/canvas-editor/CanvasEditor.svelte';
	import TranslationGrid from '$lib/components/canvas-editor/TranslationGrid.svelte';
	import { canvasStore } from '$lib/components/canvas-editor/stores';
	import type { TextElement } from '$lib/components/canvas-editor/types/elements';
	import UploadIcon from '@lucide/svelte/icons/upload';
	import ImageIcon from '@lucide/svelte/icons/image';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';

	const base = '';

	let { data }: { data: PageData } = $props();
	const statuses = ['draft', 'in_progress', 'review', 'done'];

	let showEditor = $state(true);
	let selectedPageId = $state<number | null>(null);
	let currentElements = $state<TextElement[]>([]);
	let pages = $state(data.pages);
	let isUploading = $state(false);

	$effect(() => {
		if (pages.length > 0 && selectedPageId === null) {
			selectedPageId = pages[0].id;
		}
	});

	function convertDbElementsToCanvas(dbElements: typeof data.firstPageElements): TextElement[] {
		return dbElements.map((el, idx) => ({
			id: String(el.id),
			type: 'text' as const,
			x: el.x,
			y: el.y,
			width: el.width,
			height: el.height,
			rotation: el.rotation,
			opacity: 1,
			visible: true,
			locked: false,
			zIndex: idx,
			text: {
				content: el.translatedText || el.originalText,
				originalContent: el.originalText,
				translatedContent: el.translatedText || '',
				fontFamily: el.fontFamily,
				fontSize: el.fontSize,
				fontWeight: el.fontWeight,
				fontStyle: el.fontStyle,
				textAlign: el.textAlign as 'left' | 'center' | 'right',
				verticalAlign: 'middle' as const,
				fill: el.fill,
				stroke: '',
				strokeWidth: 0,
				lineHeight: 1.2,
				status: el.status as 'pending' | 'translated' | 'reviewed'
			}
		}));
	}

	onMount(() => {
		if (data.firstPageElements.length > 0) {
			currentElements = convertDbElementsToCanvas(data.firstPageElements);
			canvasStore.setElements(currentElements);
		}
		if (pages.length > 0) {
			const firstPage = pages[0];
			canvasStore.setBackgroundImage(firstPage.imageUrl);
			canvasStore.setDimensions(firstPage.width, firstPage.height);
		}
	});

	async function loadPageElements(pageId: number) {
		const res = await fetch(`${base}/api/page/${pageId}/elements`);
		if (res.ok) {
			const { elements } = await res.json();
			currentElements = convertDbElementsToCanvas(elements);
			canvasStore.clearElements();
			currentElements.forEach((el) => {
				canvasStore.addElement({
					type: 'text',
					x: el.x,
					y: el.y,
					width: el.width,
					height: el.height,
					rotation: el.rotation,
					opacity: el.opacity,
					visible: el.visible,
					locked: el.locked,
					text: el.text
				});
			});
		}
	}

	function handlePageSelect(pageId: number) {
		selectedPageId = pageId;
		const selectedPage = pages.find((p) => p.id === pageId);
		if (selectedPage) {
			canvasStore.setBackgroundImage(selectedPage.imageUrl);
			canvasStore.setDimensions(selectedPage.width, selectedPage.height);
		}
		loadPageElements(pageId);
	}

	async function handleElementUpdate(id: string, updates: Partial<TextElement['text']>) {
		const el = currentElements.find((e) => e.id === id);
		if (el) {
			canvasStore.updateTextElement(id, updates);
			await fetch(`${base}/api/element/${id}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					translatedText: updates.translatedContent,
					status: updates.translatedContent ? 'translated' : 'pending'
				})
			});
		}
	}

	async function handleFileUpload(event: Event) {
		const input = event.target as HTMLInputElement;
		const files = input.files;
		if (!files || files.length === 0) return;

		isUploading = true;

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (!file.type.startsWith('image/')) continue;

			const formData = new FormData();
			formData.append('file', file);

			try {
				const uploadRes = await fetch(`${base}/api/upload`, {
					method: 'POST',
					body: formData
				});

				if (!uploadRes.ok) {
					const img = new Image();
					img.src = URL.createObjectURL(file);
					await new Promise((resolve) => {
						img.onload = resolve;
					});

					const canvas = document.createElement('canvas');
					canvas.width = img.naturalWidth;
					canvas.height = img.naturalHeight;
					const ctx = canvas.getContext('2d');
					if (ctx) {
						ctx.drawImage(img, 0, 0);
					}

					const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

					const createRes = await fetch(`${base}/api/chapter/${data.chapter.id}/pages`, {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							imageUrl: dataUrl,
							pageNumber: pages.length + 1,
							width: img.naturalWidth,
							height: img.naturalHeight
						})
					});

					if (createRes.ok) {
						const { page: newPage } = await createRes.json();
						pages = [...pages, newPage];
						if (pages.length === 1) {
							selectedPageId = newPage.id;
							canvasStore.setBackgroundImage(newPage.imageUrl);
							canvasStore.setDimensions(newPage.width, newPage.height);
						}
					}
				}
			} catch (err) {
				console.error('Upload error:', err);
			}
		}

		isUploading = false;
		input.value = '';
	}

	async function handleDeletePage(pageId: number) {
		if (!confirm('Delete this page?')) return;

		try {
			const res = await fetch(`${base}/api/page/${pageId}`, {
				method: 'DELETE'
			});

			if (res.ok) {
				pages = pages.filter((p) => p.id !== pageId);
				if (selectedPageId === pageId) {
					selectedPageId = pages.length > 0 ? pages[0].id : null;
				}
			}
		} catch (err) {
			console.error('Delete error:', err);
		}
	}

	const selectedPage = $derived(pages.find((p) => p.id === selectedPageId));
</script>

<svelte:head>
	<title>{data.chapter.title} · {data.project.name} · ComicTranslate</title>
</svelte:head>

<div class="flex h-screen flex-col">
	<!-- Header -->
	<header class="flex shrink-0 items-center justify-between border-b bg-white px-4 py-2">
		<div class="flex items-center gap-4">
			<a
				href={resolve(`/project/${data.project.id}`)}
				class="text-sm text-muted-foreground hover:underline"
			>
				← {data.project.name}
			</a>
			<h1 class="text-lg font-semibold">
				Chapter {data.chapter.chapterNumber}: {data.chapter.title}
			</h1>
		</div>
		<div class="flex items-center gap-2">
			<label class="cursor-pointer">
				<input
					type="file"
					accept="image/*"
					multiple
					class="hidden"
					onchange={handleFileUpload}
					disabled={isUploading}
				/>
				<Button variant="outline" size="sm" disabled={isUploading}>
					<UploadIcon class="mr-2 h-4 w-4" />
					{isUploading ? 'Uploading...' : 'Upload Pages'}
				</Button>
			</label>
			<Button variant="outline" size="sm" onclick={() => (showEditor = !showEditor)}>
				{showEditor ? 'Hide' : 'Show'} Editor
			</Button>
		</div>
	</header>

	{#if showEditor}
		<!-- Main Editor Area -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Page Thumbnails Sidebar -->
			<aside class="flex w-48 shrink-0 flex-col border-r border-gray-200 bg-white">
				<div class="flex items-center justify-between border-b border-gray-200 p-2">
					<span class="text-xs font-medium text-gray-600">Pages ({pages.length})</span>
				</div>
				<div class="flex-1 space-y-2 overflow-y-auto p-2">
					{#if pages.length === 0}
						<div class="rounded-lg border-2 border-dashed p-4 text-center">
							<ImageIcon class="mx-auto h-8 w-8 text-gray-400" />
							<p class="mt-2 text-xs text-gray-500">No pages yet</p>
							<label class="mt-2 inline-block cursor-pointer">
								<input
									type="file"
									accept="image/*"
									multiple
									class="hidden"
									onchange={handleFileUpload}
									disabled={isUploading}
								/>
								<span class="text-xs text-blue-600 hover:underline">Upload images</span>
							</label>
						</div>
					{:else}
						{#each pages as page (page.id)}
							<div
								class="group relative w-full cursor-pointer overflow-hidden rounded-md border-2 transition-all {selectedPageId ===
								page.id
									? 'border-blue-500 ring-1 ring-blue-500'
									: 'border-gray-200 hover:border-gray-400'}"
								onclick={() => handlePageSelect(page.id)}
								onkeydown={(e) => e.key === 'Enter' && handlePageSelect(page.id)}
								role="button"
								tabindex="0"
								aria-pressed={selectedPageId === page.id}
							>
								<div class="relative aspect-[3/4] bg-gray-100">
									<img
										src={page.imageUrl}
										alt="Page {page.pageNumber}"
										class="h-full w-full object-cover"
									/>
									<span
										class="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-xs text-white"
									>
										{page.pageNumber}
									</span>
									<button
										type="button"
										class="absolute top-1 right-1 rounded bg-red-500 p-1 opacity-0 transition-opacity group-hover:opacity-100"
										onclick={(e) => {
											e.stopPropagation();
											handleDeletePage(page.id);
										}}
									>
										<Trash2Icon class="h-3 w-3 text-white" />
									</button>
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</aside>

			<!-- Canvas + Grid Area -->
			<div class="flex flex-1 flex-col overflow-hidden">
				{#if pages.length === 0}
					<!-- Empty State -->
					<div class="flex flex-1 items-center justify-center bg-gray-100">
						<div class="text-center">
							<ImageIcon class="mx-auto h-16 w-16 text-gray-400" />
							<h2 class="mt-4 text-lg font-semibold text-gray-900">No pages yet</h2>
							<p class="mt-2 text-sm text-gray-500">Upload manga pages to start translating</p>
							<label class="mt-4 inline-block cursor-pointer">
								<input
									type="file"
									accept="image/*"
									multiple
									class="hidden"
									onchange={handleFileUpload}
									disabled={isUploading}
								/>
								<Button disabled={isUploading}>
									<UploadIcon class="mr-2 h-4 w-4" />
									{isUploading ? 'Uploading...' : 'Upload Pages'}
								</Button>
							</label>
						</div>
					</div>
				{:else}
					<!-- Canvas Editor + Translation Grid with Resizable -->
					<PaneGroup class="flex-1" direction="vertical">
						<Pane defaultSize={70} minSize={30}>
							<div class="h-full overflow-hidden bg-gray-100">
								<CanvasEditor
									width={selectedPage?.width ?? 800}
									height={selectedPage?.height ?? 600}
									backgroundImage={selectedPage?.imageUrl}
								/>
							</div>
						</Pane>
						<Handle withHandle />
						<Pane defaultSize={30} minSize={10}>
							<div class="flex h-full flex-col bg-white">
								<div class="flex items-center justify-between border-b bg-gray-50 px-4 py-2">
									<span class="text-sm font-medium"
										>Translation Grid ({currentElements.length} elements)</span
									>
								</div>
								<div class="flex-1 overflow-hidden">
									<TranslationGrid elements={currentElements} onUpdate={handleElementUpdate} />
								</div>
							</div>
						</Pane>
					</PaneGroup>
				{/if}
			</div>
		</div>
	{:else}
		<!-- Simple Chapter Info View -->
		<div class="mx-auto w-full max-w-3xl space-y-6 px-4 py-10">
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
									<option
										value={projectItem.id}
										selected={projectItem.id === data.chapter.projectId}
									>
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
							<select
								name="status"
								class="rounded-md border bg-background px-3 py-2 text-sm"
								required
							>
								{#each statuses as status (status)}
									<option value={status} selected={status === data.chapter.status}>{status}</option>
								{/each}
							</select>
						</label>

						<div class="flex gap-2">
							<Button type="submit" variant="outline">Save changes</Button>
							<Button type="submit" formaction="?/delete" variant="destructive"
								>Delete chapter</Button
							>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	{/if}
</div>
