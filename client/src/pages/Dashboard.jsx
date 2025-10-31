import React from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';
import RepoSelector from './RepoSelector'; // 1. Import your new component

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
        <h1 className="text-xl font-bold">
          <span className="text-blue-400">GenSec</span> Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <span className="text-sm">Welcome, {user?.username}!</span>
          <UserButton afterSignOutRedirectUrl="/" />
        </div>
      </header>

      <main className="p-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-6">
          Your Repositories
        </h2>
        
        <RepoSelector />
        
      </main>
    </div>
  );
}