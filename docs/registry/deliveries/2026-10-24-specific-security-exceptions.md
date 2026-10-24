---
title: Reconciliación de la precedencia con la autoridad del dueño
date: 2026-10-24
phase: none
---
**Objetivo y dueño:** herramienta; mantenimiento del contrato solicitado por
el dueño en la revisión del ecosistema. No abre fase de producto.
Decisión: `#owner-authorises-specific-security-exceptions`.

**Qué cambió.** Los puntos 1 y 2 de «Qué manda» de `../../../AGENTS.md`
incorporan la corrección revisada en el origen de la plantilla. Se mantienen
los estándares locales, las líneas rojas y los permisos de commit y push.
La prosa del contrato pertenece al proyecto: esta conciliación manual no
declara una actualización integral del scaffold ni adelanta el manifiesto,
las bases de componentes, el motor o sus versiones.

**Cómo se verificó.** Antes de editar, `python -I verify.py` sobre
653eef804d5edd1dfe07d10269711d8218ade8c0 salió con código 0: nueve puertas en verde,
728 comprobaciones del tablero, 24 de documentos y 510 tests de producto
sin fallos. La restauración offline del lockfile funciona con pnpm 12.14.0;
se comprobó que los scripts de dependencias están desactivados. No se cambian
dependencias ni se añade un test que replique texto de documentación.

Después del cambio, el mismo comando terminó con código 0 y las nueve
puertas en verde: 728 comprobaciones del tablero, 24 de documentos y 510
tests de producto sin fallos. El tablero regeneró sus índices; no se editaron
a mano. El diff conserva los estándares del producto y no cambia código
ejecutable.
