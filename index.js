const http = require('http')
const config = require('./modules/config')
const Router = require('./modules/router')
const Spotify = require('./modules/spotify')
const User = require('./modules/user')

const router = Router()
const spotify = Spotify(config.spotify_client_secret, config.callback, config.spotify_client_id)

let userArray = []

router.addRoute('/', (req, res, next) => {
  res.write('<a href="/login">login</a>')
  res.write('<br /><img src="/foo.png" alt="bar"width=200></img>')
  next()
})
router.addRoute('/login', (req, res, next) => {
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
router.addRoute('/callback/', (req, res, next, { url }) => {
  spotify
    .handleAccessToken(url.searchParams.get('code'))
    .then((x) => {
      spotify
        .getUserInfo(x.access_token)
        .then((userInfo) => {
          let user = userArray.find((key) => key.id === userInfo.id)
          if (user) {
            console.log('user already in db')
          } else {
            console.log('user not in db')
            user = new User()
            user.access_token = x.access_token
            user.refresh_token = x.refresh_token
            user.id = userInfo.id
            userArray.push(user)
          }
          spotify
            .makeRequest('https://api.spotify.com/v1/me/player/currently-playing', user.access_token)
            .then((xx) => {
              res.write('<head>')
              res.write('<meta charset="UTF-8">')
              res.write('</head>')
              res.write('<body>')
              res.write('<a href="/">main</a><br />')
              res.write(`User: <b>${user.id}</b><br />`)
              if (xx.statusCode === 200) {
                let data = JSON.parse(xx.body)
                res.write(`Now playing type: <b>${data.currently_playing_type}</b><br />`)
                if (data.currently_playing_type === 'track') {
                  res.write(`Now playing: <b>${data.item.name}</b> by <b>${data.item.artists[0].name}</b>`)
                }
              } else if (xx.statusCode === 204) {
                res.write('Player not detected!')
              } else {
                res.write('Error occurred')
              }
              res.write('</body>')
              next()
            })
        })
        .catch((err) => {
          console.log(err)
        })
    })
    .catch((err) => {
      console.log('error getting access token')
      console.log(err)
      res.write('<a href="/">main</a><br />')
      next()
    })
})

router.addRoute('/foo.png', (req, res, next) => {
  console.log('foo')
  next()
})

router.staticDir('./static/')

http
  .createServer(function (request, response) {
    router.route(request, response)
  })
  .listen(config.port)
