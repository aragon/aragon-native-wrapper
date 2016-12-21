const fs = require('fs')
const path = require('path')
const KeybaseRPC = require('./rpc')

const rpc = new KeybaseRPC()

const proofFilename = 'ethereum_test.json' // TODO: Some day it won't be a test lol
const keybasePublicDirectory = user => path.join('/keybase/public', user || String())
const proofPath = user => path.join(keybasePublicDirectory(user), proofFilename)

// TODO: Promisify all this?
const Keybase = {
  getUsername: (cb) => {
    rpc.invoke('config.getCurrentStatus', null, (err, res) => {
      console.log(res)
      if (!res.loggedIn) return cb(false)

      return cb(null, res.user.username)
    })
  },
  saveProof: (proofPayload, cb) => {
    this.getUsername((err, username) => {
      const proof = JSON.parse(proofPayload)
      if (username !== proof.username) { return cb(new Error('username doesnt match')) }
      return fs.writeFile(proofPath(username), proofPayload, cb)
    })
  },
}

module.exports = Keybase
