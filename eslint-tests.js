// What keeps every test running, held by rules of this repository: a test is a file Vitest runs, and
// none of its cases is switched off through its options object. They are rules of their own, not
// no-restricted-syntax selectors, because a later block of eslint.config.js that gives
// no-restricted-syntax its own options replaces every option an earlier one gave it.

// The functions Vitest declares a test or a suite with, called by these names: bare, through a modifier
// (describe.concurrent) or after a table, an array or a template (it.each([...]), it.each`...`, test.for`...`).
const DECLARERS = new Set(['it', 'test', 'describe', 'suite'])
// What it.skip and it.todo say through the options object instead: it('…', { skip: true }, fn).
const NOT_RUN = new Set(['skip', 'todo'])

/** The identifier a callee starts from: describe for describe.concurrent, it for it.each([...]) and it.each`...`. */
function rootOf(callee) {
  if (callee.type === 'Identifier') return callee.name
  if (callee.type === 'MemberExpression') return rootOf(callee.object)
  if (callee.type === 'CallExpression') return rootOf(callee.callee)
  if (callee.type === 'TaggedTemplateExpression') return rootOf(callee.tag)
  return null
}

/**
 * The name of a property written as an identifier or a string, computed or not, a template literal with
 * nothing to fill in included; null otherwise.
 */
function keyOf(property) {
  if (property.type !== 'Property') return null
  const { key } = property
  if (key.type === 'Identifier' && !property.computed) return key.name
  if (key.type === 'Literal' && typeof key.value === 'string') return key.value
  if (key.type === 'TemplateLiteral' && key.expressions.length === 0) return key.quasis[0].value.cooked
  return null
}

// What TypeScript wraps around an expression without changing its value: { skip: true } as const,
// <TestOptions>{ skip: true } and ({ skip: true })! are still that object.
const TYPE_WRAPPERS = new Set(['TSAsExpression', 'TSSatisfiesExpression', 'TSTypeAssertion', 'TSNonNullExpression'])

/** The expression under every type wrapper. */
function withoutTypes(node) {
  return TYPE_WRAPPERS.has(node?.type) ? withoutTypes(node.expression) : node
}

// skip: false and todo: false run the test; any other value, a computed one included, may not.
const runsAnyway = (property) => property.value.type === 'Literal' && property.value.value === false

const noSkipOption = {
  meta: {
    type: 'problem',
    docs: { description: 'A test or a suite switched off through its options object.' },
    schema: [],
    messages: {
      notRun:
        "'{{key}}' in the options of {{declarer}}() keeps it from running, and a test that does not run checks nothing: make it pass or delete it; an exception is decided in eslint.config.js.",
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        const declarer = rootOf(node.callee)
        // The options are the second argument, after the name: test.extend({ todo }) names a fixture.
        const options = withoutTypes(node.arguments[1])
        if (!DECLARERS.has(declarer) || options?.type !== 'ObjectExpression') return
        for (const property of options.properties) {
          const key = keyOf(property)
          if (NOT_RUN.has(key) && !runsAnyway(property)) {
            context.report({ node: property, messageId: 'notRun', data: { key, declarer } })
          }
        }
      },
    }
  },
}

const noStrayFile = {
  meta: {
    type: 'problem',
    docs: { description: 'A file named as a test or a story that Vitest does not run.' },
    // Which kind of name the block that switches the rule on matched, by its path.
    schema: [{ enum: ['spec', 'story', 'outsideVitest'] }],
    messages: {
      spec: 'A test is named <file>.test.ts or <file>.test.tsx, the one suffix that the lint and Vitest read as a test: rename this .spec file.',
      story:
        "Nothing in the product runs a story, and fsd-lint's default list would take it for a test: the product has no Storybook until eslint.config.js and vite.config.ts decide it.",
      outsideVitest:
        'No project of vite.config.ts runs a test here, so its cases never run: move it where one looks, or add a project for it in vite.config.ts and its include to VITEST_TESTS of eslint.config.js.',
    },
  },
  create(context) {
    return {
      Program(node) {
        context.report({ node, messageId: context.options[0] })
      },
    }
  },
}

export default { meta: { name: 'tests' }, rules: { 'no-skip-option': noSkipOption, 'no-stray-file': noStrayFile } }
