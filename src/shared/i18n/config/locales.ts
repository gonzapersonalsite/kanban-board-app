// The locale files beside this one, bundled at build time: a glob reads only its own folder.
export const localeModules = import.meta.glob<Record<string, unknown>>('./*.json', { eager: true, import: 'default' })
