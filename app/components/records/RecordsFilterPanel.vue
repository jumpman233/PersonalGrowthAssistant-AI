<script setup lang="ts">
import type {
  RecordsCategoryOption,
  RecordsTagOption,
  RecordsTimeRange,
  RecordsTimeRangeOption,
} from '~/types/records'

const props = defineProps<{
  categoryOptions: RecordsCategoryOption[]
  tagOptions: RecordsTagOption[]
  timeRangeOptions: RecordsTimeRangeOption[]
  selectedCategory: string
  selectedTag: string
  selectedTimeRange: RecordsTimeRange
}>()

defineEmits<{
  'update:category': [value: string]
  'update:tag': [value: string]
  'update:timeRange': [value: RecordsTimeRange]
  clear: []
}>()

const tagExpanded = ref(false)
const maxCollapsedTags = 8

const isFiltered = computed(
  () => props.selectedCategory !== 'ALL' || props.selectedTag !== 'ALL' || props.selectedTimeRange !== 'all',
)

const visibleTagOptions = computed(() => {
  if (tagExpanded.value) {
    return props.tagOptions
  }

  const allOption = props.tagOptions.find((option) => option.value === 'ALL')
  const otherOptions = props.tagOptions.filter((option) => option.value !== 'ALL')

  return [
    ...(allOption ? [allOption] : []),
    ...otherOptions.slice(0, maxCollapsedTags),
  ]
})

const hasMoreTags = computed(() => props.tagOptions.length > visibleTagOptions.value.length)
</script>

<template>
  <section class="overflow-hidden rounded-xl border border-stone-100 bg-white shadow-[0_10px_32px_rgba(72,50,31,0.04)]">
    <header
      class="flex flex-col gap-3 border-b border-stone-100 bg-[linear-gradient(100deg,#fffaf5,#fff)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div class="flex items-center gap-4">
        <span class="text-xl text-stone-600">▽</span>
        <h2 class="text-xl font-semibold text-stone-900">筛选记录</h2>
      </div>

      <button
        v-if="isFiltered"
        class="w-fit rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-500 transition hover:border-orange-100 hover:text-orange-500"
        type="button"
        @click="$emit('clear')"
      >
        清除筛选
      </button>
    </header>

    <div class="space-y-5 px-5 py-5">
      <RecordsFilterGroup
        label="分类"
        icon="▦"
        :options="categoryOptions"
        :selected-value="selectedCategory"
        @select="$emit('update:category', $event)"
      />

      <div class="border-t border-stone-100 pt-5">
        <RecordsFilterGroup
          label="标签"
          icon="◇"
          :options="visibleTagOptions"
          :selected-value="selectedTag"
          @select="$emit('update:tag', $event)"
        />

        <button
          v-if="hasMoreTags || tagExpanded"
          class="mt-3 rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-600 transition hover:border-orange-100 hover:text-orange-500"
          type="button"
          @click="tagExpanded = !tagExpanded"
        >
          {{ tagExpanded ? '收起标签' : '更多标签' }}
          <span class="ml-1">{{ tagExpanded ? '⌃' : '⌄' }}</span>
        </button>
      </div>

      <div class="border-t border-stone-100 pt-5">
        <RecordsFilterGroup
          label="时间范围"
          icon="□"
          :options="timeRangeOptions"
          :selected-value="selectedTimeRange"
          @select="$emit('update:timeRange', $event as RecordsTimeRange)"
        />
      </div>
    </div>
  </section>
</template>
