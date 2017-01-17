const { ipcRenderer, webFrame } = require('electron')

webFrame.registerURLSchemeAsPrivileged('cors', { bypassCSP: false })
webFrame.registerURLSchemeAsPrivileged('metamask')

process.once('loaded', () => {
  window.ipcRenderer = ipcRenderer

  try {
    require('devtron').install()
    window.__devtron = { require, process }
  } catch (e) {}
})
