---
title: Los suelos táctiles del kit no llegan a todos los controles
state: open
date: 2026-11-24
domain: interface
phase: none
---
**Los suelos táctiles del kit no llegan a todos los controles, y está sin
decidir si deben.** Con un puntero táctil, el kit garantiza dos cosas: que un
campo no baja de 16 píxeles de letra, para que Safari en iOS no amplíe la página
al enfocarlo (`src/shared/ui/Input/Input.module.css`), y que un botón o un
campo mide al menos 44 píxeles de alto (`src/shared/ui/Button/Button.module.css`,
`src/shared/ui/IconButton/IconButton.module.css`). Varios controles quedan por
debajo de uno de los dos suelos, o de los dos:

- **Letra por debajo de 16 píxeles.** El alta de tarea y el alta de columna,
  que ponen su propio tamaño después del kit
  (`src/features/task-management/ui/AddTaskForm.module.css`,
  `src/features/column-management/ui/AddColumnForm.module.css`); el campo para
  renombrar una columna (`src/entities/column/ui/ColumnHeader.module.css`); y
  los dos selectores, el de tablero y el de idioma, que no son del kit
  (`src/entities/board/ui/BoardSelector.module.css`,
  `src/features/language-switcher/ui/LanguageSwitcher.module.css`).
- **Alto por debajo de 44 píxeles.** Esos dos selectores, el campo para
  renombrar una columna, los enlaces de navegación de la cabecera, el campo de
  fichero y los enlaces de los créditos de Ajustes, y los botones y las tareas
  del calendario (`src/widgets/calendar/ui/CalendarGrid.module.css`).

Las medidas de cada uno, con el puntero táctil emulado, están en la entrega
`#2026-11-24-design-guide-and-reader-conditions`.

**Qué hay que decidir.** Si los dos suelos son de todo control o solo del kit,
y en el calendario qué cede: una tarea del mes no cabe a 44 píxeles en su
celda. Subir cualquiera de ellos cambia lo que se ve en un teléfono, y por eso
no se hizo al medirlo.

**Lo que no se sabe.** Si Safari amplía de verdad la página con estos campos y
selectores: no se probó en un iPhone, solo se leyó el tamaño calculado.

**Por qué no tiene fase.** Las dos fases del plan del producto están hechas y
ninguna está abierta: es mantenimiento de la interfaz, y la fase que lo recoja
la abre el dueño. La guía de diseño lo lista en «Lo que sigue abierto».
