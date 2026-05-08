<script setup lang="ts">
import AppPrimaryAction from '~/components/common/AppPrimaryAction.vue'
import AppSecondaryAction from '~/components/common/AppSecondaryAction.vue'
</script>

<template>
  <header
    class="flex flex-col gap-5 border-b border-stone-200 pb-5 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex items-center gap-4">
      <div class="relative size-12 text-orange-300">
        <span class="absolute inset-0 rounded-full border-4 border-current opacity-70" />
        <span class="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-current" />
        <span class="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-current" />
        <span class="absolute inset-3 rounded-full border-2 border-current bg-white" />
      </div>
      <div>
        <h1 class="text-2xl font-semibold tracking-[0.16em] text-[#332f2c]">
          真实建设感复盘
        </h1>
        <p class="mt-1 text-sm tracking-[0.24em] text-stone-500">Growth Compass</p>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-6 text-base text-stone-700">
      <p class="flex items-center gap-2">
        <span class="text-lg text-stone-500">▣</span>
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
