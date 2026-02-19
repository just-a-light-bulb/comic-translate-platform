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
	import CanvasEditor from '$lib/components/canvas-editor/CanvasEditor.svelte';
	import PageThumbnails from '$lib/components/canvas-editor/sidebar/PageThumbnails.svelte';
	import TranslationGrid from '$lib/components/canvas-editor/TranslationGrid.svelte';
	import { canvasStore } from '$lib/components/canvas-editor/stores';
	import type { TextElement } from '$lib/components/canvas-editor/types/elements';

	let { data }: { data: PageData } = $props();
	const statuses = ['draft', 'in_progress', 'review', 'done'];

	let showEditor = $state(true);
	let showGrid = $state(true);
	let gridHeight = $state(250);
	let selectedPageId = $state<number | null>(null);
	let currentElements = $state<TextElement[]>([]);
	$effect(() => {
		if (data.pages.length > 0 && selectedPageId === null) {
			selectedPageId = data.pages[0].id;
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
		const selectedPage = data.pages.find((p) => p.id === pageId);
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

	function handleDragStart(e: DragEvent) {
		if (!e.dataTransfer) return;
		e.dataTransfer.setData('text/plain', '');
	}

	function handleDrag(e: DragEvent) {
		if (!e.dataTransfer) return;
		const rect = (e.target as HTMLElement).parentElement?.getBoundingClientRect();
		if (rect) {
			gridHeight = Math.max(100, rect.height - e.clientY);
		}
	}

	const selectedPage = $derived(data.pages.find((p) => p.id === selectedPageId));
</script>

<svelte:head>
	<title>{data.chapter.title} · Chapter · ComicTranslate</title>
</svelte:head>

<div class="flex h-screen flex-col">
	<!-- Header -->
	<header class="flex shrink-0 items-center justify-between border-b bg-white px-4 py-2">
		<div class="flex items-center gap-4">
			<a
				href={resolve(`/project/${data.chapter.projectId}`)}
				class="text-sm text-muted-foreground hover:underline"
			>
				← Back to Project
			</a>
			<h1 class="text-lg font-semibold">
				Chapter {data.chapter.chapterNumber}: {data.chapter.title}
			</h1>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => (showEditor = !showEditor)}>
				{showEditor ? 'Hide' : 'Show'} Editor
			</Button>
		</div>
	</header>

	{#if showEditor}
		<!-- Main Editor Area -->
		<div class="flex flex-1 overflow-hidden">
			<!-- Page Thumbnails Sidebar -->
			<PageThumbnails
				pages={data.pages.map((p) => ({
					id: p.id,
					chapterId: p.chapterId,
					pageNumber: p.pageNumber,
					imageUrl: p.imageUrl,
					width: p.width,
					height: p.height,
					ocrStatus: p.ocrStatus
				}))}
				{selectedPageId}
				onPageSelect={handlePageSelect}
			/>

			<!-- Canvas + Grid Area -->
			<div class="flex flex-1 flex-col overflow-hidden">
				<!-- Canvas Editor -->
				<div class="flex-1 overflow-hidden bg-gray-100">
					<CanvasEditor
						width={selectedPage?.width ?? 800}
						height={selectedPage?.height ?? 600}
						backgroundImage={selectedPage?.imageUrl}
					/>
				</div>

				<!-- Resizer -->
				{#if showGrid}
					<div
						class="h-2 cursor-row-resize bg-gray-200 transition-colors hover:bg-blue-300"
						role="separator"
						aria-orientation="horizontal"
						ondragstart={handleDragStart}
						ondrag={handleDrag}
						draggable="true"
					></div>
				{/if}

				<!-- Translation Grid -->
				{#if showGrid}
					<div class="border-t bg-white" style="height: {gridHeight}px;">
						<div class="flex items-center justify-between border-b bg-gray-50 px-4 py-2">
							<span class="text-sm font-medium"
								>Translation Grid ({currentElements.length} elements)</span
							>
							<Button variant="ghost" size="sm" onclick={() => (showGrid = false)}>
								↓ Collapse
							</Button>
						</div>
						<div class="h-[calc(100%-40px)]">
							<TranslationGrid elements={currentElements} onUpdate={handleElementUpdate} />
						</div>
					</div>
				{:else}
					<div class="border-t bg-white p-2">
						<Button variant="ghost" size="sm" onclick={() => (showGrid = true)}>
							↑ Show Translation Grid
						</Button>
					</div>
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
