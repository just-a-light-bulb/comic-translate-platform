export type ToolType = 'select' | 'text' | 'pan' | 'zoom' | 'rectangle';

export interface Tool {
	type: ToolType;
	cursor: string;
	shortcut: string;
}

export const DEFAULT_TOOLS: Record<ToolType, Tool> = {
	select: { type: 'select', cursor: 'default', shortcut: 'V' },
	text: { type: 'text', cursor: 'text', shortcut: 'T' },
	pan: { type: 'pan', cursor: 'grab', shortcut: 'H' },
	zoom: { type: 'zoom', cursor: 'zoom-in', shortcut: 'Z' },
	rectangle: { type: 'rectangle', cursor: 'crosshair', shortcut: 'R' }
};
