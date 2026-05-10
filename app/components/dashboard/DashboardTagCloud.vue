<script setup lang="ts">
defineProps<{
  tags: string[]
}>()
</script>

<template>
  <section class="rounded-xl border border-stone-100 bg-white p-5 shadow-[0_10px_32px_rgba(72,50,31,0.04)] md:p-7">
    <h2 class="mb-5 flex items-center gap-3 text-lg font-semibold text-stone-800 md:text-xl">
      <span class="text-xl text-stone-600 md:text-2xl">#</span>
      高频标签
    </h2>
    <div class="flex flex-wrap gap-3">
      <span
        v-for="tag in tags"
        :key="tag"
        class="rounded-full border border-orange-100 bg-[#fff8f0] px-4 py-1.5 text-sm text-stone-700 md:px-5 md:py-2 md:text-base"
      >
        {{ tag }}
      </span>
    </div>
  </section>
</template>
