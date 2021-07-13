const http = require('http')
const config = require('./modules/config')
const Router = require('./modules/router')
const Spotify = require('./modules/spotify')

router = Router()
spotify = Spotify(config.spotify_client_secret, config.callback, config.spotify_client_id)

router.addRoute('/', '<a href="/login">login</a>')
router.addRoute('/login', 'login')
router.addRoute('/callback/', '<a href="/">main</a>')

http.createServer(function (request, response) {
  router.route(request, response, (req, res, url) => {
    if (url.pathname === '/login') {
      let scopes = 'user-read-currently-playing';
      const authorization =
        'https://accounts.spotify.com/authorize'
        + '?response_type=code'
        + '&client_id=' + config.spotify_client_id
        + (scopes ? '&scope=' + encodeURIComponent(scopes) : '')
        + '&redirect_uri=' + encodeURIComponent(config.callback)
      res.writeHead(307, { 'Location': authorization })
    } else if (url.pathname === '/callback/') {
      spotify.handleAccessToken(url.searchParams.get('code'))
      .then(x => {
        console.log(x)
        spotify.makeRequest('https://api.spotify.com/v1/me/player/currently-playing', x.access_token).then((xx) => {
          let data = JSON.parse(xx.body)
          console.log(`Now playing: ${data.item.name} by ${data.item.artists[0].name}`)
        })
      })
      .catch(err => console.log("error getting access token"))
    }
  })
}).listen(config.port);