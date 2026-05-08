<script setup lang="ts">
import type { WeeklyTrendEntry } from '~/types/dashboard'

defineProps<{
  trend: WeeklyTrendEntry[]
}>()
</script>

<template>
  <section class="rounded-xl border border-stone-100 bg-white p-7 shadow-[0_10px_32px_rgba(72,50,31,0.04)]">
    <div class="mb-6 flex items-center justify-between">
      <h2 class="flex items-center gap-3 text-xl font-semibold text-stone-800">
        <span class="text-2xl text-orange-300">↗</span>
        本周趋势
      </h2>
      <p class="text-sm text-stone-400">0-5 分</p>
    </div>

    <ClientOnly>
      <DashboardWeeklyTrendChart v-if="trend.length" :trend="trend" />
      <div v-else class="grid h-56 place-items-center rounded-lg border border-dashed border-stone-200 text-sm text-stone-400">
        暂时还没有足够的趋势数据。
      </div>

      <template #fallback>
        <div class="h-56 rounded-lg bg-stone-50" />
      </template>
    </ClientOnly>
  </section>
</template>
