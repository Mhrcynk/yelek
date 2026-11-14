// Yelek duman testi: her ekran hatasız açılıyor mu?
// Çalıştır: node tests/smoke.js   (Playwright gerekli)
// Gerçek veri kullanmaz; uydurma oyuncu ve maçlarla çalışır.
const http=require("http"),fs=require("fs"),path=require("path");
const {chromium}=require("playwright");
const root=path.join(__dirname,"..");
const T=["text/html","text/css","application/javascript","application/json","image/png","image/svg+xml"];
const typ=f=>({".html":T[0],".css":T[1],".js":T[2],".webmanifest":T[3],".png":T[4],".svg":T[5]})[path.extname(f)]||"application/octet-stream";
const srv=http.createServer((q,r)=>{let f=decodeURIComponent(q.url.split("?")[0]);if(f.endsWith("/"))f+="index.html";const p=path.join(root,f);
  if(!p.startsWith(root)||!fs.existsSync(p)){r.writeHead(404);return r.end()}r.writeHead(200,{"Content-Type":typ(p)});fs.createReadStream(p).pipe(r)});

// uydurma veri
const uid=i=>"00000000-0000-4000-8000-"+String(i).padStart(12,"0");
const AD=["Ali","Veli","Can","Cem","Efe","Ege","Mert","Kaan","Onur","Umut","Emre","Arda","Deniz","Burak"];
const POS=["KL","DF","DF","OS","OS","FV","DF","OS","FV","KL","DF","OS","FV","OS"];
const attrs=()=>({hiz:70,sut:70,pas:70,dri:70,def:70,fiz:70});
const players=AD.map((n,i)=>({id:uid(i+1),name:n+" Test"+i,pos:POS[i],epos:null,alt_pos:null,no:String(i+1),attrs:attrs(),status:"aktif",status_log:[],created_at:"2026-01-01T00:00:00Z",archived:false,photo_v:0,guest:false,yedek:false}));
const ids=players.map(p=>p.id);
const mk=(k,date,state,sa,sb)=>({id:uid(100+k),date,time:"21:00",state,kind:"ic",archived:false,season:1,rsvp:Object.fromEntries(ids.map(i=>[i,"g"])),rsvp_at:{},late:{},
  team_a:ids.slice(0,7),team_b:ids.slice(7),form_a:"2-3-1",form_b:"3-2-1",lineup_a:ids.slice(0,7),lineup_b:ids.slice(7),pos_a:null,pos_b:null,
  score_a:sa,score_b:sb,stats:state==="bitti"?{[ids[5]]:{g:2,a:0,k:0,og:0},[ids[8]]:{g:1,a:1,k:0,og:0}}:{},votes:{},motm:state==="bitti"?ids[5]:null,cap_a:ids[0],cap_b:ids[7],preds:{},links:null,gol_id:null,fiy_id:null,
  tac_a:null,tac_b:null,opponent:null,name_a:"Kırmızılar",name_b:"Mavililer",created_at:date+"T10:00:00Z",finished_at:state==="bitti"?date+"T22:00:00Z":null,notes:null});
const matches=[mk(3,"2026-11-16","takim",null,null),mk(2,"2026-11-09","bitti",3,2),mk(1,"2026-11-02","bitti",1,1)];
const settings=[{id:1,group_name:"Test FC",field_name:"Test Saha",day:1,time:"21:00",team_a_name:"Kırmızılar",team_b_name:"Mavililer",season_len:8,season_closed:0,gate:false}];
const DB={settings,players,matches,season_votes:[],player_photos:[]};

(async()=>{
  await new Promise(r=>srv.listen(0,r));const port=srv.address().port;
  const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:390,height:844}});
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort());
  await ctx.route(/\/rest\/v1\//,r=>{const u=r.request().url();
    if(u.includes("/rpc/"))return r.fulfill({status:200,contentType:"application/json",body:u.includes("player_ages")?"[]":"{}"});
    const k=Object.keys(DB).find(k=>u.includes("/rest/v1/"+k+"?"));return r.fulfill({status:200,contentType:"application/json",body:JSON.stringify(k?DB[k]:[])})});
  const pg=await ctx.newPage();const errs=[];pg.on("pageerror",e=>errs.push(e.message));
  await pg.addInitScript(()=>{localStorage.setItem("y_asked","1");localStorage.setItem("y_hos","1")});
  await pg.goto(`http://localhost:${port}/`);await pg.waitForTimeout(1500);
  const fails=[];
  const check=async name=>{const r=await pg.evaluate(()=>({len:(document.getElementById("view").innerText||"").trim().length,ov:document.documentElement.scrollWidth>innerWidth+1}));
    if(r.len<20)fails.push(name+": boş ekran");if(r.ov)fails.push(name+": yatay taşma");};
  for(const t of ["mac","gecmis","lig","kartlar","ben","ayarlar"]){
    await pg.evaluate(t=>{const b=document.querySelector(`.nav [data-tab="${t}"]`)||document.querySelector(`[data-tab="${t}"]`);b&&b.click()},t);await pg.waitForTimeout(500);await check("sekme "+t)}
  await pg.evaluate(()=>document.querySelector('.nav [data-tab="kartlar"]').click());await pg.waitForTimeout(500);
  const opened=await pg.evaluate(async()=>{const b=document.querySelector('#view [data-act="open"]');if(!b)return "düğme yok";b.click();await new Promise(r=>setTimeout(r,500));return document.getElementById("modal").innerText.length>20?"":"modal boş"});
  if(opened)fails.push("oyuncu kartı açılmadı ("+opened+")");
  if(errs.length)fails.push("JS hatası: "+errs.join(" | "));
  await b.close();srv.close();
  if(fails.length){console.log("HATA\n- "+fails.join("\n- "));process.exit(1)}console.log("Tamam: bütün ekranlar açılıyor.");
})().catch(e=>{console.error(e);process.exit(1)});
