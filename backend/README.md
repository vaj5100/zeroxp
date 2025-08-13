# ZeroXP Backend API

A Node.js/Express backend for the ZeroXP job platform with comprehensive analytics tracking.

## 🚀 Features

- **User Authentication** - JWT-based auth with bcrypt password hashing
- **Job Management** - Post, update, and manage job listings
- **Application System** - Track job applications and status
- **XP System** - Gamified experience points for job seekers
- **Analytics** - Comprehensive data collection and reporting
- **Video CV Support** - File upload and management
- **Real-time Tracking** - User behavior and platform analytics

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp config.env.example config.env
   # Edit config.env with your values
   ```

3. **Start MongoDB:**
   ```bash
   # Local MongoDB
   mongod
   
   # Or use MongoDB Atlas (cloud)
   ```

4. **Run the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 🔧 Configuration

Edit `config.env` with your settings:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/zeroxp
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=zeroxp-videos
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/xp` - Add XP to user
- `POST /api/users/video-cv` - Upload video CV
- `GET /api/users/xp-level` - Get XP level info

### Jobs
- `GET /api/jobs` - Get all jobs (public)
- `GET /api/jobs/:id` - Get specific job
- `POST /api/jobs` - Post new job (employers only)
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/employer/my-jobs` - Get employer's jobs

### Applications
- `POST /api/applications` - Apply for job
- `GET /api/applications/job/:jobId` - Get applications for job
- `PUT /api/applications/:id/status` - Update application status
- `PUT /api/applications/:id/notes` - Add notes to application
- `GET /api/applications/my-applications` - Get user's applications

### Analytics
- `GET /api/analytics/summary` - Get analytics summary
- `GET /api/analytics/user-behavior/:userId` - Get user behavior
- `GET /api/analytics/job-performance/:jobId` - Get job performance
- `POST /api/analytics/track` - Track custom event
- `GET /api/analytics/platform-stats` - Get platform statistics

## 📈 Analytics Features

### Automatic Tracking
- Page views and API calls
- User behavior patterns
- Response times and errors
- Session tracking

### Custom Events
- Job applications
- XP gains
- Video CV uploads
- Profile updates

### Reports Available
- User registration/conversion rates
- Job posting performance
- Application-to-hire ratios
- XP level distribution
- Platform engagement metrics

## 🔒 Security Features

- JWT token authentication
- bcrypt password hashing
- CORS protection
- Input validation
- Rate limiting (can be added)
- SQL injection protection (MongoDB)

## 🗄️ Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  email: String,
  password: String (hashed),
  userType: "jobseeker" | "employer",
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
  xpLevel: Number,
  totalXP: Number,
  credits: Number,
  isActive: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Jobs Collection
```javascript
{
  _id: ObjectId,
  employerId: ObjectId,
  title: String,
  company: String,
  location: String,
  salary: String,
  type: String,
  experienceLevel: String,
  description: String,
  requirements: String,
  benefits: String,
  tags: [String],
  status: String,
  creditsUsed: Number,
  views: Number,
  applications: Number,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Applications Collection
```javascript
{
  _id: ObjectId,
  jobId: ObjectId,
  candidateId: ObjectId,
  status: String,
  notes: String,
  rating: Number,
  employerNotes: String,
  messages: [{
    sender: ObjectId,
    message: String,
    timestamp: Date
  }],
  appliedAt: Date,
  lastUpdated: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Analytics Collection
```javascript
{
  _id: ObjectId,
  timestamp: Date,
  method: String,
  path: String,
  userAgent: String,
  ip: String,
  userId: String,
  userType: String,
  sessionId: String,
  referrer: String,
  responseTime: Number,
  statusCode: Number,
  error: String,
  customEvent: {
    event: String,
    data: Object
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Environment Variables for Production
- Use strong JWT_SECRET
- Set up MongoDB Atlas or production MongoDB
- Configure AWS S3 for file uploads
- Set up proper CORS origins
- Enable HTTPS

## 📊 Analytics Dashboard

The backend automatically tracks:
- User registrations and logins
- Job postings and applications
- XP gains and level progression
- Platform usage patterns
- Error rates and performance

Access analytics at:
- `/api/analytics/summary` - Overall platform stats
- `/api/analytics/platform-stats` - Public platform statistics

## 🔧 Development

### Adding New Routes
1. Create route file in `routes/` directory
2. Add middleware for authentication if needed
3. Register route in `server.js`

### Adding New Models
1. Create model file in `models/` directory
2. Define schema with proper validation
3. Add indexes for performance

### Testing
```bash
# Add tests to test/ directory
npm test
```

## 📝 License

ISC License

