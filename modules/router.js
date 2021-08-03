const fs = require('fs').promises
const fspath = require('path')
const mime = require('mime-types')

function createApplication(options) {
  options = Object.assign(
    {
      staticPath: './static/',
    },
    options
  )
  let routes = []
  let syncRoutes = []
  let postRoutes = []

  const _isStaticFile = async (pathname) => {
    try {
      pathname = fspath.join(options.staticPath, pathname)
      await (await fs.stat(pathname)).isFile()
      return true
    } catch (error) {
      return false
    }
  }

  const _isPathInArray = (pathArray, path) => pathArray.some((key) => key.path === path)

  const _serveStaticFile = (url, res, promiseArray) => {
    let path = url.pathname === '/' ? '/index.html' : url.pathname
    promiseArray.push(
      fs.readFile(fspath.join(options.staticPath, path)).then((data, err) => {
        if (!err) {
          res.writeHead(200, { 'Content-Type': mime.lookup(path) })
          res.write(data)
        } else res.writeHead(500, 'Internal Server Error')
      })
    )
  }
  const _servePath = (req, res, url, promiseArray) => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    for (let path of routes) {
      if (path.path === url.pathname) {
        promiseArray.push(new Promise((done) => path.func(req, res, done, { url })))
      }
    }
  }
  const _serveSyncPath = async (req, res, url) => {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    for (let path of syncRoutes) {
      if (path.path == url.pathname) {
        await new Promise((next) => path.func(req, res, next, { url }))
      }
    }
  }
  return {
    route: async (req, res) => {
      if (req.method === 'GET') {
        let flag = 0
        let promiseArray = []
        let url = new URL(req.url, req.protocol + '://' + req.headers.host + '/')

        if ((await _isStaticFile(url.pathname)) || (url.pathname == '/' && _isStaticFile('/index.html'))) {
          flag = 1
          _serveStaticFile(url, res, promiseArray)
        }
        console.log(url.pathname)

        if (_isPathInArray(routes, url.pathname)) {
          flag = 1
          _servePath(req, res, url, promiseArray)
        }
        if (_isPathInArray(syncRoutes, url.pathname)) {
          flag = 1
          await _serveSyncPath(req, res, url, promiseArray)
        }
        Promise.all(promiseArray).then(() => {
          if (flag === 0) res.writeHead(404, 'Not found')
          res.end()
        })
      } else if (req.method === 'POST') {
        let url = new URL(req.url, req.protocol + '://' + req.headers.host + '/')
        if (_isPathInArray(postRoutes, url.pathname)) {
          let func = postRoutes.find((key) => key.path === url.pathname)
          await func.func(req, res)
        }
        res.end()
      }
    },
    get: (path, func) => routes.push({ path, func }),
    getSync: (path, func) => syncRoutes.push({ path, func }),
    post: (path, func) => postRoutes.push({ path, func }),
  }
}

module.exports = createApplication
