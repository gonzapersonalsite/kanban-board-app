---
title: Español por defecto en la raíz y rutas y shells estáticos en /en y /de
date: 2026-10-20
phase: F1
---
**Objetivo y dueño:** producto; parte 1 de F1 (`F1.1`). Decisión:
`#localized-spanish-routes-and-shells`.

**Qué cambió.**
- `src/shared/i18n/model/store.ts` y `src/shared/i18n/index.ts`: cambio de
  `DEFAULT_LOCALE` a `'es'`, funciones puras `resolveSupportedLocale`,
  `extractPathLocale`, `stripLocalePrefix`, `localizePath` y
  `resolveInitialLocale` (prioridad `?lang=` > prefijo `/en` o `/de` >
  `localStorage` > `navigator.language` > `'es'`), y actualización de
  `document.documentElement.lang` y `meta[property="og:locale"]`.
- `src/entities/board/model/routing.ts`, `src/app/router/model/useSyncBoardRoute.ts`,
  `src/app/router/model/useSyncLocaleRoute.ts`, `src/app/router/ui/AppShellRoute.tsx`,
  `src/app/router/ui/AppRouter.tsx`, `src/widgets/header/ui/Header.tsx` y
  `src/pages/not-found/ui/NotFoundPage.tsx`: rutas sin prefijo para español y
  rutas prefijadas `/en` y `/de` generadas desde `PREFIXED_LOCALES`,
  sincronización bidireccional entre URL e idioma activo y conservación de la
  vista y del `:boardId`.
- `index.html` y `tooling/agent-files/{site.ts,shell.ts,vitePlugin.ts,llmsTxt.ts}`:
  emisión del shell raíz en español (`index.html`) y de los shells de inglés
  (`/en`) y alemán (`/de`) con `<html lang>`, `<title>`, `description`,
  `og:locale`, `og:title`, `og:description`, `og:url`, `canonical` y `hreflang`
  (`es`, `en`, `de`, `x-default`), y rutas localizadas en sitemap.xml y
  llms.txt.
- Tests actualizados y añadidos en `src/shared/i18n/model/store.test.ts`,
  `src/entities/board/model/routing.test.ts`, `src/app/router/ui/AppRouter.test.tsx`,
  `tooling/agent-files/shell.test.ts` y `tooling/agent-files/vitePlugin.test.ts`.
- Documentación actualizada en `README.md`, `docs/ARCHITECTURE.md`,
  `docs/ROADMAP.md`, `docs/archive/ROADMAP.md` y
  `.agents/skills/kanban-board-conventions/SKILL.md`.

**Cómo se verificó.** Se inyectó un defecto ejecutable en `localizePath`
(`src/shared/i18n/model/store.ts`, invirtiendo `resolvedLocale === DEFAULT_LOCALE`
a `resolvedLocale !== DEFAULT_LOCALE`), lo que hizo fallar 15 tests en la puerta
`tests`; tras revertirlo con la edición inversa, se ejecutó `python verify.py`
desde la raíz arrancando en verde (9 puertas, 0 en rojo sobre `HEAD`) y
cerrando en verde con las 9 puertas en 0 en rojo.

**Pendiente.** Nada en este repositorio; todas las fases planificadas (`F0`,
`F1`) están en `DONE`.
