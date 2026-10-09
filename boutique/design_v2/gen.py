import json
SP='/tmp/claude-0/-home-user-Higgsfield/f1396b37-470e-5d2c-a699-92ef893fc7c9/scratchpad/'
def load(p):
    t=open(p).read(); return json.loads(t[t.index('{'):])
LAMP='/products/applique-murale-led-magnetique-a-detecteur-de-mouvement'
ICON={
 'truck':'<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/>',
 'return':'<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 0 12h-3"/>',
 'lock':'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 'pin':'<path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
 'chat':'<path d="M4 5h16v11H8l-4 4z"/>',
}
def svg(n,s=26): return f'<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICON[n]}</svg>'

ATOUTS=[('truck','Livraison offerte','France & UE, avec suivi'),('return','Retours 14 jours','Tu changes d\'avis ? Pas de souci'),('lock','Paiement sécurisé','CB, Apple Pay, Google Pay'),('chat','Une question ?','On répond par e-mail')]
strip='<style>.nv-atouts{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}.nv-atout{display:flex;gap:12px;align-items:center;padding:6px 0}.nv-atout .ic{flex:none;width:46px;height:46px;border-radius:50%;background:#fff;color:#E8873A;display:grid;place-items:center;box-shadow:0 2px 10px rgba(42,33,64,.08)}.nv-atout b{display:block;font-size:15px;color:#1A1726}.nv-atout span{font-size:13px;opacity:.7}@media(max-width:749px){.nv-atouts{grid-template-columns:1fr 1fr;gap:14px 10px}.nv-atout{flex-direction:column;text-align:center;gap:6px}.nv-atout b{font-size:14px}.nv-atout span{font-size:12px}}</style><div class="nv-atouts">'+''.join(f'<div class="nv-atout"><div class="ic">{svg(i)}</div><div><b>{t}</b><span>{s}</span></div></div>' for i,t,s in ATOUTS)+'</div>'

STEPS=[('1','Colle le support','Le support adhésif se pose en quelques secondes, sans perceuse et sans vis.'),('2','Pose l\'applique','Elle tient sur son support grâce à l\'aimant. Tu la retires en un geste pour la recharger en USB.'),('3','Elle fait le reste','Tu passes devant, elle s\'allume. Tu pars, elle s\'éteint toute seule.')]
how=('<style>.nv-how{text-align:center;color:#F6F1EA}.nv-how .kick{color:#F4B26B;letter-spacing:.18em;font-size:12px;text-transform:uppercase;font-weight:600}.nv-how h2{color:#fff;margin:.3em 0 .2em}.nv-how .sub{opacity:.75;max-width:560px;margin:0 auto 34px}'
 '.nv-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;text-align:left}.nv-step{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:18px;padding:26px 22px}'
 '.nv-step .n{width:40px;height:40px;border-radius:50%;background:#E8873A;color:#1A1726;font-weight:700;display:grid;place-items:center;margin-bottom:14px;box-shadow:0 0 24px rgba(232,135,58,.55)}.nv-step b{display:block;color:#fff;font-size:17px;margin-bottom:6px}.nv-step p{margin:0;font-size:14px;opacity:.78;line-height:1.5}'
 '.nv-cta{display:inline-block;margin-top:30px;background:#E8873A;color:#1A1726;font-weight:700;padding:15px 30px;border-radius:999px;text-decoration:none}.nv-cta:hover{background:#F4B26B}'
 '@media(max-width:749px){.nv-steps{grid-template-columns:1fr}.nv-step{display:grid;grid-template-columns:40px 1fr;gap:0 14px;padding:18px}.nv-step .n{margin:0;grid-row:span 2}}</style>'
 '<div class="nv-how"><div class="kick">Applique à détecteur</div><h2>Installée en 10 secondes</h2><p class="sub">Pas de trou, pas de câble, pas d\'électricien.</p><div class="nv-steps">'
 +''.join(f'<div class="nv-step"><div class="n">{n}</div><b>{t}</b><p>{p}</p></div>' for n,t,p in STEPS)+f'</div><a class="nv-cta" href="{LAMP}">Je veux la mienne →</a></div>')

FAQ=[('Quels sont les délais de livraison ?','Ta commande est préparée sous 1 à 3 jours ouvrés, puis livrée en 10 à 20 jours ouvrés en France et dans l\'UE. La livraison y est offerte et tu reçois un lien de suivi par e-mail.'),
 ('Je peux retourner un produit ?','Oui, tu as 14 jours après réception pour changer d\'avis. Écris-nous à contact.novashop21@gmail.com avec ton numéro de commande.'),
 ('Le paiement est-il sécurisé ?','Oui, le paiement passe par Shopify (carte bancaire, Apple Pay, Google Pay). Nous n\'avons jamais accès à tes données bancaires.'),
 ('Mon colis a un problème, je fais comment ?','S\'il n\'est pas arrivé après le délai maximum ou s\'il arrive abîmé, contacte-nous : on te propose un renvoi ou un remboursement.')]
FAQCSS='<style>.nv-faq{max-width:760px;margin:0 auto}.nv-faq h2{text-align:center;margin-bottom:24px}.nv-faq details{background:#fff;border-radius:14px;margin-bottom:10px;box-shadow:0 1px 8px rgba(42,33,64,.06)}.nv-faq summary{list-style:none;cursor:pointer;padding:18px 52px 18px 20px;font-weight:600;position:relative;color:#1A1726}.nv-faq summary::-webkit-details-marker{display:none}.nv-faq summary:after{content:"+";position:absolute;right:20px;top:50%;transform:translateY(-50%);font-size:22px;color:#E8873A;transition:transform .2s}.nv-faq details[open] summary:after{transform:translateY(-50%) rotate(45deg)}.nv-faq details p{margin:0;padding:0 20px 18px;opacity:.8;line-height:1.55}</style>'
def faqhtml(items,title='Questions fréquentes'):
    return FAQCSS+f'<div class="nv-faq">{"<h2>"+title+"</h2>" if title else ""}'+''.join(f'<details><summary>{q}</summary><p>{a}</p></details>' for q,a in items)+'</div>'

def cl_section(html,scheme,pt,pb,width='page-width'):
    return {"type":"custom-liquid","settings":{"custom_liquid":html,"color_scheme":scheme,"section_width":width,"padding-block-start":pt,"padding-block-end":pb}}

# ---- index
idx=load(SP+'lumieres/up_index.json')
s=idx['sections']
s['nv_atouts']=cl_section(strip,'scheme-2',28,28)
s['nv_how']=cl_section(how,'scheme-4',72,72)
s['nv_faq']=cl_section(faqhtml(FAQ),'scheme-2',64,64)
s['product_list_themegen']['settings']['carousel_on_mobile']=True
del s['section_x8mrnx']
idx['order']=['hero_p9CmMG','nv_atouts','product_list_themegen','hero_pjNAy4','nv_how','hero_Ha3FDU','nv_faq']
json.dump(idx,open('index.json','w'),ensure_ascii=False,indent=1)

# ---- product
prod=load(SP+'v2/product_live.json')
m=prod['sections']['main']
g=m['blocks']['media-gallery']['settings']; g['large_first_image']=True; g['media_radius']=12; g['image_gap']=8
pd=m['blocks']['product-details']['blocks']
offre=('{% if product.handle == "applique-murale-led-magnetique-a-detecteur-de-mouvement" %}<div style="background:#FFF4EA;border:1px solid #F4B26B;border-radius:12px;padding:12px 14px;font-size:14px;line-height:1.45;color:#1A1726">'
 '💡 <b>Plus t\'en prends, moins c\'est cher</b><br>Lot de 2 : 17,50 € l\'applique · Lot de 3 : 15 € l\'applique</div>{% endif %}')
ship=('<div style="display:flex;flex-wrap:wrap;gap:8px;font-size:13px">'
 '<span style="background:#E9E3F2;color:#2A2140;border-radius:999px;padding:6px 12px">🚚 Livraison offerte France & UE</span>'
 '<span style="background:#E9E3F2;color:#2A2140;border-radius:999px;padding:6px 12px">📦 Expédiée sous 1 à 3 jours</span></div>')
mini=[('truck','Livraison offerte','10 à 20 jours ouvrés'),('return','Retours 14 jours','Simple et rapide'),('lock','Paiement sécurisé','Via Shopify'),('pin','Suivi de colis','Lien par e-mail')]
trust=('<style>.nv-pt{display:grid;grid-template-columns:1fr 1fr;gap:10px}.nv-pt div{display:flex;gap:10px;align-items:center;background:#F6F1EA;border-radius:12px;padding:10px 12px;font-size:13px;line-height:1.3}.nv-pt svg{color:#E8873A;flex:none}.nv-pt b{display:block;font-size:13px}.nv-pt span{opacity:.7;font-size:12px}</style><div class="nv-pt">'
 +''.join(f'<div>{svg(i,22)}<p style="margin:0"><b>{t}</b><span>{s_}</span></p></div>' for i,t,s_ in mini)+'</div>')
PFAQ=[('Livraison','Préparation sous 1 à 3 jours ouvrés, puis 10 à 20 jours ouvrés en France et dans l\'UE. Livraison offerte et suivie. Hors UE : 4,99 € ou 7,99 € selon le pays.'),
 ('Retours et remboursements','Tu as 14 jours après réception pour nous retourner le produit. Écris-nous à contact.novashop21@gmail.com avec ton numéro de commande.'),
 ('Paiement sécurisé','Carte bancaire, Apple Pay ou Google Pay via le paiement sécurisé Shopify. Nous n\'avons jamais accès à tes données bancaires.'),
 ('Une question sur le produit ?','Écris-nous à contact.novashop21@gmail.com, on te répond rapidement.')]
def blk(html,name): return {"type":"custom-liquid","name":name,"settings":{"custom_liquid":html},"blocks":{}}
pd['nv_ship']=blk(ship,'Badges livraison')
pd['nv_offre']=blk(offre,'Offre lots')
pd['nv_trust']=blk(trust,'Réassurance icônes')
pd['nv_faq']=blk(faqhtml(PFAQ,None).replace('.nv-faq details{background:#fff','.nv-faq details{background:#F6F1EA').replace('margin-bottom:10px','margin-bottom:8px'),'FAQ produit')
del pd['text_trust']
m['blocks']['product-details']['block_order']=['group_icgrde','nv_ship','divider_VJhene','variant_picker_R3rGDr','nv_offre','buy_buttons_eYQEYi','nv_trust','text_aEtTtq','nv_faq']
json.dump(prod,open('product.json','w'),ensure_ascii=False,indent=1)

# ---- header
hd=load(SP+'v2/header_live.json')
ann={"type":"header-announcements","blocks":{},"block_order":[],"settings":{"speed":4,"section_width":"page-width","color_scheme":"scheme-4","divider_width":0,"padding-block-start":10,"padding-block-end":10}}
for i,(t,l) in enumerate([('🚚 Livraison offerte en France et dans l\'UE',''),('💡 Applique à détecteur : dès 15 € l\'unité en lot de 3',LAMP),('↩️ Retours sous 14 jours · Paiement sécurisé','')]):
    k=f'ann_{i}'; ann['blocks'][k]={"type":"_announcement","settings":{"text":t,"link":l,"font":"var(--font-body--family)","font_size":"0.8125rem" if False else "0.875rem","weight":"500","letter_spacing":"normal","case":"none"},"blocks":{}}; ann['block_order'].append(k)
hd['sections']['nv_announcements']=ann
hd['order']=['nv_announcements','header_section']
json.dump(hd,open('header-group.json','w'),ensure_ascii=False,indent=1)

# ---- footer
ft=load(SP+'v2/footer_live.json')
sl=ft['sections']['footer_utilities']['blocks']['block_60b2db0e274f']['settings']
sl['instagram_url']='https://www.instagram.com/nov_ashop12/'; sl['tiktok_url']='https://www.tiktok.com/@nov_ashop12'
b=ft['sections']['section_jehhzd']['blocks']['group_JRwdF9']['blocks']['group_ydzfpU']['blocks']['group_q9BiWd']['blocks']['text_FYj8df']['settings']; b['text']='<p>Boutique</p>'
em=ft['sections']['section_jehhzd']['blocks']['group_JRwdF9']['blocks']['group_KQ7WQN']['blocks']['email_signup_iTipdc']['settings']; em['heading']='Reçois nos nouveaux gadgets en avant-première'
json.dump(ft,open('footer-group.json','w'),ensure_ascii=False,indent=1)
print('ok')
