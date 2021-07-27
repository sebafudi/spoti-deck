const http = require('http')
const config = require('./modules/config')
const Router = require('./modules/router')
const Spotify = require('./modules/spotify')
const UserDB = require('./modules/userDB')
const crypto = require('crypto')

const router = Router()
const spotify = Spotify(config.spotify_client_secret, config.callback, config.spotify_client_id)
const userDB = UserDB()

let devicesDB = []

function createUserToken(uuid) {
  let token = crypto
    .createHmac('sha256', config.session_secret)
    .update(uuid + crypto.randomBytes(16))
    .digest('hex')
  return token
}

function getTokenFromAuthString(str) {
  let reg = /(\S{64})$/gm
  return reg.exec(str)[0]
}

router.post('/api/token', async (req, res) => {
  const chunks = []
  req.on('data', (chunk) => chunks.push(chunk))
  await new Promise((done) => {
    req.on('end', () => {
      const data = JSON.parse(Buffer.concat(chunks).toString())
      let token = createUserToken(data.uuid)
      if (devicesDB.some((key) => key.uuid === data.uuid)) {
        console.log('already registered')
        done()
      } else {
        let user = userDB.findUserById(data.login)
        if (user) {
          user.addDevice(data.uuid, token)
          devicesDB.push({ uuid: data.uuid, token })
          res.write(`${token}`)
          console.log('registered new device', data.uuid)
        } else {
          res.write('no user')
        }
        done()
      }
    })
  })
})

router.post('/api/playback/pause', async (req, res) => {
  if (req.headers.authorization !== undefined) {
    let token = getTokenFromAuthString(req.headers.authorization)
    let user = userDB.findUserByToken(token)
    spotify
      .pausePlayback(user.access_token)
      .then(() => {
        res.write('ok')
      })
      .catch((err) => console.log(err))
  }
})
router.post('/api/playback/play', async (req, res) => {
  if (req.headers.authorization !== undefined) {
    let token = getTokenFromAuthString(req.headers.authorization)
    let user = userDB.findUserByToken(token)
    spotify
      .startPlayback(user.access_token)
      .then(() => {
        res.write('ok')
      })
      .catch((err) => console.log(err))
  }
})

router.get('/', (req, res, done) => {
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
          let user = userDB.findUserById(userInfo.id)
          if (user) {
            console.log('user already in db')
          } else {
            console.log('user not in db')
            let xxx = userDB.newUser(userInfo.id, x.access_token, x.refresh_token)
            console.log(xxx)
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
            console.log('done')
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
