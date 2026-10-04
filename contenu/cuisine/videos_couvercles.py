# Vidéos TikTok animées (9:16, 30 fps, sans son : ajouter un son tendance dans TikTok)
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
import subprocess, math
R = '/home/user/Higgsfield/'
F = '/tmp/claude-0/-home-user-Higgsfield/f1396b37-470e-5d2c-a699-92ef893fc7c9/scratchpad/mont/package/files/montserrat-latin-%d-normal.woff'
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
f = lambda w, s: ImageFont.truetype(F % w, s)
W, H, FPS = 1080, 1920, 30
INK=(31,38,34); DEEP=(47,79,62); MINT=(186,211,192); LIGHT=(242,244,238); WHITE=(255,255,255)
PH = Image.open(R+'produits/couvercles/00_photo_fournisseur.jpg').convert('RGB')
BIG = PH.resize((PH.width*2, PH.height*2), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 80, 2))
LOGO_B = Image.open(R+'logo/cuisine/cuisine_logo_blanc.png').convert('RGBA')
BLUR = PH.resize((W, W)).filter(ImageFilter.GaussianBlur(40))
BLUR = ImageEnhance.Brightness(BLUR.resize((int(W*H/W), H)).crop(((int(W*H/W)-W)//2, 0, (int(W*H/W)-W)//2+W, H))).enhance(0.55)

ease = lambda t: 0.5 - 0.5*math.cos(math.pi*min(max(t,0),1))
def lerp(a, b, t): return tuple(x+(y-x)*t for x, y in zip(a, b))

def bg_pan(a, b, t):          # a,b = (x, y, h) en px de la photo d'origine (960x960), cadre 9:16
    x, y, h = lerp(a, b, ease(t)); w = h*9/16
    return BIG.crop((int(x*2), int(y*2), int((x+w)*2), int((y+h)*2))).resize((W, H), Image.LANCZOS)
def bg_card(z0, z1, t):
    im = BLUR.copy(); z = z0+(z1-z0)*ease(t); s = int(940*z)
    c = PH.resize((s, s), Image.LANCZOS); m = Image.new('L', (s, s), 0); ImageDraw.Draw(m).rounded_rectangle([0,0,s-1,s-1], 44, fill=255)
    im.paste(c, ((W-s)//2, (H-s)//2+60), m); return im
def bg_solid(col, t): return Image.new('RGB', (W, H), col)

def wrap(d, t, font, maxw):
    out=[]; line=''
    for w in t.split(' '):
        x=(line+' '+w).strip()
        if d.textlength(x, font=font) <= maxw: line=x
        else: out.append(line); line=w
    out.append(line); return out

def draw_text(im, txt, size, y, style, t):
    a = ease(t/0.35)                               # apparition 0,35 s
    if a <= 0: return
    lay = Image.new('RGBA', (W, H), (0,0,0,0)); d = ImageDraw.Draw(lay)
    font = f(800, size); lines = wrap(d, txt, font, 860 if style in ('pill','dark') else 900)
    lh = int(size*1.22); dy = int((1-a)*40); yy = y + dy
    for ln in lines:
        tw = d.textlength(ln, font=font); x = (W-tw)/2
        if style == 'dark':
            d.rounded_rectangle([x-28, yy-14, x+tw+28, yy+lh-2], 22, fill=(20,26,22,int(175*a)))
            d.text((x, yy), ln, font=font, fill=WHITE+(int(255*a),))
        elif style == 'pill':
            d.rounded_rectangle([x-28, yy-14, x+tw+28, yy+lh-2], 22, fill=WHITE+(int(245*a),))
            d.text((x, yy), ln, font=font, fill=INK+(int(255*a),))
        else:
            for ox, oy in ((0,4),(2,4),(-2,4)): d.text((x+ox, yy+oy), ln, font=font, fill=(0,0,0,int(140*a)))
            d.text((x, yy), ln, font=font, fill=(style if isinstance(style, tuple) else WHITE)+(int(255*a),))
        yy += lh + (14 if style in ('pill','dark') else 0)
    im.alpha_composite(lay)

def render(name, scenes):
    p = subprocess.Popen([FF,'-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
                          '-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-movflags','+faststart',f'{R}contenu/cuisine/{name}.mp4'], stdin=subprocess.PIPE)
    for dur, bg, texts, logo in scenes:
        n = int(dur*FPS)
        for i in range(n):
            t = i/n; sec = i/FPS
            im = bg[0](*bg[1:], t).convert('RGBA')
            if bg[0] is not bg_solid:              # dégradé haut pour lisibilité
                g = Image.new('RGBA', (W, 700), (0,0,0,0)); gd = ImageDraw.Draw(g)
                for k in range(700): gd.line([(0,k),(W,k)], fill=(0,0,0,int(150*(1-k/700))))
                im.alpha_composite(g)
            for (txt, size, y, style, start) in texts: draw_text(im, txt, size, y, style, sec-start)
            if logo:
                lw = 460; l = LOGO_B.resize((lw, int(LOGO_B.height*lw/LOGO_B.width)), Image.LANCZOS); im.alpha_composite(l, ((W-lw)//2, H-260))
            p.stdin.write(im.convert('RGB').tobytes())
    p.stdin.close(); p.wait(); print(name, 'ok')

FULL0, FULL1 = (0,0,960), (420,0,960)
HANDS0, HANDS1 = (440,0,700), (500,40,600)
MELON0, MELON1 = (290,300,620), (320,330,540)
BOWLS0, BOWLS1 = (0,400,560), (10,440,500)
STACK0, STACK1 = (640,440,520), (670,470,470)
TOMA0, TOMA1 = (0,100,560), (30,140,480)

if __name__ == '__main__':
    render('video1_pov_film_plastique', [
        (2.8, (bg_pan, FULL0, FULL1), [("POV :", 70, 260, 'pill', 0), ("tu as jeté ton film plastique pour toujours", 64, 380, 'pill', 0.4)], False),
        (2.4, (bg_pan, HANDS0, HANDS1), [("Tu l'étires...", 80, 300, "dark", 0.1)], False),
        (2.6, (bg_pan, MELON0, MELON1), [("...et ça tient même sur une demi-pastèque", 70, 260, "dark", 0.1)], False),
        (2.4, (bg_pan, BOWLS0, BOWLS1), [("Petits bols, restes, fruits coupés", 70, 280, "dark", 0.1)], False),
        (2.4, (bg_pan, STACK0, STACK1), [("6 tailles. Réutilisables.", 76, 300, "dark", 0.1)], False),
        (3.0, (bg_card, 0.9, 1.0), [("Lien dans la bio", 84, 230, 'pill', 0.1)], True),
    ])
    render('video2_3_raisons', [
        (2.6, (bg_solid, DEEP), [("3 raisons d'arrêter le film plastique", 96, 700, WHITE, 0.1)], True),
        (2.6, (bg_pan, TOMA0, TOMA1), [("1", 150, 200, MINT, 0), ("Il colle partout sauf sur le bol", 70, 400, "dark", 0.25)], False),
        (2.6, (bg_pan, MELON0, MELON1), [("2", 150, 200, MINT, 0), ("Tu le jettes après chaque usage", 70, 400, "dark", 0.25)], False),
        (2.6, (bg_pan, HANDS0, HANDS1), [("3", 150, 200, MINT, 0), ("Il glisse sur les gros saladiers", 70, 400, "dark", 0.25)], False),
        (3.0, (bg_pan, FULL0, FULL1), [("La solution :", 70, 260, 'pill', 0), ("6 couvercles qui s'étirent", 70, 380, 'pill', 0.35)], False),
        (2.6, (bg_solid, DEEP), [("Lien dans la bio", 96, 760, WHITE, 0.1)], True),
    ])
    render('video3_gadget_15', [
        (3.0, (bg_card, 0.85, 1.0), [("Le gadget à moins de 15 € qui remplace le film plastique", 66, 200, 'pill', 0.1)], False),
        (2.0, (bg_pan, HANDS0, HANDS1), [("On étire", 96, 320, "dark", 0.05)], False),
        (2.0, (bg_pan, BOWLS0, BOWLS1), [("On pose", 96, 320, "dark", 0.05)], False),
        (2.2, (bg_pan, MELON0, MELON1), [("Et c'est fermé", 96, 320, "dark", 0.05)], False),
        (2.4, (bg_pan, STACK0, STACK1), [("Ça se lave et ça se réutilise", 76, 300, "dark", 0.05)], False),
        (3.0, (bg_solid, DEEP), [("Dispo sur Novashop", 90, 700, WHITE, 0.1), ("lien dans la bio", 64, 920, MINT, 0.5)], True),
    ])
