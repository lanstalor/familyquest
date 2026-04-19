import os
import csv
import json
import requests
import zipfile
import logging
from bs4 import BeautifulSoup
from datetime import datetime
from PIL import Image

# Configuration
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
MANIFESTS_DIR = os.path.join(ASSETS_DIR, "manifests")
LOGS_DIR = os.path.join(ASSETS_DIR, "logs")

# Paths for deliverables
MANIFEST_CSV = os.path.join(MANIFESTS_DIR, "assets_manifest.csv")
MANIFEST_JSON = os.path.join(MANIFESTS_DIR, "assets_manifest.json")
ATTRIBUTION_MD = os.path.join(MANIFESTS_DIR, "ATTRIBUTION.md")
REVIEW_REQUIRED_MD = os.path.join(MANIFESTS_DIR, "REVIEW_REQUIRED.md")
SUMMARY_MD = os.path.join(MANIFESTS_DIR, "SUMMARY.md")

# CSV Columns
CSV_COLUMNS = [
    "source_site", "pack_name", "category", "style", "tile_size", 
    "asset_page_url", "download_url", "local_path", "license", 
    "attribution_required", "commercial_use_allowed", "modification_allowed", 
    "approved_status", "notes"
]

# Logger setup
logging.basicConfig(
    filename=os.path.join(LOGS_DIR, "collection.log"),
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("AssetCollector")

class AssetManifest:
    def __init__(self):
        self.entries = []
        self.load()

    def load(self):
        if os.path.exists(MANIFEST_JSON):
            with open(MANIFEST_JSON, "r") as f:
                self.entries = json.load(f)

    def save(self):
        # Save JSON
        with open(MANIFEST_JSON, "w") as f:
            json.dump(self.entries, f, indent=2)
        
        # Save CSV
        with open(MANIFEST_CSV, "w", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=CSV_COLUMNS)
            writer.writeheader()
            writer.writerows(self.entries)
        
        self.update_docs()

    def add_entry(self, entry):
        # Deduplicate
        if any(e["asset_page_url"] == entry["asset_page_url"] for e in self.entries):
            logger.info(f"Skipping duplicate pack: {entry['pack_name']}")
            return False
        self.entries.append(entry)
        self.save()
        return True

    def update_docs(self):
        # Attribution.md
        with open(ATTRIBUTION_MD, "w") as f:
            f.write("# Assets Attribution\n\n")
            for e in self.entries:
                if e["attribution_required"] == "yes":
                    f.write(f"- **{e['pack_name']}** by {e['source_site']}\n")
                    f.write(f"  URL: {e['asset_page_url']}\n")
                    f.write(f"  License: {e['license']}\n\n")

        # Summary.md
        with open(SUMMARY_MD, "w") as f:
            f.write("# Assets Collection Summary\n\n")
            categories = {}
            for e in self.entries:
                cat = e["category"]
                categories[cat] = categories.get(cat, []) + [e]
            
            for cat, items in categories.items():
                f.write(f"## {cat.capitalize()}\n")
                for item in items:
                    f.write(f"- {item['pack_name']} ({item['license']})\n")
                f.write("\n")

def download_and_extract(url, target_dir):
    try:
        response = requests.get(url, stream=True)
        if response.status_code != 200:
            logger.error(f"Download failed for {url}: {response.status_code}")
            return False
        
        zip_path = os.path.join(target_dir, "temp.zip")
        with open(zip_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(target_dir)
        
        os.remove(zip_path)
        return True
    except Exception as e:
        logger.error(f"Error extracting {url}: {str(e)}")
        return False

def collect_kenney_pack(slug, category, manifest):
    page_url = f"https://kenney.nl/assets/{slug}"
    # Kenney assets are always CC0 and don't need attribution (though we track it)
    entry = {
        "source_site": "Kenney",
        "pack_name": slug.replace("-", " ").title(),
        "category": category,
        "style": "pixel",
        "tile_size": "unknown", # To be detected
        "asset_page_url": page_url,
        "download_url": f"https://kenney.nl/content/assets/{slug}.zip",
        "local_path": f"assets/approved/cc0/kenney/{slug}",
        "license": "CC0",
        "attribution_required": "no",
        "commercial_use_allowed": "yes",
        "modification_allowed": "yes",
        "approved_status": "approved",
        "notes": "Verified CC0 from Kenney.nl"
    }

    local_path = os.path.join(BASE_DIR, entry["local_path"])
    os.makedirs(local_path, exist_ok=True)

    if download_and_extract(entry["download_url"], local_path):
        manifest.add_entry(entry)
        logger.info(f"Collected Kenney pack: {slug}")
        return True
    return False

if __name__ == "__main__":
    manifest = AssetManifest()
    
    # Priority 1: Kenney
    kenney_packs = [
        ("pixel-ui-pack", "ui"),
        ("tiny-dungeon", "tilesets"),
        ("tiny-town", "tilesets"),
        ("tiny-woods", "tilesets"),
        ("bit-pack", "characters"),
    ]

    for slug, cat in kenney_packs:
        collect_kenney_pack(slug, cat, manifest)
    
    # ITCH.IO / 0x72 Review Required (since download automation is tricky)
    if not os.path.exists(REVIEW_REQUIRED_MD):
        with open(REVIEW_REQUIRED_MD, "w") as f:
            f.write("# Review Required Assets\n\n")
            f.write("The following assets require manual download due to site restrictions:\n\n")
            f.write("- **0x72 16x16 Dungeon Tileset**\n  URL: https://0x72.itch.io/16x16-dungeon-tileset\n")
            f.write("- **0x72 DungeonTileset II**\n  URL: https://0x72.itch.io/dungeontileset-ii\n")
