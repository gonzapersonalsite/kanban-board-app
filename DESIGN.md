# Diseño de la interfaz

Esta guía dice para quién se diseña la interfaz de Kanban Board, qué decisiones
visuales y de interacción ha tomado ya el producto, dónde están hechas y cómo se
comprueba que siguen en pie. Los valores (colores, fuentes, medidas) viven en el
CSS: aquí van la intención y el porqué. Es del producto: se reescribe cuando el
producto decide otra cosa, y ninguna actualización del andamio la toca.

## Para quién

Para una persona sola que organiza su trabajo en un tablero al estilo Trello,
dentro de su navegador: sin cuenta ni servidor, con los datos en su propio
`localStorage` (lo dice [el README](README.md)). Lo usa con ratón, con el dedo o
con teclado, en español, en inglés o en alemán, en claro o en oscuro. Es además
una aplicación de currículum y evaluación, no comercial
(`#credits-in-settings-and-the-404-footer`): quien la abre por primera vez
encuentra un tablero de ejemplo ya lleno y tiene que entenderla sin
instrucciones.

La tarea que tiene que salir sin esfuerzo es la del tablero: ver las columnas,
apuntar una tarjeta escribiendo su título y pulsando Intro, y moverla de
columna. Las decisiones de abajo se juzgan contra eso.

## Decisiones tomadas

Cada una dice lo que el código ya hace, por qué y dónde se ve. Una decisión
visual con porqué largo se registra en `docs/registry/decisions/` como
cualquier otra, y aquí queda la línea que la enuncia, con su cita.

- **El texto sigue el tamaño que cada persona eligió en su navegador.** La raíz
  no fija tamaño, la escala tipográfica son tokens en `rem` y ningún tamaño de
  letra va solo en píxeles ([global.css](src/app/styles/global.css)); un test
  lee todas las hojas y lo exige
  ([stylesheets.test.ts](tooling/styles/stylesheets.test.ts)). Quien agranda la
  letra del navegador tiene que verla agrandada aquí.
- **En una pantalla táctil, el campo y el área de texto del kit no bajan de 16
  píxeles**, y por encima de ese suelo siguen el tamaño del lector
  ([Input.module.css](src/shared/ui/Input/Input.module.css),
  [Textarea.module.css](src/shared/ui/Textarea/Textarea.module.css)). Safari en
  iOS amplía la página al enfocar un campo con la letra más pequeña.
- **Claro y oscuro: el del sistema hasta que la persona elige, y su elección se
  recuerda.** Cada color es un token de `:root` con su par oscuro, y la página
  pinta el tema antes de cargar la aplicación para que nadie vea un destello
  blanco ([global.css](src/app/styles/global.css), [index.html](index.html),
  [store.ts](src/shared/theme/model/store.ts),
  [ThemeSwitcher.tsx](src/features/theme-switcher/ui/ThemeSwitcher.tsx)).
- **Cada campo tiene nombre, y su error se le asocia con `aria-describedby`.**
  El diálogo de tarea lleva etiquetas visibles y los formularios de alta nombran
  su campo con `aria-label`. Los identificadores salen de `useId()`, o del id de
  su columna en el alta de tarea, así dos instancias en la misma página no
  comparten ninguno
  ([AddColumnForm.tsx](src/features/column-management/ui/AddColumnForm.tsx),
  [BoardEditorDialog.tsx](src/features/board-management/ui/BoardEditorDialog.tsx),
  [BoardSelector.tsx](src/entities/board/ui/BoardSelector.tsx),
  [DataImportSection.tsx](src/features/data-portability/ui/DataImportSection.tsx),
  [AddTaskForm.tsx](src/features/task-management/ui/AddTaskForm.tsx)). Un error
  se dice con palabras, nunca solo con un color. Quedan fijos tres
  identificadores que son únicos por página a propósito: el título de los
  créditos de la página 404, el de los créditos de Ajustes y las instrucciones
  de arrastre que comparten todas las tarjetas y columnas.
- **Lo que escribe la persona no rompe la página.** El título y la descripción
  de una tarjeta se parten dentro de ella aunque no tengan espacios, y la
  descripción se queda en dos líneas; el título de una columna y el nombre del
  tablero se recortan con puntos suspensivos
  ([TaskCard.module.css](src/entities/task/ui/TaskCard.module.css),
  [ColumnHeader.module.css](src/entities/column/ui/ColumnHeader.module.css),
  [BoardSelector.module.css](src/entities/board/ui/BoardSelector.module.css)).
- **El tablero no se desplaza en horizontal.** Las columnas se recolocan en las
  filas que hagan falta, hasta quedar una debajo de otra en un teléfono
  ([Board.module.css](src/widgets/board/ui/Board.module.css)).
- **El foco siempre se ve.** Los botones, los enlaces de los créditos y los
  dos selectores dibujan un contorno de dos píxeles con el token del foco
  cuando llega el teclado; los campos de texto lo dicen con el color de su
  borde; lo demás —los enlaces de navegación, los botones del calendario, las
  tarjetas y las columnas arrastrables— usa el contorno del navegador
  ([Button.module.css](src/shared/ui/Button/Button.module.css),
  [IconButton.module.css](src/shared/ui/IconButton/IconButton.module.css),
  [Input.module.css](src/shared/ui/Input/Input.module.css),
  [BoardSelector.module.css](src/entities/board/ui/BoardSelector.module.css),
  [LanguageSwitcher.module.css](src/features/language-switcher/ui/LanguageSwitcher.module.css)).
- **Un diálogo es un `<dialog>` modal del navegador y, al cerrarse, devuelve el
  foco a quien lo abrió**, se cierre con Escape o con cualquiera de sus botones:
  quien usa el teclado sigue donde estaba. En un teléfono sube desde abajo y
  desde 600 píxeles de ancho va centrado
  ([Dialog.tsx](src/shared/ui/Dialog/Dialog.tsx),
  [Dialog.module.css](src/shared/ui/Dialog/Dialog.module.css)).
- **Un botón de solo icono lleva nombre y un rótulo flotante**, que aparece al
  pasar el ratón o cuando el teclado trae el foco, y no cuando el foco vuelve
  solo tras un clic ([Tooltip.tsx](src/shared/ui/Tooltip/Tooltip.tsx)).
- **Arrastrar y soltar funciona con ratón, con el dedo y con teclado, y se
  anuncia en el idioma activo**
  ([BoardDndContext.tsx](src/features/drag-and-drop/ui/BoardDndContext.tsx),
  [boardDndAccessibility.ts](src/features/drag-and-drop/model/boardDndAccessibility.ts)).
  Mover tarjetas es la tarea central y no puede depender del ratón.
- **En una pantalla táctil, los botones y los campos del kit miden al menos 44
  píxeles de alto**, y lo que con ratón aparece al pasar por encima está
  siempre a la vista ([global.css](src/app/styles/global.css),
  [Button.module.css](src/shared/ui/Button/Button.module.css),
  [IconButton.module.css](src/shared/ui/IconButton/IconButton.module.css),
  [TaskCard.module.css](src/entities/task/ui/TaskCard.module.css)).
- **La autoría vive en Ajustes y en el pie de la página 404, no en el tablero**
  (`#credits-in-settings-and-the-404-footer`), para no quitarle alto de trabajo
  ([Credits.tsx](src/shared/ui/Credits/Credits.tsx)).
- **Tres idiomas, con el idioma del documento al día**
  (`#localized-spanish-routes-and-shells`): un lector de pantalla pronuncia la
  interfaz con las reglas del idioma activo
  ([store.ts](src/shared/i18n/model/store.ts)).

## Lo que sigue abierto

Lo que el código hace pero nadie ha decidido, y lo que la auditoría encontró y
pide una decisión del dueño. Cuando una de ellas se decida, pasa a la lista de
arriba con su porqué.

- **Paleta, tipografía y efecto cristal.** El aspecto actual está entero en el
  CSS —índigo sobre neutros, Inter y Plus Jakarta Sans, tarjetas translúcidas—
  y ningún registro dice por qué: está por decir si es una decisión de marca o
  el aspecto con el que nació.
- **Tamaños y colores fuera de los tokens.** Varias hojas dan un tamaño de
  letra suelto en `rem` o un color escrito a mano en vez de un token de
  [global.css](src/app/styles/global.css). Pasarlos a la escala mueve algún
  tamaño un píxel, y eso es cambiar el aspecto.
- **Movimiento reducido.** Solo el esqueleto de carga consulta la preferencia
  del sistema
  ([AppShellRoute.module.css](src/app/router/ui/AppShellRoute.module.css)); los
  fundidos de entrada y el desplazamiento de una tarjeta al pasar el ratón, no.
- **El calendario en una pantalla estrecha con la letra grande** pierde la
  columna del domingo:
  `#calendar-loses-a-day-column-on-a-narrow-screen-with-large-text`.
- **Qué recibe el foco al abrir un diálogo con un campo:** hoy, el botón de
  cerrar: `#which-element-takes-the-focus-when-a-dialog-opens`.
- **Los dos suelos táctiles del kit**, 16 píxeles de letra en un campo y 44 de
  alto en un control, no llegan a los campos del tablero, a los selectores ni
  al calendario: `#touch-floors-of-the-kit-do-not-reach-every-control`.
- **Textos que solo están en inglés:** el nombre del botón de tema y las dos
  pantallas de error: `#texts-the-interface-says-only-in-english`.

## Dónde está hecho

| Qué | Dónde |
|---|---|
| Tokens de color, escala tipográfica, tamaños de icono y de control, y el reset | [src/app/styles/global.css](src/app/styles/global.css) |
| El tema: qué se pinta antes de cargar, cómo se recuerda y quién lo cambia | [index.html](index.html), [src/shared/theme/model/store.ts](src/shared/theme/model/store.ts), [ThemeSwitcher.tsx](src/features/theme-switcher/ui/ThemeSwitcher.tsx) |
| Las fuentes | Las pide [index.html](index.html) a Google Fonts sin bloquear el pintado; mientras llegan, la del sistema |
| El estilo de cada componente | Su CSS Module, a su lado; la regla está en «Estilos» de [la arquitectura](docs/ARCHITECTURE.md) |
| El kit: botón, campo, área de texto, diálogo, rótulo flotante, aviso y créditos | [src/shared/ui](src/shared/ui/index.ts) |
| Las pantallas | [el tablero](src/widgets/board/ui/Board.tsx), [el calendario](src/widgets/calendar/ui/CalendarGrid.tsx), [la cabecera con Ajustes](src/widgets/header/ui/Header.tsx) y [la página 404](src/pages/not-found/ui/NotFoundPage.tsx) |
| Lo que se ve mientras carga la aplicación | El indicador de arranque de [index.html](index.html) |
| Las convenciones de estilos, tokens, iconos y animación | La skill [kanban-board-conventions](.agents/skills/kanban-board-conventions/SKILL.md) |

Un color entra en `global.css` como token, con su par oscuro, cuando ya lo usa
un estilo; una medida que solo usa un componente se queda en su CSS Module.

## Cómo comprobarlo

`./dev verify` (en Windows, `.\dev.cmd verify`) corre los tests que hay al lado
de cada componente y el de las hojas de estilo. Comprueban nombres, papeles, la
unión de cada campo con su etiqueta y su error, adónde vuelve el foco al cerrar
un diálogo, cuándo sale un rótulo flotante y que ningún tamaño de letra va solo
en píxeles; no comprueban el aspecto. Lo demás se mira en un navegador, con
`./dev start` y la dirección que imprime:

- **Estados.** El tablero de ejemplo, un tablero recién creado con sus columnas
  vacías, los errores de los formularios de alta y del diálogo de tablero, el
  diálogo de tarea, Ajustes, el calendario, la página 404 y la pantalla de
  error de una ruta.
- **Tamaños.** A 320 píxeles CSS de ancho, con un título de tarjeta, uno de
  columna y un nombre de tablero de un centenar de caracteres sin espacios, no
  aparece desplazamiento horizontal. Con el tamaño de letra del navegador en 24
  píxeles, todo el texto crece. Con el zoom al 200 %, nada se corta.
- **Teclado.** Sin ratón: el tabulador recorre la cabecera, cada columna y cada
  tarjeta con sus botones, y el foco se ve en cada parada; Espacio levanta una
  tarjeta, las flechas la mueven y Espacio la suelta; un diálogo no deja salir
  el foco y, al cerrarse, lo devuelve al botón que lo abrió.
- **Esquemas.** En claro y en oscuro, cambiando el del sistema o emulándolo en
  las herramientas del navegador, todo texto se lee.
- **Consola.** Sin errores, sin avisos y sin peticiones fallidas.

Este recorrido se hizo entero en Chrome, con los estados cruzados con cinco
condiciones de lectura y los dos esquemas, y sus cifras están en la entrega
`#2026-11-24-design-guide-and-reader-conditions`. Salió limpio salvo por lo que
lista «Lo que sigue abierto».

Está por hacer, y se hace antes de dar por buena una pantalla nueva: Firefox y
Safari; un lector de pantalla; un teléfono de verdad (el puntero táctil solo se
emuló, y que iOS amplíe o no la página al enfocar un campo no se ha visto); el
modo de alto contraste del sistema más allá de emular sus colores en Chrome; y
el contraste de cada par de colores, que no se midió uno a uno.
