# Version FR TikTok de la vidéo IA de l'applique : accroche, sous-titres FR, cache le titre anglais, fin "lien en bio"
import subprocess, sys
from PIL import Image, ImageDraw, ImageFont
SRC = sys.argv[1]; OUT = sys.argv[2]
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
F = '/tmp/claude-0/-home-user-Higgsfield/f1396b37-470e-5d2c-a699-92ef893fc7c9/scratchpad/mont/package/files/montserrat-latin-%d-normal.woff'
W, H, FPS = 720, 1280, 24
font = lambda s: ImageFont.truetype(F % 800, s)

# (début, fin, texte, style, y) ; style 'bulle' = fond blanc (cache aussi le titre anglais), 'tiktok' = blanc contour noir
CAPS = [
    (0.0, 1.95, "Arrête de chercher l'interrupteur dans le noir", 'tiktok', 790),
    (2.0, 4.0, "un aimant, zéro perçage", 'tiktok', 790),
    (4.0, 6.3, "et elle s'allume toute seule quand tu passes", 'tiktok', 790),
    (6.4, 99, "Sans fil, sans perçage. Lien en bio", 'bulle', 790),
]

def wrap(d, t, f, maxw):
    out, line = [], ''
    for w in t.split(' '):
        x = (line + ' ' + w).strip()
        if d.textlength(x, font=f) <= maxw: line = x
        else: out.append(line); line = w
    out.append(line); return out

def draw(im, txt, style, y):
    d = ImageDraw.Draw(im); f = font(44 if style == 'bulle' else 42)
    lines = wrap(d, txt, f, 600); lh = int(f.size * 1.25)
    if style == 'bulle':                       # une seule bulle large : couvre le titre anglais d'origine
        wmax = max(d.textlength(l, font=f) for l in lines)
        x0 = min((W - wmax) / 2 - 30, 60); x1 = max((W + wmax) / 2 + 30, 660)
        d.rounded_rectangle([x0, y - 18, x1, y + lh * len(lines) + 8], 26, fill=(255, 255, 255))
    for l in lines:
        x = (W - d.textlength(l, font=f)) / 2
        if style == 'bulle': d.text((x, y), l, font=f, fill=(0, 0, 0))
        else: d.text((x, y), l, font=f, fill=(255, 255, 255), stroke_width=5, stroke_fill=(0, 0, 0))
        y += lh

dec = subprocess.Popen([FF, '-loglevel', 'error', '-i', SRC, '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = subprocess.Popen([FF, '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                        '-i', SRC, '-map', '0:v', '-map', '1:a?', '-c:v', 'libx264', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-shortest',
                        '-movflags', '+faststart', OUT], stdin=subprocess.PIPE)
i = 0
while True:
    buf = dec.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    im = Image.frombytes('RGB', (W, H), buf); t = i / FPS
    for a, b, txt, st, y in CAPS:
        if a <= t < b: draw(im, txt, st, y)
    enc.stdin.write(im.tobytes()); i += 1
enc.stdin.close(); enc.wait(); print('ok', i, 'images')
