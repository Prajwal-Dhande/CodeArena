

let waitingPlayers = []; // Ye hamari queue hai

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Jab player "Quick Play" click kare
    socket.on('find_match', (playerData) => {
      // playerData = { userId, username, elo }
      console.log(`${playerData.username} is looking for a match with ELO ${playerData.elo}`);

      const ELO_THRESHOLD = 100; // Starting me +/- 100 ELO ka difference chalega
      let opponentIndex = -1;

      // Queue me check karo ki koi aas-paas ke ELO wala hai kya?
      for (let i = 0; i < waitingPlayers.length; i++) {
        const potentialOpponent = waitingPlayers[i];
        
        // Khud se match na ho jaye, isliye socket.id check karo
        if (potentialOpponent.socketId !== socket.id) {
          const eloDiff = Math.abs(potentialOpponent.elo - playerData.elo);
          
          if (eloDiff <= ELO_THRESHOLD) {
            opponentIndex = i;
            break; // Opponent mil gaya! Loop roko.
          }
        }
      }

      if (opponentIndex !== -1) {
        // MATCH FOUND!
        const opponent = waitingPlayers[opponentIndex];
        
        // Queue se opponent ko nikal do taaki wo kisi aur se match na ho
        waitingPlayers.splice(opponentIndex, 1);

        // Ek unique Battle Room ID banao
        const roomId = `battle_${Date.now()}`;

        // Dono players ko us room me join karao
        socket.join(roomId); // Current Player
        io.sockets.sockets.get(opponent.socketId)?.join(roomId); // Opponent

        // Dono players ko bata do ki match mil gaya hai
        io.to(roomId).emit('match_found', {
          roomId: roomId,
          players: [
            { username: playerData.username, elo: playerData.elo },
            { username: opponent.username, elo: opponent.elo }
          ],
          message: 'Get ready for the battle!'
        });

        console.log(`Match started: ${playerData.username} VS ${opponent.username}`);

      } else {
        // MATCH NOT FOUND YET -> Queue me add kar do
        waitingPlayers.push({
          socketId: socket.id,
          userId: playerData.userId,
          username: playerData.username,
          elo: playerData.elo,
          joinedAt: Date.now()
        });
        
        // Player ko bata do ki wo queue me hai
        socket.emit('waiting_in_queue', { message: 'Looking for an opponent...' });
      }
    });

    // Agar player beech me hi tab close kar de ya cancel kar de
    socket.on('disconnect', () => {
      waitingPlayers = waitingPlayers.filter(p => p.socketId !== socket.id);
      console.log(`User disconnected: ${socket.id}, removed from queue.`);
    });
  });
};