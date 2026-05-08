export default defineNuxtConfig({
  compatibilityDate: '2026-05-04',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    aiBaseUrl: '',
    aiApiKey: '',
    aiModelName: '',
  },
  nitro: {
    experimental: {
      tasks: true,
    },
    scheduledTasks: {
      '0 9 * * *': ['weekly-review'],
    },
  },
})
