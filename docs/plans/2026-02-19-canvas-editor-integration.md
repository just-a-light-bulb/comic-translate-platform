# Canvas Editor Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate canvas editor into chapter/[id] page with page navigation and translation grid.

**Architecture:** Top-bottom split layout with page thumbnails sidebar. Canvas editor on top, collapsible translation grid on bottom. Full database schema for pages and text elements.

**Tech Stack:** SvelteKit, Svelte 5, Drizzle ORM, PostgreSQL, Tailwind CSS

---

## Task 1: Create Missing Toolbar Components

**Files:**

- Create: `src/lib/components/canvas-editor/toolbar/ZoomControls.svelte`
- Create: `src/lib/components/canvas-editor/toolbar/UndoRedo.svelte`

**Step 1: Create ZoomControls.svelte**

```svelte
<script lang="ts">
	import { canvasStore } from '../stores';

	function zoomIn() {
		canvasStore.setZoom(canvasStore.zoom * 1.2);
	}

	function zoomOut() {
		canvasStore.setZoom(canvasStore.zoom / 1.2);
	}

	function resetZoom() {
		canvasStore.setZoom(1);
		canvasStore.setPan(0, 0);
	}
</script>

<div class="flex items-center gap-1">
	<button class="zoom-btn" onclick={zoomOut} title="Zoom out" aria-label="Zoom out">
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
			<line x1="8" y1="11" x2="14" y2="11" />
		</svg>
	</button>
	<span class="min-w-[48px] text-center text-xs text-gray-600">
		{Math.round(canvasStore.zoom * 100)}%
	</span>
	<button class="zoom-btn" onclick={zoomIn} title="Zoom in" aria-label="Zoom in">
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<circle cx="11" cy="11" r="8" />
			<line x1="21" y1="21" x2="16.65" y2="16.65" />
			<line x1="11" y1="8" x2="11" y2="14" />
			<line x1="8" y1="11" x2="14" y2="11" />
		</svg>
	</button>
	<button class="zoom-btn" onclick={resetZoom} title="Reset zoom" aria-label="Reset zoom">
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
			<path d="M3 3v5h5" />
		</svg>
	</button>
</div>

<style>
	.zoom-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 4px;
		border: none;
		background: transparent;
		color: #374151;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.zoom-btn:hover {
		background: #f3f4f6;
	}

	.zoom-btn:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
</style>
```

**Step 2: Create UndoRedo.svelte**

```svelte
<script lang="ts">
	import { historyStore, canvasStore } from '../stores';

	function handleUndo() {
		const action = historyStore.undo();
		if (action?.previousState) {
			canvasStore.setState(
				Array.isArray(action.previousState) ? action.previousState : [action.previousState]
			);
		}
	}

	function handleRedo() {
		const action = historyStore.redo();
		if (action?.newState) {
			canvasStore.setState(Array.isArray(action.newState) ? action.newState : [action.newState]);
		}
	}
</script>

<div class="flex items-center gap-1 border-r border-gray-200 pr-2">
	<button
		class="undo-btn"
		onclick={handleUndo}
		disabled={!historyStore.canUndo}
		title="Undo (Ctrl+Z)"
		aria-label="Undo"
	>
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M3 7v6h6" />
			<path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
		</svg>
	</button>
	<button
		class="undo-btn"
		onclick={handleRedo}
		disabled={!historyStore.canRedo}
		title="Redo (Ctrl+Shift+Z)"
		aria-label="Redo"
	>
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M21 7v6h-6" />
			<path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
		</svg>
	</button>
</div>

<style>
	.undo-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 4px;
		border: none;
		background: transparent;
		color: #374151;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.undo-btn:hover:not(:disabled) {
		background: #f3f4f6;
	}

	.undo-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.undo-btn:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
</style>
```

**Step 3: Run lint**

Run: `pnpm run lint`
Expected: No errors

---

## Task 2: Add Database Schema for Pages and TextElements

**Files:**

- Modify: `src/lib/server/db/schema.ts`
- Create: Migration via drizzle

**Step 1: Add page and textElement tables to schema**

Add to `src/lib/server/db/schema.ts`:

```typescript
export const page = pgTable('page', {
	id: serial('id').primaryKey(),
	chapterId: integer('chapter_id')
		.notNull()
		.references(() => chapter.id, { onDelete: 'cascade' }),
	pageNumber: integer('page_number').notNull().default(1),
	imageUrl: text('image_url').notNull(),
	width: integer('width').notNull().default(800),
	height: integer('height').notNull().default(1100),
	ocrStatus: text('ocr_status').notNull().default('pending'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const textElement = pgTable('text_element', {
	id: serial('id').primaryKey(),
	pageId: integer('page_id')
		.notNull()
		.references(() => page.id, { onDelete: 'cascade' }),
	x: integer('x').notNull().default(0),
	y: integer('y').notNull().default(0),
	width: integer('width').notNull().default(100),
	height: integer('height').notNull().default(30),
	rotation: integer('rotation').notNull().default(0),
	originalText: text('original_text').notNull().default(''),
	translatedText: text('translated_text').default(''),
	fontFamily: text('font_family').notNull().default('Arial'),
	fontSize: integer('font_size').notNull().default(16),
	fontWeight: text('font_weight').notNull().default('normal'),
	fontStyle: text('font_style').notNull().default('normal'),
	textAlign: text('text_align').notNull().default('center'),
	fill: text('fill').notNull().default('#000000'),
	status: text('status').notNull().default('pending'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
```

**Step 2: Generate migration**

Run: `pnpm drizzle-kit generate`
Expected: Migration file created

**Step 3: Push to database**

Run: `pnpm run db:push`
Expected: Tables created

---

## Task 3: Create Page Thumbnails Sidebar Component

**Files:**

- Create: `src/lib/components/canvas-editor/sidebar/PageThumbnails.svelte`

**Step 1: Create PageThumbnails.svelte**

```svelte
<script lang="ts">
	import type { Page } from './types';

	interface Props {
		pages: Page[];
		selectedPageId: number | null;
		onPageSelect: (pageId: number) => void;
	}

	let { pages, selectedPageId, onPageSelect }: Props = $props();
</script>

<aside class="page-sidebar flex w-40 shrink-0 flex-col border-r border-gray-200 bg-white">
	<div class="border-b border-gray-200 p-2">
		<span class="text-xs font-medium text-gray-600">Pages ({pages.length})</span>
	</div>
	<div class="flex-1 space-y-2 overflow-y-auto p-2">
		{#each pages as page (page.id)}
			<button
				class="page-thumbnail w-full overflow-hidden rounded-md border-2 transition-all {selectedPageId ===
				page.id
					? 'border-blue-500 ring-1 ring-blue-500'
					: 'border-gray-200 hover:border-gray-400'}"
				onclick={() => onPageSelect(page.id)}
				aria-pressed={selectedPageId === page.id}
			>
				<div class="relative aspect-[3/4] bg-gray-100">
					<img
						src={page.imageUrl}
						alt="Page {page.pageNumber}"
						class="h-full w-full object-cover"
					/>
					<span class="absolute bottom-1 left-1 rounded bg-black/60 px-1 text-xs text-white">
						{page.pageNumber}
					</span>
					{#if page.ocrStatus === 'done'}
						<span class="absolute top-1 right-1 rounded bg-green-500 px-1 text-xs text-white">
							OCR
						</span>
					{:else if page.ocrStatus === 'processing'}
						<span class="absolute top-1 right-1 rounded bg-yellow-500 px-1 text-xs text-white">
							...
						</span>
					{/if}
				</div>
			</button>
		{:else}
			<div class="text-center text-gray-400 text-sm py-4">No pages yet</div>
		{/each}
	</div>
</aside>
```

**Step 2: Create types file**

Create `src/lib/components/canvas-editor/sidebar/types.ts`:

```typescript
export interface Page {
	id: number;
	chapterId: number;
	pageNumber: number;
	imageUrl: string;
	width: number;
	height: number;
	ocrStatus: string;
}
```

---

## Task 4: Create Translation Grid Component

**Files:**

- Create: `src/lib/components/canvas-editor/TranslationGrid.svelte`

**Step 1: Create TranslationGrid.svelte**

```svelte
<script lang="ts">
	import type { TextElement } from '../types/elements';
	import { canvasStore, selectionStore } from '../stores';

	interface Props {
		elements: TextElement[];
		onUpdate: (id: string, updates: Partial<TextElement['text']>) => void;
	}

	let { elements, onUpdate }: Props = $props();

	function handleTranslationChange(id: string, value: string) {
		onUpdate(id, { translatedContent: value });
	}

	function handleRowClick(id: string) {
		selectionStore.select(id);
	}

	const statusColors: Record<string, string> = {
		pending: 'bg-yellow-100 text-yellow-800',
		translated: 'bg-blue-100 text-blue-800',
		reviewed: 'bg-green-100 text-green-800'
	};
</script>

<div class="translation-grid h-full overflow-auto">
	<table class="w-full text-sm">
		<thead class="sticky top-0 bg-gray-50">
			<tr>
				<th class="w-12 px-3 py-2 text-left font-medium text-gray-600">#</th>
				<th class="px-3 py-2 text-left font-medium text-gray-600">Original</th>
				<th class="px-3 py-2 text-left font-medium text-gray-600">Translation</th>
				<th class="w-24 px-3 py-2 text-left font-medium text-gray-600">Status</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200">
			{#each elements as element, index (element.id)}
				<tr
					class="cursor-pointer hover:bg-gray-50 {selectionStore.isSelected(element.id)
						? 'bg-blue-50'
						: ''}"
					onclick={() => handleRowClick(element.id)}
				>
					<td class="px-3 py-2 text-gray-500">{index + 1}</td>
					<td class="px-3 py-2 font-mono text-xs">{element.text.originalContent}</td>
					<td class="px-3 py-2">
						<input
							type="text"
							class="w-full rounded border border-gray-200 px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 focus:outline-none"
							value={element.text.translatedContent}
							onchange={(e) => handleTranslationChange(element.id, e.currentTarget.value)}
							onclick={(e) => e.stopPropagation()}
						/>
					</td>
					<td class="px-3 py-2">
						<span
							class="rounded px-2 py-0.5 text-xs {statusColors[element.text.status] ||
								statusColors.pending}"
						>
							{element.text.status}
						</span>
					</td>
				</tr>
			{:else}
				<tr>
					<td colspan="4" class="px-3 py-8 text-center text-gray-400">No text elements</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
```

---

## Task 5: Create CanvasEditor Wrapper Component

**Files:**

- Create: `src/lib/components/canvas-editor/CanvasEditor.svelte`

**Step 1: Create CanvasEditor.svelte**

```svelte
<script lang="ts">
	import Canvas from './canvas/Canvas.svelte';
	import Toolbar from './toolbar/Toolbar.svelte';

	interface Props {
		width?: number;
		height?: number;
		backgroundImage?: string;
	}

	let { width = 800, height = 600, backgroundImage }: Props = $props();
</script>

<div class="canvas-editor flex h-full flex-col">
	<Toolbar />
	<div class="flex flex-1 items-center justify-center overflow-hidden bg-gray-200">
		<Canvas {width} {height} {backgroundImage} />
	</div>
</div>
```

---

## Task 6: Update Chapter Page with Editor Integration

**Files:**

- Modify: `src/routes/chapter/[id]/+page.server.ts`
- Modify: `src/routes/chapter/[id]/+page.svelte`
- Create: `src/routes/api/chapter/[id]/pages/+server.ts`
- Create: `src/routes/api/page/[id]/elements/+server.ts`
- Create: `src/routes/api/element/[id]/+server.ts`

**Step 1: Update +page.server.ts to load pages and elements**

**Step 2: Create API endpoints**

**Step 3: Update +page.svelte with full editor layout**

---

## Task 7: Run Lint and Build

Run: `pnpm run lint && pnpm run build`
Expected: All pass
