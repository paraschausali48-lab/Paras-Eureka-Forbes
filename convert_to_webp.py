import os
import glob
import re
try:
    from PIL import Image
except ImportError:
    print("Error: The 'Pillow' library is not installed.")
    print("Please install it by running: pip install Pillow")
    exit(1)

def convert_images_to_webp(directory="images"):
    # Find all .jpg files in the directory and subdirectories
    search_pattern = os.path.join(directory, "**", "*.jpg")
    image_files = glob.glob(search_pattern, recursive=True)

    if not image_files:
        print(f"No JPG files found in the '{directory}' directory.")
    else:
        print(f"Found {len(image_files)} images to convert. Starting conversion...")
        for file_path in image_files:
            try:
                with Image.open(file_path) as img:
                    base_name = os.path.splitext(file_path)[0]
                    webp_path = f"{base_name}.webp"

                    # Save as WebP format with 80% quality (great balance of size and quality)
                    img.save(webp_path, "webp", quality=80, optimize=True)
                    print(f"Converted: {file_path} -> {webp_path}")

            except Exception as e:
                print(f"Failed to convert {file_path}: {e}")

def update_code_references():
    print("\nUpdating website code to use .webp format...")

    # 1. Update index.html
    html_path = "index.html"
    if os.path.exists(html_path):
        with open(html_path, "r", encoding="utf-8") as f:
            html_content = f.read()

        # Replace .jpg with .webp ONLY inside the 'images/' folder references
        updated_html = re.sub(r'(src="images/[^"]+)\.jpg"', r'\1.webp"', html_content)

        with open(html_path, "w", encoding="utf-8") as f:
            f.write(updated_html)
        print("✅ index.html successfully updated.")

    # 2. Update main.js
    js_path = "main.js"
    if os.path.exists(js_path):
        with open(js_path, "r", encoding="utf-8") as f:
            js_content = f.read()

        # Change the hardcoded extension for the dynamic gallery
        js_content = js_content.replace("const imgExt = 'jpg';", "const imgExt = 'webp';")
        js_content = js_content.replace("${i}.jpg", "${i}.${imgExt}")

        with open(js_path, "w", encoding="utf-8") as f:
            f.write(js_content)
        print("✅ main.js successfully updated.")

if __name__ == "__main__":
    print("--- Eureka Forbes Image Optimizer ---")
    convert_images_to_webp()
    update_code_references()
    print("\n🎉 Migration complete! Test your site in the browser.")
    print("Note: You can safely delete the old .jpg files from the images folder once you confirm everything looks good.")
