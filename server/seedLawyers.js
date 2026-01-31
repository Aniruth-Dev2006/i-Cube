require('dotenv').config();
const mongoose = require('mongoose');
const Lawyer = require('./models/Lawyer');
const lawyersData = require('./lawyersData');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/jurismindDB")
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Clear existing data
      await Lawyer.deleteMany({});
      console.log('Cleared existing lawyer data');
      
      // Insert new data
      const result = await Lawyer.insertMany(lawyersData);
      console.log(`Successfully seeded ${result.length} lawyers`);
      
      // Close connection
      mongoose.connection.close();
      console.log('Database connection closed');
    } catch (error) {
      console.error('Error seeding data:', error);
      mongoose.connection.close();
    }
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
