import express from 'express';
import { ClerkExpressRequireAuth, clerkClient } from '@clerk/clerk-sdk-node';
import { Octokit } from '@octokit/rest';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Scan from '../models/Scan.js';
import { runAgent } from '../services/agentService.js';
import { v4 as uuidv4 } from 'uuid';
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
          githubAccessToken: githubToken,
          selectedRepos: [] // Explicitly initialize empty array - users must manually select repos
        });
      await user.save();
    } else {
      // Ensure selectedRepos is always an array and clean up invalid entries
      // Users must manually select repos - no auto-selection
      const originalLength = user.selectedRepos ? (Array.isArray(user.selectedRepos) ? user.selectedRepos.length : 0) : 0;
      
      if (user.selectedRepos && Array.isArray(user.selectedRepos) && user.selectedRepos.length > 0) {
        // Filter out invalid repos
        const filteredRepos = user.selectedRepos.filter(repo => 
          repo && repo.repoId != null && repo.repoId !== '' && repo.name != null && repo.name !== ''
        );
        user.selectedRepos = filteredRepos;
        // Save if we filtered something out
        if (filteredRepos.length !== originalLength) {
          await user.save();
        }
      } else {
        // Ensure selectedRepos is always an array (empty by default)
        if (!user.selectedRepos || !Array.isArray(user.selectedRepos)) {
          user.selectedRepos = [];
          await user.save();
        }
      }
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
    
    let githubToken = null;
    
    // PRIORITY 1: Check for token in request header (manual token from localStorage) - Highest Priority
    // This allows users to use different tokens (e.g., friend's token)
    const headerToken = req.headers['x-github-token'] || req.headers['X-GitHub-Token'];
    if (headerToken) {
      githubToken = headerToken;
      console.log('✅ Using GitHub token from request header (manual token)');
      console.log('Token preview:', headerToken.substring(0, 10) + '...' + headerToken.substring(headerToken.length - 5));
    } else {
      console.log('❌ No token in request header (checking X-GitHub-Token header)');
      
      // PRIORITY 2: Try to get manual token from database
      if (mongoConnected) {
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
      } else {
        console.log('⚠️ MongoDB not connected, skipping database token lookup');
      }
      
      // PRIORITY 3: Last resort - get token from Clerk OAuth (logged-in user's GitHub)
      if (!githubToken) {
        console.log('Attempting to get GitHub token from Clerk OAuth...');
        try {
          githubToken = await getGithubToken(userId);
          console.log('GitHub token from Clerk:', githubToken ? '✅ Found' : '❌ Not found');
        } catch (clerkErr) {
          console.error('Error getting token from Clerk:', clerkErr.message || clerkErr);
        }
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
    
    // Check plan limits
    const plan = (user.plan || 'FREE').toUpperCase();
    let maxRepos = 0;
    if (plan === 'FREE') {
      maxRepos = 1;
    } else if (plan === 'PRO') {
      maxRepos = 3;
    } else if (plan === 'ENTERPRISE') {
      maxRepos = 9999; // Unlimited (very high limit)
    } else {
      maxRepos = 1; // Default to FREE limit
    }
    
    // Check if user has reached their plan limit
    if (user.selectedRepos.length >= maxRepos) {
      return res.status(403).json({ 
        error: 'Plan limit reached',
        message: `You have reached your plan limit (${maxRepos} repo${maxRepos !== 1 ? 's' : ''}). Please upgrade your plan to select more repositories.`,
        plan: plan,
        maxRepos: maxRepos,
        currentCount: user.selectedRepos.length
      });
    }
    
    user.selectedRepos.push({ name, repoId: repoId.toString() });
    await user.save();
    res.json(user);
  } catch (err) {
    console.error('Error selecting repo:', err);
    res.status(500).json({ message: 'Failed to save repository' });
  }
});

// Route: POST /api/repos/deselect
router.post('/repos/deselect', ClerkExpressRequireAuth(), async (req, res) => {
  const { repoId } = req.body;
  if (!repoId) {
    return res.status(400).json({ message: 'Missing repo ID' });
  }
  try {
    const user = await User.findOne({ githubId: req.auth.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found in our DB' });
    }
    
    // Remove the repo from selectedRepos
    const originalLength = user.selectedRepos.length;
    user.selectedRepos = user.selectedRepos.filter(repo => repo && repo.repoId && repo.repoId.toString() !== repoId.toString());
    
    // Save only if something changed
    if (user.selectedRepos.length !== originalLength) {
      await user.save();
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error deselecting repo:', err);
    res.status(500).json({ message: 'Failed to remove repository' });
  }
});

// Route: POST /api/repos/clear-all
// Clear all selected repos (useful for resetting)
router.post('/repos/clear-all', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const user = await User.findOne({ githubId: req.auth.userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found in our DB' });
    }
    
    // Clear all selected repos
    user.selectedRepos = [];
    await user.save();
    
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error clearing all repos:', err);
    res.status(500).json({ message: 'Failed to clear repositories' });
  }
});

// Route: GET /api/github/user
// Get GitHub user info (name, avatar, username) using the token from header or database
router.get('/github/user', (req, res, next) => {
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
    const { userId } = req.auth;
    const mongoConnected = mongoose.connection.readyState === 1;
    
    let githubToken = null;
    
    // PRIORITY 1: Check for token in request header (manual token from localStorage)
    const headerToken = req.headers['x-github-token'] || req.headers['X-GitHub-Token'];
    if (headerToken) {
      githubToken = headerToken;
      console.log('Using GitHub token from header for user info');
    } else {
      // PRIORITY 2: Try to get manual token from database
      if (mongoConnected) {
        try {
          const user = await User.findOne({ githubId: userId });
          if (user && user.githubAccessToken) {
            githubToken = user.githubAccessToken;
            console.log('Using GitHub token from database for user info');
          }
        } catch (dbErr) {
          console.error('Database error when fetching user:', dbErr.message || dbErr);
        }
      }
      
      // PRIORITY 3: Get token from Clerk OAuth
      if (!githubToken) {
        try {
          githubToken = await getGithubToken(userId);
          console.log('Using GitHub token from Clerk OAuth for user info');
        } catch (clerkErr) {
          console.error('Error getting token from Clerk:', clerkErr.message || clerkErr);
        }
      }
    }
    
    if (!githubToken) {
      return res.status(400).json({ 
        error: 'GitHub account not connected', 
        message: 'Please provide a GitHub token.' 
      });
    }
    
    // Fetch GitHub user info
    const octokit = new Octokit({ auth: githubToken });
    const { data: githubUser } = await octokit.users.getAuthenticated();
    
    res.json({
      login: githubUser.login,
      name: githubUser.name || githubUser.login,
      avatar_url: githubUser.avatar_url,
      bio: githubUser.bio,
      company: githubUser.company,
      location: githubUser.location,
      email: githubUser.email
    });
    
  } catch (err) {
    console.error('Error fetching GitHub user info:', err);
    if (err.status === 401) {
      return res.status(401).json({ 
        error: 'Invalid GitHub token', 
        message: 'Your GitHub token is invalid or expired.' 
      });
    }
    res.status(500).json({ 
      error: 'Failed to fetch GitHub user info',
      message: err.message || 'An unexpected error occurred'
    });
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
          selectedRepos: [] // Explicitly initialize empty array - users must manually select repos
        });
      } catch (clerkErr) {
        console.error('Clerk error:', clerkErr);
        // If Clerk fails, create user with minimal data
        user = new User({
          githubId: userId,
          username: email || userId,
          avatarUrl: null,
          selectedRepos: [] // Explicitly initialize empty array - users must manually select repos
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

// Route: POST /api/update-plan
// Update user plan after successful payment
router.post('/update-plan', ClerkExpressRequireAuth(), async (req, res) => {
  const { plan, paymentId } = req.body;
  try {
    const { userId } = req.auth;
    
    if (!plan) {
      return res.status(400).json({ error: 'Plan is required' });
    }
    
    const user = await User.findOne({ githubId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update plan
    user.plan = plan.toUpperCase();
    
    // Store payment ID if provided
    if (paymentId) {
      // You might want to add a paymentHistory field to the User model
      // For now, just log it
      console.log('Payment ID:', paymentId, 'for user:', userId);
    }
    
    await user.save();
    console.log(`User ${userId} plan updated to ${user.plan}`);
    
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error updating plan:', err);
    res.status(500).json({ 
      error: 'Failed to update plan',
      message: err.message || 'An unexpected error occurred'
    });
  }
});

// Route: POST /api/scan/trigger
// Trigger a scan for a specific repository
router.post('/scan/trigger', (req, res, next) => {
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
    const { userId } = req.auth;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Please log in again.'
      });
    }
    const { repoName } = req.body;

    if (!repoName) {
      return res.status(400).json({ error: 'Repository name is required' });
    }

    // Get user and their plan
    const user = await User.findOne({ githubId: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if repo is selected by user
    const repoSelected = user.selectedRepos.some(repo => 
      repo.name === repoName || repo.name.includes(repoName.split('/').pop())
    );

    if (!repoSelected) {
      return res.status(403).json({ 
        error: 'Repository not selected', 
        message: 'Please select this repository before scanning' 
      });
    }

    // Get GitHub token
    let githubToken = req.headers['x-github-token'] || req.headers['X-GitHub-Token'];
    if (!githubToken && user.githubAccessToken) {
      githubToken = user.githubAccessToken;
    }
    if (!githubToken) {
      return res.status(400).json({ 
        error: 'GitHub token required', 
        message: 'Please provide a GitHub token' 
      });
    }

    // Generate scan ID
    const scanId = uuidv4();

    // Create scan record
    const scan = new Scan({
      scanId,
      userId,
      repoName,
      status: 'pending',
      plan: user.plan || 'FREE',
      logs: []
    });
    await scan.save();

    // Start scan asynchronously (don't wait for completion)
    runAgent({
      repoName,
      githubToken,
      userPlan: user.plan || 'FREE',
      groqApiKey: process.env.GROQ_API_KEY
    }, 
    // onLog callback
    (log) => {
      // Update scan with logs
      Scan.findOneAndUpdate(
        { scanId },
        { $push: { logs: log.trim() } },
        { new: true }
      ).catch(err => console.error('Error updating scan logs:', err));
    },
    // onStatusChange callback
    async (status) => {
      try {
        const updateData = { status, updatedAt: new Date() };
        
        // If completed, update with completion time
        if (status === 'completed' || status === 'failed') {
          updateData.completedAt = new Date();
        }
        
        await Scan.findOneAndUpdate(
          { scanId },
          updateData,
          { new: true }
        );
      } catch (err) {
        console.error('Error updating scan status:', err);
      }
    })
    .then(async (result) => {
      // Update scan with results
      // Check if PR was created or if no vulnerabilities were found
      const hasPR = !!result.prUrl;
      const noVulns = result.noVulnerabilities || false;
      
      let finalStatus = result.success ? 'completed' : 'failed';
      let finalFixStatus = 'not_fixed';
      
      if (hasPR) {
        finalFixStatus = 'fixed';
      } else if (noVulns) {
        finalFixStatus = 'not_fixed'; // No vulnerabilities to fix
      } else {
        finalStatus = 'failed'; // Completed but no PR and not "no vulns"
        finalFixStatus = 'failed';
      }
      
      await Scan.findOneAndUpdate(
        { scanId },
        {
          status: finalStatus,
          fixStatus: finalFixStatus,
          prUrl: result.prUrl || null,
          completedAt: new Date(),
          error: result.error || (noVulns ? null : 'Scan completed but no PR was created. Check logs for details.'),
          logs: result.logs || []
        }
      );
    })
    .catch(async (error) => {
      // Update scan with detailed error
      const errorMessage = error.message || 'Unknown error';
      const errorStack = error.stack || '';
      const errorDetails = errorMessage + (errorStack ? `\n\nStack:\n${errorStack}` : '');
      
      console.error(`❌ Scan ${scanId} failed:`, errorMessage);
      if (errorStack) {
        console.error('Error stack:', errorStack);
      }
      
      await Scan.findOneAndUpdate(
        { scanId },
        {
          status: 'failed',
          fixStatus: 'failed',
          error: errorDetails,
          completedAt: new Date()
        }
      );
    });

    // Return scan ID immediately
    res.json({ 
      success: true, 
      scanId,
      message: 'Scan started successfully' 
    });
  } catch (err) {
    console.error('Error triggering scan:', err);
    res.status(500).json({ 
      error: 'Failed to trigger scan', 
      message: err.message || 'An unexpected error occurred' 
    });
  }
});

// Route: GET /api/scan/active
// Get the currently active scan (not completed or failed)
// MUST be before /scan/:scanId routes to avoid route matching issues
router.get('/scan/active', (req, res, next) => {
  // Use Clerk middleware but handle auth errors gracefully
  const authMiddleware = ClerkExpressRequireAuth();
  authMiddleware(req, res, (err) => {
    if (err) {
      // Not authenticated - return null instead of 401
      return res.status(200).json(null);
    }
    next();
  });
}, async (req, res) => {
  try {
    const { userId } = req.auth || {};
    
    if (!userId) {
      // No user authenticated - return null
      return res.status(200).json(null);
    }

    // Find the most recent active scan (not completed or failed)
    const activeScan = await Scan.findOne({
      userId,
      status: { $nin: ['completed', 'failed'] }
    }).sort({ createdAt: -1 });

    if (activeScan) {
      return res.json({
        scanId: activeScan.scanId,
        repoName: activeScan.repoName,
        status: activeScan.status,
        findings: activeScan.findings || null,
        logs: activeScan.logs || [],
        error: activeScan.error || null,
        prUrl: activeScan.prUrl || null,
        createdAt: activeScan.createdAt,
        updatedAt: activeScan.updatedAt
      });
    }

    // No active scan found - return null (not 404)
    return res.status(200).json(null);
  } catch (err) {
    console.error('Error fetching active scan:', err);
    // Return 200 with null instead of 500 to prevent console errors
    return res.status(200).json(null);
  }
});

// Route: GET /api/scan/status/:scanId
// Get scan status and details
router.get('/scan/status/:scanId', (req, res, next) => {
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
    const { userId } = req.auth;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Please log in again.'
      });
    }
    const { scanId } = req.params;

    const scan = await Scan.findOne({ scanId, userId });
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json(scan);
  } catch (err) {
    console.error('Error fetching scan status:', err);
    res.status(500).json({ 
      error: 'Failed to fetch scan status', 
      message: err.message || 'An unexpected error occurred' 
    });
  }
});

// Route: GET /api/scan/history
// Get user's scan history
router.get('/scan/history', (req, res, next) => {
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
    const { userId } = req.auth;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Please log in again.'
      });
    }
    const limit = parseInt(req.query.limit) || 20;

    const scans = await Scan.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('-logs'); // Exclude logs for history view (too large)

    res.json(scans);
  } catch (err) {
    console.error('Error fetching scan history:', err);
    res.status(500).json({ 
      error: 'Failed to fetch scan history', 
      message: err.message || 'An unexpected error occurred' 
    });
  }
});

// Route: GET /api/scan/:scanId/logs
// Get detailed logs for a scan
router.get('/scan/:scanId/logs', (req, res, next) => {
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
    const { userId } = req.auth;
    
    if (!userId) {
      return res.status(401).json({
        error: 'Not authenticated',
        message: 'Please log in again.'
      });
    }
    const { scanId } = req.params;

    const scan = await Scan.findOne({ scanId, userId });
    if (!scan) {
      return res.status(404).json({ error: 'Scan not found' });
    }

    res.json({ logs: scan.logs || [] });
  } catch (err) {
    console.error('Error fetching scan logs:', err);
    res.status(500).json({ 
      error: 'Failed to fetch scan logs', 
      message: err.message || 'An unexpected error occurred' 
    });
  }
});

export default router;