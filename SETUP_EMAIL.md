# Email Setup Guide for ZeroXP

## Prerequisites
- Gmail account
- MongoDB Atlas account (already set up)

## Step 1: Enable Gmail App Passwords

1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security" → "2-Step Verification"
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Copy the 16-character password

## Step 2: Create Environment File

Create a `.env` file in your project root with:

```env
# Email Configuration (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password

# JWT Secret for password reset tokens
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend URL for password reset links
FRONTEND_URL=http://localhost:5173

# MongoDB Connection (already configured)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zeroxp
```

## Step 3: Test Email Functionality

1. Start the backend server: `node server.js`
2. Start the frontend: `npm run dev`
3. Test forgot password flow:
   - Go to login page
   - Click "Forgot your password?"
   - Enter your email
   - Check your email for reset link

## Security Notes

- Never commit `.env` file to git
- Use strong JWT secrets in production
- App passwords are more secure than regular passwords
- Reset tokens expire after 1 hour

## Troubleshooting

- **"Invalid credentials"**: Check your app password
- **"Network error"**: Ensure backend server is running
- **Email not received**: Check spam folder, verify email address
