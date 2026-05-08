<script setup lang="ts">
import type { AppNavItem } from '~/composables/useAppNavigation'

const props = defineProps<{
  navItems: AppNavItem[]
}>()

const route = useRoute()

const readyItems = computed(() => props.navItems.filter((item) => item.status === 'ready' && item.to))
const plannedItems = computed(() => props.navItems.filter((item) => item.status === 'planned'))
const exactActiveItem = computed(() =>
  readyItems.value.find((item) => item.exact && (item.to === route.path || item.match?.includes(route.path))),
)

const isActive = (item: AppNavItem) => {
  if (exactActiveItem.value) {
    return exactActiveItem.value.key === item.key
  }

  if (!item.match) {
    return false
  }

  if (item.exact) {
    return item.match.includes(route.path)
  }

  return item.match.some((path) => {
    if (path === '/') {
      return route.path === '/'
    }

    return route.path === path || route.path.startsWith(`${path}/`)
  })
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-20 hidden w-36 border-r border-cyan-100 bg-cyan-50/60 backdrop-blur-xl lg:flex lg:flex-col lg:items-center lg:justify-center"
  >
    <nav class="flex flex-col items-center gap-7 text-xl text-slate-600" aria-label="主导航">
      <NuxtLink
        v-for="item in readyItems"
        :key="item.key"
        class="grid size-10 place-items-center rounded-full transition hover:bg-white hover:text-orange-500 hover:shadow-sm"
        :class="isActive(item) ? 'bg-white text-orange-500 shadow-sm' : ''"
        :to="item.to"
        :title="item.label"
        :aria-label="item.label"
      >
        {{ item.icon }}
      </NuxtLink>

      <button
        v-for="item in plannedItems"
        :key="item.key"
        class="grid size-10 cursor-default place-items-center rounded-full text-stone-400 opacity-70"
        type="button"
        :title="`${item.label}即将支持`"
        :aria-label="`${item.label}即将支持`"
        disabled
      >
        {{ item.icon }}
      </button>
    </nav>
  </aside>
</template>
