<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    open: boolean
    title: string
    description: string
    confirmLabel?: string
    cancelLabel?: string
    pending?: boolean
    error?: string
  }>(),
  {
    confirmLabel: '确认',
    cancelLabel: '取消',
    pending: false,
    error: '',
  },
)

const emit = defineEmits<{
  close: []
  confirm: []
}>()

const close = () => {
  if (!props.pending) {
    emit('close')
  }
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
            :aria-label="title"
          >
            <div class="flex gap-4">
              <div class="min-w-0">
                <h2 class="text-xl font-semibold text-stone-900">{{ title }}</h2>
                <p class="mt-2 leading-7 text-stone-500">{{ description }}</p>
              </div>
            </div>

            <p v-if="error" class="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
              {{ error }}
            </p>

            <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                class="rounded-lg border border-stone-200 bg-white px-5 py-3 text-stone-600 transition hover:border-orange-100 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="pending"
                @click="close"
              >
                {{ cancelLabel }}
              </button>
              <button
                class="rounded-lg bg-red-500 px-5 py-3 font-medium text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
                :disabled="pending"
                @click="$emit('confirm')"
              >
                {{ pending ? '删除中...' : confirmLabel }}
              </button>
            </div>
          </section>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
