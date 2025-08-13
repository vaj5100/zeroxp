const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { profile } = req.body;
    
    const user = await User.findById(req.user._id);
    user.profile = { ...user.profile, ...profile };
    
    await user.save();
    
    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        xpLevel: user.xpLevel,
        totalXP: user.totalXP,
        credits: user.credits,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Add XP to user
router.post('/xp', authenticateToken, async (req, res) => {
  try {
    const { amount, action } = req.body;
    
    const user = await User.findById(req.user._id);
    user.totalXP += amount;
    
    // Calculate new XP level
    const newLevel = calculateXPLevel(user.totalXP);
    if (newLevel > user.xpLevel) {
      user.xpLevel = newLevel;
    }
    
    await user.save();
    
    res.json({
      message: `+${amount} XP added`,
      user: {
        id: user._id,
        xpLevel: user.xpLevel,
        totalXP: user.totalXP
      }
    });
  } catch (error) {
    console.error('Add XP error:', error);
    res.status(500).json({ error: 'Failed to add XP' });
  }
});

// Upload video CV
router.post('/video-cv', authenticateToken, async (req, res) => {
  try {
    const { videoUrl } = req.body;
    
    const user = await User.findById(req.user._id);
    user.profile.videoCV = videoUrl;
    
    // Add XP for video CV upload
    user.totalXP += 50;
    const newLevel = calculateXPLevel(user.totalXP);
    if (newLevel > user.xpLevel) {
      user.xpLevel = newLevel;
    }
    
    await user.save();
    
    res.json({
      message: 'Video CV uploaded successfully',
      user: {
        id: user._id,
        xpLevel: user.xpLevel,
        totalXP: user.totalXP,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Video CV upload error:', error);
    res.status(500).json({ error: 'Failed to upload video CV' });
  }
});

// Get XP level info
router.get('/xp-level', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const levelInfo = user.getXPLevelInfo();
    
    res.json({
      level: user.xpLevel,
      totalXP: user.totalXP,
      levelInfo
    });
  } catch (error) {
    console.error('Get XP level error:', error);
    res.status(500).json({ error: 'Failed to get XP level' });
  }
});

// Helper function to calculate XP level
function calculateXPLevel(xp) {
  if (xp >= 3000) return 5;
  if (xp >= 1500) return 4;
  if (xp >= 750) return 3;
  if (xp >= 300) return 2;
  return 1;
}

module.exports = router;

