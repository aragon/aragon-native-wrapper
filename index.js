const { app, BrowserWindow, shell } = require('electron')
const path = require('path')
const windowStateKeeper = require('electron-window-state')

const Intertron = require('intertron')
const Keybase = require('./keybase')

new Intertron({ Keybase })

const meteorRootURL = 'http://localhost:3000'

let win = null

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
      webSecurity: false,
      preload: path.join(__dirname, './preload.js'),
    },
  })

  windowState.manage(win)

  win.loadURL(meteorRootURL)

  win.webContents.openDevTools()

  win.webContents.on('new-window', (e, url) => {
    e.preventDefault()
    shell.openExternal(url)
  })

  win.on('closed', () => {
    win = null
  })
}

app.on('ready', () => {
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
