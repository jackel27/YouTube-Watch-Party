// config.js
let API_URL = ''

if (process.env.NODE_ENV === 'production') {
  API_URL = 'https://8aaa-161-35-236-75.ngrok-free.app'
} else {
  API_URL = 'http://localhost:3000'
}

module.exports = {
  API_URL
}
