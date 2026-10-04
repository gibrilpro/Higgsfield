from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os, subprocess, shutil
SP='/tmp/claude-0/-home-user-Higgsfield/f1396b37-470e-5d2c-a699-92ef893fc7c9/scratchpad/'
F=SP+'mont/package/files/montserrat-latin-%d-normal.woff'
f=lambda w,s: ImageFont.truetype(F%w,s)
W,H=1080,1920
BEIGE=(244,239,232); INK=(20,18,16); GOLD=(201,162,77); GOLDD=(150,112,40); MUTED=(95,88,80); WHITE=(255,255,255)
CUT=Image.open(SP+'cutout.png')
HAND=Image.open('photo_main_pistolet_massage.png').convert('RGB')
LOGO_N=Image.open('logo/logo_horizontal_noir.png'); LOGO_B=Image.open('logo/logo_horizontal_blanc.png')
OUT='contenu/'
def wrap(d,t,font,maxw):
    out=[];line=''
    for w in t.split():
        x=(line+' '+w).strip()
        if d.textlength(x,font=font)<=maxw: line=x
        else: out.append(line); line=w
    out.append(line); return out
def text(im,xy,t,font,fill,maxw=900,gap=1.18,align='left'):
    d=ImageDraw.Draw(im); x,y=xy
    for ln in wrap(d,t,font,maxw):
        xx=x if align=='left' else (W-d.textlength(ln,font=font))/2
        d.text((xx,y),ln,font=font,fill=fill); y+=int(font.size*gap)
    return y
def logo(im,dark=False,y=H-150):
    L=LOGO_B if dark else LOGO_N; w=300; l=L.resize((w,int(L.height*w/L.width))); im.paste(l,((W-w)//2,y),l)
def counter(im,i,n,dark=False):
    d=ImageDraw.Draw(im); s=f'{i}/{n}'; fo=f(600,30)
    d.text((W-90-d.textlength(s,font=fo),90),s,font=fo,fill=(GOLD if dark else GOLDD))
def product(im,w,cx,cy,rot=0):
    p=CUT.resize((w,int(CUT.height*w/CUT.width)),Image.LANCZOS)
    if rot: p=p.rotate(rot,expand=True,resample=Image.BICUBIC)
    sh=Image.new('RGBA',im.size,(0,0,0,0)); ImageDraw.Draw(sh).ellipse([cx-w*0.3,cy+p.height//2-20,cx+w*0.3,cy+p.height//2+20],fill=(0,0,0,90))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(20)))
    im.alpha_composite(p,(int(cx-p.width/2),int(cy-p.height/2)))
def cover(title,sub,dark=True):
    im=Image.new('RGBA',(W,H),INK+(255,) if dark else BEIGE+(255,))
    hand=HAND.resize((W,int(HAND.height*W/HAND.width)))
    hand=hand.crop((0,(hand.height-1100)//2,W,(hand.height-1100)//2+1100)).convert('RGBA')
    im.alpha_composite(hand,(0,H-1100))
    g=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(g)
    for i in range(700): d.line([(0,H-1100+i),(W,H-1100+i)],fill=INK+(int(255*(1-i/700)**1.4),))
    im.alpha_composite(g)
    y=text(im,(90,190),title,f(800,96),WHITE,maxw=900,gap=1.08)
    d=ImageDraw.Draw(im); d.rectangle([90,y+20,250,y+28],fill=GOLD)
    text(im,(90,y+60),sub,f(500,40),(225,220,212),maxw=880)
    return im
def shape(d,kind,x,y):
    # head pictograms (Montserrat has no glyphs for these)
    if kind=='boule': d.ellipse([x,y,x+150,y+150],fill=GOLD)
    elif kind=='plate': d.rounded_rectangle([x,y+45,x+190,y+105],radius=30,fill=GOLD)
    elif kind=='conique': d.polygon([(x+75,y),(x,y+150),(x+150,y+150)],fill=GOLD)
    elif kind=='fourche':
        d.line([(x+75,y+150),(x+75,y+80)],fill=GOLD,width=26); d.line([(x+75,y+85),(x+15,y+10)],fill=GOLD,width=26); d.line([(x+75,y+85),(x+135,y+10)],fill=GOLD,width=26)
        d.ellipse([x-5,y-10,x+35,y+30],fill=GOLD); d.ellipse([x+115,y-10,x+155,y+30],fill=GOLD)
def tip(i,n,num,title,body,good=None):
    im=Image.new('RGBA',(W,H),BEIGE+(255,)); d=ImageDraw.Draw(im)
    counter(im,i,n)
    top=380
    if num in ('boule','plate','conique','fourche'): shape(d,num,90,top+40); ny=top+260
    else: d.text((90,top),num,font=f(800,220),fill=GOLD); ny=top+290
    y=text(im,(90,ny),title,f(800,74),INK,maxw=900,gap=1.1)
    y=text(im,(90,y+40),body,f(500,42),MUTED,maxw=880,gap=1.35)
    if good:
        d=ImageDraw.Draw(im); box=[90,y+60,W-90,y+60+40+int(42*1.35)*len(wrap(d,good,f(600,40),820))+40]
        d.rounded_rectangle(box,radius=28,fill=WHITE)
        text(im,(130,box[1]+40),good,f(600,40),INK,maxw=820,gap=1.35)
        y=box[3]
    if y < 1330: product(im,380,W-260,1520,rot=-8)
    logo(im); return im
def product_slide(i,n,title,body,dark=False):
    im=Image.new('RGBA',(W,H),(INK if dark else BEIGE)+(255,))
    counter(im,i,n,dark)
    y=text(im,(90,200),title,f(800,78),WHITE if dark else INK,maxw=900,gap=1.1)
    text(im,(90,y+30),body,f(500,42),(215,208,198) if dark else MUTED,maxw=880,gap=1.35)
    product(im,700,W//2,1250,rot=-6)
    logo(im,dark); return im
def cta(i,n,line1,line2):
    im=Image.new('RGBA',(W,H),INK+(255,)); d=ImageDraw.Draw(im)
    counter(im,i,n,True)
    y=text(im,(90,620),line1,f(800,92),WHITE,maxw=900,align='center',gap=1.1)
    text(im,(90,y+50),line2,f(500,44),(215,208,198),maxw=880,align='center',gap=1.35)
    d.rounded_rectangle([W//2-300,1280,W//2+300,1380],radius=50,fill=GOLD)
    s='Lien en bio'; fo=f(700,44); d.text(((W-d.textlength(s,font=fo))/2,1305),s,font=fo,fill=INK)
    logo(im,True); return im

CAROUSELS={
 'carrousel1_nuque_bureau':[
   lambda n: cover("3 gestes pour détendre ta nuque au bureau","2 minutes, sans te lever de ta chaise. Enregistre pour plus tard."),
   lambda n: tip(2,n,"1","Roule les épaules","Monte les épaules vers les oreilles, puis roule-les lentement vers l'arrière.","10 fois, en respirant calmement."),
   lambda n: tip(3,n,"2","Penche la tête sur le côté","Oreille vers l'épaule, sans forcer. Tu dois sentir un étirement doux sur le côté du cou.","20 secondes de chaque côté."),
   lambda n: tip(4,n,"3","Rentre le menton","Dos droit, recule doucement la tête comme pour faire un double menton, puis relâche.","10 fois. Idéal si tu as le nez sur l'écran toute la journée."),
   lambda n: product_slide(5,n,"Pour aller plus loin","Le soir, 1 à 2 minutes de massage sur le haut des épaules (les trapèzes), jamais sur la colonne ni sur l'avant du cou."),
   lambda n: cta(6,n,"Enregistre et envoie à un collègue","Il en a sûrement besoin aussi."),
 ],
 'carrousel2_erreurs':[
   lambda n: cover("Pistolet de massage : 5 erreurs à éviter","La 3e, presque tout le monde la fait."),
   lambda n: tip(2,n,"1","Masser sur les os","La colonne, les genoux, les tibias ou l'avant du cou : on évite.","On masse uniquement les zones de muscle."),
   lambda n: tip(3,n,"2","Rester trop longtemps au même endroit","Plus longtemps n'est pas mieux, et ça peut irriter.","1 à 2 minutes par zone, en bougeant doucement."),
   lambda n: tip(4,n,"3","Commencer trop fort","La puissance maximale dès le début, c'est la meilleure façon d'avoir mal.","Commence au niveau le plus bas, puis monte si c'est agréable."),
   lambda n: tip(5,n,"4","Appuyer de toutes ses forces","Laisse l'appareil travailler.","Pose-le simplement sur le muscle, sans écraser."),
   lambda n: tip(6,n,"5","L'utiliser sur une blessure","Douleur vive, entorse, bleu, grossesse, problème de santé : on demande d'abord l'avis d'un professionnel de santé.","En cas de doute, on s'abstient."),
   lambda n: cta(7,n,"Tu en faisais combien ?","Dis-le en commentaire."),
 ],
 'carrousel3_tetes':[
   lambda n: cover("4 têtes, 4 usages","Laquelle utiliser selon la zone ? Le guide simple."),
   lambda n: tip(2,n,"boule","La tête boule","La plus polyvalente, pour les grandes zones.","Cuisses, fessiers, mollets, haut du dos."),
   lambda n: tip(3,n,"plate","La tête plate","Une pression répartie, plus douce.","Épaules, bras, zones sensibles. Parfaite pour débuter."),
   lambda n: tip(4,n,"conique","La tête conique","Une pression précise sur une petite zone.","Voûte plantaire, paume de la main, petits nœuds musculaires."),
   lambda n: tip(5,n,"fourche","La tête fourche","Elle passe de chaque côté, sans toucher l'os.","Le long de la colonne (jamais dessus), mollets, tendons d'Achille."),
   lambda n: product_slide(6,n,"Toutes incluses","Les 4 têtes sont dans la boîte, avec le câble de recharge USB.",dark=True),
   lambda n: cta(7,n,"Laquelle tu utilises le plus ?","Réponds en commentaire."),
 ],
}
FF='/usr/local/lib/python3.11/dist-packages/imageio_ffmpeg/binaries/ffmpeg-linux-x86_64-v7.0.2'
for name,slides in CAROUSELS.items():
    d=OUT+name; shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
    n=len(slides); imgs=[]
    for i,s in enumerate(slides,1):
        im=s(n).convert('RGB'); p=f'{d}/{i:02d}.jpg'; im.save(p,quality=92); imgs.append(p)
    # video version: 3.2 s per slide with a short crossfade
    fr=SP+'cf_'+name; shutil.rmtree(fr,ignore_errors=True); os.makedirs(fr); k=0
    pil=[Image.open(p) for p in imgs]
    for i,im in enumerate(pil):
        hold=int(30*(2.6 if i else 2.2))
        for _ in range(hold): im.save(f'{fr}/{k:05d}.jpg',quality=88); k+=1
        if i<len(pil)-1:
            for t in range(9):
                Image.blend(im,pil[i+1],(t+1)/10).save(f'{fr}/{k:05d}.jpg',quality=88); k+=1
    subprocess.run([FF,'-y','-loglevel','error','-framerate','30','-i',f'{fr}/%05d.jpg','-c:v','libx264','-pix_fmt','yuv420p','-crf','21','-movflags','+faststart',f'{OUT}{name}_video.mp4'],check=True)
    shutil.rmtree(fr); print(name,n,'slides',round(k/30,1),'s')
