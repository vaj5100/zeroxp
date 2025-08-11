# ZeroXP Job Hunt Platform

A gamified job search platform where job seekers build XP through applications and employers find motivated candidates.

## Features

- **Gamified Job Search**: Job seekers earn XP through applications and activities
- **Priority System**: Higher XP users get priority visibility to employers
- **Email Notifications**: Welcome emails and job alerts based on preferences
- **Employer Dashboard**: Post jobs and review applications
- **Real-time Updates**: Live XP tracking and notifications

## Email System Setup

### 1. Gmail App Password Setup

1. Go to your Google Account settings
2. Enable 2-factor authentication
3. Generate an App Password:
   - Go to Security → App passwords
   - Select "Mail" and your device
   - Copy the generated password

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/zeroxp

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Configuration
PORT=5000
```

### 3. MongoDB Setup

1. Install MongoDB locally or use MongoDB Atlas
2. Create a database named `zeroxp`
3. Update the `MONGODB_URI` in your `.env` file

## Installation

### Backend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the backend server:
```bash
node server.js
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Email Features

### Welcome Emails
- Sent automatically when users register
- Personalized based on user type (job seeker/employer)
- Includes platform features and next steps

### Job Alerts
- Sent when new jobs match user preferences
- Includes job details and direct application links
- Configurable preferences (job types, locations, salary range)

### Email Preferences
Users can configure:
- Job alert frequency
- Email notification settings
- Preferred job types
- Salary range preferences
- Location preferences

## API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login
- `GET /api/users/:id` - Get user profile

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Post new job
- `POST /api/jobs/:id/apply` - Apply to job

### User Preferences
- `PUT /api/users/preferences` - Update email preferences

## Database Schema

### Users
```javascript
{
  email: String,
  password: String,
  userType: 'jobseeker' | 'employer',
  companyName: String,
  firstName: String,
  lastName: String,
  jobHuntXP: Number,
  preferences: {
    jobAlerts: Boolean,
    emailNotifications: Boolean,
    jobTypes: [String],
    locations: [String],
    salaryRange: { min: Number, max: Number },
    skills: [String]
  }
}
```

### Jobs
```javascript
{
  title: String,
  company: String,
  location: String,
  salary: Number,
  description: String,
  tags: [String],
  jobType: String,
  experienceLevel: String,
  postedBy: ObjectId,
  postedAt: Date,
  applicants: [ObjectId]
}
```

## Email Templates

### Welcome Email
- Personalized greeting
- Platform features based on user type
- Call-to-action buttons

### Job Alert Email
- Job title and company
- Location and salary
- Job description preview
- Direct application link

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Input validation
- Rate limiting (recommended for production)

## Production Deployment

### Environment Variables
- Use strong JWT secrets
- Configure production MongoDB URI
- Set up proper email credentials
- Enable HTTPS

### Security Recommendations
- Add rate limiting
- Implement request validation
- Set up monitoring and logging
- Configure CORS properly
- Use environment-specific configurations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
