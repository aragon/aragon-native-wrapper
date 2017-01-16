const { app, BrowserWindow, shell, protocol, net } = require('electron')
const path = require('path')
const windowStateKeeper = require('electron-window-state')
const Intertron = require('intertron')
const exposedAPI = require('./api')
const url = require('url')

new Intertron(exposedAPI)

const meteorRootURL = 'http://localhost:3000'

let win = null

function setCustomProtocols() {
  // TODO: Only supporting GET for now
  protocol.registerBufferProtocol('cors', (req, cb) => {
    const parsedURL = url.parse(req.url)
    parsedURL.protocol = 'https'
    const request = net.request(url.format(parsedURL))
    request.on('response', (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => cb({ data: new Buffer(data) }))
    })
    request.end()
  })
  /* protocol.registerHttpProtocol('metamask', (req, cb) => {
    const parsedURL = url.parse(req.url)
    cb({ path: `${url.resolve(__dirname, '.metamask')}/dist/chrome/${parsedURL.host}` })
  }) */
}

function createWindow() {
  const windowState = windowStateKeeper({
    defaultWidth: 1280,
    defaultHeight: 800,
  })

  win = new BrowserWindow({
    x: windowState.x,
    y: windowState.y,
    width: windowState.width,
    height: windowState.height,
    minWidth: 1280,
    minHeight: 768,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      // webSecurity: false,
      preload: path.join(__dirname, './preload.js'),
    },
  })

  windowState.manage(win)

  win.loadURL(meteorRootURL)

  win.webContents.openDevTools()

  win.webContents.on('new-window', (e, windowURL) => {
    e.preventDefault()
    shell.openExternal(windowURL)
    /* if (!url.startsWith('http://127.0.0.1:9001')) {
      e.preventDefault()
      shell.openExternal(url)
    } else {
      window.open(url)
    } */
  })

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', () => {
  setCustomProtocols()
  createWindow(meteorRootURL)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (win === null) createWindow()
})
