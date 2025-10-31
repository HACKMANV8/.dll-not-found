// API Configuration
// Uses environment variable from .env file or defaults to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  // User endpoints
  ME: `${API_BASE_URL}/api/me`,
  SIGNUP_DATA: `${API_BASE_URL}/api/signup-data`,
  UPDATE_PLAN: `${API_BASE_URL}/api/update-plan`,
  
  // GitHub endpoints
  GITHUB_REPOS: `${API_BASE_URL}/api/github/repos`,
  GITHUB_USER: `${API_BASE_URL}/api/github/user`,
  
  // Repository endpoints
  REPOS_SELECT: `${API_BASE_URL}/api/repos/select`,
  REPOS_DESELECT: `${API_BASE_URL}/api/repos/deselect`,
  REPOS_CLEAR_ALL: `${API_BASE_URL}/api/repos/clear-all`,
  
  // Scan endpoints
  SCAN_TRIGGER: `${API_BASE_URL}/api/scan/trigger`,
  SCAN_ACTIVE: `${API_BASE_URL}/api/scan/active`,
  SCAN_STATUS: (scanId) => `${API_BASE_URL}/api/scan/status/${scanId}`,
  SCAN_HISTORY: `${API_BASE_URL}/api/scan/history`,
  SCAN_LOGS: (scanId) => `${API_BASE_URL}/api/scan/${scanId}/logs`,
};

export default API_BASE_URL;

