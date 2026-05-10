<script setup lang="ts">
import type { RecordsListItem } from '~/types/records'

defineProps<{
  scores: RecordsListItem['scores']
}>()
</script>

<template>
  <div class="grid grid-cols-3 divide-x divide-stone-100">
    <div
      v-for="score in [scores.mood, scores.constructiveness, scores.energyCost]"
      :key="score.label"
      class="px-3 text-center md:px-4"
    >
      <p class="text-xs text-stone-500 md:text-sm">{{ score.label }}</p>
      <p class="mt-2 flex items-center justify-center gap-1.5 text-lg font-semibold text-stone-900 md:gap-2 md:text-xl">
        <span class="grid size-7 place-items-center rounded-full text-sm" :class="score.tone">
          {{ score.icon }}
        </span>
        {{ score.value }}
      </p>
    </div>
  </div>
</template>
