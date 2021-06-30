const http = require("http")
const config = require("./modules/config")
const Router = require("./modules/router")

router = Router();

router.addRoute("/", "<a href=\"/login\">login</a>")
router.addRoute("/login", "login")
router.addRoute("/callback/", "<a href=\"/\">main</a>")

http.createServer(function (request, response) {
  router.route(request, response, (req, res, url) => {
    if (url.pathname === "/login") {
      const authorization =
        'https://accounts.spotify.com/authorize'
        + '?response_type=code'
        + '&client_id=' + config.spotify_client_id
        + '&redirect_uri=' + encodeURIComponent(config.callback)
        res.writeHead(307, { "Location": authorization })
    }
  })
}).listen(config.port);