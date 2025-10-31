import React, { useState, useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { Key, X, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api.js';

export default function GitHubTokenCollector({ isOpen, onClose }) {
  const [githubToken, setGithubToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  const { user } = useUser();
  const navigate = useNavigate();

  // Reset token input when modal opens (allows changing token each time)
  useEffect(() => {
    if (isOpen) {
      setGithubToken('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleContinue = async () => {
    if (!githubToken || githubToken.trim().length < 20) {
      setError('Please enter a valid GitHub Personal Access Token (minimum 20 characters)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      const trimmedToken = githubToken.trim();
      
      // Save token to localStorage
      localStorage.setItem('githubToken', trimmedToken);
      
      // Save token to backend via signup-data endpoint
      const res = await fetch(API_ENDPOINTS.SIGNUP_DATA, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          plan: 'FREE', // Default to FREE if no plan selected yet
          email: user?.emailAddresses[0]?.emailAddress || user?.primaryEmailAddress?.emailAddress || '',
          githubToken: trimmedToken
        })
      });

      if (res.ok) {
        // Token saved successfully
        setLoading(false);
        // Don't reload yet - let the plan selector show first
        onClose();
      } else {
        throw new Error('Failed to save GitHub token');
      }
    } catch (err) {
      console.error('Error saving GitHub token:', err);
      setError(err.message || 'Failed to save GitHub token. Please try again.');
      setLoading(false);
    }
  };

  const handleSkip = () => {
    // Allow user to skip and add token later
    // Don't set hasSkippedGitHubToken so they'll be asked again next time
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        <div>
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight text-center">
            Link Your GitHub Account
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6"></div>
          <p className="text-gray-400 text-center mb-6">
            Enter your GitHub Personal Access Token to access your repositories
          </p>

          <div className="space-y-4">
            {/* GitHub Token Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <Key className="h-4 w-4" />
                GitHub Personal Access Token
              </label>
              <input
                type="password"
                value={githubToken}
                onChange={(e) => {
                  setGithubToken(e.target.value);
                  if (error) setError('');
                }}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {error && (
                <p className="text-red-400 text-sm mt-1">{error}</p>
              )}
              <p className="text-xs text-gray-500 mt-2">
                <a 
                  href="https://github.com/settings/tokens" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  Generate a token here
                </a>
                {' '}(make sure to select 'repo' scope)
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleSkip}
                disabled={loading}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip for Now
              </button>
              <button
                onClick={handleContinue}
                disabled={loading || !githubToken || githubToken.trim().length < 20}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Connect</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

