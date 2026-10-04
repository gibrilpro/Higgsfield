# Visuels illustrés de la fiche "Couvercles extensibles en silicone" (1500x1500)
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import math, os
OUT = os.path.dirname(os.path.abspath(__file__))
F = "/tmp/claude-0/-home-user-Higgsfield/f1396b37-470e-5d2c-a699-92ef893fc7c9/scratchpad/mont/package/files/montserrat-latin-%d-normal.woff"
f = lambda w, s: ImageFont.truetype(F % w, s)
W = 1500
INK, DEEP, SAGE, LIGHT = "#1F2622", "#2F4F3E", "#5F8A6B", "#F2F4EE"
COLS = [(110,170,225),(240,140,170),(250,205,90),(120,195,140),(200,215,225),(170,150,225)]

def lid(img, cx, cy, r, col, tilt=1.0):
    """Couvercle vu de dessus/en biais : rebord épais + membrane translucide."""
    lay = Image.new("RGBA", img.size, (0,0,0,0)); d = ImageDraw.Draw(lay)
    ry = r * tilt
    d.ellipse([cx-r, cy-ry+r*0.06, cx+r, cy+ry+r*0.06], fill=(0,0,0,40))  # ombre
    d.ellipse([cx-r, cy-ry, cx+r, cy+ry], fill=col+(255,))
    rim = r*0.16
    d.ellipse([cx-r+rim, cy-ry+rim*tilt, cx+r-rim, cy+ry-rim*tilt], fill=tuple(min(255,c+45) for c in col)+(150,))
    # nervures concentriques
    for k in (0.55, 0.3):
        rr = (r-rim)*k
        d.ellipse([cx-rr, cy-rr*tilt, cx+rr, cy+rr*tilt], outline=col+(120,), width=max(2,int(r*0.02)))
    # reflet
    d.arc([cx-r*0.75, cy-ry*0.75, cx+r*0.75, cy+ry*0.75], 200, 260, fill=(255,255,255,170), width=max(3,int(r*0.05)))
    img.alpha_composite(lay)

def bowl(img, cx, top, w, h, col):
    d = ImageDraw.Draw(img)
    d.chord([cx-w/2, top-h, cx+w/2, top+h], 0, 180, fill=col)
    d.rectangle([cx-w*0.18, top+h-10, cx+w*0.18, top+h+8], fill=col)

def center(d, y, txt, font, fill):
    x = (W - d.textlength(txt, font=font)) / 2; d.text((x, y), txt, font=font, fill=fill)

def footer(d):
    center(d, 1420, "NOVASHOP · CUISINE · GADGETS MALINS", f(600, 26), SAGE)

# 1. Hero : les 6 tailles
im = Image.new("RGBA", (W, W), LIGHT); d = ImageDraw.Draw(im)
center(d, 110, "6 couvercles extensibles", f(800, 76), INK)
center(d, 205, "1 set pour tous tes bols, boîtes et restes", f(500, 38), DEEP)
sizes = [(380, 840, 250), (840, 770, 210), (1180, 900, 160), (560, 1210, 140), (880, 1170, 115), (1130, 1230, 90)]
for (x, y, r), c in zip(sizes, COLS): lid(im, x, y, r, c, 0.92)
d = ImageDraw.Draw(im)
d.rounded_rectangle([1060, 400, 1400, 500], 50, fill=DEEP); center_x = 1230
t = "6 tailles"; d.text((center_x - d.textlength(t, font=f(700, 44))/2, 422), t, font=f(700, 44), fill=LIGHT)
footer(d); im.convert("RGB").save(f"{OUT}/01_six_tailles.jpg", quality=92)

# 2. S'adapte à tout
im = Image.new("RGBA", (W, W), "#ffffff"); d = ImageDraw.Draw(im)
center(d, 100, "Ça s'adapte à (presque) tout", f(800, 68), INK)
cells = [(375, 520, "Bols & saladiers"), (1125, 520, "Boîtes de conserve"), (375, 1060, "Tasses & mugs"), (1125, 1060, "Fruits coupés")]
for i, (cx, cy, lab) in enumerate(cells):
    d.rounded_rectangle([cx-320, cy-250, cx+320, cy+250], 40, fill=LIGHT)
    if i == 0:
        bowl(im, cx, cy-10, 380, 150, "#E8D9C4"); lid(im, cx, cy-10, 200, COLS[4], 0.28)
    elif i == 1:
        d.rectangle([cx-110, cy-60, cx+110, cy+130], fill="#B9C2C9")
        for yy in (cy-20, cy+40, cy+100): d.line([cx-110, yy, cx+110, yy], fill="#9AA4AC", width=4)
        lid(im, cx, cy-60, 125, COLS[0], 0.3)
    elif i == 2:
        d.rounded_rectangle([cx-100, cy-70, cx+100, cy+120], 30, fill="#E07A5F")
        d.arc([cx+60, cy-30, cx+170, cy+80], -90, 90, fill="#E07A5F", width=22)
        lid(im, cx, cy-70, 115, COLS[2], 0.3)
    else:
        d.chord([cx-190, cy-200, cx+190, cy+140], 0, 180, fill="#3E8E4F")
        d.chord([cx-170, cy-180, cx+170, cy+120], 0, 180, fill="#E94F4F")
        lid(im, cx, cy-30, 190, COLS[3], 0.28)
    d = ImageDraw.Draw(im)
    center_txt = lab; d.text((cx - d.textlength(lab, font=f(700, 40))/2, cy+175), lab, font=f(700, 40), fill=DEEP)
footer(d); im.convert("RGB").save(f"{OUT}/02_adapte_a_tout.jpg", quality=92)

# 3. Mode d'emploi
im = Image.new("RGBA", (W, W), LIGHT); d = ImageDraw.Draw(im)
center(d, 100, "Comment ça marche ?", f(800, 72), INK)
steps = [("1", "Choisis un couvercle", "un peu plus petit que ton récipient"),
         ("2", "Étire-le doucement", "en tirant sur les bords, tout autour"),
         ("3", "C'est fermé", "et ça se lave à l'eau savonneuse")]
for i, (n, a, b) in enumerate(steps):
    y = 300 + i*360
    d.rounded_rectangle([140, y, 1360, y+300], 40, fill="#ffffff")
    d.ellipse([190, y+70, 350, y+230], fill=DEEP)
    d.text((270 - d.textlength(n, font=f(800, 90))/2, y+90), n, font=f(800, 90), fill=LIGHT)
    d.text((400, y+85), a, font=f(700, 54), fill=INK)
    d.text((400, y+165), b, font=f(500, 36), fill=SAGE)
footer(d); im.convert("RGB").save(f"{OUT}/03_mode_emploi.jpg", quality=92)

# 4. Film plastique vs couvercles
im = Image.new("RGBA", (W, W), "#ffffff"); d = ImageDraw.Draw(im)
center(d, 100, "Adieu le film plastique", f(800, 72), INK)
d.rounded_rectangle([110, 280, 730, 1330], 40, fill="#F4ECEC"); d.rounded_rectangle([770, 280, 1390, 1330], 40, fill=LIGHT)
d.text((420 - d.textlength("Film plastique", font=f(700, 48))/2, 330), "Film plastique", font=f(700, 48), fill="#8A3B3B")
d.text((1080 - d.textlength("Couvercles", font=f(700, 48))/2, 330), "Couvercles", font=f(700, 48), fill=DEEP)
bad = ["Colle partout", "À jeter après usage", "Se déchire à l'ouverture", "Rachat tous les mois"]
good = ["Se pose en 2 secondes", "Réutilisables", "6 tailles différentes", "Rangés dans un tiroir"]
for i, (a, b) in enumerate(zip(bad, good)):
    y = 470 + i*200
    d.ellipse([160, y, 220, y+60], fill="#C65A5A"); d.line([175, y+15, 205, y+45], fill="white", width=7); d.line([205, y+15, 175, y+45], fill="white", width=7)
    d.text((245, y+8), a, font=f(600, 36), fill=INK)
    d.ellipse([820, y, 880, y+60], fill=SAGE); d.line([835, y+32, 848, y+45], fill="white", width=7); d.line([848, y+45, 868, y+18], fill="white", width=7)
    d.text((905, y+8), b, font=f(600, 36), fill=INK)
footer(d); im.convert("RGB").save(f"{OUT}/04_vs_film.jpg", quality=92)
print("ok")
