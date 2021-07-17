const http = require('http')
const config = require('./modules/config')
const Router = require('./modules/router')
const Spotify = require('./modules/spotify')

const router = Router()
const spotify = Spotify(config.spotify_client_secret, config.callback, config.spotify_client_id)

router.addRoute('/', ({ res, next }) => {
  res.write('<a href="/login">login</a>')
  res.write('<br /><img src="/foo.png" alt="bar"width=200></img>')
  next()
})
router.addRoute('/login', ({ res, next }) => {
  let scopes = 'user-read-currently-playing'
  const authorization =
    'https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' +
    config.spotify_client_id +
    (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    '&redirect_uri=' +
    encodeURIComponent(config.callback)
  res.writeHead(307, { Location: authorization })
  next()
})
router.addRoute('/callback/', ({ res, next, url }) => {
  spotify
    .handleAccessToken(url.searchParams.get('code'))
    .then((x) => {
      spotify.makeRequest('https://api.spotify.com/v1/me/player/currently-playing', x.access_token).then((xx) => {
        let data = JSON.parse(xx.body)
        res.write('<head>')
        res.write('<meta charset="UTF-8">')
        res.write('</head>')
        res.write('<body>')
        res.write('<a href="/">main</a><br />')
        res.write(`Now playing: <b>${data.item.name}</b> by <b>${data.item.artists[0].name}</b>`)
        res.write('</body>')
        next()
      })
    })
    .catch((err) => {
      console.log('error getting access token')
      console.log(err)
      res.write('<a href="/">main</a><br />')
      next()
    })
})

router.staticDir('./static/')

http
  .createServer(function (request, response) {
    router.route(request, response)
  })
  .listen(config.port)
