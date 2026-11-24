import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tooltip } from './Tooltip'

function renderTooltipOnAButton() {
  render(
    <Tooltip text="Settings">
      <button type="button">Open</button>
    </Tooltip>,
  )

  return screen.getByRole('button', { name: 'Open' })
}

describe('Tooltip', () => {
  it('shows_its_text_when_the_keyboard_brings_the_focus_to_its_trigger', () => {
    const trigger = renderTooltipOnAButton()

    fireEvent.keyDown(document.body, { key: 'Tab' })
    act(() => trigger.focus())

    expect(screen.getByRole('tooltip')).toHaveTextContent('Settings')
  })

  it('stays_hidden_when_the_focus_reaches_its_trigger_after_a_click', () => {
    const trigger = renderTooltipOnAButton()

    fireEvent.mouseDown(trigger)
    act(() => trigger.focus())

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
