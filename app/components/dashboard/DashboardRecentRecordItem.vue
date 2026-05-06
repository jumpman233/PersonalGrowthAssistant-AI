<script setup lang="ts">
import type { RecentRecordEntry } from '~/types/dashboard'

defineProps<{
  record: RecentRecordEntry
}>()
</script>

<template>
  <article class="grid gap-5 border-b border-stone-100 px-4 py-4 last:border-b-0 md:grid-cols-[1fr_auto]">
    <div class="flex gap-5">
      <div
        class="mt-1 grid size-14 shrink-0 place-items-center rounded-full text-2xl"
        :class="record.tone"
      >
        {{ record.icon }}
      </div>
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="text-lg font-semibold text-stone-800">{{ record.title }}</h3>
          <span class="rounded-full bg-stone-100 px-4 py-1 text-sm text-stone-600">
            {{ record.category }}
          </span>
        </div>
        <p class="mt-1 text-sm leading-6 text-stone-500">{{ record.copy }}</p>
        <div class="mt-2 flex flex-wrap gap-2">
          <span
            v-for="tag in record.tags"
            :key="tag"
            class="rounded-full bg-[#f5eee7] px-3 py-1 text-xs text-stone-600"
          >
            {{ tag }}
          </span>
        </div>
      </div>
    </div>
    <div class="flex items-start justify-between gap-8 text-right text-sm text-stone-500">
      <div>
        <p class="text-stone-600">{{ record.score }}</p>
        <p class="mt-1">{{ record.time }}</p>
      </div>
      <button class="text-2xl leading-none text-stone-700" type="button">⋮</button>
    </div>
  </article>
</template>
