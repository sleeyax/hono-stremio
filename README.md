# hono-stremio

Easily build Stremio addons using [Hono](https://hono.dev/). Write your code once and deploy it to any platform supported by Hono, such as Cloudflare, Fastly, Deno, Bun, AWS, [and more](https://hono.dev/docs/).

This package is compatible with the [stremio-addon-sdk](https://github.com/stremio/stremio-addon-sdk) interface, thus requiring zero to minimal changes to integrate your existing Stremio addon.

## :zap: Quickstart

1. Create a new Hono project (if you haven't already) and install the package:

```bash
$ npm create hono@latest my-app
$ npm i hono-stremio
```

2. Get the addon interface:

ESM:

```js
// addon.js
import addonBuilder from 'stremio-addon-sdk/src/builder'

const builder = new addonBuilder({
  // ...
})

builder.defineStreamHandler(function (args) {
  // ...
})

const addonInterface = builder.getInterface() /// <--- get the interface
```

CJS:

```js
// addon.js
const addonBuilder = require('stremio-addon-sdk/src/builder')

const builder = new addonBuilder({
  // ...
})

builder.defineStreamHandler(function (args) {
  // ...
})

const addonInterface = builder.getInterface() /// <--- get the interface
```

> [!NOTE]  
> The addon builder MUST be imported by its full relative path `stremio-addon-sdk/src/builder`, as shown above. This is required to ensure compatibility with all of Hono's supported platforms. See the FAQ below for more information.

3. Connect the stremio router to your Hono app:

```ts
// index.ts
import { Hono } from 'hono'
import { getRouter } from 'hono-stremio'

// ...

const addonRouter = getRouter(addonInterface)

const app = new Hono()

app.route('/', addonRouter)

export default app
```

That's it! You can now deploy your Stremio addon to any platform supported by Hono. Follow the [Hono documentation](https://hono.dev/docs/) to learn more.

## :question: FAQ

### Why do I need to import the addon builder by its full relative path?

The Stremio Addon SDK still uses the old `module.exports` and `require` syntax (i.e. CJS) which is not natively supported by all Hono platforms. The main issue here is that most (if not all) platforms are already using the new ES Module standard (ESM) by default. While CJS modules can be imported from ESM, there's no named exports but only a default-exported object. Thus, when importing from the package entrypoint (`index.js`) you are importing all of the code contained in the package including Node-specific code that will not work on other platforms.

By importing the addon builder by its full relative path, you are basically hand-picking the necessary module from the package, without the additional clutter from the entrypoint. This is a temporary workaround until the Stremio Addon SDK is updated to use ESM.

If you have any suggestions or ideas on how to improve this, please open an issue to discuss! I would love to hear your thoughts.
