import os

file_path = 'main.js'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

try:
    # Find the exact locations of the Git conflict markers
    head_idx = next(i for i, line in enumerate(lines) if line.startswith('<<<<<<< HEAD'))
    sep_idx = next(i for i, line in enumerate(lines) if line.startswith('======='))
    end_idx = next(i for i, line in enumerate(lines) if line.startswith('>>>>>>>'))

    # Keep ONLY the perfect updated code (everything below the ======= separator)
    fixed_lines = lines[sep_idx + 1 : end_idx]

    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)

    print("✅ Successfully fixed main.js! The correct updated code has been restored.")

except StopIteration:
    print("⚠️ Could not find merge conflict markers. The file might already be fixed.")
