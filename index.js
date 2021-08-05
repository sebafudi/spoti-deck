const http = require('http')
const config = require('./modules/config')
const Router = require('./modules/router')
const Spotify = require('./modules/spotify')
const UserDB = require('./modules/userDB')
const Mongodb = require('./modules/mongodb')
const crypto = require('crypto')

const router = Router()
const spotify = Spotify({
  clientSecret: config.spotify_client_secret,
  redirectUri: config.callback,
  clientId: config.spotify_client_id,
})
const mongodb = Mongodb({ uri: config.mongodb_uri })
const userDB = UserDB(mongodb)

function createUserToken(uuid) {
  let token = crypto
    .createHmac('sha256', config.session_secret)
    .update(uuid + crypto.randomBytes(16))
    .digest('hex')
  return token
}

function getTokenFromAuthString(str) {
  let reg = /(\S{64})$/gm
  let res = reg.exec(str)
  if (res) {
    return res[0]
  } else {
    return false
  }
}

router.post('/api/token', async (req, res) => {
  const chunks = []
  req.on('data', (chunk) => chunks.push(chunk))
  await new Promise((done) => {
    req.on('end', async () => {
      const data = JSON.parse(Buffer.concat(chunks).toString())
      let token = createUserToken(data.uuid)
      if (await userDB.findUser({ uuid: data.uuid })) {
        done()
      } else {
        let user = await userDB.findUser({ id: data.login })
        if (user) {
          user.addDevice(data.uuid, token)
          userDB.addDevice(user.id, { uuid: data.uuid, token })
          res.write(`${token}`)
        } else {
          res.write('no user')
        }
        done()
      }
    })
  })
})

for (let x of ['play', 'pause']) {
  router.post('/api/playback/' + x, async (req, res) => {
    if (req.headers.authorization !== undefined) {
      let token = getTokenFromAuthString(req.headers.authorization)
      if (token) {
        let user = await userDB.findUser({ token })
        try {
          if (x === 'pause') {
            await spotify.pausePlayback(user.access_token)
          } else if (x === 'play') {
            await spotify.startPlayback(user.access_token)
          }
          let playback = await spotify.getUserPlayback(user.access_token)
          if (playback.is_playing === true) {
            res.write('playing')
          }
          if (playback.is_playing === false) {
            res.write('paused')
          }
        } catch (err) {
          res.writeHead(500)
        }
      } else {
        res.writeHead(400)
      }
    }
  })
}

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
    let user = await userDB.findUser({ id: userInfo.id })
    if (!user) user = userDB.newUser(userInfo.id, userCode.access_token, userCode.refresh_token)
    else {
      let res = await spotify.refreshAccessToken(user.refresh_token)
      userDB.updateToken(user.id, res.access_token)
      userInfo = await spotify.getUserInfo(userCode.access_token)
      user = await userDB.findUser({ id: userInfo.id })
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
  .createServer((request, response) => {
    router.route(request, response)
  })
  .listen(config.port)
