require('dotenv').config();
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const { createClient } = require('redis');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./modules/auth/auth.routes');
const fileRoutes = require('./modules/file-sharing/file.routes');
const startCleanupJob = require('./jobs/cleanup');

// --- App & Server Setup ---
const app = express();
const httpServer = http.createServer(app);

// --- Middleware ---
app.use(helmet()); // Adds security headers
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json()); // Parses JSON bodies
app.use(morgan('dev')); // Logs requests to console


// --- Database Connection ---
// We use a self-invoking function to handle async connection
(async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected');

    // 2. Connect to Redis (for Socket Scaling)
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);
    console.log('✅ Redis Connected');

    // 3. Initialize Socket.io with Redis Adapter
    const io = new Server(httpServer, {
      cors: {
        origin: process.env.CLIENT_URL,
        methods: ["GET", "POST"]
      },
      adapter: createAdapter(pubClient, subClient)
    });

    // Make 'io' accessible globally in the app
    app.set('io', io);
    // Make 'io' accessible globally
    app.set('io', io);

    // 🔥 Initialize Real-Time Logic
    require('./modules/live-notes/notes.socket')(io);

    // --- Routes (Placeholders) ---
    app.get('/', (req, res) => res.send('API is running...'));
    app.use('/api/auth', authRoutes);
    app.use('/api/files', fileRoutes);
    app.use('/api/notes', require('./modules/live-notes/note.routes'));
    
    // Future Routes:
    // app.use('/api/auth', require('./modules/auth/auth.routes'));
    // app.use('/api/files', require('./modules/file-sharing/file.routes'));

    // 🧹 Start the Cleanup Cron Job
    startCleanupJob()

    // --- Start Server ---
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ Startup Error:', err);
    process.exit(1);
  }
})();