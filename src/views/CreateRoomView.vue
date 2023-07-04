<template>
  <div class="container">
    <h1 class="text-center mt-5">Create Room</h1>
    <div class="d-grid gap-2">
      <input type="text" v-model="nickname" class="form-control mt-4" placeholder="Enter nickname">
      <input type="text" v-model="videoUrl" class="form-control mt-4" placeholder="Enter YouTube video URL">
      <button @click="createRoom" class="btn btn-primary mt-4">Create Room</button>
    </div>
  </div>
</template>

<script>
// import { API_URL } from '@/config'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { v4 as uuidv4 } from 'uuid'
import io from 'socket.io-client'
export default {
  name: 'CreateRoomView',
  setup () {
    const socket = io()
    const router = useRouter()
    const videoUrl = ref('')
    const nickname = ref('')
    const createRoom = () => {
      const roomId = uuidv4()
      let videoId = ''

      if (videoUrl.value.includes('youtu.be/')) {
        // If the URL is of the form https://youtu.be/VideoID
        videoId = videoUrl.value.split('youtu.be/')[1]
      } else {
        // If the URL is of the form https://www.youtube.com/watch?v=VideoID
        videoId = new URLSearchParams(new URL(videoUrl.value).search).get('v')
      }

      if (videoId && nickname.value !== '') {
        // Emit 'create room' event to server with roomId and videoId
        socket.emit('create room', roomId, videoId, nickname, (response) => {
          // Check response from server
          if (response.status === 'success') {
            // After getting a success response from the server, you can navigate to the room
            router.push({ name: 'RoomView', params: { id: roomId, videoId, nickname: nickname.value } })
            // this.$router.push({ name: 'RoomView', params: { nickname: this.nickname } });
          } else {
            console.log('Error creating room: ', response.status)
          }
        })
      } else {
        console.log('Invalid YouTube URL')
      }
    }

    return {
      videoUrl,
      createRoom,
      nickname
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
  display: block;
  width: 80%;
  margin: 20px auto;
  padding: 10px;
}

button {
  display: block;
  margin: 20px auto;
  padding: 10px;
}
</style>
