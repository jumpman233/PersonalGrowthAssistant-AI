<script setup lang="ts">
defineProps<{
  label: string
  icon: string
  options: { label: string; value: string }[]
  selectedValue: string
  wrapOnMobile?: boolean
}>()

defineEmits<{
  select: [value: string]
}>()
</script>

<template>
  <section class="space-y-3">
    <div class="flex items-center gap-3">
      <span class="grid size-9 place-items-center rounded-lg bg-orange-50 text-base text-orange-700">
        {{ icon }}
      </span>
      <h3 class="text-lg font-semibold text-stone-800">{{ label }}</h3>
    </div>

    <div
      class="-mx-1 flex gap-2.5 px-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
      :class="wrapOnMobile ? 'flex-wrap overflow-visible pb-0' : 'overflow-x-auto pb-1'"
    >
      <button
        v-for="option in options"
        :key="option.value"
        class="rounded-full border px-4 py-2 text-sm transition"
        :class="[
          wrapOnMobile
            ? 'max-w-full whitespace-normal break-words text-left sm:shrink-0 sm:whitespace-nowrap sm:text-center'
            : 'shrink-0 whitespace-nowrap',
          option.value === selectedValue
            ? 'border-orange-100 bg-[#fff1ea] text-stone-800 shadow-sm'
            : 'border-stone-200 bg-white text-stone-600 hover:border-orange-100 hover:text-orange-500',
        ]"
        type="button"
        @click="$emit('select', option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </section>
</template>
