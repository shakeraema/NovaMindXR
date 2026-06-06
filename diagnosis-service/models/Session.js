const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  studentId: String,
  misconceptionType: String,
  domain: String,
  sceneConfig: Object,
  interactions: [{ role: String, content: String, timestamp: Date }],
  understandingScores: Object,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Session', SessionSchema);
