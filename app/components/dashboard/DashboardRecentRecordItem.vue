<script setup lang="ts">
import type { RecentRecordEntry } from '~/types/dashboard'

const props = defineProps<{
  record: RecentRecordEntry
}>()

const recordDetailPath = computed(() => `/records/${props.record.id}`)
</script>

<template>
  <NuxtLink
    :to="recordDetailPath"
    class="group mx-2 my-2 grid gap-5 rounded-xl border border-transparent px-4 py-4 transition duration-200 hover:-translate-y-0.5 hover:border-orange-100 hover:bg-orange-50/45 hover:shadow-[0_18px_46px_rgba(72,50,31,0.11)] md:grid-cols-[1fr_auto]"
    :aria-label="`查看记录：${record.title}`"
  >
    <div class="flex gap-5">
      <div
        class="mt-1 grid size-12 shrink-0 place-items-center rounded-full text-xl transition duration-200 group-hover:scale-105 md:size-14 md:text-2xl"
        :class="record.tone"
      >
        {{ record.icon }}
      </div>
      <div class="min-w-0">
        <div class="flex flex-wrap items-center gap-3">
          <h3 class="text-base font-semibold text-stone-800 md:text-lg">{{ record.title }}</h3>
          <span class="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-600 md:px-4 md:text-sm">
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
    <div class="flex items-start justify-end text-right text-sm text-stone-500">
      <div>
        <p class="text-stone-600">{{ record.score }}</p>
        <p class="mt-1">{{ record.time }}</p>
      </div>
    </div>
  </NuxtLink>
</template>
