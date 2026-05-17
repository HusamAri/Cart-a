#!/usr/bin/env python3
"""Square favicon / apple-touch PNGs from brand art — uniform scale only (contain), never stretch."""
from __future__ import annotations

import argparse
from pathlib import Path

from PIL import Image


def render_contain_square(src: Image.Image, size: int) -> Image.Image:
    src = src.convert("RGBA")
    sw, sh = src.size
    if sw <= 0 or sh <= 0:
        raise ValueError("invalid source size")
    scale = min(size / sw, size / sh)
    nw = max(1, int(round(sw * scale)))
    nh = max(1, int(round(sh * scale)))
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ox = (size - nw) // 2
    oy = (size - nh) // 2
    out.alpha_composite(resized, (ox, oy))
    return out


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    assets = root / "assets"
    parser = argparse.ArgumentParser(
        description="Write carta-favicon.png + carta-apple-touch-icon.png from seal (aspect preserved)."
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=assets / "carta-brand-seal.png",
        help="Source RGBA PNG (default: assets/carta-brand-seal.png)",
    )
    parser.add_argument("--favicon-size", type=int, default=32)
    parser.add_argument("--apple-size", type=int, default=180)
    args = parser.parse_args()

    src_path: Path = args.source
    if not src_path.is_file():
        raise SystemExit(f"missing source: {src_path}")

    im = Image.open(src_path)
    fav = render_contain_square(im, args.favicon_size)
    apple = render_contain_square(im, args.apple_size)
    fav_path = assets / "carta-favicon.png"
    apple_path = assets / "carta-apple-touch-icon.png"
    fav.save(fav_path, optimize=True)
    apple.save(apple_path, optimize=True)
    print(f"wrote {fav_path} ({args.favicon_size}²), {apple_path} ({args.apple_size}²)")


if __name__ == "__main__":
    main()
