<script setup lang="ts">
import type { QuickRecordEntry } from '~/composables/useDashboardData'

defineProps<{
  quick: QuickRecordEntry
}>()
</script>

<template>
  <button
    class="flex items-center justify-between rounded-xl border border-stone-100 bg-white px-6 py-4 text-left shadow-[0_10px_32px_rgba(72,50,31,0.04)] transition hover:-translate-y-0.5 hover:border-orange-100 hover:shadow-[0_14px_36px_rgba(72,50,31,0.08)]"
    type="button"
  >
    <span class="flex items-center gap-5">
      <span class="grid size-14 place-items-center rounded-full text-2xl" :class="quick.tone">
        {{ quick.icon }}
      </span>
      <span>
        <span class="block text-base font-semibold text-stone-700">
          {{ quick.title }}
        </span>
        <span class="mt-1 block max-w-64 text-sm leading-5 text-stone-500">
          {{ quick.copy }}
        </span>
      </span>
    </span>
    <span class="text-2xl text-stone-500">›</span>
  </button>
</template>
