<template>
  <article
    class="overflow-hidden rounded-xl border border-stone-100 bg-white shadow-[0_8px_28px_rgba(72,50,31,0.04)] md:shadow-[0_16px_50px_rgba(72,50,31,0.06)]"
  >
    <div
      class="relative flex items-center overflow-hidden bg-[linear-gradient(105deg,#fdf8f1_0%,#f8f1e8_48%,#eee1d2_100%)] px-5 py-5 md:min-h-52 md:px-10 md:py-10"
    >
      <div class="absolute inset-0 hidden opacity-70 md:block">
        <div class="absolute right-0 top-0 h-full w-1/2 bg-white/30 blur-3xl" />
        <div class="absolute right-20 top-11 h-36 w-36 rounded-full border border-white/70" />
        <div class="absolute right-32 top-24 h-16 w-44 rounded-full bg-stone-300/30 blur-xl" />
      </div>

      <div class="relative max-w-3xl">
        <h2 class="dashboard-hero-title text-2xl font-semibold leading-snug text-[#493f38] md:text-5xl md:leading-tight">
          先看清楚，再慢慢推进。
        </h2>
        <p class="dashboard-hero-copy mt-3 text-sm leading-6 text-[#534a43] md:mt-7 md:text-lg md:leading-9">
          记录不是为了给自己压力，也不是为了完成打卡。<br>
          而是为了分辨：什么是真正在建设的，什么只是让自己忙碌的。
        </p>
      </div>
    </div>
  </article>
</template>

<style scoped>
.dashboard-hero-title,
.dashboard-hero-copy {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

@media (min-width: 768px) {
  .dashboard-hero-title,
  .dashboard-hero-copy {
    display: block;
    overflow: visible;
  }
}
</style>
