<script setup lang="ts">
import type { RecentRecordEntry } from '~/composables/useDashboardData'

defineProps<{
  records: RecentRecordEntry[]
}>()
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-xl font-medium text-stone-700">最近记录</h2>
      <button class="text-base text-stone-500 transition hover:text-orange-500" type="button">
        查看全部记录 →
      </button>
    </div>
    <div class="overflow-hidden rounded-xl border border-stone-100 bg-white shadow-[0_10px_32px_rgba(72,50,31,0.04)]">
      <DashboardRecentRecordItem
        v-for="record in records"
        :key="record.title"
        :record="record"
      />
    </div>
  </section>
</template>
