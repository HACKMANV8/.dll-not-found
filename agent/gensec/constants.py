import os

# --- FILE CONFIGURATION ---
VULNERABLE_FILE_PATH = "vulnerable_app.go"
REPORT_FILE = "report.json"
FIXED_FILE_PATH = "fixed_app.go"

# --- API KEY CONFIGURATION ---
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")
GITHUB_USERNAME = os.environ.get("GITHUB_USER")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

# Default user plan - free, pro, or enterprise
USER_PLAN = os.environ.get("USER_PLAN", "free").lower()