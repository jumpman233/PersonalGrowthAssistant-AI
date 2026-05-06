<script setup lang="ts">
const { navItems, stats, quickRecords, records, trend, tags } = useDashboardData()
</script>

<template>
  <main class="min-h-screen bg-[#fbfaf8] text-[#3e3630]">
    <DashboardSidebarNav :nav-items="navItems" />

    <div class="mx-auto max-w-[1680px] px-5 py-7 lg:pl-44 lg:pr-10">
      <DashboardHeader />

      <div class="grid gap-6 pt-6 xl:grid-cols-[minmax(0,1fr)_440px]">
        <section class="min-w-0 space-y-5">
          <DashboardHero />
          <DashboardStatGrid :stats="stats" />
          <DashboardQuickRecords :quick-records="quickRecords" />
          <DashboardRecentRecords :records="records" />
        </section>

        <aside class="space-y-5">
          <DashboardAiInsight />
          <DashboardWeeklyTrend :trend="trend" />
          <DashboardTagCloud :tags="tags" />
        </aside>
      </div>
    </div>
  </main>
</template>
