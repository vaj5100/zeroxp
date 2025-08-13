const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    enum: ['jobseeker', 'employer'],
    required: true
  },
  profile: {
    firstName: String,
    lastName: String,
    title: String,
    location: String,
    summary: String,
    experience: String,
    education: String,
    skills: [String],
    linkedinUrl: String,
    portfolioUrl: String,
    videoCV: String,
    phone: String
  },
  xpLevel: {
    type: Number,
    default: 1
  },
  totalXP: {
    type: Number,
    default: 0
  },
  credits: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get XP level info
userSchema.methods.getXPLevelInfo = function() {
  const levels = {
    1: { name: 'Fresh Start', color: 'text-gray-300', icon: '🌱' },
    2: { name: 'Go-Getter', color: 'text-emerald-300', icon: '⭐' },
    3: { name: 'Job Hunter', color: 'text-cyan-300', icon: '🎯' },
    4: { name: 'Rising Pro', color: 'text-pink-300', icon: '🏆' },
    5: { name: 'Career Champion', color: 'text-purple-300', icon: '👑' }
  };
  return levels[this.xpLevel] || levels[1];
};

module.exports = mongoose.model('User', userSchema);

