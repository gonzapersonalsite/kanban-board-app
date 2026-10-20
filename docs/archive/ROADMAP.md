# Archivo del plan del producto — fases cerradas (CERRADO)

Los cuerpos de las fases ya DONE. **Este documento no gobierna nada**: se lee
para saber qué trajo una fase y con qué criterio se cerró, nunca para decidir
trabajo futuro. Manda `../ROADMAP.md`, donde cada fase conserva su cabecera, su
marcador y la lápida que apunta aquí. Solo crece por el final.

## F0 — Línea base de la aplicación Kanban Board (DONE)

- **Alcance:** aplicación Kanban multitablero con columnas, tarjetas, arrastrar y
  soltar, vista de calendario, copia de seguridad y restauración local
  (`schemaVersion`), localización en inglés, español y alemán, temas claro y
  oscuro, y generación en build de vista previa social y ficheros para agentes
  (`llms.txt`, `robots.txt`, `sitemap.xml`).
- **Gobernanza:** los límites de Feature-Sliced Design viven en
  `../ARCHITECTURE.md` y los hacen cumplir `../../eslint.config.js` y
  `../../eslint-fsd-gaps.js`; las convenciones del proyecto viven en
  `../../.agents/skills/kanban-board-conventions/SKILL.md`.
- **Línea base de adopción:** producto existente adoptado bajo el andamio
  compartido y el stack `react-fsd` en
  `#this-repository-uses-the-agentic-scaffold` y verificado en
  `#2026-10-18-adopt-agentic-scaffold-and-react-fsd`.

## F1 — Español como idioma raíz por defecto y rutas prefijadas en `/en` y `/de` (DONE)

- **F1.1 — Español por defecto en la ruta raíz y rutas localizadas `/en` y `/de` — DONE.**
  El español (`es`) es el idioma por defecto en la ruta raíz (`/board/:boardId`,
  `/calendar`, `/calendar/:boardId`), el inglés (`en`) vive bajo `/en` y el
  alemán (`de`) bajo `/de`, con prioridad `?lang=` > prefijo de URL >
  preferencia guardada en `localStorage` > `navigator.language` > `'es'`,
  sincronización bidireccional entre el router y `useI18nStore`, y emisión en
  build de los shells estáticos de español, inglés y alemán con metadatos Open
  Graph, `canonical`, `hreflang` (`es`, `en`, `de`, `x-default`) y sitemap.xml
  (`#localized-spanish-routes-and-shells`,
  `#2026-10-20-localized-spanish-routes-and-shells`).
