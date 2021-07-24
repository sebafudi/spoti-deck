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
    handleAccessToken(clientCode) {
      return new Promise((resolve, reject) =>
        spotifyApi
          .requestAccessToken(clientCode, options)
          .then(({ statusCode, body }) => {
            if (statusCode === 200) resolve(JSON.parse(body))
            else reject(statusCode)
          })
          .catch((err) => reject(err))
      )
    },
    getUserInfo(accessToken) {
      return new Promise((resolve, reject) =>
        spotifyApi
          .makeRequest('/v1/me', accessToken)
          .then(({ statusCode, body }) => {
            if (statusCode === 200) resolve(JSON.parse(body))
            else reject(statusCode)
          })
          .catch((err) => reject(err))
      )
    },
    getUserPlayback(accessToken) {
      return new Promise((resolve, reject) =>
        spotifyApi
          .makeRequest('/v1/me/player/currently-playing', accessToken)
          .then(({ statusCode, body }) => {
            if (statusCode === 200) resolve(JSON.parse(body))
            else reject(statusCode)
          })
          .catch((err) => reject(err))
      )
    },
  }
}

module.exports = createApplication
