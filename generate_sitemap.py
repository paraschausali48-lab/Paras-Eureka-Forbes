import os
import re
from datetime import datetime

def generate_sitemap(html_file="index.html", output_file="sitemap.xml"):
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
    static_pages = [
        {"loc": f"{base_url}/", "changefreq": "weekly", "priority": "1.0"},
        {"loc": f"{base_url}/legal-terms.html", "changefreq": "monthly", "priority": "0.5"}
    ]

    for page in static_pages:
        xml_content.append('  <url>')
        xml_content.append(f'    <loc>{page["loc"]}</loc>')
        xml_content.append(f'    <lastmod>{today}</lastmod>')
        xml_content.append(f'    <changefreq>{page["changefreq"]}</changefreq>')
        xml_content.append(f'    <priority>{page["priority"]}</priority>')
        xml_content.append('  </url>')

    # Parse index.html for products
    product_count = 0
    if os.path.exists(html_file):
        with open(html_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Match all product titles inside <article class="product-card">...<h3>Title</h3>
        # Using [^>]* after <article to safely account for newlines added by HTML formatters
        product_pattern = re.compile(r'<article[^>]*class="product-card[^>]*>.*?<h3>(.*?)</h3>', re.DOTALL)
        products = product_pattern.findall(content)
        product_count = len(products)

        print(f"Found {product_count} products. Generating SKU links...")

        for title in products:
            # Replicate the JS getSkuCode() logic: 'EF-' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').toUpperCase()
            slug_base = re.sub(r'[^a-z0-9]+', '-', title.lower()).strip('-').upper()
            sku = f"EF-{slug_base}"

            xml_content.append('  <url>')
            xml_content.append(f'    <loc>{base_url}/#{sku}</loc>')
            xml_content.append(f'    <lastmod>{today}</lastmod>')
            xml_content.append('    <changefreq>monthly</changefreq>')
            xml_content.append('    <priority>0.8</priority>')
            xml_content.append('  </url>')
    else:
        print(f"⚠️ Warning: {html_file} not found. Only static pages will be added.")

    # Close XML structure
    xml_content.append('</urlset>')

    # Write to file
    with open(output_file, "w", encoding="utf-8") as f:
        f.write("\n".join(xml_content))

    print(f"✅ Successfully generated {output_file} containing {len(static_pages) + product_count} URLs.")

if __name__ == "__main__":
    generate_sitemap()
