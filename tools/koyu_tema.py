"""Koyu tema katmanını app.css'ten otomatik üretir.
Açık temadaki her açık zemin rengini (beyaz, lila, pastel yeşil/sarı/kırmızı…) aynı tonun koyu karşılığına,
koyu yazı renklerini açık karşılığına çevirip `html.dk` önekli kurallar yazar. Kart, saha, afiş ve paylaşım
görselleri gibi iki temada da aynı kalması gereken bileşenler hariç tutulur.
Çalıştır: python3 tools/koyu_tema.py   (app.css içindeki /* KOYU-OTO */ bölümünü yeniler)"""
import re,colorsys,os
P=os.path.join(os.path.dirname(__file__),"..","app.css")
css=open(P,encoding="utf-8").read()
S0,S1="/* KOYU-OTO:başla */","/* KOYU-OTO:bitti */"
if S0 in css:css=css[:css.index(S0)]+css[css.index(S1)+len(S1):]
src=css
# iki temada aynı kalacak bileşenler (koyu tasarımlı ya da görsel/şablon)
SKIP=re.compile(r"\.meBtn|\.pmBtn|\.gearBtn|\.logo\b|\.lg[a-z]*\b|\.navfade|\.fut\b\.tcard|\.tc\b|\.tok\b|\.maf|\.mres|\.field|\.hk|\.pmprev|\.pmcard|\.pmc\b|\.xsb|\.tcl\b|\.nt\.|\.nt\b|\.frx|\.crest|\.pph|\.lphero|\.lpcard|\.sb\b|\.bltk|\.fk\b|\.kbar|\.gdbar i|\.lkt button\.on|\.shirt|\.ovr|html\.dk|::selection|\.flag|\.lflag|\.trend|\.bib|\.fnts|\.pfc|\.chb|\.xi\b|\.sq\b|\.confetti|\.toast|\.brand|\.top\b|\.nav\b|\.nind|\.btn\.primary|\.primary|\.wa\b|\.danger|\.lgg|\.adm\b|\.capi|\.cap\b|\.tov|\.tps|\.lth|\.pa\b|\.pi\b|\.sbme|\.clk|\.lcs|\.mafcd|\.tk\b|\.yp\b|\.yp-")
HEX=re.compile(r"#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")
def hx(h):
    h=h.lstrip("#");h="".join(c*2 for c in h) if len(h)==3 else h;return tuple(int(h[i:i+2],16)/255 for i in (0,2,4))
def out(r,g,b):return "#%02X%02X%02X"%tuple(max(0,min(255,round(v*255))) for v in (r,g,b))
def lum(r,g,b):return .2126*r+.7152*g+.0722*b
def bg_dark(h):
    r,g,b=hx(h);hh,l,s=colorsys.rgb_to_hls(r,g,b)
    if l<.80:return None
    if s<.12 or (r>.97 and g>.97 and b>.97):return "#1A1229" if l>.97 else "#20162F"   # nötr beyaz/gri yüzeyler
    return out(*colorsys.hls_to_rgb(hh,.17,min(.55,s*.6)))                           # pastel → aynı tonda koyu
def rl(r,g,b):
    f=lambda v:v/12.92 if v<=.03928 else ((v+.055)/1.055)**2.4
    return .2126*f(r)+.7152*f(g)+.0722*f(b)
SURF=rl(*hx("#1A1229"))
def cr(c):L=rl(*c);return (max(L,SURF)+.05)/(min(L,SURF)+.05)
def ink_light(h):
    r,g,b=hx(h);hh,l,s=colorsys.rgb_to_hls(r,g,b)
    if cr((r,g,b))>=4.5:return None
    if l<.22:return "#F1EAFB"            # marka mürekkebi (#37003C vb.): nötr açık yazı
    if s<.15:return "#B4A6C9"
    L=max(l,.55)
    while L<.95:
        c=colorsys.hls_to_rgb(hh,L,min(.9,s))
        if cr(c)>=4.8:break
        L+=.02
    return out(*c)
def line_dark(h):
    r,g,b=hx(h);hh,l,s=colorsys.rgb_to_hls(r,g,b)
    if l<.78:return None
    return "#3A2C55" if s<.5 else out(*colorsys.hls_to_rgb(hh,.30,min(.5,s*.6)))
def conv(prop,val):
    p=prop.strip().lower()
    if p in("background","background-color","background-image"):f=bg_dark
    elif p in("color","fill","-webkit-text-fill-color"):f=ink_light
    elif p.startswith("border") or p in("outline","outline-color","text-decoration-color"):f=line_dark
    elif p=="box-shadow":f=lambda h:("#3A2C55" if (bg_dark(h) or line_dark(h)) and "inset" in val else None)
    else:return None
    ch=[False]
    def rep(m):
        n=f(m.group(0))
        if n:ch[0]=True;return n
        return m.group(0)
    v2=HEX.sub(rep,val)
    if p in("background","background-color") and re.search(r"\b(white)\b",v2):v2=re.sub(r"\bwhite\b","#1A1229",v2);ch[0]=True
    if p in("background","background-color","background-image"):
        def rg(m):
            r,g,b=(int(m.group(i)) for i in (1,2,3));a=m.group(4)
            if (r+g+b)/3>225 and (a is None or float(a)>.3):ch[0]=True;return "rgba(26,18,41,%s)"%(a or "1")
            return m.group(0)
        v2=re.sub(r"rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([0-9.]+)\s*)?\)",rg,v2)
    if p in("background","background-color"):
        m=re.search(r"rgba?\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([0-9.]+)\s*\)",v2)
        if m and float(m.group(1))>.5:v2=re.sub(r"rgba?\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([0-9.]+)\s*\)","rgba(26,18,41,\\1)",v2);ch[0]=True
    return v2 if ch[0] else None
# basit ayrıştırıcı: @media / @supports içine girer, @keyframes / @font-face atlanır
rules=[]
def walk(s,wrap=None):
    i=0;n=len(s)
    while i<n:
        j=s.find("{",i)
        if j<0:break
        head=s[i:j].strip();depth=1;k=j+1
        while k<n and depth:
            if s[k]=="{":depth+=1
            elif s[k]=="}":depth-=1
            k+=1
        body=s[j+1:k-1]
        head=re.sub(r"/\*.*?\*/","",head,flags=re.S).strip()
        if head.startswith("@media") or head.startswith("@supports"):
            if "print" not in head and "prefers-color-scheme" not in head:walk(body,head)
        elif head.startswith("@"):pass
        else:rules.append((wrap,head,body))
        i=k
walk(src)
outp=[];seen=set()
for wrap,sel,body in rules:
    sels=[x.strip() for x in sel.split(",") if x.strip()]
    sels=[x for x in sels if not SKIP.search(x) and not x.startswith(":root") and x not in("html","body","*")]
    if not sels:continue
    decls=[]
    keepInk=False
    for d in re.split(r";(?![^(]*\))",body):
        if ":" in d:
            pr,v=d.split(":",1)
            if pr.strip().lower() in("background","background-color"):
                for m in HEX.finditer(v):
                    if not bg_dark(m.group(0)):keepInk=True
    for d in re.split(r";(?![^(]*\))",body):
        if ":" not in d:continue
        pr,v=d.split(":",1);imp="!important" in v;v=v.replace("!important","").strip()
        if "var(" in v and not HEX.search(v):continue
        if keepInk and pr.strip().lower() in("color","fill"):continue
        nv=conv(pr,v)
        if nv:decls.append(f"{pr.strip()}:{nv}{' !important' if imp else ''}")
    if not decls:continue
    def pre(x):
        x=re.sub(r"^:root\s*","",x)
        return "html.dk "+x
    rule=",".join(pre(x) for x in sels)+"{"+";".join(decls)+"}"
    rule=f"{wrap}{{{rule}}}" if wrap else rule
    if rule not in seen:seen.add(rule);outp.append(rule)
block=S0+"\n"+"\n".join(outp)+"\n"+S1
# koyu tema elle yazılmış kuralların ÖNÜNE konur ki el ayarları kazansın
anchor="/* ================= Koyu tema (Ayarlar → Görünüm) ================= */"
css=src.replace(anchor,block+"\n"+anchor,1) if anchor in src else src+"\n"+block+"\n"
open(P,"w",encoding="utf-8").write(css)
print(len(outp),"kural üretildi")
