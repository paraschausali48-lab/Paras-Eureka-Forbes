import re
import os

base_dir = os.path.dirname(os.path.abspath(__file__))
dist_dir = os.path.join(base_dir, "dist")

# Regex to match the hidden-about div and its content (non-greedy, across multiple lines)
# The \s* before and after the div ensures any whitespace (including newlines) is captured.
pattern = r"\s*<div class=\"hidden-about\" style=\"display: none;\">.*?</div>\s*"
count = 0

if os.path.exists(dist_dir):
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            if file.endswith(".html"):
                file_path = os.path.join(root, file)
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                cleaned_content = re.sub(pattern, "", content, flags=re.DOTALL)
                with open(file_path, "w", encoding="utf-8") as f:
                    f.write(cleaned_content)
                count += 1

print(f"Successfully removed <div class=\"hidden-about\"> blocks from {count} HTML files in dist/")
