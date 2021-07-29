const http = require('http')
const config = require('./modules/config')
const Router = require('./modules/router')
const Spotify = require('./modules/spotify')
const UserDB = require('./modules/userDB')
const crypto = require('crypto')

const router = Router()
const spotify = Spotify({
  clientSecret: config.spotify_client_secret,
  redirectUri: config.callback,
  clientId: config.spotify_client_id,
})
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
    try {
      await spotify.pausePlayback(user.access_token)
      res.write('ok')
    } catch (err) {
      console.log(err)
    }
  }
})
router.post('/api/playback/play', async (req, res) => {
  if (req.headers.authorization !== undefined) {
    let token = getTokenFromAuthString(req.headers.authorization)
    let user = userDB.findUserByToken(token)
    try {
      await spotify.startPlayback(user.access_token)
      res.write('ok')
    } catch (err) {
      console.log(err)
    }
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

router.get('/callback/', async (req, res, done, { url }) => {
  res.write('<head>')
  res.write('<meta charset="UTF-8">')
  res.write('</head>')
  res.write('<body>')
  res.write('<a href="/">main</a><br />')
  try {
    let userCode = await spotify.handleAccessToken(url.searchParams.get('code'))
    let userInfo = await spotify.getUserInfo(userCode.access_token)
    let user = userDB.findUserById(userInfo.id)
    if (user) {
      console.log('user already in db')
    } else {
      console.log('user not in db')
      user = userDB.newUser(userInfo.id, userCode.access_token, userCode.refresh_token)
    }
    res.write(`User: <b>${user.id}</b><br />`)
    Promise.all([
      (async () => {
        try {
          let userPlayback = await spotify.getUserPlayback(user.access_token)
          res.write(`Now playing type: <b>${userPlayback.currently_playing_type}</b><br />`)
          if (userPlayback.currently_playing_type === 'track') {
            res.write(
              `Now playing: <b>${userPlayback.item.name}</b> by <b>${userPlayback.item.artists[0].name}</b><br />`
            )
          }
          res.write('</body>')
          done()
        } catch (err) {
          res.write('Error occoured<br />')
          res.write(err.toString())
          res.write('</body>')
          done()
        }
      })(),
    ])
  } catch (err) {
    res.write('Error occoured<br />')
    res.write(err.toString())
    res.write('</body>')
    done()
  }
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

http
  .createServer(function (request, response) {
    router.route(request, response)
  })
  .listen(config.port)
