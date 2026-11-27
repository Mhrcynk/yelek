// Maç motoru denge testi: ayna maç, güç farkı, taktik döngüsü, diziliş, kimya bağları, yetenekler, belirlilik ve kayıt dondurma.
// Çalıştır: node tests/denge.js   (Playwright gerekli, 1-2 dakika sürer). Uydurma veri kullanır.
// Gerçek veri ve gerçek sunucu kullanmaz. Uygulamanın test kopyası, iç durumu dışarı açan
// küçük bir kancayla geçici olarak sunulur; asıl dosyalara dokunulmaz.
const http=require("http"),fs=require("fs"),path=require("path");
const {chromium}=require("playwright");
const root=require("path").join(__dirname,"..");

// test kopyası: app.js'e window.__E kancası eklenir
const html=()=>{let s=fs.readFileSync(path.join(root,"index.html"),"utf8");const css=fs.readFileSync(path.join(root,"app.css"),"utf8");
  let js=fs.readFileSync(path.join(root,"app.js"),"utf8").replace("function compute(){","window.__E=s=>eval(s);function compute(){");
  s=s.replace(/<link rel="stylesheet" href="app\.css\?v=\w+">/,()=>"<style>"+css+"</style>").replace(/<script src="app\.js\?v=\w+"[^>]*><\/script>/,()=>"<script>"+js+"</script>");return s};
const srv=http.createServer((q,r)=>{const f=decodeURIComponent(q.url.split("?")[0]);
  if(f==="/"||f==="/index.html"){r.writeHead(200,{"Content-Type":"text/html"});return r.end(html())}
  const p=path.join(root,f);if(!p.startsWith(root)||!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);return r.end()}
  r.writeHead(200);fs.createReadStream(p).pipe(r)});

// uydurma veri
const uid=i=>"00000000-0000-4000-8000-"+String(i).padStart(12,"0");
const AD=["Ali","Veli","Can","Cem","Efe","Ege","Mert","Kaan","Onur","Umut","Emre","Arda","Deniz","Burak"];
const POS=["Kaleci","Defans","Defans","Orta saha","Orta saha","Forvet","Defans","Orta saha","Forvet","Kaleci","Defans","Orta saha","Forvet","Orta saha"];
let _s=7;const rnd=()=>{_s=(_s*9301+49297)%233280;return _s/233280};const attrs=()=>{const a={};for(const k of["hiz","sut","pas","dri","def","fiz"])a[k]=60+Math.round(rnd()*22);return a};
const players=AD.map((n,i)=>({id:uid(i+1),name:n+" Test"+i,pos:POS[i],epos:null,alt_pos:null,no:String(i+1),attrs:attrs(),status:{type:"hazir"},status_log:[],created_at:"2026-01-01T00:00:00Z",archived:false,photo_v:0,guest:false,yedek:false}));
const ids=players.map(p=>p.id);
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
const soon=new Date(Date.now()+3*36e5);// 3 saat sonra: geri sayım görünmeli
const mk=(k,date,time,state,sa,sb)=>({id:uid(100+k),date,time,state,kind:"ic",archived:false,season:1,rsvp:{},rsvp_at:{},late:{},
  team_a:ids.slice(0,7),team_b:ids.slice(7),form_a:"2-3-1",form_b:"2-3-1",lineup_a:ids.slice(0,7),lineup_b:ids.slice(7),pos_a:null,pos_b:null,
  score_a:sa,score_b:sb,stats:state==="bitti"?{[ids[5]]:{g:2,a:0},[ids[8]]:{g:1,a:1}}:{},votes:{},motm:state==="bitti"?ids[5]:null,cap_a:ids[0],cap_b:ids[7],preds:{},links:null,gol_id:null,fiy_id:null,
  tac_a:null,tac_b:null,opponent:null,name_a:"Kırmızılar",name_b:"Maviler",created_at:date+"T10:00:00Z",finished_at:state==="bitti"?date+"T22:00:00Z":null,notes:null});
const past=n=>ymd(new Date(Date.now()-n*864e5));
const DB1={settings:[{id:1,logo_v:0,group_name:"Test FC",field_name:"Test Saha",day:1,time:"21:00",team_a_name:"Kırmızılar",team_b_name:"Maviler",season_len:8,season_closed:0,gate:true,slug:"test",followable:true}],
  players,matches:[mk(3,ymd(soon),String(soon.getHours()).padStart(2,"0")+":"+String(soon.getMinutes()).padStart(2,"0"),"takim",null,null),mk(2,past(1),"21:00","bitti",3,2),mk(1,past(8),"21:00","bitti",1,1)],season_votes:[],player_photos:[]};
const DB0={...DB1,settings:[{...DB1.settings[0],id:6,field_name:"Yeni Saha",followable:false}],players:players.slice(0,3),matches:[]};
const OWNER="d8bac3ce-40c8-4ef7-babe-0732872cd273";

const RPC={team_rev:{r:1,p:1},player_ages:[],my_membership:{status:"onayli",role:"yonetici",player_id:ids[4]},
  teams_hub:{mine:[{id:1,name:"Test FC",slug:"test",tag:"yonetici"}],all:[{id:1,name:"Test FC",slug:"test",followable:true,players:14},{id:9,name:"Başka FC",slug:"baska",followable:true,players:9}]},
  platform_teams:{ok:true,rows:[{id:1,name:"Test FC",slug:"test",active:true,pending:false,followable:true,players:14,members:5,matches:2,owner:"Test"}]},
  platform_errors:{ok:true,rows:[]},platform_backup_info:{ok:true,last_used:null,uses:0},my_account_check:{solo_admin:[]},
  follow_set:{ok:true},platform_backup_key:{ok:true},log_error:null,my_teams:[],my_follows:[]};


const OUT=process.argv.includes("--shots")?process.argv[process.argv.indexOf("--shots")+1]:null;if(OUT)require("fs").mkdirSync(OUT,{recursive:true});
const ONLY=process.env.ONLY?process.env.ONLY.split(","):null;
(async()=>{
  await new Promise(r=>srv.listen(0,r));const port=srv.address().port;
  const b=await chromium.launch();
  const ctx=await b.newContext({viewport:{width:+(process.env.W||390),height:844},deviceScaleFactor:1});
  await ctx.route(/fonts\.(googleapis|gstatic)\.com|cdn|jsdelivr|unpkg/,r=>r.abort());
  await ctx.route(/\/rest\/v1\//,r=>{const u=r.request().url();
    if(u.includes("/rpc/")){const fn=u.split("/rpc/")[1].split("?")[0];return r.fulfill({status:200,contentType:"application/json",body:JSON.stringify(fn in RPC?RPC[fn]:{})})}
    const k=Object.keys(DB1).find(k=>u.includes("/rest/v1/"+k+"?"));return r.fulfill({status:200,contentType:"application/json",body:JSON.stringify(k?DB1[k]:[])})});
  const pg=await ctx.newPage();pg.on("pageerror",e=>console.log("ERR",e.message));
  await pg.addInitScript(()=>{localStorage.setItem("y_asked","1");localStorage.setItem("y_hos","1");localStorage.setItem("y_kur","3|0");localStorage.setItem("y_team","1");if(window.name!=="lt")localStorage.setItem("y_theme",localStorage.getItem("y_theme")||"koyu")});
  await pg.goto(`http://localhost:${port}/`);await pg.waitForTimeout(1300);
  const E=s=>pg.evaluate(s=>window.__E(s),s);await pg.addStyleTag({content:'@font-face{font-family:"Barlow Condensed";font-weight:600;src:url(/tests/fonts/barlow-condensed-latin-600-normal.woff2)}@font-face{font-family:"Barlow Condensed";font-weight:600;src:url(/tests/fonts/barlow-condensed-latin-ext-600-normal.woff2);unicode-range:U+0100-024F}@font-face{font-family:"Barlow Condensed";font-weight:700;src:url(/tests/fonts/barlow-condensed-latin-700-normal.woff2)}@font-face{font-family:"Barlow Condensed";font-weight:700;src:url(/tests/fonts/barlow-condensed-latin-ext-700-normal.woff2);unicode-range:U+0100-024F}@font-face{font-family:"Barlow Condensed";font-weight:800;src:url(/tests/fonts/barlow-condensed-latin-800-normal.woff2)}@font-face{font-family:"Barlow Condensed";font-weight:800;src:url(/tests/fonts/barlow-condensed-latin-ext-800-normal.woff2);unicode-range:U+0100-024F}@font-face{font-family:"Inter";font-weight:500;src:url(/tests/fonts/inter-latin-500-normal.woff2)}@font-face{font-family:"Inter";font-weight:500;src:url(/tests/fonts/inter-latin-ext-500-normal.woff2);unicode-range:U+0100-024F}@font-face{font-family:"Inter";font-weight:600;src:url(/tests/fonts/inter-latin-600-normal.woff2)}@font-face{font-family:"Inter";font-weight:600;src:url(/tests/fonts/inter-latin-ext-600-normal.woff2);unicode-range:U+0100-024F}@font-face{font-family:"Inter";font-weight:700;src:url(/tests/fonts/inter-latin-700-normal.woff2)}@font-face{font-family:"Inter";font-weight:700;src:url(/tests/fonts/inter-latin-ext-700-normal.woff2);unicode-range:U+0100-024F}@font-face{font-family:"Inter";font-weight:800;src:url(/tests/fonts/inter-latin-800-normal.woff2)}@font-face{font-family:"Inter";font-weight:800;src:url(/tests/fonts/inter-latin-ext-800-normal.woff2);unicode-range:U+0100-024F}'});await pg.waitForTimeout(300);
  await E(`AUTH.ready=true;S.session={access_token:"x",user:{id:"u1",email:"t@x"}};S.mem={status:"onayli",role:"yonetici",player_id:"${ids[4]}"};S.me="${ids[4]}";render(true)`);
  const R=JSON.parse(await E(fs.readFileSync(path.join(__dirname,"denge_ic.js"),"utf8")));
  let bad=0;for(const r of R){const ok=r.ok!==false;if(!ok)bad++;console.log((ok?"  ":"✗ ")+r.ad.padEnd(34)+r.v+(r.not?"  ("+r.not+")":""))}
  await b.close();srv.close();
  if(bad){console.log(`Hata: ${bad} denge kontrolü sınırın dışında.`);process.exit(1)}
  console.log("Tamam: maç motoru denge kontrollerinin hepsi geçti.")})();
