import type { Ref } from 'vue'
import type {
  RecordsApiData,
  RecordsListItem,
  RecordsPagination,
  RecordsSummary,
  RecordsTimeRange,
} from '~/types/records'

const defaultSummary = (): RecordsSummary => ({
  weeklyRecordCount: 0,
  averageConstructiveness: null,
  averageEnergyCost: null,
  averageMood: null,
})

const defaultPagination = (pageSize: number): RecordsPagination => ({
  page: 1,
  pageSize,
  total: 0,
  totalPages: 0,
  hasMore: true,
})

export const usePaginatedRecords = (options: {
  category: Ref<string>
  tag: Ref<string>
  timeRange: Ref<RecordsTimeRange>
  pageSize?: number
  timeoutMs?: number
}) => {
  const pageSize = options.pageSize ?? 10
  const timeoutMs = options.timeoutMs ?? 9000

  const records = ref<RecordsListItem[]>([])
  const page = ref(1)
  const pending = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<RecordsPagination>(defaultPagination(pageSize))
  const filterTags = ref([{ label: '全部', value: 'ALL' }])
  const summary = ref<RecordsSummary>(defaultSummary())
  const highFrequencyTags = ref<string[]>([])

  let activeController: AbortController | null = null
  let requestId = 0

  const hasMore = computed(() => pagination.value.hasMore)

  const requestPage = async (targetPage: number, mode: 'replace' | 'append') => {
    if (pending.value && mode === 'append') {
      return false
    }

    if (pending.value && mode === 'replace') {
      activeController?.abort()
    }

    const currentRequestId = ++requestId
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    activeController = controller
    pending.value = true
    error.value = null

    try {
      const response = await $fetch<RecordsApiData>('/api/records', {
        query: {
          page: targetPage,
          pageSize,
          category: options.category.value,
          tag: options.tag.value,
          timeRange: options.timeRange.value,
        },
        signal: controller.signal,
      })

      if (currentRequestId !== requestId) {
        return false
      }

      records.value = mode === 'replace' ? response.records : [...records.value, ...response.records]
      page.value = response.pagination.page
      pagination.value = response.pagination
      filterTags.value = response.filters.tags
      summary.value = response.summary
      highFrequencyTags.value = response.highFrequencyTags

      return true
    } catch {
      if (currentRequestId === requestId) {
        error.value = '这次没有加载成功，可以稍后再试。'
      }

      return false
    } finally {
      clearTimeout(timeoutId)

      if (currentRequestId === requestId) {
        pending.value = false
        activeController = null
      }
    }
  }

  const loadFirstPage = async () => {
    activeController?.abort()
    records.value = []
    page.value = 1
    pagination.value = defaultPagination(pageSize)
    error.value = null

    return requestPage(1, 'replace')
  }

  const loadNextPage = async () => {
    if (!hasMore.value || pending.value || error.value) {
      return false
    }

    return requestPage(page.value + 1, 'append')
  }

  const retry = async () => {
    const failedPage = records.value.length === 0 ? 1 : page.value + 1

    return requestPage(failedPage, records.value.length === 0 ? 'replace' : 'append')
  }

  watch([options.category, options.tag, options.timeRange], () => {
    void loadFirstPage()
  })

  return {
    records,
    page,
    pageSize,
    hasMore,
    pending,
    error,
    pagination,
    filterTags,
    summary,
    highFrequencyTags,
    loadFirstPage,
    loadNextPage,
    retry,
  }
}
