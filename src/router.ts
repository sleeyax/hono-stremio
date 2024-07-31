import { Hono } from 'hono'
import type { AddonInterface, Manifest } from 'stremio-addon-sdk'

export function getRouter({ manifest, get }: AddonInterface) {
  const router = new Hono()

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

  return router
}
