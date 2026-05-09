import { onCLS, onFCP, onINP, onLCP, onTTFB, type MetricType } from 'web-vitals'
import { clientError, trackEvent } from '~/utils/clientTelemetry'

const reportWebVital = (metric: MetricType) => {
  trackEvent('web_vital', {
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  })
}

const getResourceTarget = (target: EventTarget | null) => {
  if (target instanceof HTMLScriptElement) {
    return {
      target: 'script',
      requestPath: target.src,
      eventName: target.src.includes('/_nuxt/') ? 'chunk_load_failed' : 'resource_load_failed',
    }
  }

  if (target instanceof HTMLLinkElement) {
    return {
      target: target.rel || 'link',
      requestPath: target.href,
      eventName: 'resource_load_failed',
    }
  }

  if (target instanceof HTMLImageElement) {
    return {
      target: 'image',
      requestPath: target.currentSrc || target.src,
      eventName: 'resource_load_failed',
    }
  }

  if (target instanceof HTMLSourceElement) {
    return {
      target: 'source',
      requestPath: target.src,
      eventName: 'resource_load_failed',
    }
  }

  return null
}

const hasVisibleContent = () => {
  const app = document.querySelector('#__nuxt') ?? document.body
  const text = app.textContent?.trim() ?? ''
  const visibleElement = [...app.querySelectorAll('main, header, section, article, a, button, input')].some((element) => {
    const rect = element.getBoundingClientRect()

    return rect.width > 0 && rect.height > 0
  })

  return text.length > 0 || visibleElement
}

export default defineNuxtPlugin(() => {
  onCLS(reportWebVital)
  onFCP(reportWebVital)
  onINP(reportWebVital)
  onLCP(reportWebVital)
  onTTFB(reportWebVital)

  window.addEventListener('error', (event) => {
    const resource = getResourceTarget(event.target)

    if (resource) {
      trackEvent(resource.eventName, {
        requestPath: resource.requestPath,
        target: resource.target,
        reason: 'resource_error',
      })
      return
    }

    clientError('runtime_error', {
      eventName: 'runtime_error',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    })
  }, true)

  window.addEventListener('unhandledrejection', (event) => {
    clientError('unhandled_rejection', {
      eventName: 'unhandled_rejection',
      reason: event.reason instanceof Error ? event.reason.message : String(event.reason ?? 'unknown_reason'),
    })
  })

  window.setTimeout(() => {
    if (!hasVisibleContent()) {
      trackEvent('blank_screen_detected', {
        reason: 'no_visible_content_after_3s',
      })
    }
  }, 3000)
})
