import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { usePageMeta } from './usePageMeta'

describe('usePageMeta', () => {
  it('sets_document_title', () => {
    renderHook(() => usePageMeta({ title: 'Test Title' }))

    expect(document.title).toBe('Test Title')
  })

  it('sets_meta_description', () => {
    renderHook(() => usePageMeta({ title: 'T', description: 'A test description.' }))

    const meta = document.querySelector('meta[name="description"]')
    expect(meta).toHaveAttribute('content', 'A test description.')
  })

  it('sets_og_title', () => {
    renderHook(() => usePageMeta({ title: 'OG Title' }))

    const meta = document.querySelector('meta[property="og:title"]')
    expect(meta).toHaveAttribute('content', 'OG Title')
  })

  it('sets_og_description', () => {
    renderHook(() => usePageMeta({ title: 'T', description: 'OG desc.' }))

    const meta = document.querySelector('meta[property="og:description"]')
    expect(meta).toHaveAttribute('content', 'OG desc.')
  })

  it('does_not_set_meta_when_description_is_undefined', () => {
    const initialCount = document.querySelectorAll('meta[name="description"]').length

    renderHook(() => usePageMeta({ title: 'T' }))

    expect(document.querySelectorAll('meta[name="description"]').length).toBe(initialCount)
  })

  it('creates_missing_meta_tag_and_sets_content', () => {
    const existing = document.querySelector('meta[name="description"]')
    existing?.remove()

    renderHook(() => usePageMeta({ title: 'T', description: 'Brand new.' }))

    const meta = document.querySelector('meta[name="description"]')
    expect(meta).toBeInTheDocument()
    expect(meta).toHaveAttribute('content', 'Brand new.')
  })

  it('restores_previous_document_title_on_unmount', () => {
    document.title = 'Previous Title'

    const { unmount } = renderHook(() => usePageMeta({ title: 'New Title' }))
    expect(document.title).toBe('New Title')

    unmount()
    expect(document.title).toBe('Previous Title')
  })

  it('restores_previous_description_on_unmount', () => {
    const existing = document.querySelector('meta[name="description"]')
    const previousContent = existing?.getAttribute('content') ?? ''

    const { unmount } = renderHook(() => usePageMeta({ title: 'T', description: 'Temporary.' }))
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Temporary.')

    unmount()
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', previousContent)
  })

  it('restores_previous_og_title_on_unmount', () => {
    const { unmount } = renderHook(() => usePageMeta({ title: 'First' }))
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'First')

    const { unmount: unmount2 } = renderHook(() => usePageMeta({ title: 'Second' }))
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'Second')

    unmount2()
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute('content', 'First')

    unmount()
  })

  it('does_not_restore_og_description_that_was_never_set', () => {
    renderHook(() => usePageMeta({ title: 'T', description: 'Initial.' }))

    const { unmount } = renderHook(() => usePageMeta({ title: 'T2' }))

    unmount()
    const meta = document.querySelector('meta[property="og:description"]')
    expect(meta).toHaveAttribute('content', 'Initial.')
  })

  it('updates_title_when_props_change', () => {
    const { rerender } = renderHook(
      ({ title }) => usePageMeta({ title }),
      { initialProps: { title: 'First' } },
    )

    expect(document.title).toBe('First')

    rerender({ title: 'Second' })
    expect(document.title).toBe('Second')
  })

  it('updates_description_when_props_change', () => {
    const { rerender } = renderHook(
      ({ title, description }) => usePageMeta({ title, description }),
      { initialProps: { title: 'T', description: 'First.' } },
    )

    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'First.')

    rerender({ title: 'T', description: 'Second.' })
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute('content', 'Second.')
  })
})
