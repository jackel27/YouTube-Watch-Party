import { getSocket, player } from './setup.js'
import { updateUserList, userJoin, syncPlayerWithServer } from './functions.js'
import { useRoute } from 'vue-router'
import { performPlayerOperation } from './utility.js'
/* global YT */

const route = useRoute()

export const onConnect = () => {
  getSocket(route).on('connect', () => getSocket(route).emit('joinRoom', { room: { id: route.params.id }, user: { id: getSocket(route).id, nickname: route.params.nickname } }))
}

export const onUserList = () => {
  getSocket(route).on('userList', updateUserList)
}

export const onUserJoin = () => {
  getSocket(route).on('userJoin', userJoin)
}

export const onSync = () => {
  getSocket(route).on('sync', syncPlayerWithServer)
}

export const onPlayVideo = () => {
  getSocket(route).on('playVideo', (time) => {
    performPlayerOperation(player.value.seekTo, time)
    performPlayerOperation(player.value.playVideo)
  })
}

export const onPauseVideo = () => {
  getSocket(route).on('pauseVideo', (time) => {
    performPlayerOperation(player.value.seekTo, time)
    performPlayerOperation(player.value.pauseVideo)
  })
}

export const onSeekVideo = () => {
  getSocket(route).on('seekVideo', (time) => {
    performPlayerOperation(player.value.seekTo, time)
    if (player.value.getPlayerState() === YT.PlayerState.PLAYING) {
      player.value.playVideo()
    }
  })
}
