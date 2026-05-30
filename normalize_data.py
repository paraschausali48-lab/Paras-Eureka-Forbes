import json
import os
import re

def normalize_keys(specs):
    new_specs = {}
    for k, v in specs.items():
        # Standardize Dimensions
        if "Dimension" in k:
            new_specs["Dimensions"] = v
        # Standardize Weights
        elif "Weight" in k:
            # Keep "Gross Weight" and "Net Weight" if specified, otherwise just "Weight"
            if "Gross" in k:
                new_specs["Gross Weight"] = v
            elif "Net" in k:
                new_specs["Net Weight"] = v
            else:
                new_specs["Weight"] = v
        # Standardize Voltage/Power
        elif "Voltage" in k or "Operating Input Voltage" in k:
            new_specs["Input Voltage"] = v
        # Fix Typos
        elif "Filteration" in k:
            new_specs["Filtration"] = v
        else:
            new_specs[k] = v
    return new_specs

base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, 'public', 'products.json')

if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for item in data:
        if "specs" in item:
            item["specs"] = normalize_keys(item["specs"])

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("✅ public/products.json normalized successfully!")
else:
    print("❌ public/products.json not found.")
