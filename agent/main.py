import os
from gensec import github_utils, scanner, parser, fixer, verifier, constants
import time
import shutil

def main():
    user_plan = constants.USER_PLAN
    if not constants.GROQ_API_KEY or not constants.GITHUB_TOKEN:
        print("❌ (Main): Missing GROQ_API_KEY or GITHUB_TOKEN.")
        return
        
    print(f"ℹ️  (Main): Using Groq model: {constants.GROQ_MODEL}")
    print(f"ℹ️  (Main): Running GenSec with plan: {user_plan}\n")

    repos_to_scan = constants.GITHUB_REPOS
    print(f"ℹ️  (Main): Found {len(repos_to_scan)} repo(s) to scan: {repos_to_scan}")

    # Get event type for better logging
    github_event = os.environ.get('GITHUB_EVENT_NAME', 'unknown')
    print(f"📅 (Main): Workflow event: {github_event}")
    
    for repo_name in repos_to_scan:
        print(f"\n{'='*60}")
        print(f"--- 🔍 Lightweight check for {repo_name} ---")
        print(f"{'='*60}")
        
        # Lightweight PR check: Does an open GenSec PR exist?
        try:
            has_open_pr, pr_number = github_utils.has_open_gensec_pr(repo_name)
        except Exception as e:
            print(f"❌ (Main): Error checking PRs for {repo_name}: {e}")
            has_open_pr, pr_number = False, None
        
        if has_open_pr:
            # Open PR exists - wait for it to be merged/closed
            print(f"⏸️  (Main): GenSec PR #{pr_number} is OPEN in {repo_name}")
            print(f"    (Main): ⏳ Waiting for PR to be merged...")
            print(f"    (Main): Will check again in next polling cycle (~2 minutes)")
            print(f"    (Main): Next check will scan immediately if PR is merged")
            continue  # Skip this repo, check again in next cycle
        
        # No open PR - PR was merged/closed or never existed
        is_manual_run = github_event == 'workflow_dispatch'
        
        if not is_manual_run:
            # Scheduled/polling run - PR was merged or repo is being checked for first time
            print(f"🔄 (Main): ✅ No open GenSec PR in {repo_name}")
            print(f"    (Main): This means PR was merged or repo never had a PR")
            print(f"    (Main): 🔍 Scanning immediately to find next vulnerability...")
        else:
            # Manual run - always scan
            print(f"📋 (Main): Manual run - scanning {repo_name}...")
        
        print(f"\n--- 🤖 Starting scan for {repo_name} ---")
        
        try:
            # 1. CLONE
            repo, original_sha = github_utils.clone_repo(repo_name) 
            if not repo or not original_sha:
                print(f"❌ (Main): Failed to clone {repo_name}. Skipping.")
                continue # Skip to the next repo

            # 2. SCAN
            if not scanner.run_scanner(user_plan):
                print(f"🎉 (Main): Project {repo_name} is secure - no vulnerabilities found!")
                print(f"✅ (Main): Stopping checks for {repo_name} (repo is secure)")
                continue # Skip to the next repo - no vulnerabilities, stop checking this repo

            # 3. PARSE
            finding = parser.get_vulnerability_info()
            if not finding:
                print(f"❌ (Main): Parser failed for {repo_name}. Skipping.")
                continue # Skip to the next repo
                
            # --- NEW: Get the path and read the file ---
            vulnerable_file_path = finding['path']
            full_local_path = os.path.join(constants.WORKSPACE_DIR, vulnerable_file_path)
            
            try:
                with open(full_local_path, 'r', encoding='utf-8') as f:
                    full_code = f.read()
            except Exception as e:
                print(f"❌ (Main): Error reading {full_local_path}: {e}")
                continue 

            vuln_id = finding['check_id']
            vuln_message = finding['message']

            # 4. FIX
            fixed_code = fixer.run_fixer_agent(full_code, finding)
            if not fixed_code:
                print(f"❌ (Main): Fixer agent failed for {repo_name}. Halting.")
                continue 

            # --- NEW: Overwrite the file in the workspace ---
            try:
                with open(full_local_path, 'w', encoding='utf-8') as f:
                    f.write(fixed_code)
                print(f"✅ (Main): Wrote fix to {full_local_path}")
            except Exception as e:
                print(f"❌ (Main): Error writing fix to {full_local_path}: {e}")
                continue

            # 5. VERIFY
            if not verifier.run_verifier(vuln_id, user_plan, vulnerable_file_path):
                print(f"❌ (Main): Verification failed for {repo_name}! Aborting PR.")
                continue

            # 6. CREATE PR
            github_utils.create_github_pull_request(
                repo=repo,
                original_sha=original_sha,
                message=vuln_message,
                file_path=vulnerable_file_path,
                fixed_code_content=fixed_code
            )
            
            print(f"--- ✅ Finished scan for {repo_name} ---")
            print(f"🔄 (Main): Will continue checking {repo_name} every 2 minutes until PR is merged")

        except Exception as e:
            print(f"❌ (Main): An unexpected fatal error occurred for {repo_name}: {e}")
            # This ensures the loop continues to the next repo
        
        finally:
            # Clean up workspace for the next loop
            if os.path.exists(constants.WORKSPACE_DIR):
                shutil.rmtree(constants.WORKSPACE_DIR)
            print("--- 🧹 Workspace cleaned ---")
            time.sleep(5) # Delay to avoid rate limiting


if __name__ == "__main__":
    main()