const { MongoClient } = require('mongodb')

const createConnection = (options) => {
  options = Object.assign(
    {
      dbName: 'spoti-deck',
    },
    options
  )
  var client = new MongoClient(options.uri)
  client.connect()
  var database = client.db(options.dbName)

  const _usersCollection = database.collection('users')

  return {
    createUser: (user) => _usersCollection.insertOne(user),
    findUser: ({ id, token, uuid }) => {
      if (id) return _usersCollection.findOne({ id })
      if (token) return _usersCollection.findOne({ devices: { $elemMatch: { token } } })
      if (uuid) return _usersCollection.findOne({ devices: { $elemMatch: { uuid } } })
    },
    addDevice: async (id, device) => await _usersCollection.updateOne({ id }, { $push: { devices: device } }, options),
  }
}

module.exports = createConnection
