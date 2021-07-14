module.exports = createApplication

function createApplication() {
  let routes = [];
  return {
    route: async (req, res) => {
      let url = new URL(req.url, req.protocol + '://' + req.headers.host + "/")
      res.writeHead(200, { "Content-Type": "text/html" })
      let flag = 0
      for (path of routes) {
        if (path.path == url.pathname) {
          console.log(path.path)
          await new Promise((next) => {
            path.func({req, res, url, next})
          })
          flag = 1;
        }
      }
      if (flag === 0) {
        res.write("404")
      }
      res.end()
    },
    addRoute: (path, func) => {
      routes.push({ path, func })
    }
  }
}