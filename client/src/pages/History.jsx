import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import DashboardNavBar from '../components/DashboardNavBar';
import { CheckCircle, XCircle, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api.js';

export default function History() {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const { getToken } = useAuth();

  useEffect(() => {
    async function fetchHistory() {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch(API_ENDPOINTS.SCAN_HISTORY, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setScans(data);
        }
      } catch (err) {
        console.error('Error fetching scan history:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [getToken]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-blue-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'scanning':
        return 'Scanning';
      case 'fixing':
        return 'Fixing';
      case 'verifying':
        return 'Verifying';
      case 'creating_pr':
        return 'Creating PR';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-blue-400';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <DashboardNavBar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-black mb-2 uppercase tracking-tight">
            Scan History
          </h1>
          <p className="text-base text-gray-400">
            View your security scan history and vulnerability fixes
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="ml-4 text-gray-400">Loading scan history...</p>
          </div>
        ) : scans.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 p-10 rounded-lg">
            <p className="text-gray-400 text-center">No scan history yet. Start scanning your repositories to see results here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {scans.map((scan) => (
              <div
                key={scan.scanId}
                className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-gray-800 p-6 rounded-lg hover:border-gray-700 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">{scan.repoName}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(scan.status)} bg-gray-800`}>
                        {scan.plan}
                      </span>
                    </div>
                    {scan.findings && scan.findings.message && (
                      <p className="text-sm text-gray-300 mb-2">
                        {scan.findings.message}
                      </p>
                    )}
                    {scan.findings && scan.findings.filePath && (
                      <p className="text-xs text-gray-500">
                        File: {scan.findings.filePath} (Line {scan.findings.line || 'N/A'})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(scan.status)}
                      <span className={`text-sm font-medium ${getStatusColor(scan.status)}`}>
                        {getStatusText(scan.status)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Started: {formatDate(scan.createdAt)}</span>
                    {scan.completedAt && (
                      <span>Completed: {formatDate(scan.completedAt)}</span>
                    )}
                  </div>
                  {scan.prUrl && (
                    <a
                      href={scan.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>View PR</span>
                    </a>
                  )}
                </div>

                {scan.error && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-800 rounded text-sm text-red-300">
                    Error: {scan.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

