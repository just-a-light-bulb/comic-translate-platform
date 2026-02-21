<script lang="ts">
	import type { TextElement } from './types/elements';

	interface Props {
		elements: TextElement[];
		onUpdate?: (id: string, updates: Partial<TextElement['text']>) => void;
	}

	let { elements, onUpdate }: Props = $props();

	function handleTranslationChange(id: string, value: string) {
		onUpdate?.(id, { translatedContent: value });
	}
</script>

<div class="h-full overflow-auto">
	{#if elements.length === 0}
		<div class="flex h-full items-center justify-center text-gray-500">
			No text elements to translate
		</div>
	{:else}
		<table class="w-full text-sm">
			<thead class="sticky top-0 bg-gray-50">
				<tr>
					<th class="border-b px-3 py-2 text-left font-medium text-gray-600">Original</th>
					<th class="border-b px-3 py-2 text-left font-medium text-gray-600">Translation</th>
					<th class="border-b px-3 py-2 text-left font-medium text-gray-600">Status</th>
				</tr>
			</thead>
			<tbody>
				{#each elements as element (element.id)}
					<tr class="border-b hover:bg-gray-50">
						<td class="px-3 py-2 align-top">
							<div class="max-w-xs text-gray-700">{element.text.originalContent}</div>
						</td>
						<td class="px-3 py-2 align-top">
							<textarea
								class="w-full min-w-[200px] rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
								rows="2"
								value={element.text.translatedContent}
								onchange={(e) => handleTranslationChange(element.id, e.currentTarget.value)}
							></textarea>
						</td>
						<td class="px-3 py-2 align-top">
							<span
								class="inline-block rounded-full px-2 py-0.5 text-xs font-medium {element.text
									.status === 'translated'
									? 'bg-green-100 text-green-700'
									: element.text.status === 'reviewed'
										? 'bg-blue-100 text-blue-700'
										: 'bg-yellow-100 text-yellow-700'}"
							>
								{element.text.status}
							</span>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{/if}
</div>
