const config = require("./config")

class Router {
  route(request, response) {
    let url = new URL(request.url, request.protocol + '://' + request.headers.host + "/")
    console.log(url.pathname)
    if (url.pathname === "/") {
      response.writeHead(200, { "Content-Type": "text/html" })
      response.write("<a href=\"/login\">login</a>")
      response.end()
    } else if (url.pathname === "/login") {
      const authorization =
        'https://accounts.spotify.com/authorize'
        + '?response_type=code'
        + '&client_id=' + config.spotify_client_id
        + '&redirect_uri=' + encodeURIComponent(config.callback)
      response.writeHead(307, { "Location": authorization })
      response.end()
    } else if (url.pathname === "/callback/") {
      response.writeHead(200, { "Content-Type": "text/html" })
      response.write("<a href=\"/\">main</a>")
      response.end();
    }
  }
}

module.exports = Router