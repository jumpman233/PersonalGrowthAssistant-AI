<script setup lang="ts">
import type { WeeklyReviewApiData } from '~/types/weekly-review'
import AppPrimaryAction from '~/components/common/AppPrimaryAction.vue'
import AppSidebarNav from '~/components/layout/AppSidebarNav.vue'

const { navItems } = useAppNavigation()

const emptyReview = (): WeeklyReviewApiData => ({
  title: '本周复盘',
  status: 'STALE',
  statusLabel: '待更新',
  weekRange: '暂无周复盘数据',
  generatedLabel: '先保留入口，后续接入生成逻辑',
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

const { data: review, pending } = await useFetch('/api/review', {
  default: emptyReview,
})

const placeholderNotice = ref('')

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

const updateReview = () => {
  placeholderNotice.value = '更新周复盘的生成流程还没接入，这里先作为入口占位。'
}
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

        <div class="flex flex-wrap items-center gap-3">
          <AppPrimaryAction @click="updateReview">
            更新周复盘
          </AppPrimaryAction>
        </div>
      </header>

      <p
        v-if="placeholderNotice"
        class="mt-5 rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700"
      >
        {{ placeholderNotice }}
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
              <p class="text-sm text-stone-400">当前使用数据库占位内容</p>
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
              <p>第一版先用纯文字承载，等复盘链路稳定后再考虑更丰富的视觉表达。</p>
            </div>
          </div>

          <div class="rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
            <h2 class="text-lg font-semibold text-[#332f2c]">数据说明</h2>
            <p class="mt-4 text-sm leading-7 text-stone-600">
              统计数据和 AI 总结都先读取 WeeklyReview。记录变更后的过期、重新生成和失败处理，会在后续触发机制里补上。
            </p>
          </div>
        </aside>
      </div>

      <div v-if="pending" class="fixed bottom-5 right-5 rounded-lg bg-white px-4 py-3 text-sm text-stone-500 shadow">
        正在读取周复盘...
      </div>
    </div>
  </main>
</template>
