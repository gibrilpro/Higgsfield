# Textes FR sur la pub produit Veo (1080x1920, 24 fps) : style TikTok blanc contour noir + bulle finale
import subprocess, sys
from PIL import Image, ImageDraw, ImageFont
SRC, OUT = sys.argv[1], sys.argv[2]
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
F = '/tmp/claude-0/-home-user-Higgsfield/f1396b37-470e-5d2c-a699-92ef893fc7c9/scratchpad/mont/package/files/montserrat-latin-%d-normal.woff'
W, H, FPS = 1080, 1920, 24
CAPS = [
    (0.0, 2.2, "elle se fixe avec un aimant", 'tiktok'),
    (2.2, 4.4, "zéro perçage, zéro câble", 'tiktok'),
    (4.4, 6.0, "elle s'allume toute seule quand tu passes", 'tiktok'),
    (6.0, 99, "lien en bio", 'bulle'),
]
Y = 1180
def wrap(d, t, f, maxw):
    out, line = [], ''
    for w in t.split(' '):
        x = (line + ' ' + w).strip()
        if d.textlength(x, font=f) <= maxw: line = x
        else: out.append(line); line = w
    out.append(line); return out
def draw(im, txt, style):
    d = ImageDraw.Draw(im); f = ImageFont.truetype(F % 800, 66 if style == 'bulle' else 62)
    lines = wrap(d, txt, f, 900); lh = int(f.size * 1.25); y = Y
    if style == 'bulle':
        wmax = max(d.textlength(l, font=f) for l in lines)
        d.rounded_rectangle([(W - wmax) / 2 - 44, y - 26, (W + wmax) / 2 + 44, y + lh * len(lines) + 12], 38, fill=(255, 255, 255))
    for l in lines:
        x = (W - d.textlength(l, font=f)) / 2
        if style == 'bulle': d.text((x, y), l, font=f, fill=(0, 0, 0))
        else: d.text((x, y), l, font=f, fill=(255, 255, 255), stroke_width=7, stroke_fill=(0, 0, 0))
        y += lh
dec = subprocess.Popen([FF, '-loglevel', 'error', '-i', SRC, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen([FF, '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-i', SRC, '-map', '0:v', '-map', '1:a?', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-shortest',
                        '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
i = 0
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    im = Image.frombytes('RGB', (W, H), buf); t = i / FPS
    for a, b, txt, st in CAPS:
        if a <= t < b: draw(im, txt, st)
    enc.stdin.write(im.tobytes()); i += 1
enc.stdin.close(); enc.wait(); print('ok', i)
