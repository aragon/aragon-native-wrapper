const { app, BrowserWindow, shell, protocol, net, Menu } = require('electron')
const path = require('path')
const windowStateKeeper = require('electron-window-state')
const Intertron = require('intertron')
const exposedAPI = require('./api')
const url = require('url')

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
    minHeight: 768,
    titleBarStyle: 'hidden',
    webPreferences: {
      nodeIntegration: false,
      preload: path.join(__dirname, './preload.js'),
    },
  })

  const template = [
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'pasteandmatchstyle'
      },
      {
        role: 'delete'
      },
      {
        role: 'selectall'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        role: 'reload'
      },
      {
        role: 'toggledevtools'
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('http://electron.atom.io') }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  template.unshift({
    label: app.getName(),
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  })
  // Edit menu.
  template[1].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Speech',
      submenu: [
        {
          role: 'startspeaking'
        },
        {
          role: 'stopspeaking'
        }
      ]
    }
  )
  // Window menu.
  template[3].submenu = [
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Zoom',
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  ]
}


  windowState.manage(win)

  win.loadURL(meteorRootURL)

  win.webContents.openDevTools()

  win.webContents.on('new-window', (e, windowURL) => {
    e.preventDefault()
    shell.openExternal(windowURL)
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
