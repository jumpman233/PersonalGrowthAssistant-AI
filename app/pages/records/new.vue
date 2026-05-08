<script setup lang="ts">
import type { RecordCategory } from '@prisma/client'
import AppSecondaryAction from '~/components/common/AppSecondaryAction.vue'
import AppPageHeader from '~/components/layout/AppPageHeader.vue'
import AppSidebarNav from '~/components/layout/AppSidebarNav.vue'
import RecordFormAside from '~/components/records/RecordFormAside.vue'
import RecordForm from '~/components/records/RecordForm.vue'
import type { CreateRecordPayload, CreateRecordResponse, RecordFormValue } from '~/types/record-form'

const { navItems } = useAppNavigation()
const router = useRouter()
const route = useRoute()
const pending = ref(false)
const error = ref('')
const { requestSuggestedTags, suggestedTags, suggestTagsError, suggestTagsPending } = useAiTagSuggestions()

const todayLabel = computed(() =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date()),
)

const recordCategories: RecordCategory[] = [
  'WORK',
  'RELATIONSHIP',
  'EMOTION',
  'STUDY',
  'LIFE',
  'PROJECT',
  'HEALTH',
  'SOCIAL',
  'OTHER',
]

const initialCategory = computed<RecordCategory>(() => {
  const category = route.query.category

  if (typeof category === 'string' && recordCategories.includes(category as RecordCategory)) {
    return category as RecordCategory
  }

  return 'WORK'
})

const initialFormValue = computed<Partial<RecordFormValue>>(() => ({
  category: initialCategory.value,
}))

const { data: tagOptions } = await useFetch<string[]>('/api/tags', {
  default: () => [],
})

const toPayload = (value: RecordFormValue): CreateRecordPayload => ({
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

  try {
    const record = await $fetch<CreateRecordResponse>('/api/records', {
      method: 'POST',
      body: toPayload(value),
    })

    await navigateTo(`/records/${record.id}?generateAi=1`)
  } catch {
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
          <span class="text-sm text-stone-500">{{ todayLabel }}</span>
          <AppSecondaryAction size="sm" to="/records">
            ← 返回我的记录
          </AppSecondaryAction>
        </template>
      </AppPageHeader>

      <div class="grid gap-7 pt-8 xl:grid-cols-[minmax(0,1fr)_minmax(320px,520px)]">
        <section class="min-w-0 space-y-6">
          <div>
            <h1 class="text-4xl font-semibold leading-tight text-stone-900 md:text-5xl">今天想记录什么？</h1>
            <p class="mt-3 text-base text-stone-500">写下一件今天真正推动你，或者明显消耗你的事。</p>
          </div>

          <p v-if="error" class="rounded-xl border border-orange-100 bg-orange-50 px-5 py-4 text-sm text-stone-600">
            {{ error }}
          </p>

          <RecordForm
            :key="initialCategory"
            submit-label="保存记录"
            :pending="pending"
            :suggest-tags-pending="suggestTagsPending"
            :suggest-tags-error="suggestTagsError"
            :suggested-tags="suggestedTags"
            :tag-options="tagOptions"
            :initial-value="initialFormValue"
            @submit="submit"
            @cancel="router.push('/records')"
            @suggest-tags="requestSuggestedTags"
          />
        </section>

        <RecordFormAside />
      </div>
    </div>
  </main>
</template>
