import { Hono } from 'hono'
import { addonInterface, landingHTML } from './addon'
import { getRouter } from 'hono-stremio'

const addonRouter = getRouter(addonInterface, { landingHTML })

const app = new Hono()

app.route('/', addonRouter)

export default app
