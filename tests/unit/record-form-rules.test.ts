import { describe, expect, it } from 'vitest'
import {
  DEFAULT_ENERGY_COST_SCORE,
  MAX_CONTENT_LENGTH,
  MAX_TITLE_LENGTH,
  createDefaultRecordFormValue,
  isValidScore,
  validateRecordForm,
} from '../../app/utils/recordFormRules'

const validValue = () =>
  createDefaultRecordFormValue({
    title: '  A useful day  ',
    content: '  Made progress on a small task.  ',
    tags: [' work ', 'energy'],
    occurredAt: new Date('2026-05-05T10:00:00.000Z'),
  })

describe('record form rules', () => {
  it('builds defaults for a new record form', () => {
    const value = createDefaultRecordFormValue()

    expect(value.category).toBe('WORK')
    expect(value.moodScore).toBe(3)
    expect(value.constructivenessScore).toBe(3)
    expect(value.energyCostScore).toBe(DEFAULT_ENERGY_COST_SCORE)
    expect(value.occurredAt).toBeInstanceOf(Date)
  })

  it('validates score boundaries', () => {
    expect(isValidScore(0)).toBe(true)
    expect(isValidScore(5)).toBe(true)
    expect(isValidScore(-1)).toBe(false)
    expect(isValidScore(6)).toBe(false)
    expect(isValidScore(2.5)).toBe(false)
  })

  it('normalizes a valid submit value', () => {
    const result = validateRecordForm(validValue())

    expect(result.valid).toBe(true)
    expect(result.value.title).toBe('A useful day')
    expect(result.value.content).toBe('Made progress on a small task.')
    expect(result.value.tags).toEqual(['work', 'energy'])
  })

  it('rejects an empty title', () => {
    const result = validateRecordForm({ ...validValue(), title: '   ' })

    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('TITLE_REQUIRED')
    expect(result.error?.field).toBe('title')
  })

  it('rejects a title over the max length', () => {
    const result = validateRecordForm({ ...validValue(), title: 'x'.repeat(MAX_TITLE_LENGTH + 1) })

    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('TITLE_TOO_LONG')
  })

  it('rejects empty content', () => {
    const result = validateRecordForm({ ...validValue(), content: '   ' })

    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('CONTENT_REQUIRED')
  })

  it('rejects content over the max length', () => {
    const result = validateRecordForm({ ...validValue(), content: 'x'.repeat(MAX_CONTENT_LENGTH + 1) })

    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('CONTENT_TOO_LONG')
  })

  it('rejects invalid scores', () => {
    const result = validateRecordForm({ ...validValue(), moodScore: 2.5 })

    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('SCORES_INVALID')
    expect(result.error?.field).toBe('scores')
  })

  it('rejects invalid occurredAt values', () => {
    const result = validateRecordForm({ ...validValue(), occurredAt: new Date('not-a-date') })

    expect(result.valid).toBe(false)
    expect(result.error?.code).toBe('OCCURRED_AT_INVALID')
  })
})
