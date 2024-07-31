import { getRouter } from './router'
import { createAddonInterfaceMock } from '../test'
import { getUrl } from '../test/utils'

describe('stremio router', () => {
  describe('manifest', () => {
    it('should get the manifest', async () => {
      const app = getRouter(createAddonInterfaceMock())
      const res = await app.request(getUrl('manifest.json'))
      expect(res).not.toBeNull()
      expect(res.status).toBe(200)
      const manifest = await res.json()
      expect(manifest).toMatchObject({ id: 'com.example.mock-addon' })
    })

    it.each(['my-config-value/manifest.json', 'manifest.json'])(
      'should get the manifest with config on path "%s"',
      async (path) => {
        const app = getRouter(
          createAddonInterfaceMock({
            config: [{ key: 'mock-config', type: 'text' }],
            behaviorHints: { configurable: true },
          })
        )
        const res = await app.request(getUrl(path))
        expect(res).not.toBeNull()
        expect(res.status).toBe(200)
        const manifest = await res.json()
        expect(manifest).toMatchObject({ id: 'com.example.mock-addon' })
      }
    )
  })
})
