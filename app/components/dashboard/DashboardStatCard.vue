<script setup lang="ts">
import type { DashboardStat } from '~/types/dashboard'

defineProps<{
  stat: DashboardStat
}>()
</script>

<template>
  <article class="min-h-28 rounded-xl border border-stone-100 bg-white p-4 shadow-[0_6px_24px_rgba(72,50,31,0.035)] md:min-h-0 md:p-6 md:shadow-[0_10px_32px_rgba(72,50,31,0.04)]">
    <div class="flex items-start gap-3 md:items-center md:gap-5">
      <div
        class="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br text-base md:size-14 md:text-2xl"
        :class="stat.tone"
      >
        {{ stat.icon }}
      </div>
      <div class="min-w-0">
        <p class="truncate text-[13px] font-medium text-stone-600 md:text-base md:text-stone-700">{{ stat.label }}</p>
        <p class="mt-1 text-[28px] font-semibold leading-none text-stone-900 md:text-3xl md:leading-normal">{{ stat.value }}</p>
      </div>
    </div>
    <p class="mt-3 hidden text-sm leading-6 text-stone-500 md:block">{{ stat.note }}</p>
  </article>
</template>
