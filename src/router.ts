import { Hono } from 'hono'
import type {
  AddonInterfaceFixed as AddonInterface,
  FullManifestResource,
  Manifest,
  StreamFixed,
} from 'stremio-addon-sdk'

export function getRouter({ manifest, get }: AddonInterface) {
  const router = new Hono()

  router.notFound(({ json }) => json({ error: 'not found' }, 404))

  const hasConfig = !!manifest.config?.length

  if (hasConfig && !manifest.behaviorHints?.configurable) {
    console.warn(
      'manifest.config is set but manifest.behaviorHints.configurable is disabled, the "Configure" button will not show in the Stremio apps'
    )
  }

  if (hasConfig) {
    router.get('/:config/manifest.json', ({ req, json }) => {
      const config = req.param('config')

      if (
        config &&
        (manifest.behaviorHints?.configurationRequired || manifest.behaviorHints?.configurable)
      ) {
        return json({
          ...manifest,
          behaviorHints: {
            ...manifest.behaviorHints,
            // we remove configurationRequired so the addon is installable after configuration
            configurationRequired: undefined,
            // we remove configuration page for installed addon too (could be added later to the router)
            configurable: undefined,
          },
        } satisfies Manifest)
      }

      return json(manifest)
    })
  }

  router.get('/manifest.json', ({ json }) => json(manifest))

  const handlersInManifest: string[] = []
  if (manifest.catalogs.length > 0) {
    handlersInManifest.push('catalog')
  }
  manifest.resources.forEach((r) => handlersInManifest.push((r as FullManifestResource)?.name || r))

  const resourcePath = ':resource/:type/:id/:extra?'
  const resourcePaths = hasConfig
    ? ([`/:config/${resourcePath}`, `/${resourcePath}`] as const)
    : ([`/${resourcePath}`] as const)

  resourcePaths.forEach((path) => {
    router.get(path, async ({ req, res, json, redirect }) => {
      const resource = req.param('resource')

      if (!handlersInManifest?.includes(resource)) {
        return json({ error: 'not found' }, 404)
      }

      const type = req.param('type')
      const id = req.param('id')?.replace('.json', '')
      const config = req.param('config')
      const extra = req.param('extra')?.replace('.json', '')

      let parsedConfig: Record<string, unknown> | false = false
      if (config?.length) {
        try {
          parsedConfig = JSON.parse(config)
        } catch {
          // do nothing
        }
      }

      let parsedExtra: Record<string, string> | undefined = undefined
      if (extra) {
        parsedExtra = Object.fromEntries(new URLSearchParams(extra))
      }

      try {
        const response = await get(resource, type, id, parsedExtra, parsedConfig)

        const cacheHeaders = {
          cacheMaxAge: 'max-age',
          staleRevalidate: 'stale-while-revalidate',
          staleError: 'stale-if-error',
        }

        const cacheControl = Object.entries(cacheHeaders)
          .map(([prop, cacheProp]) => {
            const cacheValue = response[prop]

            if (!Number.isInteger(cacheValue)) {
              return null
            }

            if (cacheValue > 365 * 24 * 60 * 60) {
              console.warn(
                `${prop} set to more than 1 year, be advised that cache times are in seconds, not milliseconds.`
              )
            }

            return `${cacheProp}=${cacheValue}`
          })
          .filter(Boolean)
          .join(', ')

        if (cacheControl) {
          res.headers.set('Cache-Control', `${cacheControl}, public`)
        }

        if (response.redirect) {
          return redirect(response.redirect, 307)
        }

        if (
          resource === 'stream' &&
          Array.isArray(response.streams) &&
          response.streams.some(
            (stream: StreamFixed) => stream?.url && !stream.behaviorHints?.filename
          )
        ) {
          console.warn(
            'streams include stream.url but do not include stream.behaviorHints.filename, this is not recommended, subtitles may not be retrieved for these streams'
          )
        }

        return json(response)
      } catch (err) {
        console.error(err)
        return json({ error: 'handler error' }, 500)
      }
    })
  })

  return router
}
