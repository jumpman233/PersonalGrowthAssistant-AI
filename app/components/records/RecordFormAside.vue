<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    mode?: 'create' | 'edit'
  }>(),
  {
    mode: 'create',
  },
)

const isEditing = computed(() => props.mode === 'edit')

const prompts = computed(() =>
  isEditing.value
    ? ['哪里需要修正得更准确？', '这件事后来有没有新的理解？', '评分还贴近现在的感受吗？', '标签能不能更具体一点？']
    : ['哪些事情让我觉得有推进？', '哪些事情只是内耗？', '我今天有没有把自己逼太紧？', '明天最小行动是什么？'],
)
</script>

<template>
  <aside class="space-y-6">
    <section class="rounded-xl border border-stone-100 bg-white p-5 shadow-[0_16px_42px_rgba(72,50,31,0.05)] md:p-6">
      <div class="mb-5 flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-full bg-orange-50 text-orange-500">
          {{ isEditing ? '✎' : '♡' }}
        </span>
        <h2 class="text-lg font-semibold text-stone-900 md:text-xl">
          {{ isEditing ? '修改时可以看看' : '写之前可以想想' }}
        </h2>
      </div>

      <div class="space-y-3">
        <article
          v-for="prompt in prompts"
          :key="prompt"
          class="flex items-center justify-between rounded-lg border border-stone-100 bg-white px-4 py-3 text-sm text-stone-600 md:px-5 md:py-4 md:text-base"
        >
          <span>{{ prompt }}</span>
          <span class="text-stone-400">→</span>
        </article>
      </div>
    </section>

    <section
      class="rounded-xl border border-stone-100 bg-[linear-gradient(110deg,#fff,#fff8f1)] p-5 shadow-[0_16px_42px_rgba(72,50,31,0.04)] md:p-7"
    >
      <h2 class="mb-4 text-xl font-semibold text-stone-900">
        {{ isEditing ? '编辑提醒' : '温和提醒' }}
      </h2>
      <p class="text-sm leading-6 text-stone-600 md:text-base md:leading-8">
        <template v-if="isEditing">
          只改真正需要修正的地方。<br>
          不需要把这一天重写成另一个版本。
        </template>
        <template v-else>
          先记下来，不急着一次想清全部。<br>
          看见一点真实推进，就已经很好。
        </template>
      </p>
      <p class="mt-6 rounded-lg bg-white/70 px-4 py-3 text-sm text-stone-500">
        {{
          isEditing
            ? '保存修改后，原有 AI 总结会先保留；如果内容变化较大，可以之后重新生成。'
            : 'AI 总结将在后续版本中接入，当前先保证记录链路稳定。'
        }}
      </p>
    </section>
  </aside>
</template>
