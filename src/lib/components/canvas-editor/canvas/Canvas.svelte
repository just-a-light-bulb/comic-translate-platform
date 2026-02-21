<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { KonvaEventObject } from 'konva/lib/Node';
	import type { Shape as KonvaShape } from 'konva/lib/Shape';
	import type { Stage as KonvaStage } from 'konva/lib/Stage';
	import type { Transformer as KonvaTransformer } from 'konva/lib/shapes/Transformer';
	import type { Layer as KonvaLayer } from 'konva/lib/Layer';
	import { canvasStore, selectionStore } from '../stores';
	import type { ShapeProperties } from '../types/elements';

	interface Props {
		width?: number;
		height?: number;
		backgroundImage?: string;
	}

	let { width = 800, height = 600, backgroundImage: bgImage }: Props = $props();

	let containerEl: HTMLDivElement;
	let stage: KonvaStage | null = $state(null);
	let layer: KonvaLayer | null = $state(null);
	let transformer: KonvaTransformer | null = $state(null);

	let stageScale = $state(1);
	let stageX = $state(0);
	let stageY = $state(0);

	let isDrawing = $state(false);
	let drawStart = $state({ x: 0, y: 0 });
	let currentShape = $state<{ x: number; y: number; width: number; height: number } | null>(null);
	let currentShapeType = $state<ShapeProperties['shapeType']>('rectangle');

	onMount(async () => {
		if (!browser || !containerEl) return;

		const Konva = (await import('konva')).default;

		canvasStore.setStageDimensions(width, height);
		if (bgImage) {
			canvasStore.setBackgroundImage(bgImage);
		}

		stage = new Konva.Stage({
			container: containerEl,
			width: width,
			height: height
		});

		layer = new Konva.Layer();
		stage.add(layer);

		transformer = new Konva.Transformer({
			rotateEnabled: true,
			enabledAnchors: [
				'top-left',
				'top-right',
				'bottom-left',
				'bottom-right',
				'middle-left',
				'middle-right',
				'top-center',
				'bottom-center'
			],
			boundBoxFunc: (oldBox, newBox) => {
				if (newBox.width < 5 || newBox.height < 5) {
					return oldBox;
				}
				return newBox;
			}
		});
		layer.add(transformer);

		stage.on('wheel', handleWheel);
		stage.on('click tap', handleStageClick);
		stage.on('mousedown touchstart', handleMouseDown);
		stage.on('mousemove touchmove', handleMouseMove);
		stage.on('mouseup touchend', handleMouseUp);

		renderCanvas();
	});

	function getPointerPosition(): { x: number; y: number } {
		if (!stage) return { x: 0, y: 0 };
		const pos = stage.getPointerPosition();
		if (!pos) return { x: 0, y: 0 };
		return {
			x: (pos.x - stageX) / stageScale,
			y: (pos.y - stageY) / stageScale
		};
	}

	function handleWheel(e: KonvaEventObject<WheelEvent>) {
		e.evt.preventDefault();
		if (!stage) return;

		const scaleBy = 1.1;
		const oldScale = stageScale;
		const pointer = stage.getPointerPosition();
		if (!pointer) return;

		const mousePointTo = {
			x: (pointer.x - stageX) / oldScale,
			y: (pointer.y - stageY) / oldScale
		};

		const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
		const clampedScale = Math.max(0.1, Math.min(5, newScale));

		stageScale = clampedScale;
		stageX = pointer.x - mousePointTo.x * clampedScale;
		stageY = pointer.y - mousePointTo.y * clampedScale;

		stage.scale({ x: clampedScale, y: clampedScale });
		stage.position({ x: stageX, y: stageY });
		stage.batchDraw();
	}

	function handleStageClick(e: KonvaEventObject<MouseEvent>) {
		const clickedOnEmpty = e.target === stage;

		if (clickedOnEmpty) {
			const tool = selectionStore.activeTool;

			if (tool === 'text') {
				const pos = getPointerPosition();
				const newEl = canvasStore.addTextElement({
					x: pos.x - 100,
					y: pos.y - 25,
					content: 'New Text',
					originalContent: 'New Text'
				});
				selectionStore.select(newEl.id);
				selectionStore.setActiveTool('select');
				renderCanvas();
			} else if (tool === 'select') {
				selectionStore.clearSelection();
				updateTransformer();
			} else if (tool === 'zoom') {
				const newScale = e.evt.altKey ? stageScale / 1.2 : stageScale * 1.2;
				const clampedScale = Math.max(0.1, Math.min(5, newScale));
				stageScale = clampedScale;
				if (stage) {
					stage.scale({ x: clampedScale, y: clampedScale });
					stage.batchDraw();
				}
			}
		}
	}

	function handleMouseDown(e: KonvaEventObject<MouseEvent>) {
		if (e.target !== stage) return;

		const tool = selectionStore.activeTool;

		if (tool === 'shape') {
			const pos = getPointerPosition();
			isDrawing = true;
			drawStart = pos;
			currentShape = { x: pos.x, y: pos.y, width: 0, height: 0 };
		} else if (tool === 'pan') {
			if (stage) {
				stage.draggable(true);
			}
		}
	}

	function handleMouseMove() {
		if (!isDrawing) return;

		const pos = getPointerPosition();
		const x = Math.min(drawStart.x, pos.x);
		const y = Math.min(drawStart.y, pos.y);
		const w = Math.abs(pos.x - drawStart.x);
		const h = Math.abs(pos.y - drawStart.y);

		currentShape = { x, y, width: w, height: h };
		renderCanvas();
	}

	function handleMouseUp() {
		if (stage && selectionStore.activeTool === 'pan') {
			stage.draggable(false);
		}

		if (!isDrawing || !currentShape) {
			isDrawing = false;
			currentShape = null;
			return;
		}

		if (currentShape.width > 5 && currentShape.height > 5) {
			const newEl = canvasStore.addShapeElement({
				x: currentShape.x,
				y: currentShape.y,
				width: currentShape.width,
				height: currentShape.height,
				shapeType: currentShapeType
			});
			selectionStore.select(newEl.id);
			selectionStore.setActiveTool('select');
		}

		isDrawing = false;
		currentShape = null;
		renderCanvas();
	}

	function handleElementClick(e: KonvaEventObject<MouseEvent>, elementId: string) {
		e.cancelBubble = true;

		if (e.evt.shiftKey) {
			selectionStore.toggleSelection(elementId);
		} else {
			selectionStore.select(elementId);
		}
		updateTransformer();
	}

	function handleDragEnd(e: KonvaEventObject<DragEvent>, elementId: string) {
		const node = e.target;
		canvasStore.updateElement(elementId, {
			x: node.x(),
			y: node.y()
		});
	}

	function handleTransformEnd(e: KonvaEventObject<Event>, elementId: string) {
		const node = e.target;
		const scaleX = node.scaleX();
		const scaleY = node.scaleY();

		canvasStore.updateElement(elementId, {
			x: node.x(),
			y: node.y(),
			width: Math.max(5, node.width() * scaleX),
			height: Math.max(5, node.height() * scaleY),
			rotation: node.rotation()
		});

		node.scaleX(1);
		node.scaleY(1);
		renderCanvas();
	}

	function updateTransformer() {
		if (!transformer || !stage || !layer) return;

		const selectedIds = selectionStore.selectedIdsArray;
		if (selectedIds.length === 0) {
			transformer.nodes([]);
			stage.batchDraw();
			return;
		}

		const nodes: KonvaShape[] = [];
		const children = layer.children || [];

		for (const child of children) {
			if (selectedIds.includes(child.id())) {
				nodes.push(child as KonvaShape);
			}
		}

		transformer.nodes(nodes);
		stage.batchDraw();
	}

	async function renderCanvas() {
		if (!stage || !layer || !transformer) return;

		const Konva = (await import('konva')).default;

		layer.destroyChildren();
		layer.add(transformer);

		// Background image
		const bgSrc = bgImage || canvasStore.backgroundImage;
		if (bgSrc) {
			const bgImg = new Image();
			bgImg.onload = () => {
				const imgW = bgImg.width;
				const imgH = bgImg.height;
				const containerRatio = width / height;
				const imgRatio = imgW / imgH;

				let drawW, drawH;
				if (imgRatio > containerRatio) {
					drawW = width;
					drawH = width / imgRatio;
				} else {
					drawH = height;
					drawW = height * imgRatio;
				}

				const drawX = (width - drawW) / 2;
				const drawY = (height - drawH) / 2;

				const konvaImg = new Konva.Image({
					image: bgImg,
					x: drawX,
					y: drawY,
					width: drawW,
					height: drawH,
					listening: false
				});
				layer.add(konvaImg);
				layer.moveToBottom();

				renderElements();
			};
			bgImg.src = bgSrc;
		} else {
			renderElements();
		}
	}

	async function renderElements() {
		if (!layer || !transformer) return;

		const Konva = (await import('konva')).default;
		const sortedElements = canvasStore.sortedElements;

		for (const element of sortedElements) {
			if (!element.visible) continue;

			if (element.type === 'text') {
				const textNode = new Konva.Text({
					id: element.id,
					x: element.x,
					y: element.y,
					width: element.width,
					height: element.height,
					text: element.text.translatedContent || element.text.content,
					fontSize: element.text.fontSize,
					fontFamily: element.text.fontFamily,
					fill: element.text.fill,
					align: element.text.textAlign,
					verticalAlign: element.text.verticalAlign,
					rotation: element.rotation,
					opacity: element.opacity,
					draggable: !element.locked,
					wrap: 'word'
				});

				textNode.on('click tap', (e: KonvaEventObject<MouseEvent>) =>
					handleElementClick(e, element.id)
				);
				textNode.on('dragend', (e: KonvaEventObject<DragEvent>) => handleDragEnd(e, element.id));
				textNode.on('transformend', (e: KonvaEventObject<Event>) =>
					handleTransformEnd(e, element.id)
				);

				layer.add(textNode);
			} else if (element.type === 'shape') {
				let shapeNode: KonvaShape | null = null;

				if (element.shape.shapeType === 'rectangle') {
					shapeNode = new Konva.Rect({
						id: element.id,
						x: element.x,
						y: element.y,
						width: element.width,
						height: element.height,
						fill: element.shape.fill,
						stroke: element.shape.stroke,
						strokeWidth: element.shape.strokeWidth,
						cornerRadius: element.shape.cornerRadius,
						rotation: element.rotation,
						opacity: element.opacity,
						draggable: !element.locked
					});
				} else if (element.shape.shapeType === 'ellipse') {
					shapeNode = new Konva.Ellipse({
						id: element.id,
						x: element.x + element.width / 2,
						y: element.y + element.height / 2,
						radiusX: element.width / 2,
						radiusY: element.height / 2,
						fill: element.shape.fill,
						stroke: element.shape.stroke,
						strokeWidth: element.shape.strokeWidth,
						rotation: element.rotation,
						opacity: element.opacity,
						draggable: !element.locked
					});
				} else if (element.shape.shapeType === 'line') {
					shapeNode = new Konva.Line({
						id: element.id,
						x: element.x,
						y: element.y + element.height / 2,
						points: [0, 0, element.width, 0],
						stroke: element.shape.stroke || element.shape.fill,
						strokeWidth: element.shape.strokeWidth,
						rotation: element.rotation,
						opacity: element.opacity,
						draggable: !element.locked
					});
				}

				if (shapeNode) {
					shapeNode.on('click tap', (e: KonvaEventObject<MouseEvent>) =>
						handleElementClick(e, element.id)
					);
					shapeNode.on('dragend', (e: KonvaEventObject<DragEvent>) => handleDragEnd(e, element.id));
					shapeNode.on('transformend', (e: KonvaEventObject<Event>) =>
						handleTransformEnd(e, element.id)
					);
					layer.add(shapeNode);
				}
			}
		}

		// Drawing preview
		if (currentShape && currentShape.width > 0 && currentShape.height > 0) {
			const preview = new Konva.Rect({
				x: currentShape.x,
				y: currentShape.y,
				width: currentShape.width,
				height: currentShape.height,
				fill: 'rgba(59, 130, 246, 0.2)',
				stroke: '#3b82f6',
				strokeWidth: 2,
				dash: [5, 5],
				listening: false
			});
			layer.add(preview);
		}

		layer.add(transformer);
		updateTransformer();
		stage?.batchDraw();
	}

	$effect(() => {
		if (browser && stage) {
			renderCanvas();
		}
	});
</script>

{#if browser}
	<div
		class="canvas-container relative overflow-hidden rounded-lg border border-gray-300"
		style="width: {width}px; height: {height}px;"
	>
		<div bind:this={containerEl} style="width: 100%; height: 100%;"></div>

		<!-- Tool indicator -->
		<div
			class="pointer-events-none absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white"
		>
			{selectionStore.activeTool.toUpperCase()} | Zoom: {Math.round(stageScale * 100)}%
		</div>
	</div>
{/if}

<style>
	.canvas-container {
		background-color: #1f2937;
	}
</style>
