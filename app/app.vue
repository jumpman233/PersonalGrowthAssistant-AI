<script setup lang="ts">
useHead({
  titleTemplate: (title) => title ? `${title} | Growth Compass` : '真实建设感复盘 | Growth Compass',
  meta: [
    {
      name: 'description',
      content: '记录真正推动你的事情，识别建设感与内耗，生成低压力的成长复盘。',
    },
  ],
  link: [
    {
      rel: 'icon',
      href: '/favicon.ico',
      sizes: 'any',
    },
    {
      rel: 'icon',
      type: 'image/png',
      href: '/favicon-32x32.png',
      sizes: '32x32',
    },
    {
      rel: 'apple-touch-icon',
      href: '/apple-touch-icon.png',
      sizes: '180x180',
    },
  ],
})
</script>

<template>
  <NuxtPage />
</template>
