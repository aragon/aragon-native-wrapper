const rpc = require('framed-msgpack-rpc')

const path = `/Users/${process.env.USER}/Library/Group Containers/keybase/Library/Caches/Keybase/keybased.sock`

class KeybaseRPC {
  constructor() {
    const transport = rpc.createTransport({ path })
    transport.connect((connErr) => {
      if (connErr) return

      this.client = new rpc.Client(transport, 'keybase.1')
      this.sessionID = 0
      // user.loadMySettings, loadMyPublicKeys
    })
  }

  invoke(method, args, cb) {
    if (!this.client) return setTimeout(this.invoke.bind(this, method, args, cb), 500)

    const wrappedArgs = [Object.assign(args || {}, { sessionID: this.sessionID++ })]

    return this.client.invoke(method, wrappedArgs, (err, res) => {
      if (err) return cb(err)

      return cb(null, res)
    })
  }
}

module.exports = KeybaseRPC
