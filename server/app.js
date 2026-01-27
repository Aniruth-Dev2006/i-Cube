require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth');
const ragRoutes = require('./routes/rag');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Database connection
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/jurismindDB")
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/rag', ragRoutes);

app.get("/", function(req, res) {
  res.send("Legal Chatbot API Server");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log(`Server is running on port ${PORT}`);
});
