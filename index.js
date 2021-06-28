const http = require("http")
const config = require("./modules/config")
const Router = require("./modules/router")

router = new Router();

http.createServer(function (request, response) {
  router.route(request, response)
}).listen(config.port);
