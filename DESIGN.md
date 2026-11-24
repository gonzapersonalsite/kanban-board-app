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
  letra del navegador tiene que verla agrandada aquí
  (`#the-text-follows-the-font-size-the-reader-chose`).
- **Todo control mide al menos 24 píxeles, y 44 bajo un dedo; bajo un dedo,
  ningún campo baja de 16 píxeles de letra.** Los suelos se dicen una vez, en
  una regla sin peso de [global.css](src/app/styles/global.css), y bajo un dedo
  los tamaños del kit toman el mayor. Las tareas de un día del calendario se
  quedan en 24 también bajo un dedo, porque a 44 no caben en su celda
  (`#touch-floors-of-the-kit-do-not-reach-every-control`). Lo que con ratón
  aparece al pasar por encima está siempre a la vista bajo un dedo
  ([TaskCard.module.css](src/entities/task/ui/TaskCard.module.css)).
- **Claro y oscuro: el del sistema hasta que la persona elige, y su elección se
  recuerda.** Cada color es un token de `:root` con su par oscuro, y la página
  pinta el tema antes de cargar la aplicación para que nadie vea un destello
  blanco ([global.css](src/app/styles/global.css), [index.html](index.html),
  [store.ts](src/shared/theme/model/store.ts),
  [ThemeSwitcher.tsx](src/features/theme-switcher/ui/ThemeSwitcher.tsx)).
- **Nada se mueve para quien pidió menos movimiento.** Toda animación y todo
  desplazamiento van dentro de `prefers-reduced-motion: no-preference`; fuera
  solo cambian colores, opacidades y sombras, y un test lo exige en todas las
  hojas (`#nothing-moves-for-a-reader-who-asked-for-less-motion`).
- **Cada campo tiene nombre, y su error se le asocia con `aria-describedby`.**
  El diálogo de tarea lleva etiquetas visibles y los formularios de alta nombran
  su campo con `aria-label`. Los identificadores que unen un control con su
  texto salen de `useId()`, o del id de su columna en el alta de tarea, así dos
  instancias en la misma página no comparten ninguno
  (`#ids-that-join-a-control-to-its-text-come-from-use-id`). Un error se dice
  con palabras, nunca solo con un color. Quedan fijos tres identificadores que
  son únicos por página a propósito: el título de los créditos de la página
  404, el de los créditos de Ajustes y las instrucciones de arrastre que
  comparten todas las tarjetas y columnas.
- **Lo que escribe la persona no rompe la página.** El título y la descripción
  de una tarjeta se parten dentro de ella aunque no tengan espacios, y la
  descripción se queda en dos líneas; el título de una columna y el nombre del
  tablero se recortan con puntos suspensivos
  ([TaskCard.module.css](src/entities/task/ui/TaskCard.module.css),
  [ColumnHeader.module.css](src/entities/column/ui/ColumnHeader.module.css),
  [BoardSelector.module.css](src/entities/board/ui/BoardSelector.module.css)).
  Una fecha de vencimiento es un día del calendario, y lo que no lo es no entra
  ni por el campo, ni por el almacén, ni por una copia de seguridad
  (`#a-due-date-is-a-day-of-the-calendar`).
- **El tablero no se desplaza en horizontal.** Las columnas se recolocan en las
  filas que hagan falta, hasta quedar una debajo de otra en un teléfono
  ([Board.module.css](src/widgets/board/ui/Board.module.css)).
- **El mes del calendario no encoge por debajo de su contenido.** Cuando sus
  siete días no caben, se desplaza de lado dentro de su caja, una región con el
  nombre del mes que el teclado alcanza; cuando no cabe de alto, se desplaza el
  calendario ([CalendarGrid.tsx](src/widgets/calendar/ui/CalendarGrid.tsx),
  `#calendar-loses-a-day-column-on-a-narrow-screen-with-large-text`).
- **El foco siempre se ve.** Los botones, los enlaces de los créditos, los dos
  selectores y la región del mes dibujan un contorno de dos píxeles con el
  token del foco cuando llega el teclado; los campos de texto lo dicen con el
  color de su borde, a 6,29:1 de lo que lo rodea en claro y a 4,99:1 en
  oscuro; lo demás —los enlaces de navegación, las tareas del calendario, las
  tarjetas y las columnas arrastrables— usa el contorno del navegador
  ([Button.module.css](src/shared/ui/Button/Button.module.css),
  [IconButton.module.css](src/shared/ui/IconButton/IconButton.module.css),
  [Input.module.css](src/shared/ui/Input/Input.module.css),
  [BoardSelector.module.css](src/entities/board/ui/BoardSelector.module.css),
  [LanguageSwitcher.module.css](src/features/language-switcher/ui/LanguageSwitcher.module.css)).
- **Un diálogo es un `<dialog>` modal del navegador con el nombre de su título.**
  Al abrirse lleva el foco a su campo, o en una confirmación a la opción que no
  destruye, y si no lo deja en el botón de cerrar
  (`#which-element-takes-the-focus-when-a-dialog-opens`); al cerrarse, de
  cualquier forma, devuelve el foco a quien lo abrió
  (`#a-dialog-gives-the-focus-back-to-whoever-opened-it`). En un teléfono sube
  desde abajo y desde 600 píxeles de ancho va centrado
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
- **La autoría vive en Ajustes y en el pie de la página 404, no en el tablero**
  (`#credits-in-settings-and-the-404-footer`), para no quitarle alto de trabajo
  ([Credits.tsx](src/shared/ui/Credits/Credits.tsx)).
- **Tres idiomas, con el idioma del documento al día**
  (`#localized-spanish-routes-and-shells`): un lector de pantalla pronuncia la
  interfaz con las reglas del idioma activo
  ([store.ts](src/shared/i18n/model/store.ts)). Todo lo que la interfaz dice,
  también lo que solo oye un lector de pantalla, sale de los ficheros de
  idioma, y una pantalla de error dice qué ha pasado y qué hacer, con el
  detalle técnico en la consola (`#texts-the-interface-says-only-in-english`).

## Lo que sigue abierto

Lo que el código hace pero nadie ha decidido. Cuando una de ellas se decida,
pasa a la lista de arriba con su porqué.

- **El aspecto, que espera al rediseño visual** que el dueño anunció estudiar
  con él: la paleta, la tipografía y el efecto cristal; los tamaños de letra,
  colores y radios que no tienen un token del mismo valor; y el grosor de los
  indicadores de foco más allá del nivel AA
  (`#choices-of-look-wait-for-the-visual-redesign`).

## Dónde está hecho

| Qué | Dónde |
|---|---|
| Tokens de color, escala tipográfica, tamaños de icono y de control, los suelos de puntero y el reset | [src/app/styles/global.css](src/app/styles/global.css) |
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
unión de cada campo con su etiqueta y su error, qué recibe el foco al abrir un
diálogo y adónde vuelve al cerrarlo, cuándo sale un rótulo flotante, los textos
en los tres idiomas, las fechas que entran, y en las hojas que ningún tamaño de
letra va solo en píxeles, que nada se mueve fuera de
`prefers-reduced-motion: no-preference` y los suelos de puntero; no comprueban
el aspecto. Lo demás se mira en un navegador, con `./dev start` y la dirección
que imprime:

- **Estados.** El tablero de ejemplo, un tablero recién creado con sus columnas
  vacías, los errores de los formularios de alta y del diálogo de tablero, el
  diálogo de tarea, Ajustes con una copia de seguridad revisada, el calendario
  con el diálogo de un día, la página 404, un aviso y la pantalla de error de
  una ruta.
- **Tamaños.** A 320 píxeles CSS de ancho, con un título de tarjeta, uno de
  columna y un nombre de tablero de un centenar de caracteres sin espacios, no
  aparece desplazamiento horizontal del documento. Con el tamaño de letra del
  navegador en 24 píxeles, todo el texto crece. Con el zoom al 200 %, nada se
  corta sin un desplazamiento que lo traiga.
- **Puntero.** Con ratón, ningún control mide menos de 24 por 24; con el
  puntero táctil emulado a 390 píxeles, ninguno menos de 44 salvo las tareas de
  un día del calendario, y ningún campo menos de 16 píxeles de letra.
- **Teclado.** Sin ratón: el tabulador recorre la cabecera, cada columna y cada
  tarjeta con sus botones, y el foco se ve en cada parada; Espacio levanta una
  tarjeta, las flechas la mueven y Espacio la suelta; un diálogo abre con el
  foco en su campo o en su opción que no destruye, no deja salir el foco y, al
  cerrarse, lo devuelve al botón que lo abrió; las flechas desplazan el mes
  del calendario cuando no cabe.
- **Esquemas y movimiento.** En claro y en oscuro todo texto se lee a 4,5:1 o
  más, salvo el de un botón deshabilitado. Con el movimiento reducido pedido,
  nada se desplaza ni crece.
- **Consola.** Sin errores, sin avisos y sin peticiones fallidas.

Este recorrido se hizo entero en Chrome 157 y, en lo principal, en Firefox 160,
y sus cifras están en las entregas
`#2026-11-24-design-guide-and-reader-conditions` (el primero) y
`#2026-11-24-interface-decisions-closed-before-redesign` (el de ahora, con
todas las decisiones cerradas).

Está por hacer, y se hace antes de dar por buena una pantalla nueva: Safari;
un lector de pantalla de verdad (se leyó el árbol de accesibilidad de Chrome);
un teléfono de verdad (el puntero táctil solo se emuló, y que iOS amplíe o no
la página al enfocar un campo no se ha visto); y el modo de alto contraste del
sistema más allá de emular sus colores en Chrome.
