<script lang="ts">
	import type { ShapeElement } from '../types/elements';
	import { selectionStore, canvasStore } from '../stores';

	interface Props {
		element: ShapeElement;
	}

	let { element }: Props = $props();

	let isSelected = $derived(selectionStore.isSelected(element.id));

	function handleClick(e: MouseEvent) {
		e.stopPropagation();
		if (element.locked) return;

		if (e.shiftKey) {
			selectionStore.toggleSelection(element.id);
		} else {
			selectionStore.select(element.id);
		}
	}

	let dragStart = $state({ x: 0, y: 0 });

	function handleDragStart(e: MouseEvent) {
		if (element.locked) return;
		dragStart = { x: e.clientX - element.x, y: e.clientY - element.y };
	}

	function handleDrag(e: MouseEvent) {
		if (element.locked) return;
		const newX = e.clientX - dragStart.x;
		const newY = e.clientY - dragStart.y;
		canvasStore.updateElement(element.id, { x: newX, y: newY });
	}

	function handleDragEnd() {
		dragStart = { x: 0, y: 0 };
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	class="shape-element absolute"
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
	onmousedown={handleDragStart}
	onmousemove={handleDrag}
	onmouseup={handleDragEnd}
	role="img"
	aria-label="Shape element: {element.shape.shapeType}"
	tabindex="0"
>
	{#if element.shape.shapeType === 'rectangle'}
		<svg viewBox="0 0 {element.width} {element.height}" class="h-full w-full">
			<rect
				x={element.shape.strokeWidth / 2}
				y={element.shape.strokeWidth / 2}
				width={element.width - element.shape.strokeWidth}
				height={element.height - element.shape.strokeWidth}
				fill={element.shape.fill}
				stroke={element.shape.stroke}
				stroke-width={element.shape.strokeWidth}
				rx={element.shape.cornerRadius}
				ry={element.shape.cornerRadius}
			/>
		</svg>
	{:else if element.shape.shapeType === 'ellipse'}
		<svg viewBox="0 0 {element.width} {element.height}" class="h-full w-full">
			<ellipse
				cx={element.width / 2}
				cy={element.height / 2}
				rx={Math.max(0, element.width / 2 - element.shape.strokeWidth)}
				ry={Math.max(0, element.height / 2 - element.shape.strokeWidth)}
				fill={element.shape.fill}
				stroke={element.shape.stroke}
				stroke-width={element.shape.strokeWidth}
			/>
		</svg>
	{:else if element.shape.shapeType === 'line'}
		<svg viewBox="0 0 {element.width} {element.height}" class="h-full w-full">
			<line
				x1="0"
				y1={element.height / 2}
				x2={element.width}
				y2={element.height / 2}
				stroke={element.shape.stroke || element.shape.fill}
				stroke-width={element.shape.strokeWidth}
			/>
		</svg>
	{:else if element.shape.shapeType === 'arrow'}
		{@const arrowHead = 10}
		<svg viewBox="0 0 {element.width} {element.height}" class="h-full w-full">
			<line
				x1="0"
				y1={element.height / 2}
				x2={element.width - arrowHead}
				y2={element.height / 2}
				stroke={element.shape.stroke || element.shape.fill}
				stroke-width={element.shape.strokeWidth}
			/>
			<polygon
				points="{element.width - arrowHead},{element.height / 2 -
					arrowHead / 2} {element.width},{element.height / 2} {element.width -
					arrowHead},{element.height / 2 + arrowHead / 2}"
				fill={element.shape.stroke || element.shape.fill}
			/>
		</svg>
	{/if}
</div>

<style>
	.shape-element {
		cursor: move;
		user-select: none;
	}

	.shape-element:hover:not(.locked) {
		outline: 2px solid #3b82f6;
		outline-offset: 1px;
	}

	.shape-element.selected {
		outline: 2px solid #3b82f6;
		outline-offset: 1px;
	}

	.shape-element.locked {
		opacity: 0.7;
		cursor: not-allowed;
	}
</style>
