import type { Plugin } from 'vite'
import { buildAgentFiles } from './generate.ts'
import { buildShell } from './shell.ts'
import { SHELL_LOCALES } from './site.ts'

// Crawlers and agents read the HTML without running the app: the build writes the social preview
// into index.html and its localized shells, and emits the agent files; the dev server serves the same files.
export function agentFilesPlugin(): Plugin {
  return {
    name: 'agent-files',
    enforce: 'post',
    configureServer(server) {
      const files = new Map(buildAgentFiles().map((file) => [file.path, file]))

      server.middlewares.use((request, response, next) => {
        const file = files.get((request.url ?? '').split('?')[0])
        if (file === undefined) {
          next()
          return
        }

        response.setHeader('Content-Type', file.contentType)
        response.end(file.source)
      })
    },
    generateBundle(_options, bundle) {
      const index = bundle['index.html']
      if (index === undefined || index.type !== 'asset') {
        throw new Error('agent-files: index.html asset not found in the bundle')
      }

      const template = typeof index.source === 'string' ? index.source : new TextDecoder().decode(index.source)
      index.source = buildShell(template, 'es')

      for (const shell of SHELL_LOCALES) {
        if (shell.fileName !== 'index.html') {
          this.emitFile({ type: 'asset', fileName: shell.fileName, source: buildShell(template, shell.locale) })
        }
      }

      for (const file of buildAgentFiles()) {
        this.emitFile({ type: 'asset', fileName: file.path.slice(1), source: file.source })
      }
    },
  }
}
