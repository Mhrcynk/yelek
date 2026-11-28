(()=>{const me=myPid();let ids=S.players.filter(p=>!p.guest&&!p.archived&&!p.yedek).map(p=>p.id);
 ULT_SRV.wk=ultWk();ULT_SRV.dt=0;ULT_SRV.ev=[];ULT_SRV.dv={};ULT_SRV.pubs={};ULT_SRV.kupa=null;ULT_SRV.uye=new Set(ids);
 for(let d=0;d<3;d++){ULT_SRV.lig={season:1,start:ULT_SRV.wk,len:4,sz:1,players:ids};if(ultLigS().nx)break;ids=ids.slice(0,-1)}
 const lg=ultLigS();window.__K=lg.key;window.__OPP=lg.nx;
 window.__setT0=sec=>{const ws=(ULT_SRV.lig.start*7-3)*864e5,t0=Date.now()+sec*1000;ULT_SRV.cfg={lig_d:0,lig_m:(t0-ws)/6e4+180,lig_since:"2020-01-01T00:00:00Z",kp_d:null,kp_m:null,kp_since:null};return t0};
 const iso=t=>new Date(t).toISOString(),FS=window.FS={row:null,evs:[],log:[],d1:150000,bot:{var:true,k1:2500,c1:{t:"pres"},k2:2000,c2:{t:"hucum"}}};
 window.__sifirla=sec=>{FS.row=null;FS.evs=[];ULT_SRV.ev=[];const st=ultSt();st.lig=st.lig.filter(x=>x.k!==__K);st.cmK=[];st.cmP={};st.izG=[];ULT.run=null;S.sheet=null;ULT_CM.oda=null;document.getElementById("ulKarar")?.remove();__setT0(sec);render(true)};
 const view=(r,tam)=>{const m=r.my;return{ok:true,now:iso(Date.now()),kind:r.kind,k:r.k,a:r.a,b:r.b,t0:r.t0?iso(r.t0):null,ja:!!r.ja,jb:!!r.jb,pa:!!r.ja&&r.pra,pb:!!r.jb&&r.prb,k1:{a:!!r.k1a,b:!!r.k1b},k2:{a:!!r.k2a,b:!!r.k2b},r1:r.r1?iso(r.r1):null,r2:r.r2?iso(r.r2):null,
   c1:r.r1?{a:r.c1a??null,b:r.c1b??null}:m?{[m]:r["c1"+m]??null}:{},c2:r.r2?{a:r.c2a??null,b:r.c2b??null}:m?{[m]:r["c2"+m]??null}:{},...(tam?{ka:r.ka||null,kb:r.kb||null}:{sa:!!r.ka,sb:!!r.kb})}};
 const coz=r=>{const n=Date.now();if(n<r.t0)return;const o=r.my==="a"?"b":"a";
   if(FS.bot.var&&r.my){if(!r["k1"+o]&&r.bot1&&n>=r.bot1&&!r.r1){r["k1"+o]=n;r["c1"+o]=FS.bot.c1}if(r.r1&&!r.r2&&!r["k2"+o]&&r.bot2&&n>=r.bot2&&r["c1"+o]!=null){r["k2"+o]=n;r["c2"+o]=FS.bot.c2}}
   const pa=!!r.ja&&r.pra,pb=!!r.jb&&r.prb;
   if(!r.r1&&(n>r.t0+FS.d1||((pa||pb)&&(!pa||r.k1a)&&(!pb||r.k1b)&&(r.k1a||r.k1b))))r.r1=n;
   if(r.r1&&!r.r2){const la=r.c1a!=null,lb=r.c1b!=null;if((!la&&!lb)||n>r.r1+120000||(((la&&pa)||(lb&&pb))&&(!(la&&pa)||r.k2a)&&(!(lb&&pb)||r.k2b)))r.r2=n}};
 const botSnap=()=>{const L=ultRakipKadro(__OPP);L.t="hucum";return ultSnap(L)};
 rpc=async(fn,a)=>{FS.log.push(fn);await new Promise(z=>setTimeout(z,50));const n=Date.now();
   if(fn==="ult_cm_gir"){const t0=ultCmT0(a.p_kind,a.p_k);if(!t0)return{ok:false,error:"saatsiz"};if(n<t0-6e5)return{ok:false,error:"erken"};
     if(!FS.row){const[x,y]=ultCmTaraf(a.p_kind,a.p_k),my=me===x?"a":me===y?"b":null,o=my==="a"?"b":"a";FS.row={kind:a.p_kind,k:a.p_k,a:x,b:y,t0,my,pra:!!my,prb:!!my};if(my)FS.row["pr"+o]=FS.bot.var;
       if(FS.bot.var&&my){const L=ultRakipKadro(my==="a"?y:x);L.t="hucum";FS.row["k"+o]=ultSnap(L);FS.row["j"+o]=n}}
     const r=FS.row,m=r.my,o=m==="a"?"b":"a";if(m){if(a["p_k"+m]&&(!r["k"+m]||n<r.t0))r["k"+m]=a["p_k"+m];if(a["p_k"+o]&&!r["k"+o]&&n>=r.t0)r["k"+o]=a["p_k"+o];r["j"+m]=r["j"+m]||n}else for(const q of["a","b"])if(a["p_k"+q]&&!r["k"+q]&&n>=r.t0)r["k"+q]=a["p_k"+q];coz(r);return view(r,true)}
   if(fn==="ult_cm_durum"){const r=FS.row;if(!r)return{ok:false,error:"yok"};if(!r.t0&&FS.bot.kabul&&n>r.cgAt+3000){if(!r.kb)r.kb=botSnap();r.ja=r.ja||n;r.jb=r.jb||n;r.t0=n+4000}if(r.t0)coz(r);return view(r,a.p_tam)}
   if(fn==="ult_cm_karar"){const r=FS.row,m=r.my;if(n<r.t0)return{ok:false,error:"yok"};if(a.p_n===1&&!r.r1&&!r["k1"+m]){r["k1"+m]=n;r["c1"+m]=a.p_c;r.bot1=n+FS.bot.k1}else if(a.p_n===2&&r.r1&&!r.r2&&r["c1"+m]!=null&&!r["k2"+m]){r["k2"+m]=n;r["c2"+m]=a.p_c;r.bot2=n+FS.bot.k2}coz(r);return view(r,false)}
   if(fn==="ult_event"){const r=FS.row;if(!r||!r.r2)return{ok:false,error:"erken"};const kr={};for(const s of["a","b"])if(r["c1"+s]!=null)kr[s]=[r["c1"+s],r["c2"+s]||{}];const p={...a.p_payload,ka:r.ka,kb:r.kb,h:r.a,cm:1};delete p.kr;if(kr.a||kr.b)p.kr=kr;FS.evs.push({kind:a.p_kind,k:a.p_k,gelen:a.p_payload,p});return{ok:true,id:1}}
   if(fn==="ult_nabiz")return{ok:true,now:iso(n),on:FS.on||[],mc:FS.mc||[],ak:FS.ak||[],cg:FS.cg||[]};
   if(fn==="ult_davet_gonder"){FS.dv={k:a.p_k,a:me,b:a.p_b,ka:a.p_ka,created_at:iso(n),accepted_at:null,red_at:null};return{ok:true,dv:FS.dv}}
   if(fn==="ult_cm_cagir"){if(FS.cagriYok)return{ok:false,error:"cevrimdisi"};const ben=FS.dv.a===me?"a":"b";FS.row={kind:"ch",k:a.p_k,a:FS.dv.a,b:FS.dv.b,t0:null,my:ben,ka:FS.dv.ka,kb:FS.dv.kb,pra:true,prb:true,cgAt:n};FS.row["j"+ben]=n;return view(FS.row,false)}
   if(fn==="ult_cm_sk"){FS.sk=(FS.sk||0)+1;return{ok:true}}
   if(fn==="ult_ozel_yaz"){const r=FS.row;if(!r||!r.r2)return{ok:false,error:"erken"};const kr={};for(const q of["a","b"])if(r["c1"+q]!=null)kr[q]=[r["c1"+q],r["c2"+q]||{}];const p={...a.p_payload,ka:r.ka,kb:r.kb,h:r.a,aw:r.b,cm:1};delete p.kr;if(kr.a||kr.b)p.kr=kr;FS.evs.push({kind:"sk",k:a.p_k,gelen:a.p_payload,p});return{ok:true,k:a.p_k,p,at:iso(n)}}
   if(fn==="ult_cm_iptal"){FS.iptal=(FS.iptal||0)+1;FS.row=null;return{ok:true}}
   if(fn==="ult_davet_kabul"){FS.dv={k:a.p_k,a:__OPP,b:me,ka:botSnap(),kb:a.p_kb,created_at:iso(n-5000),accepted_at:iso(n),red_at:null};return{ok:true,dv:FS.dv}}
   if(fn==="ult_cm_kabul"){if(FS.kabulYok)return{ok:false,error:"yok"};const ben=FS.dv.a===me?"a":"b";FS.row={kind:"ch",k:a.p_k,a:FS.dv.a,b:FS.dv.b,t0:n+4000,my:ben,ka:FS.dv.ka,kb:FS.dv.kb,ja:n,jb:n,pra:true,prb:true};return view(FS.row,true)}
   return{ok:false}};
 {const st0=ultSt();if(!(st0.kulup||[]).length)st0.kulup=ultBuild().C.filter(c=>c.type==="temel").map(c=>c.id).slice(0,40);const L=ultAuto(me);st0.kadro=Array.from(L);st0.dz=L.f;ultSave()}
 const st=ultSt();st.tab="mac";st.mt="lig";st.lt="mac";__setT0(900);S.sheet=null;render(true);
 return JSON.stringify({k:__K,opp:nameOf(__OPP),kart:(document.querySelector(".ulcm")||{}).textContent})})()
