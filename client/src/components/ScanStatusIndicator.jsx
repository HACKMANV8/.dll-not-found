import React, { useState, useEffect } from 'react';
import { useAuth, SignedIn } from '@clerk/clerk-react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api.js';

export default function ScanStatusIndicator() {
  const [activeScan, setActiveScan] = useState(null);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();

  useEffect(() => {
    if (!getToken) return;

    let interval;
    
    async function fetchActiveScan() {
      try {
        const token = await getToken();
        if (!token) return;

        const res = await fetch(API_ENDPOINTS.SCAN_ACTIVE, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.status !== 'completed' && data.status !== 'failed') {
            setActiveScan(data);
          } else {
            setActiveScan(null);
          }
        } else {
          setActiveScan(null);
        }
      } catch (err) {
        console.error('Error fetching active scan:', err);
        setActiveScan(null);
      }
    }

    // Fetch immediately
    fetchActiveScan();

    // Poll every 3 seconds for active scans
    interval = setInterval(fetchActiveScan, 3000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [getToken]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Loader2 className="w-4 h-4 animate-spin text-blue-400" />;
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
      default:
        return status;
    }
  };

  const getRepoName = (repoName) => {
    if (!repoName) return 'Repository';
    const parts = repoName.split('/');
    return parts.length > 1 ? parts[parts.length - 1] : repoName;
  };

  if (!activeScan) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md">
      {getStatusIcon(activeScan.status)}
      <div className="flex flex-col">
        <span className="text-xs text-gray-300">
          Scanning: <span className="font-semibold text-white">{getRepoName(activeScan.repoName)}</span>
        </span>
        <span className="text-xs text-blue-400">
          {getStatusText(activeScan.status)}
        </span>
      </div>
    </div>
  );
}

