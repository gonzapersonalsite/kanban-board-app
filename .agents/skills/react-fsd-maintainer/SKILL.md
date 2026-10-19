---
name: react-fsd-maintainer
description: Pasos para crear un slice, bajar código a otra capa o arreglar un hallazgo de arquitectura del lint en el producto React. Úsala al añadir código en src o cuando la puerta lint falle por una regla de arquitectura
---
# Mantener la arquitectura del producto React

Es una ayuda para ejecutar, no una regla: qué va en cada capa, qué puede
importar qué y qué hace cumplir cada regla lo dice
[docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md), y cómo se trabaja, `AGENTS.md`.
Donde esta skill discrepe, mandan ellos y esta skill se corrige en el mismo
cambio.

## Crear un slice

1. **La capa.** Sigue «Dónde va el código nuevo» de
   [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md): lo nuevo empieza en la
   página que lo usa, y baja a un slice propio cuando aparece el segundo
   consumidor.
2. **La carpeta.** `src/<capa>/<slice>/`, en kebab-case, con solo los segmentos
   que vayan a tener algo.
3. **La API pública primero.** Escribe `<slice>/index.ts` con lo que otros
   slices van a usar, y nada más.
4. **Las reglas de negocio**, como funciones puras en `model`, con su test al
   lado (`<fichero>.test.ts`) en el mismo cambio; los componentes en `ui`, con
   su CSS Module y su test al lado (`<Componente>.test.tsx`). Son los dos
   únicos sufijos de test: un `.spec` o un `.stories` con extensión de código
   (`.ts`, `.tsx`, `.js`…) es un error del lint.
5. **Las puertas.** `pnpm run lint`, `pnpm run typecheck` y `pnpm run test`
   para iterar; `python verify.py` antes de dar la parte por lista.

## Bajar código a otra capa

Cuando una segunda página, widget o feature necesita algo que vive en otro
slice:

1. Elige el destino con la misma sección de
   [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md): la capa más alta que esté
   por debajo de todos los consumidores.
2. Mueve los ficheros con `git mv`, con sus tests, para que el diff enseñe un
   traslado y no un borrado y una copia.
3. Exporta lo movido desde la `<slice>/index.ts` de destino y quítalo de la de
   origen.
4. Cambia cada import al nuevo `@/<capa>/<slice>`, y busca la ruta vieja en
   `src` hasta que no quede ninguna.
5. Las puertas en verde, y en el mismo cambio, la documentación que nombrara la
   ruta vieja.

## Arreglar un hallazgo de arquitectura del lint

Lo que pide cada regla de `eslint.config.js`; el caso que la hace saltar está
en `eslint.config.test.ts`.

| Regla | Qué encontró | Arreglo |
|---|---|---|
| `fsd/forbidden-imports` | Un import de una capa de arriba | Baja lo compartido a una capa inferior, o pásalo desde arriba como prop o argumento |
| `fsd/no-cross-slice-dependency` | Un import de un slice hermano | Baja lo común a una capa inferior, o compón los dos slices en la capa de encima; entre dos entidades, la excepción `@x` de [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md) |
| `fsd/no-public-api-sidestep` | Un import que entra en un slice sin pasar por su índice | Exporta lo que hace falta desde `<slice>/index.ts` e importa `@/<capa>/<slice>` |
| `fsd/no-relative-imports` | Una ruta relativa que sale del slice | Usa el alias: `@/<capa>/<slice>` |
| `fsd-gaps/boundaries` | Lo que las cuatro de arriba encuentran en un import, en una reexportación (`export … from`); o un `import()` dinámico de una capa de arriba | El arreglo de la fila de fsd-lint que dice lo mismo de un import; el mensaje dice qué límite cruza |
| `fsd-gaps/boundaries`, en un `import.meta.glob` | Por debajo de `app`, un glob que no se ve dentro de la carpeta de su fichero: un patrón que no es un texto entre comillas con `./` delante, uno con `..`, la opción `base` o unas opciones que no son un objeto literal con sus claves escritas (un `...` o una clave calculada que no es un texto entre comillas) | Globa solo la carpeta del fichero (`./…`); lo que haga falta de otras capas lo reúne `app` y lo pasa hacia abajo |
| `no-restricted-syntax` | Un fichero fuera de las seis capas o que no es `.ts` ni `.tsx`; en `model`, `api` o `lib`, un `.tsx` o un import dinámico de UI o de React | Mueve el fichero a su capa y a TypeScript, o el componente a `ui`; de React, importa sus hooks por nombre |
| `Parsing error` (sin regla) | Un `.js`, `.jsx`, `.mjs`, `.cjs`, `.mts` o `.cts` en `src` con TypeScript o JSX | Renómbralo a `.ts` o `.tsx` en su capa |
| `no-restricted-imports` | UI, estilos, `react-dom`, un runtime de JSX o React entero en `model`, `api` o `lib` | Que el modelo devuelva datos y la vista los pinte desde `ui`; de React, importa sus hooks por nombre |
| `no-restricted-globals`, `no-restricted-properties` | Fuera de `src/shared/api`, una petición (`fetch`, `XMLHttpRequest`), una conexión (`WebSocket`, `EventSource`) o un `sendBeacon` | Una petición: llama al cliente HTTP desde el segmento `api` del slice. Una conexión o una baliza: ábrela en `src/shared/api` y úsala desde el segmento `api`, y toma de allí también sus constantes (`WebSocket.OPEN`) |
| `no-restricted-properties` o `tests/no-skip-option`, en un test | Un test que no corre: `.skip`, `.todo`, `skipIf`, `runIf`, o `skip` o `todo` en sus opciones (`it('…', { skip: true }, …)`) | Haz que pase o bórralo |
| `tests/no-stray-file` | Un `.spec` o un `.stories` con extensión de código (`.ts`, `.tsx`, `.js`…), o un test donde no lo busca ningún proyecto de `vite.config.ts` | Renómbralo a `<fichero>.test.ts` o `<fichero>.test.tsx` y ponlo donde Vitest lo corre; un proyecto nuevo de Vitest se declara en `vite.config.ts` y, en el mismo cambio, su `include` en `VITEST_TESTS` de `eslint.config.js` y una ruta suya entre las representativas de `eslint.config.test.ts`; una historia no tiene sitio mientras el producto no tenga Storybook |

Un hallazgo no se silencia relajando `eslint.config.js` ni con un comentario
`eslint-disable` (ver [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md)): un
silencio es una excepción, y las excepciones las decide el dueño (§3 de
`AGENTS.md`).
