import 'stremio-addon-sdk'

// TODO: create PR to '@types/stremio-addon-sdk' to fix this bug

declare module 'stremio-addon-sdk' {
  interface AddonInterfaceFixed {
    // For some reason we can't name it 'AddonInterface', declaration merging seems broken.
    manifest: Manifest
    get: (
      resource: string,
      type: string,
      id: string,
      extra: Record<string, string> | undefined,
      config: Record<string, unknown> | false
    ) => Promise<any>
  }

  interface StreamFixed {
    url?: string
    behaviorHints?: {
      countryWhitelist?: string[]
      notWebReady?: boolean
      group?: string
      headers?: any
      filename?: string
    }
  }
}
