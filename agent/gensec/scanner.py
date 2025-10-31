import os
import subprocess
import json
from gensec.constants import REPORT_FILE, VULNERABLE_FILE_PATH

def run_scanner(user_plan):
    print(f"🤖 (Scanner): Running scanners for plan: {user_plan}...")
    try:
        # Clean up old reports
        for f in [REPORT_FILE, "report-gitleaks.json", "report-trivy.json"]:
            if os.path.exists(f):
                os.remove(f)

        # --- 1. Run Semgrep (All Plans) ---
        print("ℹ️  (Scanner): Running Semgrep...")
        semgrep_command = [
            "semgrep",
            "--config", "p/gosec",
            "--config", "p/owasp-top-ten",
        ]
        if user_plan in ["pro", "enterprise"]:
            print("ℹ️  (Scanner): Adding Pro Semgrep rules...")
            semgrep_command.extend([
                "--config", "p/security-audit",
                "--config", "p/cwe-top-25",
            ])
        semgrep_command.extend(["--json", "-o", REPORT_FILE, VULNERABLE_FILE_PATH])
        
        result = subprocess.run(semgrep_command, capture_output=True, text=True, encoding='utf-8')
        if result.returncode != 0:
            print(f"⚠️  (Scanner): Semgrep failed. STDERR: {result.stderr.strip()}")

        # --- 2. Run Pro Scanners ---
        if user_plan in ["pro", "enterprise"]:
            print("ℹ️  (Scanner): Running Gitleaks...")
            gitleaks_command = [
                "gitleaks", "detect",
                "--no-git",
                "--source", VULNERABLE_FILE_PATH,
                "--report-format", "json",
                "--report-path", "report-gitleaks.json"
            ]
            result = subprocess.run(gitleaks_command, capture_output=True, text=True, encoding='utf-8')
            if result.returncode != 0:
                 print(f"⚠️  (Scanner): Gitleaks failed. STDERR: {result.stderr.strip()}")

            print("ℹ️  (Scanner): Running Trivy...")
            trivy_command = [
                "trivy", "fs",
                "--format", "json",
                "--output", "report-trivy.json",
                VULNERABLE_FILE_PATH
            ]
            result = subprocess.run(trivy_command, capture_output=True, text=True, encoding='utf-8')
            if result.returncode != 0:
                 print(f"⚠️  (Scanner): Trivy failed. STDERR: {result.stderr.strip()}")

        # --- 3. Check for any findings ---
        found_vulns = False
        for report_path in [REPORT_FILE, "report-gitleaks.json", "report-trivy.json"]:
            if os.path.exists(report_path) and os.path.getsize(report_path) > 50:
                try:
                    with open(report_path, 'r', encoding='utf-8') as f:
                        data = json.load(f)
                    if isinstance(data, dict) and data.get("results"):
                        found_vulns = True; break
                    if isinstance(data, list) and len(data) > 0:
                        found_vulns = True; break
                    if isinstance(data, dict) and data.get("Results"):
                        found_vulns = True; break
                except Exception as e:
                    print(f"⚠️  (Scanner): Could not parse {report_path}. {e}")
        
        if found_vulns:
            print("✅ (Scanner): Scan complete. At least one vulnerability was found.")
            return True
        else:
            print("✅ (Scanner): Scan complete. No vulnerabilities found.")
            return False
            
    except Exception as e:
        print(f"❌ (Scanner): Error during scan: {e}")
        return False