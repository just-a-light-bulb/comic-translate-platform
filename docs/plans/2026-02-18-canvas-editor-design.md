# Canvas Editor Component Design

**Date:** 2026-02-18  
**Author:** AI Agent  
**Status:** Draft

## Overview

This document presents the design for a rich-featured canvas editor component for the Comic Translate Platform. The editor combines the best features from Canva (design & layout), Photoshop (image editing & layers), and Google Sheets/Excel (spreadsheet-style data management) to create an integrated manga translation workflow.

## Feature Analysis

### Features from Canva

| Feature                 | Description                             | Priority |
| ----------------------- | --------------------------------------- | -------- |
| Drag-and-drop interface | Intuitive element manipulation          | High     |
| Text styling toolbar    | Font, size, color, alignment controls   | High     |
| Layer panel             | Visual layer management with reordering | High     |
| Zoom controls           | Zoom in/out with fit-to-screen          | High     |
| Undo/Redo               | History management                      | High     |
| Element alignment       | Snap-to-grid, smart guides              | Medium   |
| Templates               | Pre-configured text box layouts         | Low      |
| Export options          | PNG, JPG, PDF export                    | High     |

### Features from Photoshop

| Feature            | Description                         | Priority |
| ------------------ | ----------------------------------- | -------- |
| Transform controls | Resize, rotate, skew text boxes     | High     |
| Selection tools    | Marquee, lasso for region selection | Medium   |
| Layer effects      | Drop shadow, stroke, glow for text  | Medium   |
| Opacity/Blending   | Layer opacity and blend modes       | Medium   |
| Rulers & Guides    | Measurement and alignment aids      | Low      |
| Canvas navigation  | Pan, zoom with keyboard shortcuts   | High     |
| History panel      | Visual history with state jumping   | Medium   |

### Features from Google Sheets/Excel

| Feature           | Description                        | Priority |
| ----------------- | ---------------------------------- | -------- |
| Grid view         | Spreadsheet-style translation list | High     |
| Cell editing      | Direct inline text editing         | High     |
| Column sorting    | Sort by status, page, text length  | Medium   |
| Filtering         | Filter by translation status       | High     |
| Batch operations  | Multi-select and bulk edit         | High     |
| Copy/paste        | Clipboard operations               | High     |
| Status indicators | Color-coded translation status     | High     |
| Find & replace    | Search across all translations     | Medium   |

## Proposed Approaches

### Approach 1: Konva.js-based Editor (Recommended)

**Technology:** Konva.js + React-Konva patterns adapted for Svelte

**Pros:**

- Excellent performance with large canvases
- Built-in layer management
- Good transform controls
- Active community and documentation
- Works well with Svelte (no React dependency required)

**Cons:**

- Requires custom Svelte wrappers
- Less built-in UI components than Fabric.js

**Architecture:**

```
CanvasEditor/
├── Canvas.svelte          # Main Konva stage
├── Layer.svelte           # Layer management
├── TextElement.svelte     # Text box components
├── ImageElement.svelte    # Background image handling
├── Toolbar.svelte         # Main toolbar
├── TextToolbar.svelte     # Text formatting controls
├── LayerPanel.svelte      # Layer sidebar
├── TranslationGrid.svelte # Spreadsheet view
├── stores/
│   ├── canvasStore.ts     # Canvas state (elements, selection)
│   ├── historyStore.ts    # Undo/redo management
│   └── gridStore.ts       # Translation grid state
└── utils/
    ├── transformers.ts    # Transform operations
    └── exporters.ts       # Export functionality
```

### Approach 2: Fabric.js-based Editor

**Technology:** Fabric.js with Svelte integration

**Pros:**

- Rich built-in object manipulation
- Excellent text rendering capabilities
- Strong SVG support
- Many ready-to-use features

**Cons:**

- Larger bundle size
- Performance can degrade with many objects
- Less modern API compared to Konva

**Architecture:**

```
CanvasEditor/
├── Canvas.svelte          # Fabric canvas wrapper
├── controls/              # Custom controls
├── Toolbar.svelte         # Main toolbar
├── LayerPanel.svelte      # Layer management
├── TranslationGrid.svelte # Spreadsheet view
└── stores/
    └── fabricStore.ts     # Fabric state management
```

### Approach 3: Native Canvas API with Custom Implementation

**Technology:** Pure HTML5 Canvas with custom rendering

**Pros:**

- Maximum control and flexibility
- Smallest bundle size
- No external dependencies

**Cons:**

- Significant development effort
- Must implement all features from scratch
- Higher maintenance burden

**Recommendation:** Not recommended for this project due to time constraints.

## Recommended Approach: Konva.js

I recommend **Approach 1 (Konva.js)** for the following reasons:

1. **Performance:** Konva.js handles large images and many elements efficiently
2. **Modern API:** Clean, well-documented API that works well with Svelte 5 runes
3. **Feature Coverage:** Built-in support for transforms, layers, and text
4. **Extensibility:** Easy to add custom shapes and behaviors
5. **Community:** Active development and good community support

## Detailed Design

### Component Architecture

```
src/lib/components/canvas-editor/
├── index.ts                    # Public exports
├── CanvasEditor.svelte         # Main editor component
├── canvas/
│   ├── Canvas.svelte           # Konva stage wrapper
│   ├── CanvasLayer.svelte      # Layer component
│   ├── TextElement.svelte      # Text box element
│   ├── ImageElement.svelte     # Background image
│   ├── SelectionBox.svelte     # Selection rectangle
│   └── TransformControls.svelte # Resize/rotate handles
├── toolbar/
│   ├── Toolbar.svelte          # Main toolbar
│   ├── TextToolbar.svelte      # Text formatting
│   ├── ZoomControls.svelte     # Zoom in/out/fit
│   └── UndoRedo.svelte         # History controls
├── panels/
│   ├── LayerPanel.svelte       # Layer management
│   ├── PropertiesPanel.svelte  # Element properties
│   └── TranslationGrid.svelte  # Spreadsheet view
├── stores/
│   ├── canvasStore.ts          # Canvas state management
│   ├── selectionStore.ts       # Selection state
│   ├── historyStore.ts         # Undo/redo
│   └── settingsStore.ts        # Editor settings
├── types/
│   ├── elements.ts             # Element type definitions
│   ├── history.ts              # History types
│   └── tools.ts                # Tool types
└── utils/
    ├── transformers.ts         # Transform utilities
    ├── exporters.ts            # Export functions
    ├── validators.ts           # Input validation
    └── keyboard.ts             # Keyboard shortcuts
```

### State Management

Using Svelte 5 runes for reactive state:

```typescript
// stores/canvasStore.ts
interface CanvasElement {
	id: string;
	type: 'text' | 'image' | 'shape';
	x: number;
	y: number;
	width: number;
	height: number;
	rotation: number;
	opacity: number;
	visible: boolean;
	locked: boolean;
	// Type-specific properties
	text?: TextProperties;
	image?: ImageProperties;
}

interface TextProperties {
	content: string;
	originalContent: string; // For translation
	translatedContent: string;
	fontFamily: string;
	fontSize: number;
	fontWeight: string;
	fontStyle: string;
	textAlign: 'left' | 'center' | 'right';
	verticalAlign: 'top' | 'middle' | 'bottom';
	fill: string;
	stroke: string;
	strokeWidth: number;
	lineHeight: number;
	status: 'pending' | 'translated' | 'reviewed';
}
```

### Key Features Implementation

#### 1. Text Element with Transform Controls

- Bounding box with 8 resize handles
- Rotation handle above the box
- Double-click to edit text inline
- Font toolbar appears on selection

#### 2. Layer Panel

- List of all elements with visibility toggle
- Lock/unlock elements
- Reorder via drag-and-drop
- Layer type icons (text, image, shape)

#### 3. Translation Grid

- Synchronized with canvas elements
- Real-time updates when canvas changes
- Status column with color coding
- Batch selection and editing
- Sort and filter capabilities

#### 4. History Management

- Command pattern for undo/redo
- State snapshots for complex operations
- Keyboard shortcuts (Ctrl+Z, Ctrl+Y)

#### 5. Export System

- Canvas to PNG/JPG
- PDF generation for chapters
- CSV export for translation grid

### Keyboard Shortcuts

| Shortcut              | Action                |
| --------------------- | --------------------- |
| V                     | Selection tool        |
| T                     | Text tool             |
| Delete/Backspace      | Delete selected       |
| Ctrl+Z                | Undo                  |
| Ctrl+Y / Ctrl+Shift+Z | Redo                  |
| Ctrl+C                | Copy                  |
| Ctrl+V                | Paste                 |
| Ctrl+D                | Duplicate             |
| Ctrl+A                | Select all            |
| Arrow keys            | Move selection        |
| Shift+Arrow           | Move selection (10px) |
| Ctrl+Shift+]          | Bring to front        |
| Ctrl+Shift+[          | Send to back          |
| + / -                 | Zoom in/out           |
| Ctrl+0                | Fit to screen         |

### Responsive Design

The editor will adapt to different screen sizes:

- **Desktop (≥1280px):** Full layout with sidebars
- **Tablet (768-1279px):** Collapsible sidebars
- **Mobile (<768px):** Bottom sheet for panels

### Dependencies to Add

```json
{
	"konva": "^9.x",
	"svelte-konva": "^1.x" // If available, or create custom wrappers
}
```

## Implementation Phases

### Phase 1: Core Canvas (Week 1)

- Basic Konva setup
- Image loading and display
- Text element creation
- Selection and transform

### Phase 2: Editing Tools (Week 2)

- Text toolbar
- Layer panel
- Properties panel
- Undo/redo system

### Phase 3: Translation Grid (Week 3)

- Spreadsheet component
- Canvas-grid synchronization
- Batch operations
- Status management

### Phase 4: Export & Polish (Week 4)

- Export functionality
- Keyboard shortcuts
- Performance optimization
- Testing and bug fixes

## Testing Strategy

1. **Unit Tests:** Store logic, utility functions
2. **Component Tests:** Individual component behavior
3. **Integration Tests:** Canvas + Grid synchronization
4. **E2E Tests:** Complete translation workflow

## Success Criteria

- [ ] Can load and display manga page images
- [ ] Can create, edit, and delete text elements
- [ ] Can transform (resize, rotate, move) text elements
- [ ] Layer panel shows all elements with controls
- [ ] Translation grid syncs with canvas in real-time
- [ ] Undo/redo works for all operations
- [ ] Export produces correct output files
- [ ] Performance is smooth with 50+ elements
- [ ] All keyboard shortcuts work correctly

## Next Steps

1. Install Konva.js dependencies
2. Create basic canvas component structure
3. Implement text element with transforms
4. Build layer panel
5. Create translation grid component
6. Add undo/redo system
7. Implement export functionality
8. Add keyboard shortcuts
9. Write tests
10. Create demo page for testing
