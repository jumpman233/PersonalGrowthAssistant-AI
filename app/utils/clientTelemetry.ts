export type TelemetryPayload = Record<string, unknown>

type TelemetryLevel = 'event' | 'warn' | 'error'

const sensitiveKeys = [
  'content',
  'prompt',
  'messages',
  'fullResult',
  'userProfile',
  'apiKey',
  'authorization',
  'password',
  'token',
]

const isSensitiveKey = (key: string) =>
  sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))

const sanitizeValue = (key: string, value: unknown): unknown => {
  if (isSensitiveKey(key)) {
    return '[REDACTED]'
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(key, item))
  }

  if (value && typeof value === 'object') {
    return sanitizePayload(value as TelemetryPayload)
  }

  return value
}

export const sanitizePayload = (payload: TelemetryPayload = {}) =>
  Object.fromEntries(Object.entries(payload).map(([key, value]) => [key, sanitizeValue(key, value)]))

const createTelemetryData = (level: TelemetryLevel, payload: TelemetryPayload = {}) => ({
  type: level,
  path: import.meta.client ? window.location.pathname : '',
  time: new Date().toISOString(),
  ...sanitizePayload(payload),
})

const writeTelemetry = (level: TelemetryLevel, label: string, payload: TelemetryPayload = {}) => {
  if (!import.meta.dev || !import.meta.client) {
    return
  }

  const data = createTelemetryData(level, payload)

  if (level === 'warn') {
    console.warn(label, data)
    return
  }

  if (level === 'error') {
    console.error(label, data)
    return
  }

  console.log(label, data)
}

export const trackEvent = (eventName: string, payload?: TelemetryPayload) => {
  writeTelemetry('event', '[telemetry]', {
    eventName,
    ...payload,
  })
}

export const clientWarn = (message: string, payload?: TelemetryPayload) => {
  writeTelemetry('warn', '[client-warn]', {
    message,
    ...payload,
  })
}

export const clientError = (message: string, payload?: TelemetryPayload) => {
  writeTelemetry('error', '[client-error]', {
    message,
    ...payload,
  })
}

export const nowMs = () => (import.meta.client ? performance.now() : Date.now())

export const getDurationMs = (startTime: number) => Math.round(nowMs() - startTime)

export const getErrorStatusCode = (error: unknown) => {
  if (!error || typeof error !== 'object') {
    return undefined
  }

  if ('statusCode' in error && typeof error.statusCode === 'number') {
    return error.statusCode
  }

  if ('status' in error && typeof error.status === 'number') {
    return error.status
  }

  return undefined
}

export const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'string') {
    return error
  }

  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message
  }

  return 'unknown_error'
}
