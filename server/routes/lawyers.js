const express = require('express');
const router = express.Router();
const Lawyer = require('../models/Lawyer');

// Get all lawyers with search and filter
router.get('/', async (req, res) => {
  try {
    const { search, domain } = req.query;
    let query = {};

    // If search term is provided, use text search
    if (search) {
      query.$text = { $search: search };
    }

    // If domain filter is provided
    if (domain && domain !== 'All') {
      query.domain = domain;
    }

    const lawyers = await Lawyer.find(query)
      .sort(search ? { score: { $meta: 'textScore' } } : { name: 1 });

    res.json({
      success: true,
      count: lawyers.length,
      data: lawyers
    });
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching lawyers',
      error: error.message
    });
  }
});

// Get unique domains
router.get('/domains', async (req, res) => {
  try {
    const domains = await Lawyer.distinct('domain');
    res.json({
      success: true,
      data: domains.sort()
    });
  } catch (error) {
    console.error('Error fetching domains:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching domains',
      error: error.message
    });
  }
});

// Seed lawyers data (for initial setup)
router.post('/seed', async (req, res) => {
  try {
    const { lawyers } = req.body;

    if (!lawyers || !Array.isArray(lawyers)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of lawyers'
      });
    }

    // Clear existing data
    await Lawyer.deleteMany({});

    // Insert new data
    const result = await Lawyer.insertMany(lawyers);

    res.json({
      success: true,
      message: `Successfully seeded ${result.length} lawyers`,
      count: result.length
    });
  } catch (error) {
    console.error('Error seeding lawyers:', error);
    res.status(500).json({
      success: false,
      message: 'Error seeding lawyers',
      error: error.message
    });
  }
});

module.exports = router;
