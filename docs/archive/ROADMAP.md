# Archivo del plan del producto — fases cerradas (CERRADO)

Los cuerpos de las fases ya DONE. **Este documento no gobierna nada**: se lee
para saber qué trajo una fase y con qué criterio se cerró, nunca para decidir
trabajo futuro. Manda `../ROADMAP.md`, donde cada fase conserva su cabecera, su
marcador y la lápida que apunta aquí. Solo crece por el final.

## F0 — Existing Kanban board application baseline (DONE)

- **Scope:** multi-board Kanban application with columns, tasks, drag-and-drop,
  calendar view, local backup/restore (`schemaVersion`), English/Spanish/German
  localization, light/dark themes, and build-time social preview and
  agent-readable files (`llms.txt`, `robots.txt`, `sitemap.xml`).
- **Governance:** Feature-Sliced Design boundaries are defined in
  `../ARCHITECTURE.md` and enforced by `../../eslint.config.js` and
  `../../eslint-fsd-gaps.js`; project conventions live in
  `../../.agents/skills/kanban-board-conventions/SKILL.md`.
- **Adoption baseline:** existing product adopted under the shared scaffold and
  `react-fsd` stack at `#this-repository-uses-the-agentic-scaffold` and
  verified in `#2026-10-18-adopt-agentic-scaffold-and-react-fsd`. No next
  product phase is currently open.
