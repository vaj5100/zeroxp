const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'reviewing', 'interview', 'hired', 'rejected'],
    default: 'new'
  },
  notes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  employerNotes: String,
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  appliedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update lastUpdated when status changes
applicationSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    this.lastUpdated = new Date();
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);

