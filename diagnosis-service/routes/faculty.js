const router = require('express').Router();
const mongoose = require('mongoose');
const Session = require('../models/Session');

// Mock data fallback if MongoDB is not connected
const MOCK_FACULTY_DATA = {
  totalSessions: 47,
  topMisconceptions: [
    { name: 'Mass vs weight confusion', count: 18 },
    { name: 'Inertia misunderstood', count: 12 },
    { name: 'Force causes motion', count: 9 },
    { name: 'Ohm\'s law confusion', count: 5 },
    { name: 'Buoyancy misconception', count: 3 }
  ],
  recentSessions: [
    { domain: 'physics', misconceptionType: 'Mass vs weight confusion', createdAt: new Date(Date.now() - 3600000) },
    { domain: 'physics', misconceptionType: 'Inertia misunderstood', createdAt: new Date(Date.now() - 7200000) }
  ]
};

router.get('/faculty/summary', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const sessions = await Session.find().sort({ createdAt: -1 }).limit(100);
      
      const misconceptionCounts = {};
      sessions.forEach(s => {
        const key = s.misconceptionType || 'unknown';
        misconceptionCounts[key] = (misconceptionCounts[key] || 0) + 1;
      });
      
      const topMisconceptions = Object.entries(misconceptionCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));
      
      res.json({
        totalSessions: sessions.length,
        topMisconceptions,
        recentSessions: sessions.slice(0, 10).map(s => ({
          domain: s.domain,
          misconceptionType: s.misconceptionType,
          createdAt: s.createdAt
        }))
      });
    } else {
      res.json({
        ...MOCK_FACULTY_DATA,
        _debug_info: "Mock response generated (MongoDB not connected)"
      });
    }
  } catch (err) {
    console.error('Faculty summary error:', err);
    res.status(500).json({ error: 'Faculty summary failed', details: err.message });
  }
});

module.exports = router;
