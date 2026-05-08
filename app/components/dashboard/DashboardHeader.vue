<script setup lang="ts">
import AppPageHeader from '~/components/layout/AppPageHeader.vue'

const today = new Date()
const formattedToday = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
}).format(today)
</script>

<template>
  <AppPageHeader>
    <template #actions>
      <p class="flex items-center gap-2">
        <span class="text-lg text-stone-500">▦</span>
        {{ formattedToday }}
      </p>
    </template>
  </AppPageHeader>
</template>
