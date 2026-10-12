import { readFileSync } from 'node:fs'
import { ESLint, type Linter } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'

// Each architecture rule of eslint.config.js, seen firing on the smallest file
// that breaks it, and seen silent on files that keep to it: relaxing a rule
// turns its case red here, not only in a review.
const eslint = new ESLint({ cwd: import.meta.dirname })

// The first lint loads eslint.config.js, its plugins and the parser: a cold start of
// seconds that would otherwise count against the first case's 5 s timeout.
beforeAll(async () => {
  await eslint.lintText('', { filePath: 'src/app/warmup.ts' })
}, 30_000)

async function lint(path: string, code: string): Promise<Linter.LintMessage[]> {
  const [result] = await eslint.lintText(code, { filePath: path })
  return result.messages
}

// The rule of a report, or its text when it has none (a parsing error, an ignored comment).
const ruleOf = (message: Linter.LintMessage): string => message.ruleId ?? message.message

// Errors only: a rule lowered to a warning no longer breaks the file, and its case turns red.
async function rulesBrokenBy(path: string, code: string): Promise<string[]> {
  const messages = await lint(path, code)
  return messages.filter((message) => message.severity === 2).map(ruleOf)
}

// Every report, warnings included: a warning is red too, so a file that keeps
// to the rules gets none.
async function reportsOn(path: string, code: string): Promise<string[]> {
  const messages = await lint(path, code)
  return messages.map(ruleOf)
}

describe('the layers of Feature-Sliced Design', () => {
  it.each([
    [
      'a_layer_importing_from_a_layer_above_it',
      'src/entities/board/model/selectors.ts',
      "import { AddTaskForm } from '@/features/task-management'\nexport const form = AddTaskForm\n",
      'fsd-lint/forbidden-imports',
    ],
    [
      'a_slice_importing_a_sibling_of_its_own_layer',
      'src/features/task-management/model/useTaskDialog.ts',
      "import { useColumnActions } from '@/features/column-management'\nexport const actions = useColumnActions\n",
      'fsd-lint/no-cross-slice-dependency',
    ],
    [
      'a_relative_import_that_leaves_its_slice',
      'src/features/task-management/ui/AddTaskForm.tsx',
      "import { TaskCard } from '../../../entities/task'\nexport const Card = TaskCard\n",
      'fsd-lint/no-relative-imports',
    ],
    [
      'a_deep_import_into_a_slice',
      'src/widgets/board/ui/Board.tsx',
      "import { selectActiveBoard } from '@/entities/board/model/selectors'\nexport const select = selectActiveBoard\n",
      'fsd-lint/no-public-api-sidestep',
    ],
    [
      'an_import_of_a_segment_instead_of_the_slice',
      'src/widgets/board/ui/Board.tsx',
      "import { selectActiveBoard } from '@/entities/board/model'\nexport const select = selectActiveBoard\n",
      'fsd-lint/no-public-api-sidestep',
    ],
    [
      'a_deep_import_into_a_page',
      'src/app/router/ui/AppRouter.tsx',
      "import { HomePage } from '@/pages/home/ui/HomePage'\nexport const Page = HomePage\n",
      'fsd-lint/no-public-api-sidestep',
    ],
    [
      'a_deep_import_into_a_widget',
      'src/pages/home/ui/HomePage.tsx',
      "import { Board } from '@/widgets/board/ui/Board'\nexport const Widget = Board\n",
      'fsd-lint/no-public-api-sidestep',
    ],
    [
      'a_deep_import_into_a_feature',
      'src/widgets/board/ui/Board.tsx',
      "import { useTaskDialog } from '@/features/task-management/model/useTaskDialog'\nexport const dialog = useTaskDialog\n",
      'fsd-lint/no-public-api-sidestep',
    ],
    [
      'a_dynamic_import_of_a_sibling_of_its_own_layer',
      'src/features/task-management/model/lazy.ts',
      "export const load = () => import('@/features/column-management')\n",
      'fsd-lint/no-cross-slice-dependency',
    ],
    [
      'a_dynamic_relative_import_that_leaves_its_slice',
      'src/features/task-management/ui/lazy.ts',
      "export const load = () => import('../../../entities/task')\n",
      'fsd-lint/no-relative-imports',
    ],
    [
      'a_dynamic_deep_import_into_a_slice',
      'src/widgets/board/ui/lazy.ts',
      "export const load = () => import('@/entities/board/model/selectors')\n",
      'fsd-lint/no-public-api-sidestep',
    ],
    ['a_folder_of_src_that_is_not_a_layer', 'src/services/api.ts', 'export const api = 1\n', 'no-restricted-syntax'],
    [
      'the_entry_point_at_the_root_of_src',
      'src/main.tsx',
      "import { createRoot } from 'react-dom/client'\nexport const root = createRoot\n",
      'no-restricted-syntax',
    ],
  ])('rejects_%s', async (_case, path, code, rule) => {
    const broken = await rulesBrokenBy(path, code)

    expect(broken).toContain(rule)
  })

  it.each(['js', 'jsx', 'mjs', 'cjs', 'mts', 'cts'])(
    'rejects_code_in_a_%s_file_which_none_of_the_rules_would_read',
    async (extension) => {
      // A statement that every module system parses: a .cjs file rejects export.
      const broken = await rulesBrokenBy(`src/entities/board/model/legacy.${extension}`, 'const legacy = 1\n')

      expect(broken).toContain('no-restricted-syntax')
    },
  )

  it('accepts_imports_that_go_down_the_layers_through_each_public_api', async () => {
    const code =
      "import { Board } from '@/widgets/board'\nimport { TaskCard } from '@/entities/task'\nimport { useKanbanStore } from '@/shared/api'\nexport const parts = [Board, TaskCard, useKanbanStore]\n"

    const reports = await reportsOn('src/pages/home/ui/HomePage.tsx', code)

    expect(reports).toEqual([])
  })

  it('accepts_the_entry_point_in_the_app_layer', async () => {
    const code =
      "import { createRoot } from 'react-dom/client'\nimport App from './App'\ncreateRoot(document.body).render(<App />)\n"

    const reports = await reportsOn('src/app/main.tsx', code)

    expect(reports).toEqual([])
  })

  it('leaves_a_test_free_of_the_import_rules_of_the_layers', async () => {
    // A layer above, a sibling slice, a deep import and a relative path out of the slice.
    const code =
      "import { AddTaskForm } from '@/features/task-management'\nimport { TaskCard } from '@/entities/task'\nimport { TaskCardView } from '@/entities/task/ui/TaskCard'\nimport { Card } from '../../task'\nexport const parts = [AddTaskForm, TaskCard, TaskCardView, Card]\n"

    const reports = await reportsOn('src/entities/board/model/selectors.extra.test.ts', code)

    expect(reports).toEqual([])
  })
})

describe('no UI in the model, api and lib segments', () => {
  it.each([
    ['a_tsx_file', 'src/entities/board/model/view.tsx', 'export const view = 1\n', 'no-restricted-syntax'],
    [
      'an_import_of_its_slice_ui',
      'src/features/task-management/model/useTaskDialog.ts',
      "import { TaskDialog } from '../ui/TaskDialog'\nexport const dialog = TaskDialog\n",
      'no-restricted-imports',
    ],
    [
      'an_import_of_the_shared_ui',
      'src/shared/api/store.ts',
      "import { Toast } from '@/shared/ui'\nexport const toast = Toast\n",
      'no-restricted-imports',
    ],
    [
      'an_import_of_react_dom',
      'src/entities/board/model/portal.ts',
      "import { createPortal } from 'react-dom'\nexport const portal = createPortal\n",
      'no-restricted-imports',
    ],
    [
      'an_import_of_react_dom_client',
      'src/entities/board/model/root.ts',
      "import { createRoot } from 'react-dom/client'\nexport const root = createRoot\n",
      'no-restricted-imports',
    ],
    [
      'an_import_of_react_dom_server',
      'src/entities/board/model/html.ts',
      "import { renderToString } from 'react-dom/server'\nexport const html = renderToString\n",
      'no-restricted-imports',
    ],
    [
      'the_jsx_runtime',
      'src/entities/board/model/runtime.ts',
      "import { jsx } from 'react/jsx-runtime'\nexport const element = jsx('p', {})\n",
      'no-restricted-imports',
    ],
    [
      'the_jsx_dev_runtime',
      'src/entities/board/model/runtime.ts',
      "import { jsxDEV } from 'react/jsx-dev-runtime'\nexport const element = jsxDEV\n",
      'no-restricted-imports',
    ],
    [
      'an_element_created_without_jsx',
      'src/entities/board/model/element.ts',
      "import { createElement } from 'react'\nexport const element = createElement('p')\n",
      'no-restricted-imports',
    ],
    [
      'an_element_cloned_without_jsx',
      'src/widgets/calendar/lib/clone.ts',
      "import { cloneElement } from 'react'\nexport const clone = cloneElement\n",
      'no-restricted-imports',
    ],
    [
      'react_as_a_default_import',
      'src/entities/board/model/element.ts',
      "import React from 'react'\nexport const element = React.createElement('p')\n",
      'no-restricted-imports',
    ],
    [
      'react_as_a_namespace',
      'src/entities/board/model/element.ts',
      "import * as React from 'react'\nexport const element = React.createElement('p')\n",
      'no-restricted-imports',
    ],
    [
      'a_dynamic_import_of_its_slice_ui',
      'src/features/task-management/model/lazy.ts',
      "export const load = () => import('../ui/TaskDialog')\n",
      'no-restricted-syntax',
    ],
    [
      'a_dynamic_import_of_react_dom',
      'src/shared/api/lazy.ts',
      "export const load = () => import('react-dom/client')\n",
      'no-restricted-syntax',
    ],
    [
      'a_dynamic_import_of_the_jsx_runtime',
      'src/widgets/calendar/lib/lazy.ts',
      "export const load = () => import('react/jsx-runtime')\n",
      'no-restricted-syntax',
    ],
    [
      'a_dynamic_import_of_styles',
      'src/widgets/calendar/lib/lazy.ts',
      "export const load = () => import('./theme.module.css')\n",
      'no-restricted-syntax',
    ],
    [
      'a_dynamic_import_of_react_which_brings_it_as_a_whole',
      'src/entities/board/model/lazy.ts',
      "export const load = () => import('react')\n",
      'no-restricted-syntax',
    ],
  ])('rejects_%s', async (_case, path, code, rule) => {
    const broken = await rulesBrokenBy(path, code)

    expect(broken).toContain(rule)
  })

  it.each(['css', 'scss', 'sass', 'less', 'styl', 'stylus', 'pcss', 'postcss', 'sss', 'css?inline'])(
    'rejects_an_import_of_%s_styles',
    async (extension) => {
      const code = `import styles from './theme.module.${extension}'\nexport const theme = styles\n`

      const broken = await rulesBrokenBy('src/widgets/calendar/lib/theme.ts', code)

      expect(broken).toContain('no-restricted-imports')
    },
  )

  it('sees_both_the_tsx_file_and_its_dynamic_import_of_ui', async () => {
    const code = "export const load = () => import('../ui/TaskDialog')\n"

    const broken = await rulesBrokenBy('src/features/task-management/model/lazy.tsx', code)

    expect(broken.filter((rule) => rule === 'no-restricted-syntax')).toHaveLength(2)
  })

  it('accepts_logic_that_uses_react_state_and_its_own_model', async () => {
    const code =
      "import { useState } from 'react'\nimport { selectActiveBoard } from './selectors'\nexport const parts = [useState, selectActiveBoard]\n"

    const reports = await reportsOn('src/entities/board/model/useBoards.ts', code)

    expect(reports).toEqual([])
  })

  it('accepts_the_infrastructure_stores_that_logic_reports_through', async () => {
    const code =
      "import { useToastStore } from '@/shared/toast'\nimport { useI18nStore } from '@/shared/i18n'\nexport const stores = [useToastStore, useI18nStore]\n"

    const reports = await reportsOn('src/shared/api/slices/taskSlice.ts', code)

    expect(reports).toEqual([])
  })

  it('leaves_the_tests_of_those_segments_free_to_render', async () => {
    const code =
      "import { render } from '@testing-library/react'\nimport { BoardSelector } from '../ui/BoardSelector'\nexport const draw = () => render(<BoardSelector />)\n"

    const reports = await reportsOn('src/entities/board/model/selectors.view.test.tsx', code)

    expect(reports).toEqual([])
  })
})

describe('the test support in src/test', () => {
  it.each([
    ['a_component', 'src/features/task-management/ui/AddTaskForm.tsx'],
    ['a_logic_segment', 'src/entities/board/model/selectors.ts'],
    ['the_app_layer', 'src/app/App.tsx'],
  ])('rejects_an_import_of_it_from_%s', async (_case, path) => {
    const code = "import { createKanbanFixture } from '@/test/fixtures/kanbanFixtures'\nexport const fixture = createKanbanFixture\n"

    const broken = await rulesBrokenBy(path, code)

    expect(broken).toContain('no-restricted-imports')
  })

  it.each([
    ['a_component', 'src/features/task-management/ui/AddTaskForm.tsx'],
    ['a_logic_segment', 'src/entities/board/model/selectors.ts'],
  ])('rejects_a_dynamic_import_of_it_from_%s', async (_case, path) => {
    const code = "export const load = () => import('@/test/fixtures/kanbanFixtures')\n"

    const broken = await rulesBrokenBy(path, code)

    expect(broken).toContain('no-restricted-syntax')
  })

  it('sees_both_a_tsx_logic_file_and_its_dynamic_import_of_it', async () => {
    const code = "export const load = () => import('@/test/fixtures/kanbanFixtures')\n"

    const broken = await rulesBrokenBy('src/entities/board/model/lazy.tsx', code)

    expect(broken.filter((rule) => rule === 'no-restricted-syntax')).toHaveLength(2)
  })

  it('rejects_a_relative_import_of_it_from_production_code', async () => {
    const code =
      "import { createKanbanFixture } from '../../../test/fixtures/kanbanFixtures'\nexport const fixture = createKanbanFixture\n"

    const broken = await rulesBrokenBy('src/features/task-management/ui/AddTaskForm.tsx', code)

    expect(broken).toContain('fsd-lint/no-relative-imports')
  })

  it('accepts_it_as_the_one_folder_of_src_that_is_not_a_layer', async () => {
    const code = "import { useKanbanStore } from '@/shared/api'\nexport const store = useKanbanStore\n"

    const reports = await reportsOn('src/test/helpers/storeTestUtils.ts', code)

    expect(reports).toEqual([])
  })

  it('accepts_an_import_of_it_from_the_test_support_itself', async () => {
    const code =
      "import { createKanbanFixture } from '@/test/fixtures/kanbanFixtures'\nexport const fixture = createKanbanFixture\n"

    const reports = await reportsOn('src/test/helpers/storeTestUtils.ts', code)

    expect(reports).toEqual([])
  })

  it('accepts_an_import_of_it_from_a_test', async () => {
    const code =
      "import { expect, it } from 'vitest'\nimport { createKanbanFixture } from '@/test/fixtures/kanbanFixtures'\nit('reads', () => expect(createKanbanFixture()).toBeDefined())\n"

    const reports = await reportsOn('src/widgets/board/ui/Board.test.tsx', code)

    expect(reports).toEqual([])
  })
})

describe('no requests outside src/shared/api', () => {
  it.each([
    ['fetch', "export const load = () => fetch('/boards')\n", 'no-restricted-globals'],
    ['XMLHttpRequest', 'export const open = () => new XMLHttpRequest()\n', 'no-restricted-globals'],
    ['window_fetch', "export const load = () => window.fetch('/boards')\n", 'no-restricted-properties'],
    ['globalThis_fetch', "export const load = () => globalThis.fetch('/boards')\n", 'no-restricted-properties'],
    ['self_fetch', "export const load = () => self.fetch('/boards')\n", 'no-restricted-properties'],
  ])('rejects_%s', async (_case, code, rule) => {
    const broken = await rulesBrokenBy('src/features/data-portability/model/exportBackup.ts', code)

    expect(broken).toContain(rule)
  })

  it('accepts_fetch_inside_src_shared_api', async () => {
    const code = "export const load = () => fetch('/boards')\n"

    const reports = await reportsOn('src/shared/api/transport.ts', code)

    expect(reports).toEqual([])
  })
})

describe('every test runs', () => {
  it.each([
    ['it_skip', "import { it } from 'vitest'\nit.skip('waits', () => {})\n"],
    ['describe_skip', "import { describe } from 'vitest'\ndescribe.skip('waits', () => {})\n"],
    ['it_todo', "import { it } from 'vitest'\nit.todo('later')\n"],
    ['test_skipIf', "import { test } from 'vitest'\ntest.skipIf(true)('waits', () => {})\n"],
    ['it_runIf', "import { it } from 'vitest'\nit.runIf(false)('waits', () => {})\n"],
    ['a_skip_from_inside_the_test', "import { it } from 'vitest'\nit('waits', (context) => context.skip())\n"],
  ])('rejects_%s', async (_case, code) => {
    const broken = await rulesBrokenBy('src/entities/board/model/selectors.extra.test.ts', code)

    expect(broken).toContain('no-restricted-properties')
  })

  it('rejects_a_skip_in_a_component_test', async () => {
    const code = "import { it } from 'vitest'\nit.skip('renders', () => {})\n"

    const broken = await rulesBrokenBy('src/widgets/board/ui/Board.extra.test.tsx', code)

    expect(broken).toContain('no-restricted-properties')
  })

  it('rejects_a_skip_in_the_test_support', async () => {
    const code = "import { it } from 'vitest'\nexport const later = () => it.skip('waits', () => {})\n"

    const broken = await rulesBrokenBy('src/test/helpers/later.ts', code)

    expect(broken).toContain('no-restricted-properties')
  })
})

describe('exceptions live in the configuration', () => {
  it('does_not_let_a_comment_switch_a_rule_off_and_warns_about_the_comment', async () => {
    const code = "/* eslint-disable */\nimport { createPortal } from 'react-dom'\nexport const portal = createPortal\n"

    const messages = await lint('src/entities/board/model/portal.ts', code)

    expect(messages).toContainEqual(expect.objectContaining({ ruleId: 'no-restricted-imports', severity: 2 }))
    expect(messages).toContainEqual(
      expect.objectContaining({ ruleId: null, severity: 1, message: expect.stringContaining("'noInlineConfig'") }),
    )
  })

  it('counts_a_warning_as_an_error_in_the_lint_and_the_pre_commit_hook', () => {
    const manifest = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

    // The hook reads, besides .ts and .tsx, the extensions that src rejects.
    const commands = [manifest.scripts.lint, manifest['lint-staged']['*.{ts,tsx,js,jsx,mjs,cjs,mts,cts}']]

    expect(commands.every((command?: string) => command?.includes('--max-warnings=0'))).toBe(true)
  })
})
