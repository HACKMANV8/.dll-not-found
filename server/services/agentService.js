import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../..');
const AGENT_DIR = path.join(ROOT_DIR, 'agent');

// Log agent directory for debugging (only once on module load)
console.log('🔍 Agent directory:', AGENT_DIR);
console.log('🔍 Agent directory exists:', fs.existsSync(AGENT_DIR));
if (fs.existsSync(AGENT_DIR)) {
  try {
    const files = fs.readdirSync(AGENT_DIR);
    console.log('🔍 Agent files:', files.filter(f => !f.startsWith('.')).join(', '));
  } catch (err) {
    console.error('Error reading agent directory:', err.message);
  }
} else {
  console.error('❌ Agent directory not found at:', AGENT_DIR);
}

/**
 * Run the GenSec agent for a specific repository
 * @param {Object} options - Agent configuration
 * @param {string} options.repoName - GitHub repo name (owner/repo)
 * @param {string} options.githubToken - GitHub Personal Access Token
 * @param {string} options.userPlan - User plan (free, pro, enterprise)
 * @param {string} options.groqApiKey - Groq API key
 * @param {Function} onLog - Callback for log output
 * @param {Function} onStatusChange - Callback for status changes
 * @returns {Promise<Object>} - Scan result
 */
export async function runAgent(options, onLog, onStatusChange) {
  const { repoName, githubToken, userPlan, groqApiKey } = options;

  // Validate inputs
  if (!repoName) {
    return Promise.reject(new Error('Repository name is required'));
  }
  if (!githubToken) {
    return Promise.reject(new Error('GitHub token is required'));
  }
  if (!groqApiKey) {
    console.warn('⚠️  GROQ_API_KEY not set - agent may fail during fixing step');
  }

  // Check if agent directory exists
  if (!fs.existsSync(AGENT_DIR)) {
    return Promise.reject(new Error(`Agent directory not found: ${AGENT_DIR}`));
  }

  // Check if main.py exists
  const agentMainPath = path.join(AGENT_DIR, 'main.py');
  if (!fs.existsSync(agentMainPath)) {
    return Promise.reject(new Error(`Agent main.py not found at ${agentMainPath}`));
  }

  return new Promise((resolve, reject) => {
    const logs = [];
    const errorLogs = [];
    let currentStatus = 'pending';
    let scanResult = {
      success: false,
      vulnerability: null,
      prUrl: null,
      error: null
    };

    // Set up environment variables
    const env = {
      ...process.env,
      GITHUB_TOKEN: githubToken,
      GITHUB_REPOS: repoName,
      USER_PLAN: userPlan.toLowerCase(),
      GROQ_API_KEY: groqApiKey || process.env.GROQ_API_KEY,
      GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      GITHUB_EVENT_NAME: 'workflow_dispatch', // Manual trigger
      PYTHONUNBUFFERED: '1', // Ensure Python output is unbuffered
      PYTHONIOENCODING: 'utf-8' // Force UTF-8 encoding for Windows compatibility (handles emojis)
    };

    // Determine Python command (python3 on Linux/Mac, python on Windows)
    const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';

    console.log(`🚀 Starting agent process with: ${pythonCmd} main.py`);
    console.log(`📁 Working directory: ${AGENT_DIR}`);
    console.log(`📦 Repository: ${repoName}`);
    console.log(`📋 Plan: ${userPlan}`);
    console.log(`🔑 GitHub Token: ${githubToken ? githubToken.substring(0, 10) + '...' : 'MISSING'}`);
    console.log(`🤖 Groq API Key: ${groqApiKey ? 'SET' : 'MISSING'}`);

    // Spawn the Python agent process
    const agentProcess = spawn(pythonCmd, ['main.py'], {
      cwd: AGENT_DIR,
      env: env,
      shell: true, // Use shell for Windows compatibility
      stdio: ['ignore', 'pipe', 'pipe'] // Explicitly set stdio to handle encoding
    });

    // Handle stdout (log output)
    agentProcess.stdout.on('data', (data) => {
      const output = data.toString();
      logs.push(output);
      if (onLog) onLog(output);

      // Parse status from logs
      if (output.includes('Starting scan')) {
        currentStatus = 'scanning';
        if (onStatusChange) onStatusChange('scanning');
      } else if (output.includes('Fix generated')) {
        currentStatus = 'fixing';
        if (onStatusChange) onStatusChange('fixing');
      } else if (output.includes('Verifying fix')) {
        currentStatus = 'verifying';
        if (onStatusChange) onStatusChange('verifying');
      } else if (output.includes('Creating PR') || output.includes('PR created') || output.includes('🎉 PR created')) {
        currentStatus = 'creating_pr';
        if (onStatusChange) onStatusChange('creating_pr');
        
        // Extract PR URL from output (matches "🎉 PR created: https://github.com/owner/repo/pull/123")
        const prUrlMatch = output.match(/https:\/\/github\.com\/[^\s]+/);
        if (prUrlMatch) {
          scanResult.prUrl = prUrlMatch[0].trim();
        }
      } else if (output.includes('Finished scan')) {
        // Only set completed if we have a PR URL (PR was created)
        if (scanResult.prUrl) {
          currentStatus = 'completed';
          if (onStatusChange) onStatusChange('completed');
        }
      } else if (output.includes('no vulnerabilities found') || output.includes('is secure')) {
        // No vulnerabilities found - this is a special completion state
        currentStatus = 'completed';
        scanResult.noVulnerabilities = true;
        if (onStatusChange) onStatusChange('completed');
      } else if (output.includes('✅') && scanResult.prUrl) {
        // Only mark as completed if we have a PR URL
        currentStatus = 'completed';
        if (onStatusChange) onStatusChange('completed');
      } else if (output.includes('❌') || output.includes('Error') || output.includes('FAILED')) {
        currentStatus = 'failed';
        if (onStatusChange) onStatusChange('failed');
      }
    });

    // Handle stderr (error output)
    agentProcess.stderr.on('data', (data) => {
      const error = data.toString();
      const errorMsg = `[ERROR] ${error}`;
      logs.push(errorMsg);
      errorLogs.push(error);
      if (onLog) onLog(errorMsg);
      
      // Capture error message for scanResult
      if (!scanResult.error) {
        scanResult.error = error.trim();
      } else {
        scanResult.error += '\n' + error.trim();
      }
      
      // Update status to failed if we see error indicators
      if (error.includes('Error') || error.includes('Exception') || error.includes('Traceback')) {
        currentStatus = 'failed';
        if (onStatusChange) onStatusChange('failed');
      }
    });

    // Handle process completion
    agentProcess.on('close', (code) => {
      if (code === 0) {
        // Check if a PR was created or if no vulnerabilities were found
        const hasPR = !!scanResult.prUrl;
        const noVulns = logs.some(log => 
          log.includes('no vulnerabilities found') || 
          log.includes('is secure') ||
          log.includes('Project') && log.includes('is secure')
        );
        
        scanResult.success = true;
        scanResult.logs = logs;
        
        // Only mark as completed with success if PR was created or no vulns found
        if (hasPR) {
          scanResult.success = true;
          if (onStatusChange) onStatusChange('completed');
        } else if (noVulns) {
          scanResult.success = true;
          scanResult.noVulnerabilities = true;
          if (onStatusChange) onStatusChange('completed');
        } else {
          // Process exited successfully but no PR and no "no vulns" message
          // This might mean the scan completed but something went wrong
          scanResult.success = false;
          scanResult.error = 'Scan completed but no PR was created and no vulnerabilities were found. Check logs for details.';
          if (onStatusChange) onStatusChange('failed');
        }
        
        resolve(scanResult);
      } else {
        scanResult.success = false;
        
        // Build detailed error message
        const lastErrors = errorLogs.slice(-5).join('\n');
        const errorSummary = errorLogs.length > 0 
          ? `Last errors:\n${lastErrors}`
          : 'No error output captured';
        
        scanResult.error = `Agent process exited with code ${code}\n\n${errorSummary}`;
        scanResult.exitCode = code;
        scanResult.logs = logs;
        
        console.error(`❌ Agent process failed with exit code ${code}`);
        console.error('Error logs:', errorLogs.slice(-10).join('\n'));
        
        if (onStatusChange) onStatusChange('failed');
        reject(new Error(`Agent process failed with exit code ${code}. ${errorSummary}`));
      }
    });

    // Handle process errors (e.g., Python not found)
    agentProcess.on('error', (error) => {
      const errorMsg = `Failed to spawn agent process: ${error.message}\n\nPossible causes:\n- Python not installed or not in PATH\n- Agent directory not accessible\n- Missing permissions`;
      
      scanResult.error = errorMsg;
      scanResult.logs = logs;
      scanResult.exitCode = 'spawn_failed';
      
      console.error('❌ Failed to spawn agent process:', error);
      if (onStatusChange) onStatusChange('failed');
      reject(new Error(errorMsg));
    });

    // Timeout after 10 minutes (scans can take a while)
    const timeout = setTimeout(() => {
      agentProcess.kill();
      scanResult.error = 'Scan timeout after 10 minutes';
      scanResult.logs = logs;
      if (onStatusChange) onStatusChange('failed');
      reject(new Error('Scan timeout'));
    }, 10 * 60 * 1000); // 10 minutes

    agentProcess.on('close', () => {
      clearTimeout(timeout);
    });
  });
}

/**
 * Check if the agent dependencies are available
 */
export async function checkAgentDependencies() {
  return new Promise((resolve) => {
    const pythonCmd = os.platform() === 'win32' ? 'python' : 'python3';
    
    // Check if Python is available
    const pythonCheck = spawn(pythonCmd, ['--version'], { shell: true });
    
    pythonCheck.on('close', (code) => {
      if (code === 0) {
        // Check if agent directory exists
        if (fs.existsSync(AGENT_DIR)) {
          resolve({ available: true, message: 'Agent dependencies available' });
        } else {
          resolve({ available: false, message: 'Agent directory not found' });
        }
      } else {
        resolve({ available: false, message: 'Python not found' });
      }
    });

    pythonCheck.on('error', () => {
      resolve({ available: false, message: 'Python not found' });
    });
  });
}

