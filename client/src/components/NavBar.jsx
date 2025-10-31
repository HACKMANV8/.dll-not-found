import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Github } from 'lucide-react';
import CustomSignIn from './CustomSignIn';

export default function Navbar() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <>
      <nav className="w-full bg-gray-900 text-white p-4 flex items-center justify-between border-b border-gray-700">
        {/* Logo - Left */}
        <div className="flex items-center space-x-3 min-w-[250px]">
          <img src="/logo_sec.png" alt="GenSec Logo" className="h-20 w-20" />
          <Link to="/" className="text-2xl font-bold">GenSec</Link>
        </div>

        {/* Navigation Links - Center */}
        <div className="hidden md:flex items-center justify-center space-x-10 flex-1">
          <Link to="/" className="text-xl hover:text-gray-300 transition-colors font-medium">Home</Link>
          <Link to="/pricing" className="text-xl hover:text-gray-300 transition-colors font-medium">Pricing</Link>
          <Link to="/about" className="text-xl hover:text-gray-300 transition-colors font-medium">About</Link>
          <SignedIn>
            <Link to="/dashboard" className="text-xl font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Dashboard
            </Link>
          </SignedIn>
        </div>

        {/* Login Button - Right */}
        <div className="flex items-center justify-end min-w-[250px]">
          <SignedOut>
            <button
              onClick={() => setShowSignIn(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 transition-colors text-base"
            >
              <Github className="h-5 w-5" />
              <span>Login</span>
            </button>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </nav>
      
      <CustomSignIn isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </>
  );
}