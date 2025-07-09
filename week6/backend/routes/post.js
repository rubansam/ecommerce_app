const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const Post = require('../models/Post');
const auth = require('../middleware/auth');
const s3 = require('../utils/s3')
const upload = multer(); // Use memory storage
const router = express.Router();
const redisClient = require('../utils/redis')
const logger = require('../utils/logger');
require('dotenv').config();




// Create post with image upload
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    logger.info('User %s is attempting to create a new post', req.user.id);

    const { caption } = req.body;
    const file = req.file;
    if (!file || !caption) {
      logger.warn('User %s tried to create post without image or caption', req.user.id);
      return res.status(400).json({ error: 'Image or Caption is required.' });
    }

    // Upload image to S3
    const s3Key = `${Date.now()}_${file.originalname}`;
    const uploadResult = await s3.upload({
      Bucket: process.env.BUCKET_NAME,
      Key: s3Key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }).promise();

    const post = new Post({
      user: req.user.id,
      caption,
      imageUrl: uploadResult.Location,
      type: "image"
    });
    await post.save();
    logger.info('User %s created a new post: %s', req.user.id, post._id);

    // Invalidate dashboard stats cache for this user
    const cacheKey = `dashboard-stats:${req.user.id}`;
    await redisClient.del(cacheKey);
    logger.info('Dashboard stats cache invalidated for user %s', req.user.id);

    res.status(201).json(post);
  } catch (err) {
    logger.error('Error creating post for user %s: %s', req.user.id, err.stack || err.message);
    res.status(500).json({ error: err.message });
  }
});

router.get('/mine', auth, async (req, res) => {
  try {
    logger.info('User %s requested their posts', req.user.id);
    const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    logger.error('Error fetching posts for user %s: %s', req.user.id, err.stack || err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;