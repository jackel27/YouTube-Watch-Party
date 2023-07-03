<template>
  <div class="container">
    <h1 class="text-center mt-5">Welcome to YouTube Watch Party!</h1>
    <div class="d-grid gap-2">
      <input v-model="nickname" type="text" class="form-control mt-4" placeholder="Enter nickname">
      <input v-model="roomId" type="text" class="form-control mt-4" placeholder="Enter room ID">
      <button @click="joinRoom" class="btn btn-primary mt-4">Join Room</button>
      <router-link to="/create-room" class="btn btn-link mt-4">Or Create A New Room</router-link>
    </div>
  </div>
</template>

<script>
import { API_URL } from '@/config'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios' // You'll need to install axios if you haven't already
import io from 'socket.io-client'

export default {
  name: 'HomeView',
  setup () {
    const socket = io(API_URL)
    const roomId = ref('')
    const router = useRouter()
    const nickname = ref('')
    const joinRoom = async () => {
      if (roomId.value !== '' && nickname.value !== '') {
        try {
          const response = await axios.get(`${API_URL}/rooms/${roomId.value}`) // replace with your server URL
          if (response.data.exists) {
            socket.emit('join room', roomId.value, nickname.value) // Pass nickname to server
            router.push({ name: 'RoomView', params: { id: roomId.value, videoId: response.data.videoId, nickname: nickname.value } })
          } else {
            console.log('Room does not exist')
          }
        } catch (error) {
          console.log('Error occurred while trying to join the room', error)
        }
      }
    }

    return {
      nickname,
      roomId,
      joinRoom
    }
  }
}
</script>

<style scoped>
h1 {
  font-size: 2em;
  text-align: center;
  color: #333;
}
input {
  margin-right: 10px;
}
</style>
