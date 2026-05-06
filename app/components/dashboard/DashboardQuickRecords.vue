<script setup lang="ts">
import type { QuickRecordEntry } from '~/types/dashboard'

defineProps<{
  quickRecords: QuickRecordEntry[]
}>()
</script>

<template>
  <section>
    <h2 class="mb-3 text-xl font-medium text-stone-700">快速记录</h2>
    <div class="grid gap-4 lg:grid-cols-3">
      <DashboardQuickRecordCard
        v-for="quick in quickRecords"
        :key="quick.title"
        :quick="quick"
      />
    </div>
  </section>
</template>
