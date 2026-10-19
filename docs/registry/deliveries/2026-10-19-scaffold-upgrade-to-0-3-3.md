---
title: Actualización a agentic-scaffold 0.3.3, con las piezas en conflicto conciliadas
date: 2026-10-19
phase: none
---
**Objetivo y dueño:** herramientas de desarrollo, a petición del dueño.
`templates` publicó `agentic-scaffold` 0.3.3 y endureció la capa `react-vite` y
el stack `react-fsd` en el commit `16f1953` (etiqueta `agentic-scaffold-v0.3.3`);
este repositorio lo toma con `upgrade.py` desde `39bead6`.

**Qué cambió.**

- **Motor**, de 0.3.2 a 0.3.3: toma `tools/board/components.py`,
  `tools/board/test_board.py`, `tools/guards/junit.py` y `verify.py`, y reescribe
  `tools/board/MANIFEST.txt` y `tools/board/components.txt`. `verify.py`
  rechaza una fila de puerta que encadena comandos fuera de comillas dobles
  (`|`, `||`, un `&` suelto, `;`, un salto de línea) y dice exactamente qué mata
  su vigilante; `junit.py` admite `--forbid-skipped` y nunca da por verde un
  informe en el que no corrió ningún test.
- **`layer:react-vite`**: toma la skill `react-fsd-maintainer` y la fila
  `tests` de `gates.txt`, que ahora lleva `--forbid-skipped`: la puerta queda en
  rojo con cualquier caso que el informe de Vitest dé por saltado.
- **`stack:react-fsd`**: toma `eslint-fsd-gaps.js` (los límites de las capas
  también sobre `import.meta.glob`) y añade `eslint-tests.js` (ningún test con
  `skip` o `todo` en sus opciones, y ni `.spec`, ni historias, ni un test donde
  Vitest no lo busca).
- **Tres piezas que cambiaron aquí y en la plantilla**, conciliadas a mano. Para
  que el plan corriera, el commit anterior las dejó como del producto
  (`--keep`); ahora llevan lo de la plantilla y vuelven a su componente
  (`--done`), con su base en `16f1953` y lo propio de este repositorio como
  cambio local:
  - `eslint.config.js`: el sufijo único de test, `testFilesPatterns` anclado
    para fsd-lint (sobra el bloque que apagaba `no-relative-imports` en los
    tests), `VITEST_TESTS` con los sitios donde busca este Vitest (`src`, los
    `*.test.ts` de la raíz y `tooling/`), las reglas de `eslint-tests.js`, y
    `WebSocket`, `EventSource` y `sendBeacon` fuera de `src/shared/api`, con un
    mensaje propio que mantiene que la aplicación no usa la red. Se conserva lo
    de aquí: el soporte de tests de `src/test`, el prefijo `fsd-lint`, la
    lectura de `tsconfig.app.json` con el parser de TypeScript y la
    configuración base.
  - `eslint.config.test.ts`: los casos nuevos de la plantilla (globs, `@x`,
    conexiones y balizas, opciones de test, ficheros donde Vitest no corre y la
    comprobación contra los proyectos reales de `vite.config.ts`), escritos con
    las convenciones de test de este repositorio (AAA y nombres en
    `snake_case`, obligatorias en `kanban-board-conventions`), sus slices, sus
    mensajes y su proyecto `tooling`, que corre los `*.test.ts` de la raíz. Por
    eso no se realineó con el texto de la plantilla: incumpliría esas
    convenciones.
  - `docs/ARCHITECTURE.md`: los globs, la excepción `@x`, dónde está un test,
    las opciones de test y la lista exacta de la red, en los términos de este
    repositorio. No entran los párrafos de la plantilla sobre su cliente HTTP:
    aquí no hay ninguno y la aplicación no envía peticiones.
- **El lint nuevo encontró un glob** en `src/shared/i18n/model/store.ts`
  (`'../config/*.json'`), que sale de la carpeta de su fichero. El glob pasa a
  `src/shared/i18n/config/locales.ts`, junto a los JSON, y el store lo importa:
  mismo comportamiento, y la skill `kanban-board-conventions` dice dónde está.
- **A mano, de lo pendiente del plan:** `AGENTS.md` toma el alcance exacto del
  vigilante, la regla de una fila un comando, y los tres estándares que la capa
  reescribió (`lint`, todo test corre con `--forbid-skipped`, y la portada y su
  texto alternativo de `index.html`); `gates.txt` toma la cabecera nueva. Las
  referencias de sus filas siguen como se midieron.
- Lo que el CHANGELOG pide a mano en los ficheros de arranque ya estaba:
  `vite.config.ts` declara sus proyectos con su `include`, el de la app solo
  `src/**/*.test.{ts,tsx}`, no hay `.spec` ni historias, y `site.ts`,
  `public/og-cover.png` y el texto alternativo de `index.html` son de este
  producto.

**Cómo se verificó.** `upgrade.py` planificó `7ab23f789a86` sin problemas tras el
`--keep`, `--apply` lo escribió y `--done` cerró las tres piezas, `AGENTS.md` y
`gates.txt`. `pnpm run lint` queda limpio y `eslint.config.test.ts` pasa sus 225
casos; `python -I verify.py` pasó sus 9 puertas, y otra vez con el mismo
veredicto y sin cambiar ningún fichero.

**Pendiente.** Nada.
