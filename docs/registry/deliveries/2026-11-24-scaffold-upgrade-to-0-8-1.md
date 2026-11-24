---
title: Actualización a agentic-scaffold 0.8.1 y auditoría sobre el árbol de trabajo
date: 2026-11-24
phase: none
---
**Objetivo y dueño:** herramientas de desarrollo; mantenimiento del andamio
encargado por el dueño para dejar cada repositorio consumidor en consonancia
con su plantilla. Lleva el motor de 0.7.0 (commit `d086d1e` del catálogo, la
entrega `#2026-11-22-scaffold-upgrade-to-0-7-0`) a 0.8.1 (commit `80d58c7`),
con los componentes `layer:react-vite` y `stack:react-fsd` registrados en
`2e152c6`, cuyas piezas el catálogo no cambió. No abre ni cierra ninguna fase
ni tramo, y no toca el producto. Palabras del dueño en el encargo: «Lanza un
sub-agente por proyecto que remedie de forma correcta y deje actualizado y
commit y push en cada repo final».

**Qué cambió.**

- **Lo que tomó la herramienta (plan `5cd80620450e`, sin rechazos ni
  conflictos):** `docs/ACTUALIZAR.md`, `tools/board/components.py`,
  `tools/board/instantiate.py` y `tools/board/test_board.py`, que la plantilla
  cambió y la instancia no; reescribió `tools/board/MANIFEST.txt` (versión
  0.8.1 y los cuatro sellos) y `tools/board/components.txt` (la leyenda gana
  la clave `delivered` y `applied` pasa a `80d58c7`). Otros 23 ficheros del
  motor estaban al día: no se añadió ni se quitó ninguno.
- **Componentes:** las 23 piezas y líneas de `layer:react-vite` estaban al
  día. De `stack:react-fsd`, 11 al día; se dejaron con su parche local, porque
  la plantilla no los cambió, `docs/ARCHITECTURE.md`, `eslint.config.js`,
  `eslint.config.test.ts` y seis ficheros de `tooling/agent-files/`
  (`generate.test.ts`, `llmsTxt.ts`, `shell.ts`, `vitePlugin.ts` y los tests
  de estos dos); y siguen siendo del producto (`kept`) el cliente HTTP con su
  test y `vitest.setup.ts`. Los dos componentes siguen registrados en
  `2e152c6`.
- **Qué trae el motor:** 0.8.0 enseña a `instantiate.py` y a `components.py`
  las guías que un starter entrega como documento del producto; 0.8.1 corrige
  la lectura de `root = true` al fusionar un `.editorconfig`. Ninguna de las
  dos cosas escribe nada en una instancia ya creada.
- **Conciliado a mano y cerrado con `--done`, los dos pendientes del plan:**
  - `AGENTS.md`, regla dura 3. El párrafo de la instancia era el del andamio
    0.7.0 sin adaptar, así que queda como el de 0.8.1: la auditoría es del
    árbol de trabajo (`git status --short`, `git diff` y cada fichero nuevo
    entero), el trabajo verificado se deja sin preparar, y preparar con
    `git add` es parte de commitear, con la autorización y confirmado por
    `git diff --cached --stat`. Lo propio de la instancia no se tocó y sigue
    siendo su única diferencia con el contrato de 0.8.1: las seis viñetas del
    §3 y la fila de `docs/ARCHITECTURE.md` del §4 que escribió la capa, las
    líneas de `kanban-board-conventions` y `react-fsd-maintainer` del §9, y
    el formato de su markdown (la tabla alineada del §4 y las cursivas con
    guion bajo).
  - `.agents/skills/audit-before-commit/SKILL.md`. Era la de 0.7.0 con una
    línea en blanco tras la cabecera y queda la de 0.8.1 con esa misma línea:
    los pasos auditan el árbol de trabajo y gana el noveno, preparar por
    nombre de ruta con la autorización. La línea de su índice en el §9 del
    contrato no cambia.
- **Redacción antigua:** `git grep` de la auditoría de lo preparado ya no la
  encuentra fuera de las entregas anteriores, que no se reescriben;
  `git diff --cached` solo queda como la confirmación tras `git add`, en el
  contrato y en la skill.
- **Las correcciones del starter React (commit `781300f` del catálogo) no se
  portan, porque el producto no conserva el código de la muestra.** El
  catálogo las pide «where the product still has the sample's code». Se
  compararon, para cada una, la muestra en `2e152c6`, la muestra en `80d58c7`
  y el fichero del producto, y aquí todo está reescrito con otro diseño:
  `src/app/styles/global.css` es un sistema de tokens propio, la tarea es una
  tarjeta sin casilla (`src/entities/task/ui/TaskCard.tsx`) y el alta es
  `src/features/task-management/ui/AddTaskForm.tsx`, por columna y contra el
  store. Lo que el código propio hace en esos tres frentes se miró en el
  código, sin navegador, y no se cambió:
  - _Tamaño de letra de la raíz._ El defecto de la muestra no está: ni
    `:root` ni `html` fijan un tamaño en `src/app/styles/global.css`, y `body`
    toma `--font-size-body`, un `clamp()` en `rem`; el indicador de arranque
    de `index.html` fija el suyo (`1rem` y `1.125rem`), así que no crece al
    llegar la hoja. Sí hay tamaños en píxeles que no siguen el que elija el
    lector: `src/app/providers/ErrorBoundary.module.css` (20 y 14 px),
    `src/features/drag-and-drop/ui/BoardDndContext.module.css` (14 px),
    `src/features/task-management/ui/TaskDialog.module.css` (13 px),
    `src/shared/ui/Textarea/Textarea.module.css` (14 px) y
    `src/widgets/board/ui/EmptyColumnMessage.module.css` (13 px). Los 16 px
    de `src/shared/ui/Input/Input.module.css` y del área de texto bajo
    `pointer: coarse` son deliberados: su comentario dice que evitan el zoom
    de iOS al enfocar.
  - _Texto que escribe el usuario._ El defecto de la muestra no se ve en el
    código: el título y la descripción de la tarjeta cortan con
    `word-break: break-word` sobre `min-width: 0`
    (`src/entities/task/ui/TaskCard.module.css`), como el nombre del tablero
    al borrarlo, el aviso y la celda del calendario; el título de la columna y
    el del selector se recortan con puntos suspensivos.
  - _Ids de formulario._ El alta de tarea no comparte id: el de su error
    lleva el de la columna (`add-task-error-<columna>`) y el campo se nombra
    con `aria-label`. Son fijos `add-column-error`
    (`src/features/column-management/ui/AddColumnForm.tsx`),
    `board-dialog-error`
    (`src/features/board-management/ui/BoardEditorDialog.tsx`),
    `board-selector` (`src/entities/board/ui/BoardSelector.tsx`) y
    `backup-file-input`
    (`src/features/data-portability/ui/DataImportSection.tsx`); cada uno de
    esos componentes se monta una vez en la página, así que hoy no se repiten.

  Ninguno se registra como hueco: no se vio fallar nada, y cambiarlos es
  comportamiento del producto, que decide el dueño.
- **Lo que no entra, a propósito:** ninguna guía de diseño ni fila para ella.
  El catálogo dice que un producto anterior no la recibe al actualizarse y
  que escribirla es decisión del dueño. Tampoco cambia ninguna imagen,
  lockfile ni versión de dependencia: `Dockerfile`, `compose.yaml`,
  `tools/stack.txt`, `package.json`, `pnpm-lock.yaml`,
  `tools/board/scaffold.json` y `tools/board/Dockerfile.scaffold` quedan como
  estaban.

**Cómo se verificó.**

- Al arrancar: árbol limpio e igual que el remoto en `c8dec4f`, commit que el
  hook `pre-push` verificó al publicarlo, así que se dio por verificado (§1
  del contrato).
- Al terminar, `.\dev.cmd verify` completo sobre el árbol con la
  actualización, sin `prepare` porque no cambió ninguna imagen ni lockfile:
  `board: tests` 830 checks y 0 fallos (811 con el motor anterior),
  `board: build` sin cambios, `board: documents` 28 comprobaciones y 0
  hallazgos, `dependencies`, `format`, `lint` y `typecheck` en verde, `tests`
  511 tests con 0 fallidos y 0 con error, y `build` en verde; 9 puertas, 0 en
  rojo. Una corrida completa tardó alrededor de un minuto, sin descargar ni
  construir nada.
- No hay test de regresión propio: el cambio es del motor, cuyos defectos
  reintroducidos conserva el catálogo, y de prosa del contrato y de la skill.
- La verificación completa de este commit es la del hook `pre-push` al
  empujarlo.

**Pendiente.** Nada de esta actualización. Decide el dueño, sin registro
abierto: si el producto quiere una guía de diseño propia, y si los tamaños en
píxeles y los ids fijos de arriba piden algún cambio.
