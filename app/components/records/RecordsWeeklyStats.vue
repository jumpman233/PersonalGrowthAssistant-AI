<script setup lang="ts">
import type { RecordsSummary } from '~/types/records'

defineProps<{
  summary: RecordsSummary
}>()

const formatNumber = (value: number | null) => {
  if (value === null) {
    return '-'
  }

  return Number.isInteger(value) ? value.toString() : value.toFixed(1)
}
</script>

<template>
  <section class="rounded-xl border border-stone-100 bg-white p-5 shadow-[0_10px_32px_rgba(72,50,31,0.04)] md:p-7">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="flex items-center gap-3 text-lg font-semibold text-stone-800 md:text-xl">
        <span class="text-xl text-orange-300 md:text-2xl">⌁</span>
        本周小统计
      </h2>
      <span class="text-base text-stone-500 md:text-lg">ⓘ</span>
    </div>

    <div class="grid grid-cols-2 gap-4">
      <article class="rounded-lg border border-stone-100 p-4 md:p-5">
        <p class="text-sm text-stone-500">本周记录</p>
        <p class="mt-2 text-[30px] font-semibold text-stone-900 md:text-3xl">{{ summary.weeklyRecordCount }}</p>
        <p class="mt-1 text-sm text-stone-500">条</p>
      </article>
      <article class="rounded-lg border border-stone-100 p-4 md:p-5">
        <p class="text-sm text-stone-500">平均建设感</p>
        <p class="mt-2 text-[30px] font-semibold text-stone-900 md:text-3xl">{{ formatNumber(summary.averageConstructiveness) }}</p>
        <p class="mt-1 text-sm text-stone-500">分</p>
      </article>
      <article class="rounded-lg border border-stone-100 p-4 md:p-5">
        <p class="text-sm text-stone-500">平均内耗</p>
        <p class="mt-2 text-[30px] font-semibold text-stone-900 md:text-3xl">{{ formatNumber(summary.averageEnergyCost) }}</p>
        <p class="mt-1 text-sm text-stone-500">分</p>
      </article>
      <article class="rounded-lg border border-stone-100 p-4 md:p-5">
        <p class="text-sm text-stone-500">平均心情</p>
        <p class="mt-2 text-[30px] font-semibold text-stone-900 md:text-3xl">{{ formatNumber(summary.averageMood) }}</p>
        <p class="mt-1 text-sm text-stone-500">分</p>
      </article>
    </div>
  </section>
</template>
