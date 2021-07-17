const fs = require('fs')
const fspath = require('path')

module.exports = createApplication

function createApplication() {
  let staticPath
  let routes = []
  return {
    route: async (req, res) => {
      let url = new URL(req.url, req.protocol + '://' + req.headers.host + '/')
      console.log(url.pathname)
      if (
        fs.existsSync(fspath.join(staticPath, url.pathname)) &&
        fs.lstatSync(fspath.join(staticPath, url.pathname)).isFile()
      ) {
        let data = fs.readFileSync(fspath.join(staticPath, url.pathname))
        if (data) {
          res.writeHead(200, { 'Content-Type': 'image/png' })
          res.write(data)
        } else {
          res.writeHead(404, 'Not found')
        }
        res.end()
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
