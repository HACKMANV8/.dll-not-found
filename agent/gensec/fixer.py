import os
from groq import Groq
from gensec.constants import GROQ_API_KEY, GROQ_MODEL, FIXED_FILE_PATH

def run_fixer_agent(full_code, finding):
    if not GROQ_API_KEY:
        print("❌ (Fixer): GROQ_API_KEY not set.")
        return False

    print(f"🤖 (Fixer): Analyzing finding to select expert prompt...")

    check_id = finding.get('check_id', '')
    issue = finding.get('message', 'Unknown issue')
    snippet = finding.get('snippet', 'N/A')
    line = finding.get('line', 0)
    
    base_prompt = f"""
You are GenSec, an elite AI DevSecOps agent. Your mission is to fix *ONLY ONE* specific security vulnerability.
You must not change any other part of the code, even if you see other bugs.
Your goal is to create a minimal, correct patch for only the single bug I describe.
IMPORTANT: You must provide *ONLY* the *ENTIRE* fixed Go file. Do not provide any other text,
explanation, or markdown fences (```) around the code. Start with `package main` and end with the
last line of the file.
THE FULL VULNERABLE FILE:
---
{full_code}
---
"""
    
    # --- Pro-Tier Fix Router ---
    
    if 'gitleaks' in finding.get('tool', ''):
        print("ℹ️  (Fixer): Selected 'Gitleaks Secret' expert.")
        task_prompt = f"""
THE VULNERABILITY:
A Gitleaks scan found a hardcoded secret: "{issue}"
This secret is on or near line {line}.
The secret's value is: {snippet}
Your task:
1.  Locate this *one* hardcoded secret.
2.  Fix the vulnerability by replacing the hardcoded secret with a secure call to a config loader or environment variable.
    -   BAD: var adminPassword = "sk_live_12345..."
    -   GOOD (Env Var): var adminPassword = os.Getenv("ADMIN_PASSWORD")
    -   BETTER (Config): var adminPassword = config.Get("ADMIN_PASSWORD")
3.  You MUST ensure the "os" package is imported if you use `os.Getenv()`.
4.  You MUST NOT fix any other bugs in the file.
5.  Return the *ENTIRE* corrected Go file.
FULL FIXED CODE:
"""
    elif 'G204' in check_id: # Command Injection
        print("ℹ️  (Fixer): Selected 'Command Injection' expert.")
        task_prompt = f"""
THE VULNERABILITY:
A Semgrep scan found a Command Injection: "{issue}"
It is on or near line {line}.
The vulnerable code snippet is:
{snippet}
Your task:
1.  Locate this *one* Command Injection.
2.  Fix the vulnerability by splitting the command from its arguments.
    -   BAD: exec.Command("sh", "-c", "ping -c 1 " + host)
    -   GOOD: exec.Command("ping", "-c", "1", host)
3.  You MUST NOT fix any other bugs in the file.
4.  Return the *ENTIRE* corrected Go file.
FULL FIXED CODE:
"""
    elif 'string-formatted-query' in check_id: # SQL Injection
        print("ℹ️  (Fixer): Selected 'SQL Injection' expert.")
        task_prompt = f"""
THE VULNERABILITY:
A Semgrep scan found an SQL Injection: "{issue}"
It is on or near line {line}.
The vulnerable code snippet is:
{snippet}
Your task:
1.  Locate this *one* SQL Injection.
2.  Fix the vulnerability by using parameterized queries (with a `?` placeholder).
    -   BAD: db.Query("...WHERE id = '" + userID + "'")
    -   GOOD: db.Query("...WHERE id = ?", userID)
3.  You MUST NOT fix any other bugs in the file.
4.  Return the *ENTIRE* corrected Go file.
FULL FIXED CODE:
"""
    elif 'G103' in check_id: # Path Traversal
        print("ℹ️  (Fixer): Selected 'Path Traversal' expert.")
        task_prompt = f"""
THE VULNERABILITY:
A Semgrep scan found a Path Traversal: "{issue}"
It is on or near line {line}.
The vulnerable code snippet is:
{snippet}
Your task:
1.  Locate this *one* Path Traversal vulnerability.
2.  Fix it by cleaning the path and ensuring it's relative to a safe base directory.
    -   You MUST use `filepath.Clean()` on the user-provided path.
    -   You MUST check that the cleaned path is still within an allowed base directory.
    -   Example: path := filepath.Clean("/app/static/" + userInput)
    -   Example check: if !strings.HasPrefix(path, "/app/static/") {{ // handle error }}
3.  You MUST ensure "path/filepath" and "strings" are imported.
4.  You MUST NOT fix any other bugs in the file.
5.  Return the *ENTIRE* corrected Go file.
FULL FIXED CODE:
"""
    elif 'G402' in check_id or 'cors' in issue.lower(): # Weak CORS Policy
        print("ℹ️  (Fixer): Selected 'Weak CORS' expert.")
        task_prompt = f"""
THE VULNERABILITY:
A Semgrep scan found a weak CORS policy: "{issue}"
It is on or near line {line}.
The vulnerable code snippet is:
{snippet}
Your task:
1.  Locate this *one* CORS vulnerability.
2.  Fix it by replacing the wildcard `*` with a *configurable allowlist*.
    -   BAD: w.Header().Set("Access-Control-Allow-Origin", "*")
    -   GOOD:
        allowedOrigin := os.Getenv("ALLOWED_ORIGIN")
        if r.Header.Get("Origin") == allowedOrigin {{
            w.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
        }}
3.  You MUST ensure "os" is imported.
4.  You MUST NOT fix any other bugs in the file.
5.  Return the *ENTIRE* corrected Go file.
FULL FIXED CODE:
"""
    elif 'G104' in check_id or 'sensitive' in issue.lower(): # Sensitive Data Leak
        print("ℹ️  (Fixer): Selected 'Sensitive Data' expert.")
        task_prompt = f"""
THE VULNERABILITY:
A Semgrep scan found a sensitive data leak: "{issue}"
It is on or near line {line}.
The vulnerable code snippet is:
{snippet}
Your task:
1.  Locate this *one* sensitive data leak (e.g., logging a password, token, or error).
2.  Fix it by removing the sensitive variable from the log or error message.
    -   BAD: log.Printf("Failed login for user: %s, password: %s", user, pass)
    -   GOOD: log.Printf("Failed login for user: %s", user)
    -   BAD: http.Error(w, err.Error(), 500)
    -   GOOD: http.Error(w, "Internal server error", 500)
3.  You MUST NOT fix any other bugs in the file.
4.  Return the *ENTIRE* corrected Go file.
FULL FIXED CODE:
"""
    else: # Default for MD5, TLS, and other bugs
        print(f"ℹ️  (Fixer): Selected 'Default' expert for {check_id}.")
        task_prompt = f"""
THE VULNERABILITY:
A Semgrep scan found this issue: "{issue}"
It is on or near line {line}.
The vulnerable code snippet is:
{snippet}
Your task:
1.  Locate and fix *only* this one specific vulnerability.
2.  You MUST NOT fix any other bugs in the file.
3.  Return the *ENTIRE* corrected Go file.
FULL FIXED CODE:
"""
    
    final_prompt = base_prompt + task_prompt
    print(f"🤖 (Fixer): Sending prompt to Groq ({GROQ_MODEL})...")
    
    try:
        client = Groq(api_key=GROQ_API_KEY)
        
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": final_prompt}],
            model=GROQ_MODEL, 
            max_tokens=8192, # Increased from 2048
            temperature=0.0
        )

        fixed_code = chat_completion.choices[0].message.content.strip()
        print("✅ (Fixer): Fix generated.")

        # Clean up potential markdown fences
        if fixed_code.startswith("```go"):
            fixed_code = fixed_code[5:]
        if fixed_code.startswith("```"):
            fixed_code = fixed_code[3:]
        if fixed_code.endswith("```"):
            fixed_code = fixed_code[:-3]
        
        fixed_code = fixed_code.strip()

        if not fixed_code.startswith("package main"):
            print(f"⚠️ (Fixer): Warning - Groq fix is not valid. Output: {fixed_code[:100]}...")
            return False

        with open(FIXED_FILE_PATH, 'w', encoding='utf-8') as f:
            f.write(fixed_code)
        print("✅ (Fixer): Fixed code saved.")
        return True
        
    except Exception as e:
        print(f"❌ (Fixer): Error: {e}")
        return False