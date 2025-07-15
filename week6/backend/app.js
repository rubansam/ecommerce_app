const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require('http');

const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/post');
const usersRoutes = require('./routes/user')
const auth = require('./middleware/auth');
const permit = require('./middleware/role');
const s3 = require('./utils/s3');
const redisClient = require('./utils/redis');
const logger = require('./utils/logger');
const Message = require('./models/Message'); // Add this import

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected');
});

const io = require('socket.io')(server, {
    cors: { origin: '*' }
  });

let onlineUsers = {};

io.on('connection', (socket) => {
  socket.on('join', async (userId) => {
    onlineUsers[userId] = socket.id;
    // Notify all clients this user is online
    io.emit('user_online', userId);

    // Send unread messages to this user
    const unreadMessages = await Message.find({ to: userId, read: false });
    if (unreadMessages.length > 0) {
      io.to(socket.id).emit('unread_messages', unreadMessages);
      // Optionally, mark as read here or when user reads them
    }
  });

  socket.on('send_message', async ({ to, from, message }) => {
    // Send the message to the recipient if online
    if (onlineUsers[to]) {
      io.to(onlineUsers[to]).emit('receive_message', { from, to, message });
      // io.to(onlineUsers[to]).emit('chat_notification', { from, message });
    } else {
      // Save as unread in DB
      await Message.create({ from, to, message, read: false, timestamp: new Date() });
    }
    // Echo to sender for instant feedback
    if (onlineUsers[from]) {
      io.to(onlineUsers[from]).emit('receive_message', { from, to, message });
    }
  });

  socket.on('get_online_users', () => {
    socket.emit('online_users', Object.keys(onlineUsers));
  });

  // Mark messages as read
  socket.on('mark_as_read', async ({ from, to }) => {
    await Message.updateMany(
      { from, to, read: false },
      { $set: { read: true } }
    );
  });

  socket.on('disconnect', () => {
    for (const [userId, id] of Object.entries(onlineUsers)) {
      if (id === socket.id) {
        delete onlineUsers[userId];
        // Notify all clients this user is offline
        io.emit('user_offline', userId);
        break;
      }
    }
  });
});

// Connect to Redis only once when the application starts
(async () => {
    await redisClient.connect();
  })();


app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/user', usersRoutes);

app.use((err, req, res, next) => {
    logger.error('Unhandled error: %s', err.stack || err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  });

// Example protected route
app.get('/api/protected', auth, permit('admin'), (req, res) => {
  res.json({ message: 'Hello Admin!' });
});

s3.listBuckets((err, data) => {
    if (err) {
      logger.error('Error connecting to S3:', err);
    } else {
      logger.info('S3 Buckets:', data.Buckets);
      // Check if the bucket exists
      const bucketExists = data.Buckets.some(bucket => bucket.Name === process.env.BUCKET_NAME);
      if (!bucketExists) {
        // If the bucket does not exist, create it
        s3.createBucket({ Bucket: process.env.BUCKET_NAME }, (err, result) => {
          if (err) {
            logger.error('Error creating bucket:', err);
          } else {
            logger.info(`Bucket "${process.env.BUCKET_NAME}" created successfully!`);
          }
        });
      } else {
        logger.info(`Bucket "${process.env.BUCKET_NAME}" already exists.`);
      }
    }
  });
  module.exports = { app, mongoose, redisClient };

// Only start the server if not in test mode
if (require.main === module) {
    server.listen(4000, () => logger.info('Server running on port 4000'));
}

