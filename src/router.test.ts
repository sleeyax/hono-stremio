import { getRouter } from './router'
import { createAddonInterfaceMock, createAddonInterfaceMockWithRedirect } from '../test'
import { getUrl } from '../test/utils'

describe('stremio router', () => {
  it('should return 404 for unknown path', async () => {
    const app = getRouter(createAddonInterfaceMock())
    const res = await app.request(getUrl('unknown-path'))
    expect(res).not.toBeNull()
    expect(res.status).toBe(404)
    const body = await res.json()
    expect(body).toMatchObject({ error: 'not found' })
  })

  describe('manifest handler', () => {
    it('should get the manifest', async () => {
      const app = getRouter(createAddonInterfaceMock())
      const res = await app.request(getUrl('manifest.json'))
      expect(res).not.toBeNull()
      expect(res.status).toBe(200)
      const manifest = await res.json()
      expect(manifest).toMatchObject({ id: 'com.example.mock-addon' })
    })

    it.each(['{"my": "config"}/manifest.json', 'manifest.json'])(
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

  describe('resource handler', () => {
    it('should return 404 for unknown resource', async () => {
      const app = getRouter(createAddonInterfaceMock())
      const res = await app.request(getUrl('unknown/type/id.json'))
      expect(res).not.toBeNull()
      expect(res.status).toBe(404)
      const body = await res.json()
      expect(body).toMatchObject({ error: 'not found' })
    })

    it.each([
      ['catalog', 'movie', 'id'],
      ['meta', 'movie', 'id'],
      ['stream', 'movie', 'id'],
      ['subtitles', 'movie', 'id'],
      ['catalog', 'series', 'id'],
    ])('should get the resource "%s" with type "%s" and id "%s"', async (resource, type, id) => {
      const app = getRouter(createAddonInterfaceMock())
      const res = await app.request(getUrl(`${resource}/${type}/${id}.json`))
      expect(res).not.toBeNull()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toMatchObject({})
    })

    it.each(['{"my": "config"}/catalog/movie/id.json', 'catalog/movie/id.json'])(
      'should get the resource with config on path "%s"',
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
        const body = await res.json()
        expect(body).toMatchObject({})
      }
    )

    it('should get the resource with extra options', async () => {
      const app = getRouter(
        createAddonInterfaceMock({}, (args) =>
          expect(args).toMatchObject({ extra: { search: 'game of thrones', skip: '100' } })
        )
      )
      const res = await app.request(
        getUrl('catalog/movie/id/search=game%20of%20thrones&skip=100.json')
      )
      expect(res).not.toBeNull()
      expect(res.status).toBe(200)
      const body = await res.json()
      expect(body).toMatchObject({})
    })

    it('should set cache headers', async () => {
      const app = getRouter(createAddonInterfaceMock())
      const res = await app.request(getUrl('catalog/movie/id.json'))
      expect(res).not.toBeNull()
      expect(res.status).toBe(200)
      expect(res.headers.get('cache-control')).toBe(
        'max-age=100, stale-while-revalidate=100, stale-if-error=100, public'
      )
    })

    it('should redirect', async () => {
      const app = getRouter(createAddonInterfaceMockWithRedirect('stremio://mock-redirect'))
      const res = await app.request(getUrl('catalog/movie/id.json'))
      expect(res).not.toBeNull()
      expect(res.status).toBe(307)
      expect(res.headers.get('location')).toBe('stremio://mock-redirect')
    })
  })
})
