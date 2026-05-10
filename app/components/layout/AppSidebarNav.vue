<script setup lang="ts">
import type { AppNavItem } from '~/composables/useAppNavigation'

const props = defineProps<{
  navItems: AppNavItem[]
}>()

const route = useRoute()
const drawerOpen = ref(false)

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

const closeDrawer = () => {
  drawerOpen.value = false
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    closeDrawer()
  }
}

watch(drawerOpen, (open) => {
  if (open) {
    window.addEventListener('keydown', handleKeydown)
    return
  }

  window.removeEventListener('keydown', handleKeydown)
})

watch(
  () => route.path,
  () => {
    closeDrawer()
  },
)

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-20 hidden w-36 border-r border-cyan-100 bg-cyan-50/60 backdrop-blur-xl md:flex md:flex-col md:items-center md:justify-center"
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

  <button
    class="fixed left-4 z-30 grid size-12 place-items-center rounded-full border border-cyan-100 bg-white/90 text-xl text-slate-600 shadow-[0_12px_32px_rgba(72,50,31,0.12)] backdrop-blur transition hover:text-orange-500 md:hidden"
    style="bottom: calc(16px + env(safe-area-inset-bottom))"
    type="button"
    aria-label="打开导航"
    :aria-expanded="drawerOpen"
    @click="drawerOpen = true"
  >
    ◎
  </button>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="drawerOpen" class="fixed inset-0 z-40 md:hidden">
        <button class="absolute inset-0 bg-stone-900/20 backdrop-blur-[1px]" type="button" aria-label="关闭导航" @click="closeDrawer" />

        <Transition name="slide-panel" appear>
          <aside
            class="relative flex h-[100dvh] w-[82vw] max-w-80 flex-col border-r border-cyan-100 bg-[#f8fbfb] px-5 py-6 shadow-[20px_0_48px_rgba(72,50,31,0.14)]"
            aria-label="移动端导航"
          >
            <div class="mb-8 flex items-center justify-between">
              <div class="flex items-center gap-3">
                <span class="grid size-10 place-items-center rounded-full bg-white text-lg text-orange-400 shadow-sm">◎</span>
                <div>
                  <p class="text-sm text-stone-400">Growth Compass</p>
                  <h2 class="text-lg font-semibold text-stone-800">导航</h2>
                </div>
              </div>
              <button
                class="grid size-9 place-items-center rounded-full text-stone-400 transition hover:bg-white hover:text-orange-500"
                type="button"
                aria-label="关闭导航"
                @click="closeDrawer"
              >
                ×
              </button>
            </div>

            <nav class="space-y-2">
              <NuxtLink
                v-for="item in readyItems"
                :key="item.key"
                class="flex items-center gap-3 rounded-xl px-4 py-3 text-stone-600 transition hover:bg-white hover:text-orange-500 hover:shadow-sm"
                :class="isActive(item) ? 'bg-white text-orange-500 shadow-sm' : ''"
                :to="item.to"
                @click="closeDrawer"
              >
                <span class="grid size-9 place-items-center rounded-full bg-orange-50/70 text-base">{{ item.icon }}</span>
                <span class="text-base font-medium">{{ item.label }}</span>
              </NuxtLink>

              <button
                v-for="item in plannedItems"
                :key="item.key"
                class="flex w-full cursor-default items-center gap-3 rounded-xl px-4 py-3 text-left text-stone-400 opacity-70"
                type="button"
                disabled
              >
                <span class="grid size-9 place-items-center rounded-full bg-white text-base">{{ item.icon }}</span>
                <span class="text-base font-medium">{{ item.label }}</span>
              </button>
            </nav>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active,
.slide-panel-enter-active,
.slide-panel-leave-active {
  transition: opacity 160ms ease, transform 180ms ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-panel-enter-from,
.slide-panel-leave-to {
  transform: translateX(-100%);
}
</style>
