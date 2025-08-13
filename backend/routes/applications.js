const express = require('express');
const jwt = require('jsonwebtoken');
const Application = require('../models/Application');
const Job = require('../models/Job');
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

// Apply for a job
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      jobId,
      candidateId: req.user._id
    });

    if (existingApplication) {
      return res.status(400).json({ error: 'Already applied for this job' });
    }

    // Create application
    const application = new Application({
      jobId,
      candidateId: req.user._id
    });

    await application.save();

    // Increment job applications count
    job.applications += 1;
    await job.save();

    // Add XP for applying
    req.user.totalXP += 50;
    const newLevel = calculateXPLevel(req.user.totalXP);
    if (newLevel > req.user.xpLevel) {
      req.user.xpLevel = newLevel;
    }
    await req.user.save();

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
      xpGained: 50
    });
  } catch (error) {
    console.error('Apply for job error:', error);
    res.status(500).json({ error: 'Failed to apply for job' });
  }
});

// Get applications for a job (employer only)
router.get('/job/:jobId', authenticateToken, async (req, res) => {
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

    const applications = await Application.find({ jobId })
      .populate('candidateId', 'profile firstName lastName xpLevel totalXP')
      .sort({ appliedAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
});

// Update application status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('jobId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify employer owns the job
    if (application.jobId.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    application.status = status;
    application.lastUpdated = new Date();
    await application.save();

    res.json({ message: 'Application status updated', application });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// Add notes to application
router.put('/:id/notes', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;
    const application = await Application.findById(req.params.id)
      .populate('jobId');

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Verify employer owns the job
    if (application.jobId.employerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    application.employerNotes = notes;
    await application.save();

    res.json({ message: 'Notes updated', application });
  } catch (error) {
    console.error('Update notes error:', error);
    res.status(500).json({ error: 'Failed to update notes' });
  }
});

// Get candidate's applications
router.get('/my-applications', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .populate('jobId')
      .sort({ appliedAt: -1 });

    res.json({ applications });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
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

