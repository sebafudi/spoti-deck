const User = require('./user')

function create(mongodb) {
  return {
    newUser: (id, access_token, refresh_token) => {
      let user = new User()
      user.id = id
      user.access_token = access_token
      user.refresh_token = refresh_token
      mongodb.createUser(user)
      return user
    },
    findUserById: async (id) => {
      let res = await mongodb.findUserById(id)
      if (res) {
        let user = new User({
          id: res.id,
          access_token: res.access_token,
          refresh_token: res.refresh_token,
          devices: res.devices,
        })
        return user
      } else return false
    },
    findUserByToken: async (token) => {
      let res = await mongodb.findUserByToken(token)
      if (res) return res
      else return false
    },
    findUserByUuid: async (uuid) => {
      let res = await mongodb.findUserByUuid(uuid)
      if (res) return res
      else return false
    },
    addDeviceById: async (id, device) => {
      return mongodb.addDeviceById(id, device)
    },
  }
}

module.exports = create
