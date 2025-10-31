import React, { useState, useEffect } from 'react';
import { List, Check, Loader2 } from 'lucide-react'; 
import { useAuth } from '@clerk/clerk-react';
import ScanButton from '../components/ScanButton';
import { API_ENDPOINTS } from '../config/api.js'; 

function RepoSelector() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRepos, setSelectedRepos] = useState(new Set());
  const [userPlan, setUserPlan] = useState(null);
  const [maxRepos, setMaxRepos] = useState(1); // Default to FREE limit
  const [userInfo, setUserInfo] = useState(null);
  
  const { getToken } = useAuth(); // Get the getToken function from Clerk

  // Fetch user plan and selected repos
  useEffect(() => {
    async function fetchUserInfo() {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch(API_ENDPOINTS.ME, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setUserInfo(data);
          
          // Determine max repos based on plan
          const plan = (data.plan || 'FREE').toUpperCase();
          let max = 1; // Default to FREE
          if (plan === 'FREE') {
            max = 1;
          } else if (plan === 'PRO') {
            max = 3;
          } else if (plan === 'ENTERPRISE') {
            max = 9999; // Unlimited
          }
          
          setMaxRepos(max);
          setUserPlan(plan);
          
          // Load only manually selected repos from database
          // Users must manually select repos - NO auto-selection
          // Convert repoId to string for consistent comparison (GitHub API returns numbers)
          if (data.selectedRepos && Array.isArray(data.selectedRepos) && data.selectedRepos.length > 0) {
            // Filter out any invalid repos and map to string IDs
            const validRepos = data.selectedRepos
              .filter(repo => repo && repo.repoId != null && repo.repoId !== '' && repo.name != null && repo.name !== '')
              .map(repo => String(repo.repoId));
            
            if (validRepos.length > 0) {
              // User has manually selected repos - load them
              const selected = new Set(validRepos);
              setSelectedRepos(selected);
              console.log('Loaded manually selected repos:', validRepos.length);
            } else {
              // No valid repos - start with empty selection
              setSelectedRepos(new Set());
              console.log('No valid repos found - starting with 0 selected');
            }
          } else {
            // No repos selected in database - start with empty selection
            setSelectedRepos(new Set());
            console.log('No repos selected - starting with 0 selected');
          }
        }
      } catch (err) {
        console.error('Error fetching user info:', err);
      }
    }

    fetchUserInfo();
  }, [getToken]);

  useEffect(() => {
    async function fetchRepos() {
      try {
        const token = await getToken(); // Get the session token from Clerk

        if (!token) {
          throw new Error('Not authenticated. Please login again.');
        }

        // Get GitHub token from localStorage (check both signupData and persistent githubToken key)
        let githubToken = null;
        
        // First check for persistent token (highest priority - allows switching accounts)
        githubToken = localStorage.getItem('githubToken');
        if (githubToken) {
          console.log('✅ Using GitHub token from localStorage (githubToken key):', githubToken.substring(0, 10) + '...');
        }
        
        // If not found, check signupData
        if (!githubToken) {
          const signupDataStr = localStorage.getItem('signupData');
          if (signupDataStr) {
            try {
              const signupData = JSON.parse(signupDataStr);
              githubToken = signupData.githubToken;
              if (githubToken) {
                console.log('✅ Using GitHub token from signupData:', githubToken.substring(0, 10) + '...');
              }
            } catch (e) {
              console.log('No GitHub token in signupData');
            }
          }
        }

        const headers = {
          'Authorization': `Bearer ${token}` // Send the Clerk token
        };
        
        // Add GitHub token to header if available (this is CRITICAL - it takes highest priority on server)
        if (githubToken) {
          headers['X-GitHub-Token'] = githubToken;
          console.log('🚀 Sending GitHub token in X-GitHub-Token header');
          console.log('Token being sent:', githubToken.substring(0, 10) + '...' + githubToken.substring(githubToken.length - 5));
        } else {
          console.warn('⚠️ No GitHub token found in localStorage - will use Clerk OAuth token or database token');
          console.log('Available localStorage keys:', Object.keys(localStorage));
        }

        const res = await fetch(API_ENDPOINTS.GITHUB_REPOS, {
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

  // Handle selecting or deselecting a repo
  const handleToggleRepo = async (repo) => {
    const repoIdStr = String(repo.id);
    const isCurrentlySelected = selectedRepos.has(repoIdStr);

    // If already selected, deselect it
    if (isCurrentlySelected) {
      try {
        const token = await getToken();
        const res = await fetch(API_ENDPOINTS.REPOS_DESELECT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            repoId: repo.id
          }),
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: 'Failed to deselect repo' }));
          throw new Error(errorData.message || errorData.error || 'Failed to deselect repo');
        }
        
        const userData = await res.json();
        // Update selected repos from server response
        if (userData.selectedRepos && Array.isArray(userData.selectedRepos)) {
          const selected = new Set(userData.selectedRepos.map(r => String(r.repoId)));
          setSelectedRepos(selected);
        } else {
          setSelectedRepos(prev => {
            const newSet = new Set(prev);
            newSet.delete(repoIdStr);
            return newSet;
          });
        }
      } catch (err) {
        alert(err.message);
      }
      return;
    }

    // If not selected, try to select it (check plan limit first)
    if (selectedRepos.size >= maxRepos) {
      alert(`You have reached your plan limit (${maxRepos} repo${maxRepos !== 1 ? 's' : ''}). Please upgrade your plan to select more repositories.`);
      return;
    }

    try {
      const token = await getToken();
      const res = await fetch(API_ENDPOINTS.REPOS_SELECT, {
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
        const errorData = await res.json().catch(() => ({ message: 'Failed to select repo' }));
        throw new Error(errorData.message || errorData.error || 'Failed to select repo');
      }
      
      const userData = await res.json();
      // Update selected repos from server response
      if (userData.selectedRepos && Array.isArray(userData.selectedRepos)) {
        const selected = new Set(userData.selectedRepos.map(r => String(r.repoId)));
        setSelectedRepos(selected);
      } else {
        setSelectedRepos(prev => new Set([...prev, repoIdStr]));
      }

    } catch (err) {
      alert(err.message);
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

  // Calculate if user can select more repos (must be below plan limit)
  const canSelectMore = selectedRepos.size < maxRepos;
  // Count only manually selected repos (no auto-selection)
  const currentCount = selectedRepos.size;
  
  // Debug log to verify count
  if (currentCount > 0) {
    console.log('Current selected repos count:', currentCount, 'out of', maxRepos);
  } else {
    console.log('No repos selected - count is 0');
  }

  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700">
      {/* Plan limit info */}
      {userPlan && (
        <div className="p-4 border-b border-gray-700 bg-gray-900">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              Plan: <span className="font-semibold text-white">{userPlan}</span>
            </span>
            <span className="text-sm text-gray-400">
              Selected: <span className="font-semibold text-white">{currentCount}</span> / <span className="font-semibold text-white">{maxRepos === 9999 ? 'Unlimited' : maxRepos}</span>
            </span>
          </div>
          {!canSelectMore && (
            <p className="text-xs text-yellow-400 mt-2">
              You've reached your plan limit. Upgrade to select more repositories.
            </p>
          )}
        </div>
      )}
      
      <ul className="divide-y divide-gray-700">
        {repos.map((repo) => {
          // Convert repo.id to string for consistent comparison
          const repoIdStr = String(repo.id);
          const isSelected = selectedRepos.has(repoIdStr);
          // Allow clicking on selected repos to deselect them
          // Only disable if not selected AND can't select more
          const isDisabled = !isSelected && !canSelectMore;
          
                 return (
                   <li key={repo.id} className="p-4 flex items-center justify-between gap-4">
                     <div className="flex-1">
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

                     <div className="flex items-center gap-3">
                       {isSelected && (
                         <ScanButton repoName={repo.name} repoUrl={repo.url} />
                       )}
                       <button
                         onClick={() => handleToggleRepo(repo)}
                         disabled={isDisabled}
                         className={`
                           px-4 py-2 rounded-md text-sm font-medium flex items-center transition-colors
                           ${isSelected
                             ? 'bg-green-600 text-white hover:bg-red-600'
                             : isDisabled
                             ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                             : 'bg-blue-600 text-white hover:bg-blue-700'
                           }
                         `}
                       >
                         {isSelected ? (
                           <>
                             <Check className="w-4 h-4 mr-2" />
                             <span>Unselect</span>
                           </>
                         ) : (
                           <>
                             <List className="w-4 h-4 mr-2" />
                             <span>Select</span>
                           </>
                         )}
                       </button>
                     </div>
                   </li>
                 );
        })}
      </ul>
    </div>
  );
}

export default RepoSelector;