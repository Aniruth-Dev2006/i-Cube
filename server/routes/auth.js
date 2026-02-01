const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const upload = require('../config/multer');

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Create new user
    const user = await User.create({
      email,
      password,
      name
    });
    
    // Login user after signup
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in after signup' });
      }
      
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture
        }
      });
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login route
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Server error' });
    }
    
    if (!user) {
      return res.status(401).json({ message: info.message || 'Invalid credentials' });
    }
    
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging in' });
      }
      
      res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          picture: user.picture
        }
      });
    });
  })(req, res, next);
});

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to client
    res.redirect(`${process.env.CLIENT_URL}/chat`);
  }
);

// Logout route
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Error logging out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

// Get current user route
router.get('/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        picture: req.user.picture
      }
    });
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
});

// Update profile route
router.put('/profile', upload.single('picture'), async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const { name, email } = req.body;
    const userId = req.user._id;

    // Check if email is being changed and if it's already taken
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already in use' });
      }
    }

    // Update user fields
    const updateData = { name, email };
    
    // If file was uploaded, update picture path
    if (req.file) {
      updateData.picture = `/uploads/profiles/${req.file.filename}`;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        email: updatedUser.email,
        name: updatedUser.name,
        picture: updatedUser.picture
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
