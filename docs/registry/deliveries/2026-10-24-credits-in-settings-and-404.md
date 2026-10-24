---
title: Créditos de autoría en Ajustes y en el footer de la 404
date: 2026-10-24
phase: none
---
**Objetivo y dueño:** producto; mantenimiento de presentación solicitado por el
dueño. No abre fase: no cambia el modelo, las rutas ni el espacio de trabajo.
Decisión: `#credits-in-settings-and-the-404-footer`.

**Qué cambió.** El diálogo de Ajustes cierra con un bloque `Credits` y la página
404 con un `<footer>` que reutiliza el mismo componente. El componente
(`src/shared/ui/Credits/`) muestra el nombre, el rol, una nota sobre el tablero
local y los enlaces al portafolio, GitHub y el correo personal. Las cadenas
viven en `src/shared/i18n/config/{es,en,de}.json`; el header y la 404 los
montan. No se añaden dependencias.

**Cómo se verificó.** La ejecución inicial de `python verify.py` terminó con
código 0, nueve puertas en verde y 728 comprobaciones del tablero. La suite de
Vitest terminó con 510 pruebas.

El test de regresión se vio fallar con el defecto original reintroducido: se
cambió `PORTFOLIO_URL` a `https://example.com/` y fallaron las comprobaciones de
créditos del header y de la 404. Restaurada la URL, volvieron a verde.

La ejecución final de `python verify.py` terminó con código 0, nueve puertas en
verde y 510 pruebas sin fallos; el build también pasó. La revisión en navegador
queda pendiente de que el dueño vea el bloque y el footer en local.

**Pendiente.** La decisión queda provisional hasta que el dueño vea el
resultado; entonces se confirma o se corrige. No se ha hecho commit ni push.
