const mongoose = require('mongoose');

const LawyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for search functionality
LawyerSchema.index({ name: 'text', domain: 'text' });

module.exports = mongoose.model('Lawyer', LawyerSchema);
