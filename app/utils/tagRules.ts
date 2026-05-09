export const MAX_TAG_COUNT = 12
export const MAX_TAG_LENGTH = 20

export type TagValidationResult = {
  tags: string[]
  valid: boolean
  tooMany: boolean
  hasOverLength: boolean
}

export const trimTags = (tags: readonly string[] = []) => tags.map((tag) => tag.trim())

export const dedupeTags = (tags: readonly string[] = []) => {
  const seen = new Set<string>()

  return trimTags(tags).filter((tag) => {
    if (!tag || seen.has(tag)) {
      return false
    }

    seen.add(tag)
    return true
  })
}

export const normalizeTags = (tags: readonly string[] = []) => dedupeTags(tags)

export const validateTags = (
  tags: readonly string[] = [],
  options: {
    maxCount?: number
    maxLength?: number
  } = {},
): TagValidationResult => {
  const maxCount = options.maxCount ?? MAX_TAG_COUNT
  const maxLength = options.maxLength ?? MAX_TAG_LENGTH
  const normalizedTags = normalizeTags(tags)
  const tooMany = normalizedTags.length > maxCount
  const hasOverLength = normalizedTags.some((tag) => tag.length > maxLength)

  return {
    tags: normalizedTags,
    valid: !tooMany && !hasOverLength,
    tooMany,
    hasOverLength,
  }
}

export const filterSuggestedTags = (suggestedTags: readonly string[] = [], selectedTags: readonly string[] = []) => {
  const selected = new Set(normalizeTags(selectedTags))

  return normalizeTags(suggestedTags).filter((tag) => tag.length <= MAX_TAG_LENGTH && !selected.has(tag))
}

export const mergeTagOptions = (tagOptions: readonly string[] = [], suggestedTags: readonly string[] = []) =>
  normalizeTags([...tagOptions, ...suggestedTags])
