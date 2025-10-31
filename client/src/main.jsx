import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx'; 
import './index.css';
import { ClerkProvider } from '@clerk/clerk-react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const CLERK_PUBLISHABLE_KEY = "pk_test_c2VsZWN0ZWQtcGFycm90LTM5LmNsZXJrLmFjY291bnRzLmRldiQ";
const PAYPAL_CLIENT_ID = "AeNGuqcpFpzrOUtho49tMU3vs1el4uvTccOO3z5RXyfte2JbkAT-2sY3Zq-cwiaAstq9FZ6XadxWhFdx";

if (!CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key. Get it from your Clerk Dashboard.");
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
      signInUrl="/dashboard"
      signUpUrl="/dashboard"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      appearance={clerkAppearance}
    >
      <PayPalScriptProvider options={paypalOptions} deferLoading={false}>
        <App />
      </PayPalScriptProvider>
    </ClerkProvider>
  </React.StrictMode>
);
