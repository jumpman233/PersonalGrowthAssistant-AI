import { describe, expect, it } from 'vitest'
import {
  MAX_TAG_COUNT,
  MAX_TAG_LENGTH,
  dedupeTags,
  filterSuggestedTags,
  mergeTagOptions,
  normalizeTags,
  trimTags,
  validateTags,
} from '../../app/utils/tagRules'

describe('tag rules', () => {
  it('trims tags', () => {
    expect(trimTags(['  work  ', 'energy ', ''])).toEqual(['work', 'energy', ''])
  })

  it('filters empty tags and deduplicates after trimming', () => {
    expect(normalizeTags(['  work  ', '', 'work', ' energy ', 'energy'])).toEqual(['work', 'energy'])
  })

  it('does not mutate the source tag array while normalizing', () => {
    const tags = [' work ', '', 'energy']

    expect(normalizeTags(tags)).toEqual(['work', 'energy'])
    expect(tags).toEqual([' work ', '', 'energy'])
  })

  it('keeps the first occurrence when deduplicating', () => {
    expect(dedupeTags(['alpha', ' beta ', 'alpha', 'beta', 'gamma'])).toEqual(['alpha', 'beta', 'gamma'])
  })

  it('allows tags within count and length limits', () => {
    const result = validateTags(['work', 'energy'])

    expect(result).toEqual({
      tags: ['work', 'energy'],
      valid: true,
      tooMany: false,
      hasOverLength: false,
    })
  })

  it('detects too many tags after normalization', () => {
    const tags = Array.from({ length: MAX_TAG_COUNT + 1 }, (_, index) => `tag-${index}`)
    const result = validateTags(tags)

    expect(result.valid).toBe(false)
    expect(result.tooMany).toBe(true)
    expect(result.hasOverLength).toBe(false)
  })

  it('does not count duplicate tags toward the tag limit', () => {
    const tags = Array.from({ length: MAX_TAG_COUNT + 1 }, () => 'work')
    const result = validateTags(tags)

    expect(result.valid).toBe(true)
    expect(result.tags).toEqual(['work'])
    expect(result.tooMany).toBe(false)
  })

  it('detects overlong tags', () => {
    const overlongTag = 'x'.repeat(MAX_TAG_LENGTH + 1)
    const result = validateTags(['work', overlongTag])

    expect(result.valid).toBe(false)
    expect(result.tooMany).toBe(false)
    expect(result.hasOverLength).toBe(true)
  })

  it('filters suggested tags that are already selected', () => {
    expect(filterSuggestedTags(['work', 'energy', '  focus  '], ['work'])).toEqual(['energy', 'focus'])
  })

  it('keeps AI suggestions separate from selected tags until the user picks them', () => {
    const selectedTags = ['work']
    const suggestedTags = ['work', 'energy', 'focus']

    expect(filterSuggestedTags(suggestedTags, selectedTags)).toEqual(['energy', 'focus'])
    expect(selectedTags).toEqual(['work'])
  })

  it('does not expose empty, duplicate, or overlong suggested tags', () => {
    const overlongTag = 'x'.repeat(MAX_TAG_LENGTH + 1)

    expect(filterSuggestedTags(['', 'work', 'work', overlongTag], [])).toEqual(['work'])
  })

  it('merges persisted options and suggested tags with normalization', () => {
    expect(mergeTagOptions([' work ', 'energy'], ['energy', 'focus'])).toEqual(['work', 'energy', 'focus'])
  })
})
