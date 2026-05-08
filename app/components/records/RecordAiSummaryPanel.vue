<script setup lang="ts">
import type { AiAnalysisResponse } from '~/types/ai'

const props = defineProps<{
  recordId: string
  initialSummary: AiAnalysisResponse | null
  autoGenerate?: boolean
}>()

const emit = defineEmits<{
  autoGenerateHandled: []
}>()

const summary = ref<AiAnalysisResponse | null>(props.initialSummary)
const pending = ref(false)
const error = ref('')
const pollCount = ref(0)
let pollTimer: ReturnType<typeof setTimeout> | null = null

const maxPollCount = 13
const isPending = computed(() => summary.value?.status === 'PENDING')
const canGenerate = computed(() => !pending.value && !isPending.value)

const stopPolling = () => {
  if (pollTimer) {
    clearTimeout(pollTimer)
    pollTimer = null
  }
}

const schedulePoll = (analysisId: string) => {
  stopPolling()

  if (pollCount.value >= maxPollCount) {
    return
  }

  const delay = pollCount.value === 0 ? 3000 : 5000
  pollCount.value += 1

  pollTimer = setTimeout(async () => {
    try {
      const result = await $fetch<AiAnalysisResponse>(`/api/ai-analyses/${analysisId}`)
      summary.value = result

      if (result.status === 'PENDING') {
        schedulePoll(result.id)
      } else {
        stopPolling()
      }
    } catch {
      error.value = '这次没有拿到 AI 总结状态，可以稍后刷新看看。'
      stopPolling()
    }
  }, delay)
}

const startPolling = (analysisId: string) => {
  pollCount.value = 0
  schedulePoll(analysisId)
}

const generateSummary = async () => {
  if (!canGenerate.value) {
    return
  }

  pending.value = true
  error.value = ''

  try {
    const result = await $fetch<AiAnalysisResponse>(`/api/records/${props.recordId}/ai-analysis`, {
      method: 'POST',
    })

    summary.value = result

    if (result.status === 'PENDING') {
      startPolling(result.id)
    }
  } catch {
    error.value = '这次没有生成成功，记录已经保存，可以稍后重试。'
  } finally {
    pending.value = false
  }
}

watch(
  () => props.initialSummary,
  (value) => {
    summary.value = value

    if (value?.status === 'PENDING') {
      startPolling(value.id)
    }
  },
)

onMounted(() => {
  if (props.autoGenerate) {
    void generateSummary()
    emit('autoGenerateHandled')
    return
  }

  if (summary.value?.status === 'PENDING') {
    startPolling(summary.value.id)
  }
})

onBeforeUnmount(stopPolling)
</script>

<template>
  <section class="rounded-xl border border-stone-100 bg-white p-6 shadow-[0_16px_42px_rgba(72,50,31,0.05)]">
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-3">
        <span class="text-2xl text-orange-400">✦</span>
        <h2 class="text-2xl font-semibold text-stone-900">AI 总结</h2>
      </div>
      <button
        class="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-orange-200 hover:text-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        :disabled="!canGenerate"
        @click="generateSummary"
      >
        {{ isPending || pending ? '正在生成...' : summary ? '重新生成 AI 总结' : '生成 AI 总结' }}
      </button>
    </div>

    <div v-if="isPending" class="rounded-lg border border-orange-100 bg-orange-50/60 p-5 text-sm leading-7 text-stone-600">
      <p class="font-medium text-stone-800">正在整理这条记录里的模式...</p>
      <p class="mt-1">记录已经保存，你可以先查看原始内容。</p>
      <p v-if="pollCount >= maxPollCount" class="mt-3 text-stone-500">生成还在继续，稍后刷新页面就能看到结果。</p>
    </div>

    <div v-else-if="summary?.status === 'FAILED'" class="rounded-lg border border-orange-100 bg-orange-50/60 p-5 text-sm leading-7 text-stone-600">
      <p>这次没有生成成功，记录已经保存，可以稍后重试。</p>
      <p v-if="summary.errorMessage" class="mt-2 text-stone-500">{{ summary.errorMessage }}</p>
    </div>

    <div v-else-if="summary?.status === 'SUCCESS'" class="space-y-5">
      <div class="border-b border-dashed border-stone-200 pb-5">
        <h3 class="mb-2 font-semibold text-stone-900">事件摘要</h3>
        <p class="leading-7 text-stone-600">{{ summary.summary }}</p>
      </div>

      <div class="border-b border-dashed border-stone-200 pb-5">
        <h3 class="mb-3 font-semibold text-stone-900">情绪关键词</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="keyword in summary.emotionKeywords"
            :key="keyword"
            class="rounded-full bg-[#f5eee7] px-3 py-1 text-sm text-stone-600"
          >
            {{ keyword }}
          </span>
          <span v-if="summary.emotionKeywords.length === 0" class="text-sm text-stone-400">暂时没有明显关键词。</span>
        </div>
      </div>

      <div class="border-b border-dashed border-stone-200 pb-5">
        <h3 class="mb-2 font-semibold text-stone-900">消耗来源</h3>
        <p class="leading-7 text-stone-600">{{ summary.energyCostNote }}</p>
      </div>

      <div class="border-b border-dashed border-stone-200 pb-5">
        <h3 class="mb-2 font-semibold text-stone-900">建设感来源</h3>
        <p class="leading-7 text-stone-600">{{ summary.constructivenessNote }}</p>
      </div>

      <div class="rounded-lg border border-orange-100 bg-orange-50/60 p-4">
        <h3 class="mb-2 font-semibold text-stone-900">下一步建议</h3>
        <p class="leading-7 text-stone-600">{{ summary.nextAction }}</p>
      </div>
    </div>

    <div v-else class="rounded-lg border border-dashed border-stone-200 bg-stone-50/60 p-5 text-stone-500">
      这条记录还没有 AI 总结。可以生成一版，看看它如何拆出建设感和消耗来源。
    </div>

    <p v-if="error" class="mt-4 rounded-lg border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-stone-600">
      {{ error }}
    </p>
  </section>
</template>
