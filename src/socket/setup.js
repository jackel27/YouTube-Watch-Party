import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import io from 'socket.io-client'
import { onSync, onPlayVideo, onPauseVideo, onSeekVideo, onConnect, onUserList, onUserJoin } from './listeners.js'
import { onPlayerStateChange, userJoin } from './functions.js'
import { performPlayerOperation } from './utility.js'
/* global YT */

export const player = ref(null)
export const users = ref({})
export const videoTitle = ref('')
export const roomIdCopyMessage = ref('')
export const isPlayerReady = ref(false)
export const isSyncing = ref(false)
export const isUserAction = ref(false)
const socket = io('http://localhost:3000')
export const getSocket = (route) => socket
export const getRoute = () => useRoute()
export function setup (videoId) { // Pass videoId as an argument
  onMounted(async () => {
    await window.onYouTubeIframeAPIReadyPromise

    player.value = await new YT.Player('player', {
      height: '390',
      width: '640',
      videoId: videoId, // Use it here
      events: {
        onStateChange: onPlayerStateChange,
        onReady: (event) => {
          isPlayerReady.value = true
          userJoin(event.target)
        },
        onError: (event) => {
          console.log('Error occurred', event.data)
        }
      }
    })

    onConnect()
    onUserList()
    onUserJoin()
    onSync()
    onPlayVideo()
    onPauseVideo()
    onSeekVideo()
  })

  return {
    player,
    users,
    videoTitle,
    roomIdCopyMessage,
    socket,
    performPlayerOperation
  }
}
