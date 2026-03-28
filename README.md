# ⚔️ CodeArena | Next-Gen Multiplayer Coding Battleground

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)

CodeArena is a high-octane, real-time multiplayer competitive coding platform. It brings the thrill of head-to-head coding battles, an integrated AI Interviewer for dynamic constraints, and a highly competitive ELO-based ranking system. 

Built for developers to sharpen their Data Structures & Algorithms (DSA) and problem-solving skills under pressure.

---

## 🔥 Key Features

* **⚔️ Real-Time 1v1 Battles:** Compete against other developers in real-time. Seamless synchronization of test cases, live opponent progress tracking, and instant win/loss detection using **Socket.io**.
* **🤖 AI Interviewer (Dynamic Constraints):** The game changes mid-battle! Powered by **Groq API** and **Google Gemini API**, the AI acts as an interviewer, analyzing your code and injecting custom constraints (e.g., "Now solve it without built-in methods!") to test true adaptability.
* **🏆 Global ELO Ranking System:** Start at Bronze and climb your way up to Grandmaster. A fully functional Matchmaking and ELO rating algorithm dynamically updates your rank and stats based on the problem's difficulty and match outcome.
* **🧠 Practice Mode:** Warm up against an AI Bot before jumping into live ranked matches.
* **💻 Advanced In-Browser Editor:** Integrated with **Monaco Editor** (the engine behind VS Code), supporting multiple languages (JavaScript, Python, C++, Java) with syntax highlighting, auto-complete, and dark mode.

---

## 🛠️ Tech Stack

**Frontend:**
* React.js 
* Vite
* Monaco Editor (`@monaco-editor/react`)
* React Router DOM

**Backend:**
* Node.js & Express.js
* Socket.io (Real-time bidirectional communication)
* JWT (JSON Web Tokens) for Authentication

**Database:**
* MongoDB (Mongoose ODM)

**AI Integration:**
* Google Gemini API
* Groq API

---

## 📂 Project Architecture

CODE ARENA/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # BattleRoom, Timer, WinnerScreen, etc.
│   │   ├── App.jsx
│   │   └── main.jsx
├── server/                 # Node.js Backend
│   ├── src/
│   │   ├── config/         # DB and Env config
│   │   ├── controllers/    # API logic (auth, users, match updates)
│   │   ├── middleware/     # JWT Auth guards
│   │   ├── models/         # Mongoose Schemas (User, Problem)
│   │   ├── routes/         # Express API Routes
│   │   └── services/       # Core Business Logic
│   │       ├── aiService.js    # Gemini/Groq AI Handlers
│   │       ├── codeService.js  # Code execution engine
│   │       └── emailService.js # OTP/Verification emails
│   ├── socket/             # Socket.io event handlers
│   ├── .env                # Environment Variables
│   └── server.js           # Main Entry Point
└── README.md

---

## 🚀 Installation & Setup

Want to run CodeArena locally? Follow these steps:

### 1. Clone the repository
git clone https://github.com/your-username/codearena.git
cd codearena

### 2. Backend Setup
cd server
npm install

Create a `.env` file in the `server` directory and add the following keys:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_google_gemini_api_key

Start the backend server:
npm run dev

### 3. Frontend Setup
Open a new terminal and navigate to the client folder:
cd client
npm install

Start the React application:
npm run dev

---

## 👨‍💻 Author

**Prajwal Dhande**
* B.Tech Artificial Intelligence Student
* Passionate about building scalable full-stack architectures and real-time systems.

---
⭐ **If you like this project, don't forget to give it a star on GitHub!** ⭐

