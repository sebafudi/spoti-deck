var fs = require('fs')
const configPath = "./config.json"
module.exports = JSON.parse(fs.readFileSync(configPath, 'UTF-8'));