const { Server } = require('socket.io')

let io
const rooms = new Map() 
const matchmakingQueue = [] 
// 🔥 Naya Object Disconnect Timers ko track karne ke liye
const disconnectTimers = new Map()

function initSocket(server) {
  io = new Server(server, {
    cors: { 
      origin: [
        'http://localhost:5173', 
        'https://code-arena-virid.vercel.app'
      ], 
      methods: ['GET', 'POST'] 
    }
  })

  io.on('connection', (socket) => {
    console.log(`⚡ Connected: ${socket.id}`)

    // ✅ MATCHMAKING 
    socket.on('find_match', ({ username, elo, problemSlug }) => {
      console.log(`🔍 ${username} looking for match...`)

      const alreadyInQueue = matchmakingQueue.findIndex(p => p.username === username)
      if (alreadyInQueue !== -1) matchmakingQueue.splice(alreadyInQueue, 1)

      if (matchmakingQueue.length > 0) {
        const opponent = matchmakingQueue.shift()

        if (opponent.username === username) {
          matchmakingQueue.push(opponent)
          matchmakingQueue.push({ socket, username, elo, problemSlug })
          socket.emit('waiting_in_queue', { position: matchmakingQueue.length })
          return
        }

        const roomId = `room_${Date.now()}`
        const sharedProblemSlug = opponent.problemSlug || problemSlug || 'two-sum'

        socket.join(roomId)
        opponent.socket.join(roomId)

        rooms.set(roomId, {
          players: [
            { username, socketId: socket.id },
            { username: opponent.username, socketId: opponent.socket.id }
          ],
          battleStarted: true
        })

        socket.emit('match_found', {
          roomId, problem: sharedProblemSlug, opponent: opponent.username, elo: opponent.elo 
        })
        opponent.socket.emit('match_found', {
          roomId, problem: sharedProblemSlug, opponent: username, elo: elo 
        })

        io.to(roomId).emit('battle_start', { players: rooms.get(roomId).players })

      } else {
        matchmakingQueue.push({ socket, username, elo, problemSlug })
        socket.emit('waiting_in_queue', { position: matchmakingQueue.length })
      }
    })

    socket.on('cancel_match', () => {
      const idx = matchmakingQueue.findIndex(p => p.socket.id === socket.id)
      if (idx !== -1) matchmakingQueue.splice(idx, 1)
    })

    // ✅ ROOM JOIN FIX & RECONNECTION LOGIC
    socket.on('join_room', ({ roomId, username }) => {
      socket.join(roomId)

      if (!rooms.has(roomId)) {
        rooms.set(roomId, { players: [], battleStarted: false })
      }
      
      const roomData = rooms.get(roomId)
      
      const existingPlayer = roomData.players.find(p => p.username === username)
      
      if (existingPlayer) {
        // Player reconnected after refresh!
        existingPlayer.socketId = socket.id
        
        // 🔥 Agar koi disconnect timer chal raha tha is user ka, usko radd (clear) kar do
        if (disconnectTimers.has(username)) {
          clearTimeout(disconnectTimers.get(username))
          disconnectTimers.delete(username)
          console.log(`♻️ Player ${username} reconnected. Timer cancelled.`)
        }
      } else {
        if (roomData.players.length < 2) {
          roomData.players.push({ 
            username: username || `Player_${socket.id.slice(0, 4)}`, 
            socketId: socket.id 
          })
        }
      }

      io.to(roomId).emit('room_update', {
        players: roomData.players, count: roomData.players.length
      })

      if (roomData.players.length === 2 && !roomData.battleStarted) {
        roomData.battleStarted = true
        io.to(roomId).emit('battle_start', { players: roomData.players })
      }
    })

    socket.on('code_change', ({ roomId, code }) => {
      socket.to(roomId).emit('opponent_code', { code })
    })

    socket.on('tests_update', ({ roomId, passed, total }) => {
      socket.to(roomId).emit('opponent_tests', { passed, total })
    })

    socket.on('battle_won', ({ roomId, winner }) => {
      socket.to(roomId).emit('opponent_won', { winner })
      rooms.delete(roomId) 
    })

    socket.on('disconnect', () => {
      console.log(`❌ Disconnected: ${socket.id}`)

      const qIdx = matchmakingQueue.findIndex(p => p.socket.id === socket.id)
      if (qIdx !== -1) matchmakingQueue.splice(qIdx, 1)

      rooms.forEach((roomData, roomId) => {
        const playerIndex = roomData.players.findIndex(p => p.socketId === socket.id)
        
        if (playerIndex !== -1) {
          const leavingPlayer = roomData.players[playerIndex]
          
          if (roomData.battleStarted) {
            // 🔥 TURANT MATCH END MAT KARO. 15 SECOND WAIT KARO.
            console.log(`⏳ Starting 15s grace period for ${leavingPlayer.username}...`)
            
            const timer = setTimeout(() => {
              // 15 second baad bhi nahi aaya
              const finalRoomData = rooms.get(roomId)
              if (finalRoomData) {
                const remainingPlayers = finalRoomData.players.filter(p => p.username !== leavingPlayer.username)
                
                if (remainingPlayers.length === 1) {
                  const winner = remainingPlayers[0]
                  io.to(winner.socketId).emit('opponent_left_win', {
                    winner: winner.username,
                    loser: leavingPlayer.username,
                    message: `${leavingPlayer.username} disconnected and didn't return. You win!`
                  })
                }
                rooms.delete(roomId)
              }
              disconnectTimers.delete(leavingPlayer.username)
            }, 15000) // 15 seconds

            disconnectTimers.set(leavingPlayer.username, timer)
          } else {
            // Battle start nahi hui thi, seedha nikal do
            const remainingPlayers = roomData.players.filter(p => p.socketId !== socket.id)
            roomData.players = remainingPlayers
            if (remainingPlayers.length === 0) {
              rooms.delete(roomId)
            } else {
              io.to(roomId).emit('player_left', { username: leavingPlayer.username })
              io.to(roomId).emit('room_update', { players: remainingPlayers })
            }
          }
        }
      })
    })
  })

  return io
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized!')
  return io
}

module.exports = { initSocket, getIO }