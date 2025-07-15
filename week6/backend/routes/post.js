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
    const posts = await Post.find({ user: req.user.id }).sort({ createdAt: -1 }).populate('user', 'username');
    res.json(posts);
  } catch (err) {
    logger.error('Error fetching posts for user %s: %s', req.user.id, err.stack || err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /posts/:id/like
router.post('/:id/like', auth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).send('Post not found');
  const userId = req.user.id;
  const index = post.likes.findIndex(id => id && id.toString() === userId.toString());
  if (index === -1) {
    post.likes.push(userId);
  } else {
    post.likes.splice(index, 1);
  }
  // Remove any accidental nulls before saving
post.likes = post.likes.filter(Boolean);
  await post.save();
  res.json({ likes: post.likes });
});

// GET /posts/:id/likes
router.get('/:id/likes', async (req, res) => {
  const post = await Post.findById(req.params.id).populate('likes', 'username');
  if (!post) return res.status(404).send('Post not found');
  res.json({ users: post.likes });
});

// Delete a post (only by owner)
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ error: 'You are not authorized to delete this post' });
    }
    await post.deleteOne();
    logger.info('User %s deleted post %s', req.user.id, req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    logger.error('Error deleting post %s by user %s: %s', req.params.id, req.user.id, err.stack || err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all posts
router.get('/', async (req, res) => {
  try {
    logger.info('Fetching all posts');
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('user', 'username name');
    // Remove nulls from likes array for each post
    const cleanedPosts = posts.map(post => {
      const obj = post.toObject();
      obj.likes = (obj.likes || []).filter(Boolean);
      return obj;
    });
    res.json(cleanedPosts);
  } catch (err) {
    logger.error('Error fetching all posts: %s', err.stack || err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;