<script setup lang="ts">
import type { DashboardStat } from '~/composables/useDashboardData'

defineProps<{
  stat: DashboardStat
}>()
</script>

<template>
  <article class="rounded-xl border border-stone-100 bg-white p-6 shadow-[0_10px_32px_rgba(72,50,31,0.04)]">
    <div class="flex items-center gap-5">
      <div
        class="grid size-14 place-items-center rounded-full bg-gradient-to-br text-2xl"
        :class="stat.tone"
      >
        {{ stat.icon }}
      </div>
      <div>
        <p class="text-base font-medium text-stone-700">{{ stat.label }}</p>
        <p class="mt-1 text-3xl font-semibold text-stone-900">{{ stat.value }}</p>
      </div>
    </div>
    <p class="mt-4 text-sm leading-6 text-stone-500">{{ stat.note }}</p>
  </article>
</template>
