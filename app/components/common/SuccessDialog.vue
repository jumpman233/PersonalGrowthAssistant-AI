<script setup lang="ts">
const props = defineProps<{
  open: boolean
  title: string
  description: string
}>()

const emit = defineEmits<{
  close: []
}>()

const close = () => {
  emit('close')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    close()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-120 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 grid place-items-center bg-stone-900/20 px-5 backdrop-blur-[2px]"
        role="presentation"
        @click.self="close"
      >
        <Transition
          appear
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="translate-y-2 scale-[0.98] opacity-0"
          enter-to-class="translate-y-0 scale-100 opacity-100"
          leave-active-class="transition duration-120 ease-in"
          leave-from-class="translate-y-0 scale-100 opacity-100"
          leave-to-class="translate-y-2 scale-[0.98] opacity-0"
        >
          <section
            class="w-full max-w-md rounded-xl border border-stone-100 bg-white p-6 text-stone-700 shadow-[0_24px_70px_rgba(72,50,31,0.16)]"
            role="dialog"
            aria-modal="true"
            :aria-label="props.title"
          >
            <div class="flex gap-4">
              <span class="grid size-11 shrink-0 place-items-center rounded-full bg-orange-50 text-xl text-orange-500">
                ✓
              </span>
              <div class="min-w-0">
                <h2 class="text-xl font-semibold text-stone-900">{{ title }}</h2>
                <p class="mt-2 leading-7 text-stone-500">{{ description }}</p>
              </div>
            </div>

            <div class="mt-6 flex justify-end">
              <button
                class="rounded-lg bg-orange-400 px-5 py-3 font-medium text-white transition hover:bg-orange-500"
                type="button"
                @click="close"
              >
                知道了
              </button>
            </div>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
