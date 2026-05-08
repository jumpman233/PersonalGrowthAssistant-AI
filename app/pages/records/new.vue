<script setup lang="ts">
import type { RecordCategory } from '@prisma/client'
import AppSecondaryAction from '~/components/common/AppSecondaryAction.vue'
import AppPageHeader from '~/components/layout/AppPageHeader.vue'
import AppSidebarNav from '~/components/layout/AppSidebarNav.vue'
import RecordForm from '~/components/records/RecordForm.vue'
import type { CreateRecordPayload, CreateRecordResponse, RecordFormValue } from '~/types/record-form'

const { navItems } = useAppNavigation()
const router = useRouter()
const route = useRoute()
const pending = ref(false)
const error = ref('')

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

    await navigateTo(`/records/${record.id}`)
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
            :tag-options="tagOptions"
            :initial-value="initialFormValue"
            @submit="submit"
            @cancel="router.push('/records')"
          />
        </section>

        <aside class="space-y-6">
          <section class="rounded-xl border border-stone-100 bg-white p-6 shadow-[0_16px_42px_rgba(72,50,31,0.05)]">
            <div class="mb-5 flex items-center gap-3">
              <span class="grid size-10 place-items-center rounded-full bg-orange-50 text-orange-500">♡</span>
              <h2 class="text-xl font-semibold text-stone-900">写之前可以想想</h2>
            </div>

            <div class="space-y-3">
              <article
                v-for="hint in [
                  '哪些事情让我觉得有推进？',
                  '哪些事情只是消耗？',
                  '我今天有没有把自己逼太紧？',
                  '明天最小行动是什么？',
                ]"
                :key="hint"
                class="flex items-center justify-between rounded-lg border border-stone-100 bg-white px-5 py-4 text-stone-600"
              >
                <span>{{ hint }}</span>
                <span class="text-stone-400">→</span>
              </article>
            </div>
          </section>

          <section
            class="rounded-xl border border-stone-100 bg-[linear-gradient(110deg,#fff,#fff8f1)] p-7 shadow-[0_16px_42px_rgba(72,50,31,0.04)]"
          >
            <h2 class="mb-4 text-xl font-semibold text-stone-900">温和提醒</h2>
            <p class="leading-8 text-stone-600">
              先记下来，不急着一次想清全部。<br>
              看见一点真实推进，就已经很好。
            </p>
            <p class="mt-6 rounded-lg bg-white/70 px-4 py-3 text-sm text-stone-500">
              AI 总结将在后续版本中接入，当前先保证记录链路稳定。
            </p>
          </section>
        </aside>
      </div>
    </div>
  </main>
</template>
