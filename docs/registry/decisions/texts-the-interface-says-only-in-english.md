---
title: El botón de tema y las dos pantallas de error hablan solo en inglés
state: open
date: 2026-11-24
domain: localization
phase: none
---
**El botón de tema y las dos pantallas de error hablan solo en inglés, en los
tres idiomas.** El nombre accesible del botón que cambia el tema está escrito
en inglés en `src/features/theme-switcher/ui/ThemeSwitcher.tsx`, así que un
lector de pantalla lo dice en inglés dentro de unos Ajustes en español o en
alemán. Las dos pantallas de error tienen su título, su texto y su botón en
inglés: la de la aplicación, `ErrorBoundary`
(`src/app/providers/ErrorBoundary.tsx`), y la de una ruta,
`RouteErrorBoundary` (`src/app/router/ui/AppRouter.tsx`), que además enseña a
la persona el mensaje del error tal como lo lanzó el código. Lo vio la entrega
`#2026-11-24-design-guide-and-reader-conditions`.

**Qué hay que decidir.** Si esos textos entran en los ficheros de idioma de
`src/shared/i18n/config/`, y qué enseña la pantalla de error de una ruta en
lugar del mensaje interno. La pantalla de error de la aplicación se pinta
cuando ha fallado algo por encima de las rutas, y una traducción que dependa
de lo que falló no llegaría a verse: por eso no es una clave más.

**Por qué no tiene fase.** Las dos fases del plan del producto están hechas y
ninguna está abierta: es mantenimiento de la interfaz y de sus idiomas, y la
fase que lo recoja la abre el dueño.
