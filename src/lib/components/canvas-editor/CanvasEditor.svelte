<script lang="ts">
	import { Canvas } from './canvas';
	import { Toolbar } from './toolbar';

	interface Props {
		width?: number;
		height?: number;
		backgroundImage?: string;
	}

	let { width = 800, height = 600, backgroundImage }: Props = $props();
</script>

<div class="flex h-full flex-col">
	<Toolbar />
	<div class="relative flex-1 overflow-hidden">
		<Canvas {width} {height} {backgroundImage} />
	</div>
</div>
