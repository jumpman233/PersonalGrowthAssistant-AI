<script setup lang="ts">
import AppSidebarNav from '~/components/layout/AppSidebarNav.vue'
import type { RecordsTimeRange } from '~/types/records'

const { categoryOptions, timeRangeOptions, defaultTimeRange } = useRecordsViewConfig()

const selectedCategory = ref('ALL')
const selectedTag = ref('ALL')
const selectedTimeRange = ref<RecordsTimeRange>(defaultTimeRange)
const { navItems } = useAppNavigation()
const {
  records,
  hasMore,
  pending,
  error,
  filterTags,
  summary,
  highFrequencyTags,
  loadFirstPage,
  loadNextPage,
  retry,
} = usePaginatedRecords({
  category: selectedCategory,
  tag: selectedTag,
  timeRange: selectedTimeRange,
  pageSize: 10,
})

await loadFirstPage()

const updateCategory = (value: string) => {
  selectedCategory.value = value
}

const updateTag = (value: string) => {
  selectedTag.value = value
}

const updateTimeRange = (value: RecordsTimeRange) => {
  selectedTimeRange.value = value
}
</script>

<template>
  <main class="min-h-screen bg-[#fbfaf8] text-[#3e3630]">
    <AppSidebarNav :nav-items="navItems" />

    <div class="mx-auto max-w-[1680px] px-5 py-7 lg:pl-40 lg:pr-10">
      <RecordsHeader />

      <div class="grid gap-6 pt-7 xl:grid-cols-[minmax(0,1fr)_440px]">
        <section class="min-w-0 space-y-4">
          <RecordsTitleBlock />
          <RecordsFilterPanel
            :category-options="categoryOptions"
            :tag-options="filterTags"
            :time-range-options="timeRangeOptions"
            :selected-category="selectedCategory"
            :selected-tag="selectedTag"
            :selected-time-range="selectedTimeRange"
            @update:category="updateCategory"
            @update:tag="updateTag"
            @update:time-range="updateTimeRange"
          />
          <RecordsList
            :records="records"
            :pending="pending"
            :error="error"
            :has-more="hasMore"
            @load-more="loadNextPage"
            @retry="retry"
          />
        </section>

        <aside class="space-y-5">
          <RecordsWeeklyStats :summary="summary" />
          <RecordsFrequentTags :tags="highFrequencyTags" />
          <RecordsGentleHint />
        </aside>
      </div>
    </div>
  </main>
</template>
