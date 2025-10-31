import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserButton, SignedIn } from '@clerk/clerk-react';

export default function DashboardNavBar() {
  const location = useLocation();

  return (
    <nav className="w-full bg-gray-900 text-white p-4 flex items-center justify-between border-b border-gray-700">
      {/* Logo - Left */}
      <div className="flex items-center space-x-3">
        <img src="/logo_sec.png" alt="GenSec Logo" className="h-12 w-12" />
        <Link to="/dashboard" className="text-2xl font-bold">
          GenSec
        </Link>
      </div>

      {/* Navigation Links - Center */}
      <div className="hidden md:flex items-center justify-center space-x-10 flex-1">
        <Link
          to="/dashboard"
          className={`text-xl transition-colors font-medium ${
            location.pathname === '/dashboard'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          Dashboard
        </Link>
        <Link
          to="/dashboard/history"
          className={`text-xl transition-colors font-medium ${
            location.pathname === '/dashboard/history'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          History
        </Link>
      </div>

      {/* Logout Button - Right */}
      <div className="flex items-center justify-end gap-3">
        <UserButton afterSignOutUrl="/" />
      </div>
    </nav>
  );
}

