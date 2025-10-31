import React, { useState } from 'react';
import { Key, Check, X } from 'lucide-react';

export default function GitHubTokenUpdater({ onTokenUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!token || token.trim().length < 20) {
      setError('Please enter a valid GitHub token (minimum 20 characters)');
      return;
    }
    
    const trimmedToken = token.trim();
    const oldToken = localStorage.getItem('githubToken');
    
    console.log('=== Updating GitHub Token ===');
    if (oldToken) {
      console.log('Old token:', oldToken.substring(0, 10) + '...');
    }
    console.log('New token:', trimmedToken.substring(0, 10) + '...');
    
    // Clear old token first, then save new one
    localStorage.removeItem('githubToken');
    localStorage.setItem('githubToken', trimmedToken);
    
    // Verify it was saved
    const savedToken = localStorage.getItem('githubToken');
    if (savedToken === trimmedToken) {
      console.log('✅ GitHub token saved and verified successfully');
    } else {
      console.error('❌ Failed to save token correctly');
      setError('Failed to save token. Please try again.');
      return;
    }
    
    setToken('');
    setError('');
    setIsOpen(false);
    
    // Small delay to ensure token is saved before reload
    setTimeout(() => {
      // Notify parent to refresh
      if (onTokenUpdate) {
        onTokenUpdate();
      }
    }, 100);
  };

  const handleCancel = () => {
    setToken('');
    setError('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors text-sm"
      >
        <Key className="h-4 w-4" />
        Update GitHub Token
      </button>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
          <Key className="h-4 w-4" />
          GitHub Personal Access Token
        </label>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      <input
        type="password"
        value={token}
        onChange={(e) => {
          setToken(e.target.value);
          if (error) setError('');
        }}
        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
        className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 mb-2"
      />
      
      {error && (
        <p className="text-red-400 text-sm mb-2">{error}</p>
      )}
      
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center gap-2 transition-colors text-sm"
        >
          <Check className="h-4 w-4" />
          Save
        </button>
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors text-sm"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

