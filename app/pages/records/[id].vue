<script setup lang="ts">
import AppPrimaryAction from '~/components/common/AppPrimaryAction.vue'
import AppSecondaryAction from '~/components/common/AppSecondaryAction.vue'
import ConfirmDialog from '~/components/common/ConfirmDialog.vue'
import AppPageHeader from '~/components/layout/AppPageHeader.vue'
import AppSidebarNav from '~/components/layout/AppSidebarNav.vue'
import type { RecordDetailData } from '~/types/record-detail'

const route = useRoute()
const { navItems } = useAppNavigation()
const recordId = computed(() => route.params.id?.toString() ?? '')
const notice = ref('')
const deleting = ref(false)
const deleteDialogOpen = ref(false)
const deleteError = ref('')

const { data: record, error } = await useFetch<RecordDetailData>(() => `/api/records/${recordId.value}`)

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode ?? 404,
    statusMessage: error.value.statusMessage ?? 'Record not found',
  })
}

const showPlaceholder = (message: string) => {
  notice.value = message
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
</script>

<template>
  <main v-if="record" class="min-h-screen bg-[#fbfaf8] text-[#3e3630]">
    <AppSidebarNav :nav-items="navItems" />

    <div class="mx-auto max-w-[1680px] px-5 py-7 lg:pl-44 lg:pr-10">
      <AppPageHeader>
        <template #actions>
          <span class="text-sm text-stone-500">{{ record.occurredDate }}</span>
          <span class="text-sm text-stone-500">{{ record.occurredWeekday }}</span>
          <AppSecondaryAction size="sm" to="/records">
            ← 返回我的记录
          </AppSecondaryAction>
          <AppPrimaryAction size="sm" @click="showPlaceholder('编辑页还没开发，这里先保留入口。')">
            编辑记录
          </AppPrimaryAction>
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
          <section class="rounded-xl border border-stone-100 bg-white p-6 shadow-[0_16px_42px_rgba(72,50,31,0.05)]">
            <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-3">
                <span class="text-2xl text-orange-400">✦</span>
                <h2 class="text-2xl font-semibold text-stone-900">AI 总结</h2>
              </div>
              <button
                class="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm text-stone-700 transition hover:border-orange-200 hover:text-orange-500"
                type="button"
                @click="showPlaceholder('重新生成 AI 总结的真实接口还没接，这里先保留按钮。')"
              >
                ↻ 重新生成 AI 总结
              </button>
            </div>

            <div v-if="record.aiSummary" class="space-y-5">
              <div class="border-b border-dashed border-stone-200 pb-5">
                <h3 class="mb-2 font-semibold text-stone-900">事件摘要</h3>
                <p class="leading-7 text-stone-600">{{ record.aiSummary.summary }}</p>
              </div>

              <div class="border-b border-dashed border-stone-200 pb-5">
                <h3 class="mb-3 font-semibold text-stone-900">情绪关键词</h3>
                <div class="flex flex-wrap gap-2">
                  <span
                    v-for="keyword in record.aiSummary.emotionKeywords"
                    :key="keyword"
                    class="rounded-full bg-[#f5eee7] px-3 py-1 text-sm text-stone-600"
                  >
                    {{ keyword }}
                  </span>
                </div>
              </div>

              <div class="border-b border-dashed border-stone-200 pb-5">
                <h3 class="mb-2 font-semibold text-stone-900">消耗来源</h3>
                <p class="leading-7 text-stone-600">{{ record.aiSummary.energyCostNote }}</p>
              </div>

              <div class="border-b border-dashed border-stone-200 pb-5">
                <h3 class="mb-2 font-semibold text-stone-900">建设感来源</h3>
                <p class="leading-7 text-stone-600">{{ record.aiSummary.constructivenessNote }}</p>
              </div>

              <div class="rounded-lg border border-orange-100 bg-orange-50/60 p-4">
                <h3 class="mb-2 font-semibold text-stone-900">下一步建议</h3>
                <p class="leading-7 text-stone-600">{{ record.aiSummary.nextAction }}</p>
              </div>
            </div>
            <div v-else class="rounded-lg border border-dashed border-stone-200 bg-stone-50/60 p-5 text-stone-500">
              这条记录还没有 AI 总结。新建或编辑保存成功后，会由保存流程触发生成。
            </div>
          </section>

          <section class="rounded-xl border border-stone-100 bg-white p-6 shadow-[0_16px_42px_rgba(72,50,31,0.05)]">
            <div class="mb-5 flex items-center gap-3">
              <span class="text-xl text-stone-500">⚙</span>
              <h2 class="text-2xl font-semibold text-stone-900">操作</h2>
            </div>
            <div class="grid gap-3 sm:grid-cols-2">
              <button
                class="rounded-lg border border-stone-200 bg-white px-5 py-3 text-stone-700 transition hover:border-orange-200 hover:text-orange-500"
                type="button"
                @click="showPlaceholder('编辑页还没开发，这里先保留入口。')"
              >
                编辑记录
              </button>
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

          <p v-if="notice" class="rounded-xl border border-orange-100 bg-orange-50 px-5 py-4 text-sm text-stone-600">
            {{ notice }}
          </p>

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
