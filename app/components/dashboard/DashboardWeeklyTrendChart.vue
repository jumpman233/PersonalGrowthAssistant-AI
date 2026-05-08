<script setup lang="ts">
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
  type GridComponentOption,
  type LegendComponentOption,
  type TooltipComponentOption,
} from 'echarts/components'
import { init, use, type ComposeOption, type ECharts, type SetOptionOpts } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import type { LineSeriesOption } from 'echarts/charts'
import type { WeeklyTrendEntry } from '~/types/dashboard'

use([LineChart, GridComponent, LegendComponent, TooltipComponent, CanvasRenderer])

type TrendChartOption = ComposeOption<
  LineSeriesOption | GridComponentOption | LegendComponentOption | TooltipComponentOption
>

const props = defineProps<{
  trend: WeeklyTrendEntry[]
}>()

const chartEl = ref<HTMLElement | null>(null)
let chart: ECharts | null = null
let resizeObserver: ResizeObserver | null = null

const chartOption = computed<TrendChartOption>(() => ({
  color: ['#df8f75', '#8bbdb5'],
  animationDuration: 500,
  grid: {
    top: 46,
    right: 18,
    bottom: 34,
    left: 28,
    containLabel: true,
  },
  legend: {
    top: 0,
    right: 0,
    itemWidth: 18,
    itemHeight: 8,
    icon: 'roundRect',
    textStyle: {
      color: '#78716c',
      fontSize: 12,
    },
    data: ['建设感', '消耗'],
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderColor: '#f5d6c8',
    borderWidth: 1,
    padding: [10, 12],
    textStyle: {
      color: '#57534e',
      fontSize: 12,
    },
    axisPointer: {
      type: 'line',
      lineStyle: {
        color: '#f2c8b6',
        width: 1,
        type: 'dashed',
      },
    },
    valueFormatter: (value) => `${Number(value).toFixed(1)} 分`,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.trend.map((item) => item.day),
    axisLine: {
      lineStyle: {
        color: '#e7e5e4',
      },
    },
    axisTick: {
      show: false,
    },
    axisLabel: {
      color: '#78716c',
      fontSize: 12,
      margin: 12,
    },
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 5,
    interval: 1,
    splitLine: {
      lineStyle: {
        color: '#f1eee9',
      },
    },
    axisLabel: {
      color: '#a8a29e',
      fontSize: 11,
    },
  },
  series: [
    {
      name: '建设感',
      type: 'line',
      data: props.trend.map((item) => item.growth),
      smooth: 0.25,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: {
        width: 3,
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2,
      },
      areaStyle: {
        color: 'rgba(223, 143, 117, 0.09)',
      },
    },
    {
      name: '消耗',
      type: 'line',
      data: props.trend.map((item) => item.drain),
      smooth: 0.25,
      symbol: 'circle',
      symbolSize: 7,
      lineStyle: {
        width: 3,
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 2,
      },
      areaStyle: {
        color: 'rgba(139, 189, 181, 0.09)',
      },
    },
  ],
}))

const renderChart = (options?: SetOptionOpts) => {
  if (!chartEl.value) {
    return
  }

  chart ??= init(chartEl.value)
  chart.setOption(chartOption.value, options)
}

onMounted(() => {
  renderChart()

  if (chartEl.value) {
    resizeObserver = new ResizeObserver(() => {
      chart?.resize()
    })
    resizeObserver.observe(chartEl.value)
  }
})

watch(
  () => props.trend,
  () => renderChart({ notMerge: true }),
  { deep: true },
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chart?.dispose()
  chart = null
})
</script>

<template>
  <div ref="chartEl" class="h-56 w-full" />
</template>
