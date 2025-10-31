import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; 
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// Get environment variables from Vite (from root .env file)
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY. Please set it in the root .env file.");
}

if (!PAYPAL_CLIENT_ID) {
  throw new Error("Missing VITE_PAYPAL_CLIENT_ID. Please set it in the root .env file.");
}

console.log('PayPal Client ID:', PAYPAL_CLIENT_ID);

const paypalOptions = {
  clientId: PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "capture",
  components: "buttons",
  "disable-funding": "credit,card"
};

const clerkAppearance = {
  elements: {
    formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
    socialButtonsBlockButton: 'bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white',
    socialButtonsBlockButtonText: 'text-white',
    dividerLine: 'bg-gray-700',
    dividerText: 'text-gray-400'
  },
  layout: {
    socialButtonsPlacement: 'top',
    showOptionalFields: false
  }
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ClerkProvider 
      publishableKey={CLERK_PUBLISHABLE_KEY}
      signInFallbackRedirectUrl="/dashboard"
      signUpFallbackRedirectUrl="/dashboard"
      appearance={clerkAppearance}
    >
      <PayPalScriptProvider options={paypalOptions} deferLoading={false}>
        <App />
      </PayPalScriptProvider>
    </ClerkProvider>
  </React.StrictMode>
);
