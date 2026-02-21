<script lang="ts">
	import { selectionStore, canvasStore } from '../stores';
	import type { ToolType } from '../types/tools';

	const tools: { id: ToolType; label: string; shortcut: string; icon: string }[] = [
		{ id: 'select', label: 'Select', shortcut: 'V', icon: 'cursor' },
		{ id: 'text', label: 'Text', shortcut: 'T', icon: 'type' },
		{ id: 'rectangle', label: 'Rectangle', shortcut: 'R', icon: 'square' },
		{ id: 'pan', label: 'Pan', shortcut: 'H', icon: 'move' },
		{ id: 'zoom', label: 'Zoom', shortcut: 'Z', icon: 'zoom-in' }
	];

	function setTool(tool: ToolType) {
		selectionStore.setActiveTool(tool);
	}

	function handleDelete() {
		if (selectionStore.hasSelection) {
			canvasStore.deleteElements(selectionStore.selectedIdsArray);
			selectionStore.clearSelection();
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

		const key = e.key.toLowerCase();
		if (key === 'v') setTool('select');
		else if (key === 't') setTool('text');
		else if (key === 'r') setTool('rectangle');
		else if (key === 'h') setTool('pan');
		else if (key === 'z') setTool('zoom');
		else if (key === 'delete' || key === 'backspace') handleDelete();
		else if (key === 'escape') selectionStore.clearSelection();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="flex items-center gap-1 border-b border-gray-200 bg-white px-3 py-2">
	{#each tools as tool (tool.id)}
		<button
			class="flex h-8 w-8 items-center justify-center rounded-md transition-colors {selectionStore.activeTool ===
			tool.id
				? 'bg-blue-100 text-blue-600'
				: 'text-gray-600 hover:bg-gray-100'}"
			onclick={() => setTool(tool.id)}
			title="{tool.label} ({tool.shortcut})"
		>
			{#if tool.icon === 'cursor'}
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
				</svg>
			{:else if tool.icon === 'type'}
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<polyline points="4 7 4 4 20 4 20 7" />
					<line x1="9" y1="20" x2="15" y2="20" />
					<line x1="12" y1="4" x2="12" y2="20" />
				</svg>
			{:else if tool.icon === 'square'}
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
				</svg>
			{:else if tool.icon === 'move'}
				<svg
					width="16"
					height="16"
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
			{/if}
		</button>
	{/each}

	<div class="mx-2 h-6 w-px bg-gray-200"></div>

	<button
		class="flex h-8 items-center gap-1 rounded-md px-2 text-gray-600 transition-colors hover:bg-gray-100"
		onclick={handleDelete}
		disabled={!selectionStore.hasSelection}
	>
		<svg
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<polyline points="3 6 5 6 21 6" />
			<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
		</svg>
		<span class="text-xs">Delete</span>
	</button>
</div>
