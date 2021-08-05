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
    findUser: async ({ id, token, uuid }) => {
      let res
      if (id) res = await mongodb.findUser({ id })
      if (token) res = await mongodb.findUser({ token })
      if (uuid) res = await mongodb.findUser({ uuid })

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
    addDevice: async (id, device) => mongodb.addDevice(id, device),
    updateToken: async (id, access_token) => mongodb.updateToken(id, access_token),
  }
}

module.exports = create
