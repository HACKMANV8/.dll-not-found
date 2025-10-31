import os
import time
import subprocess
import shutil
from github import Github, Auth, GithubException
from gensec.constants import (
    GITHUB_TOKEN, WORKSPACE_DIR
)

def clone_repo(repo_name):
    """
    Clones the target repo into the WORKSPACE_DIR.
    """
    if os.path.exists(WORKSPACE_DIR):
        print(f"ℹ️  (GitHub): Cleaning old {WORKSPACE_DIR}...")
        shutil.rmtree(WORKSPACE_DIR)
        
    print(f"🤖 (GitHub): Cloning {repo_name} into {WORKSPACE_DIR}...")
    
    # Use GITHUB_TOKEN for private repos
    repo_url = f"https://oauth2:{GITHUB_TOKEN}@github.com/{repo_name}.git"
    
    try:
        # Shallow clone (no history) for speed and space
        subprocess.run(
            ["git", "clone", "--depth", "1", repo_url, WORKSPACE_DIR],
            check=True, capture_output=True, text=True
        )
        print(f"✅ (GitHub): Cloned repo successfully.")
        
        # Now connect with PyGithub to get the repo object and original SHA
        auth = Auth.Token(GITHUB_TOKEN)
        g = Github(auth=auth)
        repo = g.get_repo(repo_name)
        sha = repo.get_branch(repo.default_branch).commit.sha
        return repo, sha
        
    except subprocess.CalledProcessError as e:
        print(f"❌ (GitHub): Error cloning repo: {e.stderr}")
        return None, None
    except Exception as e:
        print(f"❌ (GitHub): Error connecting to GitHub: {e}")
        return None, None

def has_open_gensec_pr(repo_name):
    """
    Lightweight check: Does this repo have any open GenSec PRs?
    ONLY matches PRs created by the GenSec agent - ignores all other PRs.
    Returns (True, pr_number) if open GenSec PR found, (False, None) otherwise.
    """
    try:
        auth = Auth.Token(GITHUB_TOKEN)
        g = Github(auth=auth)
        repo_obj = g.get_repo(repo_name)
        
        # Quick check for open GenSec PRs
        open_prs = repo_obj.get_pulls(state='open', sort='created', direction='desc')
        
        # Convert to list to check all PRs
        pr_list = list(open_prs)
        print(f"🔍 (GitHub): Found {len(pr_list)} open PR(s) in {repo_name} (checking for GenSec PRs only)")
        
        for pr in pr_list[:10]:  # Check first 10 open PRs
            # Strict GenSec PR detection - must match BOTH conditions
            pr_body = pr.body or ""
            branch_name = pr.head.ref or ""
            
            # Check 1: PR body must contain the exact GenSec identifier
            has_gensec_body = 'Auto-generated fix by GenSec' in pr_body
            # Check 2: Branch name must start with gensec-fix-
            has_gensec_branch = branch_name.startswith('gensec-fix-')
            
            # Additional check: PR body should contain "GenSec security scanning agent"
            has_agent_identifier = 'GenSec security scanning agent' in pr_body
            
            # Strict matching: must have ALL three indicators (body, branch, and agent identifier)
            is_gensec = has_gensec_body and has_gensec_branch and has_agent_identifier
            
            if is_gensec:
                # All checks passed - this is definitely a GenSec PR
                print(f"✅ (GitHub): Found open GenSec PR #{pr.number} in {repo_name}")
                print(f"   ✓ Body contains: 'Auto-generated fix by GenSec'")
                print(f"   ✓ Branch starts with: 'gensec-fix-' ({branch_name})")
                print(f"   ✓ Contains agent identifier: 'GenSec security scanning agent'")
                print(f"   ✓ Title: {pr.title}")
                print(f"   ℹ️  This is a GenSec agent PR - will wait for merge")
                return True, pr.number
            else:
                # Not a GenSec PR - ignore silently
                if len(pr_list) <= 3:  # Only log if few PRs (for debugging)
                    print(f"ℹ️  (GitHub): PR #{pr.number} is NOT a GenSec PR - ignoring")
                    print(f"   Branch: {branch_name}, Has GenSec body: {has_gensec_body}, Has GenSec branch: {has_gensec_branch}")
        
        print(f"ℹ️  (GitHub): No open GenSec PRs found in {repo_name} (ignored {len(pr_list)} other PRs)")
        return False, None
    except Exception as e:
        print(f"⚠️  (GitHub): Error checking open PRs in {repo_name}: {e}")
        import traceback
        traceback.print_exc()
        return False, None

def check_recently_merged_gensec_pr(repo_name, since_minutes=5):
    """
    Check if a GenSec PR was merged recently in the target repo.
    ONLY matches PRs created by the GenSec agent - ignores all other PRs.
    Returns (True, pr_number, minutes_ago) if found, (False, None, None) otherwise.
    
    Args:
        repo_name: Repository to check (format: owner/repo)
        since_minutes: How many minutes back to check (default 5)
    """
    try:
        auth = Auth.Token(GITHUB_TOKEN)
        g = Github(auth=auth)
        repo_obj = g.get_repo(repo_name)
        
        # Calculate cutoff time (check for merges in last N minutes)
        cutoff_time = time.time() - (since_minutes * 60)
        
        # Get recently closed PRs (merged PRs are closed)
        prs = repo_obj.get_pulls(state='closed', sort='updated', direction='desc')
        
        for pr in list(prs)[:10]:  # Check last 10 closed PRs
            # Only check merged PRs (not just closed)
            if pr.merged and pr.merged_at:
                # Strict GenSec PR detection - must match BOTH conditions
                pr_body = pr.body or ""
                branch_name = pr.head.ref or ""
                
                # Check 1: PR body must contain the exact GenSec identifier
                has_gensec_body = 'Auto-generated fix by GenSec' in pr_body
                # Check 2: Branch name must start with gensec-fix-
                has_gensec_branch = branch_name.startswith('gensec-fix-')
                # Additional check: PR body should contain "GenSec security scanning agent"
                has_agent_identifier = 'GenSec security scanning agent' in pr_body
                
                # Only match if it has GenSec body AND GenSec branch (STRICT matching)
                is_gensec = has_gensec_body and has_gensec_branch and has_agent_identifier
                
                if is_gensec:
                    merged_at = pr.merged_at.timestamp()
                    if merged_at > cutoff_time:
                        minutes_ago = int((time.time() - merged_at) / 60)
                        seconds_ago = int(time.time() - merged_at)
                        print(f"✅ (GitHub): Found recently merged GenSec PR #{pr.number} in {repo_name}")
                        print(f"   Merged {minutes_ago}m {seconds_ago % 60}s ago")
                        print(f"   ✓ Confirmed as GenSec agent PR (strict matching)")
                        return True, pr.number, minutes_ago
        
        return False, None, None
    except Exception as e:
        print(f"⚠️  (GitHub): Error checking merged PRs in {repo_name}: {e}")
        return False, None, None

def create_github_pull_request(repo, original_sha, message, file_path, fixed_code_content):
    """
    Creates a PR with a fix for a *specific file*.
    """
    print(f"🤖 (GitHub): Creating PR for file: {file_path}...")
    try:
        branch_name = "gensec-fix-" + str(int(time.time()))
        
        # 1. Create the new branch from the original SHA
        repo.create_git_ref(ref=f"refs/heads/{branch_name}", sha=original_sha)
        
        # 2. Get the file's current SHA (needed for update)
        file_contents = repo.get_contents(file_path, ref=original_sha)
        
        # 3. Update the file on the new branch
        repo.update_file(
            path=file_path,
            message=f"Fix: {message}",
            content=fixed_code_content,
            sha=file_contents.sha,
            branch=branch_name
        )
        
        # 4. Create the PR with clear GenSec identifier
        pr_body = f"""Auto-generated fix by GenSec for `{file_path}`.

**Vulnerability Fixed:** {message}

This PR was automatically created by the GenSec security scanning agent.
When merged, it will trigger a new scan to find the next vulnerability."""
        
        pr = repo.create_pull(
            title=f"Fix: {message}",
            body=pr_body,
            head=branch_name,
            base=repo.default_branch
        )
        print(f"🎉 PR created: {pr.html_url}")
        return pr
        
    except Exception as e:
        print(f"❌ Error creating PR: {e}")
        return None