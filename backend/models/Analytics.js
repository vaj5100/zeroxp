const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  method: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  userAgent: String,
  ip: String,
  userId: {
    type: String,
    default: 'anonymous'
  },
  userType: {
    type: String,
    enum: ['jobseeker', 'employer', 'anonymous']
  },
  sessionId: String,
  referrer: String,
  responseTime: Number,
  statusCode: Number,
  error: String
}, {
  timestamps: true
});

// Index for efficient queries
analyticsSchema.index({ timestamp: -1 });
analyticsSchema.index({ userId: 1, timestamp: -1 });
analyticsSchema.index({ path: 1, timestamp: -1 });

// Static method to get analytics summary
analyticsSchema.statics.getSummary = async function(startDate, endDate) {
  const pipeline = [
    {
      $match: {
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $group: {
        _id: {
          path: '$path',
          method: '$method'
        },
        count: { $sum: 1 },
        uniqueUsers: { $addToSet: '$userId' }
      }
    },
    {
      $project: {
        path: '$_id.path',
        method: '$_id.method',
        count: 1,
        uniqueUsers: { $size: '$uniqueUsers' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ];

  return this.aggregate(pipeline);
};

// Static method to get user behavior
analyticsSchema.statics.getUserBehavior = async function(userId) {
  return this.find({ userId })
    .sort({ timestamp: -1 })
    .limit(100);
};

module.exports = mongoose.model('Analytics', analyticsSchema);

