#!/usr/bin/env python3
"""Generate static Open Graph share images (PNG) for bi-chao.com.

Why this exists
---------------
The Worker used to advertise `/og?title=...` as `og:image`, but that endpoint
returns `image/svg+xml`. X/Twitter, Facebook, LinkedIn, WeChat, Slack and
Telegram all refuse SVG for OG images, so **every share card on the site was
imageless**. This script pre-renders 1200x630 PNGs at build time so that
`og:image` points at a bitmap that every platform accepts.

Output
------
  assets/og/<slug>.png   - one per article in articles/index.json
  assets/og/default.png  - site-wide fallback (homepage, about, tags)

Design mirrors the previous inline SVG: #1e293b background, inset rounded
border, grey eyebrow line, wrapped white title, date, domain.

Determinism
-----------
Same input -> byte-identical output (no timestamps are written into the PNG),
so a no-op run produces a zero diff. Images are skipped when they are already
newer than articles/index.json unless --force is passed.

Fonts
-----
A CJK font is mandatory (the titles are Chinese). The script searches the
usual Linux and macOS locations; if none is found it exits non-zero rather
than silently emitting tofu boxes. In CI, install `fonts-noto-cjk`.
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required: pip install Pillow")

ROOT = Path(__file__).resolve().parent.parent
INDEX = ROOT / "articles" / "index.json"
OUT_DIR = ROOT / "assets" / "og"

W, H = 1200, 630
BG = "#1e293b"
BORDER = "#334155"
EYEBROW = "#94a3b8"
TITLE = "#ffffff"
DATE_C = "#64748b"
DOMAIN_C = "#475569"
EYEBROW_TEXT = "chaos-for-agent / 智能体的知识库"
DOMAIN_TEXT = "bi-chao.com"

TITLE_SIZE = 36
WRAP_CHARS = 24          # matches the previous SVG's wrapText(title, 24)
LINE_HEIGHT = 48
TITLE_CENTER_Y = 300

# Ordered by preference. .ttc files are font collections; index 0 is the
# regular face we want.
FONT_CANDIDATES = [
    # Linux (GitHub Actions: fonts-noto-cjk)
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/opentype/noto/NotoSerifCJK-Regular.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJKsc-Regular.otf",
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
    "/usr/share/fonts/truetype/arphic/uming.ttc",
    # macOS (local development)
    "/System/Library/Fonts/Hiragino Sans GB.ttc",
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/System/Library/Fonts/PingFang.ttc",
    "/Library/Fonts/Arial Unicode.ttf",
]


def find_font_path() -> str:
    for p in FONT_CANDIDATES:
        if Path(p).is_file():
            return p
    sys.exit(
        "No CJK font found. Install one (CI: `apt-get install -y fonts-noto-cjk`) "
        "or add its path to FONT_CANDIDATES."
    )


def load_font(path: str, size: int) -> "ImageFont.FreeTypeFont":
    """Load face index 0 from a font file/collection."""
    try:
        return ImageFont.truetype(path, size=size, index=0)
    except Exception:
        return ImageFont.truetype(path, size=size)


def wrap(text: str, max_chars: int) -> list[str]:
    """Character-wise wrap. CJK has no spaces, so we cannot wrap on words.

    Kept deliberately identical in spirit to the Worker's wrapText() so the
    PNG and the SVG fallback look the same.
    """
    lines, cur = [], ""
    for ch in text:
        if len(cur) >= max_chars:
            lines.append(cur)
            cur = ""
        cur += ch
    if cur:
        lines.append(cur)
    return lines or [""]


def draw_centered(draw, text, font, y, fill, stroke_width=0, stroke_fill=None):
    """Draw text horizontally centred; y is the vertical middle of the glyph box."""
    draw.text(
        (W // 2, y), text, font=font, fill=fill, anchor="mm",
        stroke_width=stroke_width, stroke_fill=stroke_fill,
    )


def render(title: str, date: str, font_path: str, out: Path) -> None:
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # Inset rounded border
    d.rounded_rectangle([(40, 40), (W - 40, H - 40)], radius=12, outline=BORDER, width=2)

    f_eyebrow = load_font(font_path, 20)
    f_title = load_font(font_path, TITLE_SIZE)
    f_meta = load_font(font_path, 18)
    f_domain = load_font(font_path, 14)

    draw_centered(d, EYEBROW_TEXT, f_eyebrow, 180, EYEBROW)

    lines = wrap(title, WRAP_CHARS)
    # Centre the block of title lines on TITLE_CENTER_Y (SVG used 280 as baseline)
    y = TITLE_CENTER_Y - (len(lines) - 1) * (LINE_HEIGHT // 2)
    for line in lines:
        # stroke_width fakes bold without needing a separate bold face
        draw_centered(d, line, f_title, y, TITLE, stroke_width=1, stroke_fill=TITLE)
        y += LINE_HEIGHT

    if date:
        draw_centered(d, date, f_meta, 520, DATE_C)
    draw_centered(d, DOMAIN_TEXT, f_domain, 560, DOMAIN_C)

    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, format="PNG", optimize=True)


def needs_render(out: Path, ref: Path, force: bool) -> bool:
    if force or not out.is_file():
        return True
    try:
        return out.stat().st_mtime < ref.stat().st_mtime
    except OSError:
        return True


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--force", action="store_true", help="regenerate every image")
    args = ap.parse_args()

    if not INDEX.is_file():
        sys.exit(f"missing {INDEX}; run scripts/generate_site.py first")

    articles = json.loads(INDEX.read_text(encoding="utf-8"))
    if isinstance(articles, dict):
        articles = articles.get("articles", [])
    if not articles:
        sys.exit("articles/index.json is empty")

    font_path = find_font_path()
    print(f"font: {font_path}")

    written = skipped = 0

    # Site-wide fallback first
    default_out = OUT_DIR / "default.png"
    if needs_render(default_out, INDEX, args.force):
        render("智能体的知识库 — chaos-for-agent", "", font_path, default_out)
        written += 1
    else:
        skipped += 1

    for a in articles:
        slug = (a.get("slug") or "").strip()
        if not slug:
            continue
        out = OUT_DIR / f"{slug}.png"
        if not needs_render(out, INDEX, args.force):
            skipped += 1
            continue
        render(a.get("title") or slug, a.get("date") or "", font_path, out)
        written += 1

    total = written + skipped
    print(f"og images: written={written} skipped={skipped} total={total}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
