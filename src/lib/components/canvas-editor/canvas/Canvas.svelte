<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import type { KonvaEventObject } from 'konva/lib/Node';
	import type { Stage as KonvaStage } from 'konva/lib/Stage';
	import type { Layer as KonvaLayer } from 'konva/lib/Layer';
	import type { Transformer as KonvaTransformer } from 'konva/lib/shapes/Transformer';
	import type { Rect as KonvaRect } from 'konva/lib/shapes/Rect';
	import { canvasStore, selectionStore } from '../stores';

	interface Props {
		width?: number;
		height?: number;
		backgroundImage?: string;
	}

	let { width = 800, height = 600, backgroundImage: bgImage }: Props = $props();

	let containerEl: HTMLDivElement;
	let stage: KonvaStage | null = null;
	let layer: KonvaLayer | null = null;
	let transformer: KonvaTransformer | null = null;

	let stageScale = $state(1);
	let stageX = $state(0);
	let stageY = $state(0);

	let isDrawing = $state(false);
	let drawStart = $state({ x: 0, y: 0 });
	let drawPreview: KonvaRect | null = null;

	let KonvaLib: typeof import('konva').default | null = null;

	onMount(async () => {
		if (!browser || !containerEl) return;

		KonvaLib = (await import('konva')).default;

		canvasStore.setDimensions(width, height);
		if (bgImage) {
			canvasStore.setBackgroundImage(bgImage);
		}

		stage = new KonvaLib.Stage({
			container: containerEl,
			width: containerEl.clientWidth,
			height: containerEl.clientHeight
		});

		layer = new KonvaLib.Layer();
		stage.add(layer);

		transformer = new KonvaLib.Transformer({
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
				if (newBox.width < 10 || newBox.height < 10) {
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

		render();

		const resizeObserver = new ResizeObserver(() => {
			if (stage && containerEl) {
				stage.width(containerEl.clientWidth);
				stage.height(containerEl.clientHeight);
				stage.batchDraw();
			}
		});
		resizeObserver.observe(containerEl);

		return () => {
			resizeObserver.disconnect();
			stage?.destroy();
		};
	});

	$effect(() => {
		if (browser && bgImage !== undefined) {
			canvasStore.setBackgroundImage(bgImage);
			render();
		}
	});

	$effect(() => {
		if (browser && stage) {
			render();
		}
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

		const direction = e.evt.deltaY > 0 ? -1 : 1;
		const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
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
				canvasStore.addTextElement({
					x: pos.x - 100,
					y: pos.y - 25,
					content: 'New Text',
					originalContent: 'New Text'
				});
				selectionStore.setActiveTool('select');
				render();
			} else if (tool === 'zoom') {
				const pointer = stage?.getPointerPosition();
				if (!pointer) return;

				const newScale = e.evt.altKey ? stageScale / 1.2 : stageScale * 1.2;
				const clampedScale = Math.max(0.1, Math.min(5, newScale));

				const mousePointTo = {
					x: (pointer.x - stageX) / stageScale,
					y: (pointer.y - stageY) / stageScale
				};

				stageScale = clampedScale;
				stageX = pointer.x - mousePointTo.x * clampedScale;
				stageY = pointer.y - mousePointTo.y * clampedScale;

				stage?.scale({ x: clampedScale, y: clampedScale });
				stage?.position({ x: stageX, y: stageY });
				stage?.batchDraw();
			} else if (tool === 'select') {
				selectionStore.clearSelection();
				updateTransformer();
			}
		}
	}

	function handleMouseDown(e: KonvaEventObject<MouseEvent>) {
		if (e.target !== stage) return;

		const tool = selectionStore.activeTool;

		if (tool === 'rectangle' && KonvaLib) {
			const pos = getPointerPosition();
			isDrawing = true;
			drawStart = pos;
		} else if (tool === 'pan') {
			if (stage) {
				stage.draggable(true);
				stage.dragBoundFunc((pos) => pos);
			}
		}
	}

	function handleMouseMove() {
		if (!isDrawing || !stage || !layer || !KonvaLib) return;

		const pos = getPointerPosition();
		const x = Math.min(drawStart.x, pos.x);
		const y = Math.min(drawStart.y, pos.y);
		const w = Math.abs(pos.x - drawStart.x);
		const h = Math.abs(pos.y - drawStart.y);

		if (drawPreview) {
			drawPreview.setAttrs({ x, y, width: w, height: h });
		} else {
			drawPreview = new KonvaLib.Rect({
				x,
				y,
				width: w,
				height: h,
				fill: 'rgba(59, 130, 246, 0.2)',
				stroke: '#3b82f6',
				strokeWidth: 2,
				dash: [5, 5]
			});
			layer.add(drawPreview);
		}
		layer.batchDraw();
	}

	function handleMouseUp() {
		if (stage && selectionStore.activeTool === 'pan') {
			stage.draggable(false);
		}

		if (isDrawing && drawPreview) {
			const x = drawPreview.x();
			const y = drawPreview.y();
			const w = drawPreview.width();
			const h = drawPreview.height();

			if (w > 10 && h > 10) {
				canvasStore.addShapeElement({
					x,
					y,
					width: w,
					height: h,
					shapeType: 'rectangle'
				});
			}

			drawPreview.destroy();
			drawPreview = null;
		}

		isDrawing = false;
		render();
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
			width: Math.max(10, node.width() * scaleX),
			height: Math.max(10, node.height() * scaleY),
			rotation: node.rotation()
		});

		node.scaleX(1);
		node.scaleY(1);
		render();
	}

	function updateTransformer() {
		if (!transformer || !stage || !layer) return;

		const selectedIds = selectionStore.selectedIdsArray;
		if (selectedIds.length === 0) {
			transformer.nodes([]);
			stage.batchDraw();
			return;
		}

		const nodes: import('konva/lib/Shape').Shape[] = [];
		const children = layer.children || [];

		for (const child of children) {
			if (selectedIds.includes(child.id())) {
				nodes.push(child as import('konva/lib/Shape').Shape);
			}
		}

		transformer.nodes(nodes);
		stage.batchDraw();
	}

	async function render() {
		if (!stage || !layer || !transformer || !KonvaLib) return;

		layer.destroyChildren();
		layer.add(transformer);

		const bgSrc = bgImage || canvasStore.backgroundImage;
		if (bgSrc) {
			const img = new window.Image();
			img.onload = () => {
				const imgW = img.width;
				const imgH = img.height;
				const containerW = width;
				const containerH = height;
				const containerRatio = containerW / containerH;
				const imgRatio = imgW / imgH;

				let drawW: number, drawH: number;
				if (imgRatio > containerRatio) {
					drawW = containerW;
					drawH = containerW / imgRatio;
				} else {
					drawH = containerH;
					drawW = containerH * imgRatio;
				}

				const drawX = (containerW - drawW) / 2;
				const drawY = (containerH - drawH) / 2;

				const konvaImg = new KonvaLib.Image({
					image: img,
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
			img.src = bgSrc;
		} else {
			renderElements();
		}
	}

	function renderElements() {
		if (!layer || !transformer || !KonvaLib) return;

		const sortedElements = canvasStore.sortedElements;

		for (const element of sortedElements) {
			if (!element.visible) continue;

			if (element.type === 'text') {
				const textNode = new KonvaLib.Text({
					id: element.id,
					x: element.x,
					y: element.y,
					width: element.width,
					height: element.height,
					text: element.text.translatedContent || element.text.content,
					fontSize: element.text.fontSize,
					fontFamily: element.text.fontFamily,
					fontWeight: element.text.fontWeight,
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
				if (element.shape.shapeType === 'rectangle') {
					const shapeNode = new KonvaLib.Rect({
						id: element.id,
						x: element.x,
						y: element.y,
						width: element.width,
						height: element.height,
						fill: element.shape.fill,
						stroke: element.shape.stroke,
						strokeWidth: element.shape.strokeWidth,
						rotation: element.rotation,
						opacity: element.opacity,
						draggable: !element.locked
					});

					shapeNode.on('click tap', (e: KonvaEventObject<MouseEvent>) =>
						handleElementClick(e, element.id)
					);
					shapeNode.on('dragend', (e: KonvaEventObject<DragEvent>) => handleDragEnd(e, element.id));
					shapeNode.on('transformend', (e: KonvaEventObject<Event>) =>
						handleTransformEnd(e, element.id)
					);
					layer.add(shapeNode);
				} else if (element.shape.shapeType === 'ellipse') {
					const shapeNode = new KonvaLib.Ellipse({
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

		layer.add(transformer);
		updateTransformer();
		stage?.batchDraw();
	}
</script>

{#if browser}
	<div
		class="canvas-wrapper relative h-full w-full overflow-hidden bg-gray-900"
		bind:this={containerEl}
	></div>

	<!-- Status Bar -->
	<div
		class="pointer-events-none absolute bottom-2 left-2 rounded bg-black/70 px-3 py-1.5 text-xs text-white"
	>
		<span class="font-medium">{selectionStore.activeTool.toUpperCase()}</span>
		<span class="mx-2 text-gray-400">|</span>
		<span>Zoom: {Math.round(stageScale * 100)}%</span>
	</div>
{/if}
