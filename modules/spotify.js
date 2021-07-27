const spotifyApi = require('./spotifyApi')

function createApplication(clientSecret = '', redirectUri = '', clientId = '') {
  const options = {
    clientSecret,
    redirectUri,
    clientId,
  }
  return {
    set clientSecret(value) {
      options.clientSecret = value
    },
    set redirectUri(value) {
      options.redirectUri = value
    },
    set clientId(value) {
      options.clientId = value
    },
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
