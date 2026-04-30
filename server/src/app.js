require('dotenv').config()
const express = require('express')
const cors = require('cors')
const connectDB = require('./config/db')
const authRoutes = require('./routes/auth')
const codeRoutes = require('./routes/code')
const problemRoutes = require('./routes/problems')

// 🔥 NAYI LINE: Apna naya userroutes import kar (VS Code ke hisaab se tera file name 'userroutes' hai lowercase mein)
const userRoutes = require('./routes/userroutes')

// 🔥 PREMIUM PAYMENT ROUTE
const paymentRoutes = require('./routes/paymentRoutes')

connectDB()

const app = express()

// 👇🔥 YAHAN HUA HAI ASLI FIX (CORS UPDATE) 🔥👇
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', // Added in case Vite runs on 5174
    'https://code-arena-virid.vercel.app' // Tera Vercel URL yahan allow ho gaya!
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}))
// 👆🔥 YAHAN HUA HAI ASLI FIX (CORS UPDATE) 🔥👆

app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/code', codeRoutes)
app.use('/api/problems', problemRoutes)

// 🔥 NAYI LINE: Yahan /api/users ko apne naye router se connect kar de
app.use('/api/users', userRoutes)
app.use('/api/ai', require('./routes/aiRoutes'))

// 👇 BAAKI ROUTES KE SAATH YE NAYA ROUTE ADD KAR DE 👇
app.use('/api/puzzles', require('./routes/puzzleRoutes'));

app.use('/api/payment', paymentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CodeArena server is alive 🔥' })
})

module.exports = app