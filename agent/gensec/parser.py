import os
import json
from gensec.constants import REPORT_FILE

def get_vulnerability_info():
    print("🤖 (Parser): Consolidating and prioritizing reports...")
    
    all_findings = []
    
    severity_keywords = {
        "Gitleaks": 0, "Secret": 0,
        "Command Injection": 1,
        "SQL Injection": 2,
        "CRITICAL": 3,
        "Hardcoded": 4, "Hardcoded Secret": 4,
        "HIGH": 5,
        "Weak Crypto": 6, "MD5": 6, "TLS": 7,
        "MEDIUM": 8,
        "XSS": 9, "Sensitive": 10
    }
    
    # --- 1. Parse Semgrep Report ---
    try:
        if os.path.exists(REPORT_FILE):
            with open(REPORT_FILE, 'r', encoding='utf-8') as f:
                report = json.load(f)
            print("ℹ️  (Parser): Parsing Semgrep report...")
            for finding in report.get("results", []):
                message = finding.get("extra", {}).get("message", "Unknown")
                all_findings.append({
                    "check_id": finding.get("check_id", "semgrep-finding"),
                    "message": message,
                    "snippet": finding.get("extra", {}).get("lines", "N/A"),
                    "line": finding.get("start", {}).get("line", 0),
                    "raw_severity": finding.get("extra", {}).get("severity", "UNKNOWN"),
                    "tool": "semgrep"
                })
    except Exception as e:
        print(f"⚠️  (Parser): Could not parse {REPORT_FILE}. {e}")

    # --- 2. Parse Gitleaks Report (Pro) ---
    try:
        if os.path.exists("report-gitleaks.json"):
            with open("report-gitleaks.json", 'r', encoding='utf-8') as f:
                report = json.load(f)
            print("ℹ️  (Parser): Parsing Gitleaks report...")
            for finding in report:
                all_findings.append({
                    "check_id": f"gitleaks.{finding.get('RuleID')}",
                    "message": f"Gitleaks found: {finding.get('Description')} in {finding.get('File')}",
                    "snippet": finding.get('Secret'),
                    "line": finding.get('StartLine'),
                    "raw_severity": "CRITICAL",
                    "tool": "gitleaks"
                })
    except Exception as e:
        print(f"⚠️  (Parser): Could not parse report-gitleaks.json. {e}")

    # --- 3. Parse Trivy Report (Pro) ---
    try:
        if os.path.exists("report-trivy.json"):
            with open("report-trivy.json", 'r', encoding='utf-8') as f:
                report = json.load(f)
            print("ℹ️  (Parser): Parsing Trivy report...")
            results = report.get("Results", []) if isinstance(report, dict) else report
            if results:
                for target in results:
                    for vuln in target.get("Vulnerabilities", []):
                        all_findings.append({
                            "check_id": f"trivy.{vuln.get('VulnerabilityID')}",
                            "message": f"Trivy found: {vuln.get('Title')} in package {vuln.get('PkgName')}",
                            "snippet": f"Installed: {vuln.get('InstalledVersion')}, Fixed: {vuln.get('FixedVersion')}",
                            "line": 0,
                            "raw_severity": vuln.get('Severity', "UNKNOWN"),
                            "tool": "trivy"
                        })
    except Exception as e:
        print(f"⚠️  (Parser): Could not parse report-trivy.json. {e}")

    # --- 4. Prioritize All Findings ---
    if not all_findings:
        print("❌ (Parser): No findings consolidated from any report.")
        return None

    print(f"🤖 (Parser): Prioritizing {len(all_findings)} total findings...")
    
    prioritized_findings = []
    for finding in all_findings:
        priority_score = 999
        for keyword, score in severity_keywords.items():
            if keyword.lower() in finding["message"].lower() or keyword.lower() in finding["check_id"].lower():
                priority_score = score
                break
        
        severity_map = {"CRITICAL": 3, "HIGH": 5, "MEDIUM": 8, "LOW": 10, "WARNING": 6}
        severity_score = severity_map.get(finding["raw_severity"], 999)
        
        finding["priority"] = min(priority_score, severity_score)
        prioritized_findings.append(finding)

    prioritized_findings.sort(key=lambda x: x["priority"])
    best_finding = prioritized_findings[0]
    
    print(f"\n✅ (Parser): Highest priority: {best_finding['check_id']} (Tool: {best_finding['tool']})")
    print(f"   Message: {best_finding['message'][:100]}...")
    
    return best_finding
