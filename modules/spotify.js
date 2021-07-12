const got = require('got')

module.exports = createApplication

function createApplication() {
  options = {
    'clientSecret': '',
    'redirectUri': '',
    'clientId': ''
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
        Authorization: 'Basic ' + Buffer.from(authString).toString('base64'),
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
          .catch(x => reject(x))
      })
    }
  }
}