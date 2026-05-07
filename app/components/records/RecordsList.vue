<script setup lang="ts">
import type { RecordsListItem } from '~/types/records'

defineProps<{
  records: RecordsListItem[]
  pending: boolean
  error: string | null
  hasMore: boolean
}>()

const emit = defineEmits<{
  'load-more': []
  'delete-record': [recordId: string]
  retry: []
}>()

const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  if (!sentinel.value) {
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        emit('load-more')
      }
    },
    {
      rootMargin: '240px 0px',
      threshold: 0,
    },
  )

  observer.observe(sentinel.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <section class="space-y-3">
    <RecordsListItem
      v-for="record in records"
      :key="record.id"
      :record="record"
      @delete="$emit('delete-record', record.id)"
    />

    <div ref="sentinel" class="h-1" />

    <div class="px-4 py-7 text-center text-sm text-stone-500">
      <p v-if="pending">正在加载更多记录……</p>
      <div v-else-if="error" class="space-y-3">
        <p>{{ error }}</p>
        <button
          class="rounded-full border border-stone-200 bg-white px-5 py-2 text-stone-600 transition hover:border-orange-100 hover:text-orange-500"
          type="button"
          @click="$emit('retry')"
        >
          重试加载
        </button>
      </div>
      <p v-else-if="records.length === 0">
        还没有符合条件的记录。可以放宽筛选，或者写下一条新的记录。
      </p>
      <p v-else-if="!hasMore">已经看完最近的记录了。</p>
    </div>
  </section>
</template>
