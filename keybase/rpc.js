const rpc = require('framed-msgpack-rpc')

path = `/Users/${process.env.USER}/Library/Group\ Containers/keybase/Library/Caches/Keybase/keybased.sock`

const r = rpc.createTransport({ path })

const connect = (cb) => {
  r.connect((connErr) => {
    if (connErr) return
    const client = new rpc.Client(r, 'keybase.1')
    client.invoke('user.listTrackers', {}, (err, res) => {
      console.log(err)
      console.log(res)
    })
    cb(client)
  })
}

module.exports = connect
