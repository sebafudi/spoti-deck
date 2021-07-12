const http = require('http')
const config = require('./modules/config')
const Router = require('./modules/router')
const Spotify = require('./modules/spotify')

router = Router()
spotify = Spotify()

spotify.setClientSecret(config.spotify_client_secret)
spotify.setRedirectUri(config.callback)
spotify.setClientId(config.spotify_client_id)

router.addRoute('/', '<a href="/login">login</a>')
router.addRoute('/login', 'login')
router.addRoute('/callback/', '<a href="/">main</a>')

http.createServer(function (request, response) {
  router.route(request, response, (req, res, url) => {
    if (url.pathname === '/login') {
      const authorization =
        'https://accounts.spotify.com/authorize'
        + '?response_type=code'
        + '&client_id=' + config.spotify_client_id
        + '&redirect_uri=' + encodeURIComponent(config.callback)
      res.writeHead(307, { 'Location': authorization })
    } else if (url.pathname === '/callback/') {
      spotify.handleAccessToken(url.searchParams.get('code'))
      .then(x => console.log(x))
      .catch(err => console.log("error getting access token"))
    }
  })
}).listen(config.port);