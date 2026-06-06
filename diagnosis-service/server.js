require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

// Establish MongoDB connection if URI is available
const mongodbUri = process.env.MONGODB_URI;
if (mongodbUri) {
  mongoose.connect(mongodbUri)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('WARNING: MONGODB_URI is not defined in the environment. Session endpoints will run in mock mode.');
}

// Routes
app.use('/api', require('./routes/diagnose'));
app.use('/api', require('./routes/mentor'));
app.use('/api', require('./routes/session'));
app.use('/api', require('./routes/faculty'));


app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
