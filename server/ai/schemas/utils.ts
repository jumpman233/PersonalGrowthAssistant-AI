export const parseJsonObject = <T>(content: string): Partial<T> => {
  const trimmed = content.trim()

  try {
    return JSON.parse(trimmed) as Partial<T>
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/)

    if (!match) {
      throw createError({
        statusCode: 502,
        statusMessage: 'AI 返回内容不是可解析的 JSON。',
      })
    }

    return JSON.parse(match[0]) as Partial<T>
  }
}

export const cleanText = (value: unknown, fallback: string) => {
  if (typeof value !== 'string') {
    return fallback
  }

  const trimmed = value.trim()
  return trimmed || fallback
}

export const cleanKeywords = (
  value: unknown,
  options: {
    maxCount: number
    maxLength?: number
  },
) => {
  if (!Array.isArray(value)) {
    return []
  }

  const seen = new Set<string>()

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => {
      if (!item || seen.has(item)) {
        return false
      }

      if (options.maxLength !== undefined && item.length > options.maxLength) {
        return false
      }

      seen.add(item)
      return true
    })
    .slice(0, options.maxCount)
}
