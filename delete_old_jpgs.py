import os
import glob

def delete_old_jpgs(directory="images"):
    # Find all .jpg files in the directory and subdirectories
    search_pattern = os.path.join(directory, "**", "*.jpg")
    jpg_files = glob.glob(search_pattern, recursive=True)

    if not jpg_files:
        print(f"No JPG files found in the '{directory}' directory.")
        return

    deleted_count = 0
    print(f"Found {len(jpg_files)} JPG files. Starting safety check and deletion...")

    for jpg_path in jpg_files:
        # Safely check if corresponding .webp exists before deleting the .jpg
        base_name = os.path.splitext(jpg_path)[0]
        webp_path = f"{base_name}.webp"

        if os.path.exists(webp_path):
            try:
                os.remove(jpg_path)
                print(f"Deleted: {jpg_path}")
                deleted_count += 1
            except Exception as e:
                print(f"Failed to delete {jpg_path}: {e}")
        else:
            print(f"Skipped {jpg_path} (No matching .webp file found to replace it)")

    print(f"\n🎉 Cleanup complete! Successfully deleted {deleted_count} old JPG files.")

if __name__ == "__main__":
    print("--- Eureka Forbes JPG Cleanup ---")
    confirm = input("This will delete all .jpg files in the 'images' folder that have a .webp copy. Continue? (y/n): ")
    if confirm.lower() == 'y':
        delete_old_jpgs()
    else:
        print("Cleanup cancelled.")
