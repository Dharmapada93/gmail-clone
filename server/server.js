require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { startCronJobs } = require('./services/cronService');

// Initialize Express
const app = express();
const server = http.createServer(app);

// Connect to Database
connectDB();

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'] // Allow both for better compatibility
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Pass io to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/emails', require('./routes/emailRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

// Socket.IO Logic
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  socket.on('join_room', (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start Cron Jobs
console.log('Initializing cron scheduler...');
startCronJobs(io);

// Export for Vercel if needed
if (process.env.VERCEL) {
  module.exports = app;
} else {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
}
