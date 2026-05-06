require('dotenv').config();
const cluster = require('cluster');
const os = require('os');
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter, setupPrimary } = require('@socket.io/cluster-adapter');
const connectDB = require('./config/db');
const { startCronJobs } = require('./services/cronService');

const numCPUs = os.cpus().length;

if (process.env.VERCEL) {
  // Vercel Serverless environment
  connectDB();
  const app = express();
  app.use(cors());
  app.use(express.json());
  
  // Routes
  app.use('/api/auth', require('./routes/authRoutes'));
  app.use('/api/emails', require('./routes/emailRoutes'));
  app.use('/api/ai', require('./routes/aiRoutes'));
  
  module.exports = app;
} else {
  if (cluster.isPrimary) {
    console.log(`Primary ${process.pid} is running`);
    
    // Setup primary adapter for socket.io cluster sync
    setupPrimary();

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
      cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
      console.log(`Worker ${worker.process.pid} died. Restarting...`);
      cluster.fork();
    });
  } else {
    // Workers can share any TCP connection
    connectDB();
    const app = express();
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    });

    // Use the cluster adapter so events broadcast across all workers
    io.adapter(createAdapter());

    app.use(cors());
    app.use(express.json());
    app.use('/uploads', express.static('uploads'));

    app.use((req, res, next) => {
      req.io = io;
      next();
    });

    // Routes
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/emails', require('./routes/emailRoutes'));
    app.use('/api/ai', require('./routes/aiRoutes'));

    io.on('connection', (socket) => {
      console.log(`New client connected to worker ${process.pid}:`, socket.id);
      
      socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`User ${userId} joined room on worker ${process.pid}`);
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected from worker ${process.pid}:`, socket.id);
      });
    });

    // Start Cron Jobs ONLY on the first worker (id=1) to prevent duplicate emails
    if (cluster.worker.id === 1) {
      console.log(`Worker 1 (${process.pid}) initializing cron scheduler...`);
      startCronJobs(io);
    }

    const PORT = process.env.PORT || 5000;
    
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Worker ${process.pid} running on port ${PORT}`);
    });
  }
}
