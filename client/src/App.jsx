import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { SignedIn, SignedOut, ClerkLoaded } from '@clerk/clerk-react';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Pricing from './pages/Pricing.jsx';
import Navbar from './components/Navbar.jsx';

import Dashboard from './pages/Dashboard.jsx'; 

import { Outlet } from 'react-router-dom';
function PublicLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}

function PrivateRoutes() {
  const navigate = useNavigate();

  return (
    <>
      <SignedIn>
        <Dashboard />
      </SignedIn>
      <SignedOut>
        {navigate('/')}
      </SignedOut>
    </>
  );
}

function App() {
  return (
    <Router>
      <ClerkLoaded>
        <Routes>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>
          <Route
            path="/dashboard"
            element={<PrivateRoutes />}
          />
        </Routes>
      </ClerkLoaded>
    </Router>
  );
}

export default App;
