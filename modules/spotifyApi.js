const got = require('got')

function requestAccessToken(clientCode, options) {
  let authString = options.clientId + ':' + options.clientSecret
  return got.post('https://accounts.spotify.com/api/token', {
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
function makeRequest(url, accessToken) {
  return got(url, {
    headers: {
      Authorization: `Bearer  ${accessToken}`,
      'accept-encoding': '*',
    },
  })
}

module.exports = { requestAccessToken, makeRequest }
