<script setup lang="ts">
import type { WeeklyTrendEntry } from '~/types/dashboard'

defineProps<{
  trend: WeeklyTrendEntry[]
}>()
</script>

<template>
  <section class="rounded-xl border border-stone-100 bg-white p-7 shadow-[0_10px_32px_rgba(72,50,31,0.04)]">
    <div class="mb-7 flex items-center justify-between">
      <h2 class="flex items-center gap-3 text-xl font-semibold text-stone-800">
        <span class="text-2xl text-orange-300">▥</span>
        本周趋势
      </h2>
      <div class="flex gap-5 text-sm text-stone-500">
        <span><i class="mr-2 inline-block size-3 bg-[#efad97]" />建设感</span>
        <span><i class="mr-2 inline-block size-3 bg-[#cce4df]" />消耗</span>
      </div>
    </div>
    <div class="relative h-52 border-b border-stone-100">
      <div class="absolute inset-x-0 top-0 h-px bg-stone-100" />
      <div class="absolute inset-x-0 top-1/3 h-px bg-stone-100" />
      <div class="absolute inset-x-0 top-2/3 h-px bg-stone-100" />
      <div class="flex h-full items-end justify-between gap-4 px-5">
        <div
          v-for="item in trend"
          :key="item.day"
          class="flex h-full flex-1 flex-col items-center justify-end gap-2"
        >
          <div class="flex h-40 items-end gap-2">
            <span
              class="w-3 rounded-t bg-[#efad97]"
              :style="{ height: `${item.growth * 24}px` }"
            />
            <span
              class="w-3 rounded-t bg-[#cce4df]"
              :style="{ height: `${item.drain * 24}px` }"
            />
          </div>
          <span class="text-sm text-stone-500">{{ item.day }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
