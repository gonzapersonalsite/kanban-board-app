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

const withoutComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, '')

/** The blocks that open with `opening`, braces included, taken out of the stylesheet. */
function withoutBlocks(css: string, opening: RegExp): string {
  let rest = css

  for (let match = opening.exec(rest); match; match = opening.exec(rest)) {
    let depth = 0
    let end = rest.indexOf('{', match.index)

    do {
      if (rest[end] === '{') depth += 1
      if (rest[end] === '}') depth -= 1
      end += 1
    } while (depth > 0 && end < rest.length)

    rest = rest.slice(0, match.index) + rest.slice(end)
  }

  return rest
}

// A transition that names no property is one of all of them, and its first word is then a time.
const MOVING_PROPERTY =
  /^(all|transform|translate|scale|rotate|inset.*|top|right|bottom|left|width|height|margin.*|[\d.].*)$/

const transitionsSomethingThatMoves = (value: string) =>
  value.split(',').some((transition) => MOVING_PROPERTY.test(transition.trim().split(/\s+/)[0]))

// What a reader who asked for less motion still gets: an animation, a transition of something that
// moves, or a control that shifts under the pointer.
function motionForEveryReader(css: string): string[] {
  const forEveryReader = withoutBlocks(
    withoutBlocks(withoutComments(css), /@media\s*\(prefers-reduced-motion:\s*no-preference\)/),
    /@keyframes\s/,
  )

  return [...forEveryReader.matchAll(/([^{}]+)\{([^{}]*)\}/g)].flatMap(([, selector, body]) =>
    [...body.matchAll(/(?:^|;)\s*([a-z-]+)\s*:\s*([^;]+)/g)]
      .map(([, property, value]) => ({ property, value: value.trim() }))
      .filter(({ property, value }) => {
        if (value === 'none') return false
        if (property === 'animation' || property === 'animation-name') return true
        if (property === 'transition' || property === 'transition-property') return transitionsSomethingThatMoves(value)
        return /^(transform|translate|scale|rotate)$/.test(property) && /:(hover|active)/.test(selector)
      })
      .map(
        ({ property, value }) =>
          `${selector.trim().replace(/\s+/g, ' ')} { ${property}: ${value.replace(/\s+/g, ' ')} }`,
      ),
  )
}

const globalStylesheet = () => withoutComments(readFileSync(join(SRC, 'app/styles/global.css'), 'utf8'))

function declared(css: string, property: string): string[] {
  return [...css.matchAll(new RegExp(`${property}:\\s*([^;}]+)`, 'g'))].map(([, value]) => value.trim())
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

  it('does_tell_the_motion_every_reader_gets_from_the_one_kept_for_who_did_not_ask_for_less', () => {
    const css = `
      .a { transition: color 120ms ease, transform 200ms ease; animation: enter 0.3s both; }
      .a:hover { transform: translateY(-2px); color: red; }
      .b { transition: background-color 120ms ease, border-left-color 120ms; transform: rotate(2deg); }
      .b:hover { transform: none; }
      /* .c { animation: spin 1s; } */
      @keyframes enter { from { transform: scale(0); } to { transform: none; } }
      @media (prefers-reduced-motion: no-preference) {
        .d { animation: enter 0.3s both; transition: transform 200ms ease; }
        .d:hover { transform: translateY(-2px); }
      }
      @media (pointer: coarse) { .e:active { scale: 0.98; } }
    `

    expect(motionForEveryReader(css)).toEqual([
      '.a { transition: color 120ms ease, transform 200ms ease }',
      '.a { animation: enter 0.3s both }',
      '.a:hover { transform: translateY(-2px) }',
      '.e:active { scale: 0.98 }',
    ])
  })

  it('does_keep_every_animation_and_every_movement_for_the_reader_who_did_not_ask_for_less_motion', () => {
    const offenders = stylesheets.flatMap((file) =>
      motionForEveryReader(readFileSync(join(SRC, file), 'utf8')).map((rule) => `${file}: ${rule}`),
    )

    expect(offenders).toEqual([])
  })

  it('does_give_every_control_the_floor_of_the_pointer_in_use_from_one_rule_without_weight', () => {
    const [, controls, floor] = globalStylesheet().match(/:where\(([^)]*\[role='button'\])\)\s*\{([^}]*)\}/) ?? []

    expect(controls?.split(',').map((control) => control.trim())).toEqual([
      'a[href]',
      'button',
      'input',
      'select',
      'textarea',
      'summary',
      "[role='button']",
    ])
    expect(declared(floor ?? '', 'min-block-size')).toEqual(['var(--pointer-target-min)'])
    expect(declared(floor ?? '', 'min-inline-size')).toEqual(['var(--pointer-target-min)'])
  })

  it('does_set_the_floor_at_24_pixels_and_at_44_under_a_finger_where_the_kit_takes_its_largest_size', () => {
    const css = globalStylesheet()
    const underAFinger = css.slice(css.indexOf('@media (pointer: coarse)'))
    const everywhere = css.slice(0, css.indexOf('@media (pointer: coarse)'))

    expect({
      floor: declared(everywhere, '--target-size-min'),
      touchFloor: declared(everywhere, '--touch-target-min'),
      inUse: declared(everywhere, '--pointer-target-min'),
      inUseUnderAFinger: declared(underAFinger, '--pointer-target-min'),
      smallControlUnderAFinger: declared(underAFinger, '--control-size-sm'),
      mediumControlUnderAFinger: declared(underAFinger, '--control-size-md'),
    }).toEqual({
      floor: ['24px'],
      touchFloor: ['44px'],
      inUse: ['var(--target-size-min)'],
      inUseUnderAFinger: ['var(--touch-target-min)'],
      smallControlUnderAFinger: ['max(var(--control-size-lg), var(--touch-target-min))'],
      mediumControlUnderAFinger: ['max(var(--control-size-lg), var(--touch-target-min))'],
    })
  })

  it('does_let_only_the_tasks_of_a_calendar_day_go_under_the_touch_floor', () => {
    const underTheTouchFloor = stylesheets.filter(
      (file) =>
        file !== 'app/styles/global.css' &&
        withoutComments(readFileSync(join(SRC, file), 'utf8')).includes('var(--target-size-min)'),
    )

    expect(underTheTouchFloor).toEqual(['widgets/calendar/ui/CalendarGrid.module.css'])
  })

  it('does_keep_the_text_of_every_field_at_16_pixels_or_more_under_a_finger', () => {
    const css = globalStylesheet()
    const underAFinger = css.slice(css.indexOf('@media (pointer: coarse)'))
    const [, textOfEveryField] = underAFinger.match(/input,\s*select,\s*textarea\s*\{([^}]*)\}/) ?? []

    expect(declared(textOfEveryField ?? '', 'font-size')).toEqual(['max(16px, 1rem) !important'])
  })
})
