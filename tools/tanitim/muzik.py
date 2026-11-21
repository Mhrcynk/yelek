# Tanıtım videosu için basit bir fon müziği üretir (telifsiz, tamamen sentez). Kullanım: python3 muzik.py <çıktı.wav> <süre> <bpm> <akorlar> <giriş bitişi> <final başlangıcı>
import sys, wave, numpy as np
out,dur,bpm=sys.argv[1],float(sys.argv[2]),float(sys.argv[3]);prog=sys.argv[4].split(",");drop=float(sys.argv[5]);fin=float(sys.argv[6])
SR=44100;N=int(dur*SR);t=np.arange(N)/SR;beat=60/bpm;rng=np.random.default_rng(7)
NOTE={"A":220.0,"Bb":233.08,"C":261.63,"D":293.66,"F":174.61,"G":196.0,"E":164.81}
CH={"Am":("A",[0,3,7]),"F":("F",[0,4,7]),"C":("C",[0,4,7]),"G":("G",[0,4,7]),"Dm":("D",[0,3,7]),"Bb":("Bb",[0,4,7]),"Em":("E",[0,3,7])}
L=np.zeros(N);R=np.zeros(N)
def add(buf,x,at):
    i=int(at*SR)
    if i>=N or i<0:return
    n=min(len(x),N-i);buf[i:i+n]+=x[:n]
def env(n,a=.005,d=.2):
    tt=np.arange(n)/SR;return np.minimum(1,tt/a)*np.exp(-tt/d)
def kick():
    n=int(.32*SR);tt=np.arange(n)/SR;f=45+110*np.exp(-tt/.035);return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-tt/.13)
def hat(l=.045):
    n=int(l*SR);x=rng.standard_normal(n);x=np.diff(x,prepend=0);return x*np.exp(-np.arange(n)/SR/.012)*.5
def clap():
    n=int(.18*SR);x=rng.standard_normal(n);x=np.convolve(np.diff(x,prepend=0),np.ones(6)/6,"same");return x*np.exp(-np.arange(n)/SR/.05)
def tone(f,l,d=.25,br=.5):
    n=int(l*SR);tt=np.arange(n)/SR;x=np.sin(2*np.pi*f*tt)+br*.5*np.sin(4*np.pi*f*tt)+br*.25*np.sin(6*np.pi*f*tt);return x*env(n,.004,d)
bar=beat*4;nb=int(dur/beat)+1
for b in range(nb):
    at=b*beat;ci=int(at//bar)%len(prog);root,iv=CH[prog[ci]];f0=NOTE[root]
    full=drop<=at<fin-.01
    # ped: akorun üç sesi, yumuşak
    if b%4==0:
        n=int(min(bar,dur-at)*SR)
        if n>0:
            tt=np.arange(n)/SR;pad=sum(np.sin(2*np.pi*f0*2**(i/12)*tt*(1+.002*k)) for k,i in enumerate(iv))/3
            pad*=np.minimum(1,tt/.4)*np.minimum(1,(n/SR-tt)/.3);g=.10 if full else .13;add(L,pad*g,at);add(R,pad*g,at)
    if at>=fin:continue
    if full:
        add(L,kick()*.9,at);add(R,kick()*.9,at)
        if b%2==1:c=clap()*.32;add(L,c,at);add(R,c*.9,at)
        for k in range(2):
            bs=tone(f0/2,beat/2*.9,.16,.8)*.34;add(L,bs,at+k*beat/2);add(R,bs,at+k*beat/2)
    h=hat();add(L,h*(.22 if full else .12),at+beat/2);add(R,h*(.18 if full else .1),at+beat/2)
    if full:
        for k in range(4):
            i=iv[(b*4+k)%3]+(12 if (b+k)%2 else 0);pl=tone(f0*2*2**(i/12),beat/4*1.6,.09,.3)*.10
            add(L if k%2 else R,pl,at+k*beat/4);add(R if k%2 else L,pl*.5,at+k*beat/4)
# yükseliş: girişten düşüşe
n=int(min(drop,2.2)*SR)
if n>0:
    x=rng.standard_normal(n);x=np.convolve(x,np.ones(30)/30,"same");r=x*np.linspace(0,1,n)**2*.25;add(L,r,drop-n/SR);add(R,r,drop-n/SR)
# final vuruşu ve uzayan akor
root,iv=CH[prog[0]];f0=NOTE[root];n=int((dur-fin)*SR)
if n>0:
    tt=np.arange(n)/SR;x=sum(np.sin(2*np.pi*f0*m*tt) for m in (.5,1,1.5,2,3))/5*np.exp(-tt/1.6)*.5;add(L,x,fin);add(R,x,fin);k=kick()*1.0;add(L,k,fin);add(R,k,fin)
    c=rng.standard_normal(int(.9*SR));c=np.diff(c,prepend=0)*np.exp(-np.arange(len(c))/SR/.25)*.12;add(L,c,fin);add(R,c,fin)
M=np.stack([L,R],1);fade=np.minimum(1,(dur-t)/1.2)[:,None];M*=np.minimum(1,t/.15)[:,None]*np.clip(fade,0,1)
M=np.tanh(M*1.3)/max(1e-6,np.abs(np.tanh(M*1.3)).max())*.89
w=wave.open(out,"wb");w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((M*32767).astype("<i2").tobytes());w.close()
