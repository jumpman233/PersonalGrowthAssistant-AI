<script setup lang="ts">
import AppSecondaryAction from '~/components/common/AppSecondaryAction.vue'
import AppPageHeader from '~/components/layout/AppPageHeader.vue'
import AppSidebarNav from '~/components/layout/AppSidebarNav.vue'
import RecordForm from '~/components/records/RecordForm.vue'
import RecordFormAside from '~/components/records/RecordFormAside.vue'
import type { RecordDetailData } from '~/types/record-detail'
import type { RecordFormValue, UpdateRecordPayload, UpdateRecordResponse } from '~/types/record-form'
import { getDurationMs, getErrorMessage, getErrorStatusCode, nowMs, trackEvent } from '~/utils/clientTelemetry'

const route = useRoute()
const { navItems } = useAppNavigation()
const recordId = computed(() => route.params.id?.toString() ?? '')
const pending = ref(false)
const error = ref('')
const { requestSuggestedTags, suggestedTags, suggestTagsError, suggestTagsPending } = useAiTagSuggestions()

const { data: record, error: fetchError } = await useFetch<RecordDetailData>(() => `/api/records/${recordId.value}`)

if (fetchError.value || !record.value) {
  throw createError({
    statusCode: fetchError.value?.statusCode ?? 404,
    statusMessage: fetchError.value?.statusMessage ?? 'Record not found',
  })
}

const initialFormValue = computed<Partial<RecordFormValue>>(() => {
  const value = record.value.formValue

  return {
    ...value,
    occurredAt: new Date(value.occurredAt),
  }
})

const { data: tagOptions } = await useFetch<string[]>('/api/tags', {
  default: () => [],
})

const toPayload = (value: RecordFormValue): UpdateRecordPayload => ({
  title: value.title,
  content: value.content,
  category: value.category,
  moodScore: value.moodScore,
  constructivenessScore: value.constructivenessScore,
  energyCostScore: value.energyCostScore,
  tags: value.tags,
  occurredAt: value.occurredAt.toISOString(),
})

const submit = async (value: RecordFormValue) => {
  if (pending.value) {
    return
  }

  pending.value = true
  error.value = ''
  const startTime = nowMs()

  try {
    const updatedRecord = await $fetch<UpdateRecordResponse>(`/api/records/${recordId.value}`, {
      method: 'PATCH',
      body: toPayload(value),
    })
    const telemetryPayload = {
      durationMs: getDurationMs(startTime),
      success: true,
      requestPath: '/api/records/:id',
      target: 'record_update',
    }

    trackEvent('record_update_duration', telemetryPayload)
    trackEvent('record_save_duration', {
      ...telemetryPayload,
      mode: 'update',
    })

    await navigateTo(`/records/${updatedRecord.id}?generateAi=1&notice=updated`)
  } catch (requestError) {
    const telemetryPayload = {
      durationMs: getDurationMs(startTime),
      success: false,
      requestPath: '/api/records/:id',
      statusCode: getErrorStatusCode(requestError),
      reason: getErrorMessage(requestError),
      target: 'record_update',
    }

    trackEvent('record_update_duration', telemetryPayload)
    trackEvent('record_save_duration', {
      ...telemetryPayload,
      mode: 'update',
    })
    error.value = '这次没有保存成功，可以稍后再试。'
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <main class="min-h-screen bg-[#fbfaf8] text-[#3e3630]">
    <AppSidebarNav :nav-items="navItems" />

    <div class="mx-auto max-w-[1680px] px-5 py-7 lg:pl-44 lg:pr-10">
      <AppPageHeader :show-new-record="false">
        <template #actions>
          <span class="text-sm text-stone-500">{{ record.occurredDate }}</span>
          <AppSecondaryAction size="sm" :to="`/records/${record.id}`">← 返回记录详情</AppSecondaryAction>
        </template>
      </AppPageHeader>

      <div class="grid gap-7 pt-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,520px)]">
        <section class="min-w-0 space-y-6">
          <div>
            <h1 class="text-4xl font-semibold leading-tight text-stone-900 md:text-5xl">编辑这条记录</h1>
            <p class="mt-3 text-base text-stone-500">把不准确的地方调回来，让这条记录更贴近真实发生的样子。</p>
          </div>

          <p v-if="error" class="rounded-xl border border-orange-100 bg-orange-50 px-5 py-4 text-sm text-stone-600">
            {{ error }}
          </p>

          <p
            v-if="record.aiSummary"
            class="rounded-xl border border-orange-100 bg-orange-50 px-5 py-4 text-sm leading-6 text-stone-600"
          >
            这条记录已有 AI 总结。保存修改后，旧总结会先保留；如果内容变化较大，可以之后重新生成。
          </p>

          <RecordForm
            :key="record.id"
            submit-label="保存修改"
            :pending="pending"
            :suggest-tags-pending="suggestTagsPending"
            :suggest-tags-error="suggestTagsError"
            :suggested-tags="suggestedTags"
            :tag-options="tagOptions"
            :initial-value="initialFormValue"
            @submit="submit"
            @cancel="navigateTo(`/records/${record.id}`)"
            @suggest-tags="requestSuggestedTags"
          />
        </section>

        <RecordFormAside mode="edit" />
      </div>
    </div>
  </main>
</template>
