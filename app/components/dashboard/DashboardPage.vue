<script setup lang="ts">
import AppSidebarNav from '~/components/layout/AppSidebarNav.vue'
import type { DashboardApiData } from '~/types/dashboard'
import { getDurationMs, getErrorMessage, getErrorStatusCode, nowMs, trackEvent } from '~/utils/clientTelemetry'

const { navItems } = useAppNavigation()
const { quickRecords } = useDashboardViewConfig()

const emptyDashboard = (): DashboardApiData => ({
  stats: [],
  records: [],
  aiInsight: {
    summary: '',
    suggestion: '',
  },
  trend: [],
  tags: [],
})

const { data: dashboard } = await useAsyncData(
  'dashboard',
  async () => {
    const startTime = nowMs()

    try {
      const response = await $fetch<DashboardApiData>('/api/dashboard')
      trackEvent('dashboard_summary_duration', {
        durationMs: getDurationMs(startTime),
        success: true,
        requestPath: '/api/dashboard',
        target: 'dashboard_summary',
      })

      return response
    } catch (requestError) {
      trackEvent('dashboard_summary_duration', {
        durationMs: getDurationMs(startTime),
        success: false,
        requestPath: '/api/dashboard',
        statusCode: getErrorStatusCode(requestError),
        reason: getErrorMessage(requestError),
        target: 'dashboard_summary',
      })
      throw requestError
    }
  },
  {
    default: emptyDashboard,
  },
)
</script>

<template>
  <main class="min-h-screen bg-[#fbfaf8] text-[#3e3630]">
    <AppSidebarNav :nav-items="navItems" />

    <div class="mx-auto max-w-[1680px] px-5 py-5 md:py-7 md:pl-44 lg:pr-10">
      <DashboardHeader />

      <div class="grid gap-5 pt-4 md:gap-6 md:pt-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <section class="min-w-0 space-y-4 md:space-y-5">
          <DashboardHero />
          <DashboardStatGrid :stats="dashboard.stats" />
          <DashboardQuickRecords :quick-records="quickRecords" />
          <DashboardRecentRecords :records="dashboard.records" />
        </section>

        <aside class="space-y-4 md:space-y-5">
          <DashboardAiInsight :insight="dashboard.aiInsight" />
          <DashboardWeeklyTrend :trend="dashboard.trend" />
          <DashboardTagCloud :tags="dashboard.tags" />
        </aside>
      </div>
    </div>
  </main>
</template>
