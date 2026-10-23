import { join } from 'node:path'
import { build } from 'vite'
import { describe, expect, it } from 'vitest'

// The real configuration: removing a vendor group from vite.config.ts turns this case red.
const ROOT = join(import.meta.dirname, '..', '..')
const CONFIG_FILE = join(ROOT, 'vite.config.ts')
const VITE_TIMEOUT_MS = 60_000

async function buildChunkNames(): Promise<string[]> {
  const result = await build({ root: ROOT, configFile: CONFIG_FILE, logLevel: 'silent', build: { write: false } })
  const chunks: string[] = []
  for (const output of Array.isArray(result) ? result : [result]) {
    if (!('output' in output)) throw new Error('vite build returned a watcher instead of its output')
    for (const chunk of output.output) {
      if (chunk.type === 'chunk') chunks.push(chunk.fileName)
    }
  }
  return chunks
}

describe('vite.config.ts chunking', () => {
  it(
    'does_emit_the_dnd_vendor_as_its_own_chunk_when_the_app_is_built',
    async () => {
      const chunks = await buildChunkNames()

      expect(chunks.some((fileName) => /^assets\/dnd-vendor-[\w-]+\.js$/.test(fileName))).toBe(true)
      expect(chunks.some((fileName) => /^assets\/react-vendor-[\w-]+\.js$/.test(fileName))).toBe(true)
    },
    VITE_TIMEOUT_MS,
  )
})
