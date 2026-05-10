<script setup lang="ts">
import AppPageHeader from '~/components/layout/AppPageHeader.vue'

const today = new Date()
const formattedToday = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long',
}).format(today)

const compactToday = new Intl.DateTimeFormat('zh-CN', {
  month: 'numeric',
  day: 'numeric',
  weekday: 'short',
}).format(today)
</script>

<template>
  <AppPageHeader :show-weekly-review="false">
    <template #actions>
      <p class="flex items-center gap-1.5 text-xs text-stone-500 md:gap-2 md:text-base">
        <span class="text-sm text-stone-500 md:text-lg">◇</span>
        <span class="md:hidden">{{ compactToday }}</span>
        <span class="hidden md:inline">{{ formattedToday }}</span>
      </p>
    </template>
  </AppPageHeader>
</template>
