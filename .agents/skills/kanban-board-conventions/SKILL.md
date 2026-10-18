---
name: kanban-board-conventions
description: Convenciones de kanban-board-app (arquitectura de estado y store, drag-and-drop, estilos y tokens de diseño, iconos, IDs, diálogos, tooltips, testing, rutas, vista previa social y ficheros para agentes, portabilidad de datos, tipos de dominio, manejo de errores, i18n, tema, límites de animación CSS y antipatrones). Úsala antes de cambiar código, tests, estilos o textos en este repositorio, junto con react-fsd-maintainer.
---

# kanban-board-app — Convenciones del proyecto

## Gestión de estado

- **Zustand** es la ÚNICA librería de estado. NO introduzcas Redux, Jotai, Context API ni ninguna otra herramienta para estado entre componentes.
- **Store de dominio** (datos del tablero Kanban): vive en `src/shared/api/store.ts`. Es un único store con el middleware `persist`.
- **Stores de infraestructura** (i18n, tema, toast): viven en sus propios ficheros `src/shared/<segmento>/model/store.ts`, exportados cada uno por su `src/shared/<segmento>/index.ts`. Cada uno es un store de Zustand independiente; i18n y tema tienen su propio middleware `persist`, y las notificaciones toast viven en memoria. Este patrón es distinto del store de dominio: los stores de infraestructura gestionan preocupaciones transversales, no entidades de negocio.
- Usa el **patrón de slices** para organizar la lógica del store de dominio: crea funciones de slice separadas por dominio (`createBoardSlice`, `createColumnSlice`, `createTaskSlice`, `createDndSlice`) y componlas en un único store enlazado.
- Aplica el middleware `persist` SOLO en el nivel del store compuesto para el store de dominio, nunca dentro de los slices individuales.
- Motor de almacenamiento: `localStorage` mediante `createJSONStorage(() => localStorage)` (integrado en Zustand). Sin IndexedDB salvo que se pida explícitamente.
- Clave del store de dominio: `kanban-board-storage`. Los stores de infraestructura usan sus propias claves (`i18n-locale`, `theme-preference`).

## Drag & Drop

- `@dnd-kit/react` (v0.4+) es la ÚNICA librería de drag-and-drop. NO uses `react-beautiful-dnd` (deprecada), `react-dnd` ni ninguna alternativa.
- Usa la API unificada: `DragDropProvider`, `useDraggable`, `useDroppable` de `@dnd-kit/react`, y `useSortable` de `@dnd-kit/react/sortable` (exportación de subruta en v0.5+).
- Sin `SortableContext`: la nueva API lo gestiona automáticamente.
- Usa el helper `move` de `@dnd-kit/helpers` para mutaciones de arrays.
- La respuesta visual de arrastre se renderiza con `<DragOverlay>` de `@dnd-kit/react`.
- Sensores: sensor de puntero por defecto (ratón + táctil) y sensor de teclado para accesibilidad.
- Un arrastre que no mueve nada NO DEBE escribir en el store. dnd-kit dispara un `dragover` con el origen sobre sí mismo nada más empezar un arrastre, y `move()` devuelve entonces la misma colección, por lo que `handleDragOver` en `useBoardDndLifecycle` omite `setState` cuando el aplicador devuelve su entrada. La instantánea de inicio de arrastre conserva las referencias del propio store (las colecciones nunca se mutan in situ), así que cancelar un arrastre que no movió nada no restaura nada. De lo contrario, levantar una tarjeta sin moverla persistiría el tablero de ejemplo intacto (ver «Arquitectura del store»).
- La salida para lectores de pantalla DEBE estar localizada. Cada activador arrastrable (envoltorio de tarjeta en `DraggableTaskCard`, contenido de columna en `ColumnShell` vía `SortableColumn`) establece `aria-roledescription={t('dnd.role_description')}` y `aria-describedby={BOARD_DND_INSTRUCTIONS_ID}`, que apunta al párrafo oculto `dnd.instructions` renderizado por `BoardDndContext`; el plugin Accessibility de dnd-kit respeta ambos atributos cuando ya existen. Los anuncios en vivo salen de `boardDndAnnouncements` (`src/features/drag-and-drop/model/boardDndAccessibility.ts`), que resuelve títulos desde el store y textos desde `dnd.*` al dispararse cada evento.
- `@dnd-kit/react` no exporta la clase del plugin Accessibility y `@dnd-kit/dom` no es dependencia directa, por lo que `withBoardDndAnnouncements` pasa los anuncios a cada plugin por defecto (solo Accessibility los lee). `BoardDndContext.accessibility.test.tsx` renderiza el provider real y DEBE seguir probando que levantar con teclado se anuncia en el idioma activo; revísalo en cada actualización de dnd-kit.

## Estilos

- **CSS Modules** es el ÚNICO enfoque de estilos. NO instales ni uses Tailwind CSS, styled-components, Emotion ni ninguna librería CSS-in-JS.
- Dónde viven los estilos (CSS Modules co-localizados en `ui/`, estilos globales y tokens en `src/app/styles/global.css`) lo manda `docs/ARCHITECTURE.md` («Estilos»).
- La tipografía, la iconografía y el tamaño de controles interactivos DEBEN regirse por los tokens globales de `src/app/styles/global.css`. NO disperses valores fijos como `12px`, `13px`, `14px`, `32px` o `36px` en los CSS de componentes cuando ya exista un token equivalente.
- Usa los tokens de escala tipográfica:
  - `--font-size-caption` para metadatos, textos de ayuda y texto secundario compacto.
  - `--font-size-body-sm` para texto de interfaz compacto como elementos de navegación, botones en línea y controles de formulario densos.
  - `--font-size-body` para texto principal de interfaz y títulos de tarjetas.
  - `--font-size-body-lg` y tokens de encabezado para etiquetas destacadas y títulos de página.
- Usa los tokens de tamaño de control:
  - `--control-size-sm` para controles compactos de escritorio.
  - `--control-size-md` para inputs y selects principales.
  - `--control-size-lg` para contextos táctiles (`coarse-pointer`).
- Usa tokens fluidos basados en `clamp()` para que la interfaz escale. Prioriza reutilizar tokens frente a reglas de fuente responsivas por componente salvo que el componente tenga una necesidad genuinamente única.

## Iconos

- **lucide-react** es la ÚNICA librería de iconos. Importa iconos individuales por nombre (tree-shakable):
  ```ts
  import { Plus, Trash2, Pencil, GripVertical, X } from 'lucide-react'
  ```
- NO importes la librería entera con `import * as Icons`.
- El tamaño de los iconos DEBE ser coherente con los tokens globales de `src/app/styles/global.css`.
- Para iconos renderizados dentro de `Button` o `IconButton` de `shared/ui`, deja que el CSS del componente controle el tamaño final. NO ajustes cada icono con tamaños puntuales salvo excepción visual clara.
- Para iconos sueltos fuera de controles compartidos, usa uno de los niveles de token:
  - indicador pequeño → `--icon-size-sm`
  - icono de acción estándar → `--icon-size-md`
  - icono destacado → `--icon-size-lg`
- Los controles de solo icono en escritorio NO DEBEN ser menores que `--control-size-sm`. En contextos táctiles (`coarse-pointer`) DEBEN usar `--control-size-lg`.

## Generación de IDs

- **nanoid** es el ÚNICO generador de IDs para todas las entidades de dominio (tableros, columnas, tareas).
- Importación: `import { nanoid } from 'nanoid'`
- Llama a `nanoid()` en el momento de creación de cada entidad.

## Modales y diálogos

- Usa el elemento nativo **HTML `<dialog>`** (Baseline Widely available). NO instales una librería de modales.
- Un componente contenedor ligero vive en `src/shared/ui/Dialog/Dialog.tsx` con apertura y cierre imperativos mediante `ref`.
- Usa `showModal()` para comportamiento modal y `close()` para cerrar.
- El componente `Dialog` acepta una prop opcional `closeLabel` (por defecto `'Close dialog'`) para el `aria-label` del botón de cierre.

## Tooltips

- Componente genérico de tooltip en `src/shared/ui/Tooltip/Tooltip.tsx`.
- Acepta `text` (`string`) y `children` (`ReactNode`). Envuelve cualquier elemento para mostrar un tooltip al pasar el ratón o recibir foco.
- Usa `position: fixed` con coordenadas calculadas mediante `getBoundingClientRect()` al mostrarse, de modo que flota por encima de cualquier contenedor con `overflow: hidden/auto` (columnas, modales).
- Accesibilidad: conectado mediante `aria-describedby` en el elemento disparador y `role="tooltip"` en el tooltip.
- Aplicado a todos los botones de solo icono en `ColumnHeader` y `TaskCard` (editar, eliminar, guardar título, cancelar edición).

## Testing

- **Vitest** + **@testing-library/react** + **jsdom** + **@testing-library/jest-dom**.
- Los tests viven al lado de lo que prueban (ver `docs/ARCHITECTURE.md`, «Slices y segmentos»).
- La infraestructura compartida de tests vive en `src/test/` (fixtures, helpers y el setup `src/test/setup/vitestSetup.ts` con los stubs de jsdom y la limpieza tras cada test). Es la única carpeta de `src` fuera de las capas, y el código de producción NO DEBE importarla: el lint lo rechaza (ver `docs/ARCHITECTURE.md`).
- Una sola configuración de Vitest, en `vite.config.ts`, con dos proyectos: `app` corre los tests de `src` en jsdom con el setup, y `tooling` corre los tests de la configuración en la raíz (`eslint.config.test.ts`) y de las herramientas de build (`tooling/`) en Node.
- Todo test corre y comprueba algo: la regla y qué la hace cumplir están en `docs/ARCHITECTURE.md` («Slices y segmentos»).
- Ejecución: `pnpm test` (Vitest), `pnpm test:coverage` (con umbrales).
- Cobertura: 70 % en ramas, líneas, funciones y sentencias; el alcance medido y los umbrales viven en `vite.config.ts` (`coverage`), comprobados por `pnpm test:coverage`.
- Patrón AAA obligatorio: Arrange → línea en blanco → Act → línea en blanco → Assert.
- Nombres de test: `does_expected_behavior_when_condition` (`snake_case`, centrados en el comportamiento).
- Haz mock solo de fronteras externas (`@dnd-kit/*`, `HTMLDialogElement.showModal`). Nunca hagas mock de los slices del store de dominio ni de tipos propios.
- Reinicia el store de Zustand con `resetPersistedKanbanStore()` de `@/test/helpers/storeTestUtils` antes de cada test de integración.
- Fixtures deterministas en `@/test/fixtures/kanbanFixtures`.

## Rutas

- **react-router-dom** (v7) es la ÚNICA librería de enrutado. NO instales el router de Next.js, TanStack Router ni ninguna alternativa.
- Todas las definiciones de rutas viven en `src/app/router/ui/AppRouter.tsx` usando `createBrowserRouter` y `RouterProvider`.
- La API pública se exporta desde `src/app/router/index.ts` como `AppRouter`.
- Las páginas DEBEN cargarse de forma diferida con `React.lazy()` en el nivel de ruta para dividir el bundle.
- Los componentes de ruta se envuelven en `<Suspense>`; el fallback actual es `null` (añade un `<LoadingFallback />` compartido de `src/shared/ui/` cuando sea no trivial).
- El marco compartido de las rutas (`Header`, futura navegación persistente y demás UI del shell) DEBE vivir en una ruta de layout de `src/app/router` con `<Outlet />`, nunca dentro de páginas individuales. Las páginas solo renderizan el contenido específico de su ruta.
- Los límites de error están manejados actualmente por el `<ErrorBoundary>` de nivel de aplicación en `src/app/providers/`.
- Las rutas tienen alcance de tablero:
  - ruta raíz → redirige a `/board/:activeBoardId`
  - `/board/:boardId` → vista de tablero
  - `/calendar` → redirige a `/calendar/:activeBoardId`
  - `/calendar/:boardId` → vista de calendario
  - `*` → `NotFoundPage`
- La URL es la fuente de verdad durante la navegación. Sincroniza los parámetros de ruta y el estado del store en `src/app/router/model/useSyncBoardRoute.ts`, no dentro de `pages/` ni `entities/`.
- La navegación de la cabecera y el cambio de tablero DEBEN conservar la vista actual (`board` o `calendar`) cambiando únicamente `:boardId`.

## Vista previa social y ficheros legibles por agentes

- Los crawlers sociales, buscadores y agentes de IA leen `index.html` sin ejecutar JavaScript, así que lo que deben ver lo escribe el build: `tooling/agent-files/vitePlugin.ts`, registrado en `vite.config.ts`. `usePageMeta` solo actualiza el título y la descripción para las personas que navegan por la app.
- **Una sola fuente:** `tooling/agent-files/site.ts` guarda la dirección del sitio (`SITE_URL`, `absoluteUrl`) y el nombre y la descripción del sitio. La app nunca necesita su propia dirección, así que vive con su único consumidor, las herramientas de build, no en `src`; cambiar de dominio cambia `SITE_URL` y nada más.
- **Vista previa social:** `index.html` declara las etiquetas Open Graph y Twitter con `og:url` apuntando a la raíz del sitio y rutas de imagen relativas a la raíz. El build escribe el título, la descripción y las direcciones absolutas desde `tooling/agent-files/site.ts`, y rechaza una ruta de imagen que no sea relativa a la raíz o una etiqueta ausente o repetida; los valores de `index.html` solo sirven al servidor de desarrollo. Twitter/X usa como respaldo `og:title` y `og:description`, así que `index.html` no los repite.
- **Portada:** `public/og-cover.png`, un PNG de 1200×630 cuyo tipo, tamaño y texto alternativo declara `index.html`. Muestra el nombre de la app, el lema y el stack sobre un tablero dibujado con los tokens del tema oscuro, renderizado desde una página HTML en Edge headless; el nombre y el lema quedan dentro del cuadrado central de 630×630 para vistas previas que recortan en cuadrado. Como las plataformas cachean las vistas previas por URL, cambiar la imagen exige un nombre de fichero nuevo; tras desplegar, refresca la vista previa con LinkedIn Post Inspector.
- **Ficheros para agentes:** el build emite llms.txt (resumen y enlaces en formato llmstxt.org), robots.txt (permite todo y nombra el sitemap) y sitemap.xml (solo la raíz, porque las direcciones de tablero y calendario nombran los tableros que cada visitante guarda en su propio navegador), y el servidor de desarrollo sirve los mismos ficheros. Vercel sirve los ficheros construidos antes de la reescritura SPA de `vercel.json`. Ninguno se escribe a mano en `public/`.
- Los tests junto a cada módulo de `tooling/agent-files/` comprueban los generadores, el shell contra el `index.html` real y el tipo y tamaño reales de la portada, y construyen y sirven la app con el `vite.config.ts` real.

## Arquitectura del store

- Único store de Zustand en `src/shared/api/store.ts` con middleware `persist`.
- Forma del estado del store:
  ```ts
  interface KanbanState {
    boards: Board[]
    activeBoardId: BoardId | null
    columnsByBoard: Record<BoardId, Column[]>
    tasksByBoard: Record<BoardId, Record<ColumnId, Task[]>>

    // board actions
    addBoard(title?: string): void
    updateBoard(id: BoardId, title: string): void
    deleteBoard(id: BoardId): void
    setActiveBoard(id: BoardId): void

    // active-board-scoped actions
    addColumn(title: string): void
    updateColumn(id: ColumnId, title: string): void
    deleteColumn(id: ColumnId): void
    reorderColumns(fromIndex: number, toIndex: number): void
    addTask(columnId: ColumnId, title: string): void
    updateTask(columnId: ColumnId, taskId: TaskId, data: Partial<Task>): void
    deleteTask(columnId: ColumnId, taskId: TaskId): void
    moveTask(sourceColId: ColumnId, destColId: ColumnId, taskId: TaskId, newIndex: number): void
    reorderTask(columnId: ColumnId, fromIndex: number, toIndex: number): void
  }
  ```
- El estado de dominio persistido DEBE contener siempre al menos un tablero.
- Tablero de ejemplo en la primera visita: `createInitialKanbanState()` en `src/shared/api/slices/helpers.ts` es el estado previo a la hidratación, por lo que solo es visible cuando no hay nada persistido bajo `kanban-board-storage`. Siembra el tablero por defecto localizado con tareas de ejemplo (`seed.tasks.*`) cuyas fechas de vencimiento son relativas a la visita actual. Los datos persistidos DEBEN reemplazarlo siempre al hidratar: nunca mezcles tareas de ejemplo con datos guardados ni las vuelvas a añadir. Los tableros creados con `addBoard` nacen vacíos (`createBoardData`).
- Ciclo de vida del tablero de ejemplo (`createSampleBoardLifecycle()` en `src/shared/api/sampleBoard.ts`, conectado una vez en `src/shared/api/store.ts`): mientras el ejemplo no se haya tocado, nunca se escribe en almacenamiento, y un cambio de idioma lo relocaliza in situ con `localizeSampleBoard()` (mismos IDs y fechas de vencimiento, para que las rutas y las claves de React sigan siendo válidas). «Intacto» se decide por identidad de referencia de `boards`, `activeBoardId`, `columnsByBoard` y `tasksByBoard`, así que toda acción del store DEBE seguir reemplazando las colecciones que cambia en vez de mutarlas. El primer cambio se persiste con normalidad y, a partir de entonces, los cambios de idioma nunca tocan el tablero. Nunca relocalices ni reescribas datos persistidos.
- Funciones de slice: `createBoardSlice`, `createColumnSlice`, `createTaskSlice`, `createDndSlice` en ficheros separados bajo `src/shared/api/slices/`.
- La migración del esquema persistido desde el estado plano heredado se gestiona mediante `version` + `migrate` en `src/shared/api/store.ts`. Conserva la clave de almacenamiento `kanban-board-storage`.

## Portabilidad de datos

- Los contratos públicos de exportación e importación viven en `src/features/data-portability/`. NO los acoples a los detalles internos de `persist` de Zustand.
- El formato portable es un contrato de instantánea versionado (`schemaVersion`, `exportedAt`, `boards`, `activeBoardId`, `columnsByBoard`, `tasksByBoard`).
- Nunca exportes ni importes el blob crudo de `localStorage` de `kanban-board-storage` como formato público de copia de seguridad.
- La validación y normalización de la instantánea deben ocurrir dentro de `src/features/data-portability/model/` antes de que cualquier flujo de restauración toque el store de dominio.
- La restauración del dominio entra ÚNICAMENTE por `src/shared/api/restore.ts`. NO restaures datos mutando `localStorage` directamente ni parcheando el estado desde componentes de UI.
- La restauración debe ser atómica: valida y normaliza primero, escribe en el store una sola vez y deja el estado actual intacto si falla.
- La UI de exportación vive en el diálogo de ajustes del Header, nunca dentro de `src/features/board-management`.
- La exportación ofrece siempre descarga de fichero primero. `navigator.share` es solo mejora progresiva y nunca debe sustituir la descarga.
- La UI de importación también vive en el diálogo de ajustes del Header y sigue un flujo en dos pasos: seleccionar fichero → revisar resumen → confirmar reemplazo destructivo.
- Tras una importación correcta, navega al `activeBoardId` restaurado conservando la vista actual (`board` o `calendar`).
- La portabilidad de datos se basa estrictamente en ficheros locales. NO introduzcas compartición por URL, sincronización remota ni transferencias con backend salvo que el dueño cambie esta decisión en una sesión posterior.

## Tipos de dominio

Todos los tipos de dominio viven junto al store en `src/shared/api/slices/types.ts` y se reexportan por `src/shared/api/index.ts`. Los consumidores importan desde `@/shared/api`:
```ts
type BoardId = string
type ColumnId = string
type TaskId = string

interface Board { id: BoardId; title: string }
interface Column { id: ColumnId; title: string }
interface Task { id: TaskId; title: string; description: string }
```

- Los selectores y helpers de rutas con alcance de tablero viven en `src/entities/board/model/` y se reexportan por `src/entities/board/index.ts`.

## Flujo de datos

El flujo de datos (cómo llegan los componentes al store de dominio, su persistencia en `localStorage`, sin peticiones de red) lo manda `docs/ARCHITECTURE.md` («Datos y E/S»).

## Manejo de errores

- Las acciones de Zustand validan el estado antes de mutarlo (fail-fast).
- Sin bloques `catch` silenciosos: todo camino de error debe tener manejo explícito.
- Los errores visibles para el usuario se muestran mediante el `Toast` compartido (`useToastStore` de `@/shared/toast`, renderizado por `Toast` de `@/shared/ui` en `src/app/App.tsx`) o validación en línea.
- Sin `console.log` en código de producción; usa `console.warn` / `console.error` solo para desarrollo.

## Flujo de desarrollo

Los comandos, puertas (`gates.txt`, `python verify.py`) y hooks (`.githooks/`) están en `AGENTS.md` y `README.md`.

## Internacionalización (i18n)

- **Segmento i18n**: `src/shared/i18n/` — infraestructura transversal, cero lógica de negocio.
- **Ficheros de traducción**: un JSON por idioma en `src/shared/i18n/config/`. Las claves planas se generan con la utilidad `flattenTranslations` al cargar.
- **Descubrimiento de idiomas**: `import.meta.glob` descubre automáticamente todos los ficheros `*.json` del directorio de configuración. Añadir un idioma nuevo = añadir un fichero JSON nuevo.
- **Estado**: store de Zustand en `src/shared/i18n/model/store.ts` con middleware `persist` (clave: `i18n-locale`). Solo se persiste `locale`; las traducciones se vuelven a derivar al rehidratar.
- **Reactividad**: los componentes usan el hook `useTranslation()` (no un selector directo del store) para garantizar re-renderizados reactivos al cambiar de idioma. `useTranslation()` se suscribe a `state.locale` y devuelve una clausura `t` fresca en cada render.
- **API**: `useTranslation()` devuelve `{ t, locale, setLocale, availableLocales }`:
  - `t(key, params?)` — resuelve e interpola una clave de traducción.
  - `locale` — código del idioma actual.
  - `setLocale(locale)` — cambia el idioma y lo persiste en `localStorage`.
  - `availableLocales` — lista de códigos de idioma disponibles derivados de los ficheros JSON.
- **Sintaxis de interpolación**: `{{param}}` — p. ej., `t('task.edit', { title })`.
- **Tipado**: las claves son strings (notación con puntos a partir del anidamiento JSON). Sin tipo autogenerado: el consumidor conoce las claves a partir del JSON en inglés.
- **Detección del navegador**: en la primera visita (sin idioma persistido), se comprueba `navigator.language` contra los idiomas disponibles.
- **Idioma del documento**: `src/shared/i18n/model/store.ts` mantiene `document.documentElement.lang` igual al idioma activo al arrancar y en cada cambio de idioma (inglés si un idioma no tuviera mensajes), para que los lectores de pantalla lean la interfaz y los anuncios de drag-and-drop con las reglas de pronunciación adecuadas. `lang="en"` en `index.html` es solo el valor por defecto antes de que arranque la app; no asignes `lang` en ningún otro sitio.
- **Datos semilla**: los helpers del store llaman a `useI18nStore.getState().t()` de forma perezosa para resolver los títulos iniciales de columnas, el título del tablero por defecto y las tareas de ejemplo de la primera visita en el idioma actual. El tablero de ejemplo intacto también sigue los cambios de idioma posteriores (ver «Arquitectura del store»); las columnas y tableros que el visitante ya haya cambiado o creado conservan el idioma en que se crearon.
- **Etiqueta de cierre de diálogo**: `Dialog` acepta la prop opcional `closeLabel` (por defecto `'Close dialog'`). Los consumidores pasan `t('dialog.close')`.
- **Patrón de importación**:
  ```ts
  import { useTranslation } from '@/shared/i18n'

  function Component() {
    const { t } = useTranslation()
    return <h1>{t('app.title')}</h1>
  }
  ```
- **Añadir un idioma**: copia `src/shared/i18n/config/en.json` a un fichero nuevo en `src/shared/i18n/config/` (como `src/shared/i18n/config/es.json` o `src/shared/i18n/config/de.json`) y traduce todos los valores. No hace falta tocar código: `import.meta.glob` lo detecta automáticamente.
- **Paridad de idiomas**: `src/shared/i18n/config/locales.test.ts` exige que cada idioma tenga exactamente las claves planas del inglés, los mismos `{{placeholders}}` en cada mensaje y ningún mensaje vacío. Nunca añadas una clave a un solo idioma.
- **Estilo de los textos**: el español es español de España con mayúscula solo en la primera palabra y nombres propios (`Añadir`, `Ajustes`, `copia de seguridad`; nunca variantes como `Agregar`). El inglés usa también sentence case (`New board`, `Add card`, `To do`) con ortografía estadounidense (`canceled`, `color`, `prioritize`); solo el nombre del producto `Kanban Board` conserva sus mayúsculas. `Kanban` va siempre con mayúscula inicial como nombre del método (`Kanban board`, `tablero Kanban`, `Kanban-Board`). El alemán usa el tratamiento informal `du`. Mantén alineado el significado entre EN, ES y DE.
- **Descripciones de tareas de ejemplo** (`seed.tasks.*.description`): DEBEN caber en el recorte de dos líneas de la tarjeta en la columna de escritorio más estrecha (unos 230 px de ancho en un viewport de ~1250 px, ~55 caracteres en Inter) en todos los idiomas. Mídelas en el navegador tras cualquier cambio.

### Estructura de claves de traducción

Las claves se organizan en espacios de nombres que reflejan las fronteras de features y entidades:

```
app/          → app.title
board/        → board.add, board.rename, board.delete, board.default_title
board_view/   → board_view.empty_column
column/       → column.add, column.rename, column.title_placeholder, column.title_aria, ...
task/         → task.add, task.edit, task.delete, task.title_placeholder, task.title_aria
task_dialog/  → task_dialog.title, task_dialog.title_label, task_dialog.cancel, task_dialog.save, ...
dialog/       → dialog.close
seed/         → seed.column_todo, seed.column_in_progress, seed.column_done, seed.tasks.<id>.title|description
dnd/          → dnd.role_description, dnd.instructions, dnd.cancelled, dnd.task|column.picked_up|over_column|dropped
```

Pautas:
- Espacio de nombres por dominio (`task`), no por ubicación visual. Los botones `cancel` y `save` pertenecen a `task_dialog.*`, no a un espacio genérico, para evitar colisiones al añadir otros diálogos.
- Reserva `board.*` para la gestión de tableros y `board_view.*` para textos exclusivos de la vista de tablero.
- Los placeholders y `aria-label` viven con su entidad (`column.title_placeholder`, `task.title_aria`), sin mezclarlos con claves de acción.
- Las features nuevas crean su propio espacio de nombres de primer nivel (p. ej., `auth.*`, `settings.*`, `confirm_dialog.*`).

### Selector de idioma

- **Slice**: `src/features/language-switcher/` — renderiza un `<select>` con los idiomas disponibles.
- Lee `t`, `locale`, `setLocale` y `availableLocales` de `useTranslation()`; llama a `setLocale` al cambiar y refleja el `locale` actual.
- El `<select>` DEBE llevar `aria-label={t('header.language')}`: el texto visible junto a él es un `<span>` plano, así que sin `aria-label` los lectores de pantalla anunciarían solo `"EN, combo box"`.
- Las etiquetas visibles se definen en una constante `LABELS` dentro del componente (no se traducen: códigos como `"EN"`, `"ES"` son abreviaturas independientes del idioma).
- Se renderiza en el diálogo de ajustes del Header (`src/widgets/header/ui/Header.tsx`), junto a `ThemeSwitcher` y las secciones de portabilidad de datos.

## Sistema de temas (modo oscuro)

- **Segmento de infraestructura**: `src/shared/theme/` — store + tipos, cero UI. Sigue el mismo patrón que `src/shared/i18n/`.
- **Estado**: store de Zustand en `src/shared/theme/model/store.ts` con middleware `persist` (clave: `theme-preference`). Persiste únicamente el valor `theme` (`'light' | 'dark'`).
- **Inicialización**: al rehidratar, el store aplica el atributo `data-theme` en `document.documentElement`. Si no hay valor persistido, recurre a la media query `prefers-color-scheme` sin guardarlo, de modo que el tema sigue al sistema hasta que el visitante lo cambie manualmente.
- Zustand llama a `merge` con `undefined` cuando no hay nada guardado (primera visita), y `persist` traga en silencio cualquier excepción que lance `merge`. El `merge` de ambos stores de infraestructura (tema e i18n) DEBE manejar un estado persistido ausente; `src/shared/theme/model/store.test.ts` prueba que una primera visita sigue la preferencia oscura y clara del sistema.
- **Feature de UI**: `src/features/theme-switcher/` — renderiza el botón de alternancia sol/luna (iconos `Sun`/`Moon` de lucide-react). Importa `useThemeStore` de `@/shared/theme`.
- **Patrón de importación**:
  ```ts
  import { useThemeStore } from '@/shared/theme'
  import { ThemeSwitcher } from '@/features/theme-switcher'
  ```
- **API pública** (`src/shared/theme/index.ts`): exporta `useThemeStore`, el tipo `Theme` y el tipo `ThemeStore`.
- **API pública** (`src/features/theme-switcher/index.ts`): exporta únicamente `ThemeSwitcher`. El store NO se reexporta desde `features`: los consumidores lo importan directamente de `@/shared/theme`.

## Tokens de diseño y modo oscuro

- **Ubicación de tokens**: todos los tokens de diseño viven en `src/app/styles/global.css` dentro de `:root` para el modo claro y `[data-theme='dark']` para el modo oscuro.
- **Enfoque de modo oscuro**: apóyate EXCLUSIVAMENTE en propiedades personalizadas CSS (custom properties). NUNCA uses selectores de clase en `src/app/styles/global.css` para sobreescribir componentes con CSS Modules en modo oscuro: CSS Modules aplica hash a los nombres de clase, por lo que `[data-theme='dark'] .card` NO coincidiría con `TaskCard_card__abc123`.
- **Los selectores de elemento son seguros**: `[data-theme='dark'] header`, `[data-theme='dark'] dialog::backdrop`, etc. apuntan a elementos HTML (no a clases), por lo que funcionan con CSS Modules.
- **Tokens específicos de tarjeta**: como los fondos de tarjeta tienen efecto cristal translúcido, usan sus propios tokens:
  - `--color-card-bg`: fondo semitransparente (claro: `rgba(255,255,255,0.7)`, oscuro: `rgba(39,39,42,0.6)`)
  - `--color-card-border`: borde semitransparente (claro: `rgba(255,255,255,0.5)`, oscuro: `rgba(255,255,255,0.06)`)
  - `--color-card-shadow`: color de sombra de tarjeta (claro: tinte índigo, oscuro: tinte negro)
  - `--color-card-shadow-hover`: color de sombra de tarjeta al pasar el ratón
- **Colores de acento de columna**: definidos como el array constante `COLUMN_ACCENT_COLORS` en `src/widgets/board/ui/Board.tsx`. Se pasan a `SortableColumn` → `ColumnShell` como prop `accentColor`, aplicados mediante `style` en línea como la custom property `--column-accent`. El mismo color se pasa a `DraggableTaskCard` → `TaskCard` como `--card-accent` para la franja lateral izquierda. Los colores rotan con `index % COLUMN_ACCENT_COLORS.length`.
- **Glassmorphism del Header**: `src/widgets/header/ui/Header.module.css` usa `background: rgba(255,255,255,0.75)` + `backdrop-filter: blur(16px)`. El modo oscuro se aplica con el selector de elemento `[data-theme='dark'] header { background: rgba(39,39,42,0.75) }` en `src/app/styles/global.css`.
- **Gradiente primario de Button**: `src/shared/ui/Button/Button.module.css` usa `background: linear-gradient(135deg, #6366f1, #8b5cf6)` con `box-shadow` coloreado. El hover oscurece el gradiente y aplica `translateY(-1px)`.

## Restricciones de CSS y animaciones

- **Sin `transform` en `@keyframes` sobre elementos ordenables**: las declaraciones de animación CSS (`@keyframes`) prevalecen sobre las declaraciones normales del autor (incluido `style` en línea) en la cascada CSS. Si un `@keyframes` declara `transform`, pisa cualquier `transform` en línea aplicado por `@dnd-kit` durante el arrastre y rompe el drag-and-drop.
  - ✅ `@keyframes` solo con `opacity` → seguro para animaciones de entrada en tarjetas y columnas.
  - ✅ `transform` en selectores `.hover` o `.overlayCard` → seguro (no está dentro de `@keyframes`, y los overlays son elementos separados).
  - ❌ `@keyframes` con `transform: scale(...)` o `transform: translateY(...)` → ROMPE el posicionamiento de dnd-kit.
- **Animaciones de entrada**: `cardEnter` (`TaskCard`) y `columnEnter` (`ColumnShell`) son fundidos simples de `opacity` con `animation-fill-mode: both`, sin escalado ni desplazamiento.
- **Rotación del overlay de arrastre**: `BoardDndContext.module.css` añade `rotate(2deg)` a `.overlayCard` mediante una regla `transform` estática (no un keyframe). Es seguro porque `DragOverlay` es un elemento separado renderizado por dnd-kit, no un elemento ordenable.

## Antipatrones (tolerancia cero)

- Nunca instales Tailwind CSS ni ninguna librería CSS-in-JS.
- Nunca uses `react-beautiful-dnd` ni `react-dnd`.
- Nunca coloques lógica del store de dominio (`create` de Zustand para entidades Kanban) fuera de `src/shared/api/store.ts`. Los stores de infraestructura (i18n, tema, toast) son las excepciones declaradas en «Gestión de estado».
- Nunca uses selectores de clase CSS en `src/app/styles/global.css` para aplicar modo oscuro sobre componentes con CSS Modules; usa tokens de diseño (CSS custom properties).
- Nunca uses `transform` dentro de animaciones `@keyframes` en componentes que participen en drag-and-drop; usa únicamente `opacity` en las animaciones de entrada.
