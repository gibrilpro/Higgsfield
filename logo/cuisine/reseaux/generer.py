# Photos de profil, couverture Facebook et couvertures de Stories à la une (thème cuisine)
from PIL import Image, ImageDraw, ImageFont
import os, math
D = os.path.dirname(os.path.abspath(__file__)); C = os.path.dirname(D)
F = "/tmp/claude-0/-home-user-Higgsfield/f1396b37-470e-5d2c-a699-92ef893fc7c9/scratchpad/mont/package/files/montserrat-latin-%d-normal.woff"
f = lambda w, s: ImageFont.truetype(F % w, s)
DEEP, LIGHT, MINT = "#2F4F3E", "#F2F4EE", "#BAD3C0"

Image.open(f"{C}/cuisine_icone.png").resize((1080, 1080), Image.LANCZOS).save(f"{D}/photo_profil.png")

# Couverture Facebook 1640x856 : bannière verte + logo blanc
cov = Image.open(f"{C}/banniere1_vert.jpg").convert("RGBA")
r = 1640 / cov.width; cov = cov.resize((1640, int(cov.height * r)), Image.LANCZOS)
top = (cov.height - 856) // 2; cov = cov.crop((0, top, 1640, top + 856))
logo = Image.open(f"{C}/cuisine_logo_blanc.png").convert("RGBA")
lw = 900; logo = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
cov.alpha_composite(logo, ((1640 - lw) // 2, 330 - logo.height // 2))
d = ImageDraw.Draw(cov)
t = "Les gadgets malins qui changent la cuisine"; ft = f(600, 46)
d.text(((1640 - d.textlength(t, font=ft)) / 2, 470), t, font=ft, fill=LIGHT)
cov.convert("RGB").save(f"{D}/couverture_facebook.jpg", quality=92)

# Stories à la une 1080x1920 (icône centrée dans le rond)
def story(name, label, draw_icon):
    im = Image.new("RGB", (1080, 1920), DEEP); d = ImageDraw.Draw(im)
    cx, cy = 540, 960
    d.ellipse([cx-330, cy-330, cx+330, cy+330], outline=MINT, width=16)
    draw_icon(d, cx, cy)
    fl = f(700, 64); d.text(((1080 - d.textlength(label, font=fl)) / 2, cy + 400), label, font=fl, fill=LIGHT)
    im.save(f"{D}/une_{name}.jpg", quality=92)

def ic_produits(d, cx, cy):  # bol + couvercle
    d.chord([cx-200, cy-170, cx+200, cy+190], 0, 180, fill=MINT)
    d.ellipse([cx-215, cy-30, cx+215, cy+30], fill=LIGHT)
    d.rectangle([cx-70, cy+180, cx+70, cy+200], fill=MINT)
def ic_avis(d, cx, cy):
    pts = []
    for i in range(10):
        a = -math.pi/2 + i * math.pi/5; rr = 200 if i % 2 == 0 else 85
        pts.append((cx + rr*math.cos(a), cy + 15 + rr*math.sin(a)))
    d.polygon(pts, fill=MINT)
def ic_livraison(d, cx, cy):
    d.polygon([(cx, cy-190), (cx+190, cy-95), (cx, cy), (cx-190, cy-95)], fill=LIGHT)
    d.polygon([(cx-190, cy-95), (cx, cy), (cx, cy+200), (cx-190, cy+105)], fill=MINT)
    d.polygon([(cx+190, cy-95), (cx, cy), (cx, cy+200), (cx+190, cy+105)], fill="#9CC1A5")
def ic_faq(d, cx, cy):
    fq = f(800, 360); t = "?"; d.text((cx - d.textlength(t, font=fq)/2, cy - 250), t, font=fq, fill=MINT)

story("produits", "Produits", ic_produits); story("avis", "Avis", ic_avis)
story("livraison", "Livraison", ic_livraison); story("faq", "FAQ", ic_faq)

# Planche d'aperçu
p = Image.new("RGB", (1640, 1500), "white")
p.paste(cov.convert("RGB"), (0, 0))
p.paste(Image.open(f"{D}/photo_profil.png").resize((500, 500)), (40, 900))
for i, n in enumerate(["produits", "avis", "livraison", "faq"]):
    s = Image.open(f"{D}/une_{n}.jpg").crop((0, 420, 1080, 1500)).resize((240, 240))
    p.paste(s, (600 + i*260, 1030))
p.save("/tmp/claude-0/-home-user-Higgsfield/f1396b37-470e-5d2c-a699-92ef893fc7c9/scratchpad/reseaux.jpg")
print("ok")
