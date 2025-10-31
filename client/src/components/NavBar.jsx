import React from 'react';
import { Link } from 'react-router-dom';
// 1. Import the Clerk components
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Shield, Github } from 'lucide-react'; // Assuming you have lucide-react

export default function Navbar() {
  return (
    <nav className="w-full bg-gray-900 text-white p-4 flex items-center border-b border-gray-700">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-blue-500" />
        <Link to="/" className="text-xl font-bold">GenSec</Link>
      </div>

      {/* Public Nav Links */}
      <div className="hidden md:flex flex-1 justify-center space-x-8">
        <Link to="/" className="hover:text-gray-300">Home</Link>
        <Link to="/pricing" className="hover:text-gray-300">Pricing</Link>
        <Link to="/about" className="hover:text-gray-300">About</Link>

        {/* 2. Add "Dashboard" link only for signed-in users */}
        <SignedIn>
          <Link to="/dashboard" className="font-semibold text-blue-400">
            Dashboard
          </Link>
        </SignedIn>
      </div>

      <div className="flex-1 flex justify-end">
        <SignedOut>
          <SignInButton mode="modal">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Github className="h-5 w-5" />
              <span>Login</span>
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}