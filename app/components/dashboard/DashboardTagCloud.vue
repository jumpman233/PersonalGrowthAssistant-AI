<script setup lang="ts">
defineProps<{
  tags: string[]
}>()
</script>

<template>
  <section class="rounded-xl border border-stone-100 bg-white p-7 shadow-[0_10px_32px_rgba(72,50,31,0.04)]">
    <h2 class="mb-5 flex items-center gap-3 text-xl font-semibold text-stone-800">
      <span class="text-2xl text-stone-600">◇</span>
      高频标签
    </h2>
    <div class="flex flex-wrap gap-3">
      <span
        v-for="tag in tags"
        :key="tag"
        class="rounded-full border border-orange-100 bg-[#fff8f0] px-5 py-2 text-base text-stone-700"
      >
        {{ tag }}
      </span>
    </div>
  </section>
</template>
