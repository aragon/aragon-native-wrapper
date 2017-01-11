const fs = require('fs')
const path = require('path')
const KeybaseRPC = require('./rpc')

const rpc = new KeybaseRPC()

const keybasePublicDirectory = user => path.join('/keybase/public', user || String())
const proofPath = (user, filename) => path.join(keybasePublicDirectory(user), filename)

// TODO: Promisify all this?
const getUsername = (cb) => {
  rpc.invoke('config.getCurrentStatus', null, (err, res) => {
    console.log(res)
    if (!res.loggedIn) return cb(false)

    return cb(null, res.user.username)
  })
}

const Keybase = {
  getUsername,
  saveProof: (proofPayload, filename, cb) => {
    getUsername((err, username) => {
      const proof = JSON.parse(proofPayload)
      if (username !== proof.username) { return cb(new Error('username doesnt match')) }
      return fs.writeFile(proofPath(username, filename), proofPayload, cb)
    })
  },
}

module.exports = Keybase
