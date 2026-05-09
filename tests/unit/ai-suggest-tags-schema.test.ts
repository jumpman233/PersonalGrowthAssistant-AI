import { describe, expect, it } from 'vitest'
import {
  maxExistingTagsForAi,
  maxSuggestTagCount,
  maxSuggestTagLength,
  normalizeSuggestTag,
  normalizeSuggestTags,
  parseSuggestTagsResult,
  toSuggestTagsPayload,
  uniqueSuggestedTags,
} from '../../server/ai/schemas/suggestTags'

describe('suggest tags schema', () => {
  it('normalizes a single suggested tag', () => {
    expect(normalizeSuggestTag('  ##focus  ')).toBe('focus')
  })

  it('normalizes tag arrays', () => {
    expect(normalizeSuggestTags([' focus ', '', 'focus', 42, 'energy'])).toEqual(['focus', '42', 'energy'])
  })

  it('keeps unique suggested tags and excludes selected tags', () => {
    expect(uniqueSuggestedTags(['focus', 'energy', 'focus'], ['energy'])).toEqual(['focus'])
  })

  it('limits suggested tags by count and length', () => {
    const overlongTag = 'x'.repeat(maxSuggestTagLength + 1)
    const tags = ['one', 'two', 'three', 'four', 'five', 'six', overlongTag]

    expect(uniqueSuggestedTags(tags)).toEqual(tags.slice(0, maxSuggestTagCount))
  })

  it('parses suggested tags result', () => {
    const result = parseSuggestTagsResult('{"suggestedTags":["focus","energy","focus"]}', ['energy'])

    expect(result.suggestedTags).toEqual(['focus'])
  })

  it('merges client existing tags and known tags in payload', () => {
    const payload = toSuggestTagsPayload(
      {
        title: 'title',
        content: 'content',
        existingTags: [' focus ', 'energy'],
        selectedTags: ['selected'],
        moodScore: '4',
      },
      ['energy', 'project'],
    )

    expect(payload.existingTags).toEqual(['focus', 'energy', 'project'])
    expect(payload.selectedTags).toEqual(['selected'])
    expect(payload.moodScore).toBe(4)
  })

  it('limits existing tags sent to AI', () => {
    const knownTags = Array.from({ length: maxExistingTagsForAi + 3 }, (_, index) => `tag-${index}`)
    const payload = toSuggestTagsPayload({}, knownTags)

    expect(payload.existingTags).toHaveLength(maxExistingTagsForAi)
  })
})
