require('dotenv').config();
const http = require("http");
const app = require("./src/app");
const { initSocket } = require("./src/socket/index");

const PORT = process.env.PORT || 5000;

// HTTP server banao Express ke upar
const server = http.createServer(app);

// Socket.io ko HTTP server se attach karo
initSocket(server);

// 🔥 Self-Ping Function (Render ko jagaye rakhne ke liye) 🔥
const keepAlive = () => {
  // Tera live Render URL (Health check endpoint)
  const url = 'https://codearena-njry.onrender.com/api/health';
  
  // Har 10 minute (10 * 60 * 1000 ms) mein server khud ko ping karega
  setInterval(async () => {
    try {
      const response = await fetch(url);
      console.log(`[Keep-Alive] Pinged server at ${new Date().toLocaleTimeString()} - Status: ${response.status}`);
    } catch (error) {
      console.error(`[Keep-Alive] Ping failed:`, error.message);
    }
  }, 10 * 60 * 1000); 
};

server.listen(PORT, () => {
  console.log(`🚀 Server successfully running on port ${PORT}`);
  keepAlive(); // Server start hote hi ping cycle shuru kar do
});