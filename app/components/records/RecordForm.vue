<script setup lang="ts">
import { VueDatePicker } from '@vuepic/vue-datepicker'
import type { RecordCategory } from '@prisma/client'
import RecordTagInput from './RecordTagInput.vue'
import type { RecordFormValue } from '~/types/record-form'
import '@vuepic/vue-datepicker/dist/main.css'
import '@vueform/multiselect/themes/default.css'

const props = withDefaults(
  defineProps<{
    initialValue?: Partial<RecordFormValue>
    pending?: boolean
    submitLabel?: string
    tagOptions?: string[]
  }>(),
  {
    initialValue: undefined,
    pending: false,
    submitLabel: '保存记录',
    tagOptions: () => [],
  },
)

const emit = defineEmits<{
  submit: [value: RecordFormValue]
  cancel: []
}>()

const maxTitleLength = 80
const maxContentLength = 2000
const maxTagCount = 12
const maxTagLength = 20
type FieldKey = 'title' | 'content' | 'scores' | 'tags' | 'occurredAt'

const fieldErrors = reactive<Record<FieldKey, string>>({
  title: '',
  content: '',
  scores: '',
  tags: '',
  occurredAt: '',
})

const fieldRefs: Record<FieldKey, Ref<HTMLElement | null>> = {
  title: ref(null),
  content: ref(null),
  scores: ref(null),
  tags: ref(null),
  occurredAt: ref(null),
}

const categoryOptions: Array<{ label: string; value: RecordCategory; icon: string }> = [
  { label: '职业', value: 'WORK', icon: '▱' },
  { label: '关系', value: 'RELATIONSHIP', icon: '♧' },
  { label: '情绪', value: 'EMOTION', icon: '☺' },
  { label: '学习', value: 'STUDY', icon: '▤' },
  { label: '生活', value: 'LIFE', icon: '⌂' },
  { label: '项目', value: 'PROJECT', icon: '⚑' },
  { label: '健康', value: 'HEALTH', icon: '♡' },
  { label: '社交', value: 'SOCIAL', icon: '↔' },
  { label: '其他', value: 'OTHER', icon: '○' },
]

const scoreGroups = [
  { key: 'moodScore', label: '心情评分', icon: '☺', tone: 'text-orange-500' },
  { key: 'constructivenessScore', label: '真实建设感评分', icon: '↗', tone: 'text-green-600' },
  { key: 'energyCostScore', label: '消耗程度评分', icon: '◔', tone: 'text-cyan-600' },
] as const

const form = reactive<RecordFormValue>({
  title: props.initialValue?.title ?? '',
  content: props.initialValue?.content ?? '',
  category: props.initialValue?.category ?? 'WORK',
  moodScore: props.initialValue?.moodScore ?? 3,
  constructivenessScore: props.initialValue?.constructivenessScore ?? 3,
  energyCostScore: props.initialValue?.energyCostScore ?? 2,
  tags: [...(props.initialValue?.tags ?? [])],
  occurredAt: props.initialValue?.occurredAt ?? new Date(),
})

const titleLength = computed(() => form.title.trim().length)
const contentLength = computed(() => form.content.length)
const contentOverLimit = computed(() => contentLength.value > maxContentLength)
const normalizedTags = computed(() => form.tags.map((tag) => tag.trim()).filter(Boolean))
const tagsOverLimit = computed(() => normalizedTags.value.length > maxTagCount)
const tagLengthOverLimit = computed(() => normalizedTags.value.some((tag) => tag.length > maxTagLength))
const scoreValues = [0, 1, 2, 3, 4, 5]
const isValidScore = (value: number) => Number.isInteger(value) && value >= 0 && value <= 5

const clearFieldErrors = () => {
  Object.keys(fieldErrors).forEach((key) => {
    fieldErrors[key as FieldKey] = ''
  })
}

const setFieldError = (field: FieldKey, message: string) => {
  fieldErrors[field] = message

  nextTick(() => {
    fieldRefs[field].value?.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })
  })
}

const clearTextFieldError = (field: 'title' | 'content', value: string) => {
  if (value.trim()) {
    fieldErrors[field] = ''
  }
}

const submit = () => {
  clearFieldErrors()

  if (!form.title.trim()) {
    setFieldError('title', '先给这条记录起一个标题。')
    return
  }

  if (titleLength.value > maxTitleLength) {
    setFieldError('title', `标题最多可以写 ${maxTitleLength} 个字。`)
    return
  }

  if (!form.content.trim()) {
    setFieldError('content', '写下一点内容就可以，不需要一次写完整。')
    return
  }

  if (contentOverLimit.value) {
    setFieldError('content', `内容最多可以写 ${maxContentLength} 个字。`)
    return
  }

  if (!isValidScore(form.moodScore) || !isValidScore(form.constructivenessScore) || !isValidScore(form.energyCostScore)) {
    setFieldError('scores', '评分需要在 0 到 5 之间。')
    return
  }

  const tags = normalizedTags.value

  if (tagsOverLimit.value) {
    setFieldError('tags', `标签最多选择 ${maxTagCount} 个。`)
    return
  }

  if (tagLengthOverLimit.value) {
    setFieldError('tags', `单个标签最多 ${maxTagLength} 个字。`)
    return
  }

  if (!form.occurredAt || Number.isNaN(form.occurredAt.getTime())) {
    setFieldError('occurredAt', '请选择有效的发生时间。')
    return
  }

  emit('submit', {
    ...form,
    title: form.title.trim(),
    content: form.content.trim(),
    tags,
  })
}
</script>

<template>
  <form
    class="rounded-xl border border-stone-100 bg-white p-6 shadow-[0_16px_42px_rgba(72,50,31,0.05)]"
    @submit.prevent="submit"
  >
    <div class="space-y-7">
      <label :ref="fieldRefs.title" class="block scroll-mt-8">
        <span class="mb-3 block font-semibold text-stone-900">标题</span>
        <div class="relative">
          <input
            v-model="form.title"
            class="h-12 w-full rounded-lg border bg-white px-4 pr-24 text-stone-800 outline-none transition placeholder:text-stone-400 focus:ring-4"
            :class="
              fieldErrors.title
                ? 'border-red-200 focus:border-red-200 focus:ring-red-50'
                : 'border-stone-200 focus:border-orange-200 focus:ring-orange-50'
            "
            placeholder="给这条记录起个标题"
            type="text"
            autocomplete="off"
            @input="clearTextFieldError('title', form.title)"
          >
          <span
            class="absolute right-4 top-1/2 -translate-y-1/2 text-sm"
            :class="titleLength > maxTitleLength ? 'text-red-500' : 'text-stone-400'"
          >
            {{ titleLength }} / {{ maxTitleLength }}
          </span>
        </div>
        <p v-if="fieldErrors.title" class="mt-2 text-sm text-red-500">
          {{ fieldErrors.title }}
        </p>
      </label>

      <section>
        <h2 class="mb-3 font-semibold text-stone-900">分类</h2>
        <div class="flex flex-wrap gap-3">
          <button
            v-for="category in categoryOptions"
            :key="category.value"
            class="inline-flex min-w-32 items-center justify-center gap-3 rounded-lg border px-5 py-3 text-sm transition"
            :class="
              form.category === category.value
                ? 'border-orange-300 bg-orange-50 text-orange-600'
                : 'border-stone-200 bg-white text-stone-600 hover:border-orange-100 hover:text-orange-500'
            "
            type="button"
            @click="form.category = category.value"
          >
            <span>{{ category.icon }}</span>
            <span>{{ category.label }}</span>
          </button>
        </div>
      </section>

      <label :ref="fieldRefs.content" class="block scroll-mt-8">
        <span class="mb-3 block font-semibold text-stone-900">内容</span>
        <div class="relative">
          <textarea
            v-model="form.content"
            class="min-h-48 w-full resize-none rounded-lg border bg-stone-50/40 px-4 py-4 pb-12 leading-7 text-stone-800 outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:bg-white focus:ring-4"
            :class="
              fieldErrors.content
                ? 'border-red-200 focus:border-red-200 focus:ring-red-50'
                : 'border-stone-200 focus:border-orange-200 focus:ring-orange-50'
            "
            placeholder="今天发生了什么？什么让我有前进，什么又只是消耗？"
            @input="clearTextFieldError('content', form.content)"
          />
          <span
            class="absolute bottom-4 right-4 text-sm"
            :class="contentOverLimit ? 'text-red-500' : 'text-stone-400'"
          >
            {{ contentLength }} / {{ maxContentLength }}
          </span>
        </div>
        <p v-if="fieldErrors.content" class="mt-2 text-sm text-red-500">
          {{ fieldErrors.content }}
        </p>
      </label>

      <section :ref="fieldRefs.scores" class="grid scroll-mt-8 gap-5 xl:grid-cols-3">
        <div
          v-for="score in scoreGroups"
          :key="score.key"
          class="border-stone-100 xl:border-r xl:pr-5 last:xl:border-r-0"
        >
          <h3 class="mb-3 flex items-center gap-2 font-semibold text-stone-800">
            <span :class="score.tone">{{ score.icon }}</span>
            {{ score.label }}
          </h3>
          <div class="grid grid-cols-6 overflow-hidden rounded-lg border border-stone-200">
            <button
              v-for="value in scoreValues"
              :key="value"
              class="h-11 border-r border-stone-100 text-sm transition last:border-r-0"
              :class="
                form[score.key] === value
                  ? 'bg-orange-50 font-semibold text-orange-600'
                  : 'bg-white text-stone-700 hover:bg-stone-50'
              "
              type="button"
              @click="form[score.key] = value"
            >
              {{ value }}
            </button>
          </div>
        </div>
        <p v-if="fieldErrors.scores" class="text-sm text-red-500 xl:col-span-3">
          {{ fieldErrors.scores }}
        </p>
      </section>

      <label :ref="fieldRefs.tags" class="block scroll-mt-8">
        <span class="mb-3 flex flex-wrap items-center justify-between gap-2">
          <span class="font-semibold text-stone-900">标签</span>
          <span
            class="text-sm"
            :class="tagsOverLimit || tagLengthOverLimit ? 'text-red-500' : 'text-stone-400'"
          >
            已选 {{ normalizedTags.length }} / {{ maxTagCount }}，单个最多 {{ maxTagLength }} 字
          </span>
        </span>
        <RecordTagInput v-model:tags="form.tags" :options="tagOptions" />
        <p v-if="fieldErrors.tags" class="mt-2 text-sm text-red-500">
          {{ fieldErrors.tags }}
        </p>
      </label>

      <div :ref="fieldRefs.occurredAt" class="scroll-mt-8 border-t border-stone-100 pt-5">
        <label class="flex flex-col gap-3 text-sm text-stone-600 sm:flex-row sm:items-center">
          <span class="font-semibold text-stone-800">发生时间</span>
          <ClientOnly>
            <VueDatePicker
              v-model="form.occurredAt"
              class="max-w-72"
              format="yyyy/MM/dd HH:mm"
              :enable-seconds="false"
              :clearable="false"
            />
            <template #fallback>
              <div class="h-10 w-72 rounded-lg border border-stone-200 bg-white" />
            </template>
          </ClientOnly>
        </label>
        <p v-if="fieldErrors.occurredAt" class="mt-2 text-sm text-red-500">
          {{ fieldErrors.occurredAt }}
        </p>
      </div>

      <div class="flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
        <button
          class="rounded-lg border border-stone-200 bg-white px-10 py-3 text-stone-700 transition hover:border-orange-100 hover:text-orange-500"
          type="button"
          :disabled="pending"
          @click="emit('cancel')"
        >
          取消
        </button>
        <button
          class="rounded-lg bg-orange-400 px-10 py-3 font-medium text-white shadow-sm transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          :disabled="pending"
        >
          {{ pending ? '保存中...' : submitLabel }}
        </button>
      </div>
    </div>
  </form>
</template>
