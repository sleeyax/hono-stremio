import type { AddonInterfaceFixed, Cache, Manifest, MetaDetail } from 'stremio-addon-sdk'
import { addonBuilder } from 'stremio-addon-sdk'

export function createManifestMock(manifestOptions: Partial<Manifest> = {}) {
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
  return manifest
}

export function createAddonMock(
  manifestOptions: Partial<Manifest> = {},
  onHandlerCalled?: (args: unknown) => void
) {
  const manifest = createManifestMock(manifestOptions)

  const cache: Cache = { cacheMaxAge: 100, staleError: 100, staleRevalidate: 100 }

  const addon = new addonBuilder(manifest)
  addon.defineCatalogHandler((args) => {
    onHandlerCalled?.(args)
    return Promise.resolve({ metas: [], ...cache })
  })
  addon.defineMetaHandler((args) => {
    onHandlerCalled?.(args)
    return Promise.resolve({ meta: {} as MetaDetail, ...cache })
  })
  addon.defineStreamHandler((args) => {
    onHandlerCalled?.(args)
    return Promise.resolve({ streams: [], ...cache })
  })
  addon.defineSubtitlesHandler((args) => {
    onHandlerCalled?.(args)
    return Promise.resolve({ subtitles: [], ...cache })
  })

  return addon
}

export function createAddonInterfaceMock(
  manifestOptions: Partial<Manifest> = {},
  onHandlerCalled?: (args: unknown) => void
) {
  const addon = createAddonMock(manifestOptions, onHandlerCalled)
  return addon.getInterface() as unknown as AddonInterfaceFixed
}

export function createAddonInterfaceMockWithRedirect(redirect: string) {
  const manifest = createManifestMock({ resources: ['catalog'] })
  const addon = new addonBuilder(manifest)
  addon.defineCatalogHandler(() => Promise.resolve({ redirect, metas: [] }))
  return addon.getInterface() as unknown as AddonInterfaceFixed
}
