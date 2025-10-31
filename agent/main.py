import os
from gensec import github_utils, scanner, parser, fixer, verifier, constants

def main():
    user_plan = constants.USER_PLAN
    if not constants.GROQ_API_KEY or not constants.GITHUB_TOKEN or not constants.GITHUB_USERNAME:
        print("❌ (Main): Missing credentials or tokens.")
        return

    print(f"ℹ️  (Main): Using Groq model: {constants.GROQ_MODEL}")
    print(f"ℹ️  (Main): Running GenSec with plan: {user_plan}\n")

    repo, sha = github_utils.fetch_code_from_github()
    if not repo or not sha:
        print("❌ (Main): Failed to fetch code from GitHub.")
        return

    if not scanner.run_scanner(user_plan):
        print("🎉 Project is secure or scan failed to find issues.")
        return

    finding = parser.get_vulnerability_info()
    if not finding:
        print("❌ (Main): Parser failed to extract vulnerability information.")
        return

    try:
        with open(constants.VULNERABLE_FILE_PATH, 'r', encoding='utf-8') as f:
            full_code = f.read()
    except Exception as e:
        print(f"❌ (Main): Error reading vulnerable file: {e}")
        return

    vuln_id = finding['check_id']
    vuln_message = finding['message']

    if not fixer.run_fixer_agent(full_code, finding):
        print("❌ (Main): Fixer agent failed. Halting.")
        return

    if not verifier.run_verifier(vuln_id, user_plan):
        print("❌ (Main): Verification failed! Aborting PR creation.")
        return

    github_utils.create_github_pull_request(repo, sha, vuln_message)

if __name__ == "__main__":
    main()