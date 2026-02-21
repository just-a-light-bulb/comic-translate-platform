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

export interface ShapeProperties {
	shapeType: 'rectangle' | 'ellipse' | 'line';
	fill: string;
	stroke: string;
	strokeWidth: number;
}

export interface ShapeElement extends BaseElement {
	type: 'shape';
	shape: ShapeProperties;
}

export interface ImageProperties {
	src: string;
}

export interface ImageElement extends BaseElement {
	type: 'image';
	image: ImageProperties;
}

export type CanvasElement = TextElement | ShapeElement | ImageElement;

export function isTextElement(element: CanvasElement): element is TextElement {
	return element.type === 'text';
}

export function isShapeElement(element: CanvasElement): element is ShapeElement {
	return element.type === 'shape';
}

export function isImageElement(element: CanvasElement): element is ImageElement {
	return element.type === 'image';
}
