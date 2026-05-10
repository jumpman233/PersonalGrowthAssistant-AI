<script setup lang="ts">
import type { QuickRecordEntry } from '~/types/dashboard'

defineProps<{
  quickRecords: QuickRecordEntry[]
}>()
</script>

<template>
  <section>
    <h2 class="mb-3 text-base font-medium text-stone-700 md:text-xl">今天从哪里开始记录？</h2>
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
      <DashboardQuickRecordCard
        v-for="quick in quickRecords"
        :key="quick.title"
        :quick="quick"
      />
    </div>
  </section>
</template>
