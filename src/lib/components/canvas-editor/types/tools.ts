export type ToolType = 'select' | 'text' | 'pan' | 'zoom' | 'shape';

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
	zoom: { type: 'zoom', cursor: 'zoom-in', shortcut: 'Z' },
	shape: { type: 'shape', cursor: 'crosshair', shortcut: 'S' }
};

export const DEFAULT_SETTINGS: EditorSettings = {
	snapToGrid: false,
	gridSize: 10,
	showGuides: true,
	showRulers: false,
	theme: 'light'
};

export const DEFAULT_FONTS = [
	'Arial',
	'Helvetica',
	'Times New Roman',
	'Georgia',
	'Verdana',
	'Comic Sans MS',
	'Impact',
	'Courier New',
	'Noto Sans JP',
	'Noto Sans Thai'
];

export const DEFAULT_FONT_SIZES = [8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 64, 72, 96];
