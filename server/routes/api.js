import express from 'express';
import { ClerkExpressRequireAuth, clerkClient } from '@clerk/clerk-sdk-node';
import { Octokit } from '@octokit/rest';
import mongoose from 'mongoose';
import User from '../models/User.js';
const router = express.Router();

// Request logging middleware
router.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// --- Helper: Get the user's GitHub Token from Clerk ---
async function getGithubToken(userId) {
  try {
    const tokens = await clerkClient.users.getUserOauthAccessToken(userId, 'oauth_github');
    if (!tokens || tokens.length === 0) {
      throw new Error('No GitHub token found');
    }
    return tokens[0].token; // This is the access token
  } catch (error) {
    console.error('Failed to get GitHub token:', error.message);
    return null;
  }
}

// --- API Routes ---

// Route: GET /api/me
router.get('/me', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    let user = await User.findOne({ githubId: req.auth.userId });
    if (!user) {
      const clerkUser = await clerkClient.users.getUser(req.auth.userId);
      const githubToken = await getGithubToken(req.auth.userId);
      user = new User({
        githubId: clerkUser.id,
        username: clerkUser.username || clerkUser.emailAddresses[0].emailAddress,
        avatarUrl: clerkUser.imageUrl,
        githubAccessToken: githubToken
      });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Route: GET /api/github/repos
router.get('/github/repos', (req, res, next) => {
  // Wrap in try-catch to handle Clerk middleware errors
  const authMiddleware = ClerkExpressRequireAuth();
  authMiddleware(req, res, (err) => {
    if (err) {
      console.error('Clerk auth error:', err);
      return res.status(401).json({ 
        error: 'Authentication failed', 
        message: err.message || 'Please log in again.' 
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('=== Starting repo fetch ===');
    console.log('Request received');
    console.log('req.auth:', req.auth ? 'exists' : 'missing');
    
    // Check authentication
    if (!req.auth || !req.auth.userId) {
      console.error('No userId in request');
      return res.status(401).json({ 
        error: 'Not authenticated', 
        message: 'Please log in again.' 
      });
    }
    
    const { userId } = req.auth;
    console.log('User ID:', userId);
    
    // Check if MongoDB is connected
    console.log('MongoDB connection state:', mongoose.connection.readyState);
    const mongoConnected = mongoose.connection.readyState === 1;
    console.log('MongoDB connected:', mongoConnected ? '✅ Yes' : '❌ No');
    
    // First try to get token from Clerk OAuth
    console.log('Attempting to get GitHub token from Clerk...');
    let githubToken = null;
    try {
      githubToken = await getGithubToken(userId);
      console.log('GitHub token from Clerk:', githubToken ? '✅ Found' : '❌ Not found');
    } catch (clerkErr) {
      console.error('Error getting token from Clerk:', clerkErr.message || clerkErr);
      // Continue to try database token
    }
    
    // If OAuth token not available, try to get manual token from database
    if (!githubToken && mongoConnected) {
      console.log('Trying to get manual token from database...');
      try {
        const user = await User.findOne({ githubId: userId });
        console.log('User found in DB:', user ? 'Yes' : 'No');
        if (user && user.githubAccessToken) {
          githubToken = user.githubAccessToken;
          console.log('✅ Found manual GitHub token in database');
        } else {
          console.log('❌ No manual token in database');
        }
      } catch (dbErr) {
        console.error('❌ Database error when fetching user:', dbErr.message || dbErr);
        // Don't return error, just log it and continue
        console.log('Continuing without database token...');
      }
    } else if (!githubToken && !mongoConnected) {
      console.log('⚠️ MongoDB not connected, skipping database token lookup');
    }
    
    // Last resort: Check for token in request header (temporary fallback)
    if (!githubToken) {
      const headerToken = req.headers['x-github-token'];
      if (headerToken) {
        githubToken = headerToken;
        console.log('✅ Found GitHub token in request header');
      }
    }
    
    if (!githubToken) {
      console.error('❌ No GitHub token available from any source');
      return res.status(400).json({ 
        error: 'GitHub account not connected', 
        message: 'Please provide a GitHub token during signup, connect your GitHub account via Clerk, or pass it in X-GitHub-Token header. Also ensure MongoDB is connected to save tokens.' 
      });
    }
    
    // Validate GitHub token before making API call
    if (!githubToken || githubToken.length < 10) {
      return res.status(400).json({ 
        error: 'Invalid GitHub token', 
        message: 'The provided GitHub token is invalid. Please check your token.' 
      });
    }

    try {
      const octokit = new Octokit({ auth: githubToken });
      const repos = await octokit.repos.listForAuthenticatedUser({
        type: 'all', sort: 'updated', direction: 'desc',
      });
      const repoData = repos.data.map(repo => ({
        id: repo.id,
        name: repo.full_name,
        private: repo.private,
        url: repo.html_url
      }));
      console.log(`Successfully fetched ${repoData.length} repositories`);
      res.json(repoData);
    } catch (githubErr) {
      console.error('GitHub API error:', githubErr);
      // Handle GitHub API specific errors
      if (githubErr.status === 401) {
        return res.status(401).json({ 
          error: 'Invalid GitHub token', 
          message: 'Your GitHub token is invalid or expired. Please provide a new token.' 
        });
      }
      if (githubErr.status === 403) {
        return res.status(403).json({ 
          error: 'GitHub token permissions insufficient', 
          message: 'Your GitHub token does not have permission to access repositories. Please generate a new token with repo scope.' 
        });
      }
      throw githubErr; // Re-throw to be caught by outer catch
    }
  } catch (err) {
    console.error('❌ Error fetching repos:', err);
    console.error('Error type:', err.constructor.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    if (err.response) {
      console.error('GitHub API response status:', err.response.status);
      console.error('GitHub API response data:', err.response.data);
    }
    const errorResponse = {
      error: 'Failed to fetch repositories',
      message: err.message || 'An unexpected error occurred',
    };
    if (err.response) {
      errorResponse.githubError = `GitHub API error: ${err.response.status}`;
      errorResponse.githubDetails = err.response.data;
    }
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = err.stack;
    }
    res.status(500).json(errorResponse);
  }
});

// Route: POST /api/repos/select
router.post('/repos/select', ClerkExpressRequireAuth(), async (req, res) => {
  const { name, repoId } = req.body;
  if (!name || !repoId) {
    return res.status(400).json({ message: 'Missing repo name or ID' });
  }
  try {
    const user = await User.findOne({ githubId: req.auth.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found in our DB' });
    }
    const repoExists = user.selectedRepos.some(repo => repo.repoId === repoId.toString());
    if (repoExists) {
      return res.status(409).json({ message: 'Repository already selected' });
    }
    user.selectedRepos.push({ name, repoId: repoId.toString() });
    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Error selecting repo:', err);
    res.status(500).json({ message: 'Failed to save repository' });
  }
});

// Route: POST /api/signup-data
// Store plan, email, and manual GitHub token collected during signup
router.post('/signup-data', ClerkExpressRequireAuth(), async (req, res) => {
  const { plan, email, githubToken } = req.body;
  try {
    const { userId } = req.auth;
    console.log('Saving signup data for user:', userId);
    
    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      console.error('MongoDB not connected');
      return res.status(503).json({ 
        error: 'Database not connected', 
        message: 'MongoDB connection is required. Please check your database connection.' 
      });
    }
    
    let user = await User.findOne({ githubId: userId });
    
    if (!user) {
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        user = new User({
          githubId: clerkUser.id,
          username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress || email,
          avatarUrl: clerkUser.imageUrl,
        });
      } catch (clerkErr) {
        console.error('Clerk error:', clerkErr);
        // If Clerk fails, create user with minimal data
        user = new User({
          githubId: userId,
          username: email || userId,
          avatarUrl: null,
        });
      }
    }
    
    // Update plan if provided
    if (plan) {
      user.plan = plan.toUpperCase();
    }
    
    // Store manual GitHub token if provided (will be used if OAuth token is not available)
    if (githubToken) {
      user.githubAccessToken = githubToken;
    }
    
    await user.save();
    console.log('Successfully saved signup data');
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error saving signup data:', err);
    console.error('Error details:', err.message, err.stack);
    res.status(500).json({ 
      error: 'Failed to save signup data',
      message: err.message || 'An unexpected error occurred',
      details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

export default router;