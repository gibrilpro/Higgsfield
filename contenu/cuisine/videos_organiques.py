# Vidéos au style "organique" TikTok : pas de logo, texte natif (blanc contour noir), cadrage qui bouge comme au téléphone
import sys, math, random
sys.path.insert(0, '/home/user/Higgsfield/contenu/cuisine')
import videos_couvercles as V      # réutilise photo, pans et encodeur (ne relance pas le rendu : voir garde plus bas)
from PIL import Image, ImageDraw
W, H, FPS = V.W, V.H, V.FPS

def caption(im, txt, y, size=62, bubble=False):
    d = ImageDraw.Draw(im); font = V.f(700, size)
    lines = V.wrap(d, txt, font, 880); lh = int(size*1.25)
    for ln in lines:
        tw = d.textlength(ln, font=font); x = (W-tw)/2
        if bubble:
            d.rounded_rectangle([x-22, y-10, x+tw+22, y+lh-4], 16, fill=(255,255,255))
            d.text((x, y), ln, font=font, fill=(0,0,0))
        else:
            d.text((x, y), ln, font=font, fill=(255,255,255), stroke_width=5, stroke_fill=(0,0,0))
        y += lh + (6 if bubble else 0)

def shake(im, i, amp=10):
    dx = amp*math.sin(i*0.37)+amp*0.6*math.sin(i*0.91); dy = amp*math.cos(i*0.29)+amp*0.5*math.sin(i*1.13)
    big = im.resize((int(W*1.04), int(H*1.04)))
    ox = int((big.width-W)/2+dx); oy = int((big.height-H)/2+dy)
    return big.crop((ox, oy, ox+W, oy+H))

def render(name, scenes):
    import subprocess
    p = subprocess.Popen([V.FF,'-y','-loglevel','error','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-',
                          '-c:v','libx264','-pix_fmt','yuv420p','-crf','21','-movflags','+faststart',f'{V.R}contenu/cuisine/{name}.mp4'], stdin=subprocess.PIPE)
    g = 0
    for dur, a, b, texts in scenes:
        n = int(dur*FPS)
        for i in range(n):
            im = shake(V.bg_pan(a, b, i/n), g).convert('RGB')
            for txt, y, kw in texts: caption(im, txt, y, **kw)
            p.stdin.write(im.tobytes()); g += 1
    p.stdin.close(); p.wait(); print(name, 'ok')

render('organique1_pov', [
    (1.6, V.FULL0, (120,0,960), [("pov : tu découvres les couvercles qui s'étirent", 820, {})]),
    (1.4, V.HANDS0, V.HANDS1, [("tu tires un peu", 820, {})]),
    (1.4, V.MELON0, V.MELON1, [("même sur une demi-pastèque", 820, {})]),
    (1.3, V.BOWLS0, V.BOWLS1, [("les petits bols aussi", 820, {})]),
    (1.3, V.TOMA0, V.TOMA1, [("plus de film plastique", 820, {})]),
    (1.6, V.STACK0, V.STACK1, [("6 tailles dans le lot", 820, {}), ("lien en bio", 1500, {'size': 44, 'bubble': True})]),
])
render('organique2_choses_utiles', [
    (1.8, V.FULL0, (200,0,960), [("des choses utiles que j'aurais aimé connaître avant", 300, {'bubble': True}), ("partie 1", 820, {})]),
    (1.5, V.HANDS0, V.HANDS1, [("des couvercles en silicone", 300, {'bubble': True})]),
    (1.5, V.MELON0, V.MELON1, [("ça s'étire sur presque tout", 300, {'bubble': True})]),
    (1.5, V.BOWLS0, V.BOWLS1, [("bols, restes, fruits coupés", 300, {'bubble': True})]),
    (1.8, V.STACK0, V.STACK1, [("et ça se lave", 300, {'bubble': True}), ("lien en bio", 1500, {'size': 44, 'bubble': True})]),
])
