import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AppIcon } from './AppIcon'

describe('AppIcon', () => {
  it('hides_its_drawing_from_assistive_technology_because_the_text_beside_it_names_the_app', () => {
    const { container } = render(<AppIcon />)

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })
})
