import addonBuilder from 'stremio-addon-sdk/src/builder'
import landingTemplate from 'stremio-addon-sdk/src/landingTemplate'

const builder = new addonBuilder({
  id: 'org.myexampleaddon',
  version: '1.0.0',
  name: 'simple example',
  catalogs: [],
  resources: ['stream'],
  types: ['movie'],
  description: 'This is an example addon that serves Big Buck Bunny',
})

// takes function(type, id, cb)
builder.defineStreamHandler(function (args) {
  if (args.type === 'movie' && args.id === 'tt1254207') {
    // serve one stream to big buck bunny
    const stream = {
      url: 'http://distribution.bbb3d.renderfarming.net/video/mp4/bbb_sunflower_1080p_30fps_normal.mp4',
    }
    return Promise.resolve({ streams: [stream] })
  } else {
    // otherwise return no streams
    return Promise.resolve({ streams: [] })
  }
})

export const addonInterface = builder.getInterface()
export const landingHTML = landingTemplate(addonInterface.manifest)
