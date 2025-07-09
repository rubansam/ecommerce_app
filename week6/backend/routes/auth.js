const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const auth = require('../middleware/auth');
const permit = require('../middleware/role');
const logger = require('../utils/logger');

// Registration
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashed });
    await user.save();
    logger.info('New user registered: %s (%s)', username, email);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    logger.error('Registration error for %s: %s', email, err.stack || err.message);
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Login failed: user not found for %s', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      logger.warn('Login failed: invalid password for %s', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role, username:user.username,email:user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    logger.info('User logged in: %s (%s)', user.username, email);
    res.json({ token });
  } catch (err) {
    logger.error('Login error for %s: %s', email, err.stack || err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update profile (only self or admin)
router.put('/profile', auth, async (req, res) => {
  const { username, bio, avatar } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn('Profile update: user not found for id %s', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    // Only allow user to update their own profile
    if (user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      logger.warn('Profile update forbidden for user %s', req.user.id);
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (username) user.username = username;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;
    await user.save();
    logger.info('Profile updated for user %s', req.user.id);
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    logger.error('Profile update error for user %s: %s', req.user.id, err.stack || err.message);
    res.status(500).json({ error: err.message });
  }
});

// Change password
router.post('/change-password', auth, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      logger.warn('Change password: user not found for id %s', req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) {
      logger.warn('Change password: old password incorrect for user %s', req.user.id);
      return res.status(400).json({ error: 'Old password incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    logger.info('Password changed for user %s', req.user.id);
    res.json({ message: 'Password changed' });
  } catch (err) {
    logger.error('Change password error for user %s: %s', req.user.id, err.stack || err.message);
    res.status(500).json({ error: err.message });
  }
});

// Search users (admin or moderator only)
router.get('/search', auth, permit('admin', 'moderator'), async (req, res) => {
  const { q } = req.query;
  try {
    const users = await User.find({
      $or: [
        { username: new RegExp(q, 'i') },
        { email: new RegExp(q, 'i') }
      ]
    }).select('-password');
    logger.info('Admin/mod searched users with query "%s"', q);
    res.json(users);
  } catch (err) {
    logger.error('Admin/mod search error: %s', err.stack || err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;