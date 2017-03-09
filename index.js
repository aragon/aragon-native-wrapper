const { app, BrowserWindow, shell, protocol, net, Menu } = require('electron')
const path = require('path')
const url = require('url')
const windowStateKeeper = require('electron-window-state')
const Intertron = require('intertron')
const exposedAPI = require('./api')
const appMenu = require('./menu')

new Intertron(exposedAPI)

const meteorRootURL = (process.defaultApp) ? 'http://localhost:3000' : 'aragon://app/index.html'

let win = null

protocol.registerStandardSchemes(['aragon', 'metamask'])

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
  protocol.registerFileProtocol('aragon', (req, cb) => {
    const filePath = req.url.replace('aragon://app/', '')
    const distPath = path.resolve(`${__dirname}/aragon`)
    cb({ path: `${distPath}/${filePath.split(/[?#]/)[0]}` })
  })
  protocol.registerFileProtocol('metamask', (req, cb) => {
    const filePath = req.url.replace('metamask://app/', '')
    const distPath = (process.defaultApp) ? `${url.resolve(__dirname, '.metamask')}/dist/chrome/${filePath}` : path.resolve(`${__dirname}/metamask/${filePath}`)
    cb({ path: distPath })
  })
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
    minHeight: 720,
    titleBarStyle: 'hidden',
    backgroundColor: '#1F1F1F',
    show: false,
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, './preload.js'),
    },
  })

  win.once('ready-to-show', () => {
    win.show()
  })

  const menu = Menu.buildFromTemplate(appMenu)
  Menu.setApplicationMenu(menu)

  windowState.manage(win)

  win.loadURL(meteorRootURL)

  if (process.defaultApp) win.webContents.openDevTools()

  win.webContents.on('new-window', (e, windowURL) => {
    e.preventDefault()
    shell.openExternal(windowURL)
  })

  win.webContents.on('will-navigate', (e) => {
    e.preventDefault()
    win.loadURL(meteorRootURL)
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
