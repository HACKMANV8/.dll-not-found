import React from 'react';
import DashboardNavBar from '../components/DashboardNavBar';

export default function History() {
  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-6xl sm:text-7xl font-black mb-6 uppercase tracking-tighter">
            History
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-white to-transparent mx-auto mb-8"></div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            View your security scan history and vulnerability fixes
          </p>
        </div>

        {/* History content will go here */}
        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 p-10 rounded-lg">
          <p className="text-gray-400 text-center">No scan history yet</p>
        </div>
      </div>
    </div>
  );
}

