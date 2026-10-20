---
title: Español es el idioma por defecto en la raíz y el inglés y alemán viven bajo /en y /de
state: confirmed
date: 2026-10-20
phase: F1
---
**Español es el idioma por defecto en la raíz y el inglés y alemán viven bajo
/en y /de.** La aplicación sirve el español (`es`) en la ruta raíz
(`/board/:boardId`, `/calendar`, `/calendar/:boardId`, con `x-default`
apuntando a la raíz), el inglés (`en`) bajo `/en` (`/en`, `/en/board/:boardId`,
`/en/calendar`, `/en/calendar/:boardId`) y el alemán (`de`) bajo `/de` (`/de`,
`/de/board/:boardId`, `/de/calendar`, `/de/calendar/:boardId`).

La resolución inicial del idioma sigue el orden de prioridad: parámetro de
consulta `?lang=es|en|de` (que persiste la preferencia en `localStorage` y se
limpia de la URL) > prefijo de ruta (`/en`, `/de`) > preferencia guardada en
`localStorage` (`i18n-locale`) > idioma del dispositivo (`navigator.language`)
> español por defecto (`'es'`). Cambiar el idioma desde el selector actualiza y
persiste el estado en `useI18nStore` y sincroniza el prefijo de la ruta activa
conservando la vista (`board` o `calendar`) y el `:boardId`.

El build emite tres shells HTML estáticos (`index.html` en `es` y las entradas
de `en` y `de`) con `<html lang>`, `<title>`, `description`, `og:locale`,
`og:title`, `og:description`, `og:url`, `canonical` y enlaces `hreflang` (`es`,
`en`, `de` y `x-default`), además de incluir la ruta raíz, `/en` y `/de` en
sitemap.xml y llms.txt.
