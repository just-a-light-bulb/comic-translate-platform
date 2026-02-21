import type {
	CanvasElement,
	TextElement,
	TextProperties,
	ShapeElement,
	ShapeProperties
} from '../types/elements';

function generateId(): string {
	return `el_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function createCanvasStore() {
	let elements = $state<CanvasElement[]>([]);
	let backgroundImage = $state<string | null>(null);
	let stageWidth = $state(800);
	let stageHeight = $state(600);

	return {
		get elements() {
			return elements;
		},
		get backgroundImage() {
			return backgroundImage;
		},
		get stageWidth() {
			return stageWidth;
		},
		get stageHeight() {
			return stageHeight;
		},
		get sortedElements() {
			return [...elements].sort((a, b) => a.zIndex - b.zIndex);
		},

		setStageDimensions(w: number, h: number) {
			stageWidth = w;
			stageHeight = h;
		},

		setBackgroundImage(src: string | null) {
			backgroundImage = src;
		},

		addElement(element: Omit<CanvasElement, 'id' | 'zIndex'>) {
			const newElement = {
				...element,
				id: generateId(),
				zIndex: elements.length
			} as CanvasElement;
			elements = [...elements, newElement];
			return newElement;
		},

		addTextElement(options: {
			x: number;
			y: number;
			width?: number;
			height?: number;
			content: string;
			originalContent?: string;
		}): TextElement {
			const textProps: TextProperties = {
				content: options.content,
				originalContent: options.originalContent || options.content,
				translatedContent: '',
				fontFamily: 'Arial',
				fontSize: 20,
				fontWeight: 'normal',
				fontStyle: 'normal',
				textAlign: 'center',
				verticalAlign: 'middle',
				fill: '#000000',
				stroke: '',
				strokeWidth: 0,
				lineHeight: 1.2,
				status: 'pending'
			};

			const newElement: TextElement = {
				id: generateId(),
				type: 'text',
				x: options.x,
				y: options.y,
				width: options.width ?? 200,
				height: options.height ?? 50,
				rotation: 0,
				opacity: 1,
				visible: true,
				locked: false,
				zIndex: elements.length,
				text: textProps
			};

			elements = [...elements, newElement];
			return newElement;
		},

		addShapeElement(options: {
			x: number;
			y: number;
			width: number;
			height: number;
			shapeType: ShapeProperties['shapeType'];
		}): ShapeElement {
			const shapeProps: ShapeProperties = {
				shapeType: options.shapeType,
				fill: 'transparent',
				stroke: '#000000',
				strokeWidth: 2,
				cornerRadius: 0
			};

			const newElement: ShapeElement = {
				id: generateId(),
				type: 'shape',
				x: options.x,
				y: options.y,
				width: options.width,
				height: options.height,
				rotation: 0,
				opacity: 1,
				visible: true,
				locked: false,
				zIndex: elements.length,
				shape: shapeProps
			};

			elements = [...elements, newElement];
			return newElement;
		},

		updateElement(id: string, updates: Partial<CanvasElement>) {
			elements = elements.map((el) =>
				el.id === id ? ({ ...el, ...updates } as CanvasElement) : el
			);
		},

		updateTextElement(id: string, textUpdates: Partial<TextProperties>) {
			elements = elements.map((el) => {
				if (el.id === id && el.type === 'text') {
					return {
						...el,
						text: { ...el.text, ...textUpdates }
					} as TextElement;
				}
				return el;
			});
		},

		updateShapeElement(id: string, shapeUpdates: Partial<ShapeProperties>) {
			elements = elements.map((el) => {
				if (el.id === id && el.type === 'shape') {
					return {
						...el,
						shape: { ...el.shape, ...shapeUpdates }
					} as ShapeElement;
				}
				return el;
			});
		},

		deleteElement(id: string) {
			elements = elements.filter((el) => el.id !== id);
		},

		deleteElements(ids: string[]) {
			elements = elements.filter((el) => !ids.includes(el.id));
		},

		getElement(id: string) {
			return elements.find((el) => el.id === id);
		},

		getElementsByIds(ids: string[]) {
			return elements.filter((el) => ids.includes(el.id));
		},

		setElements(newElements: CanvasElement[]) {
			elements = newElements;
		},

		clearElements() {
			elements = [];
		},

		bringToFront(id: string) {
			const element = elements.find((el) => el.id === id);
			if (!element) return;
			const filtered = elements.filter((el) => el.id !== id);
			elements = [...filtered, { ...element, zIndex: filtered.length }];
		},

		sendToBack(id: string) {
			const element = elements.find((el) => el.id === id);
			if (!element) return;
			const filtered = elements.filter((el) => el.id !== id);
			elements = [
				{ ...element, zIndex: 0 },
				...filtered.map((el, i) => ({ ...el, zIndex: i + 1 }))
			];
		},

		getState(): CanvasElement[] {
			return JSON.parse(JSON.stringify(elements));
		},

		setState(state: CanvasElement[]) {
			elements = state;
		}
	};
}

export const canvasStore = createCanvasStore();
