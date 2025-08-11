import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/zeroxp');

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['jobseeker', 'employer'], required: true },
  companyName: String,
  firstName: String,
  lastName: String,
  jobHuntXP: { type: Number, default: 0 },
  preferences: {
    jobAlerts: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    jobTypes: [String],
    locations: [String],
    salaryRange: {
      min: Number,
      max: Number
    },
    skills: [String]
  },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Job Schema
const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: Number, required: true },
  description: { type: String, required: true },
  tags: [String],
  jobType: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postedAt: { type: Date, default: Date.now },
  applicants: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    appliedAt: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['pending', 'reviewed', 'declined', 'accepted'], 
      default: 'pending' 
    },
    reviewedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }]
});

const Job = mongoose.model('Job', jobSchema);

// Email Configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Email Templates
const emailTemplates = {
  welcome: (user) => ({
    subject: `Welcome to ZeroXP, ${user.firstName || 'Job Seeker'}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #06b6d4; text-align: center;">Welcome to ZeroXP!</h1>
        <p>Hi ${user.firstName || 'there'},</p>
        <p>Welcome to ZeroXP! We're excited to have you on board.</p>
        <p>As a ${user.userType === 'jobseeker' ? 'job seeker' : 'employer'}, you can:</p>
        <ul>
          ${user.userType === 'jobseeker' 
            ? '<li>Browse and apply to jobs</li><li>Build your XP through applications</li><li>Get priority visibility to employers</li>'
            : '<li>Post job openings</li><li>Review applications</li><li>Find qualified candidates</li>'
          }
        </ul>
        <p>Start your journey today!</p>
        <p>Best regards,<br>The ZeroXP Team</p>
      </div>
    `
  }),
  
  jobAlert: (user, jobs) => ({
    subject: `New Job Opportunities for You`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #06b6d4; text-align: center;">New Job Alerts</h1>
        <p>Hi ${user.firstName || 'there'},</p>
        <p>We found ${jobs.length} new job opportunities that match your preferences:</p>
        ${jobs.map(job => `
          <div style="border: 1px solid #e5e7eb; padding: 15px; margin: 10px 0; border-radius: 8px;">
            <h3 style="margin: 0 0 5px 0; color: #1f2937;">${job.title}</h3>
            <p style="margin: 0 0 5px 0; color: #6b7280;">${job.company} • ${job.location}</p>
            <p style="margin: 0 0 10px 0; color: #059669;">$${job.salary.toLocaleString()}</p>
            <p style="margin: 0; color: #374151; font-size: 14px;">${job.description.substring(0, 150)}...</p>
          </div>
        `).join('')}
        <p>Login to ZeroXP to apply for these positions!</p>
        <p>Best regards,<br>The ZeroXP Team</p>
      </div>
    `
  })
};

// Email sending function
const sendEmail = async (to, template, data) => {
  try {
    const emailContent = emailTemplates[template](data);
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: emailContent.subject,
      html: emailContent.html
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

// Routes

// User Registration
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, userType, companyName, firstName, lastName } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      userType,
      companyName,
      firstName,
      lastName
    });
    
    await user.save();
    
    // Send welcome email
    await sendEmail(email, 'welcome', user);
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        jobHuntXP: user.jobHuntXP
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, userType: user.userType },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        companyName: user.companyName,
        jobHuntXP: user.jobHuntXP,
        preferences: user.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update User Preferences
app.put('/api/users/preferences', async (req, res) => {
  try {
    const { userId, preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      { preferences },
      { new: true }
    );
    
    res.json({ message: 'Preferences updated', preferences: user.preferences });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Post Job
app.post('/api/jobs', async (req, res) => {
  try {
    const { title, company, location, salary, description, tags, jobType, postedBy } = req.body;
    
    const job = new Job({
      title,
      company,
      location,
      salary,
      description,
      tags,
      jobType,
      postedBy
    });
    
    await job.save();
    
    // Send job alerts to matching users
    const matchingUsers = await User.find({
      'preferences.jobAlerts': true,
      userType: 'jobseeker',
      $or: [
        { 'preferences.jobTypes': jobType },
        { 'preferences.locations': location },
        { 'preferences.skills': { $in: tags } }
      ]
    });
    
    // Send job alerts
    for (const user of matchingUsers) {
      await sendEmail(user.email, 'jobAlert', user, [job]);
    }
    
    res.status(201).json({ message: 'Job posted successfully', job });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Apply to Job
app.post('/api/jobs/:jobId/apply', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId } = req.body;
    
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.applicants.some(applicant => applicant.userId.toString() === userId)) {
      return res.status(400).json({ message: 'Already applied to this job' });
    }
    
    job.applicants.push({ userId, appliedAt: new Date() });
    await job.save();
    
    // Update user XP
    await User.findByIdAndUpdate(userId, {
      $inc: { jobHuntXP: 10 }
    });
    
    res.json({ message: 'Application submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get User Profile
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Job Applications (for employers) - sorted by XP
app.get('/api/jobs/:jobId/applications', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { employerId } = req.query;
    
    // Verify the employer owns this job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.postedBy.toString() !== employerId) {
      return res.status(403).json({ message: 'Not authorized to view applications for this job' });
    }
    
    // Get applicants with their XP, sorted by XP (highest first) for pending applications
    const applications = await Promise.all(
      job.applicants.map(async (applicant) => {
        const user = await User.findById(applicant.userId).select('firstName lastName email jobHuntXP');
        return {
          ...applicant.toObject(),
          user: user || { firstName: 'Unknown', lastName: 'User', email: 'unknown@email.com', jobHuntXP: 0 }
        };
      })
    );
    
    // Sort applications: pending by XP (highest first), then reviewed, declined, accepted
    const sortedApplications = applications.sort((a, b) => {
      // First, sort by status priority
      const statusPriority = { pending: 0, reviewed: 1, declined: 2, accepted: 3 };
      const statusDiff = statusPriority[a.status] - statusPriority[b.status];
      
      if (statusDiff !== 0) return statusDiff;
      
      // For pending applications, sort by XP (highest first)
      if (a.status === 'pending' && b.status === 'pending') {
        return b.user.jobHuntXP - a.user.jobHuntXP;
      }
      
      // For other statuses, sort by application date (newest first)
      return new Date(b.appliedAt) - new Date(a.appliedAt);
    });
    
    res.json({ applications: sortedApplications, jobTitle: job.title, company: job.company });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Application Status (for employers)
app.put('/api/jobs/:jobId/applications/:applicantId/status', async (req, res) => {
  try {
    const { jobId, applicantId } = req.params;
    const { status, employerId } = req.body;
    
    // Verify the employer owns this job
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    if (job.postedBy.toString() !== employerId) {
      return res.status(403).json({ message: 'Not authorized to update applications for this job' });
    }
    
    // Find and update the application
    const application = job.applicants.id(applicantId);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }
    
    application.status = status;
    application.reviewedAt = new Date();
    application.reviewedBy = employerId;
    
    await job.save();
    
    res.json({ message: 'Application status updated successfully', application });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Employer's Jobs with Application Counts
app.get('/api/employers/:employerId/jobs', async (req, res) => {
  try {
    const { employerId } = req.params;
    
    const jobs = await Job.find({ postedBy: employerId }).sort({ postedAt: -1 });
    
    // Add application counts for each job
    const jobsWithCounts = jobs.map(job => {
      const pendingCount = job.applicants.filter(app => app.status === 'pending').length;
      const totalCount = job.applicants.length;
      
      return {
        ...job.toObject(),
        pendingApplications: pendingCount,
        totalApplications: totalCount
      };
    });
    
    res.json(jobsWithCounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update User Profile
app.put('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select('-password');
    
    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
