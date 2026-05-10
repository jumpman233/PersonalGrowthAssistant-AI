<script setup lang="ts">
import type { QuickRecordEntry } from '~/types/dashboard'

defineProps<{
  quick: QuickRecordEntry
}>()
</script>

<template>
  <NuxtLink
    class="group flex min-h-24 items-center rounded-xl border border-stone-100 bg-white px-4 py-3 text-left shadow-[0_6px_24px_rgba(72,50,31,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50/45 hover:shadow-[0_18px_46px_rgba(72,50,31,0.11)] md:min-h-0 md:px-6 md:py-4 md:shadow-[0_10px_32px_rgba(72,50,31,0.04)]"
    :to="quick.to"
    :aria-label="quick.title"
  >
    <span class="flex items-center gap-3 md:gap-5">
      <span class="grid size-9 shrink-0 place-items-center rounded-full text-base transition duration-200 group-hover:scale-105 md:size-14 md:text-2xl" :class="quick.tone">
        {{ quick.icon }}
      </span>
      <span>
        <span class="block text-sm font-semibold leading-snug text-stone-700 md:text-base">
          {{ quick.title }}
        </span>
        <span class="mt-1 hidden max-w-64 text-sm leading-5 text-stone-500 md:block">
          {{ quick.copy }}
        </span>
      </span>
    </span>
  </NuxtLink>
</template>
