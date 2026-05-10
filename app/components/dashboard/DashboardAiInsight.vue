<script setup lang="ts">
import type { DashboardAiInsight } from '~/types/dashboard'

defineProps<{
  insight: DashboardAiInsight
}>()
</script>

<template>
  <section class="rounded-xl border border-stone-100 bg-white p-5 shadow-[0_10px_32px_rgba(72,50,31,0.04)] md:p-7">
    <div class="mb-5 flex items-center justify-between">
      <h2 class="flex items-center gap-3 text-lg font-semibold text-stone-800 md:text-xl">
        <span class="text-2xl text-orange-300">◎</span>
        本周 AI 观察
      </h2>
      <span class="text-lg text-stone-500">↗</span>
    </div>
    <p class="text-sm leading-6 text-stone-700 md:text-base md:leading-8">
      {{ insight.summary }}
    </p>
    <div class="mt-6 rounded-lg border border-orange-100 bg-[#fff8ee] p-5">
      <h3 class="mb-2 flex items-center gap-3 text-sm font-medium text-stone-700 md:text-base">
        <span class="text-orange-400">•</span>
        本周建议
      </h3>
      <p class="text-sm leading-6 text-stone-600">
        {{ insight.suggestion }}
      </p>
    </div>
  </section>
</template>
