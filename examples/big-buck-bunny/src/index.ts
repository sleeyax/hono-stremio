import { Hono } from 'hono'
import addonInterface from './addon'
import { getRouter } from 'hono-stremio'

const addonRouter = getRouter(addonInterface)

const app = new Hono()

app.route('/', addonRouter)

export default app
