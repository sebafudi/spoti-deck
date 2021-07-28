const spotifyApi = require('./spotifyApi')

function unsetError(options) {
  if (options instanceof Object) {
    console.log(options)
    Object.keys(options).forEach((element) => {
      if (options[element] === undefined) {
        throw new Error(`${element} option must be set!`)
      }
    })
  } else {
    throw new Error('Must be an object')
  }
}

function createApplication(options) {
  // this.options = Object.assign({}, options)
  unsetError({
    clientSecret: options.clientSecret,
    redirectUri: options.redirectUri,
    clientId: options.clientId,
  })
  return {
    async handleAccessToken(clientCode) {
      return new Promise((resolve, reject) =>
        spotifyApi
          .requestAccessToken(clientCode, options)
          .then(({ statusCode, body, statusMessage }) => {
            if (statusCode === 200) resolve(JSON.parse(body))
            else reject(statusCode + ' ' + statusMessage)
          })
          .catch((err) => reject(err))
      )
    },
    getUserInfo(accessToken) {
      return new Promise((resolve, reject) =>
        spotifyApi
          .makeRequest('/v1/me', accessToken)
          .then(({ statusCode, body, statusMessage }) => {
            if (statusCode === 200) resolve(JSON.parse(body))
            else reject(statusCode + ' ' + statusMessage)
          })
          .catch((err) => reject(err))
      )
    },
    getUserPlayback(accessToken) {
      return new Promise((resolve, reject) =>
        spotifyApi
          .makeRequest('/v1/me/player/currently-playing', accessToken)
          .then(({ statusCode, body, statusMessage }) => {
            if (statusCode === 200) resolve(JSON.parse(body))
            else reject(statusCode + ' ' + statusMessage)
          })
          .catch((err) => reject(err))
      )
    },
    pausePlayback(accessToken) {
      return new Promise((resolve, reject) => {
        spotifyApi
          .put('/v1/me/player/pause', accessToken)
          .then(({ statusCode, statusMessage }) => {
            if (statusCode === 204) resolve()
            else reject(statusCode + ' ' + statusMessage)
          })
          .catch((err) => reject(err))
      })
    },
    startPlayback(accessToken) {
      return new Promise((resolve, reject) => {
        spotifyApi
          .put('/v1/me/player/play', accessToken)
          .then(({ statusCode, statusMessage }) => {
            if (statusCode === 204) resolve()
            else reject(statusCode + ' ' + statusMessage)
          })
          .catch((err) => reject(err))
      })
    },
  }
}

module.exports = createApplication
