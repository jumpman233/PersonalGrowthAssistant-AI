<script setup lang="ts">
import AppSecondaryAction from '~/components/common/AppSecondaryAction.vue'
import ConfirmDialog from '~/components/common/ConfirmDialog.vue'
import AppPageHeader from '~/components/layout/AppPageHeader.vue'
import AppSidebarNav from '~/components/layout/AppSidebarNav.vue'
import RecordAiSummaryPanel from '~/components/records/RecordAiSummaryPanel.vue'
import type { RecordDetailData } from '~/types/record-detail'

const route = useRoute()
const router = useRouter()
const { navItems } = useAppNavigation()
const recordId = computed(() => route.params.id?.toString() ?? '')
const deleting = ref(false)
const deleteDialogOpen = ref(false)
const deleteError = ref('')
const shouldAutoGenerateAi = computed(() => route.query.generateAi === '1')

const { data: record, error } = await useFetch<RecordDetailData>(() => `/api/records/${recordId.value}`)

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 404,
    statusMessage: error.value.statusMessage ?? 'Record not found',
  })
}

const deleteRecord = async () => {
  if (!record.value || deleting.value) {
    return
  }

  deleting.value = true
  deleteError.value = ''

  try {
    await $fetch(`/api/records/${record.value.id}`, {
      method: 'DELETE',
    })
    await navigateTo('/records')
  } catch {
    deleteError.value = '删除没有成功，可以稍后再试。'
  } finally {
    deleting.value = false
  }
}

const openDeleteDialog = () => {
  deleteError.value = ''
  deleteDialogOpen.value = true
}

const closeDeleteDialog = () => {
  if (!deleting.value) {
    deleteDialogOpen.value = false
    deleteError.value = ''
  }
}

const clearAutoGenerateQuery = () => {
  if (!shouldAutoGenerateAi.value) {
    return
  }

  const query = { ...route.query }
  delete query.generateAi
  void router.replace({ path: route.path, query })
}
</script>

<template>
  <main v-if="record" class="min-h-screen bg-[#fbfaf8] text-[#3e3630]">
    <AppSidebarNav :nav-items="navItems" />

    <div class="mx-auto max-w-[1680px] px-5 py-7 lg:pl-44 lg:pr-10">
      <AppPageHeader :show-new-record="false" :show-weekly-review="false">
        <template #actions>
          <span class="text-sm text-stone-500">{{ record.occurredDate }}</span>
          <span class="text-sm text-stone-500">{{ record.occurredWeekday }}</span>
          <AppSecondaryAction size="sm" to="/records">
            ← 返回我的记录
          </AppSecondaryAction>
          <NuxtLink
            class="rounded-lg border border-stone-200 bg-white px-5 py-3 text-sm font-medium text-stone-700 shadow-sm transition hover:border-orange-200 hover:text-orange-500"
            :to="`/records/${record.id}/edit`"
          >
            编辑记录
          </NuxtLink>
        </template>
      </AppPageHeader>

      <div class="grid gap-7 pt-7 xl:grid-cols-[minmax(0,1fr)_minmax(360px,600px)]">
        <section class="min-w-0 space-y-6">
          <div class="space-y-5">
            <NuxtLink class="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-orange-500" to="/records">
              ← 记录详情
            </NuxtLink>
            <div class="space-y-3">
              <h1 class="text-4xl font-semibold leading-tight text-stone-900 md:text-5xl">{{ record.title }}</h1>
              <div class="flex flex-wrap items-center gap-4 text-sm text-stone-500">
                <span class="rounded-full bg-cyan-50 px-4 py-1 text-cyan-700">{{ record.category.label }}</span>
                <span>{{ record.occurredAt }}</span>
              </div>
              <p class="text-base text-stone-500">看看这条记录里，什么真正推动了你。</p>
            </div>
          </div>

          <section class="rounded-xl border border-stone-100 bg-white p-6 shadow-[0_16px_42px_rgba(72,50,31,0.05)]">
            <div class="mb-5 flex items-center gap-3">
              <span class="grid size-10 place-items-center rounded-full bg-orange-50 text-orange-500">▦</span>
              <h2 class="text-2xl font-semibold text-stone-900">原始记录</h2>
            </div>
            <p class="whitespace-pre-line text-base leading-8 text-stone-700">{{ record.content }}</p>
          </section>

          <section class="rounded-xl border border-stone-100 bg-white p-6 shadow-[0_16px_42px_rgba(72,50,31,0.05)]">
            <div class="mb-5 flex items-center gap-3">
              <span class="grid size-10 place-items-center rounded-full bg-orange-50 text-orange-500">↗</span>
              <h2 class="text-2xl font-semibold text-stone-900">评分</h2>
            </div>
            <div class="grid gap-4 md:grid-cols-3">
              <div
                v-for="score in record.scores"
                :key="score.label"
                class="flex items-center gap-4 rounded-lg border border-stone-100 bg-white p-5"
              >
                <span class="grid size-14 place-items-center rounded-full text-3xl" :class="score.tone">
                  {{ score.icon }}
                </span>
                <span>
                  <span class="block text-sm text-stone-500">{{ score.label }}</span>
                  <span class="text-3xl font-semibold text-stone-900">{{ score.value }}</span>
                  <span class="ml-1 text-stone-400">/ 5</span>
                </span>
              </div>
            </div>
          </section>

          <section class="rounded-xl border border-stone-100 bg-white p-6 shadow-[0_16px_42px_rgba(72,50,31,0.05)]">
            <div class="mb-5 flex items-center gap-3">
              <span class="grid size-10 place-items-center rounded-full bg-orange-50 text-orange-500">●</span>
              <h2 class="text-2xl font-semibold text-stone-900">标签</h2>
            </div>
            <div class="flex flex-wrap gap-3">
              <span
                v-for="tag in record.tags"
                :key="tag"
                class="rounded-full bg-[#f5eee7] px-4 py-2 text-sm text-stone-600"
              >
                {{ tag }}
              </span>
              <span v-if="record.tags.length === 0" class="text-sm text-stone-400">还没有标签。</span>
            </div>
          </section>
        </section>

        <aside class="space-y-5">
          <RecordAiSummaryPanel
            :record-id="record.id"
            :initial-summary="record.aiSummary"
            :auto-generate="shouldAutoGenerateAi"
            @auto-generate-handled="clearAutoGenerateQuery"
          />

          <section class="rounded-xl border border-stone-100 bg-white p-6 shadow-[0_16px_42px_rgba(72,50,31,0.05)]">
            <div class="mb-5 flex items-center gap-3">
              <span class="text-xl text-stone-500">⚙</span>
              <h2 class="text-2xl font-semibold text-stone-900">操作</h2>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <NuxtLink
                class="rounded-lg border border-stone-200 bg-white px-5 py-3 text-center text-sm font-medium text-stone-700 shadow-sm transition hover:border-orange-200 hover:text-orange-500"
                :to="`/records/${record.id}/edit`"
              >
                编辑记录
              </NuxtLink>
              <button
                class="rounded-lg border border-red-100 bg-red-50 px-5 py-3 text-red-500 transition hover:border-red-200 hover:bg-red-100 disabled:opacity-60"
                type="button"
                :disabled="deleting"
                @click="openDeleteDialog"
              >
                {{ deleting ? '删除中...' : '删除记录' }}
              </button>
            </div>
          </section>

          <section
            class="rounded-xl border border-stone-100 bg-[linear-gradient(110deg,#fff,#fff8f1)] p-6 text-base leading-8 text-stone-600 shadow-[0_16px_42px_rgba(72,50,31,0.04)]"
          >
            不急着一次看懂全部。<br>
            改过一处，才会真正接管一处。
          </section>
        </aside>
      </div>
    </div>

    <ConfirmDialog
      :open="deleteDialogOpen"
      title="删除这条记录？"
      description="删除后它不会再出现在列表和统计里。这个操作不能撤销。"
      cancel-label="再想想"
      confirm-label="删除记录"
      :pending="deleting"
      :error="deleteError"
      @close="closeDeleteDialog"
      @confirm="deleteRecord"
    />
  </main>
</template>
