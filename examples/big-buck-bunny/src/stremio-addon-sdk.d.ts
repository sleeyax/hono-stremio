// TODO: contribute this back to '@types/stremio-addon-sdk'; the single index.d.ts file should be split into multiple files mirroring the `src` directory.

declare module 'stremio-addon-sdk/src/builder' {
  import type {
    AddonCatalog,
    AddonInterface,
    Args,
    Cache,
    ContentType,
    Manifest,
    MetaDetail,
    MetaPreview,
    Stream,
    Subtitle,
  } from 'stremio-addon-sdk'

  /**
   * Creates an addon builder object with a given manifest.
   *
   * The manifest will determine the basic information of your addon (name, description, images), but most importantly, it will determine when and how your addon will be invoked by Stremio.
   *
   * Throws an error if the manifest is not valid.
   */
  export default class addonBuilder {
    /**
     * Creates an addon builder object with a given manifest.
     */
    constructor(manifest: Manifest)

    /**
     * Handles catalog requests, including search.
     *
     * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineCatalogHandler.md
     */
    defineCatalogHandler(handler: (args: Args) => Promise<{ metas: MetaPreview[] } & Cache>): void

    /**
     * Handles metadata requests (title, year, poster, background, etc.).
     *
     * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineMetaHandler.md
     */
    defineMetaHandler(
      handler: (args: { type: ContentType; id: string }) => Promise<{ meta: MetaDetail } & Cache>
    ): void

    /**
     * Handles stream requests.
     *
     * The stream responses should be ordered from highest to lowest quality.
     *
     * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineStreamHandler.md
     */
    defineStreamHandler(
      handler: (args: { type: ContentType; id: string }) => Promise<{ streams: Stream[] } & Cache>
    ): void

    /**
     * Handles subtitle requests.
     *
     * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineSubtitlesHandler.md
     */
    defineSubtitlesHandler(
      handler: (args: {
        type: ContentType
        id: string
        extra: {
          /**
           * OpenSubtitles file hash for the video.
           */
          videoHash: string
          /**
           * Size of the video file in bytes.
           */
          videoSize: string
        }
      }) => Promise<{ subtitles: Subtitle[] } & Cache>
    ): void

    /**
     * Handles addon catalog requests
     *
     * As opposed to defineCatalogHandler() which handles meta catalogs, this method handles catalogs of addon manifests.
     * This means that an addon can be used to just pass a list of other addons that can be installed in Stremio.
     *
     * Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineResourceHandler.md
     */
    defineResourceHandler(args: {
      type: ContentType
      id: string
    }): Promise<{ addons: AddonCatalog[] } & Cache>

    /**
     * Turns the addon into an addonInterface, which is an immutable (frozen) object that has {manifest, get} where:
     *
     * * manifest is a regular manifest object
     * * get is a function that takes one argument of the form { resource, type, id, extra } and returns a Promise
     */
    getInterface(): AddonInterface
  }
}
