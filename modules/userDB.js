const User = require('./user')

function create() {
  let userArray = []
  return {
    newUser: (id, access_token, refresh_token) => {
      let user = new User()
      user.id = id
      user.access_token = access_token
      user.refresh_token = refresh_token
      userArray.push(user)
      return user
    },
    findUserById: (id) => {
      return userArray.find((key) => key.id === id)
    },
    findUserByToken: (token) => {
      return userArray.find((key) => key.hasDeviceByToken(token))
    },
  }
}

module.exports = create
