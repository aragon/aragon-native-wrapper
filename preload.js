const { ipcRenderer, webFrame } = require('electron')

webFrame.registerURLSchemeAsPrivileged('cors')

process.once('loaded', () => {
  window.ipcRenderer = ipcRenderer

  try {
    require('devtron').install()
    window.__devtron = { require, process }
  } catch (e) {}
})
