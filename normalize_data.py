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

def generate_schema(item):
    availability = "https://schema.org/OutOfStock" if item.get("outOfStock") else "https://schema.org/InStock"
    return {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": item.get("name"),
        "image": item.get("image") or "https://paraseurekaforbes.com/default-product.jpg",
        "description": item.get("description"),
        "sku": item.get("sku"),
        "brand": {
            "@type": "Brand",
            "name": "Eureka Forbes"
        },
        "offers": {
            "@type": "Offer",
            "priceCurrency": "INR",
            "price": item.get("mop", item.get("mrp")),
            "itemCondition": "https://schema.org/NewCondition",
            "availability": availability
        }
    }

def generate_highlights(item):
    highlights = []
    # 1. Extract core technology intelligently
    techs = [t.upper() for t in item.get('subcategories', []) if t.lower() in ['ro', 'uv', 'uf', 'hepa', 'copper', 'alkaline']]
    if techs:
        highlights.append(f"Advanced {' + '.join(techs)} Technology")

    # 2. Extract crucial specs for quick scanning
    specs = item.get('specs', {})
    for key in ["Storage Capacity", "Filtration", "Suction Power", "Weight"]:
        if key in specs:
            highlights.append(f"{specs[key]} {key}")

    # 3. Fallback to description sentences if we need more points
    if len(highlights) < 3 and item.get("description"):
        sentences = [s.strip() for s in str(item["description"]).split('.') if len(s.strip()) > 15]
        highlights.extend(sentences[:2])

    # Return exactly 3 concise bullet points
    return highlights[:3]

base_dir = os.path.dirname(os.path.abspath(__file__))
file_path = os.path.join(base_dir, 'src', 'data', 'products.json')

if os.path.exists(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    for item in data:
        if "specs" in item:
            item["specs"] = normalize_keys(item["specs"])
        item["schema"] = generate_schema(item)
        item["highlights"] = generate_highlights(item)

        # Pre-calculate discount percentage to save frontend render cycles
        mrp = item.get("mrp", 0)
        mop = item.get("mop", 0)
        if mrp > mop and mrp > 0:
            item["discount"] = round(((mrp - mop) / mrp) * 100)
        else:
            item["discount"] = 0

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("✅ src/data/products.json normalized successfully!")
else:
    print("❌ src/data/products.json not found.")
