# SETUP INSTRUCTIONS

## Prerequisites
- Node.js installed
- MongoDB running on localhost:27017

## Google OAuth Setup

1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" and create OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - http://localhost:3000/auth/google/callback
6. Copy your Client ID and Client Secret
7. Update the `.env` file in the server folder with your credentials

## Installation

### Backend
```bash
cd server
npm install
# Update .env file with your Google OAuth credentials
node app.js
```

### Frontend
```bash
cd client
npm install
npm run dev
```

## Environment Variables

Update `server/.env` with:
- GOOGLE_CLIENT_ID: Your Google OAuth Client ID
- GOOGLE_CLIENT_SECRET: Your Google OAuth Client Secret
- SESSION_SECRET: A random secret string for sessions

## Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Features

- Normal Email/Password Signup and Login
- Google OAuth 2.0 Authentication
- Protected Dashboard
- Session Management
- User Profile Display
