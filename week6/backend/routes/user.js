const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Post = require('../models/Post');
const redisClient = require('../utils/redis')
const logger = require('../utils/logger');

router.get('/dashboard-stats', auth, async (req, res) => {
    const userId = req.user.id;
    const cacheKey = `dashboard-stats:${userId}`;
    try {
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            logger.info('Dashboard stats cache hit for user %s', userId);
            return res.json(JSON.parse(cached));
        }
        logger.info('Dashboard stats cache miss for user %s', userId);

        // 2. Compute stats 
        const user = await User.findById(userId);
        const followersCount = user.followers.length;
        const followRequestsCount = user.followRequests.length;
      
        // Posts by type
        const today = new Date();
        today.setHours(0,0,0,0);
        const postsToday = await Post.find({
          user: userId,
          createdAt: { $gte: today }
        });
      
        const totalImages = await Post.countDocuments({ user: userId, type: 'image' });
        const totalVideos = await Post.countDocuments({ user: userId, type: 'video' });
      
        // Get daily uploads for last 7 days
        const days = 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - (days - 1));
        startDate.setHours(0,0,0,0);
      
        const dailyUploads = await Post.aggregate([
          {
            $match: {
              user: user._id,
              createdAt: { $gte: startDate }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
              },
              count: { $sum: 1 }
            }
          },
          {
            $sort: { _id: 1 }
          }
        ]);
      
        // Fill in days with zero uploads
        const dailyUploadsMap = {};
        dailyUploads.forEach(d => { dailyUploadsMap[d._id] = d.count; });
        const resultDailyUploads = [];
        for (let i = 0; i < days; i++) {
          const d = new Date(startDate);
          d.setDate(d.getDate() + i);
          const dateStr = d.toISOString().slice(0,10);
          resultDailyUploads.push({
            date: dateStr,
            count: dailyUploadsMap[dateStr] || 0
          });
        }
      
        const stats = {
            followersCount,
            followRequestsCount,
            postsToday: postsToday.length,
            totalImages,
            totalVideos,
            dailyUploads: resultDailyUploads
          };
        
          // 3. Store in Redis (set an expiry, e.g., 60 seconds)
          await redisClient.set(cacheKey, JSON.stringify(stats), 'EX', 60);
          logger.info('Dashboard stats cached for user %s', userId);
          res.json(stats);
    } catch(err){
        logger.error('Error in /dashboard-stats for user %s: %s', userId, err.stack || err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Search users with follow status
router.get('/search', auth, async (req, res) => {
    const q = req.query.q || '';
    try {
        const currentUser = await User.findById(req.user.id);
        const users = await User.find({
            _id: { $ne: req.user.id },
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        });
        const result = users.map(u => {
            let followStatus = 'none';
            if (currentUser.following.includes(u._id)) followStatus = 'following';
            else if (currentUser.sentRequests.includes(u._id)) followStatus = 'requested';
            return {
                _id: u._id,
                username: u.username,
                email: u.email,
                avatar: u.avatar,
                followStatus
            };
        });
        logger.info('User %s searched users with query "%s"', req.user.id, q);
        res.json(result);
    } catch (err) {
        logger.error('Error in /search for user %s: %s', req.user.id, err.stack || err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
  
// Send follow request
router.post('/:id/follow', auth, async (req, res) => {
    const targetId = req.params.id;
    if (targetId === req.user.id) {
        logger.warn('User %s tried to follow themselves', req.user.id);
        return res.status(400).json({ error: "Can't follow yourself" });
    }
    try {
        const user = await User.findById(req.user.id);
        const target = await User.findById(targetId);
  
        if (!target) {
            logger.warn('User %s tried to follow non-existent user %s', req.user.id, targetId);
            return res.status(404).json({ error: 'User not found' });
        }
        if (user.following.includes(targetId)) {
            logger.warn('User %s tried to follow user %s they already follow', req.user.id, targetId);
            return res.status(400).json({ error: 'Already following' });
        }
        if (user.sentRequests.includes(targetId)) {
            logger.warn('User %s tried to follow user %s they already requested', req.user.id, targetId);
            return res.status(400).json({ error: 'Already requested' });
        }
  
        user.sentRequests.push(targetId);
        target.followRequests.push(user._id);
  
        await user.save();
        await target.save();
  
        logger.info('User %s sent follow request to user %s', req.user.id, targetId);
        res.json({ message: 'Follow request sent' });
    } catch (err) {
        logger.error('Error in /:id/follow for user %s: %s', req.user.id, err.stack || err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Get incoming follow requests
router.get('/requests', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('followRequests', 'username email avatar');
        logger.info('User %s fetched incoming follow requests', req.user.id);
        res.json(user.followRequests);
    } catch (err) {
        logger.error('Error in /requests for user %s: %s', req.user.id, err.stack || err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Accept follow request
router.post('/:id/accept', auth, async (req, res) => {
    const requesterId = req.params.id;
    try {
        const user = await User.findById(req.user.id);
        const requester = await User.findById(requesterId);
  
        if (!user.followRequests.includes(requesterId)) {
            logger.warn('User %s tried to accept non-existent request from %s', req.user.id, requesterId);
            return res.status(400).json({ error: 'No such request' });
        }
  
        // Remove from requests
        user.followRequests = user.followRequests.filter(id => id.toString() !== requesterId);
        requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== req.user.id);
  
        // Add to followers/following
        user.followers.push(requesterId);
        requester.following.push(user._id);
  
        await user.save();
        await requester.save();
  
        logger.info('User %s accepted follow request from %s', req.user.id, requesterId);
        res.json({ message: 'Follow request accepted' });
    } catch (err) {
        logger.error('Error in /:id/accept for user %s: %s', req.user.id, err.stack || err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Reject follow request
router.post('/:id/reject', auth, async (req, res) => {
    const requesterId = req.params.id;
    try {
        const user = await User.findById(req.user.id);
        const requester = await User.findById(requesterId);
  
        if (!user.followRequests.includes(requesterId)) {
            logger.warn('User %s tried to reject non-existent request from %s', req.user.id, requesterId);
            return res.status(400).json({ error: 'No such request' });
        }
  
        // Remove from requests
        user.followRequests = user.followRequests.filter(id => id.toString() !== requesterId);
        requester.sentRequests = requester.sentRequests.filter(id => id.toString() !== req.user.id);
  
        await user.save();
        await requester.save();
  
        logger.info('User %s rejected follow request from %s', req.user.id, requesterId);
        res.json({ message: 'Follow request rejected' });
    } catch (err) {
        logger.error('Error in /:id/reject for user %s: %s', req.user.id, err.stack || err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// chat 
router.get('/friends', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('following', 'username email avatar');
        const friends = user.following.filter(f =>
            f.following.includes(user._id)
        );
        logger.info('User %s fetched friends list', req.user.id);
        res.json(friends);
    } catch (err) {
        logger.error('Error in /friends for user %s: %s', req.user.id, err.stack || err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
  });

// Get chat friends (mutual followers)
router.get('/chat/list', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('following', 'username email avatar followers');
        const friends = user.following.filter(f =>
            f.followers.map(id => id.toString()).includes(user._id.toString())
        );
        logger.info('User %s fetched chat friends list', req.user.id);
        res.json(friends);
    } catch (err) {
        logger.error('Error in /chat/list for user %s: %s', req.user.id, err.stack || err.message);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;