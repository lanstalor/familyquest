import os
from PIL import Image

def split_image(file_path, output_names):
    print(f"Splitting {file_path}...")
    img = Image.open(file_path)
    img = img.convert("RGBA")
    width, height = img.size
    
    mid_x = width // 2
    mid_y = height // 2
    
    # Coordinates: (left, top, right, bottom)
    quads = [
        (0, 0, mid_x, mid_y),       # top_left
        (mid_x, 0, width, mid_y),    # top_right
        (0, mid_y, mid_x, height),   # bottom_left
        (mid_x, mid_y, width, height) # bottom_right
    ]
    
    for i, (box, name) in enumerate(zip(quads, output_names)):
        if not name:
            continue
        quad_img = img.crop(box)
        
        # Apply transparency removal if needed (DALL-E 3 style)
        # But if these are already high quality, maybe just crop
        # Let's check for "white" background just in case
        
        # Auto-crop to content
        bbox = quad_img.getbbox()
        if bbox:
            quad_img = quad_img.crop(bbox)
            
        out_path = os.path.join(os.path.dirname(file_path), f"{name}.png")
        quad_img.save(out_path, "PNG")
        print(f"  Saved {out_path}")

def run():
    # Ben's Quad (Warrior, Mage, Ranger, Bard)
    split_image(
        "public/assets/characters/ben_quad.PNG",
        ["ben-warrior", "ben-mage", "ben-ranger", "ben-bard"]
    )
    
    # Myla's Quad (Warrior, Mage, Ranger, Bard)
    split_image(
        "public/assets/characters/myla_quad.PNG",
        ["myla-warrior", "myla-mage", "myla-ranger", "myla-bard"]
    )
    
    # Villains: goblin_dragon_ogre_troll.PNG
    split_image(
        "public/assets/characters/goblin_dragon_ogre_troll.PNG",
        ["goblin", "dragon-small", "ogre", "troll"]
    )
    
    # Animals: fox_bunny_squirrel_owl.PNG
    split_image(
        "public/assets/characters/fox_bunny_squirrel_owl.PNG",
        ["fox", "bunny", "squirrel", "owl"]
    )
    
    # NPCs: knight_wizard_maid_bartender.PNG
    split_image(
        "public/assets/characters/knight_wizard_maid_bartender.PNG",
        ["npc-knight", "npc-wizard", "npc-maid", "npc-bartender"]
    )

if __name__ == "__main__":
    run()
