<script setup lang="ts">
import AppPrimaryAction from '~/components/common/AppPrimaryAction.vue'
import AppSecondaryAction from '~/components/common/AppSecondaryAction.vue'
</script>

<template>
  <header
    class="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-center sm:justify-between md:gap-5"
  >
    <div class="flex items-center gap-4">
      <div class="relative size-11 text-orange-300 md:size-12">
        <span class="absolute inset-0 rounded-full border-4 border-current opacity-70" />
        <span class="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-current" />
        <span class="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-current" />
        <span class="absolute inset-3 rounded-full border-2 border-current bg-white" />
      </div>
      <div>
        <h1 class="text-[22px] font-semibold tracking-[0.16em] text-[#332f2c] md:text-2xl">
          真实建设感复盘
        </h1>
        <p class="mt-1 text-[13px] tracking-[0.24em] text-stone-500 md:text-sm">Growth Compass</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3 text-sm text-stone-700 md:gap-6 md:text-base">
      <p class="flex items-center gap-2">
        <span class="text-base text-stone-500 md:text-lg">▣</span>
        2025年5月20日&nbsp;&nbsp;星期二
      </p>
      <AppPrimaryAction to="/records/new">
        ＋ 新建记录
      </AppPrimaryAction>
      <AppSecondaryAction to="/dashboard">
        ▦ 返回总览
      </AppSecondaryAction>
    </div>
  </header>
</template>
