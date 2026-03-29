const { Server } = require('socket.io')

let io
// ✅ Naya Structure: rooms.set(roomId, { players: [{username, socketId}], battleStarted: false })
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

        // ✅ Naya Object based room structure
        rooms.set(roomId, {
          players: [
            { username, socketId: socket.id },
            { username: opponent.username, socketId: opponent.socket.id }
          ],
          battleStarted: true // Matchmaking se 2 log direct aaye hain
        })

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
        
        // Dono ko start event bhej do
        io.to(roomId).emit('battle_start', {
          players: rooms.get(roomId).players
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

    // Room join (direct / practice / lobby invite)
    socket.on('join_room', ({ roomId, username }) => {
      socket.join(roomId)

      // ✅ Update room structure
      if (!rooms.has(roomId)) {
        rooms.set(roomId, { players: [], battleStarted: false })
      }
      
      const roomData = rooms.get(roomId)
      const existingPlayer = roomData.players.find(p => p.socketId === socket.id)
      
      if (!existingPlayer) {
        roomData.players.push({ 
          username: username || `Player_${socket.id.slice(0, 4)}`, 
          socketId: socket.id 
        })
      }

      io.to(roomId).emit('room_update', {
        players: roomData.players,
        count: roomData.players.length
      })

      // ✅ Track battleStarted
      if (roomData.players.length === 2) {
        roomData.battleStarted = true  // ✅ Track karo
        io.to(roomId).emit('battle_start', {
          players: roomData.players
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
      rooms.delete(roomId) // Clean up room after win
    })

    // ✅ DISCONNECT LOGIC (Updated with your requirements)
    socket.on('disconnect', () => {
      console.log(`❌ Disconnected: ${socket.id}`)

      // Queue se remove karo
      const qIdx = matchmakingQueue.findIndex(p => p.socket.id === socket.id)
      if (qIdx !== -1) matchmakingQueue.splice(qIdx, 1)

      // ✅ Find which room this socket was in
      rooms.forEach((roomData, roomId) => {
        const playerIndex = roomData.players.findIndex(p => p.socketId === socket.id)
        
        if (playerIndex !== -1) {
          const leavingPlayer = roomData.players[playerIndex]
          const remainingPlayers = roomData.players.filter(p => p.socketId !== socket.id)
          
          // ✅ Agar match chal rahi thi aur ek player bacha hai
          if (remainingPlayers.length === 1 && roomData.battleStarted) {
            const winner = remainingPlayers[0]
            
            // ✅ Winner ko notify karo
            io.to(winner.socketId).emit('opponent_left_win', {
              winner: winner.username,
              loser: leavingPlayer.username,
              message: `${leavingPlayer.username} left the battle. You win!`
            })
            
            console.log(`🏆 ${winner.username} wins — ${leavingPlayer.username} left room ${roomId}`)
          }

          // Update room
          roomData.players = remainingPlayers
          if (remainingPlayers.length === 0) {
            rooms.delete(roomId)
          } else {
            // Notify remaining players
            io.to(roomId).emit('player_left', { username: leavingPlayer.username })
            io.to(roomId).emit('room_update', { players: remainingPlayers })
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