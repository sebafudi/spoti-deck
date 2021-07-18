const fs = require('fs')
const fspath = require('path')

module.exports = createApplication

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

  function serveStaticFile(url, res) {
    let data = fs.readFileSync(fspath.join(staticPath, url.pathname))
    if (data) {
      res.writeHead(200, { 'Content-Type': 'image/png' })
      res.write(data)
    } else {
      res.writeHead(404, 'Not found')
    }
    res.end()
  }
  return {
    route: async (req, res) => {
      let url = new URL(req.url, req.protocol + '://' + req.headers.host + '/')
      if (isStaticFile(url.pathname)) {
        serveStaticFile(url, res)
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' })
        let flag = 0
        for (let path of routes) {
          if (path.path == url.pathname) {
            await new Promise((next) => {
              path.func({ req, res, url, next })
            })
            flag = 1
          }
        }
        if (flag === 0) {
          res.writeHead(404, 'Not found')
        }
        res.end()
      }
    },
    addRoute: (path, func) => {
      routes.push({ path, func })
    },
    staticDir: (path) => {
      staticPath = fspath.normalize(path)
    },
  }
}
