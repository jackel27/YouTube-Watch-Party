// server.js
const express = require('express')
const http = require('http')
const socketIo = require('socket.io')
const app = express()
const server = http.createServer(app)
const io = socketIo(server)

const rooms = {} // Room storage
const roomIntervals = {}
io.on('connection', (socket) => {
  console.log('A user connected with id:', socket.id)
  // Handle periodic syncing from clients
  socket.on('sync', (roomId, videoTime, videoState) => {
    if (rooms[roomId]) {
      rooms[roomId].currentTime = videoTime
      rooms[roomId].videoState = videoState
      // Broadcast the updated state and time to all clients in the room
      socket.broadcast.in(roomId).emit('sync', rooms[roomId].currentTime, rooms[roomId].videoState)
    }
  })

  socket.on('getUsers', (roomId) => {
    if (rooms[roomId]) {
      socket.emit('userList', rooms[roomId].users)
    }
  })
  // Handle room joining
  socket.on('joinRoom', (data) => {
    const { room, user } = data
    const roomId = room.id
    const userId = user.id
    const nickname = user.nickname
    console.log('data', data)

    console.log(`User ${nickname} is trying to join room ${roomId} with socket id: ${userId}`)

    // Check if the room exists
    if (rooms[roomId]) {
      // Add the user to the room
      rooms[roomId].users[userId] = nickname

      // Send the updated user list to all clients in the room
      console.log('here are the users... ', rooms[roomId].users)
      io.to(roomId).emit('userList', rooms[roomId].users)
      socket.join(roomId)
      socket.emit('sync', rooms[roomId].currentTime, rooms[roomId].videoState)
      io.to(roomId).emit('userJoin', { nickname: nickname })
      // Join the socket to the room
    } else {
      console.log(`Room ${roomId} does not exist`)
      // Emit a custom event to the client to handle this error
      socket.emit('error', `Room ${roomId} does not exist`)
    }
  })

  // Handle room leaving
  socket.on('disconnect', () => {
    console.log('user disconnected')
    for (const roomId in rooms) {
      if (rooms[roomId].users[socket.id]) {
        delete rooms[roomId].users[socket.id]
        if (Object.keys(rooms[roomId].users).length === 0) {
          delete rooms[roomId]
        } else {
          socket.broadcast.in(roomId).emit('userList', rooms[roomId].users) // send updated user list to room
        }
      }
    }
  })

  // Handle creating a room
  socket.on('create room', (roomId, videoUrl, nickname, callback) => {
    console.log(`Creating room ${roomId} with video ${videoUrl}`)
    console.log('nickname', nickname)
    if (!rooms[roomId]) {
      rooms[roomId] = {
        videoUrl,
        currentTime: 0,
        isPlaying: false,
        chat: [],
        users: {
          [socket.id]: nickname
        } // Make sure to initialize the users object
      }
      console.log('Room created', rooms[roomId])
      io.to(roomId).emit('userList', rooms[roomId].users)
      // eslint-disable-next-line node/no-callback-literal
      callback({ status: 'success' }) // Callback to client that room is created
    } else {
      console.log('Room already exists')
      // eslint-disable-next-line node/no-callback-literal
      callback({ status: 'Room already exists' }) // Callback to client with error
    }
  })

  // Handle video play event
  // Handle video play event
  socket.on('playVideo', (roomId, time) => {
    console.log(`Playing video in room ${roomId}`)
    if (rooms[roomId]) {
      rooms[roomId].currentTime = time
      rooms[roomId].videoState = 1 // 1 corresponds to PLAYING state in YouTube Player API
      // Broadcast the updated state and time to all clients in the room
      socket.broadcast.in(roomId).emit('sync', rooms[roomId].currentTime, rooms[roomId].videoState)
    }
  })

  // Handle video pause event
  socket.on('pauseVideo', (roomId, time) => {
    console.log(`Pausing video in room ${roomId}`)
    if (rooms[roomId]) {
      rooms[roomId].currentTime = time
      rooms[roomId].videoState = 2 // 2 corresponds to PAUSED state in YouTube Player API
      // Broadcast the updated state and time to all clients in the room
      socket.broadcast.in(roomId).emit('sync', rooms[roomId].currentTime, rooms[roomId].videoState)
    }
  })

  // Handle seeking the video
  socket.on('seekVideo', (roomId, currentTime) => {
    console.log(`Seeking video in room ${roomId}`)
    if (rooms[roomId]) {
      rooms[roomId].currentTime = currentTime
      socket.broadcast.in(roomId).emit('seekVideo', currentTime)
    }
  })

  // Handle a user disconnecting
  // Clear interval on disconnect
  socket.on('disconnect', () => {
    console.log('user disconnected')
    for (const roomId in rooms) {
      if (rooms[roomId].users[socket.id]) {
        delete rooms[roomId].users[socket.id]
        if (Object.keys(rooms[roomId].users).length === 0) {
          delete rooms[roomId]
          clearInterval(roomIntervals[roomId])
          delete roomIntervals[roomId]
        }
      }
    }
  })
})
app.get('/rooms/:roomId', (req, res) => {
  console.log('rooms', rooms)
  const { roomId } = req.params
  console.log('Getting room, roomId', roomId)
  if (!rooms[roomId]) {
    return res.status(404).send({ exists: false })
  }
  return res.json({ exists: true, videoId: rooms[roomId].videoUrl })
})

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const port = process.env.PORT || 3000
server.listen(port, () => console.log(`Server is running on port ${port}`))
