import os
import re
import json
from datetime import datetime

def generate_sitemap(data_file="src/data/products.json", output_file="public/sitemap.xml"):
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_file = os.path.join(base_dir, data_file)
    output_file = os.path.join(base_dir, output_file)

    base_url = "https://paraschausali48-lab.github.io/Paras-Eureka-Forbes"
    today = datetime.now().strftime("%Y-%m-%d")

    print("--- 🗺️ Eureka Forbes Sitemap Generator ---")
    print("Building sitemap structure...")

    # Start XML structure
    xml_content = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    # Add static pages
    languages = ["en", "hi", "mr", "gu"]
    static_pages = [{"loc": f"{base_url}/", "changefreq": "weekly", "priority": "1.0"}]

    for lang in languages:
        static_pages.extend([
            {"loc": f"{base_url}/{lang}/", "changefreq": "weekly", "priority": "1.0"},
            {"loc": f"{base_url}/{lang}/legal-terms.html", "changefreq": "monthly", "priority": "0.5"}
        ])

    for page in static_pages:
        xml_content.append('  <url>')
        xml_content.append(f'    <loc>{page["loc"]}</loc>')
        xml_content.append(f'    <lastmod>{today}</lastmod>')
        xml_content.append(f'    <changefreq>{page["changefreq"]}</changefreq>')
        xml_content.append(f'    <priority>{page["priority"]}</priority>')
        xml_content.append('  </url>')

    # Parse products.json for products
    product_count = 0
    if os.path.exists(data_file):
        with open(data_file, "r", encoding="utf-8") as f:
            try:
                products = json.load(f)
            except json.JSONDecodeError:
                products = []

        product_count = len(products)
        if product_count > 0:
            print(f"Found {product_count} products. Generating SKU links...")

        for item in products:
            title = item.get("name", "")
            slug_base = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-').upper()
            sku = f"EF-{slug_base}"

            for lang in languages:
                xml_content.append('  <url>')
                xml_content.append(f'    <loc>{base_url}/{lang}/products/{sku}/</loc>')
                xml_content.append(f'    <lastmod>{today}</lastmod>')
                xml_content.append('    <changefreq>monthly</changefreq>')
                xml_content.append('    <priority>0.8</priority>')
                xml_content.append('  </url>')
    else:
        print(f"⚠️ Warning: {data_file} not found. Only static pages will be added.")

    # Close XML structure
    xml_content.append('</urlset>')

    # Write to file
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(xml_content))

    print(f"✅ Successfully generated {output_file} containing {len(static_pages) + product_count} URLs.")

if __name__ == "__main__":
    generate_sitemap()
