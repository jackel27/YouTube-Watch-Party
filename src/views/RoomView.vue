<template>
  <div class="container-fluid p-0 theater-bg">
    <div class="row min-vh-100 align-items-center m-0">
      <div class="col-lg-9 p-0">
        <div id="player" class="theater-screen mx-auto"></div>
        <div class="video-title text-center mt-3">{{ videoTitle }}</div>
      </div>
      <div id="audience" class="col-lg-3 bg-light d-flex flex-column justify-content-between">
        <div v-if="Object.keys(users).length" class="pt-3">
          <h2 class="text-center py-3">Audience</h2>
          <ul class="list-group pb-3">
            <li class="list-group-item" v-for="(user, socketId) in users" :key="socketId"  :style="{ color: 'rgb('+ user.color.r +', '+ user.color.g +', '+ user.color.b +')' }">
              {{ user.nickname }}
            </li>
          </ul>
        </div>
        <div class="align-self-center mb-3">
          <input class="mr-1" type="text" readonly :value="route.params.id" ref="roomId">
          <button class="btn btn-primary" @click="copyRoomId">Copy Room Id</button>
          <p>{{ roomIdCopyMessage }}</p>
        </div>
      </div>
    </div>
  </div>
  <div class="notification" v-for="(message, index) in notificationMessage" :key="index">
    {{ message }}
  </div>
</template>
<script>
import { API_URL } from '@/config'
/* global YT */
import { onMounted, ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import io from 'socket.io-client'

export default {
  name: 'RoomView',
  setup () {
    const users = ref({})
    const socket = io(API_URL)
    // const socket = io('http://10.0.0.10:3000')
    const player = ref(null)
    const route = useRoute()
    const isPlayerReady = ref(false)
    const isSyncing = ref(false)
    const isUserAction = ref(false)
    // const isSeeking = ref(false)
    const videoTitle = ref('')
    const roomIdCopyMessage = ref('')
    const notificationMessage = ref([])

    const showNotification = (message) => {
      console.log('showing notification: ', message)
      notificationMessage.value.push(message)
      setTimeout(() => {
        notificationMessage.value = notificationMessage.value.filter(msg => msg !== message)
      }, 5000)
    }
    socket.on('userJoin', (user) => {
      if (user.nickname === route.params.nickname || !user.nickname) {
        return
      }
      showNotification(`${user.nickname} joined the room`)
    })
    // Function to sync the player with server's state and time
    const syncPlayerWithServer = (syncTime, syncState) => {
      if (!isPlayerReady.value) {
        return
      }

      const currentTime = player.value.getCurrentTime()
      const timeDifference = Math.abs(currentTime - syncTime)

      if (syncState === YT.PlayerState.PLAYING) {
        if (timeDifference > 1) {
          performPlayerOperation(player.value.seekTo, syncTime)
        }
        performPlayerOperation(player.value.playVideo)
      } else if (syncState === YT.PlayerState.PAUSED) {
        if (timeDifference > 1) {
          performPlayerOperation(player.value.seekTo, syncTime)
        }
        performPlayerOperation(player.value.pauseVideo)
      }
    }
    const generateRandomColor = () => {
      const color = {}
      while (color.r > 170 || color.g > 170 || color.b > 170 || !color.r) {
        color.r = Math.floor(Math.random() * 256)
        color.g = Math.floor(Math.random() * 256)
        color.b = Math.floor(Math.random() * 256)
      }
      return color
    }
    const getUsersTitleAndRandomColor = (userList) => {
      return Object.entries(userList).map(([socketId, nickname]) => {
        const color = generateRandomColor()
        return { [socketId]: { nickname, color } }
      }).reduce((acc, user) => ({ ...acc, ...user }), {})
    }
    const updateUserList = (userList) => {
      console.log('userlist is: ', userList)
      // users.value = { ...userList }
      users.value = getUsersTitleAndRandomColor(userList)
      console.log('users are now: ', users.value)
    }
    const copyRoomId = async () => {
      try {
        await navigator.clipboard.writeText(route.params.id)
        roomIdCopyMessage.value = 'Copied!'
        setTimeout(() => {
          roomIdCopyMessage.value = ''
        }, 2000)
      } catch (err) {
        console.error('Failed to copy room ID: ', err)
      }
    }
    const getUserList = () => {
      socket.emit('getUsers', route.params.id)
    }
    // Moved socket.on('connect', ...) and socket.on('userList', ...) here
    socket.on('userList', updateUserList)
    socket.on('connect', () => {
      console.log('user', socket.id, 'connected ', route.params.nickname, socket)
      socket.emit('joinRoom', { room: { id: route.params.id }, user: { id: socket.id, nickname: route.params.nickname } })
    })

    // Function to check if the player is ready before performing an operation
    const performPlayerOperation = (operation, ...args) => {
      if (isPlayerReady.value) {
        nextTick(() => {
          if (player.value) {
            operation.apply(player.value, args)
          }
        })
      } else {
        console.warn('Tried to perform operation on player before it was ready')
      }
    }

    // Function to handle player events
    const onPlayerStateChange = (event) => {
      const currentTime = player.value.getCurrentTime()
      const roomId = route.params.id
      const videoState = player.value.getPlayerState()

      if (!isSyncing.value) {
        socket.emit('sync', roomId, currentTime, videoState)
      }

      isUserAction.value = false
    }
    const userJoin = () => {
      socket.on('userJoin', async (user) => {
        await isPlayerReady.value
        const currentState = player.value.getPlayerState()
        console.log('user nickname is: ', user.nickname)
        if (currentState === YT.PlayerState.PLAYING) {
          // If video is currently playing, pause it, show message and play it again after 1 sec
          performPlayerOperation(player.value.pauseVideo)
          videoTitle.value = `${user.nickname} has joined the room`
          setTimeout(() => {
            videoTitle.value = '' // Clear the message
            performPlayerOperation(player.value.playVideo)
          }, 1000)
        } else {
          // If video is currently paused, play it, show message and pause it again after 1 sec
          performPlayerOperation(player.value.playVideo)
          videoTitle.value = `${user.nickname} has joined the room`
          setTimeout(() => {
            videoTitle.value = '' // Clear the message
            performPlayerOperation(player.value.pauseVideo)
          }, 1000)
        }
      })
    }
    onMounted(async () => {
      // socket.on('sync', syncPlayerWithServer)
      socket.on('sync', async (syncTime, syncState) => {
        await isPlayerReady.value
        if (!isPlayerReady.value) {
          return
        }
        syncPlayerWithServer(syncTime, syncState)
        const currentTime = player.value.getCurrentTime()
        const timeDifference = Math.abs(currentTime - syncTime)

        if (syncState === YT.PlayerState.PLAYING) {
          if (timeDifference > 1) {
            performPlayerOperation(player.value.seekTo, syncTime)
          }
          performPlayerOperation(player.value.playVideo)
        } else if (syncState === YT.PlayerState.PAUSED) {
          if (timeDifference > 1) {
            performPlayerOperation(player.value.seekTo, syncTime)
          }
          performPlayerOperation(player.value.pauseVideo)
        }
      })

      await window.onYouTubeIframeAPIReadyPromise

      socket.on('playVideo', (time) => {
        performPlayerOperation(player.value.seekTo, time)
        performPlayerOperation(player.value.playVideo)
        setTimeout(() => {
          isSyncing.value = false
          isUserAction.value = false
        }, 10)
      })

      socket.on('pauseVideo', (time) => {
        performPlayerOperation(player.value.seekTo, time)
        performPlayerOperation(player.value.pauseVideo)
      })

      socket.on('seekVideo', (time) => {
        performPlayerOperation(player.value.seekTo, time)
        if (player.value.getPlayerState() === YT.PlayerState.PLAYING) {
          player.value.playVideo()
        }
      })

      player.value = await new YT.Player('player', {
        height: '390',
        width: '640',
        videoId: route.params.videoId,
        events: {
          onStateChange: onPlayerStateChange,
          onReady: (event) => {
            console.log('Player is ready')
            isPlayerReady.value = true
            player.value = event.target
            userJoin()
            // Removed performPlayerOperation(player.value.playVideo)
            getUserList()
          },
          onError: (event) => {
            console.log('Error occurred', event.data)
          }
        }
      })
    })
    return {
      player,
      users,
      roomIdCopyMessage,
      copyRoomId,
      route,
      videoTitle
    }
  }
}
</script>

<style scoped>
.notification {
  position: fixed;
  top: 10px;
  right: 10px;
  z-index: 1000;
}
.theater-bg {
  background-image: url('https://img.freepik.com/free-vector/theater-cinema-curtains-with-focus-light-vector-illustration_1017-38346.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.theater-screen {
  background-color: #000;
  width: 90%;
  height: 60vh;
  margin-top: 5vh;
}
.video-title {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  font-size: 2rem;
  color: #fff;
  z-index: 99999;
}
</style>
