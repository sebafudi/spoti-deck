function user() {
  let info = {
    access_token: '',
    refresh_token: '',
    id: '',
  }
  let devices = []
  return {
    get access_token() {
      return info.access_token
    },
    set access_token(value) {
      info.access_token = value
    },
    get refresh_token() {
      return info.refresh_token
    },
    set refresh_token(value) {
      info.refresh_token = value
    },
    get id() {
      return info.id
    },
    set id(value) {
      info.id = value
    },
    addDevice: (uuid, token) => {
      devices.push({ uuid, token })
    },
    hasDeviceByToken: (token) => {
      return devices.some((key) => key.token === token)
    },
  }
}

module.exports = user
