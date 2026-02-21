# Canvas Editor Redesign with svelte-konva

## Overview

Replace the current DOM-based canvas editor with a proper Konva.js implementation using svelte-konva library. This provides native support for pan, zoom, text, shapes, and transform controls.

## Problem Statement

Current canvas editor has non-functional features:

- Pan tool doesn't work properly
- Zoom is limited
- Text element creation missing
- Shape tools don't exist
- Transform controls (resize/rotate) are buggy

## Solution

Use `svelte-konva` v1 (supports Svelte 5 + Konva 10) for a proper canvas implementation.

## Architecture

### Technology Stack

- **svelte-konva** v1 - Svelte 5 compatible wrapper for Konva
- **konva** v10 - Already installed in project

### Component Structure

```
src/lib/components/canvas-editor/
├── canvas/
│   ├── Canvas.svelte          # Konva Stage + Layer container
│   ├── TextElement.svelte     # Konva Text component
│   ├── ShapeElement.svelte    # Konva shapes (rect, ellipse, line)
│   └── TransformControls.svelte # Konva Transformer
├── stores/
│   ├── canvasStore.svelte.ts  # Element state (updated for Konva)
│   └── selectionStore.svelte.ts # Selection state
└── toolbar/
    └── Toolbar.svelte         # Tool buttons
```

### Data Flow

```
User Action → Store Update → Konva Component Re-render
     ↓
Konva Events → Store Update → UI Sync
```

## Features

### 1. Pan & Zoom

- **Pan (H key)**: Stage draggable mode
- **Zoom**: Mouse wheel zoom centered on cursor
- **Zoom controls**: Toolbar buttons for zoom in/out/reset

### 2. Add Text

- **Text tool (T key)**: Click on canvas to add new text element
- Double-click existing text to edit inline
- Text toolbar for font, size, color, alignment

### 3. Add Shapes

- **Rectangle tool**: Draw rectangles
- **Ellipse tool**: Draw ellipses/circles
- **Line tool**: Draw lines
- Click and drag to create shape

### 4. Select & Transform

- **Select tool (V key)**: Click to select element
- **Transformer**: Built-in resize/rotate handles
- Drag to move selected element
- Delete with Backspace/Delete key

## Implementation Notes

### SvelteKit SSR Compatibility

```svelte
<script>
	import { browser } from '$app/environment';
	import { Stage, Layer, Text, Rect, Transformer } from 'svelte-konva';
</script>

{#if browser}
	<Stage config={{ width, height }}>
		<!-- canvas content -->
	</Stage>
{/if}
```

### Selection with Transformer

```svelte
<script>
	let transformer;
	let selectedNode = null;

	function handleSelect(e) {
		selectedNode = e.target;
		transformer.nodes([selectedNode]);
	}
</script>

<Transformer bind:this={transformer} />
```

### Zoom Implementation

```javascript
function handleWheel(e) {
	e.evt.preventDefault();
	const scaleBy = 1.1;
	const newScale = e.evt.deltaY < 0 ? stageScale * scaleBy : stageScale / scaleBy;

	// Clamp zoom
	stageScale = Math.max(0.1, Math.min(5, newScale));
}
```

## Migration Plan

1. Install svelte-konva
2. Update stores for Konva coordinate system
3. Rewrite Canvas.svelte with Konva Stage
4. Rewrite TextElement.svelte with Konva Text
5. Create ShapeElement.svelte for shapes
6. Update TransformControls with Konva Transformer
7. Update toolbar for new tools
8. Add keyboard shortcuts
9. Test all features

## Success Criteria

- [ ] Pan tool works smoothly
- [ ] Zoom with mouse wheel works
- [ ] Text tool adds new text elements
- [ ] Shape tools add shapes
- [ ] Select tool selects elements
- [ ] Transformer resizes/rotates elements
- [ ] Delete removes selected elements
- [ ] Undo/redo works with all operations
