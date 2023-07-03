import { isPlayerReady, player } from './setup.js'
import { nextTick } from 'vue'

export const generateRandomColor = () => {
  const color = {}
  while (color.r > 170 || color.g > 170 || color.b > 170 || !color.r) {
    color.r = Math.floor(Math.random() * 256)
    color.g = Math.floor(Math.random() * 256)
    color.b = Math.floor(Math.random() * 256)
  }
  return color
}

export const performPlayerOperation = (operation, ...args) => {
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
