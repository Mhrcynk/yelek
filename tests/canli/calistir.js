const http=require("http"),fs=require("fs"),path=require("path");const {chromium}=require("playwright");const R=process.argv[2],O=process.argv[3];
const T={".js":"text/javascript",".woff2":"font/woff2",".svg":"image/svg+xml",".png":"image/png"};
const srv=http.createServer((q,r)=>{let f=decodeURIComponent(q.url.split("?")[0]);if(f==="/"){r.writeHead(200,{"Content-Type":"text/html"});return r.end('<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'+fs.readFileSync(R+"/index.html","utf8")+"</body></html>")}
  const p=path.join(R,f);if(!fs.existsSync(p)){r.writeHead(404);return r.end()}r.writeHead(200,{"Content-Type":T[path.extname(p)]||"application/octet-stream"});fs.createReadStream(p).pipe(r)});
(async()=>{await new Promise(r=>srv.listen(0,r));const b=await chromium.launch();const ctx=await b.newContext({viewport:{width:+(process.env.VW||390),height:+(process.env.VH||844)},deviceScaleFactor:+(process.env.DSF||1),...(process.env.VID?{recordVideo:{dir:process.env.VID,size:{width:+(process.env.VW||390),height:+(process.env.VH||844)}}}:{})});
 await ctx.route(/supabase\.co/,r=>{console.log("GERÇEK İSTEK!",r.request().url());r.abort()});
 const pg=await ctx.newPage();await pg.addInitScript(()=>{const m={};const st={getItem:k=>k in m?m[k]:null,setItem:(k,v)=>{m[k]=String(v)},removeItem:k=>{delete m[k]},clear:()=>{for(const k in m)delete m[k]},key:i=>Object.keys(m)[i]??null,get length(){return Object.keys(m).length}};const px=new Proxy(st,{ownKeys:()=>Object.keys(m),getOwnPropertyDescriptor:(t,k)=>k in m?{enumerable:true,configurable:true,value:m[k]}:undefined});Object.defineProperty(window,"localStorage",{value:px,configurable:true})});pg.on("pageerror",e=>console.log("ERR",e.message));pg.on("console",m=>{if(m.type()==="error")console.log("CON",m.text().slice(0,200))});
 const go=async()=>{await pg.goto("http://localhost:"+srv.address().port+"/");await pg.waitForTimeout(1800)};await go();

 const E=c=>pg.evaluate(c=>window.__YD(c),c);
 await E("S.session={access_token:'x',user:{id:'d8bac3ce-40c8-4ef7-babe-0732872cd273'}};ULT_SRV.ok=true;ULT_SRV.at=Date.now();S.tab='oyun';S.pg={type:'ult',mid:fin()[0].id}");

 const shot=async n=>{await pg.waitForTimeout(350);await pg.screenshot({path:process.env.OUT+"/cm-"+n+".png"})};
 const W=async(c,ms)=>{const t=Date.now();while(Date.now()-t<(ms||20000)){if(await E(c))return true;await pg.waitForTimeout(150)}console.log("ZAMAN AŞIMI:",c);return false};
 console.log(await E(require("fs").readFileSync(process.env.TF,"utf8")));
 const steps=require(path.resolve(process.env.STEPS));await steps({pg,E,W,shot});
 await ctx.close();await b.close();srv.close()})();
