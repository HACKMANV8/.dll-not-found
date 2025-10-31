import React, { useState, useEffect, useRef } from 'react';
import { useAuth, SignedIn } from '@clerk/clerk-react';
import { Loader2, CheckCircle, XCircle, ChevronDown, ChevronUp, AlertTriangle, FileCode, ExternalLink } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api.js';

export default function ScanLogSection() {
  const [activeScan, setActiveScan] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { getToken } = useAuth();
  const logsEndRef = useRef(null);

  useEffect(() => {
    if (!getToken) return;

    let interval;
    let isMounted = true;
    
    async function fetchActiveScan() {
      try {
        const token = await getToken();
        if (!token) {
          if (isMounted) setActiveScan(null);
          return;
        }

        const res = await fetch(API_ENDPOINTS.SCAN_ACTIVE, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!isMounted) return;

        if (res.ok) {
          const data = await res.json();
          if (data && data.status) {
            // Only set active scan if it's not completed or failed
            if (data.status !== 'completed' && data.status !== 'failed') {
              setActiveScan(data);
              // Auto-expand when there's an active scan
              if (!isExpanded && data.status !== 'pending') {
                setIsExpanded(true);
              }
            } else {
              // Completed or failed - clear after brief display
              setActiveScan(null);
            }
          } else {
            // No active scan (null response) - this is normal
            setActiveScan(null);
          }
        } else if (res.status === 404) {
          // Route not found - might be server issue, but don't spam console
          // This shouldn't happen after route fix, but handle gracefully
          if (isMounted) setActiveScan(null);
        } else {
          // Other error - silently handle
          if (isMounted) setActiveScan(null);
        }
      } catch (err) {
        // Only log non-network errors
        if (err.name !== 'TypeError' && err.message !== 'Failed to fetch') {
          console.error('Error fetching active scan:', err);
        }
        if (isMounted) setActiveScan(null);
      }
    }

    // Fetch immediately
    fetchActiveScan();

    // Poll every 3 seconds for active scans (slightly slower to reduce 404s when no scan)
    interval = setInterval(fetchActiveScan, 3000);

    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [getToken]);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (isExpanded && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeScan?.logs, isExpanded]);

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
        return 'Scanning repository';
      case 'fixing':
        return 'Fixing vulnerability';
      case 'verifying':
        return 'Verifying fix';
      case 'creating_pr':
        return 'Creating Pull Request';
      default:
        return status;
    }
  };

  const getRepoName = (repoName) => {
    if (!repoName) return 'Repository';
    const parts = repoName.split('/');
    return parts.length > 1 ? parts[parts.length - 1] : repoName;
  };

  const getRecentLogs = (logs, maxLines = 10) => {
    if (!logs || logs.length === 0) return [];
    // Get last N lines
    return logs.slice(-maxLines);
  };

  const parseVulnerabilityFromLogs = (logs) => {
    if (!logs || logs.length === 0) return null;
    
    // Look for vulnerability messages in logs
    for (let i = logs.length - 1; i >= 0; i--) {
      const log = logs[i];
      if (log.includes('vulnerability') || log.includes('Vulnerability') || log.includes('finding')) {
        // Try to extract file path and message
        const fileMatch = log.match(/['"]([^'"]+\.(py|js|ts|java|go|rs))['"]/);
        const messageMatch = log.match(/[Vv]ulnerability[:\s]+([^\n]+)/i);
        
        if (fileMatch || messageMatch) {
          return {
            file: fileMatch ? fileMatch[1] : null,
            message: messageMatch ? messageMatch[1] : log.substring(0, 100)
          };
        }
      }
    }
    return null;
  };

  // Always show the button if there's any scan data (for better UX)
  // Only hide if explicitly no scan exists or is completed/failed
  if (!activeScan) {
    return null; // No active scan at all - don't show anything
  }
  
  // If scan is completed or failed, still show briefly then hide
  if (activeScan.status === 'completed' || activeScan.status === 'failed') {
    // Hide completed/failed scans immediately
    return null;
  }

  const recentLogs = getRecentLogs(activeScan.logs || []);
  const vulnerability = activeScan.findings || parseVulnerabilityFromLogs(activeScan.logs);

  return (
    <div className="relative">
      {/* Compact Status Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md hover:bg-gray-750 transition-colors"
      >
        {getStatusIcon(activeScan.status)}
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-300">
            {getRepoName(activeScan.repoName)}
          </span>
          <span className="text-xs text-blue-400">
            {getStatusText(activeScan.status)}
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Expanded Log Panel */}
      {isExpanded && (
        <div className="absolute top-full right-0 mt-2 w-96 max-h-[500px] bg-gray-900 border border-gray-700 rounded-lg shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="p-3 bg-gray-800 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(activeScan.status)}
                <span className="text-sm font-semibold text-white">
                  {getRepoName(activeScan.repoName)}
                </span>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
            <div className="text-xs text-blue-400">
              {getStatusText(activeScan.status)}
            </div>
          </div>

          {/* Vulnerability Found */}
          {vulnerability && (vulnerability.message || vulnerability.filePath) && (
            <div className="p-3 bg-yellow-900/20 border-b border-yellow-800/50">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-yellow-400 mb-1">
                    Vulnerability Found
                  </div>
                  {vulnerability.filePath && (
                    <div className="flex items-center gap-1 mb-1">
                      <FileCode className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-300 font-mono">
                        {vulnerability.filePath}
                        {vulnerability.line && `:${vulnerability.line}`}
                      </span>
                    </div>
                  )}
                  {vulnerability.message && (
                    <div className="text-xs text-gray-300">
                      {vulnerability.message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PR Link */}
          {activeScan.prUrl && (
            <div className="p-3 bg-green-900/20 border-b border-green-800/50">
              <a
                href={activeScan.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-green-400 hover:text-green-300 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Pull Request</span>
              </a>
            </div>
          )}

          {/* Error */}
          {activeScan.error && (
            <div className="p-3 bg-red-900/20 border-b border-red-800/50">
              <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs font-semibold text-red-400 mb-1">
                    Error
                  </div>
                  <div className="text-xs text-red-300 whitespace-pre-wrap break-words">
                    {activeScan.error.substring(0, 300)}
                    {activeScan.error.length > 300 && '...'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Logs */}
          <div className="p-3 max-h-[300px] overflow-y-auto">
            <div className="text-xs font-semibold text-gray-400 mb-2">
              Recent Logs
            </div>
            <div className="space-y-1 font-mono text-xs">
              {recentLogs.length > 0 ? (
                recentLogs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-1.5 rounded ${
                      log.includes('❌') || log.includes('Error') || log.includes('FAILED')
                        ? 'bg-red-900/10 text-red-300'
                        : log.includes('✅') || log.includes('PR created') || log.includes('completed')
                        ? 'bg-green-900/10 text-green-300'
                        : log.includes('⚠️') || log.includes('Warning')
                        ? 'bg-yellow-900/10 text-yellow-300'
                        : 'bg-gray-800/50 text-gray-300'
                    }`}
                  >
                    {log.trim() || '\u00A0'}
                  </div>
                ))
              ) : (
                <div className="text-xs text-gray-500 italic">No logs yet...</div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

