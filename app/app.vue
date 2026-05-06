<script setup lang="ts">
const navItems = ['x', '◐', '▤', '♡', '+', '⇄', '▣', 'ⓘ', '⌑']

const stats = [
  {
    label: '本周记录',
    value: '6',
    note: '持续记录的每一步都很重要',
    icon: '▣',
    tone: 'from-orange-100 to-rose-50 text-orange-500',
  },
  {
    label: '平均建设感',
    value: '3.8',
    note: '分辨什么在真正建设你',
    icon: '⌁',
    tone: 'from-amber-100 to-orange-50 text-amber-600',
  },
  {
    label: '平均消耗',
    value: '2.6',
    note: '识别消耗，保护你的能量',
    icon: '◔',
    tone: 'from-cyan-100 to-teal-50 text-cyan-600',
  },
  {
    label: '情绪稳定度',
    value: '4.1',
    note: '稳住情绪，才能走得更远',
    icon: '♡',
    tone: 'from-rose-100 to-orange-50 text-rose-500',
  },
]

const quickRecords = [
  {
    title: '职业复盘',
    copy: '记录工作与成长，识别真正有价值的推进。',
    icon: '▤',
    tone: 'bg-cyan-50 text-cyan-700',
  },
  {
    title: '关系复盘',
    copy: '梳理互动与感受，经营真实而健康的关系。',
    icon: '♧',
    tone: 'bg-green-50 text-green-700',
  },
  {
    title: '情绪复盘',
    copy: '觉察情绪起伏，理解自己，找回内在锚点。',
    icon: '♡',
    tone: 'bg-rose-50 text-rose-600',
  },
]

const records = [
  {
    title: '用 Nuxt 自动作品项目',
    category: '职业',
    copy: '搭建项目框架与核心功能，梳理模块化方案，完成首页和导航，感受到清晰的推进感。',
    score: '建设感 4 / 消耗 2',
    time: '5月20日 10:32',
    tags: ['AI开发', '输出实效', '长期项目'],
    icon: '▱',
    tone: 'bg-orange-50 text-orange-500',
  },
  {
    title: '朋友新群聚会 AI 小工具 AI',
    category: '关系',
    copy: '分享阶段性想法和进展，收到一些反馈和建议，感觉连接和支持都在。',
    score: '建设感 3 / 消耗 2',
    time: '5月19日 21:15',
    tags: ['分享', '无压力交流', '连接'],
    icon: '♧',
    tone: 'bg-green-50 text-green-600',
  },
  {
    title: '一个人打球',
    category: '情绪',
    copy: '下班后去球场打了一个小时，出汗后情绪平稳了很多，脑子也清空了。',
    score: '建设感 4 / 消耗 3',
    time: '5月19日 19:02',
    tags: ['运动', '独处', '恢复节奏'],
    icon: '⌁',
    tone: 'bg-rose-50 text-rose-500',
  },
]

const trend = [
  { day: '周一', growth: 3.9, drain: 2.1 },
  { day: '周二', growth: 5.0, drain: 2.4 },
  { day: '周三', growth: 3.2, drain: 1.8 },
  { day: '周四', growth: 4.2, drain: 2.0 },
  { day: '周五', growth: 5.2, drain: 3.7 },
  { day: '周六', growth: 4.1, drain: 1.5 },
  { day: '周日', growth: 2.9, drain: 1.9 },
]

const tags = ['真实建设感', 'AI 开发', '掌控感', '恢复节奏', '低压力推进']
</script>

<template>
  <main class="min-h-screen bg-[#fbfaf8] text-[#3e3630]">
    <aside
      class="fixed inset-y-0 left-0 z-20 hidden w-36 border-r border-cyan-100 bg-cyan-50/60 backdrop-blur-xl lg:flex lg:flex-col lg:items-center lg:justify-center"
    >
      <nav class="flex flex-col items-center gap-7 text-xl text-slate-600">
        <button
          v-for="item in navItems"
          :key="item"
          class="grid size-9 place-items-center rounded-full transition hover:bg-white hover:text-orange-500 hover:shadow-sm"
          :class="item === '+' ? 'bg-white text-2xl text-slate-700 shadow-sm' : ''"
          type="button"
        >
          {{ item }}
        </button>
      </nav>
    </aside>

    <div class="mx-auto max-w-[1680px] px-5 py-7 lg:pl-44 lg:pr-10">
      <header
        class="flex flex-col gap-5 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex items-center gap-4">
          <div class="relative size-12 text-orange-300">
            <span class="absolute inset-0 rounded-full border-4 border-current opacity-70" />
            <span class="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-current" />
            <span class="absolute left-0 top-1/2 h-1 w-full -translate-y-1/2 bg-current" />
            <span class="absolute inset-3 rounded-full border-2 border-current bg-white" />
          </div>
          <div>
            <h1 class="text-2xl font-semibold tracking-[0.16em] text-[#332f2c]">
              真实建设感复盘
            </h1>
            <p class="mt-1 text-sm tracking-[0.24em] text-stone-500">Growth Compass</p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-7 text-base text-stone-700">
          <p class="flex items-center gap-2">
            <span class="text-lg text-stone-500">▣</span>
            2025年5月20日&nbsp;&nbsp;星期二
          </p>
          <button
            class="rounded-lg bg-[#efad97] px-9 py-3.5 font-medium text-white shadow-sm transition hover:bg-[#e79c84]"
            type="button"
          >
            ＋ 新建记录
          </button>
          <button
            class="rounded-lg border border-stone-200 bg-white px-8 py-3.5 font-medium text-stone-700 shadow-sm transition hover:border-orange-200 hover:text-orange-500"
            type="button"
          >
            ▣ 生成周复盘
          </button>
        </div>
      </header>

      <div class="grid gap-6 pt-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <section class="min-w-0 space-y-5">
          <article
            class="overflow-hidden rounded-xl border border-stone-100 bg-white shadow-[0_16px_50px_rgba(72,50,31,0.06)]"
          >
            <div
              class="relative flex min-h-56 items-center overflow-hidden bg-[linear-gradient(105deg,#fdf8f1_0%,#f8f1e8_48%,#eee1d2_100%)] px-10 py-10"
            >
              <div class="absolute inset-0 opacity-70">
                <div class="absolute right-0 top-0 h-full w-1/2 bg-white/30 blur-3xl" />
                <div class="absolute right-20 top-11 h-36 w-36 rounded-full border border-white/70" />
                <div class="absolute right-32 top-24 h-16 w-44 rounded-full bg-stone-300/30 blur-xl" />
              </div>
              <div class="relative max-w-3xl">
                <h2 class="text-4xl font-semibold leading-tight text-[#493f38] md:text-5xl">
                  先看清楚， 再慢慢推进。
                </h2>
                <p class="mt-7 text-lg leading-9 text-[#534a43]">
                  记录不是为了给自己压力，也不是为了完成打卡。<br>
                  而是为了分辨：什么是真正在建设的，什么只是让自己忙碌的。
                </p>
              </div>
            </div>
          </article>

          <div class="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
            <article
              v-for="stat in stats"
              :key="stat.label"
              class="rounded-xl border border-stone-100 bg-white p-6 shadow-[0_10px_32px_rgba(72,50,31,0.04)]"
            >
              <div class="flex items-center gap-5">
                <div
                  class="grid size-14 place-items-center rounded-full bg-gradient-to-br text-2xl"
                  :class="stat.tone"
                >
                  {{ stat.icon }}
                </div>
                <div>
                  <p class="text-base font-medium text-stone-700">{{ stat.label }}</p>
                  <p class="mt-1 text-3xl font-semibold text-stone-900">{{ stat.value }}</p>
                </div>
              </div>
              <p class="mt-4 text-sm leading-6 text-stone-500">{{ stat.note }}</p>
            </article>
          </div>

          <section>
            <h2 class="mb-3 text-xl font-medium text-stone-700">快速记录</h2>
            <div class="grid gap-4 lg:grid-cols-3">
              <button
                v-for="quick in quickRecords"
                :key="quick.title"
                class="flex items-center justify-between rounded-xl border border-stone-100 bg-white px-6 py-4 text-left shadow-[0_10px_32px_rgba(72,50,31,0.04)] transition hover:-translate-y-0.5 hover:border-orange-100 hover:shadow-[0_14px_36px_rgba(72,50,31,0.08)]"
                type="button"
              >
                <span class="flex items-center gap-5">
                  <span
                    class="grid size-14 place-items-center rounded-full text-2xl"
                    :class="quick.tone"
                  >
                    {{ quick.icon }}
                  </span>
                  <span>
                    <span class="block text-base font-semibold text-stone-700">
                      {{ quick.title }}
                    </span>
                    <span class="mt-1 block max-w-64 text-sm leading-5 text-stone-500">
                      {{ quick.copy }}
                    </span>
                  </span>
                </span>
                <span class="text-2xl text-stone-500">›</span>
              </button>
            </div>
          </section>

          <section>
            <div class="mb-3 flex items-center justify-between">
              <h2 class="text-xl font-medium text-stone-700">最近记录</h2>
              <button class="text-base text-stone-500 transition hover:text-orange-500" type="button">
                查看全部记录 →
              </button>
            </div>
            <div
              class="overflow-hidden rounded-xl border border-stone-100 bg-white shadow-[0_10px_32px_rgba(72,50,31,0.04)]"
            >
              <article
                v-for="record in records"
                :key="record.title"
                class="grid gap-5 border-b border-stone-100 px-4 py-4 last:border-b-0 md:grid-cols-[1fr_auto]"
              >
                <div class="flex gap-5">
                  <div
                    class="mt-1 grid size-14 shrink-0 place-items-center rounded-full text-2xl"
                    :class="record.tone"
                  >
                    {{ record.icon }}
                  </div>
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-3">
                      <h3 class="text-lg font-semibold text-stone-800">{{ record.title }}</h3>
                      <span class="rounded-full bg-stone-100 px-4 py-1 text-sm text-stone-600">
                        {{ record.category }}
                      </span>
                    </div>
                    <p class="mt-1 text-sm leading-6 text-stone-500">{{ record.copy }}</p>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        v-for="tag in record.tags"
                        :key="tag"
                        class="rounded-full bg-[#f5eee7] px-3 py-1 text-xs text-stone-600"
                      >
                        {{ tag }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-start justify-between gap-8 text-right text-sm text-stone-500">
                  <div>
                    <p class="text-stone-600">{{ record.score }}</p>
                    <p class="mt-1">{{ record.time }}</p>
                  </div>
                  <button class="text-2xl leading-none text-stone-700" type="button">⋮</button>
                </div>
              </article>
            </div>
          </section>
        </section>

        <aside class="space-y-5">
          <section
            class="rounded-xl border border-stone-100 bg-white p-7 shadow-[0_10px_32px_rgba(72,50,31,0.04)]"
          >
            <div class="mb-5 flex items-center justify-between">
              <h2 class="flex items-center gap-3 text-xl font-semibold text-stone-800">
                <span class="text-2xl text-orange-300">✧</span>
                本周 AI 观察
              </h2>
              <span class="text-lg text-stone-500">ⓘ</span>
            </div>
            <p class="text-base leading-8 text-stone-700">
              你本周在「职业推进」上投入稳定，且能兼顾关系连接与自我恢复，整体节奏较为平衡。
              消耗主要来自信息处理与多线程切换，建议为深度工作预留更不被打扰的时间段。
            </p>
            <div class="mt-6 rounded-lg border border-orange-100 bg-[#fff8ee] p-5">
              <h3 class="mb-2 flex items-center gap-3 text-base font-medium text-stone-700">
                <span class="text-orange-400">♡</span>
                本周建议
              </h3>
              <p class="text-sm leading-6 text-stone-600">
                为重要项目设定一个「单点突破」目标，聚焦最能产生复利的那一件事。
              </p>
            </div>
          </section>

          <section
            class="rounded-xl border border-stone-100 bg-white p-7 shadow-[0_10px_32px_rgba(72,50,31,0.04)]"
          >
            <div class="mb-7 flex items-center justify-between">
              <h2 class="flex items-center gap-3 text-xl font-semibold text-stone-800">
                <span class="text-2xl text-orange-300">▥</span>
                本周趋势
              </h2>
              <div class="flex gap-5 text-sm text-stone-500">
                <span><i class="mr-2 inline-block size-3 bg-[#efad97]" />建设感</span>
                <span><i class="mr-2 inline-block size-3 bg-[#cce4df]" />消耗</span>
              </div>
            </div>
            <div class="relative h-52 border-b border-stone-100">
              <div class="absolute inset-x-0 top-0 h-px bg-stone-100" />
              <div class="absolute inset-x-0 top-1/3 h-px bg-stone-100" />
              <div class="absolute inset-x-0 top-2/3 h-px bg-stone-100" />
              <div class="flex h-full items-end justify-between gap-4 px-5">
                <div
                  v-for="item in trend"
                  :key="item.day"
                  class="flex h-full flex-1 flex-col items-center justify-end gap-2"
                >
                  <div class="flex h-40 items-end gap-2">
                    <span
                      class="w-3 rounded-t bg-[#efad97]"
                      :style="{ height: `${item.growth * 24}px` }"
                    />
                    <span
                      class="w-3 rounded-t bg-[#cce4df]"
                      :style="{ height: `${item.drain * 24}px` }"
                    />
                  </div>
                  <span class="text-sm text-stone-500">{{ item.day }}</span>
                </div>
              </div>
            </div>
          </section>

          <section
            class="rounded-xl border border-stone-100 bg-white p-7 shadow-[0_10px_32px_rgba(72,50,31,0.04)]"
          >
            <h2 class="mb-5 flex items-center gap-3 text-xl font-semibold text-stone-800">
              <span class="text-2xl text-stone-600">◇</span>
              高频标签
            </h2>
            <div class="flex flex-wrap gap-3">
              <span
                v-for="tag in tags"
                :key="tag"
                class="rounded-full border border-orange-100 bg-[#fff8f0] px-5 py-2 text-base text-stone-700"
              >
                {{ tag }}
              </span>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </main>
</template>
