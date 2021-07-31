const { MongoClient } = require('mongodb')

const createConnection = (options) => {
  options = Object.assign(
    {
      dbName: 'spoti-deck',
    },
    options
  )
  try {
    var client = new MongoClient(options.uri)
    client.connect()
    var database = client.db(options.dbName)
  } catch (err) {
    console.log('Error connecting to mongodb server')
    throw err
  }

  const _usersCollection = database.collection('users')

  return {
    createUser: (user) => {
      _usersCollection.insertOne(user)
    },
    findUserById: (id) => {
      return _usersCollection.findOne({ id })
    },
    findUserByToken: (token) => {
      return _usersCollection.findOne({ devices: { $elemMatch: { token } } })
    },
    findUserByUuid: (uuid) => {
      return _usersCollection.findOne({ devices: { $elemMatch: { uuid } } })
    },
    addDeviceById: async (id, device) => {
      await _usersCollection.updateOne({ id }, { $push: { devices: device } }, options)
    },
  }
}

module.exports = createConnection
