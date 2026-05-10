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
const visibleTags = computed(() => props.record.tags.slice(0, 4))
const hiddenTagCount = computed(() => Math.max(props.record.tags.length - visibleTags.value.length, 0))
const scoreEntries = computed(() => [
  props.record.scores.mood,
  props.record.scores.constructiveness,
  props.record.scores.energyCost,
])
</script>

<template>
  <article
    class="group relative rounded-[18px] border border-stone-100 bg-white shadow-[0_6px_24px_rgba(72,50,31,0.035)] transition duration-200 hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50/45 hover:shadow-[0_18px_46px_rgba(72,50,31,0.11)] lg:rounded-xl"
  >
    <NuxtLink
      :to="recordDetailPath"
      class="block p-4 pr-12 lg:hidden"
      :aria-label="`查看记录：${record.title}`"
    >
      <div class="flex items-center gap-2.5">
        <span class="inline-flex max-w-[45%] items-center gap-1.5 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700">
          <span
            class="grid size-7 shrink-0 place-items-center rounded-full text-sm"
            :class="record.category.tone"
          >
            {{ record.category.icon }}
          </span>
          <span class="truncate">{{ record.category.label }}</span>
        </span>
        <span class="min-w-0 flex-1 truncate text-xs text-stone-400">{{ record.occurredAt }}</span>
      </div>

      <h3 class="records-list-title mt-3 text-lg font-semibold leading-snug text-stone-900">
        {{ record.title }}
      </h3>

      <p class="records-list-summary mt-2 text-sm leading-6 text-stone-600">
        {{ record.summary }}
      </p>

      <div v-if="record.tags.length" class="mt-3 flex flex-wrap gap-1.5">
        <span
          v-for="tag in visibleTags"
          :key="tag"
          class="rounded-full bg-[#f7f1ea] px-2.5 py-1 text-[11px] leading-4 text-stone-600"
        >
          {{ tag }}
        </span>
        <span
          v-if="hiddenTagCount"
          class="rounded-full bg-stone-50 px-2.5 py-1 text-[11px] leading-4 text-stone-500"
        >
          +{{ hiddenTagCount }}
        </span>
      </div>

      <div class="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-3">
        <span
          v-for="score in scoreEntries"
          :key="score.label"
          class="inline-flex items-center gap-1.5 rounded-full bg-stone-50 px-2.5 py-1 text-xs text-stone-600"
        >
          <span class="text-sm">{{ score.icon }}</span>
          <span>{{ score.label }}</span>
          <span class="font-semibold text-stone-800">{{ score.value }}</span>
        </span>
      </div>
    </NuxtLink>

    <NuxtLink
      :to="recordDetailPath"
      class="hidden gap-5 px-5 py-4 pr-16 lg:grid lg:grid-cols-[1fr_auto]"
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
      class="absolute right-3 top-3 grid size-8 place-items-center rounded-full border border-stone-100 bg-white/80 text-stone-400 shadow-sm transition hover:border-red-100 hover:bg-red-50 hover:text-red-500 lg:hidden"
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
        <path d="M5 12h14" />
        <path d="M5 6h14" />
        <path d="M5 18h14" />
      </svg>
    </button>

    <button
      class="absolute bottom-4 right-4 hidden size-9 place-items-center rounded-full border border-transparent text-stone-300 opacity-70 transition hover:border-red-100 hover:bg-red-50 hover:text-red-500 group-hover:text-stone-500 group-hover:opacity-100 lg:grid"
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

<style scoped>
.records-list-title,
.records-list-summary {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.records-list-title {
  -webkit-line-clamp: 2;
}

.records-list-summary {
  -webkit-line-clamp: 3;
}
</style>
