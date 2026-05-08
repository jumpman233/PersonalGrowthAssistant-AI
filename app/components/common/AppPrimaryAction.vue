<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const props = withDefaults(
  defineProps<{
    size?: 'md' | 'sm'
    to?: string
    type?: 'button' | 'submit' | 'reset'
  }>(),
  {
    size: 'md',
    to: undefined,
    type: 'button',
  },
)

const sizeClass = computed(() => {
  if (props.size === 'sm') {
    return 'px-8 py-3 text-sm'
  }

  return 'px-9 py-3.5'
})
</script>

<template>
  <NuxtLink
    v-if="to"
    class="rounded-lg bg-[#d6765e] font-medium text-white shadow-sm transition hover:bg-[#c8644d] hover:shadow-md"
    :class="sizeClass"
    :to="to"
    v-bind="attrs"
  >
    <slot />
  </NuxtLink>

  <button
    v-else
    class="rounded-lg bg-[#d6765e] font-medium text-white shadow-sm transition hover:bg-[#c8644d] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    :class="sizeClass"
    :type="type"
    v-bind="attrs"
  >
    <slot />
  </button>
</template>
