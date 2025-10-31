import React, { useEffect, useState } from 'react';
import { useUser, useAuth } from '@clerk/clerk-react';
import DashboardNavBar from '../components/DashboardNavBar';
import RepoSelector from './RepoSelector';

export default function Dashboard() {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [signupDataSent, setSignupDataSent] = useState(false);

  useEffect(() => {
    // Send signup data if it exists in localStorage
    async function sendSignupData() {
      const signupDataStr = localStorage.getItem('signupData');
      if (!signupDataStr || signupDataSent) return;

      try {
        const signupData = JSON.parse(signupDataStr);
        const token = await getToken();

        if (token && signupData.plan && signupData.email && signupData.githubToken) {
          const res = await fetch('http://localhost:4000/api/signup-data', {
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

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-black mb-2 uppercase tracking-tight">
            Dashboard
          </h1>
          <p className="text-base text-gray-400">
            Welcome back, {user?.username || user?.firstName || 'User'}!
          </p>
        </div>

        <main className="mt-8">
          <h2 className="text-xl font-bold text-white mb-4">
            Your Repositories
          </h2>
          
          <RepoSelector />
        </main>
      </div>
    </div>
  );
}