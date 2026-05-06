<script setup lang="ts">
defineProps<{
  label: string
  options: { label: string; value: string }[]
  selectedValue: string
}>()

defineEmits<{
  select: [value: string]
}>()
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
    <span class="shrink-0 text-base font-medium text-stone-700">{{ label }}</span>
    <div class="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
      <button
        v-for="option in options"
        :key="option.value"
        class="shrink-0 rounded-full border px-5 py-2 text-sm transition"
        :class="
          option.value === selectedValue
            ? 'border-orange-100 bg-[#fff1ea] text-stone-800'
            : 'border-stone-200 bg-white text-stone-600 hover:border-orange-100 hover:text-orange-500'
        "
        type="button"
        @click="$emit('select', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
