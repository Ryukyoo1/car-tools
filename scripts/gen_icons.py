"""Generate CAR TOOLS app icons (PNG) at 192/512 and a maskable 512 variant."""
from PIL import Image, ImageDraw

BG = (10, 10, 10, 255)
RING = (255, 255, 255, 255)
NEEDLE_UP = (232, 33, 39, 255)   # Tesla-inspired red
NEEDLE_DOWN = (90, 90, 90, 255)
CENTER = (255, 255, 255, 255)


def draw_logo(draw: ImageDraw.ImageDraw, size: int, scale: float = 1.0) -> None:
    cx = cy = size // 2
    ring_r = int(size * 0.30 * scale)
    lw = max(2, int(size * 0.022))
    draw.ellipse(
        [cx - ring_r, cy - ring_r, cx + ring_r, cy + ring_r],
        outline=RING,
        width=lw,
    )
    up_apex = int(cy - ring_r * 0.92)
    down_apex = int(cy + ring_r * 0.92)
    half = max(3, int(ring_r * 0.16))
    draw.polygon([(cx, up_apex), (cx - half, cy), (cx + half, cy)], fill=NEEDLE_UP)
    draw.polygon([(cx, down_apex), (cx - half, cy), (cx + half, cy)], fill=NEEDLE_DOWN)
    dot = max(2, int(size * 0.018))
    draw.ellipse([cx - dot, cy - dot, cx + dot, cy + dot], fill=CENTER)


def make(size: int, maskable: bool) -> Image.Image:
    img = Image.new("RGBA", (size, size), BG if not maskable else (10, 10, 10, 255))
    d = ImageDraw.Draw(img)
    if maskable:
        # keep key content within the safe 80% zone
        draw_logo(d, size, scale=0.78)
    else:
        draw_logo(d, size, scale=1.0)
    return img


if __name__ == "__main__":
    import os

    out = os.path.join(os.path.dirname(__file__), "..", "public", "icons")
    os.makedirs(out, exist_ok=True)
    make(192, False).save(os.path.join(out, "icon-192.png"))
    make(512, False).save(os.path.join(out, "icon-512.png"))
    make(512, True).save(os.path.join(out, "maskable-512.png"))
    print("icons written to", os.path.abspath(out))
