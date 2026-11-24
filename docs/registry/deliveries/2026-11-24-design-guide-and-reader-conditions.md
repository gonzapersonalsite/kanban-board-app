---
title: Guía de diseño del producto y la interfaz bajo las condiciones de quien la lee
date: 2026-11-24
phase: none
---
**Objetivo y dueño:** producto; mantenimiento de la interfaz encargado por el
dueño para dejar el proyecto en consonancia con lo que el catálogo de
plantillas entrega hoy sobre diseño de interfaz: la guía `DESIGN.md`, que un
producto anterior no recibe al actualizarse, y las correcciones del starter
React (commit `781300f` del catálogo) que la entrega
`#2026-11-24-scaffold-upgrade-to-0-8-1` dejó sin portar. No abre ni cierra
ninguna fase. Palabras del dueño en el encargo: «dejar correcto y final sin
deudas y bien implementado». Fuera de alcance, por el encargo: cambiar el
aspecto (paleta, tipografía, composición), añadir dependencias y tocar el motor.

**Qué cambió.**

- **La guía de diseño.** `DESIGN.md`, en la raíz, con las cinco secciones de la
  referencia: para quién es la interfaz, las decisiones que el código ya toma
  (cada una con su porqué y un enlace al fichero que la hace), lo que sigue
  abierto, dónde está hecho y cómo comprobarlo. Es un documento vivo: fila
  `live` en `tools/board/documents.txt`, fila en la tabla del §4 de `AGENTS.md`
  y enlace desde `README.md`. No decide nada que el código no hiciera ya: lo
  que nadie ha decidido está en «Lo que sigue abierto».
- **El texto sigue el tamaño de letra que eligió el lector.** Siete tamaños
  iban solo en píxeles y pasan a `rem` con el mismo valor a 16 píxeles (N/16),
  sin tocar la escala de tokens porque ninguno de ellos coincide con uno:
  `src/app/providers/ErrorBoundary.module.css` (20, 14 y 14 px),
  `src/features/drag-and-drop/ui/BoardDndContext.module.css` (14 px),
  `src/features/task-management/ui/TaskDialog.module.css` (13 px),
  `src/widgets/board/ui/EmptyColumnMessage.module.css` (13 px) y
  `src/shared/ui/Textarea/Textarea.module.css` (14 px). Los dos suelos de 16
  píxeles bajo puntero táctil, el de `src/shared/ui/Input/Input.module.css` y
  el del área de texto, siguen siendo suelos: ahora son el mayor entre 16
  píxeles y el tamaño que le toca al campo, así que no bajan de ahí y crecen
  con el lector.
- **Ids de formulario con `useId()`.** Cuatro ids fijos que unían un campo con
  su etiqueta o con su error pasan a salir de `useId()`:
  `src/entities/board/ui/BoardSelector.tsx`,
  `src/features/board-management/ui/BoardEditorDialog.tsx`,
  `src/features/column-management/ui/AddColumnForm.tsx` y
  `src/features/data-portability/ui/DataImportSection.tsx`. Con el id fijo,
  dos instancias en la misma página dejaban la segunda sin etiqueta o sin
  error. Se quedan como estaban el del alta de tarea, que ya lleva el id de su
  columna, y tres que son únicos por página a propósito: los títulos de los
  créditos de Ajustes y de la 404 y las instrucciones de arrastre.
- **El foco vuelve a quien abrió un diálogo.** `src/shared/ui/Dialog/Dialog.tsx`
  guarda el elemento enfocado justo antes de `showModal()` y se lo devuelve al
  cerrarse. Casi todos los consumidores quitan el diálogo del documento al
  cerrar, y el navegador solo devuelve el foco cuando un diálogo modal se
  cierra: el foco se quedaba en `<body>` y el siguiente tabulador empezaba la
  página desde arriba. `src/shared/ui/Dialog/Dialog.module.css` da su `display`
  al diálogo solo cuando está abierto: con él puesto siempre, el diálogo se
  mostraba un instante antes de abrirse, el campo con `autoFocus` tomaba el
  foco y el elemento guardado era ese campo y no el botón que abrió.
- **El rótulo flotante sale con el foco del teclado, no con cualquier foco.**
  `src/shared/ui/Tooltip/Tooltip.tsx` lo enseña al enfocar solo si el elemento
  cumple `:focus-visible`. Es consecuencia de lo anterior: al volver el foco al
  botón tras un clic, su rótulo salía y se quedaba delante de quien usa el
  ratón.
- **Foco visible en los dos selectores.** El de idioma
  (`src/features/language-switcher/ui/LanguageSwitcher.module.css`) quitaba el
  contorno y dejaba un halo al 15 % de opacidad; el de tablero
  (`src/entities/board/ui/BoardSelector.module.css`) dibujaba su contorno al
  45 %. Los dos dibujan ahora el contorno de dos píxeles con el token del foco,
  como los botones. Es lo único que cambia a la vista con el tamaño de letra
  por defecto, y solo mientras el teclado tiene el foco en uno de ellos.
- **Tests.** Once nuevos: uno por cada id (`BoardSelector.test.tsx`,
  `AddColumnForm.test.tsx`, `DataImportSection.test.tsx` y el nuevo
  `BoardEditorDialog.test.tsx`), dos del diálogo
  (`src/shared/ui/Dialog/Dialog.test.tsx`), dos del rótulo
  (`src/shared/ui/Tooltip/Tooltip.test.tsx`) y tres de las hojas de estilo
  (`tooling/styles/stylesheets.test.ts`). Este último lee todas las hojas de
  `src/` y falla si un tamaño de letra va solo en píxeles; vive en `tooling/`,
  que corre en Node, porque a un test de `src/` la configuración de Vitest le
  sirve las hojas como módulos vacíos.
- **Convenciones.** `.agents/skills/kanban-board-conventions/SKILL.md` dice lo
  nuevo del diálogo y del rótulo en sus dos secciones.
- **Lo que se miró y no hizo falta portar.** El tamaño de letra de la raíz: ni
  `:root` ni `html` lo fijan. El texto que escribe el usuario: las hojas ya lo
  parten o lo recortan, y un título de unos 115 caracteres sin espacios no
  desborda nada a 320 píxeles (medido, abajo).

**Cómo se verificó.**

- **Al arrancar:** árbol limpio e igual que el remoto en `74a50c0`, commit que
  el hook `pre-push` verificó al publicarlo, así que se dio por verificado (§1
  del contrato).
- **Tests vistos fallar.** Con el código final, se reintrodujo cada defecto con
  su edición inversa (los cuatro ids fijos, el diálogo sin devolver el foco,
  `:focus` en lugar de `:focus-visible`, 13 px en el diálogo de tarea y el
  suelo de 16 px a secas en el área de texto), se corrió la puerta `tests` y se
  restauró; la huella de `git diff` antes y después es la misma. Fallaron 8 de
  522:
  - los dos de etiqueta, `labels_each_select_with_its_own_label_when_two_selectors_share_a_page`
    y `labels_each_file_field_with_its_own_label_when_two_sections_share_a_page`:
    «expected [ 2, +0 ] to deeply equal [ 1, 1 ]», la primera instancia con las
    dos etiquetas y la segunda sin ninguna;
  - los dos de error, `describes_each_field_with_the_error_of_its_own_form_when_two_forms_share_a_page`
    y `describes_each_field_with_the_error_of_its_own_dialog_when_two_dialogs_share_a_page`:
    «expected [ true, false ] to deeply equal [ true, true ]»;
  - los dos del diálogo, `returns_the_focus_to_its_opener_when_its_owner_unmounts_it`
    y `returns_the_focus_to_its_opener_when_its_owner_keeps_it_mounted_and_closes_it`:
    `toHaveFocus()` esperaba el botón que abrió y recibió `<body>`;
  - `stays_hidden_when_the_focus_reaches_its_trigger_after_a_click`:
    «expected document not to contain element, found» el rótulo;
  - `does_give_no_font_size_only_in_pixels_so_the_text_follows_the_size_the_reader_chose`:
    «expected [ …(2) ] to deeply equal []», con las dos hojas tocadas. Con el
    código de partida, antes de corregir nada, el mismo test listó nueve: los
    siete tamaños y los dos suelos táctiles.

  El otro test del rótulo, `shows_its_text_when_the_keyboard_brings_the_focus_to_its_trigger`,
  se vio fallar aparte, con una condición que nunca se cumple en lugar de
  `:focus-visible`: «Unable to find an accessible element with the role
  "tooltip"».
- **En el navegador, antes y después.** Chrome 157 sin ventana, manejado por
  el protocolo de DevTools, contra el servidor de desarrollo y, para el foco y
  los ids, también contra la build de producción.
  - _Matriz._ Nueve estados (tablero, errores de las altas, diálogo de tarea,
    Ajustes, error del diálogo de tablero, tablero vacío, diálogo de borrado,
    calendario y 404) por cinco condiciones de lectura (1280 y 320 píxeles de
    ancho, cada uno con la letra del navegador en 16 y en 24 píxeles, y zoom
    al 200 %) por claro y oscuro: 90 cargas antes y 90 después. Desplazamiento
    horizontal del documento: 0 en las 180. Consola: 0 errores, 0 avisos y 0
    peticiones fallidas en las dos pasadas. 82 celdas limpias; las 8 del
    calendario que se marcan son el recorte a dos líneas de sus tareas, que es
    de diseño, y la columna del domingo que se pierde a 320 píxeles con la
    letra en 24 (la rejilla mide 286 y su contenido 360).
  - _320 píxeles._ El tablero mide 310 y su contenido 310; una tarjeta con un
    título de unos 115 caracteres sin espacios mide 250; el título de la
    columna y el nombre largo del tablero se recortan; el aviso cabe en la
    pantalla también con la letra en 24 y en oscuro.
  - _Letra de 16 a 24 píxeles._ Antes no crecían la etiqueta del diálogo de
    tarea (13 px), el mensaje de columna vacía (13 px), el área de texto
    (14 px), la pantalla de error de la aplicación (20, 14 y 14 px) y la
    columna que se arrastra (14 px). Después miden 19,5, 19,5, 21, 30, 21, 21
    y 21 píxeles, y no queda ningún texto que no crezca. Las dos últimas se
    leyeron montando sus clases en la página, porque ningún dato lleva a esas
    pantallas. El diálogo de tarea pasa de 514 a 575 píxeles de alto con la
    letra en 24, sin desbordar.
  - _Mismo aspecto con la letra por defecto._ De 684 tamaños de letra leídos
    antes y después a 16 píxeles, 672 son idénticos; los otros 12 son el
    mensaje de columna vacía de una columna que entre las dos pasadas dejó de
    estar vacía.
  - _Puntero táctil emulado, 390 píxeles._ Con la letra por defecto, el área
    de texto y el campo del diálogo siguen en 16 píxeles; con ella en 24,
    miden 21 y 22,5.
  - _Foco al cerrar un diálogo._ Cuatro diálogos (tarea, Ajustes, edición y
    borrado de tablero) cerrados con Escape, con el aspa y con sus botones.
    Antes, 10 de los 12 cierres por teclado dejaban el foco en `<body>`; solo
    Ajustes y el borrado, con Escape, lo devolvían. Después lo devuelven los
    12, y el siguiente tabulador sigue desde el botón que abrió, en desarrollo
    (con `StrictMode`) y en la build de producción. Con ratón, 4 de 4 lo
    devuelven sin que el rótulo del botón se quede a la vista.
  - _Foco visible._ Cada parada del tabulador tiene indicador: el contorno de
    dos píxeles del token, el del navegador o, en los campos de texto, el
    cambio de color del borde, que sigue cambiando con los colores forzados
    emulados. El selector de idioma tenía solo el halo al 15 % (alrededor de
    1,2:1 contra el fondo, calculado a mano) y el de tablero un contorno al
    45 % (alrededor de 1,8:1); ahora los dos dibujan el contorno sólido del
    token en claro y en oscuro.
  - _Arrastre con teclado._ Espacio levanta una tarjeta, la flecha la lleva a
    la columna siguiente y Espacio la suelta; los anuncios salen en español y
    la consola queda limpia.
  - _Ids._ En la build de producción, 0 ids repetidos; la etiqueta del
    selector de tablero y la del campo de fichero apuntan a su control, y el
    campo del alta de columna a su error.
- **Sin test, y por qué.** El foco visible de los dos selectores, el `display`
  del diálogo y los suelos táctiles son CSS que el entorno de los tests no
  aplica: quedan medidos en el navegador, arriba. El test de las hojas sí
  cubre que ningún tamaño de letra vuelva a ir solo en píxeles.
- **Puertas.** `.\dev.cmd verify` completo, sin `prepare` porque no cambia
  ninguna imagen ni lockfile: 9 puertas, 0 en rojo. `board: tests` 830 checks
  y 0 fallos, `board: documents` 28 comprobaciones y 0 hallazgos,
  `dependencies`, `format`, `lint`, `typecheck` y `build` en verde, y `tests`
  522 tests, 0 fallidos y 0 con error (511 antes). La verificación completa de
  este commit es la del hook `pre-push` al empujarlo.

**Lo que no se hizo, y por qué.**

- **Nada que cambie el aspecto.** Los tamaños sueltos en `rem` y los colores
  escritos a mano no se pasaron a tokens: llevarlos a la escala mueve algún
  tamaño un píxel. La guía lo lista como abierto.
- **El borde de foco de los campos de texto** se deja como está: es un
  indicador propio y se ve (4,5:1 en claro y 3,5:1 en oscuro contra el borde
  en reposo, calculado a mano).
- **Cuatro hallazgos que piden decisión del dueño** quedan como decisiones
  abiertas, sin arreglar: `#calendar-loses-a-day-column-on-a-narrow-screen-with-large-text`,
  `#which-element-takes-the-focus-when-a-dialog-opens`,
  `#touch-floors-of-the-kit-do-not-reach-every-control` y
  `#texts-the-interface-says-only-in-english`. Las medidas táctiles de la
  tercera, con el puntero emulado a 390 píxeles: botones de icono 44 por 44;
  botones y campos de alta 44 de alto con letra de 14 px; selector de tablero
  362 por 40 con letra de 15,18 px; enlaces de navegación 152 por 40; campo
  para renombrar una columna 186 por 36 con 15,18 px; selector de idioma 62
  por 36 con 14 px; campo de fichero 350 por 24; enlaces de los créditos 57
  por 21; y en el calendario, tareas de 38 por 28 con letra de 10 px, el botón
  de hoy 53 por 29 y los de navegación 32 por 32.
- **No se comprobó:** Firefox ni Safari; ningún lector de pantalla; un teléfono
  de verdad, así que no se sabe si iOS amplía la página al enfocar un campo;
  el alto contraste del sistema más allá de emular sus colores; ni el
  contraste de cada par de colores. La pantalla de error de la aplicación no
  se alcanza con datos y solo se midieron sus estilos.

**Pendiente.** Las cuatro decisiones abiertas de arriba y lo que la guía lista
en «Lo que sigue abierto»: si la paleta, la tipografía y el efecto cristal son
una decisión de marca, los valores fuera de los tokens y el movimiento
reducido.
