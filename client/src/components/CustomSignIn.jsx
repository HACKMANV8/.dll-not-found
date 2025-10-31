import React, { useState } from 'react';
import { SignInButton } from '@clerk/clerk-react';
import { Github, X, Mail, Key } from 'lucide-react';

export default function CustomSignIn({ isOpen, onClose }) {
  const [step, setStep] = useState(1); // 1: Plan, 2: Email & Token, 3: Authenticate
  const [selectedPlan, setSelectedPlan] = useState('');
  const [email, setEmail] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setStep(2);
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!email || !email.includes('@')) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!githubToken || githubToken.trim().length < 20) {
      newErrors.githubToken = 'Please enter a valid GitHub token';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep2()) {
      // Store plan, email, and token in localStorage for backend use
      localStorage.setItem('signupData', JSON.stringify({
        plan: selectedPlan,
        email: email,
        githubToken: githubToken
      }));
      setStep(3);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedPlan('');
    setEmail('');
    setGithubToken('');
    setErrors({});
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

        {/* Step 1: Plan Selection */}
        {step === 1 && (
          <div>
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight text-center">
              Choose Your Plan
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6"></div>
            <p className="text-gray-400 text-center mb-6">
              Select the plan that suits your needs
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handlePlanSelect('Free')}
                className="w-full py-4 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white font-semibold uppercase tracking-wider hover:from-gray-700 hover:via-gray-800 hover:to-gray-700 transition-all duration-200 border-2 border-gray-700 hover:border-white rounded-lg"
              >
                Free - $0/month
              </button>
              <button
                onClick={() => handlePlanSelect('Pro')}
                className="w-full py-4 bg-gradient-to-r from-blue-800 via-blue-900 to-blue-800 text-white font-semibold uppercase tracking-wider hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 transition-all duration-200 border-2 border-blue-700 hover:border-white rounded-lg"
              >
                Pro - $29/month
              </button>
              <button
                onClick={() => handlePlanSelect('Enterprise')}
                className="w-full py-4 bg-gradient-to-r from-purple-800 via-purple-900 to-purple-800 text-white font-semibold uppercase tracking-wider hover:from-purple-700 hover:via-purple-800 hover:to-purple-700 transition-all duration-200 border-2 border-purple-700 hover:border-white rounded-lg"
              >
                Enterprise - Custom
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Email & GitHub Token */}
        {step === 2 && (
          <div>
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight text-center">
              Enter Your Details
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6"></div>
            <p className="text-gray-400 text-center mb-6">
              We need your email and GitHub token to connect your repositories
            </p>

            <div className="space-y-4">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: '' });
                  }}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* GitHub Token Field */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  GitHub Personal Access Token
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => {
                    setGithubToken(e.target.value);
                    if (errors.githubToken) setErrors({ ...errors, githubToken: '' });
                  }}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                {errors.githubToken && (
                  <p className="text-red-400 text-sm mt-1">{errors.githubToken}</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  <a 
                    href="https://github.com/settings/tokens" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    Generate a token here
                  </a>
                </p>
              </div>

              {/* Selected Plan Display */}
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <p className="text-sm text-gray-400">Selected Plan:</p>
                <p className="text-white font-semibold">{selectedPlan}</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleContinue}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 transition-all duration-200"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: GitHub Authentication */}
        {step === 3 && (
          <div>
            <h2 className="text-3xl font-black text-white mb-2 uppercase tracking-tight text-center">
              Authenticate with GitHub
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6"></div>
            <p className="text-gray-400 text-center mb-6">
              Complete your registration by signing in with GitHub
            </p>

            <div className="space-y-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Registration Details:</p>
                <p className="text-white text-sm"><strong>Plan:</strong> {selectedPlan}</p>
                <p className="text-white text-sm"><strong>Email:</strong> {email}</p>
                <p className="text-white text-sm"><strong>GitHub Token:</strong> {githubToken.substring(0, 10)}...</p>
              </div>

              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <button className="w-full py-4 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white font-semibold uppercase tracking-wider hover:from-gray-700 hover:via-gray-800 hover:to-gray-700 transition-all duration-200 border-2 border-gray-700 hover:border-white rounded-lg flex items-center justify-center gap-3">
                  <Github className="h-5 w-5" />
                  <span>Continue with GitHub</span>
                </button>
              </SignInButton>

              <button
                onClick={() => setStep(2)}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

