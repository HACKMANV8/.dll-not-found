import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Outlet } from 'react-router-dom';
import { SignedIn, SignedOut, ClerkLoaded, useAuth } from '@clerk/clerk-react';

import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Pricing from './pages/Pricing.jsx';
import Navbar from './components/NavBar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import History from './pages/History.jsx';

function PublicLayout() {
  return (
    <div>
      <Navbar />
      <Outlet />
    </div>
  );
}

function DashboardLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}

function PrivateRoutes() {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSignedIn) {
      navigate('/');
    }
  }, [isSignedIn, navigate]);

  return (
    <>
      <SignedIn>
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </SignedIn>
      <SignedOut>
        <div />
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
          >
            <Route index element={<Dashboard />} />
            <Route path="history" element={<History />} />
          </Route>
        </Routes>
      </ClerkLoaded>
    </Router>
  );
}

export default App;
