import React from 'react';
import { SignInButton } from '@clerk/clerk-react';
import { Github, X } from 'lucide-react';

export default function CustomSignIn({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* GitHub Authentication */}
        <div>
          <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight text-center">
            Sign In with GitHub
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6"></div>
          <p className="text-gray-400 text-center mb-6">
            Sign in or create an account to get started
          </p>

          <SignInButton mode="modal" forceRedirectUrl="/dashboard">
            <button className="w-full py-4 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white font-semibold uppercase tracking-wider hover:from-gray-700 hover:via-gray-800 hover:to-gray-700 transition-all duration-200 border-2 border-gray-700 hover:border-white rounded-lg flex items-center justify-center gap-3">
              <Github className="h-5 w-5" />
              <span>Continue with GitHub</span>
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}

