const fs = require('fs')
const fsPromise = require('fs').promises
const fspath = require('path')
const mime = require('mime-types')

function createApplication() {
  let staticPath
  let routes = []
  let syncRoutes = []
  let postRoutes = []
  function isStaticFile(pathname) {
    pathname = fspath.join(staticPath, pathname)
    if (fs.existsSync(pathname) && fs.lstatSync(pathname).isFile()) {
      return true
    } else {
      return false
    }
  }

  function isPath(path) {
    return routes.some((key) => key.path === path)
  }
  function isSyncPath(path) {
    return syncRoutes.some((key) => key.path === path)
  }

  function serveStaticFile(url, res, promiseArray) {
    let path = url.pathname === '/' ? '/index.html' : url.pathname
    promiseArray.push(
      fsPromise.readFile(fspath.join(staticPath, path)).then((data, err) => {
        if (!err) {
          res.writeHead(200, { 'Content-Type': mime.lookup(path) })
          res.write(data)
        } else {
          res.writeHead(500, 'Internal Server Error')
        }
      })
    )
  }
  function servePath(req, res, url, promiseArray) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    for (let path of routes) {
      if (path.path === url.pathname) {
        promiseArray.push(new Promise((done) => path.func(req, res, done, { url })))
      }
    }
  }
  async function serveSyncPath(req, res, url) {
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

        if (isStaticFile(url.pathname) || (url.pathname == '/' && isStaticFile('/index.html'))) {
          flag = 1
          serveStaticFile(url, res, promiseArray)
        }
        console.log(url.pathname)

        if (isPath(url.pathname)) {
          flag = 1
          servePath(req, res, url, promiseArray)
        }
        if (isSyncPath(url.pathname)) {
          flag = 1
          await serveSyncPath(req, res, url, promiseArray)
        }
        Promise.all(promiseArray).then(() => {
          if (flag === 0) {
            res.writeHead(404, 'Not found')
          }
          res.end()
        })
      } else if (req.method === 'POST') {
        let url = new URL(req.url, req.protocol + '://' + req.headers.host + '/')
        if (postRoutes.some((key) => key.path === url.pathname)) {
          let func = postRoutes.find((key) => key.path === url.pathname)
          await func.func(req, res)
        }
        res.end()
      }
    },
    get: (path, func) => {
      routes.push({ path, func })
    },
    getSync: (path, func) => {
      syncRoutes.push({ path, func })
    },
    staticDir: (path) => {
      staticPath = fspath.normalize(path)
    },
    post: (path, func) => {
      postRoutes.push({ path, func })
    },
  }
}

module.exports = createApplication
