const spotifyApi = require('./spotifyApi')

function unsetError(options) {
  if (options instanceof Object)
    Object.keys(options).forEach((element) => {
      if (options[element] === undefined) throw new Error(`${element} option must be set!`)
    })
  else throw new Error('Must be an object')
}

function requestFactory(uri, expectedStatusCode, accessToken) {
  return {
    get: () => {
      return new Promise((resolve, reject) =>
        spotifyApi
          .get(uri, accessToken)
          .then(({ statusCode, body, statusMessage }) => {
            if (statusCode === expectedStatusCode) resolve(JSON.parse(body))
            else reject(statusCode + ' ' + statusMessage)
          })
          .catch((err) => reject(err))
      )
    },
    put: () => {
      return new Promise((resolve, reject) =>
        spotifyApi
          .put(uri, accessToken)
          .then(({ statusCode, statusMessage }) => {
            if (statusCode === expectedStatusCode) resolve()
            else reject(statusCode + ' ' + statusMessage)
          })
          .catch((err) => reject(err))
      )
    },
  }
}

function createApplication(options) {
  unsetError({
    clientSecret: options.clientSecret,
    redirectUri: options.redirectUri,
    clientId: options.clientId,
  })
  const handleAccessToken = async (clientCode) => {
    return new Promise((resolve, reject) =>
      spotifyApi
        .requestAccessToken(clientCode, options)
        .then(({ statusCode, body, statusMessage }) => {
          if (statusCode === 200) resolve(JSON.parse(body))
          else reject(statusCode + ' ' + statusMessage)
        })
        .catch((err) => reject(err))
    )
  }
  const refreshAccessToken = (refresh_token) => {
    return new Promise((resolve, reject) =>
      spotifyApi
        .refreshAccessToken(refresh_token, options)
        .then(({ statusCode, body, statusMessage }) => {
          if (statusCode === 200) resolve(JSON.parse(body))
          else reject(statusCode + ' ' + statusMessage)
        })
        .catch((err) => {
          reject(err)
        })
    )
  }
  const getUserInfo = (accessToken) => requestFactory('/v1/me', 200, accessToken).get()
  const getUserPlayback = (accessToken) => requestFactory('/v1/me/player/currently-playing', 200, accessToken).get()
  const pausePlayback = (accessToken) => requestFactory('/v1/me/player/pause', 204, accessToken).put()
  const startPlayback = (accessToken) => requestFactory('/v1/me/player/play', 204, accessToken).put()
  return { handleAccessToken, getUserInfo, getUserPlayback, pausePlayback, startPlayback, refreshAccessToken }
}

module.exports = createApplication
