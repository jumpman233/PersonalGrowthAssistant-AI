<script setup lang="ts">
import type { DashboardStat } from '~/types/dashboard'

defineProps<{
  stats: DashboardStat[]
}>()
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
    <DashboardStatCard v-for="stat in stats" :key="stat.label" :stat="stat" />
  </div>
</template>
