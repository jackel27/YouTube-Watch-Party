import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import 'jquery'
// import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap/dist/css/bootstrap.min.css'
// Create a Promise that will resolve when the YouTube iFrame API is ready
window.onYouTubeIframeAPIReadyPromise = new Promise((resolve) => {
  window.onYouTubeIframeAPIReady = () => {
    resolve()
  }
})

// Load the YouTube Iframe API
const tag = document.createElement('script')
tag.src = 'https://www.youtube.com/iframe_api'
const firstScriptTag = document.getElementsByTagName('script')[0]
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

createApp(App).use(router).mount('#app')
