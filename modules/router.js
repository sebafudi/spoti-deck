const fs = require('fs')
const fsPromise = require('fs').promises
const fspath = require('path')

function createApplication() {
  let staticPath
  let routes = []
  function isStaticFile(pathname) {
    pathname = fspath.join(staticPath, pathname)
    if (fs.existsSync(pathname) && fs.lstatSync(pathname).isFile()) {
      return true
    } else {
      return false
    }
  }

  function serveStaticFile(url, res, promiseArray) {
    promiseArray.push(
      fsPromise.readFile(fspath.join(staticPath, url.pathname)).then((data, err) => {
        if (!err) {
          res.writeHead(200, { 'Content-Type': 'image/png' })
          res.write(data)
        } else {
          res.writeHead(404, 'Not found')
        }
      })
    )
  }
  return {
    route: (req, res) => {
      let promiseArray = []
      let url = new URL(req.url, req.protocol + '://' + req.headers.host + '/')
      if (isStaticFile(url.pathname)) {
        serveStaticFile(url, res, promiseArray)
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        let flag = 0
        for (let path of routes) {
          if (path.path == url.pathname) {
            promiseArray.push(
              new Promise((next) => {
                path.func({ req, res, url, next })
              })
            )
            flag = 1
          }
        }
        if (flag === 0) {
          res.writeHead(404, 'Not found')
        }
      }
      Promise.all(promiseArray).then(() => {
        res.end()
      })
    },
    addRoute: (path, func) => {
      routes.push({ path, func })
    },
    staticDir: (path) => {
      staticPath = fspath.normalize(path)
    },
  }
}

module.exports = createApplication
