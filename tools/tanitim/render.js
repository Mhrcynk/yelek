// Tanıtım videosu: sayfayı kare kare çekip sahne başına bir mp4 üretir. Kullanım: node render.js <1|2> <çıktı klasörü> [url] · SAHNE=<n> ile yalnız o sahne yeniden çekilir
const {chromium}=require("playwright");const {spawn}=require("child_process");const fs=require("fs");const path=require("path");
const v=process.argv[2]||"1",out=process.argv[3]||".",url=(process.argv[4]||("file://"+path.join(__dirname,"v.html")))+"?v="+v;const FPS=30;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});await p.goto(url);await p.evaluate(()=>window.ready);
  const scn=await p.evaluate(()=>SCN);const list=[];
  for(let k=0;k<scn.length;k++){const f0=Math.round(scn[k][0]*FPS),f1=Math.round(scn[k][1]*FPS);const tmp=path.join(out,`v${v}_s${k}.tmp.mp4`),fin=path.join(out,`v${v}_s${k}.mp4`);
    if(process.env.SAHNE&&+process.env.SAHNE!==k&&fs.existsSync(fin)){list.push(`file '${path.resolve(fin)}'`);continue}
    const ff=spawn("ffmpeg",["-y","-loglevel","error","-f","image2pipe","-framerate",String(FPS),"-c:v","mjpeg","-i","-","-c:v","libx264","-crf","18","-preset","veryfast","-pix_fmt","yuv420p","-r",String(FPS),tmp],{stdio:["pipe","inherit","inherit"]});
    const done=new Promise((res,rej)=>ff.on("close",c=>c===0?res():rej(new Error("ffmpeg "+c))));
    for(let f=f0;f<f1;f++){await p.evaluate(t=>seek(t),f/FPS);const buf=await p.screenshot({type:"jpeg",quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once("drain",r))}
    ff.stdin.end();await done;fs.renameSync(tmp,fin);list.push(`file '${path.resolve(fin)}'`);console.log("sahne",k,f1-f0,"kare")}
  fs.writeFileSync(path.join(out,`v${v}.txt`),list.join("\n")+"\n");await b.close()})().catch(e=>{console.error(e);process.exit(1)});
