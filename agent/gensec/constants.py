import os

# --- FILE CONFIGURATION ---
# VULNERABLE_FILE_PATH = "vulnerable_app.go"  <-- DELETE THIS
REPORT_FILE = "report.json"
# FIXED_FILE_PATH = "fixed_app.go"            <-- DELETE THIS
WORKSPACE_DIR = "workspace"                   # <-- ADD THIS

# --- API KEY CONFIGURATION ---
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

# --- MULTI-REPO CONFIG ---
GITHUB_REPOS = os.environ.get("GITHUB_REPOS", "shivansh-source/gensec-test-repo").split(',')

# Default user plan
USER_PLAN = os.environ.get("USER_PLAN", "free").lower()
if USER_PLAN not in ["free", "pro", "enterprise"]:
    USER_PLAN = "free"