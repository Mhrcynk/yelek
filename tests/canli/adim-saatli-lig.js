module.exports=async({pg,E,W,shot})=>{
 const oyna=async ad=>{await W("!!(ULT.run&&ULT.run.cm)",30000);const t=Date.now();let kr=0;while(Date.now()-t<170000){await pg.waitForTimeout(700);if(await E("(()=>{const c=ULT.run&&ULT.run.cm;if(!c||!document.querySelector('#ulKarar [data-act=ultKrSec]'))return false;window.__kl=window.__kl||{};const key=c.kind+c.k+c.bek;if(window.__kl[key])return false;window.__kl[key]=1;return true})()")){await E("document.querySelectorAll('#ulKarar [data-act=ultKrSec]')[1].click();1");await pg.waitForTimeout(300);await E("document.querySelector('#ulKarar [data-act=ultKarar][data-v=ok]').click();1");kr++}if(await E("!!(ULT.run&&ULT.run.done)"))break}
  await pg.waitForTimeout(2500);console.log("LIG",ad,await E(`(()=>{const r=ULT.run,e=FS.evs[FS.evs.length-1];if(!r)return "KOŞU YOK";if(!e)return "KAYIT YOK "+JSON.stringify({done:r.done,as:r.cm&&r.cm.as,bek:r.cm&&r.cm.bek,dk:r.dk,log:FS.log.slice(-5)});const p=e.p||{};return JSON.stringify({karar:${kr},tur:r.kind,done:r.done,v:p.v,kayit:[p.ga,p.gb],ekran:[r.sk.a,r.sk.b],taraf:r.cm&&r.cm.side,kr:p.kr,pen:[p.pa,p.pb],sonuc:!document.getElementById("ulFin").hidden,yatay:document.querySelector(".ulmac").className,sekme:document.querySelectorAll("#ulGs button").length,formda:!!r.formda})})()`))};
 await E("ultCmGec=()=>40000;window.__kl={};1");
 console.log("LIG --- 1: saatli lig maçı, ikimiz de buradayız");
 await E("ultSt().tab='mac';ultSt().mt='lig';S.sheet=null;__setT0(9);render(true);1");await pg.waitForTimeout(500);
 console.log("LIG kart:",await E("(document.querySelector('.ulcm')||{textContent:'KART YOK'}).textContent.replace(/\\s+/g,' ').slice(0,140)"),"| ayarla düğmesi sekmede yok:",await E("!document.querySelector('[data-act=ultCmAyar]')"));
 await E("document.querySelector('[data-act=ultCmAc]').click();1");await pg.waitForTimeout(1500);console.log("LIG oda:",await E("(document.getElementById('ulCmOda')||{textContent:'ODA YOK'}).textContent.replace(/\\s+/g,' ').slice(0,160)"));await shot("lig-oda");
 await oyna("canlı:");await shot("lig-son");
 console.log("LIG --- 2: geç geldim (maç 70 sn önce başladı)");
 await E("S.sheet=null;ULT.run=null;__sifirla(-70);render(true);1");await pg.waitForTimeout(400);await E("ultCmAc('lig',__K);1");await oyna("geç gelen:");
 console.log("LIG --- 3: rakip gelmedi");
 await E("S.sheet=null;ULT.run=null;FS.bot.var=false;__sifirla(8);render(true);1");await pg.waitForTimeout(400);await E("ultCmAc('lig',__K);1");await oyna("rakipsiz:");
};
