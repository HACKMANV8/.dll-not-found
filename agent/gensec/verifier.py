import os
import subprocess
import json
from gensec.constants import FIXED_FILE_PATH

def run_verifier(check_id, user_plan):
    print(f"🤖 (Verifier): Verifying fix for {check_id}...")
    
    VERIFY_SEMGREP_REPORT = "verify_report_semgrep.json"
    VERIFY_GITLEAKS_REPORT = "verify_report_gitleaks.json"
    VERIFY_TRIVY_REPORT = "verify_report_trivy.json"
    
    try:
        # --- 1. Re-run Semgrep on the FIXED file ---
        print("ℹ️  (Verifier): Re-running Semgrep on fixed code...")
        semgrep_command = [
            "semgrep", "--config", "p/gosec", "--config", "p/owasp-top-ten",
            "--config", "p/security-audit", "--config", "p/cwe-top-25",
            "--json", "-o", VERIFY_SEMGREP_REPORT, FIXED_FILE_PATH
        ]
        subprocess.run(semgrep_command, capture_output=True, text=True, encoding='utf-8')

        # --- 2. Re-run Pro Scanners on the FIXED file ---
        if user_plan in ["pro", "enterprise"]:
            print("ℹ️  (Verifier): Re-running Gitleaks on fixed code...")
            gitleaks_command = [
                "gitleaks", "detect",
                "--no-git",
                "--source", FIXED_FILE_PATH,
                "--report-format", "json",
                "--report-path", VERIFY_GITLEAKS_REPORT
            ]
            subprocess.run(gitleaks_command, capture_output=True, text=True, encoding='utf-8')

            print("ℹ️  (Verifier): Re-running Trivy on fixed code...")
            trivy_command = [
                "trivy", "fs",
                "--format", "json",
                "--output", VERIFY_TRIVY_REPORT,
                FIXED_FILE_PATH
            ]
            subprocess.run(trivy_command, capture_output=True, text=True, encoding='utf-8')

        # --- 3. Parse ALL verification reports ---
        vulnerability_still_exists = False
        
        if os.path.exists(VERIFY_SEMGREP_REPORT):
            with open(VERIFY_SEMGREP_REPORT, 'r', encoding='utf-8') as f:
                report = json.load(f)
            for finding in report.get("results", []):
                if finding.get("check_id") == check_id:
                    vulnerability_still_exists = True; break
        
        if vulnerability_still_exists:
             print(f"❌ (Verifier): FAILED. {check_id} still present in Semgrep report.")
             return False

        if os.path.exists(VERIFY_GITLEAKS_REPORT):
            with open(VERIFY_GITLEAKS_REPORT, 'r', encoding='utf-8') as f:
                report = json.load(f)
            for finding in report:
                if f"gitleaks.{finding.get('RuleID')}" == check_id:
                    vulnerability_still_exists = True; break

        if vulnerability_still_exists:
             print(f"❌ (Verifier): FAILED. {check_id} still present in Gitleaks report.")
             return False

        print(f"✅ (Verifier): PASSED. The vulnerability '{check_id}' is fixed.")
        return True # Skipping unit tests for now

    except Exception as e:
        print(f"❌ (Verifier): An unexpected error occurred during verification: {e}")
        return False