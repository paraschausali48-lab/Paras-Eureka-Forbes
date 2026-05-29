import subprocess
import sys
import os

def run_script(script_name):
    print(f"\n--- ⏳ Running {script_name} ---")
    # Ensure we are running the script from the exact directory
    script_path = os.path.join(os.path.dirname(__file__), script_name)

    if not os.path.exists(script_path):
        print(f"⚠️ Warning: {script_name} not found. Skipping.")
        return

    # Run the script natively so inputs (like your commit message prompt) still work
    result = subprocess.run([sys.executable, script_path])
    if result.returncode != 0:
        print(f"❌ Error executing {script_name}. Pipeline stopped.")
        sys.exit(1)

def main():
    print("🚀 Starting Eureka Forbes Automation Pipeline...")
    scripts_to_run = ["normalize_data.py", "clean_html.py", "generate_sitemap.py", "github_push.py"]

    for script in scripts_to_run:
        run_script(script)

    print("\n🎉 Pipeline completed successfully!")

if __name__ == "__main__":
    main()
