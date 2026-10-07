# Bannières thème lumières : appliques murales qui projettent des faisceaux colorés haut/bas sur un mur sombre
from PIL import Image, ImageDraw, ImageFilter, ImageChops
import os
D = os.path.dirname(os.path.abspath(__file__)); W, H = 2400, 1350

def beams(im, x, y, col, spread=230, length=620, inten=235):
    lay = Image.new('RGB', (W, H), (0,0,0)); d = ImageDraw.Draw(lay)
    for sgn in (-1, 1):                                   # faisceau vers le haut et vers le bas
        tip = y + sgn*30
        d.polygon([(x-22, tip), (x+22, tip), (x+spread, tip+sgn*length), (x-spread, tip+sgn*length)], fill=tuple(int(c*inten/255) for c in col))
    lay = lay.filter(ImageFilter.GaussianBlur(28))
    fade = Image.new('L', (1, H))                         # plus lumineux près de l'applique, s'estompe vers les bords
    for yy in range(H): fade.putpixel((0, yy), int(255*max(0.22, 1-abs(yy-y)/(length*1.15))**0.75))
    lay = Image.composite(lay, Image.new('RGB', (W, H)), fade.resize((W, H)))
    glow = Image.new('RGB', (W, H), (0,0,0)); ImageDraw.Draw(glow).ellipse([x-120, y-170, x+120, y+170], fill=tuple(int(c*0.5) for c in col))
    lay = ImageChops.add(lay, glow.filter(ImageFilter.GaussianBlur(70)))
    return ImageChops.add(im, lay)

def lamp(im, x, y):
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([x-26, y-95, x+26, y+95], 26, fill=(236,234,240)); d.ellipse([x-10, y-10, x+10, y+10], fill=(170,170,185))

def banner(name, bg, lamps):
    im = Image.new('RGB', (W, H), bg)
    for x, col in lamps: im = beams(im, x, H//2, col)
    for x, _ in lamps: lamp(im, x, H//2)
    im.save(f'{D}/{name}.jpg', quality=90)

banner('banniere1_violet', (22,19,32), [(330,(170,90,255)), (2070,(255,90,170))])
banner('banniere2_ambre',  (26,20,18), [(330,(255,150,60)), (2070,(255,190,90))])
banner('banniere3_neon',   (14,18,28), [(330,(60,200,255)), (2070,(120,255,170))])
print('ok')

# Versions mobiles (portrait) : appliques rapprochées pour rester visibles sur téléphone
W, H = 1080, 1500
banner('banniere1_violet_mobile', (22,19,32), [(170,(170,90,255)), (910,(255,90,170))])
banner('banniere2_ambre_mobile',  (26,20,18), [(170,(255,150,60)), (910,(255,190,90))])
banner('banniere3_neon_mobile',   (14,18,28), [(170,(60,200,255)), (910,(120,255,170))])
