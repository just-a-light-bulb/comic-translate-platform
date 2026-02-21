# Canvas Editor Integration for Chapter/[id]

**Date**: 2026-02-19
**Status**: Approved

## Overview

Integrate the existing canvas editor component into the chapter detail page (`/chapter/[id]`) with full database support for pages and text elements.

## Architecture

### Layout

- **Left Sidebar**: Page thumbnails for navigation (collapsible)
- **Top Section**: Canvas editor with toolbar (full-width, resizable height)
- **Bottom Section**: Collapsible/resizable translation data grid panel

### Database Schema

```typescript
// Page table - stores manga pages per chapter
page: {
  id: serial (PK)
  chapterId: integer (FK -> chapter.id)
  pageNumber: integer
  imageUrl: text
  width: integer
  height: integer
  ocrStatus: text ('pending' | 'processing' | 'done' | 'failed')
  createdAt: timestamp
}

// TextElement table - stores detected/translated text
textElement: {
  id: serial (PK)
  pageId: integer (FK -> page.id)
  x: integer
  y: integer
  width: integer
  height: integer
  rotation: integer (default 0)
  originalText: text
  translatedText: text
  fontFamily: text (default 'Arial')
  fontSize: integer (default 16)
  fontWeight: text (default 'normal')
  fontStyle: text (default 'normal')
  textAlign: text (default 'center')
  fill: text (default '#000000')
  status: text ('pending' | 'translated' | 'reviewed')
  createdAt: timestamp
}
```

### Component Structure

```
src/routes/chapter/[id]/
├── +page.svelte          # Main layout with sidebar + editor
├── +page.server.ts       # Load chapter, pages, elements

src/lib/components/canvas-editor/
├── CanvasEditor.svelte   # NEW: combines Toolbar + Canvas
├── sidebar/
│   └── PageThumbnails.svelte  # NEW: page navigation sidebar
├── toolbar/
│   ├── ZoomControls.svelte    # NEW
│   └── UndoRedo.svelte        # NEW
└── TranslationGrid.svelte     # NEW: bottom panel with data grid
```

## Data Flow

1. **Page Load**: Server loads chapter + pages + elements for first page
2. **Page Selection**: User clicks thumbnail, load elements for selected page into canvasStore
3. **Element Edit**: User edits text/position in canvas, updates canvasStore + syncs to DB
4. **Auto-save**: Debounced save of element changes (500ms delay)

## Features

### Canvas Editor

- Pan, zoom, select tools
- Text element selection and editing
- Transform controls (move, resize)
- Background image display (page image)
- Grid overlay (optional)

### Translation Grid

- Spreadsheet-style view of all text elements
- Inline editing for translations
- Status filtering (pending/translated/reviewed)
- Batch operations

### Page Navigation

- Thumbnail preview
- Page number indicator
- OCR status badge

## API Endpoints

- `GET /api/chapter/[id]/pages` - List all pages for chapter
- `POST /api/chapter/[id]/pages/upload` - Upload new pages
- `GET /api/page/[id]/elements` - Get all text elements for page
- `PUT /api/element/[id]` - Update text element
- `PUT /api/elements/batch` - Batch update elements

## Success Criteria

- [ ] Page thumbnails sidebar shows all pages for chapter
- [ ] Canvas displays selected page image as background
- [ ] Text elements render on canvas with correct positions
- [ ] Translation grid shows all elements with inline editing
- [ ] Changes persist to database
- [ ] Page navigation switches canvas content
- [ ] Bottom panel is collapsible and resizable
