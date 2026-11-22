// Oyuncu oylaması testi: maç 1 saat sonra biter, oylama açılır, kota çalışır, kapanınca kategoriler kotaya göre dağılır.
// Çalıştır: node tests/oylama.js [--shots klasör]   (Playwright gerekli; gerçek veri kullanmaz)
const http=require("http"),fs=require("fs"),path=require("path");
const {chromium}=require("playwright");
const root=path.join(__dirname,"..");
const shots=process.argv.includes("--shots")?process.argv[process.argv.indexOf("--shots")+1]:null;
if(shots)fs.mkdirSync(shots,{recursive:true});
const T={".html":"text/html",".css":"text/css",".js":"application/javascript",".webmanifest":"application/json",".png":"image/png",".svg":"image/svg+xml",".woff2":"font/woff2"};
const srv=http.createServer((q,r)=>{let f=decodeURIComponent(q.url.split("?")[0]);if(f.endsWith("/"))f+="index.html";const p=path.join(root,f);
  if(f==="/app.js"){r.writeHead(200,{"Content-Type":T[".js"]});return r.end(fs.readFileSync(p,"utf8").replace("function compute(){","window.__E=s=>eval(s);function compute(){"))}
  if(!p.startsWith(root)||!fs.existsSync(p)){r.writeHead(404);return r.end()}r.writeHead(200,{"Content-Type":T[path.extname(p)]||"application/octet-stream"});fs.createReadStream(p).pipe(r)});
const LAT="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD";
const EXT="U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF";
let BASE="";const face=(fam,file,w)=>[["latin",LAT],["latin-ext",EXT]].map(([s,u])=>`@font-face{font-family:"${fam}";font-weight:${w};font-display:block;src:url(${BASE}/tests/fonts/${file}-${s}-${w}-normal.woff2) format("woff2");unicode-range:${u}}`).join("\n");
const FONTCSS=()=>[600,700,800].map(w=>face("Barlow Condensed","barlow-condensed",w)).join("\n")+"\n"+[500,600,700,800].map(w=>face("Inter","inter",w)).join("\n");

const uid=i=>"00000000-0000-4000-8000-"+String(i).padStart(12,"0");
const AD=["Abdurrahman Yıldırımoğlu","Veli Kaya","Can Şen","Cem Öztürk","Efe Çağlayan","Ege Demirtaş","Mert İğdeli","Kaan Uçar","Onur Gülşen","Umut Ağaoğlu","Emre Karakuş","Arda Işık","Deniz Bıyıklıoğlu","Burak Ünlü","Gökhan Özdemir","İsmail Çelik"];
const POS=["KL","DF","DF","OS","OS","FV","DF","OS","FV","KL","DF","OS","FV","OS","DF","OS"];
const attrs=()=>({hiz:70,sut:70,pas:70,dri:70,def:70,fiz:70});
const st=i=>i===2?{type:"sakat",until:"2026-11-30",note:"diz"}:i===11?{type:"izinli"}:i===13?{type:"hasta"}:{type:"hazir"};
const players=AD.map((n,i)=>({id:uid(i+1),name:n,pos:POS[i],epos:null,alt_pos:null,no:String(i+1),attrs:attrs(),status:st(i),status_log:[],created_at:"2026-0"+(1+Math.min(8,i))+"-01T00:00:00Z",archived:false,photo_v:0,guest:false,yedek:false}));
const ids=players.map(p=>p.id);
const FA=["2-3-1","3-2-1","2-1-2-1","2-2-2","3-1-2","1-3-2","3-3"];
const mk=(k,date,state,sa,sb,fa,fb,shift)=>{const o=ids.slice(shift).concat(ids.slice(0,shift));const A=o.slice(0,7),B=o.slice(7,14);const S={};
  if(state==="bitti"){A.slice(3,7).forEach((id,j)=>S[id]={g:j%3?1:2,a:j%2,k:0,og:0});B.slice(4,7).forEach((id,j)=>S[id]={g:j?1:3,a:1,k:0,og:0})}
  return{id:uid(100+k),date,time:"21:00",state,kind:"ic",archived:false,season:1,rsvp:Object.fromEntries(o.slice(0,12).map(i=>[i,"g"])),rsvp_at:{},late:{},
  team_a:A,team_b:B,form_a:fa,form_b:fb,lineup_a:A,lineup_b:B,pos_a:null,pos_b:null,score_a:sa,score_b:sb,stats:S,votes:{},motm:state==="bitti"?A[4]:null,cap_a:A[0],cap_b:B[1],preds:{},
  track:state==="bitti"?Object.fromEntries(o.slice(0,11).map((id,j)=>[id,{km:4.2+((j*7+k)%9)*.3,hiz:24+((j*5+k)%8)*.8,spr:14+((j*3+k)%10)*2,pas:20+((j*11+k)%12)*3,isa:68+((j*13+k)%9)*3,pp:2+((j+k)%6),tk:1+((j*5+k)%6),pa:1+((j*3+k)%5),dri:(j+k)%5,pt:(j*2+k)%6}])):{},
  links:state==="bitti"?[{g:A[4],a:A[3]}]:null,gol_id:state==="bitti"?A[4]:null,fiy_id:state==="bitti"?B[2]:null,tac_a:null,tac_b:null,opponent:null,name_a:"Yelekliler",name_b:"Abiler Kardeşler Spor",
  created_at:date+"T10:00:00Z",finished_at:state==="bitti"?date+"T22:00:00Z":null,notes:null}};
const matches=[mk(99,"2026-11-24","takim",null,null,"3-2-1","3-3",2)];
["2026-09-15","2026-09-22","2026-09-29","2026-10-06","2026-10-13","2026-10-20","2026-10-27","2026-11-03","2026-11-10"].forEach((d,i)=>matches.push(mk(i+1,d,"bitti",(i*3)%7,(i*5)%4+(i===4?8:0),FA[i%7],FA[(i+3)%7],i%5)));
const settings=[{id:1,group_name:"Abiler Kardeşler FC",field_name:"Kartal Spor Tesisleri Halı Saha",day:1,time:"21:00",team_a_name:"Yelekliler",team_b_name:"Yeleksizler",season_len:16,season_closed:1,gate:false,ig:"abilerkardeslerfc"}];
const DB={settings,players,matches,season_votes:[],player_photos:[]};

// maç dün oynandı, oylama açık
const today=new Date(Date.now()-864e5);const ymd=today.getFullYear()+"-"+String(today.getMonth()+1).padStart(2,"0")+"-"+String(today.getDate()).padStart(2,"0");
Object.assign(matches[0],{date:ymd,time:"21:00",vote_on:true,vote_closed_at:null,vsum:null});
const VOTES=[];const calls=[];
const ok=(c,m)=>{if(!c){console.log("HATA: "+m);process.exitCode=1}};
(async()=>{
  await new Promise(r=>srv.listen(0,r));const port=srv.address().port;BASE="http://localhost:"+port;
  const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});
  await ctx.route(/fonts\.googleapis\.com/,r=>r.fulfill({status:200,contentType:"text/css",body:FONTCSS()}));
  await ctx.route(/fonts\.gstatic\.com/,r=>r.abort());
  await ctx.route(/\/rest\/v1\//,r=>{const u=r.request().url();const J=o=>r.fulfill({status:200,contentType:"application/json",body:JSON.stringify(o)});
    if(u.includes("/rpc/")){const fn=u.split("/rpc/")[1].split("?")[0];let a={};try{a=JSON.parse(r.request().postData()||"{}")}catch(_){}calls.push([fn,a]);
      if(fn==="player_ages")return J(players.map((p,i)=>({id:p.id,age:22+i})));
      if(fn==="my_membership")return J({status:"onayli",role:"yonetici",player_id:ids[2]});
      if(fn==="vote_status"){const vs=new Set(VOTES.map(x=>x.f));const mine={};VOTES.filter(x=>x.f===ids[2]).forEach(x=>mine[x.t]=x.v);return J({ok:true,open:true,n:vs.size,voters:[...vs],mine:Object.keys(mine).length?mine:null})}
      if(fn==="vote_submit"){for(let i=VOTES.length-1;i>=0;i--)if(VOTES[i].f===a.p_voter)VOTES.splice(i,1);for(const[t,v]of Object.entries(a.p_votes))VOTES.push({f:a.p_voter,t,v,a:false});return J({ok:true})}
      if(fn==="admin_votes")return J({ok:true,rows:VOTES});
      if(fn==="admin_vote_close"){const m=matches[0];m.vote_closed_at=new Date().toISOString();m.vsum={...a.p_sum,_n:new Set(VOTES.map(x=>x.f)).size};for(const[id,k]of Object.entries(a.p_perf)){m.stats[id]={...(m.stats[id]||{}),k}}return J({ok:true})}
      return J({ok:true})}
    const k=Object.keys(DB).find(k=>u.includes("/rest/v1/"+k+"?"));return J(k?DB[k]:[])});
  const pg=await ctx.newPage();const run=(fn,arg)=>pg.evaluate(([c,a])=>window.__E("("+c+")")(a),[fn.toString(),arg]);const errs=[];pg.on("pageerror",e=>errs.push(e.message));
  await pg.addInitScript(()=>{localStorage.setItem("y_asked","1");localStorage.setItem("y_hos","1");localStorage.setItem("y_team","1")});
  await pg.goto(`http://localhost:${port}/`);await pg.waitForTimeout(1500);
  const shot=async n=>{if(shots)await pg.screenshot({path:path.join(shots,n+".png"),fullPage:true})};
  await run(i=>{S.admin=true;S.pin="x";S.mem={status:"onayli",role:"yonetici",player_id:i};S.me=i;S.tab="mac";render(true)},ids[2]);await pg.waitForTimeout(800);
  const t=await pg.textContent("#view");ok(t.includes("MAÇ BİTTİ"),"maç bitti görünmüyor");ok(t.includes("Oyuncuları değerlendir"),"oylama kartı yok");ok(t.includes("Onun adına oy ver"),"yönetici paneli yok");
  ok(await run(()=>!fin().some(m=>m.id===S.matches.find(x=>x.vote_on).id)),"oylama bitmeden maç sonuçlanmış sayılıyor");
  await shot("1_mac");
  await pg.click(".vhero .vbtn");await pg.waitForTimeout(300);
  // oyuncular tek tek gelir: 3 çok iyi, 4 iyi, 4 orta, 2 kötü; 4. oyuncuda "çok iyi" kapalı olmalı
  ok(await pg.locator(".vsg i").count()===13,"oylanacak oyuncu sayısı "+await pg.locator(".vsg i").count());
  for(let i=0;i<13;i++){const k=i<3?1:i<7?2:i<11?3:4;
    if(i===5)ok(await run(()=>document.querySelector(".vg4 .p1").disabled),"4. çok iyi açık kaldı");
    await pg.click(`.vg4 button:nth-child(${k})`);await pg.waitForTimeout(60)}
  await pg.waitForTimeout(200);await shot("2_oyla");
  ok(await run(()=>document.querySelector(".vsend").disabled),"maçın adamı seçilmeden gönderilebiliyor");
  ok(await pg.locator('.vtl[data-act="vMotm"]').count()===3,"maçın adamı adayları çok iyi verilenler değil");
  await pg.click('.vtl[data-act="vMotm"]');await pg.waitForTimeout(100);
  ok(await pg.locator('.vtl[data-act="vFiy"]').count()===3,"fiyasko adayları kötü verilenler + boş geç değil");
  await pg.click(".vsend");await pg.waitForTimeout(600);
  const sub=calls.find(c=>c[0]==="vote_submit");ok(sub&&Object.keys(sub[1].p_votes).length===13,"oy gönderilmedi");ok(sub&&sub[1].p_motm&&sub[1].p_votes[sub[1].p_motm]===1&&sub[1].p_fiy===null,"maçın adamı ya da fiyasko seçimi yanlış gitti");
  // 6 kişi daha oy versin (rastgele ama kotaya uygun)
  let sd=7;const rnd=()=>(sd=(sd*9301+49297)%233280)/233280;const tal=ids.slice(0,14).map((_,i)=>i);
  for(let v=0;v<6;v++){const f=ids[(v+4)%14];const pl=ids.slice(0,14).filter(x=>x!==f);const sc=pl.map(t=>({t,s:ids.indexOf(t)*-.25+rnd()*4})).sort((x,y)=>y.s-x.s);
    sc.forEach((o,j)=>VOTES.push({f,t:o.t,v:j<3?1:j<7?2:j<10?3:4,a:v===5}))}
  await run(()=>{S.vst={};render(true)});await pg.waitForTimeout(600);await shot("3_takip");
  await pg.click('[data-act="vDet"]');await pg.waitForTimeout(900);if(shots)await pg.screenshot({path:path.join(shots,"4_detay.png")});await run(()=>{S.sheet=null;render(true)});
  const mid=await run(()=>S.matches.find(x=>x.vote_on).id);
  await pg.click(`[data-act="vClose"][data-id="${mid}"]`);await pg.waitForTimeout(200);await pg.click(`[data-act="vClose"][data-id="${mid}"]`);await pg.waitForTimeout(1200);
  const cl=calls.find(c=>c[0]==="admin_vote_close");ok(cl,"kapatma çağrılmadı");
  if(cl){const q=[0,0,0,0];Object.values(cl[1].p_perf).forEach(k=>q[k-1]++);ok(q.join()==="3,4,4,3","kota dağılımı "+q.join())}
  // yönetici maçı bitirdi
  Object.assign(matches[0],{state:"bitti",score_a:5,score_b:3,finished_at:new Date().toISOString()});
  await run(()=>load(true));await pg.waitForTimeout(800);
  ok(await run(()=>fin().some(m=>m.vote_on)),"oylama kapandıktan sonra maç sonuçlanmadı");
  await run(()=>{const m=S.matches.find(x=>x.vote_on);S.tab="gecmis";S.view=m.id;S.f.mtab="oy";render(true)});await pg.waitForTimeout(800);
  const t5=await pg.textContent("#view");ok(t5.includes("Çok iyi"),"oylama sonuçları görünmüyor");await shot("5_sonuc");
  ok(!errs.length,"sayfa hatası: "+errs.join(" | "));
  if(!process.exitCode)console.log("Tamam: oylama akışı çalışıyor.");
  await b.close();srv.close()})();
