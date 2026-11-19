---
title: Actualización a agentic-scaffold 0.6.0, migración del registro y parches de React
date: 2026-11-19
phase: none
---
**Objetivo y dueño:** herramientas de desarrollo, a petición del dueño, que
pidió dejar cada proyecto «correcto y final sin deuda tras todo cambio» y dio
carta blanca: «quiero que dejes tu todo remediado y aprobado y listo sin
deuda, no te cortes o dejes cosas sin hacer por mi, tienes carta blanca».
`templates` publicó `agentic-scaffold` 0.5.0 (`0bb820d`), con lo que clayfarer
aprendió, y 0.6.0 (`4948119`), en la que el registro dice lo que vale hoy; la
plantilla de React tomó los parches de noviembre. Este repositorio lo toma
todo con `upgrade.py` desde `d94a2b3` y migra su registro una vez.

**Qué cambió.**

- **Motor**, de 0.4.0 a 0.6.0: toma `verify.py`, `tools/board/board.py`,
  `tools/board/test_board.py`, `tools/board/adopt.py`,
  `tools/board/pre_push.py`, `tools/board/README.md` y
  `docs/registry/README.md`, y reescribe `tools/board/MANIFEST.txt` y
  `tools/board/components.txt`. Con 0.5.0, la verificación completa es la del
  hook de push y una sola corre por árbol; una provisional declara su fase y
  su criterio, y una fase hecha no deja nada suyo vivo. Con 0.6.0, toda
  decisión y toda lección declaran su `domain`, su cuerpo no lleva fechas, lo
  que nombran como código existe y lo que deja de gobernar sale por
  `docs/registry/retired.txt`.
- **A mano, de lo pendiente del plan:** `AGENTS.md`, la skill
  `audit-before-commit`, `tools/board/exceptions.txt` y
  `tools/board/limits.txt` toman el diff de la plantilla tal cual; las nueve
  semillas, su versión con dominio. `README.md` es del producto: su línea de
  `verify.py` dice la cadencia de 0.5.0.
- **Dominios** (`tools/board/domains.txt`): `interface` (tablero, calendario,
  ajustes y créditos) y `localization` (idiomas, rutas localizadas y shells
  HTML), más los tres de la plantilla, cada uno con su página en
  `docs/registry/index/`; el build borró los índices por fase. Ningún registro
  sale por el libro. La decisión de adopción toma el texto de 0.6.0.
- **La provisional de los créditos pasa a `confirmed`** por la delegación del
  dueño citada arriba, como dice su registro, que ya no lleva su línea
  fechada: el agente vio en el servidor de desarrollo la sección de créditos
  al final de Ajustes, el `<footer>` de la 404 con el mismo contenido y
  enlaces, y el tablero sin footer.
- **Herramientas de React**, a las versiones de la plantilla: pnpm 12.21.0,
  `vite` 8.3.8, `vitest` 5.1.1, `eslint` 10.15.0, `prettier` 3.10.1,
  `@vitejs/plugin-react` 6.3.0, `typescript-eslint` 8.73.0 y
  `eslint-plugin-react-refresh` 0.5.8. `@types/node` sigue en 26.6.6, la
  versión propia de este repositorio. El lockfile se regeneró con los scripts
  de instalación desactivados, sin paquetes nuevos ni scripts de instalación.

- **Un aviso de React en la puerta de tests, ya presente antes de esta
  parte:** `announces_a_keyboard_pick_up_in_the_current_locale` dejaba una
  tarjeta levantada con el teclado, y al desmontar, `@dnd-kit/react` destruía
  su gestor a mitad del arrastre dentro de un `useInsertionEffect`, y React
  avisaba «useInsertionEffect must not schedule updates» en cada corrida con
  el reporter junit (visto también sobre el commit de partida, con sus
  dependencias). El test termina ahora el arrastre con `Escape`, como haría
  una persona, y comprueba que el anuncio deja de decir que la tarjeta está
  cogida; el fin del arrastre corre la animación de soltar, así que el test
  simula `Element.animate`, que jsdom no tiene, como ya simulaba
  `getAnimations`. Tres corridas de la puerta: 511 tests, sin aviso ni error.

**Cómo se verificó.** El árbol de partida estaba limpio. `upgrade.py`
planificó `6d88981c2e2a` sin conflictos, `--apply` lo escribió y `--done`
cerró las dieciséis cosas a mano. `board.py check` dio 28 comprobaciones y 0
hallazgos, sin ninguna excepción, y `python verify.py` en verde, en la cifra
que dice el commit que lo entrega.

**Pendiente.** Nada de esta parte.
