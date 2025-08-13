const express = require('express');
const jwt = require('jsonwebtoken');
const Analytics = require('../models/Analytics');
const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');
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

// Get analytics summary (admin/employer only)
router.get('/summary', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
    const end = endDate ? new Date(endDate) : new Date();

    // Get analytics summary
    const analyticsSummary = await Analytics.getSummary(start, end);

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const jobSeekers = await User.countDocuments({ userType: 'jobseeker' });
    const employers = await User.countDocuments({ userType: 'employer' });

    // Get job statistics
    const totalJobs = await Job.countDocuments();
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const totalApplications = await Application.countDocuments();

    // Get XP statistics
    const xpStats = await User.aggregate([
      { $match: { userType: 'jobseeker' } },
      {
        $group: {
          _id: null,
          avgXP: { $avg: '$totalXP' },
          maxXP: { $max: '$totalXP' },
          totalXP: { $sum: '$totalXP' }
        }
      }
    ]);

    res.json({
      analytics: analyticsSummary,
      users: {
        total: totalUsers,
        jobSeekers,
        employers
      },
      jobs: {
        total: totalJobs,
        active: activeJobs,
        applications: totalApplications
      },
      xp: xpStats[0] || { avgXP: 0, maxXP: 0, totalXP: 0 },
      period: { start, end }
    });
  } catch (error) {
    console.error('Get analytics summary error:', error);
    res.status(500).json({ error: 'Failed to get analytics summary' });
  }
});

// Get user behavior analytics
router.get('/user-behavior/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Only allow if admin or the user themselves
    if (req.user.userType !== 'employer' && req.user._id.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const userBehavior = await Analytics.getUserBehavior(userId);
    const user = await User.findById(userId).select('-password');

    res.json({
      user,
      behavior: userBehavior
    });
  } catch (error) {
    console.error('Get user behavior error:', error);
    res.status(500).json({ error: 'Failed to get user behavior' });
  }
});

// Get job performance analytics
router.get('/job-performance/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    
    // Verify employer owns the job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Get applications for this job
    const applications = await Application.find({ jobId })
      .populate('candidateId', 'profile firstName lastName xpLevel totalXP');

    // Calculate statistics
    const totalApplications = applications.length;
    const statusCounts = applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {});

    const avgXP = applications.length > 0 
      ? applications.reduce((sum, app) => sum + app.candidateId.totalXP, 0) / applications.length 
      : 0;

    res.json({
      job,
      applications: {
        total: totalApplications,
        statusCounts,
        avgXP
      },
      performance: {
        views: job.views,
        applicationRate: job.views > 0 ? (totalApplications / job.views * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Get job performance error:', error);
    res.status(500).json({ error: 'Failed to get job performance' });
  }
});

// Track custom event
router.post('/track', async (req, res) => {
  try {
    const { event, userId, userType, data } = req.body;
    
    const analytics = new Analytics({
      method: 'POST',
      path: `/api/analytics/track`,
      userId: userId || 'anonymous',
      userType: userType || 'anonymous',
      timestamp: new Date(),
      // Store custom event data
      customEvent: {
        event,
        data
      }
    });

    await analytics.save();

    res.json({ message: 'Event tracked successfully' });
  } catch (error) {
    console.error('Track event error:', error);
    res.status(500).json({ error: 'Failed to track event' });
  }
});

// Get platform statistics
router.get('/platform-stats', async (req, res) => {
  try {
    const stats = {
      users: await User.countDocuments(),
      jobs: await Job.countDocuments({ status: 'active' }),
      applications: await Application.countDocuments(),
      totalXP: await User.aggregate([
        { $match: { userType: 'jobseeker' } },
        { $group: { _id: null, total: { $sum: '$totalXP' } } }
      ]).then(result => result[0]?.total || 0)
    };

    res.json(stats);
  } catch (error) {
    console.error('Get platform stats error:', error);
    res.status(500).json({ error: 'Failed to get platform stats' });
  }
});

module.exports = router;

