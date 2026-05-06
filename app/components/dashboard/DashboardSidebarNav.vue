<script setup lang="ts">
defineProps<{
  navItems: string[]
}>()
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-20 hidden w-36 border-r border-cyan-100 bg-cyan-50/60 backdrop-blur-xl lg:flex lg:flex-col lg:items-center lg:justify-center"
  >
    <nav class="flex flex-col items-center gap-7 text-xl text-slate-600">
      <button
        v-for="item in navItems"
        :key="item"
        class="grid size-9 place-items-center rounded-full transition hover:bg-white hover:text-orange-500 hover:shadow-sm"
        :class="item === '+' ? 'bg-white text-2xl text-slate-700 shadow-sm' : ''"
        type="button"
      >
        {{ item }}
      </button>
    </nav>
  </aside>
</template>
