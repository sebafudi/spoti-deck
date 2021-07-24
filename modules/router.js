const fs = require('fs')
const fsPromise = require('fs').promises
const fspath = require('path')
const mime = require('mime-types')

function createApplication() {
  let staticPath
  let routes = []
  let syncRoutes = []
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
    promiseArray.push(
      fsPromise.readFile(fspath.join(staticPath, url.pathname)).then((data, err) => {
        if (!err) {
          res.writeHead(200, { 'Content-Type': mime.lookup(url.pathname) })
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
      let flag = 0
      let promiseArray = []
      let url = new URL(req.url, req.protocol + '://' + req.headers.host + '/')
      console.log(url.pathname)
      if (isStaticFile(url.pathname)) {
        flag = 1
        serveStaticFile(url, res, promiseArray)
      }
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
    },
    addRoute: (path, func) => {
      routes.push({ path, func })
    },
    addSyncRoute: (path, func) => {
      syncRoutes.push({ path, func })
    },
    staticDir: (path) => {
      staticPath = fspath.normalize(path)
    },
  }
}

module.exports = createApplication
