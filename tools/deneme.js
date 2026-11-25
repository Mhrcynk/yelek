// Deneme sürümünü üretir: node tools/deneme.js <çıkış klasörü>
// Uygulamanın kendisi + sahte veri katmanı (tools/deneme-shim.js). Sunucuya bağlanmaz.
const fs=require("fs"),path=require("path");const root=path.join(__dirname,"..");const out=process.argv[2];if(!out)throw new Error("çıkış klasörü?");const gd=process.argv[3]||"";// isteğe bağlı: gerçek takım verisi klasörü (players.json, matches.json, me)
fs.mkdirSync(out,{recursive:true});
const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const body=html.split("<body>")[1].split(/<script src="app\.js/)[0];
const esc=s=>s.replace(/<\/script/gi,"<\\/script");
const page=`<title>Yelek Deneme</title>
<meta name="theme-color" content="#120A2A">
<script>document.documentElement.classList.add("dk");document.documentElement.lang="tr"</script>
<style>${fs.readFileSync(path.join(root,"app.css"),"utf8")}
#yd{position:fixed;z-index:9999;right:10px;top:calc(env(safe-area-inset-top,0px) + 70px);display:grid;justify-items:end;gap:8px;font-family:Inter,system-ui,sans-serif}
#ydT{min-height:36px;padding:0 14px;border-radius:99px;border:2px solid #FFD400;background:#2A1F00;color:#FFD400;font:800 12px Inter,sans-serif;letter-spacing:.06em;text-transform:uppercase}
#ydP{width:250px;display:grid;gap:8px;padding:14px;border-radius:18px;background:#211547;box-shadow:0 12px 40px rgba(0,0,0,.6);color:#fff}
#ydP small{color:#B7A9E8;font-size:12px;line-height:1.4}#ydP button{min-height:44px;border-radius:12px;border:0;background:#3A2C78;color:#fff;font:700 13px Inter,sans-serif;text-align:left;padding:0 12px}
#ydP button[data-yd=sifirla]{background:transparent;border:1.5px solid #5E5196;color:#D9CFFF}#ydMsg{font-size:12px;color:#FFD400;min-height:1em}</style>
${body}
${gd?`<script>window.YD_REAL=${esc(JSON.stringify({players:JSON.parse(fs.readFileSync(path.join(gd,"players.json"),"utf8")),...(({s,m})=>({s,matches:m}))(JSON.parse(fs.readFileSync(path.join(gd,"matches.json"),"utf8"))),me:fs.readFileSync(path.join(gd,"me"),"utf8").trim()}))}</script>`:""}
<script>${esc(fs.readFileSync(path.join(__dirname,"deneme-shim.js"),"utf8"))}</script>
<script>${esc(fs.readFileSync(path.join(root,"app.js"),"utf8"))}</script>`;
fs.writeFileSync(path.join(out,"index.html"),page);
for(const d of ["fonts"])for(const f of fs.readdirSync(path.join(root,d))){fs.mkdirSync(path.join(out,d),{recursive:true});fs.copyFileSync(path.join(root,d,f),path.join(out,d,f))}
fs.mkdirSync(path.join(out,"vendor"),{recursive:true});fs.copyFileSync(path.join(root,"vendor/html2canvas-1.4.1.min.js"),path.join(out,"vendor/html2canvas-1.4.1.min.js"));
for(const f of ["icon.svg","icon-192.png"])fs.copyFileSync(path.join(root,f),path.join(out,f));
console.log("tamam",(page.length/1024|0)+" KB");
