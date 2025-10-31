import express from 'express';
import { ClerkExpressRequireAuth, clerkClient } from '@clerk/clerk-sdk-node';
import { Octokit } from '@octokit/rest';
import User from '../models/User.js';
const router = express.Router();

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
router.get('/github/repos', ClerkExpressRequireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth;
    const githubToken = await getGithubToken(userId);
    if (!githubToken) {
      return res.status(400).json({ error: 'GitHub account not connected.' });
    }
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
    res.json(repoData);
  } catch (err) {
    console.error('Error fetching repos:', err);
    res.status(500).json({ message: 'Failed to fetch repositories' });
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

export default router;