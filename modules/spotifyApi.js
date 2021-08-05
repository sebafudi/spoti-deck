const got = require('got')

const tokenApiAddress = 'https://accounts.spotify.com'
const apiAddress = 'https://api.spotify.com'

const requestAccessToken = (clientCode, options) => {
  let authString = options.clientId + ':' + options.clientSecret
  return got.post(new URL('/api/token', tokenApiAddress), {
    form: {
      grant_type: 'authorization_code',
      code: clientCode,
      redirect_uri: options.redirectUri,
    },
    headers: {
      Authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
      'accept-encoding': '*',
    },
  })
}

const refreshAccessToken = (refresh_token, options) => {
  let authString = options.clientId + ':' + options.clientSecret
  return got.post(new URL('/api/token', tokenApiAddress), {
    form: {
      grant_type: 'refresh_token',
      refresh_token,
    },
    headers: {
      Authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
      'accept-encoding': '*',
    },
  })
}
const get = (url, accessToken) => {
  return got(new URL(url, apiAddress), {
    headers: {
      Authorization: `Bearer  ${accessToken}`,
      'accept-encoding': '*',
    },
  })
}
const put = (url, accessToken) => {
  return got.put(new URL(url, apiAddress), {
    headers: {
      Authorization: `Bearer  ${accessToken}`,
      'accept-encoding': '*',
    },
  })
}

module.exports = { requestAccessToken, get, put, refreshAccessToken }
