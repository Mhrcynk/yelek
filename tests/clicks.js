// Yelek tıklama testleri: ana akışlar gerçekten çalışıyor mu?
// Çalıştır: node tests/clicks.js   (Playwright gerekli)
// Gerçek veri ve gerçek sunucu kullanmaz. Uygulamanın test kopyası, iç durumu dışarı açan
// küçük bir kancayla geçici olarak sunulur; asıl dosyalara dokunulmaz.
const http=require("http"),fs=require("fs"),path=require("path");
const {chromium}=require("playwright");
const root=path.join(__dirname,"..");

// test kopyası: app.js'e window.__E kancası eklenir
const html=()=>{let s=fs.readFileSync(path.join(root,"index.html"),"utf8");const css=fs.readFileSync(path.join(root,"app.css"),"utf8");
  let js=fs.readFileSync(path.join(root,"app.js"),"utf8").replace("function compute(){","window.__E=s=>eval(s);function compute(){");
  s=s.replace(/<link rel="stylesheet" href="app\.css\?v=\w+">/,()=>"<style>"+css+"</style>").replace(/<script src="app\.js\?v=\w+"><\/script>/,()=>"<script>"+js+"</script>");return s};
const srv=http.createServer((q,r)=>{const f=decodeURIComponent(q.url.split("?")[0]);
  if(f==="/"||f==="/index.html"){r.writeHead(200,{"Content-Type":"text/html"});return r.end(html())}
  const p=path.join(root,f);if(!p.startsWith(root)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);return r.end()}
  r.writeHead(200);fs.createReadStream(p).pipe(r)});

// uydurma veri
const uid=i=>"00000000-0000-4000-8000-"+String(i).padStart(12,"0");
const AD=["Ali","Veli","Can","Cem","Efe","Ege","Mert","Kaan","Onur","Umut","Emre","Arda","Deniz","Burak"];
const POS=["Kaleci","Defans","Defans","Orta saha","Orta saha","Forvet","Defans","Orta saha","Forvet","Kaleci","Defans","Orta saha","Forvet","Orta saha"];
const attrs=()=>({hiz:70,sut:70,pas:70,dri:70,def:70,fiz:70});
const players=AD.map((n,i)=>({id:uid(i+1),name:n+" Test"+i,pos:POS[i],epos:null,alt_pos:null,no:String(i+1),attrs:attrs(),status:{type:"hazir"},status_log:[],created_at:"2026-01-01T00:00:00Z",archived:false,photo_v:0,guest:false,yedek:false}));
const ids=players.map(p=>p.id);
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const soon=new Date(Date.now()+3*36e5);// 3 saat sonra: geri sayım görünmeli
const mk=(k,date,time,state,sa,sb)=>({id:uid(100+k),date,time,state,kind:"ic",archived:false,season:1,rsvp:{},rsvp_at:{},late:{},
  team_a:ids.slice(0,7),team_b:ids.slice(7),form_a:"2-3-1",form_b:"2-3-1",lineup_a:ids.slice(0,7),lineup_b:ids.slice(7),pos_a:null,pos_b:null,
  score_a:sa,score_b:sb,stats:state==="bitti"?{[ids[5]]:{g:2,a:0},[ids[8]]:{g:1,a:1}}:{},votes:{},motm:state==="bitti"?ids[5]:null,cap_a:ids[0],cap_b:ids[7],preds:{},links:null,gol_id:null,fiy_id:null,
  tac_a:null,tac_b:null,opponent:null,name_a:"Kırmızılar",name_b:"Maviler",created_at:date+"T10:00:00Z",finished_at:state==="bitti"?date+"T22:00:00Z":null,notes:null});
const past=n=>ymd(new Date(Date.now()-n*864e5));
const DB1={settings:[{id:1,group_name:"Test FC",field_name:"Test Saha",day:1,time:"21:00",team_a_name:"Kırmızılar",team_b_name:"Maviler",season_len:8,season_closed:0,gate:true,slug:"test",followable:true}],
  players,matches:[mk(3,ymd(soon),String(soon.getHours()).padStart(2,"0")+":"+String(soon.getMinutes()).padStart(2,"0"),"takim",null,null),mk(2,past(1),"21:00","bitti",3,2),mk(1,past(8),"21:00","bitti",1,1)],season_votes:[],player_photos:[]};
const DB0={...DB1,settings:[{...DB1.settings[0],id:6,field_name:"Yeni Saha",followable:false}],players:players.slice(0,3),matches:[]};
const OWNER="d8bac3ce-40c8-4ef7-babe-0732872cd273";

const RPC={team_rev:{r:1,p:1},player_ages:[],my_membership:{status:"onayli",role:"yonetici",player_id:ids[4]},
  teams_hub:{mine:[{id:1,name:"Test FC",slug:"test",tag:"yonetici"}],all:[{id:1,name:"Test FC",slug:"test",followable:true,players:14},{id:9,name:"Başka FC",slug:"baska",followable:true,players:9}]},
  platform_teams:{ok:true,rows:[{id:1,name:"Test FC",slug:"test",active:true,pending:false,followable:true,players:14,members:5,matches:2,owner:"Test"}]},
  platform_errors:{ok:true,rows:[]},platform_backup_info:{ok:true,last_used:null,uses:0},my_account_check:{solo_admin:[]},
  follow_set:{ok:true},platform_backup_key:{ok:true},log_error:null,my_teams:[],my_follows:[]};

(async()=>{
  await new Promise(r=>srv.listen(0,r));const port=srv.address().port;
  const b=await chromium.launch();const fails=[];const calls=[];
  const page=async(db,w)=>{const ctx=await b.newContext({viewport:{width:w||390,height:844}});
    await ctx.route(/fonts\.(googleapis|gstatic)\.com|cdn|jsdelivr|unpkg/,r=>r.abort());
    await ctx.route(/\/rest\/v1\//,r=>{const u=r.request().url();
      if(u.includes("/rpc/")){const fn=u.split("/rpc/")[1].split("?")[0];calls.push([fn,r.request().postData()]);return r.fulfill({status:200,contentType:"application/json",body:JSON.stringify(fn in RPC?RPC[fn]:{})})}
      const k=Object.keys(db).find(k=>u.includes("/rest/v1/"+k+"?"));return r.fulfill({status:200,contentType:"application/json",body:JSON.stringify(k?db[k]:[])})});
    const pg=await ctx.newPage();pg.errs=[];pg.on("pageerror",e=>pg.errs.push(e.message));
    await pg.addInitScript(t=>{localStorage.setItem("y_asked","1");localStorage.setItem("y_hos","1");localStorage.setItem("y_team",t)},String(db.settings[0].id));
    await pg.goto(`http://localhost:${port}/`);await pg.waitForTimeout(1300);pg.ctx=ctx;return pg};
  const E=(pg,s)=>pg.evaluate(s=>window.__E(s),s);
  const login=(pg,uidv,role)=>E(pg,`AUTH.ready=true;S.session={access_token:"x",user:{id:"${uidv}",email:"t@x"}};S.mem={status:"onayli",role:"${role}",player_id:"${ids[4]}"};S.me="${ids[4]}";S.admin=${role==="yonetici"};render(true)`);
  const click=async(pg,sel)=>{const n=await pg.locator(sel).first();await n.click();await pg.waitForTimeout(350)};
  const ok=(c,m)=>{if(!c)fails.push(m)};
  const sheetOpen=pg=>pg.evaluate(()=>!!document.querySelector("#modal .sheet"));
  const T=async(name,fn)=>{try{await fn()}catch(e){fails.push(name+": "+e.message.split("\n")[0])}};

  // --- yönetici, kurulu takım ---
  const pg=await page(DB1);await login(pg,OWNER,"yonetici");

  await T("Sen kimsin penceresi",async()=>{await E(pg,`S.sheet={type:"me"};render(true)`);await pg.waitForTimeout(300);ok(await sheetOpen(pg),"Sen kimsin açılmadı");
    await click(pg,'#modal .ch [data-act="close"]');ok(!(await sheetOpen(pg)),"Sen kimsin Kapat ile kapanmadı");
    await E(pg,`S.sheet={type:"me"};render(true)`);await pg.waitForTimeout(300);await click(pg,'#modal .grab');ok(!(await sheetOpen(pg)),"Tutamaca dokununca kapanmadı")});

  await T("Geri sayım",async()=>{await click(pg,'.nav [data-tab="mac"]');ok(!(await pg.evaluate(()=>!!document.querySelector(".mafcd"))),"Maç sekmesinde geri sayım olmamalı");
    await click(pg,'.nav [data-tab="gecmis"]');const t=await pg.evaluate(()=>document.querySelector(".btkf .tkcd")?.textContent||"");
    ok(/^\d\d:\d\d:\d\d$/.test(t),"24 saat içindeki maçta geri sayım yok ("+t+")");await pg.waitForTimeout(1200);
    const t2=await pg.evaluate(()=>document.querySelector(".btkf .tkcd")?.textContent||"");ok(t2!==t,"geri sayım ilerlemiyor");await click(pg,'.nav [data-tab="mac"]')});

  await T("Kondisyon",async()=>{ok(await pg.locator(".field .tk").count()>0,"sahada kondisyon rozeti yok");
    await click(pg,'.nav [data-tab="kartlar"]');ok(await pg.locator(".plist .kchip").count()>0,"listede kondisyon yok");
    await click(pg,'#view [data-act="open"]');ok(await pg.locator("#modal .kcard").count()===1,"oyuncu detayında kondisyon yok");await click(pg,'#modal [data-act="close"]')});

  await T("Oyuncu ekle butonu",async()=>{await click(pg,'.kph [data-act="addSheet"]');ok(await sheetOpen(pg),"Oyuncu ekle açılmadı");await click(pg,'#modal [data-act="close"]')});

  await T("Dış maç formu",async()=>{await click(pg,'.nav [data-tab="gecmis"]');await click(pg,'[data-act="extNew"]');ok(await sheetOpen(pg),"Dış maç açılmadı");
    await click(pg,'#modal [data-act="extSc"][data-k="us"][data-d="1"]');const v=await pg.evaluate(()=>document.querySelector("#modal .xsbt b")?.textContent);ok(v==="1","skor artmadı ("+v+")");
    await click(pg,'#modal [data-act="close"]')});

  await T("Ayarlar: Linkler",async()=>{await E(pg,`S.f.setp="pay";S.tab="ayarlar";render(true)`);await pg.waitForTimeout(300);
    const u=await pg.evaluate(()=>document.querySelector("#shareUrl")?.value||"");ok(u&&!u.includes("?t="),"Tek link yanlış ("+u+")");ok(await pg.locator(".lkt").count()===0,"Eski link sekmeleri duruyor")});

  await T("Ayarlar: Platform",async()=>{await E(pg,`S.f.setp="";render(true)`);await click(pg,'[data-act="setp"][data-v="platform"]');await pg.waitForTimeout(400);
    await click(pg,'[data-act="platL"]');ok(await pg.locator(".plx").count()===1,"Platform → Linkler açılmadı");
    await click(pg,'[data-act="bkKey"]');await click(pg,'#modal [data-act="bkKey"][data-v="1"]');await pg.waitForTimeout(400);
    const k=await pg.evaluate(()=>document.querySelector("#modal .surl input")?.value||"");ok(/^[0-9a-f]{64}$/.test(k),"yedek anahtarı üretilmedi");
    ok(calls.some(c=>c[0]==="platform_backup_key"),"yedek anahtarı sunucuya gönderilmedi");await click(pg,'#modal [data-act="close"]')});

  await T("Görünüm",async()=>{await E(pg,`S.f.setp="";S.tab="ayarlar";render(true)`);await pg.waitForTimeout(300);await click(pg,'[data-act="theme"][data-v="koyu"]');
    ok(await pg.evaluate(()=>document.documentElement.classList.contains("dk")),"koyu tema açılmadı");await click(pg,'[data-act="theme"][data-v="acik"]');
    ok(!(await pg.evaluate(()=>document.documentElement.classList.contains("dk"))),"açık temaya dönmedi")});

  await T("Hesabımı sil",async()=>{await click(pg,'[data-act="delAcc"]');await pg.waitForTimeout(400);ok(await pg.locator('#modal [data-act="delAccGo"]').count()===1,"hesap silme penceresi açılmadı");await click(pg,'#modal [data-act="close"]')});

  await T("Takımlar ekranı",async()=>{await click(pg,".top .brand");await pg.waitForTimeout(400);ok(await pg.locator("#tCode").count()===1,"Takımlar ekranı açılmadı");
    await pg.fill("#tCode","yokboyle");await pg.locator(".tcf button[type=submit]").click();await pg.waitForTimeout(300);ok(calls.some(c=>c[0]==="team_by_code"&&/yokboyle/.test(c[1])),"takım kodu sorgulanmadı");await click(pg,'#modal [data-act="close"]')});

  await T("Hata kaydı",async()=>{await pg.evaluate(()=>setTimeout(()=>{window.__yokFonksiyon()},0));await pg.waitForTimeout(500);ok(calls.some(c=>c[0]==="log_error"),"hata kaydedilmedi");pg.errs=pg.errs.filter(x=>!/__yokFonksiyon/.test(x))});

  // dar ekranda yatay taşma
  await T("Dar ekran",async()=>{await pg.setViewportSize({width:320,height:640});
    for(const t of["mac","gecmis","lig","kartlar","ben","ayarlar"]){await E(pg,`S.sheet=null;S.view=null;S.f.setp="";S.tab="${t}";render(true)`);await pg.waitForTimeout(300);
      if(await pg.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1))fails.push("320 px'te yatay taşma: "+t)}});
  if(pg.errs.length)fails.push("JS hatası (kurulu takım): "+pg.errs.join(" | "));await pg.ctx.close();

  // --- yeni takım: kurulum rehberi ---
  const p2=await page(DB0);await login(p2,"11111111-1111-1111-1111-111111111111","yonetici");
  await T("Kurulum rehberi",async()=>{await click(p2,'.nav [data-tab="mac"]');ok(await p2.locator(".gd").count()===1,"rehber görünmüyor");
    const st=await p2.evaluate(()=>[...document.querySelectorAll(".gdl li")].map(l=>l.className));ok(st[0]==="ok"&&st[1]==="now","rehber adımları yanlış ("+st+")");
    await click(p2,'[data-act="gdHide"]');ok(await p2.locator(".gd").count()===0,"Gizle çalışmadı")});
  if(p2.errs.length)fails.push("JS hatası (yeni takım): "+p2.errs.join(" | "));await p2.ctx.close();

  // --- takipçi ---
  const p3=await page(DB1);await E(p3,`AUTH.ready=true;S.session={access_token:"x",user:{id:"22222222-2222-2222-2222-222222222222",email:"f@x"}};S.mem={status:"yok"};S.fol=true;render(true)`);
  await T("Takip modu",async()=>{await p3.waitForTimeout(300);const n=await p3.evaluate(()=>document.querySelectorAll("#navIn button").length);ok(n===2,"takipçide "+n+" sekme var");
    ok(await p3.locator(".folb").count()===1,"takip şeridi yok");await click(p3,"#meBtn");ok(await p3.locator("#tCode").count()===1,"takipçide Takımlar açılmadı")});
  if(p3.errs.length)fails.push("JS hatası (takipçi): "+p3.errs.join(" | "));await p3.ctx.close();

  // --- katılım: kart seç, istek gönder ---
  const p4=await page({...DB1,settings:[{...DB1.settings[0],gate:true}]});RPC.vitrin={players:players.map(p=>({id:p.id,n:p.name}))};RPC.request_join={ok:true};RPC.my_membership={status:"yok"};
  await E(p4,`LS.set("y_int","katil");AUTH.ready=true;S.session={access_token:"x",user:{id:"33333333-3333-3333-3333-333333333333",email:"k@x"}};S.mem={status:"yok"};S.vit=undefined;render(true)`);
  await T("Katılım akışı",async()=>{await p4.waitForTimeout(500);ok(await p4.locator(".fst li").count()===4,"adım göstergesi yok");
    ok(await p4.locator('[data-act="joinReq"]').isDisabled(),"kart seçmeden gönder açık");
    await p4.fill("#clQ","Cem");await p4.waitForTimeout(150);ok(await p4.locator(".fpr").count()===1,"arama süzmedi");
    await click(p4,".fpr");ok(await p4.locator(".fpr.on").count()===1,"kart seçilmedi");
    await click(p4,'[data-act="joinReq"]');ok(calls.some(c=>c[0]==="request_join"&&/p_player/.test(c[1])),"katılma isteği gitmedi");
    await click(p4,'[data-act="tog"][data-k="ncOpen"]');ok(await p4.locator("#ncName").count()===1,"yeni kart formu açılmadı")});
  if(p4.errs.length)fails.push("JS hatası (katılım): "+p4.errs.join(" | "));await p4.ctx.close();

  await b.close();srv.close();
  if(fails.length){console.log("HATA\n- "+fails.join("\n- "));process.exit(1)}console.log("Tamam: tıklama testlerinin hepsi geçti.");
})().catch(e=>{console.error(e);process.exit(1)});
