<script setup lang="ts">
import type { QuickRecordEntry } from '~/types/dashboard'

defineProps<{
  quick: QuickRecordEntry
}>()
</script>

<template>
  <NuxtLink
    class="group flex items-center rounded-xl border border-stone-100 bg-white px-6 py-4 text-left shadow-[0_10px_32px_rgba(72,50,31,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50/45 hover:shadow-[0_18px_46px_rgba(72,50,31,0.11)]"
    :to="quick.to"
    :aria-label="quick.title"
  >
    <span class="flex items-center gap-5">
      <span class="grid size-14 place-items-center rounded-full text-2xl transition duration-200 group-hover:scale-105" :class="quick.tone">
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
  </NuxtLink>
</template>
