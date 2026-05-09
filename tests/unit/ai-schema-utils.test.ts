import { describe, expect, it } from 'vitest'
import { cleanKeywords, cleanText, parseJsonObject } from '../../server/ai/schemas/utils'

describe('ai schema utils', () => {
  it('parses a plain JSON object', () => {
    expect(parseJsonObject<{ ok: boolean }>('{"ok":true}')).toEqual({ ok: true })
  })

  it('parses a JSON object wrapped in text', () => {
    expect(parseJsonObject<{ ok: boolean }>('result:\n{"ok":true}\nthanks')).toEqual({ ok: true })
  })

  it('throws when no JSON object is present', () => {
    expect(() => parseJsonObject('not json')).toThrow()
  })

  it('cleans text values with a fallback', () => {
    expect(cleanText('  hello  ', 'fallback')).toBe('hello')
    expect(cleanText('', 'fallback')).toBe('fallback')
    expect(cleanText(null, 'fallback')).toBe('fallback')
  })

  it('cleans keyword arrays', () => {
    expect(cleanKeywords(['  focus ', '', 'focus', 1, 'energy', 'toolong'], { maxCount: 2, maxLength: 6 })).toEqual([
      'focus',
      'energy',
    ])
  })

  it('returns an empty keyword list for non-array values', () => {
    expect(cleanKeywords('focus', { maxCount: 3 })).toEqual([])
  })
})
