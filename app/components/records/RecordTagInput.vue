<script setup lang="ts">
import Multiselect from '@vueform/multiselect'

const tags = defineModel<string[]>('tags', {
  required: true,
})

defineProps<{
  options: string[]
}>()

const multiselectClasses = {
  container:
    'relative mx-auto flex min-h-12 w-full items-center rounded-lg border border-stone-200 bg-white text-sm text-stone-700 outline-none transition focus-within:border-orange-200 focus-within:ring-4 focus-within:ring-orange-50',
  search:
    'absolute inset-0 w-full appearance-none rounded-lg border-0 bg-transparent px-4 text-sm text-stone-700 outline-none placeholder:text-stone-400',
  tags: 'flex min-w-0 flex-1 flex-wrap items-center gap-2 px-3 py-2',
  tag: 'inline-flex items-center gap-2 rounded-full bg-[#f5eee7] px-3 py-1 text-sm text-stone-600',
  tagDisabled: 'opacity-60',
  tagRemove: 'inline-flex size-4 items-center justify-center rounded-full text-stone-400 transition hover:text-orange-500',
  tagRemoveIcon: 'multiselect-tag-remove-icon bg-current',
  tagsSearchWrapper: 'relative grow basis-32',
  tagsSearch:
    'w-full appearance-none border-0 bg-transparent px-1 py-1 text-sm text-stone-700 outline-none placeholder:text-stone-400',
  dropdown:
    'multiselect-dropdown overflow-hidden rounded-lg border border-stone-100 bg-white shadow-[0_16px_42px_rgba(72,50,31,0.10)]',
  dropdownTop: 'is-top shadow-[0_-16px_42px_rgba(72,50,31,0.08)]',
  dropdownHidden: 'is-hidden',
  options: 'max-h-56 overflow-y-auto py-2',
  option: 'flex cursor-pointer items-center px-4 py-2.5 text-sm text-stone-600 transition hover:bg-orange-50 hover:text-orange-600',
  optionSelected: 'bg-orange-50 text-orange-600',
  optionPointed: 'bg-orange-50 text-orange-600',
  noOptions: 'px-4 py-3 text-sm text-stone-400',
  noResults: 'px-4 py-3 text-sm text-stone-400',
  placeholder: 'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-stone-400',
  clear: 'pr-3 text-stone-400 transition hover:text-orange-500',
  clearIcon: 'block size-4',
  caret: 'mr-3 border-x-4 border-t-4 border-x-transparent border-t-stone-300',
}
</script>

<template>
  <Multiselect
    v-model="tags"
    mode="tags"
    :options="options"
    :searchable="true"
    :create-option="true"
    :close-on-select="false"
    :hide-selected="false"
    open-direction="top"
    placeholder="输入标签，回车添加"
    no-options-text="还没有可选标签"
    no-results-text="回车添加为新标签"
    :classes="multiselectClasses"
  />
</template>
