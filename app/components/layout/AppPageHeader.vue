<script setup lang="ts">
import AppPrimaryAction from '~/components/common/AppPrimaryAction.vue'
import AppSecondaryAction from '~/components/common/AppSecondaryAction.vue'

withDefaults(
  defineProps<{
    showNewRecord?: boolean
    showWeeklyReview?: boolean
  }>(),
  {
    showNewRecord: true,
    showWeeklyReview: true,
  },
)
</script>

<template>
  <header
    class="flex flex-col gap-5 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between"
  >
    <NuxtLink class="flex items-center gap-4" to="/dashboard" aria-label="返回总览">
      <span class="relative size-12 text-orange-300" aria-hidden="true">
        <span class="absolute inset-0 rounded-full border-4 border-current opacity-70" />
        <span class="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-current" />
        <span class="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-current" />
        <span class="absolute inset-3 rounded-full border-2 border-current bg-white" />
      </span>
      <span>
        <span class="block text-2xl font-semibold tracking-[0.16em] text-[#332f2c]">真实建设感复盘</span>
        <span class="mt-1 block text-sm tracking-[0.24em] text-stone-500">Growth Compass</span>
      </span>
    </NuxtLink>

    <div class="flex flex-wrap items-center gap-4 text-base text-stone-700">
      <slot name="actions" />

      <AppPrimaryAction v-if="showNewRecord" to="/records/new">
        + 新建记录
      </AppPrimaryAction>

      <AppSecondaryAction v-if="showWeeklyReview" to="/review">
        ↻ 生成周复盘
      </AppSecondaryAction>
    </div>
  </header>
</template>
