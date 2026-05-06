import type {
  RecordsCategoryOption,
  RecordsTimeRange,
  RecordsTimeRangeOption,
} from '~/types/records'

export const useRecordsViewConfig = () => {
  const categoryOptions: RecordsCategoryOption[] = [
    { label: '全部', value: 'ALL' },
    { label: '职业', value: 'WORK' },
    { label: '关系', value: 'RELATIONSHIP' },
    { label: '情绪', value: 'EMOTION' },
    { label: '学习', value: 'STUDY' },
    { label: '生活', value: 'LIFE' },
    { label: '项目', value: 'PROJECT' },
    { label: '健康', value: 'HEALTH' },
    { label: '社交', value: 'SOCIAL' },
    { label: '其他', value: 'OTHER' },
  ]

  const timeRangeOptions: RecordsTimeRangeOption[] = [
    { label: '最近7天', value: 'latest7days' },
    { label: '本月', value: 'thisMonth' },
    { label: '全部', value: 'all' },
  ]

  const defaultTimeRange: RecordsTimeRange = 'all'

  return {
    categoryOptions,
    timeRangeOptions,
    defaultTimeRange,
  }
}
