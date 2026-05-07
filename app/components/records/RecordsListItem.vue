<script setup lang="ts">
import RecordScoreGroup from './RecordScoreGroup.vue'
import type { RecordsListItem } from '~/types/records'

const props = defineProps<{
  record: RecordsListItem
}>()

defineEmits<{
  delete: []
}>()

const recordDetailPath = computed(() => `/records/${props.record.id}`)
</script>

<template>
  <article
    class="group relative rounded-xl border border-stone-100 bg-white shadow-[0_10px_32px_rgba(72,50,31,0.04)] transition duration-200 hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50/45 hover:shadow-[0_18px_46px_rgba(72,50,31,0.11)]"
  >
    <NuxtLink
      :to="recordDetailPath"
      class="grid gap-5 px-5 py-4 pr-14 lg:grid-cols-[1fr_auto] lg:pr-16"
      :aria-label="`查看记录：${record.title}`"
    >
      <div class="flex gap-5">
        <div
          class="mt-1 grid size-14 shrink-0 place-items-center rounded-full text-2xl transition duration-200 group-hover:scale-105"
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
      </div>
    </NuxtLink>

    <button
      class="absolute bottom-4 right-4 grid size-9 place-items-center rounded-full border border-transparent text-stone-300 opacity-70 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500 group-hover:text-stone-500 group-hover:opacity-100"
      type="button"
      :aria-label="`删除记录：${record.title}`"
      @click.stop.prevent="$emit('delete')"
    >
      <svg
        class="size-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.8"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M3 6h18" />
        <path d="M8 6V4h8v2" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v5" />
        <path d="M14 11v5" />
      </svg>
    </button>
  </article>
</template>
