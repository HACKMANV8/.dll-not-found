import React, { useState } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { Play, Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api.js';

export default function ScanButton({ repoName, repoUrl }) {
  const [scanning, setScanning] = useState(false);
  const [scanId, setScanId] = useState(null);
  const [scanStatus, setScanStatus] = useState(null);
  const [error, setError] = useState(null);
  const { getToken } = useAuth();

  const handleScan = async () => {
    try {
      setScanning(true);
      setError(null);
      setScanStatus(null);

      const token = await getToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Get GitHub token from localStorage
      const githubToken = localStorage.getItem('githubToken');

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      if (githubToken) {
        headers['X-GitHub-Token'] = githubToken;
      }

      // Trigger scan
      const res = await fetch(API_ENDPOINTS.SCAN_TRIGGER, {
        method: 'POST',
        headers,
        body: JSON.stringify({ repoName })
      });

      // Check content type before parsing
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Server returned HTML or other non-JSON response
        const text = await res.text();
        console.error('Non-JSON response:', text.substring(0, 200));
        throw new Error(`Server error: Received ${contentType || 'unknown'} instead of JSON. Status: ${res.status}`);
      }

      if (!res.ok) {
        try {
          const errorData = await res.json();
          throw new Error(errorData.message || errorData.error || `Failed to start scan (${res.status})`);
        } catch (parseErr) {
          // If JSON parsing fails, use status text
          throw new Error(`Failed to start scan: ${res.status} ${res.statusText}`);
        }
      }

      const data = await res.json();
      
      if (!data.scanId) {
        throw new Error('Invalid response: missing scanId');
      }
      
      setScanId(data.scanId);

      // Start polling for status
      pollScanStatus(data.scanId, token);

    } catch (err) {
      console.error('Error starting scan:', err);
      
      // Extract more detailed error message
      let errorMessage = err.message || 'Failed to start scan. Please check your connection and try again.';
      
      // Provide helpful suggestions based on error type
      if (errorMessage.includes('exit code')) {
        errorMessage += '\n\nPossible causes:\n- Python dependencies not installed (run: cd agent && pip install -r requirements.txt)\n- Missing environment variables (GROQ_API_KEY)\n- Agent script error\n- Python not found in PATH\n\nCheck the server console for detailed logs.';
      } else if (errorMessage.includes('spawn')) {
        errorMessage += '\n\nPossible causes:\n- Python not installed\n- Python not in system PATH\n- Agent directory missing\n\nCheck the server console for details.';
      } else if (errorMessage.includes('Authentication')) {
        errorMessage += '\n\nPlease log in again.';
      }
      
      setError(errorMessage);
      setScanning(false);
    }
  };

  const pollScanStatus = async (id, token) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(API_ENDPOINTS.SCAN_STATUS(id), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        // Check content type before parsing
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // Server returned HTML or other non-JSON response
          const text = await res.text();
          console.error('Non-JSON response in status poll:', text.substring(0, 200));
          clearInterval(interval);
          setScanning(false);
          setError(`Server error: Received ${contentType || 'unknown'} instead of JSON`);
          return;
        }

        if (res.ok) {
          try {
            const status = await res.json();
            setScanStatus(status);

            // Stop polling if scan is completed or failed
            if (status.status === 'completed' || status.status === 'failed') {
              clearInterval(interval);
              setScanning(false);
            }
          } catch (parseErr) {
            console.error('Error parsing status JSON:', parseErr);
            clearInterval(interval);
            setScanning(false);
          }
        } else {
          // Status endpoint returned error
          try {
            const errorData = await res.json();
            setError(errorData.message || errorData.error || 'Failed to fetch scan status');
          } catch (parseErr) {
            setError(`Failed to fetch scan status: ${res.status} ${res.statusText}`);
          }
          clearInterval(interval);
          setScanning(false);
        }
      } catch (err) {
        console.error('Error polling scan status:', err);
        clearInterval(interval);
        setScanning(false);
        setError(err.message || 'Connection error while polling status');
      }
    }, 2000); // Poll every 2 seconds

    // Clear interval after 10 minutes (timeout)
    setTimeout(() => {
      clearInterval(interval);
      setScanning(false);
      if (!scanStatus || (scanStatus.status !== 'completed' && scanStatus.status !== 'failed')) {
        setError('Scan timeout: The scan took too long to complete');
      }
    }, 10 * 60 * 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'scanning':
      case 'fixing':
      case 'verifying':
      case 'creating_pr':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

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
        return 'Scanning...';
      case 'fixing':
        return 'Fixing vulnerability...';
      case 'verifying':
        return 'Verifying fix...';
      case 'creating_pr':
        return 'Creating PR...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        onClick={handleScan}
        disabled={scanning}
        className={`
          px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors
          ${scanning
            ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
          }
        `}
      >
        {scanning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Scanning...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4" />
            <span>Scan Now</span>
          </>
        )}
      </button>

      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      {scanStatus && (
        <div className="flex flex-col gap-1 text-xs">
          <div className={`flex items-center gap-2 ${getStatusColor(scanStatus.status)}`}>
            {getStatusIcon(scanStatus.status)}
            <span>
              {scanStatus.status === 'completed' && !scanStatus.prUrl 
                ? 'Completed - No vulnerabilities found' 
                : getStatusText(scanStatus.status)}
            </span>
          </div>
          
          {scanStatus.prUrl ? (
            <a
              href={scanStatus.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-400 hover:text-blue-300 underline"
            >
              <ExternalLink className="w-3 h-3" />
              <span>View PR</span>
            </a>
          ) : scanStatus.status === 'completed' && !scanStatus.error ? (
            <p className="text-gray-400 text-xs mt-1">
              No vulnerabilities found in this repository.
            </p>
          ) : null}

          {scanStatus.error && (
            <p className="text-red-400 text-xs mt-1">{scanStatus.error}</p>
          )}
        </div>
      )}
    </div>
  );
}

