#!/usr/bin/env python3
"""
Process assets from public/assets/import/:
  - Background PNGs → public/assets/scenes/
  - quad_blueslime_... → slice 4 quadrants → public/assets/characters/
  - quad_items_... → slice 4 quadrants + remove white bg → public/assets/items/
"""

import os
import shutil
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMPORT_DIR = os.path.join(ROOT, 'public', 'assets', 'import')
SCENES_DIR = os.path.join(ROOT, 'public', 'assets', 'scenes')
CHARS_DIR = os.path.join(ROOT, 'public', 'assets', 'characters')
ITEMS_DIR = os.path.join(ROOT, 'public', 'assets', 'items')


def remove_white_background(img: Image.Image, threshold: int = 240) -> Image.Image:
    img = img.convert('RGBA')
    data = img.getdata()
    new_data = []
    for r, g, b, a in data:
        if r >= threshold and g >= threshold and b >= threshold:
            new_data.append((r, g, b, 0))
        else:
            new_data.append((r, g, b, a))
    img.putdata(new_data)
    return img


def slice_quad(src_path: str, out_dir: str, filenames: list[str], remove_white: bool = False):
    img = Image.open(src_path)
    w, h = img.size
    hw, hh = w // 2, h // 2
    quads = [
        (0, 0, hw, hh),
        (hw, 0, w, hh),
        (0, hh, hw, h),
        (hw, hh, w, h),
    ]
    for (box, name) in zip(quads, filenames):
        tile = img.crop(box)
        if remove_white:
            tile = remove_white_background(tile)
        else:
            tile = tile.convert('RGBA')
        out_path = os.path.join(out_dir, name)
        tile.save(out_path, 'PNG')
        print(f'  ✅  {name}  ({tile.size[0]}×{tile.size[1]})')


# ── 1. Move background images to scenes/ ──────────────────────────────────────
print('\n── Backgrounds ──')
backgrounds = {
    'crystal_caves_background.PNG': 'crystal-caves.png',
    'enchanged_forest_background.PNG': 'enchanted-forest.png',
}
for src_name, dst_name in backgrounds.items():
    src = os.path.join(IMPORT_DIR, src_name)
    dst = os.path.join(SCENES_DIR, dst_name)
    if os.path.exists(src):
        shutil.copy2(src, dst)
        print(f'  ✅  {src_name} → scenes/{dst_name}')
    else:
        print(f'  ⚠   {src_name} not found')

# ── 2. Slice character quad ────────────────────────────────────────────────────
print('\n── Characters ──')
char_quad = os.path.join(IMPORT_DIR, 'quad_blueslime_rattlebones1_rattlebones2_merchantman.PNG')
if os.path.exists(char_quad):
    slice_quad(char_quad, CHARS_DIR, [
        'blue-slime.png',
        'rattlebones1.png',
        'rattlebones2.png',
        'merchant.png',
    ])
else:
    print('  ⚠   character quad not found')

# ── 3. Slice items quad (remove white bg from jpg) ────────────────────────────
print('\n── Items ──')
items_quad = os.path.join(IMPORT_DIR, 'quad_items_potion_boots_gauntlet_glasses.jpg')
if os.path.exists(items_quad):
    slice_quad(items_quad, ITEMS_DIR, [
        'item-potion.png',
        'item-boots.png',
        'item-gauntlet.png',
        'item-spectacles.png',
    ], remove_white=True)
else:
    print('  ⚠   items quad not found')

print('\nDone.')
