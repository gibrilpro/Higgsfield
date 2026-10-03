import markdown, re, base64
FD='/tmp/claude-0/-home-user-Higgsfield/f1396b37-470e-5d2c-a699-92ef893fc7c9/scratchpad/mont/package/files'
md=open('ebook.md',encoding='utf-8').read()
md=md.replace('<div class="check">','<div class="check" markdown="1">').replace('<div class="warn">','<div class="warn" markdown="1">')
md=md.replace('- [ ] ','- <span class="box"></span>')
html=markdown.markdown(md,extensions=['tables','md_in_html','sane_lists'])
# TOC from h1
titles=re.findall(r'<h1>(.*?)</h1>',html)
toc=''.join(f'<li>{t}</li>' for t in titles)
def font(w):
    b=base64.b64encode(open(f'{FD}/montserrat-latin-{w}-normal.woff2','rb').read()).decode()
    return f"@font-face{{font-family:M;font-weight:{w};src:url(data:font/woff2;base64,{b}) format('woff2')}}"
css=''.join(font(w) for w in (400,500,600,700,800))+'''
@page{size:A4;margin:22mm 20mm 22mm 20mm}
:root{--gold:#b8913f;--ink:#1a1a1a;--soft:#f4efe8}
body{font-family:M;color:var(--ink);font-size:10.5pt;line-height:1.6;margin:0}
.cover{height:297mm;width:210mm;background:#111;color:#fff;display:flex;flex-direction:column;justify-content:center;padding:0 22mm;box-sizing:border-box;page-break-after:always;position:relative}
.cover .tag{color:var(--gold);letter-spacing:.3em;font-weight:600;font-size:10pt;text-transform:uppercase}
.cover .t{font-size:40pt;line-height:1.1;margin:14mm 0 8mm;font-weight:800;border:0;padding:0}
.cover .t span{color:#c9a24d}
.cover p{font-size:14pt;color:#ddd;max-width:140mm;font-weight:500}
.cover .bar{width:30mm;height:3px;background:#c9a24d;margin-top:12mm}
.cover .foot{position:absolute;bottom:20mm;left:22mm;color:#999;font-size:9pt;letter-spacing:.15em;text-transform:uppercase}
.toc{page-break-after:always}
.toc h2{font-size:22pt;margin-top:0}
.toc ol{list-style:none;padding:0;counter-reset:none}
.toc li{padding:3.2mm 0;border-bottom:1px solid #e6e0d6;font-weight:600;font-size:12pt}
h1{font-size:24pt;font-weight:800;page-break-before:always;margin:0 0 6mm;padding-bottom:4mm;border-bottom:3px solid #c9a24d;line-height:1.2}
h2{font-size:14.5pt;font-weight:700;margin:8mm 0 2mm;color:#111}
h2::before{content:"";display:inline-block;width:3mm;height:3mm;background:#c9a24d;margin-right:3mm;vertical-align:middle;border-radius:1px}
p{margin:2mm 0 3mm}
ul,ol{padding-left:6mm;margin:1mm 0 3mm} li{margin:1mm 0}
strong{font-weight:700}
blockquote{margin:4mm 0;padding:3mm 5mm;background:var(--soft);border-left:3px solid #c9a24d;border-radius:0 2mm 2mm 0}
blockquote p{margin:1mm 0}
table{border-collapse:collapse;width:100%;margin:3mm 0 5mm;font-size:9.5pt;page-break-inside:avoid}
th{background:#111;color:#fff;text-align:left;padding:2.2mm 3mm;font-weight:600}
td{padding:2mm 3mm;border-bottom:1px solid #e6e0d6}
tr:nth-child(even) td{background:#faf7f2}
.warn{background:#fff6e0;border:1px solid #e8cf8f;border-radius:2mm;padding:3mm 5mm;margin:4mm 0;page-break-inside:avoid}
.check{background:var(--soft);border-radius:2mm;padding:3mm 6mm;margin:6mm 0;page-break-inside:avoid}
.check ul{list-style:none;padding-left:0}
.box{display:inline-block;width:3.2mm;height:3.2mm;border:1.4px solid #b8913f;border-radius:.6mm;margin-right:2.5mm;vertical-align:-.4mm;background:#fff}
'''
cover='''<div class="cover"><div class="tag">Formation complète</div>
<div class="t">Lancer sa boutique en <span>dropshipping</span></div>
<p>La méthode pas à pas : statut, produit, fournisseur, boutique Shopify, contenus, publicité et gestion des commandes.</p>
<div class="bar"></div><div class="foot">Édition 2026</div></div>'''
coverhtml=f'<!doctype html><html><head><meta charset="utf-8"><style>{css}@page{{size:A4;margin:0}}</style></head><body>{cover}</body></html>'
open('cover.html','w',encoding='utf-8').write(coverhtml)
out=f'<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Lancer sa boutique en dropshipping</title><style>{css}</style></head><body><div class="toc"><h2>Sommaire</h2><ol>{toc}</ol></div>{html}</body></html>'
open('ebook.html','w',encoding='utf-8').write(out)
