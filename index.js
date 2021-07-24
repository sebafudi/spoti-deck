const http = require('http')
const config = require('./modules/config')
const Router = require('./modules/router')
const Spotify = require('./modules/spotify')
const User = require('./modules/user')
const crypto = require('crypto')

const router = Router()
const spotify = Spotify(config.spotify_client_secret, config.callback, config.spotify_client_id)

const secret = 'keyboard cat'

let userArray = []

let devicesDB = []

router.post('/api/token', async (req, res) => {
  if (req.headers.authorization !== undefined) {
    let token = crypto
      .createHmac('sha256', secret)
      .update(req.headers.authorization + crypto.randomBytes(0))
      .digest('hex')
    let reg = /(\S{4})$/gm

    let uuid = reg.exec(req.headers.authorization)[0]
    if (devicesDB.some((key) => key.uuid === uuid)) {
      console.log('already registered')
    } else {
      devicesDB.push({ uuid, token })
      res.write(`{token: ${token}}`)
    }
  } else {
    res.writeHead(400, 'Bad Request')
  }
})

router.post('/api/playback/pause', async (req, res) => {
  if (req.headers.authorization !== undefined) {
    if (req.headers.authorization === 'Bearer 675167aae18eafd70f8332c0cc8a298f78f44ef52454aae90562c3def465b099') {
      console.log(userArray[0].access_token)
      spotify
        .pausePlayback(userArray[0].access_token)
        .then(() => {
          res.write('ok')
        })
        .catch((err) => console.log(err))
    }
  }
})
router.post('/api/playback/play', async (req, res) => {
  if (req.headers.authorization !== undefined) {
    if (req.headers.authorization === 'Bearer 675167aae18eafd70f8332c0cc8a298f78f44ef52454aae90562c3def465b099') {
      console.log(userArray[0].access_token)
      spotify
        .startPlayback(userArray[0].access_token)
        .then(() => {
          res.write('ok')
        })
        .catch((err) => console.log(err))
    }
  }
})

router.get('/', (req, res, done) => {
  res.write('<a href="/login">login</a>')
  res.write('<br /><img src="/foo.png" alt="bar"width=200></img>')
  done()
})
router.get('/login', (req, res, done) => {
  let scopes = 'user-read-currently-playing user-modify-playback-state'
  const authorization =
    'https://accounts.spotify.com/authorize' +
    '?response_type=code' +
    '&client_id=' +
    config.spotify_client_id +
    (scopes ? '&scope=' + encodeURIComponent(scopes) : '') +
    '&redirect_uri=' +
    encodeURIComponent(config.callback)
  res.writeHead(307, { Location: authorization })
  done()
})
router.get('/callback/', (req, res, done, { url }) => {
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
          let arr = []

          res.write('<head>')
          res.write('<meta charset="UTF-8">')
          res.write('</head>')
          res.write('<body>')
          res.write('<a href="/">main</a><br />')
          res.write(`User: <b>${user.id}</b><br />`)
          arr.push(
            spotify
              .getUserPlayback(user.access_token)
              .then((userPlayback) => {
                res.write(`Now playing type: <b>${userPlayback.currently_playing_type}</b><br />`)
                if (userPlayback.currently_playing_type === 'track') {
                  res.write(
                    `Now playing: <b>${userPlayback.item.name}</b> by <b>${userPlayback.item.artists[0].name}</b><br />`
                  )
                }
              })
              .catch((err) => {
                if (err === 204) res.write('No playback detected<br />')
                else res.write('Error getting player info<br />')
              })
          )
          Promise.all(arr).then(() => {
            res.write('</body>')
            done()
          })
        })
        .catch(() => {
          res.write('<a href="/">main</a><br />')
          res.write('Error geting user info<br />')
        })
    })
    .catch(() => {
      res.write('<a href="/">main</a><br />')
      res.write('Error geting access token<br />')
      done()
    })
})

router.get('/foo.png', (req, res, done) => {
  console.log('foo')
  done()
})

router.getSync('/test', (req, res, next) => {
  setTimeout(() => {
    res.write('a')
    next()
  }, (Math.random() * 100) % 100)
})
router.getSync('/test', (req, res, next) => {
  setTimeout(() => {
    res.write('b')
    next()
  }, (Math.random() * 100) % 100)
})
router.get('/test', (req, res, next) => {
  setTimeout(() => {
    res.write('.')
    next()
  }, (Math.random() * 100) % 100)
})

router.staticDir('./static/')

http
  .createServer(function (request, response) {
    router.route(request, response)
  })
  .listen(config.port)
