# Carrousels TikTok éducatifs - couvercles extensibles (palette cuisine)
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, subprocess
R = '/home/user/Higgsfield/'
F = '/tmp/claude-0/-home-user-Higgsfield/f1396b37-470e-5d2c-a699-92ef893fc7c9/scratchpad/mont/package/files/montserrat-latin-%d-normal.woff'
FF = '/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
f = lambda w, s: ImageFont.truetype(F % w, s)
W, H = 1080, 1920
LIGHT=(242,244,238); INK=(31,38,34); DEEP=(47,79,62); SAGE=(95,138,107); MINT=(186,211,192); MUTED=(84,96,88); WHITE=(255,255,255)
PHOTO = Image.open(R+'produits/couvercles/00_photo_fournisseur.jpg').convert('RGB')
LOGO_N = Image.open(R+'logo/cuisine/cuisine_logo_noir.png'); LOGO_B = Image.open(R+'logo/cuisine/cuisine_logo_blanc.png')
OUT = R+'contenu/cuisine/'

def wrap(d, t, font, maxw):
    out=[]; line=''
    for w in t.split():
        x=(line+' '+w).strip()
        if d.textlength(x,font=font)<=maxw: line=x
        else: out.append(line); line=w
    out.append(line); return out
def text(im, xy, t, font, fill, maxw=900, gap=1.18):
    d=ImageDraw.Draw(im); x,y=xy
    for ln in wrap(d,t,font,maxw): d.text((x,y),ln,font=font,fill=fill); y+=int(font.size*gap)
    return y
def logo(im, dark=False, y=H-140):
    L=LOGO_B if dark else LOGO_N; w=340; l=L.resize((w,int(L.height*w/L.width)),Image.LANCZOS); im.alpha_composite(l,((W-w)//2,y))
def counter(im, i, n, dark=False):
    d=ImageDraw.Draw(im); s=f'{i}/{n}'; fo=f(600,30)
    d.text((W-90-d.textlength(s,font=fo),90),s,font=fo,fill=MINT if dark else SAGE)
def photo(w, h, focus=0.5):
    p=PHOTO; r=max(w/p.width,h/p.height); p=p.resize((int(p.width*r)+1,int(p.height*r)+1),Image.LANCZOS)
    x=int((p.width-w)*focus); y=(p.height-h)//2; return p.crop((x,y,x+w,y+h)).convert('RGBA')
def cover(title, sub):
    im=Image.new('RGBA',(W,H),INK+(255,)); im.alpha_composite(photo(W,1150),(0,H-1150))
    g=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(g)
    for i in range(650): d.line([(0,H-1150+i),(W,H-1150+i)],fill=INK+(int(255*(1-i/650)**1.4),))
    im.alpha_composite(g)
    y=text(im,(90,180),title,f(800,96),WHITE,gap=1.08)
    d=ImageDraw.Draw(im); d.rectangle([90,y+20,250,y+28],fill=MINT)
    text(im,(90,y+60),sub,f(500,40),(225,232,226),maxw=880); return im
def tip(i, n, num, title, body, good=None):
    im=Image.new('RGBA',(W,H),LIGHT+(255,)); d=ImageDraw.Draw(im); counter(im,i,n)
    d.text((90,330),num,font=f(800,220),fill=SAGE)
    y=text(im,(90,620),title,f(800,74),INK,gap=1.1)
    y=text(im,(90,y+40),body,f(500,42),MUTED,maxw=880,gap=1.35)
    if good:
        lines=wrap(d,good,f(600,40),800); box=[90,y+60,W-90,y+60+80+int(40*1.35)*len(lines)]
        d.rounded_rectangle(box,radius=28,fill=WHITE); d.rounded_rectangle([90,box[1],104,box[3]],radius=7,fill=SAGE)
        text(im,(140,box[1]+40),good,f(600,40),INK,maxw=800,gap=1.35); y=box[3]
    if y < 1300:
        sz=min(620, 1700-(y+60)); ph=photo(sz,sz,0.55); m=Image.new('L',(sz,sz),0); ImageDraw.Draw(m).rounded_rectangle([0,0,sz-1,sz-1],radius=40,fill=255)
        im.paste(ph,((W-sz)//2,1720-sz),m)
    logo(im); return im
def product_slide(i, n, title, body):
    im=Image.new('RGBA',(W,H),LIGHT+(255,)); counter(im,i,n)
    y=text(im,(90,200),title,f(800,78),INK,gap=1.1); y=text(im,(90,y+30),body,f(500,42),MUTED,maxw=880,gap=1.35)
    ph=photo(900,900,0.55); m=Image.new('L',(900,900),0); ImageDraw.Draw(m).rounded_rectangle([0,0,899,899],radius=48,fill=255)
    im.paste(ph,(90,max(y+60,700)),m); logo(im); return im
def cta(i, n, l1, l2):
    im=Image.new('RGBA',(W,H),DEEP+(255,)); counter(im,i,n,True)
    y=text(im,(90,640),l1,f(800,92),WHITE,gap=1.08); d=ImageDraw.Draw(im); d.rectangle([90,y+30,250,y+38],fill=MINT)
    text(im,(90,y+80),l2,f(500,44),(225,232,226),maxw=880,gap=1.35); logo(im,True); return im

def save(folder, slides):
    os.makedirs(OUT+folder, exist_ok=True)
    for k, s in enumerate(slides, 1): s.convert('RGB').save(f'{OUT}{folder}/{k:02d}.jpg', quality=92)
    # version vidéo : 3 s par slide
    lst=OUT+folder+'/list.txt'
    with open(lst,'w') as fh:
        for k in range(1,len(slides)+1): fh.write(f"file '{k:02d}.jpg'\nduration 3\n")
        fh.write(f"file '{len(slides):02d}.jpg'\n")
    subprocess.run([FF,'-y','-loglevel','error','-f','concat','-safe','0','-i',lst,'-vf','fps=30,format=yuv420p','-c:v','libx264','-movflags','+faststart',f'{OUT}{folder}_video.mp4'],check=True)
    os.remove(lst)

n=7
save('carrousel_conservation', [
    cover("5 aliments que tu conserves mal au frigo", "Le n°3, presque tout le monde le fait"),
    tip(2,n,"1","Le demi-oignon","Laissé à l'air libre, il sèche et son odeur se répand dans tout le frigo.","Couvre la face coupée, ou mets-le dans un bol fermé."),
    tip(3,n,"2","Le melon ou la pastèque entamés","La partie coupée sèche vite et prend les odeurs du frigo.","Couvre la face coupée et mange-le dans les 2-3 jours."),
    tip(4,n,"3","Les restes laissés dans la casserole","On met la casserole au frigo « juste pour ce soir »… et on l'oublie.","Transvase dans un bol, couvre, et note le jour dessus."),
    tip(5,n,"4","La boîte de conserve ouverte","Une fois ouverte, le métal n'est pas fait pour garder les aliments.","Verse le reste dans un bol, couvre-le et garde-le au frais."),
    tip(6,n,"5","La sauce dans un bol ouvert","Elle forme une croûte et prend le goût des autres aliments.","Un bol bien couvert, et elle reste comme au premier jour."),
    product_slide(7,n,"Mon astuce pour tout couvrir en 2 secondes","6 couvercles en silicone qui s'étirent sur bols, saladiers et fruits coupés. Réutilisables, fini le film plastique."),
])
n=6
save('carrousel_film_plastique', [
    cover("Arrête d'utiliser du film plastique", "4 raisons (et ce que j'utilise à la place)"),
    tip(2,n,"1","Il colle partout sauf sur le bol","Tu perds 2 minutes à le décoller de lui-même, et il se déchire au mauvais endroit."),
    tip(3,n,"2","Tu le jettes après chaque usage","Un bout pour le midi, un bout pour le soir… le rouleau est fini en quelques semaines."),
    tip(4,n,"3","Il ne tient pas sur les gros saladiers","Dès que le bol est un peu grand, il glisse et le plat finit à moitié à l'air."),
    product_slide(5,n,"Ce que j'utilise à la place","Des couvercles extensibles en silicone : 6 tailles, on étire, on pose, ça tient. Et ça se lave."),
    cta(6,n,"Tu veux les mêmes ?","Le lien est dans ma bio. Abonne-toi pour d'autres astuces cuisine."),
])
print('ok')
