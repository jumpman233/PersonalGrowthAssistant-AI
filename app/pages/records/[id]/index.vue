<script setup lang="ts">
import AppSecondaryAction from '~/components/common/AppSecondaryAction.vue'
import ConfirmDialog from '~/components/common/ConfirmDialog.vue'
import SuccessDialog from '~/components/common/SuccessDialog.vue'
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
const successDialog = ref({
  open: route.query.notice === 'created' || route.query.notice === 'updated',
  title: route.query.notice === 'updated' ? '修改成功' : '新增成功',
  description:
    route.query.notice === 'updated'
      ? '这条记录已经更新，新的内容会用于后续复盘。'
      : '这条记录已经保存，接下来可以查看详情和 AI 总结。',
})

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
    await navigateTo('/records?notice=deleted')
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

const closeSuccessDialog = () => {
  successDialog.value.open = false

  if (route.query.notice === 'created' || route.query.notice === 'updated') {
    const query = { ...route.query }
    delete query.notice
    void router.replace({ path: route.path, query })
  }
}
</script>

<template>
  <main v-if="record" class="min-h-screen bg-[#fbfaf8] text-[#3e3630]">
    <AppSidebarNav :nav-items="navItems" />

    <div class="mx-auto max-w-[1680px] px-5 py-7 md:pl-44 lg:pr-10">
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
              <h1 class="text-[30px] font-semibold leading-[1.18] text-stone-900 md:text-5xl md:leading-tight">{{ record.title }}</h1>
              <div class="flex flex-wrap items-center gap-4 text-sm text-stone-500">
                <span class="rounded-full bg-cyan-50 px-4 py-1 text-cyan-700">{{ record.category.label }}</span>
                <span>{{ record.occurredAt }}</span>
              </div>
              <p class="text-sm text-stone-500 md:text-base">看看这条记录里，什么真正推动了你。</p>
            </div>
          </div>

          <section class="rounded-xl border border-stone-100 bg-white p-6 shadow-[0_16px_42px_rgba(72,50,31,0.05)]">
            <div class="mb-5 flex items-center gap-3">
              <span class="grid size-10 place-items-center rounded-full bg-orange-50 text-orange-500">▦</span>
              <h2 class="text-xl font-semibold text-stone-900 md:text-2xl">原始记录</h2>
            </div>
            <p class="whitespace-pre-line text-sm leading-6 text-stone-700 md:text-base md:leading-8">{{ record.content }}</p>
          </section>

          <section class="rounded-xl border border-stone-100 bg-white p-4 shadow-[0_12px_30px_rgba(72,50,31,0.04)] md:p-6">
            <div class="mb-3 flex items-center gap-2 md:mb-5 md:gap-3">
              <span class="grid size-8 place-items-center rounded-full bg-orange-50 text-sm text-orange-500 md:size-10 md:text-base">↗</span>
              <h2 class="text-lg font-semibold text-stone-900 md:text-2xl">评分</h2>
            </div>
            <div class="grid grid-cols-3 overflow-hidden rounded-lg border border-stone-100 bg-[#fffdfb] md:gap-4 md:overflow-visible md:border-0 md:bg-transparent">
              <div
                v-for="score in record.scores"
                :key="score.label"
                class="flex min-w-0 flex-col items-center justify-center border-r border-stone-100 px-2 py-3 text-center last:border-r-0 md:flex-row md:justify-start md:gap-4 md:rounded-lg md:border md:border-stone-100 md:bg-white md:p-5 md:text-left md:last:border"
              >
                <span class="grid size-7 place-items-center rounded-full text-base md:size-14 md:text-3xl" :class="score.tone">
                  {{ score.icon }}
                </span>
                <span class="flex min-w-0 flex-col items-center md:items-start">
                  <span class="mt-1 block w-full truncate text-xs font-medium text-stone-500 md:mt-0 md:text-sm">
                    {{ score.label }}
                  </span>
                  <span class="mt-0.5 whitespace-nowrap text-sm font-semibold text-stone-900 md:text-[30px]">
                    {{ score.value }}
                    <span class="font-normal text-stone-400">/ 5</span>
                  </span>
                </span>
              </div>
            </div>
          </section>

          <section class="rounded-xl border border-stone-100 bg-white p-6 shadow-[0_16px_42px_rgba(72,50,31,0.05)]">
            <div class="mb-5 flex items-center gap-3">
              <span class="grid size-10 place-items-center rounded-full bg-orange-50 text-orange-500">●</span>
              <h2 class="text-xl font-semibold text-stone-900 md:text-2xl">标签</h2>
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
              <h2 class="text-xl font-semibold text-stone-900 md:text-2xl">操作</h2>
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
            class="rounded-xl border border-stone-100 bg-[linear-gradient(110deg,#fff,#fff8f1)] p-5 text-sm leading-6 text-stone-600 shadow-[0_16px_42px_rgba(72,50,31,0.04)] md:p-6 md:text-base md:leading-8"
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
    <SuccessDialog
      :open="successDialog.open"
      :title="successDialog.title"
      :description="successDialog.description"
      @close="closeSuccessDialog"
    />
  </main>
</template>
