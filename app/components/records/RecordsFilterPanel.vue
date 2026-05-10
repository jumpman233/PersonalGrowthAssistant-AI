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

const emit = defineEmits<{
  'update:category': [value: string]
  'update:tag': [value: string]
  'update:timeRange': [value: RecordsTimeRange]
  clear: []
}>()

const tagExpanded = ref(false)
const filtersExpanded = ref(false)
const maxCollapsedTags = 10

const isFiltered = computed(
  () => props.selectedCategory !== 'ALL' || props.selectedTag !== 'ALL' || props.selectedTimeRange !== 'all',
)

const visibleTagOptions = computed(() => {
  if (tagExpanded.value) {
    return props.tagOptions
  }

  const allOption = props.tagOptions.find((option) => option.value === 'ALL')
  const otherOptions = props.tagOptions.filter((option) => option.value !== 'ALL')
  const selectedOption = props.tagOptions.find(
    (option) => option.value === props.selectedTag && option.value !== 'ALL',
  )
  const collapsedOptions = otherOptions.slice(0, allOption ? maxCollapsedTags - 1 : maxCollapsedTags)
  const shouldAppendSelected =
    selectedOption && !collapsedOptions.some((option) => option.value === selectedOption.value)

  return [
    ...(allOption ? [allOption] : []),
    ...collapsedOptions,
    ...(shouldAppendSelected ? [selectedOption] : []),
  ]
})

const hasMoreTags = computed(() => props.tagOptions.length > visibleTagOptions.value.length)

const selectedCategoryLabel = computed(
  () => props.categoryOptions.find((option) => option.value === props.selectedCategory)?.label ?? '全部分类',
)

const selectedTagLabel = computed(
  () => props.tagOptions.find((option) => option.value === props.selectedTag)?.label ?? '全部标签',
)

const selectedTimeRangeLabel = computed(
  () => props.timeRangeOptions.find((option) => option.value === props.selectedTimeRange)?.label ?? '全部时间',
)

const filterSummary = computed(
  () => `${selectedCategoryLabel.value} · ${selectedTagLabel.value} · ${selectedTimeRangeLabel.value}`,
)

const clearFilters = () => {
  tagExpanded.value = false
  emit('clear')
}
</script>

<template>
  <section class="overflow-hidden rounded-xl border border-stone-100 bg-white shadow-[0_10px_32px_rgba(72,50,31,0.04)]">
    <header
      class="flex items-center gap-3 border-b border-stone-100 bg-[linear-gradient(100deg,#fffaf5,#fff)] px-4 py-3 md:px-5 md:py-4"
    >
      <button
        class="min-w-0 flex-1 text-left md:cursor-default"
        type="button"
        @click="filtersExpanded = !filtersExpanded"
      >
        <div class="flex items-center justify-between gap-3">
          <span class="flex min-w-0 items-center gap-2">
            <span class="text-sm text-stone-500 md:text-xl">▽</span>
            <span class="text-base font-semibold text-stone-900 md:text-xl">筛选记录</span>
          </span>
          <span class="text-sm text-stone-400 md:hidden">{{ filtersExpanded ? '⌃' : '⌄' }}</span>
        </div>
        <p class="mt-1 truncate text-xs leading-5 text-stone-500 md:hidden">
          {{ filterSummary }}
        </p>
      </button>

      <button
        v-if="isFiltered"
        class="hidden w-fit rounded-full border border-stone-200 bg-white px-4 py-2 text-sm text-stone-500 transition hover:border-orange-100 hover:text-orange-500 md:inline-flex"
        type="button"
        @click="clearFilters"
      >
        清除筛选
      </button>
    </header>

    <div
      class="space-y-4 px-4 py-4 md:block md:space-y-5 md:px-5 md:py-5"
      :class="filtersExpanded ? 'block' : 'hidden'"
    >
      <RecordsFilterGroup
        label="分类"
        icon="▦"
        :options="categoryOptions"
        :selected-value="selectedCategory"
        wrap-on-mobile
        @select="emit('update:category', $event)"
      />

      <div class="border-t border-stone-100 pt-4 md:pt-5">
        <RecordsFilterGroup
          label="标签"
          icon="◇"
          :options="visibleTagOptions"
          :selected-value="selectedTag"
          wrap-on-mobile
          @select="emit('update:tag', $event)"
        />

        <button
          v-if="hasMoreTags || tagExpanded"
          class="mt-3 rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs text-stone-600 transition hover:border-orange-100 hover:text-orange-500 md:px-4 md:py-2 md:text-sm"
          type="button"
          @click="tagExpanded = !tagExpanded"
        >
          {{ tagExpanded ? '收起标签' : '更多标签' }}
          <span class="ml-1">{{ tagExpanded ? '⌃' : '⌄' }}</span>
        </button>
      </div>

      <div class="border-t border-stone-100 pt-4 md:pt-5">
        <RecordsFilterGroup
          label="时间范围"
          icon="□"
          :options="timeRangeOptions"
          :selected-value="selectedTimeRange"
          wrap-on-mobile
          @select="emit('update:timeRange', $event as RecordsTimeRange)"
        />
      </div>

      <button
        v-if="isFiltered"
        class="rounded-full border border-stone-200 bg-white px-3.5 py-1.5 text-xs text-stone-500 transition hover:border-orange-100 hover:text-orange-500 md:hidden"
        type="button"
        @click="clearFilters"
      >
        清除筛选
      </button>
    </div>
  </section>
</template>
