module.exports = createApplication

function createApplication() {
  let routes = [];
  return {
    route: (req, res, n) => {
      let url = new URL(req.url, req.protocol + '://' + req.headers.host + "/")
      res.writeHead(200, { "Content-Type": "text/html" })
      let flag = 0;
      n(req, res, url)
      routes.forEach(path => {
        console.log(path.path)
        if (path.path == url.pathname) {
          res.write(path.text)
          flag = 1;
        }
      })
      if (flag === 0) {
        res.write("404");
      }
      res.end()
    },
    addRoute: (path, text) => {
      routes.push({ path, text })
    }
  }
}