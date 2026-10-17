# Regenerates Website/assets from the Unity sprites and raw Trailer/*.mov captures.
# Run from the repo root: python3 Website/tools/prepare_media.py
import subprocess
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SPR = ROOT / "Assets/GameContent/Sprites"
TRAILER = ROOT / "Trailer"
OUT = ROOT / "Website/assets"
IMG, VID = OUT / "img", OUT / "video"
for d in (IMG, VID, IMG / "units", IMG / "icons", IMG / "shots"):
    d.mkdir(parents=True, exist_ok=True)

# Game view inside the editor recordings (3456x2234 capture, 16:9 view starts at y=229)
GAME_Y = 229
ZOOM = "crop=2304:1296:{x}:" + str(GAME_Y + 440)  # 2/3 zoom on the lane, HUD and minimap cut
FULL = f"crop=3456:1944:0:{GAME_Y}"


def save(src, dst, width=None, height=None, box=None, q=86):
    im = Image.open(src).convert("RGBA")
    if box:
        im = im.crop(box)
    if width or height:
        im.thumbnail((width or 99999, height or 99999), Image.LANCZOS)
    im.save(dst, "WEBP", quality=q, method=6)


def atlas(src, dst, x, y, w, h, width):
    # Unity sprite rects count y from the bottom
    H = Image.open(src).height
    save(src, dst, width, box=(x, H - y - h, x + w, H - y))


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def clip(name, start, dur, crop, dst, width):
    ffmpeg("-ss", str(start), "-t", str(dur), "-i", str(TRAILER / f"{name}.mov"),
           "-vf", f"{crop},scale={width}:-2,fps=30", "-an", "-c:v", "libx264", "-preset", "slow",
           "-crf", "28", "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(dst))


def still(name, t, crop, dst):
    tmp = VID / "_tmp.png"
    ffmpeg("-ss", str(t), "-i", str(TRAILER / f"{name}.mov"), "-frames:v", "1", "-update", "1",
           "-vf", f"{crop},scale=1600:-2", str(tmp))
    save(tmp, dst, q=82)
    tmp.unlink()


# --- Branding
save(SPR / "Logos/Logo.png", IMG / "logo.webp", 900)
save(SPR / "Factions/Herd.png", IMG / "crest-herd.webp", 360)
save(SPR / "Factions/Verdant Grove.png", IMG / "crest-grove.webp", 360)
save(SPR / "Logos/LunarSol Games.png", IMG / "lunarsol.webp", 260)
save(SPR / "UI/steam.png", IMG / "steam.webp", 96)
save(SPR / "UI/Discord.png", IMG / "discord.webp", 96)
save(SPR / "UI/Mana.png", IMG / "mana.webp", 64)
Image.open(SPR / "Factions/Herd 128.png").resize((64, 64), Image.LANCZOS).save(IMG / "favicon.png")

# --- Backgrounds and characters
save(SPR / "Backgrounds/Splash.png", IMG / "bg-lane.webp", 2000, q=80)
save(SPR / "Backgrounds/BG 3.png", IMG / "bg-hills.webp", 2000, q=80)
for c in ("Buck", "Kip", "Capricos", "Monpa"):
    save(SPR / f"Characters/{c}.png", IMG / f"char-{c.lower()}.webp", height=560)

# --- Bases and turrets (atlas slices)
atlas(SPR / "Buildings/Base Herd.png", IMG / "base-herd.webp", 164, 98, 1387, 1056, 420)
atlas(SPR / "Buildings/Base VerdantGrove.png", IMG / "base-grove.webp", 200, 1523, 1629, 1170, 420)
save(SPR / "Units/UnitIcons/Turret Herd.png", IMG / "turret-herd.webp", 220)
save(SPR / "Units/UnitIcons/Turret Verfant.png", IMG / "turret-grove.webp", 220)

# --- Unit heads (normal + awakened)
HEADS = {
    "gold-digger": ("GoldDigger head", "GoldDigger AWK head"),
    "gym-rat": ("Gym Rat Head", "Gym Rat AWK Head"),
    "wash-hog": ("Washog Head", "Washog awk Head"),
    "black-sheep": ("Black Sheep Head", "Black Sheep AWK Head"),
    "holy-cow": ("Holy Cow Head", "Holy Cow AWK Head"),
    "high-horse": ("High Horse Head", "High Horse AWK Head"),
    "busy-bee": ("Busy Bee Head", "Busy Bee AWK Head"),
    "monkey-business": ("Business Monkey Head", "Business Monkey AWK head"),
    "fire-ant": ("Ant Head", "Ant AWK Head"),
    "snake-in-grass": ("Snake Grass head", "Snake Grass  awk head"),
    "paper-tiger": ("Paper Tiger Head", "Paper Tiger AWK Head"),
    "web-designer": ("Web Designer Head", "Web Designer AWK Head"),
    "guerrilla-warfare": ("Guerrilla Warfare Head", "Guerrilla Warfare AWK Head"),
}
for slug, (n, a) in HEADS.items():
    save(SPR / f"Units/UnitIcons/{n}.png", IMG / f"units/{slug}.webp", 220)
    save(SPR / f"Units/UnitIcons/{a}.png", IMG / f"units/{slug}-awk.webp", 220)

# --- Spell and awakening icons
for f in ("Ram", "Bulls eye", "Horse Power", "last resort", "Legendairy", "Snout", "Apex", "Beehind",
          "Fire Hazard", "Bananas", "PaperCut", "Snake Eyes", "Sticky", "Hibernations", "Storm",
          "scapegoat", "Dew Better", "Kissing Frog", "Rooting for you"):
    save(SPR / f"Icons/{f}.png", IMG / f"icons/{f.lower().replace(' ', '-')}.webp", 128)

# --- Hero montage (hard cuts on the busiest fights)
parts = [("Chaos 2", 0, 4, 0), ("Clip PVP 1V1", 2, 4, 300), ("C2_Jungle", 15, 4, 900),
         ("spells herd", 0.5, 4, 470), ("B_BaseCollapse", 18.5, 4.5, 1152)]
segs = []
for i, (n, s, d, x) in enumerate(parts):
    seg = VID / f"_seg{i}.mp4"
    clip(n, s, d, ZOOM.format(x=x), seg, 1280)
    segs.append(seg)
lst = VID / "_list.txt"
lst.write_text("".join(f"file '{p.name}'\n" for p in segs))
ffmpeg("-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", "-movflags", "+faststart", str(VID / "hero.mp4"))
for p in [*segs, lst]:
    p.unlink()
still("Chaos 2", 1, ZOOM.format(x=0), IMG / "hero-poster.webp")

# --- Feature loops
clip("goldminers", 0, 6, ZOOM.format(x=0), VID / "economy.mp4", 720)
clip("tech VG", 0, 2.4, FULL, VID / "tech.mp4", 720)
clip("spells  vedant", 0, 6, ZOOM.format(x=300), VID / "spells.mp4", 720)
clip("turret jungle", 0, 5.5, ZOOM.format(x=300), VID / "defenses.mp4", 720)
clip("B_BaseCollapse", 18, 7, ZOOM.format(x=1152), VID / "push.mp4", 720)

# --- Screenshots
still("Chaos 2", 9, ZOOM.format(x=0), IMG / "shots/jungle-brawl.webp")
still("Clip PVP 1V1", 3, ZOOM.format(x=300), IMG / "shots/farm-fight.webp")
still("C2_Jungle", 16, ZOOM.format(x=900), IMG / "shots/gorilla.webp")
still("B_BaseCollapse", 20, ZOOM.format(x=1152), IMG / "shots/base-down.webp")
still("destroy jungle", 40, ZOOM.format(x=600), IMG / "shots/big-crits.webp")
still("campaign 2", 4, FULL, IMG / "shots/campaign.webp")
still("tech VG", 1.5, FULL, IMG / "shots/tech-tree.webp")
still("Clip PVP 1V1", 28, FULL, IMG / "shots/victory.webp")
still("M_OnlineLobby", 4, FULL, IMG / "shots/lobby.webp")

# --- Full trailer fallback (used when no YouTube id is set)
ffmpeg("-i", str(TRAILER / "StayInYourLane_Trailer_v30_Steam_1080p.mp4"), "-vf", "scale=1280:-2",
       "-c:v", "libx264", "-preset", "slow", "-crf", "26", "-c:a", "aac", "-b:a", "128k",
       "-movflags", "+faststart", str(VID / "trailer.mp4"))
still_src = TRAILER / "StayInYourLane_Thumbnail_v2_1920x1080.png"
save(still_src, IMG / "trailer-poster.webp", 1600, q=82)
print("done")
