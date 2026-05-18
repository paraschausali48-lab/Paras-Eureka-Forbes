import re

file_path = "index.html"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Regex to match the hidden-about div and its content (non-greedy, across multiple lines)
# The \s* before and after the div ensures any whitespace (including newlines) is captured.
pattern = r"\s*<div class=\"hidden-about\" style=\"display: none;\">.*?</div>\s*"
cleaned_content = re.sub(pattern, "", content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(cleaned_content)

print("Successfully removed <div class=\"hidden-about\"> blocks from index.html")