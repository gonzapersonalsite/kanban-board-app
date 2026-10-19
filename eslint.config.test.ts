import { lstatSync, mkdtempSync, readFileSync, rmdirSync, symlinkSync, unlinkSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, posix } from 'node:path'
import { ESLint, type Linter } from 'eslint'
import { beforeAll, describe, expect, it } from 'vitest'
import type { TestProjectConfiguration } from 'vitest/config'
import viteConfig from './vite.config.ts'

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
      'a_folder_of_src_that_is_not_a_layer_re_exporting',
      'src/services/index.ts',
      "export { api } from './api'\n",
      'no-restricted-syntax',
    ],
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

  it('accepts_a_scoped_package_whose_name_starts_like_a_layer_which_is_not_the_alias', async () => {
    // Only '@/...' is the alias; '@app/tokens' is a package, not the app layer.
    const code = "import { tokens } from '@app/tokens'\nexport const theme = tokens\n"

    const reports = await reportsOn('src/entities/board/model/selectors.ts', code)

    expect(reports).toEqual([])
  })

  it('accepts_the_entry_point_in_the_app_layer', async () => {
    const code =
      "import { createRoot } from 'react-dom/client'\nimport App from './App'\ncreateRoot(document.body).render(<App />)\n"

    const reports = await reportsOn('src/app/main.tsx', code)

    expect(reports).toEqual([])
  })

  it('leaves_the_build_tooling_and_the_configuration_at_the_root_out_of_the_layers', async () => {
    const tooling = "import { buildShell } from './shell'\nexport const shell = buildShell\n"
    const configuration =
      "import { agentFilesPlugin } from './tooling/agent-files/vitePlugin'\nexport const plugin = agentFilesPlugin\n"

    const reports = [
      ...(await reportsOn('tooling/agent-files/vitePlugin.ts', tooling)),
      ...(await reportsOn('vite.config.ts', configuration)),
    ]

    expect(reports).toEqual([])
  })

  it('leaves_a_test_free_of_the_import_rules_of_the_layers', async () => {
    // A layer above, a sibling slice, a deep import and a relative path out of the slice,
    // imported, re-exported, imported dynamically and globbed.
    const code =
      "import { AddTaskForm } from '@/features/task-management'\nimport { TaskCard } from '@/entities/task'\nimport { TaskCardView } from '@/entities/task/ui/TaskCard'\nimport { Card } from '../../task'\nexport const parts = [AddTaskForm, TaskCard, TaskCardView, Card]\nexport { useColumnActions } from '@/features/column-management'\nexport { ColumnHeader } from '@/entities/column'\nexport { TaskCardBody } from '@/entities/task/ui/TaskCardBody'\nexport { TaskTitle } from '../../task/ui/TaskTitle'\nexport const load = () => import('@/features/column-management')\nexport const pages = import.meta.glob('../../../features/*/index.ts')\n"

    const reports = await reportsOn('src/entities/board/model/selectors.extra.test.ts', code)

    expect(reports).toEqual([])
  })
})

// The checks of fsd-gaps/boundaries a file breaks: one local rule, a message per check.
async function gapChecksBrokenBy(path: string, code: string): Promise<string[]> {
  const messages = await lint(path, code)
  return messages
    .filter((message) => message.severity === 2 && message.ruleId === 'fsd-gaps/boundaries')
    .map((message) => message.messageId ?? message.message)
    .sort()
}

describe('the layers over what fsd-lint 1.2.1 does not read: re-exports, a dynamic import() and import.meta.glob', () => {
  it.each([
    [
      'a_re_export_from_a_layer_above',
      'src/entities/board/model/selectors.ts',
      "export { AddTaskForm } from '@/features/task-management'\n",
      ['reExportFromAbove'],
    ],
    [
      'a_re_export_of_everything_from_a_layer_above',
      'src/entities/board/model/selectors.ts',
      "export * from '@/features/task-management'\n",
      ['reExportFromAbove'],
    ],
    [
      'a_relative_re_export_from_a_layer_above',
      'src/entities/board/model/selectors.ts',
      "export { AddTaskForm } from '../../../features/task-management'\n",
      ['reExportFromAbove', 'reExportOutOfSlice'],
    ],
    [
      'a_re_export_from_a_sibling_of_its_own_layer',
      'src/features/task-management/model/useTaskDialog.ts',
      "export { useColumnActions } from '@/features/column-management'\n",
      ['reExportFromSibling'],
    ],
    [
      'a_relative_re_export_from_a_sibling_of_its_own_layer',
      'src/features/task-management/model/useTaskDialog.ts',
      "export { useColumnActions } from '../../column-management'\n",
      ['reExportFromSibling', 'reExportOutOfSlice'],
    ],
    [
      'a_re_export_of_a_segment_instead_of_the_slice',
      'src/widgets/board/model/parts.ts',
      "export { selectActiveBoard } from '@/entities/board/model'\n",
      ['reExportPastPublicApi'],
    ],
    [
      'a_deep_re_export_from_an_entity',
      'src/widgets/board/ui/Board.tsx',
      "export { selectActiveBoard } from '@/entities/board/model/selectors'\n",
      ['reExportPastPublicApi'],
    ],
    [
      'a_deep_re_export_from_a_feature',
      'src/widgets/board/model/parts.ts',
      "export { useTaskDialog } from '@/features/task-management/model/useTaskDialog'\n",
      ['reExportPastPublicApi'],
    ],
    [
      'a_deep_re_export_from_a_widget',
      'src/pages/home/ui/HomePage.tsx',
      "export { Board } from '@/widgets/board/ui/Board'\n",
      ['reExportPastPublicApi'],
    ],
    [
      'a_deep_re_export_from_a_page',
      'src/app/router/ui/AppRouter.tsx',
      "export { HomePage } from '@/pages/home/ui/HomePage'\n",
      ['reExportPastPublicApi'],
    ],
    [
      'a_relative_re_export_that_leaves_its_slice',
      'src/features/task-management/model/parts.ts',
      "export { selectActiveBoard } from '../../../entities/board/model/selectors'\n",
      ['reExportOutOfSlice'],
    ],
    [
      'a_relative_re_export_that_leaves_src',
      'src/shared/lib/build.ts',
      "export { default } from '../../../vite.config'\n",
      ['reExportOutOfSlice'],
    ],
    [
      'a_dynamic_import_of_a_layer_above',
      'src/entities/board/model/lazy.ts',
      "export const load = () => import('@/features/task-management')\n",
      ['dynamicImportFromAbove'],
    ],
    [
      'a_dynamic_relative_import_of_a_layer_above',
      'src/entities/board/model/lazy.ts',
      "export const load = () => import('../../../features/task-management')\n",
      ['dynamicImportFromAbove'],
    ],
    [
      'a_re_export_from_a_layer_above_after_a_doubled_slash',
      'src/entities/board/model/selectors.ts',
      "export { AddTaskForm } from '@//features/task-management'\n",
      ['reExportFromAbove'],
    ],
    [
      'a_re_export_from_a_layer_above_through_a_dot_segment',
      'src/shared/lib/routes.ts',
      "export * from '@/./app/router'\n",
      ['reExportFromAbove'],
    ],
    [
      'a_re_export_from_a_sibling_reached_through_another_layer',
      'src/features/task-management/model/useTaskDialog.ts',
      "export { useColumnActions } from '@/shared/../features/column-management'\n",
      ['reExportFromSibling'],
    ],
    [
      'a_dynamic_import_of_a_layer_above_after_a_doubled_slash',
      'src/entities/board/model/lazy.ts',
      "export const load = () => import('@//features/task-management')\n",
      ['dynamicImportFromAbove'],
    ],
    [
      'a_deep_re_export_from_a_widget_after_a_doubled_slash',
      'src/pages/home/ui/HomePage.tsx',
      "export { Board } from '@//widgets/board/ui/Board'\n",
      ['reExportPastPublicApi'],
    ],
    [
      'a_re_export_from_a_layer_above_out_of_src_and_back_in',
      'src/entities/board/model/selectors.ts',
      "export { AddTaskForm } from '@/../src/features/task-management'\n",
      ['reExportFromAbove'],
    ],
    [
      'a_dynamic_relative_import_of_a_layer_above_out_of_src_and_back_in',
      'src/entities/board/model/lazy.ts',
      "export const load = () => import('../../../../src/features/task-management')\n",
      ['dynamicImportFromAbove'],
    ],
    [
      'a_glob_from_the_root_of_the_project',
      'src/entities/board/model/pages.ts',
      "export const pages = import.meta.glob('/src/pages/**/index.ts')\n",
      ['unreadableGlob'],
    ],
    [
      'a_glob_through_the_alias',
      'src/entities/board/model/app.ts',
      "export const app = import.meta.glob('@/app/*.tsx', { eager: true })\n",
      ['unreadableGlob'],
    ],
    [
      'a_glob_that_climbs_out_of_its_folder',
      'src/entities/board/model/features.ts',
      "export const features = import.meta.glob('../../../features/*/index.ts')\n",
      ['unreadableGlob'],
    ],
    [
      'a_glob_that_climbs_out_of_its_folder_past_a_first_segment',
      'src/entities/board/model/features.ts',
      "export const features = import.meta.glob('./../../../features/*/index.ts')\n",
      ['unreadableGlob'],
    ],
    [
      'a_dot_dot_inside_braces_which_the_lint_does_not_expand',
      'src/entities/board/model/features.ts',
      "export const features = import.meta.glob('./{..,model}/*.ts')\n",
      ['unreadableGlob'],
    ],
    [
      'a_glob_with_a_base_of_its_own',
      'src/entities/board/model/features.ts',
      "export const features = import.meta.glob('./*/index.ts', { base: '../../../features' })\n",
      ['unreadableGlob'],
    ],
    [
      'a_list_of_globs_with_one_that_climbs_out',
      'src/shared/lib/modules.ts',
      "export const modules = import.meta.glob(['./parts/*.ts', '../../app/*.tsx'])\n",
      ['unreadableGlob'],
    ],
    [
      'a_glob_whose_pattern_is_a_template_literal',
      'src/entities/board/model/parts.ts',
      'export const parts = import.meta.glob(`./parts/*.ts`)\n',
      ['unreadableGlob'],
    ],
    [
      'a_glob_whose_pattern_is_a_variable',
      'src/entities/board/model/parts.ts',
      "const pattern = './parts/*.ts'\nexport const parts = import.meta.glob(pattern)\n",
      ['unreadableGlob'],
    ],
    [
      'a_glob_whose_options_the_lint_cannot_read',
      'src/entities/board/model/parts.ts',
      "const options = { base: '../../../features' }\nexport const parts = import.meta.glob('./*/index.ts', options)\n",
      ['unreadableGlob'],
    ],
  ])('rejects_%s', async (_case, path, code, checks) => {
    const broken = await gapChecksBrokenBy(path, code)

    expect(broken).toEqual(checks)
  })

  it('accepts_globs_that_stay_inside_the_folder_of_their_file', async () => {
    const code =
      "export const locales = import.meta.glob('./locales/*.json', { eager: true, import: 'default' })\nexport const parts = import.meta.glob(['./parts/*.ts', './more/**/*.ts'])\n"

    const reports = await reportsOn('src/entities/board/model/parts.ts', code)

    expect(reports).toEqual([])
  })

  it('leaves_app_the_top_layer_free_to_glob_any_layer', async () => {
    const code = "export const pages = import.meta.glob('/src/pages/**/index.ts')\n"

    const reports = await reportsOn('src/app/routes.ts', code)

    expect(reports).toEqual([])
  })

  it('leaves_to_convention_a_file_at_the_root_of_a_layer_with_slices_whose_folder_holds_every_slice', async () => {
    // No rule refuses the file, and from there a glob inside its folder reaches the model of each entity, which
    // an import of one of them from the same file does not.
    const code = "export const models = import.meta.glob('./*/model/*.ts')\n"

    const reports = await reportsOn('src/entities/registry.ts', code)

    expect(reports).toEqual([])
  })

  it('accepts_re_exports_that_go_down_the_layers_through_each_public_api', async () => {
    // The public API named as fsd-lint takes it in an import: the folder, with or without
    // a trailing slash, or its index bare, with .ts or with the .js TypeScript resolves.
    const code =
      "export { useBoards } from '@/entities/board'\nexport * from '@/features/task-management'\nexport { useKanbanStore } from '@/shared/api'\nexport type { ActiveBoardState } from '@/entities/board/index'\nexport { selectActiveBoard } from '@/entities/board/index.ts'\nexport { BoardSelector } from '@/entities/board/index.js'\nexport { AddTaskForm } from '@/features/task-management/'\n"

    const reports = await reportsOn('src/pages/home/model/parts.ts', code)

    expect(reports).toEqual([])
  })

  it('accepts_a_re_export_through_a_public_api_named_with_a_doubled_slash', async () => {
    // TypeScript resolves '@/widgets//board' to the slice itself.
    const code = "export { Board } from '@/widgets//board'\n"

    const reports = await reportsOn('src/pages/home/ui/HomePage.tsx', code)

    expect(reports).toEqual([])
  })

  it('leaves_alone_what_the_alias_does_not_place_in_src_a_scoped_package_and_a_path_out_of_src', async () => {
    // '@app/tokens' is a package, not the alias, and '@/../app/config' resolves outside src.
    const code = "export { tokens } from '@app/tokens'\nexport { config } from '@/../app/config'\n"

    const reports = await reportsOn('src/entities/board/model/selectors.ts', code)

    expect(reports).toEqual([])
  })

  it('accepts_the_index_of_a_slice_re_exporting_its_own_segments', async () => {
    const code =
      "export { selectActiveBoard } from './model/selectors'\nexport type { ActiveBoardState } from './model/selectors'\nexport { BoardSelector } from './ui/BoardSelector'\n"

    const reports = await reportsOn('src/entities/board/index.ts', code)

    expect(reports).toEqual([])
  })

  it('accepts_relative_re_exports_between_the_segments_of_a_layer_without_slices', async () => {
    const reports = await reportsOn('src/shared/lib/index.ts', "export { useKanbanStore } from '../api'\n")

    expect(reports).toEqual([])
  })

  it('leaves_to_convention_a_re_export_into_its_own_slice_through_the_alias', async () => {
    // A cycle the lint does not see, as an import of its own slice through the alias.
    const code = "export { selectActiveBoard } from '@/entities/board/model/selectors'\n"

    const reports = await reportsOn('src/entities/board/index.ts', code)

    expect(reports).toEqual([])
  })

  it('accepts_a_dynamic_import_down_the_layers_and_inside_its_slice', async () => {
    const code =
      "export const loadBoard = () => import('@/widgets/board')\nexport const loadPage = () => import('./HomePage')\n"

    const reports = await reportsOn('src/pages/home/ui/lazy.ts', code)

    expect(reports).toEqual([])
  })

  it('leaves_alone_a_dynamic_import_whose_path_is_computed_which_no_rule_can_read', async () => {
    const code = 'export const load = (module: string) => import(module)\n'

    const reports = await reportsOn('src/shared/lib/load.ts', code)

    expect(reports).toEqual([])
  })

  // Left to convention: every rule reads the path of an import() only when it is a string literal, and none
  // reads a type that imports. A rule that starts reading them turns its case red, and the convention goes.
  it.each([
    [
      'a_dynamic_import_of_a_layer_above_whose_path_is_a_template_literal',
      'src/entities/board/model/lazy.ts',
      'export const load = () => import(`@/features/task-management`)\n',
    ],
    [
      'a_dynamic_import_of_a_sibling_slice_whose_path_is_a_template_literal',
      'src/features/task-management/model/lazy.ts',
      'export const load = () => import(`@/features/column-management`)\n',
    ],
    [
      'a_type_that_imports_a_layer_above_with_typeof_import',
      'src/entities/board/model/form.ts',
      "export type Form = typeof import('@/features/task-management')\n",
    ],
    [
      'a_type_that_imports_a_layer_above_with_import_type',
      'src/shared/lib/board.ts',
      "export type State = import('@/entities/board').ActiveBoardState\n",
    ],
  ])('leaves_to_convention_%s_which_no_rule_reads', async (_case, path, code) => {
    const reports = await reportsOn(path, code)

    expect(reports).toEqual([])
  })

  it('holds_in_a_project_reached_through_a_link_or_a_junction', async () => {
    // Node loads eslint.config.js by its real path, and ESLint names a file by the path it reached it by.
    const folder = mkdtempSync(join(tmpdir(), 'fsd-gaps-'))
    const project = join(folder, 'project')
    try {
      symlinkSync(import.meta.dirname, project, 'junction')
      const throughLink = new ESLint({ cwd: project })

      const [result] = await throughLink.lintText("export * from '@/app/router'\n", {
        filePath: 'src/shared/lib/up.ts',
      })

      expect(result.messages.map((message) => message.messageId)).toEqual(['reExportFromAbove'])
    } finally {
      // unlink removes the link itself, never what it points to.
      if (lstatSync(project, { throwIfNoEntry: false })) unlinkSync(project)
      rmdirSync(folder)
    }
  })
})

// The one exception of Feature-Sliced Design to slices that do not import each other: an entity B
// exposes to an entity A what A needs of it in B/@x/A.ts, and only A imports it, as @/entities/B/@x/A.
describe('the cross-imports of entities through @x', () => {
  it('accepts_an_entity_importing_what_another_entity_exposes_to_it_in_at_x', async () => {
    const code =
      "import type { Column } from '@/entities/column/@x/task'\nexport type Lane = Column\nexport const load = () => import('@/entities/column/@x/task')\n"

    const reports = await reportsOn('src/entities/task/model/task.ts', code)

    expect(reports).toEqual([])
  })

  it('accepts_the_at_x_file_re_exporting_its_own_slice', async () => {
    const reports = await reportsOn('src/entities/column/@x/task.ts', "export type { Column } from '../model/column'\n")

    expect(reports).toEqual([])
  })

  it.each([
    [
      'another_entity_than_the_one_it_is_exposed_to',
      'src/entities/board/model/board.ts',
      "import type { Column } from '@/entities/column/@x/task'\nexport type Lane = Column\n",
      'fsd-lint/no-cross-slice-dependency',
    ],
    [
      'a_slice_of_another_layer',
      'src/features/task-management/model/form.ts',
      "import type { Column } from '@/entities/column/@x/task-management'\nexport type Target = Column\n",
      'fsd-lint/no-public-api-sidestep',
    ],
    [
      'a_relative_path_to_the_at_x_file',
      'src/entities/task/model/task.ts',
      "import type { Column } from '../../column/@x/task'\nexport type Lane = Column\n",
      'fsd-lint/no-relative-imports',
    ],
    [
      'an_at_x_between_slices_of_a_layer_that_is_not_entities',
      'src/features/column-management/model/form.ts',
      "import type { Form } from '@/features/task-management/@x/column-management'\nexport type Draft = Form\n",
      'fsd-lint/no-cross-slice-dependency',
    ],
  ])('rejects_an_at_x_import_from_%s', async (_case, path, code, rule) => {
    const broken = await rulesBrokenBy(path, code)

    expect(broken).toContain(rule)
  })

  it('rejects_re_exporting_the_at_x_of_another_entity_which_would_hand_it_to_every_consumer_of_the_slice', async () => {
    const code = "export type { Column } from '@/entities/column/@x/task'\n"

    const broken = await gapChecksBrokenBy('src/entities/task/model/task.ts', code)

    expect(broken).toEqual(['reExportFromSibling', 'reExportPastPublicApi'])
  })

  it('leaves_to_convention_a_path_past_the_at_x_file_which_fsd_lint_accepts', async () => {
    // fsd-lint reads the slice of the consumer from the segment after @x and nothing below it.
    const code = "import type { Column } from '@/entities/column/@x/task/model'\nexport type Lane = Column\n"

    const reports = await reportsOn('src/entities/task/model/task.ts', code)

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

  it('leaves_to_convention_a_dynamic_import_of_ui_whose_path_is_a_template_literal_which_no_rule_reads', async () => {
    const code = 'export const load = () => import(`../ui/TaskDialog`)\n'

    const reports = await reportsOn('src/features/task-management/model/lazy.ts', code)

    expect(reports).toEqual([])
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
    const code =
      "import { createKanbanFixture } from '@/test/fixtures/kanbanFixtures'\nexport const fixture = createKanbanFixture\n"

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

  it('rejects_a_relative_re_export_of_it_from_production_code', async () => {
    const code = "export { createKanbanFixture } from '../../../test/fixtures/kanbanFixtures'\n"

    const broken = await gapChecksBrokenBy('src/features/task-management/ui/AddTaskForm.tsx', code)

    expect(broken).toEqual(['reExportOutOfSlice'])
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

describe('no network outside src/shared/api', () => {
  it.each([
    ['fetch', "export const load = () => fetch('/boards')\n", 'no-restricted-globals'],
    ['XMLHttpRequest', 'export const open = () => new XMLHttpRequest()\n', 'no-restricted-globals'],
    ['WebSocket', "export const open = () => new WebSocket('wss://boards.example.test')\n", 'no-restricted-globals'],
    ['EventSource', "export const open = () => new EventSource('/boards/events')\n", 'no-restricted-globals'],
    [
      'a_constant_read_from_WebSocket',
      'export const isOpen = (socket: { readyState: number }) => socket.readyState === WebSocket.OPEN\n',
      'no-restricted-globals',
    ],
    ['window_fetch', "export const load = () => window.fetch('/boards')\n", 'no-restricted-properties'],
    ['globalThis_fetch', "export const load = () => globalThis.fetch('/boards')\n", 'no-restricted-properties'],
    ['self_fetch', "export const load = () => self.fetch('/boards')\n", 'no-restricted-properties'],
    ['window_XMLHttpRequest', 'export const open = () => new window.XMLHttpRequest()\n', 'no-restricted-properties'],
    [
      'globalThis_XMLHttpRequest',
      'export const open = () => new globalThis.XMLHttpRequest()\n',
      'no-restricted-properties',
    ],
    [
      'globalThis_WebSocket',
      "export const open = () => new globalThis.WebSocket('wss://boards.example.test')\n",
      'no-restricted-properties',
    ],
    [
      'self_EventSource',
      "export const open = () => new self.EventSource('/boards/events')\n",
      'no-restricted-properties',
    ],
    [
      'navigator_sendBeacon',
      "export const send = () => navigator.sendBeacon('/log', '')\n",
      'no-restricted-properties',
    ],
    [
      'window_navigator_sendBeacon',
      "export const send = () => window.navigator.sendBeacon('/log', '')\n",
      'no-restricted-properties',
    ],
    [
      'fetch_taken_out_of_window',
      'const { fetch: send } = window\nexport const load = send\n',
      'no-restricted-properties',
    ],
    ['window_fetch_by_its_name', "export const load = () => window['fetch']('/boards')\n", 'no-restricted-properties'],
  ])('rejects_%s', async (_case, code, rule) => {
    const broken = await rulesBrokenBy('src/features/data-portability/model/exportBackup.ts', code)

    expect(broken).toContain(rule)
  })

  // ESLint puts the name it found in front of every message: the text after it is what tells them apart.
  it('names_a_request_as_one_the_app_does_not_send', async () => {
    const code = "export const load = () => fetch('/boards')\n"

    const [request] = await lint('src/features/data-portability/model/exportBackup.ts', code)

    expect(request.message).toContain('the app sends none')
  })

  // A global, a property of a global object and one of any object: three kinds of entry, each with its message.
  it.each([
    ['new_EventSource', "export const open = () => new EventSource('/boards/events')\n"],
    ['globalThis_WebSocket', "export const open = () => new globalThis.WebSocket('wss://boards.example.test')\n"],
    ['navigator_sendBeacon', "export const send = () => navigator.sendBeacon('/log', '')\n"],
  ])('names_%s_as_a_connection_the_app_does_not_open', async (_case, code) => {
    const [connection] = await lint('src/features/data-portability/model/events.ts', code)

    expect(connection.message).toContain('the app opens none')
    expect(connection.message).not.toContain('the app sends none')
  })

  it('accepts_fetch_and_a_connection_inside_src_shared_api', async () => {
    const code =
      "export const load = () => fetch('/boards')\nexport const open = () => new WebSocket('wss://boards.example.test')\n"

    const reports = await reportsOn('src/shared/api/transport.ts', code)

    expect(reports).toEqual([])
  })

  // Left to convention: examples of what the lint does not read, the ones docs/ARCHITECTURE.md names. A rule
  // that starts reading one turns its case red, and the convention goes.
  it.each([
    ['fetch_of_top', "export const load = () => top?.fetch('/boards')\n"],
    ['fetch_of_parent', "export const load = () => parent.fetch('/boards')\n"],
    ['fetch_of_frames', "export const load = () => frames.fetch('/boards')\n"],
    ['fetch_of_window_window', "export const load = () => window.window.fetch('/boards')\n"],
    ['fetch_of_document_defaultView', "export const load = () => document.defaultView?.fetch('/boards')\n"],
    ['fetch_read_with_Reflect_get', "export const load = () => Reflect.get(window, 'fetch')\n"],
    ['an_image_that_loads_an_address', "export const ping = () => {\n  new Image().src = '/log'\n}\n"],
    ['an_audio_element_that_loads_an_address', "export const ping = () => new Audio('/ping').play()\n"],
    ['an_import_of_an_address', "export const load = () => import('https://cdn.example.test/boards.js')\n"],
    ['a_Worker', "export const start = () => new Worker('/worker.js')\n"],
    ['a_SharedWorker', "export const start = () => new SharedWorker('/worker.js')\n"],
    ['a_service_worker', "export const install = () => navigator.serviceWorker.register('/sw.js')\n"],
    ['an_RTCPeerConnection', 'export const open = () => new RTCPeerConnection()\n'],
    ['a_WebTransport', "export const open = () => new WebTransport('https://boards.example.test')\n"],
    ['a_WebSocketStream', "export const open = () => new WebSocketStream('wss://boards.example.test')\n"],
    ['fetchLater', "export const later = () => fetchLater('/log')\n"],
  ])('leaves_to_convention_%s_which_no_rule_reads', async (_case, code) => {
    const reports = await reportsOn('src/features/data-portability/model/exportBackup.ts', code)

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

  it.each([
    ['a_skip_in_the_options_of_it', "import { it } from 'vitest'\nit('waits', { skip: true }, () => {})\n"],
    ['a_todo_in_the_options_of_test', "import { test } from 'vitest'\ntest('later', { todo: true })\n"],
    [
      'a_skip_in_the_options_of_describe',
      "import { describe } from 'vitest'\ndescribe('waits', { skip: true }, () => {})\n",
    ],
    ['a_todo_in_the_options_of_suite', "import { suite } from 'vitest'\nsuite('later', { todo: true }, () => {})\n"],
    [
      'a_skip_in_the_options_of_describe_concurrent',
      "import { describe } from 'vitest'\ndescribe.concurrent('waits', { skip: true }, () => {})\n",
    ],
    [
      'a_skip_in_the_options_of_a_case_of_it_each',
      "import { it } from 'vitest'\nit.each([1])('waits for %i', { skip: true }, () => {})\n",
    ],
    [
      'a_skip_in_the_options_of_a_case_of_it_each_with_a_table',
      "import { it } from 'vitest'\nit.each`\n  n\n  ${1}\n`('waits for $n', { skip: true }, () => {})\n",
    ],
    [
      'a_todo_in_the_options_of_a_case_of_test_for_with_a_table',
      "import { test } from 'vitest'\ntest.for`\n  n\n  ${1}\n`('later for $n', { todo: true }, () => {})\n",
    ],
    [
      'a_skip_in_the_options_of_a_suite_of_describe_each_with_a_table',
      "import { describe } from 'vitest'\ndescribe.each`\n  n\n  ${1}\n`('waits for $n', { skip: true }, () => {})\n",
    ],
    ['a_skip_named_by_a_string', "import { it } from 'vitest'\nit('waits', { 'skip': true }, () => {})\n"],
    ['a_todo_named_by_a_computed_string', "import { it } from 'vitest'\nit('later', { ['todo']: true }, () => {})\n"],
    ['a_skip_named_by_a_template_literal', "import { it } from 'vitest'\nit('waits', { [`skip`]: true }, () => {})\n"],
    [
      'a_skip_whose_value_is_computed',
      "import { it } from 'vitest'\nit('waits', { skip: !process.env.CI }, () => {})\n",
    ],
    ['options_written_as_const', "import { it } from 'vitest'\nit('waits', { skip: true } as const, () => {})\n"],
    [
      'options_checked_with_satisfies',
      "import { it, type TestOptions } from 'vitest'\nit('later', { todo: true } satisfies TestOptions, () => {})\n",
    ],
    [
      'options_under_an_angle_bracket_assertion',
      "import { it, type TestOptions } from 'vitest'\nit('waits', <TestOptions>{ skip: true }, () => {})\n",
    ],
    ['options_with_a_non_null_assertion', "import { it } from 'vitest'\nit('waits', ({ skip: true })!, () => {})\n"],
  ])('rejects_%s', async (_case, code) => {
    const broken = await rulesBrokenBy('src/entities/board/model/selectors.extra.test.ts', code)

    expect(broken).toContain('tests/no-skip-option')
  })

  it('rejects_a_skip_option_in_the_test_support', async () => {
    const code = "import { it } from 'vitest'\nexport const later = () => it('waits', { skip: true }, () => {})\n"

    const broken = await rulesBrokenBy('src/test/helpers/later.ts', code)

    expect(broken).toContain('tests/no-skip-option')
  })

  // The tests gate of the scaffold's layer turns these red from Vitest's report (--forbid-skipped), and
  // docs/ARCHITECTURE.md names them: a rule that learns to read one turns its case red here.
  it.each([
    [
      'options_held_in_a_variable',
      "import { it } from 'vitest'\nconst options = { skip: true }\nit('waits', options, () => {})\n",
    ],
    [
      'options_brought_in_with_a_spread',
      "import { it } from 'vitest'\nconst off = { skip: true }\nit('waits', { ...off }, () => {})\n",
    ],
    [
      'a_key_computed_from_a_name',
      "import { it } from 'vitest'\nconst KEY = 'skip'\nit('waits', { [KEY]: true }, () => {})\n",
    ],
    [
      'an_it_imported_under_another_name',
      "import { it as check } from 'vitest'\ncheck('waits', { skip: true }, () => {})\n",
    ],
    ['an_it_read_from_an_object', "import * as vitest from 'vitest'\nvitest.it('waits', { skip: true }, () => {})\n"],
    ['an_it_with_no_function', "import { it } from 'vitest'\nit('later')\n"],
  ])('leaves_%s_to_the_tests_gate_which_the_rule_does_not_read', async (_case, code) => {
    const broken = await rulesBrokenBy('src/entities/board/model/selectors.extra.test.ts', code)

    expect(broken).not.toContain('tests/no-skip-option')
  })

  it('accepts_a_skip_or_a_todo_set_to_false_which_runs_the_test', async () => {
    const code =
      "import { describe, expect, it } from 'vitest'\ndescribe('runs', { skip: false }, () => {\n  it('runs too', { todo: false }, () => expect(1).toBe(1))\n})\n"

    const reports = await reportsOn('src/entities/board/model/selectors.extra.test.ts', code)

    expect(reports).toEqual([])
  })

  it('accepts_a_fixture_named_todo_which_is_no_option_of_a_test', async () => {
    const code = "import { test } from 'vitest'\nexport const withTodo = test.extend({ todo: 'write the tests' })\n"

    const reports = await reportsOn('src/entities/board/model/selectors.extra.test.ts', code)

    expect(reports).toEqual([])
  })

  it('keeps_its_rule_where_another_block_gives_no_restricted_syntax_its_own_options', async () => {
    // A test outside the layers: the block that refuses the file replaces no option of the test's rule.
    const code = "import { it } from 'vitest'\nit('waits', { skip: true }, () => {})\n"

    const broken = await rulesBrokenBy('src/services/report.test.ts', code)

    expect(broken).toEqual(expect.arrayContaining(['no-restricted-syntax', 'tests/no-skip-option']))
  })
})

// What the lint makes of a file at a path: a test it reads as one, a file it refuses, or code.
// The probe trips the rule of every test that runs and, in src, the rules of the layers.
const PROBE =
  "import { it } from 'vitest'\nimport { ColumnMenu } from '@/features/column-management/ui/ColumnMenu'\nit.skip(String(ColumnMenu), () => {})\n"

async function lintVerdictOf(path: string): Promise<'test' | 'refused' | 'code' | 'inconsistent'> {
  const broken = await rulesBrokenBy(path, PROBE)
  if (broken.includes('tests/no-stray-file')) return 'refused'
  const readAsTest = broken.includes('no-restricted-properties')
  const readByTheLayers = broken.some((rule) => rule.startsWith('fsd-lint/'))
  if (readAsTest && !readByTheLayers) return 'test'
  if (!readAsTest && readByTheLayers === path.startsWith('src/')) return 'code'
  return 'inconsistent'
}

// Where Vitest looks for tests, read from the projects of the real vite.config.ts.
function includeOf(project: TestProjectConfiguration): string[] {
  if (typeof project === 'object' && !(project instanceof Promise) && project.test?.include) {
    return project.test.include
  }
  throw new Error('a project of vite.config.ts that this test cannot read: declare it inline, with its include')
}
function vitestInclude(): string[] {
  const projects = viteConfig.test?.projects
  if (projects === undefined) {
    throw new Error('vite.config.ts declares no test projects, the only place this test reads where Vitest looks')
  }
  return projects.flatMap(includeOf)
}
const VITEST_INCLUDE = vitestInclude()
const vitestRuns = (path: string): boolean => VITEST_INCLUDE.some((pattern) => posix.matchesGlob(path, pattern))

describe('every test is where Vitest runs it', () => {
  it.each([
    ['a_spec_ts_in_src', 'src/entities/board/model/selectors.spec.ts'],
    ['a_spec_tsx_in_src', 'src/entities/task/ui/TaskCard.spec.tsx'],
    ['a_story_in_src', 'src/entities/task/ui/TaskCard.stories.tsx'],
    ['a_story_written_as_ts', 'src/entities/task/ui/TaskCard.stories.ts'],
    ['a_test_outside_the_folders_vitest_runs', 'scripts/check.test.ts'],
    ['a_spec_ts_in_tooling', 'tooling/agent-files/shell.spec.ts'],
    ['a_test_tsx_in_tooling_whose_project_runs_test_ts_only', 'tooling/agent-files/shell.test.tsx'],
    ['a_test_tsx_at_the_root_whose_project_runs_test_ts_only', 'vite.config.test.tsx'],
    ['a_test_in_javascript', 'scripts/check.test.mjs'],
  ])('rejects_%s', async (_case, path) => {
    const code = "import { expect, it } from 'vitest'\nit('fails', () => expect(1).toBe(2))\n"

    const broken = await rulesBrokenBy(path, code)

    expect(broken).toContain('tests/no-stray-file')
  })

  // A project Vitest runs is declared twice: in vite.config.ts, and in the list the lint reads it from.
  it('tells_a_test_outside_vitest_that_a_new_project_goes_in_vite_config_and_in_eslint_config', async () => {
    const code = "import { expect, it } from 'vitest'\nit('runs', () => expect(1).toBe(1))\n"

    const messages = await lint('scripts/check.test.ts', code)

    const stray = messages.find((message) => message.ruleId === 'tests/no-stray-file')
    expect(stray?.message).toContain('a project for it in vite.config.ts')
    expect(stray?.message).toContain('VITEST_TESTS of eslint.config.js')
  })

  it('holds_the_rules_of_the_layers_over_a_story_which_the_default_list_of_fsd_lint_would_take_for_a_test', async () => {
    const code =
      "import { App } from '@/app/App'\nimport { AddTaskForm } from '@/features/task-management'\nimport { HomePage } from '@/pages/home'\nexport const parts = [App, AddTaskForm, HomePage]\n"

    const broken = await rulesBrokenBy('src/entities/task/ui/TaskCard.stories.ts', code)

    expect(broken).toEqual(expect.arrayContaining(['tests/no-stray-file', 'fsd-lint/forbidden-imports']))
  })

  it('refuses_the_file_without_replacing_the_options_another_block_gives_no_restricted_syntax', async () => {
    const code = "export const load = () => import('../ui/BoardSelector')\n"

    const broken = await rulesBrokenBy('src/entities/board/model/selectors.spec.ts', code)

    expect(broken).toEqual(expect.arrayContaining(['tests/no-stray-file', 'no-restricted-syntax']))
  })

  // Vitest runs a file exactly when the lint reads it as a test: a project of vite.config.ts that looks
  // somewhere else, or a lint that reads another suffix, turns a row red. The root's .test.ts files run in
  // the tooling project.
  const REPRESENTATIVE: [string, 'test' | 'refused' | 'code'][] = [
    ['src/entities/board/model/selectors.test.ts', 'test'],
    ['src/app/App.test.tsx', 'test'],
    ['tooling/agent-files/site.test.ts', 'test'],
    ['eslint.config.test.ts', 'test'],
    ['vite.config.test.ts', 'test'],
    ['src/entities/board/model/selectors.spec.ts', 'refused'],
    ['src/pages/home/ui/HomePage.spec.tsx', 'refused'],
    ['src/entities/task/ui/TaskCard.stories.tsx', 'refused'],
    ['tooling/agent-files/shell.test.tsx', 'refused'],
    ['tooling/agent-files/shell.spec.ts', 'refused'],
    ['scripts/check.test.ts', 'refused'],
    ['vite.config.test.tsx', 'refused'],
    ['src/entities/board/model/selectors.ts', 'code'],
    // Only a name that ends in a suffix is a test: fsd-lint, left to itself, matches it anywhere in the path.
    ['src/entities/board/model/rows.test.tsv.ts', 'code'],
    ['tooling/agent-files/site.ts', 'code'],
  ]

  it.each(REPRESENTATIVE)('reads_%s_as_vitest_does_%s', async (path, verdict) => {
    const read = await lintVerdictOf(path)
    const runs = vitestRuns(path)

    expect(read).toBe(verdict)
    expect(runs).toBe(verdict === 'test')
  })

  it('has_a_test_row_for_every_place_vitest_looks', () => {
    const tests = REPRESENTATIVE.filter(([, verdict]) => verdict === 'test').map(([path]) => path)

    const unrepresented = VITEST_INCLUDE.filter((pattern) => !tests.some((path) => posix.matchesGlob(path, pattern)))

    expect(unrepresented).toEqual([])
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

  it('counts_a_warning_as_an_error_in_the_lint', () => {
    const manifest = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'))

    expect(manifest.scripts.lint).toContain('--max-warnings=0')
  })
})
