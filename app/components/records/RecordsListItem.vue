<script setup lang="ts">
import RecordScoreGroup from './RecordScoreGroup.vue'
import type { RecordsListItem } from '~/types/records'

const props = defineProps<{
  record: RecordsListItem
}>()

const recordDetailPath = computed(() => `/records/${props.record.id}`)
</script>

<template>
  <NuxtLink
    :to="recordDetailPath"
    class="group grid gap-5 rounded-xl border border-stone-100 bg-white px-5 py-4 shadow-[0_10px_32px_rgba(72,50,31,0.04)] transition hover:border-orange-100 hover:shadow-[0_14px_36px_rgba(72,50,31,0.08)] lg:grid-cols-[1fr_auto]"
    :aria-label="`查看记录：${record.title}`"
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
      <span class="text-3xl leading-none text-stone-400 transition group-hover:text-orange-500" aria-hidden="true">
        →
      </span>
    </div>
  </NuxtLink>
</template>
