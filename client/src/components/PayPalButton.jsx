import React, { useState, useEffect } from 'react';
import { PayPalButtons, usePayPalScriptReducer } from '@paypal/react-paypal-js';
import { CheckCircle, X } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api.js';

export default function PayPalButton({ plan, amount }) {
  const [{ isPending, isResolved, isRejected }] = usePayPalScriptReducer();
  const [showSuccess, setShowSuccess] = useState(false);
  const { getToken, isSignedIn } = useAuth();
  const navigate = useNavigate();

  // Check for pending plan from signup flow
  useEffect(() => {
    const pendingPlan = localStorage.getItem('pendingPlan');
    if (pendingPlan === 'Pro' && plan === 'Pro' && !isSignedIn) {
      // User came from signup flow but not signed in yet
      // They'll need to complete signup first
      console.log('Pending Pro plan - user needs to sign up first');
    }
  }, [plan, isSignedIn]);

  const createOrder = async (data, actions) => {
    if (amount === 0) {
      return Promise.resolve();
    }
    
    return actions.order.create({
      purchase_units: [
        {
          description: `GenSec ${plan} Plan`,
          amount: {
            value: amount.toString(),
            currency_code: 'USD',
          },
        },
      ],
    });
  };

  const onApprove = async (data, actions) => {
    try {
      const order = await actions.order.capture();
      console.log('Payment successful:', order);
      
      // If user is signed in, update their plan
      if (isSignedIn && plan === 'Pro') {
        const token = await getToken();
        if (token) {
          // Clear pending plan from localStorage
          localStorage.removeItem('pendingPlan');
          
          // Update user plan to Pro
                const res = await fetch(API_ENDPOINTS.UPDATE_PLAN, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              plan: 'PRO',
              paymentId: order.id
            })
          });
          
          if (res.ok) {
            console.log('Plan updated to Pro successfully');
            // Redirect to dashboard after successful payment
            setTimeout(() => {
              navigate('/dashboard');
              window.location.reload();
            }, 2000);
          }
        }
      } else if (plan === 'Pro' && !isSignedIn) {
        // Store payment info for after signup
        localStorage.setItem('pendingPlan', 'Pro');
        localStorage.setItem('paymentId', order.id);
      }
      
      setShowSuccess(true);
    } catch (err) {
      console.error('Error processing payment:', err);
    }
  };

  const onError = (err) => {
    console.error('PayPal Error:', err);
  };

  // For free tier, show a simple button
  if (amount === 0) {
    return (
      <button 
        onClick={() => {}}
        className="w-full py-4 bg-gradient-to-r from-white via-gray-200 to-white text-black font-black uppercase tracking-wider hover:from-gray-200 hover:via-gray-300 hover:to-gray-200 transition-all duration-200 border-2 border-white shadow-lg hover:shadow-xl hover:scale-105"
      >
        Get Started
      </button>
    );
  }

  // Show loading state while PayPal script is loading
  if (isPending) {
    return (
      <button 
        disabled
        className="w-full py-4 bg-gradient-to-r from-gray-400 via-gray-500 to-gray-400 text-white font-black uppercase tracking-wider border-2 border-gray-500 cursor-not-allowed"
      >
        Loading PayPal...
      </button>
    );
  }

  // If PayPal script failed to load, show error and retry option
  if (isRejected) {
    return (
      <div className="w-full">
        <button 
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white font-black uppercase tracking-wider hover:from-red-700 hover:via-red-800 hover:to-red-700 transition-all duration-200 border-2 border-red-500 shadow-lg"
        >
          PayPal Error - Click to Retry
        </button>
        <p className="text-xs text-red-400 mt-2 text-center">Check console for errors</p>
      </div>
    );
  }

  // Render PayPal button with "Get Pro" overlay
  return (
    <>
      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-white rounded-lg p-8 max-w-md w-full mx-4 shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => setShowSuccess(false)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-green-500 rounded-full p-4">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center">
              <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
                Payment Successful!
              </h2>
              <p className="text-xl text-gray-300 mb-2">
                Welcome to GenSec
              </p>
              <p className="text-2xl font-bold text-white mb-6">
                {plan} Plan
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-6"></div>
              <button
                onClick={() => setShowSuccess(false)}
                className="px-8 py-3 bg-gradient-to-r from-white via-gray-200 to-white text-black font-black uppercase tracking-wider hover:from-gray-200 hover:via-gray-300 hover:to-gray-200 transition-all duration-200 border-2 border-white rounded-lg shadow-lg hover:shadow-xl hover:scale-105"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PayPal Button */}
      <div className="w-full relative" style={{ height: '55px' }}>
        {/* PayPal Button */}
        <div className="absolute inset-0 z-0">
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
            forceReRender={[amount]}
            style={{ height: 55 }}
          />
        </div>
        {/* "Get Pro" text overlay - lets clicks pass through */}
        <div 
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ 
            background: 'linear-gradient(to right, white, rgb(229, 231, 235), white)',
            border: '2px solid white',
            borderRadius: '0.5rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          }}
        >
          <span className="text-black font-black uppercase tracking-wider text-lg">Get Pro</span>
        </div>
      </div>
    </>
  );
}


