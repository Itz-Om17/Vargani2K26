require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const donorsRouter = require('./routes/donors');
const receiptsRouter = require('./routes/receipts');

const app = express();
const PORT = process.env.PORT || 5000;

// Cached database connection for Serverless environments (Vercel)
let isConnected = false;
async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  if (!process.env.MONGODB_URI) {
    console.warn('⚠️ MONGODB_URI is not set in environment variables');
    throw new Error('MONGODB_URI environment variable is missing. Please add it to your Vercel Project Settings.');
  }
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
  console.log('✅ MongoDB Connected');
}

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serverless DB connection middleware
app.use(async (req, res, next) => {
  // Let health checks bypass database connection requirement
  if (req.path === '/api/health' || req.path === '/health' || req.path === '/' || req.path === '/api') {
    return next();
  }
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    res.status(500).json({
      success: false,
      message: 'डेटाबेस जोडणी अयशस्वी: कृपया MONGODB_URI तपासा.',
      error: err.message
    });
  }
});

// Static files for generated PDFs (local environment)
app.use('/pdfs', express.static(path.join(__dirname, 'generated_pdfs')));

// Routes mounted with /api
app.use('/api/donors', donorsRouter);
app.use('/api/receipts', receiptsRouter);

// Also mount routes without /api prefix for flexibility in standalone Vercel deployments
app.use('/donors', donorsRouter);
app.use('/receipts', receiptsRouter);

// Health check endpoints
const healthHandler = (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : (mongoose.connection.readyState === 2 ? 'connecting' : 'disconnected');
  res.json({
    status: 'ok',
    message: '🙏 समर्थ मित्र मंडळ सर्व्हर चालू आहे!',
    database: dbStatus,
    timestamp: new Date()
  });
};

app.get('/api/health', healthHandler);
app.get('/health', healthHandler);
app.get(['/api', '/'], (req, res) => {
  res.json({
    status: 'ok',
    message: '🙏 समर्थ मित्र मंडळ API चालू आहे!',
    endpoints: ['/api/health', '/api/donors', '/api/receipts'],
    timestamp: new Date()
  });
});

// Start HTTP server only when running directly (node server/index.js), not when required by Vercel
if (!process.env.VERCEL && require.main === module) {
  connectDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        console.log(`📄 API Health: http://localhost:${PORT}/api/health`);
      });
    })
    .catch((err) => {
      console.warn('⚠️ Server listening, but MongoDB connection pending:', err.message);
      app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
      });
    });
}

module.exports = app;
