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

        const res = await fetch('http://localhost:4000/api/github/repos', {
          headers: {
            'Authorization': `Bearer ${token}` // Send the token
          }
        });
        
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Failed to fetch repos');
        }

        const data = await res.json();
        setRepos(data);

      } catch (err) {
        setError(err.message);
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
      <div className="bg-red-900 border border-red-500 text-red-100 p-4 rounded-lg">
        <strong>Error:</strong> {error}
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