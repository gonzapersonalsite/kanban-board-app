import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

// Here and not beside the stylesheets: the tests of src get every stylesheet as an empty module, and
// this one has to read them as they are written.
const SRC = join(import.meta.dirname, '..', '..', 'src')

const stylesheets = readdirSync(SRC, { recursive: true, encoding: 'utf8' })
  .filter((file) => file.endsWith('.css'))
  .map((file) => file.replaceAll('\\', '/'))

function fontSizesOnlyInPixels(css: string): string[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')

  return [...withoutComments.matchAll(/font-size:\s*([^;}]+)/g)]
    .map(([, value]) => value.trim())
    .filter((value) => /^\d*\.?\d+px$/.test(value))
}

describe('stylesheets of src', () => {
  it('does_find_the_global_stylesheet_and_the_css_modules_when_it_lists_them', () => {
    expect(stylesheets).toEqual(expect.arrayContaining(['app/styles/global.css', 'shared/ui/Input/Input.module.css']))
  })

  it('does_tell_a_size_only_in_pixels_from_one_that_grows_when_it_reads_a_declaration', () => {
    const css =
      '.a { font-size: 14px; } .b { font-size: max(16px, 1rem) } .c { font-size: 0.875rem; } /* font-size: 12px; */'

    expect(fontSizesOnlyInPixels(css)).toEqual(['14px'])
  })

  it('does_give_no_font_size_only_in_pixels_so_the_text_follows_the_size_the_reader_chose', () => {
    const offenders = stylesheets.flatMap((file) =>
      fontSizesOnlyInPixels(readFileSync(join(SRC, file), 'utf8')).map((value) => `${file}: ${value}`),
    )

    expect(offenders).toEqual([])
  })
})
