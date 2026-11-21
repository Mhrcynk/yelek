// Paylaşım paketi testi: her şablon üretiliyor mu, içerik blokları üst üste biniyor mu, metin taşıyor mu?
// Çalıştır: node tests/paylasim.js [--shots klasör]   (Playwright gerekli; yazı tipleri tests/fonts içinden)
// Gerçek veri kullanmaz; uzun isimli, fotoğraflı ve fotoğrafsız uydurma oyuncularla çalışır.
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

(async()=>{
  await new Promise(r=>srv.listen(0,r));const port=srv.address().port;BASE="http://localhost:"+port;
  const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});
  await ctx.route(/fonts\.googleapis\.com/,r=>r.fulfill({status:200,contentType:"text/css",body:FONTCSS()}));
  await ctx.route(/fonts\.gstatic\.com/,r=>r.abort());
  await ctx.route(/\/rest\/v1\//,r=>{const u=r.request().url();
    if(u.includes("/rpc/"))return r.fulfill({status:200,contentType:"application/json",body:u.includes("player_ages")?JSON.stringify(players.map((p,i)=>({id:p.id,age:22+i}))):"{}"});
    const k=Object.keys(DB).find(k=>u.includes("/rest/v1/"+k+"?"));return r.fulfill({status:200,contentType:"application/json",body:JSON.stringify(k?DB[k]:[])})});
  const pg=await ctx.newPage();const run=(fn,arg)=>pg.evaluate(([c,a])=>window.__E("("+c+")")(a),[fn.toString(),arg]);const errs=[];pg.on("pageerror",e=>errs.push(e.message));
  await pg.addInitScript(()=>{localStorage.setItem("y_asked","1");localStorage.setItem("y_hos","1");localStorage.setItem("y_team","1")});
  await pg.goto(`http://localhost:${port}/`);await pg.waitForTimeout(1500);
  // yarısına saydam arka planlı uydurma fotoğraf (256×320)
  await run(async()=>{await document.fonts.load('800 40px "Barlow Condensed"');await document.fonts.load('700 12px Inter');
    S.players.forEach((p,i)=>{if(i%2)return;const c=document.createElement("canvas");c.width=256;c.height=320;const g=c.getContext("2d");
      g.fillStyle=`hsl(${i*40},60%,55%)`;g.beginPath();g.arc(128,100,56,0,7);g.fill();g.beginPath();g.moveTo(14,320);g.quadraticCurveTo(20,190,128,190);g.quadraticCurveTo(236,190,242,320);g.fill();
      S.photos[p.id]=c.toDataURL("image/png")});S.me=S.players[0].id;render(true);
    const P0=S.players;S.stats[P0[0].id].streak={t:"5 maçtır gol atıyor",hot:true};S.stats[P0[3].id].streak={t:"3 maçtır not 6 altında",hot:false};S.stats[P0[5].id].series=[66,68,67,70,72,71,75,78,79];S.stats[P0[5].id].ovr=79});
  const plan=[];
  const items={once:["ilk7","gun","kadro","duel","out"],mac:["skor","motm","totw","gol","fiy","kadro","veri"],oyuncu:["kart","deger","seri","rozet","kaptan","durum","h2h","yeni","dogum","km"],sezon:["tablo","mvp","golk","asistk","piyasa","yildiz","ay","ikili","sadik","karne","yaris","final"]};
  const ms=await run(()=>fin().map(m=>m.id));const pids=await run(()=>pmPlayers().map(p=>p.id));
  for(const [tab,L] of Object.entries(items))for(const it of L){
    if(tab==="mac"){for(const mid of ms)plan.push({tab,item:it,mid})}
    else if(tab==="oyuncu"){for(const pid of pids.slice(0,8))plan.push({tab,item:it,pid})}
    else if(it==="ilk7"){plan.push({tab,item:it,x7k:"A"});plan.push({tab,item:it,x7k:"B"})}
    else if(it==="yaris"){for(const race of["FV","OS","DF","KL"])plan.push({tab,item:it,race})}
    else plan.push({tab,item:it})}
  const fails=[],empty=new Set(),made=new Set();let n=0;
  for(const f of plan)for(const fmt of["post","story"]){
    const r=await run(({f,fmt})=>{S.f.pm={...f,fmt};const x=igBuild();if(!x)return{empty:true};
      let box=document.getElementById("ypTest");if(!box){box=document.createElement("div");box.id="ypTest";box.style.cssText="position:absolute;left:0;top:0;z-index:99999;background:#000";document.body.appendChild(box)}
      box.innerHTML=igFrame(x,fmt);const root=box.querySelector(".yp");const R=root.getBoundingClientRect();
      const B=[...root.querySelectorAll("[data-b]")].filter(e=>getComputedStyle(e).display!=="none");const out=[];
      const nm=e=>e.className&&e.className.baseVal!==undefined?e.className.baseVal:(e.className||e.tagName);
      for(let i=0;i<B.length;i++){const a=B[i].getBoundingClientRect();
        if(a.left<R.left-.5||a.right>R.right+.5||a.top<R.top-.5||a.bottom>R.bottom+.5)out.push("dışarı taşıyor: "+nm(B[i]));
        for(let j=i+1;j<B.length;j++){if(B[i].contains(B[j])||B[j].contains(B[i]))continue;const c=B[j].getBoundingClientRect();
          const w=Math.min(a.right,c.right)-Math.max(a.left,c.left),h=Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top);if(w>.5&&h>.5)out.push(`üst üste: ${nm(B[i])} × ${nm(B[j])} (${w.toFixed(0)}×${h.toFixed(0)})`)}}
      // metin kutusundan taşmasın
      root.querySelectorAll("*").forEach(e=>{if(e.closest("svg"))return;const cs=getComputedStyle(e);if(cs.whiteSpace==="nowrap"&&e.scrollWidth>e.clientWidth+1&&e.clientWidth>0)out.push("metin sığmıyor: "+nm(e)+" «"+e.textContent.slice(0,30)+"»")});
      // hero içeriği hero'dan taşmasın
      const hero=root.querySelector(".yp-hero");if(hero){const H=hero.getBoundingClientRect();hero.querySelectorAll("[data-b]").forEach(e=>{const a=e.getBoundingClientRect();if(a.top<H.top-.5||a.bottom>H.bottom+.5||a.left<H.left-.5||a.right>H.right+.5)out.push("alan dışında: "+nm(e))})}
      return{name:x.name,out:[...new Set(out)]}},{f,fmt});
    const key=f.tab+"/"+f.item;
    if(r.empty){empty.add(key);continue}made.add(key);n++;
    if(r.out.length)fails.push(`${key} ${fmt} ${JSON.stringify(f.pid||f.mid||f.race||"").slice(-6)}: `+r.out.join(" | "));
    if(shots&&(fmt==="story"?!made.has(key+"s"):true)){const fn=`${key.replace("/","-")}-${fmt}-${(f.pid||f.mid||f.race||f.x7k||"x").slice(-2)}.png`;
      if(!fs.existsSync(path.join(shots,key.replace("/","-")+"-"+fmt+"-ilk.png"))){await (await pg.$(fmt==="story"?"#ypTest .yp-story":"#ypTest .yp")).screenshot({path:path.join(shots,key.replace("/","-")+"-"+fmt+"-ilk.png")})}
      else if(fmt==="post"&&(f.pid===pids[0]||f.mid===ms[ms.length-1]))await (await pg.$("#ypTest .yp")).screenshot({path:path.join(shots,fn)})}
  }
  for(const k of Object.entries(items).flatMap(([t,L])=>L.map(i=>t+"/"+i)))if(!made.has(k))fails.push(k+": hiç üretilemedi");
  if(errs.length)fails.push("JS hatası: "+[...new Set(errs)].join(" | "));
  await b.close();srv.close();
  if(fails.length){console.log("HATA ("+fails.length+")\n- "+[...new Set(fails)].join("\n- "));process.exit(1)}
  console.log(`Tamam: ${n} paylaşım görseli üretildi; üst üste binme ve taşma yok.`);
})().catch(e=>{console.error(e);process.exit(1)});
