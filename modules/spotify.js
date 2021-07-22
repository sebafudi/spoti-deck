const got = require('got')

module.exports = createApplication

function createApplication(clientSecret = '', redirectUri = '', clientId = '') {
  const options = {
    clientSecret: clientSecret,
    redirectUri: redirectUri,
    clientId: clientId,
  }
  function requestAccessToken(clientCode) {
    let authString = options.clientId + ':' + options.clientSecret
    return got.post('https://accounts.spotify.com/api/token', {
      form: {
        grant_type: 'authorization_code',
        code: clientCode,
        redirect_uri: options.redirectUri,
        // client_id: options.clientId,
        // client_secret: options.clientSecret
      },
      headers: {
        Authorization: `Basic ${Buffer.from(authString).toString('base64')}`,
        'accept-encoding': '*',
      },
    })
  }
  return {
    setClientSecret(secret) {
      options.clientSecret = secret
    },
    setRedirectUri(redirectUri) {
      options.redirectUri = redirectUri
    },
    setClientId(clientId) {
      options.clientId = clientId
    },
    handleAccessToken(clientCode) {
      return new Promise((resolve, reject) => {
        requestAccessToken(clientCode)
          .then(({ body }) => resolve(JSON.parse(body)))
          .catch((x) => reject(x))
      })
    },
    makeRequest(url, accessToken) {
      return got(url, {
        headers: {
          Authorization: `Bearer  ${accessToken}`,
          'accept-encoding': '*',
        },
      })
    },
    getUserInfo(accessToken) {
      return new Promise((resolve, reject) => {
        this.makeRequest('https://api.spotify.com/v1/me', accessToken)
          .then((response) => {
            if (response.statusCode === 200) {
              resolve(JSON.parse(response.body))
            } else {
              reject()
            }
          })
          .catch((err) => reject(err))
      })
    },
  }
}
