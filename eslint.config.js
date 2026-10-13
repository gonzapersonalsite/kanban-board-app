import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import prettierConfig from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'
import fsdPlugin from 'eslint-plugin-fsd-lint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import ts from 'typescript'
import tseslint from 'typescript-eslint'
import fsdGaps from './eslint-fsd-gaps.js'

// The layers of Feature-Sliced Design, from the top down: the only folders src/ holds besides the test support.
const LAYERS = ['app', 'pages', 'widgets', 'features', 'entities', 'shared']
// The layers split into slices, each entered through its index.ts only.
const SLICED_LAYERS = ['pages', 'widgets', 'features', 'entities']
// src/ and its alias as tsconfig.app.json declares it ("@/*": ["./src/*"]), read with TypeScript's own
// parser: that file holds comments and a byte order mark, which JSON.parse rejects.
const SRC = fileURLToPath(new URL('src', import.meta.url))
const tsconfigApp = ts.parseConfigFileTextToJson(
  'tsconfig.app.json',
  readFileSync(new URL('tsconfig.app.json', import.meta.url), 'utf8'),
)
if (tsconfigApp.error) {
  throw new Error(`tsconfig.app.json: ${ts.flattenDiagnosticMessageText(tsconfigApp.error.messageText, '\n')}`)
}
const { paths } = tsconfigApp.config.compilerOptions
const SRC_ALIAS = Object.keys(paths)
  .find((alias) => paths[alias].includes('./src/*'))
  ?.replace('*', '')
// The fixtures, helpers and setup the tests share: the one folder of src/ that is not a
// layer, a decided deviation of docs/ARCHITECTURE.md. Only test code imports it.
const TEST_SUPPORT = 'src/test/**'
// The segments that hold logic and no UI.
const LOGIC_SEGMENTS = 'src/**/{model,api,lib}/**'
const TESTS = '**/*.test.{ts,tsx}'
const TEST_CODE = [TESTS, TEST_SUPPORT]
// Code src/ may not hold: every rule of this file reads .ts and .tsx files only.
const OTHER_CODE = 'src/**/*.{js,jsx,mjs,cjs,mts,cts}'

const NO_UI_IN_LOGIC =
  'model, api and lib hold logic: a component, its styles and what renders it live in the ui segment.'
const NO_TEST_SUPPORT_IN_PRODUCTION = 'src/test holds the support of the tests: production code never imports it.'
const ONLY_SHARED_API =
  'only src/shared/api may send requests, and the app sends none: its data stays in the browser, and a network client there is an owner decision.'
const EVERY_TEST_RUNS =
  'a test that does not run checks nothing: make it pass or delete it; an exception is decided in eslint.config.js.'

// What production code may not import, statically or dynamically: the test support.
const TEST_SUPPORT_MODULES = ['^@/test(/|$)']
// What a logic segment may not import, statically or dynamically: a ui segment,
// any entry of react-dom, the JSX runtimes and stylesheets.
const UI_MODULES = [
  '(^|/)ui(/|$)',
  '^react-dom(/|$)',
  '^react/jsx(-dev)?-runtime$',
  String.raw`\.(css|scss|sass|less|styl|stylus|pcss|postcss|sss)(\?.*)?$`,
]
// no-restricted-imports reads static imports only: a dynamic import of the same
// modules is matched as syntax. A selector's regex escapes its slashes.
function dynamicImportOf(modules, message) {
  const source = modules
    .map((module) => `(${module})`)
    .join('|')
    .replaceAll('/', String.raw`\/`)
  return { selector: `ImportExpression[source.value=/${source}/]`, message }
}
const NO_TEST_SUPPORT_IMPORT = TEST_SUPPORT_MODULES.map((regex) => ({ regex, message: NO_TEST_SUPPORT_IN_PRODUCTION }))
const NO_TEST_SUPPORT_DYNAMIC_IMPORT = dynamicImportOf(TEST_SUPPORT_MODULES, NO_TEST_SUPPORT_IN_PRODUCTION)
const NO_UI_DYNAMIC_IMPORT = dynamicImportOf([...UI_MODULES, '^react$'], NO_UI_IN_LOGIC)

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  // A comment cannot switch a rule off: an exception lives in this file, next to its decision.
  { linterOptions: { noInlineConfig: true } },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, tseslint.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-refresh': reactRefresh,
      'fsd-lint': fsdPlugin,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'fsd-lint/forbidden-imports': 'error',
      'fsd-lint/no-cross-slice-dependency': 'error',
      'fsd-lint/no-relative-imports': 'error',
      'fsd-lint/no-public-api-sidestep': [
        'error',
        { layers: SLICED_LAYERS, publicApi: { allowSegmentImports: false } },
      ],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  {
    // fsd-lint 1.2.1 reads no re-export (export … from), and fsd-lint/forbidden-imports no dynamic import():
    // the local rule holds the same boundaries over them (eslint-fsd-gaps.js).
    files: ['src/**/*.{ts,tsx}'],
    ignores: [TESTS],
    plugins: { 'fsd-gaps': fsdGaps },
    rules: {
      'fsd-gaps/boundaries': ['error', { root: SRC, alias: SRC_ALIAS, layers: LAYERS, slicedLayers: SLICED_LAYERS }],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: TEST_CODE,
    rules: {
      'no-restricted-imports': ['error', { patterns: NO_TEST_SUPPORT_IMPORT }],
      'no-restricted-syntax': ['error', NO_TEST_SUPPORT_DYNAMIC_IMPORT],
    },
  },
  {
    files: [`${LOGIC_SEGMENTS}/*.{ts,tsx}`],
    ignores: TEST_CODE,
    rules: {
      // The whole lists again: a later config object replaces the options an earlier one gave a rule.
      'no-restricted-imports': [
        'error',
        {
          // React itself only by name: its hooks are logic, an element is not.
          paths: [
            { name: 'react', importNames: ['default', 'createElement', 'cloneElement'], message: NO_UI_IN_LOGIC },
          ],
          patterns: [...NO_TEST_SUPPORT_IMPORT, ...UI_MODULES.map((regex) => ({ regex, message: NO_UI_IN_LOGIC }))],
        },
      ],
      'no-restricted-syntax': ['error', NO_TEST_SUPPORT_DYNAMIC_IMPORT, NO_UI_DYNAMIC_IMPORT],
    },
  },
  {
    files: [`${LOGIC_SEGMENTS}/*.tsx`],
    ignores: TEST_CODE,
    rules: {
      // The whole list again: a later config object replaces the options an earlier one gave this rule.
      'no-restricted-syntax': [
        'error',
        { selector: 'Program', message: `A .tsx file is UI: ${NO_UI_IN_LOGIC}` },
        NO_TEST_SUPPORT_DYNAMIC_IMPORT,
        NO_UI_DYNAMIC_IMPORT,
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/shared/api/**', ...TEST_CODE],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: ONLY_SHARED_API },
        { name: 'XMLHttpRequest', message: ONLY_SHARED_API },
      ],
      'no-restricted-properties': [
        'error',
        ...['window', 'globalThis', 'self'].map((object) => ({
          object,
          property: 'fetch',
          message: ONLY_SHARED_API,
        })),
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: [...LAYERS.map((layer) => `src/${layer}/**`), TEST_SUPPORT],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program',
          message: `src/ holds only the layers ${LAYERS.join(', ')} and the test support in src/test: this file belongs in one of them.`,
        },
      ],
    },
  },
  {
    files: [OTHER_CODE],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program',
          message: 'src/ holds TypeScript in .ts and .tsx files, the only ones these rules read.',
        },
      ],
    },
  },
  {
    // A committed .only is rejected by Vitest itself (allowOnly in vite.config.ts).
    files: TEST_CODE,
    rules: {
      'no-restricted-properties': [
        'error',
        ...['skip', 'todo', 'skipIf', 'runIf'].map((property) => ({ property, message: EVERY_TEST_RUNS })),
      ],
    },
  },
  {
    // fsd-lint 1.2.1 skips tests in this rule only on POSIX (it matches the path unnormalised): off on every OS.
    files: [TESTS],
    rules: { 'fsd-lint/no-relative-imports': 'off' },
  },
  prettierConfig,
])
