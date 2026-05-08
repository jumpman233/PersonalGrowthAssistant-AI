type LogLevel = 'info' | 'warn' | 'error'

export type LogMeta = Record<string, unknown>

const sensitiveKeys = [
  'content',
  'prompt',
  'messages',
  'input',
  'output',
  'fullResult',
  'apiKey',
  'authorization',
  'userProfile',
  'password',
  'secret',
  'token',
]

const maxDepth = 4
const maxArrayLength = 20

const isSensitiveKey = (key: string) => {
  const normalized = key.toLowerCase()

  if (
    normalized.endsWith('length') ||
    normalized.endsWith('count') ||
    normalized.endsWith('version') ||
    normalized.endsWith('tokens')
  ) {
    return false
  }

  return sensitiveKeys.some((sensitive) => normalized.includes(sensitive.toLowerCase()))
}

const sanitizeValue = (key: string, value: unknown, depth = 0): unknown => {
  if (isSensitiveKey(key)) {
    return '[REDACTED]'
  }

  if (value instanceof Error) {
    return {
      errorName: value.name,
      errorMessage: value.message,
      errorStack: process.env.NODE_ENV === 'production' ? undefined : value.stack,
    }
  }

  if (value === null || value === undefined) {
    return value
  }

  if (typeof value !== 'object') {
    return value
  }

  if (depth >= maxDepth) {
    return '[MAX_DEPTH]'
  }

  if (Array.isArray(value)) {
    return value.slice(0, maxArrayLength).map((item, index) => sanitizeValue(`${key}.${index}`, item, depth + 1))
  }

  return Object.fromEntries(
    Object.entries(value as LogMeta).map(([nestedKey, nestedValue]) => [
      nestedKey,
      sanitizeValue(nestedKey, nestedValue, depth + 1),
    ]),
  )
}

const sanitizeMeta = (meta: LogMeta = {}) => {
  const sanitized: LogMeta = {}

  Object.entries(meta).forEach(([key, value]) => {
    if (value instanceof Error) {
      sanitized.errorName = value.name
      sanitized.errorMessage = value.message
      sanitized.errorStack = process.env.NODE_ENV === 'production' ? undefined : value.stack
      return
    }

    sanitized[key] = sanitizeValue(key, value)
  })

  return sanitized
}

const writeLog = (level: LogLevel, message: string, meta?: LogMeta) => {
  try {
    const payload = {
      time: new Date().toISOString(),
      level,
      message,
      ...sanitizeMeta(meta),
    }
    const line = JSON.stringify(payload)

    if (level === 'error') {
      console.error(line)
      return
    }

    if (level === 'warn') {
      console.warn(line)
      return
    }

    console.log(line)
  } catch {
    // Logging must never break the business flow.
  }
}

export const logger = {
  info: (message: string, meta?: LogMeta) => writeLog('info', message, meta),
  warn: (message: string, meta?: LogMeta) => writeLog('warn', message, meta),
  error: (message: string, meta?: LogMeta) => writeLog('error', message, meta),

  child(baseMeta: LogMeta) {
    return {
      info: (message: string, meta?: LogMeta) => writeLog('info', message, { ...baseMeta, ...meta }),
      warn: (message: string, meta?: LogMeta) => writeLog('warn', message, { ...baseMeta, ...meta }),
      error: (message: string, meta?: LogMeta) => writeLog('error', message, { ...baseMeta, ...meta }),
    }
  },
}
