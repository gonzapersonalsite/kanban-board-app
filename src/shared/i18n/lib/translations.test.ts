import { describe, expect, it } from 'vitest'
import { flattenTranslations, interpolate } from './translations'

describe('flattenTranslations', () => {
  it('flattens_nested_objects_into_dot_notation', () => {
    const input = { app: { title: 'Kanban Board', subtitle: 'App' } }

    expect(flattenTranslations(input)).toEqual({
      'app.title': 'Kanban Board',
      'app.subtitle': 'App',
    })
  })

  it('handles_deeply_nested_structures', () => {
    const input = { a: { b: { c: 'deep' } } }

    expect(flattenTranslations(input)).toEqual({ 'a.b.c': 'deep' })
  })

  it('handles_flat_structures', () => {
    const input = { key: 'value', another: 'text' }

    expect(flattenTranslations(input)).toEqual({ key: 'value', another: 'text' })
  })

  it('converts_non_string_values_to_strings', () => {
    const input = { count: 42, flag: true }

    expect(flattenTranslations(input)).toEqual({ count: '42', flag: 'true' })
  })

  it('returns_empty_object_for_empty_input', () => {
    expect(flattenTranslations({})).toEqual({})
  })
})

describe('interpolate', () => {
  it('replaces_placeholder_with_provided_value', () => {
    expect(interpolate('Hello {{name}}', { name: 'World' })).toBe('Hello World')
  })

  it('replaces_multiple_placeholders', () => {
    expect(
      interpolate('{{greeting}} {{name}}', { greeting: 'Hi', name: 'Alice' }),
    ).toBe('Hi Alice')
  })

  it('leaves_placeholder_when_value_not_provided', () => {
    expect(interpolate('Hello {{name}}', {})).toBe('Hello {{name}}')
  })

  it('returns_template_unchanged_when_params_undefined', () => {
    expect(interpolate('No params')).toBe('No params')
  })

  it('handles_numeric_values', () => {
    expect(interpolate('Count: {{n}}', { n: 42 })).toBe('Count: 42')
  })

  it('handles_template_without_placeholders', () => {
    expect(interpolate('Static text', { unused: 'value' })).toBe('Static text')
  })
})
