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
// import setup from '@/socket/setup'
// import { useRoute } from 'vue-router'
import { getRoute, setup } from '@/socket/setup'
export default {
  name: 'RoomView',
  setup () {
    const route = getRoute()
    const { player, users, videoTitle, roomIdCopyMessage } = setup(route.params.videoId)
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

    return {
      player,
      users,
      roomIdCopyMessage,
      copyRoomId,
      route, // And then return it so it becomes reactive and usable in the template
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
