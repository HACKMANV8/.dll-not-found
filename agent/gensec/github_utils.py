import os
import time
from github import Github, Auth, GithubException
from gensec.constants import (
    GITHUB_TOKEN, GITHUB_USERNAME, VULNERABLE_FILE_PATH, FIXED_FILE_PATH
)

def fetch_code_from_github():
    if not GITHUB_TOKEN or not GITHUB_USERNAME:
        print("❌ (GitHub): GITHUB_TOKEN or GITHUB_USER env var not set.")
        return None, None
    print(f"🤖 (GitHub): Authenticating...")
    try:
        auth = Auth.Token(GITHUB_TOKEN)
        g = Github(auth=auth)
        user = g.get_user()
        print(f"✅ (GitHub): Authenticated as: {user.login}")
        repo_name = f"{GITHUB_USERNAME}/gensec-test-repo"
        repo = g.get_repo(repo_name)
        file_content = repo.get_contents(VULNERABLE_FILE_PATH, ref=repo.default_branch)
        code = file_content.decoded_content.decode('utf-8')
        with open(VULNERABLE_FILE_PATH, 'w', encoding='utf-8') as f:
            f.write(code)
        print(f"✅ (GitHub): Fetched and saved {VULNERABLE_FILE_PATH} from {repo_name}.")
        return repo, file_content.sha
    except Exception as e:
        print(f"❌ (GitHub): Error connecting to GitHub: {e}")
        return None, None

def create_github_pull_request(repo, sha, message):
    print("🤖 (GitHub): Creating PR...")
    try:
        with open(FIXED_FILE_PATH, 'r', encoding='utf-8') as f:
            new_code = f.read()
        branch_name = "gensec-fix-" + str(int(time.time()))
        repo.create_git_ref(ref=f"refs/heads/{branch_name}", sha=repo.get_branch(repo.default_branch).commit.sha)
        repo.update_file(VULNERABLE_FILE_PATH, f"Fix: {message}", new_code, sha, branch_name)
        pr = repo.create_pull(title=f"Fix: {message}", body="Auto-generated fix by GenSec", head=branch_name, base=repo.default_branch)
        print(f"🎉 PR created: {pr.html_url}")
    except Exception as e:
        print(f"❌ Error creating PR: {e}")