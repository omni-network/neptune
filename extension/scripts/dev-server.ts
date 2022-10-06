import chokidar from 'chokidar'
import { debounce } from 'lodash'
import WebSocket from 'ws'

import { RELOAD_MESSAGE, DEV_SERVER_PORT } from 'shared/constants/dev'
import build from 'webpack.config'

const wss = new WebSocket.Server({ port: DEV_SERVER_PORT })
const log = console.log

const onClose = () => log('Dev server closed')

const onConnect = (ws: WebSocket) => {
  log('Dev server connected.')
  log(`Watching for changes in ${build.output.path}`)

  const reload = () => {
    log('Changes detected: reloading')
    ws.send(RELOAD_MESSAGE)
  }

  chokidar
    .watch(build.output.path, { ignoreInitial: true })
    .on('all', debounce(reload, 500))
}

wss.on('close', onClose)
wss.on('connection', onConnect)
