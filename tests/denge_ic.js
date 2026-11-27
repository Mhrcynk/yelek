// tests/denge.js tarafından sayfanın içinde çalıştırılır; sonuçları JSON olarak döndürür
(()=>{const N=1500,ids=S.players.filter(p=>!p.guest).map(p=>p.id),out=[];
 const obj=L=>{const X=Array.from(L,id=>id?{...(typeof id==="object"?id:ultCard(id))}:null);X.f=L.f;X.t=L.t;if(L.x)X.x=L.x;return X};
 const run=(A,B,tag)=>{let w=0,d=0,g=0,y=0;for(let i=0;i<N;i++){const r=ultResult(ultPlan(A,B,(tag||"t")+i));g+=r.ga;y+=r.gb;if(r.ga>r.gb)w++;else if(r.ga===r.gb)d++}return{G:Math.round(w/N*100),B:Math.round(d/N*100),M:Math.round((N-w-d)/N*100),g:(g/N).toFixed(1),y:(y/N).toFixed(1)}};
 const fmt=r=>`G${r.G} B${r.B} M${r.M} · gol ${r.g}-${r.y}`;
 const add=(ad,r,ok,not)=>out.push({ad,v:fmt(r),ok,not});
 const A0=obj(ultAuto(ids[2],"2-2-2"));A0.t="dengeli";const B0=obj(A0);
 const ay=run(A0,B0,"ay");add("Ayna maç (taraf avantajı yok)",ay,Math.abs(ay.G-ay.M)<=4);
 for(const[k,lo,hi]of[[2,20,45],[4,40,70],[8,70,95]]){const B=obj(A0).map(c=>c&&{...c,r:c.r-k});B.f=A0.f;B.t="dengeli";const r=run(A0,B,"g"+k);add(`Rakip ${k} güç zayıf`,r,r.G-r.M>=lo&&r.G-r.M<=hi,`galibiyet-mağlubiyet farkı ${lo}-${hi} olmalı`)}
 const T=t=>{const A=obj(A0);A.t=t;return A};
 for(const t of["hucum","savunma","kontra","pres"]){const r=run(T(t),B0,"tk"+t);add(`${t} – dengeli`,r,Math.abs(r.G-r.M)<=9,"tek başına üstün olmamalı")}
 for(const[a,b]of[["kontra","hucum"],["hucum","savunma"],["savunma","pres"],["pres","kontra"]]){const r=run(T(a),T(b),"d"+a);add(`${a} > ${b}`,r,r.G-r.M>=4,"döngü: kazanan önde olmalı")}
 // dizilişler: aynı kartlar, aynı güç ve kimya; hiçbiri tek başına üstün olmamalı
 for(const f of["2-3-1","3-2-1","3-1-2","2-1-3"]){const A=obj(A0);A.f=f;const x=ultLine(A0);A.x={s:x.str,ch:x.ch};const B=obj(A0);B.x={s:x.str,ch:x.ch};const r=run(A,B,"dz"+f);add(`${f} – 2-2-2`,r,Math.abs(r.G-r.M)<=10,"tek başına üstün olmamalı")}
 // kimya bağları: aynı kartlar, aynı güç; bağlar tam ya da hiç
 const bagli=v=>{const X=obj(A0);const x=ultLine(X);X.x={s:x.str,ch:x.ch,bg:v.repeat(49)};return X};
 {const r=run(bagli("2"),bagli("0"),"bg");add("Güçlü bağlar – bağsız (aynı güç)",r,r.G-r.M>=3,"bağ pası ve top kaybı farkı")}
 {const A=obj(A0),x=ultLine(A);A.x={s:x.str+21*.3,ch:x.ch.map(()=>3),bg:"0".repeat(49)};const B=obj(A0),y=ultLine(B);B.x={s:y.str,ch:y.ch.map(()=>0),bg:"0".repeat(49)};const r=run(A,B,"km");add("Tam kimya (21) – sıfır kimya",r,r.G-r.M>=20,"kimya güce +6,3 olarak yansır")}
 // yetenekler: bir karta yetenek, aynı kadroya karşı
 const SL=ultSL("2-2-2"),fv=SL.findIndex(s=>s[0]==="FV"),df=SL.findIndex(s=>s[0]==="DF");
 for(const[y,j,tk]of[["kaptan",fv],["bitirici",fv],["duvar",df],["penalti",fv],["kontraci",fv,"kontra"]]){const A=obj(A0);A[j]={...A[j],y};const B=obj(A0);if(tk){A.t=tk;B.t=tk}const r=run(A,B,"yt"+y);add(`Yetenek: ${y}`,r,r.G-r.M>=-4&&r.G-r.M<=14,"etkisi küçük ve olumlu olmalı")}
 {const D=obj(A0);D[fv]={...A0[df]};const J=obj(D);J[fv]={...J[fv],y:"joker"};const r=run(J,D,"jk");add("Yetenek: joker (mevki dışında)",r,r.G-r.M>=5,"mevki dışında tam oynamalı")}
 // belirlilik ve kayıt dondurma
 const ka=ultSnap(obj(ultAuto(ids[1]))),kb=ultSnap(obj(ultAuto(ids[3])));
 const seri=()=>{let s="";for(let i=0;i<25;i++){const P=ultPlan(ultFromSnap(ka),ultFromSnap(kb),"don"+i),r=ultResult(P);s+=r.ga+"-"+r.gb+(r.gl[0]?r.gl[0].s:"")+",";const f=ultResult(ultFlip(P));if(f.ga!==r.gb||f.gb!==r.ga)s+="!"}return s};
 const s1=seri(),s2=seri();out.push({ad:"Aynı tohum aynı maç, çevirince ters skor",v:s1===s2&&!s1.includes("!")?"evet":"hayır",ok:s1===s2&&!s1.includes("!")});
 const eski=window.ultBag;window.ultBag=()=>2;for(const x of Object.values(S.stats||{}))if(x){x.goals=(x.goals||0)*10+5;x.ast=(x.ast||0)*7+3}ultEgilim.c=null;
 const s3=seri();window.ultBag=eski;out.push({ad:"Gerçek veri değişince kayıtlı maç aynı",v:s1===s3?"evet":"hayır",ok:s1===s3});
 out.push({ad:"Kadro kaydı boyutu",v:JSON.stringify(ka).length+" karakter",ok:JSON.stringify(ka).length<=3000,not:"sınır 3000"});
 return JSON.stringify(out)})()
