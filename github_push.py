import subprocess
import sys
from datetime import datetime

def run_command(command_list):
    try:
        result = subprocess.run(command_list, check=True, text=True, capture_output=True)
        if result.stdout.strip():
            print(result.stdout.strip())
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error executing {' '.join(command_list)}:\n{e.stderr or e.stdout}")
        return False

def push_to_github():
    print("--- 🚀 GitHub Auto-Deploy ---")

    commit_msg = input("Enter a commit message (or press Enter for default): ").strip()
    if not commit_msg:
        commit_msg = f"Automated update: {datetime.now().strftime('%Y-%m-%d %H:%M')}"

    print("\n1. Staging changes (git add .)...")
    if not run_command(["git", "add", "."]):
        sys.exit(1)

    print(f"2. Committing changes...")
    # Commit might fail if there are no changes to save
    commit_process = subprocess.run(["git", "commit", "-m", commit_msg], text=True, capture_output=True)
    if commit_process.returncode != 0:
        output = commit_process.stdout.lower() + commit_process.stderr.lower()
        if "nothing to commit" in output:
            print("⚠️ No changes detected. Your repository is already up to date!")
            return
        else:
            print(f"❌ Error during commit:\n{commit_process.stderr or commit_process.stdout}")
            sys.exit(1)

    print("3. Pushing to GitHub (git push)...")
    if run_command(["git", "push"]):
        print("\n🎉 Code successfully pushed! GitHub Actions will now deploy your site.")

if __name__ == "__main__":
    push_to_github()
