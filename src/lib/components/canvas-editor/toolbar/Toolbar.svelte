<script lang="ts">
	import { selectionStore } from '../stores';
	import type { ToolType } from '../types/tools';
	import TextToolbar from './TextToolbar.svelte';
	import ZoomControls from './ZoomControls.svelte';
	import UndoRedo from './UndoRedo.svelte';

	const tools: { id: ToolType; label: string; shortcut: string; icon: string }[] = [
		{ id: 'select', label: 'Select', shortcut: 'V', icon: 'cursor' },
		{ id: 'text', label: 'Text', shortcut: 'T', icon: 'type' },
		{ id: 'shape', label: 'Shape', shortcut: 'S', icon: 'square' },
		{ id: 'pan', label: 'Pan', shortcut: 'H', icon: 'move' },
		{ id: 'zoom', label: 'Zoom', shortcut: 'Z', icon: 'zoom-in' }
	];

	function setTool(tool: ToolType) {
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
		{#each tools as tool (tool.id)}
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
				{:else if tool.icon === 'square'}
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
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
