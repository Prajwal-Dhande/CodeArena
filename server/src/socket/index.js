const { Server } = require('socket.io')
const User = require('../models/User')

let io
const rooms = new Map() 
const matchmakingQueue = [] 
// Disconnect grace period timers
const disconnectTimers = new Map()


// ELO rank calculation (mirrors userController logic)
const RANKS = [
  { name: 'Bronze',   minElo: 0,    maxElo: 399 },
  { name: 'Silver',   minElo: 400,  maxElo: 799 },
  { name: 'Gold',     minElo: 800,  maxElo: 1199 },
  { name: 'Platinum', minElo: 1200, maxElo: 1799 },
  { name: 'Diamond',  minElo: 1800, maxElo: 2399 },
  { name: 'Master',   minElo: 2400, maxElo: Infinity },
]
const getRankName = (elo) => (RANKS.find(r => elo >= r.minElo && elo <= r.maxElo) || RANKS[0]).name

/**
 * Record a forfeit result in the database for both players.
 * Winner gets +15 ELO, loser gets -10 ELO.
 */
async function recordForfeitResult(winnerUsername, loserUsername) {
  try {
    const [winner, loser] = await Promise.all([
      User.findOne({ username: winnerUsername }),
      User.findOne({ username: loserUsername })
    ])

    // Skip if either player is a bot or not found
    if (!winner || !loser) return
    if (winnerUsername.startsWith('Bot_') || loserUsername.startsWith('Bot_')) return

    const winnerNewElo = Math.max(0, (winner.elo || 0) + 15)
    const loserNewElo = Math.max(0, (loser.elo || 0) - 10)

    // Update winner
    await User.findByIdAndUpdate(winner._id, {
      $set: {
        elo: winnerNewElo,
        peakElo: Math.max(winner.peakElo || 0, winnerNewElo),
        rank: getRankName(winnerNewElo),
        'stats.wins': (winner.stats?.wins || 0) + 1,
        'stats.totalBattles': (winner.stats?.totalBattles || 0) + 1,
        'stats.streak': (winner.stats?.streak || 0) + 1,
        'stats.maxStreak': Math.max(winner.stats?.maxStreak || 0, (winner.stats?.streak || 0) + 1),
      },
      $push: {
        matchHistory: {
          opponent: loserUsername, problem: 'Forfeit', result: 'win',
          eloChange: 15, eloAfter: winnerNewElo, rankAfter: getRankName(winnerNewElo),
          difficulty: 'Medium', timeTaken: 0, date: new Date()
        }
      }
    })

    // Update loser
    await User.findByIdAndUpdate(loser._id, {
      $set: {
        elo: loserNewElo,
        rank: getRankName(loserNewElo),
        'stats.losses': (loser.stats?.losses || 0) + 1,
        'stats.totalBattles': (loser.stats?.totalBattles || 0) + 1,
        'stats.streak': 0,
      },
      $push: {
        matchHistory: {
          opponent: winnerUsername, problem: 'Forfeit', result: 'loss',
          eloChange: -10, eloAfter: loserNewElo, rankAfter: getRankName(loserNewElo),
          difficulty: 'Medium', timeTaken: 0, date: new Date()
        }
      }
    })

    console.log(`📊 Forfeit recorded: ${winnerUsername} (+15) vs ${loserUsername} (-10)`)
  } catch (err) {
    console.error('Failed to record forfeit result:', err.message)
  }
}

function initSocket(server) {
  io = new Server(server, {
    cors: { 
      origin: [
        'http://localhost:5173', 
        'http://localhost:5174',
        'http://localhost:5175',
        'https://code-arena-virid.vercel.app',
        'https://nodeclash.in',
        'https://www.nodeclash.in'
      ], 
      methods: ['GET', 'POST'] 
    }
  })

  io.on('connection', (socket) => {
    console.log(`⚡ Connected: ${socket.id}`)

    // ✅ MATCHMAKING — smart problem selection for fair battles
    socket.on('find_match', ({ username, avatar, elo, problemSlug, mode, solvedProblems }) => {
      console.log(`🔍 ${username} looking for ${mode || 'quick_play'} match... (solved: ${(solvedProblems || []).length})`)

      const alreadyInQueue = matchmakingQueue.findIndex(p => p.username === username)
      if (alreadyInQueue !== -1) matchmakingQueue.splice(alreadyInQueue, 1)

      if (matchmakingQueue.length > 0) {
        const opponent = matchmakingQueue.shift()

        if (opponent.username === username) {
          matchmakingQueue.push(opponent)
          matchmakingQueue.push({ socket, username, avatar, elo, problemSlug, mode, solvedProblems })
          socket.emit('waiting_in_queue', { position: matchmakingQueue.length })
          return
        }

        const roomId = `room_${Date.now()}`
        const matchMode = mode || opponent.mode || 'quick_play'

        // Smart problem selection: find a problem NEITHER player has solved
        const pickFairProblem = async () => {
          try {
            const Problem = require('../models/Problem')
            const mySolved = new Set(solvedProblems || [])
            const oppSolved = new Set(opponent.solvedProblems || [])

            // Get all free (non-premium) active problems
            const allProblems = await Problem.find({ isActive: true, isPremium: { $ne: true } }).select('slug').lean()
            
            // Filter: problems unsolved by BOTH players
            const fairProblems = allProblems.filter(p => !mySolved.has(p.slug) && !oppSolved.has(p.slug))
            
            if (fairProblems.length > 0) {
              return fairProblems[Math.floor(Math.random() * fairProblems.length)].slug
            }

            // Fallback: problems unsolved by at least one player
            const partialFair = allProblems.filter(p => !mySolved.has(p.slug) || !oppSolved.has(p.slug))
            if (partialFair.length > 0) {
              return partialFair[Math.floor(Math.random() * partialFair.length)].slug
            }

            // Final fallback: any problem
            if (allProblems.length > 0) {
              return allProblems[Math.floor(Math.random() * allProblems.length)].slug
            }

            return 'contains-duplicate'
          } catch (err) {
            console.error('Fair problem selection failed:', err.message)
            return opponent.problemSlug || problemSlug || 'contains-duplicate'
          }
        }

        pickFairProblem().then(sharedProblemSlug => {
          console.log(`⚔️ Matched ${username} vs ${opponent.username} on problem: ${sharedProblemSlug}`)

          socket.join(roomId)
          opponent.socket.join(roomId)

          rooms.set(roomId, {
            players: [
              { username, avatar, socketId: socket.id },
              { username: opponent.username, avatar: opponent.avatar, socketId: opponent.socket.id }
            ],
            battleStarted: true,
            mode: matchMode
          })

          socket.emit('match_found', {
            roomId, problem: sharedProblemSlug, opponent: opponent.username, elo: opponent.elo, mode: matchMode, opponentAvatar: opponent.avatar
          })
          opponent.socket.emit('match_found', {
            roomId, problem: sharedProblemSlug, opponent: username, elo: elo, mode: matchMode, opponentAvatar: avatar
          })

          io.to(roomId).emit('battle_start', { players: rooms.get(roomId).players })
        })

      } else {
        matchmakingQueue.push({ socket, username, elo, problemSlug, mode, solvedProblems })
        socket.emit('waiting_in_queue', { position: matchmakingQueue.length })
      }
    })

    socket.on('cancel_match', () => {
      const idx = matchmakingQueue.findIndex(p => p.socket.id === socket.id)
      if (idx !== -1) matchmakingQueue.splice(idx, 1)
    })

    // ✅ ROOM JOIN & RECONNECTION
    socket.on('join_room', ({ roomId, username, avatar, isSpectator }) => {
      socket.join(roomId)

      if (!rooms.has(roomId)) {
        rooms.set(roomId, { players: [], spectators: [], battleStarted: false, mode: 'quick_play' })
      }
      
      const roomData = rooms.get(roomId)
      if (!roomData.spectators) roomData.spectators = [] // For backwards compatibility
      
      if (isSpectator) {
        const existingSpectator = roomData.spectators.find(s => s.username === username)
        if (existingSpectator) existingSpectator.socketId = socket.id
        else roomData.spectators.push({ username: username || `Spec_${socket.id.slice(0, 4)}`, socketId: socket.id })
        
        socket.emit('room_update', { players: roomData.players, count: roomData.players.length })
        if (roomData.battleStarted) socket.emit('battle_start', { players: roomData.players })
        return
      }

      const existingPlayer = roomData.players.find(p => p.username === username)
      
      if (existingPlayer) {
        existingPlayer.socketId = socket.id
        existingPlayer.avatar = avatar
        
        // Cancel disconnect grace timer if player reconnected
        if (disconnectTimers.has(username)) {
          clearTimeout(disconnectTimers.get(username))
          disconnectTimers.delete(username)
          console.log(`♻️ Player ${username} reconnected. Timer cancelled.`)
        }
      } else {
        if (roomData.players.length < 2) {
          roomData.players.push({ 
            username: username || `Player_${socket.id.slice(0, 4)}`, 
            avatar,
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

    socket.on('code_change', ({ roomId, code, username }) => {
      socket.to(roomId).emit('player_code_update', { username, code })
      socket.to(roomId).emit('opponent_code', { code }) // Fallback
    })

    socket.on('tests_update', ({ roomId, passed, total, username }) => {
      socket.to(roomId).emit('player_tests_update', { username, passed, total })
      socket.to(roomId).emit('opponent_tests', { passed, total }) // Fallback
    })

    socket.on('battle_won', ({ roomId, winner }) => {
      socket.to(roomId).emit('opponent_won', { winner })
      rooms.delete(roomId) 
    })

    // ✅ EXPLICIT FORFEIT — player intentionally leaves mid-battle
    socket.on('leave_match', ({ roomId, username }) => {
      console.log(`🏳️ ${username} forfeited from room ${roomId}`)
      const roomData = rooms.get(roomId)
      if (!roomData || !roomData.battleStarted) return

      const remaining = roomData.players.filter(p => p.username !== username)
      if (remaining.length === 1) {
        const winner = remaining[0]

        // Notify the remaining player immediately (no grace period for explicit quit)
        io.to(winner.socketId).emit('opponent_left_match', {
          winner: winner.username,
          loser: username,
          message: `${username} forfeited the match. You win!`
        })

        // Record the forfeit in the database with ELO changes
        recordForfeitResult(winner.username, username)
      }

      rooms.delete(roomId)
    })



    // ✅ DISCONNECT — unexpected connection loss (tab close, network drop)
    socket.on('disconnect', () => {
      console.log(`❌ Disconnected: ${socket.id}`)

      const qIdx = matchmakingQueue.findIndex(p => p.socket.id === socket.id)
      if (qIdx !== -1) matchmakingQueue.splice(qIdx, 1)

      rooms.forEach((roomData, roomId) => {
        const playerIndex = roomData.players.findIndex(p => p.socketId === socket.id)
        
        if (playerIndex !== -1) {
          const leavingPlayer = roomData.players[playerIndex]
          
          if (roomData.battleStarted) {
            // 15-second grace period for reconnection
            console.log(`⏳ Starting 15s grace period for ${leavingPlayer.username}...`)
            
            const timer = setTimeout(() => {
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

                  // Record the disconnect forfeit in the database
                  recordForfeitResult(winner.username, leavingPlayer.username)
                }
                rooms.delete(roomId)
              }
              disconnectTimers.delete(leavingPlayer.username)
            }, 15000)

            disconnectTimers.set(leavingPlayer.username, timer)
          } else {
            // Battle hadn't started — just remove the player
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