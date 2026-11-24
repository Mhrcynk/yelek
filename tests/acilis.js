// Açılış testi: kayıtlı oturumla ilk veri girişli mi geliyor, ekran boşalıyor mu, giriş kütüphanesi yerelden mi yükleniyor. Çalıştır: node tests/acilis.js
const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");
const root=require("path").join(__dirname,"..");
const srv=http.createServer((q,r)=>{let f=decodeURIComponent(q.url.split("?")[0]);if(f.endsWith("/"))f+="index.html";const p=path.join(root,f);
  if(!fs.existsSync(p)){r.writeHead(404);return r.end()}r.writeHead(200,{"Content-Type":f.endsWith(".js")?"application/javascript":f.endsWith(".css")?"text/css":"text/html"});fs.createReadStream(p).pipe(r)});
const uid=i=>"00000000-0000-4000-8000-"+String(i).padStart(12,"0");
const players=[1,2,3,4,5,6,7,8].map(i=>({id:uid(i),name:"Oyuncu Test"+i,pos:"Defans",attrs:{hiz:70,sut:70,pas:70,dri:70,def:70,fiz:70},status:{type:"hazir"},status_log:[],created_at:"2026-01-01T00:00:00Z",archived:false,photo_v:0,guest:false,yedek:false}));
const settings=[{id:1,group_name:"Test FC",field_name:"Saha",day:1,time:"21:00",team_a_name:"A",team_b_name:"B",season_len:8,season_closed:0,gate:true}];
(async()=>{await new Promise(r=>srv.listen(0,r));const port=srv.address().port;const b=await chromium.launch();
  for(const mode of ["gecerli","suresi_dolmus"]){
  const ctx=await b.newContext({viewport:{width:390,height:844}});const log=[];
  await ctx.route(/fonts\.|jsdelivr/,r=>{log.push("CDN "+r.request().url());r.abort()});
  await ctx.route(/supabase\.co\/auth\/v1\//,r=>{log.push("auth "+r.request().url().split("/auth/v1/")[1]);r.fulfill({status:200,contentType:"application/json",body:JSON.stringify({access_token:"yeni",refresh_token:"r2",expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:"bearer",user:{id:"u1",email:"t@x",aud:"authenticated"}})})});
  await ctx.route(/\/rest\/v1\//,r=>{const u=r.request().url();const h=r.request().headers().authorization||"";const authed=/Bearer (eski|yeni)/.test(h);
    if(u.includes("/rpc/")){const fn=u.split("/rpc/")[1];log.push("rpc "+fn+(authed?" +oturum":" -oturum"));
      return r.fulfill({status:200,contentType:"application/json",body:JSON.stringify(fn.startsWith("my_membership")?{status:"onayli",role:"uye",player_id:uid(1)}:fn.startsWith("team_rev")?{r:1,p:1}:[])})}
    const k=u.split("/rest/v1/")[1].split("?")[0];log.push("get "+k+(authed?" +oturum":" -oturum"));
    const body=k==="settings"?settings:!authed?[]:k==="players"?players:[];r.fulfill({status:200,contentType:"application/json",body:JSON.stringify(body)})});
  const pg=await ctx.newPage();const errs=[];pg.on("pageerror",e=>errs.push(e.message));
  const exp=mode==="gecerli"?Math.floor(Date.now()/1000)+3000:Math.floor(Date.now()/1000)-100;
  await pg.addInitScript(([exp,pl,st])=>{localStorage.setItem("y_asked","1");localStorage.setItem("y_hos","1");localStorage.setItem("y_kur","3|0");localStorage.setItem("y_tab","iddia");localStorage.setItem("y_team","1");
    localStorage.setItem("y_auth",JSON.stringify({access_token:"eski",refresh_token:"r1",expires_at:exp,expires_in:3600,token_type:"bearer",user:{id:"u1",email:"t@x",aud:"authenticated"}}));
    localStorage.setItem("y_cache",JSON.stringify({v:1,at:Date.now()-6e5,st,pl,ms:[],sv2:[],mem:{status:"onayli",role:"uye",player_id:pl[0].id}}))},[exp,players,settings]);
  await pg.goto(`http://localhost:${port}/`);
  const snaps=[];for(let i=0;i<8;i++){await pg.waitForTimeout(250);snaps.push(await pg.evaluate(()=>{const t=document.getElementById("view").innerText;return /İlk düdük|Önce kadroyu|Giriş yap/.test(t)?"BOŞ":(t.length>30?"dolu":"?")}))}
  const toast=await pg.evaluate(()=>document.body.innerText.includes("Giriş servisi yüklenemedi"));
  console.log(mode,"| ekran:",snaps.join(" "),"| hata:",errs.length?errs:"yok","| servis hatası:",toast);console.log("  istekler:",log.slice(0,9).join(" · "));
  await ctx.close()}
  await b.close();srv.close()})();
