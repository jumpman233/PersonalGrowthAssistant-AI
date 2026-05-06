<script setup lang="ts">
import type {
  RecordsCategoryOption,
  RecordsTagOption,
  RecordsTimeRange,
  RecordsTimeRangeOption,
} from '~/types/records'

defineProps<{
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
}>()
</script>

<template>
  <section class="rounded-xl border border-stone-100 bg-white p-5 shadow-[0_10px_32px_rgba(72,50,31,0.04)]">
    <RecordsFilterGroup
      label="分类："
      :options="categoryOptions"
      :selected-value="selectedCategory"
      @select="$emit('update:category', $event)"
    />
    <RecordsFilterGroup
      class="mt-4"
      label="标签："
      :options="tagOptions"
      :selected-value="selectedTag"
      @select="$emit('update:tag', $event)"
    />
    <RecordsFilterGroup
      class="mt-4"
      label="时间："
      :options="timeRangeOptions"
      :selected-value="selectedTimeRange"
      @select="$emit('update:timeRange', $event as RecordsTimeRange)"
    />
  </section>
</template>
