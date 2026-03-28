<div align="center">

  <img src="https://capsule-render.vercel.app/api?type=waving&color=timeGradient&height=250&section=header&text=CodeArena&fontSize=80&fontAlignY=35&desc=Next-Gen%20Multiplayer%20Coding%20Battleground&descAlignY=55&descAlign=50" alt="CodeArena Banner" />

  <br />

  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)
  ![Gemini](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white)

  <h3>LeetCode meets Mortal Kombat ⚔️</h3>
  <p>Compete in real-time. Survive AI constraints. Climb the global leaderboard.</p>

</div>

---

## 🚀 What is CodeArena?

CodeArena is a high-octane, real-time multiplayer competitive coding platform. Think of it as a battleground where developers go head-to-head to solve Data Structures & Algorithms (DSA) problems. But there's a twist: **An AI Interviewer is watching**. 

Mid-battle, the AI analyzes your code and injects dynamic, real-time constraints (e.g., *"Solve this without using any built-in methods!"*), pushing your adaptability and problem-solving skills to the absolute limit.

---

## 🔥 Epic Features

| Feature | Description |
| :--- | :--- |
| **⚔️ Live 1v1 Battles** | Real-time matchmaking and bidirectional code execution powered by Socket.io. See your opponent's progress live. |
| **🤖 AI Interviewer** | Integrated with **Groq** & **Google Gemini API** to analyze code logic and throw sudden constraints mid-game. |
| **🏆 ELO Ranking System** | A highly competitive global leaderboard. Start at `Bronze` and fight your way up to `Grandmaster` (4000+ ELO). |
| **💻 Pro-Grade Editor** | Embedded **Monaco Editor** (the engine behind VS Code). Supports JavaScript, Python, C++, and Java with auto-complete. |
| **🧠 Practice Mode** | Not ready for ranked? Spar against a smart AI Bot to warm up your logic before hitting the live arena. |

---

## 🛠️ The Architecture

A clean, decoupled, and highly scalable architecture built for speed and real-time synchronization.

```text
CODE ARENA/
├── 🌐 client/                 # React, Vite, Monaco Editor
│   └── src/components/        # BattleRoom, Timer, WinnerScreen 
└── ⚙️ server/                 # Node.js, Express, Socket.io
    ├── controllers/           # Auth, User Stats, ELO Match Updates
    ├── models/                # MongoDB Schemas (User, Problem)
    ├── services/              # AI Logic (Gemini/Groq), Code Execution
    └── socket/                # Real-time game state management
```

---

## 💻 Local Installation & Setup

Want to run the battleground on your local machine? Let's get you set up.

### 1. Clone & Install
```bash
git clone [https://github.com/Prajwal-Dhande/CodeArena.git](https://github.com/Prajwal-Dhande/CodeArena.git)
cd CodeArena
```

### 2. Ignite the Backend
```bash
cd server
npm install
```
Create a `.env` file in the `/server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_google_gemini_api_key
```
Start the server:
```bash
npm run dev
```

### 3. Launch the Frontend
Open a new terminal window:
```bash
cd client
npm install
npm run dev
```
Navigate to `http://localhost:5173` and enter the arena.

---

## 👨‍💻 Meet the Architect

**Prajwal Dhande**
> B.Tech Artificial Intelligence Student | Full-Stack & AI Developer
> Building scalable architectures and real-time systems that push the boundaries of the web.

---

<div align="center">
  <b>If you like this project or found it helpful, drop a ⭐ on the repository!</b>
</div>