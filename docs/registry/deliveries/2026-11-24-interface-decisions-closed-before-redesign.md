---
title: Las decisiones abiertas de la interfaz cerradas antes del rediseño, con el calendario que se desplaza, el foco al abrir un diálogo, los suelos de puntero, los textos traducidos, el movimiento reducido y las fechas que no rompen el tablero
date: 2026-11-24
phase: none
---
**Objetivo y dueño:** producto; encargo del dueño para cerrar lo que la guía de
diseño dejó abierto en `#2026-11-24-design-guide-and-reader-conditions`, con el
mínimo cambio de aspecto, porque más adelante pedirá un rediseño visual
estudiado con él. Palabras del dueño en el encargo: «aborda primero esas cosas
que me comentas que has dejado en cada proyecto», «No quiero deuda de ningun
tipo» y «Dejo a tu preferencia recomendados»; y al revisar el cierre: «todo
entra confirmado no dejes nada provisional» y «Tu decides por el bien de cada
proyecto». No abre ni cierra ninguna fase. Lo empezó un agente que se quedó sin
cuota con el código terminado y doce defectos repuestos a propósito para ver
fallar los tests; lo cerró otro, que quitó esos defectos, repitió el recorrido
en el navegador y escribió el registro.

**Qué cambió.**

- **El calendario no pierde días ni filas**
  (`#calendar-loses-a-day-column-on-a-narrow-screen-with-large-text`). La
  rejilla del mes no encoge por debajo de su contenido: se desplaza de lado
  dentro de una región con el nombre del mes que el tabulador alcanza, y de
  alto se desplaza el calendario
  (`src/widgets/calendar/ui/CalendarGrid.tsx`,
  `src/widgets/calendar/ui/CalendarGrid.module.css`). Cada tarea y el recuento
  de las que no caben se describen con su día (`formatDayLabel` en
  `src/widgets/calendar/lib/calendarUtils.ts`).
- **Un diálogo abre con el foco en su campo**, en una confirmación en
  «Cancelar», y si no en el botón de cerrar
  (`#which-element-takes-the-focus-when-a-dialog-opens`): la marca
  `DIALOG_INITIAL_FOCUS` (`src/shared/ui/Dialog/initialFocus.ts`) sustituye a
  los dos `autoFocus` que no tenían efecto. Cada diálogo se nombra por su
  título, con un id de `useId()`, y `closeLabel` pasa a ser obligatorio.
- **Suelos de puntero para todo control**
  (`#touch-floors-of-the-kit-do-not-reach-every-control`): 24 píxeles, 44 bajo
  un dedo y 16 de letra en un campo bajo un dedo, dichos una vez en
  `src/app/styles/global.css`; los botones, el campo y el área de texto del kit
  dejan de repetirlo en su hoja, y solo las tareas de un día del calendario se
  quedan en 24 bajo un dedo.
- **Lo que la interfaz dice, en su idioma**
  (`#texts-the-interface-says-only-in-english`): el botón de tema, las dos
  pantallas de error, el botón de cerrar un aviso y el del diálogo de un día.
  La pantalla de error de una ruta deja de enseñar el mensaje del error, que
  va a la consola. Claves nuevas `theme.*`, `toast.dismiss`, `error.*` y
  `validation.invalid_due_date` en los tres idiomas.
- **Nada se mueve para quien pidió menos movimiento**
  (`#nothing-moves-for-a-reader-who-asked-for-less-motion`): las animaciones y
  los desplazamientos de seis hojas pasan a
  `@media (prefers-reduced-motion: no-preference)`.
- **Una fecha de vencimiento es un día del calendario**
  (`#a-due-date-is-a-day-of-the-calendar`). Lo encontró el primer agente al
  repetir el recorrido: el campo de fecha deja escribir un año de cinco cifras,
  el almacén lo guardaba y el tablero dejaba de pintarse, también tras
  recargar; una copia de seguridad con una fecha así hacía lo mismo. Ahora lo
  rechazan el campo, el almacén y la importación, y la versión 2 del almacén
  quita esa fecha de lo ya guardado (`src/shared/api/dueDate.ts`,
  `src/shared/api/slices/taskSlice.ts`, `src/shared/api/restore.ts`,
  `src/shared/api/store.ts`).
- **Otros defectos del mismo tipo que salieron al repetir el recorrido:** los
  días de otros meses se atenuaban al 35 % y sus números quedaban a 2,21:1 en
  claro; ahora al 65 %, y su recuento lleva el color del texto. El resumen de
  una importación pintaba un fondo blanco fijo también en oscuro (1,24:1); toma
  el token de tarjeta. El icono de la aplicación, junto a su nombre, se leía
  como una imagen sin nombre y queda oculto a la tecnología de apoyo. Los
  botones sin formulario declaran `type="button"`.
- **Valores fuera de los tokens:** pasan a su token los radios de 4, 6 y 8
  píxeles, el rojo de error y el fondo del resumen de una importación, que
  tienen el mismo valor en claro. Los demás esperan al rediseño
  (`#choices-of-look-wait-for-the-visual-redesign`, aplazada).
- **Al registro, las reglas que ya sujetaban los tests:**
  `#the-text-follows-the-font-size-the-reader-chose`,
  `#ids-that-join-a-control-to-its-text-come-from-use-id` y
  `#a-dialog-gives-the-focus-back-to-whoever-opened-it`.
- **`DESIGN.md`** sube todo lo cerrado a «Decisiones tomadas», deja en «Lo que
  sigue abierto» solo el aspecto que espera al rediseño y pone al día «Cómo
  comprobarlo». La skill `kanban-board-conventions` dice los suelos de puntero,
  la marca del foco inicial, el `closeLabel` obligatorio, los dos límites de
  error, la regla del movimiento, la migración a la versión 2 y la regla de
  las fechas.

**Las ocho decisiones quedan `confirmed` por delegación del dueño, y una
`postponed`.** Las propuso un agente y las confirmó otro en la misma sesión de
trabajo, sin que el dueño las leyera: la regla dura 9 pide su confirmación en
un turno posterior, y el dueño pidió expresamente que nada quedara provisional.
Cada una lleva su refutación para que el dueño la relea.

**Cómo se verificó.**

- **Al arrancar,** sobre `784072a` y con el árbol limpio, no se repitieron las
  puertas: rige el verde con que ese commit pasó su pre-push.
- **Cada test se vio fallar.** Con el código de partida y los tests nuevos
  fallaron 35 de 582, en 15 ficheros. Con el código final y doce defectos
  repuestos por edición fallaron 20, entre ellos: el foco al abrir
  (`expect(element).toHaveFocus()` en el diálogo de tarea, el de tablero y la
  confirmación), los nombres de los diálogos
  (`expected [ undefined, undefined ] to deeply equal [ 'First', 'Second' ]`),
  la región del mes (`Unable to find an accessible element with the role
  "region" and name "July 2026"`), el mensaje de la ruta en pantalla
  (`expected <p class="message"></p> to be null`), las fechas que no existen
  (`expected [ … ] to have a length of 2 but got 3`), el movimiento y los suelos
  en las hojas (`expected [ Array(1) ] to deeply equal []`). Quitados los
  defectos con la edición inversa (14 ediciones en 10 ficheros): 582 tests y 0
  fallidos.
- **En Chrome 157,** sin ventana, contra el servidor de desarrollo con el árbol
  final y contra otro con `784072a`, con los mismos datos y las mismas sondas:
  - _Matriz._ Once estados por seis condiciones de lectura (1280 y 320
    píxeles, con la letra en 16 y en 24, zoom al 200 % y puntero táctil a 390)
    por claro y oscuro, 132 celdas: antes, 11 con contenido cortado sin
    desplazamiento que lo trajera, todas del calendario; después, ninguna.
    Desplazamiento horizontal del documento: 0 en todas.
  - _Calendario._ A 320 píxeles con la letra en 24, antes el domingo quedaba
    73 píxeles fuera de una caja que no se desplazaba y la última fila 316;
    después la rejilla mide 360 en una caja de 278 que se desplaza 84 píxeles
    de lado, y la última fila cae dentro. Antes se cortaba también la última
    fila a 1280 por 800 (6 píxeles), con la letra en 24 (48), a 1280 por 500
    (306) y con el zoom al 200 % (358). Con el teclado, el tabulador llega a la
    región y las flechas la desplazan de lado y desplazan el calendario.
  - _Foco al abrir._ Tarea, tarea desde el calendario y tablero nuevo o
    renombrado: antes el botón de cerrar, ahora su campo; borrar tablero: antes
    el botón de cerrar, ahora «Cancelar»; Ajustes y el día del calendario: el
    botón de cerrar, que antes se llamaba «Close dialog» en el del día. Al
    cerrarse con Escape, los siete devuelven el foco a quien los abrió.
  - _Indicadores de foco,_ medidos como lo que el foco cambia en los píxeles, a
    3:1 o más, contra el perímetro del control: la tarjeta, el botón de tarea,
    la región del mes y el recuento del calendario lo superan en claro y en
    oscuro; las tareas del calendario llegan a 362 de 363 (el anillo del
    navegador entero menos un píxel de esquina); los campos de texto cambian el
    borde entero, 596 píxeles de un perímetro de 616 que recortan las esquinas
    redondeadas, a 6,29:1 de lo que los rodea en claro y 4,99:1 en oscuro.
  - _Puntero._ Con ratón, antes medían menos de 24 las tareas y el recuento del
    calendario (15 de alto) y los enlaces de los créditos (22,5); después,
    nada. Con el puntero táctil a 390 píxeles, antes medían menos de 44 los
    enlaces de navegación y de los créditos, los dos selectores, el campo para
    renombrar una columna, el de fichero y los botones y las tareas del
    calendario, y cuatro campos o selectores tenían la letra por debajo de 16;
    después solo las tareas y el recuento del calendario quedan por debajo de
    44, en 24 o más, y ningún campo baja de 16.
  - _Contraste del texto,_ en 13 pantallas por los dos esquemas: antes 6
    textos por debajo de 4,5:1; después solo el del botón deshabilitado
    «Revisar copia», que WCAG exime.
  - _Movimiento._ Con el movimiento reducido emulado, en el recorrido de 11
    pantallas, antes se movían 22 animaciones y después ninguna; sin la
    preferencia siguen las mismas 31.
  - _Árbol de accesibilidad._ Antes los cinco diálogos se llamaban `""`;
    ahora por su título («Ajustes», «Eliminar tablero», el día del
    calendario). El botón de tema dice «Cambiar a modo oscuro», la región del
    mes «noviembre de 2026», y ningún control queda sin nombre.
  - _Fechas._ Antes, un año de cinco cifras en el campo se guardaba
    (`20000-01-01`) y el tablero pasaba a «Something went wrong / Invalid time
    value», también tras recargar; y una copia con una fecha que no era un día
    se importaba con el mismo resultado. Después el campo no acepta ese año, la
    fecha guardada no cambia y el tablero se pinta; la copia se rechaza con «El
    archivo seleccionado no contiene una copia de seguridad válida.».
  - _Consola:_ sin errores ni peticiones fallidas en ninguna sonda del árbol
    final.
- **En Firefox 160,** por WebDriver BiDi, en claro, en oscuro, a 320 píxeles
  con la letra en 24 y con el movimiento reducido: el tablero, el calendario y
  la 404 sin desplazamiento horizontal, con su título y `lang="es"`; el mes en
  su región con nombre, desplazándose de lado a 320; el diálogo de tarea con su
  nombre, el foco en el título y la fecha limitada a 9999; la confirmación con
  el foco en «Cancelar»; ninguna animación que se mueva con el movimiento
  reducido; y ningún error de JavaScript.
- **Al terminar:** `.\dev.cmd verify`, `RESULT: 9 puertas, 0 en rojo`, con 582
  tests de la aplicación, repetida hasta que el veredicto no cambió.

**Pendiente.**

- El aspecto que espera al rediseño visual, aplazado por el dueño:
  `#choices-of-look-wait-for-the-visual-redesign`.
- **No se comprobó** Safari ni Edge, un lector de pantalla de verdad (se leyó
  el árbol de accesibilidad de Chrome), un teléfono de verdad (si iOS amplía la
  página al enfocar un campo) ni el alto contraste del sistema.
