---
name: react-fsd-maintainer
description: Pasos para crear un slice, bajar código a otra capa o arreglar un hallazgo de arquitectura del lint en el producto React. Úsala al añadir código en src o cuando la puerta lint falle por una regla de arquitectura
---

# Keeping the architecture of the React app

This is an aid to carry the work out, not a rule: what goes in each layer,
what may import what and what enforces each rule is said by
[docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md), and how the repository
is worked on, by `AGENTS.md`. The libraries and project conventions are in the
`kanban-board-conventions` skill. Where this skill disagrees with them, they
rule, and this skill is corrected in the same change.

## Creating a slice

1. **The layer.** Follow "Where new code goes" in
   [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md): new code starts in the
   page that uses it, and moves to a slice of its own when the second consumer
   appears.
2. **The folder.** `src/<layer>/<slice>/`, in kebab-case, with only the
   segments that will hold something.
3. **The public API first.** Write `<slice>/index.ts` with what other slices
   will use, and nothing else.
4. **The business rules**, as pure functions in `model` where they can be, with
   their test next to them (`<file>.test.ts`) in the same change; the
   components in `ui`, with their CSS Module and their test next to them
   (`<Component>.test.tsx`). Shared fixtures and helpers come from `@/test`.
5. **The gates.** `pnpm lint`, `pnpm run typecheck` and `pnpm test` to iterate;
   the change is done when `python verify.py` (`gates.txt`) is green.

## Moving code down to another layer

When a second page, widget or feature needs something that lives in another
slice:

1. Choose the destination with the same section of
   [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md): the highest layer that
   lies below every consumer.
2. Move the files with `git mv`, with their tests, so that the diff shows a
   move and not a deletion and a copy.
3. Export what moved from the destination's `<slice>/index.ts` and remove it
   from the origin's.
4. Change each import to the new `@/<layer>/<slice>`, and search `src` for the
   old path until none is left.
5. `python verify.py` green and, in the same change, the documents that
   named the old path.

## Fixing an architecture finding of the lint

What each rule of `eslint.config.js` asks for; the case that makes it fire is
in `eslint.config.test.ts`.

| Rule                                                            | What it found                                                                                                                                                                                                                   | Fix                                                                                                                                              |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fsd-lint/forbidden-imports`                                    | An import from a layer above                                                                                                                                                                                                    | Move what is shared to a lower layer, or pass it down from above as a prop or an argument                                                        |
| `fsd-lint/no-cross-slice-dependency`                            | An import from a sibling slice                                                                                                                                                                                                  | Move what is common to a lower layer, or compose both slices in the layer above                                                                  |
| `fsd-lint/no-public-api-sidestep`                               | An import that enters a slice without going through its index                                                                                                                                                                   | Export what is needed from `<slice>/index.ts` and import `@/<layer>/<slice>`                                                                     |
| `fsd-lint/no-relative-imports`                                  | A relative path that leaves its slice                                                                                                                                                                                           | Use the alias: `@/<layer>/<slice>`                                                                                                               |
| `fsd-gaps/boundaries`                                           | What the four rules above find in an import, in a re-export (`export … from`); or a dynamic `import()` from a layer above                                                                                                       | The fix of the fsd-lint row that says the same of an import; the message says which boundary it crosses                                          |
| `no-restricted-syntax`                                          | A file outside the six layers and `src/test`, or not `.ts` nor `.tsx` (such a file holding TypeScript or JSX shows as a Parsing error instead); in `model`, `api` or `lib`, a `.tsx` file or a dynamic import of UI or of React | Move the file to its layer and to TypeScript, or the component to `ui`; from React, import its hooks by name                                     |
| `no-restricted-imports`                                         | UI (the `shared/ui` kit included), styles, `react-dom`, a JSX runtime or React as a whole in `model`, `api` or `lib`                                                                                                            | Let the model return data and the view render it from `ui`; report to the visitor through `@/shared/toast`; from React, import its hooks by name |
| `no-restricted-imports`, or `no-restricted-syntax` when dynamic | An import of `@/test` from production code                                                                                                                                                                                      | Production code does not use the test support: move what it needs into a layer                                                                   |
| `no-restricted-globals`, `no-restricted-properties`             | A `fetch` or an `XMLHttpRequest` outside `src/shared/api`                                                                                                                                                                       | The app sends no requests; a network client is an owner decision, and it lives in `src/shared/api`                                               |
| `no-restricted-properties`, in a test or `src/test`             | A test that does not run: `.skip`, `.todo`, `skipIf` or `runIf`                                                                                                                                                                 | Make it pass or delete it                                                                                                                        |

A finding is not silenced by relaxing `eslint.config.js` or with an
`eslint-disable` comment (see [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md)):
a silence is an exception, an owner decision recorded in `docs/registry/decisions/`.
