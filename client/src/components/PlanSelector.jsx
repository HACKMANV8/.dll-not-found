import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { X } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api.js';

export default function PlanSelector({ isOpen, onClose }) {
  const [selectedPlan, setSelectedPlan] = useState('');
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Reset selected plan when modal opens (allows changing plan each time)
  useEffect(() => {
    if (isOpen) {
      setSelectedPlan('');
    }
  }, [isOpen]);

  const handlePlanSelect = async (plan) => {
    setSelectedPlan(plan);
    
    // For Pro plan, redirect to pricing page with PayPal
    if (plan === 'Pro') {
      // Don't mark setup as complete - allows changing on next sign-in
      localStorage.setItem('pendingPlan', plan);
      onClose();
      navigate('/pricing');
      return;
    }
    
    // For Enterprise, show contact form or redirect
    if (plan === 'Enterprise') {
      onClose();
      // You can redirect to a contact page or show a form
      window.location.href = 'mailto:contact@gensec.com?subject=Enterprise%20Plan%20Inquiry';
      return;
    }
    
    // For Free plan, update user plan and continue to dashboard
    if (plan === 'Free') {
      try {
        const token = await getToken();
        if (token) {
          const res = await fetch(API_ENDPOINTS.UPDATE_PLAN, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              plan: 'FREE'
            })
          });

          if (res.ok) {
            // Plan updated successfully - don't set setupComplete
            // This allows user to change plan/token on next sign-in
            onClose();
            // Reload to refresh dashboard with new plan
            window.location.reload();
          }
        }
      } catch (err) {
        console.error('Error updating plan:', err);
        alert('Failed to update plan. Please try again.');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

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
              disabled={selectedPlan !== ''}
              className="w-full py-4 bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800 text-white font-semibold uppercase tracking-wider hover:from-gray-700 hover:via-gray-800 hover:to-gray-700 transition-all duration-200 border-2 border-gray-700 hover:border-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Free - $0/month
            </button>
            <button
              onClick={() => handlePlanSelect('Pro')}
              disabled={selectedPlan !== ''}
              className="w-full py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white font-semibold uppercase tracking-wider hover:from-blue-700 hover:via-blue-800 hover:to-blue-700 transition-all duration-200 border-2 border-blue-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Pro - $29/month
            </button>
            <button
              onClick={() => handlePlanSelect('Enterprise')}
              disabled={selectedPlan !== ''}
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-purple-700 to-purple-600 text-white font-semibold uppercase tracking-wider hover:from-purple-700 hover:via-purple-800 hover:to-purple-700 transition-all duration-200 border-2 border-purple-500 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Enterprise - Custom
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

