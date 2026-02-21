# Canvas Editor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a rich-featured canvas editor component for manga translation with Konva.js, combining features from Canva, Photoshop, and spreadsheet applications.

**Architecture:** Konva.js-based canvas with Svelte 5 runes for state management. Split-panel UI with canvas viewport, layer panel, and translation grid. Command pattern for undo/redo.

**Tech Stack:** SvelteKit 2.x, Svelte 5, Konva.js 9.x, Tailwind CSS 4.x, TypeScript 5.x

---

## Task 1: Install Dependencies

**Files:**

- Modify: `package.json`

**Step 1: Install Konva.js**

Run:

```bash
pnpm add konva
```

**Step 2: Verify installation**

Run:

```bash
pnpm list konva
```

Expected: konva@9.x.x

**Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add konva dependency for canvas editor"
```

---

## Task 2: Create Type Definitions

**Files:**

- Create: `src/lib/components/canvas-editor/types/elements.ts`
- Create: `src/lib/components/canvas-editor/types/history.ts`
- Create: `src/lib/components/canvas-editor/types/tools.ts`
- Create: `src/lib/components/canvas-editor/index.ts`

**Step 1: Create element types**

Create file `src/lib/components/canvas-editor/types/elements.ts`:

```typescript
export type ElementType = 'text' | 'image' | 'shape';
export type TextAlignment = 'left' | 'center' | 'right';
export type VerticalAlignment = 'top' | 'middle' | 'bottom';
export type TranslationStatus = 'pending' | 'translated' | 'reviewed';

export interface BaseElement {
	id: string;
	type: ElementType;
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	opacity: number;
	visible: boolean;
	locked: boolean;
	zIndex: number;
}

export interface TextProperties {
	content: string;
	originalContent: string;
	translatedContent: string;
	fontFamily: string;
	fontSize: number;
	fontWeight: string;
	fontStyle: string;
	textAlign: TextAlignment;
	verticalAlign: VerticalAlignment;
	fill: string;
	stroke: string;
	strokeWidth: number;
	lineHeight: number;
	status: TranslationStatus;
}

export interface TextElement extends BaseElement {
	type: 'text';
	text: TextProperties;
}

export interface ImageProperties {
	src: string;
	naturalWidth: number;
	naturalHeight: number;
}

export interface ImageElement extends BaseElement {
	type: 'image';
	image: ImageProperties;
}

export type CanvasElement = TextElement | ImageElement;

export interface CanvasState {
	elements: CanvasElement[];
	selectedIds: string[];
	zoom: number;
	panX: number;
	panY: number;
	width: number;
	height: number;
}
```

**Step 2: Create history types**

Create file `src/lib/components/canvas-editor/types/history.ts`:

```typescript
import type { CanvasElement } from './elements';

export type ActionType = 'create' | 'update' | 'delete' | 'move' | 'reorder';

export interface HistoryAction {
	type: ActionType;
	description: string;
	timestamp: number;
	elementId?: string;
	previousState?: CanvasElement | CanvasElement[];
	newState?: CanvasElement | CanvasElement[];
}

export interface HistoryState {
	past: HistoryAction[];
	present: HistoryAction | null;
	future: HistoryAction[];
	maxHistory: number;
}
```

**Step 3: Create tools types**

Create file `src/lib/components/canvas-editor/types/tools.ts`:

```typescript
export type ToolType = 'select' | 'text' | 'pan' | 'zoom';

export interface Tool {
	type: ToolType;
	cursor: string;
	shortcut: string;
}

export interface EditorSettings {
	snapToGrid: boolean;
	gridSize: number;
	showGuides: boolean;
	showRulers: boolean;
	theme: 'light' | 'dark';
}

export const DEFAULT_TOOLS: Record<ToolType, Tool> = {
	select: { type: 'select', cursor: 'default', shortcut: 'V' },
	text: { type: 'text', cursor: 'text', shortcut: 'T' },
	pan: { type: 'pan', cursor: 'grab', shortcut: 'H' },
	zoom: { type: 'zoom', cursor: 'zoom-in', shortcut: 'Z' }
};

export const DEFAULT_SETTINGS: EditorSettings = {
	snapToGrid: false,
	gridSize: 10,
	showGuides: true,
	showRulers: false,
	theme: 'light'
};
```

**Step 4: Create index exports**

Create file `src/lib/components/canvas-editor/index.ts`:

```typescript
export * from './types/elements';
export * from './types/history';
export * from './types/tools';
```

**Step 5: Commit**

```bash
git add src/lib/components/canvas-editor/
git commit -m "feat(canvas-editor): add type definitions for elements, history, and tools"
```

---

## Task 3: Create Canvas Store

**Files:**

- Create: `src/lib/components/canvas-editor/stores/canvasStore.ts`
- Create: `src/lib/components/canvas-editor/stores/selectionStore.ts`
- Create: `src/lib/components/canvas-editor/stores/historyStore.ts`
- Create: `src/lib/components/canvas-editor/stores/settingsStore.ts`
- Create: `src/lib/components/canvas-editor/stores/index.ts`

**Step 1: Create canvas store**

Create file `src/lib/components/canvas-editor/stores/canvasStore.ts`:

```typescript
import { untrack } from 'svelte';
import type { CanvasElement, TextElement, ImageElement } from '../types/elements';

function generateId(): string {
	return `el_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createCanvasStore() {
	let elements = $state<CanvasElement[]>([]);
	let zoom = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let width = $state(800);
	let height = $state(600);

	return {
		get elements() {
			return elements;
		},
		get zoom() {
			return zoom;
		},
		get panX() {
			return panX;
		},
		get panY() {
			return panY;
		},
		get width() {
			return width;
		},
		get height() {
			return height;
		},

		setDimensions(w: number, h: number) {
			width = w;
			height = h;
		},

		setZoom(newZoom: number) {
			zoom = Math.max(0.1, Math.min(5, newZoom));
		},

		setPan(x: number, y: number) {
			panX = x;
			panY = y;
		},

		addElement(element: Omit<CanvasElement, 'id' | 'zIndex'>) {
			const newElement = {
				...element,
				id: generateId(),
				zIndex: elements.length
			} as CanvasElement;
			elements = [...elements, newElement];
			return newElement;
		},

		updateElement(id: string, updates: Partial<CanvasElement>) {
			elements = elements.map((el) =>
				el.id === id ? ({ ...el, ...updates } as CanvasElement) : el
			);
		},

		deleteElement(id: string) {
			elements = elements.filter((el) => el.id !== id);
		},

		deleteElements(ids: string[]) {
			elements = elements.filter((el) => !ids.includes(el.id));
		},

		reorderElement(id: string, newZIndex: number) {
			const element = elements.find((el) => el.id === id);
			if (!element) return;

			const filtered = elements.filter((el) => el.id !== id);
			const reordered = [
				...filtered.slice(0, newZIndex),
				{ ...element, zIndex: newZIndex },
				...filtered.slice(newZIndex)
			];
			elements = reordered.map((el, idx) => ({ ...el, zIndex: idx }));
		},

		getElement(id: string) {
			return elements.find((el) => el.id === id);
		},

		getElementsByIds(ids: string[]) {
			return elements.filter((el) => ids.includes(el.id));
		},

		setElements(newElements: CanvasElement[]) {
			elements = newElements;
		},

		clearElements() {
			elements = [];
		}
	};
}

export const canvasStore = createCanvasStore();
```

**Step 2: Create selection store**

Create file `src/lib/components/canvas-editor/stores/selectionStore.ts`:

```typescript
function createSelectionStore() {
	let selectedIds = $state<Set<string>>(new Set());
	let activeTool = $state<'select' | 'text' | 'pan' | 'zoom'>('select');

	return {
		get selectedIds() {
			return selectedIds;
		},
		get selectedIdsArray() {
			return Array.from(selectedIds);
		},
		get activeTool() {
			return activeTool;
		},
		get hasSelection() {
			return selectedIds.size > 0;
		},
		get isMultiSelect() {
			return selectedIds.size > 1;
		},

		setActiveTool(tool: typeof activeTool) {
			activeTool = tool;
		},

		select(id: string) {
			selectedIds = new Set([id]);
		},

		selectMultiple(ids: string[]) {
			selectedIds = new Set(ids);
		},

		addToSelection(id: string) {
			const newSet = new Set(selectedIds);
			newSet.add(id);
			selectedIds = newSet;
		},

		removeFromSelection(id: string) {
			const newSet = new Set(selectedIds);
			newSet.delete(id);
			selectedIds = newSet;
		},

		toggleSelection(id: string) {
			const newSet = new Set(selectedIds);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			selectedIds = newSet;
		},

		clearSelection() {
			selectedIds = new Set();
		},

		isSelected(id: string) {
			return selectedIds.has(id);
		}
	};
}

export const selectionStore = createSelectionStore();
```

**Step 3: Create history store**

Create file `src/lib/components/canvas-editor/stores/historyStore.ts`:

```typescript
import type { HistoryAction, HistoryState } from '../types/history';

function createHistoryStore() {
	let past = $state<HistoryAction[]>([]);
	let future = $state<HistoryAction[]>([]);
	const maxHistory = 50;

	return {
		get canUndo() {
			return past.length > 0;
		},
		get canRedo() {
			return future.length > 0;
		},
		get historyLength() {
			return past.length;
		},

		push(action: HistoryAction) {
			past = [...past, action].slice(-maxHistory);
			future = [];
		},

		undo(): HistoryAction | undefined {
			if (past.length === 0) return undefined;
			const action = past[past.length - 1];
			past = past.slice(0, -1);
			future = [action, ...future];
			return action;
		},

		redo(): HistoryAction | undefined {
			if (future.length === 0) return undefined;
			const action = future[0];
			future = future.slice(1);
			past = [...past, action];
			return action;
		},

		clear() {
			past = [];
			future = [];
		},

		getHistory() {
			return [...past];
		}
	};
}

export const historyStore = createHistoryStore();
```

**Step 4: Create settings store**

Create file `src/lib/components/canvas-editor/stores/settingsStore.ts`:

```typescript
import type { EditorSettings } from '../types/tools';
import { DEFAULT_SETTINGS } from '../types/tools';

function createSettingsStore() {
	let settings = $state<EditorSettings>({ ...DEFAULT_SETTINGS });

	return {
		get settings() {
			return settings;
		},

		update(updates: Partial<EditorSettings>) {
			settings = { ...settings, ...updates };
		},

		reset() {
			settings = { ...DEFAULT_SETTINGS };
		},

		toggleSnapToGrid() {
			settings = { ...settings, snapToGrid: !settings.snapToGrid };
		},

		toggleGuides() {
			settings = { ...settings, showGuides: !settings.showGuides };
		},

		toggleRulers() {
			settings = { ...settings, showRulers: !settings.showRulers };
		}
	};
}

export const settingsStore = createSettingsStore();
```

**Step 5: Create stores index**

Create file `src/lib/components/canvas-editor/stores/index.ts`:

```typescript
export { canvasStore } from './canvasStore';
export { selectionStore } from './selectionStore';
export { historyStore } from './historyStore';
export { settingsStore } from './settingsStore';
```

**Step 6: Commit**

```bash
git add src/lib/components/canvas-editor/stores/
git commit -m "feat(canvas-editor): add state management stores with Svelte 5 runes"
```

---

## Task 4: Create Utility Functions

**Files:**

- Create: `src/lib/components/canvas-editor/utils/transformers.ts`
- Create: `src/lib/components/canvas-editor/utils/exporters.ts`
- Create: `src/lib/components/canvas-editor/utils/keyboard.ts`
- Create: `src/lib/components/canvas-editor/utils/index.ts`

**Step 1: Create transformer utilities**

Create file `src/lib/components/canvas-editor/utils/transformers.ts`:

```typescript
import type { CanvasElement, TextElement } from '../types/elements';

export interface TransformBox {
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
}

export function getBoundingBox(elements: CanvasElement[]): TransformBox | null {
	if (elements.length === 0) return null;

	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	for (const el of elements) {
		minX = Math.min(minX, el.x);
		minY = Math.min(minY, el.y);
		maxX = Math.max(maxX, el.x + el.width);
		maxY = Math.max(maxY, el.y + el.height);
	}

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY,
		rotation: 0
	};
}

export function snapToGrid(value: number, gridSize: number): number {
	return Math.round(value / gridSize) * gridSize;
}

export function constrainAspectRatio(
	newWidth: number,
	newHeight: number,
	aspectRatio: number
): { width: number; height: number } {
	const newAspectRatio = newWidth / newHeight;

	if (newAspectRatio > aspectRatio) {
		return { width: newHeight * aspectRatio, height: newHeight };
	} else {
		return { width: newWidth, height: newWidth / aspectRatio };
	}
}

export function rotatePoint(
	x: number,
	y: number,
	cx: number,
	cy: number,
	angle: number
): { x: number; y: number } {
	const radians = (angle * Math.PI) / 180;
	const cos = Math.cos(radians);
	const sin = Math.sin(radians);

	const nx = cos * (x - cx) - sin * (y - cy) + cx;
	const ny = sin * (x - cx) + cos * (y - cy) + cy;

	return { x: nx, y: ny };
}

export function isPointInRotatedRect(px: number, py: number, box: TransformBox): boolean {
	const cx = box.x + box.width / 2;
	const cy = box.y + box.height / 2;

	const rotated = rotatePoint(px, py, cx, cy, -box.rotation);

	return (
		rotated.x >= box.x &&
		rotated.x <= box.x + box.width &&
		rotated.y >= box.y &&
		rotated.y <= box.y + box.height
	);
}
```

**Step 2: Create exporter utilities**

Create file `src/lib/components/canvas-editor/utils/exporters.ts`:

```typescript
import type { CanvasElement, TextElement } from '../types/elements';

export interface ExportOptions {
	format: 'png' | 'jpg' | 'pdf';
	quality: number;
	background: string;
}

export const DEFAULT_EXPORT_OPTIONS: ExportOptions = {
	format: 'png',
	quality: 0.92,
	background: '#ffffff'
};

export function canvasToDataURL(
	canvas: HTMLCanvasElement,
	options: Partial<ExportOptions> = {}
): string {
	const opts = { ...DEFAULT_EXPORT_OPTIONS, ...options };

	const mimeType = opts.format === 'jpg' ? 'image/jpeg' : 'image/png';
	return canvas.toDataURL(mimeType, opts.quality);
}

export function downloadDataURL(dataURL: string, filename: string): void {
	const link = document.createElement('a');
	link.download = filename;
	link.href = dataURL;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

export function exportTranslationGrid(elements: TextElement[]): string {
	const headers = ['ID', 'Original', 'Translated', 'Status', 'X', 'Y', 'Width', 'Height'];
	const rows = elements.map((el) => [
		el.id,
		el.text.originalContent,
		el.text.translatedContent,
		el.text.status,
		el.x.toString(),
		el.y.toString(),
		el.width.toString(),
		el.height.toString()
	]);

	const csv = [
		headers.join(','),
		...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
	].join('\n');

	return csv;
}

export function downloadCSV(csv: string, filename: string): void {
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.download = filename;
	link.href = url;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
```

**Step 3: Create keyboard utilities**

Create file `src/lib/components/canvas-editor/utils/keyboard.ts`:

```typescript
export interface KeyboardShortcut {
	key: string;
	ctrl?: boolean;
	shift?: boolean;
	alt?: boolean;
	action: () => void;
	description: string;
}

export function matchesShortcut(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
	const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
	const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
	const shiftMatch = !!shortcut.shift === event.shiftKey;
	const altMatch = !!shortcut.alt === event.altKey;

	return keyMatch && ctrlMatch && shiftMatch && altMatch;
}

export function formatShortcut(shortcut: KeyboardShortcut): string {
	const parts: string[] = [];

	if (shortcut.ctrl) {
		parts.push(navigator.platform.includes('Mac') ? '⌘' : 'Ctrl');
	}
	if (shortcut.shift) {
		parts.push('Shift');
	}
	if (shortcut.alt) {
		parts.push(navigator.platform.includes('Mac') ? '⌥' : 'Alt');
	}
	parts.push(shortcut.key.toUpperCase());

	return parts.join('+');
}

export const DEFAULT_SHORTCUTS: Omit<KeyboardShortcut, 'action'>[] = [
	{ key: 'v', description: 'Selection tool' },
	{ key: 't', description: 'Text tool' },
	{ key: 'h', description: 'Pan tool' },
	{ key: 'z', description: 'Zoom tool' },
	{ key: 'Delete', description: 'Delete selected' },
	{ key: 'z', ctrl: true, description: 'Undo' },
	{ key: 'y', ctrl: true, description: 'Redo' },
	{ key: 'z', ctrl: true, shift: true, description: 'Redo' },
	{ key: 'c', ctrl: true, description: 'Copy' },
	{ key: 'v', ctrl: true, description: 'Paste' },
	{ key: 'd', ctrl: true, description: 'Duplicate' },
	{ key: 'a', ctrl: true, description: 'Select all' },
	{ key: '=', ctrl: true, description: 'Zoom in' },
	{ key: '-', ctrl: true, description: 'Zoom out' },
	{ key: '0', ctrl: true, description: 'Fit to screen' }
];
```

**Step 4: Create utils index**

Create file `src/lib/components/canvas-editor/utils/index.ts`:

```typescript
export * from './transformers';
export * from './exporters';
export * from './keyboard';
```

**Step 5: Commit**

```bash
git add src/lib/components/canvas-editor/utils/
git commit -m "feat(canvas-editor): add utility functions for transforms, export, and keyboard"
```

---

## Task 5: Create Main Canvas Component

**Files:**

- Create: `src/lib/components/canvas-editor/canvas/Canvas.svelte`
- Create: `src/lib/components/canvas-editor/canvas/TextElement.svelte`
- Create: `src/lib/components/canvas-editor/canvas/ImageElement.svelte`
- Create: `src/lib/components/canvas-editor/canvas/TransformControls.svelte`

**Step 1: Create main Canvas component**

Create file `src/lib/components/canvas-editor/canvas/Canvas.svelte`:

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import Konva from 'konva';
	import type { CanvasElement } from '../types/elements';
	import { canvasStore, selectionStore } from '../stores';
	import TextElement from './TextElement.svelte';
	import ImageElement from './ImageElement.svelte';
	import TransformControls from './TransformControls.svelte';

	interface Props {
		width?: number;
		height?: number;
		backgroundImage?: string;
	}

	let { width = 800, height = 600, backgroundImage }: Props = $props();

	let container: HTMLDivElement;
	let stage: Konva.Stage;
	let layer: Konva.Layer;

	onMount(() => {
		stage = new Konva.Stage({
			container: container,
			width: width,
			height: height
		});

		layer = new Konva.Layer();
		stage.add(layer);

		canvasStore.setDimensions(width, height);

		return () => {
			stage.destroy();
		};
	});

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const scaleBy = 1.1;
		const newZoom = e.deltaY < 0 ? canvasStore.zoom * scaleBy : canvasStore.zoom / scaleBy;
		canvasStore.setZoom(newZoom);
	}

	function handleClick(e: MouseEvent) {
		const clickedOnEmpty = e.target === container;
		if (clickedOnEmpty) {
			selectionStore.clearSelection();
		}
	}
</script>

<div
	class="canvas-container relative overflow-hidden rounded-lg border border-gray-300 bg-gray-100"
	bind:this={container}
	style="width: {width}px; height: {height}px;"
	onwheel={handleWheel}
	onclick={handleClick}
	role="application"
	aria-label="Canvas editor"
	tabindex="0"
>
	{#if backgroundImage}
		<img
			src={backgroundImage}
			alt="Background"
			class="pointer-events-none absolute inset-0 h-full w-full object-contain"
		/>
	{/if}

	{#each canvasStore.elements as element (element.id)}
		{#if element.visible}
			{#if element.type === 'text'}
				<TextElement {element} />
			{:else if element.type === 'image'}
				<ImageElement {element} />
			{/if}
		{/if}
	{/each}

	{#if selectionStore.hasSelection}
		<TransformControls />
	{/if}
</div>

<style>
	.canvas-container:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
</style>
```

**Step 2: Create TextElement component**

Create file `src/lib/components/canvas-editor/canvas/TextElement.svelte`:

```svelte
<script lang="ts">
	import type { TextElement } from '../types/elements';
	import { selectionStore, canvasStore } from '../stores';

	interface Props {
		element: TextElement;
	}

	let { element }: Props = $props();

	let isSelected = $derived(selectionStore.isSelected(element.id));

	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		if (e.shiftKey) {
			selectionStore.toggleSelection(element.id);
		} else {
			selectionStore.select(element.id);
		}
	}

	function handleDoubleClick(e: MouseEvent) {
		e.stopPropagation();
		// Enable inline editing mode
	}

	function handleDragEnd(e: MouseEvent) {
		const target = e.target as HTMLElement;
		const newX = parseInt(target.style.left) || element.x;
		const newY = parseInt(target.style.top) || element.y;
		canvasStore.updateElement(element.id, { x: newX, y: newY });
	}
</script>

<div
	class="text-element absolute cursor-move select-none"
	class:selected={isSelected}
	class:locked={element.locked}
	style="
		left: {element.x}px;
		top: {element.y}px;
		width: {element.width}px;
		height: {element.height}px;
		transform: rotate({element.rotation}deg);
		opacity: {element.opacity};
		font-family: {element.text.fontFamily};
		font-size: {element.text.fontSize}px;
		font-weight: {element.text.fontWeight};
		font-style: {element.text.fontStyle};
		text-align: {element.text.textAlign};
		color: {element.text.fill};
		-webkit-text-stroke: {element.text.strokeWidth}px {element.text.stroke};
		line-height: {element.text.lineHeight};
	"
	onclick={handleClick}
	ondblclick={handleDoubleClick}
	draggable={!element.locked}
	ondragend={handleDragEnd}
	role="textbox"
	aria-label="Text element: {element.text.content}"
	tabindex="0"
>
	<span
		class="flex h-full w-full items-center justify-center"
		style="vertical-align: {element.text.verticalAlign}"
	>
		{element.text.translatedContent || element.text.content}
	</span>
</div>

<style>
	.text-element {
		border: 2px solid transparent;
		padding: 4px;
		transition: border-color 0.15s ease;
	}

	.text-element:hover:not(.locked) {
		border-color: #3b82f6;
	}

	.text-element.selected {
		border-color: #3b82f6;
		box-shadow: 0 0 0 1px #3b82f6;
	}

	.text-element.locked {
		cursor: not-allowed;
		opacity: 0.7;
	}
</style>
```

**Step 3: Create ImageElement component**

Create file `src/lib/components/canvas-editor/canvas/ImageElement.svelte`:

```svelte
<script lang="ts">
	import type { ImageElement } from '../types/image';
	import { selectionStore, canvasStore } from '../stores';

	interface Props {
		element: ImageElement;
	}

	let { element }: Props = $props();

	let isSelected = $derived(selectionStore.isSelected(element.id));

	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		if (e.shiftKey) {
			selectionStore.toggleSelection(element.id);
		} else {
			selectionStore.select(element.id);
		}
	}
</script>

<div
	class="image-element absolute"
	class:selected={isSelected}
	class:locked={element.locked}
	style="
		left: {element.x}px;
		top: {element.y}px;
		width: {element.width}px;
		height: {element.height}px;
		transform: rotate({element.rotation}deg);
		opacity: {element.opacity};
	"
	onclick={handleClick}
	role="img"
	aria-label="Image element"
>
	<img
		src={element.image.src}
		alt=""
		class="pointer-events-none h-full w-full object-cover"
		draggable="false"
	/>
</div>

<style>
	.image-element {
		border: 2px solid transparent;
		transition: border-color 0.15s ease;
	}

	.image-element:hover:not(.locked) {
		border-color: #3b82f6;
	}

	.image-element.selected {
		border-color: #3b82f6;
		box-shadow: 0 0 0 1px #3b82f6;
	}

	.image-element.locked {
		cursor: not-allowed;
		opacity: 0.7;
	}
</style>
```

**Step 4: Create TransformControls component**

Create file `src/lib/components/canvas-editor/canvas/TransformControls.svelte`:

```svelte
<script lang="ts">
	import { canvasStore, selectionStore } from '../stores';
	import { getBoundingBox } from '../utils/transformers';

	const selectedElements = $derived(
		selectionStore.selectedIdsArray.map((id) => canvasStore.getElement(id)).filter(Boolean)
	);

	const boundingBox = $derived(getBoundingBox(selectedElements));

	const handlePositions = [
		{ name: 'nw', cursor: 'nwse-resize', x: 0, y: 0 },
		{ name: 'n', cursor: 'ns-resize', x: 0.5, y: 0 },
		{ name: 'ne', cursor: 'nesw-resize', x: 1, y: 0 },
		{ name: 'e', cursor: 'ew-resize', x: 1, y: 0.5 },
		{ name: 'se', cursor: 'nwse-resize', x: 1, y: 1 },
		{ name: 's', cursor: 'ns-resize', x: 0.5, y: 1 },
		{ name: 'sw', cursor: 'nesw-resize', x: 0, y: 1 },
		{ name: 'w', cursor: 'ew-resize', x: 0, y: 0.5 }
	];

	let isDragging = $state(false);
	let activeHandle = $state<string | null>(null);
	let startPos = $state({ x: 0, y: 0, width: 0, height: 0 });

	function startResize(handle: string, e: MouseEvent) {
		e.stopPropagation();
		if (!boundingBox) return;

		isDragging = true;
		activeHandle = handle;
		startPos = {
			x: boundingBox.x,
			y: boundingBox.y,
			width: boundingBox.width,
			height: boundingBox.height
		};
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging || !boundingBox || !activeHandle) return;

		const dx = e.movementX;
		const dy = e.movementY;

		// Calculate new dimensions based on handle
		let newX = startPos.x;
		let newY = startPos.y;
		let newWidth = startPos.width;
		let newHeight = startPos.height;

		if (activeHandle.includes('e')) newWidth += dx;
		if (activeHandle.includes('w')) {
			newX += dx;
			newWidth -= dx;
		}
		if (activeHandle.includes('s')) newHeight += dy;
		if (activeHandle.includes('n')) {
			newY += dy;
			newHeight -= dy;
		}

		// Update all selected elements proportionally
		const scaleX = newWidth / startPos.width;
		const scaleY = newHeight / startPos.height;

		for (const el of selectedElements) {
			if (!el) continue;
			const relX = (el.x - startPos.x) / startPos.width;
			const relY = (el.y - startPos.y) / startPos.height;

			canvasStore.updateElement(el.id, {
				x: newX + relX * newWidth,
				y: newY + relY * newHeight,
				width: el.width * scaleX,
				height: el.height * scaleY
			});
		}
	}

	function handleMouseUp() {
		isDragging = false;
		activeHandle = null;
	}
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} />

{#if boundingBox}
	<div
		class="transform-controls pointer-events-none absolute"
		style="
			left: {boundingBox.x}px;
			top: {boundingBox.y}px;
			width: {boundingBox.width}px;
			height: {boundingBox.height}px;
		"
	>
		<!-- Resize handles -->
		{#each handlePositions as handle}
			<div
				class="resize-handle pointer-events-auto"
				style="
					left: {handle.x * 100}%;
					top: {handle.y * 100}%;
					cursor: {handle.cursor};
				"
				onmousedown={(e) => startResize(handle.name, e)}
				role="button"
				aria-label="Resize {handle.name}"
				tabindex="0"
			></div>
		{/each}

		<!-- Rotation handle -->
		<div
			class="rotation-handle pointer-events-auto"
			style="left: 50%; top: -30px;"
			role="button"
			aria-label="Rotate"
			tabindex="0"
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M21 12a9 9 0 11-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
				<path d="M21 3v5h-5" />
			</svg>
		</div>
	</div>
{/if}

<style>
	.transform-controls {
		border: 2px solid #3b82f6;
		box-sizing: border-box;
	}

	.resize-handle {
		position: absolute;
		width: 10px;
		height: 10px;
		background: white;
		border: 2px solid #3b82f6;
		border-radius: 2px;
		transform: translate(-50%, -50%);
		transition: transform 0.1s ease;
	}

	.resize-handle:hover {
		transform: translate(-50%, -50%) scale(1.2);
	}

	.rotation-handle {
		position: absolute;
		width: 24px;
		height: 24px;
		background: white;
		border: 2px solid #3b82f6;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: grab;
		transform: translateX(-50%);
	}

	.rotation-handle:hover {
		background: #eff6ff;
	}

	.rotation-handle:active {
		cursor: grabbing;
	}
</style>
```

**Step 5: Commit**

```bash
git add src/lib/components/canvas-editor/canvas/
git commit -m "feat(canvas-editor): add main canvas components with transform controls"
```

---

## Task 6: Create Toolbar Components

**Files:**

- Create: `src/lib/components/canvas-editor/toolbar/Toolbar.svelte`
- Create: `src/lib/components/canvas-editor/toolbar/TextToolbar.svelte`
- Create: `src/lib/components/canvas-editor/toolbar/ZoomControls.svelte`
- Create: `src/lib/components/canvas-editor/toolbar/UndoRedo.svelte`

**Step 1: Create main Toolbar**

Create file `src/lib/components/canvas-editor/toolbar/Toolbar.svelte`:

```svelte
<script lang="ts">
	import { selectionStore } from '../stores';
	import TextToolbar from './TextToolbar.svelte';
	import ZoomControls from './ZoomControls.svelte';
	import UndoRedo from './UndoRedo.svelte';

	const tools = [
		{ id: 'select', label: 'Select', shortcut: 'V', icon: 'cursor' },
		{ id: 'text', label: 'Text', shortcut: 'T', icon: 'type' },
		{ id: 'pan', label: 'Pan', shortcut: 'H', icon: 'move' },
		{ id: 'zoom', label: 'Zoom', shortcut: 'Z', icon: 'zoom-in' }
	] as const;

	function setTool(tool: typeof selectionStore.activeTool) {
		selectionStore.setActiveTool(tool);
	}
</script>

<div
	class="toolbar flex items-center gap-2 border-b border-gray-200 bg-white p-2"
	role="toolbar"
	aria-label="Editor toolbar"
>
	<!-- Tool buttons -->
	<div class="flex items-center gap-1 border-r border-gray-200 pr-2">
		{#each tools as tool}
			<button
				class="tool-button"
				class:active={selectionStore.activeTool === tool.id}
				onclick={() => setTool(tool.id)}
				title="{tool.label} ({tool.shortcut})"
				aria-pressed={selectionStore.activeTool === tool.id}
			>
				{#if tool.icon === 'cursor'}
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
					</svg>
				{:else if tool.icon === 'type'}
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<polyline points="4 7 4 4 20 4 20 7" />
						<line x1="9" y1="20" x2="15" y2="20" />
						<line x1="12" y1="4" x2="12" y2="20" />
					</svg>
				{:else if tool.icon === 'move'}
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<polyline points="5 9 2 12 5 15" />
						<polyline points="9 5 12 2 15 5" />
						<polyline points="15 19 12 22 9 19" />
						<polyline points="19 9 22 12 19 15" />
						<line x1="2" y1="12" x2="22" y2="12" />
						<line x1="12" y1="2" x2="12" y2="22" />
					</svg>
				{:else if tool.icon === 'zoom-in'}
					<svg
						width="18"
						height="18"
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
				{/if}
			</button>
		{/each}
	</div>

	<!-- Text formatting (shown when text is selected) -->
	<TextToolbar />

	<!-- Spacer -->
	<div class="flex-1"></div>

	<!-- Undo/Redo -->
	<UndoRedo />

	<!-- Zoom controls -->
	<ZoomControls />
</div>

<style>
	.tool-button {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		border: none;
		background: transparent;
		color: #374151;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.tool-button:hover {
		background: #f3f4f6;
	}

	.tool-button.active {
		background: #eff6ff;
		color: #2563eb;
	}

	.tool-button:focus-visible {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}
</style>
```

**Step 2: Create TextToolbar**

Create file `src/lib/components/canvas-editor/toolbar/TextToolbar.svelte`:

```svelte
<script lang="ts">
	import { canvasStore, selectionStore } from '../stores';
	import type { TextElement } from '../types/elements';

	const fonts = [
		'Arial',
		'Helvetica',
		'Times New Roman',
		'Georgia',
		'Verdana',
		'Comic Sans MS',
		'Impact'
	];

	const fontSizes = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72];

	const selectedTextElements = $derived(
		selectionStore.selectedIdsArray
			.map((id) => canvasStore.getElement(id))
			.filter((el): el is TextElement => el?.type === 'text')
	);

	const hasTextSelection = $derived(selectedTextElements.length > 0);

	function updateTextProperty(property: string, value: string | number) {
		for (const el of selectedTextElements) {
			canvasStore.updateElement(el.id, {
				text: { ...el.text, [property]: value }
			} as Partial<TextElement>);
		}
	}

	function toggleBold() {
		for (const el of selectedTextElements) {
			const newWeight = el.text.fontWeight === 'bold' ? 'normal' : 'bold';
			updateTextProperty('fontWeight', newWeight);
		}
	}

	function toggleItalic() {
		for (const el of selectedTextElements) {
			const newStyle = el.text.fontStyle === 'italic' ? 'normal' : 'italic';
			updateTextProperty('fontStyle', newStyle);
		}
	}
</script>

{#if hasTextSelection}
	<div class="text-toolbar flex items-center gap-2 border-l border-gray-200 pl-2">
		<!-- Font family -->
		<select
			class="font-select"
			onchange={(e) => updateTextProperty('fontFamily', e.currentTarget.value)}
			aria-label="Font family"
		>
			{#each fonts as font}
				<option value={font}>{font}</option>
			{/each}
		</select>

		<!-- Font size -->
		<select
			class="size-select"
			onchange={(e) => updateTextProperty('fontSize', parseInt(e.currentTarget.value))}
			aria-label="Font size"
		>
			{#each fontSizes as size}
				<option value={size}>{size}</option>
			{/each}
		</select>

		<!-- Bold -->
		<button
			class="format-button"
			class:active={selectedTextElements[0]?.text.fontWeight === 'bold'}
			onclick={toggleBold}
			title="Bold (Ctrl+B)"
			aria-label="Bold"
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="3"
			>
				<path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
				<path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
			</svg>
		</button>

		<!-- Italic -->
		<button
			class="format-button"
			class:active={selectedTextElements[0]?.text.fontStyle === 'italic'}
			onclick={toggleItalic}
			title="Italic (Ctrl+I)"
			aria-label="Italic"
		>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<line x1="19" y1="4" x2="10" y2="4" />
				<line x1="14" y1="20" x2="5" y2="20" />
				<line x1="15" y1="4" x2="9" y2="20" />
			</svg>
		</button>

		<!-- Text color -->
		<label class="color-input" title="Text color">
			<input
				type="color"
				value={selectedTextElements[0]?.text.fill || '#000000'}
				onchange={(e) => updateTextProperty('fill', e.currentTarget.value)}
				aria-label="Text color"
			/>
			<svg
				width="16"
				height="16"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M4 20h16" />
				<path d="M12 4v12" />
				<path d="M8 8l4-4 4 4" />
			</svg>
		</label>

		<!-- Alignment -->
		<div class="flex items-center gap-1 border-l border-gray-200 pl-2">
			<button
				class="format-button"
				class:active={selectedTextElements[0]?.text.textAlign === 'left'}
				onclick={() => updateTextProperty('textAlign', 'left')}
				title="Align left"
				aria-label="Align left"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="12" x2="15" y2="12" />
					<line x1="3" y1="18" x2="18" y2="18" />
				</svg>
			</button>
			<button
				class="format-button"
				class:active={selectedTextElements[0]?.text.textAlign === 'center'}
				onclick={() => updateTextProperty('textAlign', 'center')}
				title="Align center"
				aria-label="Align center"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="6" y1="12" x2="18" y2="12" />
					<line x1="4" y1="18" x2="20" y2="18" />
				</svg>
			</button>
			<button
				class="format-button"
				class:active={selectedTextElements[0]?.text.textAlign === 'right'}
				onclick={() => updateTextProperty('textAlign', 'right')}
				title="Align right"
				aria-label="Align right"
			>
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="9" y1="12" x2="21" y2="12" />
					<line x1="6" y1="18" x2="21" y2="18" />
				</svg>
			</button>
		</div>
	</div>
{/if}

<style>
	.font-select,
	.size-select {
		padding: 4px 8px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 12px;
		background: white;
		cursor: pointer;
	}

	.font-select {
		width: 120px;
	}

	.size-select {
		width: 60px;
	}

	.format-button {
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

	.format-button:hover {
		background: #f3f4f6;
	}

	.format-button.active {
		background: #eff6ff;
		color: #2563eb;
	}

	.color-input {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		cursor: pointer;
	}

	.color-input input {
		position: absolute;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}
</style>
```

**Step 3: Create ZoomControls**

Create file `src/lib/components/canvas-editor/toolbar/ZoomControls.svelte`:

```svelte
<script lang="ts">
	import { canvasStore } from '../stores';

	const zoomLevels = [25, 50, 75, 100, 125, 150, 200, 300, 400];

	function zoomIn() {
		canvasStore.setZoom(canvasStore.zoom * 1.25);
	}

	function zoomOut() {
		canvasStore.setZoom(canvasStore.zoom / 1.25);
	}

	function setZoom(level: number) {
		canvasStore.setZoom(level / 100);
	}

	function fitToScreen() {
		// Calculate fit zoom
		canvasStore.setZoom(1);
	}
</script>

<div class="zoom-controls flex items-center gap-1 border-l border-gray-200 pl-2">
	<button class="zoom-button" onclick={zoomOut} title="Zoom out (Ctrl+-)" aria-label="Zoom out">
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

	<select
		class="zoom-select"
		value={Math.round(canvasStore.zoom * 100)}
		onchange={(e) => setZoom(parseInt(e.currentTarget.value))}
		aria-label="Zoom level"
	>
		{#each zoomLevels as level}
			<option value={level}>{level}%</option>
		{/each}
	</select>

	<button class="zoom-button" onclick={zoomIn} title="Zoom in (Ctrl++)" aria-label="Zoom in">
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

	<button
		class="zoom-button"
		onclick={fitToScreen}
		title="Fit to screen (Ctrl+0)"
		aria-label="Fit to screen"
	>
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<path d="M8 3H5a2 2 0 0 0-2 2v3" />
			<path d="M21 8V5a2 2 0 0 0-2-2h-3" />
			<path d="M3 16v3a2 2 0 0 0 2 2h3" />
			<path d="M16 21h3a2 2 0 0 0 2-2v-3" />
		</svg>
	</button>
</div>

<style>
	.zoom-button {
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

	.zoom-button:hover {
		background: #f3f4f6;
	}

	.zoom-select {
		padding: 4px 8px;
		border: 1px solid #d1d5db;
		border-radius: 6px;
		font-size: 12px;
		background: white;
		cursor: pointer;
		width: 70px;
	}
</style>
```

**Step 4: Create UndoRedo**

Create file `src/lib/components/canvas-editor/toolbar/UndoRedo.svelte`:

```svelte
<script lang="ts">
	import { historyStore } from '../stores';

	function undo() {
		const action = historyStore.undo();
		if (action) {
			// Apply undo logic
		}
	}

	function redo() {
		const action = historyStore.redo();
		if (action) {
			// Apply redo logic
		}
	}
</script>

<div class="undo-redo flex items-center gap-1 border-r border-gray-200 pr-2">
	<button
		class="history-button"
		disabled={!historyStore.canUndo}
		onclick={undo}
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
		class="history-button"
		disabled={!historyStore.canRedo}
		onclick={redo}
		title="Redo (Ctrl+Y)"
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
	.history-button {
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

	.history-button:hover:not(:disabled) {
		background: #f3f4f6;
	}

	.history-button:disabled {
		color: #9ca3af;
		cursor: not-allowed;
	}
</style>
```

**Step 5: Commit**

```bash
git add src/lib/components/canvas-editor/toolbar/
git commit -m "feat(canvas-editor): add toolbar components with text formatting and zoom controls"
```

---

## Task 7: Create Panel Components

**Files:**

- Create: `src/lib/components/canvas-editor/panels/LayerPanel.svelte`
- Create: `src/lib/components/canvas-editor/panels/PropertiesPanel.svelte`
- Create: `src/lib/components/canvas-editor/panels/TranslationGrid.svelte`

**Step 1: Create LayerPanel**

Create file `src/lib/components/canvas-editor/panels/LayerPanel.svelte`:

```svelte
<script lang="ts">
	import { canvasStore, selectionStore } from '../stores';
	import type { CanvasElement } from '../types/elements';

	let dragIndex = $state<number | null>(null);

	function selectElement(id: string, e: MouseEvent) {
		if (e.shiftKey) {
			selectionStore.toggleSelection(id);
		} else {
			selectionStore.select(id);
		}
	}

	function toggleVisibility(id: string, e: Event) {
		e.stopPropagation();
		const el = canvasStore.getElement(id);
		if (el) {
			canvasStore.updateElement(id, { visible: !el.visible });
		}
	}

	function toggleLock(id: string, e: Event) {
		e.stopPropagation();
		const el = canvasStore.getElement(id);
		if (el) {
			canvasStore.updateElement(id, { locked: !el.locked });
		}
	}

	function handleDragStart(index: number) {
		dragIndex = index;
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function handleDrop(targetIndex: number) {
		if (dragIndex === null || dragIndex === targetIndex) return;

		const elements = [...canvasStore.elements];
		const [removed] = elements.splice(dragIndex, 1);
		elements.splice(targetIndex, 0, removed);

		canvasStore.setElements(elements.map((el, idx) => ({ ...el, zIndex: idx })));
		dragIndex = null;
	}

	function deleteElement(id: string) {
		canvasStore.deleteElement(id);
		selectionStore.removeFromSelection(id);
	}
</script>

<div
	class="layer-panel flex w-64 flex-col border-r border-gray-200 bg-white"
	role="region"
	aria-label="Layers"
>
	<div class="panel-header flex items-center justify-between border-b border-gray-200 p-3">
		<h2 class="text-sm font-semibold text-gray-700">Layers</h2>
		<span class="text-xs text-gray-500">{canvasStore.elements.length} items</span>
	</div>

	<div class="layer-list flex-1 space-y-1 overflow-y-auto p-2">
		{#each [...canvasStore.elements].reverse() as element, i (element.id)}
			{@const index = canvasStore.elements.length - 1 - i}
			<div
				class="layer-item"
				class:selected={selectionStore.isSelected(element.id)}
				class:locked={element.locked}
				class:invisible={!element.visible}
				draggable="true"
				ondragstart={() => handleDragStart(index)}
				ondragover={handleDragOver}
				ondrop={() => handleDrop(index)}
				onclick={(e) => selectElement(element.id, e)}
				role="button"
				tabindex="0"
				aria-label="{element.type} layer"
			>
				<div class="layer-icon">
					{#if element.type === 'text'}
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polyline points="4 7 4 4 20 4 20 7" />
							<line x1="9" y1="20" x2="15" y2="20" />
							<line x1="12" y1="4" x2="12" y2="20" />
						</svg>
					{:else if element.type === 'image'}
						<svg
							width="14"
							height="14"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
							<circle cx="8.5" cy="8.5" r="1.5" />
							<polyline points="21 15 16 10 5 21" />
						</svg>
					{/if}
				</div>

				<div class="layer-name flex-1 truncate text-xs">
					{#if element.type === 'text'}
						{element.text.content.slice(0, 20)}...
					{:else}
						Image
					{/if}
				</div>

				<div class="layer-actions flex items-center gap-1">
					<button
						class="action-btn"
						onclick={(e) => toggleVisibility(element.id, e)}
						title={element.visible ? 'Hide' : 'Show'}
						aria-label={element.visible ? 'Hide layer' : 'Show layer'}
					>
						{#if element.visible}
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
								<circle cx="12" cy="12" r="3" />
							</svg>
						{:else}
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<path
									d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-1.69-2.42L1 1"
								/>
							</svg>
						{/if}
					</button>

					<button
						class="action-btn"
						onclick={(e) => toggleLock(element.id, e)}
						title={element.locked ? 'Unlock' : 'Lock'}
						aria-label={element.locked ? 'Unlock layer' : 'Lock layer'}
					>
						{#if element.locked}
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
								<path d="M7 11V7a5 5 0 0 1 10 0v4" />
							</svg>
						{:else}
							<svg
								width="12"
								height="12"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
								<path d="M7 11V7a5 5 0 0 1 9.9-1" />
							</svg>
						{/if}
					</button>

					<button
						class="action-btn delete"
						onclick={() => deleteElement(element.id)}
						title="Delete"
						aria-label="Delete layer"
					>
						<svg
							width="12"
							height="12"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
						>
							<polyline points="3 6 5 6 21 6" />
							<path
								d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
							/>
						</svg>
					</button>
				</div>
			</div>
		{:else}
			<div class="empty-state text-center text-gray-400 text-xs py-8">No layers yet</div>
		{/each}
	</div>
</div>

<style>
	.panel-header {
		background: #f9fafb;
	}

	.layer-item {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 8px;
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.15s ease;
		border: 1px solid transparent;
	}

	.layer-item:hover {
		background: #f3f4f6;
	}

	.layer-item.selected {
		background: #eff6ff;
		border-color: #3b82f6;
	}

	.layer-item.locked {
		opacity: 0.6;
	}

	.layer-item.invisible {
		opacity: 0.4;
	}

	.layer-icon {
		color: #6b7280;
	}

	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		border: none;
		background: transparent;
		color: #6b7280;
		cursor: pointer;
		border-radius: 4px;
		opacity: 0;
		transition: all 0.15s ease;
	}

	.layer-item:hover .action-btn {
		opacity: 1;
	}

	.action-btn:hover {
		background: #e5e7eb;
		color: #374151;
	}

	.action-btn.delete:hover {
		color: #dc2626;
	}
</style>
```

**Step 2: Create PropertiesPanel**

Create file `src/lib/components/canvas-editor/panels/PropertiesPanel.svelte`:

```svelte
<script lang="ts">
	import { canvasStore, selectionStore } from '../stores';
	import type { TextElement, CanvasElement } from '../types/elements';

	const selectedElement = $derived(() => {
		const ids = selectionStore.selectedIdsArray;
		if (ids.length !== 1) return null;
		return canvasStore.getElement(ids[0]);
	});

	function updatePosition(prop: 'x' | 'y', value: number) {
		const el = selectedElement();
		if (!el) return;
		canvasStore.updateElement(el.id, { [prop]: value });
	}

	function updateSize(prop: 'width' | 'height', value: number) {
		const el = selectedElement();
		if (!el) return;
		canvasStore.updateElement(el.id, { [prop]: Math.max(10, value) });
	}

	function updateRotation(value: number) {
		const el = selectedElement();
		if (!el) return;
		canvasStore.updateElement(el.id, { rotation: value });
	}

	function updateOpacity(value: number) {
		const el = selectedElement();
		if (!el) return;
		canvasStore.updateElement(el.id, { opacity: Math.max(0, Math.min(1, value)) });
	}
</script>

<div class="properties-panel flex flex-col bg-white border-l border-gray-200 w-64" role="region" aria-label="Properties">
	<div class="panel-header p-3 border-b border-gray-200">
		<h2 class="text-sm font-semibold text-gray-700">Properties</h2>
	</div>

	{#if selectedElement()}
		{@const el = selectedElement()!}
		<div class="properties-content p-3 space-y-4">
			<!-- Position -->
			<div class="property-group">
				<h3 class="text-xs font-medium text-gray-500 mb-2">Position</h3>
				<div class="grid grid-cols-2 gap-2">
					<label class="input-group">
						<span class="text-xs text-gray-500">X</span>
						<input
							type="number"
							class="input-field"
							value={Math.round(el.x)}
							onchange={(e) => updatePosition('x', parseFloat(e.currentTarget.value))}
						/>
					</label>
					<label class="input-group">
						<span class="text-xs text-gray-500">Y</span>
						<input
							type="number"
							class="input-field"
							value={Math.round(el.y)}
							onchange={(e) => updatePosition('y', parseFloat(e.currentTarget.value))}
						/>
					</label>
				</div>
			</div>

			<!-- Size -->
			<div class="property-group">
				<h3 class="text-xs font-medium text-gray-500 mb-2">Size</h3>
				<div class="grid grid-cols-2 gap-2">
					<label class="input-group">
						<span class="text-xs text-gray-500">W</span>
						<input
							type="number"
							class="input-field"
							value={Math.round(el.width)}
							onchange={(e) => updateSize('width', parseFloat(e.currentTarget.value))}
						/>
					</label>
					<label class="input-group">
						<span class="text-xs text-gray-500">H</span>
						<input
							type="number"
							class="input-field"
							value={Math.round(el.height)}
							onchange={(e) => updateSize('height', parseFloat(e.currentTarget.value))}
						/>
					</label>
				</div>
			</div>

			<!-- Transform -->
			<div class="property-group">
				<h3 class="text-xs font-medium text-gray-500 mb-2">Transform</h3>
				<div class="grid grid-cols-2 gap-2">
					<label class="input-group">
						<span class="text-xs text-gray-500">Rotation</span>
						<input
							type="number"
							class="input-field"
							value={Math.round(el.rotation)}
							onchange={(e) => updateRotation(parseFloat(e.currentTarget.value))}
						/>
					</label>
					<label class="input-group">
						<span class="text-xs text-gray-500">Opacity</span>
						<input
							type="number"
							class="input-field"
							step="0.1"
							min="0"
							max="1"
							value={el.opacity}
							onchange={(e) => updateOpacity(parseFloat(e.currentTarget.value))}
						/>
					</label>
				</div>
			</div>

			<!-- Text-specific properties -->
			{#if el.type === 'text'}
				{@const textEl = el as TextElement}
				<div class="property-group">
					<h3 class="text-xs font-medium text-gray-500 mb-2">Translation Status</h3>
					<select
						class="input-field w-full"
						value={textEl.text.status}
						onchange={(e) => canvasStore.updateElement(el.id, {
							text: { ...textEl.text, status: e.currentTarget.value as typeof textEl.text.status }
						} as Partial<TextElement>)}
					>
						<option value="pending">Pending</option>
						<option value="translated">Translated</option>
						<option value="reviewed">Reviewed</option>
					</select>
				</div>

				<div class="property-group">
					<h3 class="text-xs font-medium text-gray-500 mb-2">Original Text</h3>
					<textarea
						class="input-field w-full h-20 resize-none"
						value={textEl.text.originalContent}
						onchange={(e) => canvasStore.updateElement(el.id, {
```
