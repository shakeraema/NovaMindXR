const router = require('express').Router();
const mongoose = require('mongoose');
const Session = require('../models/Session');

// In-memory sessions fallback if MongoDB is not connected
const IN_MEMORY_SESSIONS = [];

router.post('/session', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const session = new Session(req.body);
      await session.save();
      res.json({ id: session._id });
    } else {
      const mockId = 'session_' + Math.random().toString(36).substring(2, 11);
      const session = { _id: mockId, ...req.body, createdAt: new Date() };
      IN_MEMORY_SESSIONS.unshift(session);
      res.json({ id: mockId, _debug_info: "Saved to in-memory store (MongoDB not connected)" });
    }
  } catch (err) {
    console.error('Session save error:', err);
    res.status(500).json({ error: 'Session save failed', details: err.message });
  }
});

router.get('/sessions', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const sessions = await Session.find().sort({ createdAt: -1 }).limit(50);
      res.json(sessions);
    } else {
      res.json(IN_MEMORY_SESSIONS.slice(0, 50));
    }
  } catch (err) {
    console.error('Session fetch error:', err);
    res.status(500).json({ error: 'Session fetch failed', details: err.message });
  }
});

module.exports = router;
