import type { Manifest, MetaDetail } from 'stremio-addon-sdk'
import { addonBuilder } from 'stremio-addon-sdk'

export function createAddonInterfaceMock(manifestOptions: Partial<Manifest> = {}) {
  const manifest = {
    id: 'com.example.mock-addon',
    catalogs: [
      {
        id: 'mock-catalog',
        name: 'Mock Catalog',
        type: 'movie',
        extra: [{ name: 'genre', isRequired: false }],
      },
    ],
    description: 'Mock addon for testing',
    name: 'Mock Addon',
    resources: ['catalog', 'meta', 'stream', 'subtitles'],
    types: [],
    version: '1.0.0',
    ...manifestOptions,
  } satisfies Manifest

  const addon = new addonBuilder(manifest)
  addon.defineCatalogHandler(() => Promise.resolve({ metas: [] }))
  addon.defineMetaHandler(() => Promise.resolve({ meta: {} as MetaDetail }))
  addon.defineStreamHandler(() => Promise.resolve({ streams: [] }))
  addon.defineSubtitlesHandler(() => Promise.resolve({ subtitles: [] }))

  return addon.getInterface()
}
