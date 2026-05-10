<script setup lang="ts">
import type { AppNavIcon } from '~/composables/useAppNavigation'

defineProps<{
  name: AppNavIcon
}>()
</script>

<template>
  <svg
    v-if="name === 'dashboard'"
    class="size-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M4 13a8 8 0 0 1 16 0" />
    <path d="M12 13l3-4" />
    <path d="M6.5 17h11" />
    <path d="M8 21h8" />
  </svg>

  <svg
    v-else-if="name === 'records'"
    class="size-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M7 4h10a2 2 0 0 1 2 2v14l-3-2-3 2-3-2-3 2V6a2 2 0 0 1 2-2Z" />
    <path d="M9 9h6" />
    <path d="M9 13h6" />
  </svg>

  <svg
    v-else-if="name === 'new-record'"
    class="size-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.9"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>

  <svg
    v-else-if="name === 'weekly-review'"
    class="size-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M7 3v3" />
    <path d="M17 3v3" />
    <path d="M4 8h16" />
    <rect x="4" y="5" width="16" height="16" rx="2" />
    <path d="M8 13h3" />
    <path d="M8 17h6" />
    <path d="M15.5 13.5l1.2 1.2 2.1-2.4" />
  </svg>

  <svg
    v-else
    class="size-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Z" />
    <path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.05.05a2.1 2.1 0 0 1-2.96 2.96l-.05-.05a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.1 1.66V21a2.1 2.1 0 0 1-4.2 0v-.07A1.8 1.8 0 0 0 8.4 19.3a1.8 1.8 0 0 0-2 .36l-.05.05a2.1 2.1 0 1 1-2.96-2.96l.05-.05a1.8 1.8 0 0 0 .36-2A1.8 1.8 0 0 0 2.14 13H2a2.1 2.1 0 0 1 0-4.2h.07A1.8 1.8 0 0 0 3.7 7.7a1.8 1.8 0 0 0-.36-2l-.05-.05a2.1 2.1 0 1 1 2.96-2.96l.05.05a1.8 1.8 0 0 0 2 .36A1.8 1.8 0 0 0 9.93 2H10a2.1 2.1 0 0 1 4.2 0v.07a1.8 1.8 0 0 0 1.1 1.63 1.8 1.8 0 0 0 2-.36l.05-.05a2.1 2.1 0 1 1 2.96 2.96l-.05.05a1.8 1.8 0 0 0-.36 2A1.8 1.8 0 0 0 21.86 9H22a2.1 2.1 0 0 1 0 4.2h-.07A1.8 1.8 0 0 0 19.4 15Z" />
  </svg>
</template>
