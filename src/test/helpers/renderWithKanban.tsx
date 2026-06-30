import { render, type RenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { useKanbanStore } from '@/shared/api'
import { resetPersistedKanbanStore } from '@/test/helpers/storeTestUtils'

export function renderWithKanban(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  resetPersistedKanbanStore(useKanbanStore.setState)

  return render(ui, options)
}
