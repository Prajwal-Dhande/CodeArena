require('dotenv').config()
const http = require("http");
const app = require("./src/app");
const { initSocket } = require("./src/socket/index");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

// HTTP server banao Express ke upar
const server = http.createServer(app);

// Socket.io ko HTTP server se attach karo
initSocket(server);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});