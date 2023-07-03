import { createRouter, createWebHashHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import CreateRoomView from '@/views/CreateRoomView.vue'
import RoomView from '@/views/RoomView.vue'

const routes = [
  {
    path: '/',
    name: 'HomeView',
    component: HomeView
  },
  {
    path: '/create-room',
    name: 'CreateRoomView',
    component: CreateRoomView
  },
  {
    path: '/room/:id/:videoId/:nickname', // Changed here
    name: 'RoomView',
    component: RoomView,
    props: true
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
