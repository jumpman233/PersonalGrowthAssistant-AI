<script setup lang="ts">
import type { RecordsListItem } from '~/types/records'

defineProps<{
  record: RecordsListItem
}>()
</script>

<template>
  <article
    class="grid gap-5 rounded-xl border border-stone-100 bg-white px-5 py-4 shadow-[0_10px_32px_rgba(72,50,31,0.04)] lg:grid-cols-[1fr_auto]"
  >
    <div class="flex gap-5">
      <div
        class="mt-1 grid size-14 shrink-0 place-items-center rounded-full text-2xl"
        :class="record.category.tone"
      >
        {{ record.category.icon }}
      </div>
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="text-lg font-semibold text-stone-900">{{ record.title }}</h3>
          <span class="rounded-full bg-cyan-50 px-4 py-1 text-sm text-cyan-700">
            {{ record.category.label }}
          </span>
        </div>
        <p class="mt-1 text-sm text-stone-500">{{ record.occurredAt }}</p>
        <p class="mt-2 text-sm leading-6 text-stone-600">{{ record.summary }}</p>
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

    <div class="flex items-center justify-between gap-5 border-stone-100 lg:border-l lg:pl-6">
      <RecordScoreGroup :scores="record.scores" />
      <NuxtLink class="text-3xl leading-none text-stone-400 transition hover:text-orange-500" :to="`/records/${record.id}`">
        ›
      </NuxtLink>
    </div>
  </article>
</template>
