<script setup lang="ts">
import type { WeeklyReviewApiData } from '~/types/weekly-review'
import AppPrimaryAction from '~/components/common/AppPrimaryAction.vue'
import AppSidebarNav from '~/components/layout/AppSidebarNav.vue'

const { navItems } = useAppNavigation()

const emptyReview = (): WeeklyReviewApiData => ({
  id: null,
  title: '本周复盘',
  status: 'STALE',
  statusLabel: '待更新',
  weekRange: '暂无周复盘数据',
  generatedLabel: '本周还没有生成周复盘',
  errorMessage: null,
  stats: {
    recordCount: 0,
    averageMoodScore: null,
    averageConstructiveness: null,
    averageEnergyCost: null,
  },
  highFrequencyTags: [],
  summary: '',
  sections: [],
  nextWeekAction: '',
})

const { data: review, pending: pagePending } = await useFetch('/api/review', {
  default: emptyReview,
})

const notice = ref('')
const generating = ref(false)
const pollCount = ref(0)
let pollTimer: ReturnType<typeof setTimeout> | null = null

const maxPollCount = 10
const isPending = computed(() => review.value.status === 'PENDING')
const isStale = computed(() => review.value.status === 'STALE')
const canGenerate = computed(() => !generating.value && !isPending.value)
const generateButtonLabel = computed(() => {
  if (isPending.value || generating.value) {
    return '正在生成...'
  }

  if (review.value.status === 'SUCCESS' || isStale.value) {
    return '重新生成周复盘'
  }

  return '更新周复盘'
})

const statCards = computed(() => [
  {
    label: '本周记录',
    value: `${review.value.stats.recordCount}`,
    unit: '条',
    tone: 'bg-orange-50 text-orange-500',
  },
  {
    label: '平均心情',
    value: review.value.stats.averageMoodScore?.toString() ?? '-',
    unit: '分',
    tone: 'bg-rose-50 text-rose-500',
  },
  {
    label: '平均建设感',
    value: review.value.stats.averageConstructiveness?.toString() ?? '-',
    unit: '分',
    tone: 'bg-green-50 text-green-600',
  },
  {
    label: '平均消耗',
    value: review.value.stats.averageEnergyCost?.toString() ?? '-',
    unit: '分',
    tone: 'bg-cyan-50 text-cyan-700',
  },
])

const statusTone = computed(() => {
  if (review.value.status === 'SUCCESS') {
    return 'bg-green-50 text-green-700 ring-green-100'
  }

  if (review.value.status === 'FAILED') {
    return 'bg-rose-50 text-rose-600 ring-rose-100'
  }

  if (review.value.status === 'PENDING') {
    return 'bg-orange-50 text-orange-600 ring-orange-100'
  }

  return 'bg-stone-100 text-stone-600 ring-stone-200'
})

const stopPolling = () => {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
}

const schedulePoll = (reviewId: string) => {
  stopPolling()

  if (pollCount.value >= maxPollCount) {
    notice.value = '周复盘还在生成中，可以稍后刷新页面查看结果。'
    return
  }

  const delay = pollCount.value === 0 ? 3000 : 5000
  pollCount.value += 1

  pollTimer = setTimeout(async () => {
    try {
      const result = await $fetch<WeeklyReviewApiData>(`/api/weekly-review/${reviewId}`)
      review.value = result

      if (result.status === 'PENDING') {
        schedulePoll(result.id!)
      } else {
        stopPolling()
      }
    } catch {
      notice.value = '这次没有拿到周复盘状态，可以稍后刷新看看。'
      stopPolling()
    }
  }, delay)
}

const startPolling = (reviewId: string) => {
  pollCount.value = 0
  schedulePoll(reviewId)
}

const generateReview = async () => {
  if (!canGenerate.value) {
    return
  }

  generating.value = true
  notice.value = ''

  try {
    const result = await $fetch<WeeklyReviewApiData>('/api/weekly-review/generate', {
      method: 'POST',
    })

    review.value = result

    if (result.status === 'PENDING' && result.id) {
      startPolling(result.id)
    }
  } catch (error) {
    const message =
      typeof error === 'object' && error && 'statusMessage' in error && typeof error.statusMessage === 'string'
        ? error.statusMessage
        : '这次没有启动周复盘生成，可以稍后重试。'
    notice.value = message
  } finally {
    generating.value = false
  }
}

onMounted(() => {
  if (review.value.status === 'PENDING' && review.value.id) {
    startPolling(review.value.id)
  }
})

onBeforeUnmount(stopPolling)
</script>

<template>
  <main class="min-h-screen bg-[#fbfaf8] text-[#3e3630]">
    <AppSidebarNav :nav-items="navItems" />

    <div class="mx-auto max-w-[1680px] px-5 py-7 lg:pl-44 lg:pr-10">
      <header class="flex flex-col gap-5 border-b border-stone-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p class="text-sm font-medium tracking-[0.2em] text-orange-400">Weekly Review</p>
          <h1 class="mt-2 text-3xl font-semibold text-[#332f2c]">周复盘</h1>
          <p class="mt-3 max-w-2xl text-base leading-7 text-stone-500">
            把这一周真正推动你、消耗你、反复出现的线索安静地收拢一下。
          </p>
        </div>

        <div class="flex flex-col items-start gap-2 sm:items-end">
          <AppPrimaryAction :disabled="!canGenerate" @click="generateReview">
            <span class="inline-flex items-center gap-2">
              <svg
                aria-hidden="true"
                class="size-4"
                :class="{ 'animate-spin': isPending || generating }"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  d="M20 12a8 8 0 0 1-13.7 5.6M4 12A8 8 0 0 1 17.7 6.4M18 3v4h-4M6 21v-4h4"
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                />
              </svg>
              <span>{{ generateButtonLabel }}</span>
            </span>
          </AppPrimaryAction>
          <p v-if="isStale" class="text-sm leading-5 text-orange-600">记录已更新，建议重新生成。</p>
        </div>
      </header>

      <p
        v-if="notice || review.errorMessage"
        class="mt-5 rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700"
      >
        {{ notice || review.errorMessage }}
      </p>

      <div class="grid gap-6 pt-7 xl:grid-cols-[minmax(0,1fr)_400px]">
        <section class="min-w-0 space-y-5">
          <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p class="text-sm font-medium text-stone-500">{{ review.weekRange }}</p>
                <h2 class="mt-2 text-2xl font-semibold text-[#332f2c]">{{ review.title }}</h2>
                <p class="mt-2 text-sm text-stone-500">{{ review.generatedLabel }}</p>
              </div>
              <span
                class="inline-flex w-fit items-center rounded-full px-3 py-1 text-sm font-medium ring-1"
                :class="statusTone"
              >
                {{ review.statusLabel }}
              </span>
            </div>

            <div v-if="isPending" class="mt-5 rounded-lg border border-orange-100 bg-orange-50/60 p-4 text-sm leading-6 text-stone-600">
              正在整理这一周的记录。你可以先离开页面，稍后再回来查看。
            </div>

            <div class="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <article
                v-for="stat in statCards"
                :key="stat.label"
                class="rounded-lg border border-stone-100 bg-[#fdfaf6] p-4"
              >
                <p class="text-sm text-stone-500">{{ stat.label }}</p>
                <p class="mt-3 flex items-end gap-1">
                  <span class="text-3xl font-semibold text-[#332f2c]">{{ stat.value }}</span>
                  <span class="pb-1 text-sm text-stone-400">{{ stat.unit }}</span>
                </p>
                <span class="mt-4 inline-flex h-1.5 w-12 rounded-full" :class="stat.tone" />
              </article>
            </div>
          </div>

          <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-sm sm:p-7">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="text-sm font-medium tracking-[0.16em] text-orange-400">AI Summary</p>
                <h2 class="mt-2 text-xl font-semibold text-[#332f2c]">本周整体观察</h2>
              </div>
              <p class="text-sm text-stone-400">基于本周记录生成</p>
            </div>

            <p class="mt-5 rounded-lg bg-[#fbfaf8] p-5 text-base leading-8 text-stone-700">
              {{ review.summary }}
            </p>

            <div class="mt-5 grid gap-4 lg:grid-cols-3">
              <article
                v-for="section in review.sections"
                :key="section.title"
                class="rounded-lg border border-stone-100 bg-white p-5 shadow-sm"
              >
                <h3 class="text-base font-semibold text-[#332f2c]">{{ section.title }}</h3>
                <p class="mt-3 text-sm leading-7 text-stone-600">{{ section.content }}</p>
              </article>
            </div>
          </div>

          <div class="rounded-lg border border-orange-100 bg-[#fff7f2] p-6 shadow-sm sm:p-7">
            <p class="text-sm font-medium tracking-[0.16em] text-orange-400">Next Step</p>
            <h2 class="mt-2 text-xl font-semibold text-[#332f2c]">下周最小行动</h2>
            <p class="mt-4 text-base leading-8 text-stone-700">{{ review.nextWeekAction }}</p>
          </div>
        </section>

        <aside class="space-y-5">
          <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-[#332f2c]">高频标签</h2>
            <div v-if="review.highFrequencyTags.length" class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="tag in review.highFrequencyTags"
                :key="tag"
                class="rounded-full border border-orange-100 bg-orange-50 px-3 py-1.5 text-sm text-orange-700"
              >
                {{ tag }}
              </span>
            </div>
            <p v-else class="mt-4 text-sm leading-6 text-stone-500">还没有足够的标签数据。</p>
          </div>

          <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-[#332f2c]">温和提示</h2>
            <div class="mt-4 space-y-4 text-sm leading-7 text-stone-600">
              <p>复盘不是给这一周打分，而是看清哪些事真的推动了你。</p>
              <p>如果某个消耗反复出现，它更像一个提醒：下周可以给自己少一点切换和硬撑。</p>
              <p>定时任务会每天检查当前周，如果复盘缺失、过期或跨自然天，会在后台尝试生成。</p>
            </div>
          </div>

          <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-[#332f2c]">数据说明</h2>
            <p class="mt-4 text-sm leading-7 text-stone-600">
              统计数据来自当前自然周记录；AI 内容由手动更新或定时任务生成。记录发生变化后，对应周复盘会标记为待更新。
            </p>
          </div>
        </aside>
      </div>

      <div v-if="pagePending" class="fixed bottom-5 right-5 rounded-lg bg-white px-4 py-3 text-sm text-stone-500 shadow">
        正在读取周复盘...
      </div>
    </div>
  </main>
</template>
