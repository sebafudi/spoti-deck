function user(user) {
  user = Object.assign(
    {
      access_token: '',
      refresh_token: '',
      id: '',
      devices: [],
    },
    user
  )
  return {
    get access_token() {
      return user.access_token
    },
    set access_token(value) {
      user.access_token = value
    },
    get refresh_token() {
      return user.refresh_token
    },
    set refresh_token(value) {
      user.refresh_token = value
    },
    get id() {
      return user.id
    },
    set id(value) {
      user.id = value
    },
    get devices() {
      return user.devices
    },
    addDevice: (uuid, token) => user.devices.push({ uuid, token }),
    hasDeviceByToken: (token) => user.devices.some((key) => key.token === token),
  }
}

module.exports = user
