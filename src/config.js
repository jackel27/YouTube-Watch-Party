// config.js
let API_URL = ''

if (process.env.NODE_ENV === 'production') {
  API_URL = 'https://seven-donuts-add.loca.lt'
} else {
  API_URL = 'http://localhost:3000'
}

module.exports = {
  API_URL
}
