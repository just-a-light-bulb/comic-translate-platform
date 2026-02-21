<script lang="ts">
	import { onMount } from 'svelte';
	import { canvasStore, selectionStore, settingsStore } from '../stores';
	import TextElement from './TextElement.svelte';
	import ImageElement from './ImageElement.svelte';
	import ShapeElement from './ShapeElement.svelte';
	import TransformControls from './TransformControls.svelte';
	import type { ShapeProperties } from '../types/elements';

	interface Props {
		width?: number;
		height?: number;
		backgroundImage?: string;
	}

	let { width = 800, height = 600, backgroundImage }: Props = $props();

	let container: HTMLDivElement;
	let isPanning = $state(false);
	let lastPanPoint = $state({ x: 0, y: 0 });
	let isDrawingShape = $state(false);
	let shapeStart = $state({ x: 0, y: 0 });
	let currentShapeEnd = $state({ x: 0, y: 0 });
	let currentShapeType = $state<ShapeProperties['shapeType']>('rectangle');

	const SHAPE_TYPES: ShapeProperties['shapeType'][] = ['rectangle', 'ellipse', 'line', 'arrow'];

	onMount(() => {
		canvasStore.setDimensions(width, height);
		if (backgroundImage) {
			canvasStore.setBackgroundImage(backgroundImage);
		}
	});

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const scaleBy = 1.1;
		const newZoom = e.deltaY < 0 ? canvasStore.zoom * scaleBy : canvasStore.zoom / scaleBy;
		canvasStore.setZoom(newZoom);
	}

	function getCanvasCoords(e: MouseEvent): { x: number; y: number } {
		const rect = container.getBoundingClientRect();
		return {
			x: (e.clientX - rect.left - canvasStore.panX) / canvasStore.zoom,
			y: (e.clientY - rect.top - canvasStore.panY) / canvasStore.zoom
		};
	}

	function handleMouseDown(e: MouseEvent) {
		const coords = getCanvasCoords(e);

		if (e.button === 1 || (e.button === 0 && selectionStore.activeTool === 'pan')) {
			isPanning = true;
			lastPanPoint = { x: e.clientX, y: e.clientY };
			container.style.cursor = 'grabbing';
			return;
		}

		if (selectionStore.activeTool === 'text' && e.button === 0) {
			canvasStore.addTextElement({
				x: coords.x,
				y: coords.y,
				width: 150,
				height: 40,
				content: 'New Text',
				originalContent: 'New Text'
			});
			selectionStore.setActiveTool('select');
			return;
		}

		if (selectionStore.activeTool === 'zoom' && e.button === 0) {
			const scaleBy = 1.2;
			if (e.altKey) {
				canvasStore.setZoom(canvasStore.zoom / scaleBy);
			} else {
				canvasStore.setZoom(canvasStore.zoom * scaleBy);
			}
			return;
		}

		if (selectionStore.activeTool === 'shape' && e.button === 0) {
			isDrawingShape = true;
			shapeStart = coords;
			currentShapeEnd = coords;
			const currentIndex = SHAPE_TYPES.indexOf(currentShapeType);
			currentShapeType = SHAPE_TYPES[(currentIndex + 1) % SHAPE_TYPES.length];
			return;
		}

		if (selectionStore.activeTool === 'select' && e.target === container) {
			selectionStore.clearSelection();
		}
	}

	function handleMouseMove(e: MouseEvent) {
		if (isPanning) {
			const dx = e.clientX - lastPanPoint.x;
			const dy = e.clientY - lastPanPoint.y;
			canvasStore.setPan(canvasStore.panX + dx, canvasStore.panY + dy);
			lastPanPoint = { x: e.clientX, y: e.clientY };
			return;
		}

		if (isDrawingShape) {
			currentShapeEnd = getCanvasCoords(e);
		}
	}

	function handleMouseUp(e: MouseEvent) {
		if (isPanning) {
			isPanning = false;
			if (selectionStore.activeTool === 'pan') {
				container.style.cursor = 'grab';
			} else {
				container.style.cursor = 'default';
			}
		}

		if (isDrawingShape && e.button === 0) {
			const coords = getCanvasCoords(e);
			const x = Math.min(shapeStart.x, coords.x);
			const y = Math.min(shapeStart.y, coords.y);
			const shapeWidth = Math.abs(coords.x - shapeStart.x);
			const shapeHeight = Math.abs(coords.y - shapeStart.y);

			if (shapeWidth > 5 && shapeHeight > 5) {
				const shapeProps: ShapeProperties = {
					shapeType: currentShapeType,
					fill: 'transparent',
					stroke: '#000000',
					strokeWidth: 2,
					cornerRadius: 0
				};

				canvasStore.addElement({
					type: 'shape',
					x,
					y,
					width: shapeWidth,
					height: shapeHeight,
					rotation: 0,
					opacity: 1,
					visible: true,
					locked: false,
					shape: shapeProps
				});
			}

			isDrawingShape = false;
		}
	}

	function handleContextMenu(e: MouseEvent) {
		e.preventDefault();
		if (selectionStore.activeTool === 'zoom') {
			canvasStore.setZoom(canvasStore.zoom / 1.2);
		}
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLInputElement) {
			return;
		}

		switch (e.key.toLowerCase()) {
			case 'v':
				selectionStore.setActiveTool('select');
				break;
			case 't':
				selectionStore.setActiveTool('text');
				break;
			case 'h':
				selectionStore.setActiveTool('pan');
				break;
			case 'z':
				selectionStore.setActiveTool('zoom');
				break;
			case 's':
				selectionStore.setActiveTool('shape');
				break;
			case 'delete':
			case 'backspace':
				if (selectionStore.hasSelection) {
					canvasStore.deleteElements(selectionStore.selectedIdsArray);
					selectionStore.clearSelection();
				}
				break;
			case 'escape':
				selectionStore.clearSelection();
				selectionStore.setActiveTool('select');
				break;
		}
	}

	const sortedElements = $derived(canvasStore.sortedElements);

	const shapePreview = $derived(
		isDrawingShape
			? {
					x: Math.min(shapeStart.x, currentShapeEnd.x),
					y: Math.min(shapeStart.y, currentShapeEnd.y),
					width: Math.abs(currentShapeEnd.x - shapeStart.x),
					height: Math.abs(currentShapeEnd.y - shapeStart.y)
				}
			: null
	);
</script>

<svelte:window onmousemove={handleMouseMove} onmouseup={handleMouseUp} onkeydown={handleKeyDown} />

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	class="canvas-container relative overflow-hidden rounded-lg border border-gray-300 bg-gray-100"
	class:tool-select={selectionStore.activeTool === 'select'}
	class:tool-text={selectionStore.activeTool === 'text'}
	class:tool-pan={selectionStore.activeTool === 'pan'}
	class:tool-zoom={selectionStore.activeTool === 'zoom'}
	class:tool-shape={selectionStore.activeTool === 'shape'}
	bind:this={container}
	style="width: {width}px; height: {height}px;"
	onwheel={handleWheel}
	onmousedown={handleMouseDown}
	oncontextmenu={handleContextMenu}
	role="application"
	aria-label="Canvas editor"
	tabindex="0"
>
	<!-- Background Image -->
	{#if backgroundImage || canvasStore.backgroundImage}
		<img
			src={backgroundImage || canvasStore.backgroundImage || ''}
			alt="Background"
			class="pointer-events-none absolute inset-0 h-full w-full object-contain"
		/>
	{/if}

	<!-- Canvas Elements Layer -->
	<div
		class="elements-layer absolute inset-0"
		style="transform: translate({canvasStore.panX}px, {canvasStore.panY}px) scale({canvasStore.zoom}); transform-origin: 0 0;"
	>
		{#each sortedElements as element (element.id)}
			{#if element.visible}
				{#if element.type === 'text'}
					<TextElement {element} />
				{:else if element.type === 'image'}
					<ImageElement {element} />
				{:else if element.type === 'shape'}
					<ShapeElement {element} />
				{/if}
			{/if}
		{/each}

		<!-- Transform Controls for Selected Elements -->
		{#if selectionStore.hasSelection}
			<TransformControls />
		{/if}

		<!-- Shape Preview while drawing -->
		{#if shapePreview && shapePreview.width > 0 && shapePreview.height > 0}
			<div
				class="shape-preview absolute border-2 border-dashed border-blue-500 bg-blue-500/10"
				style="
					left: {shapePreview.x}px;
					top: {shapePreview.y}px;
					width: {shapePreview.width}px;
					height: {shapePreview.height}px;
					pointer-events: none;
				"
			></div>
		{/if}
	</div>

	<!-- Grid Overlay (optional) -->
	{#if settingsStore.settings.showGuides}
		<div class="grid-overlay pointer-events-none absolute inset-0 opacity-20"></div>
	{/if}

	<!-- Tool indicator -->
	<div
		class="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white"
	>
		{selectionStore.activeTool.toUpperCase()} Tool
	</div>
</div>

<style>
	.canvas-container:focus {
		outline: 2px solid #3b82f6;
		outline-offset: 2px;
	}

	.canvas-container.tool-select {
		cursor: default;
	}

	.canvas-container.tool-text {
		cursor: text;
	}

	.canvas-container.tool-pan {
		cursor: grab;
	}

	.canvas-container.tool-zoom {
		cursor: zoom-in;
	}

	.canvas-container.tool-shape {
		cursor: crosshair;
	}

	.elements-layer {
		will-change: transform;
	}

	.grid-overlay {
		background-image:
			linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
		background-size: 20px 20px;
	}
</style>
