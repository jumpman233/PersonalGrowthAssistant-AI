<script setup lang="ts">
import AppSidebarNav from '~/components/layout/AppSidebarNav.vue'
import ConfirmDialog from '~/components/common/ConfirmDialog.vue'
import SuccessDialog from '~/components/common/SuccessDialog.vue'
import type { RecordsTimeRange } from '~/types/records'

const { categoryOptions, timeRangeOptions, defaultTimeRange } = useRecordsViewConfig()
const route = useRoute()
const router = useRouter()

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
  refreshSummary,
  removeRecord,
} = usePaginatedRecords({
  category: selectedCategory,
  tag: selectedTag,
  timeRange: selectedTimeRange,
  pageSize: 10,
})

await loadFirstPage()

const recordPendingDeleteId = ref<string | null>(null)
const deletePending = ref(false)
const deleteError = ref('')
const successDialog = ref({
  open: route.query.notice === 'deleted',
  title: '删除成功',
  description: '这条记录已经从列表和统计里移除。',
})

const recordPendingDelete = computed(() =>
  records.value.find((record) => record.id === recordPendingDeleteId.value) ?? null,
)

const updateCategory = (value: string) => {
  selectedCategory.value = value
}

const updateTag = (value: string) => {
  selectedTag.value = value
}

const updateTimeRange = (value: RecordsTimeRange) => {
  selectedTimeRange.value = value
}

const clearFilters = () => {
  selectedCategory.value = 'ALL'
  selectedTag.value = 'ALL'
  selectedTimeRange.value = defaultTimeRange
}

const requestDeleteRecord = (recordId: string) => {
  recordPendingDeleteId.value = recordId
  deleteError.value = ''
}

const closeDeleteDialog = () => {
  if (!deletePending.value) {
    recordPendingDeleteId.value = null
    deleteError.value = ''
  }
}

const confirmDeleteRecord = async () => {
  if (!recordPendingDeleteId.value || deletePending.value) {
    return
  }

  const recordId = recordPendingDeleteId.value
  deletePending.value = true
  deleteError.value = ''

  try {
    await $fetch(`/api/records/${recordId}`, {
      method: 'DELETE',
    })
    removeRecord(recordId)
    await refreshSummary()
    recordPendingDeleteId.value = null
    successDialog.value = {
      open: true,
      title: '删除成功',
      description: '这条记录已经从列表和统计里移除。',
    }
  } catch {
    deleteError.value = '删除没有成功，可以稍后再试。'
  } finally {
    deletePending.value = false
  }
}

const closeSuccessDialog = () => {
  successDialog.value.open = false

  if (route.query.notice === 'deleted') {
    const query = { ...route.query }
    delete query.notice
    void router.replace({ path: route.path, query })
  }
}
</script>

<template>
  <main class="min-h-screen bg-[#fbfaf8] text-[#3e3630]">
    <AppSidebarNav :nav-items="navItems" />

    <div class="mx-auto max-w-[1680px] px-5 py-7 lg:pl-44 lg:pr-10">
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
            @clear="clearFilters"
          />
          <RecordsList
            :records="records"
            :pending="pending"
            :error="error"
            :has-more="hasMore"
            @load-more="loadNextPage"
            @retry="retry"
            @delete-record="requestDeleteRecord"
          />
        </section>

        <aside class="space-y-5">
          <RecordsWeeklyStats :summary="summary" />
          <RecordsFrequentTags :tags="highFrequencyTags" />
          <RecordsGentleHint />
        </aside>
      </div>
    </div>

    <ConfirmDialog
      :open="Boolean(recordPendingDelete)"
      title="删除这条记录？"
      description="删除后它不会再出现在列表和统计里。这个操作不能撤销。"
      cancel-label="再想想"
      confirm-label="删除记录"
      :pending="deletePending"
      :error="deleteError"
      @close="closeDeleteDialog"
      @confirm="confirmDeleteRecord"
    />
    <SuccessDialog
      :open="successDialog.open"
      :title="successDialog.title"
      :description="successDialog.description"
      @close="closeSuccessDialog"
    />
  </main>
</template>
