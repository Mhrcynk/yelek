// Puan motoru testi: maç olayları doğru özelliğe gider, bir maçta bütün özellikler aynı yöne gider,
// maça gelmeyenin kartı değişmez, sınırlar aşılmaz.
// Çalıştır: node tests/motor.js   (Playwright gerekli; gerçek veri kullanmaz)
const http=require("http"),fs=require("fs"),path=require("path");
const {chromium}=require("playwright");
const root=path.join(__dirname,"..");
const srv=http.createServer((q,r)=>{let f=decodeURIComponent(q.url.split("?")[0]);if(f.endsWith("/"))f+="index.html";const p=path.join(root,f);
  if(f==="/app.js"){r.writeHead(200,{"Content-Type":"application/javascript"});return r.end(fs.readFileSync(p,"utf8").replace("function compute(){","window.__E=s=>eval(s);function compute(){"))}
  if(!p.startsWith(root)||!fs.existsSync(p)){r.writeHead(404);return r.end()}r.writeHead(200);fs.createReadStream(p).pipe(r)});

const uid=i=>"00000000-0000-4000-8000-"+String(i).padStart(12,"0");
const F={def:70,dri:70,fiz:70,hiz:70,pas:70,sut:70,def_bil:70,def_kes:70,def_mud:70,dri_cev:70,dri_kon:70,dri_sur:70,fiz_agr:70,fiz_day:70,fiz_guc:70,hiz_acc:70,hiz_spr:70,pas_kis:70,pas_uzn:70,pas_viz:70,sut_bit:70,sut_guc:70,sut_poz:70};
const K={ayk:70,dal:70,ell:70,hiz:70,poz:70,ref:70,ayk_deg:70,ayk_pas:70,dal_kos:70,dal_uza:70,ell_bas:70,ell_tut:70,hiz_acc:70,hiz_cab:70,poz_bir:70,poz_yer:70,ref_ref:70,ref_yak:70};
const PL=[["Kaleci","KL",K],["Defans","STP",{...F,def_bil:88}],["Defans","SĞB",F],["Defans","STP",F],["Orta saha","MO",F],["Orta saha","MO",F],["Orta saha","DOS",F],
  ["Forvet","SNT",F],["Kaleci","KL",K],["Defans","STP",F],["Defans","SLB",F],["Orta saha","MO",F],["Orta saha","MOO",F],["Forvet","SNT",F],["Forvet","SĞK",F]];
const players=PL.map(([pos,epos,a],i)=>({id:uid(i+1),name:"Oyuncu "+(i+1)+" Test",pos,epos,alt_pos:null,no:"",attrs:{...a},status:{type:"hazir"},status_log:[],created_at:"2026-01-01T00:00:00Z",archived:false,photo_v:0,guest:false,yedek:false}));
const ids=players.map(p=>p.id);
const A=ids.slice(0,7),B=ids.slice(8,15);// ids[7] (forvet) ikinci maça gelmiyor
const mk=(k,date,sa,sb,stats,a,b)=>({id:uid(100+k),date,time:"21:00",state:"bitti",kind:"ic",archived:false,season:1,rsvp:{},rsvp_at:{},late:{},team_a:a,team_b:b,form_a:"2-3-1",form_b:"2-3-1",
  lineup_a:a,lineup_b:b,pos_a:null,pos_b:null,score_a:sa,score_b:sb,stats,votes:{},motm:null,cap_a:a[0],cap_b:b[0],preds:{},links:null,gol_id:null,fiy_id:null,name_a:"A",name_b:"B",
  created_at:date+"T10:00:00Z",finished_at:date+"T22:00:00Z",notes:null,vote_on:false});
const A1=[ids[0],ids[1],ids[2],ids[4],ids[5],ids[6],ids[7]];
const matches=[
  mk(1,"2026-10-06",9,4,{[ids[7]]:{g:4,a:1},[ids[5]]:{g:2,a:3},[ids[4]]:{g:1,a:2},[ids[13]]:{g:2,a:0},[ids[11]]:{g:1,a:1},[ids[14]]:{g:1,a:0}},A1,B),
  mk(2,"2026-10-13",3,12,{[ids[13]]:{g:5,a:2},[ids[14]]:{g:4,a:1},[ids[12]]:{g:2,a:3},[ids[5]]:{g:2,a:0},[ids[4]]:{g:1,a:1}},[ids[0],ids[1],ids[2],ids[3],ids[4],ids[5],ids[6]],B),
  mk(3,"2026-10-20",8,8,{[ids[7]]:{g:3,a:1},[ids[5]]:{g:2,a:2},[ids[13]]:{g:3,a:1},[ids[11]]:{g:3,a:2},[ids[4]]:{g:1,a:1}},A1,B)];
const DB={settings:[{id:1,group_name:"Test FC",field_name:"Saha",day:1,time:"21:00",team_a_name:"A",team_b_name:"B",season_len:8,season_closed:0,gate:false,slug:"test"}],players,matches,season_votes:[],player_photos:[]};

let fails=0;const ok=(c,m)=>{if(!c){console.log("HATA: "+m);fails++}};
(async()=>{
  await new Promise(r=>srv.listen(0,r));const port=srv.address().port;
  const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
  await ctx.route(/\/rest\/v1\//,r=>{const u=r.request().url();const J=o=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify(o)});
    if(u.includes("/rpc/"))return J(u.includes("player_ages")?[]:{ok:true});const k=Object.keys(DB).find(k=>u.includes("/rest/v1/"+k+"?"));return J(k?DB[k]:[])});
  const pg=await ctx.newPage();const errs=[];pg.on("pageerror",e=>errs.push(e.message));
  await pg.addInitScript(()=>{localStorage.setItem("y_asked","1");localStorage.setItem("y_hos","1");localStorage.setItem("y_kur","3|0");localStorage.setItem("y_team","1")});
  await pg.goto(`http://localhost:${port}/`);await pg.waitForTimeout(1500);
  const E=s=>pg.evaluate(s=>window.__E(s),s);

  // 1-7: tek maç senaryoları, motorun parçaları doğrudan çağrılır
  const R=await E(`(()=>{const P=id=>S.all.find(p=>p.id===id);
    const run=(id,role,r,D,st)=>{const p=P(id);const cur={};for(const k of subKeys(p.pos)){const[a,b]=k.split("_");cur[k]=subVal(p.attrs,a,b)}
      const rr={g:0,a:0,res:"B",op:gyOrt(),side:"A",...r,role};const ch=matchChanges(p,rr,{score_a:5,score_b:5},st||{},{fvDry:0,osDry:0,att:1,motm:false});
      const o=noteSpread(p,cur,ch,D,role);const m={};for(const[k,v]of o)m[k]=(m[k]||0)+v;return m};
    return{fv:run("${ids[7]}","FV",{g:2,res:"G"},.4),os:run("${ids[4]}","OS",{a:2,res:"G"},.4),dfI:run("${ids[1]}","DF",{res:"G",op:gyOrt()-2},.3),
      dfK:run("${ids[2]}","DF",{res:"M",op:gyOrt()+3},-.3),kl:run("${ids[0]}","KL",{res:"G",op:gyOrt()-4},.4),sifir:run("${ids[5]}","OS",{a:1,res:"G"},0),
      golKotu:run("${ids[7]}","FV",{g:1,res:"M"},-.3)}})()`);
  const top=(m,n)=>Object.entries(m).sort((x,y)=>y[1]-x[1]).slice(0,n).map(x=>x[0]);
  const sameSign=(m,s)=>Object.values(m).every(v=>s>0?v>=-1e-9:v<=1e-9);
  // 1. golcü forvet: şut özellikleri en çok artar
  ok(top(R.fv,2).every(k=>/^sut_/.test(k)),"forvet golü şuta gitmedi: "+top(R.fv,3));ok(sameSign(R.fv,1),"iyi maçta bir özellik düştü (forvet)");
  // 2. asist yapan orta saha: pas özellikleri en çok artar
  ok(top(R.os,2).every(k=>/^pas_/.test(k)),"asist pasa gitmedi: "+top(R.os,3));ok(sameSign(R.os,1),"iyi maçta bir özellik düştü (orta saha)");
  // 3. iyi maç oynayan defans: üç savunma özelliği eşit ve en çok artar
  {const d=R.dfI;ok(Math.abs(d.def_bil-d.def_kes)<.01&&Math.abs(d.def_kes-d.def_mud)<.01,"defans özellikleri eşit artmadı: "+[d.def_bil,d.def_kes,d.def_mud].map(x=>x.toFixed(2)));
    ok(top(d,3).every(k=>/^def_/.test(k)),"defansta en çok savunma artmalı");ok(sameSign(d,1),"iyi maçta bir özellik düştü (defans)")}
  // 4. kötü maç oynayan defans: hiçbir özellik artmaz
  {const d=R.dfK;ok(sameSign(d,-1),"kötü maçta bir özellik arttı (defans)");ok(Math.abs(d.def_bil-d.def_mud)<.01,"kötü maçta savunma özellikleri eşit düşmedi")}
  // 5. az gol yiyen kaleci: refleks ve yer tutma öne çıkar
  ok(top(R.kl,2).some(k=>k==="ref_ref"||k==="poz_yer"),"kalecide refleks/yer tutma artmadı: "+top(R.kl,3));ok(sameSign(R.kl,1),"iyi maçta bir özellik düştü (kaleci)");
  // 6. not eşikteyse kart değişmez
  ok(!Object.keys(R.sifir).length,"not eşikteyken değişim olmamalı");
  // 7. gol atıp kötü oynayan: hiçbir özellik artmaz
  ok(sameSign(R.golKotu,-1),"kötü maçta gol özelliği arttı");

  // 8-12: bütün sezon hesabı
  const H=await E(`(()=>{compute();const o={};for(const p of S.all){const s=S.stats[p.id];o[p.id]={hist:s.hist.map(h=>({k:h.kind,d:h.d,ch:h.ch,nD:h.r?Math.max(-NOTE.katMax,Math.min(NOTE.katMax,(h.r.pts-h.r.esik)*NOTE.kat)):0})),attrs:s.attrs,genX:s.genX}}
    compute();const again=S.all.every(p=>S.stats[p.id].genX===o[p.id].genX);return{o,again}})()`);
  let mixed=0,absent=0,genOff=0;
  for(const[id,s]of Object.entries(H.o))for(const h of s.hist){
    const vs=h.ch.filter(c=>c[1]!==0).map(c=>c[1]);if(vs.some(v=>v>0)&&vs.some(v=>v<0))mixed++;
    if(h.k==="gelmedi"&&(h.ch.length||h.d))absent++;
    if(h.k==="oynadi"&&Math.abs(h.d-h.nD)>.15)genOff++}
  // 8. bir maçta özellikler hep aynı yöne gider
  ok(mixed===0,mixed+" maçta özellikler zıt yöne gitti");
  // 9. maça gelmeyenin kartı değişmez
  ok(H.o[ids[7]].hist.some(h=>h.k==="gelmedi"),"gelmeyen oyuncu senaryosu kurulamadı");ok(absent===0,"maça gelmeyenin kartı değişti");
  // 10. genel puan değişimi maç notunun söylediği kadar
  ok(genOff===0,genOff+" maçta genel puan değişimi nottan saptı");
  // 11. sınırlar: hiçbir ana özellik başlangıçtan 8'den fazla uzaklaşmaz, 30-99 dışına çıkmaz
  {let bad=0;for(const p of players){const a=H.o[p.id].attrs;for(const[k,v]of Object.entries(a)){const b=p.attrs[k];if(b==null)continue;if(Math.abs(v-b)>8||v<30||v>99)bad++}}ok(bad===0,bad+" özellik sınırı aştı")}
  // 12. aynı veri her hesapta aynı sonucu verir
  ok(H.again,"iki hesap farklı sonuç verdi");
  // 13. dondurma: biten maçlar kaydedilir; kurallar değişse de kart aynı kalır, çözülen maç yeniden hesaplanır
  const Z=await E(`(async()=>{compute();S.admin=true;S.pin="";const g0=Object.fromEntries(S.all.map(p=>[p.id,S.stats[p.id].genX]));const n=await calcSync();
    const allFz=fin().every(m=>m.calc&&m.calc.p);ENG.step=9;NOTE.kat=.6;compute();
    const same=S.all.every(p=>Math.abs(S.stats[p.id].genX-g0[p.id])<.01);const notes=fin().every(m=>Object.entries(m.calc.p).every(([id,e])=>Math.abs(S.mInfo[m.id].pts[id].pts-e.pts)<1e-9));
    const last=fin()[fin().length-1];last.calc=null;compute();const moved=S.all.some(p=>Math.abs(S.stats[p.id].genX-g0[p.id])>.05);
    ENG.step=2;NOTE.kat=.25;return{n,allFz,same,notes,moved}})()`);
  ok(Z.n===3&&Z.allFz,"biten maçlar dondurulmadı ("+Z.n+")");ok(Z.same,"kurallar değişince donmuş kart değişti");ok(Z.notes,"donmuş maç notu değişti");ok(Z.moved,"çözülen maç yeniden hesaplanmadı");
  ok(!errs.length,"sayfa hatası: "+errs.join(" | "));
  console.log(fails?fails+" kontrol başarısız.":"Tamam: puan motoru testlerinin hepsi geçti (13 kontrol grubu).");
  if(fails)process.exitCode=1;
  await b.close();srv.close()})();
