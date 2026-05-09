import type { RecordCategory } from '@prisma/client'
import type { RecordFormValue } from '~/types/record-form'
import { validateTags } from './tagRules'

export const MAX_TITLE_LENGTH = 80
export const MAX_CONTENT_LENGTH = 2000
export const DEFAULT_RECORD_CATEGORY: RecordCategory = 'WORK'
export const DEFAULT_MOOD_SCORE = 3
export const DEFAULT_CONSTRUCTIVENESS_SCORE = 3
export const DEFAULT_ENERGY_COST_SCORE = 2

export type RecordFormFieldKey = 'title' | 'content' | 'scores' | 'tags' | 'occurredAt'

export type RecordFormValidationErrorCode =
  | 'TITLE_REQUIRED'
  | 'TITLE_TOO_LONG'
  | 'CONTENT_REQUIRED'
  | 'CONTENT_TOO_LONG'
  | 'SCORES_INVALID'
  | 'TOO_MANY_TAGS'
  | 'TAG_TOO_LONG'
  | 'OCCURRED_AT_INVALID'

export type RecordFormValidationError = {
  field: RecordFormFieldKey
  code: RecordFormValidationErrorCode
}

export type RecordFormValidationResult =
  | {
      valid: true
      value: RecordFormValue
      error: null
    }
  | {
      valid: false
      value: RecordFormValue
      error: RecordFormValidationError
    }

export const isValidScore = (value: number) => Number.isInteger(value) && value >= 0 && value <= 5

export const createDefaultRecordFormValue = (
  initialValue: Partial<RecordFormValue> = {},
): RecordFormValue => ({
  title: initialValue.title ?? '',
  content: initialValue.content ?? '',
  category: initialValue.category ?? DEFAULT_RECORD_CATEGORY,
  moodScore: initialValue.moodScore ?? DEFAULT_MOOD_SCORE,
  constructivenessScore: initialValue.constructivenessScore ?? DEFAULT_CONSTRUCTIVENESS_SCORE,
  energyCostScore: initialValue.energyCostScore ?? DEFAULT_ENERGY_COST_SCORE,
  tags: [...(initialValue.tags ?? [])],
  occurredAt: initialValue.occurredAt ?? new Date(),
})

export const normalizeRecordFormValue = (value: RecordFormValue): RecordFormValue => ({
  ...value,
  title: value.title.trim(),
  content: value.content.trim(),
  tags: validateTags(value.tags).tags,
})

export const validateRecordForm = (value: RecordFormValue): RecordFormValidationResult => {
  const normalizedValue = normalizeRecordFormValue(value)
  const tagValidation = validateTags(value.tags)

  if (!normalizedValue.title) {
    return {
      valid: false,
      value: normalizedValue,
      error: { field: 'title', code: 'TITLE_REQUIRED' },
    }
  }

  if (normalizedValue.title.length > MAX_TITLE_LENGTH) {
    return {
      valid: false,
      value: normalizedValue,
      error: { field: 'title', code: 'TITLE_TOO_LONG' },
    }
  }

  if (!normalizedValue.content) {
    return {
      valid: false,
      value: normalizedValue,
      error: { field: 'content', code: 'CONTENT_REQUIRED' },
    }
  }

  if (value.content.length > MAX_CONTENT_LENGTH) {
    return {
      valid: false,
      value: normalizedValue,
      error: { field: 'content', code: 'CONTENT_TOO_LONG' },
    }
  }

  if (
    !isValidScore(value.moodScore) ||
    !isValidScore(value.constructivenessScore) ||
    !isValidScore(value.energyCostScore)
  ) {
    return {
      valid: false,
      value: normalizedValue,
      error: { field: 'scores', code: 'SCORES_INVALID' },
    }
  }

  if (tagValidation.tooMany) {
    return {
      valid: false,
      value: normalizedValue,
      error: { field: 'tags', code: 'TOO_MANY_TAGS' },
    }
  }

  if (tagValidation.hasOverLength) {
    return {
      valid: false,
      value: normalizedValue,
      error: { field: 'tags', code: 'TAG_TOO_LONG' },
    }
  }

  if (!value.occurredAt || Number.isNaN(value.occurredAt.getTime())) {
    return {
      valid: false,
      value: normalizedValue,
      error: { field: 'occurredAt', code: 'OCCURRED_AT_INVALID' },
    }
  }

  return {
    valid: true,
    value: normalizedValue,
    error: null,
  }
}
