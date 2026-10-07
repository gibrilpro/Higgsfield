# Bannières thème savons : savons, bulles, brins de lavande, gouttes (motif discret, centre dégagé pour le texte)
from PIL import Image, ImageDraw, ImageFilter
import random, math, os
D = os.path.dirname(os.path.abspath(__file__)); W, H = 2400, 1350

def soap(d, cx, cy, w, h, ang, col):
    lay = Image.new('RGBA', (int(w*1.6), int(w*1.6)), (0,0,0,0)); g = ImageDraw.Draw(lay)
    ox, oy = lay.width/2-w/2, lay.height/2-h/2
    g.rounded_rectangle([ox, oy, ox+w, oy+h], radius=h*0.45, fill=col)
    g.rounded_rectangle([ox+w*0.12, oy+h*0.18, ox+w*0.88, oy+h*0.82], radius=h*0.35, outline=tuple(min(255,c+25) for c in col[:3])+(col[3],), width=max(3,int(h*0.06)))
    return lay.rotate(ang, expand=True, resample=Image.BICUBIC)

def lavender(d, x, y, L, ang, stem, bud):
    a = math.radians(ang); ex, ey = x+L*math.cos(a), y-L*math.sin(a)
    d.line([x, y, ex, ey], fill=stem, width=8)
    for k in range(9):
        t = 0.45+0.055*k; px, py = x+(ex-x)*t, y+(ey-y)*t; r = 16-k*0.8
        for s in (-1, 1):
            ox, oy = s*r*0.9*math.sin(a), s*r*0.9*math.cos(a)
            d.ellipse([px+ox-r, py+oy-r*1.3, px+ox+r, py+oy+r*1.3], fill=bud)

def banner(name, bg, soapc, bubble, stem, bud, seed):
    random.seed(seed); im = Image.new('RGBA', (W, H), bg); d = ImageDraw.Draw(im)
    def edge_xy():
        while True:
            x, y = random.randint(-100, W+100), random.randint(-100, H+100)
            if abs(x-W/2) > 620 or abs(y-H/2) > 430: return x, y
    for _ in range(26):
        x, y = edge_xy(); r = random.randint(14, 70)
        d.ellipse([x-r, y-r, x+r, y+r], outline=bubble, width=max(3, r//9))
        d.arc([x-r*0.6, y-r*0.6, x+r*0.2, y+r*0.2], 200, 260, fill=bubble, width=max(3, r//10))
    for _ in range(9):
        x, y = edge_xy(); w = random.randint(220, 340); s = soap(d, x, y, w, int(w*0.62), random.randint(-35, 35), soapc)
        im.alpha_composite(s, (int(x-s.width/2), int(y-s.height/2)))
    d = ImageDraw.Draw(im)
    for _ in range(7):
        x, y = edge_xy(); lavender(d, x, y, random.randint(230, 330), random.randint(50, 130), stem, bud)
    im.convert('RGB').save(f'{D}/{name}.jpg', quality=90)

banner('banniere1_clair',   (247,243,238,255), (226,214,234,255), (214,200,226,255), (196,206,190,255), (205,186,222,255), 1)
banner('banniere2_lavande', (94,74,114,255),   (110,90,131,255),  (125,105,146,255), (112,124,110,255), (130,108,152,255), 2)
banner('banniere3_sombre',  (43,37,48,255),    (58,50,65,255),    (66,58,74,255),    (62,70,62,255),    (72,62,84,255),    3)
print('ok')
