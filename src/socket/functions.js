import { isPlayerReady, player, users, videoTitle, notificationMessage } from './setup.js'
import { performPlayerOperation, generateRandomColor } from './utility.js'
/* global YT */

export const syncPlayerWithServer = (syncTime, syncState) => {
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

export const showNotification = (message) => {
  notificationMessage.value.push(message)
  setTimeout(() => {
    notificationMessage.value = notificationMessage.value.filter(msg => msg !== message)
  }, 50000)
}

export const updateUserList = (userList) => {
  users.value = Object.entries(userList).map(([socketId, nickname]) => {
    const color = generateRandomColor()
    return { [socketId]: { nickname, color } }
  }).reduce((acc, user) => ({ ...acc, ...user }), {})
}

export const userJoin = (user) => {
  const currentState = player.value.getPlayerState()
  if (currentState === YT.PlayerState.PLAYING) {
    performPlayerOperation(player.value.pauseVideo)
    videoTitle.value = `${user.nickname} has joined the room`
    setTimeout(() => {
      videoTitle.value = ''
      performPlayerOperation(player.value.playVideo)
    }, 1000)
  } else {
    performPlayerOperation(player.value.playVideo)
    videoTitle.value = `${user.nickname} has joined the room`
    setTimeout(() => {
      videoTitle.value = ''
      performPlayerOperation(player.value.pauseVideo)
    }, 1000)
  }
}
