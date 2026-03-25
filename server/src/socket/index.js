const { Server } = require('socket.io')

let io
const rooms = new Map()
const matchmakingQueue = [] // ✅ Queue for matchmaking

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  })

  io.on('connection', (socket) => {
    console.log(`⚡ Connected: ${socket.id}`)

    // ✅ MATCHMAKING — queue system
    socket.on('find_match', ({ username, elo, problemSlug }) => {
      console.log(`🔍 ${username} looking for match...`)

      // Queue mein koi hai?
      if (matchmakingQueue.length > 0) {
        const opponent = matchmakingQueue.shift()

        // ✅ SAME room aur SAME problem dono ko
        const roomId = `room_${Date.now()}`
        const sharedProblem = opponent.problemSlug // pehle wale ka problem use karo

        // Dono ko same room mein daalo
        socket.join(roomId)
        opponent.socket.join(roomId)

        rooms.set(roomId, new Map([
          [socket.id, { username, socketId: socket.id }],
          [opponent.socket.id, { username: opponent.username, socketId: opponent.socket.id }]
        ]))

        console.log(`⚔️ Match found! ${username} vs ${opponent.username} in room ${roomId}`)

        // ✅ Dono ko SAME problem aur roomId bhejo
        socket.emit('match_found', {
          roomId,
          problem: sharedProblem,
          opponent: opponent.username
        })

        opponent.socket.emit('match_found', {
          roomId,
          problem: sharedProblem,
          opponent: username
        })

      } else {
        // Queue mein daalo — wait karo
        matchmakingQueue.push({
          socket,
          username,
          elo,
          problemSlug
        })
        socket.emit('waiting_in_queue', { position: matchmakingQueue.length })
        console.log(`⏳ ${username} added to queue (${matchmakingQueue.length} waiting)`)
      }
    })

    // Cancel matchmaking
    socket.on('cancel_match', () => {
      const idx = matchmakingQueue.findIndex(p => p.socket.id === socket.id)
      if (idx !== -1) {
        matchmakingQueue.splice(idx, 1)
        console.log(`❌ ${socket.id} cancelled matchmaking`)
      }
    })

    // Room join (direct)
    socket.on('join_room', ({ roomId, username }) => {
      socket.join(roomId)

      if (!rooms.has(roomId)) rooms.set(roomId, new Map())
      const room = rooms.get(roomId)
      room.set(socket.id, { username: username || `Player_${socket.id.slice(0, 4)}`, socketId: socket.id })

      io.to(roomId).emit('room_update', {
        players: Array.from(room.values()),
        count: room.size
      })

      if (room.size === 2) {
        io.to(roomId).emit('battle_start', {
          players: Array.from(room.values())
        })
      }
    })

    // Code sync
    socket.on('code_change', ({ roomId, code }) => {
      socket.to(roomId).emit('opponent_code', { code })
    })

    // Test progress
    socket.on('tests_update', ({ roomId, passed, total }) => {
      socket.to(roomId).emit('opponent_tests', { passed, total })
    })

    // Battle won
    socket.on('battle_won', ({ roomId, winner }) => {
      socket.to(roomId).emit('opponent_won', { winner })
      console.log(`🏆 ${winner} won in room: ${roomId}`)
      rooms.delete(roomId)
    })

    // Disconnect
    socket.on('disconnect', () => {
      // Queue se remove karo
      const idx = matchmakingQueue.findIndex(p => p.socket.id === socket.id)
      if (idx !== -1) matchmakingQueue.splice(idx, 1)

      // Rooms se remove karo
      rooms.forEach((room, roomId) => {
        if (room.has(socket.id)) {
          const player = room.get(socket.id)
          room.delete(socket.id)
          io.to(roomId).emit('player_left', {
            username: player.username,
            remaining: room.size
          })
          if (room.size === 0) rooms.delete(roomId)
        }
      })
      console.log(`❌ Disconnected: ${socket.id}`)
    })
  })

  return io
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized!')
  return io
}

module.exports = { initSocket, getIO }