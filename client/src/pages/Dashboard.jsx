import React, { useEffect, useState } from 'react';
import { useUser, useAuth, SignedIn } from '@clerk/clerk-react';
import DashboardNavBar from '../components/DashboardNavBar';
import RepoSelector from './RepoSelector';
import GitHubTokenUpdater from '../components/GitHubTokenUpdater';
import PlanSelector from '../components/PlanSelector';
import GitHubTokenCollector from '../components/GitHubTokenCollector';
import { API_ENDPOINTS } from '../config/api.js';

export default function Dashboard() {
  const { user: clerkUser } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const [signupDataSent, setSignupDataSent] = useState(false);
  const [githubUser, setGithubUser] = useState(null);
  const [loadingGitHubUser, setLoadingGitHubUser] = useState(true);
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [showGitHubTokenCollector, setShowGitHubTokenCollector] = useState(false);

  useEffect(() => {
    // Send signup data if it exists in localStorage
    async function sendSignupData() {
      const signupDataStr = localStorage.getItem('signupData');
      if (!signupDataStr || signupDataSent) return;

      try {
        const signupData = JSON.parse(signupDataStr);
        const token = await getToken();

        if (token && signupData.plan && signupData.email && signupData.githubToken) {
          const res = await fetch(API_ENDPOINTS.SIGNUP_DATA, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              plan: signupData.plan,
              email: signupData.email,
              githubToken: signupData.githubToken
            })
          });

          if (res.ok) {
            // Save GitHub token to a persistent key before clearing signupData
            if (signupData.githubToken) {
              localStorage.setItem('githubToken', signupData.githubToken);
            }
            // Clear signup data from localStorage after successful send
            localStorage.removeItem('signupData');
            setSignupDataSent(true);
          }
        }
      } catch (err) {
        console.error('Error sending signup data:', err);
      }
    }

    sendSignupData();
  }, [getToken, signupDataSent]);

  // Always show GitHub token collector and plan selector on sign-in
  // This allows users to choose which GitHub account and plan each time they sign in
  useEffect(() => {
    async function showSetupModals() {
      if (!isSignedIn) {
        // Clear session storage on sign-out so modals show again on next sign-in
        sessionStorage.removeItem('sessionModalsShown');
        return;
      }

      try {
        const token = await getToken();
        if (!token) return;

        // Check if modals were already shown in this session
        const modalsShown = sessionStorage.getItem('sessionModalsShown');
        
        if (!modalsShown) {
          // First time in this session - show GitHub token collector first
          sessionStorage.setItem('sessionModalsShown', 'true');
          setShowGitHubTokenCollector(true);
        }
      } catch (err) {
        console.error('Error in setup modals:', err);
      }
    }

    // Small delay to ensure user is fully authenticated
    const timer = setTimeout(() => {
      showSetupModals();
    }, 500);

    return () => clearTimeout(timer);
  }, [isSignedIn, getToken]);

  // Fetch GitHub user info when component mounts or token changes
  useEffect(() => {
    async function fetchGitHubUser() {
      try {
        const token = await getToken();
        if (!token) return;

        // Get GitHub token from localStorage
        let githubToken = localStorage.getItem('githubToken');
        
        // If not found, check signupData
        if (!githubToken) {
          const signupDataStr = localStorage.getItem('signupData');
          if (signupDataStr) {
            try {
              const signupData = JSON.parse(signupDataStr);
              githubToken = signupData.githubToken;
            } catch (e) {
              // Ignore parse errors
            }
          }
        }

        const headers = {
          'Authorization': `Bearer ${token}`
        };
        
        // Add GitHub token to header if available
        if (githubToken) {
          headers['X-GitHub-Token'] = githubToken;
        }

        const res = await fetch(API_ENDPOINTS.GITHUB_USER, {
          headers
        });

        if (res.ok) {
          const data = await res.json();
          setGithubUser(data);
          console.log('GitHub user info loaded:', data.login);
        } else {
          console.warn('Failed to fetch GitHub user info');
        }
      } catch (err) {
        console.error('Error fetching GitHub user info:', err);
      } finally {
        setLoadingGitHubUser(false);
      }
    }

    fetchGitHubUser();
  }, [getToken]);

  // Determine which user info to display (GitHub user if available, otherwise Clerk user)
  const displayUser = githubUser || {
    name: clerkUser?.username || clerkUser?.firstName || 'User',
    avatar_url: clerkUser?.imageUrl
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <SignedIn>
        <GitHubTokenCollector 
          isOpen={showGitHubTokenCollector} 
          onClose={() => {
            setShowGitHubTokenCollector(false);
            // After providing token, show plan selector
            setTimeout(() => {
              setShowPlanSelector(true);
            }, 300);
          }} 
        />
        <PlanSelector 
          isOpen={showPlanSelector} 
          onClose={() => {
            setShowPlanSelector(false);
            // Don't mark setup as complete - allows changing plan/token on next sign-in
          }} 
        />
      </SignedIn>
      <DashboardNavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-black mb-2 uppercase tracking-tight">
            Dashboard
          </h1>
          <div className="flex items-center gap-4">
            {displayUser.avatar_url && (
              <img 
                src={displayUser.avatar_url} 
                alt={displayUser.name}
                className="w-10 h-10 rounded-full border-2 border-gray-700"
              />
            )}
            <p className="text-base text-gray-400">
              Welcome back, {displayUser.name || displayUser.login || 'User'}!
            </p>
          </div>
        </div>

        <main className="mt-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <h2 className="text-xl font-bold text-white">
              Your Repositories
            </h2>
            <div className="flex items-center gap-4">
              <GitHubTokenUpdater onTokenUpdate={() => {
                // Force a page reload to ensure new token is used
                // Small delay to ensure token is saved to localStorage
                setTimeout(() => {
                  window.location.reload();
                }, 150);
              }} />
              {/* Debug: Show current token */}
              {typeof window !== 'undefined' && localStorage.getItem('githubToken') && (
                <span className="text-xs text-gray-500">
                  Using: {localStorage.getItem('githubToken').substring(0, 10)}...
                </span>
              )}
            </div>
          </div>
          
          <RepoSelector />
        </main>
      </div>
    </div>
  );
}