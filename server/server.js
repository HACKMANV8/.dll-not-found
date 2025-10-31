import 'dotenv/config'; 
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import apiRoutes from './routes/api.js';

const app = express();
const PORT = process.env.PORT || 4000;

// Configure MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/gensec';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️  Server will continue without MongoDB. Some features may not work.');
  });

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// API Routes
app.use('/api', apiRoutes); 

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    clerk: process.env.CLERK_SECRET_KEY ? 'configured' : 'missing'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Global error handler:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server listening on http://localhost:${PORT}`);
  console.log(`📝 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔑 Clerk Secret Key: ${process.env.CLERK_SECRET_KEY ? 'Set' : 'Missing'}`);
  console.log(`📦 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected'}`);
});
