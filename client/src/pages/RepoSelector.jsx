import React, { useState, useEffect } from 'react';
import { List, Check, Loader2 } from 'lucide-react'; 
import { useAuth } from '@clerk/clerk-react'; 

function RepoSelector() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRepos, setSelectedRepos] = useState(new Set());
  
  const { getToken } = useAuth(); // Get the getToken function from Clerk

  useEffect(() => {
    async function fetchRepos() {
      try {
        const token = await getToken(); // Get the session token from Clerk

        if (!token) {
          throw new Error('Not authenticated. Please login again.');
        }

        // Get GitHub token from localStorage if available (from signup)
        const signupDataStr = localStorage.getItem('signupData');
        let githubToken = null;
        if (signupDataStr) {
          try {
            const signupData = JSON.parse(signupDataStr);
            githubToken = signupData.githubToken;
          } catch (e) {
            console.log('No GitHub token in localStorage');
          }
        }

        const headers = {
          'Authorization': `Bearer ${token}` // Send the Clerk token
        };
        
        // Add GitHub token to header if available
        if (githubToken) {
          headers['X-GitHub-Token'] = githubToken;
        }

        const res = await fetch('http://localhost:4000/api/github/repos', {
          headers
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ 
            error: `Server error: ${res.status}`,
            message: `Server error: ${res.status}` 
          }));
          const errorMessage = errorData.message || errorData.error || `Server error: ${res.status}`;
          console.error('Server error details:', errorData);
          throw new Error(errorMessage);
        }

        const data = await res.json();
        setRepos(data);

      } catch (err) {
        console.error('Error fetching repos:', err);
        setError(err.message || 'Failed to fetch repositories. Make sure the server is running and GitHub is connected.');
      } finally {
        setLoading(false);
      }
    }
    fetchRepos();
  }, [getToken]); // Add getToken as a dependency

  // 2. Handle selecting a repo
  const handleSelectRepo = async (repo) => {
    if (selectedRepos.has(repo.id)) return;

    try {
      const token = await getToken(); // Get token for this request too
      const res = await fetch('http://localhost:4000/api/repos/select', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: repo.name,
          repoId: repo.id
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to select repo');
      }
      
      setSelectedRepos(prev => new Set(prev).add(repo.id));

    } catch (err) {
      alert(err.message); // Show a simple alert on error
    }
  };

  // --- Render Functions ---
  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        <p className="ml-4 text-gray-400">Loading Repositories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-900 via-red-800 to-red-900 border-2 border-red-500 text-red-100 p-6 rounded-lg">
        <div className="flex items-center gap-3 mb-2">
          <strong className="text-lg">Error Loading Repositories:</strong>
        </div>
        <p className="text-red-200 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      <ul className="divide-y divide-gray-700">
        {repos.map((repo) => {
          const isSelected = selectedRepos.has(repo.id);
          return (
            <li key={repo.id} className="p-4 flex items-center justify-between">
              <div>
                <a 
                  href={repo.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-lg font-medium text-blue-400 hover:underline"
                >
                  {repo.name}
                </a>
                {repo.private && (
                  <span className="ml-3 bg-gray-600 text-gray-300 text-xs font-medium px-2 py-0.5 rounded">
                    Private
                  </span>
                )}
              </div>

              <button
                onClick={() => handleSelectRepo(repo)}
                disabled={isSelected}
                className={`
                  px-4 py-2 rounded-md text-sm font-medium flex items-center
                  ${isSelected 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                  }
                `}
              >
                {isSelected ? (
                  <Check className="w-4 h-4 mr-2" />
                ) : (
                  <List className="w-4 h-4 mr-2" />
                )}
                {isSelected ? 'Selected' : 'Select'}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default RepoSelector;