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
  <section class="space-y-2 md:space-y-3">
    <div class="flex items-center gap-3">
      <span class="hidden size-9 place-items-center rounded-lg bg-orange-50 text-sm text-orange-700 md:grid md:text-base">
        {{ icon }}
      </span>
      <h3 class="text-sm font-semibold text-stone-700 md:text-lg md:text-stone-800">{{ label }}</h3>
    </div>

    <div
      class="-mx-1 flex gap-2 px-1 sm:flex-wrap sm:overflow-visible sm:pb-0 md:gap-2.5"
      :class="wrapOnMobile ? 'flex-wrap overflow-visible pb-0' : 'overflow-x-auto pb-1'"
    >
      <button
        v-for="option in options"
        :key="option.value"
        class="rounded-full border px-3 py-1.5 text-xs transition md:px-4 md:py-2 md:text-sm"
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
