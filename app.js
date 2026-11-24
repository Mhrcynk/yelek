(function(){
"use strict";
/* ================= Bağlantı ================= */
const SB_URL="https://tnjpxwxfqbhfxsphbqhq.supabase.co";
const SB_KEY="sb_publishable_ATJ8lPaPBzZEj-4k7Z5Ztw_YGevQCS3";
/* aktif takım: ?t=slug linkiyle gelinir, telefonda hatırlanır; 1 = Abiler Kardeşler */
let TID=(()=>{try{const s=localStorage.getItem("y_team");if(s!==null&&s!=="")return Math.max(0,+s||0);return localStorage.getItem("y_auth")?1:0}catch(_){return 0}})();
const teamHdr=()=>TID!==1?{"x-team":String(TID)}:{};
async function sbGet(path){const r=await fetch(SB_URL+"/rest/v1/"+path,{headers:{apikey:SB_KEY,Accept:"application/json",...teamHdr(),...authHdr()}});if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}
// süresi dolmuş oturum: tek bir yenileme isteği paylaşılır, istek bir kez tekrar denenir
let _refP=null;function refreshOnce(){if(!_refP)_refP=(async()=>{try{if(typeof AUTH!=="undefined"&&AUTH.sb){const{data}=await AUTH.sb.auth.refreshSession();if(data&&data.session){S.session=data.session;return true}}}catch(_){}return false})().finally(()=>setTimeout(()=>{_refP=null},3000));return _refP}
async function rpc(fn,args,_re){
  const r=await fetch(SB_URL+"/rest/v1/rpc/"+fn,{method:"POST",headers:{apikey:SB_KEY,"Content-Type":"application/json",Accept:"application/json",...teamHdr(),...authHdr()},body:JSON.stringify(args||{})});
  if(r.status===401&&!_re&&S.session&&await refreshOnce())return rpc(fn,args,true);
  let body=null;try{body=await r.json()}catch(_){}
  if(!r.ok)throw new Error((body&&body.message)||("HTTP "+r.status));return body;
}

/* ikonlar: uygulamada çift ton (çizgi + yumuşak dolgu), paylaşım görsellerinde çıkartma (beyaz kenarlı, hafif eğik).
   Her ikon [gövde yolu, ayrıntı yolu]; ikisi de 24×24 kutuda SVG yol verisi (tuvalde Path2D ile de çizilir). */
const DI={
  begen:["M7.5 10.5l3.7-6.3c.4-.7 1.3-1 2-.6 1.1.5 1.5 1.8 1.2 2.9L13.7 9.5h4.6a2 2 0 0 1 2 2.3l-1.2 6.9a2 2 0 0 1-2 1.7H7.5z","M3.5 10.5h4v9.8h-4z"],
  begenme:["M7.5 13.5l3.7 6.3c.4.7 1.3 1 2 .6 1.1-.5 1.5-1.8 1.2-2.9L13.7 14.5h4.6a2 2 0 0 0 2-2.3l-1.2-6.9a2 2 0 0 0-2-1.7H7.5z","M3.5 13.5h4V3.7h-4z"],
  yorum:["M5 4.5h14A2.5 2.5 0 0 1 21.5 7v8.5A2.5 2.5 0 0 1 19 18H10l-4.5 3.5V18H5a2.5 2.5 0 0 1-2.5-2.5V7A2.5 2.5 0 0 1 5 4.5z","M8 10h.01M12 10h.01M16 10h.01"],
  bilet:["M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5V9a3 3 0 0 0 0 6v1.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5V15a3 3 0 0 0 0-6z","M12 9l.95 1.9 2.1.3-1.5 1.5.35 2.1L12 13.8l-1.9 1 .35-2.1-1.5-1.5 2.1-.3z"],
  kombine:["M6 9.5A2 2 0 0 1 8 7.5h10a2 2 0 0 1 2 2v1a2.3 2.3 0 0 0 0 4.5v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-1a2.3 2.3 0 0 0 0-4.5z","M4 14.5V6.5a2 2 0 0 1 2-2h10M14 10v1.2M14 13.5v1.2"],
  skor12:["M5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9A2.5 2.5 0 0 1 5.5 5z","M12 5v14M7 10l1.5-1v6M15 9.5h2.5v2.5H15v3h2.5"],
  forma:["M8.5 3.5c0 1.9 1.6 3 3.5 3s3.5-1.1 3.5-3l4 2-1.5 4-2-.8V20.5h-8V8.7l-2 .8-1.5-4z","M10.3 12h3.4l-2.2 5"],
  tuttu:["M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5V9a3 3 0 0 0 0 6v1.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5V15a3 3 0 0 0 0-6z","M9 12.2l2.1 2.1L15.3 10"],
  yatti:["M4 7.5A2.5 2.5 0 0 1 6.5 5H11l1 2-1.5 2 1.5 2-1.5 2 1.5 2-1 2H6.5A2.5 2.5 0 0 1 4 16.5V15a3 3 0 0 0 0-6z","M14 5h3.5A2.5 2.5 0 0 1 20 7.5V9a3 3 0 0 0 0 6v1.5a2.5 2.5 0 0 1-2.5 2.5H14l1-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5-2z"],
  zil:["M12 3.5a6 6 0 0 1 6 6v4l1.8 2.5H4.2L6 13.5v-4a6 6 0 0 1 6-6z","M10 19.5a2.2 2.2 0 0 0 4 0"],
  podyum:["M9 9h6v11H9zM3 13h6v7H3zM15 15h6v5h-6z","M12 3.5l.7 1.4 1.5.2-1.1 1 .3 1.5-1.4-.7-1.4.7.3-1.5-1.1-1 1.5-.2z"],
  ampul:["M12 3a6 6 0 0 1 3.5 10.9V16h-7v-2.1A6 6 0 0 1 12 3z","M9.5 19h5M10.5 21.5h3M12 7v3.5"],
  top:["M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z","M12 8.2l3.4 2.4-1.3 3.9H9.9l-1.3-3.9zM12 3v5.2M15.4 10.6l4.8-1.6M14.1 14.5l2.9 4M9.9 14.5l-2.9 4M8.6 10.6L3.8 9"],
  kupa:["M7 4h10v5a5 5 0 0 1-10 0zM9 18h6v2.5H9z","M12 14v4M7 6H4.5a2.6 2.6 0 0 0 2.6 3M17 6h2.5a2.6 2.6 0 0 1-2.6 3"],
  kart:["M9 3h6a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3z","M9.5 7.5h2M9.5 17h5M12 10a2 2 0 1 0 0 4a2 2 0 0 0 0-4z"],
  takvim:["M7.5 5h9A3.5 3.5 0 0 1 20 8.5v8a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 16.5v-8A3.5 3.5 0 0 1 7.5 5z","M4 10h16M8 3v4M16 3v4"],
  yildiz:["M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z",""],
  yelek:["M8.5 3c0 2.2 1.5 4 3.5 4s3.5-1.8 3.5-4L18 4c0 2 .6 3.4 2 4.5V19a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5C5.4 7.4 6 6 6 4z","M9.5 13.5h5M9.5 16.5h3"],
  simsek:["M13.5 2.5L5.5 13.5h5l-1 8 8-11h-5z",""],
  kisi:["M12 4a4 4 0 1 0 0 8a4 4 0 0 0 0-8zM4.5 20.5c.6-4 3.6-6 7.500-6s6.9 2 7.5 6z",""],
  kalkan:["M12 3l7 2.5v5.500c0 4.5-3 8-7 10c-4-2-7-5.5-7-10V5.5z","M9 12l2.2 2.2L15.2 10"],
  hedef:["M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z","M12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10zM12 10.8a1.2 1.2 0 1 0 0 2.4a1.2 1.2 0 0 0 0-2.4z"],
  kale:["M4 7h16v12H4z","M9.3 7v12M14.7 7v12M4 13h16"],
  krampon:["M3 6.5h4.5c.4 2.5 2.1 4 4.5 4.6l6.5 1.6c1.8.5 3 1.9 3 3.7V17H3z","M3 17h18.5M6 17v2M10.5 17v2M15 17v2M19.5 17v2M9.7 8.4l1.6-1.3M12.2 9.7l1.6-1.3"],
  para:["M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18z","M12 7v10M14.6 9.6c-.5-1-1.500-1.600-2.600-1.600c-1.500 0-2.700.8-2.700 2c0 3 5.400 1.200 5.400 4.200c0 1.200-1.200 2-2.700 2c-1.200 0-2.200-.6-2.700-1.600"],
  grafik:["M4 13h4v7H4zM10 8h4v12h-4zM16 4h4v16h-4z",""],
  kalp:["M12 20.5C6 16.5 3.5 13.500 3.500 9.800A4.300 4.300 0 0 1 12 8a4.300 4.300 0 0 1 8.5 1.800c0 3.700-2.500 6.700-8.500 10.700z",""],
  degis:["","M5 9h13l-3-3M19 15H6l3 3"],
  kitap:["M5 4h9a4 4 0 0 1 4 4v12H8a3 3 0 0 1-3-3z","M9 9h5M9 13h5"],
  duduk:["M3 11.5a4.5 4.5 0 0 0 8.6 1.9L20 12V8.5h-9.3A4.5 4.5 0 0 0 3 11.5z","M7.5 10a1.5 1.5 0 1 0 0 3a1.5 1.5 0 0 0 0-3zM20 8.5V6.5"],
  eldiven:["M7 21v-6.5L4.5 11c-.8-1.1.6-2.4 1.6-1.6L7.5 11V5.5a1.5 1.5 0 0 1 3 0V10V4a1.5 1.5 0 0 1 3 0v6V5a1.5 1.5 0 0 1 3 0v6V7.5a1.5 1.5 0 0 1 3 0v7c0 3.5-2 6.5-5.5 6.5z","M7 18h9.5"],
  ates:["M12 21c-4 0-7-2.7-7-6.5 0-3.5 2.6-5.6 3.7-8.6.5 2 1.6 3 2.6 3.3C11.5 6.5 13 4 15.5 2.5c-.4 3 1 5 2.3 7 1 1.5 1.2 3 1.2 4.5 0 4-3 7-7 7z","M12 21c-1.8 0-3-1.3-3-3 0-2 1.5-2.8 2.2-4.5.8 1.2 1.4 1.2 1.8 1.4C14 16 15 17 15 18c0 1.7-1.3 3-3 3z"]};
const DC={red:"#FF6B8B",pink:"#FF3EA5",cyan:"#5FE3F5",gold:"#FFD400",green:"#00E58A",lila:"#B9A8FF",orange:"#FF8A3D",white:"#FFFFFF"};
// boş ekran ikonu: yumuşak halka içinde çift ton ikon
const empIc=(k,c)=>`<span class="emp-i" style="--c:${DC[c]||c}" aria-hidden="true">${dIcon(k,c,40)}</span>`;
function dIcon(k,c,sz){const d=DI[k];if(!d)return"";c=DC[c]||c||DC.lila;sz=sz||24;
  return `<svg class="di" width="${sz}" height="${sz}" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d[0]?`<path d="${d[0]}" fill="${c}" fill-opacity=".28" stroke="${c}" stroke-width="1.9"/>`:""}${d[1]?`<path d="${d[1]}" fill="none" stroke="${c}" stroke-width="1.9"/>`:""}</svg>`}
// çıkartma ikon (paylaşım görselleri)
function sIcon(k,c,sz,rot){const d=DI[k];if(!d)return"";c=DC[c]||c||DC.gold;sz=sz||28;rot=rot==null?-8:rot;const b=d[0]||d[1];
  return `<svg class="si" width="${sz}" height="${sz}" viewBox="-3 -3 30 30" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g transform="rotate(${rot} 12 12)"><path d="${b}" fill="#fff" stroke="#fff" stroke-width="5.5"/>${d[0]?`<path d="${d[0]}" fill="${c}" stroke="#120A2A" stroke-width="1.6"/>`:""}${d[1]?`<path d="${d[1]}" fill="none" stroke="#120A2A" stroke-width="1.6"/>`:""}</g></svg>`}
/* kullanım sayımı: kişi bilgisi olmadan hangi sekme/pencere/düğmenin kaç kez kullanıldığı (yönetici Ben > Kullanım'da görür) */
const USE={q:{},t:0,n:0};
function useHit(k){try{if(!TID||!/^[a-z]{2,8}:[a-zA-Z0-9_]{1,24}$/.test(k))return;USE.q[k]=(USE.q[k]||0)+1;USE.n++;clearTimeout(USE.t);USE.t=setTimeout(useFlush,USE.n>30?1000:20000)}catch(_){}}
function useFlush(){const q=USE.q;if(!Object.keys(q).length)return;USE.q={};USE.n=0;
  try{fetch(SB_URL+"/rest/v1/rpc/usage_hit",{method:"POST",keepalive:true,headers:{apikey:SB_KEY,"Content-Type":"application/json",...teamHdr(),...authHdr()},body:JSON.stringify({p_hits:q})}).catch(()=>{})}catch(_){}}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="hidden")useFlush()});
/* hata kaydı: beklenmeyen hatalar platform sahibine görünür (oturum başına en çok 5, aynısı bir kez) */
const ERRS=new Set();
function logErr(msg,src,stack){try{msg=String(msg||"").slice(0,300);if(!msg||ERRS.size>=5||ERRS.has(msg))return;
  if(/Script error|ResizeObserver|Load failed|Failed to fetch|NetworkError|AbortError|HTTP 5\d\d|HTTP 401/i.test(msg))return;ERRS.add(msg);
  let tab="";try{tab=S.tab+(S.sheet?"/"+S.sheet.type:"")+(S.f&&S.f.setp?"/"+S.f.setp:"")}catch(_){}
  rpc("log_error",{p_msg:msg,p_src:String(src||"").slice(0,200),p_stack:String(stack||"").slice(0,1500),p_ver:String(typeof APP_V==="string"?APP_V:""),p_tab:tab}).catch(()=>{})}catch(_){}}
window.addEventListener("error",e=>logErr(e.message,String(e.filename||"").split("/").pop()+":"+e.lineno+":"+e.colno,e.error&&e.error.stack));
window.addEventListener("unhandledrejection",e=>{const r=e.reason;logErr((r&&r.message)||String(r),"promise",r&&r.stack)});

/* görünüm: mor tasarım tek tema, her zaman koyu */
function themeApply(){document.documentElement.classList.add("dk")}

/* ================= Sabitler ================= */
const STATUS={hazir:{label:"Hazır",cls:"ok"},sakat:{label:"Sakat",cls:"bad",flag:"SAKAT"},hasta:{label:"Hasta",cls:"bad",flag:"HASTA"},
  izinli:{label:"İzinde / şehir dışı",cls:"info",flag:"İZİNDE"},yogun:{label:"İş yoğun",cls:"warn",flag:"YOĞUN"},belirsiz:{label:"Belirsiz",cls:"muted",flag:"?"}};
const UNAVAIL=["sakat","hasta","izinli","yogun"];
const POS={"Kaleci":"KL","Defans":"DF","Orta saha":"OS","Forvet":"FV"};
const POS_KEYS=Object.keys(POS);
const EPOS={KL:["KL","Kaleci"],STP:["DF","Stoper"],"SĞB":["DF","Sağ bek"],SLB:["DF","Sol bek"],DOS:["OS","Defansif orta saha"],MO:["OS","Merkez orta saha"],MOO:["OS","Ofansif orta saha"],"SĞO":["OS","Sağ orta saha"],SLO:["OS","Sol orta saha"],"SĞK":["FV","Sağ kanat"],SLK:["FV","Sol kanat"],SNT:["FV","Santrafor"]};
const EPOS_KEYS=Object.keys(EPOS);
const POS_ORDER={KL:0,STP:1,"SĞB":2,SLB:3,DOS:4,MO:5,"SĞO":6,SLO:7,MOO:8,"SĞK":9,SLK:10,SNT:11};
const byPos=(a,b)=>{const pa=P(a),pb=P(b);return (POS_ORDER[eposOf(pa)]??99)-(POS_ORDER[eposOf(pb)]??99)||genOf(b)-genOf(a)};
const GROUP_POS={KL:"Kaleci",DF:"Defans",OS:"Orta saha",FV:"Forvet"};
const DEF_EPOS={"Kaleci":"KL","Defans":"STP","Orta saha":"MO","Forvet":"SNT"};
const ROLE_NAME={KL:"Kaleci",DF:"Defans",OS:"Orta saha",FV:"Forvet"};

const ATTR_OUT=[["hiz","HIZ","Hız",[["acc","Hızlanma"],["spr","Sprint hızı"]]],["sut","ŞUT","Şut",[["bit","Bitiricilik"],["guc","Şut gücü"],["poz","Pozisyon alma"]]],
  ["pas","PAS","Pas",[["kis","Kısa pas"],["uzn","Uzun pas"],["viz","Vizyon"]]],["dri","DRİ","Top sürme",[["kon","Top kontrolü"],["sur","Top sürme"],["cev","Çeviklik"]]],
  ["def","DEF","Savunma",[["kes","Top kesme"],["bil","Savunma bilinci"],["mud","Ayakta müdahale"]]],["fiz","FİZ","Fizik",[["day","Dayanıklılık"],["guc","Güç"],["agr","Agresiflik"]]]];
const ATTR_GK=[["dal","PLO","Plonjon",[["uza","Uzanma"],["kos","Köşe kurtarışı"]]],["ref","REF","Refleks",[["ref","Refleks"],["yak","Yakın mesafe kurtarışı"]]],
  ["ell","ELL","Elle oyun",[["tut","Top tutma"],["bas","Elle oyun başlatma"]]],["ayk","AYK","Ayakla oyun",[["pas","Ayakla pas"],["deg","Uzun degaj"]]],
  ["poz","POZ","Pozisyon alma",[["yer","Yer tutma"],["bir","Bire birde çıkış"]]],["hiz","HIZ","Hız",[["acc","Hızlanma"],["cab","Çabukluk"]]]];
const attrSet=pos=>pos==="Kaleci"?ATTR_GK:ATTR_OUT;
const subVal=(a,k,sk)=>clamp(Math.round(+a[k+"_"+sk]||+a[k]||65),30,99);
// yuvarlama yok: küsürat atılır (74,99 → 74); hesaplar her zaman küsüratlı değerle yapılır
const flo=v=>Math.floor(v+1e-9);
const mainX=(a,k,pos)=>{const d=attrSet(pos).find(x=>x[0]===k);if(!d)return +a[k]||65;return d[3].reduce((s,[sk])=>s+subVal(a,k,sk),0)/d[3].length};
const mainVal=(a,k,pos)=>flo(mainX(a,k,pos));
const W={KL:{ref:.25,dal:.22,poz:.22,ell:.15,ayk:.08,hiz:.08},
  SNT:{hiz:.2,sut:.35,pas:.1,dri:.2,def:0,fiz:.15},"SĞK":{hiz:.3,sut:.2,pas:.15,dri:.3,def:0,fiz:.05},
  MOO:{hiz:.1,sut:.2,pas:.3,dri:.3,def:.02,fiz:.08},MO:{hiz:.08,sut:.1,pas:.32,dri:.25,def:.1,fiz:.15},DOS:{hiz:.05,sut:.03,pas:.25,dri:.12,def:.35,fiz:.2},
  "SĞO":{hiz:.25,sut:.1,pas:.25,dri:.25,def:.05,fiz:.1},STP:{hiz:.1,sut:0,pas:.1,dri:.05,def:.5,fiz:.25},"SĞB":{hiz:.25,sut:0,pas:.15,dri:.1,def:.35,fiz:.15}};
W.SLK=W["SĞK"];W.SLO=W["SĞO"];W.SLB=W["SĞB"];
const TEAM={A:"Yelekliler",B:"Yeleksizler"};
const nmOf=(m,k)=>cleanName((m&&m["name_"+k.toLowerCase()])||"")||TEAM[k];
function inM(m,f){const a=TEAM.A,b=TEAM.B;TEAM.A=nmOf(m,"A");TEAM.B=nmOf(m,"B");try{return f()}finally{TEAM.A=a;TEAM.B=b}}
const cleanName=v=>String(v||"").replace(/[<>&"'`]/g,"").trim().slice(0,20);
const TEAM_SIZE=7,CAP=14;
const FORMS={
  "2-3-1":{slots:[[50,7,"KL"],[30,27,"DF"],[70,27,"DF"],[17,55,"OS"],[50,51,"OS"],[83,55,"OS"],[50,83,"FV"]],d:"Dengeli, en çok oynanan düzen"},
  "3-2-1":{slots:[[50,7,"KL"],[20,28,"DF"],[50,23,"DF"],[80,28,"DF"],[32,56,"OS"],[68,56,"OS"],[50,83,"FV"]],d:"Sağlam savunma, kontra atak"},
  "2-1-2-1":{slots:[[50,7,"KL"],[30,25,"DF"],[70,25,"DF"],[50,43,"OS"],[20,63,"OS"],[80,63,"OS"],[50,85,"FV"]],d:"Elmas orta saha, pas oyunu"},
  "2-2-2":{slots:[[50,7,"KL"],[30,27,"DF"],[70,27,"DF"],[30,55,"OS"],[70,55,"OS"],[33,82,"FV"],[67,82,"FV"]],d:"Kanatlardan çift forvet"},
  "3-1-2":{slots:[[50,7,"KL"],[20,28,"DF"],[50,23,"DF"],[80,28,"DF"],[50,51,"OS"],[32,80,"FV"],[68,80,"FV"]],d:"Arkada üç stoper, önde iki golcü"},
  "1-3-2":{slots:[[50,7,"KL"],[50,25,"DF"],[17,52,"OS"],[50,49,"OS"],[83,52,"OS"],[33,80,"FV"],[67,80,"FV"]],d:"Tek libero, hücum ağırlıklı"},
  "3-3":{slots:[[50,7,"KL"],[20,29,"DF"],[50,25,"DF"],[80,29,"DF"],[20,72,"FV"],[50,78,"FV"],[80,72,"FV"]],d:"İki sıra, basit ve net"}
};
const NOTE={base:6,esik:6.5,esikAdim:.12,kat:.25,katMax:.6,min:1,max:10,motm:.6,fiy:-.6,kk:-1,
  // yöneticinin maç değerlendirmesi (kontenjan yok, kalecide daha ağır) ve özel olaylar (forvetin o maçtaki gol değerine göre)
  penGol:.5,penKurtar:1,penKL:.5,perf:[null,[1.5,"Çok iyi"],[.6,"İyi"],[0,"Orta"],[-.8,"Kötü"]],perfKL:[null,2,.8,0,-1],perfQ:[3,4,4,3],cizgi:1,penalti:-.5,
  // skor farkına göre sonuç ve gol/asist değeri: [en fazla fark, kazanan, kaybeden, gol çarpanı (kazanan), gol çarpanı (kaybeden), ad]
  fark:[[0,0,0,1,1,"Beraberlik"],[2,.3,-.3,1,1,"Çekişmeli maç"],[5,.45,-.45,1,1,"Net maç"],[999,.6,-.6,1,1,"Farklı maç"]],fiyKotu:.5,tavan:8.5,tavanK:.5,bantK:.25,
  gol:{KL:2,DF:1,DOS:1,OS:.8,FV:.6},asist:{KL:1.2,DF:.7,DOS:.6,OS:.5,FV:.4},tamGol:3,
  // yenilen gol, grubun maç başı ortalamasına göre: [ortalamadan en fazla şu kadar fazla, puanlar]
  savunma:[[-3,{KL:1.6,DF:1.3,DOS:.8}],[-1,{KL:1,DF:.8,DOS:.5}],[1,{KL:.3,DF:.2,DOS:.1}],[3,{KL:-.3,DF:-.3,DOS:-.1}],[999,{KL:-.8,DF:-.7,DOS:-.4}]],gyOrt:7,gyOnc:4,bos:{OS:-.3,FV:-.7},
  // kart seviyesi: iyi oyuncu iyi oynamış sayılır (başlangıç notu), zayıf oyuncunun artıları çarpanla daha çok sayılır
  // azalan getiri: 1-3. gol tam, 4-5. ×0,6, 6+ ×0,3 · alternatif forvet ×0,7
  golAz:[3,2,.6,.3],altFV:.7,golRef:12,golF:{min:.7,max:1.15},orta:7,bant:[[5.6,7.6],[7.4,10],[6.6,8.8],[5.6,7.6],[4.8,6.4]],ref:74,seviye:{adim:.15,min:5,max:7.5,esikKay:.75},carpan:{alt:.04,ust:.03,min:.7,max:1.4}};
const EXK=["pen","cl","pm","ps"];const EXL={pen:"Penaltı yaptıran",cl:"Çizgiden çıkaran",pm:"Penaltı kaçıran",ps:"Penaltı kurtaran"};
const exFrom=st=>{const o={perf:{}};EXK.forEach(k=>o[k]={});for(const[id,x]of Object.entries(st||{})){if(+x?.k)o.perf[id]=+x.k;EXK.forEach(k=>{if(+x?.[k])o[k][id]=+x[k]})}return o};
const perfQuota=n=>{const b=NOTE.perfQ,t=b.reduce((a,x)=>a+x,0);const q=b.map(x=>Math.floor(x*n/t));let r=n-q.reduce((a,x)=>a+x,0);for(const i of[1,2,0,3]){if(r<=0)break;q[i]++;r--}return q};
const lvBase=lv=>clamp(Math.round((NOTE.base+(lv-NOTE.ref)*NOTE.seviye.adim)*100)/100,NOTE.seviye.min,NOTE.seviye.max);
// kartın yükselmesi için gereken not: başlangıç notuyla birlikte kayar (iyi oyuncu sessiz maçta şişmez, zayıf oyuncu çok düşmez)
const lvEsik=lv=>Math.round((NOTE.esik+(lv-NOTE.ref)*NOTE.esikAdim)*1000)/1000;
const lvMul=lv=>1;const lvMulOld=lv=>Math.round(clamp(lv<NOTE.ref?1+(NOTE.ref-lv)*NOTE.carpan.alt:1-(lv-NOTE.ref)*NOTE.carpan.ust,NOTE.carpan.min,NOTE.carpan.max)*100)/100;
const fN=x=>x==null?"–":(Math.round(x*10)/10).toFixed(1).replace(".",",");
const AYLAR=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const GUNLER=["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"];
const DEF_SET={group_name:"Takım",field_name:"",day:2,time:"21:00"};
const TABS=[["gecmis","Fikstür","gecmis"],["lig","Lig","lig"],["mac","Maç","mac"],["kartlar","Oyuncular","kart"],["iddia","Tahmin","iddia"]];
// Alt bar: haftanın akışına göre dört sekme. Fikstür ve istatistik Lig'in, tahmin Bu hafta'nın içinde.
const NAV=[["mac","Bu hafta","mac"],["lig","Lig","lig"],["kartlar","Kartlar","kart"],["ben","Ben","ben"]];
const navOf=t=>t==="iddia"?"mac":(t==="gecmis"||t==="sezon"||t==="saha")?"lig":(t==="kurallar"||t==="ayarlar")?"ben":t;

const sv=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON_GRID='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>',ICON_LIST='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2" fill="currentColor"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor"/><circle cx="4.5" cy="18" r="1.2" fill="currentColor"/></svg>',ICON_DOTS='<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',ICON_SRCH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',ICON={
  mac:sv('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 5v14"/><circle cx="12" cy="12" r="2.5"/>'),
  gecmis:sv('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h6"/>'),
  kart:sv('<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M9 16h6"/><path d="m12 6.5 1.1 2.2 2.4.3-1.7 1.7.4 2.4-2.2-1.1-2.2 1.1.4-2.4-1.7-1.7 2.4-.3z"/>'),
  sezon:sv('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/>'),
  kural:sv('<path d="M6 4h10a3 3 0 0 1 3 3v13H9a3 3 0 0 1-3-3z"/><path d="M10 9h5M10 13h5"/>'),
  iddia:sv('<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5V9a3 3 0 0 0 0 6v1.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5V15a3 3 0 0 0 0-6z"/><path d="M12 9l.95 1.9 2.1.3-1.5 1.5.35 2.1L12 13.8l-1.9 1 .35-2.1-1.5-1.5 2.1-.3z"/>'),
  ben:sv('<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/>'),
  ayar:sv('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'),
  check:sv('<path d="m5 12.5 4.5 4.5L19 7"/>'),
  clock:sv('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 1.5"/>'),
  x:sv('<path d="M7 7l10 10M17 7 7 17"/>'),
  plus:sv('<path d="M12 5v14M5 12h14"/>'),
  copy:sv('<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>'),
  scale:sv('<path d="M12 4v16M6 20h12M5 8h14"/><path d="M5 8l-2.5 6a2.5 2.5 0 0 0 5 0zM19 8l-2.5 6a2.5 2.5 0 0 0 5 0z"/>'),
  flip:sv('<circle cx="12" cy="12" r="8"/><path d="M12 4v16M8.5 9h7M8.5 15h7"/>'),
  hand:sv('<path d="M8 13V6a1.5 1.5 0 0 1 3 0v5M11 11V4.5a1.5 1.5 0 0 1 3 0V11M14 11V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6 6 6 0 0 1-5-2.7L3.6 13.6a1.5 1.5 0 0 1 2.5-1.7L8 14"/>'),
  back:sv('<path d="M15 6l-6 6 6 6"/>'),
  pin:sv('<path d="M12 21s-6-5.5-6-11a6 6 0 0 1 12 0c0 5.5-6 11-6 11z"/><circle cx="12" cy="10" r="2"/>'),
  share:sv('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"/>'),
  wa:sv('<path d="M4 20l1.3-4A8 8 0 1 1 8 18.7z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z"/>')
};

/* ================= Durum ================= */
const LS={get(k){try{return localStorage.getItem(k)||""}catch(_){return""}},set(k,v){try{localStorage.setItem(k,v)}catch(_){}},del(k){try{localStorage.removeItem(k)}catch(_){}}};
const S={all:[],players:[],matches:[],settings:{...DEF_SET},seasonVotes:[],me:LS.get("y_me"),pin:LS.get("y_pin"),admin:false,
  tab:"mac",sheet:null,guests:[],photos:{},pv:"",teams:null,draft:null,stats:{},mInfo:{},view:null,f:{},loaded:false,err:null,pending:false,filter:"all"};
S.admin=false;S.pin="";LS.del("y_pin");
{const old={hafta:"mac",oyuncular:"kartlar",kurallar:"ayarlar"};let t=LS.get("y_tab");t=old[t]||t;if(TABS.some(x=>x[0]===t)||t==="ben")S.tab=t;
 S._route=location.hash.slice(1);S._r0=S._route;S._r0t=Date.now();routeTab(S._route,old)}

/* ================= Yardımcılar ================= */
const $=s=>document.querySelector(s);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const up=s=>String(s||"").toLocaleUpperCase("tr-TR");
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const pad=n=>String(n).padStart(2,"0");
const ymd=d=>d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());
const parseYmd=s=>{const[y,m,d]=String(s).split("-").map(Number);return new Date(y,(m||1)-1,d||1)};
/* sezonlar: her N bitmiş iç maç bir sezon; sezon numarası maç bitince veritabanında yazılır */
const sLen=()=>Math.max(2,+S.settings.season_len||8);
const seasonsAll=()=>{const st=new Set(fin().map(m=>+m.season||0).filter(Boolean));return[...st].sort((a,b)=>a-b)};
const curYr=()=>{const L=seasonsAll();return L.length?L[L.length-1]:1};
const seasonCount=n=>fin().filter(m=>+m.season===n).length;
const seasonDone=n=>seasonCount(n)>=sLen()||n<=(+S.settings.season_closed||0);
const seasonStart=n=>{const F=fin().filter(m=>+m.season===n);return F.length?matchTs(F[0]):Infinity};
const yrOf=m=>{if(+m.season)return +m.season;const t=matchTs(m);const L=seasonsAll();let r=L[0]||1;for(const n of L)if(seasonStart(n)<=t)r=n;return r};
const selYr=()=>S.yr??curYr();
const yrList=()=>[...seasonsAll()].reverse().concat(seasonsAll().length?[]:[1]);
const inYr=m=>{const y=selYr();return y==="all"||yrOf(m)===y};
const reigningChamp=()=>{const L=seasonsAll().filter(seasonDone);if(!L.length)return null;const n=L[L.length-1];const T=ligTable(fin().filter(m=>+m.season===n));return T[0]?.id||null};
const GKISA=["PAZ","PZT","SAL","ÇAR","PER","CUM","CMT"];
// fotoğrafı olmayan oyuncu için sade silüet
const SILH='<svg class="sil" viewBox="0 0 64 80" aria-hidden="true"><circle cx="32" cy="27" r="14" fill="currentColor"/><path d="M6 80c1-16 12-26 26-26s25 10 26 26z" fill="currentColor"/></svg>';
const fmtDate=s=>{const d=parseYmd(s);return d.getDate()+" "+AYLAR[d.getMonth()]+" "+GUNLER[d.getDay()]};
const fmtShort=s=>{const d=parseYmd(s);return d.getDate()+" "+AYLAR[d.getMonth()].slice(0,3)};
const matchTs=m=>{const d=parseYmd(m.date);const[h,mi]=String(m.time||"21:00").split(":").map(Number);d.setHours(h||0,mi||0,0,0);return d.getTime()};
const nextDay=dow=>{const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()+((dow-d.getDay()+7)%7));return ymd(d)};
const P=id=>S.all.find(p=>p.id===id);
const nameOf=id=>P(id)?.name||"Eski oyuncu";
const eposOf=p=>EPOS[p?.epos]?p.epos:(DEF_EPOS[p?.pos]||"MO");
const altOf=p=>EPOS[p?.alt_pos]&&p.alt_pos!==eposOf(p)?p.alt_pos:"";
const posOf=p=>p&&EPOS[p.epos]?EPOS[p.epos][0]:(POS[p?.pos]||"OS");
const posLabel=p=>eposOf(p)+(altOf(p)?" / "+altOf(p):"");
const stOf=p=>(p&&p.status&&STATUS[p.status.type])?p.status.type:"hazir";
const initials=n=>String(n||"?").trim().split(/\s+/).map(x=>x[0]||"").join("").slice(0,2).toLocaleUpperCase("tr-TR");
const shortName=n=>{const a=String(n||"").trim().split(/\s+/);return a.length>1?a[0]+" "+a[a.length-1][0]+".":a[0]};
const firstName=n=>String(n||"").trim().split(/\s+/)[0];
function toast(msg){const t=$("#toast");t.textContent=msg;t.hidden=false;clearTimeout(toast.h);toast.h=setTimeout(()=>t.hidden=true,2800)}
const isExt=m=>m.kind==="dis";
// oyuncu oylaması: maç başlangıçtan 1 saat sonra bitmiş sayılır, oylama açılır; yönetici kapatınca notlar kesinleşir
const vOn=m=>!!m&&!!m.vote_on&&!isExt(m);
const vPend=m=>vOn(m)&&!m.vote_closed_at;
const mEnded=m=>!!m&&m.state!=="kayit"&&Date.now()>=matchTs(m)+36e5;
const mDone=m=>m.state==="bitti"&&!vPend(m);
// oylama, yönetici skoru girip maçı bitirince açılır (maç saatine göre değil)
const vOpen=m=>!!m&&vPend(m)&&m.state==="bitti"&&m.score_a!=null&&m.score_b!=null;
const VL=["Çok iyi","İyi","Orta","Kötü"];
const fin=()=>S.matches.filter(m=>mDone(m)&&!isExt(m)).sort((a,b)=>matchTs(a)-matchTs(b));
const extFin=()=>S.matches.filter(m=>isExt(m)).sort((a,b)=>matchTs(a)-matchTs(b));
const sideOf=(m,pid)=>(m.team_a||[]).includes(pid)?"A":(m.team_b||[]).includes(pid)?"B":null;
/* sahaya çıkan taraf: yedekte kalan oynamamış sayılır */
const playSide=(m,pid)=>plOf(m,"A").includes(pid)?"A":plOf(m,"B").includes(pid)?"B":null;
const lineupOf=(m,k)=>(k==="A"?m.lineup_a:m.lineup_b)||[];
// maçta sahaya çıkanlar: son dizilişteki oyuncular (kadroda olup dizilişte olmayan yedek kulübesi sayılır)
const plOf=(m,k)=>{const T=(k==="A"?m.team_a:m.team_b)||[];if(isExt(m))return T;const L=lineupOf(m,k).filter(id=>id&&T.includes(id));return L.length?L:T};
const plAll=m=>[...plOf(m,"A"),...plOf(m,"B")];
const formOf=(m,k)=>FORMS[k==="A"?m.form_a:m.form_b]?(k==="A"?m.form_a:m.form_b):"2-3-1";
function roleIn(m,pid,side){
  const L=lineupOf(m,side);const i=L.indexOf(pid);if(i===0)return"KL";
  const PS=side==="A"?m.pos_a:m.pos_b;if(i>0&&PS&&PS.length===TEAM_SIZE&&PS[i])return PS[i][2];
  const F=FORMS[side==="A"?m.form_a:m.form_b];if(i>0&&F&&F.slots[i])return F.slots[i][2];
  const p=posOf(P(pid));return p==="KL"?"DF":p;
}
const hash=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))|0;return Math.abs(h)};
function cdText(ts){const ms=ts-Date.now();if(ms<=-2*36e5)return null;if(ms<=0)return{live:1,t:"Maç oynanıyor"};if(ms>864e5){const a=new Date(ts);a.setHours(0,0,0,0);const n=new Date();n.setHours(0,0,0,0);return{day:1,t:Math.max(1,Math.round((a-n)/864e5))+" gün"}}
  const sec=Math.floor(ms/1e3);return{t:pad(Math.floor(sec/3600))+":"+pad(Math.floor(sec%3600/60))+":"+pad(sec%60)}}
function cdClock(m){const ts=matchTs(m),i=cdText(ts);
  return `<div class="clk" id="cdClk" data-ts="${ts}"${i?"":" hidden"} role="timer" aria-label="Maça kalan süre"><span class="eyebrow">${i&&i.live?"Canlı":"Maça kalan süre"}</span><b class="num${i&&i.day?" day":""}">${i?i.t:""}</b></div>`}
function tickCd(){const el=document.getElementById("cdClk");if(!el)return;const i=cdText(+el.dataset.ts);el.hidden=!i;if(!i)return;
  const b=el.querySelector("b");if(b.textContent!==i.t)b.textContent=i.t;el.classList.toggle("live",!!i.live);b.classList.toggle("day",!!i.day);el.querySelector(".eyebrow").textContent=i.live?"Canlı":"Maça kalan süre"}
/* afiş etiketi: 24 saatten uzaksa gün, son 24 saatte canlı geri sayım, başlayınca CANLI */
function tkCd(ts,dayTxt){const ms=ts-Date.now();if(ms<=0&&ms>-2*36e5)return `<em class="tkcd live" data-cd="${ts}">CANLI</em>`;
  if(ms>0&&ms<=864e5)return `<em class="tkcd num" data-cd="${ts}" role="timer" aria-label="Maça kalan süre">${cdText(ts).t}</em>`;return `<em>${dayTxt}</em>`}
function cdLabel(ts,dayTxt){const ms=ts-Date.now();if(ms<=0&&ms>-2*36e5)return `<span class="mafcd live" data-cd="${ts}">CANLI</span>`;
  if(ms>0&&ms<=864e5)return `<span class="mafcd num" data-cd="${ts}" role="timer" aria-label="Maça kalan süre">${cdText(ts).t}</span>`;return dayTxt?`<span>${dayTxt}</span>`:""}
function tickCd2(){document.querySelectorAll("[data-cd]").forEach(el=>{const ts=+el.dataset.cd,ms=ts-Date.now();
  if(ms<=0){if(ms>-2*36e5){if(el.textContent!=="CANLI"){el.textContent="CANLI";el.classList.add("live");el.classList.remove("num")}}else el.textContent="";return}
  const t=cdText(ts);if(t&&!t.day&&el.textContent!==t.t)el.textContent=t.t})}
setInterval(()=>{tickCd();tickCd2()},1000);

/* ================= Puanlama ================= */
function topVote(m,key){const t={};for(const v of Object.values(m.votes||{})){const id=v&&v[key];if(id)t[id]=(t[id]||0)+1}
  const e=Object.entries(t).sort((a,b)=>b[1]-a[1]);if(!e.length)return null;if(e[1]&&e[1][1]===e[0][1])return null;return e[0][0]}
const golEff=x=>{const[a,b,c,d]=NOTE.golAz;return Math.min(x,a)+c*Math.min(Math.max(x-a,0),b)+d*Math.max(x-a-b,0)};
function matchPoints(m,pid,motmId,golId,fiyId,lvIn){
  const side=sideOf(m,pid);if(!side)return null;const role=roleIn(m,pid,side);const st=(m.stats||{})[pid]||{};const pp=P(pid);
  const my=side==="A"?+m.score_a||0:+m.score_b||0,op=side==="A"?+m.score_b||0:+m.score_a||0;
  const altFV=pp&&posOf(pp)!=="FV"&&altOf(pp)&&EPOS[altOf(pp)][0]==="FV";
  // DOS kuralı yalnızca savunma karakterli DOS için; alternatifi forvet olan DOS orta saha sayılır
  const nr=role==="OS"&&pp&&eposOf(pp)==="DOS"&&!altFV?"DOS":role;
  // bol gollü maçta orta saha ve forvetin gol/asist değeri düşer: 10 gollü maç = ×1; 15 gol ×0,67; 5 gol ×1,2
  const gAll=Math.round(clamp(NOTE.golRef/Math.max(my+op,1),NOTE.golF.min,NOTE.golF.max)*100)/100;const gf=nr==="OS"||nr==="FV"?gAll:1;
  // alternatif pozisyonu forvet olan (kartı forvet değil) oyuncuda gol/asist etkisi yarı
  const gaF=1;
  const lv=lvIn!=null?lvIn:pp&&S.stats?.[pid]?genOf(pid):pp?baseOf(pp):NOTE.ref;const mul=lvMul(lv);
  const parts=[];let sum=0;const add=(l,v,x)=>{if(x&&v>0)v*=mul;v=Math.round(v*100)/100;if(v){parts.push([l,v]);sum+=v}};
  const g=+st.g||0,a=+st.a||0,og=+st.og||0;
  const df=Math.abs(my-op),fk=NOTE.fark.find(x=>df<=x[0]),won=my>op;const tf=won||!df?fk[3]:fk[4];
  add(!df?"Beraberlik":(won?"Galibiyet":"Yenilgi")+` (${df} fark)`,!df?0:won?fk[1]:fk[2]);
  const pg=Math.min(+st.pg||0,g),gE=g-pg*(1-NOTE.penGol);add(g+" gol"+(pg?` (${pg} penaltı)`:""),golEff(gE)*NOTE.gol[nr]*gaF*gf*tf,1);add(a+" asist",a*NOTE.asist[nr]*gaF*gf*tf,1);
  if(!g&&!a)add("Gol/asist yok",NOTE.bos[nr]||0);
  const fvG=NOTE.gol.FV*gAll,cl=+st.cl||0,pen=+st.pen||0,pk=+st.k||0;
  if(cl)add(cl>1?cl+" kez çizgiden çıkardı":"Çizgiden çıkardı",cl*fvG*NOTE.cizgi,1);
  const pm=+st.pm||0,ps=+st.ps||0;
  if(pm)add(pm>1?pm+" penaltı kaçırdı":"Penaltı kaçırdı",-pm*NOTE.gol[nr]*NOTE.penGol*gaF*gf*tf);
  if(ps)add(ps>1?ps+" penaltı kurtardı":"Penaltı kurtardı",ps*fvG*NOTE.penKurtar,1);
  if(pen)add(pen>1?pen+" penaltı yaptırdı":"Penaltı yaptırdı",pen*fvG*NOTE.penalti);
  if(NOTE.perf[pk])add(NOTE.perf[pk][1]+" oynadı",nr==="KL"?NOTE.perfKL[pk]:NOTE.perf[pk][0]);
  // kalecide rakibin penaltı golleri yarım gol sayılır
  const opPen=nr==="KL"?plOf(m,side==="A"?"B":"A").reduce((q,id)=>{const o=(m.stats||{})[id]||{};return q+Math.min(+o.pg||0,+o.g||0)},0):0;const opE=op-opPen*(1-NOTE.penKL);
  const gyO=gyOrt(),opR=opE-gyO;if(NOTE.savunma[0][1][nr]!=null)for(const[lim,v]of NOTE.savunma){if(opR<=lim){add((op===0?"Gol yemedi":op+" gol yediler"+(opPen?` (${opPen} penaltı)`:""))+` · ort. ${fN(gyO)}`,v[nr],1);break}}
  add("Kendi kalesine",og*NOTE.kk);add("Maçın Adamı",motmId===pid?NOTE.motm:0,1);add("Fiyasko",fiyId&&fiyId===pid?NOTE.fiy*(pk===4?NOTE.fiyKotu:1):0);
  const raw=NOTE.base+sum;const pts=clamp(Math.round((raw>NOTE.tavan?NOTE.tavan+(raw-NOTE.tavan)*NOTE.tavanK:raw)*10)/10,NOTE.min,NOTE.max);
  return{pts,raw,parts,lv,mul,gf:Math.round(gf*tf*100)/100,mt:fk[5],pk,role,nr,g,a,res:my>op?"G":my<op?"M":"B",side,op};
}
// maçın gol ortalaması (takım başına): tüm bitmiş maçlardan, az maçta 7'ye yaslanır
function gyOrt(){const F=S.matches.filter(m=>mDone(m)&&!isExt(m));let t=0;for(const m of F)t+=(+m.score_a||0)+(+m.score_b||0);
  return Math.round((t+NOTE.gyOrt*NOTE.gyOnc)/(F.length*2+NOTE.gyOnc)*10)/10}
// maç içi denge: maçın not ortalaması 7'ye oturur, değerlendirme notun aralığını belirler, eşik maçın ortalama kart seviyesine göre
/* ===== Akıllı Saha verileri (isteğe bağlı, yönetici girer) =====
   Değerlendirme aynı maçta verisi girilen oyuncuların birbirine göre durumudur; en az 4 oyuncu gerekir. */
const TRK=[["rt","Reyting","",1],["km","Koşu mesafesi","km",1],["pas","Toplam pas","",0],["hiz","Maks hız","km/s",1],["spr","Sprint","",0],["isa","Pas isabeti","%",0],["tk","Top kapma","",0],["pa","Pas arası","",0],["dri","Dripling","",0],["pp","Progresif pas","",0],["pt","Progresif taşıma","",0]];
const TRKN=Object.fromEntries(TRK.map(([k,l,u])=>[k,{l,u}]));
const TRK_W={FV:{pt:.3,dri:.3,spr:.2,hiz:.2},OS:{pas:.2,isa:.2,pp:.25,km:.2,pa:.15},DF:{tk:.35,pa:.3,isa:.2,hiz:.15},KL:{isa:1}};
const TRK_MIN=4,TRK_CAP=1,TRK_K=.6;
const trkOf=(m,id)=>{const t=m&&m.track&&m.track[id];return t&&typeof t==="object"&&Object.keys(t).length?t:null};
const trkHas=m=>!!(m&&m.track&&Object.keys(m.track).length);
function trkCtx(m){if(!trkHas(m))return null;const pl=plAll(m).filter(id=>trkOf(m,id));if(pl.length<TRK_MIN)return null;const st={};
  for(const[k]of TRK){const v=pl.filter(id=>{const t=trkOf(m,id);return t[k]!=null&&isFinite(t[k])&&(k!=="isa"||(t.pas??10)>=5)}).map(id=>+trkOf(m,id)[k]);
    if(v.length<TRK_MIN)continue;const mean=v.reduce((a,b)=>a+b,0)/v.length;const sd=Math.sqrt(v.reduce((a,b)=>a+(b-mean)**2,0)/v.length);st[k]={mean,sd:Math.max(sd,mean*.08,.5)}}
  return{ids:pl,st}}
// maç ortalamasına göre sapma (−2…+2)
function trkDev(m,id,ctx){const t=trkOf(m,id);if(!t||!ctx)return null;const d={};for(const[k]of TRK){const s=ctx.st[k];if(!s||t[k]==null)continue;if(k==="isa"&&(t.pas??10)<5)continue;d[k]=clamp((+t[k]-s.mean)/s.sd,-2,2)}return Object.keys(d).length?d:null}
function trkBonus(role,dev){const w=TRK_W[role]||TRK_W.OS;let s=0,tw=0;for(const[k,x]of Object.entries(w))if(dev[k]!=null){s+=x*dev[k];tw+=x}if(!tw)return 0;return Math.round(clamp(s/tw*TRK_K,-TRK_CAP,TRK_CAP)*100)/100}
function matchNotes(m,motm,gol,fiy,lvF){const pl=plAll(m);const R={};for(const id of pl){const r=matchPoints(m,id,motm,gol,fiy,lvF?lvF(id):undefined);if(r)R[id]=r}
  const ids=Object.keys(R);if(!ids.length)return R;
  {const tc=trkCtx(m);if(tc)for(const id of ids){const dv=trkDev(m,id,tc);if(!dv)continue;R[id].trk=dv;const b=trkBonus(R[id].role,dv);if(b){R[id].raw+=b;R[id].tb=b;R[id].parts.push(["Saha performansı",b])}}}
  const tf=(x,id)=>{let v=x>NOTE.tavan?NOTE.tavan+(x-NOTE.tavan)*NOTE.tavanK:x;const[lo,hi]=NOTE.bant[R[id].pk]||NOTE.bant[0];v=v>hi?hi+(v-hi)*NOTE.bantK:v<lo?lo-(lo-v)*NOTE.bantK:v;return clamp(v,NOTE.min,NOTE.max)};
  // ortadaki oyuncu 7 alır (birkaç golcünün çok yüksek notu herkesi aşağı çekmesin)
  const med=a=>{const b=[...a].sort((x,y)=>x-y),n=b.length;return n%2?b[(n-1)/2]:(b[n/2-1]+b[n/2])/2};
  let sh=0;for(let i=0;i<6;i++){const md=med(ids.map(id=>tf(R[id].raw+sh,id)));sh+=NOTE.orta-md;if(Math.abs(NOTE.orta-md)<.005)break}
  // reyting: maçın not ortalamasına ve ortalama kart seviyesine göre; maçtaki toplam değişim sıfıra yakın
  const lvA=ids.reduce((q,id)=>q+R[id].lv,0)/ids.length;const fin1=id=>Math.round(tf(R[id].raw+sh,id)*10)/10;const mA=ids.reduce((q,id)=>q+fin1(id),0)/ids.length;
  for(const id of ids){const r=R[id];r.pts=fin1(id);r.sh=Math.round(sh*100)/100;r.esik=Math.round((mA+(r.lv-lvA)*NOTE.esikAdim)*1000)/1000;
    const b=clamp(r.raw+sh>NOTE.tavan?NOTE.tavan+(r.raw+sh-NOTE.tavan)*NOTE.tavanK:r.raw+sh,NOTE.min,NOTE.max);if(Math.abs(b-r.pts)>.05)r.parts.push([(r.pts<b?"Tavan":"Taban")+": "+(NOTE.perf[r.pk]?NOTE.perf[r.pk][1]:"Orta"),Math.round((r.pts-b)*100)/100]);
    if(Math.abs(r.sh)>=.05)r.parts.push(["Maç dengesi",r.sh])}
  return R}
const fD=d=>{const v=Math.round(d*10)/10;return (v>0?"+":"")+String(v).replace(".",",")};
const fA=d=>String(Math.round(Math.abs(d)*10)/10).replace(".",",");
function baseOf(p){const set=attrSet(p.pos);const a=p.attrs||{};let ep=eposOf(p);if((ep==="KL")!==(p.pos==="Kaleci"))ep=DEF_EPOS[p.pos]||"MO";const w=W[ep];
  let s=0,t=0;for(const[k]of set){const x=w[k]??0;s+=x*mainX(a,k,p.pos);t+=x}return flo(t?s/t:set.reduce((q,[k])=>q+mainX(a,k,p.pos),0)/set.length)}

/* ===== Özellik motoru: maçta yapılan iş alt özellikleri değiştirir, GEN özelliklerden hesaplanır ===== */
const ENG={step:2,cap:8,decay:.05,maxGen:.3,motmGen:.5,ev:.35,evShare:.5,roleW:.5};
const SUBN={hiz_acc:"Hızlanma",hiz_spr:"Sprint hızı",hiz_cab:"Çabukluk",sut_bit:"Bitiricilik",sut_guc:"Şut gücü",sut_poz:"Pozisyon alma",pas_kis:"Kısa pas",pas_uzn:"Uzun pas",pas_viz:"Vizyon",
  dri_kon:"Top kontrolü",dri_sur:"Top sürme",dri_cev:"Çeviklik",def_kes:"Top kesme",def_bil:"Savunma bilinci",def_mud:"Ayakta müdahale",fiz_day:"Dayanıklılık",fiz_guc:"Güç",fiz_agr:"Agresiflik",
  dal_uza:"Uzanma",dal_kos:"Köşe kurtarışı",ref_ref:"Refleks",ref_yak:"Yakın mesafe",ell_tut:"Top tutma",ell_bas:"Elle oyun başlatma",ayk_pas:"Ayakla pas",ayk_deg:"Uzun degaj",poz_yer:"Yer tutma",poz_bir:"Bire birde çıkış"};
const subKeys=pos=>attrSet(pos).flatMap(([k,,,subs])=>subs.map(([sk])=>k+"_"+sk));
const MENTAL={FV:"sut_poz",OS:"pas_viz",DF:"def_bil",KL:"poz_yer"};
// kaleci ve defans için halı saha baremleri (takımın yediği gol)
const CONC=[[3,"iyi+"],[6,"iyi"],[9,"orta"],[12,"kötü"],[999,"kötü+"]];
const concBand=op=>{const d=op-gyOrt();return d<=-3?"iyi+":d<=-1?"iyi":d<=1?"orta":d<=3?"kötü":"kötü+"};
function genF(p,cur){const set=attrSet(p.pos);let ep=eposOf(p);if((ep==="KL")!==(p.pos==="Kaleci"))ep=DEF_EPOS[p.pos]||"MO";const w=W[ep];
  const mv=k=>{const d=set.find(x=>x[0]===k);return d[3].reduce((q,[sk])=>q+cur[k+"_"+sk],0)/d[3].length};
  let s2=0,t=0;for(const[k]of set){const x=w[k]??0;s2+=x*mv(k);t+=x}return t?s2/t:set.reduce((q,[k])=>q+mv(k),0)/set.length}
function matchChanges(p,r,m,st,ctx){const ch=[];const add=(k,v,why)=>{if(v)ch.push([k,v,why])};const g=r.g,a=r.a,og=+st.og||0,role=r.role,op=r.op;
  // alternatif pozisyonu forvet olan (kartı forvet değil) oyuncuda gol/asist etkisi yarıya iner
  const gaF=posOf(p)!=="FV"&&altOf(p)&&EPOS[altOf(p)][0]==="FV"?NOTE.altFV:1;const ga=(k,v,why)=>add(k,v*gaF,why);
  if(g){ga("sut_bit",ENG.step*Math.min(g,3),g+" gol");ga("sut_poz",ENG.step*Math.min(g,2)/2,"gol attı");if(g>=3)ga("sut_guc",ENG.step,"hat-trick")}
  else if(role==="FV"){add("sut_bit",-ENG.step,"gol yok");if(ctx.fvDry>=3)add("sut_poz",-ENG.step,ctx.fvDry+" maçtır gol yok")}
  if(a){ga("pas_kis",ENG.step*Math.min(a,3)*.6,a+" asist");ga("pas_viz",ENG.step*Math.min(a,3)*.4,a+" asist");if(a>=2)ga("pas_uzn",ENG.step/2,"2+ asist");if(role==="KL")ga("ayk_pas",ENG.step,"asist")}
  if(g&&a)ga("dri_kon",ENG.step,"gol + asist");
  if(+st.cl)add(role==="KL"?"ref_yak":"def_bil",ENG.step*(+st.cl),"çizgiden çıkardı");
  if(+st.pen)add(role==="KL"?"poz_bir":"def_mud",-ENG.step*(+st.pen),"penaltı yaptırdı");
  if(+st.pm)add(role==="KL"?"ayk_pas":"sut_bit",-ENG.step*(+st.pm),"penaltı kaçırdı");
  if(+st.ps)add(role==="KL"?"dal_kos":"def_bil",ENG.step*(+st.ps),"penaltı kurtardı");
  // defans kartında şut/pas ağırlığı düşük: gol katkısı savunmacının ana özelliklerine yazılır
  const gk=g+a;if((posOf(p)==="DF"||eposOf(p)==="DOS")&&gk){const w=gk+" gol katkısı";ga("pas_viz",ENG.step,w);if(g)ga("sut_guc",ENG.step,w);ga(/^S[ĞL]B$/.test(eposOf(p))?"hiz_spr":"fiz_agr",ENG.step*Math.min(gk,2),w)}
  if(role==="OS"&&!g&&!a&&ctx.osDry>=2)add("pas_viz",-ENG.step,ctx.osDry+" maçtır katkı yok");
  const b=concBand(op);
  if(role==="DF"){const dv=b==="iyi+"?1:b==="iyi"?.5:b==="kötü"?-.5:b==="kötü+"?-1:0;if(dv)for(const k of["def_bil","def_kes","def_mud"])add(k,ENG.step*dv*.7,op+" gol yedi")}
  if(role==="KL"){if(b==="iyi+"){add("ref_ref",ENG.step,op+" gol yedi");add("poz_yer",ENG.step,op+" gol yedi")}else if(b==="iyi")add("ref_ref",ENG.step,op+" gol yedi");
    else if(b==="kötü")add("poz_yer",-ENG.step,op+" gol yedi");else if(b==="kötü+"){add("ref_ref",-ENG.step,op+" gol yedi");add("dal_uza",-ENG.step,op+" gol yedi")}}
  if(og)add(role==="KL"?"poz_yer":"def_bil",-ENG.step*og,"kendi kalesine");
  const my=r.side==="A"?+m.score_a||0:+m.score_b||0;
  {const mk=role==="DF"?["def_bil","def_kes","def_mud"]:[MENTAL[role]],mv=ENG.step/2/mk.length;
    if(r.res==="G")for(const k of mk)add(k,mv,"galibiyet");else if(r.res==="M"&&op-my>=5)for(const k of mk)add(k,-mv,(op-my)+" farklı yenilgi")}
  // Maçın Adamı: pozisyondan bağımsız GEN'e sabit +motmGen, kartın en ağırlıklı ana özelliğine yazılır
  if(ctx.motm){const set=attrSet(p.pos);let ep=eposOf(p);if((ep==="KL")!==(p.pos==="Kaleci"))ep=DEF_EPOS[p.pos]||"MO";const w=W[ep];
    const top=set.reduce((b,x)=>(w[x[0]]??0)>(w[b[0]]??0)?x:b,set[0]);const t=set.reduce((q,[k])=>q+(w[k]??0),0)||1;
    for(const[sk]of top[3])add(top[0]+"_"+sk,ENG.motmGen*t/(w[top[0]]||1),"Maçın Adamı")}
  if(ctx.att>0&&ctx.att%4===0)add(p.pos==="Kaleci"?"hiz_cab":"fiz_day",ENG.step,ctx.att+" maç üst üste geldi");
  // saha verileri: maç ortalamasının belirgin üstü +1, altı −1 (gol +2)
  if(r.trk){const d=r.trk,h=ENG.step/2;const T=(x,k,why)=>{if(x==null)return;if(x>=.8)add(k,h,why);else if(x<=-.8)add(k,-h,why)};
    if(role==="KL")T(d.isa,"ayk_pas","pas isabeti");
    else{T(d.km,"fiz_day","koşu mesafesi");T(d.hiz,"hiz_spr","maks hız");T(d.spr,"hiz_acc","sprint");
      const pk=d.pas!=null&&d.isa!=null?(d.pas+d.isa)/2:(d.pas??d.isa);T(pk,"pas_kis","pas");
      T(d.pp,"pas_viz","progresif pas");T(d.pt,"dri_sur","progresif taşıma");T(d.dri,"dri_cev","dripling");T(d.tk,"def_mud","top kapma");T(d.pa,"def_kes","pas arası")}}
  return ch}
// maç notunu karta çevir: GEN değişimi = (not − 6,5) × 0,4; değişim maçta yapılan işin özelliklerine dağıtılır
// maç notu karta çevrilir: GEN değişimi = (not − eşik) × kat. Önce maçta yapılan iş (gol → şut, asist → pas, yenen gol → savunma)
// kendi alt özelliğine doğrudan yazılır; GEN değişiminin kalanı oynadığı mevkinin ve kartının ağırlıklarına göre bütün alt özelliklere yayılır.
const ROLE_EP={KL:"KL",DF:"STP",OS:"MO",FV:"SNT"};
function noteSpread(p,cur,ch,D,role){
  // Bir maçta bütün özellikler aynı yöne gider: not iyiyse hepsi artar, kötüyse hepsi düşer.
  // Maçta yapılan iş (gol → şut, asist → pas, yenen gol → savunma) yalnızca payın büyüğünü alır, başkasından düşülmez.
  const imp=M=>{const c={...cur};for(const k in M)c[k]+=M[k];return genF(p,c)-genF(p,cur)};
  if(Math.abs(D)<.005)return [];const sg=Math.sign(D);
  const E={},why={};for(const[k,v,w]of ch)if(k in cur&&Math.sign(v)===sg){E[k]=(E[k]||0)+Math.abs(v);why[k]=why[k]||w}
  const set=attrSet(p.pos);let ep=eposOf(p);if((ep==="KL")!==(p.pos==="Kaleci"))ep=DEF_EPOS[p.pos]||"MO";const wc=W[ep]||{};const wr=p.pos==="Kaleci"?wc:(W[ROLE_EP[role]]||wc);
  const U={};for(const[k,,,subs]of set){const w=(1-ENG.roleW)*(wc[k]??0)+ENG.roleW*(wr[k]??0);if(w<=0)continue;for(const[sk]of subs)if((k+"_"+sk) in cur)U[k+"_"+sk]=w/subs.length}
  const out={},tag={};const put=(M,share,w)=>{const iu=imp(M);if(Math.abs(iu)<1e-6)return false;const f=share/iu;for(const k in M){out[k]=(out[k]||0)+M[k]*f;tag[k]=tag[k]||(typeof w==="string"?w:w[k])}return true};
  const hasE=Object.keys(E).length>0;let eS=hasE?D*ENG.evShare:0;if(hasE&&!put(E,eS,why))eS=0;put(U,D-eS,"maç notu");
  return Object.keys(out).map(k=>[k,out[k],tag[k]])}
// Maç sonu puanları dondurulur: yönetici cihazı bitmiş maçların sonucunu sırayla maç kaydına yazar.
// Sonraki hesaplar donmuş maçı yeniden hesaplamaz; kurallar değişse de geçmiş aynı kalır. Maç düzeltilirse sunucu o maçı ve sonrakileri çözer.
const ENG_V="2026-11-18";
const dlPack=DL=>{const o={};for(const k in DL){const v=Math.round(DL[k]*1000)/1000;if(v)o[k]=v}return o};
function calcOf(m,id,KS){const e=m.calc&&m.calc.p&&m.calc.p[id];if(!e||!e.dl||typeof e.dl!=="object")return null;
  for(const k in e.dl)if(!KS.includes(k))return null;return e}// mevki kaleciyle saha oyuncusu arasında değiştiyse yeniden hesapla
async function calcSync(){if(!S.admin||S._cs||S.fol)return;S._cs=true;let n=0;
  try{const F=fin();let i=0;while(i<F.length&&F[i].calc)i++;
    for(;i<F.length&&n<30;i++){const m=F[i];const inf=S.mInfo&&S.mInfo[m.id];if(!inf||!inf.pts)break;const p={};
      for(const[id,r]of Object.entries(inf.pts)){const st=S.stats[id];const h=st&&st.hist.find(x=>x.m.id===m.id&&x.kind==="oynadi");
        p[id]={pts:Math.round(r.pts*100)/100,esik:Math.round((r.esik??0)*1000)/1000,dl:h&&h.dl?h.dl:{},ch:h?h.ch:[]}}
      const calc={v:ENG_V,at:new Date().toISOString(),p};let ok=false;
      try{const r=await rpc("admin_set_calc",{p_pin:S.pin||"",p_id:m.id,p_calc:calc});ok=!!(r&&r.ok)}catch(_){}
      if(!ok)break;m.calc=calc;n++}}
  finally{S._cs=false}return n}
// Haftanın Takımı: en yüksek notlu kaleci + en yüksek notlu 6 oyuncu (misafirler hariç), nota göre sıralı
function totwOf(pl,pts){const ok=pl.filter(id=>pts[id]&&P(id)&&!P(id).guest).sort((a,b)=>pts[b].pts-pts[a].pts);
  // mevkiye göre 7: 1 kaleci + 2-2-2 / 2-3-1 / 3-2-1 dizilişlerinden not toplamı en yüksek olanı; bir mevkide oyuncu yetmezse boşluğu en iyi kalan oyuncu doldurur
  const gk=ok.find(id=>pts[id].role==="KL");const rest=ok.filter(id=>id!==gk);let best=null;
  for(const [k,n] of [["2-3-1",[2,3,1]],["3-2-1",[3,2,1]],["2-2-2",[2,2,2]]]){const used=new Set(),slot={};let sum=0,fill=0;
    ["DF","OS","FV"].forEach((r,i)=>{rest.filter(id=>pts[id].role===r).slice(0,n[i]).forEach(id=>{used.add(id);slot[id]=r;sum+=pts[id].pts})});
    ["DF","OS","FV"].forEach((r,i)=>{let c=Object.values(slot).filter(x=>x===r).length;while(c<n[i]){const id=rest.find(x=>!used.has(x));if(!id)break;used.add(id);slot[id]=r;sum+=pts[id].pts;fill++;c++}});
    if(!best||sum>best.sum+1e-9||(Math.abs(sum-best.sum)<1e-9&&fill<best.fill))best={k,slot,sum,fill}}
  const slot=best?best.slot:{};let kp=gk;if(!kp)kp=rest.find(id=>!(id in slot));
  const O={DF:1,OS:2,FV:3};const T=(kp?[kp]:[]).concat(Object.keys(slot).sort((a,b)=>O[slot[a]]-O[slot[b]]||pts[b].pts-pts[a].pts));
  if(kp)slot[kp]="KL";T.form=best?best.k:"2-3-1";T.slot=slot;return T}
function compute(){computeCore(null);const lv={};
  for(const[pid,st]of Object.entries(S.stats)){let prev=st.baseX??st.base;for(const h of st.hist){(lv[h.m.id]??={})[pid]=prev;prev=h.gx??h.ovr}}
  computeCore(lv)}
function computeCore(LV){
  const F=fin();const mInfo={};const out={};const lvOf=(mid,id)=>LV?.[mid]?.[id]??(P(id)?baseOf(P(id)):NOTE.ref);
  for(const m of F){const motm=m.motm||null,fiy=m.fiy_id||topVote(m,"fiyasko"),gol=m.gol_id||topVote(m,"gol");
    const pl=plAll(m);const pts=matchNotes(m,motm,gol,fiy,id=>lvOf(m.id,id));
    if(m.calc&&m.calc.p)for(const id in pts){const e=m.calc.p[id];if(e&&isFinite(e.pts)){pts[id].pts=e.pts;if(isFinite(e.esik))pts[id].esik=e.esik;pts[id].fz=true}}
    const totw=totwOf(pl,pts);mInfo[m.id]={motm,fiy,gol,pts,totw}}
  for(const p of S.all){
    const base=baseOf(p);const joined=p.created_at?new Date(new Date(p.created_at).toDateString()).getTime():0;
    const KS=subKeys(p.pos);const pa=p.attrs||{};const B0={},DL={};for(const k of KS){const[mk,sk]=k.split("_");B0[k]=subVal(pa,mk,sk);DL[k]=0}
    const curOf=()=>{const c={};for(const k of KS)c[k]=clamp(B0[k]+DL[k],30,99);return c};let gen=genF(p,curOf());let ovr=flo(gen);
    let att=0,fvDry=0,osDry=0;
    const hist=[],series=[base];let games=0,goals=0,ast=0,W=0,D=0,L=0,motm=0,fiy=0,golu=0,totw=0,hat=0,elig=0,streak=0,best=0,late=0,cs=0,ptsSum=0,bestM=null;
    for(const m of F){
      if(matchTs(m)<joined)continue;const inf=mInfo[m.id];const r=inf.pts[p.id];if(!r&&(p.yedek||sideOf(m,p.id)))continue;elig++;let ch,line;
      if(r){games++;streak++;best=Math.max(best,streak);goals+=r.g;ast+=r.a;if(r.g>=3)hat++;
        if(r.res==="G")W++;else if(r.res==="B")D++;else L++;
        if(inf.motm===p.id)motm++;if(inf.fiy===p.id)fiy++;if(inf.gol===p.id)golu++;if(inf.totw.includes(p.id))totw++;
        if(r.op<=5&&(r.role==="KL"||r.role==="DF"))cs++;ptsSum+=r.pts;if(!bestM||r.pts>bestM.pts)bestM={pts:r.pts,date:m.date};
        att++;fvDry=r.role==="FV"&&!r.g?fvDry+1:0;osDry=!r.g&&!r.a?osDry+1:0;
        ch=matchChanges(p,r,m,(m.stats||{})[p.id]||{},{fvDry,osDry,att,motm:inf.motm===p.id});line={kind:"oynadi",r};
      }else{streak=0;att=0;ch=[];line={kind:"gelmedi"}} // maça gelmeyenin kartı değişmez
      if(r)for(const k of KS)DL[k]*=(1-ENG.decay);
      const fz=r&&calcOf(m,p.id,KS);
      if(fz){const before=gen;for(const k of KS)DL[k]=fz.dl[k]||0;gen=clamp(genF(p,curOf()),40,99);ovr=flo(gen);
        hist.push({m,d:Math.round((gen-before)*10)/10,od:ovr-flo(before),ovr,gx:gen,ch:fz.ch||[],dl:fz.dl,fz:true,...line});series.push(ovr);continue}
      ch=ch.filter(x=>x[0] in DL);const before=gen;const g0=genF(p,curOf());const nD=r?clamp((r.pts-(r.esik??lvEsik(r.lv??NOTE.ref)))*NOTE.kat,-NOTE.katMax,NOTE.katMax):0;if(r)ch=noteSpread(p,curOf(),ch,nD,r.role);const DL0={...DL};
      const req={};for(const[k,v]of ch){req[k]=(req[k]||0)+v;DL[k]=clamp(DL[k]+v,-ENG.cap,ENG.cap)}
      let ng=genF(p,curOf());
      if(r){const rest=g0+nD-ng;if(Math.abs(rest)>.01){for(const k of KS)DL[k]=clamp(DL[k]+rest,-ENG.cap,ENG.cap);ng=genF(p,curOf())}}
      else{const lim=ENG.maxGen;if(Math.abs(ng-before)>lim){const f=lim/Math.abs(ng-before);for(const k of KS)DL[k]=DL0[k]+(DL[k]-DL0[k])*f;ng=genF(p,curOf())}}
      ch=Object.keys(req).map(k=>{const v=Math.round((DL[k]-DL0[k])*10)/10;return v?[k,v]:Math.abs(req[k])>=.05?[k,0,req[k]>0?"tavan":"taban"]:null}).filter(Boolean);
      gen=clamp(ng,40,99);ovr=flo(gen);
      hist.push({m,d:Math.round((gen-before)*10)/10,od:ovr-flo(before),ovr,gx:gen,ch,dl:r?dlPack(DL):null,...line});series.push(ovr);
    }
    const last=hist[hist.length-1];const cur=curOf();const attrs={},attrD={};
    for(const[k,,,subs]of attrSet(p.pos)){const v=subs.reduce((q,[sk])=>q+cur[k+"_"+sk],0)/subs.length,b=subs.reduce((q,[sk])=>q+B0[k+"_"+sk],0)/subs.length;attrs[k]=flo(v);attrD[k]=flo(v)-flo(b)}
    const badges=[];
    if(hat)badges.push({i:"3",t:"Hat-trick",d:hat+" kez tek maçta 3+ gol"});
    if(motm)badges.push({i:"★",t:"Maçın Adamı",d:motm+" kez seçildi"});
    if(totw)badges.push({i:"XI",t:"Haftanın Takımı",d:totw+" kez seçildi"});
    if(goals>=10)badges.push({i:"10",t:"Golcü",d:goals+" gol attı"});
    if(ast>=10)badges.push({i:"A",t:"Pasör",d:ast+" asist yaptı"});
    if(best>=8)badges.push({i:"8",t:"Demir Adam",d:best+" maç üst üste geldi"});
    if(cs>=3)badges.push({i:"0",t:"Duvar",d:cs+" maçta en fazla 5 gol yedi"});
    if(elig>=5&&games/elig>=.9)badges.push({i:"%",t:"Sadık",d:"Maçların %"+Math.round(games/elig*100)+"'ine geldi"});
    {let mk=0,mt=0,mh=0;for(const m of F){const t=trkOf(m,p.id);if(!t)continue;mk=Math.max(mk,+t.km||0);mt=Math.max(mt,+t.tk||0);mh=Math.max(mh,+t.hiz||0)}
      if(mk>=6)badges.push({i:"KM",t:"Maratoncu",d:"Bir maçta "+fN1(mk)+" km koştu"});if(mh>=30)badges.push({i:"HZ",t:"Roket",d:"Maks hız "+fN1(mh)+" km/s"});if(mt>=6)badges.push({i:"TK",t:"Mıknatıs",d:"Bir maçta "+mt+" top kapma"})}
    if(golu)badges.push({i:"G",t:"Haftanın Golü",d:golu+" kez"});
    if(fiy>=2)badges.push({i:"?!",t:"Fiyasko Ustası",d:fiy+" kez seçildi",shame:true});
    const hp=hist.filter(h=>h.r);const run=f=>{let n=0;for(let i=hp.length-1;i>=0&&f(hp[i].r);i--)n++;return n};
    const sW=run(r=>r.res==="G"),sU=run(r=>r.res!=="M"),sL=run(r=>r.res==="M"),sNW=run(r=>r.res!=="G"),sG=run(r=>r.g>0),sNG=run(r=>r.g===0);const grp=posOf(p);
    const stkO=sW>=3?{hot:1,t:sW+" maçtır kazanıyor"}:sU>=4?{hot:1,t:sU+" maçtır yenilmiyor"}:sG>=2&&grp!=="KL"?{hot:1,t:sG+" maçtır gol atıyor"}
      :sL>=3?{t:sL+" maçtır kaybediyor"}:sNG>=3&&grp==="FV"?{t:sNG+" maçtır gol atamıyor"}:sNW>=5?{t:sNW+" maçtır kazanamıyor"}:null;
    const f3=hp.slice(-3);const form=f3.length?f3.reduce((q,h)=>q+h.r.pts,0)/f3.length:null;
    out[p.id]={streak:stkO,form,base,ovr,genX:gen,baseX:genF(p,B0),hist,series,games,goals,ast,W,D,L,motm,fiy,golu,totw,elig,best,late,ptsSum,bestM,avgPts:games?ptsSum/games:null,att:elig?games/elig:null,lastO:last?last.od:0,lastD:last?last.d:0,attrs,attrD,cur,B0,badges};
  }
  S.stats=out;S.mInfo=mInfo;
  const tog={},vs={};const key=(a,b)=>a<b?a+"|"+b:b+"|"+a;const real=id=>{const q=P(id);return q&&!q.guest};
  for(const m of F){const sa=+m.score_a||0,sb=+m.score_b||0;const st=m.stats||{};const ca=id=>((+st[id]?.g||0)+(+st[id]?.a||0))>0;
    for(const[k,T]of[["A",plOf(m,"A")],["B",plOf(m,"B")]]){const res=k==="A"?(sa>sb?"W":sa<sb?"L":"D"):(sb>sa?"W":sb<sa?"L":"D");const ids=T.filter(real);
      for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const o=tog[key(ids[i],ids[j])]||(tog[key(ids[i],ids[j])]={n:0,W:0,D:0,L:0,ga:0});o.n++;o[res]++;if(ca(ids[i])&&ca(ids[j]))o.ga++}}
    const A=plOf(m,"A").filter(real),B=plOf(m,"B").filter(real);
    for(const a of A)for(const b of B){const k2=key(a,b);const o=vs[k2]||(vs[k2]={n:0,d:0,w:{}});o.n++;if(sa===sb)o.d++;else{const w=sa>sb?a:b;o.w[w]=(o.w[w]||0)+1}}}
  const duo={};for(const m of F)for(const x of(m.links||[]))if(x&&x.a&&x.g&&real(x.a)&&real(x.g)){const k3=x.a+">"+x.g;duo[k3]=(duo[k3]||0)+1}
  S.tog=tog;S.vs=vs;S.duo=duo;
}
const ovrOf=id=>S.stats[id]?.ovr??(P(id)?baseOf(P(id)):60);
const pairKey=(a,b)=>a<b?a+"|"+b:b+"|"+a;
const togOf=(a,b)=>(S.tog||{})[pairKey(a,b)]||{n:0,W:0,D:0,L:0,ga:0};
const vsOf=(a,b)=>{const o=(S.vs||{})[pairKey(a,b)]||{n:0,d:0,w:{}};return{n:o.n,d:o.d,a:o.w[a]||0,b:o.w[b]||0}};
const stkIcon=s=>s&&s.streak?`<span class="stk ${s.streak.hot?"hot":"cold"}" title="${esc(s.streak.t)}" aria-label="${esc(s.streak.t)}">${s.streak.hot?"🔥":"❄️"}</span>`:"";
const tierOf=o=>o>=80?"t1":o>=75?"t2":o>=70?"t3":"t4";

/* ================= Veri ================= */
async function load(force){
  if(TID===0){applyData([],[],[],[]);S.offline=0;setBrand();render();return}
  if(S.fol){try{const d=await rpc("follow_data",{p_team:TID});if(d&&d.ok){applyData([d.settings],d.players||[],d.matches||[],[]);S.photos={};S.offline=0}else{S.fol=false;applyData([],[],[],[])}}catch(e){if(!S.loaded)S.err="Verilere ulaşılamadı. İnternet bağlantını kontrol edip sayfayı yenile."}setBrand();render();return}
  try{const yr=new Date().getFullYear();
    const[st,pl,ms,sv2,ag]=await Promise.all([sbGet("settings?id=eq."+TID+"&select=*"),sbGet("players?select=id,name,pos,no,attrs,status,status_log,created_at,archived,photo_v,guest,epos,alt_pos,yedek&order=created_at.asc"),
      sbGet("matches?select=*&archived=eq.false&order=date.desc&limit=400"),sbGet("season_votes?select=*&year=eq."+yr),rpc("player_ages",{}).catch(()=>[]),rpc("team_rev",{}).then(r=>{if(r)S.rev=r}).catch(()=>{})]);
    if(Array.isArray(st)&&!st.length){// takım silinmiş ya da yok: hatırlanan takımı unut, tanıtım/takımlar ekranına dön
      cacheClear();TID=0;LS.set("y_team","0");LS.del("y_me");S.me="";S.mem=null;S.admin=false;S.tcard=undefined;applyData([],[],[],[]);S.offline=0;setBrand();if(S.session)afterAuth().then(()=>render(true));render(true);return}
    if(!pl.length&&st[0]&&st[0].gate&&LS.get("y_auth")&&!S.session&&S.loaded&&S.players.length){S.offline=0;return}// giriş tamamlanınca yeniden yüklenecek
    {const am={};(Array.isArray(ag)?ag:[]).forEach(r=>am[r.id]=r.age);pl.forEach(p=>{if(am[p.id]!=null)p.age=am[p.id]})}
    const sig=JSON.stringify([st,pl,ms,sv2]);const same=S.loaded&&!S.err&&!S.offline&&sig===S.sig;S.sig=sig;
    applyData(st,pl,ms,sv2);S.offline=0;setBrand();
    logoSync();
    await photosSync(pl);
    cacheSave(st,pl,ms,sv2);
    // arka plan yenilemesinde veri değişmediyse ekranı yeniden çizme (açık bölümler kapanmasın)
    if(same&&!force)return;
  }catch(e){console.error(e);if(S.loaded){if(!S.offline&&S.cacheAt)S.offline=S.cacheAt;if(!force){render(true);return}}else S.err="Verilere ulaşılamadı. İnternet bağlantını kontrol edip sayfayı yenile."}
  render();setTimeout(notesSync,800);
}
/* son veriyi telefonda sakla: zayıf internette uygulama yine açılsın */
function applyData(st,pl,ms,sv2){S.settings={...DEF_SET,...(st[0]||{})};S.gate=!!S.settings.gate;TEAM.A=cleanName(S.settings.team_a_name)||"Yelekliler";TEAM.B=cleanName(S.settings.team_b_name)||"Yeleksizler";S.all=pl;S.players=pl.filter(p=>!p.archived&&!p.guest);S.guests=pl.filter(p=>p.guest&&!p.archived);S.matches=ms;S.seasonVotes=sv2;S.loaded=true;S.err=null;
  {const om=openMatch();if(om){if(cleanName(om.name_a||""))TEAM.A=cleanName(om.name_a);if(cleanName(om.name_b||""))TEAM.B=cleanName(om.name_b)}}}
function cacheSave(st,pl,ms,sv2){if(S.fol)return;
  if(!pl.length){LS.del("y_cache");LS.del("y_cph");return}// kilitli ve üye değil: hiçbir şey saklama
  const at=Date.now();S.cacheAt=at;
  try{localStorage.setItem("y_cache",JSON.stringify({v:1,at,st,pl,ms,sv2,mem:S.mem||null}))}catch(_){LS.del("y_cache")}
}
function cacheLoad(){try{const c=JSON.parse(localStorage.getItem("y_cache")||"null");if(!c||c.v!==1||!c.pl||!c.pl.length)return false;
  applyData(c.st,c.pl,c.ms,c.sv2);S.cacheAt=c.at;S.sig=JSON.stringify([c.st,c.pl,c.ms,c.sv2]);
  if(c.mem&&!S.mem)S.mem=c.mem;if(S.mem&&S.mem.role==="yonetici"&&S.mem.status==="onayli")S.admin=true;
  return true}catch(_){return false}}
function cacheClear(){LS.del("y_cache");LS.del("y_cph");LS.del("y_cpv");S.cacheAt=0;S.photos={};S.phv={};S.rev=null;idbSet("ph","")}
/* fotoğraflar: telefonda IndexedDB'de (localStorage'ın 5 MB sınırına takılmaz), sadece sürümü değişenler indirilir */
const IDB={db:null};
function idbOpen(){if(IDB.db)return Promise.resolve(IDB.db);return new Promise(res=>{try{const r=indexedDB.open("yelek",1);r.onupgradeneeded=()=>r.result.createObjectStore("kv");r.onsuccess=()=>res(IDB.db=r.result);r.onerror=()=>res(null)}catch(_){res(null)}})}
async function idbGet(k){const db=await idbOpen();if(!db)return null;return new Promise(res=>{try{const q=db.transaction("kv").objectStore("kv").get(k+"_"+TID);q.onsuccess=()=>res(q.result??null);q.onerror=()=>res(null)}catch(_){res(null)}})}
async function idbSet(k,v){const db=await idbOpen();if(!db)return;try{db.transaction("kv","readwrite").objectStore("kv").put(v,k+"_"+TID)}catch(_){}}
async function photosLoadCache(){try{let c=await idbGet("ph");
    if(!c){const old=JSON.parse(localStorage.getItem("y_cph")||"null");if(old){c={ph:old,v:{}};LS.del("y_cph");LS.del("y_cpv")}}
    if(c&&c.ph&&!Object.keys(S.photos||{}).length){S.photos=c.ph;S.phv=c.v||{};render(true)}}catch(_){}}
/* takım logosu: sürümü değişince bir kez iner, telefonda saklanır */
async function logoSync(){if(S.logoT!==TID){S.logo="";S.logoV=0;S.logoT=TID}const v=+(S.settings&&S.settings.logo_v)||0;
  if(!v){if(S.logo){S.logo="";S.logoV=0;idbSet("lg","");phdRender()}return}
  if(S.logoV===v&&S.logo)return;
  if(!S.logo){const c=await idbGet("lg");if(c&&c.v===v&&c.d){S.logo=c.d;S.logoV=v;phdRender();return}}
  try{const r=await sbGet("team_logos?select=data&team_id=eq."+TID);S.logo=(r&&r[0]&&r[0].data)||"";S.logoV=v;idbSet("lg",{v,d:S.logo});phdRender();if(S.tab==="ben")render(true)}catch(_){}}
async function uploadLogo(file){if(!/^image\//.test(file.type||"image/")){toast("Lütfen bir görsel seç");return}
  S.f.lgBusy=true;render(true);const url=URL.createObjectURL(file);
  try{const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error("img"));i.src=url});
    const mk=N=>{const c=document.createElement("canvas");c.width=c.height=N;const g=c.getContext("2d");g.imageSmoothingQuality="high";const k=Math.min(N/img.naturalWidth,N/img.naturalHeight),w=img.naturalWidth*k,h=img.naturalHeight*k;g.drawImage(img,(N-w)/2,(N-h)/2,w,h);let d=c.toDataURL("image/webp",.9);if(!/^data:image\/webp/.test(d))d=c.toDataURL("image/png");return d};
    let d=mk(192);if(d.length>=110000)d=mk(128);if(d.length>=110000)d=mk(96);
    const r=await A("admin_set_logo",{p_data:d},"Logo yüklendi");if(r){S.logo=d;S.logoT=TID;S.logoV=S.settings.logo_v=(+S.settings.logo_v||0)+1;idbSet("lg",{v:S.logoV,d});phdRender()}}
  catch(_){toast("Görsel okunamadı, başka bir görsel dene")}finally{URL.revokeObjectURL(url)}
  S.f.lgBusy=false;render(true)}
async function photosSync(pl){S.phv=S.phv||{};const want={};pl.forEach(p=>{if(p.photo_v)want[p.id]=p.photo_v});
  let ch=false;for(const id of Object.keys(S.photos||{}))if(!want[id]){delete S.photos[id];delete S.phv[id];ch=true}
  const need=Object.keys(want).filter(id=>S.phv[id]!==want[id]);
  for(let i=0;i<need.length;i+=8){const part=need.slice(i,i+8);
    try{const rows=await sbGet("player_photos?select=player_id,data&player_id=in.("+part.join(",")+")");rows.forEach(r=>{S.photos[r.player_id]=r.data;S.phv[r.player_id]=want[r.player_id]});part.forEach(id=>{if(!rows.some(r=>r.player_id===id)){delete S.photos[id];S.phv[id]=want[id]}});ch=true}catch(_){break}}
  if(ch&&!S.fol)idbSet("ph",{ph:S.photos,v:S.phv})}
const hhmm=t=>{const d=new Date(t);return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")};
/* tek seferlik: fotoğrafları hizala (sunucuda hazırlanan dönüşüm, yönetici telefonunda uygulanır) */
async function photoFixRun(){if(!S.admin||S._pf)return;S._pf=true;
  try{const r=await rpc("admin_photo_fixes",{p_pin:S.pin||""});const L=(r&&r.rows)||[];let n=0;
    for(const x of L){const src=S.photos[x.id];if(!src)continue;
      const img=await new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src});
      const c=document.createElement("canvas");c.width=256;c.height=320;const g=c.getContext("2d");const m=x.m;
      g.imageSmoothingQuality="high";g.setTransform(m[0],m[3],m[1],m[4],m[2],m[5]);g.drawImage(img,0,0,img.naturalWidth,img.naturalHeight);g.setTransform(1,0,0,1,0,0);
      const gr=g.createLinearGradient(0,218,0,288);gr.addColorStop(0,"rgba(0,0,0,1)");gr.addColorStop(1,"rgba(0,0,0,0)");
      g.globalCompositeOperation="destination-in";g.fillStyle=gr;g.fillRect(0,0,256,320);g.globalCompositeOperation="source-over";
      let d=c.toDataURL("image/webp",.9);if(!/^data:image\/webp/.test(d))d=c.toDataURL("image/png");if(d.length>=250000)continue;
      const w=await rpc("admin_set_photo",{p_pin:S.pin||"",p_id:x.id,p_data:d});if(w&&w.ok){S.photos[x.id]=d;await rpc("admin_photo_fix_done",{p_pin:S.pin||"",p_id:x.id});n++}}
    if(n){toast(n+" fotoğraf hizalandı");render(true)}}catch(e){console.warn(e)}finally{S._pf=false}}
async function notesSync(force){setTimeout(photoFixRun,2500);setTimeout(calcSync,1500);setTimeout(betRateSync,2500);setTimeout(betPrefetch,600);if(!S.admin||S._ns)return;S._ns=true;
  try{for(const m of S.matches){if(!mDone(m)||(m.notes&&m.id!==force)||isExt(m))continue;const inf=S.mInfo[m.id];if(!inf||!inf.pts)continue;
    const n={};for(const[id,r]of Object.entries(inf.pts)){if(r&&isFinite(r.pts))n[id]={n:Math.round(r.pts*10)/10}}
    if(!Object.keys(n).length)continue;try{const r=await rpc("admin_set_notes",{p_pin:S.pin||"",p_id:m.id,p_notes:n});if(r&&r.ok)m.notes=n}catch(_){}}}
  finally{S._ns=false}}
async function act(fn,args,okMsg){
  try{const r=await rpc(fn,args);
    if(r&&r.ok===false){
      if(r.error==="pin"||r.error==="locked"){toast("Bu işlem için yönetici hesabıyla giriş yapmalısın");if(0)toast(r.error==="locked"?"":"Yönetici şifresi geçersiz, tekrar giriş yap.")}
      else toast({voted:"Oy verildi, değiştirilemez.",closed:"Bu işlem için süre doldu ya da maç kapandı.",not_played:"Bu maçta oynamadığın için oy veremezsin.",self:"Kendine oy veremezsin.",incomplete:"Herkesi değerlendirmelisin.",quota:"En fazla 3 çok iyi ve 3 kötü verebilirsin.",motm:"Maçın adamını \"çok iyi\" dediklerin arasından seçmelisin.",fiy:"Fiyaskoyu \"kötü\" dediklerin arasından seçmelisin.",short:"Yeni şifre en az 6 karakter olmalı."}[r.error]||"İşlem yapılamadı.");
      await load(true);return null}
    if(okMsg)toast(okMsg);await load(true);return r||{ok:true};
  }catch(e){console.error(e);const net=e&&(e.name==="TypeError"||!navigator.onLine);if(!net)logErr("act "+fn+": "+(e&&e.message),"act",e&&e.stack);toast(net?"Kaydedilemedi. Bağlantını kontrol et.":"Kaydedilemedi. Bir aksilik oldu, biraz sonra tekrar dene.");return null}
}
const A=(fn,args,ok)=>act(fn,{p_pin:S.pin,...args},ok);

/* ================= Çizim ================= */
function isEditing(){const a=document.activeElement;if(!a||a===document.body)return false;if(!(a.closest("#view")||a.closest("#modal")))return false;
  return a.tagName==="TEXTAREA"||(a.tagName==="INPUT"&&!["button","checkbox","radio","range"].includes(a.type))}
const RM=matchMedia("(prefers-reduced-motion: reduce)").matches;
// alt bardaki seçili sekme göstergesi: yeni sekmeye kayarak geçer
function navInd(){const ind=$("#nind"),nav=ind&&ind.parentElement;if(!ind)return;const b=nav.querySelector('button[aria-current="page"]');
  if(!b){ind.style.opacity=0;return}const nr=nav.getBoundingClientRect(),br=b.getBoundingClientRect();
  if(!br.width){requestAnimationFrame(navInd);return}
  const first=!ind.dataset.on;if(first)ind.style.transition="none";
  ind.style.width=br.width+"px";ind.style.transform=`translateX(${br.left-nr.left}px)`;ind.style.opacity=1;
  if(first){ind.dataset.on=1;void ind.offsetWidth;ind.style.transition=""}}
addEventListener("resize",()=>navInd());
/* sayfa değişimi: eski sayfa kayarak çekilirken yenisi aynı anda süzülür (View Transitions); boş kare yok */
function goTab(t,fromNav){if(t===S.tab)return;const idx=x=>S.fol?TABS.findIndex(y=>y[0]===(x==="sezon"||x==="saha"?"lig":x)):NAV.findIndex(y=>y[0]===navOf(x));
  const LGO=S.fol?["lig","sezon","saha"]:["lig","gecmis","sezon","saha"];const LG=x=>LGO.includes(x);const dir=LG(S.tab)&&LG(t)?(LGO.indexOf(t)>=LGO.indexOf(S.tab)?"r":"l"):(idx(t)<0||idx(S.tab)<0)?"r":idx(t)===idx(S.tab)?(t==="iddia"?"r":"l"):(idx(t)>=idx(S.tab)?"r":"l");
  const run=()=>{window.scrollTo(0,0);S.tab=t;S.view=null;if(fromNav){LS.set("y_tab",S.tab);history.replaceState(null,"","#"+S.tab)}render(true)};
  if(RM||!document.startViewTransition){run();return}
  document.documentElement.dataset.pdir=dir;try{S._vt&&S._vt.skipTransition&&S._vt.skipTransition()}catch(_){}
  S._vt=document.startViewTransition(run);S._vt.finished.finally(()=>{S._vt=null})}
/* sayfa açılışı: başlık, kartlar ve satırlar sırayla süzülür, çubuklar dolar, sayılar akar */
const RV_SEL=":scope>*, .lgr, .board li, .tsb li, .lrow, .grow, .kdr, .nrow, .fmc, .bh-st>div, .psh>div, .pt, .slide, .kdf .av, .cr, .gl, .evc4 .pfc";
function reveal(root){const els=[...root.querySelectorAll(RV_SEL)];const vh=innerHeight;let i=0;
  for(const el of els){const r=el.getBoundingClientRect();if(r.top>vh+40||r.bottom<-40)continue;
    const top=el.parentElement===root;el.classList.remove("rv","rvc");void 0;el.style.animationDelay=Math.min(60+i*38,900)+"ms";el.classList.add(top?"rvc":"rv");i++}
  root.querySelectorAll(".kdb i,.sbbar i,.pwb i,.lfs .lf").forEach((el,k)=>{el.classList.add("rvb");el.style.animationDelay=(260+k*22)+"ms"});
  root.querySelectorAll(".lp,.kdn,.board .bv>b,.tsv,.fmc .nt").forEach(el=>countUp(el));
  clearTimeout(S._rvT);S._rvT=setTimeout(()=>root.querySelectorAll(".rv,.rvc,.rvb").forEach(el=>{el.classList.remove("rv","rvc","rvb");el.style.animationDelay=""}),2000)}
function countUp(el){const n=el.firstChild;if(!n||n.nodeType!==3)return;const t=n.textContent.trim();const m=t.match(/^([+%]?)(\d+)(?:,(\d))?$/);if(!m)return;
  const pre=m[1],dec=m[3]!=null,end=+(m[2]+(dec?"."+m[3]:""));if(!end)return;const t0=performance.now()+200,dur=800;
  const raw=n.textContent;const put=x=>{n.textContent=raw.replace(t,x)};
  const step=now=>{const k=Math.min(1,Math.max(0,(now-t0)/dur));const e=1-Math.pow(1-k,3);const v=end*e;put(pre+(dec?v.toFixed(1).replace(".",","):Math.round(v)));if(k<1)requestAnimationFrame(step)};
  put(pre+(dec?"0,0":"0"));requestAnimationFrame(step)}
const CHVD='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function yrSel(){const y=selYr();const L=yrList();
  return `<label class="yrsel"><span>${y==="all"?"Tüm zamanlar":"Sezon "+y}</span><i>${CHVD}</i><select data-act-change="yr" aria-label="Sezon seç">${L.map(x=>`<option value="${x}"${x===y?" selected":""}>Sezon ${x}</option>`).join("")}<option value="all"${y==="all"?" selected":""}>Tüm zamanlar</option></select></label>`}
function seasonProg(){const y=selYr();if(y==="all")return"";const n=seasonCount(y),L=sLen(),done=seasonDone(y);const fin2=!done&&n>=L-2;
  return `<div class="sprog"><div class="sprt"><b>${done?"Sezon tamamlandı":`Hafta ${n}/${L}`}</b>${fin2?'<span class="sfin">Final haftaları</span>':""}</div><span class="sbar"><i style="width:${Math.min(100,Math.round((done?L:n)/L*100))}%"></i></span></div>`}
const PHD={gecmis:["Fikstür",1],lig:["Lig",1],kartlar:["Oyuncular",0],sezon:["Lig",1],saha:["Lig",1],ben:["Ben",0],kurallar:["Puanlama",0],ayarlar:[null,0]};
function phdRender(){const el=$("#phd");if(!el)return;{const bt=$("#brT");const gen=!S.session&&!S.viaLink;const tn=(S.settings&&S.settings.group_name)||"Yelek";const pt=S.tab==="ben"&&S.f.setp?(SUBT[S.f.setp]||"Ben"):({mac:"Bu hafta",iddia:"Tahmin",lig:"Lig",gecmis:"Lig",sezon:"Lig",saha:"Lig",kartlar:"Kartlar",ben:"Ben",kurallar:"Puanlama",ayarlar:"Ayarlar"})[S.tab]||tn;const n=gen?"Yelek":pt;if(bt&&bt.textContent!==n)bt.textContent=n;const bs=document.getElementById("brS");if(bs){const st=gen?"Halı saha ligi":tn;if(bs.textContent!==st)bs.textContent=st}document.body.classList.toggle("genb",gen||!S.session)}const t=S.tab;let c=PHD[t];
  if(t==="gecmis"&&S.view)c=null;if(typeof gated==="function"&&gated())c=null;if(t==="ben"&&S.f.setp)c=[SUBT[S.f.setp]||"Ben",0];if(typeof gated==="function"&&gated())c=null;
  // alt barda adı yazan ana sekmelerde büyük başlık yok (sade); alt sayfalar ve Puanlama başlığını korur
  const navT=["gecmis","lig","kartlar","sezon","saha","ben"].includes(t)&&!(t==="ben"&&S.f.setp);
  if(!S.loaded||!c||!c[1]){el.hidden=true;el.innerHTML="";document.body.classList.remove("hasphd","phout","phnt");$("#tt").textContent="";return}
  el.hidden=false;document.body.classList.add("hasphd");document.body.classList.toggle("phnt",true);$("#tt").textContent="";
  el.innerHTML=`<div class="wrap"><h1 class="vh"><span>${c[0]}</span></h1>${c[1]?`<div class="phsr">${yrSel()}${seasonProg()}</div>`:""}</div>`;
  if(!S._phIO&&"IntersectionObserver"in window){S._phIO=new IntersectionObserver(es=>{for(const e of es)document.body.classList.toggle("phout",!e.target.hidden&&!e.isIntersecting)},{rootMargin:"-60px 0px 0px 0px"});S._phIO.observe(el)}}
function yrAgg(F){const g={},a={},mo={};for(const m of F){const inf=S.mInfo[m.id];if(!inf)continue;
    for(const[id,r]of Object.entries(inf.pts||{})){if(!r)continue;g[id]=(g[id]||0)+r.g;a[id]=(a[id]||0)+r.a}if(inf.motm)mo[inf.motm]=(mo[inf.motm]||0)+1}
  const top=o=>{const e=Object.entries(o).filter(([id,v])=>v>0&&P(id)&&!P(id).guest).sort((x,y)=>y[1]-x[1]);return e.length?{id:e[0][0],v:e[0][1]}:null};
  return{g:top(g),a:top(a),mo:top(mo)}}
/* sezon ödülleri ve mevki yarışları */
const POS_AW=[["KL","Altın Eldiven","🧤","Kaleci"],["DF","Sezonun Defansı","🛡️","Defans"],["OS","Sezonun Orta Sahası","🎯","Orta saha"],["FV","Sezonun Forveti","⚡","Forvet"]];
function roleAgg(F){const R={};for(const m of F){const inf=S.mInfo[m.id];if(!inf)continue;for(const[id,r]of Object.entries(inf.pts||{})){if(!r||!P(id)||P(id).guest)continue;
    const k=r.role;const o=(R[k]=R[k]||{})[id]=R[k][id]||{n:0,pts:0,g:0,a:0,op:0};o.n++;o.pts+=r.pts;o.g+=r.g;o.a+=r.a;o.op+=r.op||0}}return R}
/* adil yarış: katılım eşiği + düzeltilmiş ortalama (her oyuncuya 3 "ekip ortalaması" maç eklenmiş gibi) */
const PRIOR=3;
const needAll=F=>Math.max(1,Math.ceil(F.length/2));
const needPos=F=>Math.max(1,Math.ceil(F.length*3/8));
const adjAvg=(sum,n,m0)=>(sum+PRIOR*m0)/(n+PRIOR);
function noteMean(F){let t=0,c=0;for(const m of F){const inf=S.mInfo[m.id];if(!inf)continue;for(const r of Object.values(inf.pts||{})){if(!r)continue;t+=r.pts;c++}}return c?t/c:6.5}
function roleRace(F,k){const R=roleAgg(F)[k]||{};const need=needPos(F);const m0=noteMean(F);
  let gaT=0,gaN=0;if(k==="KL")for(const o of Object.values(R)){gaT+=o.op;gaN+=o.n}const ga0=gaN?gaT/gaN:3;
  const all=Object.entries(R).map(([id,o])=>({id,n:o.n,avg:o.pts/o.n,g:o.g,a:o.a,ga:o.op/o.n,adj:k==="KL"?adjAvg(o.op,o.n,ga0):adjAvg(o.pts,o.n,m0),ok:o.n>=need,need}));
  const srt=k==="KL"?(a,b)=>a.adj-b.adj||b.n-a.n:(a,b)=>b.adj-a.adj||b.n-a.n;
  const q=all.filter(x=>x.ok).sort(srt);q.under=all.filter(x=>!x.ok).sort((a,b)=>(b.n-a.n)||srt(a,b));q.need=need;return q}
/* Yelek puanı: maçın mevkideki en iyi 3 notu 3-2-1 (6 altı puan almaz) + mevkiye göre gol/asist + az gol yeme.
   Oyuncunun sezon puanının hepsi o sezon en çok oynadığı mevkinin yarışında sayılır (eşitlikte asıl mevkisi). */
// mevki yarışı: sıralama ödülü mevkideki oyuncu sayısının yarısı kadar kişiye (en az 1, en fazla 3); az gol yeme ×2; çizgiden çıkarma; defansta top kapma + pas arası (saha verisi)
const YP={g:{FV:1,OS:1.25,DF:1.5,KL:1.5},a:{FV:.5,OS:.75,DF:1,KL:1},sav:2,cl:{KL:1,DF:1,OS:.75,FV:.5},trk:.1,trkMax:2};
// kaleci ve defansın gol yeme puanı: maç notundaki aralığın aynısı (sezon ortalamasına göre), eksiler sayılmaz
const ypSav=(role,op,avg)=>{if(role!=="KL"&&role!=="DF"||op==null)return 0;const d=op-avg;for(const[lim,v]of NOTE.savunma)if(d<=lim)return Math.max(0,v[role]||0);return 0};
const fP=v=>String(+(+v).toFixed(2)).replace(".",",");
function yelekRace(F){const pl={};
  const gA=gyOrt();F.forEach((m,mi)=>{const inf=S.mInfo[m.id];if(!inf)return;const by={};
    for(const[id,r]of Object.entries(inf.pts||{})){if(!r||!P(id)||P(id).guest)continue;(by[r.role]=by[r.role]||[]).push([id,r])}
    for(const[role,L]of Object.entries(by)){L.sort((a,b)=>b[1].pts-a[1].pts);const bon={};let i=0;const nAw=Math.min(3,Math.max(1,Math.round(L.length/2)));const stt=m.stats||{};
      while(i<L.length&&i<nAw){let j=i;while(j+1<L.length&&L[j+1][1].pts===L[i][1].pts)j++;for(let k=i;k<=j;k++)if(L[k][1].pts>=6)bon[L[k][0]]=[3,2,1][i];i=j+1}
      for(const[id,r]of L){const o=pl[id]=pl[id]||{id,tot:0,n:0,m:{},rc:{}};
        const t=role==="DF"?trkOf(m,id):null;
        const p=(bon[id]||0)+(r.g||0)*(YP.g[role]||0)+(r.a||0)*(YP.a[role]||0)+YP.sav*ypSav(role,r.op,gA)+(+stt[id]?.cl||0)*(YP.cl[role]||0)+(t?Math.min(YP.trkMax,((+t.tk||0)+(+t.pa||0))*YP.trk):0);
        o.m[mi]={p:Math.round(p*100)/100,role};o.tot+=p;o.n++;o.rc[role]=(o.rc[role]||0)+1}}});
  const R={KL:[],DF:[],OS:[],FV:[]};
  for(const o of Object.values(pl)){const mx=Math.max(...Object.values(o.rc));const c=Object.keys(o.rc).filter(k=>o.rc[k]===mx);const own=posOf(P(o.id));o.race=c.includes(own)?own:c[0];o.tot=Math.round(o.tot*100)/100;R[o.race]?.push(o)}
  for(const k in R)R[k].sort((a,b)=>b.tot-a.tot||a.n-b.n||nameOf(a.id).localeCompare(nameOf(b.id),"tr"));
  return R}
function seasonAwards(n){const F=fin().filter(m=>+m.season===n);if(!F.length)return null;const L=ligTable(F);const ag=yrAgg(F);
  const av={};for(const m of F){const inf=S.mInfo[m.id];if(!inf)continue;for(const[id,r]of Object.entries(inf.pts||{})){if(!r||!P(id)||P(id).guest)continue;(av[id]=av[id]||{n:0,p:0});av[id].n++;av[id].p+=r.pts}}
  const mvp=yelekAll(F).filter(o=>o.tot>0)[0]||null;
  const pos={};const YR=yelekRace(F);for(const[k]of POS_AW){const r=YR[k]?.[0];if(r&&r.tot>0)pos[k]=r}
  return{n,F,L,champ:L[0]||null,g:ag.g,a:ag.a,mo:ag.mo,mvp,pos}}
/* Piyasa değeri (€): reyting tabanı × mevki × yaş × form × devamlılık × kupa. FC 27 değerlerinden ayarlandı. */
const MV={tab:[[65,5],[70,9],[75,16],[80,30],[81,33.5],[82,36.9],[83,40.3],[84,43.7],[85,47],[86,50.2],[87,53.4],[88,56.5],[89,59.6],[90,62.6],[91,65.6],[92,68.5],[93,71.4],[94,74.2],[95,77],[96,79.7],[97,82.3],[98,84.9],[99,87.5],[100,90]],kl:1,floor:1,age:[[15,1.2],[22,1.1],[27,1],[31,.93],[35,.85]],formK:.1,formMax:.15,attK:.4,attMax:.1,attMin:5,cup:.05,cupOld:.02};
const ageOf=p=>p&&p.age!=null?p.age:null;
const ageMul=a=>{if(a==null)return 1;const A=MV.age;if(a<=A[0][0])return A[0][1];if(a>=A[A.length-1][0])return A[A.length-1][1];for(let i=1;i<A.length;i++)if(a<=A[i][0]){const[x0,y0]=A[i-1],[x1,y1]=A[i];return y0+(y1-y0)*(a-x0)/(x1-x0)}return 1};
// reyting tablosu: 65 → 5 M €, 80 → 30 M €, 100 → 90 M €; 80 altı her puan ~%12 artar, 80 üstü her puan +3,5 M'den +2,5 M'ye azalarak ekler
const mvBase=r=>{const T=MV.tab;r=clamp(r,T[0][0],T[T.length-1][0]);for(let i=1;i<T.length;i++)if(r<=T[i][0]){const[a,x]=T[i-1],[b,y]=T[i];return x*Math.pow(y/x,(r-a)/(b-a))}return T[T.length-1][1]};
function mvParts(p,ovr,H,cups){const pr=[];let v=mvBase(ovr);pr.push(["Reyting "+ovr,v]);
  if(posOf(p)==="KL"&&MV.kl!==1){v*=MV.kl;pr.push(["Kaleci",MV.kl])}
  const am=ageMul(ageOf(p));if(am!==1){v*=am;pr.push([ageOf(p)+" yaş",am])}
  const pl=H.filter(h=>h.kind==="oynadi"&&h.r).slice(-5);if(pl.length>=3){const av=pl.reduce((a,h)=>a+h.r.pts,0)/pl.length;const f=1+clamp((av-NOTE.orta)*MV.formK,-MV.formMax,MV.formMax);v*=f;pr.push(["Form (son "+pl.length+" maç ort. "+fN(av)+")",f])}
  const L8=H.slice(-8);if(L8.length>=MV.attMin&&!p.yedek){const r=L8.filter(h=>h.kind==="oynadi").length/L8.length;const f=1+clamp((r-.75)*MV.attK,-MV.attMax,MV.attMax);v*=f;pr.push(["Devamlılık (son "+L8.length+" maçta "+Math.round(r*L8.length)+" maç)",f])}
  if(cups){const f=1+cups;v*=f;pr.push(["Kupalar",f])}
  return{v:Math.max(MV.floor,Math.round(v*10)/10),parts:pr}}
const _mvC=new Map();
function mvInfo(id){const p=P(id);if(!p)return null;const s=S.stats[id]||{};const key=id+"|"+(s.hist||[]).length+"|"+ovrOf(id)+"|"+(p.age??"")+"|"+!!p.yedek;const c=_mvC.get(id);if(c&&c.key===key)return c.val;
  const H=s.hist||[];let cups=0;try{const T=trophiesOf(id);const last=Math.max(0,...T.map(t=>t[2]));T.forEach(t=>cups+=t[2]===last?MV.cup:MV.cupOld)}catch(_){}
  const now=mvParts(p,ovrOf(id),H,cups);const ser=H.map((h,i)=>mvParts(p,h.ovr,H.slice(0,i+1),0).v);const prev=ser.length>1?ser[ser.length-2]:null;
  const val={...now,ser,prev,age:ageOf(p)};_mvC.set(id,{key,val});return val}
const mvOf=id=>mvInfo(id)?.v||0;
const fM=v=>fN1(v)+" M €";const fN1=v=>(Math.round(v*10)/10).toFixed(1).replace(".",",").replace(",0","");
function mvCard(p){const m=mvInfo(p.id);if(!m)return"";const d=m.prev!=null?Math.round((m.v-m.prev)*10)/10:0;
  const S2=m.ser.length>1?(()=>{const a=m.ser,mx=Math.max(...a),mn=Math.min(...a),W=220,H=44,X=i=>4+i*(W-8)/(a.length-1),Y=v=>H-4-(mx===mn?.5:(v-mn)/(mx-mn))*(H-8);return `<svg class="mvsp" viewBox="0 0 ${W} ${H}" aria-hidden="true"><path d="${a.map((v,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1)).join("")}" fill="none" stroke="#7B3FF2" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${X(a.length-1).toFixed(1)}" cy="${Y(a[a.length-1]).toFixed(1)}" r="3.5" fill="#7B3FF2"/></svg>`})():"";
  return `<section class="card mvc2"><div class="mvh"><span><small>Piyasa değeri</small><b class="num">${fM(m.v)}</b></span>${d?`<span class="mvd ${d>0?"up":"dn"}">${d>0?"▲":"▼"} ${fM(Math.abs(d))}</span>`:""}</div>${S2}
</section>`}
function trophiesOf(id){const T=[];for(const n of seasonsAll()){if(!seasonDone(n))continue;const w=seasonAwards(n);if(!w)continue;
    if(w.champ?.id===id)T.push(["🏆","Şampiyon",n]);if(w.g?.id===id)T.push(["👟","Gol kralı",n]);if(w.a?.id===id)T.push(["🤝","Asist kralı",n]);
    if(w.mvp?.id===id)T.push(["⭐","Sezonun oyuncusu",n]);for(const[k,t,ic]of POS_AW)if(w.pos[k]?.id===id)T.push([ic,t,n])}return T}
function trophyCase(id){const T=trophiesOf(id);if(!T.length)return"";const g={};for(const[ic,t,n]of T){(g[t]=g[t]||{ic,ss:[]}).ss.push(n)}
  return `<section class="tcase"><h3>Kupa dolabı</h3><div class="tcg">${Object.entries(g).map(([t,o])=>`<div class="tci"><span class="tcic">${o.ic}</span><b>${o.ss.length>1?o.ss.length+"× ":""}${esc(t)}</b><small>${o.ss.map(n=>"Sezon "+n).join(", ")}</small></div>`).join("")}</div></section>`}
function raceCardsBase(F){const yr=selYr();const len=yr==="all"?0:Math.max(sLen(),F.length);
  return (k,t,ic,Q)=>{if(!Q.length)return"";const bk="pr_"+k;const open=!!S.f[bk];const L=Q.slice(0,open?10:3);const more=Q.length>3;
    const strip=o=>{if(!len)return"";const ps=Object.values(o.m).map(x=>x.p);const best=Math.max(...ps);
      return `<span class="ysr" style="--n:${len}" aria-label="Maç maç puanlar">${[...Array(len)].map((_,i)=>{if(i>=F.length)return '<i class="fu"></i>';const x=o.m[i];
        if(!x)return '<i class="no" title="Gelmedi">–</i>';return `<i class="${x.p===best&&x.p>0?"hi":"on"}${k&&x.role!==k?" ot":""}" title="${esc(fmtShort(F[i].date))}${k&&x.role!==k?" · başka mevki":""}">${fP(x.p)}</i>`}).join("")}</span>`};
    return `<section class="card tsb ytsb"><${more?`button class="tsh" data-act="tog" data-k="${bk}" aria-expanded="${open}"`:'h3 class="tsh"'}>${ic} ${t}${more?`<i class="${open?"op":""}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></i>`:""}</${more?"button":"h3"}><ol>${L.map((o,i)=>{const p=P(o.id);const ph=photoOf(o.id);
      return `<li data-act="open" data-id="${esc(o.id)}"><span class="tsr num">${i+1}</span><span class="tsp ${tierOf(ovrOf(o.id))}${ph?"":" ni"}">${ph?`<img src="${esc(ph)}" alt="" loading="lazy">`:esc(initials(p.name))}</span><span class="tsn"><b>${esc(p.name)}</b>${len?"":`<small>${o.n} maç</small>`}</span><b class="tsv num">${fP(o.tot)}<small>puan</small></b>${strip(o)}</li>`}).join("")}</ol></section>`}}
function posRaceHtml(F){const YR=yelekRace(F);const C={KL:"#FFD400",DF:"#5FE3F5",OS:"#00E58A",FV:"#FF3EA5"};
  const L=POS_AW.filter(([k])=>(YR[k]||[]).length);if(!L.length)return"";
  const sel=L.some(([k])=>k===S.f.prOpen)?S.f.prOpen:L[0][0];const[k,t]=L.find(x=>x[0]===sel);const Q=YR[k];
  const yr=selYr();const len=yr==="all"?0:Math.max(sLen(),F.length);const all=!!S.f["prAll_"+k];const R=Q.slice(0,all?Q.length:6);
  const mxP=Math.max(1,...Q.flatMap(o=>Object.values(o.m).map(x=>x.p)));const lead=Q[0],sec=Q[1];
  const seg=`<div class="pr-s" role="tablist" aria-label="Mevki yarışları">${L.map(([kk,tt])=>`<button role="tab" aria-selected="${kk===sel}" class="${kk===sel?"on":""}" data-act="prOpen" data-v="${kk}" style="--c:${C[kk]}"><i class="dit">${dIcon({KL:"eldiven",DF:"kalkan",OS:"krampon",FV:"hedef"}[kk],C[kk],26)}</i><span>${esc(tt.replace(/^Sezonun /,""))}</span></button>`).join("")}</div>`;
  const bars=o=>{if(!len)return"";const best=Math.max(...Object.values(o.m).map(x=>x.p));
    return `<span class="pr-w" style="--n:${len}" aria-label="Maç maç puanlar">${[...Array(len)].map((_,i)=>{if(i>=F.length)return '<i class="fu"></i>';const x=o.m[i];if(!x)return '<i class="no" title="Gelmedi"></i>';
      return `<i class="${x.p===best&&x.p>0?"hi":""}${x.role!==k?" ot":""}" style="--h:${Math.max(10,Math.round(x.p/mxP*100))}%" title="${esc(fmtShort(F[i].date))} · ${fP(x.p)}"><em>${fP(x.p)}</em></i>`}).join("")}</span>`};
  const card=`<section class="pr-c" style="--c:${C[k]}"><div class="pr-h"><span class="pr-t"><i class="dit">${dIcon({KL:"eldiven",DF:"kalkan",OS:"krampon",FV:"hedef"}[k],C[k],24)}</i><b>${esc(t)}</b></span></div>
    ${R.map((o,i)=>{const p=P(o.id);if(!p)return"";const x=photoOf(o.id);return `<button class="pr-r${i===0?" l":""}" data-act="open" data-id="${esc(o.id)}"><span class="pr-k num">${i+1}</span><span class="pr-a">${x?`<img src="${esc(x)}" alt="">`:esc(initials(p.name))}</span><span class="pr-n"><b>${esc(p.name)}</b><small>${o.n} maç</small></span><b class="pr-v num">${fP(o.tot)}</b>${bars(o)}</button>`}).join("")}
    ${Q.length>6?`<button class="pr-m" data-act="tog" data-k="prAll_${k}">${all?"Daha az göster":`Tümünü göster · ${Q.length} oyuncu`}</button>`:""}</section>`;
  return `<div class="tsx"><h2>Mevki yarışları</h2></div>${seg}${card}`}
function yelekAll(F){const YR=yelekRace(F);return Object.values(YR).flat().sort((a,b)=>b.tot-a.tot||a.n-b.n||nameOf(a.id).localeCompare(nameOf(b.id),"tr"))}
function mvpHtml(F){const L=yelekAll(F).filter(o=>o.tot>0);if(!L.length)return"";
  const top=L.slice(0,3);const ord=top.length===3?[1,0,2]:top.map((_,i)=>i);
  const ph=id=>{const x=photoOf(id);return x?`<img src="${esc(x)}" alt="">`:`<b>${esc(initials(nameOf(id)))}</b>`};
  const tr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M12 13v4M8 20h8M7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3"/></svg>';
  const l=top[0];
  return `<section class="mzsez"><button class="mzyl" data-act="open" data-id="${esc(l.id)}">${tr}<span><small>Sezonun yeleği · lider</small><b>${esc(nameOf(l.id))}</b></span><em class="num">${fP(l.tot)}<small>puan</small></em></button>
    ${top.length>1?`<div class="mzpod">${ord.map(i=>{const o=top[i];return P(o.id)?`<button class="p${i+1}" data-act="open" data-id="${esc(o.id)}"><span class="mzpod-a">${ph(o.id)}</span><span class="mzpod-b"><b>${i+1}</b><small>${esc(shortName(nameOf(o.id)))}</small><em class="num">${fP(o.tot)}</em></span></button>`:""}).join("")}</div>`:""}
    ${L.length>3?(()=>{const all=!!S.f.mvpAll;const R=L.slice(3,all?L.length:8);const mx=L[0].tot||1;
      return `<div class="yl-l">${R.map((o,j)=>{const p=P(o.id);if(!p)return"";const x=photoOf(o.id);const e=eposOf(p);const pg=(EPOS[e]||["OS"])[0];
        return `<button class="yl-r" data-act="open" data-id="${esc(o.id)}"><span class="yl-k num">${j+4}</span><span class="yl-a">${x?`<img src="${esc(x)}" alt="">`:esc(initials(p.name))}</span><span class="yl-n"><b>${esc(p.name)}</b><small>${esc(e)} · ${o.n} maç</small></span><span class="yl-b"><i class="g${pg}" style="width:${Math.max(4,Math.round(o.tot/mx*100))}%"></i></span><b class="yl-v num">${fP(o.tot)}</b></button>`}).join("")}
      ${L.length>8?`<button class="yl-m" data-act="tog" data-k="mvpAll">${all?"Daha az göster":`Tüm sıralama · ${L.length} oyuncu`}</button>`:""}</div>`})():""}</section>`}
function stSeason(n){const w=seasonAwards(n);if(!w||!w.champ){toast("Bu sezonda maç yok");return}
  const ph=id=>{const x=photoOf(id);return x?`<img src="${esc(x)}" alt="">`:`<span class="stini">${esc(initials(nameOf(id)))}</span>`};const c=w.champ;const P2=[];
  P2.push({k:"motm",sh:"shareSeason",h:`<span class="stey">Sezon ${n} · ${w.F.length} maç</span><span class="stey2">🏆 Şampiyon</span><div class="stph">${ph(c.id)}</div><h2>${esc(nameOf(c.id))}</h2><div class="stkv"><div><b class="num">${c.p}</b><small>Puan</small></div><div><b class="num">${c.G}-${c.B}-${c.M}</b><small>G-B-M</small></div><div><b class="num">${c.av>0?"+":""}${c.av}</b><small>Averaj</small></div></div>`});
  const it=(lab,o,suf)=>o?`<div><span class="stph sm">${ph(o.id)}</span><small>${lab}</small><b>${esc(nameOf(o.id))}</b><span class="stval">${suf(o)}</span></div>`:"";
  P2.push({k:"aw",sh:"shareSeason",h:`<span class="stey2">Krallıklar</span><div class="staw">${it("Gol kralı",w.g,o=>o.v+" gol")}${it("Asist kralı",w.a,o=>o.v+" asist")}${it("Sezonun oyuncusu",w.mvp,o=>fP(o.tot)+" puan · "+o.n+" maç")}${it("En çok Maçın Adamı",w.mo,o=>o.v+" kez")}</div>`});
  const pa=POS_AW.filter(([k])=>w.pos[k]);if(pa.length)P2.push({k:"aw",sh:"shareSeason",h:`<span class="stey2">Mevki ödülleri</span><div class="staw">${pa.map(([k,t,ic])=>{const o=w.pos[k];return `<div><span class="stph sm">${ph(o.id)}</span><small>${ic} ${t}</small><b>${esc(nameOf(o.id))}</b><span class="stval">${fP(o.tot)+" puan · "+o.n+" maç"}</span></div>`}).join("")}</div>`});
  P2.push({k:"totw",h:`<span class="stey2">Sezon ${n} puan durumu</span><ol class="sttw">${w.L.slice(0,7).map((o,i)=>`<li><span class="sttp">${ph(o.id)}</span><span><b>${i+1}. ${esc(nameOf(o.id))}</b><small>${o.G}G ${o.B}B ${o.M}M · averaj ${o.av>0?"+":""}${o.av}</small></span><b class="num">${o.p}</b></li>`).join("")}</ol>`});
  S._stChain=false;S.story={mid:String(n),i:0,P:P2,season:n};document.body.classList.add("lock");stDraw();confetti(160)}
async function shareSeason(n){await fontsOk();const w=seasonAwards(n);if(!w||!w.champ)return;const c=w.champ;
  const W=1080,H=1920,cv=document.createElement("canvas");cv.width=W;cv.height=H;const x=cv.getContext("2d");x.__bh=1230;storyBase(x,W,H);
  cHead(x,W,380,"SEZON "+n+" ŞAMPİYONU",`${S.settings.group_name||""}${S.settings.group_name?" · ":""}${w.F.length} maç`);
  const im=await loadImg(photoOf(c.id));const pw=520,phh=650,pxx=(W-pw)/2,pyy=300;x.save();rr(x,pxx,pyy,pw,phh,48);x.clip();const g=x.createLinearGradient(0,pyy,0,pyy+phh);g.addColorStop(0,"rgba(255,255,255,.35)");g.addColorStop(1,"rgba(255,255,255,.08)");x.fillStyle=g;x.fillRect(pxx,pyy,pw,phh);
  if(im){const sc=Math.max(pw/im.width,phh/im.height);x.drawImage(im,pxx+(pw-im.width*sc)/2,pyy,im.width*sc,im.height*sc)}x.restore();
  x.textAlign="center";x.fillStyle="#fff";fitFont(x,nameOf(c.id),84,48,900,SD,W-120);x.fillText(nameOf(c.id),W/2,pyy+phh+110);
  x.font=`700 38px ${SF}`;x.fillStyle="rgba(255,255,255,.92)";x.fillText(`${c.p} puan · ${c.G}G ${c.B}B ${c.M}M`,W/2,pyy+phh+175);
  const rows=[["Gol kralı",w.g,o=>o.v+" gol"],["Asist kralı",w.a,o=>o.v+" asist"],["Sezonun oyuncusu",w.mvp,o=>fP(o.tot)+" puan · "+o.n+" maç"]].concat(POS_AW.filter(([k])=>w.pos[k]).map(([k,t])=>[t,w.pos[k],o=>fP(o.tot)+" puan · "+o.n+" maç"]));
  let y=pyy+phh+300;const rh=Math.min(66,(H-110-y)/rows.length);
  for(const[l,o,f]of rows){if(!o)continue;cCard(x,80,y,W-160,rh-10,22);x.textAlign="left";x.fillStyle=C_MUT;x.font=`700 26px ${SF}`;x.fillText(l,110,y+rh/2+4);x.fillStyle=C_INK;x.font=`800 30px ${SF}`;x.textAlign="right";x.fillText(`${shortName(nameOf(o.id))} · ${f(o)}`,W-110,y+rh/2+5);y+=rh}
  storyFoot(x,W,H);shareCanvas(cv,"yelek-sezon-"+n+".png","Sezon "+n)}
function champWall(){const ys=yrList().filter(y=>fin().some(m=>yrOf(m)===y)&&seasonDone(y));if(!ys.length)return"";
  return `<section class="card chw"><h2>Şampiyonlar</h2>${ys.map(y=>{const F=fin().filter(m=>yrOf(m)===y);const L=ligTable(F);const ag=yrAgg(F);const live=!seasonDone(y);
    const it=(lab,o,suf)=>o?`<div class="chi"><span>${lab}</span><b>${esc(shortName(P(o.id).name))}</b><small class="num">${o.v}${suf}</small></div>`:"";
    const c=L[0]&&P(L[0].id);
    return `<div class="chy"><div class="chh"><b>Sezon ${y}</b>${live?`<span class="chl">Devam ediyor · ${seasonCount(y)}/${sLen()}</span>`:`<button class="chst" data-act="seasonStory" data-id="${y}">${ICON_PLAY} Sezon özeti</button>`}</div>
      ${c?`<button class="chc" data-act="open" data-id="${esc(c.id)}"><span class="tsp ${tierOf(ovrOf(c.id))}${photoOf(c.id)?"":" ni"}">${photoOf(c.id)?`<img src="${esc(photoOf(c.id))}" alt="">`:esc(initials(c.name))}</span><span><small>${live?"Lider":"Şampiyon"}</small><b>${esc(c.name)}</b><span class="muted small">${L[0].p} puan · ${L[0].G}G ${L[0].B}B ${L[0].M}M</span></span>${LIG_SVG.replace("<svg ","<svg class=\"cup\" ")}</button>`:""}
      <div class="cwg">${it("Gol kralı",ag.g," gol")}${it("Asist kralı",ag.a," asist")}${(()=>{const mv=yelekAll(F).filter(o=>o.tot>0)[0];return mv?it("Sezonun oyuncusu",{id:mv.id,v:fP(mv.tot)}," puan"):""})()}</div></div>`}).join("")}</section>`}
const ICON_PLAY='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor"/></svg>';
const CHV='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const ST_MS=6000;
function stPages(m){return inM(m,()=>{const inf=S.mInfo[m.id]||{};const sa=+m.score_a||0,sb=+m.score_b||0;const st=m.stats||{};const d=parseYmd(m.date);const P2=[];
  const scor=k=>(k==="A"?m.team_a:m.team_b||[]).filter(id=>+st[id]?.g).map(id=>`<li><span>${esc(shortName(nameOf(id)))}</span><b class="num">${+st[id].g>1?"×"+st[id].g:""}</b></li>`).join("");
  const ph=id=>{const x=photoOf(id);return x?`<img src="${esc(x)}" alt="">`:`<span class="stini">${esc(initials(nameOf(id)))}</span>`};
  P2.push({k:"res",sh:"storyRes",h:`<span class="stey">${d.getDate()} ${AYLAR[d.getMonth()]} ${GUNLER[d.getDay()]}${S.settings.field_name?" · "+esc(S.settings.field_name):""}</span><span class="stey2">Maç sonucu</span>
    <div class="stsc"><div>${crest(TEAM.A,"A",64)}<b>${esc(TEAM.A)}</b></div><strong class="num">${sa}<i>–</i>${sb}</strong><div>${crest(TEAM.B,"B",64)}<b>${esc(TEAM.B)}</b></div></div>
    <p class="stres">${sa===sb?"Berabere":esc(sa>sb?TEAM.A:TEAM.B)+" kazandı"}</p><div class="stgl"><ul>${scor("A")}</ul><ul>${scor("B")}</ul></div>`});
  const mo=inf.motm,r=mo&&inf.pts?.[mo];
  if(mo)P2.push({k:"motm",sh:"storyMotm",h:`<span class="stey2">Maçın Adamı</span><div class="stph">${ph(mo)}</div><h2>${esc(nameOf(mo))}</h2>
    <div class="stkv">${r?`<div><b class="num">${fN(r.pts)}</b><small>Not</small></div>`:""}<div><b class="num">${+st[mo]?.g||0}</b><small>Gol</small></div><div><b class="num">${+st[mo]?.a||0}</b><small>Asist</small></div></div>`});
  if(inf.totw&&inf.totw.length)P2.push({k:"totw",sh:"storyTotw",h:`<span class="stey2">Haftanın Takımı</span><ol class="sttw">${inf.totw.map(id=>{const q=inf.pts[id];return `<li><span class="sttp">${ph(id)}</span><span><b>${esc(nameOf(id))}</b><small>${q?ROLE_NAME[q.role]:""}</small></span><b class="num">${q?fN(q.pts):""}</b></li>`}).join("")}</ol>`});
  if(inf.gol||inf.fiy)P2.push({k:"aw",h:`<span class="stey2">Gecenin öteki yüzü</span><div class="staw">${inf.gol?`<div><span class="stph sm">${ph(inf.gol)}</span><small>Haftanın golü</small><b>${esc(nameOf(inf.gol))}</b></div>`:""}${inf.fiy?`<div class="fy"><span class="stph sm">${ph(inf.fiy)}</span><small>Fiyasko</small><b>${esc(nameOf(inf.fiy))}</b></div>`:""}</div>`});
  P2.push({k:"spk",h:`<div class="stspk">${spiker(m,inf)}</div><button class="stgo" data-act="stDetail" data-id="${esc(m.id)}">Maç detayına git ${CHV}</button>`});
  return P2})}
function stOpen(mid,i){const m=S.matches.find(x=>x.id===mid);if(!m)return;S.story={mid,i:i||0,P:stPages(m)};document.body.classList.add("lock");stDraw()}
function stClose(){clearTimeout(S._stT);S.story=null;$("#story").innerHTML="";if(!S.sheet)document.body.classList.remove("lock")}
function stGo(d){const st=S.story;if(!st)return;const n=st.i+d;if(n<0){st.i=0;stDraw();return}
  if(n>=st.P.length){const R=fin().filter(inYr);const j=R.findIndex(x=>x.id===st.mid);const nx=R[j-1];if(d>0&&nx&&S._stChain){stOpen(nx.id,0);return}stClose();return}st.i=n;stDraw()}
function stDraw(){const st=S.story,host=$("#story");if(!st)return;const pg=st.P[st.i];
  host.innerHTML=`<div class="stv st-${pg.k}" role="dialog" aria-modal="true" aria-label="Maç hikâyesi"><div class="stbars">${st.P.map((_,k)=>`<i class="${k<st.i?"done":k===st.i?"run":""}"><b></b></i>`).join("")}</div>
    <div class="sttop"><span class="stbrand">YELEK</span><button class="stx" data-act="stX" aria-label="Kapat">✕</button></div>
    <div class="stpg">${pg.h}</div>

    <button class="stnav l" aria-label="Önceki" data-st="-1"></button><button class="stnav r" aria-label="Sonraki" data-st="1"></button></div>`;
  const run=host.querySelector(".stbars .run b");if(run&&!RM){run.style.animationDuration=ST_MS+"ms"}
  clearTimeout(S._stT);S._stT0=Date.now();S._stLeft=ST_MS;S._stT=setTimeout(()=>stGo(1),ST_MS)}
function stPause(on){const st=S.story;if(!st)return;const b=$("#story .stbars .run b");
  if(on){clearTimeout(S._stT);S._stLeft=Math.max(300,S._stLeft-(Date.now()-S._stT0));if(b)b.style.animationPlayState="paused"}
  else{S._stT0=Date.now();clearTimeout(S._stT);S._stT=setTimeout(()=>stGo(1),S._stLeft);if(b)b.style.animationPlayState="running"}}
(()=>{let t0=0,y0=0,x0=0,held=false;const host=()=>$("#story");
  document.addEventListener("pointerdown",e=>{if(!S.story||!e.target.closest(".stv"))return;t0=Date.now();y0=e.clientY;x0=e.clientX;held=false;S._stHold=setTimeout(()=>{held=true;stPause(true)},220)});
  document.addEventListener("pointerup",e=>{if(!S.story||!t0)return;clearTimeout(S._stHold);const dy=e.clientY-y0;t0=0;
    if(held){stPause(false);held=false;return}
    if(dy>90){stClose();return}
    const nb=e.target.closest(".stnav");if(nb&&!e.target.closest("button:not(.stnav)"))stGo(+nb.dataset.st)});
  document.addEventListener("keydown",e=>{if(!S.story)return;if(e.key==="Escape")stClose();if(e.key==="ArrowRight")stGo(1);if(e.key==="ArrowLeft")stGo(-1)});})();
function qkRender(){const old=$("#qk");if(old)old.innerHTML="";const el=$("#view .qkslot");if(!el||!S.loaded)return;
  const om=openMatch();const lf=fin().slice(-1)[0];const me=S.me&&P(S.me);const it=[];
  const b=(act,ic,t,sub,extra)=>`<button class="qki" data-act="${act}" ${extra||""}><i>${ic}</i><span><b>${t}</b>${sub?`<small>${sub}</small>`:""}</span></button>`;
  if(om&&S.tab!=="mac"){const d=parseYmd(om.date);it.push(b("tab",ICON.mac,"Sıradaki maç",`${d.getDate()} ${AYLAR[d.getMonth()].slice(0,3)} · ${esc(om.time||"")}`,'data-tab="mac"'))}
  if(lf)it.push(b("story",ICON_PLAY,"Son maç",`${+lf.score_a||0}-${+lf.score_b||0} · hikâye`,`data-id="${esc(lf.id)}"`));
  if(me&&S.tab!=="ben")it.push(b("tab",ICON.ben,"Formum",esc(firstName(me.name)),'data-tab="ben"'));
  if(S.tab!=="lig")it.push(b("tab",LIG_SVG,"Puan durumu","",'data-tab="lig"'));
  el.innerHTML=it.length?`<div class="qkin">${it.join("")}</div>`:""}
(()=>{let last=0;addEventListener("scroll",()=>{const y=scrollY;document.body.classList.toggle("scd",y>30);last=y},{passive:true})})();
/* aşağı çekip yenile: üst bant esner, ortada kalkan çizilir */
(()=>{let y0=null,d=0,busy=false;const ptr=()=>$("#ptr");const B=document.body;const MAX=90;
  const set=v=>{d=v;B.style.setProperty("--pd",v+"px");const el=ptr();if(el){el.style.setProperty("--p",Math.min(1,v/MAX).toFixed(3));el.style.top=($(".top")?.getBoundingClientRect().bottom||60)+"px"}};
  const back=(ms)=>{B.classList.add("ptrb");set(0);setTimeout(()=>{B.classList.remove("ptrb","pulling");const el=ptr();if(el)el.classList.remove("loading","done")},ms||380)};
  addEventListener("touchstart",e=>{if(busy||scrollY>2||S.sheet||S.story||document.body.classList.contains("lock")||e.touches.length>1){y0=null;return}y0=e.touches[0].clientY;d=0},{passive:true});
  addEventListener("touchmove",e=>{if(y0==null)return;const dy=e.touches[0].clientY-y0;if(dy<=0||scrollY>2){if(d)set(0);if(dy<0)y0=null;return}
    B.classList.add("pulling");B.classList.remove("ptrb");set(Math.min(130,dy*.5))},{passive:true});
  addEventListener("touchend",async()=>{if(y0==null)return;y0=null;const el=ptr();
    if(d>=MAX&&el){busy=true;B.classList.add("ptrb");set(MAX);el.classList.add("loading");const t0=Date.now();
      try{await load(true)}catch(_){}
      if(await newVer())return;
      await new Promise(r=>setTimeout(r,Math.max(0,900-(Date.now()-t0))));
      el.classList.remove("loading");el.classList.add("done");const tt=$("#ptt");if(tt){tt.classList.add("on");setTimeout(()=>tt.classList.remove("on"),1800)}await new Promise(r=>setTimeout(r,350));back(420);busy=false}
    else if(d)back(300)})})();
// yatay kayan listeler yeniden çizilince yerinde kalsın
function render(force){const _ks={};document.querySelectorAll("[data-ks]").forEach(e=>_ks[e.dataset.ks]=e.scrollLeft);_render(force);shHist();try{odaMenuDraw()}catch(_){}
  document.querySelectorAll("[data-ks]").forEach(e=>{if(_ks[e.dataset.ks]!=null)e.scrollLeft=_ks[e.dataset.ks]})}

// ---- bildirim linkleri: #sekme, #sekme/öğe, #m/<maç>, #iddia/<alt>/<tahmin>, #iddia/yorum/<tahmin>
function routeTab(r,old){r=decodeURIComponent(r||"");const p=r.split("/");const t=(old&&old[p[0]])||p[0];
  if(t==="m"&&p[1]){S.tab="gecmis";S.view=p[1];return}
  if(TABS.some(x=>x[0]===t)){S.tab=t;S.view=null;if(t==="iddia"&&p[1]){S.f=S.f||{};if(["oyna","kupon","herkes","sira"].includes(p[1]))S.f.bt=p[1];else if(p[1]==="kral")S.f.bt="sira";else if(p[1]==="yorum")S.f.bt=S.f.bt||"kupon"}}
  else if(t==="uyeler"||t==="platform"){S.tab="ben";S.f=S.f||{};S.f.setp=t}}
function routeAfter(){const r=S._route;if(!r||!S.loaded)return;const p=decodeURIComponent(r).split("/");
  if((p[0]==="iddia"||p[1]==="oda")&&p.length>1&&!myPid()&&S.session&&(S._rt=(S._rt||0)+1)<30){setTimeout(routeAfter,300);return}S._rt=0;S._route=null;
  try{history.replaceState(null,"",location.pathname+location.search+"#"+(p[0]==="m"?"gecmis":p[0]))}catch(_){}
  if(p[0]==="m"&&p[2]==="bulten"&&S.mInfo&&S.mInfo[p[1]]){S.sheet={type:"bulten",id:p[1]};render(true);return}
  if(p[0]==="iddia"&&p[1]==="kral"){render(true);kralLoad(true);return}
  if(p[0]==="iddia"&&p[1]==="yorum"&&p[2]){const id=p[2];S.sheet={type:"betCom",id};BET.com=null;render(true);rpc("bet_comments_read",{p_coupon:id}).then(x=>{if(x&&x.ok){betComPut(id,x);if(S.sheet&&S.sheet.type==="betCom")render(true)}}).catch(()=>{});return}
  if(p[0]==="mac"&&p[1]==="oda"){const me=myPid();const m=S.matches.filter(x=>!x.archived&&!isExt(x)&&x.state==="takim"&&sideOf(x,me)).sort((a,b)=>matchTs(a)-matchTs(b))[0];if(m){S.sheet={type:"oda",mid:m.id,tab:["gorev","rakip"].includes(p[2])?p[2]:"sohbet",from:+LS.get("y_oda_"+m.id)||0,nwP:true};odaSeen(m.id);render(true);setTimeout(odaBottom,60);odaLoad(m.id,true)}return}
  const el=p[0]==="iddia"&&p[2]?"bk-"+p[2]:(p[0]!=="m"&&p[1]?p[1]:null);if(!el){window.scrollTo(0,0);return}
  let n=0;const go=()=>{const e=document.getElementById(el);if(e){if(e.tagName==="DETAILS")e.open=true;e.scrollIntoView({behavior:"smooth",block:"center"});e.classList.add("flash");setTimeout(()=>e.classList.remove("flash"),1800)}else if(n++<20)setTimeout(go,300)};setTimeout(go,150)}
function routeGo(r){S._route=r;S._r0=r;S._r0t=Date.now();S.sheet=null;routeTab(r);render(true);routeAfter()}
addEventListener("hashchange",()=>{if(typeof shHist==="function"&&Date.now()-(shHist.t||0)<700)return; // pencere kapanırken yapılan geri adımı sayfa değişimi sayma
  const r=location.hash.slice(1);if(r&&r.includes("/")||r==="m")routeGo(r);else if(r&&TABS.some(x=>x[0]===r)&&S.tab!==r)routeGo(r)});
navigator.serviceWorker&&navigator.serviceWorker.addEventListener("message",e=>{const d=e.data||{};if(d.t==="nav"&&d.url){try{const u=new URL(d.url);if(u.hash)routeGo(u.hash.slice(1))}catch(_){}}});
function _render(force){if(S._route&&S.loaded)setTimeout(routeAfter,0);setTimeout(()=>{const nb=document.querySelector('#navIn button[data-tab="iddia"]');if(nb)nb.classList.toggle("bdot",S.tab!=="iddia"&&betUnread()>0);odaFab();if(S.sheet&&(S.sheet.type==="oda"||S.sheet.type==="betCom")&&scrollY>1&&!document.body.classList.contains("kb"))window.scrollTo(0,0)},0);document.body.dataset.fs=S.f.fs||"";document.body.classList.toggle("tg",S.tab==="iddia"&&!(S.sheet&&S.sheet.type==="pm"));{const tc=document.querySelector('meta[name="theme-color"]');if(tc)tc.content=S.tab==="iddia"&&!(S.sheet&&S.sheet.type==="pm")?"#05160E":"#120A2A"}
  if(S.tab==="ayarlar")S.tab="ben";if(S.tab==="saha"){S.tab="sezon";S.f.sezV="saha"}
  if(!force&&isEditing()){S.pending=true;return}
  S.pending=false;compute();
  const s=S.settings;
  
  $("#admPill").hidden=true;{const gb=$("#gearBtn");if(gb){gb.classList.toggle("adm",!!S.admin);gb.hidden=!S.admin}}
  {const gb=$("#gearBtn");if(gb){const k="ayar";if(gb.dataset.k!==k){gb.innerHTML=ICON.ayar;gb.dataset.k=k;gb.setAttribute("aria-label","Ayarlar");gb.title="Ayarlar"}gb.classList.toggle("on",S.tab==="ayarlar")}}
  const me=P(S.me);const mb=$("#meBtn");mb.hidden=false;
  if(S.fol){mb.className="meBtn";mb.innerHTML=`${ICON_EYE}<span>Takip</span>`;mb.setAttribute("aria-label","Takip ettiğin ligler")}
  else if(me){mb.className="meBtn me1"+(S.tab==="ben"?" on":"");mb.innerHTML=avatar(me,"sm");mb.setAttribute("aria-label","Ben: "+me.name)}
  else{mb.className="meBtn me1"+(S.tab==="ben"?" on":"");mb.innerHTML=ICON.ben;mb.setAttribute("aria-label","Ben")}
  if(S.fol&&!FTABS.includes(S.tab))S.tab="lig";document.body.classList.toggle("fol",!!S.fol);
  {const ni=$("#navIn");const nk=(S.fol?"f":"n")+(isMember()?"m":"");if(!ni.firstChild||ni.dataset.k!==nk){ni.dataset.k=nk;{const nd=$("#nind");if(nd)delete nd.dataset.on}ni.innerHTML=(S.fol?TABS.filter(x=>FTABS.includes(x[0])):NAV).map(([k,l,ic])=>`<button data-tab="${k}"><span class="ic">${ic==="lig"?LIG_SVG:ICON[ic]||""}</span><span class="tl">${l}</span></button>`).join("")}
    const cur=S.fol?(S.tab==="sezon"||S.tab==="saha"?"lig":S.tab):navOf(S.tab);ni.querySelectorAll("button").forEach(b=>{if(b.dataset.tab===cur)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});navInd()}
  document.body.classList.toggle("gated",gated());document.body.classList.toggle("fol",!!S.fol);document.body.classList.toggle("uye",isMember()&&!S.fol);
  let h="";if(S.err)h+=`<div class="note warn">${esc(S.err)}</div>`;
  if(S.offline&&S.loaded)h+=`<button class="offl" data-act="retry">${SI.bulut}<span><b>İnternet yok</b> · son güncelleme ${new Date(S.offline).toDateString()===new Date().toDateString()?hhmm(S.offline):fmtShort(new Date(S.offline).toISOString().slice(0,10))+" "+hhmm(S.offline)}</span><i>Yenile</i></button>`;
  if(!S.loaded&&!S.err)h+=`<div class="skl"><i class="sk h"></i><i class="sk"></i><i class="sk"></i><i class="sk s"></i></div><div class="skl"><i class="sk"></i><i class="sk"></i><i class="sk s"></i></div>`;
  else if(S.loaded&&gated()&&!AUTH.ready&&LS.get("y_auth"))h+=`<div class="skl"><i class="sk h"></i><i class="sk"></i><i class="sk"></i><i class="sk s"></i></div>`;
  else if(S.loaded&&gated())h+=viewVitrin();
  else if(S.loaded)h+=(S.tab==="mac"?pushAsk():"")+({mac:viewMac,gecmis:viewGecmis,ben:viewBen,iddia:viewIddia,kartlar:viewKartlar,lig:viewLig,sezon:viewSezon,saha:viewSaha,kurallar:viewKurallar,ayarlar:viewAyarlar}[S.tab]||viewMac)();
  const v=$("#view");const tabI=t=>S.fol?TABS.findIndex(x=>x[0]===(t==="sezon"||t==="saha"?"lig":t)):NAV.findIndex(x=>x[0]===navOf(t));const chg=S._tab!==undefined&&S._tab!==S.tab;if(S._tab!==S.tab)useHit("tab:"+S.tab);{const sk=S.sheet&&S.sheet.type;if(sk&&sk!==S._shk)useHit("sheet:"+sk);S._shk=sk||null}const dir=tabI(S.tab)>=tabI(S._tab)?"r":"l";S._tab=S.tab;
  {const vk=S.tab+"|"+(S.view||"");const same=v.dataset.vk===vk;const need=same?Math.round(innerHeight-v.getBoundingClientRect().top):0;v.dataset.vk=vk;v.style.paddingBottom="";v.style.minHeight="";keepX(v,()=>keepOpen(v,()=>{v.innerHTML=h}));if(same&&need>0){const hh=v.offsetHeight;if(need>hh){const pb=parseFloat(getComputedStyle(v).paddingBottom)||0;v.style.paddingBottom=Math.round(pb+need-hh)+"px"}}}v.removeAttribute("aria-busy");phdRender();qkRender();onbBind();ldBind();
  if(chg&&!RM)reveal(v);

  renderSheet();wakeSync();
}
// yeniden çizimde açık <details> bölümlerini koru
function keepOpen(root,fn){if(!root)return fn();const open=new Set([...root.querySelectorAll("details[open]>summary")].map(x=>x.textContent.trim()));fn();
  if(open.size)root.querySelectorAll("details>summary").forEach(x=>{if(open.has(x.textContent.trim()))x.parentElement.open=true})}
// maç girişi, kadro kurma ve değerlendirme sırasında telefon ekranı kapanmasın
async function wakeSync(){const need=!!(S.admin&&(S.draft||S.teams||(S.sheet&&["stats","eval"].includes(S.sheet.type))));
  try{if(need&&!S.wake&&navigator.wakeLock&&document.visibilityState==="visible"){S.wake=await navigator.wakeLock.request("screen");S.wake.addEventListener("release",()=>{S.wake=null})}
    else if(!need&&S.wake){const w=S.wake;S.wake=null;await w.release()}}catch(_){}}
const XS=".pr-s,.ldx,.mtabs,.chips,.mzch,.oyt2,.scroll-x,.mzseg,.kchips,.vsel,.pmi,.pmt,.form-pick,.pv-tabs,.at-g";
function keepX(v,fn){const sx=[...v.querySelectorAll(XS)].map(e=>e.scrollLeft);fn();[...v.querySelectorAll(XS)].forEach((e,i)=>{if(sx[i])e.scrollLeft=sx[i]})}
function renderSheet(){
  const host=$("#modal");const html=S.sheet?sheetHtml():"";
  if(!html){S.sheet=null;const bg=host.firstChild;if(bg&&!bg.classList.contains("out")){if(RM){host.innerHTML="";document.body.classList.remove("lock");return}bg.classList.add("out");document.body.classList.remove("lock");setTimeout(()=>{if(!S.sheet&&host.firstChild===bg)host.innerHTML=""},230)}return}
  if(host.firstChild&&host.firstChild.classList.contains("out")){host.innerHTML=""}
  let body=$("#sheetBody");
  if(!body){host.innerHTML=`<div class="sheet-bg" data-act="closeBg"><div class="sheet" role="dialog" aria-modal="true"><button class="grab" data-act="close" aria-label="Kapat"></button><div id="sheetBody"></div></div></div>`;body=$("#sheetBody");document.body.classList.add("lock")}
  const sk=S.sheet.type,pk=body.dataset.t;const sh=body.parentNode;
  if(pk&&pk!==sk&&!RM){body.classList.remove("shsw","shswb");void body.offsetWidth;body.classList.add(sk==="player"&&pk==="pedit"?"shswb":"shsw");sh.scrollTop=0}
  const same=pk===sk;const h0=same?sh.offsetHeight:0;if(!same)sh.style.minHeight="";body.dataset.t=sk;sh.classList.toggle("full",["player","pedit","cmp"].includes(sk));const st=sh.scrollTop;keepX(body,()=>keepOpen(body,()=>{body.innerHTML=html}));if(same&&sh.offsetHeight<h0)sh.style.minHeight=h0+"px";if(sh.scrollTop!==st)sh.scrollTop=st;
  if(S.sheet&&S.sheet.type==="pm")ypZoom();
}
/* ================= Paylaşım merkezi ================= */
let IGH="Yelek";
const HT=()=>"#"+(S.settings.ig||String(S.settings.group_name||"yelek").toLocaleLowerCase("tr").replace(/[^a-z0-9çğıöşü]/g,""));
const setBrand=()=>{IGH=S.settings.ig?"@"+S.settings.ig:(S.settings.group_name||"Yelek")};
const canPM=()=>true;
const IG_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';
const IGLOGO=`<svg viewBox="0 0 512 512"><path d="M256 70l150 48v122c0 100-66 166-150 206C172 406 106 340 106 240V118z" fill="#37003C" stroke="#fff" stroke-width="18"/><path d="M186 176l70 92 70-92M256 268v96" fill="none" stroke="#fff" stroke-width="38" stroke-linecap="round" stroke-linejoin="round"/><circle cx="256" cy="128" r="16" fill="#00FF85"/></svg>`;
const igWeek=m=>{if(!m||m.season==null)return"";const L=fin().filter(x=>+x.season===+m.season).sort((a,b)=>matchTs(a)-matchTs(b));const i=L.findIndex(x=>x.id===m.id);return i>=0?"HAFTA "+(i+1):""};
const igWm=t=>`<div class="igwm"><span>${IGLOGO}${IGH}</span><span>${esc(t||"")}</span></div>`;
const igAv=(id,cls="")=>{const ph=photoOf(id);const p=P(id);return `<span class="igav ${tierOf(ovrOf(id))} ${cls}">${ph?`<img src="${esc(ph)}" alt="">`:esc(initials(p?p.name:"?"))}</span>`};
const igDate=d=>{const x=new Date(d+"T12:00:00");return x.getDate()+" "+["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"][x.getMonth()]};
/* ===== Paylaşım paketi: 540×675 gönderi (hikâyede 540×960 çerçeve), 2 kat büyütülüp 1080 px kaydedilir =====
   Kural: içerik blokları (data-b) asla üst üste binmez; metinler kutusuna sığacak puntoya küçülür.
   Görsel kaydedilirken SVG'ler resim olarak çizildiği için SVG içinde CSS değişkeni ya da sınıf rengi kullanılmaz. */
const TRU=s=>String(s??"").toLocaleUpperCase("tr");
const hkSeason=()=>{const yr=curYr();return{yr,F:fin().filter(m=>+m.season===+yr).sort((a,b)=>matchTs(a)-matchTs(b))}};
const hkNext=()=>S.matches.filter(m=>m.state!=="bitti"&&!isExt(m)&&(m.team_a||[]).length&&(m.team_b||[]).length).sort((a,b)=>matchTs(a)-matchTs(b))[0];
const hkNextAny=()=>S.matches.filter(m=>m.state!=="bitti"&&!isExt(m)).sort((a,b)=>matchTs(a)-matchTs(b))[0];
const hkWhen=m=>igDate(m.date)+(m.time?" · "+String(m.time).slice(0,5):"");
const hkForm5=id=>{const H=(S.stats[id]?.hist||[]).filter(h=>h.r).slice(-5);return H.length?H.reduce((a,h)=>a+h.r.pts,0)/H.length:null};
const hkMatchFt=m=>igDate(m.date)+(igWeek(m)?" · "+igWeek(m):"");
const BC='"Barlow Condensed","Arial Narrow",sans-serif',INF="Inter,system-ui,sans-serif";
const YAC={"":"#FF3EA5",g:"#00FF85",gd:"#FFC93C",r:"#FF4D6D"};
let _ypc=null;
// metnin piksel genişliği (harf aralığı dahil)
const ypW=(t,px,w,fam,ls)=>{t=String(t??"");let v;try{_ypc=_ypc||document.createElement("canvas").getContext("2d");_ypc.font=`${w||800} ${px}px ${fam||BC}`;v=_ypc.measureText(t).width}catch(_){v=t.length*px*.5}return v+t.length*px*(ls||0)};
// verilen genişliğe sığan en büyük punto
const ypFit=(t,max,wd,o={})=>{let px=max;while(px>(o.min||8)&&ypW(t,px,o.w,o.fam,o.ls)>wd*.93)px-=.5;return px};
const ypTx=(t,max,wd,o={})=>{const s=TRU(t);return `<span style="font-size:${ypFit(s,max,wd,o)}px">${esc(s)}</span>`};
const YP_SIL='<svg viewBox="0 0 40 40" width="40" height="40" aria-hidden="true"><circle cx="20" cy="15" r="7" fill="#ffffff" fill-opacity=".62"/><path d="M6 40c0-9 6-14 14-14s14 5 14 14z" fill="#ffffff" fill-opacity=".62"/></svg>';
const ypSilBig=(st)=>`<svg class="yp-cut" viewBox="0 0 256 320" width="256" height="320"${st?` style="${st}"`:""} data-b aria-hidden="true"><defs><linearGradient id="ypsg" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="320"><stop offset=".55" stop-color="#ffffff" stop-opacity=".3"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/></linearGradient></defs><circle cx="128" cy="100" r="56" fill="url(#ypsg)"/><path d="M14 320c0-82 51-128 114-128s114 46 114 128z" fill="url(#ypsg)"/></svg>`;
const ypAv=(id,cls,st)=>{const ph=id&&photoOf(id);cls=String(cls||"").split(" ").filter(Boolean).map(c=>"yp-"+c).join(" ");return `<div class="yp-av ${cls}"${st?` style="${st}"`:""} data-b>${ph?`<img src="${esc(ph)}" alt="">`:YP_SIL}</div>`};
const ypCut=(id,st)=>{const ph=id&&photoOf(id);return ph?`<img class="yp-cut" src="${esc(ph)}" alt=""${st?` style="${st}"`:""} data-b>`:ypSilBig(st)};
const YP_RAYS='<div class="yp-rays"><i></i><i></i><i></i><i></i></div>';
const YP_NET='<svg class="yp-net" width="540" height="675" viewBox="0 0 540 675" aria-hidden="true"><defs><pattern id="ypnet" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0H26M0 0V26" stroke="#ffffff" stroke-opacity=".09" stroke-width="2" fill="none"/></pattern></defs><rect width="540" height="675" fill="url(#ypnet)"/></svg>';
const ypCr=(m,k,sz)=>crest(nmOf(m,k),k,sz,nmOf(m,k==="A"?"B":"A")).replace(/var\(--tA\)/g,"#FF3EA5").replace(/var\(--tB\)/g,"#5FE3F5");
const ypScW=m=>{const a=String(+m.score_a||0),b=String(+m.score_b||0);return{wkH:`<div class="yp-wk yp-scw" data-b>${ypCr(m,"A",22)}<b>${a}</b><i>–</i><b>${b}</b>${ypCr(m,"B",22)}</div>`,wkW:44+28+ypW(a+b+"–",22)+18}};
const ypWkN=m=>{if(!m)return"";if(m.state==="bitti")return igWeek(m);if(m.season==null)return"";return"HAFTA "+(fin().filter(x=>+x.season===+m.season).length+1)};
const ypSG=(id,F,f)=>F.reduce((s,m)=>s+(+(m.stats||{})[id]?.[f||"g"]||0),0);
const ypDay=()=>{const n=hkNextAny();return n?GUNLER[parseYmd(n.date).getDay()]:"–"};
const ypSn=id=>shortName(nameOf(id));
const ypGhostNone="";

// çerçeve: üst bilgi, içerik alanı (hero), alt panel (pn), alt satır
// paylaşım görselinin konusuna göre çıkartma ikon: [anahtar kelimeler, ikon, renk]
const YP_IC=[[/asist/,"krampon","cyan"],[/değer|piyasa/,"para","gold"],[/maçın adamı|oyuncusu|zirve|yıldız/,"yildiz","gold"],[/seri|istikrar|kaçırmadı|form|üst üste/,"ates","orange"],[/kaleci|eldiven/,"eldiven","green"],[/veri|kondisyon/,"simsek","green"],[/kadro|haftanın takımı|en iyi yedi|transfer|katıldı|yelek/,"yelek","pink"],[/puan durumu|şampiyon|karne|sıralama/,"kupa","gold"],[/mevki|eşleşme|kafa kafaya|ikili|defans/,"kalkan","cyan"],[/kart|rozet/,"kart","pink"],[/gol|maç sonucu|kazandı|berabere|fark attı|maç günü/,"top","pink"]];
const ypIc=(t,sz)=>{t=String(t||"").toLocaleLowerCase("tr");const m=YP_IC.find(x=>x[0].test(t))||[0,"top","pink"];return sIcon(m[1],m[2],sz||24)};
function ypPost(o){const wk=o.wkH||(o.wk?`<div class="yp-wk" data-b>${esc(TRU(o.wk))}</div>`:"");
  const wkW=o.wkH?o.wkW:o.wk?ypW(TRU(o.wk),15,800,BC,.08)+22:0;const tw=476-(wkW?wkW+16:0);const ic=o.ic===false?"":ypIc((o.ey||"")+" "+(o.ti||""),34);
  const ti=TRU(o.ti),ey=TRU(o.ey||"");const ft=TRU(o.ft||""),ig=TRU(IGH);
  const fw=476-12-ypW(ig,11,700,INF,.16);
  return `<div class="yp${o.c?" yp-"+o.c:""}" lang="tr">${o.rays===false?"":YP_RAYS}${o.bg||""}
<div class="yp-hd" data-b><div class="yp-hdl"><div class="yp-ey${ic?" yp-eyi":""}" style="font-size:${ypFit(ey,12,tw-(ic?36:0),{w:700,fam:INF,ls:.22})}px">${ic}<span>${esc(ey)}</span></div><div class="yp-ti" style="font-size:${ypFit(ti,o.tiMax||54,tw,{ls:.01})}px">${esc(ti)}</div></div>${wk}</div>
<div class="yp-hero${o.hc?" yp-"+o.hc:""}">${o.hero||""}</div>${o.pn?`<div class="yp-pn" data-b>${o.pn}</div>`:""}
<div class="yp-ft" data-b><span>${esc(ig)}</span><span style="font-size:${ypFit(ft,11,fw,{w:700,fam:INF,ls:.16})}px">${esc(ft)}</span></div>${o.c==="t"?`<div class="yp-tem" data-b><div><b>PARA YOK</b><b>BAHİS DEĞİL</b><span>Sadece keyfine oynanan bir tahmin oyunu</span></div><small>Sikke temsilidir; gerçek para değildir, satın alınamaz, parasal karşılığı yoktur.</small></div>`:""}</div>`}
const ypBdg=(b,ic)=>`<div class="yp-bdg" data-b>${ic||`<strong style="font-size:${ypFit(TRU(b[0]),42,72)}px">${esc(TRU(b[0]))}</strong>`}<small style="font-size:${ypFit(TRU(b[1]),13,80,{ls:.1})}px">${esc(TRU(b[1]))}</small></div>`;
const ypSts=L=>{const w=(476-10*(L.length-1))/L.length-24;return `<div class="yp-sts">${L.map(([v,l,on])=>`<div class="${on?"yp-on":""}"><strong style="font-size:${ypFit(TRU(v),32,w)}px">${esc(TRU(v))}</strong><small>${esc(TRU(l))}</small></div>`).join("")}</div>`};
const ypBig=(nm,age)=>{nm=TRU(nm);return `<div class="yp-big" style="font-size:${ypFit(nm+(age!=null?"    ("+age+")":""),44,476,{ls:.01})}px">${esc(nm)}${age!=null?`<span>(${age})</span>`:""}</div>`};
const ypTag=(t,wd)=>`<span class="yp-tag" style="font-size:${ypFit(TRU(t),14,(wd||476)-18,{ls:.1})}px">${esc(TRU(t))}</span>`;
// tek oyuncu: büyük fotoğraf, sağ üstte rozet, altta isim ve üç kutu
function ypPerson(o){const age=o.age===undefined?ageOf(P(o.id)):o.age;
  return ypPost({...o.f,hero:(o.heroPre||"")+ypCut(o.id)+(o.bdg?ypBdg(o.bdg,o.bdgIc):""),pn:(o.pre||"")+ypBig(o.name||nameOf(o.id),age)+(o.sts?ypSts(o.sts):"")+(o.post||"")})}
const ypRing=(pct,big,small,col,sz)=>{sz=sz||120;const r=sz/2-8,c=2*Math.PI*r,d=Math.max(0,Math.min(1,pct))*c;
  return `<div class="yp-ring" style="width:${sz}px;height:${sz}px" data-b><svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}" aria-hidden="true"><circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="#0A0232" fill-opacity=".6" stroke="#ffffff" stroke-opacity=".14" stroke-width="11"/><circle cx="${sz/2}" cy="${sz/2}" r="${r}" fill="none" stroke="${col}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${d.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${sz/2} ${sz/2})"/></svg><div><b style="font-size:${ypFit(big,sz*.28,sz-34)}px">${esc(big)}</b><small>${esc(TRU(small))}</small></div></div>`};
const ypSpark=(V,w,h,col)=>{if(!V||V.length<2)return"";const mn=Math.min(...V),mx=Math.max(...V),rg=mx-mn||1;const pts=V.map((v,i)=>[6+i*(w-12)/(V.length-1),h-8-(v-mn)/rg*(h-16)]);const d=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");const e=pts[pts.length-1];
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d} L${e[0].toFixed(1)} ${h} L6 ${h}Z" fill="${col}" fill-opacity=".15"/><path d="${d}" fill="none" stroke="${col}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${e[0].toFixed(1)}" cy="${e[1].toFixed(1)}" r="7" fill="${col}" stroke="#140552" stroke-width="3"/></svg>`};
// karşılaştırma çubukları: [etiket, sol yazı, sağ yazı, sol sayı, sağ sayı]
const ypCmp=(nA,nB,rows)=>`<div class="yp-cmp"><div class="yp-cmh"><span>${ypTx(nA,24,220,{ls:.06})}</span><span>${ypTx(nB,24,220,{ls:.06})}</span></div>${rows.map(([l,a,b,va,vb])=>{va=va===undefined?+a:va;vb=vb===undefined?+b:vb;const A=isFinite(va)?va:0,B=isFinite(vb)?vb:0;const mx=Math.max(Math.abs(A),Math.abs(B))||1;const w=A>B?1:B>A?-1:0;
  return `<div class="yp-cr2"><b style="font-size:${ypFit(String(a),21,64)}px">${esc(a)}</b><div class="yp-bar yp-l"><i class="${w>0?"yp-w":""}" style="width:${Math.max(6,Math.round(A/mx*100))}%"></i></div><span>${esc(TRU(l))}</span><div class="yp-bar"><i class="${w<0?"yp-w":""}" style="width:${Math.max(6,Math.round(B/mx*100))}%"></i></div><b style="font-size:${ypFit(String(b),21,64)}px">${esc(b)}</b></div>`}).join("")}</div>`;
// podyum: L sıralı (1., 2., 3.); her biri {id,v,l}
function ypPod(L){const col=(x,i)=>{if(!x)return"";const nm=TRU(ypSn(x.id));return `<div class="yp-p${i+1}"><div class="yp-podt" data-b>${ypAv(x.id,i===0?"XL":"L")}<div class="yp-nm" style="font-size:${ypFit(nm,18,148,{ls:.05})}px">${esc(nm)}</div></div><div class="yp-st" data-b><strong style="font-size:${ypFit(TRU(x.v),38,128)}px">${esc(TRU(x.v))}</strong><small style="font-size:${ypFit(TRU(x.l),10,132,{w:700,fam:INF,ls:.16})}px">${esc(TRU(x.l))}</small></div></div>`};
  return `<div class="yp-pod">${col(L[1],1)}${col(L[0],0)}${col(L[2],2)}</div>`}

/* --- saha: oyuncu kutuları birbirine ve etiketlere değmesin --- */
function ypPlace(T,W,bw,bh,obs){const gap=6;
  const hit=(A,B,w,h)=>[w+gap-Math.abs(A.x-B.x),h+gap-Math.abs(A.y-B.y)];
  const pass=xOnly=>{let mv=false;
    for(let a=0;a<T.length;a++){const A=T[a];
      for(let b=a+1;b<T.length;b++){const B=T[b];const[ox,oy]=hit(A,B,bw,bh);if(ox<=0||oy<=0)continue;mv=true;
        if(xOnly||ox/bw<oy/bh){const d=(A.x>B.x||(A.x===B.x&&a%2)?1:-1)*(ox/2+.3);A.x+=d;B.x-=d}else{const d=(A.y>B.y||(A.y===B.y&&a%2)?1:-1)*(oy/2+.3);A.y+=d;B.y-=d}}
      for(const o of obs||[]){const ox=(bw+o.w)/2+gap-Math.abs(A.x-o.x),oy=(bh+o.h)/2+gap-Math.abs(A.y-o.y);if(ox<=0||oy<=0)continue;mv=true;
        if(xOnly||ox/bw<oy/bh)A.x+=(A.x>=o.x?1:-1)*(ox+.3);else A.y+=(A.y>=o.y?1:-1)*(oy+.3)}}
    T.forEach(t=>{t.x=clamp(t.x,bw/2,W-bw/2);t.y=clamp(t.y,t.y0+bh/2,t.y1-bh/2)});return mv};
  for(let it=0;it<500;it++)if(!pass(false))break;
  for(let it=0;it<500;it++)if(!pass(it%3===0))break;
  return T}
// kalan çakışma var mı (kutular + engeller)
const ypClash=(T,bw,bh,obs)=>T.some((A,a)=>T.some((B,b)=>b>a&&Math.abs(A.x-B.x)<bw+2&&Math.abs(A.y-B.y)<bh+2)||(obs||[]).some(o=>Math.abs(A.x-o.x)<(bw+o.w)/2+2&&Math.abs(A.y-o.y)<(bh+o.h)/2+2));
const ypTok=(t,z)=>{const nm=TRU(t.n);return `<div class="yp-pl${t.cap?" yp-cap":""}" style="left:${(t.x-z.w/2).toFixed(1)}px;top:${(t.y-z.h/2).toFixed(1)}px;width:${z.w}px;height:${z.h}px" data-b>${ypAv(t.id,t.t,`width:${z.av}px;height:${z.av}px`)}${t.cap?(()=>{const c=Math.max(16,Math.round(z.av*.46));return `<i class="yp-cb" style="width:${c}px;height:${c}px;font-size:${Math.round(c*.62)}px;left:${(z.w/2-z.av/2-c*.25).toFixed(1)}px;top:${(6+z.av-c*.8).toFixed(1)}px">C</i>`})():""}${t.c!=null?`<span class="yp-nt${t.cc?" yp-"+t.cc:""}">${t.cc==="mo"?'<svg width="10" height="10" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17l-5.9 3.3 1.3-6.5L2.5 9.3l6.6-.8z" fill="#ffffff"/></svg>':""}${esc(t.c)}</span>`:""}<div class="yp-nm" style="font-size:${ypFit(nm,z.nm,z.w,{ls:.05})}px">${esc(nm)}${t.sub?`<small style="font-size:${ypFit(TRU(t.sub),9,z.w,{w:700,fam:INF,ls:.12})}px">${esc(TRU(t.sub))}</small>`:""}</div></div>`};
const YP_H=506,YZ1={w:104,h:94,av:64,nm:17};
const ypPitch=(H,both)=>{const W=476,m=H/2,a='fill="none" stroke="#ffffff" stroke-opacity=".3" stroke-width="2"';
  return `<svg class="yp-pitch" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" aria-hidden="true"><rect x="1" y="1" width="${W-2}" height="${H-2}" rx="10" fill="#0A0232" fill-opacity=".35" stroke="#ffffff" stroke-opacity=".3" stroke-width="2"/>`+
  (both?`<line x1="1" y1="${m}" x2="${W-1}" y2="${m}" ${a}/><circle cx="${W/2}" cy="${m}" r="44" ${a}/><rect x="138" y="1" width="200" height="64" ${a}/><rect x="188" y="1" width="100" height="26" ${a}/><rect x="138" y="${H-65}" width="200" height="64" ${a}/><rect x="188" y="${H-27}" width="100" height="26" ${a}/>`
  :`<circle cx="${W/2}" cy="1" r="56" ${a}/><rect x="128" y="${H-90}" width="220" height="89" ${a}/><rect x="186" y="${H-36}" width="104" height="35" ${a}/><path d="M190 ${H-90}a48 48 0 0 0 96 0" ${a}/>`)+`</svg>`};
// bir takımın dizilişi: kaleci üstte (top) ya da altta; y0–y1 takımın yarı sahası
function ypTeamToks(m,k,y0,y1,top,chip,z){const T=(k==="A"?m.team_a:m.team_b)||[];const L=lineupOf(m,k);const ids=L.some(x=>x&&T.includes(x))?pad7(L,T):T.slice(0,TEAM_SIZE);const ps=posArr(m,k);const cap=k==="A"?m.cap_a:m.cap_b;const out=[];
  ps.forEach(([x,y],i)=>{const id=ids[i];if(!id||!P(id))return;const fy=(clamp(y,7,85)-7)/78;const span=y1-y0-z.h;
    out.push({id,x:z.w/2+4+x/100*(476-z.w-8),y:top?y0+z.h/2+span*fy:y1-z.h/2-span*fy,y0,y1,t:k==="A"?"ta":"tb",n:ypSn(id),cap:cap===id,...chip(id)})});return out}
function ypSide(m,k,left,y){const nm=TRU(nmOf(m,k));const px=ypFit(nm,16,150,{ls:.08});const w=Math.ceil(ypW(nm,px,800,BC,.08)+22);
  return{html:`<div class="yp-side ${k==="A"?"yp-ta":"yp-tb"} ${left?"yp-l":"yp-r"}" style="top:${y-13}px;width:${w}px;font-size:${px}px" data-b>${esc(nm)}</div>`,o:{x:left?w/2:476-w/2,y,w,h:26}}}
// sığmazsa kutular küçülür; en küçük boyutta bile çakışma kalırsa o boy kullanılır (test bunu yakalar)
const YZ2S=[{w:84,h:70,av:44,nm:14},{w:80,h:66,av:42,nm:13.5},{w:76,h:62,av:38,nm:13},{w:72,h:58,av:34,nm:12}];
function ypField(m,chip){const H=YP_H,mid=H/2;const LB=ypSide(m,"B",true,mid-22),LA=ypSide(m,"A",false,mid+22);let T,z;
  for(z of YZ2S){T=ypPlace([...ypTeamToks(m,"B",0,mid,true,chip,z),...ypTeamToks(m,"A",mid,H,false,chip,z)],476,z.w,z.h,[LB.o,LA.o]);if(!ypClash(T,z.w,z.h,[LB.o,LA.o]))break}
  return ypPitch(H,true)+LB.html+LA.html+T.map(t=>ypTok(t,z)).join("")}

/* ================= maç önü ================= */
function ypMatchDay(){const n=hkNextAny();if(!n)return null;const R=rsvpLists(n);const ts=matchTs(n);const now=new Date();const d0=new Date(now.getFullYear(),now.getMonth(),now.getDate()).getTime();const dd=Math.round((parseYmd(n.date).getTime()-d0)/864e5);
  const ti=dd===0?(+(String(n.time||"21").split(":")[0])>=17?"Bu akşam maç var":"Bugün maç var"):dd===1?"Yarın maç var":GUNLER[parseYmd(n.date).getDay()]+" maç var";
  const big=n.time?String(n.time).slice(0,5):TRU(igDate(n.date));const G=R.kadro.slice(0,8);const more=R.kadro.length-G.length;
  const hero=`<div class="yp-col yp-c"><div class="yp-time" data-b style="font-size:${ypFit(big,176,476)}px">${esc(big)}</div>${G.length?`<div class="yp-row1" data-b>${G.map(p=>ypAv(p.id,"","width:46px;height:46px")).join("")}${more>0?ypTag("+"+more):""}</div>`:""}</div>`;
  const html=ypPost({ey:igDate(n.date)+(S.settings.field_name?" · "+S.settings.field_name:""),ti,wk:ypWkN(n),hc:"mid",hero,pn:ypSts([[String(R.kadro.length),"Geliyor",1],[String(R.bos.length),"Cevap vermedi"],[String(Math.max(0,CAP-R.kadro.length)),"Boş yer"]]),ft:"Gelemeyen haber versin"});
  return{html,cap:`${ti}! ${hkWhen(n)}${S.settings.field_name?" · "+S.settings.field_name:""} ⚽\n${R.kadro.length} kişi geliyor${CAP-R.kadro.length>0?", "+(CAP-R.kadro.length)+" yer boş":""}.\nGelemeyen haber versin 👇\n${HT()} #halısaha`,name:"mac-gunu-"+n.date}}
function ypKadro(m,notes){const inf=S.mInfo[m.id]||{pts:{}};
  const chip=id=>{if(notes){const r=inf.pts[id];if(!r)return{};const mo=inf.motm===id;return{c:fN(r.pts),cc:mo?"mo":r.pts>=8?"hi":r.pts<6.5?"lo":""}}return{c:P(id)?.guest?"MİS":String(ovrOf(id))}};
  const ln=k=>plOf(m,k).map(id=>shortName(nameOf(id))).join(", ");
  if(notes){const html=ypPost({ey:igDate(m.date)+" · Herkesin notu",ti:"Not karnesi",...ypScW(m),hc:"top",hero:ypField(m,chip),ft:igWeek(m)||"#halısaha"});
    return{html,cap:`${igDate(m.date)} not karnesi 📝\n${nmOf(m,"A")}: ${ln("A")}\n${nmOf(m,"B")}: ${ln("B")}\n${HT()} #halısaha`,name:"not-karnesi-"+m.date}}
  const html=ypPost({ey:hkWhen(m)+(S.settings.field_name?" · "+S.settings.field_name:""),ti:"Kadrolar açıklandı",wk:ypWkN(m),hc:"top",hero:ypField(m,chip),ft:formLabel(formOf(m,"B"),posArr(m,"B"))+" – "+formLabel(formOf(m,"A"),posArr(m,"A"))});
  return{html,cap:`Kadrolar belli oldu! ${hkWhen(m)} 📣\n${nmOf(m,"A")}: ${ln("A")}\n${nmOf(m,"B")}: ${ln("B")}\nSizce kim kazanır? 👇\n${HT()} #halısaha`,name:"kadrolar-aciklandi-"+m.date}}
// maç önü "İlk 7" afişi: takımın kadrosu solda büyük isimlerle, seçilen oyuncu sağda
const X7G={KL:0,DF:1,OS:2,FV:3};
function x7Grp(id){const p=P(id);const PG={Defans:"DF","Orta saha":"OS",Forvet:"FV",Kaleci:"KL"};return (p&&(EPOS[p.epos]?.[0]||PG[p.pos]||EPOS[eposOf(p)]?.[0]))||"OS"}
function x7Star(m,k,pid){const L=plOf(m,k);if(pid&&L.includes(pid))return pid;const cap=k==="A"?m.cap_a:m.cap_b;return L.includes(cap)?cap:L.filter(id=>P(id)&&!P(id).guest).sort((a,b)=>ovrOf(b)-ovrOf(a))[0]||L[0]}
function ypIlk7(m,k,pid){const L=plOf(m,k).slice().sort((a,b)=>X7G[x7Grp(a)]-X7G[x7Grp(b)]||ovrOf(b)-ovrOf(a));if(!L.length)return null;
  const cap=k==="A"?m.cap_a:m.cap_b,o=k==="A"?"B":"A",st=x7Star(m,k,pid),ph=photoOf(st);
  const tn=TRU(nmOf(m,k)),when=TRU(hkWhen(m)),wk=ypWkN(m);const n=L.length,rh=Math.min(56,Math.floor(450/n));
  const rows=L.map(id=>{const nm=TRU(ypSn(id)),c=id===cap;const fs=ypFit(nm,rh*.98,c?186:222,{ls:.01});
    return `<li data-b style="height:${rh}px"><i>${x7Grp(id)}</i><b style="font-size:${fs}px">${esc(nm)}</b>${c?"<em>(K)</em>":""}</li>`}).join("");
  const ftR=when+(wk?" · "+TRU(wk):"");
  const sil=`<svg viewBox="0 0 220 330" aria-hidden="true"><circle cx="110" cy="120" r="52" fill="rgba(255,255,255,.22)"/><path d="M14 330c4-82 44-136 96-136s92 54 96 136z" fill="rgba(255,255,255,.22)"/></svg>`;
  const html=`<div class="yp yp-x7 yp-x7${k.toLowerCase()}" lang="tr">
<div class="x7-ph">${ph?`<img src="${esc(ph)}" alt="">`:sil}</div>
<div class="x7-hd" data-b>${crest(nmOf(m,k),k,58,nmOf(m,o))}<span>VS</span>${crest(nmOf(m,o),o,44,nmOf(m,k))}</div><div class="x7-t" data-b>İLK 7</div>
<ul class="x7-xi">${rows}</ul>
<div class="x7-st" data-b><small>${esc(TRU(EPOS[eposOf(P(st))]?.[1]||""))}</small><b style="font-size:${ypFit(TRU(ypSn(st)),26,150)}px">${esc(TRU(ypSn(st)))}</b><em>${P(st)?.guest?"MİS":ovrOf(st)}</em></div>
<div class="x7-ft" data-b><b style="font-size:${ypFit(tn,22,210,{ls:.02})}px">${esc(tn)}</b><span style="font-size:${ypFit(ftR,11,230,{w:700,fam:INF,ls:.12})}px">${esc(ftR)}</span></div></div>`;
  return{html,cap:`${nmOf(m,k)} ilk 7 belli! ${hkWhen(m)} ⚽\n${L.map(id=>ypSn(id)+(id===cap?" (K)":"")).join(", ")}\n${HT()} #halısaha`,name:"ilk7-"+(k==="A"?"a":"b")+"-"+m.date}}
// ===== tahmin: sosyal ve yardımcılar =====
const betFollows=()=>(BET.feed&&BET.feed.f)||[];
const betPopPct=(bd,k,s)=>{const P0=bd&&bd.pop;if(!P0||P0.n<2)return 0;const n=(P0.k||{})[k+"|"+s]||0;return n?Math.round(n/P0.n*100):0};
const betLast=n=>fin().slice(-n).reverse();
function betHint(k,m){const L=betLast(5).filter(x=>x.score_a!=null);if(L.length<3)return"";const tot=L.map(x=>x.score_a+x.score_b),dif=L.map(x=>Math.abs(x.score_a-x.score_b));
  const ln={t95:9.5,t125:12.5,t155:15.5}[k];if(ln){const u=tot.filter(x=>x>ln).length;return `Son ${L.length} maçın ${u} tanesi ${String(ln).replace(".",",")} üstü bitti (toplam gol: ${tot.join(", ")}).`}
  if(k==="aralik")return `Son ${L.length} maçta toplam gol: ${tot.join(", ")}.`;
  if(k==="sonuc"||k==="fark"||k==="hnd")return `Son ${L.length} maçta fark: ${dif.join(", ")}${dif.includes(0)?` · ${dif.filter(x=>!x).length} beraberlik`:""}.`;
  if(k==="iki6"){const n=L.filter(x=>x.score_a>=6&&x.score_b>=6).length;return `Son ${L.length} maçın ${n} tanesinde iki takım da 6+ gol attı.`}
  if(k==="ta55"||k==="tb55"){const a=(tot.reduce((t,x)=>t+x,0)/L.length/2).toFixed(1).replace(".",",");return `Son ${L.length} maçta takım başına ortalama ${a} gol.`}
  return""}
function betPHint(pid){const L=betLast(5).filter(x=>x.stats&&x.stats[pid]);if(L.length<2)return"";const g=L.map(x=>+(x.stats[pid].g||0)),a=L.reduce((t,x)=>t+(+(x.stats[pid].a||0)),0);
  return `${shortName(nameOf(pid))} son ${L.length} maçta: ${g.join(", ")} gol${a?` · ${a} asist`:""}.`}
// günün tahmini: makul oranlı 3 seçim
function betDailyLegs(bd){const me=myPid();const legs=[];const so=bd.markets.find(x=>x.k==="sonuc");
  if(so){const f=so.o.filter(o=>o.s!=="X").sort((a,b)=>a.odd-b.odd)[0];if(f)legs.push({k:"sonuc",s:f.s,l:"Maç sonucu · "+f.l,odd:f.odd})}
  const tl=["t125","t95","t155"].map(k=>bd.markets.find(x=>x.k===k)).filter(Boolean).flatMap(x=>x.o.map(o=>({k:x.k,s:o.s,l:x.t+" · "+o.l,odd:o.odd}))).filter(o=>o.odd>=1.5&&o.odd<=2.4).sort((a,b)=>a.odd-b.odd)[0];if(tl)legs.push(tl);
  let pb=null;for(const p of bd.players||[]){if(p.x||p.p===me)continue;for(const o of p.o)if(o.k.startsWith("g2:")&&o.odd>=1.35&&o.odd<=2.6&&(!pb||o.odd<pb.odd))pb={k:o.k,s:"e",l:nameOf(p.p)+" · "+o.l,odd:o.odd}}if(pb)legs.push(pb);
  return legs}
function betDaily(m,bd){if(!bd.open)return"";const L=betDailyLegs(bd);if(L.length<2)return"";const od=L.reduce((t,l)=>t*l.odd,1);
  return `<section class="card bday"><div class="bday-h"><span>${dIcon("ampul","gold",22)}<b>Günün tahmini</b></span><em class="num">× ${fO(od)}</em></div><ul>${L.map(l=>`<li><span>${esc(l.l)}</span><b class="num">${fO(l.odd)}</b></li>`).join("")}</ul><button class="btn sm" data-act="betDaily">Tahmine ekle</button></section>`}
// maç önü yorumu
function betTalk(m,bd){const L=betLast(5).filter(x=>x.score_a!=null);const out=[];
  const so=bd.markets.find(x=>x.k==="sonuc");if(so){const[a,,b]=so.o;const fav=a.odd<b.odd?a:b;out.push(Math.abs(a.odd-b.odd)<.25?`Oranlar başa baş: ${a.l} ${fO(a.odd)}, ${b.l} ${fO(b.odd)}.`:`Favori ${fav.l} (${fO(fav.odd)}).`)}
  if(L.length>=3){const tot=L.map(x=>x.score_a+x.score_b);const av=(tot.reduce((t,x)=>t+x,0)/L.length).toFixed(1).replace(".",",");out.push(`Son ${L.length} maçta maç başına ortalama ${av} gol atıldı.`)}
  let top=null;for(const p of bd.players||[])for(const o of p.o)if(o.k.startsWith("g2:")&&(!top||o.odd<top.odd))top={p:p.p,odd:o.odd};
  if(top){const h=betPHint(top.p);out.push(`Golcü favorisi ${shortName(nameOf(top.p))}${h?", son maçlardaki golleri: "+h.split(": ")[1]:"."}`)}
  if(bd.pop&&bd.pop.n)out.push(`Şimdiye kadar ${bd.pop.n} kişi tahmin yaptı.`);
  return out.length?`<section class="card btalk">${dIcon("duduk","cyan",22)}<p>${out.map(esc).join(" ")}</p></section>`:""}
// rozetler (sezon tahminlerinden)
function betBadges(pid){const F=BET.feed;if(!F)return[];const C=F.rows.filter(c=>c.p===pid&&c.z!=="acik").sort((a,b)=>Date.parse(a.at)-Date.parse(b.at));const out=[];
  if(C.some(c=>c.z==="kazandi"&&c.odd>=5))out.push(["🎯","Sürpriz avcısı"]);
  let st=0,mx=0;for(const c of C){if(c.z==="kazandi"){st++;mx=Math.max(mx,st)}else if(c.z==="kaybetti")st=0}if(mx>=3)out.push(["🔥",mx+" tahmin üst üste"]);
  if(C.some(c=>c.z==="kazandi"&&(c.legs||[]).length>=3))out.push(["🧩","Kombine ustası"]);
  const lm=fin().slice(-1)[0];if(lm){const net={};F.rows.filter(c=>c.m===lm.id&&c.z!=="acik").forEach(c=>net[c.p]=(net[c.p]||0)+c.py-c.st);const best=Object.entries(net).sort((a,b)=>b[1]-a[1])[0];if(best&&best[0]===pid&&best[1]>0&&!(BET.kral&&BET.kral.hist))out.push(["👑","Haftanın kralı"])}
  {const H=(BET.kral&&BET.kral.hist||[]).filter(x=>x.p===pid).length;if(H)out.push(["👑",H>1?H+" kez haftanın tahmin kralı":"Haftanın tahmin kralı"]);const om=typeof openMatch==="function"?openMatch():null;if(om&&yelekMuaf(om)===pid)out.push(["🦺","Bu maçta yelek giymiyor"])}
  return out}
const betCopyOk=b=>{const m=betNext();return m&&b.m===m.id&&BET.board[m.id]&&BET.board[m.id].open};
// düello: iki oyuncunun net kazancı
function betDuelData(a,b){const F=BET.feed;if(!F)return null;const net=(p,mid)=>F.rows.filter(c=>c.p===p&&(!mid||c.m===mid)&&c.z!=="acik"&&c.z!=="iade").reduce((t,c)=>t+c.py-c.st,0);
  const lm=fin().slice(-1)[0];return{a:net(a),b:net(b),wa:lm?net(a,lm.id):0,wb:lm?net(b,lm.id):0,lm}}
const betRival=(R,me)=>{const i=R.findIndex(r=>r.p===me);return S.f.bduel&&P(S.f.bduel)&&S.f.bduel!==me?S.f.bduel:(R[i>0?i-1:1]||{}).p};
function betDuelCard(R,me){if(!me||R.length<2)return"";const riv=betRival(R,me);if(!riv)return"";const d=betDuelData(me,riv);if(!d)return"";
  const side=(p,v,w)=>`<div>${avatar(P(p),"md")}<b>${esc(shortName(nameOf(p)))}</b><em class="num ${v>0?"pos":v<0?"neg":""}">${v>0?"+":""}${fJ(v)}</em><small>son maç ${w>0?"+":""}${fJ(w)}</small></div>`;
  return `<section class="card bduel"><div class="bduel-h"><b>Tahmin düellosu</b><select class="pmsel" data-bind="f.bduel" aria-label="Rakip">${R.filter(r=>r.p!==me).map(r=>`<option value="${esc(r.p)}"${r.p===riv?" selected":""}>${esc(nameOf(r.p))}</option>`).join("")}</select></div>
    <div class="bduel-v">${side(me,d.a,d.wa)}<span>VS</span>${side(riv,d.b,d.wb)}</div><p class="muted small">${d.a===d.b?"Şimdilik berabere.":(d.a>d.b?"Öndesin, ":"Gerideysin, ")+`fark ${fJ(Math.abs(d.a-d.b))} sikke.`}</p></section>`}
const betDefAmt=()=>{try{return localStorage.getItem("y_bet_amt")||""}catch(_){return""}};
// ===== tahmin paylaşımları =====
const TAHMIN_PM=["tduel","kupon","oran","kimne","tuttu","tkup","tkral","ttab"];
const betCTitle=c=>(c.legs||[]).length>1?`Kombine · ${c.legs.length} seçim`:((c.legs||[])[0]?.l||"Tahmin");
function betMine(mid,z){const me=myPid();if(!me)return[];const L=BET.lists[me];if(!L){betLoad("list",me);return[]}return L.rows.filter(c=>c.m===mid&&(!z||c.z===z))}
const ypLegs=(L,ok)=>`<ul class="yp-bl">${L.map(l=>`<li data-b>${ok?`<i>✓</i>`:""}<span style="font-size:${ypFit(l.l,16,ok?340:370,{w:600,fam:INF})}px">${esc(l.l)}</span><b>${fO(l.odd)}</b></li>`).join("")}</ul>`;
function ypKupon(m,cid){if(!isMember())return null;const L=betMine(m.id,"acik");const c=L.find(x=>x.id===cid)||L[0];if(!c)return null;const me=myPid();const nm=TRU(shortName(nameOf(me)));const lg=c.legs||[];
  const hero=`<div class="yp-tik"><div class="yp-tikh" data-b>${ypAv(me,"","width:56px;height:56px")}<div><b style="font-size:${ypFit(nm,28,300)}px">${esc(nm)}</b><small>${lg.length>1?"Kombine · "+lg.length+" seçim":"Tek tahmin"}</small></div></div>${ypLegs(lg)}
    <div class="yp-tikc"></div><div class="yp-tiks" data-b><div><small>OYNANAN SİKKE</small><b>${fJ(c.st)}</b></div><span>× ${fO(c.odd)}</span><div class="r"><small>OLASI KAZANÇ · SİKKE</small><b>${fJ(Math.round(c.st*c.odd))}</b></div></div></div>`;
  return{html:ypPost({c:"t",ey:igDate(m.date)+" · Tahmin",ti:"Tahminim",hc:"mid",hero,ft:"Oran "+fO(c.odd)}),cap:`Tahminim hazır 🎟️ ${nmOf(m,"A")} – ${nmOf(m,"B")}\n${lg.map(l=>"• "+l.l+" ("+fO(l.odd)+")").join("\n")}\nOran ${fO(c.odd)} · ${fJ(c.st)} sikke → ${fJ(Math.round(c.st*c.odd))}\n${HT()} #tahmin`,name:"kuponum-"+m.date}}
function ypTuttu(m,cid){if(!isMember())return null;const L=betMine(m.id,"kazandi");const c=L.find(x=>x.id===cid)||L.slice().sort((a,b)=>(b.py-b.st)-(a.py-a.st))[0];if(!c)return null;const me=myPid();const nm=TRU(shortName(nameOf(me)));
  const hero=`<div class="yp-tut"><div class="yp-tikh">${ypAv(me,"","width:56px;height:56px")}<div data-b><b style="font-size:${ypFit(nm,28,200)}px">${esc(nm)}</b><small>${(c.legs||[]).length>1?"Kombine · "+c.legs.length+" seçim":"Tek tahmin"} · oran ${fO(c.odd)}</small></div><span class="yp-stamp" data-b>TUTTU</span></div>${ypLegs(c.legs||[],1)}
    <div class="yp-tutb" data-b><small>${fJ(c.st)} sikke oynadı, kazandı</small><b>+${fJ(c.py-c.st)}<i>sikke</i></b></div></div>`;
  return{html:ypPost({ey:igDate(m.date)+` · ${TRU(nmOf(m,"A"))} ${m.score_a}–${m.score_b} ${TRU(nmOf(m,"B"))}`,c:"t",ti:"Tahmin tuttu",hc:"mid",hero,ft:"Oran "+fO(c.odd)}),cap:`Tahmin tuttu! 🎉 ${fJ(c.st)} sikke → ${fJ(c.py)} sikke\n${(c.legs||[]).map(l=>"✅ "+l.l).join("\n")}\n${HT()} #tahmin`,name:"kupon-tuttu-"+m.date}}
function ypOran(m){if(!isMember())return null;const bd=BET.board[m.id];if(!bd){betLoad("board",m.id);return null}const mk=k=>bd.markets.find(x=>x.k===k);const so=mk("sonuc"),ar=mk("aralik");if(!so)return null;
  let fav=null;for(const p of bd.players||[])for(const o of p.o)if(o.k.startsWith("g2:")&&(!fav||o.odd<fav.odd))fav={p:p.p,odd:o.odd};
  const mx=ar?Math.max(...ar.o.map(o=>1/o.odd)):1;const t=matchTs(m);
  const hero=`<div class="yp-or"><div class="yp-or3">${so.o.map((o,i)=>`<div class="${["a","x","b"][i]}" data-b><small style="font-size:${ypFit(TRU(o.l),13,130,{w:700,fam:INF})}px">${esc(TRU(o.l))}</small><b>${fO(o.odd)}</b></div>`).join("")}</div>
    ${ar?`<div class="yp-orr" data-b><h4>TOPLAM GOL</h4>${ar.o.map(o=>`<div><span>${esc(o.l)}</span><i style="width:${Math.round((1/o.odd)/mx*220)}px"></i><b>${fO(o.odd)}</b></div>`).join("")}</div>`:""}
    ${fav&&P(fav.p)?`<div class="yp-orf" data-b>${ypAv(fav.p,"","width:48px;height:48px")}<span><small>GOLCÜ FAVORİSİ</small>${esc(shortName(nameOf(fav.p)))} · 2+ gol</span><b>${fO(fav.odd)}</b></div>`:""}</div>`;
  return{html:ypPost({ey:igDate(m.date)+(m.time?" · "+String(m.time).slice(0,5):""),c:"t",ti:"Maçın oranları",hc:"mid",hero,ft:"Kapanış "+new Date(t-BET_CLOSE).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}),cap:`Maçın oranları 📊 ${nmOf(m,"A")} ${fO(so.o[0].odd)} · Berabere ${fO(so.o[1].odd)} · ${nmOf(m,"B")} ${fO(so.o[2].odd)}\nTahminini Yelek'te yap!\n${HT()} #tahmin`,name:"mac-oranlari-"+m.date}}
function ypKimne(m){if(!isMember())return null;const F=BET.feed;if(!F){betLoad("feed");return null}const C=F.rows.filter(c=>c.m===m.id);if(!C.length)return null;
  const so={"1":0,"X":0,"2":0};let sn=0;const cnt={};let jet=0;let brave=null;
  for(const c of C){jet+=c.st;if(!brave||c.odd>brave.odd)brave=c;for(const l of c.legs||[]){if(l.k==="sonuc"&&so[l.s]!=null){so[l.s]++;sn++}const key=l.l;(cnt[key]=cnt[key]||new Set()).add(c.p)}}
  const top=Object.entries(cnt).sort((a,b)=>b[1].size-a[1].size)[0];const pc=k=>sn?Math.round(so[k]/sn*100):0;
  const bar=sn?`<div class="yp-kn" data-b>${[["1","a",nmOf(m,"A")],["X","x","X"],["2","b",nmOf(m,"B")]].filter(([k])=>so[k]>0).map(([k,c,l])=>`<div class="${c}" style="flex:${so[k]}"><small>${esc(TRU(l.length>10?l.slice(0,9)+"…":l))}</small>%${pc(k)}</div>`).join("")}</div>`:"";
  const hero=`<div class="yp-kno">${bar}<div class="yp-knt" data-b><div><b>${C.length}</b><small>TAHMİN</small></div><div><b>${fJ(jet)}</b><small>SİKKE OYNANDI</small></div></div>
    ${top?`<div class="yp-knc" data-b><span><small>EN ÇOK OYNANAN</small><em style="font-size:${ypFit(top[0],16,300,{w:600,fam:INF})}px">${esc(top[0])}</em></span><b>${top[1].size} kişi</b></div>`:""}
    ${brave&&P(brave.p)?`<div class="yp-knc" data-b><span><small>EN CESUR TAHMİN</small><em>${esc(shortName(nameOf(brave.p)))} · ${esc(betCTitle(brave).length>26?((brave.legs||[]).length+"'li kombine"):betCTitle(brave))}</em></span><b>× ${fO(brave.odd)}</b></div>`:""}</div>`;
  return{html:ypPost({ey:igDate(m.date)+" · Tahmin",c:"t",ti:"Kim neye oynadı?",hc:"mid",hero,ft:"#tahmin"}),cap:`Kim neye oynadı? 🤔 ${C.length} tahmin, ${fJ(jet)} sikke\n${sn?`${nmOf(m,"A")} %${pc("1")} · X %${pc("X")} · ${nmOf(m,"B")} %${pc("2")}\n`:""}${HT()} #tahmin`,name:"kim-neye-oynadi-"+m.date}}
function ypTduel(){if(!isMember())return null;const me=myPid();const T=BET.tbl;if(!T){betLoad("tbl");return null}if(!BET.feed){betLoad("feed");return null}
  const R=betRank(T);const riv=betRival(R,me);if(!me||!riv)return null;const d=betDuelData(me,riv);if(!d)return null;
  const side=(p,v,w,c)=>{const nm=TRU(shortName(nameOf(p)));return `<div class="${c}" data-b>${ypAv(p,"","width:120px;height:120px")}<b style="font-size:${ypFit(nm,30,200)}px">${esc(nm)}</b><em class="${v>0?"pos":v<0?"neg":""}">${v>0?"+":""}${fJ(v)}</em><small>son maç ${w>0?"+":""}${fJ(w)}</small></div>`};
  const hero=`<div class="yp-du">${side(me,d.a,d.wa,"a")}<span class="vs">VS</span>${side(riv,d.b,d.wb,"b")}</div>`;
  const lead=d.a===d.b?"Berabere":(d.a>d.b?shortName(nameOf(me)):shortName(nameOf(riv)))+" önde";
  return{html:ypPost({ey:"Sezon "+T.season+" · Tahmin",ti:"Tahmin düellosu",hc:"mid",hero,ft:lead}),cap:`Tahmin düellosu ⚔️ ${nameOf(me)} ${d.a>0?"+":""}${fJ(d.a)} – ${nameOf(riv)} ${d.b>0?"+":""}${fJ(d.b)}\n${HT()} #tahmin`,name:"tahmin-duellosu"}}
function ypTtab(){if(!isMember())return null;const T=BET.tbl;if(!T){betLoad("tbl");return null}const L=betRankW(T).slice(0,6);if(!L.length)return null;
  const hero=`<div class="yp-tt">${L.map((r,i)=>`<div class="${i?"":"f"}" data-b><b class="k">${i+1}</b>${ypAv(r.p,"","width:44px;height:44px")}<span><em style="font-size:${ypFit(TRU(shortName(nameOf(r.p))),17,200,{w:700,fam:INF})}px">${esc(shortName(nameOf(r.p)))}</em><small>${r.won}/${r.n} tuttu</small></span><b class="v ${r.net>0?"pos":r.net<0?"neg":""}">${r.net>0?"+":""}${fJ(r.net)}<i>sikke</i></b></div>`).join("")}</div>`;
  return{html:ypPost({c:"t",ey:betWkLabel(T.wk)+" · Tahmin",ti:"Haftanın tahmin tablosu",hc:"mid",hero,ft:"Her hafta 5.000 sikkeyle yeni yarış"}),cap:`Haftanın tahmin tablosu 📈\n${L.map((r,i)=>(i+1)+". "+nameOf(r.p)+" "+(r.net>0?"+":"")+fJ(r.net)).join("\n")}\n${HT()} #tahmin`,name:"tahmin-tablosu"}}
// paylaşım: haftanın tahmini ve tahmin kralı
function ypTkup(m){if(!isMember())return null;const W=BET.week[m.id];if(!W){betLoad("week",m.id);return null}const c=(W.rows||[])[0];if(!c||!P(c.p))return null;
  const L=c.legs||[];const nm=TRU(nameOf(c.p));
  const hero=`<div class="yp-tk"><div class="yp-tkh" data-b>${ypAv(c.p,"","width:76px;height:76px")}<div><b style="font-size:${ypFit(nm,34,330)}px">${esc(nm)}</b><small>${L.length>1?"Kombine · "+L.length+" seçim":"Tek tahmin"} · oran ${fO(c.odd)}</small></div></div>
  <ul class="yp-tkl">${L.map(l=>`<li data-b><span style="font-size:${ypFit(l.l,16,370,{w:600,fam:INF})}px">${esc(l.l)}</span><b>${fO(l.odd)}</b></li>`).join("")}</ul>
  <div class="yp-tkf" data-b><span>${fJ(c.st)} sikke oynadı</span><b>+${fJ(c.py-c.st)}</b><small>sikke kazandı</small></div></div>`;
  const html=ypPost({ey:igDate(m.date)+" · Tahmin",c:"t",ti:"Haftanın tahmini",wk:igWeek(m),hc:"mid",hero,ft:W.n?`${W.n} tahminden ${W.won} tanesi tuttu`:"#tahmin"});
  return{html,cap:`Haftanın tahmini: ${nameOf(c.p)} ${fJ(c.st)} sikkeyle ${fJ(c.py)} sikke aldı 🎯\n${L.map(l=>"• "+l.l).join("\n")}\n${HT()} #halısaha`,name:"haftanin-kuponu-"+m.date}}
function ypTkral(){if(!isMember())return null;const T=BET.tbl;if(!T){betLoad("tbl");return null}
  const L=betRank(T).slice(0,3);if(!L.length)return null;
  const html=ypPost({c:"t",ey:"Sezon "+T.season+" · Tahmin",ti:"Sezonun tahmin kralı",hero:ypPod(L.map(r=>({id:r.p,v:(r.net>0?"+":"")+fJ(r.net),l:"sikke · "+r.won+"/"+r.n+" tuttu"}))),ft:"#tahminkralı"});
  return{html,cap:`Tahmin kralı yarışı 🎯\n${L.map((r,i)=>(i+1)+". "+nameOf(r.p)+" "+(r.net>0?"+":"")+fJ(r.net)+" sikke").join("\n")}\n${HT()} #halısaha`,name:"tahmin-krali"}}
function ypDuel(m){const PG={Defans:"DF","Orta saha":"OS",Forvet:"FV",Kaleci:"KL",DF:"DF",OS:"OS",FV:"FV",KL:"KL"};const grp=id=>{const p=P(id);return p.epos&&EPOS[p.epos]?EPOS[p.epos][0]:PG[p.pos]||EPOS[eposOf(p)]?.[0]};
  const best=(k,g)=>plOf(m,k).filter(id=>P(id)&&!P(id).guest&&grp(id)===g).sort((a,b)=>ovrOf(b)-ovrOf(a))[0];
  const R=[["DF","Defans"],["OS","Orta saha"],["FV","Forvet"]].map(([g,l])=>[l,best("A",g),best("B",g)]).filter(r=>r[1]&&r[2]);if(!R.length)return null;
  const side=(id,t,r,up)=>{const n=TRU(ypSn(id));return `<div class="yp-dqs${r?" yp-r":""}">${ypAv(id,t,"width:64px;height:64px")}<div class="yp-dqt"><b style="font-size:${ypFit(n,24,128,{ls:.04})}px">${esc(n)}</b><em class="${up?"yp-up":""}">${ovrOf(id)}</em></div></div>`};
  const na=TRU(nmOf(m,"A")),nb=TRU(nmOf(m,"B"));
  const hero=`<div class="yp-dq"><div class="yp-dqh" data-b><span class="yp-ta" style="font-size:${ypFit(na,15,200,{ls:.08})}px">${esc(na)}</span><span class="yp-tb" style="font-size:${ypFit(nb,15,200,{ls:.08})}px">${esc(nb)}</span></div>${R.map(([l,a,b])=>`<div class="yp-dqr" data-b>${side(a,"ta",0,ovrOf(a)>ovrOf(b))}<span class="yp-dqm">${esc(TRU(l))}</span>${side(b,"tb",1,ovrOf(b)>ovrOf(a))}</div>`).join("")}</div>`;
  const html=ypPost({ey:hkWhen(m)+" · Sizce kim fark yaratır?",ti:"Kritik eşleşmeler",wk:ypWkN(m),hc:"mid",hero,ft:nmOf(m,"A")+" – "+nmOf(m,"B")});
  return{html,cap:`Kritik eşleşmeler ⚔️\n${R.map(([l,a,b])=>l+": "+nameOf(a)+" vs "+nameOf(b)).join("\n")}\n${hkWhen(m)} · Sizce kim fark yaratır?\n${HT()} #halısaha`,name:"kritik-esleme-"+m.date}}
function ypOut(){const L=S.players.filter(p=>!p.guest&&!p.archived&&UNAVAIL.includes(stOf(p)));if(!L.length)return null;const sh=L.slice(0,6),n=sh.length,big=n<=3,cw=(476-20)/Math.min(n,3);
  const ready=S.players.filter(p=>!p.guest&&!p.archived&&!UNAVAIL.includes(stOf(p))).length;
  const cell=p=>{const X=STATUS[stOf(p)];const u=p.status?.until;const d=u?"Dönüş "+fmtShort(u):["izinli","yogun"].includes(stOf(p))?"Bu hafta yok":"Dönüş belirsiz";const nm=TRU(shortName(p.name));
    return `<div data-b>${ypAv(p.id,big?"XL":"L")}<div class="yp-nm" style="margin-top:10px;font-size:${ypFit(nm,big?24:20,cw-8,{ls:.05})}px">${esc(nm)}</div><div style="margin-top:8px">${ypTag(X.label,cw)}</div><div class="yp-lbl" style="margin-top:8px;font-size:${ypFit(TRU(d),11,cw-8,{w:700,fam:INF,ls:.16})}px">${esc(TRU(d))}</div></div>`};
  const html=ypPost({c:"r",ey:"Bu hafta kenarda",ti:"Kadro dışı",wk:ypWkN(hkNextAny()),hc:"mid",hero:`<div class="yp-grid" style="--n:${Math.min(n,3)}">${sh.map(cell).join("")}</div>`,
    pn:ypSts([[String(L.length),"Oyuncu kenarda",1],[String(ready),"Hazır oyuncu"],[ypDay(),"Sıradaki maç"]]),ft:"Geçmiş olsun"});
  return{html,cap:`Bu hafta kadroda olmayanlar 🚑\n${L.map(p=>p.name+" ("+STATUS[stOf(p)].label.toLowerCase()+")").join("\n")}\nGeçmiş olsun! 💜\n${HT()} #halısaha`,name:"kadro-disi"}}

/* ================= maç ================= */
function ypScore(m){const inf=S.mInfo[m.id]||{pts:{}};const a=+m.score_a||0,b=+m.score_b||0;const nA=nmOf(m,"A"),nB=nmOf(m,"B");
  const tm=k=>{const cid=k==="A"?m.cap_a:m.cap_b;const ok=cid&&P(cid);const nm=TRU(nmOf(m,k));const kp="KPT · "+TRU(ypSn(cid));
    return `<div class="yp-tm" data-b>${ok?ypAv(cid,"XL "+(k==="A"?"ta":"tb")):`<div class="yp-crw">${ypCr(m,k,100)}</div>`}<b style="font-size:${ypFit(nm,20,150,{ls:.07})}px">${esc(nm)}</b>${ok?`<small style="font-size:${ypFit(kp,10,150,{w:700,fam:INF,ls:.14})}px">${esc(kp)}</small>`:""}</div>`};
  let sp=112;while(sp>40&&ypW(String(a),sp)+ypW(String(b),sp)+44>150)sp-=2;
  const sc=k=>plOf(m,k).map(id=>[id,+(m.stats||{})[id]?.g||0]).filter(x=>x[1]>0).sort((x,y)=>y[1]-x[1]);
  const chips=L=>`<div class="yp-chips">${L.slice(0,5).map(([id,g])=>{const t=TRU(ypSn(id));return `<span style="font-size:${ypFit(t+(g>1?" ×"+g:""),14,210,{ls:.06})}px">${esc(t)}${g>1?`<i>×${g}</i>`:""}</span>`}).join("")}${L.length>5?`<span>+${L.length-5}</span>`:""}${L.length?"":"<span>–</span>"}</div>`;
  const hd=a===b?"Berabere":(Math.abs(a-b)>=4?(a>b?nA:nB)+" fark attı":(a>b?nA:nB)+" kazandı");const mo=inf.motm,r=mo&&inf.pts[mo];
  const lb=k=>`<div class="yp-lbl" style="font-size:${ypFit(TRU(nmOf(m,k))+" GOL",11,226,{w:700,fam:INF,ls:.16})}px">${esc(TRU(nmOf(m,k)))} GOL</div>`;
  const mt=mo?"MAÇIN ADAMI · "+TRU(ypSn(mo))+(r?" · "+fN(r.pts):""):"";
  const pn=`<div class="yp-two"><div>${lb("A")}${chips(sc("A"))}</div><div>${lb("B")}${chips(sc("B"))}</div></div>${mo?`<div class="yp-mini">${sIcon("yildiz","gold",28,-10)}<span style="font-size:${ypFit(mt,15,400,{ls:.06})}px">${esc(mt)}</span></div>`:""}`;
  const html=ypPost({ey:igDate(m.date)+" · Maç sonucu",ti:hd,wk:igWeek(m),hc:"mid",hero:`<div class="yp-sb">${tm("A")}<div class="yp-sc" data-b style="font-size:${sp}px"><span>${a}</span><em></em><span>${b}</span></div>${tm("B")}</div>`,pn,ft:S.settings.field_name||"#halısaha"});
  const gl=[...sc("A"),...sc("B")].map(([id,g])=>shortName(nameOf(id))+(g>1?" "+g:"")).join(" · ");
  return{html,cap:`${igDate(m.date)} · ${nA} ${a}–${b} ${nB} ${a===b?"🤝":"🔥"}\n${mo?nameOf(mo)+" maçın adamı ⭐\n":""}${gl?"⚽ "+gl+"\n":""}${HT()} #halısaha #yelek`,name:"mac-sonucu-"+m.date}}
const ypMG=(m,id)=>{const s=(m.stats||{})[id]||{};return{g:+s.g||0,a:+s.a||0}};
function ypMotm(m){const inf=S.mInfo[m.id]||{pts:{}};const id=inf.motm;if(!id)return null;const r=inf.pts[id];const{g,a}=ypMG(m,id);
  const html=ypPerson({id,f:{ey:hkMatchFt(m),ti:"Maçın adamı",...ypScW(m),ft:"#maçınadamı"},bdg:[r?fN(r.pts):"–","Not"],sts:[[String(g),"Gol",1],[String(a),"Asist"],[eposOf(P(id)),"Mevki"]]});
  return{html,cap:`Maçın adamı: ${nameOf(id)} ⭐\n${igDate(m.date)} · ${nmOf(m,"A")} ${m.score_a}–${m.score_b} ${nmOf(m,"B")}${r?" · not "+fN(r.pts):""}\n${HT()} #maçınadamı #halısaha`,name:"macin-adami-"+m.date}}
function ypTotw(m){const inf=S.mInfo[m.id]||{pts:{}};const T=inf.totw||[];if(!T.length)return null;const fk=T.form||"2-3-1",sl=T.slot||{};const z=YZ1,H=YP_H;
  const rows={KL:[],DF:[],OS:[],FV:[]};T.forEach(id=>{const r=sl[id]||inf.pts[id]?.role||"OS";(rows[r]||rows.OS).push(id)});const Y={KL:7,DF:30,OS:56,FV:83};const toks=[];
  for(const r of["KL","DF","OS","FV"])rows[r].forEach((id,i,L)=>{const x=(i+1)/(L.length+1)*100,fy=(Y[r]-7)/78,k=plOf(m,"A").includes(id)?"A":"B";const v=inf.pts[id]?.pts;const mo=inf.motm===id;
    toks.push({id,x:z.w/2+4+x/100*(476-z.w-8),y:H-z.h/2-(H-z.h)*fy,y0:0,y1:H,t:k==="A"?"ta":"tb",n:ypSn(id),cap:mo,c:fN(v),cc:mo?"mo":v>=8?"hi":v<6.5?"lo":""})});
  ypPlace(toks,476,z.w,z.h,[]);
  const html=ypPost({ey:igDate(m.date)+" · En iyi yedi",ti:"Haftanın takımı",wk:fk,hc:"top",hero:ypPitch(H,false)+toks.map(t=>ypTok(t,z)).join(""),ft:igWeek(m)||"#haftanıntakımı"});
  const by=r=>rows[r].map(id=>shortName(nameOf(id))+" "+fN(inf.pts[id]?.pts)).join(", ");
  return{html,cap:`Haftanın takımı · ${igDate(m.date)} · ${fk} 🟩\n🧤 ${by("KL")}\n🛡️ ${by("DF")}\n🎯 ${by("OS")}\n⚡ ${by("FV")}\n${HT()} #haftanıntakımı #halısaha`,name:"haftanin-takimi-"+m.date}}
function ypData(m){if(!trkHas(m))return null;const B=trkBest(m).filter(o=>["km","hiz","pas","tk"].includes(o.k));if(!B.length)return null;
  const U={km:"KM",hiz:"KM/S",pas:"PAS",tk:""};const tile=o=>{const v=fTrk(o.k,o.v);const nm=TRU(ypSn(o.id));return `<div class="yp-dt" data-b><small>${esc(TRU(o.l))}</small><div class="yp-dtr">${ypAv(o.id,plOf(m,"A").includes(o.id)?"ta":"tb","width:46px;height:46px;margin:0")}<b style="font-size:${ypFit(v+" "+U[o.k],34,150)}px">${esc(v)}<em>${U[o.k]}</em></b></div><span style="font-size:${ypFit(nm,15,190,{ls:.06})}px">${esc(nm)}</span></div>`};
  const rows=[["km","Koşu (km)"],["pas","Pas"],["isa","Pas isabeti"],["spr","Sprint"],["tk","Top kapma"]].map(([k,l])=>{const a=trkSum(m,"A",k),b=trkSum(m,"B",k);return a==null&&b==null?null:[l,fTrk(k,a),fTrk(k,b),a||0,b||0]}).filter(Boolean).slice(0,4);
  const hero=`<div class="yp-col"><div class="yp-grid" style="--n:2;gap:10px">${B.map(tile).join("")}</div>${rows.length?`<div data-b>${ypCmp(nmOf(m,"A"),nmOf(m,"B"),rows)}</div>`:""}</div>`;
  const html=ypPost({ey:igDate(m.date)+" · Akıllı Saha verileri",ti:"Maçın verileri",...ypScW(m),hc:"mid",hero,ft:igWeek(m)||"#halısaha"});
  return{html,cap:`Maçın verileri · ${igDate(m.date)} 📊\n${B.map(o=>o.l+": "+nameOf(o.id)+" "+fTrk(o.k,o.v)+(o.k==="km"?" km":o.k==="hiz"?" km/s":"")).join("\n")}\nVeriler: Akıllı Saha\n${HT()} #halısaha`,name:"macin-verileri-"+m.date}}
function ypGoal(m){const inf=S.mInfo[m.id]||{pts:{}};const id=inf.gol;if(!id)return null;const{g}=ypMG(m,id);const F=fin().filter(x=>+x.season===+m.season);const sg=ypSG(id,F);
  const as=[...new Set((m.links||[]).filter(x=>x&&x.g===id&&x.a&&P(x.a)).map(x=>x.a))];
  const html=ypPerson({id,f:{ey:hkMatchFt(m),ti:"Haftanın golü",...ypScW(m),bg:YP_NET,ft:"#haftanıngolü"},bdg:[String(sg||g||1),"Sezonda"],sts:[[String(g||1),"Bu maçta gol",1],[String(sg||g||1),"Sezonda gol"],[as.length?ypSn(as[0]):"–","Asist"]]});
  return{html,cap:`Haftanın golü ${nameOf(id)}'den ⚽🔥\n${igDate(m.date)}${as.length?"\nAsist: "+as.map(nameOf).join(", "):""}\n${HT()} #haftanıngolü #halısaha`,name:"haftanin-golu-"+m.date}}
function ypFiy(m){const inf=S.mInfo[m.id]||{pts:{}};const id=inf.fiy;if(!id)return null;const r=inf.pts[id];
  const html=ypPerson({id,f:{c:"r",ey:hkMatchFt(m),ti:"Haftanın fiyaskosu",...ypScW(m),ft:"Gelecek hafta telafi"},bdg:[r?fN(r.pts):"–","Not"],sts:[[r?fN(r.pts):"–","Maç notu",1],[String(S.stats[id]?.fiy||1)+".","Fiyaskosu"],[ypDay(),"Rövanş"]]});
  return{html,cap:`Haftanın fiyaskosu… ${nameOf(id)} 🙈\nGelecek hafta rövanş var!\n${HT()} #fiyasko #halısaha`,name:"fiyasko-"+m.date}}

/* ================= oyuncu ================= */
const ypFc=(p,tag)=>{const ph=photoOf(p.id);const nm=TRU(p.name);return `<div class="yp-fc" data-b><div class="yp-o">${p.guest?"MİS":ovrOf(p.id)}</div><div class="yp-m">${esc(eposOf(p))}</div>${tag?ypTag(tag,90):""}<div class="yp-ph">${ph?`<img src="${esc(ph)}" alt="">`:`<svg viewBox="0 0 256 320" width="146" height="182" aria-hidden="true"><circle cx="128" cy="100" r="56" fill="#ffffff" fill-opacity=".5"/><path d="M14 320c0-82 51-128 114-128s114 46 114 128z" fill="#ffffff" fill-opacity=".5"/></svg>`}</div><div class="yp-b" style="font-size:${ypFit(nm,28,226,{ls:.06})}px">${esc(nm)}</div></div>`};
function ypCard(p){const{yr,F}=hkSeason();let g=0,a=0,n=0,mo=0;F.forEach(m=>{const r=S.mInfo[m.id]?.pts?.[p.id];if(r){n++;g+=r.g||0;a+=r.a||0}if(S.mInfo[m.id]?.motm===p.id)mo++});
  const lt=ligTable(F);const li=lt.findIndex(x=>x.id===p.id);const age=ageOf(p);
  const ch=[n+" maç",g?g+" gol":"",a?a+" asist":"",mo?mo+" kez maçın adamı":""].filter(Boolean);
  const html=ypPost({ey:"Sezon "+yr,ti:"Kartını tanı",hc:"mid",hero:ypFc(p),pn:ypSts([[fM(mvOf(p.id)),"Piyasa değeri",1],[age!=null?String(age):"–","Yaş"],[li>=0?(li+1)+".":"–","Ligde"]])+`<div class="yp-chips">${ch.map(t=>`<span>${esc(TRU(t))}</span>`).join("")}</div>`,ft:"#yelek"});
  return{html,cap:`Kartını tanı: ${p.name} 🃏\n${ovrOf(p.id)} reyting · ${fM(mvOf(p.id))}\n${HT()} #halısaha #yelek`,name:"kart-"+p.name}}
function ypValue(p){const m=mvInfo(p.id);if(!m)return null;const d=m.prev!=null?Math.round((m.v-m.prev)*10)/10:0;const up=d>0,dn=d<0;const c=up?"g":dn?"r":"";
  const V=(S.stats[p.id]?.series||[]).slice(-10);const sp=ypSpark(V,230,120,YAC[c]);
  const right=`<div class="yp-side2" data-b>${d?ypTag((up?"▲ ":"▼ ")+fM(Math.abs(d)),230):ypTag(fM(m.v),230)}${sp?`<div style="margin-top:12px">${sp}</div><div class="yp-lbl" style="margin-top:6px">REYTİNG · SON ${V.length} MAÇ</div>`:""}</div>`;
  const html=ypPost({c,ey:"Transfer piyasası",ti:up?"Değeri arttı":dn?"Değeri düştü":"Piyasa değeri",wk:igWeek(lastFinM()),hero:`<div class="yp-row">${ypCut(p.id,"max-height:280px")}${right}</div>`,
    pn:ypBig(p.name,ageOf(p))+ypSts([[fM(m.v),"Piyasa değeri",1],[d?(up?"+":"−")+fM(Math.abs(d)):"–","Son değişim"],[String(ovrOf(p.id)),"Reyting"]]),ft:"#transfer"});
  return{html,cap:`${p.name} · ${fM(m.v)}${d?` (${up?"▲":"▼"} ${fM(Math.abs(d))})`:""} 📈\n${HT()} #transfer #halısaha`,name:"deger-"+p.name}}
function ypStreak(p){const st=S.stats[p.id]?.streak;if(!st)return null;const num=(String(st.t).match(/\d+/)||[])[0];
  const H=(S.stats[p.id]?.hist||[]).filter(h=>h.r).slice(-5);
  const frm=H.length?`<div class="yp-lbl" style="margin-top:14px">SON ${H.length} MAÇ NOTU</div><div class="yp-frm">${H.map(h=>`<div class="${h.r.pts>=8?"yp-hi":h.r.pts<6.5?"yp-lo":""}">${fN(h.r.pts)}</div>`).join("")}</div>`:"";
  const html=ypPerson({id:p.id,f:{c:st.hot?"":"r",ey:"Form grafiği",ti:st.hot?"Seri sürüyor":"Kötü seri",wk:igWeek(lastFinM()),ft:"#halısaha"},bdg:num?[num,"Maçtır"]:[String(ovrOf(p.id)),"Reyting"],pre:`<div class="yp-pre">${ypTag(st.t)}</div>`,post:frm});
  return{html,cap:`${p.name}: ${st.t} ${st.hot?"🔥":"🥶"}\n${HT()} #halısaha`,name:"seri-"+p.name}}
function ypBadges(p){const B=(S.stats[p.id]?.badges||[]).filter(b=>!b.shame);if(!B.length)return null;const b4=B.slice(0,4);const cw=(476-10)/2-24-46-12;
  const meds=`<div class="yp-meds">${b4.map(b=>`<div class="yp-med"><i>${esc(b.i)}</i><div><b style="font-size:${ypFit(TRU(b.t),18,cw,{ls:.04})}px">${esc(TRU(b.t))}</b><small>${esc(b.d)}</small></div></div>`).join("")}</div>`;
  const html=ypPost({ey:"Sezon "+curYr(),ti:"Rozetler",wk:B.length+" rozet",hero:ypCut(p.id),pn:ypBig(p.name,ageOf(p))+meds,ft:"#halısaha"});
  return{html,cap:`${p.name}'in rozetleri 🏅\n${B.map(b=>b.t+" ("+b.d+")").join("\n")}\n${HT()} #halısaha`,name:"rozetler-"+p.name}}
function ypCaptain(p){const L=fin().filter(m=>m.cap_a===p.id||m.cap_b===p.id);if(!L.length)return null;const o={G:0,B:0,M:0};
  L.forEach(m=>{const k=m.cap_a===p.id?"A":"B";const my=k==="A"?+m.score_a:+m.score_b,op=k==="A"?+m.score_b:+m.score_a;o[my>op?"G":my<op?"M":"B"]++});
  const html=ypPerson({id:p.id,f:{ey:"Kaptanlık karnesi",ti:"Kaptan",wk:L.length+" maç",ft:"#kaptan"},heroPre:`<div class="yp-tl">${ypRing(o.G/L.length,"%"+Math.round(o.G/L.length*100),"Galibiyet",YAC[""],110)}</div>`,bdg:["C","Kaptan"],sts:[[String(o.G),"Galibiyet",1],[String(o.B),"Beraberlik"],[String(o.M),"Mağlubiyet"]]});
  return{html,cap:`Kaptan ${p.name} © ${L.length} maçta ${o.G}G ${o.B}B ${o.M}M\n${HT()} #halısaha`,name:"kaptan-"+p.name}}
function ypStatus(p){const st=stOf(p);if(st==="hazir"||st==="belirsiz")return null;const X=STATUS[st];const hd={sakat:"Sakatlandı",hasta:"Hasta",izinli:"İzinde",yogun:"İş yoğun"}[st]||X.label;
  const ic=["sakat","hasta"].includes(st)?`<svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" style="display:block;margin:0 auto 4px"><path d="M9 3h6v6h6v6h-6v6H9v-6H3V9h6z" fill="#ffffff"/></svg>`:`<svg width="40" height="40" viewBox="0 0 24 24" aria-hidden="true" style="display:block;margin:0 auto 4px"><circle cx="12" cy="12" r="9" fill="none" stroke="#ffffff" stroke-width="2.4"/><path d="M12 7v5l3 3" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round"/></svg>`;
  const html=ypPerson({id:p.id,f:{c:"r",ey:"Kadro haberi",ti:hd,ft:"Geçmiş olsun"},bdg:[" ",X.flag||X.label],bdgIc:ic,sts:[[p.status?.until?fmtShort(p.status.until):"Belirsiz","Dönüş",1],[String(ovrOf(p.id)),"Reyting"],[fM(mvOf(p.id)),"Piyasa değeri"]]});
  return{html,cap:`${p.name} · ${X.label.toLowerCase()}${p.status?.until?", "+fmtShort(p.status.until)+"'e kadar yok":""} 🚑\nGeçmiş olsun! 💜\n${HT()} #halısaha`,name:"durum-"+p.name}}
function ypH2H(p,q){if(!q||q.id===p.id)return null;const{yr,F}=hkSeason();
  const agg=id=>{let n=0,g=0,a=0,s=0;F.forEach(m=>{const r=S.mInfo[m.id]?.pts?.[id];if(r){n++;g+=r.g||0;a+=r.a||0;s+=r.pts}});return{n,g,a,av:n?s/n:null}};const A=agg(p.id),B=agg(q.id);
  const html=ypPost({ey:"Sezon "+yr+" · Kim daha iyi?",ti:"Kafa kafaya",hero:`<div class="yp-duo">${ypCut(p.id)}<div class="yp-vs" data-b>VS</div>${ypCut(q.id)}</div>`,
    pn:ypCmp(ypSn(p.id),ypSn(q.id),[["Reyting",String(ovrOf(p.id)),String(ovrOf(q.id))],["Değer",fM(mvOf(p.id)),fM(mvOf(q.id)),mvOf(p.id),mvOf(q.id)],["Gol",String(A.g),String(B.g)],["Asist",String(A.a),String(B.a)],["Not ort.",fN(A.av),fN(B.av),A.av??0,B.av??0]]),ft:"Yorumlara yaz"});
  return{html,cap:`Kafa kafaya ⚔️ ${p.name} mi ${q.name} mi?\nYorumlara yaz 👇\n${HT()} #halısaha`,name:"kafa-kafaya"}}
function ypNew(p){const n=S.players.filter(x=>!x.guest&&!x.archived).length;
  const html=ypPost({ey:"Yeni transfer · Hoş geldin",ti:"Aramıza katıldı",hc:"mid",hero:ypFc(p,"Yeni"),pn:ypSts([[eposOf(p),"Mevki",1],[ageOf(p)!=null?String(ageOf(p)):"–","Yaş"],[fM(mvOf(p.id)),"Başlangıç değeri"]]),ft:"Kadro "+n+" kişi oldu"});
  return{html,cap:`Aramıza hoş geldin ${p.name}! 🤝\n${eposOf(p)} · ${ovrOf(p.id)} reyting\n${HT()} #halısaha #yelek`,name:"yeni-"+p.name}}
function ypBday(p){const{F}=hkSeason();const t=new Date();const age=ageOf(p);
  const html=ypPerson({id:p.id,age:null,f:{c:"gd",ey:t.getDate()+" "+AYLAR[t.getMonth()],ti:"İyi ki doğdun",ft:"Nice gollere"},bdg:age!=null?[String(age),"Yaşında"]:null,sts:[[String(ovrOf(p.id)),"Reyting",1],[String(ypSG(p.id,F)),"Bu sezon gol"],[String(S.stats[p.id]?.games||0),"Toplam maç"]]});
  return{html,cap:`İyi ki doğdun ${p.name}! 🎂${age!=null?" "+age+" yaşın kutlu olsun.":""}\nNice gollere ⚽\n${HT()} #halısaha`,name:"dogum-gunu-"+p.name}}
const YP_MS={mac:[10,25,50,75,100,150,200,250,300],gol:[10,25,50,75,100,150,200],asist:[10,25,50,75,100]};
function ypMile(p){let c={mac:0,gol:0,asist:0},last=null;
  fin().forEach((m,i)=>{if(!plAll(m).includes(p.id))return;const{g,a}=ypMG(m,p.id);const b={...c};c.mac++;c.gol+=g;c.asist+=a;
    for(const t of["mac","asist","gol"])for(const v of YP_MS[t])if(b[t]<v&&c[t]>=v)last={t,v,m}});
  if(!last)return null;const lb={mac:"maç",gol:"gol",asist:"asist"}[last.t];
  const html=ypPerson({id:p.id,f:{ey:"Kilometre taşı",ti:last.v+". "+lb,wk:igWeek(last.m),ft:igDate(last.m.date)},bdg:[String(last.v),lb],sts:[[String(c.mac),"Maç",last.t==="mac"],[String(c.gol),"Gol",last.t==="gol"],[String(c.asist),"Asist",last.t==="asist"]]});
  return{html,cap:`${p.name} ${last.v}. ${lb}ına ulaştı! 🎉\n${c.mac} maç · ${c.gol} gol · ${c.asist} asist\n${HT()} #halısaha`,name:"kilometre-"+p.name}}

/* ================= sezon ================= */
const ypHw=F=>"HAFTA "+F.length+"/"+sLen();
function ypMvp(){const{F}=hkSeason();const L=yelekAll(F).filter(o=>o.tot>0);if(!L.length)return null;const t=L.slice(0,3);
  const html=ypPost({ey:"Sezonun oyuncusu yarışı",ti:F.length>=sLen()?"Sezonun oyuncusu":"Zirve yarışı",wk:ypHw(F),hero:ypPod(t.map((o,i)=>({id:o.id,v:fP(o.tot),l:(i+1)+". · Puan"}))),ft:t[1]?"Fark "+fP(t[0].tot-t[1].tot)+" puan":"#halısaha"});
  return{html,cap:`Sezonun oyuncusu yarışı · Hafta ${F.length} 🏆\n${t.map((o,i)=>(i+1)+". "+nameOf(o.id)+" "+fP(o.tot)).join("\n")}\n${HT()} #halısaha`,name:"zirve-yarisi"}}
function ypMarket(){const L=S.players.filter(p=>!p.guest&&!p.archived).map(p=>{const m=mvInfo(p.id);return m&&m.prev!=null?{p,v:m.v,d:Math.round((m.v-m.prev)*10)/10}:null}).filter(x=>x&&x.d>0).sort((a,b)=>b.d-a.d).slice(0,3);
  if(!L.length)return null;const tot=S.players.filter(p=>!p.guest&&!p.archived).reduce((a,p)=>a+mvOf(p.id),0);
  const html=ypPost({c:"g",ey:"Transfer piyasası",ti:"Değeri artanlar",wk:igWeek(lastFinM()),hero:ypPod(L.map(x=>({id:x.p.id,v:"▲ "+fN1(x.d),l:fM(x.v)}))),ft:"Kadro değeri "+fM(tot)});
  return{html,cap:`Transfer piyasası 📈\n${L.map(x=>x.p.name+" "+fM(x.v)+" (▲ "+fM(x.d)+")").join("\n")}\n${HT()} #transfer #halısaha`,name:"transfer-piyasasi"}}
function ypRiser(){const L=S.players.filter(p=>!p.guest&&!p.archived).map(p=>{const s=S.stats[p.id];const b=s?.series?.[0];return b!=null?{p,b:Math.round(b),o:ovrOf(p.id)}:null}).filter(x=>x&&x.o-x.b>0).sort((a,b)=>(b.o-b.b)-(a.o-a.b)||b.o-a.o);if(!L.length)return null;const x=L[0];
  const V=(S.stats[x.p.id]?.series||[]).slice(-12);const nb=String(x.b),no=String(x.o);let px=92;while(px>40&&ypW(nb+no,px)+64>214)px-=2;
  const right=`<div class="yp-side2" data-b><div class="yp-arw" style="font-size:${px}px"><span>${nb}</span><svg width="40" height="30" viewBox="0 0 40 30" aria-hidden="true"><path d="M2 15h32M24 4l12 11-12 11" fill="none" stroke="#00FF85" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg><b>${no}</b></div>${V.length>1?`<div style="margin-top:12px">${ypSpark(V,230,100,YAC.g)}</div><div class="yp-lbl" style="margin-top:6px">REYTİNG · ${V.length} MAÇ</div>`:""}</div>`;
  const html=ypPost({c:"g",ey:"Sezon "+curYr(),ti:"Yükselen yıldız",hero:`<div class="yp-row">${ypCut(x.p.id,"max-height:280px")}${right}</div>`,pn:ypBig(x.p.name,ageOf(x.p))+ypSts([["+"+(x.o-x.b),"Reyting artışı",1],[String(S.stats[x.p.id]?.games||0),"Maç"],[eposOf(x.p),"Mevki"]]),ft:"#halısaha"});
  return{html,cap:`Yükselen yıldız: ${x.p.name} ⬆️ ${x.b} → ${x.o}\n${HT()} #halısaha`,name:"yukselen-yildiz"}}
function ypMonth(){const lm=lastFinM();if(!lm)return null;const k=lm.date.slice(0,7);const F=fin().filter(m=>m.date.slice(0,7)===k);const L=yelekAll(F).filter(o=>o.tot>0);if(!L.length)return null;
  const o=L[0];const ay=AYLAR[+k.slice(5,7)-1];let g=0,a=0;F.forEach(m=>{const r=S.mInfo[m.id]?.pts?.[o.id];if(r){g+=r.g||0;a+=r.a||0}});
  const html=ypPerson({id:o.id,f:{ey:ay+" "+k.slice(0,4)+" · "+F.length+" maç",ti:ay+" ayının oyuncusu",ft:"#ayınoyuncusu"},bdg:[fP(o.tot),"Puan"],sts:[[String(g),"Gol",1],[String(a),"Asist"],[String(o.n),"Maç"]]});
  return{html,cap:`${ay} ayının oyuncusu: ${nameOf(o.id)} 🌟\n${HT()} #ayınoyuncusu #halısaha`,name:"ayin-oyuncusu-"+k}}
function ypDuo(){const{yr,F}=hkSeason();const ids=S.players.filter(p=>!p.guest&&!p.archived).map(p=>p.id);let best=null;
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){let n=0,W=0,D=0;F.forEach(m=>{for(const k of["A","B"]){const T=plOf(m,k);if(T.includes(ids[i])&&T.includes(ids[j])){n++;const my=k==="A"?+m.score_a:+m.score_b,op=k==="A"?+m.score_b:+m.score_a;if(my>op)W++;else if(my===op)D++}}});
    if(n>=2){const sc=(W+D*.5)/n;if(!best||sc>best.sc||(sc===best.sc&&n>best.n))best={a:ids[i],b:ids[j],n,W,D,L:n-W-D,sc}}}
  if(!best)return null;const du=Object.entries(S.duo||{}).filter(([k])=>k.split(">").every(id=>P(id)&&!P(id).guest)).sort((x,y)=>y[1]-x[1])[0];const pct=best.W/best.n;
  const nm=ypSn(best.a)+" + "+ypSn(best.b);
  const html=ypPost({ey:"Sezon "+yr+" · Aynı takımda",ti:"En iyi ikili",hero:`<div class="yp-duo yp-sm">${ypCut(best.a)}${ypRing(pct,"%"+Math.round(pct*100),"Galibiyet",YAC[""],110)}${ypCut(best.b)}</div>`,
    pn:ypBig(nm,null)+ypSts([[String(best.n),"Birlikte maç",1],[best.W+"-"+best.D+"-"+best.L,"G-B-M"],du?[String(du[1]),"Gol: "+ypSn(du[0].split(">")[0])+" → "+ypSn(du[0].split(">")[1])]:["–","En golcü ikili"]]),ft:"#halısaha"});
  return{html,cap:`En iyi ikili 🤝 ${nameOf(best.a)} & ${nameOf(best.b)}\nBirlikte ${best.n} maç, ${best.W} galibiyet\n${HT()} #halısaha`,name:"en-iyi-ikili"}}
function ypLoyal(){const{F}=hkSeason();if(!F.length)return null;const act=S.players.filter(p=>!p.guest&&!p.archived);const c={};F.forEach(m=>plAll(m).forEach(id=>{if(P(id)&&!P(id).guest&&!P(id).archived)c[id]=(c[id]||0)+1}));
  const E=Object.entries(c).sort((a,b)=>b[1]-a[1]);if(!E.length)return null;const full=E.filter(x=>x[1]===F.length);const L=(full.length?full:E.slice(0,4)).slice(0,8);
  const avg=act.length?Math.round(act.reduce((s,p)=>s+(c[p.id]||0),0)/(act.length*F.length)*100):0;
  const cell=([id,n])=>{const nm=TRU(ypSn(id));const r=38,ci=2*Math.PI*r,d=n/F.length*ci;
    return `<div data-b><div class="yp-rav"><svg width="88" height="88" viewBox="0 0 88 88" aria-hidden="true"><circle cx="44" cy="44" r="${r}" fill="none" stroke="#ffffff" stroke-opacity=".14" stroke-width="5"/><circle cx="44" cy="44" r="${r}" fill="none" stroke="#FF3EA5" stroke-width="5" stroke-linecap="round" stroke-dasharray="${d.toFixed(1)} ${ci.toFixed(1)}" transform="rotate(-90 44 44)"/></svg>${ypAv(id,"","width:64px;height:64px")}</div><div class="yp-nm" style="margin-top:6px;font-size:${ypFit(nm,16,108,{ls:.05})}px">${esc(nm)}<small>${n}/${F.length}</small></div></div>`};
  const html=ypPost({ey:"Sezon "+curYr()+" · "+F.length+" maç",ti:full.length?"Hiç kaçırmadı":"En istikrarlılar",wk:F.length+"/"+F.length,hc:"mid",hero:`<div class="yp-grid" style="--n:${Math.min(4,L.length)}">${L.map(cell).join("")}</div>`,
    pn:ypSts([[String(full.length),"Her maçta",1],["%"+avg,"Ortalama katılım"],[String(act.length),"Kadro"]]),ft:full.length>8?"+"+(full.length-8)+" oyuncu daha":"Demir adamlar"});
  return{html,cap:`${full.length?"Hiç maç kaçırmayanlar":"En istikrarlılar"} 💪\n${L.map(([id])=>nameOf(id)).join(", ")}\n${HT()} #halısaha`,name:"devamlilik"}}
const ypTiles=(rows,cols,sz)=>`<div class="yp-grid" style="--n:${cols}">${rows.map(([l,id,v])=>{const nm=TRU(ypSn(id));const cw=(476-10*(cols-1))/cols-20;return `<div class="yp-tile" data-b>${ypAv(id,sz||"L")}<div class="yp-ey" style="font-size:${ypFit(TRU(l),10,cw,{w:700,fam:INF,ls:.14})}px">${esc(TRU(l))}</div><b style="font-size:${ypFit(nm,sz?20:24,cw,{ls:.04})}px">${esc(nm)}</b><small>${esc(TRU(v))}</small></div>`}).join("")}</div>`;
function ypMid(){const{yr,F}=hkSeason();if(F.length<3)return null;const lt=ligTable(F);const ag=yrAgg(F);const mv=yelekAll(F).filter(o=>o.tot>0)[0];
  const rows=[["Lider",lt[0]&&lt[0].id,lt[0]?lt[0].p+" puan":""],["Gol kralı",ag.g?.id,ag.g?ag.g.v+" gol":""],["Asist kralı",ag.a?.id,ag.a?ag.a.v+" asist":""],["Sezonun oyuncusu",mv?.id,mv?fP(mv.tot)+" puan":""]].filter(r=>r[1]);
  const pr=Math.min(1,F.length/sLen());
  const hero=`<div class="yp-col"><div class="yp-prog" data-b><div><span>HAFTA ${F.length}</span><span>${sLen()}</span></div><div class="yp-bar yp-bb"><i class="yp-w" style="width:${Math.round(pr*100)}%"></i></div></div>${ypTiles(rows,2)}</div>`;
  const html=ypPost({ey:"Sezon "+yr+" · Yarı yol",ti:"Ara karne",hc:"top",hero,ft:"#halısaha"});
  return{html,cap:`Sezon ${yr} ara karnesi 📊\n${rows.map(([l,id,v])=>l+": "+nameOf(id)+" ("+v+")").join("\n")}\n${HT()} #halısaha`,name:"ara-karne"}}
function ypPosRace(k){const{F}=hkSeason();const R=yelekRace(F)[k]||[];const L=R.filter(o=>o.tot>0).slice(0,3);if(!L.length)return null;const aw=POS_AW.find(x=>x[0]===k);
  const hd={FV:"Sezonun forveti",OS:"Sezonun orta sahası",DF:"Sezonun defansı",KL:"Sezonun kalecisi"}[k];
  const html=ypPost({ey:"Mevki yarışı · "+ROLE_NAME[k],ti:hd,wk:ypHw(F),hero:ypPod(L.map((o,i)=>({id:o.id,v:fP(o.tot),l:(i+1)+". · Puan"}))),ft:"#halısaha"});
  return{html,cap:`${hd} yarışı ${aw?aw[2]:""}\n${L.map((o,i)=>(i+1)+". "+nameOf(o.id)+" "+fP(o.tot)).join("\n")}\n${HT()} #halısaha`,name:"yaris-"+k}}
function ypTable(){const{yr,F}=hkSeason();if(!F.length)return null;const L=ligTable(F);if(!L.length)return null;const n=L.length;
  // herkes görünür: 12 kişiye kadar tek sütun, fazlasında iki sütun
  const two=n>12,per=two?Math.ceil(n/2):n,rh=Math.max(two?24:30,Math.min(46,Math.floor((506-26)/per)-4)),avs=rh-(two?8:10),fs=Math.min(17,rh*.5);
  const row=(o,i)=>{const nm=TRU(two?ypSn(o.id):nameOf(o.id));const av=o.av>0?"+"+o.av:String(o.av);const nw=two?96:196;
    return `<div class="yp-tr${two?" yp-t2":""}${i===0?" yp-lead":""}" style="height:${rh}px;font-size:${fs}px"><b class="yp-tn">${i+1}</b>${ypAv(o.id,"",`width:${avs}px;height:${avs}px`)}<span class="yp-tnm" style="font-size:${ypFit(nm,fs,nw,{ls:.04})}px">${esc(nm)}</span><span>${o.n}</span>${two?"":`<span>${o.G}-${o.B}-${o.M}</span><span>${esc(av)}</span>`}<b class="yp-tp">${o.p}</b></div>`};
  const head=two?`<div class="yp-th yp-t2"><span>#</span><span></span><span>OYUNCU</span><span>O</span><span>P</span></div>`:`<div class="yp-th"><span>#</span><span></span><span>OYUNCU</span><span>O</span><span>G-B-M</span><span>AV</span><span>P</span></div>`;
  const col=(R,o)=>`<div class="yp-tbl" data-b>${head}${R.map((x,i)=>row(x,i+o)).join("")}</div>`;
  const hero=two?`<div class="yp-tbl2">${col(L.slice(0,per),0)}${col(L.slice(per),per)}</div>`:col(L,0);
  const html=ypPost({ey:"Sezon "+yr+" · "+F.length+" maç",ti:"Puan durumu",wk:ypHw(F),hc:"top",hero,ft:n+" oyuncu"});
  return{html,cap:`Puan durumu · Sezon ${yr}, hafta ${F.length} 📊\n${L.slice(0,5).map((o,i)=>(i+1)+". "+nameOf(o.id)+" "+o.p+" puan").join("\n")}\n${HT()} #halısaha`,name:"puan-durumu"}}
function ypKing(f){const{yr,F}=hkSeason();const t={};F.forEach(m=>Object.entries(m.stats||{}).forEach(([id,s])=>{if(!P(id)||P(id).guest)return;t[id]=t[id]||{g:0,a:0};t[id].g+=+s.g||0;t[id].a+=+s.a||0}));
  const o=f==="g"?"a":"g";const L=Object.entries(t).filter(([,v])=>v[f]>0).sort((x,y)=>y[1][f]-x[1][f]||x[1][o]-y[1][o]).slice(0,3);if(!L.length)return null;
  const lb=f==="g"?"Gol":"Asist",ob=f==="g"?"asist":"gol";
  const html=ypPost({ey:"Sezon "+yr+" · "+lb+" yarışı",ti:lb+" krallığı",wk:ypHw(F),hero:ypPod(L.map(([id,v])=>({id,v:String(v[f]),l:lb+" · "+v[o]+" "+ob}))),ft:f==="g"?"#golkralı":"#asistkralı"});
  return{html,cap:`${lb} krallığı yarışı ⚽\n${L.map(([id,v],i)=>(i+1)+". "+nameOf(id)+" "+v[f]).join("\n")}\n${HT()} #halısaha`,name:(f==="g"?"gol":"asist")+"-kralligi"}}
function ypFinal(){const n=[...seasonsAll()].reverse().find(x=>seasonDone(x));if(n==null)return null;const w=seasonAwards(n);if(!w||!w.champ)return null;
  const rows=[["Gol kralı",w.g?.id,w.g?w.g.v+" gol":""],["Asist kralı",w.a?.id,w.a?w.a.v+" asist":""],["Altın eldiven",w.pos?.KL?.id,w.pos?.KL?fP(w.pos.KL.tot)+" puan":""],["Sezonun oyuncusu",w.mvp?.id,w.mvp?fP(w.mvp.tot)+" puan":""]].filter(r=>r[1]).slice(0,3);
  const ic=`<svg width="44" height="44" viewBox="0 0 24 24" aria-hidden="true" style="display:block;margin:0 auto 4px"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8M9 17h6" fill="none" stroke="#140552" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const html=ypPost({c:"gd",ey:"Sezon "+n+" finali",ti:"Şampiyon",wk:w.champ.p+" puan",hero:ypCut(w.champ.id)+ypBdg(["","Kupa"],ic),pn:`<div class="yp-cen">${ypBig(nameOf(w.champ.id),null)}</div>`+(rows.length?`<div style="margin-top:12px">${ypTiles(rows,rows.length,"S")}</div>`:""),ft:"#şampiyon"});
  return{html,cap:`Sezon ${n} şampiyonu: ${nameOf(w.champ.id)} 🏆\n${rows.map(([l,id])=>l+": "+nameOf(id)).join("\n")}\n${HT()} #şampiyon #halısaha`,name:"sezon-"+n+"-finali"}}

const PM_ITEMS={
  once:[["ilk7","İlk 7"],["kadro","Kadrolar açıklandı"],["duel","Kritik eşleşme"],["out","Kadro dışı"]],
  mac:[["skor","Maç sonucu"],["motm","Maçın adamı"],["totw","Haftanın takımı"],["gol","Haftanın golü"],["fiy","Fiyasko"],["kadro","Not karnesi"],["veri","Maçın verileri"]],
  oyuncu:[["kart","Kartını tanı"],["deger","Piyasa değeri"],["seri","Seri"],["rozet","Rozetler"],["kaptan","Kaptanlık"],["durum","Sakatlık / durum"],["h2h","Kafa kafaya"],["yeni","Aramıza katıldı"],["dogum","Doğum günü"],["km","Kilometre taşı"]],
  sezon:[["tablo","Puan durumu"],["mvp","Zirve yarışı"],["golk","Gol krallığı"],["asistk","Asist krallığı"],["piyasa","Değeri artanlar"],["yildiz","Yükselen yıldız"],["ay","Ayın oyuncusu"],["ikili","En iyi ikili"],["sadik","Hiç kaçırmayanlar"],["karne","Ara karne"],["yFV","Sezonun forveti"],["yOS","Sezonun orta sahası"],["yDF","Sezonun defansı"],["yKL","Sezonun kalecisi"],["final","Sezon finali"]],
  tahmin:[["kupon","Tahminim"],["oran","Maçın oranları"],["kimne","Kim neye oynadı?"],["tuttu","Tuttu!"],["tkup","Haftanın tahmini"],["thafta","Haftanın tahmin kralı"],["ttab","Haftalık tahmin tablosu"],["tkral","Sezonun tahmin kralı"]]};
const PM_EMPTY={tduel:"Düello için iki oyuncunun da sonuçlanmış tahmini olmalı.",kupon:"Sıradaki maç için açık tahminin yok. Bu hafta ekranındaki Tahmin kartından tahmin yapınca burada paylaşabilirsin.",oran:"Sıradaki maçın kadroları açıklanınca oranlar hazır olur.",kimne:"Sıradaki maç için henüz tahmin yapılmadı.",tuttu:"Bu maçta tutan tahminin yok.",ttab:"Henüz sonuçlanmış tahmin yok.",tkup:"Bu maçta tutan tahmin yok (ya da tahmin oyununa üye girişiyle bakılmalı).",tkral:"Henüz sonuçlanmış tahmin yok.",thafta:"Henüz kazananı ilan edilmiş bir hafta yok.",veri:"Bu maçın saha verileri girilmedi. Maç detayında Saha sekmesinden girebilirsin.",once:"Sıradaki maçın takımları henüz kurulmadı.",gun:"Planlanmış bir maç yok.",out:"Şu an sakat, hasta ya da izinli oyuncu yok.",seri:"Bu oyuncunun şu an süren bir serisi yok.",rozet:"Bu oyuncunun henüz rozeti yok.",kaptan:"Bu oyuncu henüz kaptanlık yapmadı.",durum:"Bu oyuncu şu an hazır görünüyor; durumu sakat, hasta ya da izinli yapılınca bu gönderi açılır.",h2h:"Karşılaştırmak için ikinci bir oyuncu seç.",km:"Bu oyuncu henüz 10 maça, 10 gole ya da 10 asiste ulaşmadı.",golk:"Bu sezon henüz gol yok.",asistk:"Bu sezon henüz asist yok.",karne:"Ara karne en az 3 maç oynandıktan sonra hazırlanır.",final:"Sezon finali, sezon bitince hazırlanır."};
function pmPlayers(){return S.players.filter(p=>!p.guest&&!p.archived).sort((a,b)=>a.name.localeCompare(b.name,"tr"))}
const pmNewest=()=>S.players.filter(p=>!p.guest&&!p.archived).sort((a,b)=>String(b.created_at||"").localeCompare(String(a.created_at||"")))[0];
const pmPid=(f,it)=>f.pid||(it==="yeni"?pmNewest()?.id:null)||S.me||pmPlayers()[0]?.id;
function igBuild(){const f=S.f.pm||(S.f.pm={tab:"mac",fmt:"post"});const ms=fin().slice().sort((a,b)=>matchTs(b)-matchTs(a));const m=S.matches.find(x=>x.id===f.mid&&x.state==="bitti")||ms[0];
  const k=f.item||PM_ITEMS[f.tab][0][0];
  if(f.tab==="tahmin"){const not=x=>{if(x&&x.cap&&!x.cap.includes("bahis değil"))x.cap=x.cap.replace(/\n([^\n]*)$/,"\nPara yok, bahis değil: sadece keyfine oynanan bir tahmin oyunu. Sikke temsilidir.\n$1");return x};
    if(k==="kupon"||k==="oran"||k==="kimne"){const b=betNext();if(!b)return null;return not(k==="kupon"?ypKupon(b,f.cid):k==="oran"?ypOran(b):ypKimne(b))}
    if(k==="tuttu"||k==="tkup"){if(!m)return null;return not(k==="tuttu"?ypTuttu(m,f.cid):ypTkup(m))}return not(k==="thafta"?ypThafta():k==="tkral"?ypTkral():ypTtab())}
  if(f.tab==="mac"){if(!m)return null;if(k==="tuttu")return ypTuttu(m,f.cid);return({skor:ypScore,motm:ypMotm,totw:ypTotw,gol:ypGoal,fiy:ypFiy,veri:ypData,tkup:ypTkup,kadro:mm=>ypKadro(mm,true)}[k]||ypScore)(m)}
  if(f.tab==="once"){if(k==="gun")return ypMatchDay();if(k==="out")return ypOut();if(k==="kupon"||k==="oran"||k==="kimne"){const b=betNext();if(!b)return null;return k==="kupon"?ypKupon(b,f.cid):k==="oran"?ypOran(b):ypKimne(b)}const n=hkNext();if(!n)return null;if(k==="ilk7")return ypIlk7(n,f.x7k||"A",f.x7p);return k==="duel"?ypDuel(n):ypKadro(n,false)}
  if(f.tab==="oyuncu"){const p=P(pmPid(f,k))||pmPlayers()[0];if(!p)return null;
    if(k==="h2h"){const q=P(f.pid2)||pmPlayers().filter(x=>x.id!==p.id&&posOf(x)===posOf(p)).sort((a,b)=>ovrOf(b.id)-ovrOf(a.id))[0];return ypH2H(p,q)}
    return({kart:ypCard,deger:ypValue,seri:ypStreak,rozet:ypBadges,kaptan:ypCaptain,durum:ypStatus,yeni:ypNew,dogum:ypBday,km:ypMile}[k]||ypCard)(p)}
  if(f.tab==="sezon"){if(/^y(FV|OS|DF|KL)$/.test(k))return ypPosRace(k.slice(1));if(k==="tablo")return ypTable();if(k==="tkral")return ypTkral();if(k==="ttab")return ypTtab();if(k==="thafta")return ypThafta();if(k==="tduel")return ypTduel();if(k==="golk")return ypKing("g");if(k==="asistk")return ypKing("a");return({mvp:ypMvp,piyasa:ypMarket,yildiz:ypRiser,ay:ypMonth,ikili:ypDuo,sadik:ypLoyal,karne:ypMid,final:ypFinal}[k]||ypMvp)()}
  return null}
const igFrame=(x,fmt)=>fmt==="story"?`<div class="yp-story${/class="yp yp-t[" ]/.test(x.html)?" st-t":""}"><div class="yp-sth">${IGLOGO}<span style="font-size:${ypFit(TRU(S.settings.group_name||"Yelek"),24,420,{ls:.12})}px">${esc(TRU(S.settings.group_name||"Yelek"))}</span></div>${x.html}</div>`:x.html;
// önizleme ekrana sığsın
function ypZoom(){const b=$("#pmPrev");if(!b)return;const el=b.firstElementChild;if(!el)return;const w=b.clientWidth-16;el.style.zoom=Math.min(1,w/540).toFixed(3)}
function sheetPM(){if(!canPM())return"";const f=S.f.pm||(S.f.pm={tab:"mac",fmt:"post"});if(!PM_ITEMS[f.tab])f.tab="mac";const ms=fin().slice().sort((a,b)=>matchTs(b)-matchTs(a));
  if(f.tab==="tahmin"&&(!isMember()||tahminYok()))f.tab="mac";const tabs=[["mac","Maç"],["oyuncu","Oyuncu"],["sezon","Sezon"],...(isMember()&&!tahminYok()?[["tahmin","Tahmin"]]:[])];const macG=f.tab==="mac"||f.tab==="once";const items=PM_ITEMS[f.tab].filter(x=>isMember()||!TAHMIN_PM.includes(x[0]));
  const it=f.item&&items.some(x=>x[0]===f.item)?f.item:items[0][0];f.item=it;
  const pOpt=(sel,ex)=>pmPlayers().filter(p=>p.id!==ex).map(p=>`<option value="${esc(p.id)}"${p.id===sel?" selected":""}>${esc(p.name)}</option>`).join("");
  let sel="";if(f.tab==="mac"||(f.tab==="tahmin"&&(it==="tuttu"||it==="tkup"))){const mid=f.mid||(ms[0]&&ms[0].id);sel=`<select class="pmsel" data-bind="pm.mid" aria-label="Maç">${ms.map(m=>`<option value="${esc(m.id)}"${m.id===mid?" selected":""}>${fmtShort(m.date)} · ${esc(nmOf(m,"A"))} ${m.score_a}–${m.score_b} ${esc(nmOf(m,"B"))}</option>`).join("")}</select>`}
  if(f.tab==="oyuncu"){const pid=pmPid(f,it);sel=`<select class="pmsel" data-bind="pm.pid" aria-label="Oyuncu">${pOpt(pid)}</select>`;
    if(it==="h2h"){const p=P(pid);const q2=f.pid2||pmPlayers().filter(x=>x.id!==pid&&p&&posOf(x)===posOf(p)).sort((a,b)=>ovrOf(b.id)-ovrOf(a.id))[0]?.id;sel+=`<select class="pmsel" data-bind="pm.pid2" aria-label="Rakip oyuncu">${pOpt(q2,pid)}</select>`}}

  const cSel=L=>L.length>1?`<select class="pmsel" data-bind="pm.cid" aria-label="Tahmin">${L.map(c=>`<option value="${esc(c.id)}"${c.id===(f.cid||L[0].id)?" selected":""}>${esc(betCTitle(c))} · ${fJ(c.st)} sikke</option>`).join("")}</select>`:"";
  if(f.tab==="tahmin"&&it==="tuttu"){const mid=f.mid||(ms[0]&&ms[0].id);sel+=cSel(betMine(mid,"kazandi"))}
  if(f.tab==="tahmin"&&it==="kupon"){const b=betNext();sel=b?cSel(betMine(b.id,"acik")):""}else
  if(f.tab==="once"){const n=it==="gun"||it==="out"?hkNextAny():hkNext();if(n&&it==="ilk7"){const tk=f.x7k||"A";const st=x7Star(n,tk,f.x7p);sel=`<div class="vtog pmr">${["A","B"].map(q=>`<button data-act="pmX7" data-v="${q}" class="${tk===q?"on":""}">${esc(nmOf(n,q))}</button>`).join("")}</div><select class="pmsel" data-bind="pm.x7p" aria-label="Öne çıkan oyuncu">${plOf(n,tk).map(id=>`<option value="${esc(id)}"${id===st?" selected":""}>${esc(nameOf(id))}</option>`).join("")}</select>`}else sel=n?`<p class="muted small" style="margin:0 0 10px">Sıradaki maç: ${fmtShort(n.date)}${n.time?" · "+esc(String(n.time).slice(0,5)):""}${(n.team_a||[]).length?" · "+esc(nmOf(n,"A"))+" – "+esc(nmOf(n,"B")):""}</p>`:""}
  const x=igBuild();const emp=PM_EMPTY[it]||(f.tab==="once"&&it!=="out"?PM_EMPTY.once:"Bunun için henüz yeterli veri yok.");
  return `<div class="mzvh pmh"><button class="mzic" data-act="close" aria-label="Kapat">${ICON.x}</button><div><h2>Paylaş</h2></div></div>
   <div class="vtog pmt">${tabs.map(([k,l])=>`<button data-act="pmTab" data-v="${k}" class="${f.tab===k||(k==="mac"&&macG)?"on":""}">${l}</button>`).join("")}</div>
   ${macG?`<div class="vtog pm2" role="group" aria-label="Maç önü ya da maç sonu">${[["once","Maç önü"],["mac","Maç sonu"]].map(([t,g])=>`<button data-act="pmTab" data-v="${t}" class="${f.tab===t?"on":""}" aria-pressed="${f.tab===t}">${g}</button>`).join("")}</div>`:""}
    ${items.length>1?`<div class="pmn"><button data-act="pmStep" data-v="-1" aria-label="Önceki görsel">${ICON_BACK}</button><div><b aria-live="polite">${(items.find(x=>x[0]===it)||["",""])[1]}</b><span class="pmdots" aria-hidden="true">${items.map(([k])=>`<i class="${it===k?"on":""}"></i>`).join("")}</span></div><button class="r" data-act="pmStep" data-v="1" aria-label="Sonraki görsel">${ICON_BACK}</button></div>`:""}
   ${x?`<div class="pmprev" id="pmPrev">${igFrame(x,f.fmt)}</div>${sel?`<div class="pmopt">${sel}</div>`:""}
    <div class="pmact p3"><button class="btn${f.fmt!=="story"?" on":""}" data-act="pmFmt" data-v="post" aria-pressed="${f.fmt!=="story"}">Gönderi</button><button class="btn${f.fmt==="story"?" on":""}" data-act="pmFmt" data-v="story" aria-pressed="${f.fmt==="story"}">Hikâye</button><button class="btn pmgo" data-act="pmGo" data-v="share">Paylaş</button></div>`
    :`<div class="pmprev"><div class="empty emp2 pmemp${f.fmt==="story"?" st":""}">${empIc("yelek","pink")}<p>${esc(emp)}</p></div></div>
    <div class="pmact p3"><button class="btn${f.fmt!=="story"?" on":""}" data-act="pmFmt" data-v="post" aria-pressed="${f.fmt!=="story"}">Gönderi</button><button class="btn${f.fmt==="story"?" on":""}" data-act="pmFmt" data-v="story" aria-pressed="${f.fmt==="story"}">Hikâye</button><button class="btn pmgo" disabled>Paylaş</button></div>${sel?`<div class="pmopt">${sel}</div>`:""}`}`}
function pmStep(d){const f=S.f.pm;if(!f||!S.sheet||S.sheet.type!=="pm")return;const L=(PM_ITEMS[f.tab]||[]).filter(x=>isMember()||!TAHMIN_PM.includes(x[0]));if(L.length<2)return;const i=Math.max(0,L.findIndex(x=>x[0]===f.item));f.item=L[(i+d+L.length)%L.length][0];render(true)}
// paylaşım: görseli sağa sola kaydırınca bir sonraki / önceki görsel gelir
{let x0=0,y0=0,on=0;document.addEventListener("touchstart",e=>{const p=e.target.closest&&e.target.closest("#modal .pmprev");on=p&&e.touches.length===1?1:0;if(on){x0=e.touches[0].clientX;y0=e.touches[0].clientY}},{passive:true});
 document.addEventListener("touchend",e=>{if(!on)return;on=0;const t=e.changedTouches[0];const dx=t.clientX-x0,dy=t.clientY-y0;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4)pmStep(dx<0?1:-1)},{passive:true})}
let _h2c=null;const h2c=()=>_h2c||(_h2c=new Promise((ok,no)=>{if(window.html2canvas)return ok(window.html2canvas);const s=document.createElement("script");s.src="vendor/html2canvas-1.4.1.min.js";s.onload=()=>ok(window.html2canvas);s.onerror=()=>{_h2c=null;no(new Error("yüklenemedi"))};document.head.appendChild(s)}));
function trUp(root){const L=[...root.querySelectorAll("*")].filter(e=>getComputedStyle(e).textTransform==="uppercase");L.forEach(e=>{for(const n of e.childNodes)if(n.nodeType===3)n.nodeValue=n.nodeValue.toLocaleUpperCase("tr")});L.forEach(e=>e.style.textTransform="none")}
const ypFonts=()=>Promise.race([Promise.all([document.fonts.load('800 40px "Barlow Condensed"'),document.fonts.load('700 12px Inter'),document.fonts.load('600 11px Inter')]),new Promise(r=>setTimeout(r,2500))]).catch(()=>{});
async function pmGo(mode){toast("Görsel hazırlanıyor…");await ypFonts();const x=igBuild();if(!x)return;const f=S.f.pm;
  let h;try{h=await h2c()}catch(_){toast("Görsel aracı yüklenemedi, bağlantını kontrol et");return}
  const box=document.createElement("div");box.className="igrender";box.innerHTML=igFrame(x,f.fmt);document.body.appendChild(box);
  try{await document.fonts?.ready;const el=box.firstElementChild;trUp(el);el.style.zoom="";const c=await h(el,{scale:1080/el.offsetWidth,backgroundColor:null,useCORS:true,logging:false});
    const fn=(String(S.settings.ig||S.settings.group_name||"yelek").toLocaleLowerCase("tr").replace(/[^a-z0-9çğıöşü]+/g,"")||"yelek")+"-"+x.name+(f.fmt==="story"?"-hikaye":"")+".png";
    if(mode==="save"){c.toBlob(b=>{if(!b){toast("Görsel oluşturulamadı");return}const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000);toast("Görsel kaydedildi")},"image/png")}
    else shareCanvas(c,fn,S.settings.group_name||"Yelek")}catch(e){toast("Görsel oluşturulamadı")}finally{box.remove()}}

function sheetShare(){const m=S.matches.find(x=>x.id===S.sheet.mid);if(!m)return"";return inM(m,()=>{const M=esc(m.id);const done=m.state==="bitti";const inf=S.mInfo[m.id]||{};
  const it=(act,ic,t,d)=>`<button class="shi" data-act="${act}" data-id="${M}"><span class="shic">${ic}</span><span class="sht"><b>${t}</b><small>${d}</small></span><span class="shx">›</span></button>`;
  return `<div class="ch"><div><div class="eyebrow">${fmtShort(m.date)} · ${esc(TEAM.A)} – ${esc(TEAM.B)}</div><h2>Paylaş</h2></div><button class="btn sm" data-act="close">Kapat</button></div><div class="shl">
    ${done?it("storyRes","⚽","Maç sonucu","Skor, gol atanlar ve Maçın Adamı"):""}
    ${done&&inf.motm?it("storyMotm","★","Maçın Adamı","Büyük fotoğraf, not ve istatistikler"):""}
    ${done&&inf.totw&&inf.totw.length?it("storyTotw","XI","Haftanın Takımı","En iyi 7 oyuncu ve notları"):""}
    ${(m.team_a||[]).length?it("shareImg","▦","Kadro ve diziliş","İki takım sahada"):""}</div>`})}
function sheetHtml(){const em=S.sheet&&S.sheet.type==="eval"&&S.matches.find(x=>x.id===S.sheet.mid);return em?inM(em,_sheetHtml):_sheetHtml()}
function _sheetHtml(){const t=S.sheet.type;if(t==="oda")return sheetOda();if(t==="bulten")return sheetBulten();if(t==="odul")return sheetOdul();if(t==="betInfo")return sheetBetInfo();if(t==="kral")return sheetKral();if(t==="betNotes")return sheetBetNotes();if(t==="betCom")return sheetBetCom();if(t==="betSlip"){const m=betNext();const bd=m&&BET.board[m.id];if(!m||!bd||!bd.open||!BET.slip.length)return"";return `<div class="ch"><div><div class="eyebrow">Tahmin</div><h2>${esc(nmOf(m,"A"))} – ${esc(nmOf(m,"B"))}</h2></div><button class="btn sm" data-act="close">Kapat</button></div>`+betSlip(m,bd.sum)}if(t==="trk")return sheetTrk();if(t==="vote")return sheetVote();if(t==="oysonuc")return sheetOySonuc();if(t==="duello")return sheetDuello();if(t==="vdet")return sheetVdet();if(t==="eval"){const m=S.matches.find(x=>x.id===S.sheet.mid);const ev=m&&S.f["ev_"+m.id];if(!m||!S.admin||!ev)return"";
    return `<div class="ch"><div><div class="eyebrow">Maç değerlendirmesi · ${fmtShort(m.date)}</div><h2>${TEAM.A} ${m.score_a} – ${m.score_b} ${TEAM.B}</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
      <p class="muted small">Gol, asist ve skor değişmez; sadece değerlendirme, penaltı ve çizgiden çıkarma kaydedilir.</p>${perfBlock(m,ev,"ev_"+m.id)}
      <button class="btn primary block" data-act="saveEval" data-id="${esc(m.id)}">${ICON.check} Kaydet, kartları güncelle</button>`}
  if(t==="mng"){const m=S.matches.find(x=>x.id===S.sheet.mid);if(!m||!S.admin)return"";const M=esc(m.id);
    return `<div class="ch"><div><div class="eyebrow">Yönetici · ${fmtShort(m.date)}</div><h2>${esc(nmOf(m,"A"))} ${m.score_a} – ${m.score_b} ${esc(nmOf(m,"B"))}</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
      ${namesForm(m)}
      <div class="eyebrow mngh">Maç işlemleri</div><div class="shl">
      <button class="shi" data-act="evalOpen" data-id="${M}"><span class="shic">★</span><span class="sht"><b>Değerlendirmeyi düzenle</b><small>Çok iyi / iyi / orta / kötü, penaltı, çizgi</small></span><span class="shx">›</span></button>
      <button class="shi" data-act="reopen" data-id="${M}"><span class="shic">⚽</span><span class="sht"><b>Skoru, golleri ve ödülleri düzelt</b><small>Kaydedince kartlar yeniden hesaplanır</small></span><span class="shx">›</span></button>
      <button class="shi dng" data-act="delMatch" data-id="${M}"><span class="shic">${ICON.x}</span><span class="sht"><b>${S.f.delMatch===m.id?"Silmek için tekrar bas":"Maçı sil"}</b><small>Geri alınamaz</small></span></button></div>`}
  if(t==="stats"){const m=S.matches.find(x=>x.id===S.sheet.mid);return m&&S.admin&&(m.state==="takim"||m.state==="bitti")?inM(m,()=>statEntry(m)):""}
  if(t==="rules")return `<div class="ch"><h2>Puanlama</h2><button class="btn sm" data-act="close">Kapat</button></div>`+viewKurallar(true);
  if(t==="share")return sheetShare();if(t==="pm")return sheetPM();
  return t==="inapp"?sheetInApp():t==="bkKey"?sheetBkKey():t==="delAcc"?sheetDelAcc():t==="ligs"||t==="hub"?sheetHub():t==="teamNew"?sheetTeamNew():t==="hos"?sheetHos():t==="login"?sheetLogin():t==="player"?sheetPlayer():t==="pedit"?sheetPEdit():t==="me"?(isMember()&&!S.admin?"":sheetMe()):t==="add"?sheetAdd():t==="cmp"?sheetCmp():t==="arch"?sheetArch():t==="ext"?sheetExt():t==="txt"?`<div class="ch"><h2>Metni kopyala</h2><button class="mzic" data-act="close" aria-label="Kapat">${ICON.x}</button></div><p class="muted small">Metni basılı tutup seç, kopyala ve WhatsApp grubuna yapıştır.</p><textarea readonly rows="14" style="width:100%">${esc(S.f.copyTx||"")}</textarea>`:""}

/* ================= Parçalar ================= */
const SIL=`<svg viewBox="0 0 100 104" aria-hidden="true"><circle cx="50" cy="33" r="21" fill="currentColor"/><path d="M8 104c2-27 19-42 42-42s40 15 42 42z" fill="currentColor"/></svg>`;
const BALL=`<svg class="ball" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5l4 2.9-1.5 4.7h-5L8 10.4z" fill="currentColor"/></svg>`;
function timeSel(id,bind,val){val=String(val||"21:00").slice(0,5);const o=[];for(let h=0;h<24;h++)for(const mm of["00","15","30","45"]){const t=String(h).padStart(2,"0")+":"+mm;o.push(t)}if(!o.includes(val))o.push(val);
  return `<select id="${id}" data-bind="${bind}" class="tsel">${o.map(t=>`<option${t===val?" selected":""}>${t}</option>`).join("")}</select>`}
const teamIni=(n,o)=>{const w=String(n||"").trim().split(/\s+/).filter(Boolean);let ini=(w.length>1?w[0][0]+w[1][0]:(w[0]||"?").slice(0,2));
  if(o){const v=String(o).trim().split(/\s+/).filter(Boolean);const oi=(v.length>1?v[0][0]+v[1][0]:(v[0]||"?").slice(0,2));
    if(oi.toLocaleUpperCase("tr")===ini.toLocaleUpperCase("tr")&&n!==o){const j=w.findIndex((x,i)=>x!==v[i]);const ww=w[j<0?0:j]||"";let q=1;while(q<ww.length&&(v[j<0?0:j]||"").slice(0,q+1)===ww.slice(0,q+1))q++;ini=ww[0]+(ww[q]||ww[1]||"")}}
  return ini.toLocaleUpperCase("tr")};
let _bid=0;
function ballSvg(cx,cy,r,col){const id="yb"+(_bid++);const f=v=>v.toFixed(2);
  const pent=(x,y,rr,a0)=>[...Array(5)].map((_,i)=>{const a=a0+i*2*Math.PI/5;return f(x+rr*Math.cos(a))+","+f(y+rr*Math.sin(a))}).join(" ");
  const ri=r*.32,ro=r*.3;let out="",seam="";
  for(let i=0;i<5;i++){const a=-Math.PI/2+i*2*Math.PI/5;
    seam+=`M${f(cx+ri*Math.cos(a))} ${f(cy+ri*Math.sin(a))}L${f(cx+r*.68*Math.cos(a))} ${f(cy+r*.68*Math.sin(a))}`;
    out+=`<polygon points="${pent(cx+(r*.68+ro)*Math.cos(a),cy+(r*.68+ro)*Math.sin(a),ro,a+Math.PI)}" style="fill:${col}"/>`}
  return `<clipPath id="${id}"><circle cx="${cx}" cy="${cy}" r="${r}"/></clipPath><circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/><g clip-path="url(#${id})">${out}</g><polygon points="${pent(cx,cy,ri,-Math.PI/2)}" style="fill:${col}"/><path d="${seam}" style="stroke:${col}" stroke-width="${f(r*.08)}" fill="none"/>`}
const _fnv=t=>{let h=2166136261;for(const c of String(t||"")){h^=c.codePointAt(0);h=Math.imul(h,16777619)}return h>>>0};
// takım maskotları: isimden kurt, boğa, kartal ya da tilki
const MASK=[
 c=>`<path d="M14 10l12 12h12l12-12 2 24-20 22-20-22z" fill="#fff"/><path d="M22 34l6 3M42 34l-6 3" style="stroke:${c}" stroke-width="3" stroke-linecap="round"/><path d="M28 46h8l-4 5z" style="fill:${c}"/>`,
 c=>`<path d="M8 14c2 8 7 12 14 12M56 14c-2 8-7 12-14 12" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><path d="M20 22h24l4 14-6 16H22l-6-16z" fill="#fff"/><circle cx="26" cy="34" r="2.6" style="fill:${c}"/><circle cx="38" cy="34" r="2.6" style="fill:${c}"/><rect x="25" y="44" width="14" height="6" rx="3" style="fill:${c}"/>`,
 c=>`<path d="M12 54C12 40 15 28 24 20C30 15 38 12 46 13C52 14 56 17 58 21C62 25 63 31 61 38C59 34 55 32 51 33L46 35C42 36 37 37 33 38C31 43 31 48 33 54z" fill="#fff"/><path d="M12 54L6 46L13 44L7 36L15 35L11 27L19 28" fill="#fff"/><path d="M36 22C40 19 46 19 50 22" fill="none" style="stroke:${c}" stroke-width="2.6" stroke-linecap="round"/><circle cx="44" cy="25" r="2.6" style="fill:${c}"/>`,
 c=>`<path d="M10 8l14 14h16L54 8l-2 22-20 26-20-26z" fill="#fff"/><path d="M12 30l20 26 20-26-12 4-8 6-8-6z" style="fill:${c}" fill-opacity=".18"/><circle cx="25" cy="31" r="2.4" style="fill:${c}"/><circle cx="39" cy="31" r="2.4" style="fill:${c}"/><circle cx="32" cy="50" r="2.6" style="fill:${c}"/>`];
const maskOf=(n,o,k)=>{let i=(_fnv(n)>>>7)%MASK.length;if(o&&k==="B"&&o!==n&&((_fnv(o)>>>7)%MASK.length)===i)i=(i+1)%MASK.length;return i};
function crest(name,k,sz,other){sz=sz||32;if(other===undefined&&typeof TEAM!=="undefined")other=name===TEAM.A?TEAM.B:name===TEAM.B?TEAM.A:"";const col=`var(--t${k==="A"?"A":"B"})`;
  return `<svg class="crest" viewBox="0 0 64 64" width="${sz}" height="${sz}" aria-hidden="true"><circle cx="32" cy="32" r="30" style="fill:${col}"/><circle cx="32" cy="32" r="26.5" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.5"/><g transform="translate(9.6 9.6) scale(.7)">${MASK[maskOf(name,other,k)](col)}</g></svg>`}
const lastSide=id=>{const F=fin();for(let i=F.length-1;i>=0;i--){const sd=playSide(F[i],id);if(sd)return sd}return""};
const photoOf=id=>{const d=S.photos[id];return d&&/^data:image\//.test(d)?d:""};
function avatar(p,size){const ph=photoOf(p.id);return `<span class="av ${tierOf(ovrOf(p.id))}${size?" "+size:""}${ph?" hasph":""}">${ph?`<img src="${esc(ph)}" alt="">`:esc(initials(p.name))}</span>`}
function avatarO(p){return `<span class="avw">${avatar(p)}<b class="ab num">${ovrOf(p.id)}</b></span>`}
const ANIM=new Set();const anim=k=>ANIM.has(k)?"":(ANIM.add(k)," anim");
const lastFinM=()=>S.matches.filter(x=>mDone(x)&&!isExt(x)).sort((a,b)=>matchTs(b)-matchTs(a))[0];
const lastTotw=()=>{const m=lastFinM();return m&&S.mInfo[m.id]?S.mInfo[m.id].totw||[]:[]};
function card(p,big){
  const s=S.stats[p.id]||{ovr:baseOf(p),attrs:p.attrs||{},lastD:0};const st=stOf(p);const o=s.ovr;
  const tr=s.lastO>0?`<span class="trend up">▲${s.lastO}</span>`:s.lastO<0?`<span class="trend down">▼${-s.lastO}</span>`:`<span class="trend">&nbsp;</span>`;
  const at=attrSet(p.pos).map(([k,l])=>{const dd=s.attrD?.[k]||0;const av=+(s.attrs?.[k])||0;return `<span style="--v:${Math.max(0,Math.min(100,av))}"><b>${s.attrs?.[k]??"–"}</b>${l}${dd?`<i class="ad ${dd>0?"up":"dn"}">${dd>0?"▲":"▼"}</i>`:""}</span>`}).join("");const ph=photoOf(p.id);
  const x=STATUS[st];const flag=st!=="hazir"?`<span class="flag ${x.cls==="bad"?"":x.cls}">${x.cls==="bad"?"✚ ":""}${x.flag}</span>`:"";
  const tw=lastTotw().includes(p.id);const chp=reigningChamp()===p.id;const cls=(s.lastO>0?" rise":s.lastO<0?" fall":"")+(tw?" totw":"")+(chp?" champ":"")+(!big&&S.me===p.id?" me":"")+(big?anim("fb_"+p.id)+(s.lastO>0&&!ANIM.has("pop_"+p.id)?(ANIM.add("pop_"+p.id)," pop"):""):"");
  return `<button class="fut ${tierOf(o)}${UNAVAIL.includes(st)?" out":""}${big?" big":""}${cls}" ${big?'tabindex="-1"':`data-act="open" data-id="${esc(p.id)}"`} aria-label="${esc(p.name)} kartı, reyting ${o}">
    <span class="face"><span class="tl"><span class="ovr num">${o}</span><span class="ps">${eposOf(p)}</span>${tr}${p.guest?"":p.yedek?'<span class="sq">YEDEK</span>':'<span class="sq as">AS</span>'}</span>
    ${chp?'<span class="chb" title="Son şampiyon">🏆</span>':""}<span class="stripe"></span>${tw?'<span class="xi">XI</span>':""}<span class="pic">${ph?`<img src="${esc(ph)}" alt="">`:SIL}</span><span class="nm">${esc(up(shortName(p.name)))}</span>${kondBar(p.id,"fk")}<span class="at">${at}</span>${BALL}</span>${flag}</button>`;
}
/* Kondisyon (sadece bilgi; reytinge ve takım dengesine etkisi yok) üç parçadan oluşur:
   1) Maç temposu: son 8 haftadaki en çok 6 maça (iç + dış) çıkma oranı; yakın maç daha ağır. Sakatlık/hastalık dönüşü ve uzun ara düşürür.
   2) Yaş: tavanı düşürmez (her yaşta %100 olunabilir); 30'dan sonra maçta daha çok yorulur ve daha geç toparlanır.
   3) Maç yorgunluğu: oynadığı maçtan sonra düşer, yavaş yavaş düzelir (30 yaş altı 3 gün, yaşla 5 güne kadar uzar). */
const KW=[1,.85,.7,.55,.4,.3],KREC=72;
function kondOf(id){return null;/* kondisyon uygulamadan kaldırıldı */
const hb=Math.floor(Date.now()/9e5);S._kc=S._kc||{};if(S._kc.v!==S.matches||S._kc.h!==hb)S._kc={v:S.matches,h:hb};if(id in S._kc)return S._kc[id];
  const p=P(id);let r=null;
  if(p&&!p.guest){const now=Date.now(),D=864e5,H=36e5,cr=p.created_at?Date.parse(p.created_at)-D:0;
    const M=S.matches.filter(m=>mDone(m)&&matchTs(m)<=now&&now-matchTs(m)<=56*D&&matchTs(m)>=cr).sort((a,b)=>matchTs(b)-matchTs(a)).slice(0,6);
    if(M.length){const inM=m=>(m.team_a||[]).includes(id)||(!isExt(m)&&(m.team_b||[]).includes(id));let sw=0,pw=0,n=0;
      M.forEach((m,i)=>{sw+=KW[i];if(inM(m)){pw+=KW[i];n++}});
      const parts=[];let tempo=40+60*pw/sw;
      const gap=(now-matchTs(M[0]))/D;if(gap>21){const g=Math.min(20,(gap-21)*.7);tempo-=g;parts.push(["Uzun ara","takım "+Math.round(gap/7)+" haftadır maç yapmadı",-g])}
      const lg=p.status_log||[];let back=null;for(let x=lg.length-1;x>=0;x--){if(lg[x].type==="sakat"||lg[x].type==="hasta"){const h=lg.slice(x+1).find(e=>e.type==="hazir");if(h)back={at:Date.parse(h.at),t:lg[x].type};break}}
      if(back&&stOf(p)==="hazir"&&now-back.at<=42*D){const after=M.filter(m=>matchTs(m)>=back.at&&inM(m)).length;const pen=after>=2?0:after===1?8:15;if(pen){tempo-=pen;parts.push([back.t==="sakat"?"Sakatlık dönüşü":"Hastalık dönüşü",after?"dönüşten sonra 1 maç oynadı":"dönüşten sonra henüz oynamadı",-pen])}}
      tempo=Math.max(30,Math.min(100,tempo));
      const age=ageOf(p);const old=age!=null&&age>30?age-30:0;
      const rec=KREC+Math.min(48,old*8);// toparlanma süresi (saat)
      let k=60+.4*tempo;
      // maç yorgunluğu
      const last=M.find(inM);let fat=0,ready=null;
      if(last){const t=(now-matchTs(last))/H-1;if(t<rec){
        let d=22+Math.min(14,old*1.2)+(tempo<70?6:0);const tr=trkOf(last,id);
        if(tr&&tr.km!=null){const x=clamp((+tr.km-5)*4+((+tr.spr||20)-20)*.15,-8,10);d+=x;parts.push(["Gerçek koşu",fN1(+tr.km)+" km"+(tr.spr!=null?" · "+tr.spr+" sprint":"")+" (Akıllı Saha)",0])}
        const prev=M.filter(inM)[1];if(prev&&(matchTs(last)-matchTs(prev))/D<4)d+=6;
        fat=d*Math.pow(Math.max(0,1-Math.max(0,t)/rec),1.2);ready=matchTs(last)+(rec+1)*H;
        if(fat>=.5)parts.push(["Maç yorgunluğu",(old?age+" yaş, toparlanma "+(Math.round(rec/24*2)/2).toString().replace(".",",")+" gün · ":"")+fmtRec(ready),-fat])}}
      k-=fat;
      const st=stOf(p);if(st==="sakat"||st==="hasta"){k=Math.min(k,40);parts.push([STATUS[st].label,"şu an oynayamıyor",0])}
      k=Math.round(Math.max(20,Math.min(100,k)));
      r={k,n,of:M.length,tempo:Math.round(tempo),parts,ready,lv:k>=80?"hi":k>=60?"md":"lo",l:k>=80?"Zinde":k>=60?"Orta":"Düşük"}}}
  return S._kc[id]=r}
function fmtRec(ts){const d=new Date(ts),n=new Date();const dd=Math.round((new Date(d.getFullYear(),d.getMonth(),d.getDate())-new Date(n.getFullYear(),n.getMonth(),n.getDate()))/864e5);
  const hh=String(d.getHours()).padStart(2,"0")+":00";return "tamamen düzelir: "+(dd<=0?"bugün "+hh:dd===1?"yarın "+hh:GUNLER[d.getDay()]+" "+hh)}
const kondBar=(id,cls)=>{const c=kondOf(id);return c?`<span class="kbar k${c.lv}${cls?" "+cls:""}" title="Kondisyon %${c.k}" aria-label="Kondisyon yüzde ${c.k}, ${c.l}"><i style="width:${c.k}%"></i></span>`:""};
const kondChip=id=>{const c=kondOf(id);return c?`<span class="kchip k${c.lv}" title="Kondisyon">${ICON_BOLT}%${c.k}</span>`:""};
const ICON_MOON='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
const ICON_BOLT='<svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M13.2 2 4.5 13.4h6.1L9.8 22l8.7-11.4h-6.1z"/></svg>';
function kondCard(p){const c=kondOf(p.id);if(!c)return"";
  const top=c.parts.slice().sort((a,b)=>a[2]-b[2])[0];const gk=c.parts.find(x=>x[0]==="Gerçek koşu");const why=(c.k<100&&top?(top[0]==="Maç yorgunluğu"?"Maç yorgunluğu · "+String(top[1]).split("· ").pop():top[0]==="Sakat"||top[0]==="Hasta"?top[0]:top[0]):"")+(gk&&c.k<100?" · "+String(gk[1]).split(" (")[0]+" koştu":"");
  return `<div class="kcard k${c.lv}"><div class="kch">${ICON_BOLT}<span>Kondisyon</span><b class="num">%${c.k}</b><em>${c.l}</em></div><span class="kbar k${c.lv} big"><i style="width:${c.k}%"></i></span>${why?`<small>${esc(why)}</small>`:""}</div>`}
function stChip(p){const st=stOf(p);if(st==="hazir")return"";const x=STATUS[st];const u=p.status?.until?" · "+fmtShort(p.status.until)+"'e kadar":"";return`<span class="chip ${x.cls}"><span class="dot"></span>${x.label}${u}</span>`}

/* ================= Maç sekmesi ================= */
const openMatch=()=>S.matches.filter(m=>!mDone(m)&&!isExt(m)).sort((a,b)=>matchTs(a)-matchTs(b))[0];
function viewMac(){
  if(!S.players.length)return `<section class="card"><div class="empty emp2">${empIc("kisi","pink")}<h3>Önce kadroyu kur</h3><p>${S.admin?"Kartlar sekmesinden oyuncuları ekle.":"Yönetici oyuncuları ekleyince maçlar burada görünür."}</p>${S.admin?'<button class="btn primary" data-act="tab" data-tab="kartlar">Oyuncu ekle</button>':""}</div></section>`;
  const om=openMatch();if(om)return hero(om)+muafKart(om)+matchBody(om);
  const lm=lastFinM();if(lm&&!lm.archived&&S.mInfo[lm.id])return macSonra(lm);
  return S.admin?createHero():noMatchHero();
}
/* maç bitti, sıradaki maç henüz girilmedi: maç önü ekranıyla aynı kalıpta sonuç ekranı */
const odaKapan=m=>{const d=parseYmd(m.date);d.setDate(d.getDate()+2);return d.getTime()};
function macSonra(m){return inM(m,()=>_macSonra(m))}
/* Düello: kadrolar açıklanınca iki oyuncu birbirine meydan okur; sonuç maç istatistiğinden çıkar */
const DU={rows:null,at:0};const DU_K={gol:"Daha çok gol",asist:"Daha çok asist",not:"Daha yüksek not"};
const DU_ERR={closed:"Maç başladı, düello kapandı",dolu:"İkinizden birinin bu maçta düellosu var",uye:"Bu oyuncunun hesabı yok",kadro:"İkiniz de bu maçın kadrosunda olmalısınız",yok:"Düello bulunamadı",auth:"Önce giriş yapmalısın",value:"Rakip ve konu seç"};
const DU_IC='<svg viewBox="0 0 24 24" fill="none" stroke="#06222A" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 4l6 8-6 8M18 4l-6 8 6 8"/></svg>';
function duLoad(force){if(!isMember()||S.fol||!myPid())return;if(DU.at===-1||(!force&&Date.now()-DU.at<60000))return;DU.at=-1;
  rpc("duel_list",{}).then(r=>{DU.at=Date.now();if(r&&r.ok){const o=JSON.stringify(DU.rows);DU.rows=r.rows||[];if(o!==JSON.stringify(DU.rows)&&S.tab==="mac"&&!S.sheet&&!S.view)render(true)}}).catch(()=>{DU.at=Date.now()-50000})}
function duVal(m,d,id){if(d.k==="not"){const r=mDone(m)&&S.mInfo[m.id]&&S.mInfo[m.id].pts[id];return r&&isFinite(r.pts)?Math.round(r.pts*10)/10:null}if(m.state!=="bitti"||m.score_a==null)return null;const o=(m.stats||{})[id]||{};return +(d.k==="gol"?o.g:o.a)||0}
function duRes(m,d,me){const ot=d.a===me?d.b:d.a;const x=duVal(m,d,me),y=duVal(m,d,ot);if(x==null||y==null)return null;return{x,y,r:x>y?"G":x<y?"M":"B"}}
function duRec(me){let w=0,l=0;(DU.rows||[]).forEach(d=>{if(d.s!=="kabul"||(d.a!==me&&d.b!==me))return;const m=S.matches.find(x=>x.id===d.m);const r=m&&duRes(m,d,me);if(r){if(r.r==="G")w++;else if(r.r==="M")l++}});return{w,l}}
const duFmt=(d,v)=>d.k==="not"?fN(v):v+(d.k==="gol"?" gol":" asist");
const duOpen=m=>m.state==="takim"&&Date.now()<matchTs(m);
function duelCard(m){const me=myPid();if(!isMember()||S.fol||!me||isExt(m)||m.state==="kayit")return"";duLoad();if(!DU.rows)return"";const pl=plAll(m);if(!pl.includes(me))return"";
  const M=esc(m.id);const open=duOpen(m);const d=DU.rows.find(x=>x.m===m.id&&(x.a===me||x.b===me)&&pl.includes(x.a)&&pl.includes(x.b));
  const B=(act,t,ex)=>`<button class="thk-c" data-act="${act}" ${ex||""}>${t}</button>`;
  if(!d){if(!open)return"";const rc=duRec(me);return th2Kart("thC",DU_IC,"Düello","Bu maç boş",[["Galibiyet",rc.w],["Yenilgi",rc.l]],B("duNew","Meydan oku",`data-id="${M}"`))}
  const ot=d.a===me?d.b:d.a;const on=esc(shortName(nameOf(ot)));const KB=[["Konu",DU_K[d.k]],["Rakip",on]];
  if(d.s==="bekliyor"){if(!open)return"";return d.b===me?th2Kart("thC",DU_IC,"Düello","Meydan okundu",KB,B("duAns","Yanıtla",`data-id="${M}" data-v="${d.id}"`)):th2Kart("thC",DU_IC,"Düello","Yanıt bekleniyor",KB,B("duCancel","Geri çek",`data-v="${d.id}"`))}
  const r=duRes(m,d,me);
  if(!r)return th2Kart("thC",DU_IC,"Düello",m.state==="bitti"?(d.k==="not"?"Notlar bekleniyor":"Skor bekleniyor"):"Maçta belli olur",KB,"");
  return th2Kart("thC",DU_IC,"Düello",r.r==="G"?"Kazandın":r.r==="M"?"Kaybettin":"Berabere",[["Sen",duFmt(d,r.x)],[on,duFmt(d,r.y)]],"")}
function sheetDuello(){const sh=S.sheet,m=S.matches.find(x=>x.id===sh.mid);const me=myPid();if(!m||!me)return"";const X=`<button class="mzic" data-act="close" aria-label="Kapat">${ICON.x}</button>`;
  if(sh.ans){const d=(DU.rows||[]).find(x=>String(x.id)===String(sh.ans));if(!d)return `<div class="mzvh">${X}<div><h2>Düello</h2><small>Bu meydan okuma geri çekilmiş</small></div></div>`;const p=P(d.a);
    return `<div class="mzvh">${X}<div><h2>Düello</h2><small>Kabul edersen sonuç maçta belli olur</small></div></div>
      <div class="vpc">${p?avatar(p):""}<h3>${esc(nameOf(d.a))}</h3><p>sana meydan okudu</p><div class="vstt du1"><span><b>${DU_K[d.k]}</b><small>Konu</small></span></div></div>
      <div class="vnav"><button class="btn" data-act="duNo" data-v="${d.id}">Reddet</button><button class="btn primary" data-act="duYes" data-v="${d.id}">Kabul et</button></div>`}
  const busy=new Set();(DU.rows||[]).filter(x=>x.m===m.id).forEach(x=>{busy.add(x.a);busy.add(x.b)});const L=plAll(m).filter(id=>id!==me&&realP(id));
  return `<div class="mzvh">${X}<div><h2>Meydan oku</h2><small>Rakibini ve konuyu seç · kabul ederse maçta belli olur</small></div></div>
    <div class="vsec"><h3>Konu</h3><div class="du3">${Object.entries(DU_K).map(([k,l])=>`<button class="${sh.kind===k?"on":""}" data-act="duKind" data-v="${k}" aria-pressed="${sh.kind===k}">${l}</button>`).join("")}</div></div>
    <div class="vsec"><h3>Rakip</h3><div class="vtg">${L.map(id=>{const p=P(id);const on=sh.rival===id;return `<button class="vtl${on?" on":""}" data-act="duPick" data-p="${esc(id)}" aria-pressed="${on}"${busy.has(id)?" disabled":""}>${p?avatar(p):""}<b>${esc(shortName(nameOf(id)))}</b>${busy.has(id)?`<small>Düellosu var</small>`:""}</button>`}).join("")}</div></div>
    <button class="btn primary block vsend" data-act="duSend"${sh.rival&&sh.kind?"":" disabled"}>${sh.rival&&sh.kind?"Meydan oku":"Rakip ve konu seç"}</button>
    <p class="muted small" style="text-align:center;margin:10px 0 0">Bir maçta tek düellon olur. Ödül yok; galibiyetlerin sayılır.</p>`}
async function duDo(fn,args,okMsg){try{const r=await rpc(fn,args);if(r&&r.ok){DU.rows=r.rows||[];DU.at=Date.now();if(okMsg)toast(okMsg);return true}toast(DU_ERR[r&&r.error]||"Yapılamadı")}catch(_){toast("Bağlantı yok")}duLoad(true);return false}
function th2Kart(cls,ic,t,pill,B,btn){return `<div class="thk th2 ${cls}"><div class="thk-b"><span class="thk-i">${ic}</span><span class="thk-x"><b>${t}</b></span><span class="th2-p">${pill}</span></div><div class="th2-r"><div class="th2-g">${B.map(([l,v])=>`<div><small>${l}</small><b class="num">${v}</b></div>`).join("")}</div>${btn}</div></div>`}
function _macSonra(m){const M=esc(m.id);const inf=S.mInfo[m.id]||{pts:{}};const me=myPid();
  const STAR='<svg viewBox="0 0 24 24" fill="none" stroke="#2A1F00" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.1-6.1L3.2 9.4l6.1-.8L12 3z"/></svg>';
  const PLUS='<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  let h=hero(m);
  {const L=Object.entries(inf.pts||{}).filter(([id,r])=>r&&realP(id)&&isFinite(r.pts)).sort((a,b)=>b[1].pts-a[1].pts);
    if(L.length){const mo=inf.motm&&P(inf.motm)?inf.motm:null;const mine=me&&inf.pts[me]&&isFinite(inf.pts[me].pts)?inf.pts[me]:null;
      h+=th2Kart("thG",STAR,vOn(m)?"Oylama":"Maç notları","Sonuçlandı",[mo?["Maçın adamı",esc(shortName(nameOf(mo)))]:["En iyi",esc(shortName(nameOf(L[0][0])))],mine?["Senin notun",fN(mine.pts)]:["En yüksek not",fN(L[0][1].pts)]],`<button class="thk-c" data-act="${m.vsum?"oySonuc":"msGo"}" data-id="${M}" data-v="notlar">Sıralama</button>`)}}
  if(isMember()&&!S.fol&&me&&!tahminYok()){const W=BET.week[m.id];betLoad("week",m.id);const Ls=BET.lists[me];if(!Ls)betLoad("list",me);
    const mine=Ls?Ls.rows.filter(c=>c.m===m.id):[];const dn=mine.filter(c=>c.z==="kazandi"||c.z==="kaybetti");const net=dn.reduce((a,c)=>a+((c.py||0)-c.st),0);const won=mine.filter(c=>c.z==="kazandi").length;
    if(mine.length||(W&&W.n))h+=th2Kart("",dIcon("bilet","green",24),"Tahmin",mine.some(c=>c.z==="acik")?"Sonuç bekleniyor":"Sonuçlandı",mine.length?[["Kazanılan sikke",(net>0?"+":net<0?"−":"")+fJ(Math.abs(net))],["Tutan tahmin",won+"/"+mine.length]]:[["Yapılan tahmin",W.n||0],["Tutan tahmin",W.won||0]],`<button class="thk-c" data-act="thkGo" data-v="kupon">Sonuçlar</button>`)}
  h+=duelCard(m);h+=odaCard(m);
  if(S.admin){const d=S.f.newDate||nextDay(+S.settings.day);const tm=S.f.newTime||S.settings.time;const D=parseYmd(d);
    h+=th2Kart("thP",PLUS,"Sıradaki maç","Yönetici",[["Tarih",D.getDate()+" "+AYLAR[D.getMonth()].slice(0,3)+" "+GUNLER[D.getDay()].slice(0,3)],["Saat",esc(String(tm||"").slice(0,5))]],`<button class="thk-c" data-act="tog" data-k="nmOpen" aria-expanded="${!!S.f.nmOpen}">${S.f.nmOpen?"Kapat":"Maçı aç"}</button>`);
    if(S.f.nmOpen)h+=createForm()}
  return h}
function lastCard(m,...r){return inM(m,()=>_lastCard(m,...r))}
function _lastCard(m){const inf=S.mInfo[m.id]||{pts:{}};const sa=+m.score_a||0,sb=+m.score_b||0;const M=esc(m.id);const mo=inf.motm;const r=mo&&inf.pts[mo];
  return `<section class="card lastc"><div class="ch"><div><div class="eyebrow">Son maç · ${fmtShort(m.date)}</div></div><button class="btn sm" data-act="viewm" data-id="${M}">Maç detayı ›</button></div>
    <button class="lcs" data-act="viewm" data-id="${M}"><span class="lt${sa>sb?" win":""}"><span class="bibdot"></span>${esc(TEAM.A)}</span><b class="num">${sa} - ${sb}</b><span class="lt${sb>sa?" win":""}"><span class="nobib"></span>${esc(TEAM.B)}</span></button>
    ${mo?`<div class="lcm"><span class="muted small">★ Maçın Adamı</span><b>${esc(nameOf(mo))}</b>${r?`<span class="nt ${noteCls(r.pts)}">${fN(r.pts)}</span>`:""}</div>`:""}
    </section>`}
function extRes(m){const a=+m.score_a||0,b=+m.score_b||0;return a>b?"G":a<b?"M":"B"}
function extPanel(m){const st=m.stats||{};const T=m.team_a||[];const us=+m.score_a||0,them=+m.score_b||0;const r=extRes(m);
  const sc=T.filter(id=>+st[id]?.g).sort((x,y)=>st[y].g-st[x].g).map(id=>`${esc(nameOf(id))}${+st[id].g>1?" ×"+st[id].g:""}`).join(", ");
  const as=T.filter(id=>+st[id]?.a).sort((x,y)=>st[y].a-st[x].a).map(id=>`${esc(nameOf(id))}${+st[id].a>1?" ×"+st[id].a:""}`).join(", ");
  return `<section class="card"><div class="ch"><div><div class="eyebrow">Dış maç</div><h2>${fmtDate(m.date)}</h2></div>${S.admin?`<div class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn ghost sm" data-act="extEdit" data-id="${esc(m.id)}">Düzelt</button><button class="btn ghost sm danger" data-act="delMatch" data-id="${esc(m.id)}">${S.f.delMatch===m.id?"Emin misin?":"Sil"}</button></div>`:""}</div>
    <div class="sb"><div class="t${us>them?" win":""}"><span class="tn">${esc(S.settings.group_name)}</span><span class="sc num">${us}</span></div><span class="dash">–</span><div class="t${them>us?" win":""}"><span class="tn">${esc(m.opponent||"Rakip")}</span><span class="sc num">${them}</span></div></div>
    ${(()=>{const k=(m.opponent||"").trim();const E=extFin().filter(x=>(x.opponent||"").trim()===k);if(E.length<2)return"";const o={G:0,B:0,M:0};E.forEach(x=>o[extRes(x)]++);
      return `<p class="muted small" style="margin:0 0 10px">${esc(k)} ile ${E.length} maç: ${o.G} galibiyet, ${o.B} beraberlik, ${o.M} mağlubiyet</p>`})()}
    <div class="awards"><div class="aw motm"><span>Maçın Adamı</span><b>${m.motm?esc(shortName(nameOf(m.motm))):"—"}</b></div><div class="aw"><span>Sonuç</span><b>${r==="G"?"Galibiyet":r==="M"?"Mağlubiyet":"Beraberlik"}</b></div></div>
    ${sc?`<div><span class="eyebrow">Goller</span><p>${sc}</p></div>`:""}${as?`<div><span class="eyebrow">Asistler</span><p>${as}</p></div>`:""}
    <div><span class="eyebrow">Kadro · ${T.length} kişi</span><div class="bench" style="margin-top:6px">${T.map(id=>`<button class="tp" data-act="open" data-id="${esc(id)}"><span class="n">${esc(nameOf(id))}</span><span class="small muted">${P(id)&&!P(id).guest?eposOf(P(id)):"MİS"}</span></button>`).join("")}</div></div></section>`}
/* ===== Rekorlar · Haftalık bülten · Ödül töreni ===== */
const realP=id=>{const p=P(id);return !!p&&!p.guest};
const pFace=(id,cls)=>{const x=photoOf(id);return `<span class="${cls||"rkf"}">${x?`<img src="${esc(x)}" alt="">`:esc(initials(nameOf(id)))}</span>`};
/* rekorlar: bütün zamanlar, sezonla sıfırlanmaz. F verilirse o maça kadar olan hâli hesaplanır */
function rekorCalc(F){F=F||fin();const R={};const st={};const cnt={n:{},mo:{}};const sez={};
  const put=(k,v,o)=>{const c=R[k];if(!c||v>c.v)R[k]={v,...o,eq:0};else if(v===c.v)c.eq++};
  for(const m of F){const inf=S.mInfo[m.id];if(!inf)continue;const sa=+m.score_a||0,sb=+m.score_b||0;const yr=yrOf(m);
    if(sa!==sb)put("fark",Math.abs(sa-sb),{m,k:sa>sb?"A":"B"});
    if(inf.motm&&realP(inf.motm)){cnt.mo[inf.motm]=(cnt.mo[inf.motm]||0)+1;put("motm",cnt.mo[inf.motm],{id:inf.motm,m})}
    for(const[id,r]of Object.entries(inf.pts||{})){if(!r||!realP(id))continue;
      const s=st[id]||(st[id]={w:0,w0:null,g:0,nl:0});
      if(r.res==="G"){if(!s.w)s.w0=m;s.w++;put("seri",s.w,{id,m,m0:s.w0})}else s.w=0;
      s.g=r.g>0?s.g+1:0;s.nw=r.res==="G"?0:(s.nw||0)+1;s.last=m.id;
      if(r.g>0)put("gol",r.g,{id,m});put("not",Math.round(r.pts*10)/10,{id,m,r});
      cnt.n[id]=(cnt.n[id]||0)+1;put("mac",cnt.n[id],{id,m});
      if(r.a>0){const q=sez[yr]||(sez[yr]={});q[id]=(q[id]||0)+r.a;put("asist",q[id],{id,m,yr})}}}
  return{R,st}}
function rekorHtml(){const F=fin();const{R,st}=rekorCalc(F);
  if(!F.length||!Object.keys(R).length)return `<section class="card"><div class="empty emp2">${empIc("kupa","gold")}<h3>Henüz rekor yok</h3><p>İlk maç bitince rekorlar burada tutulur. Sezon değişse de sıfırlanmaz.</p></div></section>`;
  const eq=o=>o.eq?` <em class="rk-eq">+${o.eq} kişi daha</em>`:"";const sk=m=>`${+m.score_a||0}–${+m.score_b||0}`;
  let h="";const s=R.seri;
  if(s&&s.v>=2)h+=`<button class="rk-hero rg" data-act="open" data-id="${esc(s.id)}"><span class="rgf" aria-hidden="true">${pFace(s.id)}</span><span class="rk-ey">En uzun galibiyet serisi</span><span class="rk-big"><b class="num">${s.v}</b><i>maç üst üste</i></span><span class="rg-w"><b>${esc(nameOf(s.id))}${s.eq?` <em class="rk-eq">ve ${s.eq} kişi daha</em>`:""}</b><small>${esc(fmtShort(s.m0.date))} – ${esc(fmtShort(s.m.date))}</small></span></button>`;
  const eq2=o=>o.eq?` <em class="rk-eq">ve ${o.eq} kişi daha</em>`:"";
  const row=(lab,val,unit,col,face,name,sub,act,id)=>`<button class="rkr" data-act="${act}" data-id="${esc(id)}">${face}<span class="rkr-t"><small>${lab}</small><b>${name}</b>${sub?`<i>${sub}</i>`:""}</span><span class="rkr-v"><b class="num" style="color:${col}">${val}</b><small>${unit}</small></span></button>`;
  const grp=(t,d,L)=>L.length?`<section class="rkl"><h3>${t}</h3><div class="rkl-b">${L.join("")}</div></section>`:"";
  const G1=[],G2=[],G3=[];
  if(R.gol)G1.push(row("En çok gol atan",R.gol.v,"gol","#FF7AC3",pFace(R.gol.id),esc(nameOf(R.gol.id))+eq2(R.gol),`${esc(fmtShort(R.gol.m.date))} maçı · skor ${sk(R.gol.m)}`,"viewm",R.gol.m.id));
  if(R.not)G1.push(row("En yüksek maç notu",fN(R.not.v),"not","#00E58A",pFace(R.not.id),esc(nameOf(R.not.id))+eq2(R.not),`${esc(fmtShort(R.not.m.date))} maçı · ${R.not.r.g} gol, ${R.not.r.a} asist`,"viewm",R.not.m.id));
  if(R.fark)G1.push(row("En farklı galibiyet",sk(R.fark.m),R.fark.v+" fark","#5FE3F5",`<span class="rkr-c">${crest(nmOf(R.fark.m,R.fark.k),R.fark.k,30)}</span>`,esc(nmOf(R.fark.m,R.fark.k))+eq2(R.fark),`${esc(fmtShort(R.fark.m.date))} maçı`,"viewm",R.fark.m.id));
  if(R.asist)G2.push(row("En çok asist yapan",R.asist.v,"asist","#5FE3F5",pFace(R.asist.id),esc(nameOf(R.asist.id))+eq2(R.asist),`${R.asist.yr}. sezonda`,"open",R.asist.id));
  if(R.motm)G3.push(row("En çok maçın adamı seçilen",R.motm.v,"kez","#FFD400",pFace(R.motm.id),esc(nameOf(R.motm.id))+eq2(R.motm),"","open",R.motm.id));
  if(R.mac)G3.push(row("En çok maça çıkan",R.mac.v,"maç","#fff",pFace(R.mac.id),esc(nameOf(R.mac.id))+eq2(R.mac),"","open",R.mac.id));
  h+=grp("Tek maçta","Bir maçta yapılan en iyiler",G1)+grp("Bir sezonda","Tek sezon içinde toplanan",G2)+grp("Bütün zamanlar","İlk maçtan bugüne toplam",G3);
  if(s){const last=F[F.length-1].id;const C=Object.entries(st).filter(([id,x])=>x.w>=2&&x.last===last&&x.w>=s.v-1).sort((a,b)=>b[1].w-a[1].w)[0];
    if(C)h+=`<div class="rk-nx">${ICON_BOLT}<span><b>Sıradaki maçta kırılabilir</b><small>${esc(nameOf(C[0]))} ${C[1].w} maçtır kazanıyor. Bir galibiyet daha ${C[1].w>=s.v?"rekoru yeniler":"rekoru egale eder"}.</small></span></div>`}
  return h+``}
/* haftalık bülten: maç detayından açılır, her açılışta maç verisinden üretilir */
function bultenRow(m){return `<button class="blt-r" data-act="bultenOpen" data-id="${esc(m.id)}"><span class="blt-ri"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4zM9 9h6M9 13h6M9 17h3"/></svg></span><span class="blt-rx"><b>Haftanın bülteni</b><small>Senin haftan, haftanın yedisi, seriler</small></span><i>${CHV}</i></button>`}
const ypEmbed=x=>x&&x.html?`<div class="blt-yp"><div style="zoom:${Math.min(1,(Math.min(innerWidth,560)-36)/540).toFixed(3)}">${x.html}</div></div>`:"";
const statRow=L=>`<div class="pv-st blt-st" style="grid-template-columns:repeat(${L.length},1fr)">${L.map(([v,l,ic,c,cls])=>`<div>${dIcon(ic,c,24)}<b class="num${cls?" "+cls:""}">${v}</b><span>${l}</span></div>`).join("")}</div>`;
function sheetBulten(){const m=S.matches.find(x=>x.id===S.sheet.id);return m?inM(m,()=>_sheetBulten(m)):_sheetBulten(null)}
function _sheetBulten(m){const inf=m&&S.mInfo[m.id];const hd=sub=>`<div class="mzvh"><button class="mzic" data-act="close" aria-label="Kapat">${ICON.x}</button><div><h2>Haftanın bülteni</h2>${sub?`<small>${sub}</small>`:""}</div></div>`;
  if(!m||!inf)return hd("")+`<p class="muted">Bu maçın bülteni hazır değil.</p>`;
  const Fall=fin();const yr=yrOf(m);const upTo=Fall.filter(x=>matchTs(x)<=matchTs(m));const Fs=upTo.filter(x=>yrOf(x)===yr);const Fp=Fs.filter(x=>x.id!==m.id);
  const T1=ligTable(Fs),T0=Fp.length?ligTable(Fp):[];const pos=(T,id)=>{const i=T.findIndex(o=>o.id===id);return i<0?null:i+1};
  const sa=+m.score_a||0,sb=+m.score_b||0;const d0=parseYmd(m.date);const wk=Fs.length;const me=myPid()||S.me;const stt=m.stats||{};
  let h=hd(`${wk}. hafta · ${d0.getDate()} ${AYLAR[d0.getMonth()]}`)+`<div class="blt">`;
  const r=me&&inf.pts[me];
  if(r){const hh=S.stats[me]&&S.stats[me].hist.find(x=>x.m.id===m.id&&x.kind==="oynadi");const p1=pos(T1,me),p0=pos(T0,me);const dp=p0&&p1?p0-p1:0;const L=[[fN(r.pts),"Maç notun","yildiz","gold"]];
    if(hh)L.push([(hh.od>0?"+":"")+hh.od,"Kartın "+hh.ovr,"grafik","green",hh.od>0?"up":hh.od<0?"dn":""]);
    if(p1)L.push([p1+".",dp?`Tabloda ${dp>0?"▲":"▼"}${Math.abs(dp)}`:"Tabloda","kupa","gold"]);
    h+=`<section><div class="tsx"><h2>Senin haftan</h2></div>${statRow(L)}</section>`}
  const mo=inf.motm&&realP(inf.motm)?inf.motm:null;const mr=mo&&inf.pts[mo];
  h+=`<section class="card blt-s"><div class="blt-sc"><span>${crest(TEAM.A,"A",28)}<b>${esc(TEAM.A)}</b></span><em class="num">${sa}<i>–</i>${sb}</em><span class="r">${crest(TEAM.B,"B",28)}<b>${esc(TEAM.B)}</b></span></div>`;
  if(mo){const ph=photoOf(mo);const kl=mr&&mr.role==="KL";
    h+=`<button class="motmc" data-act="open" data-id="${esc(mo)}"><span class="mph">${ph?`<img src="${esc(ph)}" alt="">`:avatar(P(mo))}</span><span class="mmi"><span class="eyebrow">Maçın Adamı</span>${mr?`<span class="nt ${noteCls(mr.pts)}">★ ${fN(mr.pts)}</span>`:""}<b>${esc(nameOf(mo))}</b><span class="muted small">${esc(TEAM[mr?mr.side:"A"])}${mr?" · "+ROLE_NAME[mr.role]:""}</span></span><span class="mms">${kl?`<span><small>Yenilen</small><b>${mr.op}</b></span>`:`<span><small>Gol</small><b>${+stt[mo]?.g||0}</b></span>`}<span><small>Asist</small><b>${+stt[mo]?.a||0}</b></span></span></button>`}
  h+=`</section>`;
  const tw=ypEmbed(ypTotw(m));if(tw)h+=`<section><div class="tsx"><h2>Haftanın yedisi</h2></div>${tw}</section>`;
  if(T0.length){const mv=T1.map(o=>({id:o.id,p1:pos(T1,o.id),p0:pos(T0,o.id)})).filter(x=>x.p0&&x.p0!==x.p1).map(x=>({...x,d:x.p0-x.p1})).sort((a,b)=>Math.abs(b.d)-Math.abs(a.d)||a.p1-b.p1).slice(0,3);
    if(mv.length)h+=`<section><div class="tsx"><h2>Tabloda hareket</h2></div><div class="card blt-c">${mv.map(x=>`<button class="blt-l" data-act="open" data-id="${esc(x.id)}"><span class="blt-d ${x.d>0?"up":"dn"}">${x.d>0?"▲":"▼"} ${Math.abs(x.d)}</span>${avatar(P(x.id),"sm")}<b>${esc(nameOf(x.id))}</b><small>${x.p1===1&&x.d>0?"Lider oldu":x.p1+". sıra"}</small></button>`).join("")}</div></section>`}
  const A=rekorCalc(upTo),B0=rekorCalc(upTo.filter(x=>x.id!==m.id));const st=A.st;const here=Object.entries(st).filter(([id,x])=>x.last===m.id);
  const top=(f,min)=>{const L=here.map(([id,x])=>[id,f(x)]).filter(x=>x[1]>=min).sort((a,b)=>b[1]-a[1]);return L[0]||null};
  const w=top(x=>x.w,2),g=top(x=>x.g,2),nw=top(x=>x.nw||0,3);const rec=A.R.seri?A.R.seri.v:0;
  const sr=(o,cls,txt,pl)=>`<button class="blt-l" data-act="open" data-id="${esc(o[0])}"><span class="blt-k ${cls} num">${o[1]}</span>${avatar(P(o[0]),"sm")}<span class="blt-t"><b>${esc(nameOf(o[0]))}</b><small>${o[1]} maçtır ${txt}</small></span>${pl?`<em class="blt-pl">${pl}</em>`:""}</button>`;
  const S3=[];if(w)S3.push(sr(w,"up","kazanıyor",rec>=3&&w[1]>=rec?"Rekor":rec>=3&&w[1]===rec-1?"Rekora 1 kaldı":""));if(g)S3.push(sr(g,"gs","gol atıyor"));if(nw)S3.push(sr(nw,"dn","kazanamıyor"));
  if(S3.length)h+=`<section><div class="tsx"><h2>Seriler</h2></div><div class="card blt-c">${S3.join("")}</div></section>`;
  const LAB={seri:["Galibiyet serisi",v=>v+" maç"],gol:["Tek maçta en çok gol",v=>v+" gol"],fark:["En farklı skor",v=>v+" fark"],not:["En yüksek maç notu",v=>fN(v)],asist:["Sezonda en çok asist",v=>v+" asist"],motm:["En çok maçın adamı",v=>v+" kez"]};
  const brk=Object.keys(LAB).map(k=>{const a=A.R[k],b=B0.R[k];return a&&b&&a.m.id===m.id&&a.v>b.v?{k,a}:null}).filter(Boolean)[0];
  const kr=typeof BET!=="undefined"&&BET.kral&&isMember()?(BET.kral.wk===betMon(m.date)?BET.kral:(BET.kral.hist||[]).find(x=>x.wk===betMon(m.date))):null;
  if(typeof BET!=="undefined"&&isMember()&&BET.kral===undefined&&!sheetBulten.k){sheetBulten.k=1;kralLoad(false).then(()=>{if(S.sheet&&S.sheet.type==="bulten")render(true)}).catch(()=>{})}
  if((kr&&P(kr.p))||brk){h+=`<div class="rk-g">${kr&&P(kr.p)?`<button class="rk-b tk" data-act="open" data-id="${esc(kr.p)}"><span class="rk-ey">Tahmin kralı</span><b class="num">${kr.net>0?"+":""}${Number(kr.net||0).toLocaleString("tr-TR")}</b><strong>${esc(nameOf(kr.p))}</strong><small>sikke kazandı · gelecek maç yelek giymiyor</small></button>`:""}${brk?`<button class="rk-b" data-act="rekTab"><span class="rk-ey">Rekor kırıldı</span><b class="num" style="color:#FF7AC3">${LAB[brk.k][1](brk.a.v)}</b><strong>${esc(brk.a.id?nameOf(brk.a.id):nmOf(m,brk.a.k))}</strong><small>${LAB[brk.k][0]}</small></button>`:""}</div>`;
    if(kr&&P(kr.p))h+=`<small class="blt-n">Para yok, bahis değil; sadece keyfine. Sikke temsilidir.</small>`}
  const om=openMatch();if(om&&Fall[Fall.length-1].id===m.id){const dn=parseYmd(om.date);const left=Math.max(0,sLen()-seasonCount(curYr()));
    h+=`<section class="card blt-nx"><span><span class="eyebrow">Sıradaki maç</span><b>${GUNLER[dn.getDay()]} ${esc(String(om.time||"").slice(0,5))}${S.settings.field_name?" · "+esc(S.settings.field_name):""}</b>${left?`<small>Sezonun bitmesine ${left} maç kaldı</small>`:""}</span><button class="btn sm primary" data-act="tab" data-tab="mac">Maça git</button></section>`}
  return h+`</div>`}
/* sezon sonu ödül töreni: Lig'de biten sezonun kartından açılır */
function odulCard(n,w){const c=w.champ;const ph=photoOf(c.id);return `<button class="motmc od-card" data-act="odulOpen" data-id="${n}"><span class="mph">${ph?`<img src="${esc(ph)}" alt="">`:avatar(P(c.id))}</span><span class="mmi"><span class="eyebrow">${n}. sezon ödül töreni</span><b>${esc(nameOf(c.id))}</b><span class="muted small">Şampiyon · ${c.p} puan</span></span><span class="od-go">${CHV}</span></button>`}
function odulGelisen(F){let best=null;const ids=new Set(F.map(m=>m.id));
  for(const p of S.players){if(p.guest)continue;const H=((S.stats[p.id]||{}).hist||[]).filter(x=>x.kind==="oynadi"&&ids.has(x.m.id));if(H.length<Math.min(3,F.length))continue;
    const a=H[0].ovr-(H[0].od||0),b=H[H.length-1].ovr;if(b-a>0&&(!best||b-a>best.d))best={id:p.id,a,b,d:b-a}}return best}
function sheetOdul(){const n=+S.sheet.n;const w=seasonAwards(n);const hd=sub=>`<div class="mzvh"><button class="mzic" data-act="close" aria-label="Kapat">${ICON.x}</button><div><h2>Ödül töreni</h2>${sub?`<small>${sub}</small>`:""}</div></div>`;
  if(!w||!w.champ)return hd("")+`<p class="muted">Bu sezonda maç yok.</p>`;
  const c=w.champ;const gl=odulGelisen(w.F);const wks=new Set(w.F.map(m=>betMon(m.date)));
  let tk=null;if(typeof BET!=="undefined"&&BET.kral&&isMember()){const cn={};[BET.kral,...(BET.kral.hist||[])].forEach(x=>{if(x&&x.p&&wks.has(x.wk))cn[x.wk]=x.p});const t={};Object.values(cn).forEach(p=>t[p]=(t[p]||0)+1);const e=Object.entries(t).sort((a,b)=>b[1]-a[1])[0];if(e&&P(e[0]))tk={id:e[0],v:e[1]}}
  if(typeof BET!=="undefined"&&isMember()&&BET.kral===undefined&&!sheetOdul.k){sheetOdul.k=1;kralLoad(false).then(()=>{if(S.sheet&&S.sheet.type==="odul")render(true)}).catch(()=>{})}
  const cph=photoOf(c.id);
  let h=hd(`${n}. sezon · ${w.F.length} maç`)+`<div class="blt od">`;
  h+=`<button class="od-hero" data-act="open" data-id="${esc(c.id)}"><span class="od-tr">${dIcon("kupa","gold",30)}<span class="eyebrow">Şampiyon</span></span><span class="od-ph">${cph?`<img src="${esc(cph)}" alt="">`:`<i>${esc(initials(nameOf(c.id)))}</i>`}</span><b class="od-nm">${esc(nameOf(c.id))}</b>${statRow([[c.p,"Puan","kupa","gold"],[c.G+"-"+c.B+"-"+c.M,"G-B-M","takvim","lila"],[(c.av>0?"+":"")+c.av,"Averaj","top","pink"]])}</button>`;
  const prow=(id,lab,val,k)=>`<button class="blt-l od-r" data-act="open" data-id="${esc(id)}">${k?`<span class="od-k">${k}</span>`:""}${avatar(P(id),"sm")}<span class="blt-t"><small>${esc(lab)}</small><b>${esc(nameOf(id))}</b></span><strong class="num">${val}</strong></button>`;
  if(w.mvp)h+=`<section><div class="tsx"><h2>Sezonun oyuncusu</h2></div><div class="card blt-c">${prow(w.mvp.id,w.mvp.n+" maç · yelek puanı lideri",fP(w.mvp.tot))}</div></section>`;
  const pa=POS_AW.filter(([k])=>w.pos[k]);
  if(pa.length)h+=`<section><div class="tsx"><h2>Mevki yarışları</h2></div><div class="card blt-c">${pa.map(([k,t])=>prow(w.pos[k].id,t,fP(w.pos[k].tot),k)).join("")}</div></section>`;
  const kb=(lab,o,val,col,cls)=>o&&P(o.id)?`<button class="rk-b${cls||""}" data-act="open" data-id="${esc(o.id)}"><span class="rk-ey">${lab}</span><b class="num" style="color:${col}">${val}</b><span class="od-kw">${avatar(P(o.id),"sm")}<strong>${esc(shortName(nameOf(o.id)))}</strong></span></button>`:"";
  const K=[kb("Gol kralı",w.g,w.g&&w.g.v,"#FF7AC3"),kb("Asist kralı",w.a,w.a&&w.a.v,"#5FE3F5"),kb("En çok maçın adamı",w.mo,w.mo&&w.mo.v,"#FFD400"),kb("En çok gelişen",gl,gl&&"+"+gl.d,"#00E58A"),kb("Sezonun tahmin kralı",tk,tk&&tk.v+" hafta","#fff"," tk")].filter(Boolean);
  if(K.length)h+=`<section><div class="tsx"><h2>Krallar</h2></div><div class="rk-g">${K.join("")}</div>${tk?`<small class="blt-n">Para yok, bahis değil; sadece keyfine. Sikke temsilidir.</small>`:""}</section>`;
  return h+`<div class="od-a"><button class="btn primary" data-act="seasonStory" data-id="${n}">Töreni izle</button><button class="btn ghost" data-act="odulShare" data-id="${n}">Görseli paylaş</button></div></div>`}
function viewGecmis(){
  const F=[...fin(),...extFin()].filter(inYr).sort((a,b)=>matchTs(b)-matchTs(a));const E=extFin();
  if(S.view){const vm=F.find(m=>m.id===S.view);if(vm){const i=F.indexOf(vm);
    return `<div class="row" style="justify-content:space-between"><button class="btn ghost sm" data-act="back">${ICON_BACK} Fikstür</button><span class="row" style="gap:6px">${F[i+1]?`<button class="btn sm" data-act="viewm" data-id="${esc(F[i+1].id)}" aria-label="Önceki maç">‹ Önceki</button>`:""}${F[i-1]?`<button class="btn sm" data-act="viewm" data-id="${esc(F[i-1].id)}" aria-label="Sonraki maç">Sonraki ›</button>`:""}</span></div>`+(isExt(vm)?extPanel(vm):resultPanel(vm))}}
  let h=`${S.fol?folBar():oyTabs("gecmis")}`;
  // fikstür hikâye şeridi kaldırıldı; maç hikâyesi yalnızca maç detayında
  if(!F.length&&!openMatch())return h+`<section class="card"><div class="empty emp2">${empIc("takvim","cyan")}<h3>İlk düdük bekleniyor</h3><p>İlk maçı gir, kartlar uyansın. Oynanan her maç burada birikir.</p>${S.admin?`<button class="btn primary" data-act="tab" data-tab="mac">Maç oluştur</button>`:""}</div></section>`;
  const om=openMatch();let cur="";h+=`<div class="glist">`;
  if(S.admin)h+=`<button class="fnew xadd" data-act="extNew"><span class="xadd-i">${ICON.plus}</span><span><b>Dış maç ekle</b><small>Başka bir takıma karşı oynadığınız maç</small></span></button>`;
  if(om){const d=parseYmd(om.date);const t0=new Date();t0.setHours(0,0,0,0);const dd=Math.round((d-t0)/864e5);
    const left=dd<=0?"Bugün":dd===1?"Yarın":dd+" gün kaldı";const wk=Math.min(seasonCount(curYr())+1,sLen());
    const cap=k=>{const id=k==="A"?om.cap_a:om.cap_b;const ok=id&&P(id);const ph=ok&&photoOf(id);
      return `<span class="btkt"><span class="btkc">${ok?(ph?`<img src="${esc(ph)}" alt="">`:`<i>${esc(initials(nameOf(id)))}</i>`):crest(nmOf(om,k),k,52,nmOf(om,k==="A"?"B":"A"))}</span><b>${esc(nmOf(om,k))}</b>${ok?`<small>KPT · ${esc(shortName(nameOf(id)))}</small>`:""}</span>`};
    h+=`<div class="gm">Sıradaki maç</div><button class="mzfx nx" data-act="tab" data-tab="mac"><span class="mzd"><b>${d.getDate()}</b><small>${AYLAR[d.getMonth()].slice(0,3).toLocaleUpperCase("tr")}</small></span>
      <span class="mzfx-t"><b>${esc(nmOf(om,"A"))} – ${esc(nmOf(om,"B"))}</b><small>${GKISA[d.getDay()]} ${esc(String(om.time||"").slice(0,5))}</small></span>${tkCd(matchTs(om),left)}</button>`}
  for(const m of F){const d=parseYmd(m.date);const mk=AYLAR[d.getMonth()]+" "+d.getFullYear();if(mk!==cur){h+=`<div class="gm">${mk}</div>`;cur=mk}
    const i=S.mInfo[m.id]||{};const sa=+m.score_a||0,sb=+m.score_b||0;const st=m.stats||{};const ext=isExt(m);
    const sc=k=>(k==="A"?m.team_a:m.team_b||[]).filter(id=>+st[id]?.g).map(id=>firstName(nameOf(id))+(+st[id].g>1?" ×"+st[id].g:"")).join(", ");
    const me=S.me&&playSide(m,S.me);const myRes=me?((me==="A"?sa-sb:sb-sa)>0?"G":(me==="A"?sa-sb:sb-sa)<0?"M":"B"):"";
    const nA=ext?esc(S.settings.group_name):`<span class="bibdot"></span>${esc(nmOf(m,"A"))}`,nB=ext?esc(m.opponent||"Rakip"):`<span class="nobib"></span>${esc(nmOf(m,"B"))}`;
    const motm=ext?m.motm:i.motm;
    const nA2=ext?esc(S.settings.group_name):esc(nmOf(m,"A")),nB2=ext?esc(m.opponent||"Rakip"):esc(nmOf(m,"B"));
    const tr=(k,n,v,w)=>`<span class="frr${w?" w":""}">${ext?(k==="A"?`<span class="frx">${IGLOGO}</span>`:`<span class="frx o"></span>`):crest(nmOf(m,k),k,20,nmOf(m,k==="A"?"B":"A"))}<span class="frn">${n}</span><b class="num">${v}</b></span>`;
    h+=`<button class="mzfx${ext?" ext":""}${myRes?" r"+myRes:""}" data-act="viewm" data-id="${esc(m.id)}"><span class="mzd"><b>${d.getDate()}</b><small>${AYLAR[d.getMonth()].slice(0,3).toLocaleUpperCase("tr")}</small></span>
      <span class="mzfx-t">${ext?`<span class="xchip">Dış maç</span>`:""}<span class="mzfx-l${sa>=sb?" w":""}">${nA2}</span><span class="mzfx-l${sb>=sa?" w":""}">${nB2}</span></span>
      <span class="mzfx-s num"><b class="${sa>=sb?"w":""}">${sa}</b><b class="${sb>=sa?"w":""}">${sb}</b></span></button>`}
  return h+`</div>`}
// kadrodan çıkarılan oyuncular: geri alınabilir (maç geçmişi ve kartı duruyor)
function sheetArch(){if(!S.admin)return"";const L=S.all.filter(p=>p.archived&&!p.guest).sort((a,b)=>a.name.localeCompare(b.name,"tr"));
  return `<div class="ch"><h2>Çıkarılan oyuncular</h2><button class="mzic" data-act="close" aria-label="Kapat">${ICON.x}</button></div><p class="muted small">Kadrodan çıkarılan oyuncunun kartı ve maç geçmişi silinmez; geri alınca kaldığı yerden devam eder.</p>
    ${L.length?`<div class="sbox">${L.map(p=>`<div class="setr nolink">${avatar(p)}<span class="setx"><b>${esc(p.name)}</b><small>${esc(eposOf(p))} · ${ovrOf(p.id)}</small></span><button class="btn sm" data-act="restoreP" data-id="${esc(p.id)}">Geri al</button></div>`).join("")}</div>`:`<p class="muted">Çıkarılan oyuncu yok.</p>`}`}
function sheetExt(){if(!S.admin)return"";const f=S.f.ext;if(!f)return"";const ps=S.players.slice().sort((a,b)=>byPos(a.id,b.id)),gs=S.guests.slice().sort((a,b)=>a.name.localeCompare(b.name,"tr"));const opps=[...new Set(extFin().map(m=>m.opponent).filter(Boolean))];
  const inT=id=>f.team.includes(id);const stp2=(id,k,l)=>{const v=(f.stats[id]||{})[k]||0;return `<span class="stp${v?" on":""}"><label>${l}</label><button data-act="extSt" data-p="${esc(id)}" data-k="${k}" data-d="-1" aria-label="${l} azalt">−</button><b>${v}</b><button data-act="extSt" data-p="${esc(id)}" data-k="${k}" data-d="1" aria-label="${l} artır">+</button></span>`};
  const us=S.settings.group_name,op=f.opp||"Rakip";
  const side=(n,k,v,isOpp)=>`<div class="xsbt"><span class="xsbc">${isOpp?crest(n,"B",40,us):`<span class="frx">${IGLOGO}</span>`}</span><span class="xsbn">${esc(n)}</span><b class="num">${v}</b><span class="xsbp"><button data-act="extSc" data-k="${k}" data-d="-1" aria-label="${esc(n)} skorunu azalt">−</button><button data-act="extSc" data-k="${k}" data-d="1" aria-label="${esc(n)} skorunu artır">+</button></span></div>`;
  return `<div class="ch"><div><div class="eyebrow">Dış maç</div><h2>${f.id?"Maçı düzelt":"Dış maç ekle"}</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
    <div class="xform">
    <label class="f" for="exOpp">Rakip takım<input id="exOpp" type="text" maxlength="40" list="oppList" data-bind="ext.opp" value="${esc(f.opp)}" placeholder="Rakip takımın adı" autocomplete="off"><datalist id="oppList">${opps.map(o=>`<option value="${esc(o)}">`).join("")}</datalist></label>
    <label class="f" for="exDate">Tarih<input id="exDate" type="date" data-bind="ext.date" value="${esc(f.date)}"></label>
    <section class="xsb" aria-label="Skor">${side(us,"us",f.us,0)}<span class="xsbd">–</span>${side(op,"them",f.them,1)}</section>
    <div><div class="xhd"><span class="eyebrow">Kadro</span><small>${f.team.length?f.team.length+" kişi seçildi":"Oynayanlara dokun"}</small></div>${(()=>{const pk=p=>`<button class="pk${inT(p.id)?" on":""}" data-act="extPick" data-p="${esc(p.id)}" aria-pressed="${inT(p.id)}">${avatar(p,"xs")}<span>${esc(shortName(p.name))}</span><i${inT(p.id)?"":' class="off"'}>${ICON.check}</i></button>`;
      return `<div class="chipsP">${ps.map(pk).join("")}</div>${gs.length?`<div class="xhd" style="margin-top:12px"><span class="eyebrow">Misafirler</span></div><div class="chipsP">${gs.map(pk).join("")}</div>`:""}`})()}
      <form data-form="extGuest" class="guestf" style="margin-top:10px"><input id="extGuestName" type="text" maxlength="40" placeholder="Kadroda olmayan oyuncu (misafir)" autocomplete="off" data-bind="extGuest" value="${esc(S.f.extGuest||"")}"><button class="btn sm" type="submit">${ICON.plus} Ekle</button></form></div>
    ${f.team.length?`<div class="tblock"><span class="eyebrow">Gol ve asist</span>${f.team.map(id=>`<div class="srow"><div class="who"><b>${esc(nameOf(id))}</b></div><div class="steps">${stp2(id,"g","GOL")}${stp2(id,"a","AST")}</div></div>`).join("")}</div>
    <label class="f" for="exMotm">Maçın adamı<select id="exMotm" data-bind="ext.motm"><option value="">Seçilmedi</option>${f.team.map(id=>`<option value="${esc(id)}"${f.motm===id?" selected":""}>${esc(nameOf(id))}</option>`).join("")}</select></label>`:""}
    <button class="btn primary block" data-act="extSave">${ICON.check} Kaydet</button></div>`}
function dayWord(date){const d=parseYmd(date),t=new Date();t.setHours(0,0,0,0);const df=Math.round((d-t)/864e5);return df===0?"Bugün":df===1?"Yarın":""}
function avgX(ids){const v=ids.map(id=>{const s=S.stats[id];return s&&s.genX!=null?s.genX:ovrOf(id)}).filter(x=>x!=null);return v.length?v.reduce((a,b)=>a+b,0)/v.length:0}
function powerBar(m,A,B){const a=flo(avgX(A)),b=flo(avgX(B));const sa=Math.max(15,Math.min(85,50+(a-b)*6));
  return `<div class="pw"><div class="pwl"><span>Güç <b class="num">${a}</b></span><span>${a===b?"Denk maç":(a>b?"◀ ":"")+"Fark "+Math.abs(a-b)+(a>b?"":" ▶")}</span><span><b class="num">${b}</b> Güç</span></div>
  <div class="pwb${anim("pw_"+m.id+"_"+A.length+B.length)}" role="img" aria-label="Güç karşılaştırması"><i class="a" style="width:${sa}%;flex:none"></i><i class="b" style="width:${100-sa}%;flex:none"></i></div></div>`}
function heroVs(om){const fld=S.settings.field_name;const d=parseYmd(om.date);const dw=dayWord(om.date);const A=om.team_a||[],B=om.team_b||[];const has=A.length&&B.length;
  return `<div class="vs"><div class="vt a"><span class="vn${TEAM.A.length>11?" l2":""}">${TEAM.A}</span></div><span class="vx">vs</span><div class="vt b"><span class="vn${TEAM.B.length>11?" l2":""}">${TEAM.B}</span></div></div>${has?powerBar(om,A,B):""}
  <div class="vmeta">${ICON.pin}<span>${dw?`<b>${dw}</b> · `:""}${d.getDate()} ${AYLAR[d.getMonth()]}${dw?"":" "+GUNLER[d.getDay()]} · <b>${esc(om.time||"")}</b>${fld?" · "+esc(fld):""}</span></div>`}
function heroWhen(date,time){const d=parseYmd(date);const fld=S.settings.field_name;
  return `<div class="when"><span class="wd">${GUNLER[d.getDay()]}</span><span class="dt">${d.getDate()} ${AYLAR[d.getMonth()]}</span><span class="tm">${ICON.pin}${esc(time)}${fld?" · "+esc(fld):""}</span></div>`}
function mafEmpty(date,time,nA,nB,label,sub){const d=parseYmd(date);const fld=S.settings.field_name;const t0=new Date();t0.setHours(0,0,0,0);const dd=Math.round((d-t0)/864e5);
  const left=dd<0?"":dd===0?"BUGÜN":dd===1?"YARIN":dd+" GÜN SONRA";const side=(n,k)=>`<div class="maft"><span class="mafcap crw">${crest(n,k,64,k==="A"?nB:nA)}</span><b style="font-size:${mafFs(n)}">${esc(n)}</b></div>`;
  return `<section class="maf"><div class="mafh"><span>${GKISA[d.getDay()]} ${d.getDate()} ${AYLAR[d.getMonth()].toLocaleUpperCase("tr")}${fld?" · "+esc(fld).toLocaleUpperCase("tr"):""}</span><span>${label}</span></div>
    <div class="mafm">${side(nA,"A")}<div class="mafc">${left?`<span>${left}</span>`:""}<b class="num">${esc(String(time||"").slice(0,5))}</b></div>${side(nB,"B")}</div>
    <div class="mafb"><div class="mafme"><span>${sub}</span><em>${label==="YENİ MAÇ"?"Taslak":"Bekleniyor"}</em></div></div></section>`}
function noMatchHero(){const d=nextDay(+S.settings.day);return mafEmpty(d,S.settings.time,TEAM.A,TEAM.B,"SIRADAKİ MAÇ","Yönetici maçı açınca kadrolar burada görünür")}
const NAMEP=[["Kırmızılar","Maviler"],["Beyazlar","Siyahlar"],["Kartallar","Aslanlar"],["Şimşekler","Yıldızlar"],["Kuzey","Güney"],["Turuncular","Yeşiller"],["Fırtına","Yıldırım"],["Atmacalar","Şahinler"],["Doğu","Batı"],["Gece","Gündüz"]];
const sugg=()=>{if(!S.f.sugg)S.f.sugg=NAMEP[Math.floor(Math.random()*NAMEP.length)];return S.f.sugg};
/* yeni takım rehberi: maç oynanana kadar Maç sekmesinde, adım adım */
function setupGuide(){if(!S.admin||fin().length||extFin().length||LS.get("y_gd_"+TID))return"";
  const np=S.players.length,sh=!!LS.get("y_shr_"+TID);
  const st=[["Ekip ve saha","Saha adı, maç günü ve saati",!!(S.settings.field_name&&S.settings.time),`<button class="btn sm" data-act="setpGo" data-v="grup">Düzenle</button>`],
    ["Oyuncuları ekle",np>=8?np+" oyuncu eklendi":`${np}/8 oyuncu · kadro kurmak için en az 8`,np>=8,`<button class="btn sm" data-act="tab" data-tab="kartlar">${ICON.plus} Ekle</button>`],
    ["Linki gönder","Oyuncular takımı bulup kendi kartını seçsin",sh,`<button class="btn sm" data-act="gdLink" data-v="davet">Linkler</button>`],
    ["Ligi takibe aç","İsteğe bağlı · arkadaşlar skorları izlesin",!!S.settings.followable,`<button class="btn sm" data-act="gdLink" data-v="takip">Aç</button>`],
    ["İlk maçı aç","Aşağıdan tarih ve takım adlarını seç",false,""]];
  const done=st.filter(x=>x[2]).length;const nx=st.findIndex(x=>!x[2]);
  return `<section class="card gd"><div class="gdh"><div><div class="eyebrow">Kurulum · ${done}/${st.length}</div><h2>Takımını hazırla</h2></div><button class="lnk" data-act="gdHide">Gizle</button></div>
    <span class="gdbar"><i style="width:${Math.round(done/st.length*100)}%"></i></span>
    <ol class="gdl">${st.map(([t,d,ok,b],i)=>`<li class="${ok?"ok":i===nx?"now":""}"><span class="gdc">${ok?ICON.check:i+1}</span><span class="gdt"><b>${t}</b><small>${d}</small></span>${ok?"":b}</li>`).join("")}</ol><p class="muted small" style="margin:10px 0 0">18 yaşından küçük oyuncu eklersen kart, fotoğraf ve yaş için velisinin onayını al.</p></section>`}
function createHero(){const d=S.f.newDate||nextDay(+S.settings.day);const tm=S.f.newTime||S.settings.time;
  const sg=sugg();const nA=cleanName(S.f.newNameA||"")||sg[0],nB=cleanName(S.f.newNameB||"")||sg[1];const few=S.players.length<6;
  return `${mafEmpty(d,tm,nA,nB,"YENİ MAÇ","Tarihi ve takım adlarını seç, maçı aç")}
    ${setupGuide()}
    ${createForm()}`}
function createForm(){const d=S.f.newDate||nextDay(+S.settings.day);const tm=S.f.newTime||S.settings.time;const sg=sugg();
  return `<section class="card nmf"><div class="eyebrow">Maçı aç</div>
    <div class="grid2"><label class="f" for="nmDate">Tarih<input type="date" id="nmDate" data-bind="newDate" value="${esc(d)}"></label>
    <label class="f" for="nmTime">Saat${timeSel("nmTime","newTime",tm)}</label></div>
    <div class="grid2"><label class="f" for="nmA"><span><i class="bibdot"></i> 1. takımın adı</span><input type="text" id="nmA" maxlength="20" data-bind="newNameA" value="${esc(S.f.newNameA||"")}" placeholder="${esc(sg[0])}"></label>
    <label class="f" for="nmB"><span><i class="nobib"></i> 2. takımın adı</span><input type="text" id="nmB" maxlength="20" data-bind="newNameB" value="${esc(S.f.newNameB||"")}" placeholder="${esc(sg[1])}"></label></div>
    <button class="lnk" data-act="suggNew">Başka isim öner</button>
    <button class="btn primary block" data-act="createMatch">${ICON.plus} Maçı aç</button></section>`}
function bhWhen(date,time,extra){const d=parseYmd(date);const fld=S.settings.field_name;const dw=dayWord(date);
  return `<span class="bh-ey">Sıradaki maç</span><h1 class="bh-when">${dw||GUNLER[d.getDay()]}<br>${esc(time||"")}</h1>
  <div class="bh-chips">${extra||""}<span>${d.getDate()} ${AYLAR[d.getMonth()]}</span>${fld?`<span>${esc(fld)}</span>`:""}</div>`}
const bhTeam=k=>`<div class="bh-t ${k.toLowerCase()}"><span class="bh-c" aria-hidden="true">${esc((TEAM[k]||"?").trim().charAt(0).toLocaleUpperCase("tr"))}</span><b>${esc(TEAM[k])}</b></div>`;
const sbFs=t=>{const w=Math.max(...String(t||"").split(/\s+/).map(x=>x.length));return w<=5?"2.4rem":w<=7?"1.95rem":w<=9?"1.6rem":"1.3rem"};
const mafFs=t=>{const n=String(t||"").length;return n<=8?"clamp(1rem,5.6vw,1.35rem)":n<=12?"clamp(.88rem,4.5vw,1.15rem)":"clamp(.8rem,3.9vw,1rem)"};
const mzFs=n=>Math.max(24,Math.min(42,46-Math.max(0,String(n||"").length-8)*1.9))+"px";
function hero(om){
  const A=om.team_a||[],B=om.team_b||[];const d=parseYmd(om.date);
  const me=S.me&&(A.includes(S.me)?"A":B.includes(S.me)?"B":"");
  const t0=new Date();t0.setHours(0,0,0,0);const dd=Math.round((d-t0)/864e5);const ended=mEnded(om)||om.state==="bitti",scored=ended&&om.state==="bitti";const left=ended?"MAÇ BİTTİ":dd<0?"":dd===0?"BUGÜN":dd===1?"YARIN":dd+" GÜN KALDI";
  const wk=Math.min(seasonCount(curYr())+1,sLen());
  const fld=(S.settings&&S.settings.field_name)||"";const gun=["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"][d.getDay()];
  const ms=matchTs(om)-Date.now();const kal=ended?"Maç bitti":ms<=0?"Başladı":ms<864e5?`${Math.floor(ms/36e5)} sa ${Math.floor(ms%36e5/6e4)} dk`:ms<3*864e5?`${Math.floor(ms/864e5)} gün ${Math.floor(ms%864e5/36e5)} sa`:`${Math.floor(ms/864e5)} gün`;
  const row=k=>`<span class="mzh-t t${k}${me&&me!==k?" o":""}"><i class="mzd"></i><b style="font-size:${mzFs(TEAM[k])}">${esc(TEAM[k])}</b>${scored?`<em class="num">${k==="A"?+om.score_a||0:+om.score_b||0}</em>`:""}</span>`;const ts=matchTs(om);
  return `<section class="mzh"><div class="mzg">${ended?`<span class="e">Maç bitti</span>`:""}<span>${MZI.cal}${gun}</span><span>${MZI.clk}${esc(String(om.time||"").slice(0,5))}</span>${fld?`<span class="f">${MZI.pin}<i>${esc(fld)}</i></span>`:""}</div>
    <div class="mzh-vs">${row("A")}${row("B")}</div>${ended?"":`<div class="mcd"><div class="mcd-r"><small>İlk düdüğe</small><b class="num" data-mcd="${ts}" role="timer" aria-label="Maça kalan süre">${mcdT(ts)}</b></div><div class="mcd-b"><i style="width:${mcdP(ts)}%"></i>${dIcon("duduk","gold",24)}</div></div>`}${mDone(om)?"":haftaAkis(om)}
    </section>`;
}
function mzTiles(){const F=fin().filter(m=>!isExt(m));const lf=F[F.length-1];if(!lf)return"";const sa=+lf.score_a||0,sb=+lf.score_b||0;
  const res=sa===sb?"Berabere":esc(nmOf(lf,sa>sb?"A":"B"))+" kazandı";const L=ligTable(fin().filter(inYr));const ld=L[0]&&P(L[0].id);
  const inf=S.mInfo[lf.id]||{};const mo=inf.motm;const r=mo&&inf.pts&&inf.pts[mo];const mp=mo&&P(mo);
  return `<div class="mzts"><button class="mzt" data-act="viewm" data-id="${esc(lf.id)}"><small>${fmtShort(lf.date)}</small><b class="num">${sa}–${sb}</b><span>${res}</span></button>
    ${ld?`<button class="mzt" data-act="tab" data-tab="lig"><small>Lig lideri</small><b class="num">${L[0].p}<i> puan</i></b><span>${esc(shortName(ld.name))}</span></button>`:""}</div>
    ${mp?`<button class="mzr mzm" data-act="open" data-id="${esc(mo)}">${avatar(mp)}<span class="mzr-x"><small>MAÇIN ADAMI · ${fmtShort(lf.date)}</small><b>${esc(mp.name)}</b><span>${r?`${r.g||0} gol · ${r.a||0} asist`:""}</span></span>${r?`<b class="mzm-n num">${fN(r.pts)}</b>`:""}</button>`:""}`}
function pairList(m,notes){const A=m.team_a||[],B=m.team_b||[];const pa=posArr(m,"A"),pb=posArr(m,"B");const la=pad7(lineupOf(m,"A"),A),lb=pad7(lineupOf(m,"B"),B);
  const rows=k=>{const PS=k==="A"?pa:pb,L=k==="A"?la:lb;return L.map((id,i)=>({id,ep:i===0?"KL":slotPos(PS[i][0],PS[i][1],PS[i][2]),y:i===0?-99:PS[i][1]})).filter(x=>x.id).sort((a,b)=>b.y-a.y)};
  const ra=rows("A"),rb=rows("B");const n=Math.max(ra.length,rb.length);const caps={A:m.cap_a,B:m.cap_b};
  const cell=(x,k)=>{if(!x)return `<span class="prc ${k.toLowerCase()} none"></span>`;const r=notes&&notes.pts[x.id];const p=P(x.id);
    const nt=r?`<i class="nt ${noteCls(r.pts)}${notes.motm===x.id?" motm":""}">${notes.motm===x.id?"★":""}${fN(r.pts)}</i>`:"";
    return `<button class="prc ${k.toLowerCase()}" data-act="open" data-id="${esc(x.id)}" aria-label="${esc(nameOf(x.id))}, ${EPOS[x.ep]?.[1]||x.ep}, reyting ${p?.guest?"misafir":ovrOf(x.id)}"><span class="prp">${x.ep}</span><span class="prn">${esc(shortName(nameOf(x.id)))}${caps[k]===x.id?'<i class="prcap">C</i>':""}</span>${nt||`<b class="pro num">${p?.guest?"MİS":ovrOf(x.id)}</b>`}</button>`};
  let h=`<div class="pl2"><div class="plh a"><b>${esc(TEAM.A)}</b><span>${esc(formLabel(formOf(m,"A"),pa))}</span></div><div class="plh b"><span>${esc(formLabel(formOf(m,"B"),pb))}</span><b>${esc(TEAM.B)}</b></div>`;
  for(let i=0;i<n;i++)h+=cell(ra[i],"A")+cell(rb[i],"B");
  const bench=(ids,L)=>ids.filter(x=>!L.includes(x)).map(x=>esc(shortName(nameOf(x)))).join(", ");const ba=bench(A,la),bb=bench(B,lb);
  if(ba||bb)h+=`<span class="plb">${ba?"Yedek: "+ba:""}</span><span class="plb r">${bb?"Yedek: "+bb:""}</span>`;
  return h+`</div>`}
function rsvpLists(m){
  const rs=m.rsvp||{},at=m.rsvp_at||{};const ps=S.players;const ok=p=>!UNAVAIL.includes(stOf(p));
  const gel=ps.filter(p=>rs[p.id]==="g"&&ok(p)).sort((a,b)=>(at[a.id]||0)-(at[b.id]||0));
  return{kadro:gel.slice(0,CAP),sira:gel.slice(CAP),yedek:ps.filter(p=>rs[p.id]==="y"&&ok(p)),yok:ps.filter(p=>rs[p.id]==="n"||!ok(p)),bos:ps.filter(p=>!rs[p.id]&&ok(p))};
}
function adminMore(m,extra){const k="am_"+m.id;const w=S.f["when_"+m.id]||{};const ch=(w.d&&w.d!==m.date)||(w.t&&w.t!==m.time);const open=S.f[k]||ch;
  return `<button class="morebtn${open?" on":""}" data-act="tog" data-k="${k}">Diğer işlemler <span>${open?"▴":"▾"}</span></button>${open?`<div class="morep">${whenForm(m)}${namesForm(m)}<div class="row">${extra}</div></div>`:""}`}
function namesForm(m){const k="nm_"+m.id;const w=S.f[k]||{};const a=w.a??(m.name_a||""),b=w.b??(m.name_b||"");const ch=a!==(m.name_a||"")||b!==(m.name_b||"");
  const row=(k2,id,bd,v,l)=>`<label class="mngi" for="${id}">${crest(v||l,k2,34)}<span><small>${l}</small><input type="text" maxlength="20" id="${id}" data-bind="${bd}" value="${esc(v)}" placeholder="${l} adı" autocomplete="off"></span></label>`;
  return `<div class="whenf"><span class="eyebrow">Takım isimleri</span><div class="mngn">${row("A","na_"+esc(m.id),k+".a",a,"1. takım")}${row("B","nb_"+esc(m.id),k+".b",b,"2. takım")}</div>
    <button class="btn ${ch?"primary":""} block" data-act="setNames" data-id="${esc(m.id)}">İsimleri kaydet</button></div>`}
function whenForm(m){const k="when_"+m.id;const w=S.f[k]||{};const d=w.d||m.date,t=w.t||m.time||"21:00";const ch=d!==m.date||t!==m.time;
  return `<div class="whenf"><span class="eyebrow">Tarih ve saat</span><div class="grid2"><label class="f" for="wd_${esc(m.id)}">Tarih<input type="date" id="wd_${esc(m.id)}" data-bind="${k}.d" value="${esc(d)}"></label>
    <label class="f" for="wt_${esc(m.id)}">Saat${timeSel("wt_"+esc(m.id),k+".t",t)}</label></div>
    ${ch?`<button class="btn primary block" data-act="setWhen" data-id="${esc(m.id)}">Tarihi kaydet</button>`:""}</div>`}
function whenCard(m){const k="when_"+m.id;const w=S.f[k]||{};const d=w.d||m.date,t=w.t||m.time||"21:00";const ch=d!==m.date||t!==m.time;
  return `<section class="card"><details${ch?" open":""}><summary>Tarih ve saat: <b>${fmtShort(m.date)} · ${esc(m.time||"")}</b> <span class="muted small">değiştir</span></summary>
    <div class="grid2" style="margin-top:10px"><label class="f" for="wd_${esc(m.id)}">Tarih<input type="date" id="wd_${esc(m.id)}" data-bind="${k}.d" value="${esc(d)}"></label>
    <label class="f" for="wt_${esc(m.id)}">Saat${timeSel("wt_"+esc(m.id),k+".t",t)}</label></div>
    <button class="btn primary block" style="margin-top:10px" data-act="setWhen" data-id="${esc(m.id)}"${ch?"":" disabled"}>Kaydet</button></details></section>`}
S.vst={};
async function vsLoad(id,force){const c=S.vst[id];if(!force&&c&&Date.now()-c.t<60000)return;S.vst[id]={...(c||{}),t:Date.now()};
  try{const r=await rpc("vote_status",{p_match:id});if(r&&r.ok){S.vst[id]={...r,t:Date.now()};render(true)}}catch(_){}}
const myPid=()=>S.mem&&S.mem.status==="onayli"?S.mem.player_id:null;
function voteCard(m){if(!vOpen(m))return"";const M=esc(m.id);const vs=S.vst[m.id];vsLoad(m.id);
  const pl=plAll(m).filter(id=>P(id)&&!P(id).guest);const n=vs&&vs.n||0;const me=myPid();const can=me&&plAll(m).includes(me);
  const mineV=!!(vs&&vs.mine);const vt0=vs&&Array.isArray(vs.voters)?new Set(vs.voters):null;const wait=vt0?pl.filter(id=>!vt0.has(id)).sort((a,b)=>(b===me)-(a===me)):null;
  const STAR='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m12 3 2.7 5.6 6.1.8-4.5 4.3 1.1 6.1L12 16.9 6.6 19.8l1.100-6.100L3.200 9.400l6.100-.8L12 3z"/></svg>';
  const wb=wait?(wait.length?`<span class="od2-av">${wait.slice(0,wait.length>3?2:3).map(id=>pFace(id)).join("")}${wait.length>3?`<span class="rkf more">+${wait.length-2}</span>`:""}</span><span class="vh2-x"><b>${wait.length} kişi bekleniyor</b><small>${can&&!mineV?"Sen de onlardansın":"Herkes verince notlar açıklanır"}</small></span>`:`<span class="vh2-x"><b>Herkes oyunu verdi</b><small>Yönetici kapatınca notlar açıklanır</small></span>`):`<span class="vh2-x"><b><span class="num">${n}/${pl.length}</span> kişi oy verdi</b><small>${can&&!mineV?`${Math.max(0,plAll(m).length-1)} oyuncuyu değerlendir, 2 dakika sürer`:"Herkes verince notlar açıklanır"}</small></span>`;
  let h=`<section class="vhero vh2${can&&!mineV?"":" ok"}" id="oylama"><div class="vh2-h"><span class="vh2-i">${STAR}</span><b>${!can?"Oylama sürüyor":mineV?"Oyunu verdin":"Sıra sende: oyunu ver"}</b>${can&&!mineV?`${tahminYok()?"":`<span class="vh2-p">+200 sikke</span>`}`:""}</div><div class="vh2-r"><div class="vh2-w">${wb}</div>${can&&!mineV?`<button class="btn vbtn" data-act="voteOpen" data-id="${M}" data-v="${esc(me)}">Oy ver</button>`:""}</div></section>`;
  if(S.admin){const vt=new Set(vs&&vs.voters||[]);const no=pl.filter(id=>!vt.has(id)),yes=pl.filter(id=>vt.has(id));const conf=S.f.vClose===m.id;
    h+=`<section class="card admc"><div class="ch"><div><div class="eyebrow">Yönetici</div><h2>Oylama</h2></div><b class="num vcnt">${vt.size}/${pl.length}</b></div>
      ${no.length?`<div class="vlist">${no.map(id=>`<div class="vrow">${avatar(P(id),"sm")}<b>${esc(nameOf(id))}</b><button class="btn sm" data-act="voteOpen" data-id="${M}" data-v="${esc(id)}">Onun adına oy ver</button></div>`).join("")}</div>`:""}
      ${yes.length?`<div class="vchips">${yes.map(id=>`<span class="chip ok">${esc(shortName(nameOf(id)))}</span>`).join("")}</div>`:""}
      <div class="grid2"><button class="btn" data-act="vDet" data-id="${M}">Kim kime ne verdi</button><button class="btn ${conf?"primary":""}" data-act="vClose" data-id="${M}">${conf?(vt.size<6?"6'dan az oy var, yine de kapat":"Onayla ve kapat"):"Oylamayı kapat"}</button></div></section>`}
  return h}
// Oylama: oyuncular tek tek gelir; sonda maçın adamı ("çok iyi" dediklerinden) ve fiyasko ("kötü" dediklerinden, isteğe bağlı) seçilir.
function voteList(m,me){const oth=k=>plOf(m,k).filter(id=>id!==me);return[...oth("A"),...oth("B")]}
function voteStats(m,id,side){
  const fin=m.state==="bitti"&&m.score_a!=null;const o=(m.stats||{})[id]||{};const T=[];
  if(fin){const us=side==="A"?+m.score_a:+m.score_b,th=side==="A"?+m.score_b:+m.score_a;T.push([us+"–"+th,us>th?"Kazandı":us<th?"Kaybetti":"Berabere"],[+o.g||0,"Gol"],[+o.a||0,"Asist"]);
    if(+o.cl)T.push([+o.cl,"Çizgiden"]);if(+o.ps)T.push([+o.ps,"Pen. kurtardı"]);if(+o.og)T.push([+o.og,"Kendi kalesine"]);if(+o.pm)T.push([+o.pm,"Pen. kaçırdı"])}
  if(!T.length)return `<p class="vst0">Skor ve goller henüz girilmedi; şimdilik gördüğüne göre oyla.</p>`;
  return `<div class="vstt">${T.slice(0,6).map(([v,l])=>`<span><b class="num">${esc(String(v))}</b><small>${l}</small></span>`).join("")}</div>`}
function sheetVote(){const m=S.matches.find(x=>x.id===S.sheet.mid);const vt=S.f.vt;if(!m||!vt)return"";const me=vt.voter;const v=vt.v;const all=voteList(m,me);
  const n1=all.filter(id=>v[id]===1).length,n4=all.filter(id=>v[id]===4).length,dn=all.filter(id=>v[id]).length;
  if(!(vt.i>=0&&vt.i<all.length))vt.i=0;const son=!!vt.son&&dn===all.length;
  const seg=`<div class="vsg" aria-hidden="true">${all.map((id,i)=>`<i class="${v[id]?"ok":""}${!son&&i===vt.i?" on":""}"></i>`).join("")}</div>`;
  const head=r=>`<div class="mzvh"><button class="mzic" data-act="close" aria-label="Kapat">${ICON.x}</button><div><h2>${me===myPid()?"Oyunu ver":esc(shortName(nameOf(me)))+" adına oyla"}</h2><small>${r}</small></div></div>${seg}`;
  const tile=(id,act,on)=>{const p=P(id);return `<button class="vtl${on?" on":""}" data-act="${act}" data-p="${esc(id)}" aria-pressed="${on}">${p?avatar(p):""}<b>${esc(shortName(nameOf(id)))}</b></button>`};
  if(son){const c1=all.filter(id=>v[id]===1),c4=all.filter(id=>v[id]===4);if(vt.motm&&!c1.includes(vt.motm))vt.motm="";if(vt.fiy&&!c4.includes(vt.fiy))vt.fiy="";
    const need=!c1.length?"Önce birine \"çok iyi\" de":!c4.length?"Önce birine \"kötü\" de":!vt.motm?"Önce maçın adamını seç":!vt.fiy?"Önce fiyaskoyu seç":"";const cnt=[1,2,3,4].map(k=>all.filter(id=>v[id]===k).length);
    return `${head("Son adım · kimin ne verdiği gizli")}
    <div class="vsec"><h3 class="gold">Maçın adamı</h3>${c1.length?`<p>"Çok iyi" dediklerin arasından birini seç.</p><div class="vtg">${c1.map(id=>tile(id,"vMotm",vt.motm===id)).join("")}</div>`:`<p>Maçın adamını seçebilmek için en az bir oyuncuya "çok iyi" demelisin. Geri dönüp değiştir.</p>`}</div>
    <div class="vsec"><h3>Fiyasko</h3>${c4.length?`<p>"Kötü" dediklerin arasından birini seç.</p><div class="vtg">${c4.map(id=>tile(id,"vFiy",vt.fiy===id)).join("")}</div>`:`<p>Fiyaskoyu seçebilmek için en az bir oyuncuya "kötü" demelisin. Geri dönüp değiştir.</p>`}</div>
    <div class="vsum"><b>Verdiğin oylar</b><span>${cnt.map((x,i)=>`<em class="num">${x}</em> ${VL[i].toLocaleLowerCase("tr")}`).join(" · ")}</span></div>
    <button class="btn primary block vsend" data-act="vSend"${need?" disabled":""}>${need||"Oyları gönder"}</button>
    <button class="btn ghost block" data-act="vBack">Geri dön, değiştir</button>`}
  const id=all[vt.i];const p=P(id);const side=plOf(m,"A").includes(id)?"A":"B";const cur=v[id];
  return `${head(`${vt.i+1} / ${all.length} · kimin ne verdiği gizli`)}
    <div class="vpc">${p?avatar(p):""}<h3>${esc(nameOf(id))}</h3><p>${tDot(side)}${esc(TEAM[side])}${p&&!p.guest?" · "+esc(EPOS[eposOf(p)]?.[1]||""):" · Misafir"}</p>${voteStats(m,id,side)}</div>
    <p class="vq2">${esc(firstName(nameOf(id)))} bu maçta nasıldı?</p>
    <div class="vg4">${[1,2,3,4].map(k=>{const on=cur===k;const dol=!on&&((k===1&&n1>=3)||(k===4&&n4>=3));return `<button class="p${k}${on?" on":""}"${dol?" disabled":""} data-act="vPick" data-p="${esc(id)}" data-v="${k}" aria-pressed="${on}">${VL[k-1]}</button>`}).join("")}</div>
    <p class="vhint">En fazla 3 çok iyi ve 3 kötü verebilirsin · şimdiye kadar ${n1} çok iyi, ${n4} kötü</p>
    <div class="vnav"><button class="btn" data-act="vBack"${vt.i===0?" disabled":""}>Geri</button>${cur?`<button class="btn primary" data-act="vNext">${dn===all.length?"Son adıma geç":"İleri"}</button>`:""}</div>`}
function sheetOySonuc(){const m=S.matches.find(x=>x.id===S.sheet.mid);if(!m)return"";if(!m.vsum)return `<div class="mzvh"><button class="mzic" data-act="close" aria-label="Kapat">${ICON.x}</button><div><h2>Oylama</h2><small>Oylama yeniden açıldı</small></div></div><p class="muted">Sonuçlar oylama kapanınca burada görünür.</p>`;return inM(m,()=>{const vs=m.vsum||{};const inf=S.mInfo[m.id]||{pts:{}};const stt=m.stats||{};const me=myPid();
  const L=Object.entries(inf.pts||{}).filter(([id,r])=>r&&realP(id)&&isFinite(r.pts)).sort((a,b)=>Math.round(b[1].pts*10)-Math.round(a[1].pts*10)||(a[1].pk||9)-(b[1].pk||9)||b[1].pts-a[1].pts);
  const COL=["#00E58A","#8BE04E","#FFD400","#FF7A93"];const has=id=>id&&Array.isArray(vs[id])&&P(id);const cur=has(S.sheet.sel)?S.sheet.sel:has(me)?me:(L.find(x=>has(x[0]))||[])[0];const mc=cur?vs[cur]:null;const mp=mc&&P(cur);const sd=plOf(m,"A").includes(cur)?"A":"B";
  const tile=(id,n,on)=>{const p=P(id);return `<div class="vtl${on?" on":""}">${p?avatar(p):""}<b>${esc(shortName(nameOf(id)))}${n?` · ${n} oy`:""}</b></div>`};
  const mo=inf.motm&&P(inf.motm)?inf.motm:null,fy=inf.fiy&&P(inf.fiy)?inf.fiy:null;
  return `<div class="mzvh"><button class="mzic" data-act="close" aria-label="Kapat">${ICON.x}</button><div><h2>Oylama sonuçları</h2><small>${vs._n?vs._n+" kişi oy verdi · ":""}kimin ne verdiği gizli</small></div></div>
    ${mp?`<div class="vpc">${avatar(mp)}<h3>${esc(mp.name)}</h3><p>${tDot(sd)}${esc(TEAM[sd])} · ${cur===me?"aldığın notlar":"aldığı notlar"}</p><div class="osrf">${mc.map((n,i)=>`<span><b class="num">${n}</b><small style="color:${COL[i]}">${VL[i]}</small></span>`).join("")}</div></div>`:""}
    ${mo||fy?`<div class="osr2${mo&&fy?"":" one"}">${mo?`<div class="vsec"><h3 class="gold">Maçın adamı</h3>${tile(mo,vs._motm===mo?vs._motmN:0,true)}</div>`:""}${fy?`<div class="vsec"><h3>Fiyasko</h3>${tile(fy,vs._fiy===fy?vs._fiyN:0,false)}</div>`:""}</div>`:""}
    <div class="osrl">${L.map(([id,r],i)=>`<button class="rw${id===cur?" me":""}" data-act="oySel" data-p="${esc(id)}" aria-pressed="${id===cur}"><i>${i+1}</i>${pFace(id)}<b class="nm">${esc(shortName(nameOf(id)))}${id===me?" · sen":""}</b>${NOTE.perf[r.pk]?`<span class="pfc p${r.pk}">${NOTE.perf[r.pk][1]}</span>`:"<span></span>"}<span class="nt ${noteCls(r.pts)}">${fN(r.pts)}</span></button>`).join("")}</div>
    ${vs._n!=null&&vs._n<6?`<p class="muted small">6'dan az oy geldiği için değerlendirme notları etkilemedi.</p>`:""}
    ${S.view===m.id?"":`<button class="btn block" data-act="msGo" data-id="${esc(m.id)}" data-v="notlar">Notların ayrıntısı</button>`}
    ${S.admin?`<button class="btn ghost sm" data-act="vReopen" data-id="${esc(m.id)}">${S.f.vReopen===m.id?"Yeniden açmak için tekrar bas":"Oylamayı yeniden aç"}</button>`:""}`})}
function sheetVdet(){const d=S.f.vd;const m=d&&S.matches.find(x=>x.id===d.mid);if(!m||!S.admin)return"";const pl=plAll(m);const sel=d.sel||pl[0];const dir=d.dir||"f";
  const R=(d.rows||[]).filter(r=>dir==="f"?r.f===sel:r.t===sel).sort((a,b)=>a.v-b.v);const oth=r=>dir==="f"?r.t:r.f;const c=[1,2,3,4].map(k=>R.filter(r=>r.v===k).length);
  return `<div class="ch"><div style="min-width:0"><div class="eyebrow">Sadece yönetici görür</div><h2>Kim kime ne verdi</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
    <div class="vtog"><button class="${dir==="f"?"on":""}" data-act="vdDir" data-v="f">Verdiği oylar</button><button class="${dir==="t"?"on":""}" data-act="vdDir" data-v="t">Aldığı oylar</button></div>
    <div class="chips vsel">${pl.map(id=>`<button class="${id===sel?"on":""}" data-act="vdSel" data-p="${esc(id)}">${esc(shortName(nameOf(id)))}</button>`).join("")}</div>
    <div class="vq">${c.map((x,i)=>`<span class="q${i+1}">${VL[i]} ${x}</span>`).join("")}</div>
    <div class="vcard">${R.map(r=>{const id=oth(r);const p=P(id);return `<div class="vr2 vr3">${p?avatar(p,"sm"):""}<span class="vrn"><b>${esc(nameOf(id))}</b>${r.a?"<small>Yönetici girdi</small>":""}</span><span class="pfc p${r.v}">${VL[r.v-1]}</span></div>`}).join("")||'<p class="muted small">Oy yok</p>'}</div>`}
function voteResults(m,inf){const vs=m.vsum;const stt=m.stats||{};const M=esc(m.id);
  if(!m.vote_closed_at||!vs)return `<div class="empty emp2">${empIc("yildiz","gold")}<h3>Oylama sürüyor</h3></div>`;
  const n=vs._n||0;const pl=plAll(m).filter(id=>Array.isArray(vs[id]));const sc=id=>{const c=vs[id],t=c[0]+c[1]+c[2]+c[3];return t?(3*c[0]+2*c[1]+c[2])/t:-1};
  const row=id=>{const c=vs[id];const mx=Math.max(...c);const p=P(id);const r=inf&&inf.pts[id];return `<button class="degr" data-act="open" data-id="${esc(id)}">${p?avatar(p,"sm"):""}<span class="degn"><b>${esc(nameOf(id))}</b>${r?`<span class="muted small">${tDot(r.side)}${esc(TEAM[r.side])}</span>`:""}</span><span class="vdist">${c.map((x,i)=>`<span class="q${i+1}${x===mx&&x>0?" h":""}" title="${VL[i]}">${x}</span>`).join("")}</span></button>`};
  const by=v=>pl.filter(id=>+stt[id]?.k===v).sort((a,b)=>sc(b)-sc(a));
  let h="";if(vs._motm&&P(vs._motm))h+=`<p class="vpk">Oylamada maçın adamı: <b>${esc(shortName(nameOf(vs._motm)))}</b> (${vs._motmN||1} oy)${vs._fiy&&P(vs._fiy)?` · fiyasko: <b>${esc(shortName(nameOf(vs._fiy)))}</b> (${vs._fiyN} oy)`:""}</p>`;
  if(n<6)h+=`<p class="muted small">6'dan az oy geldiği için değerlendirme notları etkilemedi.</p><div class="degc">${pl.sort((a,b)=>sc(b)-sc(a)).map(row).join("")}</div>`;
  else h+=`<div class="degs">${[1,2,3,4].map(v=>{const ids=by(v);return ids.length?`<div class="degc"><div class="degh"><span class="pfc p${v}">${VL[v-1]}</span></div>${ids.map(row).join("")}</div>`:""}).join("")}</div>`;
  if(S.admin)h+=`<button class="btn ghost sm" data-act="vReopen" data-id="${M}">${S.f.vReopen===m.id?"Yeniden açmak için tekrar bas":"Oylamayı yeniden aç"}</button>`;
  return h}
async function voteClose(m){const r=await A("admin_votes",{p_match:m.id});if(!r)return;const rows=r.rows||[];const pl=plAll(m);const C={};pl.forEach(id=>C[id]=[0,0,0,0]);
  rows.forEach(x=>{if(C[x.t]&&x.v>=1&&x.v<=4)C[x.t][x.v-1]++});const voters=new Set(rows.map(x=>x.f)).size;
  const sc=id=>{const c=C[id],t=c[0]+c[1]+c[2]+c[3];return t?(3*c[0]+2*c[1]+c[2])/t:null};const nt=id=>S.mInfo?.[m.id]?.pts?.[id]?.pts||0;
  const L=pl.filter(id=>sc(id)!=null).sort((a,b)=>sc(b)-sc(a)||C[b][0]-C[a][0]||C[a][3]-C[b][3]||nt(b)-nt(a));
  const q=perfQuota(L.length);const perf={};let g=0,used=0;
  L.forEach((id,i)=>{const pv=L[i-1];const tie=pv&&sc(pv)===sc(id)&&C[pv][0]===C[id][0]&&C[pv][3]===C[id][3]&&nt(pv)===nt(id);
    if(!tie)while(g<3&&used>=q[g]){g++;used=0}perf[id]=g+1;used++});
  const ok=await A("admin_vote_close",{p_match:m.id,p_perf:voters>=6?perf:{},p_sum:C},"Oylama kapandı, notlar kesinleşti");
  if(ok){S.f.vClose=null;delete S.vst[m.id];compute();if(m.state==="bitti")await notesSync(m.id);render(true)}}
// Bu hafta: haftanın dört adımı ve tahmin kartı
function haftaAkis(m){const kadro=m.state!=="kayit";const ended=kadro&&mEnded(m);const bd=BET.board[m.id];const acik=kadro&&!ended&&(!bd||bd.open);const ty=tahminYok();const cur0=!kadro?0:vOpen(m)?3:acik?1:2;const cur=ty?(cur0>=2?cur0-1:cur0===1?1:0):cur0;
  return `<ol class="hak" aria-label="Haftanın akışı">${(ty?["Kadro","Maç","Oylama"]:["Kadro","Tahmin","Maç","Oylama"]).map((l,i)=>`<li class="${i<cur?"ok":i===cur?"on":""}"${i===cur?' aria-current="step"':""}><i></i>${l}</li>`).join("")}</ol>`}
const MZI={cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="3"/><path d="M4 10h16M9 3v4M15 3v4"/></svg>',clk:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',pin:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.800 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>'};
function mcdT(ts){const ms=ts-Date.now();if(ms<=0)return"Maç oynanıyor";const x=Math.floor(ms/1e3);if(ms>864e5)return Math.floor(x/86400)+" gün "+Math.floor(x%86400/3600)+" sa";return pad(Math.floor(x/3600))+":"+pad(Math.floor(x%3600/60))+":"+pad(x%60)}
function mcdP(ts){const ms=ts-Date.now();return Math.max(3,Math.min(100,Math.round((1-ms/(7*864e5))*1000)/10))}
function tickMcd(){document.querySelectorAll("[data-mcd]").forEach(el=>{const ts=+el.dataset.mcd,t=mcdT(ts);if(el.textContent!==t)el.textContent=t;const i=el.closest(".mcd").querySelector(".mcd-b i");if(i)i.style.width=mcdP(ts)+"%"})}
setInterval(tickMcd,1000);
function thkCd(ts){const ms=ts-Date.now();if(ms<=0)return"Kapandı";const x=Math.floor(ms/1e3);if(ms>864e5)return Math.floor(x/86400)+" gün "+Math.floor(x%86400/3600)+" sa";return pad(Math.floor(x/3600))+":"+pad(Math.floor(x%3600/60))+":"+pad(x%60)}
function tickThk(){document.querySelectorAll("[data-thk]").forEach(el=>{const t=thkCd(+el.dataset.thk);if(el.textContent!==t)el.textContent=t;if(t==="Kapandı"&&!tickThk.d){tickThk.d=1;setTimeout(()=>{tickThk.d=0;render(true)},1200)}})}
setInterval(tickThk,1000);
function tahminKart(m){if(!isMember()||S.fol||!myPid()||tahminYok())return"";const me=myPid();const bd=BET.board[m.id];betLoad("board",m.id);const L=BET.lists[me];if(!L)betLoad("list",me);
  const mine=L?L.rows.filter(c=>c.m===m.id):[];const ac=mine.filter(c=>c.z==="acik");const sum=bd&&bd.sum;const un=betUnread();const cts=bd&&bd.closes?Date.parse(bd.closes):0;const open=!!(bd&&bd.open&&cts>Date.now());
  const CLK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
  let pill,B,cta,go;const bal=sum?fJ(sum.bal):"–";
  if(open){pill=`${CLK}Kapanışa <i class="num" data-thk="${cts}" role="timer" aria-label="Tahminlerin kapanmasına kalan süre">${thkCd(cts)}</i>`;B=[["Kalan sikke",bal],["Yapılan tahmin",L?mine.length:"–"]];cta="Tahmin yap";go="oyna"}
  else if(mine.length){const dn=mine.filter(c=>c.z==="kazandi"||c.z==="kaybetti");const net=dn.reduce((a,c)=>a+((c.py||0)-c.st),0);
    if(ac.length){pill="Tahminler kapandı";B=[["Açıktaki tahmin",ac.length],["Yatırılan sikke",fJ(ac.reduce((a,c)=>a+c.st,0))]]}
    else{pill="Sonuçlandı";B=[["Bu maçtan",(net>0?"+":net<0?"−":"")+fJ(Math.abs(net))],["Tutan tahmin",mine.filter(c=>c.z==="kazandi").length+"/"+mine.length]]}
    cta="Tahminlerim";go="kupon"}
  else{pill=bd?"Tahminler kapandı":"Yükleniyor…";B=[["Kalan sikke",bal],["Yapılan tahmin",bd?0:"–"]];cta="Sıralama";go="sira"}
  return `<div class="thk th2" id="thk"><div class="thk-b"><span class="thk-i">${dIcon("bilet","green",24)}</span><span class="thk-x"><b>Tahmin${un?`<em class="num" aria-label="${un} yeni bildirim">${un>9?"9+":un}</em>`:""}</b></span><span class="th2-p">${pill}</span></div><div class="th2-r"><div class="th2-g">${B.map(([l,v])=>`<div><small>${l}</small><b class="num">${v}</b></div>`).join("")}</div><button class="thk-c" data-act="thkGo" data-v="${go}">${cta}</button></div></div>`}
function matchBody(m){
  if(S.admin&&S.draft&&S.draft.mid===m.id)return `<section class="card">${draftPanel(m)}</section>`;
  if(S.admin&&S.teams&&S.teams.mid===m.id)return `<section class="card"><div class="ch"><h2>Kadro kur</h2><button class="btn sm" data-act="cancelTeams">Vazgeç</button></div>${editorPanel(m)}</section>`;
  let h=S.admin?nextStep(m):"";
  if(m.state==="kayit"){
    h+=kadroCard(m);
    if(S.admin)h+=`<section class="card admc"><div class="ch"><div><div class="eyebrow">Yönetici</div><h2>Takımları kur</h2></div></div>
      <div class="grid2"><button class="btn primary" data-act="autoKadro" data-id="${esc(m.id)}">Otomatik kur</button><button class="btn" data-act="manual" data-id="${esc(m.id)}">${ICON.hand} Manuel kur</button></div>
      ${(m.team_a||[]).length&&(m.team_b||[]).length?`<button class="btn mg-bk" data-act="fwdTakim" data-id="${esc(m.id)}">Vazgeç, kadrolar aynı kalsın</button>`:""}
      ${adminMore(m,`<button class="btn danger sm" data-act="delMatch" data-id="${esc(m.id)}">${S.f.delMatch===m.id?"Silmek için tekrar bas":"Maçı sil"}</button>`)}</section>`;
  }else{
    const ended=mEnded(m);if(vOpen(m))h+=voteCard(m);else if(ended&&vPend(m)&&!S.admin)h+=`<section class="nxs"><span class="nxs-x"><small>Oylama</small><b>Skor bekleniyor</b><span>Yönetici maç skorunu girince oylama açılır</span></span></section>`;
    h+=odaCard(m);h+=tahminKart(m);h+=duelCard(m);
    {const av=k=>{const L=plOf(m,k);return L.slice(0,3).map(id=>pFace(id)).join("")+(L.length>3?`<em>+${L.length-3}</em>`:"")};
    h+=`<details class="card kdd kq" id="kadrolar"><summary><span class="kq-h"><span class="kq-i">${dIcon("yelek","pink",22)}</span><span class="kq-t"><i>Kadrolar</i><small>${plOf(m,"A").length} · ${plOf(m,"B").length} oyuncu</small></span><span class="kq-p"><span class="c">Dizilişi gör</span><span class="o">Kapat</span>${CHVD}</span></span><span class="kq-2">${["A","B"].map(k=>`<span class="kq-tm">${crest(nmOf(m,k),k,22)}<span class="kq-av">${av(k)}</span></span>`).join("")}</span></summary>${teamsView(m,true)}</details>`}
    if(!ended)h+=preview(m);
    if(S.admin)h+=finishCard(m);
  }
  return h;
}
/* Kadro: yönetici işaretler, oyuncular sadece görür */
function kadroCard(m){const rs=m.rsvp||{};const ps=S.players.filter(p=>!p.guest);const ok=p=>!UNAVAIL.includes(stOf(p));
  const gel=ps.filter(p=>rs[p.id]==="g"&&ok(p));const n=gel.length;const pct=Math.min(100,Math.round(n/CAP*100));const need=CAP-n;
  const head=`<div class="kdh"><b class="kdn num">${n}</b><div class="kdi"><span class="muted small">${need>0?`${CAP} kişilik maç için ${need} kişi daha`:need<0?`${-need} kişi fazla · ilk ${CAP} kişi oynar`:"Kadro tamam"}</span><span class="kdb"><i style="width:${pct}%"></i></span></div></div>`;
  if(!S.admin){const me=S.me&&rs[S.me]==="g";
    return `<section class="card kad" id="kadrolar"><div class="ch"><h2>Kadro kuruluyor</h2></div>${head}
      ${n?`<div class="kdf">${gel.slice(0,12).map(p=>avatar(p)).join("")}${n>12?`<span class="av more">+${n-12}</span>`:""}</div>`:""}
      ${S.me?`<div class="kdme${me?" on":""}">${me?"✓ Kadrodasın":"Henüz kadroda değilsin"}</div>`:""}</section>`}
  const order=[...ps].sort((a,b)=>(ok(b)-ok(a))||((rs[b.id]==="g")-(rs[a.id]==="g"))||a.name.localeCompare(b.name,"tr"));
  const M=esc(m.id);const prev=lastFinM();
  const quick=`<div class="kdq">${prev?`<button class="btn sm" data-act="rosterSet" data-id="${M}" data-v="prev">Geçen maçtakiler</button>`:""}<button class="btn sm" data-act="rosterSet" data-id="${M}" data-v="ready">Hazır olanlar</button>${n?`<button class="btn sm ghost" data-act="rosterSet" data-id="${M}" data-v="none">Temizle</button>`:""}<button class="btn sm ghost" data-act="copyTxt" data-id="${M}" data-v="rsvp">${n?"Listeyi kopyala":"Kopyala"}</button></div>`;
  return `<section class="card kad" id="kadrolar"><div class="ch"><div><div class="eyebrow">Yönetici</div><h2>Kadro</h2></div></div>${head}${quick}
    <div class="kdl">${order.map(p=>{const on=rs[p.id]==="g";const av=ok(p);const st=STATUS[stOf(p)];
      return `<button class="kdr${on?" on":""}${av?"":" out"}" data-act="kTog" data-m="${esc(m.id)}" data-p="${esc(p.id)}" aria-pressed="${on}" ${av?"":"disabled"}>${avatar(p)}<span class="kdnm"><b>${esc(p.name)}</b><small>${esc(eposOf(p))} · ${ovrOf(p.id)}${p.yedek?" · yedek kadro":""}</small></span>${av?"<span></span>":`<span class="chip bad">${esc(st?st.label:"")}</span>`}<i class="kdc">${on?"✓":""}</i></button>`}).join("")}</div></section>`}
// WhatsApp grubuna yapıştırmak için kadrolar
function teamsText(m){const s=S.settings;const L=k=>(k==="A"?m.team_a:m.team_b)||[];
  return `⚽ ${s.group_name} · ${fmtDate(m.date)} ${String(m.time||"").slice(0,5)}${s.field_name?"\n📍 "+s.field_name:""}\n\n`+["A","B"].map(k=>`${nmOf(m,k)}${(k==="A"?m.form_a:m.form_b)?" ("+(k==="A"?m.form_a:m.form_b)+")":""}\n${L(k).map((id,i)=>`${i+1}. ${nameOf(id)}${(k==="A"?m.cap_a:m.cap_b)===id?" (K)":""}`).join("\n")}`).join("\n\n")+`\n\nKartlar ve kadro: ${location.origin+location.pathname}`}
function waText(m,L){
  const s=S.settings;let t=`⚽ ${s.group_name} · ${fmtDate(m.date)} ${m.time||""}${s.field_name?"\n📍 "+s.field_name:""}\nKadro (${L.kadro.length}/${CAP}):\n`;
  t+=L.kadro.map((p,i)=>`${i+1}. ${p.name}`).join("\n")||"-";
  if(L.sira.length)t+=`\nSırada: ${L.sira.map(p=>p.name).join(", ")}`;
  if(L.yedek.length)t+=`\nYedek: ${L.yedek.map(p=>p.name).join(", ")}`;
  const out=L.yok.map(p=>{const st=stOf(p);return p.name+(st!=="hazir"?" ("+STATUS[st].label.toLocaleLowerCase("tr-TR")+")":"")});
  if(out.length)t+=`\nGelemeyen: ${out.join(", ")}`;
  if(L.kadro.length<CAP)t+=`\n${CAP-L.kadro.length} kişi eksik!`;
  t+=`\n\nKadroyu ve kartları buradan takip et: ${location.origin+location.pathname}`;return t;
}

/* ================= Takım kurma ================= */
function gkCounts(){const c={};for(const m of S.matches){const a=(m.lineup_a||[])[0],b=(m.lineup_b||[])[0];if(a)c[a]=(c[a]||0)+1;if(b)c[b]=(c[b]||0)+1}return c}
function pickGk(ids){const kl=ids.filter(id=>posOf(P(id))==="KL");if(kl.length)return kl.sort((a,b)=>genOf(b)-genOf(a))[0];const c=gkCounts();
  return [...ids].sort((a,b)=>(c[a]||0)-(c[b]||0)||ovrOf(a)-ovrOf(b))[0]||null}
function balanceIds(ids){
  const n=ids.length,half=Math.floor(n/2);if(half<1)return{A:ids,B:[]};
  const ov=Object.fromEntries(ids.map(id=>[id,ovrOf(id)]));const kl=ids.filter(id=>posOf(P(id))==="KL");const res=[];const first=ids[0],rest=ids.slice(1);
  const cnt=(T,r)=>T.filter(x=>posOf(P(x))===r).length;
  const rec=(start,pick)=>{
    if(pick.length===half-1){const Ta=[first,...pick];const Tb=ids.filter(x=>!Ta.includes(x));
      const sa=Ta.reduce((s,x)=>s+ov[x],0)/Ta.length,sb=Tb.reduce((s,x)=>s+ov[x],0)/Tb.length;let sc=Math.abs(sa-sb);
      if(kl.length>=2&&(kl.every(k=>Ta.includes(k))||kl.every(k=>Tb.includes(k))))sc+=50;
      for(const r of["DF","OS","FV"])sc+=Math.max(0,Math.abs(cnt(Ta,r)-cnt(Tb,r))-1)*.6;res.push([sc,Ta,Tb]);return}
    for(let i=start;i<rest.length;i++){pick.push(rest[i]);rec(i+1,pick);pick.pop();if(res.length>60000)return}};
  rec(0,[]);res.sort((a,b)=>a[0]-b[0]);const best=res[0][0];const near=res.filter(r=>r[0]<=best+.4).slice(0,40);const pk=near[Math.floor(Math.random()*near.length)];
  return Math.random()<.5?{A:pk[1],B:pk[2]}:{A:pk[2],B:pk[1]};
}
function autoLineup(ids,fk){
  const slots=FORMS[fk].slots;const out=new Array(slots.length).fill(null);let pool=[...ids];
  const gk=pickGk(pool);if(gk){out[0]=gk;pool=pool.filter(x=>x!==gk)}
  const byO=arr=>arr.sort((a,b)=>genOf(b)-genOf(a));
  for(let i=1;i<slots.length;i++){const c=byO(pool.filter(id=>posOf(P(id))===slots[i][2]))[0];if(c){out[i]=c;pool=pool.filter(x=>x!==c)}}
  const near={DF:["OS","FV","KL"],OS:["DF","FV","KL"],FV:["OS","DF","KL"]};
  for(let i=1;i<slots.length;i++){if(out[i])continue;let c=null;for(const r of near[slots[i][2]]){c=byO(pool.filter(id=>posOf(P(id))===r))[0];if(c)break}
    if(!c)c=byO(pool)[0];if(c){out[i]=c;pool=pool.filter(x=>x!==c)}}
  return out;
}
const genOf=id=>S.stats[id]?.genX??ovrOf(id);const sumAvg=ids=>ids.length?flo(ids.reduce((s,x)=>s+genOf(x),0)/ids.length):0;
const slotsOf=fk=>FORMS[fk].slots.map(s=>[...s]);
/* Dizilişe hizala: kaleci yerinde kalır, diğerleri en yakın ve aynı mevkideki yere oturur */
function alignTo(L,PS,fk){const T=slotsOf(fk);let best=[1,2,3,4,5,6],bc=Infinity;const a=[1,2,3,4,5,6];
  const go=k=>{if(k===6){let c=0;for(let j=0;j<6;j++){const f=PS[a[j]]||T[j+1],to=T[j+1];const dx=f[0]-to[0],dy=f[1]-to[1];c+=dx*dx+dy*dy+(L[a[j]]&&f[2]!==to[2]?2500:0)}if(c<bc){bc=c;best=a.slice()}return}
    for(let i=k;i<6;i++){[a[k],a[i]]=[a[i],a[k]];go(k+1);[a[k],a[i]]=[a[i],a[k]]}};
  go(0);return{L:[L[0],...best.map(i=>L[i]??null)],P:T}}
const roleFromY=(i,y)=>i===0?"KL":y<36?"DF":y<66?"OS":"FV";
const samePos=(p,fk)=>JSON.stringify(p)===JSON.stringify(FORMS[fk].slots);
function startEditor(mid,A,B,fa,fb,la,lb,pa,pb){fa=FORMS[fa]?fa:"2-3-1";fb=FORMS[fb]?fb:"2-3-1";
  S.teams={mid,A:[...A],B:[...B],fa,fb,la:la&&la.length?pad7(la,A):autoLineup(A,fa),lb:lb&&lb.length?pad7(lb,B):autoLineup(B,fb),
    pa:pa&&pa.length===TEAM_SIZE?pa.map(s=>[...s]):slotsOf(fa),pb:pb&&pb.length===TEAM_SIZE?pb.map(s=>[...s]):slotsOf(fb),sel:null};
  const mm=S.matches.find(x=>x.id===mid);S.teams.ca=mm&&A.includes(mm.cap_a)?mm.cap_a:null;S.teams.cb=mm&&B.includes(mm.cap_b)?mm.cap_b:null}
const capsOf=t=>({A:t.A.includes(t.ca)?t.ca:null,B:t.B.includes(t.cb)?t.cb:null});
function pad7(l,ids){const o=l.slice(0,TEAM_SIZE).map(x=>ids.includes(x)?x:null);while(o.length<TEAM_SIZE)o.push(null);return o}
function fieldSvg(){return `<svg class="lines" viewBox="0 0 68 100" preserveAspectRatio="none" aria-hidden="true"><g fill="none" stroke="rgba(255,255,255,.55)" stroke-width=".5">
  <rect x="3" y="3" width="62" height="94"/><line x1="3" y1="50" x2="65" y2="50"/><circle cx="34" cy="50" r="7"/><circle cx="34" cy="50" r=".7" fill="rgba(255,255,255,.6)"/>
  <rect x="17" y="3" width="34" height="13"/><rect x="26" y="3" width="16" height="5"/><rect x="17" y="84" width="34" height="13"/><rect x="26" y="92" width="16" height="5"/>
  <rect x="29" y="1" width="10" height="2"/><rect x="29" y="97" width="10" height="2"/></g></svg>`}
function pos2(k,x,y){return k==="A"?{l:x,t:96-y*.44}:{l:100-x,t:4+y*.44}}
function unpos2(k,l,t){return k==="A"?{x:l,y:(96-t)/.44}:{x:100-l,y:(t-4)/.44}}
function layout(mode,pa,pb,la,lb,cards){
  const toks=[];
  const ROW={KL:87,DF:63.5,OS:40,FV:16.5};
  const add=(k,PS,L)=>PS.forEach(([x,y,r],i)=>{let l,t;if(mode==="both"){({l,t}=pos2(k,x,y))}else if(cards){l=x;t=ROW[i===0?"KL":r]??95-y*.88}else{l=x;t=95-y*.88}toks.push({k,i,id:L[i],r:i===0?"KL":r,ep:i===0?"KL":slotPos(x,y,r),l,t})});
  if(mode!=="B")add("A",pa,la);if(mode!=="A")add("B",pb,lb);
  const wx=cards?(mode==="both"?22.5:25):mode==="both"?22:25,wy=cards?(mode==="both"?12.4:20):mode==="both"?11.5:14;
  const lim=cards?T=>{T.l=clamp(T.l,11,89);if(mode==="both")T.t=T.k==="A"?clamp(T.t,56,93.5):clamp(T.t,7,44);else T.t=clamp(T.t,11,89)}:T=>{T.l=clamp(T.l,10,90);if(mode==="both")T.t=T.k==="A"?clamp(T.t,56,92):clamp(T.t,7,44);else T.t=clamp(T.t,7,92)};
  toks.forEach(lim);
  for(let it=0;it<200;it++){let moved=false;
    for(let a=0;a<toks.length;a++)for(let b=a+1;b<toks.length;b++){const A=toks[a],B=toks[b];
      const ox=wx-Math.abs(A.l-B.l),oy=wy-Math.abs(A.t-B.t);if(ox<=0||oy<=0)continue;moved=true;
      if(ox/wx<oy/wy){const d=(A.l>B.l||(A.l===B.l&&a%2)?1:-1)*(ox/2+.15);A.l+=d;B.l-=d}
      else{const d=(A.t>B.t||(A.t===B.t&&a%2)?1:-1)*(oy/2+.15);A.t+=d;B.t-=d}}
    toks.forEach(lim);if(!moved)break}
  return toks;
}
function slotPos(x,y,r){if(r==="KL")return"KL";const L=x<34,Rr=x>66;
  if(r==="DF")return L?"SLB":Rr?"SĞB":"STP";
  if(r==="FV")return L?"SLK":Rr?"SĞK":"SNT";
  if(y<42)return"DOS";if(x<26)return"SLO";if(x>74)return"SĞO";if(y>64)return"MOO";return"MO"}
function tokHtml(T,editable,sel,caps,notes){
  const id=T.id,kc=T.k.toLowerCase(),s=sel&&sel.kind==="slot"&&sel.team===T.k&&sel.idx===T.i;
  const attrs=editable?`data-act="slot" data-k="${T.k}" data-i="${T.i}"`:(id?`data-act="open" data-id="${esc(id)}"`:`tabindex="-1"`);
  const st=`left:${T.l.toFixed(1)}%;top:${T.t.toFixed(1)}%`;
  if(!id)return `<button class="tok empty ${kc}${s?" sel":""}" style="${st}" ${attrs} aria-label="Boş ${EPOS[T.ep][1]} yeri"><span class="shirt${T.ep.length>2?" p3":""}">${T.ep}</span><span class="tn">Boş</span></button>`;
  return `<button class="tok ${kc}${T.i===0?" gk":""}${s?" sel":""}" style="${st}" ${attrs} aria-label="${esc(nameOf(id))}, ${EPOS[T.ep][1]}, reyting ${ovrOf(id)}"><span class="shirt ${photoOf(id)?"hasph":"ini"}">${photoOf(id)?`<img src="${esc(photoOf(id))}" alt="">`:esc(initials(nameOf(id)))}<i class="ps">${T.ep}</i><i class="ov">${P(id)?.guest?"MİS":ovrOf(id)}</i>${caps&&caps[T.k]===id?'<i class="cap" aria-label="Kaptan">C</i>':""}${notes&&notes.pts[id]?`<i class="nt ${noteCls(notes.pts[id].pts)}${notes.motm===id?" motm":""}" aria-label="Maç notu ${fN(notes.pts[id].pts)}">${notes.motm===id?"★":""}${fN(notes.pts[id].pts)}</i>`:""}</span><span class="tn">${esc(shortName(nameOf(id)))}</span></button>`;
}
const noteCls=v=>v>=8?"n8":v>=7?"n7":v>=6.5?"n65":v>=6?"n6":"n5";
// saha üstünde kart: iki takımda kompakt kart, tek takımda büyük FUT kartı
function cardTok(T,mode,caps,notes,editable,sel){const id=T.id,kc=T.k.toLowerCase();const st=`left:${T.l.toFixed(1)}%;top:${T.t.toFixed(1)}%`;
  const isSel=editable&&sel&&sel.kind==="slot"&&sel.team===T.k&&sel.idx===T.i;const act=editable?`data-act="slot" data-k="${T.k}" data-i="${T.i}"`:`data-act="open" data-id="${esc(id)}"`;const xc=isSel?" sel":"";
  const cls=mode==="both"?"tcard sm":"tcard";
  if(!id)return `<button class="tcard ptk ${mode==="both"?"sm":"lg"} ${kc} empty${xc}" style="${st}" ${act} aria-label="Boş ${EPOS[T.ep][1]} yeri"><span class="ptk-c"><span class="ptk-p">+</span></span><span class="ptk-n">Boş</span><span class="ptk-m"><i>${T.ep}</i></span></button>`;
  const p=P(id),o=ovrOf(id),ph=photoOf(id);
  const r=notes&&notes.pts[id];const nt=r?`<i class="nt ${noteCls(r.pts)}${notes.motm===id?" motm":""}" aria-label="Maç notu ${fN(r.pts)}">${notes.motm===id?"★":""}${fN(r.pts)}</i>`:"";
  const cap=caps&&caps[T.k]===id?'<i class="cap" aria-label="Kaptan">C</i>':"";const ov=p?.guest?"MİS":o;
  const img=`<span class="pi">${ph?`<img src="${esc(ph)}" alt="">`:SILH}</span>`;
  const lab=`aria-label="${esc(nameOf(id))}, ${EPOS[T.ep][1]}, reyting ${ov}${r?", not "+fN(r.pts):""}${p&&!p.guest&&kondOf(id)?", kondisyon yüzde "+kondOf(id).k:""}"`;
  const badge=`<b class="tov num">${ov}</b>`+nt;
  const kc2=p&&!p.guest?kondOf(id):null;const kd=kc2?`<i class="tk" aria-hidden="true">${ICON_BOLT}<b>${kc2.k}</b></i>`:"";
  const kd2=kc2?`<i class="ptk-k k${kc2.lv}" aria-hidden="true">${ICON_BOLT}${kc2.k}</i>`:"";
  return `<button class="tcard ptk ${mode==="both"?"sm":"lg"} ${kc}${xc}" style="${st}" ${act} ${lab}><span class="ptk-c"><span class="ptk-p">${ph?`<img src="${esc(ph)}" alt="">`:SILH}</span>${cap?'<i class="ptk-cap" aria-label="Kaptan">C</i>':""}<b class="ptk-o num">${ov}</b>${nt}</span><span class="ptk-n">${esc(shortName(nameOf(id)))}</span><span class="ptk-m"><i>${T.ep}</i>${kd2}</span></button>`}
function fieldHtml(mode,pa,pb,la,lb,editable,sel,caps,notes){
  return `<div class="field ${mode==="both"?"both":"single"} cards${editable?" edit":""}${S.f.fs?" fs"+S.f.fs:""}" data-mode="${mode}">${fieldSvg()}${layout(mode,pa,pb,la,lb,true).map(T=>T.id||editable?cardTok(T,mode,caps,notes,editable,sel):"").join("")}</div>`;
}
const posArr=(m,k)=>{const p=k==="A"?m.pos_a:m.pos_b;return p&&p.length===TEAM_SIZE?p:FORMS[formOf(m,k)].slots};
const formLabel=(fk,ps)=>samePos(ps,fk)?fk:"Özel";
const formText=(fk,ps)=>samePos(ps,fk)?fk:"Özel diziliş";
const dot=k=>k==="A"?'<span class="bibdot"></span>':'<span class="nobib"></span>';
function viewSeg(mode,act,both){
  const opts=both?[["both","İkisi"],["A",TEAM.A],["B",TEAM.B]]:[["A",TEAM.A],["B",TEAM.B]];
  return `<div class="seg3${both?"":" two"}" role="tablist" aria-label="Görünüm">${opts.map(([v,l])=>`<button data-act="${act}" data-v="${v}" class="${mode===v?"on":""} t${v.toLowerCase()}" role="tab" aria-selected="${mode===v}">${v==="both"?"":dot(v)}${esc(l)}</button>`).join("")}</div>`;
}
function roleGroups(L,PS){const g={ATT:[],MID:[],DEF:[]};L.forEach((id,i)=>{if(!id)return;const r=i===0?"KL":(PS[i]?.[2]||"OS");(r==="KL"||r==="DF"?g.DEF:r==="OS"?g.MID:g.ATT).push(id)});return g}
function strengthHtml(A,B,la,pa,lb,pb){
  const a=roleGroups(la,pa),b=roleGroups(lb,pb);
  const row=(l,x,y)=>{const w=v=>v?Math.max(6,(v-40)/59*100):0;return `<div class="sr"><b class="num${x>y?" hi":""}">${x||"–"}</b><span class="bar l"><i style="width:${w(x)}%"></i></span><span class="lbl">${l}</span><span class="bar r"><i style="width:${w(y)}%"></i></span><b class="num${y>x?" hi":""}">${y||"–"}</b></div>`};
  return `<div class="str"><div class="eyebrow">Güç karşılaştırması</div>${row("Genel",sumAvg(A),sumAvg(B))}${row("Hücum",sumAvg(a.ATT),sumAvg(b.ATT))}${row("Orta saha",sumAvg(a.MID),sumAvg(b.MID))}${row("Savunma",sumAvg(a.DEF),sumAvg(b.DEF))}</div>`;
}
function legendHtml(k,fk,ps,ids,L,cap){const bench=ids.filter(x=>!L.includes(x));
  return `<div class="lg"><div class="lgh">${dot(k)}<b>${TEAM[k]}</b><span class="chip muted">${esc(formLabel(fk,ps))}</span><span class="avg num">${sumAvg(ids)}</span></div>${cap&&ids.includes(cap)?`<p class="small"><span class="capi">C</span> Kaptan: <b>${esc(nameOf(cap))}</b></p>`:""}${bench.length?`<p class="small">Yedek: ${bench.map(x=>esc(nameOf(x))).join(", ")}</p>`:""}</div>`}
function teamsView(m,noShare){
  const fa=formOf(m,"A"),fb=formOf(m,"B");const A=m.team_a||[],B=m.team_b||[];const pa=posArr(m,"A"),pb=posArr(m,"B");
  const la=pad7(lineupOf(m,"A"),A),lb=pad7(lineupOf(m,"B"),B);const mode=S.fv||"both";const NI=mDone(m)&&!isExt(m)?S.mInfo?.[m.id]:null;
  return `${viewSeg(mode,"fv",true)}${fieldHtml(mode,pa,pb,la,lb,false,null,{A:m.cap_a,B:m.cap_b},NI)}
    <div class="legend">${mode!=="B"?legendHtml("A",fa,pa,A,la,m.cap_a):""}${mode!=="A"?legendHtml("B",fb,pb,B,lb,m.cap_b):""}</div>

    `;
}
function subPanel(t,selName,selHasPlayer){
  const s=t.sel,k=s.team,o=k==="A"?"B":"A",lk=k.toLowerCase(),L=t["l"+lk];const cur=s.kind==="slot"?L[s.idx]:s.pid;
  const btn=(id,extra)=>`<button class="tp" data-act="subWith" data-id="${esc(id)}"><span class="o num">${ovrOf(id)}</span><span class="n">${esc(shortName(nameOf(id)))}</span><span class="small muted">${extra||eposOf(P(id))}</span></button>`;
  const PSk=t["p"+lk];const slotEp=i=>i===0?"KL":slotPos(PSk[i][0],PSk[i][1],PSk[i][2]);
  const mates=L.map((id,i)=>[id,i]).filter(([id,i])=>id&&id!==cur).sort((x,y)=>(POS_ORDER[slotEp(x[1])]??99)-(POS_ORDER[slotEp(y[1])]??99));
  const bench=t[k].filter(id=>!L.includes(id)&&id!==cur).sort(byPos);
  const other=[...t[o]].sort(byPos);
  const inT=id=>t.A.includes(id)||t.B.includes(id);
  const pool=S.players.filter(p=>!inT(p.id)&&!UNAVAIL.includes(stOf(p))).map(p=>p.id).sort(byPos);
  const grpH=(title,html)=>html?`<div class="subg"><span class="eyebrow">${title}</span><div class="bench">${html}</div></div>`:"";
  const isCap=cur&&t["c"+lk]===cur;const capBtn=cur?`<button class="btn sm${isCap?"":" primary"}" data-act="setCap"><span class="capi">C</span>${isCap?"Kaptanlığı kaldır":"Kaptan yap"}</button>`:"";
  if(s.kind!=="slot")return `<div class="note"><b>${esc(selName)}</b> seçili. Sahada bir yere dokun, oraya girsin.<div class="row" style="margin-top:8px">${capBtn}<button class="btn sm" data-act="moveTeam">Diğer takıma gönder</button><button class="btn sm danger" data-act="toPool">Takımdan çıkar</button><button class="btn ghost sm" data-act="unsel">Bırak</button></div></div>`;
  return `<div class="note subp"><div><b>${esc(selName||"Boş yer")}</b>${cur?" ile kimi değiştirmek istiyorsun?":" yerine kimi koyalım?"}</div>
    ${grpH("Takım arkadaşıyla yer değiştir",mates.map(([id,i])=>btn(id,slotEp(i))).join(""))}
    ${grpH("Yedekten al",bench.map(id=>btn(id)).join(""))}
    ${grpH(`${TEAM[o]} ile takas`,other.map(id=>btn(id)).join(""))}
    ${pool.length?`<details class="subg"><summary class="small">Takımı olmayan oyuncular (${pool.length})</summary><div class="bench">${pool.map(id=>btn(id)).join("")}</div></details>`:""}
    <div class="row">${selHasPlayer?`${capBtn}<button class="btn sm" data-act="toBench">Yedeğe al</button><button class="btn sm danger" data-act="toPool">Takımdan çıkar</button>`:""}<button class="btn ghost sm" data-act="unsel">Vazgeç</button></div></div>`;
}
const KI={auto:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/></svg>',bal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v16M5 8h14M5 8l-2 6h4zM19 8l-2 6h4zM8 20h8"/></svg>',swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 7h12l-3-3M17 17H5l3 3"/></svg>'};
function editorPanel(m){
  const t=S.teams;const k=t.view||"A";const lk=k.toLowerCase();
  const benchIds=t[k].filter(x=>!t["l"+lk].includes(x)).sort(byPos);
  const benchBtns=benchIds.map(id=>{const s=t.sel&&t.sel.kind==="bench"&&t.sel.pid===id;return `<button class="tp${s?" sel":""}" data-act="bench" data-k="${k}" data-id="${esc(id)}"><span class="o num">${ovrOf(id)}</span><span class="n">${esc(nameOf(id))}</span><span class="small muted">${eposOf(P(id))}</span></button>`}).join("")||'<span class="muted small">Yedek yok</span>';
  const fp=`<div class="form-pick" role="group" aria-label="${TEAM[k]} dizilişi">${Object.keys(FORMS).map(f=>`<button data-act="form" data-k="${k}" data-f="${f}" class="${t["f"+lk]===f&&samePos(t["p"+lk],f)?"on":""}" title="${FORMS[f].d}">${f}</button>`).join("")}</div>`;
  const selName=t.sel?nameOf(t.sel.kind==="slot"?t["l"+t.sel.team.toLowerCase()][t.sel.idx]:t.sel.pid):"";
  const selHasPlayer=t.sel&&(t.sel.kind==="bench"||t["l"+t.sel.team.toLowerCase()][t.sel.idx]);
  const L=rsvpLists(S.matches.find(x=>x.id===t.mid)||{});const inT=id=>t.A.includes(id)||t.B.includes(id);
  const free=S.players.filter(p=>!inT(p.id)).sort((x,y)=>x.name.localeCompare(y.name,"tr"));
  const poolK=free.filter(p=>!UNAVAIL.includes(stOf(p))).map(p=>p.id).sort(byPos),poolO=free.filter(p=>UNAVAIL.includes(stOf(p))).map(p=>p.id).sort(byPos);
  const poolG=S.guests.filter(p=>!inT(p.id)).map(p=>p.id);
  const poolRow=id=>{const p=P(id);return `<div class="pl">${avatarO(p)}<div class="pi"><b>${esc(p.name)}</b><span>${esc(posLabel(p))}${kondChip(p.id)}${stChip(p)}</span></div><span class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn sm" data-act="poolAdd" data-k="A" data-id="${esc(id)}" aria-label="${esc(p.name)} Yeleklilere">${dot("A")}A</button><button class="btn sm" data-act="poolAdd" data-k="B" data-id="${esc(id)}" aria-label="${esc(p.name)} Yeleksizlere">${dot("B")}B</button></span></div>`};
  return `<details class="pool-box"${t.poolOpen!==false?" open":""} data-act-toggle-team="poolOpen"><summary>Oyuncu seç · ${t.A.length+t.B.length}/${CAP} kişi seçildi</summary><div class="list">
     ${poolK.length?`<div class="grp">Oyuncular</div>${poolK.map(poolRow).join("")}`:`<p class="muted small" style="padding:8px 0">Bütün oyuncular takımlara dağıtıldı.</p>`}
     ${poolO.length?`<details><summary class="small">Sakat, hasta ya da izinde (${poolO.length})</summary>${poolO.map(poolRow).join("")}</details>`:""}
     ${poolG.length?`<div class="grp">Önceki misafirler</div>${poolG.map(poolRow).join("")}`:""}
     <div class="grp">Misafir ekle</div>
     <form data-form="addGuest" class="guestf"><input id="guestName" type="text" maxlength="40" placeholder="Misafirin adı" autocomplete="off" data-bind="guestName" value="${esc(S.f.guestName||"")}"><button class="btn sm" type="submit">${dot(k)}${esc(TEAM[k])} · ekle</button></form>
     </div></details>
   <div class="ked-t">${["A","B"].map(x=>{const lx=x.toLowerCase();return `<button data-act="tview" data-v="${x}" class="t${lx}${k===x?" on":""}" aria-pressed="${k===x}"><span class="ked-d"></span><span class="ked-x"><b>${esc(TEAM[x])}</b><small>${t[x].length} kişi · ${esc(formText(t["f"+lx],t["p"+lx]))}</small></span><b class="num">${sumAvg(t[x])||"–"}</b></button>`}).join("")}</div>
   ${fp}
   <div class="lineup">${fieldHtml(k,t.pa,t.pb,t.la,t.lb,true,t.sel,capsOf(t))}
   <div style="display:grid;gap:12px;align-content:start;min-width:0">
     ${t.sel?subPanel(t,selName,selHasPlayer)
       :``}
     <div class="side"><span class="eyebrow">Yedekler</span><div class="bench">${benchBtns}</div></div>
   </div></div>
   ${strengthHtml(t.A,t.B,t.la,t.pa,t.lb,t.pb)}
   <button class="ked-c" data-act="cancelTeams">Vazgeç</button>
   <div class="ked-bar"><button data-act="autoPlace" aria-label="Otomatik yerleştir" title="Otomatik yerleştir">${KI.auto}<span>Yerleştir</span></button><button data-act="balance" data-id="${esc(m.id)}" ${t.A.length+t.B.length<4?"disabled":""} aria-label="Dengeli dağıt" title="Dengeli dağıt">${KI.bal}<span>Dengele</span></button><button data-act="swapBibs" aria-label="Yelekleri değiştir" title="Yelekleri değiştir">${KI.swap}<span>Yelek</span></button><button class="ked-s" data-act="saveTeams" aria-label="Kadroları kaydet">${ICON.check} Kaydet</button></div>`;
}
function draftPanel(m){
  const d=S.draft;const ids=rsvpLists(m).kadro.map(p=>p.id);
  if(!d.capA||!d.capB){const opts=cur=>`<option value="">Seç</option>`+ids.map(id=>`<option value="${esc(id)}"${cur===id?" selected":""}>${esc(nameOf(id))} (${ovrOf(id)})</option>`).join("");
    return `<div class="ch"><h2>Kaptan draftı</h2></div><div class="note">Kaptanları seç. Yazı tura atılır, kazanan ilk seçer. Her seçim için 20 saniye var; süre dolarsa en yüksek reytingli oyuncu otomatik seçilir.</div>
      <div class="grid2"><label class="f" for="capA">${TEAM.A} kaptanı<select id="capA" data-act-change="cap" data-k="A">${opts(d.selA)}</select></label>
      <label class="f" for="capB">${TEAM.B} kaptanı<select id="capB" data-act-change="cap" data-k="B">${opts(d.selB)}</select></label></div>
      <button class="btn primary block" data-act="draftGo" ${d.selA&&d.selB&&d.selA!==d.selB?"":"disabled"}>${ICON.flip} Yazı tura at, başla</button><button class="btn ghost sm" data-act="draftCancel">Vazgeç</button>`}
  const pool=ids.filter(id=>!d.A.includes(id)&&!d.B.includes(id));
  const col=(k,arr)=>`<div class="tcol"><h3><span>${k==="A"?'<span class="bibdot"></span>':'<span class="nobib"></span>'}${TEAM[k]}</span><span class="num">${sumAvg(arr)}</span></h3>${arr.map(id=>`<div class="tp"><span class="o num">${ovrOf(id)}</span><span class="n">${esc(nameOf(id))}</span></div>`).join("")}</div>`;
  const cols=`<div class="split">${col("A",d.A)}${col("B",d.B)}</div>`;
  if(!pool.length)return `<div class="ch"><h2>Draft bitti</h2></div>`+cols+`<button class="btn primary block" data-act="draftDone">Sahaya diz</button><button class="btn ghost sm" data-act="draftCancel">Baştan al</button>`;
  return `<div class="ch"><div><div class="eyebrow">Sıra · ${TEAM[d.turn]}</div><h2>${esc(nameOf(d.turn==="A"?d.capA:d.capB))} seçiyor</h2></div><span class="timer num" id="dtimer">${Math.max(0,Math.ceil((d.deadline-Date.now())/1000))}</span></div>
    <div class="pool">${pool.sort((a,b)=>genOf(b)-genOf(a)).map(id=>`<button data-act="dpick" data-id="${esc(id)}"><b class="num">${ovrOf(id)}</b>${esc(nameOf(id))} <span class="muted small">${eposOf(P(id))}</span></button>`).join("")}</div>`+cols;
}

/* ================= Maç sonu girişi ================= */
function eventsFrom(m){const st=m.stats||{};const ev=[];const gU={},aU={};
  for(const x of(m.links||[])){if(!x||!x.g)continue;ev.push({t:"g",g:x.g,a:x.pk?null:(x.a||null),pk:!!x.pk});gU[x.g]=(gU[x.g]||0)+1;if(x.a)aU[x.a]=(aU[x.a]||0)+1}
  for(const[id,o]of Object.entries(st)){for(let i=gU[id]||0;i<(+o.g||0);i++)ev.push({t:"g",g:id,a:null});for(let i=0;i<(+o.og||0);i++)ev.push({t:"og",p:id})}
  for(const[id,o]of Object.entries(st)){for(let i=aU[id]||0;i<(+o.a||0);i++){const f=ev.find(e=>e.t==="g"&&!e.a&&e.g!==id&&sideOf(m,e.g)===sideOf(m,id));if(f)f.a=id;else ev.push({t:"a",p:id})}}
  return ev}
function statsOf(sd){const o={};const add=(id,k)=>{if(id){const x=o[id]||(o[id]={g:0,a:0,og:0});x[k]=(x[k]||0)+1}};
  for(const e of sd.events){if(e.t==="g"){add(e.g,"g");if(e.pk)add(e.g,"pg");else add(e.a,"a")}else if(e.t==="og")add(e.p,"og");else if(e.t==="a")add(e.p,"a")}
  const ens=id=>o[id]||(o[id]={g:0,a:0,og:0});for(const[id,v]of Object.entries(sd.perf||{}))if(v)ens(id).k=v;
  for(const k of EXK)for(const[id,v]of Object.entries(sd[k]||{}))if(v)ens(id)[k]=v;return o}
function goalSums(m,sd){let a=0,b=0;for(const e of sd.events){if(e.t==="g")sideOf(m,e.g)==="A"?a++:b++;else if(e.t==="og")sideOf(m,e.p)==="A"?b++:a++}return[a,b]}
function sdOf(m){const k="sd_"+m.id;if(S.f[k])return S.f[k];let sv=null;try{sv=JSON.parse(LS.get("y_sd_"+m.id)||"null")}catch(_){}
  const vsm=(m.vsum&&m.vsum._motm)||"",vsf=(m.vsum&&m.vsum._fiy)||"";
  if(sv&&Array.isArray(sv.events))return S.f[k]={...exFrom({}),...sv,motm:sv.motm||vsm,fiy:sv.fiy||vsf,undo:sv.undo||[],step:null};
  const sd={a:+m.score_a||0,b:+m.score_b||0,touched:m.score_a!=null,manual:false,motm:m.motm||vsm,gol:m.gol_id||"",fiy:m.fiy_id||vsf,events:eventsFrom(m),...exFrom(m.stats),undo:[],step:null};
  const[ga,gb]=goalSums(m,sd);if(m.score_a!=null&&(ga!==sd.a||gb!==sd.b))sd.manual=true;return S.f[k]=sd}
function sdSave(m,sd){try{LS.set("y_sd_"+m.id,JSON.stringify({a:sd.a,b:sd.b,touched:sd.touched,manual:sd.manual,motm:sd.motm,gol:sd.gol||"",fiy:sd.fiy||"",events:sd.events,perf:sd.perf||{},pen:sd.pen||{},cl:sd.cl||{},pm:sd.pm||{},ps:sd.ps||{},undo:sd.undo.slice(-25)}))}catch(_){}}
function syncScore(m,sd){if(sd.manual)return;const[a,b]=goalSums(m,sd);sd.a=a;sd.b=b;if(a||b)sd.touched=true}
function snap(sd,label){sd.undo.push(JSON.stringify({l:label,events:sd.events,a:sd.a,b:sd.b,manual:sd.manual,touched:sd.touched,motm:sd.motm,gol:sd.gol||"",fiy:sd.fiy||""}));if(sd.undo.length>40)sd.undo.shift()}
const hasDraft=m=>{const sd=S.f["sd_"+m.id];if(sd)return sd.touched||sd.events.length||sd.motm;return !!LS.get("y_sd_"+m.id)};
const evLabel=e=>e.t==="g"?shortName(nameOf(e.g))+" golü":e.t==="og"?shortName(nameOf(e.p))+" kendi kalesine":shortName(nameOf(e.p))+" asisti";
const MGI={cal:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16v14H4zM4 10h16M9 3v4M15 3v4"/></svg>',shirt:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" aria-hidden="true"><path d="M8 4l-5 3 2 4 3-1v10h8V10l3 1 2-4-5-3c-1 2-2 2.5-4 2.5S9 6 8 4z"/></svg>'};
// yöneticinin o anki tek işi maç başlığının hemen altında: kaydırmadan başlar
function nextStep(m){const M=esc(m.id);
  if(m.state==="kayit"){const rs=m.rsvp||{};const n=S.players.filter(p=>!p.guest&&rs[p.id]==="g"&&!UNAVAIL.includes(stOf(p))).length;
    return `<section class="nxs"><span class="nxs-x"><small>Sıradaki adım</small><b>${n<4?"Oynayacakları işaretle":"Takımları kur"}</b><span>${n}/${CAP} oyuncu işaretli</span></span>${n<4?`<a class="btn sm" href="#kadrolar">Kadroya git</a>`:`<button class="btn primary sm" data-act="autoKadro" data-id="${M}">Otomatik kur</button>`}</section>`}
  if(vOpen(m)){const vs=S.vst&&S.vst[m.id];const n=vs&&vs.n||0;const late=Date.now()>matchTs(m)+864e5;
    return `<section class="nxs"><span class="nxs-x"><small>Sıradaki adım</small><b>Oylamayı kapat</b><span>${n?n+" kişi oy verdi · ":""}${late?"Kapanana kadar kartlar ve puan durumu güncellenmez":"Herkes oy verince kapat"}</span></span><a class="btn ${late?"primary ":""}sm" href="#oylama">Oylamaya git</a></section>`}
  if(m.state==="bitti")return"";
  const draft=hasDraft(m),sd=draft?sdOf(m):null;
  return `<section class="nxs"><span class="nxs-x"><small>Sıradaki adım</small><b>Maç bitti mi?</b><span>${draft?`Taslak: ${sd.a} – ${sd.b} · ${sd.events.length} kayıt`:(vPend(m)?"Skoru ve golleri gir, oylama sonra açılır":"Skoru ve golleri gir")}</span></span><button class="btn primary sm" data-act="statSheet" data-id="${M}">${draft?"Devam et":"Skoru gir"}</button></section>`}
function finishCard(m){
  const draft=hasDraft(m);const sd=draft?sdOf(m):null;const M=esc(m.id);
  const reo=m.finished_at&&m.score_a!=null&&m.score_b!=null;
  const kw="mw_"+m.id,kn="mn_"+m.id;const w=S.f["when_"+m.id]||{};const wch=(w.d&&w.d!==m.date)||(w.t&&w.t!==m.time);
  const row=(k,ic,c,l,v)=>`<button class="mg-r" data-act="tog" data-k="${k}" aria-expanded="${!!S.f[k]}"><span class="mg-i" style="color:${c}">${ic}</span><span class="mg-l">${l}</span><b>${v}</b><i>${S.f[k]?CHVD:CHVR}</i></button>`;
  return `<section class="card admc mgc"><div class="mg-h"><span>Yönetici · ${fmtShort(m.date)}</span><h2>Maçı yönet</h2></div>
    ${reo?`<div class="note warn">Bu maç düzeltme için açıldı. Tekrar bitirilene kadar sonuçları kartlara ve tablolara sayılmıyor; veriler duruyor. <button class="btn sm" data-act="restoreFin" data-id="${M}" style="margin-top:8px">Değişiklik yapmadan geri kapat</button></div>`:""}
    <span class="mg-lb">MAÇ BİLGİLERİ</span>
    <div class="mg-l2">${row(kw,MGI.cal,"#5FE3F5","Tarih ve saat",`${fmtShort(m.date)} · ${esc(String(m.time||"").slice(0,5))}`)}${S.f[kw]||wch?`<div class="mg-f">${whenForm(m)}</div>`:""}
      ${row(kn,MGI.shirt,"#FF3EA5","Takım adları",`${esc(TEAM.A)} · ${esc(TEAM.B)}`)}${S.f[kn]?`<div class="mg-f">${namesForm(m)}</div>`:""}</div>
    <span class="mg-lb">KADROLAR</span>
    ${S.f.rsvpAsk===m.id?`<div class="mg-ask"><b>Kadro aşamasına dönülsün mü?</b><p>Kadrolar oyunculardan gizlenir; tahmin ve soyunma odası, kadroyu yeniden açıklayana kadar bekler. Takımlar, tahminler ve mesajlar silinmez.</p><div class="grid2"><button class="btn" data-act="rsvpNo">Vazgeç</button><button class="btn primary" data-act="backRsvp" data-id="${M}">Evet, dön</button></div></div>`:`<div class="mg-k"><button data-act="editTeams" data-id="${M}"><b>Kadroları değiştir</b><small>Oyuncu taşı, diziliş seç</small></button><button data-act="backRsvp" data-id="${M}"><b>Kadro aşamasına dön</b><small>Oynayacakları yeniden işaretle</small></button></div>`}
    <div class="mg-dz">${draft?`<button class="btn sm danger" data-act="draftDel" data-id="${M}">${S.f.delDraft===m.id?"Taslağı silmek için tekrar bas":"Taslağı sil"}</button>`:""}<button class="btn danger sm" data-act="delMatch" data-id="${esc(m.id)}">${S.f.delMatch===m.id?"Silmek için tekrar bas":"Maçı sil"}</button></div></section>`;
}
function ptile(id,act,M,on,extra,cls){const p=P(id);return `<button class="pt${on?" on":""}${cls?" "+cls:""}" data-act="${act}" data-m="${M}" data-p="${esc(id)}"${extra||""} aria-pressed="${!!on}">${p?avatar(p,"xs"):`<span class="av xs">?</span>`}<b>${esc(shortName(nameOf(id)))}</b></button>`}
function statEntry(m){
  const sd=sdOf(m);const st=statsOf(sd);const M=esc(m.id);const tab=S.f.stTab||"gol";
  const[gA,gB]=goalSums(m,sd);const mism=sd.touched&&sd.manual&&(gA!==sd.a||gB!==sd.b);const conf=S.f.confirmFinish===m.id;
  const team=k=>plOf(m,k);const pl=plAll(m);const step=sd.step;
  const nPerf=pl.filter(id=>(sd.perf||{})[id]).length;const nAw=[sd.motm,sd.gol,sd.fiy].filter(Boolean).length;
  const tabs=[["gol","Goller",sd.events.filter(e=>e.t!=="a").length||""],["odul","Ödüller",nAw?nAw+"/3":""],["deg","Değerlendirme",nPerf?nPerf+"/"+pl.length:""]].filter(t=>!(vOn(m)&&t[0]==="deg"));
  const top=`<div class="stTop"><div class="stHd"><span class="eyebrow">Maç kaydı · ${fmtShort(m.date)}</span><button class="btn sm" data-act="close">Kapat</button></div><div class="stSc"><span class="n a">${dot("A")}${esc(TEAM.A)}</span><b class="num">${sd.a}</b><i>–</i><b class="num">${sd.b}</b><span class="n b">${esc(TEAM.B)}${dot("B")}</span></div>
    <div class="stTabs" role="tablist">${tabs.map(([k,l,c])=>`<button role="tab" aria-selected="${tab===k}" class="${tab===k?"on":""}" data-act="stTab" data-v="${k}">${l}${c!==""?`<small>${c}</small>`:""}</button>`).join("")}</div></div>`;
  let body="";
  if(tab==="gol"){
    if(step&&step.ph==="scorer"){const o=step.side==="A"?"B":"A";const ow=S.f.stOwn;
      body=`<div class="gstep"><div class="gsh"><b>${dot(step.side)}${esc(TEAM[step.side])} golü · kim attı?</b><button class="btn sm ghost" data-act="gCancel" data-m="${M}">Vazgeç</button></div>
        <div class="ptiles">${team(step.side).map(id=>ptile(id,"gScorer",M)).join("")}</div>
        <button class="lnk" data-act="tog" data-k="stOwn">${ow?"▴":"▾"} Rakip oyuncu kendi kalesine attı</button>
        ${ow?`<div class="ptiles own">${team(o).map(id=>ptile(id,"gOwn",M)).join("")}</div>`:""}</div>`}
    else if(step&&step.ph==="assist"){const e=sd.events[step.i];const mates=team(sideOf(m,e.g)).filter(id=>id!==e.g);
      body=`<div class="gstep"><div class="gsh"><b>⚽ ${esc(shortName(nameOf(e.g)))} · asist kimden?</b><button class="btn sm ghost" data-act="gBack" data-m="${M}">${step.fresh?"Golü iptal et":"Vazgeç"}</button></div>
        <div class="ptiles">${mates.map(id=>ptile(id,"gAssist",M,!e.pk&&e.a===id)).join("")}</div>
        <div class="grid2"><button class="btn${!e.a&&!e.pk&&!step.fresh?" on":""}" data-act="gAssist" data-m="${M}" data-p="">Asist yok</button><button class="btn pkb${e.pk?" on":""}" data-act="gAssist" data-m="${M}" data-p="" data-pk="1">Penaltı golü</button></div></div>`}
    else{
      let ra=0,rb=0;
      const rows=sd.events.map((e,i)=>{if(e.t==="a")return `<div class="gl"><span class="gsc muted">–</span><span class="gi"><b>${esc(shortName(nameOf(e.p)))}</b><small>asist (gol belli değil)</small></span><span></span><button class="xb" data-act="evDel" data-m="${M}" data-i="${i}" aria-label="Sil">${ICON.x}</button></div>`;
        const k=e.t==="g"?sideOf(m,e.g):(sideOf(m,e.p)==="A"?"B":"A");k==="A"?ra++:rb++;
        const who=e.t==="g"?e.g:e.p;
        const sub=e.t==="og"?"kendi kalesine":e.pk?"penaltı":e.a?"asist: "+esc(shortName(nameOf(e.a))):"asist yok";
        return `<div class="gl ${k}"><span class="gsc num">${ra}–${rb}</span>${e.t==="g"?`<button class="gi" data-act="gEdit" data-m="${M}" data-i="${i}"><b>${esc(shortName(nameOf(who)))}</b><small>${sub} <u>değiştir</u></small></button>`:`<span class="gi"><b>${esc(shortName(nameOf(who)))}</b><small>${sub}</small></span>`}
          ${e.t==="g"?`<button class="pkt${e.pk?" on":""}" data-act="evPk" data-m="${M}" data-i="${i}" aria-pressed="${!!e.pk}" aria-label="Penaltı golü">P</button>`:"<span></span>"}<button class="xb" data-act="evDel" data-m="${M}" data-i="${i}" aria-label="Bu golü sil">${ICON.x}</button></div>`}).join("");
      const scm=S.f["scm_"+m.id]||mism;
      body=`<div class="gadd"><button class="btn gbtn a" data-act="gStart" data-m="${M}" data-side="A">${ICON.plus}<span>Gol</span><b>${esc(TEAM.A)}</b></button><button class="btn gbtn b" data-act="gStart" data-m="${M}" data-side="B">${ICON.plus}<span>Gol</span><b>${esc(TEAM.B)}</b></button></div>
        ${rows?`<div class="glist2">${rows}</div>`:""}
        ${sd.touched||sd.events.length?"":`<button class="btn block" data-act="zeroScore" data-id="${M}">Maç 0–0 bitti</button>`}
        ${mism?`<div class="note warn">Girilen goller (${gA}–${gB}) skorla tutmuyor. <button class="btn sm" data-act="fillScore" data-id="${M}" style="margin-left:6px">Skoru gollerden al</button></div>`:""}
        <button class="lnk" data-act="tog" data-k="scm_${M}">${scm?"▴":"▾"} Skoru elle düzelt</button>
        ${scm?`<div class="scoreEdit">${scoreSide(m,"a",TEAM.A,sd.a,true)}<span class="dash">–</span>${scoreSide(m,"b",TEAM.B,sd.b,false)}</div>`:""}
        ${hasDraft(m)?`<button class="lnk danger" data-act="draftDel" data-id="${M}">${S.f.delDraft===m.id?"Emin misin? Tekrar bas":"Taslağı sil, baştan başla"}</button>`:""}`}
  }else if(tab==="odul"){
    const scorers=[...new Set(sd.events.filter(e=>e.t==="g").map(e=>e.g))];
    const grp=(k,ids)=>ids.map(id=>ptile(id,"awPick",M,sd[k]===id,` data-k="${k}"`)).join("");
    const byT=k=>[["A",team("A")],["B",team("B")]].map(([t,T])=>`<div class="grp">${dot(t)} ${esc(TEAM[t])}</div><div class="ptiles c4">${grp(k,T)}</div>`).join("");
    const oyAcik=vOn(m)&&!m.vote_closed_at;const oyNot=t=>`<div class="aws"><div class="awh"><b>${t}</b></div><p class="muted small" style="margin:0">Oylama sürüyor. Oylamayı kapatınca en çok seçilen oyuncu otomatik yazılır.</p></div>`;
    body=(oyAcik?oyNot("★ Maçın Adamı"):`<div class="aws"><div class="awh"><b>★ Maçın Adamı</b><span class="muted small">+${fN(NOTE.motm)} not${sd.motm?" · "+esc(shortName(nameOf(sd.motm))):""}</span></div>${byT("motm")}</div>`)+`
      <div class="aws"><div class="awh"><b>⚽ Haftanın Golü</b><span class="muted small">${sd.gol?esc(shortName(nameOf(sd.gol))):"gol atanlardan seç"}</span></div>${scorers.length?`<div class="ptiles c4">${grp("gol",scorers)}</div>`:`<p class="muted small" style="margin:0">Önce golleri gir.</p>`}</div>
      `+(oyAcik?oyNot("🙈 Haftanın Fiyaskosu"):`<div class="aws"><div class="awh"><b>🙈 Haftanın Fiyaskosu</b><span class="muted small">${sd.fiy?esc(shortName(nameOf(sd.fiy))):"isteğe bağlı"}</span></div>${byT("fiy")}</div>`)}
  else body=perfBlock(m,sd);
  const last=sd.undo.length?JSON.parse(sd.undo[sd.undo.length-1]).l:"";
  const bot=`<div class="stBot">${conf?`<div class="stSum">${esc(TEAM.A)} <b>${sd.a} – ${sd.b}</b> ${esc(TEAM.B)} · ${gA+gB} gol${sd.motm?" · ★ "+esc(shortName(nameOf(sd.motm))):" · Maçın Adamı yok"} · ${nPerf} değerlendirme</div>`:""}
    <div class="stBtns"><button class="btn" data-act="undo" data-m="${M}" ${sd.undo.length?"":"disabled"} title="${esc(last)}" aria-label="Geri al${last?": "+esc(last):""}">↶</button>
    <button class="btn ${conf?"primary":"turf"} block" data-act="finish" data-id="${M}" ${sd.touched?"":"disabled"}>${ICON.check} ${m.state==="bitti"?(conf?"Onayla ve kaydet":"Değişiklikleri kaydet"):conf?"Onayla ve bitir":sd.touched?"Maçı bitir":"Önce golleri gir"}</button></div></div>`;
  return `${top}${body}${bot}`;
}
function perfBlock(m,...r){return inM(m,()=>_perfBlock(m,...r))}
function _perfBlock(m,sd,skey){skey=skey||"sd_"+m.id;const SK=esc(skey);const M=esc(m.id);const pl=plAll(m);const pf=sd.perf||{};const c=[0,0,0,0];for(const id of pl)if(pf[id])c[pf[id]-1]++;
  const live=!!sd.events;let stx;
  if(live)stx=statsOf(sd);else{stx={};for(const id of pl){const s={...((m.stats||{})[id]||{})};delete s.k;EXK.forEach(k=>delete s[k]);if(pf[id])s.k=pf[id];EXK.forEach(k=>{if((sd[k]||{})[id])s[k]=sd[k][id]});stx[id]=s}}
  const showN=!live||sd.touched;const tmp={...m,stats:stx,score_a:live?sd.a:m.score_a,score_b:live?sd.b:m.score_b};
  const NT=showN?matchNotes(tmp,live?sd.motm||null:m.motm,live?sd.gol||null:m.gol_id,live?sd.fiy||null:m.fiy_id):{};const nt=id=>{const r=NT[id];if(!r)return"";return `<span class="pnt num${r.pts>=7.5?" hi":r.pts<6?" lo":""}">${fN(r.pts)}</span>`};
  const facts=id=>{const s=stx[id]||{};const b=[];if(id===(live?sd.motm:m.motm))b.push("★");if(+s.g)b.push("⚽"+(+s.g>1?s.g:""));if(+s.a)b.push((+s.a>1?s.a:"")+" ast");if(+s.og)b.push("k.k.");
    EXK.forEach(k=>{if(+(sd[k]||{})[id])b.push({pen:"P yaptırdı",cl:"çizgi",pm:"P kaçırdı",ps:"P kurtardı"}[k])});return b.join(" · ")};
  const row=id=>`<div class="pfr"><div class="pfh"><span class="pfn">${esc(shortName(nameOf(id)))}${P(id)&&!P(id).guest?`<small>${eposOf(P(id))}</small>`:""}</span><span class="muted small pff">${facts(id)}</span>${nt(id)}</div>
    <span class="pfs">${[1,2,3,4].map(v=>`<button class="p${v}${pf[id]===v?" on":""}" data-act="perf" data-s="${SK}" data-m="${M}" data-p="${esc(id)}" data-v="${v}" aria-pressed="${pf[id]===v}">${NOTE.perf[v][1]}</button>`).join("")}</span></div>`;
  const exT=k=>`<div class="exg"><span class="eyebrow">${EXL[k]}</span><div class="chipsP">${pl.map(id=>{const v=(sd[k]||{})[id]||0;
    return `<span class="exc${v?" on":""}"><button class="pk${v?" on":""}" data-act="exTap" data-s="${SK}" data-m="${M}" data-k="${k}" data-p="${esc(id)}" data-d="${v?-1:1}"><span>${esc(shortName(nameOf(id)))}${v>1?" ×"+v:""}</span></button>${v?`<button class="exp" data-act="exTap" data-s="${SK}" data-m="${M}" data-k="${k}" data-p="${esc(id)}" data-d="1" aria-label="Bir daha ekle">+1</button>`:""}</span>`}).join("")}</div></div>`;
  const exOpen=S.f["exo_"+skey]||EXK.some(k=>Object.values(sd[k]||{}).some(Boolean));
  return `<div class="tblock"><p class="muted small" style="margin:0">Seçilmeyen oyuncu <b>orta</b> sayılır.</p>
    ${[["A",plOf(m,"A")],["B",plOf(m,"B")]].map(([k,T])=>`<div class="grp">${dot(k)} ${esc(TEAM[k])}</div>${T.map(row).join("")}`).join("")}
    <button class="lnk" data-act="tog" data-k="exo_${SK}">${exOpen?"▴":"▾"} Penaltı ve çizgiden çıkarma${EXK.some(k=>Object.values(sd[k]||{}).some(Boolean))?" ✓":""}</button>
    ${exOpen?`<div style="display:grid;gap:12px">${EXK.map(exT).join("")}</div>`:""}</div>`}
function scoreSide(m,side,name,val,bib){return `<div class="se"><span class="tn">${bib?'<span class="bibdot"></span>':'<span class="nobib"></span>'}${name}</span><span class="big num">${val}</span><span class="pm"><button class="rnd" data-act="sc" data-m="${esc(m.id)}" data-side="${side}" data-d="-1" aria-label="${name} skorunu azalt">−</button><button class="rnd" data-act="sc" data-m="${esc(m.id)}" data-side="${side}" data-d="1" aria-label="${name} skorunu artır">+</button></span></div>`}

/* ================= Sonuç ================= */
/* ===== Saha verileri: ekranlar ===== */
const tDot=k=>crest(k==="A"?TEAM.A:TEAM.B,k,15);
const fTrk=(k,v)=>v==null||!isFinite(v)?"–":k==="isa"?"%"+Math.round(v):TRK.find(x=>x[0]===k)[3]?fN1(v):String(Math.round(v*10)/10).replace(".",",");
const trkSum=(m,k,f)=>{const L=plOf(m,k).map(id=>trkOf(m,id)).filter(Boolean);if(!L.length)return null;const v=L.map(t=>t[f]).filter(x=>x!=null);if(!v.length)return null;
  if(f==="isa"){let s=0,w=0;L.forEach(t=>{if(t.isa!=null){const q=t.pas||1;s+=t.isa*q;w+=q}});return w?s/w:null}
  if(f==="hiz")return Math.max(...v);if(f==="rt")return v.reduce((a,b)=>a+b,0)/v.length;return v.reduce((a,b)=>a+b,0)};
// maçın en'leri
const trkBest=m=>[["rt","En yüksek reyting"],["km","En çok koşan"],["hiz","En hızlı"],["pas","Pas ustası"],["tk","Top kapma"],["pa","Pas arası"],["pt","Progresif taşıma"]].map(([k,l])=>{const c=plAll(m).filter(id=>trkOf(m,id)?.[k]!=null).sort((a,b)=>trkOf(m,b)[k]-trkOf(m,a)[k])[0];return c?{k,l,id:c,v:trkOf(m,c)[k]}:null}).filter(Boolean);
function trkPanel(m){const n=plAll(m).filter(id=>trkOf(m,id)).length,tot=plAll(m).length;const M=esc(m.id);
  if(!n)return `<div class="empty emp2">${empIc("grafik","green")}<h3>Saha verisi girilmedi</h3><p>Akıllı Saha'daki koşu, pas, hız ve top kapma verileri girilirse burada iki takım karşılaştırılır; notlara ve kartlara da yansır.</p>${S.admin?`<button class="btn primary" data-act="trkOpen" data-id="${M}">Saha verilerini gir</button>`:""}</div>`;
  const rows=[["rt","Ort. reyting"],["km","Koşu (km)"],["pas","Pas"],["isa","Pas isabeti"],["spr","Sprint"],["hiz","En yüksek hız"],["tk","Top kapma"],["pa","Pas arası"],["pp","Progresif pas"],["pt","Progresif taşıma"],["dri","Dripling"]].map(([k,l])=>[k,l,trkSum(m,"A",k),trkSum(m,"B",k)]).filter(r=>r[2]!=null||r[3]!=null);
  let h=`<p class="muted small" style="margin:0">${n}/${tot} oyuncunun verisi girildi${n<TRK_MIN?" · notlara ve kartlara yansıması için en az "+TRK_MIN+" oyuncu gerekir":""}. Kaynak: Akıllı Saha.</p>`;
  h+=`<div class="mstat"><div class="msth"><span>${tDot("A")}${esc(TEAM.A)}</span><span>${tDot("B")}${esc(TEAM.B)}</span></div>${rows.map(([k,l,x,y])=>{x=x||0;y=y||0;const t=Math.max(x,y)||1;
    return `<div class="msr"><div class="msl"><b class="num${x>y?" hi":""}">${fTrk(k,x)}</b><span>${l}</span><b class="num${y>x?" hi":""}">${fTrk(k,y)}</b></div><div class="msb"><span class="l"><i style="width:${x/t*100}%"></i></span><span class="r"><i style="width:${y/t*100}%"></i></span></div></div>`}).join("")}</div>`;
  if(S.admin)h+=`<button class="btn ghost sm" data-act="trkOpen" data-id="${M}">Saha verilerini düzenle</button>`;
  return h}
// notlar sekmesinde oyuncunun verisi: ortalamaya göre etiketler
const trkChips=(m,id,r)=>{const t=trkOf(m,id);if(!t)return"";const d=r&&r.trk||{};const ctx=trkCtx(m);
  return `<div class="trkc">${TRK.filter(([k])=>t[k]!=null).map(([k,l,u])=>{const x=d[k];const cl=x==null?"":x>=.8?" up":x<=-.8?" dn":"";const av=ctx&&ctx.st[k]?" · ort. "+fTrk(k,ctx.st[k].mean):"";return `<span class="pillk${cl}">${l} ${fTrk(k,t[k])}${u&&u!=="%"?" "+u:""}${av}</span>`}).join("")}</div>`};
function sheetTrk(){const m=S.matches.find(x=>x.id===S.sheet.mid);if(!m||!S.admin)return"";const f=S.f.trk||{};const op=S.f.trkOpen;
  const row=id=>{const p=P(id);if(!p)return"";const v=f[id]||{};const has=TRK.some(([k])=>v[k]!==""&&v[k]!=null);
    return `<details class="trkr"${op===id?" open":""}><summary><span class="av sm">${avatar(p,"sm")}</span><span class="trkn"><b>${esc(nameOf(id))}</b><small>${has?TRK.filter(([k])=>v[k]!==""&&v[k]!=null).slice(0,3).map(([k,l,u])=>esc(String(v[k]))+(u?" "+u:"")+(u?"":" "+l.toLocaleLowerCase("tr"))).join(" · "):"Veri yok"}</small></span><span class="chip ${has?"ok":""}">${has?"Girildi":"Boş"}</span></summary>
      <div class="grid2 trkg">${TRK.map(([k,l,u,dec])=>`<label class="f">${l}${u?" ("+u+")":""}<input type="text" inputmode="decimal" data-bind="trk.${esc(id)}.${k}" value="${esc(v[k]??"")}" placeholder="–" autocomplete="off"></label>`).join("")}</div></details>`};
  const n=plAll(m).filter(id=>{const v=f[id]||{};return TRK.some(([k])=>v[k]!==""&&v[k]!=null)}).length,tot=plAll(m).length;
  return `<div class="ch"><div style="min-width:0"><div class="eyebrow">Saha verileri · ${fmtShort(m.date)}</div><h2 style="white-space:normal">${esc(TEAM.A)} ${m.score_a} – ${m.score_b} ${esc(TEAM.B)}</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
    <div class="trkp"><b>${n} / ${tot} oyuncu</b><span class="kbar khi big"><i style="width:${tot?n/tot*100:0}%"></i></span><small class="muted">Akıllı Saha'daki maç ekranından bakıp gir; ondalık için virgül kullanabilirsin. Zorunlu değil. En az ${TRK_MIN} oyuncu girilince notlara (en fazla ±1) ve kartlara (±1) yansır.</small></div>
    <div class="eyebrow trkh">${tDot("A")}${esc(TEAM.A)}</div>${plOf(m,"A").map(row).join("")}
    <div class="eyebrow trkh">${tDot("B")}${esc(TEAM.B)}</div>${plOf(m,"B").map(row).join("")}
    <button class="btn primary block" data-act="trkSave" data-id="${esc(m.id)}">${ICON.check} Kaydet ve hesapla</button>`}
// oyuncunun sezon verileri
function trkPlayer(p){const F=fin().filter(inYr).filter(m=>trkOf(m,p.id));if(!F.length)return"";const avg=(L,k)=>{const v=L.map(m=>trkOf(m,p.id)[k]).filter(x=>x!=null);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};
  const team=(k)=>{const v=[];fin().filter(inYr).forEach(m=>plAll(m).forEach(id=>{const t=trkOf(m,id);if(t&&t[k]!=null)v.push(t[k])}));return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};
  const tiles=TRK.map(([k,l,u])=>{const a=avg(F,k);if(a==null)return"";const t=team(k);const d=t!=null?a-t:null;const cl=d==null||Math.abs(d)<(t||1)*.05?"":d>0?" up":" dn";
    return `<div class="trkt"><small>${l}</small><b class="num">${fTrk(k,a)}<em>${u&&u!=="%"?u:""}</em></b>${d!=null?`<span class="pillk${cl}">${Math.abs(d)<.05?"±0":(d>0?"+":"−")+fTrk(k,Math.abs(d)).replace("%","")+(k==="isa"?" puan":"")}</span>`:""}</div>`}).join("");
  const rec=[["km","En uzun koşu","km"],["hiz","En yüksek hız","km/s"],["tk","En çok top kapma",""],["pas","En çok pas",""]].map(([k,l,u])=>{let b=null;F.forEach(m=>{const v=trkOf(m,p.id)[k];if(v!=null&&(!b||v>b.v))b={v,m}});return b?`<div class="ln2"><span>${l}</span><b class="num">${fTrk(k,b.v)}${u?" "+u:""} <span class="muted small">· ${fmtShort(b.m.date)}</span></b></div>`:""}).join("");
  return `<div><h3>Saha verileri</h3><p class="muted small" style="margin:2px 0 8px">Maç başına ortalama · ${F.length} maç · etiket: takım ortalamasına göre</p><div class="trkb t3">${tiles}</div>${rec?`<div class="trkrec">${rec}</div>`:""}</div>`}
// lig: saha verileri sekmesi (Akıllı Saha sıralamaları)
const SAHA_G=[["Fizik",["km","hiz","spr","rt"]],["Pas",["pas","isa","pp"]],["Top kazanma",["tk","pa"]],["Top taşıma",["dri","pt"]]];
function viewSaha(){const F=fin().filter(inYr),TM=F.filter(trkHas);let h=oyTabs("saha");
  if(!TM.length)return h+`<section class="card"><div class="empty emp2">${empIc("grafik","green")}<h3>Henüz saha verisi yok</h3><p>Akıllı Saha'dan koşu, pas, hız, top kapma ve reyting verileri girildikçe sıralamalar burada görünür.</p></div></section>`;
  const last=TM[TM.length-1];const mode=S.f.sahaM==="sez"?"sez":"son";const nm=TM.length,need=nm<3?1:2;
  const tm=id=>plOf(last,"A").includes(id)?"A":plOf(last,"B").includes(id)?"B":null;
  let rows;// [id,{k:v},sub]
  if(mode==="son")rows=plAll(last).filter(id=>trkOf(last,id)&&P(id)).map(id=>[id,trkOf(last,id),tm(id)]);
  else{const T={};TM.forEach(m=>plAll(m).forEach(id=>{const t=trkOf(m,id);if(!t||!P(id)||P(id).guest)return;const o=T[id]||(T[id]={n:0,s:{},c:{}});o.n++;TRK.forEach(([k])=>{if(t[k]!=null){o.s[k]=(o.s[k]||0)+ +t[k];o.c[k]=(o.c[k]||0)+1}})}));
    rows=Object.entries(T).filter(([,o])=>o.n>=need).map(([id,o])=>[id,Object.fromEntries(Object.keys(o.s).map(k=>[k,o.s[k]/o.c[k]])),o.n])}
  const unit=k=>({km:"km",hiz:"km/s"})[k]||"";const pct=k=>k==="isa";
  const fv=(k,v)=>(pct(k)?"%":"")+fTrk(k,v).replace(/^%/,"");
  const avail=TRK.map(([k])=>k).filter(k=>rows.some(r=>r[1][k]!=null));
  const ini=id=>{const x=photoOf(id);return x?`<img src="${esc(x)}" alt="">`:esc(initials(nameOf(id)))};
  const subOf=x=>mode==="son"?(x?esc(nmOf(last,x)):""):x+" maç";
  const LK=k=>rows.filter(r=>r[1][k]!=null).sort((a,b)=>b[1][k]-a[1][k]||nameOf(a[0]).localeCompare(nameOf(b[0]),"tr"));
  const segM=`<div class="mzseg shm" role="group" aria-label="Dönem">${[["son","Son maç"],["sez","Sezon"]].map(([k,l])=>`<button data-act="tog1" data-k="sahaM" data-v="${k}" class="${mode===k?"on":""}" aria-pressed="${mode===k}">${l}</button>`).join("")}</div>`;
  // Krallar'daki liste kartı
  const board=(k)=>{const A=LK(k);if(!A.length)return"";const bk="bxs_"+k;const open=!!S.f[bk];const more=A.length>3;
    return `<section class="card tsb"><${more?`button class="tsh" data-act="tog" data-k="${bk}" aria-expanded="${open}"`:'h3 class="tsh"'}>${esc(TRKN[k].l)}${more?`<i class="${open?"op":""}">${CHV}</i>`:""}</${more?"button":"h3"}><ol>${A.slice(0,open?A.length:3).map(([id,o,x],i)=>`<li data-act="open" data-id="${esc(id)}"><span class="tsr num">${i+1}</span><span class="tsp ${tierOf(ovrOf(id))}${photoOf(id)?"":" ni"}">${ini(id)}</span><span class="tsn"><b>${esc(nameOf(id))}</b><small>${subOf(x)}</small></span><b class="tsv num">${fv(k,o[k])}${unit(k)?" "+unit(k):""}</b></li>`).join("")}</ol></section>`};
  {// Mevkiler sekmesiyle aynı düzen: ikonlu grup sekmeleri + grup içindeki her veri için liste kartı
    const GI={Fizik:["simsek","#00E58A"],Pas:["krampon","#5FE3F5"],"Top kazanma":["kalkan","#FFD400"],"Top taşıma":["top","#FF3EA5"]};
    const G=SAHA_G.filter(([,ks])=>ks.some(k=>avail.includes(k)));const g=G.find(x=>x[0]===S.f.sahaG)||G[0];
    h+=`<div class="mzf">${segM}</div><div class="pr-s" role="tablist" aria-label="Veri grupları">${G.map(([t])=>`<button role="tab" aria-selected="${t===g[0]}" class="${t===g[0]?"on":""}" data-act="tog1" data-k="sahaG" data-v="${esc(t)}" style="--c:${GI[t][1]}"><i class="dit">${dIcon(GI[t][0],GI[t][1],26)}</i>${esc(t)}</button>`).join("")}</div>`;
    h+=`<div class="boards">${g[1].filter(k=>avail.includes(k)).map(board).join("")}</div>`}
  if(S.admin&&mode==="son")h+=`<button class="btn ghost sm" data-act="trkOpen" data-id="${esc(last.id)}">Son maçın verilerini düzenle</button>`;
  return h}
function resultPanel(m,...r){return inM(m,()=>_resultPanel(m))}
function _resultPanel(m,only){
  const inf=S.mInfo[m.id]||{pts:{},totw:[]};const pl=plAll(m);const stt=m.stats||{};const M=esc(m.id);
  const scorers=pl.filter(id=>(+stt[id]?.g||0)>0);const sa=+m.score_a||0,sb=+m.score_b||0;
  const tab0=S.f.mtab||"ozet";const tab=only||({kadro:"ozet",oy:"notlar",ist:"notlar",deg:"notlar"}[tab0]||tab0);const T=k=>plOf(m,k);
  const avgN=k=>{const v=T(k).map(id=>inf.pts[id]?.pts).filter(x=>x!=null);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};
  const mt=Object.values(inf.pts).find(Boolean)?.mt||"";const dot2=k=>crest(k==="A"?TEAM.A:TEAM.B,k,15);
  const d0=parseYmd(m.date);const capOf=k=>{const id=k==="A"?m.cap_a:m.cap_b;const ok=id&&P(id);const ph=ok&&photoOf(id);
    return `<div class="maft${(k==="A"?sa>sb:sb>sa)?" win":""}"><span class="mafcap${ok?"":" crw"}">${ok?(ph?`<img src="${esc(ph)}" alt="">`:`<i>${esc(initials(nameOf(id)))}</i>`):crest(TEAM[k],k,64,TEAM[k==="A"?"B":"A"])}</span><b style="font-size:${mafFs(TEAM[k])}">${esc(TEAM[k])}</b></div>`};
  const gl=k=>T(k).filter(id=>(+stt[id]?.g||0)>0).sort((x,y)=>stt[y].g-stt[x].g).map(id=>`<span>${esc(shortName(nameOf(id)))} · ${stt[id].g} gol</span>`).join("");
  const cpn=k=>{const id=k==="A"?m.cap_a:m.cap_b;return id&&P(id)?" · KPT "+esc(shortName(nameOf(id))):""};
  let h=`<section class="maf mres"><div class="mafh"><span>${GKISA[d0.getDay()]} ${d0.getDate()} ${AYLAR[d0.getMonth()].toLocaleUpperCase("tr")}${S.settings.field_name?" · "+esc(S.settings.field_name).toLocaleUpperCase("tr"):""}</span>${S.admin?`<button class="mafbtn" data-act="mngOpen" data-id="${M}">Yönet</button>`:`<span>MAÇ SONU</span>`}</div>
    <div class="mafm">${capOf("A")}<div class="mafc"><span>${esc(mt||(sa===sb?"Beraberlik":"Maç sonu"))}</span><b class="num">${sa}<i>–</i>${sb}</b></div>${capOf("B")}</div>
    </section>${only||!S.mInfo[m.id]?"":bultenRow(m)}
    <section class="card mdet">
    ${S.admin&&S.f.delMatch===m.id?`<div class="note warn">Maç ve kartlara etkisi tamamen silinir.</div>`:""}
    <div class="mtabs" role="tablist">${[["ozet","Özet"],["notlar","Notlar"],...(trkHas(m)||S.admin?[["saha","Saha"]]:[]),...(isMember()&&!S.fol&&!tahminYok()?[["tahmin","Tahmin"]]:[])].map(([k,l])=>`<button role="tab" aria-selected="${tab===k}" class="${tab===k?"on":""}" data-act="mtab" data-v="${k}">${l}</button>`).join("")}</div>`;
  if(only)h="";
  if(tab==="ozet"){
    const mo=inf.motm;const r=mo&&inf.pts[mo];
    if(mo){const ph=photoOf(mo);const kl=r&&r.role==="KL";
      h+=`<button class="motmc" data-act="open" data-id="${esc(mo)}"><span class="mph">${ph?`<img src="${esc(ph)}" alt="">`:P(mo)?avatar(P(mo)):""}</span>
        <span class="mmi"><span class="eyebrow">Maçın Adamı</span>${r?`<span class="nt ${noteCls(r.pts)}">★ ${fN(r.pts)}</span>`:""}<b>${esc(nameOf(mo))}</b><span class="muted small">${dot2(r?r.side:"A")}${esc(TEAM[r?r.side:"A"])}${r?" · "+ROLE_NAME[r.role]:""}</span></span>
        <span class="mms">${kl?`<span><small>Yenilen</small><b>${r.op}</b></span>`:`<span><small>Gol</small><b>${+stt[mo]?.g||0}</b></span>`}<span><small>Asist</small><b>${+stt[mo]?.a||0}</b></span></span></button>`}
    h+=`<div class="awards two"><div class="aw"><span>Haftanın Golü</span><b>${inf.gol?esc(shortName(nameOf(inf.gol))):"—"}</b></div><div class="aw"><span>Fiyasko</span><b>${inf.fiy?esc(shortName(nameOf(inf.fiy))):"—"}</b></div></div>`;
    // olaylar: her oyuncu bir kez, yaptığı işler ikon ve sayıyla
    const used=new Set();const evs=k=>T(k).map(id=>{const o=stt[id]||{};const it=[];const add=(n,ic,cls,t)=>{if(n>0){used.add(t);it.push(`<span class="evi ${cls}" title="${t}">${ic}${n>1?`<small>×${n}</small>`:""}</span>`)}};
        add((+o.g||0)-Math.min(+o.pg||0,+o.g||0),"⚽","g","Gol");add(Math.min(+o.pg||0,+o.g||0),'<span class="pkb">⚽<b>P</b></span>',"g","Penaltı golü");add(+o.a||0,"👟","a","Asist");add(+o.cl||0,"🛡️","c","Çizgiden çıkardı");add(+o.ps||0,"🧤","c","Penaltı kurtardı");add(+o.pm||0,'<span class="pkb">⚽<b>✕</b></span>',"og","Penaltı kaçırdı");add(+o.pen||0,"P","p","Penaltı yaptırdı");add(+o.og||0,"⚽","og","Kendi kalesine");
        return it.length?{id,w:(+o.g||0)*10+(+o.a||0)*3+(+o.cl||0)+(+o.ps||0),h:`<div class="evp"><span class="evn">${esc(shortName(nameOf(id)))}</span><span class="evs">${it.join("")}</span></div>`}:null}).filter(Boolean).sort((a,b)=>b.w-a.w).map(x=>x.h).join("");
    const eA=evs("A"),eB=evs("B");
    if(eA||eB)h+=`<div class="evg"><div class="evc"><div class="evt">${dot2("A")}${esc(TEAM.A)}</div>${eA||'<span class="muted small">—</span>'}</div><div class="evc"><div class="evt">${dot2("B")}${esc(TEAM.B)}</div>${eB||'<span class="muted small">—</span>'}</div></div>
      ${(()=>{const L=[["Gol","⚽ gol"],["Penaltı golü",'<span class="pkb">⚽<b>P</b></span> penaltı golü'],["Asist","👟 asist"],["Çizgiden çıkardı","🛡️ çizgiden çıkarma"],["Penaltı kurtardı","🧤 penaltı kurtardı"],["Penaltı kaçırdı",'<span class="pkb">⚽<b>✕</b></span> penaltı kaçırdı'],["Penaltı yaptırdı",'<b class="evi p">P</b> penaltı yaptırdı'],["Kendi kalesine",'<b class="evi og">⚽</b> kendi kalesine']].filter(x=>used.has(x[0])&&!["Gol","Asist"].includes(x[0]));return L.length?`<div class="evleg">${L.map(x=>`<span>${x[1]}</span>`).join("")}</div>`:""})()}`;
    if(inf.totw.length)h+=`<div><div class="eyebrow">Haftanın takımı${inf.totw.form?" · "+esc(inf.totw.form):""}</div><div class="twg">${inf.totw.map(id=>{const p=P(id);if(!p)return"";const r=inf.pts[id];return `<button class="twc" data-act="open" data-id="${esc(id)}">${avatar(p)}<b>${esc(shortName(p.name))}</b>${r?`<i class="nt ${noteCls(r.pts)}">${inf.motm===id?"★":""}${fN(r.pts)}</i>`:""}<small>${esc((inf.totw.slot||{})[id]||"")}</small></button>`}).join("")}</div></div>`;
    if(S.admin){const o=(list,cur)=>`<option value="">Seçilmedi</option>`+list.map(id=>`<option value="${esc(id)}"${cur===id?" selected":""}>${esc(nameOf(id))}</option>`).join("");
      h+=`<details><summary class="small">Ödülleri değiştir <span class="chip warn" style="margin-left:6px">Yönetici</span></summary><div class="grid2" style="margin-top:10px"><label class="f">⚽ Haftanın Golü<select data-act-change="awR" data-k="gol" data-m="${M}">${o(scorers,m.gol_id||"")}</select></label><label class="f">🙈 Haftanın Fiyaskosu<select data-act-change="awR" data-k="fiy" data-m="${M}">${o(pl,m.fiy_id||"")}</select></label></div></details>`}
  }else if(tab==="kadro"){h+=`<div style="display:grid;gap:12px">${teamsView(m)}</div>`}
  else if(tab==="saha"){h+=`<div style="display:grid;gap:12px">${trkPanel(m)}</div>`}
  else if(tab==="oy")h+=voteResults(m,inf);
  else if(tab==="tahmin")h+=macTahmin(m);
  else if(tab==="deg"){const any=pl.some(id=>NOTE.perf[+stt[id]?.k]);
    if(!any)h+=`<div class="empty emp2">${empIc("yildiz","gold")}<h3>Henüz değerlendirme yok</h3><p>Yönetici maçtan sonra oyuncuları çok iyi, iyi, orta ve kötü olarak ayırınca burada görünür.</p>${S.admin?`<button class="btn primary" data-act="evalOpen" data-id="${M}">Değerlendir</button>`:""}</div>`;
    else h+=`<div class="degs">${[1,2,3,4].map(v=>{const ids=pl.filter(id=>+stt[id]?.k===v).sort((a,b)=>(inf.pts[b]?.pts||0)-(inf.pts[a]?.pts||0));
      return `<div class="degc"><div class="degh"><span class="pfc p${v}">${NOTE.perf[v][1]}</span><span class="muted small">${ids.length} kişi · ${NOTE.perf[v][0]?"not "+(NOTE.perf[v][0]>0?"+":"−")+fN(Math.abs(NOTE.perf[v][0])):"notu etkilemez"}</span></div>
        ${ids.map(id=>{const r=inf.pts[id];return `<button class="degr" data-act="open" data-id="${esc(id)}">${P(id)?avatar(P(id),"sm"):""}<span class="degn"><b>${esc(nameOf(id))}</b><span class="muted small">${r?dot2(r.side)+esc(TEAM[r.side])+" · "+ROLE_NAME[r.role]:""}</span></span>${r?`<span class="nt ${noteCls(r.pts)}">${fN(r.pts)}</span>`:""}</button>`}).join("")||'<span class="muted small">—</span>'}</div>`}).join("")}</div>
      ${S.admin?`<button class="btn ghost sm" data-act="evalOpen" data-id="${M}">Değerlendirmeyi düzenle</button>`:""}`}
  else if(tab==="notlar"){
    const r1=id=>Math.round(inf.pts[id].pts*10);const ranked=pl.filter(id=>inf.pts[id]).sort((a,b)=>r1(b)-r1(a)||(inf.pts[a].pk||9)-(inf.pts[b].pk||9)||inf.pts[b].pts-inf.pts[a].pts);
    h+=`<div class="nlist">`+ranked.map(id=>{const r=inf.pts[id];const hh=(S.stats[id]?.hist||[]).find(x=>x.m.id===m.id);const od=hh?hh.od||0:0;const chs=hh?chText(hh.ch):"";
      const sub=[r.g?r.g+" gol":"",r.a?r.a+" asist":"",inf.motm===id?"★ Maçın Adamı":"",inf.gol===id?"Haftanın Golü":"",inf.fiy===id?"Fiyasko":""].filter(Boolean).join(" · ");
      return `<details class="nrow"><summary><span class="nrl">${dot2(r.side)}<small>${r.role}</small></span><span class="nrn"><b>${esc(shortName(nameOf(id)))}</b>${NOTE.perf[r.pk]?`<span class="pfc p${r.pk}">${NOTE.perf[r.pk][1]}</span>`:""}${sub?`<small>${sub}</small>`:""}</span>${od?`<span class="nrd ${od>0?"up":"dn"}">${od>0?"▲":"▼"}${Math.abs(od)}</span>`:"<span></span>"}<span class="nt ${noteCls(r.pts)}">${fN(r.pts)}</span></summary>
        <div class="nrb"><div class="nrp">${r.parts.map(([l,v])=>`<span class="${v>0?"pos":"neg"}">${esc(l)} <b>${v>0?"+"+fN(v):"−"+fN(-v)}</b></span>`).join("")||"<span>Ortalama maç</span>"}</div>
        ${(r.g||r.a)&&r.gf&&r.gf!==1?`<p class="muted small">${esc(r.mt||"")}, ${sa+sb} gol: gol/asist ×${String(r.gf).replace(".",",")}</p>`:""}${trkChips(m,id,r)}${chs?`<p class="muted small">Karta etkisi: ${chs}</p>`:""}</div></details>`}).join("")+`</div>`+(S.admin&&!vOn(m)?`<button class="btn ghost sm" data-act="evalOpen" data-id="${M}">${pl.some(id=>NOTE.perf[+stt[id]?.k])?"Değerlendirmeyi düzenle":"Oyuncuları değerlendir"}</button>`:"")}
  else{
    const sum=(k,f)=>T(k).reduce((q,id)=>q+f(id),0);const cnt=(k,f)=>T(k).filter(f).length;
    const rows=[["Gol",sa,sb],["Asist",sum("A",id=>+stt[id]?.a||0),sum("B",id=>+stt[id]?.a||0)],
      ["Gol katkısı veren",cnt("A",id=>(+stt[id]?.g||0)+(+stt[id]?.a||0)>0),cnt("B",id=>(+stt[id]?.g||0)+(+stt[id]?.a||0)>0)],
      ["Ortalama not",avgN("A"),avgN("B"),fN],["En yüksek not",Math.max(0,...T("A").map(id=>inf.pts[id]?.pts||0)),Math.max(0,...T("B").map(id=>inf.pts[id]?.pts||0)),fN],
      ["Ortalama kart",sumAvg(T("A")),sumAvg(T("B"))],["Haftanın Takımı",cnt("A",id=>inf.totw.includes(id)),cnt("B",id=>inf.totw.includes(id))],
      ["Çok iyi + iyi",cnt("A",id=>[1,2].includes(+stt[id]?.k)),cnt("B",id=>[1,2].includes(+stt[id]?.k))],
      ["Çizgiden çıkarma",sum("A",id=>+stt[id]?.cl||0),sum("B",id=>+stt[id]?.cl||0)],["Penaltı golü",sum("A",id=>Math.min(+stt[id]?.pg||0,+stt[id]?.g||0)),sum("B",id=>Math.min(+stt[id]?.pg||0,+stt[id]?.g||0))],["Penaltı kaçırma",sum("A",id=>+stt[id]?.pm||0),sum("B",id=>+stt[id]?.pm||0)],["Penaltı kurtarma",sum("A",id=>+stt[id]?.ps||0),sum("B",id=>+stt[id]?.ps||0)],["Penaltı yaptırma",sum("A",id=>+stt[id]?.pen||0),sum("B",id=>+stt[id]?.pen||0)],
      ["Kendi kalesine",sum("A",id=>+stt[id]?.og||0),sum("B",id=>+stt[id]?.og||0)]];
    h+=`<div class="mstat"><div class="msth"><span>${dot2("A")}${esc(TEAM.A)}</span><span>${dot2("B")}${esc(TEAM.B)}</span></div>${rows.filter(([l,x,y])=>(x||y)||["Gol","Asist","Ortalama not","Ortalama kart"].includes(l)).map(([l,x,y,f])=>{x=x||0;y=y||0;const t=x+y||1;const F=f||(v=>v);
      return `<div class="msr"><div class="msl"><b class="num${x>y?" hi":""}">${F(x)}</b><span>${l}</span><b class="num${y>x?" hi":""}">${F(y)}</b></div><div class="msb"><span class="l"><i style="width:${x/t*100}%"></i></span><span class="r"><i style="width:${y/t*100}%"></i></span></div></div>`}).join("")}</div>`}
  if(only)return h;
  // sade dört sekme: kadro Özet'in, oylama ve takım istatistikleri Notlar'ın altında açılır
  if(tab==="ozet")h+=`<details class="mdx"${tab0==="kadro"?" open":""}><summary>Kadro ve diziliş</summary>${_resultPanel(m,"kadro")}</details>`;
  if(tab==="notlar")h+=(vOn(m)?(m.vsum&&m.vote_closed_at?`<button class="btn block mdx-b" data-act="oySonuc" data-id="${M}">Oylama sonuçları</button>`:`<details class="mdx"${tab0==="oy"?" open":""}><summary>Oylama sonuçları</summary>${_resultPanel(m,"oy")}</details>`):"")+`<details class="mdx"${tab0==="ist"?" open":""}><summary>Takım istatistikleri</summary>${_resultPanel(m,"ist")}</details>`;
  return h+`</section>`;
}
// maç detayı: o maçın tahminleri
function macTahmin(m){const W=BET.week[m.id];betLoad("week",m.id);const me=myPid();const L=me&&BET.lists[me];if(me&&!L)betLoad("list",me);
  if(!W)return `<p class="muted">Yükleniyor…</p>`;const rows=(W.rows||[]).filter(c=>P(c.p));const mine=L?L.rows.filter(c=>c.m===m.id):[];
  if(!W.n&&!mine.length)return `<div class="empty emp2">${empIc("kupa","gold")}<h3>Bu maça tahmin yapılmadı</h3></div>`;
  const net=mine.filter(c=>c.z==="kazandi"||c.z==="kaybetti").reduce((a,c)=>a+((c.py||0)-c.st),0);
  let h=`<div class="mth"><div><b class="num">${W.n||0}</b><span>tahmin</span></div><div><b class="num">${W.won||0}</b><span>tuttu</span></div>${mine.length?`<div><b class="num ${net>0?"pos":net<0?"neg":""}">${net>0?"+":net<0?"−":""}${fJ(Math.abs(net))}</b><span>senin netin</span></div>`:""}</div>`;
  if(rows.length)h+=`<div class="eyebrow">En çok kazandıranlar</div><div class="mtl">${rows.slice(0,5).map(c=>`<div class="mtr">${avatar(P(c.p),"sm")}<span><b>${esc(shortName(nameOf(c.p)))}</b><small>${esc(betCTitle(c))} · oran ${fO(c.odd)}</small></span><em class="num">+${fJ((c.py||0)-c.st)}</em></div>`).join("")}</div>`;
  return h+`<button class="btn block" data-act="thkGo" data-v="sira">Tahmin sıralaması</button><p class="muted small" style="text-align:center;margin:8px 0 0">Sikke temsilidir. Para yok, bahis değil.</p>`}
function spiker(m,inf){const up=x=>"\u0001"+String(x||"")+"\u0002";const sc=t=>{let o=String(t).split(/(\u0001[^\u0002]*\u0002)/).map(q=>q.startsWith("\u0001")?q.slice(1,-1):q.toLocaleLowerCase("tr-TR")).join("");o=o.replace(/trıck/g,"trick");return o.charAt(0).toLocaleUpperCase("tr-TR")+o.slice(1)};const clr=t=>String(t).replace(/[\u0001\u0002]/g,"");
  const r=hash(m.id);const pick=arr=>arr[r%arr.length];const sa=+m.score_a||0,sb=+m.score_b||0;const stt=m.stats||{};
  const W=sa>sb?"A":sb>sa?"B":null;const Lz=W==="A"?"B":"A";const diff=Math.abs(sa-sb);
  const pl=plAll(m);
  const top=pl.filter(id=>+stt[id]?.g).sort((a,b)=>(+stt[b].g)-(+stt[a].g))[0];const tg=top?+stt[top].g:0;
  const ast=pl.filter(id=>+stt[id]?.a).sort((a,b)=>(+stt[b].a)-(+stt[a].a))[0];const N=id=>nameOf(id);
  let head;
  if(tg>=3)head=pick([`${up(N(top))} GECEYE DAMGA VURDU`,`${up(N(top))} DURDURULAMADI: ${tg} GOL`,`HAT-TRICK ALARMI: ${up(N(top))}`]);
  else if(!W)head=pick([`DOSTLAR ALIŞVERİŞTE GÖRSÜN: ${sa}-${sb}`,`KAZANAN YOK, KONUŞAN ÇOK`,`NEFES KESEN BERABERLİK`]);
  else if(diff>=5)head=pick([`${up(TEAM[W])} SAHAYI DÜMDÜZ ETTİ`,`${up(TEAM[Lz])} İÇİN KARA GECE`,`FARK ${diff}: ${up(TEAM[W])} ACIMADI`]);
  else if(diff===1)head=pick([`TEK FARK, BÜYÜK SEVİNÇ`,`${up(TEAM[W])} SON SÖZÜ SÖYLEDİ`,`NEFESLER TUTULDU, ${up(TEAM[W])} GÜLDÜ`]);
  else head=pick([`${up(TEAM[W])} GÜLEN TARAF OLDU`,`${up(TEAM[W])} İŞİNİ BİLDİ`,`ZAFER: ${up(TEAM[W])}`]);
  const fld=S.settings.field_name?S.settings.field_name+" sahasında":"sahada";
  let body=`${fmtDate(m.date)} akşamı ${fld} oynanan karşılaşma ${W?`${TEAM[W]} takımının ${Math.max(sa,sb)}-${Math.min(sa,sb)} galibiyetiyle`:`${sa}-${sb} beraberlikle`} sona erdi. `;
  if(top)body+=tg>=3?`Gecenin yıldızı ${tg} golle ${N(top)} oldu; rakip savunma bu ismi uzun süre unutmayacak. `:`Gol yollarında en etkili isim ${tg} golle ${N(top)} oldu. `;
  if(ast)body+=`${N(ast)} ${+stt[ast].a} asistle oyunun beyni görevini üstlendi. `;
  for(const k of["A","B"]){const gk=lineupOf(m,k)[0];const conc=k==="A"?sb:sa;if(gk){if(conc===0)body+=`${N(gk)} kalesini gole kapattı, tribünler ayakta. `;else if(conc>=8)body+=`${N(gk)} için zor bir geceydi: kalesinde ${conc} gol gördü. `}}
  if(inf.motm)body+=`Maçın Adamı ödülünü ${N(inf.motm)} aldı. `;
  if(inf.fiy)body+=`Haftanın Fiyaskosu ise ${N(inf.fiy)}; soyunma odasında bu konu daha çok konuşulur.`;
  return `<span class="eyebrow">Spiker</span><strong>${esc(sc(head))}</strong>${esc(clr(body).trim())}`;
}

/* ================= Kimya, karşılaştırma ================= */
function chemHtml(p){const others=S.players.filter(q=>q.id!==p.id);
  const mates=others.map(q=>({q,o:togOf(p.id,q.id)})).filter(x=>x.o.n>=2).sort((a,b)=>b.o.W/b.o.n-a.o.W/a.o.n||b.o.n-a.o.n).slice(0,3);
  const rivals=others.map(q=>({q,o:vsOf(p.id,q.id)})).filter(x=>x.o.n>=2).sort((a,b)=>b.o.n-a.o.n||(b.o.b-b.o.a)-(a.o.b-a.o.a)).slice(0,3);
  const D=Object.entries(S.duo||{}).map(([k,n])=>({a:k.split(">")[0],b:k.split(">")[1],n}));
  const fed=D.filter(x=>x.b===p.id&&P(x.a)).sort((x,y)=>y.n-x.n).slice(0,3),gave=D.filter(x=>x.a===p.id&&P(x.b)).sort((x,y)=>y.n-x.n).slice(0,3);
  const duoH=(fed.length||gave.length)?`<div class="chg"><span class="eyebrow">Gol–asist ortakları</span>${gave.map(x=>`<button class="chr" data-act="cmpPair" data-a="${esc(p.id)}" data-b="${esc(x.b)}"><span>Pas verdiği: ${esc(nameOf(x.b))}</span><b class="num">${x.n}</b><i class="muted small">gol</i></button>`).join("")}${fed.map(x=>`<button class="chr" data-act="cmpPair" data-a="${esc(p.id)}" data-b="${esc(x.a)}"><span>Pas aldığı: ${esc(nameOf(x.a))}</span><b class="num">${x.n}</b><i class="muted small">gol</i></button>`).join("")}</div>`:"";
  if(!mates.length&&!rivals.length&&!duoH)return"";
  const bar=o=>`<span class="pares sm">${o.a?`<i class="w" style="flex:${o.a}"></i>`:""}${o.d?`<i class="d" style="flex:${o.d}"></i>`:""}${o.b?`<i class="l" style="flex:${o.b}"></i>`:""}</span>`;
  const sn=id=>esc(shortName(nameOf(id))),me=esc(shortName(p.name));
  return `${mates.length?`<div><h3>En iyi ortakları</h3><div class="pamt">${mates.map(x=>`<button class="pamc" data-act="cmpPair" data-a="${esc(p.id)}" data-b="${esc(x.q.id)}">${avatar(x.q)}<span><b>${esc(x.q.name)}</b><small>${x.o.n} maçta ${x.o.W} G</small></span><em class="num">%${Math.round(x.o.W/x.o.n*100)}</em></button>`).join("")}</div></div>`:""}
    ${rivals.length?`<div><h3>Ezeli rakipleri</h3><div class="parv">${rivals.map(x=>`<button class="parr" data-act="cmpPair" data-a="${esc(p.id)}" data-b="${esc(x.q.id)}">${avatar(x.q)}<span><b>${esc(x.q.name)}</b><small>${x.o.n} maç · ${x.o.a}-${x.o.d}-${x.o.b}</small></span>${bar(x.o)}</button>`).join("")}</div></div>`:""}
`}
function radar(pa,pb){const set=attrSet(pa.pos);const N=set.length,C=110,Rr=78;const sa=S.stats[pa.id]?.attrs||{},sb=pb?S.stats[pb.id]?.attrs||{}:{};
  const pt=(i,v)=>{const ang=-Math.PI/2+i*2*Math.PI/N;const r=Rr*clamp((v-30)/69,0,1);return[C+r*Math.cos(ang),C+r*Math.sin(ang)]};
  const poly=a=>set.map(([k],i)=>pt(i,+a[k]||30).map(x=>x.toFixed(1)).join(",")).join(" ");
  const rings=[.25,.5,.75,1].map(f=>`<polygon points="${set.map((_,i)=>{const ang=-Math.PI/2+i*2*Math.PI/N;return (C+Rr*f*Math.cos(ang)).toFixed(1)+","+(C+Rr*f*Math.sin(ang)).toFixed(1)}).join(" ")}" fill="none" stroke="var(--line2)"/>`).join("");
  const labels=set.map(([k,l],i)=>{const ang=-Math.PI/2+i*2*Math.PI/N;const x=C+(Rr+18)*Math.cos(ang),y=C+(Rr+18)*Math.sin(ang);return `<text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="middle">${l}</text>`}).join("");
  return `<svg class="radar" viewBox="0 0 220 220" role="img" aria-label="Özellik karşılaştırması">${rings}${labels}<polygon points="${poly(sa)}" fill="rgba(255,62,165,.25)" stroke="#C6F432" stroke-width="2"/>${pb?`<polygon points="${poly(sb)}" fill="rgba(139,108,255,.25)" stroke="#8B6CFF" stroke-width="2"/>`:""}</svg>`}
function sheetCmp(){const c=S.sheet;const pa=P(c.a),pb=P(c.b);
  const opts=v=>`<option value="">Oyuncu seç</option>${S.players.filter(q=>!q.guest&&(S.stats[q.id]?.games||0)>0).map(q=>`<option value="${esc(q.id)}"${v===q.id?" selected":""}>${esc(q.name)}</option>`).join("")}`;
  const half=(q,k)=>{const ph=q?photoOf(q.id):null;return `<label class="cv-s cv-${k}"><span class="cv-o">${q?`<b class="num">${ovrOf(q.id)}</b><small>${eposOf(q)}</small>`:'<b class="num">?</b>'}</span><span class="cv-p">${ph?`<img src="${esc(ph)}" alt="">`:SILH}</span><span class="cv-n">${q?esc(shortName(q.name)):"Oyuncu seç"}${CHVD}</span><select data-cmp="${k}" aria-label="${k==="a"?"Birinci":"İkinci"} oyuncu">${opts(k==="a"?c.a:c.b)}</select></label>`};
  let h=`<div class="ch"><h2>Karşılaştır</h2><button class="mzic" data-act="close" aria-label="Kapat">${ICON.x}</button></div><div class="cv-h">${half(pa,"a")}${half(pb,"b")}<span class="cv-vs">VS</span></div>`;
  if(!pa||!pb)return h;
  const A=S.stats[pa.id]||{},B=S.stats[pb.id]||{};const same=(pa.pos==="Kaleci")===(pb.pos==="Kaleci");
  const row=(l,x,y,lowBetter,fmt)=>{const f=fmt||(v=>v??"–");const bx=x!=null&&y!=null&&(lowBetter?x<y:x>y),by=x!=null&&y!=null&&(lowBetter?y<x:y>x);const mx=Math.max(Math.abs(x||0),Math.abs(y||0))||1;
    return `<div class="cv-r"><b class="num${bx?" w":""}">${f(x)}</b><span class="cv-b l"><i class="${bx?"w":""}" style="width:${Math.round(Math.abs(x||0)/mx*100)}%"></i></span><span class="cv-l">${l}</span><span class="cv-b r"><i class="${by?"w":""}" style="width:${Math.round(Math.abs(y||0)/mx*100)}%"></i></span><b class="num${by?" w":""}">${f(y)}</b></div>`};
  if(same){const AS=attrSet(pa.pos);let wa=0,wb=0;const ra=AS.map(([k,l,full])=>{const x=+(A.attrs?.[k]??mainVal(pa.attrs||{},k,pa.pos)),y=+(B.attrs?.[k]??mainVal(pb.attrs||{},k,pb.pos));if(x>y)wa++;else if(y>x)wb++;
      const mx=100;return `<div class="cv-r"><b class="num${x>y?" w":""}">${x}</b><span class="cv-b l"><i class="${x>y?"w":""}" style="width:${x}%"></i></span><span class="cv-l">${esc(full).toLocaleUpperCase("tr")}</span><span class="cv-b r"><i class="${y>x?"w":""}" style="width:${y}%"></i></span><b class="num${y>x?" w":""}">${y}</b></div>`}).join("");
    const lead=wa===wb?"Özelliklerde eşitler":`${esc(firstName(wa>wb?pa.name:pb.name))} ${Math.max(wa,wb)} özellikte önde, ${esc(firstName(wa>wb?pb.name:pa.name))} ${Math.min(wa,wb)}'${Math.min(wa,wb)===3||Math.min(wa,wb)===4||Math.min(wa,wb)===5?"te":"de"}`;
    h+=`<div class="cv-sum"><span class="cv-d ${wa>=wb?"a":"b"}"></span><span>${lead}</span><b class="num"><i class="a">${wa}</i> – <i class="b">${wb}</i></b></div><div class="cv-t">${row("REYTİNG",A.ovr,B.ovr)}${ra}</div>`}
  else h+=`<p class="muted small">Biri kaleci olduğu için özellikler karşılaştırılamıyor.</p>`;
  const pct=s=>s.games?Math.round(s.W/s.games*100):null;
  h+=`<h3 class="cv-hh">Maç istatistikleri</h3><div class="cv-t cmpt">${row("Maç",A.games||0,B.games||0)}${row("Gol",A.goals||0,B.goals||0)}${row("Asist",A.ast||0,B.ast||0)}${row("Gol + asist",(A.goals||0)+(A.ast||0),(B.goals||0)+(B.ast||0))}${row("Galibiyet",A.W||0,B.W||0)}${row("Kazanma",pct(A),pct(B),false,v=>v==null?"–":"%"+v)}${row("Ort. not",A.avgPts!=null?+A.avgPts.toFixed(1):null,B.avgPts!=null?+B.avgPts.toFixed(1):null)}${row("Maçın Adamı",A.motm||0,B.motm||0)}${row("Devam",A.att!=null?Math.round(A.att*100):null,B.att!=null?Math.round(B.att*100):null,false,v=>v==null?"–":"%"+v)}</div>`;
  const v=vsOf(pa.id,pb.id),t=togOf(pa.id,pb.id);
  h+=`<div class="grid2"><div class="aw"><span>Karşı karşıya</span>${v.n?`<b class="num">${v.a} – ${v.d} – ${v.b}</b><span class="muted small" style="text-transform:none;letter-spacing:0">${v.n} maç · ${v.a>v.b?esc(firstName(pa.name))+" önde":v.b>v.a?esc(firstName(pb.name))+" önde":"eşitlik"}</span>`:'<span class="muted small" style="text-transform:none;letter-spacing:0">Henüz karşılaşmadılar</span>'}</div>
    ${(()=>{const d1=(S.duo||{})[pa.id+">"+pb.id]||0,d2=(S.duo||{})[pb.id+">"+pa.id]||0;return d1||d2?`<div class="aw" style="grid-column:1/-1"><span>Gol–asist</span><b class="num" style="font-size:1rem">${esc(firstName(pa.name))} → ${esc(firstName(pb.name))}: ${d1} · ${esc(firstName(pb.name))} → ${esc(firstName(pa.name))}: ${d2}</b></div>`:""})()}
    <div class="aw"><span>Aynı takımda</span>${t.n?`<b class="num">${t.W}G ${t.D}B ${t.L}M</b><span class="muted small" style="text-transform:none;letter-spacing:0">${t.n} maç · %${Math.round(t.W/t.n*100)} kazanma</span>`:'<span class="muted small" style="text-transform:none;letter-spacing:0">Henüz birlikte oynamadılar</span>'}</div></div>`;
  return h}

/* ================= Tahmin ve maç önü ================= */
const predPts=(pr,m)=>{if(!pr||m.score_a==null)return 0;const a=+m.score_a,b=+m.score_b;if(+pr.a===a&&+pr.b===b)return 3;return Math.sign(+pr.a-+pr.b)===Math.sign(a-b)?1:0};
function formOf2(id){const f=S.stats[id]?.form;return f==null?null:f}
function preview(m){const A=(m.team_a||[]),B=(m.team_b||[]);if(!A.length||!B.length)return"";
  const avA=sumAvg(A),avB=sumAvg(B);const pA=Math.round(100/(1+Math.pow(10,-(avA-avB)/15)));
  const real=T=>T.filter(id=>P(id)&&!P(id).guest);
  const chem=T=>{const ids=real(T);let W=0,n=0;for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){const o=togOf(ids[i],ids[j]);W+=o.W;n+=o.n}return n?{p:Math.round(W/n*100),n}:null};
  const recent=T=>{const o={G:0,B:0,M:0,n:0};for(const id of real(T))for(const h of(S.stats[id]?.hist||[]).filter(x=>x.r).slice(-5)){o[h.r.res]++;o.n++}return o.n?o:null};
  const inForm=T=>real(T).filter(id=>formOf2(id)!=null).sort((a,b)=>formOf2(b)-formOf2(a)).slice(0,2);
  const key=T=>real(T).sort((a,b)=>(ovrOf(b)+(formOf2(b)||6.5)*.6)-(ovrOf(a)+(formOf2(a)||6.5)*.6))[0];
  const streaks=[...real(A),...real(B)].filter(id=>S.stats[id]?.streak);
  const cap=k=>k==="A"?m.cap_a:m.cap_b;
  const col=(k,T)=>{const kp=key(T);return `<div class="pv"><div class="pvh">${k==="A"?'<span class="bibdot"></span>':'<span class="nobib"></span>'}<b>${esc(TEAM[k])}</b><span class="num">${k==="A"?avA:avB}</span></div>
    ${recent(T)?(()=>{const r=recent(T);return `<div><span class="eyebrow">Oyuncuların son maçları</span><div class="rec"><span class="g">${r.G}G</span><span class="b">${r.B}B</span><span class="m">${r.M}M</span></div><span class="muted pvs">%${Math.round(r.G/r.n*100)} galibiyet</span></div>`})():"<div></div>"}
    ${chem(T)?`<div><span class="eyebrow">Takım kimyası</span><b class="num pvn">%${chem(T).p}</b></div>`:"<div></div>"}
    ${kp?`<div class="pvk"><span class="eyebrow">Kilit oyuncu</span><button data-act="open" data-id="${esc(kp)}"><span class="pvkn">${esc(shortName(nameOf(kp)))}</span><span class="pchip">${eposOf(P(kp))}</span></button></div>`:"<div></div>"}
    ${inForm(T).length?`<div><span class="eyebrow">Formda</span>${inForm(T).map(id=>`<div class="small fm"><span>${esc(shortName(nameOf(id)))}</span><b class="num">${fN(formOf2(id))}</b></div>`).join("")}</div>`:"<div></div>"}
    ${cap(k)&&T.includes(cap(k))?`<div class="small"><span class="capi">C</span>${esc(nameOf(cap(k)))}</div>`:"<div></div>"}</div>`};
  const pk="pv_"+m.id,open=S.f[pk];const fav=pA===50?"Denk maç":`Favori ${esc(TEAM[pA>50?"A":"B"])} · %${Math.max(pA,100-pA)}`;
  if(!open)return `<button class="card pvc" data-act="tog" data-k="${pk}"><span><span class="eyebrow">Maç önü raporu</span><b>${fav}</b></span><span class="pvx">Aç ▾</span></button>`;
  return `<section class="card"><button class="pvc in" data-act="tog" data-k="${pk}"><span><span class="eyebrow">Maç önü raporu</span><b>${fav}</b></span><span class="pvx">Kapat ▴</span></button>
    ${strengthHtml(A,B,pad7(lineupOf(m,"A"),A),posArr(m,"A"),pad7(lineupOf(m,"B"),B),posArr(m,"B"))}
    <div class="pvbar"><span class="num">%${pA}</span><span class="bar2"><i style="width:${pA}%"></i></span><span class="num">%${100-pA}</span></div>
    <p class="muted small" style="margin-top:-6px;text-align:center">Kağıt üstünde ${pA===50?"iki takım denk":"favori "+esc(TEAM[pA>50?"A":"B"])} · reyting ortalamasına göre</p>
    <div class="pvg">${col("A",A)}${col("B",B)}</div>
    ${streaks.length?`<div class="small"><span class="eyebrow">Seriler</span>${streaks.map(id=>`<div>${S.stats[id].streak.hot?"🔥":"❄️"} ${esc(shortName(nameOf(id)))} · ${esc(S.stats[id].streak.t)}</div>`).join("")}</div>`:""}
    <a class="btn wa block" href="https://wa.me/?text=${encodeURIComponent(previewText(m,avA,avB,pA,chem,key,inForm,streaks,recent))}" target="_blank" rel="noopener">${ICON.wa} WhatsApp'a gönder</a></section>`}
function previewText(m,avA,avB,pA,chem,key,inForm,streaks,recent){const fld=S.settings.field_name;const d=parseYmd(m.date);
  let t=`⚽ MAÇ ÖNÜ · ${d.getDate()} ${AYLAR[d.getMonth()]} ${GUNLER[d.getDay()]} ${m.time||""}${fld?" · "+fld:""}\n\n${TEAM.A} (${avA}) vs ${TEAM.B} (${avB})\nKağıt üstünde: %${pA} – %${100-pA}\n`;
  for(const k of["A","B"]){const T=k==="A"?m.team_a:m.team_b;const kp=key(T);t+=`\n${TEAM[k]}: ${T.map(id=>shortName(nameOf(id))).join(", ")}\n`;const rc=recent(T);if(rc)t+=`Son maçları: ${rc.G}G ${rc.B}B ${rc.M}M\n`;const ch=chem(T);if(ch)t+=`Takım kimyası: %${ch.p}\n`;if(kp)t+=`Kilit oyuncu: ${nameOf(kp)}\n`;const f=inForm(T);if(f.length)t+=`Formda: ${f.map(id=>shortName(nameOf(id))).join(", ")}\n`}
  if(streaks.length)t+=`\n`+streaks.map(id=>`${S.stats[id].streak.hot?"🔥":"❄️"} ${shortName(nameOf(id))}: ${S.stats[id].streak.t}`).join("\n")+`\n`;
  t+=`\nKadro ve kartlar: ${location.origin+location.pathname}`;return t}

/* ================= Kartlar ================= */
const oyTabs=v=>`<div class="oyt2" role="tablist" aria-label="Lig">${[["lig","Puan"],["gecmis","Fikstür"],["sezon","İstatistik"]].map(([k,l])=>`<button data-act="tab" data-tab="${k}" role="tab" aria-selected="${v===k}" class="${v===k?"on":""}">${l}</button>`).join("")}<button data-act="rekTab" role="tab" aria-selected="${v==="rekor"}" class="${v==="rekor"?"on":""}">Rekorlar</button></div>`;
function viewKartlar(){
  const sort=S.f.sort||"ovr";const flt=S.filter;
  const kv=S.f.kv||LS.get("y_kv")||"list";
  const sq=S.f.sqMode?"all":(S.f.sq||"as");const nAs=S.players.filter(p=>!p.yedek).length,nYd=S.players.length-nAs;
  let ps=S.players.filter(p=>(sq==="all"||(sq==="yedek"?!!p.yedek:!p.yedek))&&(flt==="all"||flt==="as"||flt==="yedek"||p.pos===flt||(altOf(p)&&GROUP_POS[EPOS[altOf(p)][0]]===flt)));
  ps=[...ps].sort((a,b)=>sort==="mv"?mvOf(b.id)-mvOf(a.id)||genOf(b.id)-genOf(a.id):sort==="isim"?a.name.localeCompare(b.name,"tr"):sort==="form"?(S.stats[b.id]?.form??-1)-(S.stats[a.id]?.form??-1)||(S.stats[b.id]?.lastD||0)-(S.stats[a.id]?.lastD||0)||genOf(b.id)-genOf(a.id):genOf(b.id)-genOf(a.id));
  const POSL=[["all","Tümü"],["Kaleci","KL"],["Defans","DF"],["Orta saha","OS"],["Forvet","FV"]];const fv=flt==="as"||flt==="yedek"?"all":flt;
  const nonDef=sq!=="as"||sort!=="ovr";
  let h=`<div class="mzf">${`<div class="mzseg grow" role="group" aria-label="Mevki">${POSL.map(([k,l])=>`<button data-act="filter" data-v="${esc(k)}" class="${fv===k?"on":""}" aria-pressed="${fv===k}">${l}</button>`).join("")}</div>`}
    <span class="kmw"><button class="mzib${nonDef?" dot":""}" data-act="kmenu" aria-label="Görünüm ve sıralama" aria-haspopup="menu" aria-expanded="${!!S.f.kmenu}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg></button>${S.f.kmenu?`<button class="kmx" data-act="kmenu" aria-label="Menüyü kapat" tabindex="-1"></button><div class="kmenu" role="menu">
      <div class="kmh"><b>Görünüm ve sıralama</b>${nonDef?`<button data-act="kreset">Sıfırla</button>`:""}</div>
      <span class="kml">Görünüm</span><div class="kpills">${[["list","Liste"],["grid","Kart"]].map(([k,l])=>`<button data-act="kview" data-v="${k}" class="${kv===k?"on":""}" aria-pressed="${kv===k}">${l}</button>`).join("")}</div>
      <span class="kml">Kadro</span><div class="kpills">${[["as","As",nAs],["yedek","Yedek",nYd],["all","Tümü",nAs+nYd]].map(([k,l,n])=>`<button data-act="sqf" data-v="${k}" class="${sq===k?"on":""}" aria-pressed="${sq===k}">${l}<small class="num">${n}</small></button>`).join("")}</div>
      <span class="kml">Sırala</span><div class="kpills">${[["ovr","Reyting"],["mv","Değer"],["form","Form"],["isim","İsim"]].map(([k,l])=>`<button data-act="ksort" data-v="${k}" class="${sort===k?"on":""}" aria-pressed="${sort===k}">${l}</button>`).join("")}</div>
      ${S.admin?`<div class="kma"><span class="kml">Yönetici</span>${[["sqMode","yelek","pink","As / Yedek seç","Kadroyu tek ekranda düzenle"],["addSheet","kisi","green","Oyuncu ekle","Yeni oyuncu kartı aç"],...(S.all.some(p=>p.archived&&!p.guest)?[["archList","kart","lila","Çıkarılan oyuncular","Geri almak için"]]:[])].map(([a,ic,c,l,d])=>`<button role="menuitem" data-act="${a}"><span class="kmi">${dIcon(ic,c,22)}</span><span class="kmt"><b>${l}</b><small>${d}</small></span><i>${CHVR}</i></button>`).join("")}</div>`:""}</div>`:""}</span></div>`;
  if(S.admin&&S.f.sqMode)h+=`<div class="sqbar"><span><b>As / Yedek seçiliyor</b><small>${nAs} as · ${nYd} yedek</small></span><button class="btn sm primary" data-act="sqMode">Bitti</button></div>`;
  if(S.admin&&S.f.sqMode)return h+(ps.length?`<section class="card" style="gap:0">${ps.map(p=>`<div class="sqrow">${avatar(p)}<span class="sqn"><b>${esc(p.name)}</b><span class="muted small">${eposOf(p)} · ${ovrOf(p.id)}</span></span><div class="vtog" role="group" aria-label="${esc(p.name)} kadro"><button data-act="setSq" data-id="${esc(p.id)}" data-v="" class="${p.yedek?"":"on"}" aria-pressed="${!p.yedek}">As</button><button data-act="setSq" data-id="${esc(p.id)}" data-v="1" class="${p.yedek?"on":""}" aria-pressed="${!!p.yedek}">Yedek</button></div></div>`).join("")}</section>`:"");
  h+=ps.length?(kv==="grid"?`<div class="mzk">${ps.map(p=>mzCard(p)).join("")}</div>`:`<div class="mzpl">${ps.map((p,i)=>mzRow(p,i+1)).join("")}</div>`):`<section class="card"><div class="empty emp2">${empIc("kart","pink")}<h3>${S.players.length?"Bu mevkide oyuncu yok":"Kadro boş"}</h3><p>${S.admin?"İlk oyuncuyu ekle; kartı ve özellikleri hemen oluşur.":"Yönetici oyuncuları ekleyince kartlar burada görünür."}</p>${S.admin&&!S.players.length?`<button class="btn primary" data-act="addSheet">Oyuncu ekle</button>`:""}</div></section>`;
  return h;
}
function mzRow(p,rk){const s=S.stats[p.id]||{ovr:baseOf(p),lastD:0};const st=stOf(p);const o=s.ovr;const ph=photoOf(p.id);const x=STATUS[st];
  const tr=s.lastO>0?`<span class="mzpl-tr up">▲${s.lastO}</span>`:s.lastO<0?`<span class="mzpl-tr dn">▼${-s.lastO}</span>`:"";
  const srt=S.f.sort;const sub=srt==="mv"?`<span class="mzpl-mv">${fM(mvOf(p.id))}</span>${ageOf(p)!=null?`<span class="mzpl-t">${ageOf(p)} yaş</span>`:""}`:srt==="form"?formNotes(s):`${kondChip(p.id)}<span class="mzpl-t">${eposOf(p)}</span>${altOf(p)?`<span class="mzpl-t alt">${altOf(p)}</span>`:""}${p.guest?"":p.yedek?'<span class="mzpl-t yd">Yedek</span>':""}`;
  return `<button class="mzpl-r${UNAVAIL.includes(st)?" out":""}${S.me===p.id?" me":""}" data-act="open" data-id="${esc(p.id)}" aria-label="${esc(p.name)}, reyting ${o}, ${eposOf(p)}"><span class="mzpl-k num">${rk}</span><span class="mzpl-p ${o>=80?"t1":o>=75?"t2":o>=70?"t3":"t4"}">${ph?`<img src="${esc(ph)}" alt="">`:esc(initials(p.name))}</span>
    <span class="mzpl-x"><b>${esc(p.name)}</b><span class="mzpl-s">${sub}${st!=="hazir"&&x?`<span class="mzpl-t st">${x.flag} ${esc(x.label)}</span>`:""}</span></span><span class="mzpl-o"><b class="num ${o>=80?"t1":o>=75?"t2":o>=70?"t3":"t4"}">${o}</b>${tr}</span></button>`}
function mzCard(p){const s=S.stats[p.id]||{};const o=s.ovr??baseOf(p);const ph=photoOf(p.id);const st=stOf(p);
  return `<button class="mzc ${o>=80?"t1":o>=75?"t2":o>=70?"t3":"t4"}${UNAVAIL.includes(st)?" out":""}${S.me===p.id?" me":""}" data-act="open" data-id="${esc(p.id)}" aria-label="${esc(p.name)}, reyting ${o}, ${eposOf(p)}"><span class="mzc-o"><b class="num">${o}</b><small>${eposOf(p)}</small></span>${ph?`<img src="${esc(ph)}" alt="">`:`<span class="mzc-sil">${SIL}</span>`}<span class="mzc-n">${esc(shortName(p.name))}</span>${p.yedek?'<i class="mzc-y" title="Yedek kadro">Y</i>':""}${st!=="hazir"&&STATUS[st]?`<i class="mzc-st">${STATUS[st].flag}</i>`:""}</button>`}
const vcls=v=>v>=80?"v8":v>=70?"v7":v>=60?"v6":"v5";
function formNotes(s){const L=(s.hist||[]).filter(x=>x.kind==="oynadi"&&x.r&&x.r.pts!=null).slice(-5);
  return L.length?`<span class="fnts" aria-label="Son ${L.length} maç notu">${L.map(x=>`<i class="f${noteCls(x.r.pts)}">${fN(x.r.pts)}</i>`).join("")}</span>`:'<span class="muted small">Henüz maç yok</span>'}
function listRow(p,rk){
  const s=S.stats[p.id]||{ovr:baseOf(p),attrs:p.attrs||{},lastD:0};const st=stOf(p);const o=s.ovr;const ph=photoOf(p.id);const x=STATUS[st];
  const tr=s.lastO>0?`<span class="trend up">▲${s.lastO}</span>`:s.lastO<0?`<span class="trend down">▼${-s.lastO}</span>`:"";
  const flag=st!=="hazir"?`<span class="lflag ${x.cls==="bad"?"":x.cls}">${x.flag}</span>`:"";
  return `<button class="lrow${UNAVAIL.includes(st)?" out":""}${S.me===p.id?" me":""}" data-act="open" data-id="${esc(p.id)}" aria-label="${esc(p.name)}, reyting ${o}, ${eposOf(p)}">
    <span class="lth ${tierOf(o)}">${ph?`<img src="${esc(ph)}" alt="">`:SIL}</span>
    <span class="lmid"><span class="lhd"><span class="rk">${rk}</span><span class="ln">${esc(p.name)}</span></span>
      <span class="lsub">${S.f.sort==="mv"&&S.tab==="kartlar"?`<span class="mvt">${fM(mvOf(p.id))}</span>${ageOf(p)!=null?`<span class="muted small">${ageOf(p)} yaş</span>`:""}`:S.f.sort==="form"&&S.tab==="kartlar"?formNotes(s):`${kondChip(p.id)}<span class="pchip">${eposOf(p)}</span>${altOf(p)?`<span class="pchip alt">${altOf(p)}</span>`:""}${p.guest?"":p.yedek?'<span class="pchip sqc">Yedek</span>':'<span class="pchip sqa">As</span>'}`}${flag}</span></span>
    <span class="lr"><b class="num ${vcls(o)}">${o}</b>${tr}</span></button>`;
}

function sqSelect(id,bind,val){return `<label class="f" for="${id}">Kadro<select id="${id}" data-bind="${bind}"><option value=""${val?"":" selected"}>As kadro</option><option value="1"${val?" selected":""}>Yedek kadro · gelmezse kartı düşmez</option></select></label>`}
function posSelect(id,bind,val,none,skip){
  return `<select id="${id}" data-bind="${bind}">${none?`<option value=""${!val?" selected":""}>Yok</option>`:""}${Object.entries(GROUP_POS).map(([r,l])=>{const ks=EPOS_KEYS.filter(k=>EPOS[k][0]===r&&k!==skip);return ks.length?`<optgroup label="${l}">${ks.map(k=>`<option value="${k}"${val===k?" selected":""}>${k} · ${EPOS[k][1]}</option>`).join("")}</optgroup>`:""}).join("")}</select>`}
function chText(ch){if(!ch||!ch.length)return"";return ch.map(([k,v,c])=>v?`${esc(SUBN[k]||k)} ${fD(v)}`:`${esc(SUBN[k]||k)} ${c==="tavan"?"zirvede":"dipte"}`).join(" · ")}
function attrDetail(p){const a=p.attrs||{};const s=S.stats[p.id]||{};const cur=s.cur||{};
  return `<div><h3>Özellik detayları</h3><div class="attrs-grp ro" style="margin-top:8px">${attrSet(p.pos).map(([k,l,full,subs])=>{const mv=s.attrs?.[k]??mainVal(a,k,p.pos);const md=s.attrD?.[k]||0;
    return `<div class="ag"><div class="agh"><b>${l}</b><span>${full}</span><b class="num agv ${vcls(mv)}">${mv}</b>${md?`<span class="adt ${md>0?"up":"dn"}">${md>0?"+":""}${md}</span>`:""}</div>${subs.map(([sk,sl])=>{const b=subVal(a,k,sk);const c=cur[k+"_"+sk]??b;const v=Math.round(c);const dd=Math.round((c-b)*10)/10;
      return `<div class="sr2"><span>${sl}</span><i style="--w:${v}%"></i><b class="num ${vcls(v)}">${v}${Math.abs(dd)>=.5?`<small class="adt ${dd>0?"up":"dn"}">${fD(dd)}</small>`:""}</b></div>`}).join("")}</div>`}).join("")}</div>
    </div>`}
function attrInputs(prefix,pos,attrs){const AS=attrSet(pos);const cur=AS.some(x=>x[0]===S.f.agT)?S.f.agT:AS[0][0];
  return `<div class="at-g">${AS.map(([k,l])=>`<button data-act="agTab" data-v="${k}" class="${k===cur?"on":""}"><b class="num" id="${prefix}_m_${k}">${mainVal(attrs,k,pos)}</b><span>${l}</span></button>`).join("")}</div>
  <div class="at-l">${AS.filter(x=>x[0]===cur).map(([k,l,full,subs])=>`<span class="at-t">${full}</span>`+subs.map(([sk,sl])=>{const v=subVal(attrs,k,sk);const kk=k+"_"+sk;
    return `<div class="at-r"><label for="${prefix}_${kk}">${sl}</label><button data-act="atStep" data-p="${prefix}" data-k="${kk}" data-d="-1" aria-label="${sl} azalt">−</button><input id="${prefix}_${kk}" type="number" min="30" max="95" inputmode="numeric" data-attr="${prefix}" data-k="${kk}" value="${v}"><button data-act="atStep" data-p="${prefix}" data-k="${kk}" data-d="1" aria-label="${sl} artır">+</button><span class="at-b"><i data-attrbar="${prefix}" data-k="${kk}" style="width:${Math.round((v-30)/65*100)}%"></i></span></div>`}).join("")).join("")}</div>`;
}
function sheetAdd(){
  if(!S.admin)return"";const f=S.f.ap||(S.f.ap={name:"",pos:"Orta saha",epos:"MO",alt:"",yedek:"",attrs:{}});
  return `<div class="ch"><h2>Oyuncu ekle</h2><button class="btn sm" data-act="close">Kapat</button></div><form data-form="addPlayer" style="display:grid;gap:14px">
    <label class="f" for="apName">Ad soyad<input id="apName" type="text" data-bind="ap.name" value="${esc(f.name)}" required maxlength="40" autocomplete="off"></label>
    <div class="grid2"><label class="f" for="apPos">Mevki${posSelect("apPos","ap.epos",f.epos)}</label><label class="f" for="apAlt">Alternatif mevki${posSelect("apAlt","ap.alt",f.alt,true,f.epos)}</label></div>
    ${sqSelect("apSq","ap.yedek",f.yedek)}
    ${attrInputs("ap",f.pos,f.attrs)}
    <span class="muted small">Başlangıç reytingi: <b class="num" id="ap_ovr" style="color:var(--ink);font-size:1.1rem">${baseOf({pos:f.pos,epos:f.epos,attrs:f.attrs})}</b></span>
    <button class="btn primary block" type="submit">${ICON.plus} Kadroya ekle</button></form>`;
}
const LIG_SVG=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3M12 13v4M8 20h8M9.5 17h5"/></svg>`;
const LOCK_SVG=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
function viewBen(){const k=S.f.setp||"";if(k)return setSub(k);return memCard()+_viewBen()+ayarBody()+verTxt()}
const isOwner=()=>!!(S.session&&S.session.user&&S.session.user.id==="d8bac3ce-40c8-4ef7-babe-0732872cd273");
// geri tuşu / geri kaydırma: açık pencereyi ya da alt ekranı kapatır
function shHist(){try{const on=!!S.sheet||!!S.view;const st=!!(history.state&&history.state.sh);if(shHist.b)return;
  if(on&&!st)history.pushState({sh:1},"");else if(!on&&st){shHist.b=1;shHist.t=Date.now();history.back();setTimeout(()=>{shHist.b=0},500)}}catch(_){}}
addEventListener("popstate",()=>{if(shHist.b){shHist.b=0;try{const w="#"+S.tab;if(location.hash!==w&&TABS.some(x=>x[0]===S.tab))history.replaceState(null,"",location.pathname+location.search+w)}catch(_){}return}
  if(S.sheet){const c=document.querySelector('#modal [data-act="close"]');if(c)c.click();else shHist()}
  else if(S.view){const c=document.querySelector('[data-act="back"]');if(c)c.click();else{S.view=null;render(true)}}});

function verTxt(){const v=APP_V;if(!/^\d{12}$/.test(v))return"";const d=new Date(Date.UTC(2000+ +v.slice(0,2),+v.slice(2,4)-1,+v.slice(4,6),+v.slice(6,8),+v.slice(8,10)));const p=n=>String(n).padStart(2,"0");return `<p class="vtx">Sürüm ${p(d.getDate())}.${p(d.getMonth()+1)} ${p(d.getHours())}:${p(d.getMinutes())}</p>`}
function _viewBen(){const p=P(S.me);if(!p)return `<section class="card"><div class="empty emp2">${empIc("kisi","lila")}<h3>Kim olduğunu seç</h3><p>Kendi kartını, formunu ve maçlarını görmek için oyuncunu seç.</p><button class="btn primary" data-act="meSheet">Kimsin?</button></div></section>`;
  const s=S.stats[p.id]||{};const o=s.ovr??baseOf(p);const ph=photoOf(p.id);
  const yr=curYr();const F=fin().filter(m=>+m.season===+yr);let n=0,g=0,a=0;
  for(const m of F){const r=S.mInfo[m.id]?.pts?.[p.id];if(!r)continue;n++;g+=r.g||0;a+=r.a||0}
  const L=F.length?ligTable(F):[];const li=L.findIndex(x=>x.id===p.id);
  const gear='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/></svg>';
  const stK=stOf(p);
  let h=`<button class="mzme" data-act="open" data-id="${esc(p.id)}">${ph?`<span class="mzme-av ph"><img src="${esc(ph)}" alt=""></span>`:`<span class="mzme-av">${esc(initials(p.name))}</span>`}<span class="mzme-x"><b>${esc(firstName(p.name))}</b><span class="mzme-c">${esc(EPOS[eposOf(p)]?.[1]||eposOf(p))} · ${o}${li>=0?` · ligde ${li+1}.`:""}${p.yedek?" · yedek":""}</span></span><span class="mzme-k">Kartım</span></button>`;
  if(S.session&&isMember())h+=`<section class="card bdr"><b>Bu hafta durumum</b><div class="bdr-g">${[["hazir","Hazır"],["sakat","Sakat"],["hasta","Hasta"],["izinli","İzinde"]].map(([k,l])=>`<button class="${stK===k?"on":""}" data-act="myStatus" data-v="${k}" aria-pressed="${stK===k}">${l}</button>`).join("")}</div><small>${stK==="yogun"||stK==="belirsiz"?`Şu an: ${esc((STATUS[stK]||{}).label||"")}. `:""}Yönetici kadroyu kurarken bunu görür.</small></section>`;
  h+=betBenCard();
  if(!s.games)h+=`<p class="mzhint">İlk maçına çık, kartın uyanır. Notların, formun ve rozetlerin burada birikir.</p>`;
  const it=(c,i,t,sub,act,extra)=>`<button class="mzmi" data-act="${act}" ${extra||""}><span class="mzmi-i dit" style="background:${c}22">${dIcon(i,c,26)}</span><span class="mzmi-t">${t}</span><span class="mzmi-s">${sub||""}</span><span class="mzmi-c" aria-hidden="true">›</span></button>`;
  h+=`<div class="mzmn">${(!isMember()||S.admin)?it("#B9A8FF","degis","Oyuncuyu değiştir","","meSheet",""):""}</div>`;
  return h}
const trq=t=>String(t||"").toLocaleLowerCase("tr").replace(/[çğıöşü]/g,c=>({ç:"c",ğ:"g",ı:"i",ö:"o",ş:"s",ü:"u"})[c]);
function sheetMe(){
  const ps=[...S.players].sort((a,b)=>a.name.localeCompare(b.name,"tr"));
  const head=`<div class="ch"><h2>Sen kimsin?</h2><button class="mzic" data-act="close" aria-label="Kapat">${ICON.x}</button></div>`;
  if(!ps.length)return head+`<div class="empty emp2">${empIc("kisi","lila")}<h3>Henüz oyuncu yok</h3><p>Yönetici oyuncuları ekleyince burada kendi kartını seçersin.</p></div>`;
  const om=openMatch(),rs=om?.rsvp||{};const lastId=S.me||LS.get("y_me_last")||"";const used=new Set();const pg=S.f.mePos||"";
  const row=p=>{used.add(p.id);const o=ovrOf(p.id);const ph=photoOf(p.id);const g=(EPOS[eposOf(p)]||["OS"])[0];
    return `<button class="mer met ${tierOf(o)}${p.id===S.me?" on":""}" data-act="pickMe" data-id="${esc(p.id)}" data-q="${esc(trq(p.name))}" data-g="${g}"${pg&&pg!==g?" hidden":""}><b class="num">${o}</b><small>${esc(eposOf(p))}</small><span class="metp">${ph?`<img src="${esc(ph)}" alt="">`:SILH}</span><span class="metn">${esc(shortName(p.name))}</span></button>`};
  const sec=(l,arr)=>arr.length?`<div class="mes">${l?`<div class="mel">${l}</div>`:""}<div class="meg">${arr.map(row).join("")}</div></div>`:"";
  let h=head;const lp=lastId&&P(lastId);
  if(S.me&&lp){used.add(lp.id);const ph=photoOf(lp.id);h+=`<div class="mecur"><span class="mecp ${tierOf(ovrOf(lp.id))}">${ph?`<img src="${esc(ph)}" alt="">`:esc(initials(lp.name))}</span><span><small>Şu an sen</small><b>${esc(lp.name)}</b></span><button class="btn sm" data-act="pickMe" data-id="">Çıkış</button></div>`}
  h+=`<label class="mesr">${ICON_SRCH}<input id="meQ" type="search" placeholder="İsmini yaz" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="İsmini ara"></label>
    <div class="mzseg mepos">${[["","Tümü"],["KL","KL"],["DF","DF"],["OS","OS"],["FV","FV"]].map(([k,l])=>`<button data-act="mePos" data-v="${k}" class="${pg===k?"on":""}">${l}</button>`).join("")}</div><div id="meL">`;
  if(!(S.me&&lp)&&lp)h+=sec("Bu cihazda son",[lp]);
  if(om)h+=sec("Bu hafta gelenler",ps.filter(p=>rs[p.id]==="g"&&!used.has(p.id)));
  const rest=ps.filter(p=>!used.has(p.id));h+=sec(om?"Diğerleri":"",rest);
  h+=`<p class="muted small mee" hidden>Bu isimde oyuncu yok.</p></div>`;
  return h}
function meFilter(q){q=trq((q||"").trim());const L=$("#meL");if(!L)return;{const sh=document.querySelector("#modal .sheet");if(sh&&!sh.style.minHeight)sh.style.minHeight=sh.offsetHeight+"px"}let any=0;const pg=S.f.mePos||"";
  L.querySelectorAll(".mes").forEach(sc=>{let n=0;sc.querySelectorAll(".mer").forEach(b=>{const ok=(!q||b.dataset.q.includes(q)||b.dataset.q.split(" ").some(w=>w.startsWith(q)))&&(!pg||b.dataset.g===pg);b.hidden=!ok;if(ok)n++});sc.hidden=!n;any+=n});
  const e=L.querySelector(".mee");if(e)e.hidden=!!any}
function rtHist(s){const h=(s.hist||[]).filter(x=>x.kind==="oynadi"&&x.gx!=null);if(!h.length)return"";
  const arr=[s.baseX??s.base,...h.map(x=>x.gx)];const lab=["Başl.",...h.map(x=>fmtShort(x.m.date))];
  const W=260,H=86,pad=16,mn=Math.min(...arr)-.4,mx=Math.max(...arr)+.4;const X=i=>arr.length<2?W/2:pad+i*(W-2*pad)/(arr.length-1),Y=v=>10+(mx-v)/(mx-mn)*(H-36);
  const d=arr.map((v,i)=>(i?"L":"M")+X(i).toFixed(1)+" "+Y(v).toFixed(1)).join(" ");const dO=flo(arr[arr.length-1])-flo(arr[0]);const dx=arr[arr.length-1]-arr[0];const c=dx>.05?"var(--ok)":dx<-.05?"var(--bad)":"var(--acc)";
  return `<div class="rth"><div class="rthh"><span class="eyebrow">Reyting geçmişi</span><b class="num">${flo(arr[0])} → ${flo(arr[arr.length-1])}${dO?` <small style="color:${c}">${dO>0?"▲":"▼"}${Math.abs(dO)}</small>`:""}</b></div>
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Reyting geçmişi: başlangıç ${flo(arr[0])}, şimdi ${flo(arr[arr.length-1])}"><line x1="${pad}" x2="${W-pad}" y1="${Y(arr[0]).toFixed(1)}" y2="${Y(arr[0]).toFixed(1)}" stroke="var(--line2)" stroke-dasharray="3 4"/>
    <path d="${d}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
    ${arr.map((v,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(v).toFixed(1)}" r="${i===arr.length-1?4.5:3}" fill="${i===arr.length-1?c:"var(--bg2)"}" stroke="${c}" stroke-width="2"/>`).join("")}
    ${arr.length<=7?lab.map((l,i)=>`<text x="${X(i).toFixed(1)}" y="${H-4}" text-anchor="${i===0&&arr.length>1?"start":i===arr.length-1&&arr.length>1?"end":"middle"}" class="rtl">${esc(l)}</text>`).join(""):""}</svg></div>`}
function profStats(p,s,noHead){const g=s.games||0,W=s.W||0,D=s.D||0,L=s.L||0;const cap=fin().filter(m=>m.cap_a===p.id||m.cap_b===p.id).length;const dO=(s.ovr||0)-(s.base||0);
  const seg=(n,c,l)=>n?`<i class="${c}" style="flex:${n}" title="${l} ${n}"></i>`:"";
  return `<div class="pst">
    ${noHead?"":`<div class="psh"><div><span>Reyting</span><b class="num">${s.ovr||"–"}</b><small>${dO?`<em class="${dO>0?"up":"dn"}">${dO>0?"▲":"▼"}${Math.abs(dO)}</em> · ilk ${s.base}`:"ilk "+(s.base??"–")}</small></div>
      <div><span>Ort. not</span><b class="num ${s.avgPts!=null?noteCls(s.avgPts):""}">${fN(s.avgPts)}</b><small>${s.bestM?"en iyi "+fN(s.bestM.pts):"henüz yok"}</small></div>
      <div><span>Maç</span><b class="num">${g}</b><small>${s.att!=null?"%"+Math.round(s.att*100)+" geldi":"–"}</small></div></div>`}
    ${g?`<div class="pwl2"><div class="pwlh"><span><b class="w">${W}</b> G · <b>${D}</b> B · <b class="l">${L}</b> M</span><span class="muted">kazanma %${Math.round(W/g*100)}</span></div><div class="pbar">${seg(W,"w","Galibiyet")}${seg(D,"d","Beraberlik")}${seg(L,"l","Mağlubiyet")}</div></div>`:""}
    <div class="pmini">${[["⚽","Gol",s.goals||0],["👟","Asist",s.ast||0],["★","Maçın Adamı",s.motm||0],["©","Kaptanlık",cap]].map(([i,l,v])=>`<div><i>${i}</i><b class="num">${v}</b><span>${l}</span></div>`).join("")}</div></div>`}
function attrBars(p,s){const A=s.attrs||p.attrs||{};return `<section class="abars"><h3>Özellikler</h3>${attrSet(p.pos).map(([k,l,full])=>{const v=+A[k]||0;const d=s.attrD?.[k]||0;
    return `<div class="abr"><span>${esc(full||l)}</span><b class="num">${v||"–"}${d?`<i class="${d>0?"up":"dn"}">${d>0?"▲":"▼"}</i>`:""}</b><span class="abt"><i style="width:${Math.max(0,Math.min(100,(v-30)/65*100))}%" class="${v>=80?"hi":v>=70?"md":"lo"}"></i></span></div>`}).join("")}</section>`}
function pSeason(id){const F=fin().filter(inYr);const y={games:0,g:0,a:0,W:0,D:0,L:0,pts:0,best:0,motm:0,totw:0,fiy:0,klG:0,klC:0};
  for(const m of F){const inf=S.mInfo[m.id];if(!inf)continue;const r=inf.pts?.[id];if(r){y.games++;y.g+=r.g;y.a+=r.a;y.pts+=r.pts;y[r.res==="G"?"W":r.res==="B"?"D":"L"]++;if(r.pts>y.best)y.best=r.pts;if(r.role==="KL"){y.klG++;y.klC+=r.op}}
    if(inf.motm===id)y.motm++;if(inf.fiy===id)y.fiy++;if((inf.totw||[]).includes(id))y.totw++}return y}
function pSeasonHtml(p){const y=pSeason(p.id);const g=y.games;
  const head=`<div class="pssh"><h3>Sezon istatistikleri</h3>${yrSel()}</div>`;if(!g)return `<section class="pss">${head}<p class="muted small">Bu sezon maç yok.</p></section>`;
  const seg=(n,c)=>n?`<i class="${c}" style="flex:${n}"></i>`:"";
  const k4=[["Gol",y.g],["Asist",y.a],["Maçın adamı",y.motm],["Haftanın takımı",y.totw]].map(([l,v])=>`<div class="${v?"":"z"}"><b class="num">${v}</b><small>${l}</small></div>`).join("");
  const ex=[y.klG?`Kalede ${y.klG} maç · maç başı ${fN(y.klC/y.klG)} gol yedi`:"",y.fiy?`Fiyasko ${y.fiy} kez`:""].filter(Boolean);
  // not grafiği
  const N=fin().filter(inYr).sort((a,b)=>matchTs(a)-matchTs(b)).map(m=>{const r=S.mInfo[m.id]?.pts?.[p.id];return r?{m,v:r.pts}:null}).filter(Boolean);
  let chart="";if(N.length){const W=210,H=64,lo=Math.min(5,...N.map(x=>x.v)),hi=Math.max(9,...N.map(x=>x.v));const X=i=>N.length<2?W/2:14+i*(W-28)/(N.length-1),Y=v=>H-12-(v-lo)/(hi-lo)*(H-26);
    const bi=N.reduce((b,x,i)=>x.v>N[b].v?i:b,0),av=y.pts/g;
    chart=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Maç notları: ${N.map(x=>fN(x.v)).join(", ")}"><line x1="0" x2="${W}" y1="${Y(av).toFixed(1)}" y2="${Y(av).toFixed(1)}" stroke="#E7E2EC" stroke-dasharray="3 4"/>${N.length>1?`<polyline points="${N.map((x,i)=>X(i).toFixed(1)+","+Y(x.v).toFixed(1)).join(" ")}" fill="none" stroke="#7B3FF2" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`:""}${N.map((x,i)=>`<circle cx="${X(i).toFixed(1)}" cy="${Y(x.v).toFixed(1)}" r="${i===bi?5:3.5}" fill="${i===bi?"#7B3FF2":"#fff"}" stroke="#7B3FF2" stroke-width="2"/>`).join("")}<text x="${Math.min(W-30,Math.max(30,X(bi))).toFixed(1)}" y="${Math.max(9,Y(N[bi].v)-8).toFixed(1)}" text-anchor="middle" font-size="9.5" font-weight="800" fill="#37003C">${fmtShort(N[bi].m.date)} · ${fN(N[bi].v)}</text></svg>`}
  return `<section class="pss">${head}
    <div class="paka"><div><span class="eyebrow">Sonuçlar</span><div class="pares">${seg(y.W,"w")}${seg(y.D,"d")}${seg(y.L,"l")}</div><div class="parl"><span><b>${y.W}</b> galibiyet</span><span><b>${y.D}</b> beraberlik</span><span><b>${y.L}</b> mağlubiyet</span></div></div><div class="papc"><b class="num">%${Math.round(y.W/g*100)}</b><small>${g} maçta kazanma</small></div></div>
    <div class="pak4">${k4}</div>${ex.length?`<p class="muted small" style="margin:0">${ex.join(" · ")}</p>`:""}
    <div class="pant"><div class="big"><b class="num">${fN(y.pts/g)}</b><small>not ort.</small><small>en iyi ${fN(y.best)}</small></div>${chart}</div></section>`}
function attrRadar(p){const s=S.stats[p.id]||{};const L=attrSet(p.pos).map(([k,l,full])=>({k,l,full,v:+(s.attrs?.[k]??mainVal(p.attrs||{},k,p.pos))||0,d:s.attrD?.[k]||0}));const n=L.length;if(!n)return"";
  const C=80,R=60,pt=(i,f)=>{const a=-Math.PI/2+i*2*Math.PI/n;return[C+R*f*Math.cos(a),C+R*f*Math.sin(a)]};const poly=f=>L.map((_,i)=>pt(i,typeof f==="function"?f(i):f).map(x=>x.toFixed(1)).join(",")).join(" ");
  const lab=L.map((x,i)=>{const[xx,yy]=pt(i,1.24);return `<text x="${xx.toFixed(1)}" y="${(yy+3).toFixed(1)}" text-anchor="middle">${esc(x.l)}</text>`}).join("");
  const srt=[...L].sort((a,b)=>b.v-a.v);
  const cur=s.cur||{},a=p.attrs||{};const subs=[];attrSet(p.pos).forEach(([k,l,full,ss])=>ss.forEach(([sk,sl])=>{const c=cur[k+"_"+sk]??subVal(a,k,sk);subs.push([sl,Math.round(c)])}));subs.sort((x,y)=>y[1]-x[1]);
  return `<section class="pss"><h3>Özellikler</h3><div class="parad"><svg viewBox="0 0 160 160" role="img" aria-label="Özellik radarı"><g fill="none" stroke="#ECE6F2"><polygon points="${poly(1)}"/><polygon points="${poly(.5)}"/></g><polygon points="${poly(i=>Math.max(.15,L[i].v/100))}" fill="rgba(123,63,242,.22)" stroke="#7B3FF2" stroke-width="2" stroke-linejoin="round"/><g class="parl2">${lab}</g></svg>
    <div class="paal">${srt.map(x=>`<div><span>${esc(x.full||x.l)}</span><b class="num">${x.v}${x.d?`<em class="${x.d>0?"up":"dn"}">${x.d>0?"▲":"▼"}${Math.abs(x.d)}</em>`:""}</b></div>`).join("")}<small>En güçlü yanı ${esc((srt[0].full||srt[0].l).toLocaleLowerCase("tr"))}, en zayıfı ${esc((srt[n-1].full||srt[n-1].l).toLocaleLowerCase("tr"))}.</small></div></div>
    <details class="padet"><summary>Tüm alt özellikler</summary>${attrDetail(p)}</details></section>`}
function istNote(p){const N=fin().filter(inYr).sort((a,b)=>matchTs(a)-matchTs(b)).map(m=>{const r=S.mInfo[m.id]?.pts?.[p.id];return r?{m,v:r.pts}:null}).filter(Boolean);
  if(!N.length)return `<div class="in-c"><div class="in-x"><b>Not ortalaması</b><span>Bu sezon notlu maç yok.</span></div></div>`;
  const av=N.reduce((a,x)=>a+x.v,0)/N.length,bi=N.reduce((b,x,i)=>x.v>N[b].v?i:b,0);const L=2*Math.PI*40;
  const W=200,H=44,lo=Math.min(...N.map(x=>x.v))-.3,hi=Math.max(...N.map(x=>x.v))+.3;const X=i=>N.length<2?W/2:6+i*(W-12)/(N.length-1),Y=v=>H-6-(v-lo)/((hi-lo)||1)*(H-12);
  const T=N.slice(-6),o=N.length-T.length;
  return `<div class="in-c"><div class="in-r"><svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="9"/><circle cx="48" cy="48" r="40" fill="none" stroke="#5FE3F5" stroke-width="9" stroke-linecap="round" stroke-dasharray="${(L*Math.min(1,av/10)).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90 48 48)"/></svg><span><b class="num">${fN(av)}</b><small>/ 10</small></span></div>
    <div class="in-x"><b>Not ortalaması</b>${N.length>1?`<svg class="in-sp" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="Maç notları ${N.map(x=>fN(x.v)).join(", ")}"><polyline points="${N.map((x,i)=>X(i).toFixed(1)+","+Y(x.v).toFixed(1)).join(" ")}" fill="none" stroke="#fff" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`:""}
    <span class="in-n">${T.map((x,i)=>`<span class="${i+o===bi?"b":""}"><b class="num">${fN(x.v)}</b><small>${fmtShort(x.m.date)}</small></span>`).join("")}</span><span class="in-s">${N.length} maç · en iyi ${fN(N[bi].v)}</span></div></div>`}
function istTrk(p){const F=fin().filter(inYr).filter(m=>trkOf(m,p.id));if(!F.length)return"";const avg=(L,k)=>{const v=L.map(m=>trkOf(m,p.id)[k]).filter(x=>x!=null);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};
  const team=k=>{const v=[];fin().filter(inYr).forEach(m=>plAll(m).forEach(id=>{const t=trkOf(m,id);if(t&&t[k]!=null)v.push(t[k])}));return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};
  const tiles=TRK.map(([k,l,u])=>{const a=avg(F,k);if(a==null)return"";const t=team(k);const d=t!=null?a-t:null;const z=d==null||Math.abs(d)<(t||1)*.03;const cl=z?"":d>0?"up":"dn";
    return `<div class="it-t"><small>${l}</small><span><b class="num">${fTrk(k,a)}${u&&u!=="%"?`<em>${u}</em>`:""}</b>${d!=null?`<i class="${cl}">${z?"=":d>0?"▲":"▼"} ${z?"0":fTrk(k,Math.abs(d)).replace("%","")}</i>`:""}</span></div>`}).join("");
  return `<div class="ist-h"><h3>Saha verileri</h3><small>maç başına · ${F.length} maç · ok: takım ort.</small></div><div class="it-g">${tiles}</div>`}
function istAttr(p){const s=S.stats[p.id]||{};const a=p.attrs||{};const cur=s.cur||{};const AS=attrSet(p.pos);const sel=AS.some(x=>x[0]===S.f.iaG)?S.f.iaG:AS[0][0];
  const g=AS.find(x=>x[0]===sel);
  return `<div class="ist-h"><h3>Özellikler</h3><small>${esc(g[2])}</small></div><div class="at-g ia-g">${AS.map(([k,l])=>{const mv=s.attrs?.[k]??mainVal(a,k,p.pos);return `<button data-act="iaG" data-v="${k}" class="${k===sel?"on":""}" aria-pressed="${k===sel}"><b class="num">${mv}</b><span>${l}</span></button>`}).join("")}</div>
  <div class="ia-l">${g[3].map(([sk,sl])=>{const b=subVal(a,sel,sk);const c=cur[sel+"_"+sk]??b;const v=Math.round(c);const dd=Math.round((c-b)*10)/10;
    return `<div class="ia-r"><span><span>${sl}</span><b class="num">${v}${Math.abs(dd)>=.5?`<em class="${dd>0?"up":"dn"}">${fD(dd)}</em>`:""}</b></span><i><i style="width:${v}%"></i></i></div>`}).join("")}</div>`}
function pHead(p,inline){const s=S.stats[p.id]||{};const o=ovrOf(p.id);const ph=photoOf(p.id);
  const H=(s.hist||[]).filter(x=>x.kind==="oynadi"&&x.r);const tg=H.reduce((t,x)=>t+(x.r.g||0),0),ta=H.reduce((t,x)=>t+(x.r.a||0),0);
  const tr=s.lastO>0?`<span class="pv-ch up">▲ ${s.lastO} son maç</span>`:s.lastO<0?`<span class="pv-ch dn">▼ ${-s.lastO} son maç</span>`:"";
  return `<div class="pv-h"><div class="pv-c ${tierOf(o)}"><b class="num">${o}</b><small>${eposOf(p)}</small><span class="pv-ph">${ph?`<img src="${esc(ph)}" alt="">`:SILH}</span></div>
    <div class="pv-x"><b class="pv-n">${esc(p.name)}</b><span class="pv-s">${reigningChamp()===p.id?"🏆 Şampiyon · ":""}${EPOS[eposOf(p)][1]}${altOf(p)?" · "+EPOS[altOf(p)][1]:""}${ageOf(p)!=null?" · "+ageOf(p)+" yaş":""}</span><span class="pv-chs">${tr}<span class="pv-ch">${fN1(mvOf(p.id))} M€</span></span></div>
    ${inline?"":`<div class="pv-b"><button class="mzic" data-act="close" aria-label="Kapat">${ICON.x}</button><button class="mzic" data-act="cmpOpen" data-id="${esc(p.id)}" aria-label="Karşılaştır">${ICON.scale}</button></div>`}</div>
    <div class="pv-st">${[[s.games||0,"Maç","takvim","lila"],[tg,"Gol","top","pink"],[ta,"Asist","krampon","cyan"],[ligRank(p.id),"Ligde","kupa","gold"]].map(([v,l,ic,c])=>`<div>${dIcon(ic,c,24)}<b class="num">${v}</b><span>${l}</span></div>`).join("")}</div>`}
const USE_L={"tab:mac":"Maç","tab:gecmis":"Fikstür","tab:lig":"Lig · Puan durumu","tab:sezon":"Lig · İstatistikler","tab:kartlar":"Oyuncular","tab:ben":"Ben","sheet:player":"Oyuncu kartı","sheet:cmp":"Karşılaştır","sheet:pm":"Paylaşım merkezi","sheet:share":"Paylaş","sheet:vote":"Oylama","sheet:trk":"Saha verisi girişi","sheet:pedit":"Kartı düzenle","act:sezV_yelek":"İstatistik · Yelek","act:sezV_kral":"İstatistik · Krallar","act:sezV_mevki":"İstatistik · Mevkiler","act:sezV_saha":"İstatistik · Saha","act:statSheet":"Skor girişi","act:autoKadro":"Otomatik kadro","act:shareImg":"Görsel paylaşma","act:voteOpen":"Oy verme","act:cmpOpen":"Karşılaştır düğmesi","act:viewm":"Maç detayı","act:story":"Hikâye"};
function usageView(){if(!S.usage){S.usage="…";rpc("admin_usage",{p_pin:S.pin||""}).then(r=>{S.usage=(r&&r.rows)||[];render(true)}).catch(()=>{S.usage=[];render(true)});return `<div class="vskl"><i></i><i></i></div>`}
  if(S.usage==="…")return `<div class="vskl"><i></i><i></i></div>`;
  const R=S.usage;if(!R.length)return `<section class="card"><p class="muted small" style="margin:0">Henüz sayım yok. Sayım bu sürümle başladı; birkaç hafta içinde hangi bölümlerin kullanıldığı burada görünür.</p></section>`;
  const W=[...new Set(R.map(r=>r.w))].sort().slice(-6);const K={};R.forEach(r=>{if(W.includes(r.w))(K[r.k]||(K[r.k]={}))[r.w]=r.n});
  const rows=Object.entries(K).map(([k,o])=>[k,W.reduce((t,w)=>t+(o[w]||0),0),o]).sort((a,b)=>b[1]-a[1]);
  const lab=k=>USE_L[k]||k.replace(/^(tab|sheet|act):/,"");
  return `<section class="card"><p class="muted small" style="margin:0 0 10px">Son ${W.length} haftada her bölümün kaç kez açıldığı. Kimin açtığı tutulmaz. Az kullanılan bölümleri sadeleştirme kararı için.</p>
    <div class="scroll-x"><table class="tbl"><thead><tr><th>Bölüm</th>${W.map(w=>`<th>${esc(fmtShort(w))}</th>`).join("")}<th>Toplam</th></tr></thead><tbody>${rows.map(([k,t,o])=>`<tr><td>${esc(lab(k))}</td>${W.map(w=>`<td>${o[w]||0}</td>`).join("")}<td><b>${t}</b></td></tr>`).join("")}</tbody></table></div></section>`}
// kartın son maçta neden değiştiği, tek cümle
function whyCard(p){const s=S.stats[p.id];const h=(s&&s.hist||[]).filter(x=>x.kind==="oynadi"&&x.r);const x=h[h.length-1];if(!x)return"";
  const ch=(x.ch||[]).filter(c=>c[1]).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));const up=x.d>0,dn=x.d<0;
  const top=ch.slice(0,3).map(c=>SUBN[c[0]]||c[0]);const why=[x.r.g?x.r.g+" gol":"",x.r.a?x.r.a+" asist":"",x.r.res==="G"?"galibiyet":x.r.res==="M"?"mağlubiyet":"beraberlik"].filter(Boolean).join(", ");
  const esk=x.r.esik!=null?fN(x.r.esik):"";
  const txt=up?`Notun ${fN(x.r.pts)}, eşiğin ${esk} idi; kart ${fA(x.d)} yükseldi.`:dn?`Notun ${fN(x.r.pts)}, eşiğin ${esk} idi; kart ${fA(x.d)} düştü.`:`Notun ${fN(x.r.pts)}, eşiğine (${esk}) yakın; kart değişmedi.`;
  return `<button class="why ${up?"up":dn?"dn":""}" data-act="viewm" data-id="${esc(x.m.id)}"><span class="why-h"><small>Son maç · ${fmtShort(x.m.date)} · ${why}</small><b class="num">${up?"▲":dn?"▼":"="} ${fA(x.d)}</b></span><span class="why-t">${txt}${top.length?` En çok ${up?"artan":"düşen"}: ${top.join(", ")}.`:""}</span></button>`}
function ligRank(id){const L=ligTable(fin().filter(inYr));const i=L.findIndex(o=>o.id===id);return i<0?"–":(i+1)+"."}
function kondMini(p){const c=kondOf(p.id);if(!c)return"";const col=c.lv==="hi"?"#00E58A":c.lv==="md"?"#FFD400":"#FF4D6D";const L=2*Math.PI*16;
  return `<div class="pv-k"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="none" stroke="#2C2060" stroke-width="5"/><circle cx="20" cy="20" r="16" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${(L*c.k/100).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90 20 20)"/></svg><span><small>Kondisyon</small><b class="num">%${c.k} <em style="color:${col}">${esc(c.l)}</em></b></span></div>`}
function sheetPlayer(pid,inline){
  const p=P(pid||S.sheet.id);if(!p)return"";const s=S.stats[p.id]||{};const st=stOf(p);const canSt=S.admin||(!!S.session&&isMember()&&S.me===p.id);// üye kendi durumunu (sakat, izinli…) kendisi günceller
  const sf=S.f.st||(S.f.st={type:st,until:p.status?.until||"",note:p.status?.note||""});
  const tab=S.f.ptab||"genel";
  let h=pHead(p,inline)+`<div class="pv-tabs" role="tablist" aria-label="Oyuncu">${[["genel","Genel"],["ist","İstatistik"],["mac","Maçlar"]].map(([k,l])=>`<button role="tab" data-act="ptab" data-v="${k}" aria-selected="${tab===k}" class="${tab===k?"on":""}">${l}</button>`).join("")}</div>`;
  if(tab==="ist"){h+=istNote(p)+istTrk(p)+istAttr(p);return h}
  if(tab==="genel")h+=whyCard(p);
  if(tab==="mac"){h+=`
    <div><h3>Son maçlar</h3>${(s.hist||[]).length?`<div class="patl">${(s.hist||[]).slice(-8).reverse().map(x=>{const inf=S.mInfo[x.m.id]||{};
      if(x.kind!=="oynadi")return `<button class="patm x" data-act="viewm" data-id="${esc(x.m.id)}"><span class="d">${fmtShort(x.m.date)}</span><span class="t">${x.kind==="iptal"?"Son dakika iptal":"Maça gelmedi"}</span></button>`;
      const r=x.r,res=r.res==="G"?"Galibiyet":r.res==="B"?"Beraberlik":"Mağlubiyet";
      const tags=[inf.motm===p.id?'<i class="st">★ Maçın adamı</i>':"",(inf.totw||[]).includes(p.id)?"<i>Haftanın takımı</i>":"",inf.gol===p.id?"<i>Haftanın golü</i>":"",inf.fiy===p.id?'<i class="dn">Fiyasko</i>':""].filter(Boolean).join("");
      return `<button class="patm ${r.res}" data-act="viewm" data-id="${esc(x.m.id)}"><span class="d">${fmtShort(x.m.date)} · ${res}</span><span class="t">${ROLE_NAME[r.role]}<span>${r.g?" · "+r.g+" gol":""}${r.a?" · "+r.a+" asist":""}</span></span>${tags?`<span class="m">${tags}</span>`:""}<span class="n ${noteCls(r.pts)}">${fN(r.pts)}</span></button>`}).join("")}</div>`:'<p class="muted small" style="padding:8px 0">Henüz maç kaydı yok.</p>'}
    </div>
    ${(()=>{const E=extFin().filter(m=>(m.team_a||[]).includes(p.id));if(!E.length)return"";const o={G:0,B:0,M:0};let g=0,a=0;E.forEach(m=>{o[extRes(m)]++;g+=+(m.stats||{})[p.id]?.g||0;a+=+(m.stats||{})[p.id]?.a||0});
      return `<div><h3>Dış maçlar</h3><div class="kv" style="margin-top:8px"><div><span>Maç</span><b>${E.length}</b></div><div><span>G-B-M</span><b style="font-size:1.1rem">${o.G}-${o.B}-${o.M}</b></div><div><span>Gol</span><b>${g}</b></div><div><span>Asist</span><b>${a}</b></div></div></div>`})()}
    ${chemHtml(p)}
    <div><h3>Rozetler</h3><div class="pabd">${(s.badges||[]).map(b=>`<span class="${b.shame?"shame":""}"><i>${esc(b.i)}</i><span><b>${esc(b.t)}</b><small>${esc(b.d)}</small></span></span>`).join("")||'<span class="muted small">Henüz rozet yok.</span>'}</div></div>`;return h}
  const x=STATUS[st];const dc=st==="hazir"?"#00E58A":x.cls==="bad"?"#FF4D6D":"#FFD400";
  const stLbl=`<span class="pv-dot" style="background:${dc};box-shadow:0 0 0 5px ${dc}2e"></span><span class="pv-dx"><small>Durum</small><b>${esc(x.label)}${p.status?.until&&st!=="hazir"?` · ${fmtShort(p.status.until)}`:""}</b></span>`;
  h+=`<div class="pv-g2 one">${canSt&&!inline?`<button class="pv-d" data-act="stOpen" aria-expanded="${!!S.f.stOpen}">${stLbl}<i>${CHVD}</i></button>`:`<div class="pv-d">${stLbl}</div>`}</div>`;
  if(canSt&&!inline&&S.f.stOpen){const ch=sf.type!==st||(sf.type!=="hazir"&&(sf.until!==(p.status?.until||"")||sf.note!==(p.status?.note||"")));
    h+=`<div class="pv-sp"><div class="pv-sc">${Object.entries(STATUS).map(([k,v])=>`<button data-act="stType" data-v="${k}" class="${sf.type===k?"on":""}">${v.label}</button>`).join("")}</div>
    ${sf.type!=="hazir"?`<div class="grid2"><label class="f" for="stUntil">Tahmini dönüş<input id="stUntil" type="date" data-bind="st.until" value="${esc(sf.until)}"></label><label class="f" for="stNote">Not<input id="stNote" type="text" maxlength="60" data-bind="st.note" value="${esc(sf.note)}" placeholder="Örn. ayak bileği"></label></div>`:""}
    ${ch||sf.type!=="hazir"?`<button class="btn primary block" data-act="saveStatus">Kaydet</button>`:""}
    ${(p.status_log||[]).length?`<details><summary class="small">Durum geçmişi</summary><div class="hist">${p.status_log.slice().reverse().map(e=>`<div style="grid-template-columns:4.4em 1fr"><span class="d">${fmtShort(e.at)}</span><span>${esc(STATUS[e.type]?.label||e.type)}${e.note?" · "+esc(e.note):""}</span></div>`).join("")}</div></details>`:""}</div>`}
  if(s.streak||p.status?.note)h+=`<div class="row">${s.streak?`<span class="chip ${s.streak.hot?"warn":"info"}">${s.streak.hot?"🔥":"❄️"} ${esc(s.streak.t)}</span>`:""}${p.status?.note?`<span class="muted small">${esc(p.status.note)}</span>`:""}</div>`;
  h+=rtHist(s);
  {const L=(s.hist||[]).filter(x=>x.kind==="oynadi"&&x.r&&x.r.pts!=null);if(L.length)h+=`<div class="pv-nt"><b>Son ${Math.min(5,L.length)} maç notu</b>${formNotes(s)}</div>`}
  h+=trophyCase(p.id);
  if(inline)return h;
  h+=modRow(pid);
  if(S.admin)h+=`<div class="pv-ad"><button data-act="peditOpen"><span class="pv-ai">${ICON_PEN}</span><span>Kartı düzenle</span><small>Yönetici</small><i>${CHVR}</i></button></div>`;
  return h;
}
const ICON_BACK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>';
const ICON_PEN='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg>';
const CHVR='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function sheetPEdit(){const p=P(S.sheet.id);if(!p||!S.admin)return"";const ph=photoOf(p.id);
  const a=S.f.ed||(S.f.ed={name:p.name,pos:p.pos,epos:eposOf(p),alt:altOf(p),yedek:p.yedek?"1":"",age:p.age!=null?String(p.age):"",attrs:{...(p.attrs||{})}});
  const o0=ovrOf(p.id),o1=baseOf({pos:a.pos,epos:a.epos,attrs:a.attrs});
  return `<div class="pe-h"><button class="mzic" data-act="pback" aria-label="Geri">${ICON_BACK}</button><h2>Kartı düzenle</h2><button class="btn primary sm" data-act="saveCard">Kaydet</button></div>
  <div class="pe-pv"><span class="pe-c ${tierOf(o1)}"><b class="num" id="ed_ovr">${o1}</b><small>${esc(a.epos)}</small></span><span class="pe-x"><b>${esc(a.name||p.name)}</b><small>Değiştirdikçe başlangıç reytingi canlı güncellenir</small><small>Şu anki reyting: <b class="num">${o0}</b></small></span></div>
  <div class="pe-l">
    <label class="pe-r" for="edName"><span>Ad</span><input id="edName" type="text" data-bind="ed.name" value="${esc(a.name)}" maxlength="40"></label>
    <label class="pe-r" for="edAge"><span>Yaş</span><input id="edAge" type="number" inputmode="numeric" min="10" max="80" data-bind="ed.age" value="${esc(a.age??"")}" placeholder="–"></label>${+a.age>0&&+a.age<18?`<p class="pe-u">18 yaşından küçük: kart, fotoğraf ve yaş için velisinin onayını almış olmalısın. Durum notuna sağlık ayrıntısı yazma.</p>`:""}
    <label class="pe-r" for="edPos"><span>Mevki</span>${posSelect("edPos","ed.epos",a.epos)}</label>
    <label class="pe-r" for="edAlt"><span>Alternatif</span>${posSelect("edAlt","ed.alt",a.alt,true,a.epos)}</label>
  </div>
  ${attrInputs("ed",a.pos,a.attrs)}
  ${S.f.phPrev&&S.f.phPrev.id===p.id?`<div class="phpv"><span class="phpv-i"><img src="${esc(S.f.phPrev.d)}" alt="Yeni fotoğrafın önizlemesi"></span><div class="phpv-t"><b>Böyle görünecek</b><p class="muted small">Arka plan silindi. Beğenmediysen başka bir fotoğraf seç.</p><div class="phpv-b"><button class="btn sm primary" data-act="phUse"${S.f.phBusy?" disabled":""}>Kullan</button><label class="btn sm ghost" for="phFile">Başka fotoğraf</label><button class="btn sm ghost" data-act="phCancel">Vazgeç</button></div></div></div>`:""}
  <div class="phrow"><span class="av ${tierOf(o0)}${ph?" hasph":""}">${ph?`<img src="${esc(ph)}" alt="">`:SIL}</span><div style="flex:1;min-width:0"><b>Oyuncu fotoğrafı</b><p class="muted small">${S.f.phBusy?(S.f.phPrev?"Yükleniyor…":"Arka plan siliniyor… İlk seferde biraz sürebilir."):ph?"":"Arka plan kendiliğinden silinir."}</p></div>
    <label class="btn sm primary" for="phFile">${ph?"Değiştir":"Yükle"}</label><input class="vh" id="phFile" type="file" accept="image/*" data-photo="${esc(p.id)}">${ph?`<button class="btn sm ghost" data-act="delPhoto" data-id="${esc(p.id)}" aria-label="Fotoğrafı kaldır">${ICON.x}</button>`:""}</div>
  <button class="pe-del" data-act="delPlayer">${S.f.delP===p.id?"Kadrodan çıkarmak için tekrar bas":"Kadrodan çıkar"}</button>`}
const sparkData=s=>{const h=(s.hist||[]).filter(x=>x.kind==="oynadi"&&x.gx!=null);return h.length?[s.baseX??s.base,...h.map(x=>x.gx)]:[]};
function spark(arr){if(arr.length<3)return"";const W=240,H=52,mn=Math.min(...arr)-.3,mx=Math.max(...arr)+.3;
  const pts=arr.map((v,i)=>[i/(arr.length-1)*(W-12)+6,H-6-(v-mn)/(mx-mn)*(H-14)]);const d=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");const l=pts[pts.length-1];const up=arr[arr.length-1]>=arr[0];const c=up?"#00E676":"#FF4D6D";
  return `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="Reyting değişimi: ${flo(arr[0])} → ${flo(arr[arr.length-1])}"><defs><linearGradient id="spg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c}" stop-opacity=".28"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></linearGradient></defs><path d="${d} L${l[0]} ${H} L${pts[0][0]} ${H}Z" fill="url(#spg)"/><path d="${d}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>${pts.map((p,i)=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i===pts.length-1?4:2.4}" fill="${i===pts.length-1?"#C6F432":c}"/>`).join("")}</svg>`}

/* ================= Sezon ================= */
/* Lig: galibiyet 3, beraberlik 1 puan; sadece maç sonu kadrosu sayılır */
function ligTable(F,avg){F=F||fin();const t={};
  for(const m of F){const a=+m.score_a||0,b=+m.score_b||0;
    for(const[side,ids]of[["A",plOf(m,"A")],["B",plOf(m,"B")]]){const my=side==="A"?a:b,op=side==="A"?b:a;const r=my>op?"G":my<op?"M":"B";
      for(const id of ids){const p=P(id);if(!p||p.guest||p.archived)continue;const o=t[id]||(t[id]={id,G:0,B:0,M:0,ag:0,yg:0,f:[]});o[r]++;o.ag+=my;o.yg+=op;o.f.push(r)}}}
  return Object.values(t).map(o=>{const n=o.G+o.B+o.M,p=o.G*3+o.B;return{...o,n,p,av:o.ag-o.yg,ppm:n?p/n:0}})
    .sort((x,y)=>(avg?((y.n>=2)-(x.n>=2))||y.ppm-x.ppm:0)||y.p-x.p||y.G-x.G||y.av-x.av||x.n-y.n||genOf(y.id)-genOf(x.id))}
function rivalOf(me){if(!me)return null;const t={};
  for(const m of fin()){const sd=playSide(m,me);if(!sd)continue;const a=+m.score_a||0,b=+m.score_b||0;const my=sd==="A"?a:b,op=sd==="A"?b:a;const r=my>op?"G":my<op?"M":"B";
    for(const id of plOf(m,sd==="A"?"B":"A")){const p=P(id);if(!p||p.guest||p.archived)continue;const o=t[id]||(t[id]={id,n:0,G:0,B:0,M:0});o.n++;o[r]++}}
  const L=Object.values(t).sort((x,y)=>y.n-x.n||y.M-x.M);return L[0]||null}
function viewLig(){const avg=false;const F=fin().filter(inYr);const L=ligTable(F,avg);
  let h=S.fol?folBar():oyTabs("lig");
  if(!L.length)return h+`<section class="card"><div class="empty emp2">${empIc("kupa","gold")}<h3>Henüz biten maç yok</h3><p>İlk maç bitince puan durumu burada oluşur.</p></div></section>`+champWall();
  // geçen haftaya göre sıra değişimi: son maç günü hariç tablo
  const lastD=F.length?F[F.length-1].date:null;const PF=F.filter(m=>m.date!==lastD);const prev=PF.length?ligTable(PF,avg).map(o=>o.id):null;
  const fd=f=>f.slice(-5).map(r=>`<i class="lf ${r}" title="${r==="G"?"Galibiyet":r==="B"?"Beraberlik":"Mağlubiyet"}"></i>`).join("");
  const elg=avg?L.filter(o=>o.n>=2).length:L.length;const nb=elg>=6?elg-3:-1;const MED=["g1","g2","g3"];
  const pt=o=>avg?fN(o.ppm):String(o.p);
  const sy=selYr();let champId=null;if(sy!=="all"&&!avg){const done=seasonDone(sy);const rem=done?0:Math.max(0,sLen()-seasonCount(sy));if(L.length>1&&(done||L.slice(1).every(r=>r.p+3*rem<L[0].p)))champId=L[0].id;
    if(done&&L[0]){const w=seasonAwards(sy);if(w&&w.champ)h+=odulCard(sy,w)}}

  const mv=(o,i)=>{if(!prev)return"";const j=prev.indexOf(o.id);const d=j<0?0:j-i;return d>0?`<small class="lmv up">▲${d}</small>`:d<0?`<small class="lmv dn">▼${-d}</small>`:""};
  const sub=o=>`${o.n} maç · ${o.G}G ${o.B}B ${o.M}M · ${o.av>0?"+":""}${o.av}`;
  const lead=L[0],lp=P(lead.id);
  h+=`<section class="card ltb lt2"><div class="ltb-h"><span>#</span><span></span><span>Oyuncu</span><span>O</span><span>G</span><span>B</span><span>M</span><span>AV</span><span>P</span><span>Form</span></div>`+L.map((o,i)=>{const p=P(o.id);
      return `<button class="ltb-r${o.id===S.me?" me":""}${i===nb?" rl":""}" data-act="open" data-id="${esc(p.id)}" aria-label="${esc(p.name)}: ${i+1}. sıra, ${o.n} maç, ${o.G} galibiyet, ${o.B} beraberlik, ${o.M} mağlubiyet, averaj ${o.av}, ${o.p} puan"><span class="rk${i<3?" m"+(i+1):""}"><b class="num">${i+1}</b>${mv(o,i)}</span>${avatar(p,"sm")}<span class="nm">${esc(p.name)}${o.id===champId?' <em class="chmp" title="Şampiyon">🏆</em>':""}</span><span class="num">${o.n}</span><span class="num">${o.G}</span><span class="num">${o.B}</span><span class="num">${o.M}</span><span class="num avj ${o.av>0?"p":o.av<0?"n":""}">${o.av>0?"+":""}${o.av}</span><b class="ltp num">${pt(o)}</b><span class="lfs">${fd((o.f||[]).slice(-3))}</span></button>`}).join("")+`</section>`;
  const cw=champWall();
  return h+cw}
function viewSezon(){return _viewSezon().replace("<!--TRK-->","")}
function _viewSezon(){
  const yr=selYr();const F=fin().filter(inYr);
  const ys={};for(const p of S.all)ys[p.id]={g:0,a:0,motm:0,fiy:0,games:0,pts:0,W:0,D:0,L:0,totw:0,klG:0,klC:0,hat:0,best:0};
  for(const m of F){const inf=S.mInfo[m.id];for(const[id,r]of Object.entries(inf.pts)){const y=ys[id];if(!y||!r)continue;y.games++;y.g+=r.g;y.a+=r.a;y.pts+=r.pts;
      if(r.res==="G")y.W++;else if(r.res==="B")y.D++;else y.L++;if(r.g>=3)y.hat++;if(r.pts>y.best)y.best=r.pts;if(r.role==="KL"){y.klG++;y.klC+=r.op}}
    for(const id of inf.totw)if(ys[id])ys[id].totw++;
    if(inf.motm&&ys[inf.motm])ys[inf.motm].motm++;if(inf.fiy&&ys[inf.fiy])ys[inf.fiy].fiy++}
  for(const m of F){const pr=m.preds||{};for(const id of Object.keys(pr))if(ys[id]){ys[id].prN=(ys[id].prN||0)+1;ys[id].prP=(ys[id].prP||0)+predPts(pr[id],m);if(predPts(pr[id],m)===3)ys[id].prE=(ys[id].prE||0)+1}}
  const yrStart=yr==="all"?-Infinity:seasonStart(yr);
  for(const p of S.players){const s=S.stats[p.id];if(!s)continue;const before=(s.hist||[]).filter(x=>matchTs(x.m)<yrStart);ys[p.id].dOvr=s.ovr-(before.length?before[before.length-1].ovr:s.base)}
  const minG=needAll(F);const m0=noteMean(F);let tW=0,tG=0,kC=0,kG=0;for(const y of Object.values(ys)){tW+=y.W;tG+=y.games;kC+=y.klC;kG+=y.klG}const w0=tG?tW/tG:.4,ga0=kG?kC/kG:3;
  for(const y of Object.values(ys)){if(!y.games)continue;y.aN=adjAvg(y.pts,y.games,m0);y.aW=adjAvg(y.W,y.games,w0);if(y.klG)y.aK=adjAvg(y.klC,y.klG,ga0)}
  const minK=needPos(F);
  // sıralama: önce değer, eşitlikte daha az maçta yapan, sonra ikinci ölçüt, sonra isim. Eşit olanlar aynı sırayı paylaşır
  const CHV='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const sLenN=yr==="all"?0:Math.max(sLen(),F.length);
  const pmStrip=(id,pm)=>{if(!sLenN||!pm)return"";const vals=F.map(m=>{const r=S.mInfo[m.id]?.pts?.[id];return r?pm(r):null});const best=Math.max(0,...vals.filter(v=>v!=null));
    return `<span class="ysr" style="--n:${sLenN}" aria-label="Maç maç">${[...Array(sLenN)].map((_,i)=>{if(i>=F.length)return '<i class="fu"></i>';const v=vals[i];if(v==null)return '<i class="no" title="Gelmedi">–</i>';return `<i class="${v===best&&v>0?"hi":v>0?"on":"zr"}" title="${esc(fmtShort(F[i].date))}">${v}</i>`}).join("")}</span>`};
  const board=(t,val,fmt,filt,asc,tie,sub,pm)=>{const v=p=>val(ys[p.id]);const all=S.players.filter(p=>!p.guest&&(ys[p.id]?.games||0)>0&&(filt?filt(ys[p.id]):v(p)>0))
      .sort((a,b)=>(asc?v(a)-v(b):v(b)-v(a))||(ys[a.id].games-ys[b.id].games)||(tie?tie(ys[b.id])-tie(ys[a.id]):0)||a.name.localeCompare(b.name,"tr"));
    if(!all.length)return"";const bk="bx_"+t.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ]/g,"");const open=!!S.f[bk];const l=all.slice(0,open?10:3);let rk=0,prev=null;
    const more=all.length>3;
    return `<section class="card tsb${pm&&sLenN?" ytsb":""}"><${more?`button class="tsh" data-act="tog" data-k="${bk}" aria-expanded="${open}"`:'h3 class="tsh"'}>${t}${more?`<i class="${open?"op":""}">${CHV}</i>`:""}</${more?"button":"h3"}><ol>${l.map((p,i)=>{const k=v(p)+"|"+ys[p.id].games+"|"+(tie?tie(ys[p.id]):"");if(k!==prev){rk=i+1;prev=k}
      const ph=photoOf(p.id);const y=ys[p.id];
      return `<li data-act="open" data-id="${esc(p.id)}"><span class="tsr num">${rk}</span><span class="tsp ${tierOf(ovrOf(p.id))}${ph?"":" ni"}">${ph?`<img src="${esc(ph)}" alt="" loading="lazy">`:esc(initials(p.name))}</span><span class="tsn"><b>${esc(p.name)}</b><small>${sub?sub(y):esc(EPOS[eposOf(p)]?.[1]||p.pos||"")+" · "+y.games+" maç"}</small></span><b class="tsv num">${fmt(y)}</b>${pmStrip(p.id,pm)}</li>`}).join("")}</ol></section>`};
  const prevO=id=>{const st=S.stats[id];const h=st?.hist||[];return h.length>1?(h[h.length-2].gx??h[h.length-2].ovr):h.length===1?(st.baseX??st.base):genOf(id)};
  const played=p=>!p.guest&&(S.stats[p.id]?.games||0)>0;
  const rk=S.players.filter(played).sort((a,b)=>genOf(b.id)-genOf(a.id)||a.name.localeCompare(b.name,"tr"));
  const prk=S.players.filter(played).sort((a,b)=>prevO(b.id)-prevO(a.id)||a.name.localeCompare(b.name,"tr")).map(p=>p.id);
  const rkRows=(S.f.rkAll?rk:rk.slice(0,10)).map((p,i)=>{const mv=fin().length>1?prk.indexOf(p.id)-i:0;const d=S.stats[p.id]?.lastO||0;
    return `<li data-act="open" data-id="${esc(p.id)}"><span><span class="rk">${i+1}</span>${esc(p.name)} <span class="pchip" style="margin-left:4px">${eposOf(p)}</span></span><span class="rv2"><span class="mv ${mv>0?"up":mv<0?"down":""}">${mv>0?"▲"+mv:mv<0?"▼"+(-mv):""}</span><b class="num ${vcls(ovrOf(p.id))}">${ovrOf(p.id)}</b><span class="delta ${d>0?"pos":d<0?"neg":"zero"}" style="min-width:2.4em;text-align:right">${d?(d>0?"+":"−")+Math.abs(d):""}</span></span></li>`}).join("");
  const rkCard=`<section class="card board rank"><div class="ch"><div><h3>Reyting sıralaması</h3></div></div><ol>${rkRows}</ol>${rk.length>10?`<button class="btn sm ghost" data-act="rkAll">${S.f.rkAll?"Daha az göster":"Tümünü göster ("+rk.length+")"}</button>`:""}</section>`;
  if(S.f.sezV==="rekor"&&!S.fol)return oyTabs("rekor")+rekorHtml();
  let h=`${oyTabs("sezon")}<!--TRK-->`;
  if(!F.length)h+=`<section class="card"><div class="empty emp2">${empIc("top","pink")}<h3>Sezon yeni başlıyor</h3><p>Krallık yarışı boş, ilk golü atan zirveye yerleşir.</p></div></section>`;
  const hasT=fin().some(trkHas);const VW=[["yelek","Yelek"],["kral","Krallıklar"],["mevki","Mevkiler"],...(hasT||S.admin?[["saha","Saha"]]:[])];
  const sv=VW.some(x=>x[0]===S.f.sezV)?S.f.sezV:"yelek";
  if(F.length||sv==="saha")h+=`<div class="sx3" role="tablist" aria-label="İstatistik görünümü" style="--n:${VW.length}">${VW.map(([k,l])=>`<button role="tab" aria-selected="${sv===k}" class="${sv===k?"on":""}" data-act="tog1" data-k="sezV" data-v="${k}">${l}</button>`).join("")}</div>`;
  if(sv==="saha")return h+viewSaha().replace(oyTabs("saha"),"");
  if(F.length&&sv==="yelek")h+=mvpHtml(F);
  const ldCard=(t,c,val,fmt,filt,tie)=>{const v=p=>val(ys[p.id]);const all=S.players.filter(p=>!p.guest&&(ys[p.id]?.games||0)>0&&(filt?filt(ys[p.id]):v(p)>0)).sort((a,b)=>v(b)-v(a)||(ys[a.id].games-ys[b.id].games)||(tie?tie(ys[b.id])-tie(ys[a.id]):0)||a.name.localeCompare(b.name,"tr"));
    if(!all.length)return"";const[L,...R]=all.slice(0,3);const ph=photoOf(L.id);
    return `<div class="ldc ${c}"><span class="ldt">${dIcon({a:"top",b:"krampon",c:"yildiz",d:"grafik"}[c],"white",22)}${t}</span><button class="ldl" data-act="open" data-id="${esc(L.id)}"><span class="ldp">${ph?`<img src="${esc(ph)}" alt="">`:esc(initials(L.name))}</span><span class="ldn"><b>${esc(L.name)}</b><small>${esc(EPOS[eposOf(L)]?.[1]||"")} · ${ys[L.id].games} maç</small></span><b class="num ldv">${fmt(ys[L.id])}</b></button>${R.length?`<div class="ldr">${R.map((p,i)=>`<button data-act="open" data-id="${esc(p.id)}"><span class="num">${i+2}</span><span>${esc(p.name)}</span><b class="num">${fmt(ys[p.id])}</b></button>`).join("")}</div>`:""}</div>`};
  {const ids=new Set(S.players.map(p=>p.id));const pairs=Object.entries(S.tog||{}).map(([k,o])=>({a:k.split("|")[0],b:k.split("|")[1],o})).filter(x=>ids.has(x.a)&&ids.has(x.b));
   const best=pairs.filter(x=>x.o.n>=3&&x.o.W>0).sort((x,y)=>y.o.W/y.o.n-x.o.W/x.o.n||y.o.n-x.o.n).slice(0,5);
   const ga=pairs.filter(x=>x.o.ga>0).sort((x,y)=>y.o.ga-x.o.ga||y.o.n-x.o.n).slice(0,5);
   const rv=Object.entries(S.vs||{}).map(([k,o])=>({a:k.split("|")[0],b:k.split("|")[1],o})).filter(x=>ids.has(x.a)&&ids.has(x.b)&&x.o.n>=3).sort((x,y)=>y.o.n-x.o.n||Math.abs((x.o.w[x.a]||0)-(x.o.w[x.b]||0))-Math.abs((y.o.w[y.a]||0)-(y.o.w[y.b]||0))).slice(0,5);
   const li=(x,val)=>`<li data-act="cmpPair" data-a="${esc(x.a)}" data-b="${esc(x.b)}"><span>${esc(shortName(nameOf(x.a)))} & ${esc(shortName(nameOf(x.b)))}</span><b>${val}</b></li>`;
   const cardB=(t,sub,list)=>list.length?`<section class="card board"><h3>${t}</h3><ol>${list}</ol></section>`:"";
   const k1=cardB("İkili kimya","Aynı takımdayken en çok kazanan ikililer (en az 3 maç)",best.map(x=>li(x,`%${Math.round(x.o.W/x.o.n*100)} <span class="muted small">${x.o.W}/${x.o.n}</span>`)).join(""));
   const dl=Object.entries(S.duo||{}).map(([k,n])=>({a:k.split(">")[0],b:k.split(">")[1],n})).filter(x=>ids.has(x.a)&&ids.has(x.b)).sort((x,y)=>y.n-x.n).slice(0,5);
   const k2=dl.length?cardB("Gol–asist ikilileri","Pası veren → golü atan",dl.map(x=>`<li data-act="cmpPair" data-a="${esc(x.a)}" data-b="${esc(x.b)}"><span>${esc(shortName(nameOf(x.a)))} → ${esc(shortName(nameOf(x.b)))}</span><b>${x.n} gol</b></li>`).join(""))
     :cardB("Gole birlikte katkı","Aynı maçta ikisinin de gol ya da asisti olduğu maç sayısı",ga.map(x=>li(x,x.o.ga+" maç")).join(""));
   const k3="";
   var K12=[k1,k2]}
  if(F.length&&sv==="mevki")h+=posRaceHtml(F);
  if(F.length&&sv==="kral"){
    // tek tablo: her krallık bir satır (kim, kaç, birimiyle); dokununca tam sıralama açılır
    const kgRow=(t,unit,col,val,fmt,filt,asc,tie)=>{const v=p=>val(ys[p.id]);const all=S.players.filter(p=>!p.guest&&(ys[p.id]?.games||0)>0&&(filt?filt(ys[p.id]):v(p)>0))
        .sort((a,b)=>(asc?v(a)-v(b):v(b)-v(a))||(ys[a.id].games-ys[b.id].games)||(tie?tie(ys[b.id])-tie(ys[a.id]):0)||a.name.localeCompare(b.name,"tr"));
      if(!all.length)return"";const bk="kg_"+t.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ]/g,"");const open=!!S.f[bk];const L=all[0],f=p=>fmt(ys[p.id]);const eq=all.filter(p=>f(p)===f(L)).length-1;const nx=all[eq+1];
      const sub=eq>0?`aynı değerde ${eq} kişi daha`:nx?`2. <b>${esc(shortName(nameOf(nx.id)))}</b> · ${f(nx)}`:"";let rk=0,prev=null;
      return `<div class="kgr${open?" op":""}"><button class="kgh" data-act="tog" data-k="${bk}" aria-expanded="${open}">${pFace(L.id)}<span class="kgt"><small>${t}</small><b>${esc(L.name)}</b>${sub?`<small>${sub}</small>`:""}</span><span class="kgv"><b class="num" style="color:${col}">${f(L)}</b><small>${unit}</small></span></button>${open&&all.length>1?`<ol class="kgl">${all.slice(0,10).map((p,i)=>{const k=f(p);if(k!==prev){rk=i+1;prev=k}return i===0?"":`<li><button data-act="open" data-id="${esc(p.id)}"><i class="num">${rk}</i><span>${esc(p.name)}</span><small>${ys[p.id].games} maç</small><b class="num">${f(p)}</b></button></li>`}).join("")}</ol>`:""}</div>`};
    const rows=[kgRow("Gol kralı","gol","#FF7AC3",x=>x.g,x=>x.g,null,false,x=>x.a),kgRow("Asist kralı","asist","#5FE3F5",x=>x.a,x=>x.a,null,false,x=>x.g),kgRow("En çok maçın adamı","kez","#FFD400",x=>x.motm,x=>x.motm,null,false,x=>x.pts/x.games),
      kgRow("En yüksek not ortalaması","not","#00E58A",x=>x.aN,x=>fN(x.aN),x=>x.games>=minG,false,x=>x.games),kgRow("Haftanın takımına en çok giren","kez","#B79CFF",x=>x.totw,x=>x.totw,null,false,x=>x.pts/x.games),
      kgRow("En çok galibiyet","galibiyet","#FFD400",x=>x.W,x=>x.W,null,false,x=>x.D),kgRow("En yüksek galibiyet oranı","oran","#00E58A",x=>x.aW,x=>"%"+Math.round(x.aW*100),x=>x.games>=minG,false,x=>x.games),
      kgRow("Sezonun en iyi tek maçı","not","#FF7AC3",x=>x.best,x=>fN(x.best)),kgRow(yr==="all"?"En çok yükselen":"Sezonun yükseleni","reyting","#5FE3F5",x=>x.dOvr||0,x=>"+"+x.dOvr),
      kgRow("Kalede en az gol yiyen","maç başı","#FFD400",x=>x.aK,x=>fN(x.aK),x=>x.klG>=minK,true,x=>x.klG),kgRow("En çok maça çıkan","maç","#fff",x=>x.games,x=>x.games,null,false,x=>x.W),kgRow("En çok fiyasko","kez","#FF9DB3",x=>x.fiy,x=>x.fiy)].filter(Boolean);
    if(rows.length)h+=`<section class="kg">${rows.join("")}</section>`}
  return h;
}

/* ================= Puanlama ================= */
function viewKurallar(inSheet){
  const n=NOTE;const row=(a,b)=>`<div><span>${a}</span><b>${b}</b></div>`;const f=x=>x>0?"+"+fN(x):x<0?"−"+fN(-x):"0";
  const RL=[["KL","Kaleci"],["DF","Defans"],["DOS","Defansif orta saha"],["OS","Orta saha"],["FV","Forvet"]];
  return `<p class="muted small" style="margin:0 4px 12px">Bir başlığa dokun, ayrıntısı açılsın.</p>
  <details class="card rdet"><summary>${dIcon("para","gold",28)}<h2>Piyasa değeri</h2></summary><p class="muted small">FC 27'deki oyuncu değerlerinden ayarlandı. Her maçtan sonra güncellenir.</p><div class="rules">${row("Reyting","her reytingin sabit değeri var: 65 = 5 M €, 70 = 9 M €, 75 = 16 M €, 80 = 30 M €, 85 = 47 M €, 90 = 62,6 M €, 100 = 90 M €")}${row("Kaleci","×0,85")}${row("Yaş","15 yaş ×1,2 · 22 yaş ×1,1 · 27 yaş ×1 · 31 yaş ×0,93 · 35+ ×0,85, aralar kademeli")}${row("Form","en az 3 maç oynayanlarda son 5 maçın not ortalaması 7'nin üstündeyse +, altındaysa −; en fazla ±%15")}${row("Devamlılık","en az 5 maç oynandıktan sonra, son 8 maçın katılımına göre en fazla ±%10; yedeklere uygulanmaz")}${row("Kupalar","son sezonun her kupası +%5, daha eskiler +%2")}${row("Taban","en düşük 1 M €")}</div></details>
  <details class="card rdet"><summary>${dIcon("yildiz","gold",28)}<h2>Maç notu</h2></summary><p>Sahada yapılanlar (sonuç, gol, asist, yenilen gol, değerlendirme) toplanır. Sonra <b>maç dengesi</b> uygulanır: maçtaki ortadaki oyuncu ${fN(n.orta)} alacak şekilde herkesin notu aynı miktarda kaydırılır. Böylece notlar şişmez, kim maçın ortalamasının üstünde kim altında net görünür. Not ${fN(n.tavan)}'i geçerse aşan kısım yarı sayılır.</p>
   <p class="muted small">Değerlendirme notun aralığını belirler. Aralığın dışına taşan kısmın dörtte biri sayılır:</p>
   <div class="rules">${[1,2,3,4].map(k=>{const[lo,hi]=n.bant[k];return row(n.perf[k][1],k===1?"en az "+fN(lo):k===4?"en fazla "+fN(hi):fN(lo)+" – "+fN(hi))}).join("")}</div></details>
  <details class="card rdet"><summary>${dIcon("kupa","cyan",28)}<h2>Sonuç</h2></summary><div class="scroll-x"><table class="tbl"><thead><tr><th>Gol farkı</th><th>Kazanan</th><th>Kaybeden</th></tr></thead><tbody>
   ${n.fark.map((x,i)=>`<tr><td>${["0 · beraberlik","1–2 · çekişmeli","3–5 · net","6+ · farklı"][i]}</td><td>${f(x[1])}</td><td>${f(x[2])}</td></tr>`).join("")}</tbody></table></div></details>
  <details class="card rdet"><summary>${dIcon("top","pink",28)}<h2>Gol ve asist</h2></summary><p class="muted small">Oyuncu o maç sahada hangi mevkide oynadıysa ona göre sayılır. Bölgesinden uzak katkı daha değerli.</p>
   <div class="scroll-x"><table class="tbl"><thead><tr><th>Mevki</th><th>Gol</th><th>Asist</th><th>Katkı yok</th></tr></thead><tbody>
   ${RL.map(([k,l])=>`<tr><td>${l}</td><td>${f(n.gol[k])}</td><td>${f(n.asist[k])}</td><td>${n.bos[k]?f(n.bos[k]):"–"}</td></tr>`).join("")}</tbody></table></div>
   <p class="muted small">İlk 3 gol tam, 4. ve 5. gol ×0,6, 6. golden sonrası ×0,3 sayılır. Penaltı golü normal golün yarısıdır. Bol gollü maçta orta saha ve forvetin gol ve asist değeri düşer: maçta 12 gol varsa ×1, 16 gol ×0,75 (en az ×0,7), 10 gol ×1,15 (en fazla).</p></details>
  <details class="card rdet"><summary>${dIcon("eldiven","cyan",28)}<h2>Yenilen gol</h2></summary><p class="muted small">Grubun maç başı gol ortalamasına göre bakılır (şu an <b>${fN(gyOrt())}</b>). Ortalamanın altında gol yiyen savunma artı alır, üstünde yiyen eksi.</p><div class="scroll-x"><table class="tbl"><thead><tr><th>Ortalamaya göre</th><th>Kaleci</th><th>Defans</th><th>Def. orta saha</th></tr></thead><tbody>
   ${n.savunma.map(([lim,v],i)=>`<tr><td>${i===0?Math.abs(lim)+"+ az":i===n.savunma.length-1?(n.savunma[i-1][0]+1)+"+ fazla":(()=>{const a=n.savunma[i-1][0]+1,b=lim;const t=x=>x<0?Math.abs(x)+" az":x>0?x+" fazla":"aynı";return a===b?t(a):t(a)+" – "+t(b)})()}</td><td>${f(v.KL)}</td><td>${f(v.DF)}</td><td>${f(v.DOS)}</td></tr>`).join("")}</tbody></table></div><p class="muted small">Kalecinin yediği penaltı golleri yarım gol sayılır.</p></details>
  <details class="card rdet"><summary>${dIcon("grafik","lila",28)}<h2>Maç değerlendirmesi</h2></summary><p class="muted small">Maç başladıktan 1 saat sonra oylama açılır. Oynayan herkes kendisi hariç tüm oyuncuları çok iyi, iyi, orta veya kötü diye oylar (en fazla 3 kişiye çok iyi, 3 kişiye kötü denebilir; iyi ve orta sınırsız); sonunda "çok iyi" dediklerinden birini maçın adamı, "kötü" dediklerinden birini fiyasko seçer. En çok seçilen oyuncular maçın adamı ve fiyasko olur. Yönetici oylamayı kapatınca oyuncular aldıkları oyların ortalamasına göre sıralanır: 14 kişilik maçta ilk 3 çok iyi, sonraki 4 iyi, sonraki 4 orta, son 3 kötü olur. 6'dan az kişi oy verirse değerlendirme notu etkilemez. Kimin kime ne oy verdiğini sadece yönetici görür. Kurtarış sayısı tutulmadığı için kalecide değerlendirme daha ağır sayılır.</p>
   <div class="scroll-x"><table class="tbl"><thead><tr><th></th><th>Saha oyuncusu</th><th>Kaleci</th></tr></thead><tbody>${[1,2,3,4].map(k=>`<tr><td>${n.perf[k][1]}</td><td>${f(n.perf[k][0])}</td><td>${f(n.perfKL[k])}</td></tr>`).join("")}</tbody></table></div>
   <div class="rules">${row("Çizgiden çıkarma","+ forvetin o maçtaki gol değeri")}${row("Penaltı yaptırma","− forvet gol değerinin yarısı")}${row("Penaltı kaçırma","− atsaydı kazanacağı kadar")}${row("Penaltı kurtarma","+ forvetin o maçtaki gol değeri")}</div></details>
  <details class="card rdet"><summary>${dIcon("kisi","lila",28)}<h2>Herkes için</h2></summary><div class="rules">${row("Maçın Adamı",f(n.motm))}${row("Fiyasko",f(n.fiy)+" (Kötü de seçildiyse "+f(n.fiy*n.fiyKotu)+")")}${row("Kendi kalesine gol",f(n.kk))}</div></details>
  <details class="card rdet"><summary>${dIcon("kart","pink",28)}<h2>Kart</h2></summary><p>Eşik notu <b>maçın not ortalamasıdır</b>. Notu bunun üstünde olanın kartı yükselir, altında olanınki düşer: <b>kart değişimi = (not − eşik) × ${String(n.kat).replace(".",",")}</b>, tek maçta en fazla ±${fN(n.katMax)}. Bir maçta yükselenlerle düşenlerin toplamı sıfıra yakındır, reytingler toplu şişmez.</p>
   <p class="muted small">Yüksek kartlı oyuncudan beklenti de yüksektir: maçtaki ortalama karttan her 1 puan yukarıda olan için eşik ${String(n.esikAdim).replace(".",",")} artar, aşağıda olan için azalır.</p></details>
  <details class="card rdet"><summary>${dIcon("grafik","green",28)}<h2>Karttaki özellikler</h2></summary><p>Bir maçta bütün özellikler <b>aynı yöne</b> gider: kart yükseliyorsa hepsi artar, düşüyorsa hepsi düşer. Değişimin yarısı maçta yapılan işe yazılır, yarısı o maç oynadığın mevkinin ve kartının önemli özelliklerine yayılır.</p>
   <div class="rules">${row("Gol","bitiricilik ve pozisyon alma; hat-trick şut gücü")}${row("Asist","kısa pas ve vizyon; 2+ asist uzun pas")}${row("Defansta yenilen gol ve galibiyet","savunma bilinci, top kesme ve müdahaleye eşit")}${row("Kalecide yenilen gol","refleks ve yer tutma")}${row("Galibiyet (diğer mevkiler)","mevkinin oyun zekâsı: forvette pozisyon alma, orta sahada vizyon, kalecide yer tutma")}${row("Saha verisi","koşu, hız, pas, top kapma gibi veriler ilgili özelliğe")}${row("Kart düşerken","maçta yapılan iş düşüşten korunmaz ama ayrıca da düşmez; düşüş kartın geneline yayılır")}</div>
   <div class="rules">${row("Biten maç","puanı kesinleşir; kurallar sonradan değişse de geçmiş maçlar değişmez")}${row("Maç düzeltilirse","o maç ve sonraki maçlar yeniden hesaplanır")}${row("Maça gelmeyen","kartı değişmez")}${row("Yedek kadrodaki oyuncu","Gelmemek kartı etkilemez")}${row("Reyting","küsüratlı hesaplanır, kartta tam kısmı görünür (74,99 → 74)")}${row("Bir özellik başlangıçtan en fazla","±8")}${row("Eski maçların etkisi her maç","%5 azalır")}</div>
   <p class="muted small">Haftanın Takımı, form ve ortalamalar da maç notuna göre hesaplanır.</p></details>
  <details class="card rdet"><summary>${dIcon("yelek","gold",28)}<h2>Sezon ve ödüller</h2></summary><div class="rules">${row("Sezon",sLen()+" maç; puan durumu ve istatistikler her sezon sıfırlanır, reyting devam eder")}${row("Şampiyon","puan durumunda birinci")}${row("Gol ve asist kralı","en çok gol / asist; eşitlikte daha az maçta yapan")}
   ${row("Sezonun oyuncusu","mevki fark etmeksizin sezonda en çok Yelek puanı toplayan")}${row("Mevki ödülleri","Yelek puanı: her maçta mevkinin en iyi 3 notu 3-2-1 puan (6 altı puan almaz); gol forvette +1, orta sahada +1,25, defansta +1,5; asist forvette +0,5, orta sahada +0,75, defans ve kalecide +1; kaleci ve defans, maç notundaki gol yeme aralığına göre puan alır: ortalamanın 3 gol altı kaleci +1,6 / defans +1,3, 1 gol altı +1 / +0,8, ortalama civarı +0,3 / +0,2. Puanın hepsi sezonda en çok oynanan mevkide sayılır")}
   ${row("Düzeltilmiş ortalama","her oyuncuya 3 maç ekip ortalaması eklenmiş gibi hesaplanır; az maçla gelen tek parlak not öne geçemez")}</div></details>`;
}

/* ================= Ayarlar ================= */
/* ===== Giriş, takım üyeliği ve vitrin ===== */
const AUTH={sb:null,ready:false,lib:null};
/* açılışta kayıtlı oturumu kütüphaneyi beklemeden kullan; ayrıca son iyi oturumun yedeğini tut */
function storedSession(){try{const raw=localStorage.getItem("y_auth");if(!raw)return null;const j=JSON.parse(raw);const ses=j&&(j.currentSession||j);return ses&&ses.access_token?ses:null}catch(_){return null}}
function sessionBackup(ses){try{if(ses&&ses.refresh_token)localStorage.setItem("y_auth_bk",JSON.stringify({access_token:ses.access_token,refresh_token:ses.refresh_token,user:ses.user,at:Date.now()}))}catch(_){}}
{const ss=storedSession();if(ss&&ss.expires_at&&ss.expires_at*1000>Date.now()+60e3)S.session=ss;else if(ss)S.sessionStale=ss}
const authHdr=()=>S.session?.access_token?{Authorization:"Bearer "+S.session.access_token}:{};
const SBJS="vendor/supabase-2.117.3.js";
const authLib=()=>AUTH.lib||(AUTH.lib=new Promise((ok,no)=>{if(window.supabase)return ok(window.supabase);const s=document.createElement("script");s.src=SBJS;s.onload=()=>ok(window.supabase);s.onerror=()=>{AUTH.lib=null;no(new Error("lib"))};document.head.appendChild(s)}));
// hesap oturumu yoksa (saklı oturum da yoksa) önbellekteki üyelik geçmez: çıkış yapmış biri uygulamayı görmesin
/* topluluk: engelleme, şikâyet, uygunsuz kelime süzgeci */
const isBlk=p=>!!(p&&S.mem&&(S.mem.blocks||[]).includes(p));
const KFR=/(^|[^\p{L}])((?:amına|amina|amcık|amcik|siktir|sikeyim|sikerim|sikik|sikim|sikiş|orospu|oruspu|yarrak|yarak|pezevenk|kahpe|ibne|gavat|puşt|şerefsiz)[\p{L}]{0,6}|amk|aq|piç|piçler|piçlik|göt|götü|götün|götveren|götlek)(?![\p{L}])/giu;
const kfrOn=()=>LS.get("y_kfr")!=="0";
const temiz=t=>{t=String(t??"");return kfrOn()?t.replace(KFR,(m,a,w)=>a+w[0]+"*".repeat(Math.max(2,w.length-1))):t};
const REPW=["Hakaret ya da küfür","Taciz ya da zorbalık","Uygunsuz fotoğraf ya da içerik","Diğer"];
const repBtns=(k,ref,pid,snap)=>`<span class="rpq">Neden şikâyet ediyorsun?</span>${REPW.map(w=>`<button class="kbkeep" data-act="repSend" data-k="${k}" data-ref="${esc(ref)}" data-id="${esc(pid)}" data-s="${esc(String(snap||"").slice(0,200))}" data-v="${esc(w)}">${w}</button>`).join("")}<button class="kbkeep" data-act="repAsk" data-v="">Vazgeç</button>`;
const modBtns=(ref,pid)=>`<button class="kbkeep" data-act="repAsk" data-v="${esc(ref)}">Şikâyet et</button><button class="kbkeep" data-act="blkSet" data-id="${esc(pid)}" data-v="1">Engelle</button>`;
function modRow(pid){if(!isMember()||!pid||pid===myPid())return"";const b=isBlk(pid),sh=S.sheet||{};
  return `<div class="modr">${sh.rep==="p"?repBtns("oyuncu","",pid,nameOf(pid)):`<button data-act="repAsk" data-v="p">Şikâyet et</button><button data-act="blkSet" data-id="${esc(pid)}" data-v="${b?0:1}">${b?"Engeli kaldır":"Engelle"}</button>`}</div>`}
function modPatch(){const t=S.sheet&&S.sheet.type;if(t==="oda")odaPatch();else if(t==="betCom")betComPatch();else render(true)}
const isMember=()=>!!(S.mem&&S.mem.status==="onayli"&&(S.session||S.sessionStale));
const gated=()=>TID===0||(!!S.gate&&!isMember()&&!S.fol);
async function authInit(){
  LS.del("y_davet");const need=LS.get("y_auth")||/[?&]code=/.test(location.search)||S.gate;
  if(!need){AUTH.ready=true;return}
  await authStart()}
async function authStart(){
  if(AUTH.sb)return AUTH.sb;
  let lib;try{lib=await authLib()}catch(_){AUTH.fail=(AUTH.fail||0)+1;if(AUTH.fail===1)toast("Giriş servisi yüklenemedi, bağlantını kontrol et");if(AUTH.fail<4)setTimeout(()=>authStart().then(()=>render(true)),3000*AUTH.fail);return null}
  AUTH.sb=lib.createClient(SB_URL,SB_KEY,{auth:{flowType:"pkce",detectSessionInUrl:true,persistSession:true,autoRefreshToken:true,storageKey:"y_auth"}});
  try{const{data}=await AUTH.sb.auth.getSession();S.session=data.session||null}catch(_){S.session=S.session||null}
  if(!S.session)await sessionRestore();
  if(S.session)sessionBackup(S.session);
  AUTH.sb.auth.onAuthStateChange(async(ev,ses)=>{
    if(ses)sessionBackup(ses);
    if(ev==="SIGNED_OUT"&&!AUTH.byUser&&await sessionRestore())return;// kullanıcı çıkmadıysa sessizce geri dön
    const was=S.session?.user?.id;S.session=ses||null;if((ses?.user?.id||null)!==(was||null))afterAuth()});
  if(/[?&]code=/.test(location.search))history.replaceState(null,"",location.pathname+location.hash);
  await afterAuth();AUTH.ready=true;return AUTH.sb}
async function sessionRestore(){if(AUTH.restoring)return false;let bk=null;try{bk=JSON.parse(localStorage.getItem("y_auth_bk")||"null")}catch(_){}
  if(!bk||!bk.refresh_token||!AUTH.sb)return false;AUTH.restoring=true;
  try{for(let i=0;i<3;i++){if(navigator.onLine===false)await new Promise(r=>{const f=()=>{removeEventListener("online",f);r()};addEventListener("online",f);setTimeout(f,15e3)});
      const{data,error}=await AUTH.sb.auth.setSession({access_token:bk.access_token,refresh_token:bk.refresh_token});
      if(data&&data.session){S.session=data.session;sessionBackup(data.session);return true}
      if(error&&/invalid|revoked|not found|already used/i.test(error.message||"")){LS.del("y_auth_bk");return false}
      await new Promise(r=>setTimeout(r,1500*(i+1)))}}catch(_){}finally{AUTH.restoring=false}return false}
async function afterAuth(){
  const prevMem=S.mem;S.mem=null;if(!S.session)S.sessionStale=null;
  if(S.session){
    try{S.mem=await rpc("my_membership",{});try{const c=JSON.parse(localStorage.getItem("y_cache")||"null");if(c){c.mem=S.mem;localStorage.setItem("y_cache",JSON.stringify(c))}}catch(_){}}catch(_){S.mem=prevMem}
    if(isMember()){if(S.mem.player_id){S.me=S.mem.player_id;LS.set("y_me",S.me)}setTimeout(betPrefetch,400);rpc("push_prefs_get",{}).then(r=>{if(r&&r.ok){PUSH.off=r.off||[];if(S.tab==="ben")render(true)}}).catch(()=>{});
      if(S.mem.role==="yonetici"){S.admin=true;S.pin=S.pin||"";setTimeout(notesSync,1500)}
      if(!LS.get("y_hos")&&!S.sheet)S.sheet={type:"hos"}}
    if(S.sheet&&S.sheet.type==="login")S.sheet=null;
    S.fol=false;if(TID>0&&!isMember()){try{if(LS.get("y_folnext")===String(TID)){LS.del("y_folnext");await rpc("follow_set",{p_team:TID,p_on:true})}S.follows=await rpc("my_follows",{});S.fol=(S.follows||[]).some(t=>t.id===TID)}catch(_){}}
    if(!isMember()&&!S.fol&&(TID===0||!LS.get("y_team"))&&!(S.mem&&S.mem.status==="bekliyor")){try{S.myTeams=await rpc("my_teams",{})}catch(_){S.myTeams=null}
      const ok=(S.myTeams||[]).find(t=>t.status==="onayli")||(S.myTeams||[])[0];
      if(ok&&ok.id!==TID){teamGo(ok.id,ok.slug);return}
      if(!ok&&TID!==0&&!LS.get("y_team")){TID=0;LS.set("y_team","0");S.mem=null}}
    if(TID>0)LS.set("y_team",String(TID));
    if(TID>0&&S.gate&&!isMember()&&!S.fol&&!S.vit)vitrinLoad()}
  else S.admin=false;
  await load(true);render(true)}
/* Instagram, Facebook, TikTok gibi uygulamaların içindeki tarayıcıda Google girişi engelleniyor: önce gerçek tarayıcıya gönder */
const inApp=()=>/Instagram|FBAN|FBAV|FB_IAB|FBIOS|musical_ly|BytedanceWebview|TikTok|Snapchat|LinkedInApp|Twitter|Line\/|; wv\)/i.test(navigator.userAgent||"");
const curLink=()=>TID>0&&S.settings.slug?teamLink(LS.get("y_int")==="katil"):APPL;
const extLink=u=>{const x=u.replace(/^https?:\/\//,"");return isIOS()?"x-safari-https://"+x:"intent://"+x+"#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url="+encodeURIComponent(u)+";end"};
const inAppName=()=>{const u=navigator.userAgent||"";return /Instagram/i.test(u)?"Instagram":/FBAN|FBAV|FB_IAB|FBIOS/i.test(u)?"Facebook":/musical_ly|Bytedance|TikTok/i.test(u)?"TikTok":/Snapchat/i.test(u)?"Snapchat":/Twitter/i.test(u)?"X":/LinkedIn/i.test(u)?"LinkedIn":"Bu uygulama"};
const brName=()=>isIOS()?"Safari":"Chrome";
function iabSteps(){const br=brName();return `<ol class="iabs"><li>${isIOS()?"Sağ üstteki <b>•••</b> düğmesine bas":"Sağ üstteki <b>⋮</b> düğmesine bas"}</li><li><b>${isIOS()?"Dış tarayıcıda aç":"Tarayıcıda aç"}</b>'ı seç</li><li>${br}'de açılınca Google ile giriş yap</li></ol>`}
function sheetInApp(){const u=curLink(),br=brName();
  return `<div class="ch"><div><div class="eyebrow">Giriş</div><h2>${br}'de aç</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
  <p class="muted">${esc(inAppName())} içindeki tarayıcıda Google ile giriş yapılamıyor. Yelek'i ${br}'de aç, giriş orada sorunsuz çalışır.</p>
  <a class="btn primary block" href="${esc(extLink(u))}" rel="noopener">${br}'de aç</a>
  <div class="iab"><b>Açılmazsa</b><span>${isIOS()?"Sağ üstteki <b>•••</b> düğmesine bas, <b>Dış tarayıcıda aç</b>'ı seç.":"Sağ üstteki <b>⋮</b> düğmesine bas, <b>Tarayıcıda aç</b>'ı seç."}</span><span>Ya da linki kopyalayıp ${isIOS()?"Safari'ye":"Chrome'a"} yapıştır:</span>
  <div class="surl"><input type="text" readonly value="${esc(u.replace(/^https?:\/\//,""))}" aria-label="Link"></div><button class="btn block" data-act="copy" data-txt="${esc(u)}">${ICON.copy} Linki kopyala</button></div>${OTP_ON?'<div class="orsep"><span>ya da burada e-postanla gir</span></div>':""}${otpForm()}`}
async function signIn(provider){if(inApp()){S.sheet={type:"inapp"};render(true);return}
  const sb=await authStart();if(!sb)return;
  const{error}=await sb.auth.signInWithOAuth({provider,options:{redirectTo:location.origin+location.pathname}});
  if(error)toast(provider==="apple"?"Apple ile giriş şu an açık değil":"Google ile giriş şu an açık değil")}
async function signOut(){AUTH.byUser=true;LS.del("y_auth_bk");if(AUTH.sb){try{await AUTH.sb.auth.signOut()}catch(_){}}S.session=null;S.mem=null;S.admin=false;S.fol=false;S.sheet=null;S.view=null;S.f.setp="";S.f.leave=0;S.tab="mac";cacheClear();LS.del("y_me");S.me="";render(true);window.scrollTo(0,0);load(true)}
const G_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6a5.1 5.1 0 0 1-2.2 3.4v2.8h3.6c2-1.9 3.2-4.7 3.2-8.3z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.9A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.7 14c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7H2a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2 7l3.7 2.9C6.6 7.3 9.1 5.4 12 5.4z"/></svg>';
const APPLE_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7a4.6 4.6 0 0 0-3.6-2c-1.5-.2-3 .9-3.7.9s-2-.9-3.2-.8a4.8 4.8 0 0 0-4 2.4c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8 2.1-1.2 2.9-2.4a10 10 0 0 0 1.3-2.7c-.1 0-2.3-.9-2.3-3.9zM14 5.4a4.3 4.3 0 0 0 1-3.1 4.4 4.4 0 0 0-2.9 1.5 4.1 4.1 0 0 0-1 3c1.1.1 2.2-.5 2.9-1.4z"/></svg>';
// e-posta koduyla giriş: Supabase e-posta (SMTP) ayarı yapılınca true yapılır
const OTP_ON=true;
const SVG_MAIL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M4 7l8 6 8-6"/></svg>';
const SVG_WAIT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 3h10M7 21h10M8 3c0 4 8 5 8 9s-8 5-8 9M16 3c0 4-8 5-8 9s8 5 8 9"/></svg>';
const SVG_EXT='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9"/><path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"/></svg>';
function otpForm(){if(!OTP_ON)return"";const o=S.f.otp||(S.f.otp={email:"",code:"",sent:false});
  if(!o.sent)return `<form class="otpf" data-form="otpSend"><label class="f" for="otpEmail">E-posta adresin<input id="otpEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="off" data-bind="otp.email" value="${esc(o.email)}" placeholder="ornek@gmail.com"></label><button class="btn block flmail" type="submit"${o.busy?" disabled":""}>${o.busy?"Gönderiliyor…":"Giriş kodu gönder"}</button></form>`;
  return `<form class="otpf" data-form="otpVerify"><div class="otph"><span class="fwi">${SVG_MAIL}</span><b>E-postana bak</b><p><b>${esc(o.email)}</b> adresine bir giriş kodu gönderdik. Gelmediyse gereksiz klasörüne bak.</p></div><input id="otpCode" class="otpc" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="8" data-bind="otp.code" value="${esc(o.code)}" placeholder="Kod" aria-label="Giriş kodu"><button class="btn primary block flbig" type="submit"${o.busy?" disabled":""}>${o.busy?"Kontrol ediliyor…":"Giriş yap"}</button></form><div class="otpa"><button class="lnk" type="button" data-act="otpReset">E-postayı değiştir</button><form data-form="otpSend"><button class="lnk" type="submit"${o.busy?" disabled":""}>Yeni kod gönder</button></form></div>`}
function loginBtns(){if(S.f.otp&&S.f.otp.sent)return `<div class="lgb">${otpForm()}</div>`;
  return `<div class="lgb">${inApp()?"":`<button class="btn block lgg" data-act="oauth" data-v="google">${G_SVG} Google ile devam et</button>${OTP_ON?'<div class="orsep"><span>ya da e-postayla</span></div>':""}`}${otpForm()}</div>`}
function sheetLogin(){const sent=!!(S.f.otp&&S.f.otp.sent);
  return `<div class="ch"><div><div class="eyebrow">${!S.session&&!S.viaLink?"Yelek":IGH}</div><h2>${sent?"Kodu gir":"Giriş yap"}</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
   ${sent?"":`<p class="flsub">Şifre yok. Google hesabınla ya da e-postana gelen kodla girersin.</p>`}${loginBtns()}
   <p class="flpriv">Yöneticin sadece adını, e-postanı ve profil fotoğrafını görür. <a href="gizlilik.html">Gizlilik</a></p>`}
function claimList(){const g=S.gate&&!isMember();if(g){if(!S.vit){vitrinLoad();return[]}return(S.vit.players||[]).map(p=>({id:p.id,n:p.n}))}return S.players.map(p=>({id:p.id,n:p.name}))}
function newCardForm(){const c=S.f.nc||(S.f.nc={name:"",epos:"MO",alt:"",age:""});
  return `<div class="ncf"><p class="fls">Yönetici kartını bu bilgilerle açar, özelliklerini sonra kendisi girer.</p><label class="f" for="ncName">Ad soyad<input id="ncName" type="text" maxlength="40" autocomplete="name" data-bind="nc.name" value="${esc(c.name)}" placeholder="Adın ve soyadın"></label>
    <div class="grid2"><label class="f" for="ncPos">Mevki${posSelect("ncPos","nc.epos",c.epos)}</label><label class="f" for="ncAlt">Alternatif mevki${posSelect("ncAlt","nc.alt",c.alt,true,c.epos)}</label></div>
    <label class="f" for="ncAge">Yaş<input id="ncAge" type="number" inputmode="numeric" min="10" max="80" data-bind="nc.age" value="${esc(c.age)}" placeholder="Yaşın"></label>
    <button class="btn primary block flbig" data-act="ncReq">Kart isteği gönder</button></div>`}
function flowSteps(cur){const L=["Giriş","Takım","Kart","Onay"];
  return `<ol class="fst" aria-label="Katılım adımları">${L.map((t,i)=>`<li class="${i<cur?"ok":i===cur?"on":""}"${i===cur?' aria-current="step"':""}><i>${i<cur?"✓":i+1}</i><span>${t}</span></li>`).join("")}</ol>`}
function pickRows(){const L=claimList().slice().sort((a,b)=>a.n.localeCompare(b.n,"tr"));const q=trq(S.f.clq||"");const v=S.f.claim||"";
  if(!L.length)return `<p class="fpe">Kartlar yükleniyor…</p>`;const R=q?L.filter(p=>trq(p.n).includes(q)):L;
  if(!R.length)return `<p class="fpe">Bu adla kart yok.</p>`;
  return R.map(p=>`<button type="button" class="fpr${p.id===v?" on":""}" data-act="pick" data-id="${esc(p.id)}" aria-pressed="${p.id===v}"><span class="fav">${esc(initials(p.n))}</span><b>${esc(p.n)}</b><i aria-hidden="true"></i></button>`).join("")}
function pickBox(btn){const n=claimList().length;
  return `<div class="fpk">${n>8?`<input type="text" id="clQ" class="fpq" enterkeyhint="search" value="${esc(S.f.clq||"")}" placeholder="Adını ara" autocomplete="off" aria-label="Kart ara">`:""}<div class="fpl" id="clR">${pickRows()}</div></div><button class="btn primary block flbig" data-act="joinReq"${S.f.claim?"":" disabled"}>${btn}</button>`}
function tmHead(kick){const c=S.tcard;if(c===undefined&&TID>0){S.tcard=null;tcardLoad()}const nm=(c&&c.name)||S.settings.group_name||"Takım";
  const meta=c?[c.field,(GUNLER[+c.day]||"")+" "+String(c.time||"").slice(0,5),c.players?c.players+" oyuncu":""].filter(x=>x&&x.trim()).map(esc).join(" · "):"";
  return `<div class="flh"><span class="fcr">${esc(initials(nm))}</span><div><small>${kick}</small><b>${esc(nm)}</b>${meta?`<span>${meta}</span>`:""}</div></div>`}
const flFoot=(del)=>S.session?`<div class="flf"><span>${esc(S.session.user?.email||"")}</span><button class="lnk" data-act="signOut">Çıkış yap</button>${del?'<button class="lnk lnkd" data-act="delAcc">Hesabı sil</button>':""}</div>`:"";
function joinFlow(sess){
  if(!sess)return `<section class="fl">${tmHead("Takım daveti")}${flowSteps(0)}<p class="fls">Bu takımda oynuyorsan giriş yap, listeden kendi kartını seç. Yönetici onaylayınca takım açılır.</p><button class="btn primary block flbig" data-act="loginSheet">Giriş yap ve katıl</button><button class="lnk flalt" data-act="intSet" data-v="takip">Oynamıyorum, sadece takip edeceğim</button></section>`;
  const st=S.mem?.status||"yok";
  if(st==="bekliyor"){const cl=S.mem.claim,nc=S.mem.new_card;const nm=cl?(claimList().find(p=>p.id===cl)||{}).n:nc?nc.name:"";
    return `<section class="fl">${tmHead("Katılma isteği")}${flowSteps(3)}<div class="fbox"><span class="fwi">${SVG_WAIT}</span><b>İsteğin yöneticide</b><p>${nm?`<b>${esc(nm)}</b> ${cl?"kartıyla":"adıyla yeni kart isteyerek"} katılmak istedin. `:""}Yönetici onaylayınca kartın hesabına bağlanır ve takım açılır.</p></div>${waitPush()}
      ${S.f.chg?`<h3 class="flq">Hangisi sensin?</h3>${pickBox("Seçimi güncelle")}<button class="lnk flalt" data-act="tog" data-k="chg">Vazgeç</button>`:`<button class="lnk flalt" data-act="tog" data-k="chg">Yanlış kartı mı seçtin? Değiştir</button>`}${flFoot()}</section>`}
  if(st==="reddedildi")return `<section class="fl">${tmHead("Katılma isteği")}<div class="fbox no"><span class="fwi">${ICON.x}</span><b>İsteğin onaylanmadı</b><p>Bir yanlışlık olduysa takımın yöneticisiyle konuş.</p></div>${myTeamsList()}${flFoot()}</section>`;
  return `<section class="fl">${tmHead("Takıma katıl")}${flowSteps(2)}${S.f.ncOpen?`<h3 class="flq">Yeni kart iste</h3>${newCardForm()}<button class="lnk flalt" data-act="tog" data-k="ncOpen">Listeden kartımı seçeyim</button>`:`<h3 class="flq">Hangisi sensin?</h3>${pickBox("Katılma isteği gönder")}<button class="lnk flalt" data-act="tog" data-k="ncOpen">Kartım listede yok</button>`}${myTeamsList()}${flFoot()}</section>`}
function claimForm(sel,btn){const L=claimList().sort((a,b)=>a.n.localeCompare(b.n,"tr"));const v=S.f.claim||sel||"";
  return `<div class="clm"><label class="f" for="claimSel">Hangisi sensin?<select id="claimSel" data-bind="claim"><option value="">Kartını seç…</option>${L.map(p=>`<option value="${esc(p.id)}"${p.id===v?" selected":""}>${esc(p.n)}</option>`).join("")}</select></label><button class="btn primary sm" data-act="joinReq">${btn}</button></div>`}
/* takımlar */
async function teamsLoad(){if(!S.session)return;try{S.myTeams=await rpc("my_teams",{})}catch(_){S.myTeams=[]}render(true)}
function teamGo(id,slug){cacheClear();LS.set("y_team",String(id));LS.del("y_me");location.href=location.pathname}
function myTeamsList(){if(!S.session)return"";if(!S.myTeams){teamsLoad();return""}const L=S.myTeams.filter(t=>t.id!==TID);if(!L.length)return"";
  return `<div class="mtl"><small>Takımların</small>${L.map(t=>`<button class="mtr" data-act="${t.status==="takim_onay"?"noop":"teamGo"}" data-id="${t.id}" data-v="${esc(t.slug||"")}"><b>${esc(t.name)}</b><span>${t.status==="takim_onay"?"Takım onay bekliyor":t.status==="bekliyor"?"Onay bekliyor":t.role==="yonetici"?"Yönetici":"Üye"} ›</span></button>`).join("")}</div>`}
const FTABS=["gecmis","lig"],FBLOCK=["open","viewm","seasonStory","story","stDetail","cmpOpen","pmOpen","tab"];
const ICON_EYE='<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';
function folBar(){return `<section class="card folb"><span class="seti">${ICON_EYE}</span><span class="setx"><b>${esc(S.settings.group_name||"")}</b><small>Takip ediyorsun · fikstür ve puan durumu</small></span><button class="btn sm" data-act="ligs">Ligler</button></section>${pushAsk()}`}
async function hubLoad(){let r=null;try{r=await rpc("teams_hub",{})}catch(_){}S.hub={mine:(r&&r.mine)||[],all:(r&&r.all)||[]};render(true)}
const HTAG={yonetici:"Yönetici",uye:"Üye",bekliyor:"Onay bekliyor",takim_onay:"Takım onayı bekliyor",takip:"Takip"};
function hubResults(){const H=S.hub||{all:[]};const mine=new Map((H.mine||[]).map(t=>[t.id,t]));const q=trq(S.f.hq||"");
  const L=q?H.all.filter(t=>trq(t.name).includes(q)):H.all.filter(t=>!mine.has(t.id)).slice(0,8);
  if(!L.length)return `<p class="muted small hube">${q?"Bu adla takım yok.":"Şimdilik başka takım yok."}</p>`;
  return L.map(t=>{const m=mine.get(t.id);const btn=m&&m.tag!=="takip"?`<span class="htag">${HTAG[m.tag]||""}</span>`:`<span class="hbt"><button class="btn sm primary" data-act="hubJoin" data-id="${t.id}" data-v="${esc(t.slug||"")}">Katıl</button>${t.followable&&!m?`<button class="btn sm" data-act="folSet" data-id="${t.id}" data-v="1">Takip</button>`:""}</span>`;
    return `<div class="hrow"><span class="seti">${SI.grup}</span><span class="setx"><b>${esc(t.name)}</b><small>${t.field?esc(t.field)+" · ":""}${t.players} oyuncu</small></span>${btn}</div>`}).join("")}
function hubBody(){if(!S.hub){hubLoad();return `<div class="vskl"><i style="height:180px"></i></div>`}
  const M=S.hub.mine||[];
  return `${M.length?`<div class="hgrp"><small>Takımların</small>${M.map(t=>{const cur=t.id===TID;const go=t.tag==="takim_onay"||cur?"noop":"teamGo";
      return `<div class="hrow${cur?" cur":""}"><button class="hgo" data-act="${go}" data-id="${t.id}" data-v="${esc(t.slug||"")}"><span class="seti">${t.tag==="takip"?ICON_EYE:SI.grup}</span><span class="setx"><b>${esc(t.name)}</b><small>${HTAG[t.tag]||""}${cur?" · şu an buradasın":""}</small></span>${go==="teamGo"?'<i class="setc" aria-hidden="true">›</i>':""}</button>${t.tag==="takip"?`<button class="hx" data-act="folSet" data-id="${t.id}" data-v="0" aria-label="${esc(t.name)} takibini bırak">Bırak</button>`:""}</div>`}).join("")}</div>`:flowSteps(1)}
    <div class="hgrp"><small>Takım koduyla katıl</small><form class="tcf" data-form="tcode"><input type="text" id="tCode" class="tqs" data-bind="tcode" value="${esc(S.f.tcode||"")}" placeholder="Takım kodu" autocomplete="off" autocapitalize="off" aria-label="Takım kodu"><button class="btn primary" type="submit">Devam</button></form>
    <p class="fls">Kodu takımının yöneticisinden iste.</p></div>
    <button class="fnew" data-act="teamNew"><span class="fni">${ICON.plus}</span><span><b>Kendi takımını kur</b><small>Yöneticisi sen olursun, oyuncularını eklersin</small></span><i aria-hidden="true">›</i></button>`}
function sheetHub(){return `<div class="ch"><div><div class="eyebrow">Yelek</div><h2>Takımlar</h2></div><button class="btn sm" data-act="close">Kapat</button></div>${S.session?hubBody()+(S.fol||TID===0?`<button class="lnk" data-act="signOut">Çıkış yap</button><button class="lnk lnkd" data-act="delAcc">Hesabımı sil</button>`:""):`<p class="flsub">Takımına katılmak ya da bir ligi takip etmek için giriş yap.</p>${loginBtns()}`}`}
function uaShort(u){u=String(u||"");const os=/iPhone|iPad/.test(u)?"iPhone":/Android/.test(u)?"Android":/Mac OS/.test(u)?"Mac":/Windows/.test(u)?"Windows":"";const br=/CriOS|Chrome/.test(u)?"Chrome":/Instagram/.test(u)?"Instagram":/Safari/.test(u)?"Safari":/Firefox/.test(u)?"Firefox":"";return [os,br].filter(Boolean).join(" · ")}
function sheetBkKey(){const hd=`<div class="ch"><div><div class="eyebrow">Dış yedek</div><h2>Yedek anahtarı</h2></div><button class="btn sm" data-act="close">Kapat</button></div>`;
  if(!S.f.bk)return hd+`<p class="muted">Yeni bir anahtar oluşturulacak. Varsa eski anahtar geçersiz olur; GitHub'daki değeri de yenisiyle değiştirmen gerekir.</p><button class="btn primary block" data-act="bkKey" data-v="1">Anahtarı oluştur</button>`;
  return hd+`<div class="dacl"><p><b>Bu anahtar bir daha gösterilmeyecek.</b></p><div class="surl"><input type="text" readonly value="${esc(S.f.bk)}" aria-label="Yedek anahtarı"></div><button class="btn primary block" data-act="copy" data-txt="${esc(S.f.bk)}">${ICON.copy} Kopyala</button>
    <ol class="bkl"><li>GitHub'da <b>mhrcynk/yelek</b> → Settings → Secrets and variables → Actions</li><li><b>New repository secret</b>: adı <code>YELEK_YEDEK_ANAHTAR</code>, değeri bu anahtar</li><li>Actions → <b>Haftalık dış yedek</b> → <b>Run workflow</b> ile ilk yedeği hemen al</li><li>Anahtarın bir kopyasını şifre yöneticinde sakla; yoksa yedekler açılamaz</li></ol></div>`}
function platLinks(t){const r=(l,u)=>`<div class="plr"><small>${l}</small><span>${esc(u.replace(/^https?:\/\//,""))}</span><button class="btn sm" data-act="copy" data-txt="${esc(u)}">${ICON.copy} Kopyala</button></div>`;
  return `<div class="plx">${r("Uygulama linki · herkes",APPL)}<div class="plr"><small>Takım kodu</small><span>${esc(t.slug||"")}</span><button class="btn sm" data-act="copy" data-txt="${esc(t.slug||"")}">${ICON.copy} Kopyala</button></div><button class="lnk" data-act="platL" data-id="">Gizle</button></div>`}
function sheetDelAcc(){const hd=`<div class="ch"><div><div class="eyebrow">Hesap</div><h2>Hesabımı sil</h2></div><button class="btn sm" data-act="close">Kapat</button></div>`;
  if(!S.session)return "";const c=S.f.dac;if(c===undefined){S.f.dac=null;rpc("my_account_check",{}).then(r=>{S.f.dac=r||{solo_admin:[]};render(true)}).catch(()=>{S.f.dac={solo_admin:[]};render(true)})}
  if(!c)return hd+`<div class="vskl"><i style="height:120px"></i></div>`;
  const solo=c.solo_admin||[];
  if(solo.length)return hd+`<p class="muted">${solo.map(esc).join(", ")} takımının tek yöneticisisin. Hesabını silmeden önce Üyeler'den başka birini yönetici yap ya da takımı sil.</p><button class="btn block" data-act="close">Tamam</button>`;
  return hd+`<div class="dacl"><p><b>${esc(S.session.user?.email||"")}</b> hesabı silinir:</p><ul><li>Giriş hesabın ve takım üyeliklerin kaldırılır</li><li>Takip ettiğin ligler ve bildirim ayarların silinir</li><li>Oyuncu kartın ve maç istatistiklerin takımda kalır; kart artık hesabına bağlı olmaz</li></ul><p class="muted small">Bu işlem geri alınamaz. Onaylamak için aşağıya <b>SİL</b> yaz.</p></div>
    <input type="text" data-bind="dacT" value="${esc(S.f.dacT||"")}" placeholder="SİL" autocomplete="off" autocapitalize="characters" aria-label="Onay">
    <button class="btn danger block" data-act="delAccGo" ${S.f.dacBusy?"disabled":""}>${S.f.dacBusy?"Siliniyor…":"Hesabımı kalıcı olarak sil"}</button>`}
function sheetTeamNew(){if(S.f.tnSent)return `<div class="ch"><div><div class="eyebrow">Yelek</div><h2>İsteğin gönderildi</h2></div><button class="btn sm" data-act="close">Kapat</button></div><p class="muted"><b>${esc(S.f.tnSent)}</b> için takım kurma isteğin alındı. Onaylanınca bildirim gelecek ve takımın Takımlarım listesinde açılacak.</p><button class="btn primary block" data-act="close">Tamam</button>`;const f=S.f.tn||(S.f.tn={name:"",field:"",day:1,time:"21:00",ig:""});
  if(!S.session)return `<div class="ch"><div><h2>Takım kur</h2></div><button class="btn sm" data-act="close">Kapat</button></div><p class="flsub">Takım kurmak için önce giriş yap.</p>${loginBtns()}`;
  return `<div class="ch"><div><div class="eyebrow">Yelek</div><h2>Yeni takım kur</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
    <form data-form="teamNew" style="display:grid;gap:12px">
    <label class="f" for="tnName">Takım adı<input id="tnName" type="text" maxlength="40" required data-bind="tn.name" value="${esc(f.name)}" placeholder="Örn. Çarşamba Gücü"></label>
    <label class="f" for="tnField">Halı saha<input id="tnField" type="text" maxlength="60" data-bind="tn.field" value="${esc(f.field)}" placeholder="Örn. Yıldız Halı Saha"></label>
    <div class="grid2"><label class="f" for="tnDay">Maç günü<select id="tnDay" data-bind="tn.day">${GUNLER.map((g,i)=>`<option value="${i}"${+f.day===i?" selected":""}>${g}</option>`).join("")}</select></label>
    <label class="f" for="tnTime">Maç saati${timeSel("tnTime","tn.time",f.time)}</label></div>
    <label class="f" for="tnIg">Instagram hesabı (isteğe bağlı)<input id="tnIg" type="text" maxlength="30" data-bind="tn.ig" value="${esc(f.ig)}" placeholder="@takimhesabi" autocapitalize="off"></label>
    <p class="fls">Takımı kuran kişi yönetici olur. Takım onaylanınca açılır; oyuncularını ekler, linki ve takım kodunu paylaşırsın. Sadece onayladığın kişiler görür.</p>
    <button class="btn primary block" type="submit" ${S.f.tnBusy?"disabled":""}>${S.f.tnBusy?"Gönderiliyor…":"Takım isteği gönder"}</button></form>`}
function memCard(){if(!S.session)return `<section class="card mcard"><div><b>Hesabınla giriş yap</b><p class="muted small">Kartın hesabına bağlanır, başkası senin adına işlem yapamaz.</p></div><button class="btn primary sm" data-act="loginSheet">Giriş yap</button></section>`;
  const st=S.mem?.status||"yok";const em=esc(S.session.user?.email||"");
  if(st==="bekliyor"){const cl=S.mem.claim;const nc=S.mem.new_card;const nm=cl?(claimList().find(p=>p.id===cl)||{}).n:nc?nc.name+" (yeni kart)":"";
    return `<section class="card mcard wait col"><div><b>Onay bekleniyor</b><p class="muted small">${em} hesabıyla ${nm?`<b>${esc(nm)}</b> olarak `:""}katılma isteğin yöneticiye iletildi. Onaylanınca kartın bağlanır ve uygulama açılır.</p></div>${waitPush()}${claimForm(cl,cl?"Değiştir":"Gönder")}<button class="lnk" data-act="signOut">Çıkış yap</button></section>`}
  if(st==="reddedildi")return `<section class="card mcard"><div><b>İsteğin onaylanmadı</b><p class="muted small">Bir yanlışlık olduysa yöneticiyle konuş.</p></div><button class="btn ghost sm" data-act="signOut">Çıkış</button></section>`;
  if(st==="yok")return `<section class="card mcard col"><div><b>${esc(S.settings.group_name||"Takım")} takımına katıl</b><p class="muted small">${em} ile giriş yaptın. Listeden kendi kartını seç, istek yöneticiye gitsin.</p></div>${S.f.ncOpen?newCardForm():claimForm("","Katılma isteği gönder")}<button class="lnk" data-act="tog" data-k="ncOpen">${S.f.ncOpen?"Listeden kartımı seçeyim":"Kartım listede yok"}</button>
    <div class="orsep"><span>ya da</span></div><button class="btn block tnew" data-act="teamNew">${ICON.plus} Kendi takımını kur</button><p class="muted small" style="margin:0;text-align:center">Takımı kurarsın, yöneticisi olursun; oyuncularını ekleyip uygulama linkini paylaşırsın.</p>
    ${myTeamsList()}<button class="lnk" data-act="signOut">Çıkış yap</button></section>`;
  return ""}
function accountFoot(){return S.session?`<p class="muted small" style="text-align:center;margin:6px 0 0">${esc(S.session.user?.email||"")} · ${S.mem?.role==="yonetici"?"Yönetici · ":""}<button class="lnk" data-act="signOut">Çıkış yap</button></p>`:""}

/* yönetici: üyeler */
async function memLoad(){const a=await A("admin_members",{});S.memList=a?.rows||[];render(true)}
function adminMembers(){if(!S.admin)return"";if(!S.memList){memLoad();return `<div class="vskl"><i style="height:90px"></i><i style="height:180px"></i></div>`}
  const L=S.memList,pend=L.filter(m=>m.status==="bekliyor"),ok=L.filter(m=>m.status==="onayli");const myId=S.session?.user?.id;
  const taken=new Set(ok.map(m=>m.player_id).filter(Boolean));
  const opt=sel=>`<option value="">Kart seç…</option>`+S.players.filter(p=>!taken.has(p.id)||p.id===sel).sort((a,b)=>a.name.localeCompare(b.name,"tr")).map(p=>`<option value="${esc(p.id)}"${p.id===sel?" selected":""}>${esc(p.name)}</option>`).join("");
  const av=m=>`<span class="mav">${m.avatar?`<img src="${esc(m.avatar)}" alt="" referrerpolicy="no-referrer">`:esc(initials(m.name||m.email||"?"))}</span>`;
  const f=S.f.mem||(S.f.mem={});
  const pc=m=>{if(m.new_card&&!f["x_"+m.user_id]){const c=m.new_card;
      return `<div class="mreq"><div class="mrqh">${av(m)}<span class="setx"><b>${esc(m.name||c.name)}</b><small>${esc(m.email||"")}</small></span></div>
      <p class="mcl">Yeni kart istiyor: <b>${esc(c.name)}</b> · ${esc(EPOS[c.epos]?.[1]||c.epos)}${c.alt?" / "+esc(EPOS[c.alt]?.[1]||c.alt):""} · ${c.age} yaş</p>
      <div class="btns2"><button class="btn ghost" data-act="memNo" data-id="${esc(m.user_id)}">Reddet</button><button class="btn primary" data-act="memNew" data-id="${esc(m.user_id)}">Kartı oluştur ve onayla</button></div>
      <button class="lnk" data-act="tog" data-k="mem_x" data-u="${esc(m.user_id)}">Mevcut bir karta bağla</button></div>`}
    const cl=m.claim&&P(m.claim);const sel=f["p_"+m.user_id]||m.claim||"";const adm=!!f["r_"+m.user_id];
    return `<div class="mreq"><div class="mrqh">${av(m)}<span class="setx"><b>${esc(m.name||"İsimsiz")}</b><small>${esc(m.email||"")}</small></span></div>
      <p class="mcl">${cl?`Kendini <b>${esc(cl.name)}</b> olarak tanıttı`:"Kart seçmedi, aşağıdan sen bağla"}</p>
      <label class="f">Bağlanacak kart<select data-bind="mem.p_${esc(m.user_id)}">${opt(sel)}</select></label>
      <button class="mrl${adm?" on":""}" data-act="memRole" data-id="${esc(m.user_id)}" role="switch" aria-checked="${adm}"><span><b>Yönetici yap</b><small>Ayarları ve üyeleri yönetebilir</small></span><i class="sw ${adm?"on":""}"><i></i></i></button>
      ${(()=>{const hd=sel&&ok.find(o=>o.player_id===sel&&o.user_id!==m.user_id);return hd?`<div class="mtk"><b>Bu kart zaten bağlı</b><span>${esc(P(sel)?.name||"Kart")}, <b>${esc(hd.name||hd.email||"başka bir hesap")}</b>${hd.email&&hd.name?" ("+esc(hd.email)+")":""} hesabına bağlı. Aynı kişinin ikinci hesabıysa kartı bu hesaba taşı; eski hesap üye kalır ama kartsız olur, istersen aşağıdaki listeden kaldırırsın.</span></div>
      <div class="btns2"><button class="btn ghost" data-act="memNo" data-id="${esc(m.user_id)}">Reddet</button><button class="btn primary" data-act="memMove" data-id="${esc(m.user_id)}">Kartı taşı ve onayla</button></div>`:`<div class="btns2"><button class="btn ghost" data-act="memNo" data-id="${esc(m.user_id)}">Reddet</button><button class="btn primary" data-act="memOk" data-id="${esc(m.user_id)}">Onayla</button></div>`})()}</div>`};
  const or=m=>{const pl=m.player_id&&P(m.player_id);const me=m.user_id===myId;const ask=S.f.memDel===m.user_id;
    return `<div class="setr nolink">${av(m)}<span class="setx"><b>${esc(pl?pl.name:(m.name||m.email))}${m.role==="yonetici"?' <i class="mtag">Yönetici</i>':""}</b><small>${esc(m.email||"")}${pl?"":" · kart bağlı değil"}</small></span>
      ${me?'<span class="mme">Sen</span>':ask?`<button class="btn sm danger" data-act="memNo" data-id="${esc(m.user_id)}">Kaldır</button><button class="btn sm ghost" data-act="memDel" data-id="">Vazgeç</button>`:`<button class="mdel" data-act="memDel" data-id="${esc(m.user_id)}" aria-label="Üyeliği kaldır">${ICON.x}</button>`}</div>`};
  return `${pend.length?`<section class="sgrp"><h3>Bekleyen istekler · ${pend.length}</h3><div class="mreqs">${pend.map(pc).join("")}</div></section>`:""}
    <section class="sgrp"><h3 class="mh3">Onaylı üyeler · ${ok.length}<button class="mref" data-act="memLoad" aria-label="Yenile">${ICON.refresh||"Yenile"}</button></h3><div class="sbox">${ok.map(or).join("")||'<p class="muted small" style="padding:14px;margin:0">Henüz onaylı üye yok.</p>'}</div></section>
    <p class="snote">Linki açan kişi giriş yapıp takım kodunu yazar ve kendi kartını seçer, isteği buraya düşer. Sen onaylamadan uygulamayı göremez.</p>`}

/* vitrin: giriş yapmamış ziyaretçiye görünen sayfa */
async function vitrinLoad(){try{S.vit=await rpc("vitrin",{})}catch(_){S.vit=null}render(true)}
async function tcardLoad(){try{S.tcard=await rpc("team_card",{})}catch(_){S.tcard=null}render(true)}
function teamCardTop(sess){const c=S.tcard;if(c===undefined){S.tcard=null;tcardLoad()}
  if(!c)return `<section class="fl"><div class="vskl"><i style="height:150px"></i></div></section>`;
  if(!c.followable)return `<section class="fl">${tmHead("Takım")}<p class="fls">Bu takım sadece üyelerine açık. Takımda oynuyorsan katılma isteği gönder.</p><button class="btn primary block flbig" data-act="intSet" data-v="katil">Takıma katıl</button>${sess?myTeamsList()+flFoot():`<button class="lnk flalt" data-act="loginSheet">Zaten üyeysen giriş yap</button>`}</section>`;
  const L=c.last;const top=c.top||[];
  return `<section class="fl">${tmHead("Lig")}
    ${L?`<div class="tcl"><small>Son maç · ${esc(fmtShort(L.date))}</small><div class="tcs"><span>${esc(L.na)}</span><b class="num">${L.a}–${L.b}</b><span>${esc(L.nb)}</span></div></div>`:`<p class="fls">Sezonun ilk maçı henüz oynanmadı.</p>`}
    ${top.length?`<div class="tct"><small>Puan durumu · ilk ${top.length}</small>${top.map((r,i)=>`<div class="tcr"><i>${i+1}</i><span>${esc(r.n)}</span><em>${r.o} maç</em><b class="num">${r.p}</b></div>`).join("")}</div>`:""}
    <button class="btn primary block flbig" data-act="${sess?"folJoin":"folLogin"}">${sess?"Ligi takip et":"Giriş yap ve takip et"}</button>
    <p class="fls c">Skor ve puan durumu takipçilere açık, kartlar ve notlar takım üyelerine özel. Maç bitince sonuç bildirim olarak gelir.</p>
    <button class="lnk flalt" data-act="intSet" data-v="katil">Bu takımda oynuyorum, katılmak istiyorum</button>${sess?flFoot():""}</section>`}
function iabCard(){const br=brName(),u=curLink();
  return `<section class="fl"><div class="flh"><span class="fcr">${SVG_EXT}</span><div><small>${esc(inAppName())} tarayıcısı</small><b>E-postanla giriş yap</b></div></div>
    <p class="fls">${esc(inAppName())} içinde Google ile giriş çalışmaz. E-postana gelen kodla burada girebilir ya da Yelek'i ${br}'de açabilirsin.</p>${otpForm()}
    <div class="orsep"><span>ya da</span></div><a class="btn block" href="${esc(extLink(u))}" rel="noopener">${br}'de aç</a>
    <details class="fdet"><summary>${br}'de açılmazsa</summary>${iabSteps()}<button class="btn block" data-act="copy" data-txt="${esc(u)}">${ICON.copy} Linki kopyala</button></details></section>`}
function onbSlides(){
  const vote=(n,c,sel,op)=>`<div class="ob-v" style="opacity:${op}"><div class="ob-vh"><i style="border-color:${c}"></i><b>${n}</b></div><div class="ob-vb">${["Çok iyi","İyi","Orta","Kötü"].map((l,j)=>`<span class="${j===sel?"q"+(j+1):""}">${l}</span>`).join("")}</div></div>`;
  const tr='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M12 13v4M8 20h8M7 6H4a3 3 0 0 0 3 3M17 6h3a3 3 0 0 1-3 3"/></svg>';
  const S_=[
    [`<div class="ob-cards"><i class="b l"></i><i class="b r"></i><div class="ob-card"><b>81</b><small>STP</small><span>SEN</span><em>+2</em></div></div>`,"Sahada ne yaptıysan","kartında o yazar","Gol, asist, takım arkadaşlarının oyları ve saha verileri. Her maçtan sonra reytingin güncellenir."],
    [`<div class="ob-vs">${vote("Kerem A.","#FF3EA5",0,1)}${vote("Onur S.","#5FE3F5",1,1)}${vote("Barış K.","#5FE3F5",-1,.55)}</div>`,"Kim iyi oynadı?","Takım karar verir","Maç bitince herkes takım arkadaşlarını değerlendirir. Kimin ne verdiği gizli kalır, tartışma biter."],
    [`<div class="ob-pod"><div class="p2"><i></i><span><b>2</b><small>Burak T.</small></span></div><div class="p1">${tr}<i></i><span><b>1</b><small>Kerem A.</small></span></div><div class="p3"><i></i><span><b>3</b><small>Onur S.</small></span></div></div>`,"Her hafta","yeni bir sıralama","Puan durumu, gol ve asist krallığı, mevki yarışları. Sezon sonunda yeleği kim giyecek?"],
    [`<div class="ob-tk"><div class="ob-tkb"><small>BU HAFTAKİ BAKİYE</small><b>5.000<i> sikke</i></b></div><div class="ob-tkc"><div class="ob-tkh"><span>KOMBİNE</span><em>AÇIK</em></div><ul><li><span>Kartallar alır</span><b>1,76</b></li><li><span>Onur S. 2+ gol</span><b>3,10</b></li><li><span>Toplam gol 12,5 üst</span><b>1,81</b></li></ul><div class="ob-tkf"><span><small>Yatırılan</small><b>200</b></span><span class="r"><small>Olası kazanç</small><b>1.975</b></span></div></div></div>`,"Tahmin et,","kralı sen ol","Her hafta herkese 5.000 sikke. Maç sonucuna, gollere ve oyunculara tahmin yap. Sikke temsilidir, parayla ilgisi yok."],
    [`<div class="ob-od"><div class="ob-odh"><b>KARTALLAR</b><small>Soyunma odası · sadece takımın görür</small></div><div class="ob-odm"><span class="k"><i>K</i>Kerem · Kaptan<br><b>Önde baskı yapıyoruz, Ozan'ı ben tutarım</b></span><span class="p"><b>Kalede kim başlasın?</b><em><u style="width:64%"></u>Onur · 4</em><em><u style="width:36%"></u>Dönüşümlü · 2</em></span><span class="me"><b>@Burak sol kanat sende</b></span></div></div>`,"Taktik gizli,","soyunma odası senin","Kadrolar açıklanınca takımına özel sohbet açılır: anket, duyuru, görev, rakip raporu. Rakip göremez."],
    [`<div class="ob-sh"><div class="s2"><small>HAFTA 9</small><b>NOT KARNESİ</b></div><div class="s1"><small>16 KASIM · SONUÇ</small><b>KIRMIZILAR</b><strong>6–4</strong><b class="o">MAVİLER</b><span>Maçın adamı: Kerem A.</span></div></div>`,"Maçın hikâyesi","tek dokunuşla","Kadro afişi, skor, not karnesi ve kritik eşleşmeler Instagram'a hazır gelir."],
    [`<div class="ob-yl"><div class="ob-ylc">${tr}<span><small>SEZONUN YELEĞİ</small><b>Kerem A.</b></span></div><div class="ob-bd">${[["#FF3EA5","Gol kralı"],["#5FE3F5","Pas ustası"],["#00E58A","Demir duvar"],["#B9A8FF","Seri galip"]].map(([c,l])=>`<span><i style="background:${c}"></i>${l}</span>`).join("")}</div></div>`,"Bütün sezon yarış,","yeleği sen giy","Sezonun yeleği, mevki ödülleri ve rozetler. Her maç sezon sonundaki yarışa puan ekler."],
    [`<div class="ob-tr"><div class="ob-trk"><span><small>Koşu mesafesi</small><b>4,2<i> km</i></b></span><svg viewBox="0 0 120 60" aria-hidden="true"><path d="M0 50 L20 40 L40 44 L60 26 L80 30 L100 12 L120 18" fill="none" stroke="#00E58A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg></div><div class="ob-trs"><span><b>11</b><small>Sprint</small></span><span><b>26,4</b><small>km/s hız</small></span><span><b>%84</b><small>Pas isabeti</small></span></div></div>`,"Koştuğun","her metre sayılır","Akıllı sahanın koşu, sprint, hız ve pas verileri oyuncu sayfana işlenir, reytingini de etkiler."],
    [`<div class="ob-bl"><div class="ob-tm a"><b>KARTALLAR</b><span>Onur S. · Emre K.</span><span>Burak T. · Mert Y.</span><span>Kerem A. · Barış K.</span></div><div class="ob-tm b"><b>ŞİMŞEKLER</b><span>Ozan E. · Can D.</span><span>Serkan T. · Uğur M.</span><span>Arda B. · Hakan Ç.</span></div><div class="ob-pw"><div><b class="a">74,6</b><small>Takım gücü</small><b class="b">74,4</b></div><i><i></i></i></div></div>`,"Gelenleri seç,","takımlar dengelensin","Kim geliyor belli olunca reytinglere göre dengeli iki takım kurulur. İstersen kaptanlar seçer."]];
  return `<section class="onb onb2"><h1 class="onb-w">Yelek</h1><span class="onb-k">Halı saha ligi</span><p class="onb-p">Haftalık maçınızın kadrosu, sohbeti, tahmini ve oylaması tek yerde.</p>
    <ul class="onb-f">${[["#FF3EA5","yorum","#1C1240","Soyunma odası","Kadro açıklanınca takımın kendi odası açılır. Rakip göremez."],["#00E58A","bilet","#0C281B","Tahmin","Her hafta 5.000 sikke. Para yok, bahis değil; sadece keyfine. 18 yaş ve üzeri için."],["#FFD400","yildiz","#3A2E00","Oylama ve kartlar","Maçtan sonra herkes oy verir, kartların reytingi ona göre değişir."]].map(([c,ic,bg,t,d])=>`<li style="background:${bg}"><span style="background:${c}">${lIc(ic)}</span><span><b>${t}</b><small>${d}</small></span></li>`).join("")}</ul></section>`}
function ldBind(){const sc=document.getElementById("ldx");if(!sc||sc._b)return;sc._b=1;const ds=sc.nextElementSibling;if(!ds||!ds.classList.contains("ldd"))return;
  sc.addEventListener("scroll",()=>{const w=sc.firstElementChild?sc.firstElementChild.offsetWidth+12:1;const i=Math.round(sc.scrollLeft/w);[...ds.children].forEach((d,j)=>d.classList.toggle("on",j===i))},{passive:true})}
function onbBind(){const sc=document.getElementById("onbSc");if(!sc||sc._b)return;sc._b=1;
  sc.addEventListener("scroll",()=>{const i=Math.round(sc.scrollLeft/sc.clientWidth);document.querySelectorAll("#onbD button").forEach((b,j)=>b.classList.toggle("on",j===i))},{passive:true})}
function viewVitrin(){
  const sess=!!S.session;const nm=(S.session?.user?.user_metadata?.full_name||"").split(" ")[0];const av=S.session?.user?.user_metadata?.avatar_url;
  const cta=`<button class="btn lpgo" data-act="oauth" data-v="google">${G_SVG}<span>Google ile başla</span></button>${OTP_ON?`<button class="lnk lpalt lpmail" data-act="loginSheet">E-postanla giriş yap</button>`:""}`;
  let top="";const gen=!sess&&!S.viaLink;
  if(gen)top="";
  else if(TID>0&&(LS.get("y_int")||"takip")!=="katil")top=teamCardTop(sess);
  else if(TID>0)top=joinFlow(sess);
  else if(sess)top=`<section class="fl"><div class="flh"><span class="fcr">${av?`<img src="${esc(av)}" alt="" referrerpolicy="no-referrer">`:esc(initials(nm||"Y"))}</span><div><small>Hoş geldin${nm?", "+esc(nm):""}</small><b>Takımlar</b></div></div>${hubBody()}${flFoot(true)}</section>`;
  if(inApp()&&!sess)top=iabCard()+top;
  if(sess)return top+`<p class="vfoot"><span>Yelek</span><span>·</span><a href="gizlilik.html">Gizlilik</a></p>`;
  const feat=[["kart","Reyting kartları","Herkesin FIFA tarzı bir kartı var. Her maçtan sonra notuna göre reytingi ve özellikleri değişir."],
    ["oy","Maç sonu oylaması","Maç bitince herkes takım arkadaşlarını değerlendirir. Kimin ne verdiği gizli kalır, sonuç notlara yansır."],
    ["veri","Saha verileri","Akıllı sahanın koşu, sprint ve pas verileri oyuncunun sayfasına işlenir, reytingi de etkiler."],
    ["lig","Lig ve yarışlar","Puan durumu, gol ve asist krallığı, mevki yarışları, haftanın takımı ve sezonun oyuncusu."],
    ["saha","Kadro ve diziliş","Gelenleri işaretle, dengeli takımları kur ya da kaptanlara seçtir. Dizilişi sürükleyerek ayarla."],
    ["tahmin","Tahmin oyunu","Her hafta herkese 5.000 sikke. Maç sonucuna, gollere ve oyunculara tahmin yap, en çok kazanan tahmin kralı olur. Sikke temsilidir, parayla ilgisi yoktur. 18 yaşından küçük oyunculara kapalıdır."],
    ["oda","Soyunma odası","Kadrolar açıklanınca takımına özel sohbet açılır: anket, duyuru, görev, rakip raporu. Karşı takım göremez."],
    ["pay","Paylaşım görselleri","Maç afişi, skor, haftanın takımı ve piyasa değerleri Instagram'a hazır gelir."],
    ["zil","Bildirimler","Kadro açıklanınca, maç bitince ve oylama açılınca herkesin telefonuna bildirim gelir."],
    ["goz","Takipçi modu","Takımda oynamayanlar ligi takip eder; skoru ve puan durumunu görür, kartlar üyelere özel kalır."]];
  const FI={kart:'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h3"/>',oy:'<path d="M9 11l3 3 8-8"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>',veri:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',lig:'<path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M12 13v4M8 20h8"/>',saha:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M12 4v16"/><circle cx="12" cy="12" r="3"/>',pay:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/>',zil:'<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',goz:'<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'};
  const card=`<div class="lpcard"><div class="lpct"><b>82</b><span>STP</span></div><div class="lpcp">${SILH}</div><div class="lpcn">SEN</div><div class="lpcs"><span><b>78</b> HIZ</span><span><b>74</b> ŞUT</span><span><b>81</b> PAS</span><span><b>76</b> DRİ</span><span><b>84</b> DEF</span><span><b>80</b> FİZ</span></div></div>`;
  const home=(TID===0||gen)&&!inApp();
  const ctaM=`<div class="onb-cta"><button class="mzb w lgo" data-act="oauth" data-v="google">${G_SVG}<span>Google ile devam et</span></button>${OTP_ON?`<button class="mzb g2" data-act="loginSheet">E-postayla devam et</button>`:""}</div>`;
  return `${top}${onbSlides()}${home&&!inApp()?ctaM+`<p class="onb-nx">Girişten sonra takım kodunla takımına katılırsın ya da kendi takımını kurarsın.</p>`:""}
    <section class="lpsec"><span class="lpk">Sık sorulanlar</span><div class="lpfaq">
      <details><summary>Ücretli mi?</summary><p>Hayır, Yelek ücretsiz.</p></details>
      <details><summary>Takıma nasıl katılırım?</summary><p>Giriş yap, yöneticiden aldığın takım kodunu yaz ve listeden kartını seç. Kartın yoksa yeni kart iste. Yönetici onaylayınca içeridesin.</p></details>
      <details><summary>Kendi takımımı nasıl kurarım?</summary><p>Giriş yap, Takımlar ekranında "Kendi takımını kur"a dokun; takımın adını ve maç gününü yaz. İsteğin onaylanınca oyuncularını ekler, ekibini linkle davet edersin.</p></details>
      <details><summary>Tahmin oyunu nedir, para gerekir mi?</summary><p>Hayır. Her hafta her oyuncuya 5.000 sikke verilir; maç sonucu, gol sayısı ve oyuncular üzerine arkadaşlar arasında tahmin yaparsın. Sikke tamamen temsilidir: satın alınamaz, paraya çevrilemez, karşılığında ödül verilmez. Bir bahis ya da şans oyunu değildir. Yine de tahmin oyunu yalnızca 18 yaş ve üzeri oyunculara açıktır; yaş, oyuncu kartındaki doğum yılına göre belirlenir.</p></details>
      <details><summary>Soyunma odasını kimler görür?</summary><p>Sadece o maçta aynı takımda oynayanlar. Karşı takım ve takipçiler göremez. Maç bitince iki oda da bir gün boyunca takımın bütün üyelerine açılır, sonra silinir.</p></details>
      <details><summary>Reytingim neye göre değişir?</summary><p>Maç notuna göre. Not; gol, asist, maç sonucu, takım arkadaşlarının oyları ve varsa saha verilerinden çıkar.</p></details>
      <details><summary>Oylamada kimin ne verdiği görünür mü?</summary><p>Hayır. Herkes oyların dağılımını görür; kimin kime ne verdiğini sadece yönetici görür.</p></details>
      <details><summary>Verilerimizi kimler görür?</summary><p>Sadece takımın onayladığı üyeler. Takipçiler yalnızca skor ve puan durumunu görür. Takımlar birbirinin verisini göremez.</p></details>
      <details><summary>Instagram'dan açınca giriş olmuyor</summary><p>Instagram'ın tarayıcısı Google girişine izin vermiyor. E-postana gelen kodla gir ya da linki Safari veya Chrome'da aç.</p></details>
      <details><summary>Mağazadan mı indiriliyor?</summary><p>Hayır, tarayıcıdan açılır. Ana ekrana eklersen uygulama gibi çalışır ve bildirim alırsın.</p></details></div></section>
    <p class="vfoot"><span>Yelek</span><span>·</span><a href="gizlilik.html">Gizlilik</a></p>`}

/* bildirimler (web push) */
const PUSH={st:"?"};
const pushOk=()=>"serviceWorker"in navigator&&"PushManager"in window&&"Notification"in window;
const isIOS=()=>/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1);
const isStandalone=()=>matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
async function pushInit(){if(!("serviceWorker"in navigator)){PUSH.st="yok";return}
  try{PUSH.reg=await navigator.serviceWorker.register("sw.js")}catch(_){PUSH.st="yok";return}
  await pushCheck()}
async function pushCheck(){if(!pushOk()){PUSH.st=isIOS()&&!isStandalone()?"ios":"yok";return}
  if(Notification.permission==="denied"){PUSH.st="red";return}
  try{const r=PUSH.reg||await navigator.serviceWorker.ready;const sub=await r.pushManager.getSubscription();PUSH.st=sub?"acik":"kapali"}catch(_){PUSH.st="kapali"}}
const b64u=s=>{s=s.replace(/-/g,"+").replace(/_/g,"/");const r=atob(s+"===".slice((s.length+3)%4));return Uint8Array.from(r,c=>c.charCodeAt(0))};
async function pushOn(){if(PUSH.st==="ios"){S.f.setp="tel";S.tab="ben";render(true);toast("Önce uygulamayı ana ekrana ekle");return}
  if(!pushOk())return toast("Bu tarayıcı bildirim desteklemiyor");
  PUSH.busy=true;render(true);
  try{const perm=await Notification.requestPermission();if(perm!=="granted"){PUSH.st=perm==="denied"?"red":"kapali";toast(perm==="denied"?"Bildirim izni kapalı, telefon ayarlarından aç":"İzin verilmedi");return}
    const reg=PUSH.reg||await navigator.serviceWorker.ready;const key=await rpc("push_public",{});
    const sub=(await reg.pushManager.getSubscription())||await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64u(key)});
    const j=sub.toJSON();const r=await rpc("push_subscribe",{p_endpoint:j.endpoint,p_p256dh:j.keys.p256dh,p_auth:j.keys.auth,p_on:true});
    if(r&&r.error){toast("Bildirim açılamadı");return}PUSH.st="acik";LS.set("y_pushask","1");toast("Bildirimler açık")}
  catch(e){console.warn(e);toast("Bildirim açılamadı")}finally{PUSH.busy=false;render(true)}}
async function pushOff(){PUSH.busy=true;render(true);
  try{const reg=PUSH.reg||await navigator.serviceWorker.ready;const sub=await reg.pushManager.getSubscription();
    if(sub){const j=sub.toJSON();try{await rpc("push_subscribe",{p_endpoint:j.endpoint,p_p256dh:j.keys.p256dh,p_auth:j.keys.auth,p_on:false})}catch(_){}await sub.unsubscribe()}
    PUSH.st="kapali";toast("Bildirimler kapandı")}catch(_){toast("Kapatılamadı")}finally{PUSH.busy=false;render(true)}}
const pushSub=()=>({acik:`Açık · ${PUSH_CATS.length} türden ${PUSH_CATS.length-(PUSH.off||[]).length}\u2019${["ı","i","si","ü","ü","i","sı"][PUSH_CATS.length-(PUSH.off||[]).length]||"i"}`,kapali:"Kapalı",red:"İzin kapalı · telefon ayarlarından aç",ios:"Önce ana ekrana eklemelisin",yok:isIOS()&&!isStandalone()?"Önce Telefona ekle ile ana ekrana ekle":"Desteklenmiyor · Chrome ya da Safari ile aç","?":"…"}[PUSH.st]||"");
function waitPush(){const st=PUSH.st;if(st==="acik")return `<p class="wpush on">${SI.zil} Onaylanınca bildirim gelecek.</p>`;
  if(st==="kapali")return `<button class="btn block wpush" data-act="pushOn">${SI.zil} Onaylanınca bana haber ver</button>`;
  if(st==="ios")return `<p class="wpush">${SI.zil} Onaylanınca haber almak için önce uygulamayı ana ekrana ekle: Paylaş → Ana Ekrana Ekle.</p>`;return""}
function pushRow(){if(!S.session||!isMember())return"";const on=PUSH.st==="acik",can=PUSH.st==="acik"||PUSH.st==="kapali"||PUSH.st==="ios";
  return `<div class="setr nolink"><span class="seti">${SI.zil}</span><span class="setx"><b>Bildirimler</b><small>${pushSub()}</small></span>${can?`<button class="sw ${on?"on":""}" data-act="${on?"pushOff":"pushOn"}" role="switch" aria-checked="${on}" aria-label="Bildirimler" ${PUSH.busy?"disabled":""}><i></i></button>`:""}</div>${on?`<details class="pcd"><summary>Bildirim türleri</summary>`+PUSH_CATS.map(([k,t,d])=>{const o=!(PUSH.off||[]).includes(k);return `<div class="setr nolink setsub"><span class="setx"><b>${t}</b><small>${d}</small></span><button class="sw ${o?"on":""}" data-act="pushCat" data-k="${k}" role="switch" aria-checked="${o}" aria-label="${t}"><i></i></button></div>`}).join("")+`</details>`:""}`}
const PUSH_CATS=[["mac","Maç","Kadrolar, maç sonucu ve oylama"],["kupon","Tahminlerim","Tahminin tuttu, tahminine yorum ve beğeni"],["arkadas","Arkadaşların tahminleri","Yeni tahminler ve tutan tahminler"],["yaris","Haftanın tahmin kralı","Haftalık yarışın kazananı"],["sohbet","Soyunma odası sohbeti","Yeni mesajlar ve anketler"],["oda","Duyuru, görev ve etiket","Duyuru, dürtme, sana verilen görev, senden bahsedilmesi"]];
function pushAsk(){if(!S.session||!(isMember()||S.fol)||LS.get("y_pushask")||!(PUSH.st==="kapali"||PUSH.st==="ios"))return"";
  return `<section class="card pask"><span class="seti">${SI.zil}</span><span class="setx"><b>Bildirimleri aç</b><small>${PUSH.st==="ios"?"iPhone'da önce ana ekrana ekle, sonra buradan aç.":"Takımlar belli olunca ve maç sonucunda haber verelim."}</small></span><div class="pab"><button class="btn sm primary" data-act="pushOn">${PUSH.st==="ios"?"Nasıl?":"Aç"}</button><button class="btn sm ghost" data-act="pushNo" aria-label="Kapat">${ICON.x}</button></div></section>`}
const SI={
  uye:sv('<circle cx="9" cy="8" r="3.2"/><path d="M3 19c.6-3.2 3-5 6-5s5.4 1.8 6 5"/><path d="M16 4.5a3 3 0 0 1 0 6M18.5 14c1.5.7 2.4 2.4 2.5 5"/>'),
  kilit:sv('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  grup:sv('<path d="M4 20V9l8-5 8 5v11"/><path d="M9 20v-6h6v6"/>'),
  sezon:sv('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>'),
  kural:ICON.kural,
  tel:sv('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>'),
  pay:ICON.share||ICON.copy,
  gecmis:sv('<circle cx="12" cy="12" r="8"/><path d="M12 8v4l3 2"/>'),
  bulut:sv('<path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z"/><path d="M4 4l16 16"/>'),
  plus:sv('<path d="M12 5v14M5 12h14"/>'),
  platform:sv('<rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/>'),
  zil:sv('<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>'),
  cik:sv('<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3"/><path d="M10 16l-4-4 4-4M6 12h10"/>')};
const srow=(k,ic,t,sub,extra,cls)=>`<button class="setr ${cls||""}" data-act="${k.startsWith("@")?k.slice(1):"setp"}" ${k.startsWith("@")?"":`data-v="${k}"`}><span class="seti">${ic}</span><span class="setx"><b>${t}</b>${sub?`<small>${sub}</small>`:""}</span>${extra||""}<i class="setc" aria-hidden="true">›</i></button>`;
const sgrp=(t,rows)=>rows.filter(Boolean).length?`<section class="sgrp">${t?`<h3>${t}</h3>`:""}<div class="sbox">${rows.filter(Boolean).join("")}</div></section>`:"";

/* ilk giriş: hoş geldin */
function sheetHos(){const p=S.me&&P(S.me);const nm=p?p.name.split(" ")[0]:"";const ios=isIOS(),sa=isStandalone();const st=PUSH.st;
  const step=(n,t,body)=>`<div class="hstep"><i>${n}</i><div><b>${t}</b>${body}</div></div>`;let n=1;
  return `<div class="hos"><div class="hhd">${IGLOGO}<h2>Hoş geldin${nm?", "+esc(nm):""}!</h2><p class="muted">Artık takımdasın. Üç şey yeterli:</p></div>
    ${p?step(n++,"Bu senin kartın",`<button class="hcard" data-act="open" data-id="${esc(p.id)}">${avatar(p)}<span><b>${esc(p.name)}</b><small>${esc(eposOf(p))} · ${ovrOf(p.id)}</small></span><i>›</i></button>`):""}
    ${sa?"":step(n++,"Ana ekrana ekle",`<p>${ios?"Safari'de alttaki <b>Paylaş</b> düğmesine bas, <b>Ana Ekrana Ekle</b>'yi seç. Sonra uygulamayı oradan aç.":"Chrome'da sağ üstteki <b>üç noktaya</b> bas, <b>Ana ekrana ekle</b>'yi seç."}</p>`)}
    ${step(n++,"Bildirimleri aç",st==="acik"?`<p class="ok">Açık. Kadro ve sonuçlar telefonuna gelecek.</p>`:st==="kapali"?`<p>Kadro açıklanınca ve maç bitince haber verelim.</p><button class="btn sm primary" data-act="pushOn" ${PUSH.busy?"disabled":""}>Bildirimleri aç</button>`:st==="ios"?`<p>iPhone'da bildirim için önce ana ekrana eklemelisin. Ekledikten sonra Ayarlar'dan açabilirsin.</p>`:`<p>Bu tarayıcı bildirim desteklemiyor.</p>`)}
    <button class="btn primary block" data-act="hosOk">Başla</button></div>`}

/* yönetici: değişiklik geçmişi */
async function audLoad(){const a=await A("admin_audit",{});S.audit=a?.rows||[];render(true)}
const AUD_COL=[[/^state$/,"maç durumunu değiştirdi"],[/^(team_|lineup_|form_|pos_)/,"kadroyu düzenledi"],[/^(score_|stats$)/,"skor ve istatistikleri girdi"],[/^(motm|gol_id|fiy_id)$/,"ödülleri belirledi"],[/^cap_/,"kaptanları seçti"],[/^(date|time)$/,"tarihi değiştirdi"],[/^rsvp$/,"oynayacakları işaretledi"],[/^name_/,"takım adlarını değiştirdi"],[/^tac_/,"taktikleri düzenledi"],[/^archived$/,"arşivledi"],[/^links$/,"linkleri ekledi"],
  [/^attrs$/,"özelliklerini değiştirdi"],[/^(status|status_log)$/,"durumunu değiştirdi"],[/^(name|pos|epos|alt_pos|no|yedek)$/,"bilgilerini düzenledi"],[/^photo_v$/,"fotoğrafını değiştirdi"],[/^gate$/,"uygulama kilidini değiştirdi"],[/^(group_name|field_name|day|time|team_a_name|team_b_name)$/,"ekip ayarlarını değiştirdi"],[/^(season_len|season_closed)$/,"sezon ayarını değiştirdi"]];
function audText(r){const m=r.tbl==="matches"&&S.matches.find(x=>x.id===r.row_id);const pl=(r.tbl==="players"||r.tbl==="player_photos")&&(S.all.find(x=>x.id===r.row_id));
  const obj=m?`${fmtShort(m.date)} maçı`:pl?pl.name:r.tbl==="matches"?"Bir maç":r.tbl==="settings"?"":"Bir oyuncu";
  if(r.op==="INSERT")return r.tbl==="matches"?`${obj}: yeni maç açtı`:r.tbl==="player_photos"?`${obj}: fotoğraf yükledi`:`${obj}: yeni oyuncu ekledi`;
  if(r.op==="DELETE")return `${obj}: sildi`;
  const L=[];(r.cols||[]).forEach(c=>{const h=AUD_COL.find(([re])=>re.test(c));const t=h?h[1]:"düzenledi";if(!L.includes(t))L.push(t)});
  return (obj?obj+": ":"")+(L.join(", ")||"düzenledi")}
function audAgo(t){const d=(Date.now()-new Date(t))/6e4;return d<1?"şimdi":d<60?Math.round(d)+" dk önce":d<1440?Math.round(d/60)+" sa önce":new Date(t).toLocaleDateString("tr-TR",{day:"numeric",month:"short"})}
function adminAudit(){if(!S.admin)return"";if(!S.audit){audLoad();return `<div class="vskl"><i style="height:240px"></i></div>`}
  if(!S.audit.length)return `<p class="snote">Henüz kayıt yok. Bundan sonra yöneticilerin yaptığı değişiklikler burada görünecek.</p>`;
  return `<section class="sgrp"><h3 class="mh3">Son değişiklikler<button class="mref" data-act="audLoad">Yenile</button></h3><div class="sbox">${S.audit.map(r=>`<div class="setr nolink aud"><span class="setx"><b>${esc(audText(r))}</b><small>${esc(r.who||"Yönetici")} · ${audAgo(r.at)}</small></span></div>`).join("")}</div></section><p class="snote">Son 60 değişiklik. Oyuncuların kendi işlemleri burada görünmez.</p>`}
const SUBT={destek:"Destek ve şikâyet",sikayet:"Şikâyetler",kullanim:"Kullanım",hesap:"Hesabı sil",sil:"Takımı sil",platform:"Platform",gecmis:"Değişiklik geçmişi",uyeler:"Üyeler",grup:"Ekip ve saha",sezon:"Sezon",tel:"Telefona ekle",pay:"Linkler",pin:"Yönetici girişi"};
const APPL=location.origin+location.pathname;
const teamLink=()=>APPL;
function setSub(k){const url=teamLink();
  let h=`<button class="sback" data-act="setp" data-v="">${ICON_BACK} Ben</button>`;
  if(k==="uyeler")h+=adminMembers();
  else if(k==="kullanim")h+=usageView();
  else if(k==="hesap")h+=`<section class="card szx"><b>Hesabını silmek istiyor musun?</b><p class="snote" style="margin:0">Giriş hesabın, takım üyeliklerin, takip ettiğin ligler ve bildirim kayıtların kalıcı olarak silinir; geri alınamaz. Oyuncu kartın takımda kalır, yönetici isterse siler.</p><button class="btn ghost danger block" data-act="delAcc">Hesabımı kalıcı olarak sil</button></section>`;
  else if(k==="gecmis")h+=adminAudit();
  else if(k==="destek"){const B=(S.mem&&S.mem.blocks)||[];h+=`<section class="card szx"><b>Bize ulaş</b><p class="snote" style="margin:0">Soru, sorun ya da şikâyet için yaz:</p><p class="dmail">yelek.destek@gmail.com</p><div class="phpv-b"><button class="btn sm primary" data-act="mailCopy">Adresi kopyala</button><a class="btn sm ghost" href="mailto:yelek.destek@gmail.com">E-posta yaz</a></div></section>
    <section class="card szx"><b>Bir içeriği şikâyet et</b><p class="snote" style="margin:0">Sohbet mesajına ya da yoruma dokun, Şikâyet et'i seç. Bir oyuncuyu ya da fotoğrafını şikâyet etmek için kartını aç; Şikâyet et kartın altındadır. Şikâyetler takım yöneticisine gider ve en kısa sürede incelenir. Yöneticiyle ilgili bir şikâyetin varsa yukarıdaki adrese yaz.</p></section>
    <section class="sgrp"><h3>Engellediklerin · ${B.length}</h3><div class="sbox">${B.length?B.map(i=>`<div class="setr nolink"><span class="setx"><b>${esc(nameOf(i))}</b><small>Mesajları ve yorumları sana görünmüyor</small></span><button class="btn sm ghost" data-act="blkSet" data-id="${esc(i)}" data-v="0">Engeli kaldır</button></div>`).join(""):`<div class="setr nolink"><span class="setx"><small>Kimseyi engellemedin. Engellemek için mesaja, yoruma ya da oyuncu kartına dokun.</small></span></div>`}</div></section>`}
  else if(k==="sikayet"&&S.admin){if(!S.reps||S._repsT!==TID){S._repsT=TID;S.reps=null;rpc("report_list",{}).then(r=>{S.reps=(r&&r.rows)||[];if(S.mem)S.mem.reports=S.reps.length;render(true)}).catch(()=>{S.reps=[];render(true)});h+=`<div class="vskl"><i style="height:200px"></i></div>`}
    else h+=`<section class="card szx"><p class="snote" style="margin:0">Üyelerin şikâyet ettiği içerikler. Mesajı sohbetten, yorumu tahminin altından silebilir; fotoğrafı oyuncu kartından kaldırabilirsin. İşin bitince şikâyeti kapat.</p></section>`+(S.reps.length?S.reps.map(x=>`<section class="card szx repc"><b>${({mesaj:"Sohbet mesajı",yorum:"Yorum",oyuncu:"Oyuncu ya da fotoğraf"})[x.k]||"İçerik"}${x.p?" · "+esc(nameOf(x.p)):""}</b>${x.snap&&x.k!=="oyuncu"?`<q>${esc(x.snap)}</q>`:""}<p class="snote" style="margin:0">Neden: ${esc(x.why)} · Şikâyet eden: ${x.by?esc(nameOf(x.by)):"üye"} · ${new Date(x.at).toLocaleDateString("tr-TR",{day:"numeric",month:"long"})}</p><button class="btn sm ghost" data-act="repClose" data-v="${x.id}">Şikâyeti kapat</button></section>`).join(""):`<section class="card szx"><b>Açık şikâyet yok</b></section>`)}
  else if(k==="sil"&&S.admin&&TID!==1)h+=`<section class="card szx"><b>${esc(S.settings.group_name)} silinsin mi?</b><p class="snote" style="margin:0">Oyuncular, maçlar, kartlar, fotoğraflar ve üyelikler kalıcı olarak silinir; geri alınamaz. Onaylamak için takımın adını aynen yaz.</p>
    <input type="text" data-bind="tdel" value="${esc(S.f.tdel||"")}" placeholder="${esc(S.settings.group_name)}" autocomplete="off"><button class="btn danger block" data-act="teamDel">Takımı kalıcı olarak sil</button></section>`;
  else if(k==="platform"){if(!S.plat){rpc("platform_teams",{}).then(r=>{S.plat=(r&&r.rows)||[];render(true)}).catch(()=>{S.plat=[];render(true)});h+=`<div class="vskl"><i style="height:200px"></i></div>`}
    else h+=`<section class="sgrp"><h3>Takımlar · ${S.plat.length}</h3><div class="sbox">${S.plat.map(t=>`<div class="setr nolink"><span class="seti">${SI.grup}</span><span class="setx"><b>${esc(t.name)}${t.pending||t.active?"":" · kapalı"}</b><small>${[t.pending?"Onay bekliyor":"",esc(t.owner||""),t.players+" oyuncu",t.members+" üye",t.matches+" maç"].filter(Boolean).join(" · ")}</small></span>${t.pending?`<button class="btn sm primary" data-act="platOk" data-id="${t.id}" data-v="1">Onayla</button><button class="btn sm ghost danger" data-act="platOk" data-id="${t.id}" data-v="0">Reddet</button>`:t.id===1?'<span class="mme">Ana</span>':S.f.platDel===t.id?`<button class="btn sm danger" data-act="platDel" data-id="${t.id}" data-v="1">Kalıcı sil</button><button class="btn sm ghost" data-act="platDel" data-id="">Vazgeç</button>`:`<button class="sw ${t.active?"on":""}" data-act="platAct" data-id="${t.id}" data-v="${t.active?"0":"1"}" role="switch" aria-checked="${t.active}" aria-label="Takımı aç/kapat"><i></i></button><button class="mdel" data-act="platDel" data-id="${t.id}" aria-label="Takımı sil">${ICON.x}</button>`}</div>${t.pending||!t.slug?"":S.f.platL===t.id?platLinks(t):`<button class="lnk plnk" data-act="platL" data-id="${t.id}">Linkler ›</button>`}`).join("")}</div></section><p class="snote">Kapalı takımın linki çalışmaz, verisi durur. Silinen takımın bütün verisi (oyuncular, maçlar, fotoğraflar, üyeler) kaldırılır; güvenlik için bir kopyası yedekte saklanır.</p>`;
    if(!S.pbk){S.pbk="…";rpc("platform_backup_info",{}).then(r=>{S.pbk=r||{};render(true)}).catch(()=>{S.pbk={};render(true)})}
    {const b=typeof S.pbk==="object"?S.pbk:{};h+=`<section class="sgrp"><h3>Dış yedek</h3><div class="sbox"><div class="setr nolink"><span class="seti">${SI.platform}</span><span class="setx"><b>Haftalık şifreli yedek</b><small>${b.last_used?"Son yedek: "+esc(fmtShort(String(b.last_used).slice(0,10)))+" · toplam "+b.uses:"Henüz yedek alınmadı"}</small></span><button class="btn sm" data-act="bkKey">Anahtar oluştur</button></div></div><p class="snote">Her salı GitHub bütün veriyi şifreleyip Supabase dışında saklar (90 gün). Anahtar sadece bir kez gösterilir; yeni anahtar eskisini geçersiz yapar.</p></section>`}
    if(!S.perr){S.perr="…";rpc("platform_errors",{}).then(r=>{S.perr=(r&&r.rows)||[];render(true)}).catch(()=>{S.perr=[];render(true)})}
    if(Array.isArray(S.perr))h+=`<section class="sgrp"><h3>Hatalar · ${S.perr.length}</h3>${S.perr.length?`<div class="sbox perl">${S.perr.map(e=>`<div class="per"><b>${esc(e.msg)}</b><small>${esc([e.n>1?e.n+" kez":"",fmtShort(String(e.at).slice(0,10)),e.tab,e.src,e.team,"sürüm "+(e.ver||"?")].filter(Boolean).join(" · "))}</small><small class="perua">${esc(uaShort(e.ua))}</small></div>`).join("")}</div><button class="lnk" data-act="perrClear">Listeyi temizle</button>`:`<p class="snote">Kayıtlı hata yok. Birinin telefonunda beklenmeyen bir hata olursa burada görünür.</p>`}</section>`}
  else if(k==="grup"&&S.admin){const s=S.f.set||(S.f.set={...S.settings});if("logo_v" in S.settings)h+=`<div class="phrow lgrow"><span class="lgv">${S.logo?`<img src="${esc(S.logo)}" alt="">`:SI.grup}</span><div style="flex:1;min-width:0"><b>Takım logosu</b><p class="muted small">${S.f.lgBusy?"Yükleniyor…":S.logo?"":"Kare görsel en iyi sonucu verir."}</p></div><label class="btn sm primary" for="lgFile">${S.logo?"Değiştir":"Yükle"}</label><input class="vh" id="lgFile" type="file" accept="image/*" data-logo="1">${S.logo?`<button class="btn sm ghost" data-act="delLogo" aria-label="Logoyu kaldır">${ICON.x}</button>`:""}</div>`;h+=`<section class="card"><form data-form="settings" style="display:grid;gap:12px">
      <label class="f" for="sGroup">Ekip adı<input id="sGroup" type="text" maxlength="40" data-bind="set.group_name" value="${esc(s.group_name)}"></label>
      <label class="f" for="sField">Halı saha adı<input id="sField" type="text" maxlength="60" data-bind="set.field_name" value="${esc(s.field_name)}" placeholder="Örn. Yıldız Halı Saha"></label>
      <div class="grid2"><label class="f" for="sDay">Maç günü<select id="sDay" data-bind="set.day">${GUNLER.map((g,i)=>`<option value="${i}"${+s.day===i?" selected":""}>${g}</option>`).join("")}</select></label>
      <label class="f" for="sTime">Maç saati${timeSel("sTime","set.time",s.time)}</label></div>
      <button class="btn primary block" type="submit">Kaydet</button></form></section>`}
  else if(k==="sezon"&&S.admin){const n=seasonCount(curYr()),L=sLen();h+=`<section class="card szc"><div class="szh"><span class="eyebrow">Şu an</span><b>Sezon ${curYr()}</b><small>${n}/${L} maç oynandı${seasonDone(curYr())?" · tamamlandı":""}</small></div>
      <div class="szd">${Array.from({length:L},(_,i)=>`<i class="${i<n?"on":""}"></i>`).join("")}</div>${seasonDone(curYr())?'<p class="snote" style="margin:0">Bir sonraki maç yeni sezonu başlatır.</p>':""}</section>
    <section class="card" style="display:grid;gap:12px"><label class="f" for="sLen">Bir sezondaki maç sayısı<select id="sLen" data-bind="sLen">${[4,5,6,7,8,9,10,12,14,16].map(n=>`<option value="${n}"${n===+(S.f.sLen||sLen())?" selected":""}>${n} maç</option>`).join("")}</select></label>
      <button class="btn primary block" data-act="seasonSave">Kaydet</button></section>
    ${seasonDone(curYr())||!n?"":`<section class="card szx"><b>Sezonu erken bitir</b><p class="snote" style="margin:0">Oynanan maçlarla sezon kapanır, şampiyon belli olur. Geri alınamaz.</p><button class="btn ghost danger block" data-act="seasonClose">${S.f.sClose?"Emin misin? Sezon "+curYr()+" şimdi bitsin":"Sezonu şimdi bitir"}</button></section>`}
    ${(()=>{const F=fin(),fz=F.filter(m=>m.calc).length;return `<section class="card szx"><b>Kart puanları</b><p class="snote" style="margin:0">Biten maçların puanları kesinleşir; kurallar değişse de geçmiş aynı kalır. ${F.length?fz+"/"+F.length+" maç kesin.":""}</p><p class="snote" style="margin:0">Yeniden hesaplarsan bu sezonun bütün maçları güncel kurallarla baştan hesaplanır, kartlar değişebilir.</p><button class="btn ghost block" data-act="calcReset">${S.f.cReset?"Emin misin? Sezon "+curYr()+" yeniden hesaplansın":"Bu sezonu yeniden hesapla"}</button></section>`})()}`}
  else if(k==="tel")h+=`<p class="snote" style="margin:0 4px 10px">Ana ekrana eklersen uygulama gibi tam ekran açılır.</p><div class="sbox">
    <div class="setr nolink tels"><span class="seti">${SI.tel}</span><span class="setx"><b>iPhone · Safari</b><span>Alttaki <b>Paylaş</b> düğmesine bas, <b>Ana Ekrana Ekle</b>'yi seç.</span></span></div>
    <div class="setr nolink tels"><span class="seti">${SI.tel}</span><span class="setx"><b>Android · Chrome</b><span>Sağ üstteki <b>üç noktaya</b> bas, <b>Ana ekrana ekle</b>'yi seç.</span></span></div></div>`;
  else if(k==="pay"){const gn=S.settings.group_name||"Takım";const fo=!!S.settings.followable;const u=APPL;
    const code=S.settings.slug||"";const wa="⚽ "+gn+" artık Yelek'te. Linke gir, Google ya da e-postanla giriş yap, takım kodu olarak \""+code+"\" yaz ve kendi kartını seç (kartın yoksa yeni kart iste): "+u;
    h+=`<section class="card lnkc"><p class="muted small" style="margin:0">Herkese bu tek linki ve takım kodunu gönder. Zaten üye olan doğrudan takımına girer; yeni gelen kodu yazıp kartını seçer ya da yeni kart ister, sen onaylarsın.</p>
      <div class="surl"><input type="text" readonly value="${esc(u.replace(/^https?:\/\//,""))}" id="shareUrl" aria-label="Link"></div>
      <div class="setr nolink"><span class="setx"><b>Takım kodu</b><small>${esc(code)}</small></span><button class="btn sm" data-act="copy" data-txt="${esc(code)}">${ICON.copy} Kopyala</button></div>
      <div class="btns2"><a class="btn wa" href="https://wa.me/?text=${encodeURIComponent(wa)}" target="_blank" rel="noopener">${ICON.wa} WhatsApp</a><button class="btn" data-act="copy" data-txt="${esc(u)}">${ICON.copy} Kopyala</button></div>
      <p class="snote" style="margin:0">Instagram ya da Facebook içinden açanlar Safari veya Chrome'a geçebilir ya da e-posta koduyla orada giriş yapabilir.</p></section>
    ${S.mem?.role==="yonetici"?`<div class="sbox"><div class="setr nolink lnks"><span class="setx"><b>Takip edilebilir</b><small>${fo?"Üye olmayanlar da fikstürü ve puan durumunu izleyebilir":"Sadece üyeler görür"}</small></span><button class="sw ${fo?"on":""}" data-act="folOpen" data-v="${fo?"0":"1"}" role="switch" aria-checked="${fo}" aria-label="Takip edilebilir"><i></i></button></div></div>`:""}`}
  else if(k==="pin"){h+=`<section class="card"><form data-form="login" style="display:grid;gap:10px"><label class="f" for="pin">Şifre<input id="pin" type="password" autocomplete="current-password" data-bind="pin" value="${esc(S.f.pin||"")}"></label><button class="btn primary block" type="submit">Giriş yap</button></form></section>`}
  return h}
const viewAyarlar=()=>viewBen();
function ayarBody(){
  const adm=S.admin,pend=(S.memList||[]).filter(m=>m.status==="bekliyor").length,okN=(S.memList||[]).filter(m=>m.status==="onayli").length;
  if(adm&&!S.memList&&S.mem?.role==="yonetici")memLoad();
  let h="",acc="";
  if(S.session){const u=S.session.user||{};const md=u.user_metadata||{};const p=S.me&&P(S.me);
    acc=`<section class="sacc">${md.avatar_url?`<img src="${esc(md.avatar_url)}" alt="" referrerpolicy="no-referrer">`:`<span class="sav">${esc(initials(md.full_name||u.email||"?"))}</span>`}<span class="setx"><b>${esc(md.full_name||md.name||u.email||"")}</b><small>${esc(u.email||"")}</small><small>${p?esc(p.name)+" kartına bağlı":"Kart bağlı değil"}</small></span>${S.mem?.role==="yonetici"?'<i class="mtag">Yönetici</i>':""}</section>`}
  if(S.session){if(!S.myTeams)teamsLoad();const MT=Array.isArray(S.myTeams)?S.myTeams:[];
    const nM=MT.filter(t=>t.status==="onayli").length,nF=(S.follows||[]).length;const gn=S.settings.group_name||"Takım";
    h+=`<section class="stm"><span class="stm-c${S.logo?" lg":""}">${S.logo?`<img src="${esc(S.logo)}" alt="">`:esc(initials(gn))}</span><span class="stm-x"><small>Aktif takım${nM>1||nF?` · ${nM} takım${nF?", "+nF+" takip":""}`:""}</small><b>${esc(gn)}</b></span><button class="btn sm" data-act="hub">Değiştir</button></section>`}
  if(adm&&pend)h+=`<button class="salert" data-act="setp" data-v="uyeler"><b>${pend} katılma isteği</b><span>Onaylamak için dokun</span><i>›</i></button>`;
  if(adm&&S.mem?.role==="yonetici"){const fo=!!S.settings.followable;
    const tile=(ic,c,t,sub,on,act)=>`<div class="stg-t"><div class="stg-h"><span class="stg-i" style="color:${c}">${ic}</span><button class="sw ${on?"on":""}" data-act="${act}" data-v="${on?"0":"1"}" role="switch" aria-checked="${on}" aria-label="${t}"><i></i></button></div><b>${t}</b><small>${sub}</small></div>`;
    h+=`<div class="stg">${tile(SI.kilit,"#00E58A","Kilitli",S.gate?"Sadece onaylı üyeler görür":"Linki bilen herkes görür",!!S.gate,"gateSet")}${tile(ICON_EYE,"#5FE3F5","Takip edilebilir",fo?"Herkes fikstürü izleyebilir":"Sadece üyeler görür",fo,"folOpen")}</div>`}
  if(adm)h+=sgrp("Takım",[
    S.mem?.role==="yonetici"?srow("uyeler",SI.uye,"Üyeler",S.memList?`${okN} onaylı${pend?` · ${pend} bekliyor`:""}`:"Yükleniyor…",pend?`<span class="sbadge">${pend}</span>`:""):"",
    srow("grup",SI.grup,"Ekip ve saha",`${esc(S.settings.group_name||"")} · ${GUNLER[+S.settings.day]||""} ${esc(S.settings.time||"")}`),
    srow("sezon",SI.sezon,"Sezon",`Sezon ${curYr()} · ${seasonCount(curYr())}/${sLen()} maç`),
    S.mem?.role==="yonetici"?srow("gecmis",SI.gecmis,"Değişiklik geçmişi","Kim neyi ne zaman değiştirdi"):"",
    S.mem?.role==="yonetici"?srow("kullanim",SI.sezon,"Kullanım","Hangi bölüm kaç kez açıldı (kişi bilgisi yok)"):"",
    S.mem?.role==="yonetici"&&TID!==1?srow("sil",SI.cik,"Takımı sil","Bütün veriler kalıcı olarak silinir","","danger"):""]);
  h+=sgrp("Uygulama",[
    S.session&&S.session.user?.id==="d8bac3ce-40c8-4ef7-babe-0732872cd273"?srow("platform",SI.platform,"Platform","Bütün takımlar"):"",
    pushRow(),
    srow("@rulesSheet",SI.kural,"Puanlama kuralları","Not, reyting ve yelek puanı nasıl hesaplanır"),
    srow("tel",SI.tel,"Telefona ekle","Uygulama gibi ana ekrandan aç"),
    srow("pay",SI.pay,"Linkler","Uygulamanın tek linki"),
    srow("@gizlilik",SI.kilit,"Gizlilik","Hangi bilgiler tutulur, kim görür"),
    isMember()?srow("@kfrT",SI.kilit,"Uygunsuz kelimeleri gizle",kfrOn()?"Açık · sohbet ve yorumlarda yıldızlanır":"Kapalı"):"",
    S.admin?srow("sikayet",SI.kilit,"Şikâyetler",S.mem&&S.mem.reports?S.mem.reports+" açık şikâyet":"Açık şikâyet yok"):"",
    srow("destek",SI.kilit,"Destek ve şikâyet","yelek.destek@gmail.com")]);
  if(S.session)h+=`<section class="sgrp"><h3>Hesap</h3>${acc}</section>`+sgrp("",[srow("@signOut",SI.cik,"Çıkış yap","","","danger"),S.mem&&S.mem.status==="onayli"?srow("@leaveTeam",SI.cik,S.f.leave?"Emin misin? Tekrar dokun":"Takımdan ayrıl",S.f.leave?esc(S.settings.group_name)+" üyeliğin biter":"Kartın takımda kalır; istersen yeniden katılırsın"):"",srow("hesap",SI.cik,"Hesabı sil","Hesabın ve üyeliklerin kalıcı olarak silinir")]);
  return h}

/* ================= Olaylar ================= */
document.addEventListener("click",async e=>{
  const tb=e.target.closest(".nav button[data-tab]");if(tb){if(tb.dataset.tab==="ben"&&S.f.setp){S.f.setp="";if(S.tab==="ben"){render(true);window.scrollTo(0,0);return}}if(tb.dataset.tab===S.tab){window.scrollTo({top:0,behavior:RM?"auto":"smooth"});return}goTab(tb.dataset.tab,true);return}
  if(e.target.closest(".top .brand")&&S.session){S.hub=null;S.f.hq="";S.sheet={type:"hub"};render(true);return}
  if(S.f&&S.f.setp==="pay"&&e.target.closest(".lnkc .btn"))LS.set("y_shr_"+TID,"1");
  const el=e.target.closest("[data-act]");if(!el)return;try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}const a=el.dataset.act;if(a==="closeBg"&&e.target!==el)return;if(!/^(close|closeBg|tog|tab|setp)$/.test(a))useHit("act:"+(a==="tog1"?el.dataset.k+"_"+el.dataset.v:a).replace(/[^a-zA-Z0-9_]/g,"").slice(0,24));if(S.fol&&FBLOCK.includes(a))return;const id=el.dataset.id;const t=S.teams;
  switch(a){
    case"rosterSet":{const m=S.matches.find(x=>x.id===id);if(!m)break;const v=el.dataset.v;const ok=p=>!UNAVAIL.includes(stOf(p));let ids=[];
      if(v==="prev"){const pm=lastFinM();ids=pm?plAll(pm).filter(x=>P(x)&&!P(x).guest&&ok(P(x))):[]}
      else if(v==="ready")ids=S.players.filter(p=>!p.guest&&!p.yedek&&ok(p)).map(p=>p.id);
      const r=await A("admin_set_roster",{p_match:id,p_ids:ids},v==="none"?"Kadro temizlendi":ids.length+" oyuncu işaretlendi");break}
    case"copyTxt":{const m=S.matches.find(x=>x.id===id);if(!m)break;const tx=el.dataset.v==="teams"?teamsText(m):waText(m,rsvpLists(m));
      try{await navigator.clipboard.writeText(tx);toast("Kopyalandı · WhatsApp grubuna yapıştır")}catch(_){S.f.copyTx=tx;S.sheet={type:"txt"};render(true)}break}
    case"archList":S.f.kmenu=false;S.sheet={type:"arch"};render(true);break;
    case"restoreP":{const p=S.all.find(x=>x.id===id);await A("admin_restore_player",{p_id:id},(p?p.name:"Oyuncu")+" kadroya geri döndü");render(true);break}
    case"leaveTeam":{if(!S.f.leave){S.f.leave=1;render(true);break}S.f.leave=0;
      try{const r=await rpc("leave_team",{});if(r&&r.ok){LS.del("y_me");toast("Takımdan ayrıldın");setTimeout(()=>location.reload(),900)}else toast(r&&r.error==="tek_yonetici"?"Takımın tek yöneticisisin; önce başka birini yönetici yap":"Yapılamadı");render(true)}catch(_){toast("Yapılamadı, bağlantını kontrol et")}break}
    case"myStatus":S.f.ptab="genel";S.f.st=el.dataset.v&&el.dataset.v!==stOf(P(S.me))?{type:el.dataset.v,until:"",note:""}:null;S.f.stOpen=true;S.sheet={type:"player",id:S.me};render(true);break;
    case"gizlilik":window.open("gizlilik.html","_blank","noopener");break;
    case"duNew":S.sheet={type:"duello",mid:id,rival:null,kind:"gol"};render(true);break;
    case"duAns":S.sheet={type:"duello",mid:id,ans:el.dataset.v};render(true);break;
    case"duPick":if(S.sheet&&S.sheet.type==="duello"){S.sheet.rival=el.dataset.p;render(true)}break;
    case"duKind":if(S.sheet&&S.sheet.type==="duello"){S.sheet.kind=el.dataset.v;render(true)}break;
    case"duSend":{const sh=S.sheet;if(!sh||!sh.rival||!sh.kind)break;if(await duDo("duel_send",{p_match:sh.mid,p_rival:sh.rival,p_kind:sh.kind},"Meydan okuma gönderildi")){S.sheet=null}render(true);break}
    case"duYes":if(await duDo("duel_answer",{p_id:+el.dataset.v,p_ok:true},"Düello başladı")){S.sheet=null}render(true);break;
    case"duNo":if(await duDo("duel_answer",{p_id:+el.dataset.v,p_ok:false},"Reddedildi")){S.sheet=null}render(true);break;
    case"duCancel":await duDo("duel_cancel",{p_id:+el.dataset.v},"Geri çekildi");render(true);break;
    case"oySel":if(S.sheet&&S.sheet.type==="oysonuc"){S.sheet.sel=el.dataset.p;render(true);const b=$("#sheetBody");[b,b&&b.closest(".sheet")].forEach(e=>{try{e&&e.scrollTo({top:0,behavior:"smooth"})}catch(_){}})}break;
    case"oySonuc":S.sheet={type:"oysonuc",mid:id};render(true);break;
    case"msGo":S.view=id;S.tab="gecmis";S.f.mtab=el.dataset.v||"ozet";render(true);window.scrollTo(0,0);break;
    case"thkGo":S.f.bt=el.dataset.v||"oyna";goTab("iddia");break;
    case"rekTab":S.f.sezV="rekor";if(S.tab==="sezon")render(true);else goTab("sezon");window.scrollTo(0,0);break;
    case"bultenOpen":S.sheet={type:"bulten",id};render(true);break;
    case"odulOpen":S.sheet={type:"odul",n:+id};render(true);break;
    case"odulShare":shareSeason(+id);break;
    case"tab":{let tt=el.dataset.tab;if(tt==="ayarlar")tt="ben";if(tt==="ben")S.f.setp="";if(S.f.sezV==="rekor"){S.f.sezV="";if(tt==="sezon"&&S.tab==="sezon"){render(true);window.scrollTo(0,0);break}}goTab(tt);if(tt===S.tab)render(true);break}
    case"ptab":S.f.ptab=el.dataset.v;render(true);{const sh=document.querySelector(".sheet");if(sh)sh.scrollTop=0}break;
    case"open":S.f.ptab="genel";S.sheet={type:"player",id};S.f.st=null;S.f.stOpen=false;S.f.ed=null;S.f.delP=null;render(true);break;
    case"intSet":LS.set("y_int",el.dataset.v);render(true);window.scrollTo(0,0);break;
    case"folLogin":LS.set("y_folnext",String(TID));S.sheet={type:"login"};render(true);break;
    case"folJoin":{try{const r=await rpc("follow_set",{p_team:TID,p_on:true});if(r&&r.ok){S.fol=true;S.follows=null;S.tab="lig";await load(true);toast("Takip ediyorsun")}else toast(r&&r.error==="kapali"?"Bu lig takibe kapalı":"Yapılamadı")}catch(_){toast("Yapılamadı")}break}
    case"ligs":case"hub":S.hub=null;S.f.hq="";S.sheet={type:"hub"};render(true);break;
    case"folSet":{const on=el.dataset.v==="1";const tid=+id;try{const r=await rpc("follow_set",{p_team:tid,p_on:on});if(!r||!r.ok){toast(r&&r.error==="kapali"?"Bu lig takibe kapalı":"Yapılamadı");break}}catch(_){toast("Yapılamadı");break}
      toast(on?"Takip ediyorsun":"Takibi bıraktın");if(!on&&S.fol&&tid===TID){const mt=(S.myTeams||await rpc("my_teams",{}).catch(()=>[])||[]).find(t=>t.status==="onayli");teamGo(mt?mt.id:0,mt?mt.slug:"");break}
      S.flist=null;S.follows=null;if(S.hub)hubLoad();render(true);break}
    case"folOpen":{const on=el.dataset.v==="1";try{const r=await rpc("admin_set_followable",{p_on:on});if(r&&r.ok){S.settings.followable=on;toast(on?"Lig takibe açıldı":"Lig takibe kapandı");render(true)}else toast("Yapılamadı")}catch(_){toast("Yapılamadı")}break}
    case"meSheet":if(S.fol){S.hub=null;S.f.hq="";S.sheet={type:"hub"};render(true);break}if((isMember()&&!S.admin)||(S.me&&P(S.me)&&el.id==="meBtn")){S.f.setp="";S.view=null;goTab("ben");render(true);window.scrollTo(0,0)}else{S.sheet={type:"me"};render(true)}break;
    case"tog":{if(el.dataset.k==="mem_x"){const f=S.f.mem||(S.f.mem={});f["x_"+el.dataset.u]=!f["x_"+el.dataset.u]}else S.f[el.dataset.k]=!S.f[el.dataset.k];render(true);break}
    case"tog1":S.f[el.dataset.k]=el.dataset.v;render(true);break;
    case"setNames":{const m=S.matches.find(x=>x.id===id);const w=S.f["nm_"+id]||{};const a=cleanName(w.a??m.name_a??""),b=cleanName(w.b??m.name_b??"");if(!a||!b){toast("İki takımın adını da yaz");break}
      const r=await A("admin_set_names",{p_id:id,p_a:a,p_b:b},"Takım isimleri kaydedildi");if(r){delete S.f["nm_"+id];await load(true)}break}
    case"shareMenu":S.sheet={type:"share",mid:id};render(true);break;
    case"storyCard":{const p=P(id);if(p)storyCard(p);break}
    case"storyTotw":{const m=S.matches.find(x=>x.id===id);if(S.sheet&&S.sheet.type==="share"){S.sheet=null;render(true)}if(m)storyTotw(m);break}
    case"storyRes":case"storyMotm":{if(S.story)stPause(true);const m=S.matches.find(x=>x.id===id);if(S.sheet&&S.sheet.type==="share"){S.sheet=null;render(true)}if(m)shareStory(m,a==="storyMotm"?"motm":"res");break}
    case"addSheet":S.sheet={type:"add"};render(true);break;
    case"pickMe":if(!id&&S.me)LS.set("y_me_last",S.me);S.me=id||"";if(S.me){LS.set("y_me",S.me);LS.set("y_me_last",S.me)}if(S.me)LS.set("y_me",S.me);else LS.del("y_me");S.sheet=null;if(S.me){S.tab="ben";S.view=null}else if(S.tab==="ben")S.tab="mac";render(true);if(S.me)toast("Merhaba "+firstName(nameOf(S.me))+"!");break;
    case"close":case"closeBg":if(S.sheet&&S.sheet.type==="hos")LS.set("y_hos","1");if(S.sheet&&S.sheet.type==="kral")kralSeen();{const tam=S.sheet&&(S.sheet.type==="oda"||S.sheet.type==="betCom");S.f.tnSent=null;S.f.bk=null;S.sheet=null;if(tam&&document.activeElement&&document.activeElement.blur)document.activeElement.blur();render(true);if(tam){window.scrollTo(0,0);requestAnimationFrame(()=>window.scrollTo(0,0));setTimeout(()=>window.scrollTo(0,0),320)}}break;
    case"hosOk":LS.set("y_hos","1");S.sheet=null;render(true);break;
    case"audLoad":S.audit=null;render(true);break;
    case"oauth":signIn(el.dataset.v);break;
    case"hubJoin":{const tid=+el.dataset.id;if(!tid){toast("Takım bulunamadı");break}LS.set("y_int","katil");teamGo(tid);break}
    case"onbGo":{const sc=document.getElementById("onbSc");if(sc)sc.scrollTo({left:+el.dataset.v*sc.clientWidth,behavior:RM?"auto":"smooth"});break}
    case"loginSheet":S.sheet={type:"login"};render(true);break;
    case"pick":S.f.claim=el.dataset.id;render(true);break;
    case"signOut":signOut();break;
    case"joinReq":{const pid=S.f.claim||S.mem?.claim;if(!pid){toast("Önce kartını seç");break}try{const r=await rpc("request_join",{p_player:pid});if(r&&r.ok){toast("İsteğin yöneticiye gönderildi");S.mem=await rpc("my_membership",{});S.f.claim="";S.f.chg=false;render(true)}else toast(r&&r.error==="reddedildi"?"İsteğin yakın zamanda reddedildi. Takımın yöneticisiyle konuş.":"İstek gönderilemedi")}catch(_){toast("İstek gönderilemedi")}break}
    case"gateSet":{const on=el.dataset.v==="1";const r=await act("admin_set_gate",{p_pin:"",p_gate:on},on?"Uygulama kilitlendi":"Kilit kaldırıldı");if(r){S.gate=on;await load(true)}break}
    case"memLoad":S.memList=null;render(true);break;
    case"retry":load(true);break;
    case"gdHide":LS.set("y_gd_"+TID,"1");render(true);break;
    case"gdLink":S.f.lk=el.dataset.v;S.f.setp="pay";goTab("ayarlar");render(true);window.scrollTo(0,0);break;
    case"setpGo":S.f.setp=el.dataset.v;goTab("ayarlar");render(true);break;
    case"teamNew":S.f.tn=null;S.sheet={type:"teamNew"};render(true);break;
    case"teamGo":teamGo(+id,el.dataset.v);break;
    case"platDel":{if(el.dataset.v==="1"){const r=await rpc("platform_team_delete",{p_id:+id});if(r&&r.ok){toast("Takım silindi");S.plat=null;S.myTeams=null}else toast("Silinemedi");S.f.platDel=null}else S.f.platDel=id?+id:null;render(true);break}
    case"teamDel":{const r=await rpc("team_delete",{p_pin:"",p_confirm:S.f.tdel||""});if(r&&r.ok){toast("Takım silindi");cacheClear();LS.set("y_team","0");location.href=location.pathname}else toast(r&&r.error==="confirm"?"Takım adını aynen yaz":"Silinemedi");break}
    case"platOk":{const r=await rpc("platform_team_approve",{p_id:+id,p_ok:el.dataset.v==="1"});if(r&&r.ok){toast(el.dataset.v==="1"?"Takım onaylandı":"İstek reddedildi");S.plat=null;render(true)}else toast("Yapılamadı");break}
    case"delAcc":S.f.dac=undefined;S.f.dacT="";S.sheet={type:"delAcc"};render(true);break;
    case"delAccGo":{const v=String(S.f.dacT||"").trim().toLocaleUpperCase("tr");if(v!=="SİL"&&v!=="SIL"){toast("Onay için SİL yaz");break}if(S.f.dacBusy)break;S.f.dacBusy=true;render(true);
      try{const r=await rpc("delete_my_account",{p_confirm:v});if(r&&r.ok){S.sheet=null;cacheClear();LS.del("y_me");LS.set("y_team","0");LS.del("y_int");AUTH.byUser=true;LS.del("y_auth_bk");try{if(AUTH.sb)await AUTH.sb.auth.signOut()}catch(_){}try{localStorage.removeItem("y_auth")}catch(_){}toast("Hesabın silindi");setTimeout(()=>location.replace(location.pathname),900)}
        else toast(r&&r.error==="tek_yonetici"?"Önce başka bir yönetici seç":r&&r.error==="sahip"?"Platform sahibinin hesabı buradan silinmez":"Silinemedi")}catch(_){toast("Silinemedi")}finally{S.f.dacBusy=false;render(true)}break}
    case"lkTab":S.f.lk=el.dataset.v;render(true);break;
    case"bkKey":{if(el.dataset.v!=="1"){S.sheet={type:"bkKey"};S.f.bk=null;render(true);break}
      try{const a=new Uint8Array(32);crypto.getRandomValues(a);const k=[...a].map(x=>x.toString(16).padStart(2,"0")).join("");
        const hb=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(k));const hx=[...new Uint8Array(hb)].map(x=>x.toString(16).padStart(2,"0")).join("");
        const r=await rpc("platform_backup_key",{p_hash:hx});if(r&&r.ok){S.f.bk=k;S.pbk=null;render(true)}else toast("Anahtar kaydedilemedi")}catch(_){toast("Anahtar oluşturulamadı")}break}
    case"perrClear":{try{await rpc("platform_errors_clear",{})}catch(_){}S.perr=null;render(true);break}
    case"platL":S.f.platL=id?+id:null;render(true);break;
    case"platAct":{const r=await rpc("platform_team_active",{p_id:+id,p_on:el.dataset.v==="1"});if(r&&r.ok){S.plat=null;render(true)}else toast("Değiştirilemedi");break}
    case"pushOn":pushOn();break;
    case"pushOff":pushOff();break;
    case"pushNo":LS.set("y_pushask","1");render(true);break;
    case"memDel":S.f.memDel=id||"";render(true);break;
    case"memRole":{const f=S.f.mem||(S.f.mem={});f["r_"+id]=!f["r_"+id];render(true);break}
    case"setp":S.f.setp=el.dataset.v||"";if(S.f.setp==="platform"){S.perr=null;S.plat=null}render(true);window.scrollTo(0,0);break;
    case"memNew":{const m=(S.memList||[]).find(x=>x.user_id===id);const c=m&&m.new_card;if(!c)break;const pos=GROUP_POS[EPOS[c.epos]?.[0]]||"Orta saha";
      const a={};for(const[k,,,subs]of attrSet(pos))for(const[sk]of subs)a[k+"_"+sk]=65;
      const r=await A("admin_save_player_v2",{p_id:null,p_name:c.name,p_pos:pos,p_epos:c.epos,p_alt:c.alt||"",p_attrs:cleanAttrs(pos,a)});if(!r||!r.id)break;
      if(c.age)await A("admin_set_age",{p_id:r.id,p_age:+c.age});
      const d=await A("admin_member_decide",{p_user:id,p_status:"onayli",p_player:r.id,p_role:"uye"},"Kart oluşturuldu, üye onaylandı");
      if(d){memLoad();S.f.ptab="genel";S.f.ed=null;S.f.edOpen=true;S.sheet={type:"player",id:r.id};render(true);toast("Kartın özelliklerini düzenle")}break}
    case"otpReset":S.f.otp={email:(S.f.otp||{}).email||"",code:"",sent:false};render(true);break;
    case"ncReq":{const c=S.f.nc||{};const nm=String(c.name||"").trim().replace(/\s+/g," ");const ag=+c.age;
      if(nm.length<3||!nm.includes(" ")){toast("Adını ve soyadını yaz");break}if(!Number.isInteger(ag)||ag<10||ag>80){toast("Yaşını yaz");break}
      try{const r=await rpc("request_join",{p_card:{name:nm,epos:c.epos||"MO",alt:c.alt&&c.alt!==c.epos?c.alt:"",age:ag}});
        if(r&&r.ok){toast("Yeni kart isteğin yöneticiye gönderildi");S.f.ncOpen=false;S.mem=await rpc("my_membership",{});render(true)}
        else toast(r&&r.error==="reddedildi"?"İsteğin yakın zamanda reddedildi. Takımın yöneticisiyle konuş.":"İstek gönderilemedi")}catch(_){toast("İstek gönderilemedi")}break}
    case"memOk":{const f=S.f.mem||{};const pid=f["p_"+id]||(S.memList||[]).find(m=>m.user_id===id)?.claim||null;if(!pid){toast("Önce bağlanacak kartı seç");break}const r=await A("admin_member_decide",{p_user:id,p_status:"onayli",p_player:pid,p_role:f["r_"+id]?"yonetici":"uye"},"Üye onaylandı");if(r&&r.error==="player_taken")toast("Bu kart başka bir hesaba bağlı; kartı taşıyarak onaylayabilirsin");memLoad();break}
    case"memMove":{const f=S.f.mem||{};const pid=f["p_"+id]||(S.memList||[]).find(m=>m.user_id===id)?.claim||null;if(!pid){toast("Önce bağlanacak kartı seç");break}await A("admin_member_move",{p_user:id,p_player:pid,p_role:f["r_"+id]?"yonetici":"uye"},"Kart taşındı, üye onaylandı");memLoad();break}
    case"memNo":{const r=await A("admin_member_decide",{p_user:id,p_status:"reddedildi",p_player:null,p_role:null},"Üyelik kaldırıldı");S.f.memDel="";memLoad();break}
    case"invCopy":{const v=el.dataset.v;try{await navigator.clipboard.writeText(v);toast("Link kopyalandı")}catch(_){toast("Kopyalanamadı, linki elle seç")}break}
    case"pmOpen":S.f.pm=S.f.pm||{tab:"mac",fmt:"post"};S.sheet={type:"pm"};render(true);ypFonts().then(()=>{if(S.sheet&&S.sheet.type==="pm")render(true)});break;
    case"pmTab":S.f.pm.tab=el.dataset.v;S.f.pm.item=null;render(true);break;
    case"pmItem":if(el.dataset.t)S.f.pm.tab=el.dataset.t;S.f.pm.item=el.dataset.v;render(true);break;
    case"pmStep":pmStep(+el.dataset.v);break;
    case"pmFmt":S.f.pm.fmt=el.dataset.v;render(true);break;
    case"pmRace":S.f.pm.race=el.dataset.v;render(true);break;
    case"betPick":{if(!BET.amt)BET.amt=betDefAmt();const k=el.dataset.k,v=el.dataset.v;const ix=BET.slip.findIndex(l=>l.k===k&&l.s===v);
      if(ix>=0)BET.slip.splice(ix,1);else{const n0=BET.slip.length;if(k==="skor")BET.slip=BET.slip.filter(l=>l.k.includes(":")||l.k==="skor");else if(!k.includes(":"))BET.slip=BET.slip.filter(l=>l.k!=="skor");if(BET.slip.length<n0)toast("Skor tahmini, diğer maç seçimleriyle aynı tahmine girmez");const g=betGrp(k);const j=BET.slip.findIndex(l=>betGrp(l.k)===g);const leg={k,s:v,l:el.dataset.l,odd:+el.dataset.o};
        if(j>=0)BET.slip[j]=leg;else if(BET.slip.length>=4){toast(BET_ERR.legs);break}else BET.slip.push(leg)}
      render(true);break}
    case"betSk":{const m=betNext();const bd=m&&BET.board[m.id];if(!bd||!bd.skor)break;const c=betSk(bd);const t=el.dataset.t;c[t]=Math.max(0,Math.min(20,c[t]+(+el.dataset.d)));BET.sk=c;render(true);break}
    case"betClear":BET.slip=[];if(S.sheet&&S.sheet.type==="betSlip")S.sheet=null;render(true);break;
    case"kralOpen":if(BET.kral){S.sheet={type:"kral"};render(true)}break;
    case"kralOk":kralSeen();S.sheet=null;render(true);break;
    case"kralShare":kralSeen();S.f.pm={tab:"tahmin",item:"thafta",fmt:(S.f.pm&&S.f.pm.fmt)||"post"};S.sheet={type:"pm"};render(true);ypFonts().then(()=>{if(S.sheet&&S.sheet.type==="pm")render(true)});break;
    case"pushCat":{const k=el.dataset.k;const o=PUSH.off||[];const was=o.slice();PUSH.off=o.includes(k)?o.filter(x=>x!==k):[...o,k];render(true);
      try{const r=await rpc("push_prefs_set",{p_off:PUSH.off});if(!r||!r.ok)throw 0;PUSH.off=r.off||[]}catch(_){PUSH.off=was;toast("Kaydedilemedi");render(true)}break}
    case"betShare":S.f.pm={tab:"tahmin",item:el.dataset.v==="kazandi"?"tuttu":"kupon",cid:id,mid:el.dataset.m,fmt:(S.f.pm&&S.f.pm.fmt)||"post"};S.sheet={type:"pm"};render(true);ypFonts().then(()=>{if(S.sheet&&S.sheet.type==="pm")render(true)});break;
    case"betDaily":{const m=betNext();const bd=m&&BET.board[m.id];if(!bd)break;BET.slip=betDailyLegs(bd);if(!BET.amt)BET.amt=betDefAmt();S.sheet={type:"betSlip"};render(true);break}
    case"betCopy":{const m=betNext();const bd=m&&BET.board[m.id];const c=BET.feed&&BET.feed.rows.find(x=>x.id===id);if(!bd||!c)break;const me=myPid();const L=[];
      for(const l of c.legs||[]){if(l.k.includes(":")){if(l.k.split(":")[1]===me)continue;const pl=(bd.players||[]).find(p=>p.p===l.k.split(":")[1]);const o=pl&&pl.o.find(x=>x.k===l.k);if(o)L.push({k:l.k,s:"e",l:l.l,odd:o.odd})}
        else if(l.k==="skor"){const[a,b]=String(l.s).split("-").map(Number);const od=bd.skor&&bd.skor[a]&&bd.skor[a][b];if(od)L.push({k:l.k,s:l.s,l:l.l,odd:od})}
        else{const mk=bd.markets.find(x=>x.k===l.k);const o=mk&&mk.o.find(x=>x.s===l.s);if(o)L.push({k:l.k,s:l.s,l:l.l,odd:o.odd})}}
      if(!L.length){toast("Bu tahminin seçimleri artık oynanamıyor");break}if(L.length<(c.legs||[]).length)toast("Bazı seçimler eklenemedi (kendi adına tahmin ya da kapanan seçenek)");
      BET.slip=L;if(!BET.amt)BET.amt=betDefAmt();S.f.bt="oyna";S.sheet={type:"betSlip"};render(true);break}
    case"betReact":try{const r=await rpc("bet_react",{p_coupon:id,p_emoji:el.dataset.v});if(r&&r.ok&&r.c){const up=L=>{if(!L)return;const c=L.rows.find(x=>x.id===id);if(c){c.re=r.c.re;c.my=r.c.my}};up(BET.feed);Object.values(BET.lists).forEach(up);render(true)}}catch(_){toast("Bağlantı yok")}break;
    case"betCom":if(tahminYok()){toast("Tahmin 18 yaş ve üzeri için");break}S.sheet={type:"betCom",id};BET.com=null;render(true);try{const r=await rpc("bet_comments_read",{p_coupon:id});if(r&&r.ok){betComPut(id,r);if(S.sheet&&S.sheet.type==="betCom"){betComPatch();odaBottom()}}}catch(_){}break;
    case"betComSel":if(S.sheet){if(Date.now()-(ODA.tch||0)<900){ODA.lp=false;break}S.sheet.info=null;S.sheet.rep=null;S.sheet.sel=String(S.sheet.sel)===String(el.dataset.v)?null:el.dataset.v;betComPatch()}break;
    case"betComReply":if(S.sheet){S.sheet.reply=el.dataset.v||null;S.sheet.sel=null;S.sheet.info=null;betComPatch();const t=$("#betComTxt");if(t&&el.dataset.v)try{t.focus()}catch(_){}}break;
    case"betComInfo":if(S.sheet){S.sheet.info=el.dataset.v;S.sheet.sel=null;betComPatch()}break;
    case"betComCopy":{const x=BET.com&&BET.com.rows.find(r=>String(r.id)===String(el.dataset.v));if(!x)break;let ok=false;try{await navigator.clipboard.writeText(x.b);ok=true}catch(_){try{const t=document.createElement("textarea");t.value=x.b;t.style.cssText="position:fixed;opacity:0";document.body.appendChild(t);t.select();ok=document.execCommand("copy");t.remove()}catch(_){}}toast(ok?"Kopyalandı":"Kopyalanamadı");if(S.sheet){S.sheet.sel=null;betComPatch()}break}
    case"betComSend":{const t=$("#betComTxt");const v=(t&&t.value||"").trim();if(!v)break;t.value="";odaGrow(t);betAtList(null);try{t.blur()}catch(_){}const sh=S.sheet;sh.sel=null;sh.info=null;sh.busy=1;const rpId=sh.reply||null;sh.reply=null;
      if(BET.com&&BET.com.id===id){BET.com.rows.push({id:"t"+Date.now(),p:myPid(),b:v,r:rpId,at:new Date().toISOString(),tmp:1});betComPatch();odaBottom()}
      try{const r=await rpc("bet_comment",rpId?{p_coupon:id,p_body:v,p_reply:rpId}:{p_coupon:id,p_body:v});if(r&&r.ok){betComPut(id,r);const up=L=>{if(!L)return;const c=L.rows.find(x=>x.id===id);if(c)c.nc=r.rows.length};up(BET.feed);Object.values(BET.lists).forEach(up)}else{toast("Yorum gönderilemedi");if(BET.com)BET.com.rows=BET.com.rows.filter(x=>!x.tmp);if(t&&!t.value)t.value=v}}catch(_){toast("Bağlantı yok");if(BET.com)BET.com.rows=BET.com.rows.filter(x=>!x.tmp);if(t&&!t.value)t.value=v}
      if(S.sheet===sh){sh.busy=0;betComPatch();odaBottom()}break}
    case"betComDel":if(S.sheet){S.sheet.sel=null}try{const r=await rpc("bet_comment_del",{p_id:el.dataset.v});if(r&&r.ok&&BET.com){BET.com.rows=BET.com.rows.filter(x=>x.id!==el.dataset.v);const up=L=>{if(!L)return;const c=L.rows.find(x=>x.id===BET.com.id);if(c)c.nc=BET.com.rows.length};up(BET.feed);Object.values(BET.lists).forEach(up);if(S.sheet)S.sheet.sel=null;betComPatch()}}catch(_){}break;
    case"betFollow":{const on=!betFollows().includes(id);try{const r=await rpc("bet_follow",{p_target:id,p_on:on});if(r&&r.ok){if(BET.feed)BET.feed.f=r.f;toast(on?"Takip ediliyor: büyük tahmin yapınca ve tahmini tutunca bildirim gelir":"Takipten çıkıldı");render(true)}}catch(_){toast("Bağlantı yok")}break}
    case"betDefAmt":{const v=Math.max(0,Math.floor(+($("#betDef")?.value)||0));try{if(v>=10)localStorage.setItem("y_bet_amt",String(v));else localStorage.removeItem("y_bet_amt")}catch(_){}toast(v>=10?`Varsayılan tutar ${fJ(v)} sikke`:"Varsayılan tutar kaldırıldı");break}
    case"odaOpen":S.sheet={type:"oda",mid:id,tab:"sohbet",from:+LS.get("y_oda_"+id)||0,nwP:true};odaSeen(id);odaSeenSrv(id);odaReadSrv(id);render(true);setTimeout(odaBottom,60);odaLoad(id,true);{const c=document.getElementById("odaCard"),m=S.matches.find(x=>x.id===id);if(c&&m)c.outerHTML=odaCard(m)}break;
    case"odaTab":if(S.sheet){S.sheet.tab=el.dataset.v;S.sheet.plus=false;odaRender(true)}break;
    case"odaSide":if(S.sheet){S.sheet.side=el.dataset.v;S.sheet.sel=null;S.sheet.info=null;S.sheet.reply=null;odaRender(true);odaReadSrv(S.sheet.mid)}break;
    case"odaSend":{const t=$("#odaTxt");const v=(t&&t.value||"").trim();if(!v)break;t.value="";odaGrow(t);odaAtList(null);try{t.blur()}catch(_){}const sh=S.sheet,rp=sh.reply||null,an=!!sh.ann;sh.reply=null;sh.sel=null;sh.ann=false;sh.plus=false;sh.nwP=false;sh.dn=0;
      if(sh.edit){const eid=sh.edit;sh.edit=null;try{const r=await rpc("room_edit",{p_msg:+eid,p_body:v});if(r&&r.ok){ODA.d[sh.mid]=r;odaPatch()}else{toast(r&&r.error==="late"?"Düzenleme süresi doldu (5 dakika)":"Düzenlenemedi");odaPatch()}}catch(_){toast("Bağlantı yok");odaPatch()}break}
      const d=odaRoom(ODA.d[sh.mid]);if(d&&d.msgs&&!an){d.msgs.push({id:"t"+Date.now(),p:myPid(),k:"msg",b:v,t:new Date().toISOString(),r:rp,tmp:1});odaPatch();odaBottom()}
      if(await odaDo("room_send",{p_match:sh.mid,p_body:v,p_quick:an?"duyuru":null,p_reply:rp&&!an?+rp:null},an)){if(an)toast("Duyuru gönderildi");odaBottom()}else{const d2=odaRoom(ODA.d[sh.mid]);if(d2&&d2.msgs){d2.msgs=d2.msgs.filter(x=>!x.tmp);odaPatch()}if(t&&!t.value)t.value=v}break}
    case"betAtPick":{const t=$("#betComTxt");if(!t)break;const p=t.selectionStart??t.value.length;const a=t.value.slice(0,p).replace(/(^|\s)@[^\s@]*$/,"$1@"+(el.dataset.v==="*"?"herkes":firstName(nameOf(el.dataset.v)))+" ");t.value=(a+t.value.slice(p)).slice(0,140);try{t.focus();t.setSelectionRange(a.length,a.length)}catch(_){}odaGrow(t);betAtList(null);break}
    case"odaAtPick":{const t=$("#odaTxt");if(!t)break;const p=t.selectionStart??t.value.length;const a=t.value.slice(0,p).replace(/(^|\s)@[^\s@]*$/,"$1@"+(el.dataset.v==="*"?"herkes":firstName(nameOf(el.dataset.v)))+" ");t.value=a+t.value.slice(p);try{t.focus();t.setSelectionRange(a.length,a.length)}catch(_){}odaGrow(t);odaAtList(null);break}
    case"odaEdit":{const sh=S.sheet;const x=odaMsgOf(odaRoom(ODA.d[sh.mid]),el.dataset.v);if(!x)break;sh.edit=x.id;sh.sel=null;sh.reply=null;odaPatch();const t=$("#odaTxt");if(t){t.value=x.b;odaGrow(t);try{t.focus()}catch(_){}}break}
    case"odaEditX":if(S.sheet){S.sheet.edit=null;const t=$("#odaTxt");if(t){t.value="";odaGrow(t)}odaPatch()}break;
    case"odaDown":{const L=document.getElementById("odaMsgs");if(L)L.scrollTo({top:L.scrollHeight,behavior:"smooth"});if(S.sheet)S.sheet.dn=0;break}
    case"odaMute":{const d=odaRoom(ODA.d[S.sheet.mid]);const on=!(d&&d.mute);if(await odaDo("room_mute",{p_match:S.sheet.mid,p_on:on},true))toast(on?"Sessize alındı. Bahsetmeler ve duyurular yine gelir":"Oda bildirimleri açıldı");break}
    case"odaMk":if(S.sheet){const v=el.dataset.v,saha=el.classList.contains("oda-tk");S.sheet.mk=S.sheet.mk===v?null:v;S.sheet.mkTop=saha&&S.sheet.mk?v:null;odaRender(true);if(S.sheet.mk){const x=document.getElementById("mk-"+v);const t=x&&(saha?x.querySelector(".oda-mr"):x);if(t)t.scrollIntoView({block:"nearest",behavior:"smooth"})}}break;
    case"odaNote":{const v=($("#odaNt")||{}).value||"";if(await odaDo("room_set",{p_match:S.sheet.mid,p_patch:{pnote:{r:el.dataset.v,t:v}}},true))toast(v.trim()?"Not kaydedildi":"Not silindi");break}
    case"odaDone":await odaDo("room_set",{p_match:S.sheet.mid,p_patch:{done:+el.dataset.v}},true);break;
    case"odaTaskQ":{const t=$("#odaTask");if(t)t.value=el.dataset.v;break}
    case"odaSel":if(S.sheet){if(Date.now()-(ODA.tch||0)<900){ODA.lp=false;break}S.sheet.info=null;S.sheet.rep=null;S.sheet.sel=String(S.sheet.sel)===String(el.dataset.v)?null:el.dataset.v;odaPatch()}break;
    case"odaSelX":if(S.sheet){S.sheet.sel=null;S.sheet.info=null;S.sheet.rep=null;chatPatch()}break;
    case"odaInfo":if(S.sheet){S.sheet.info=el.dataset.v;S.sheet.sel=null;odaPatch()}break;
    case"odaCopy":{const x=S.sheet&&odaMsgOf(odaRoom(ODA.d[S.sheet.mid]),el.dataset.v);if(!x)break;let ok=false;try{await navigator.clipboard.writeText(x.b);ok=true}catch(_){try{const t=document.createElement("textarea");t.value=x.b;t.style.cssText="position:fixed;opacity:0";document.body.appendChild(t);t.select();ok=document.execCommand("copy");t.remove()}catch(_){}}toast(ok?"Kopyalandı":"Kopyalanamadı");S.sheet.sel=null;odaPatch();break}
    case"odaTipX":odaTipOff();break;
    case"odaLike":S.sheet.sel=null;await odaDo("room_like",{p_msg:+id,p_v:+el.dataset.v});break;
    case"odaReply":if(S.sheet){S.sheet.reply=el.dataset.v?+el.dataset.v:null;S.sheet.sel=null;odaPatch();const t=$("#odaTxt");if(t&&el.dataset.v)try{t.focus()}catch(_){}}break;
    case"odaAt":if(S.sheet){S.sheet.sel=null;odaPatch();const t=$("#odaTxt");if(t){t.value=(t.value?t.value.replace(/\s*$/," "):"")+"@"+firstName(nameOf(el.dataset.v))+" ";try{t.focus()}catch(_){}}}break;
    case"odaScore":await odaDo("room_score",{p_match:S.sheet.mid});break;
    case"odaScoreSend":{const a=+($("#odaSa")||{}).value,b=+($("#odaSb")||{}).value;if(!(a>=0&&a<=40&&b>=0&&b<=40)||($("#odaSa")||{}).value===""||($("#odaSb")||{}).value===""){toast("İki skoru da yaz");break}await odaDo("room_vote",{p_msg:+id,p_opt:Math.round(a)*100+Math.round(b)});break}
    case"odaVote":await odaDo("room_vote",{p_msg:+id,p_opt:+el.dataset.v});break;
    case"odaDel":await odaDo("room_del",{p_msg:+el.dataset.v});break;
    case"odaFwd":{const sh=S.sheet;if(!sh)break;sh.sel=null;try{const r=await rpc("room_hsend",{p_match:sh.mid,p_fwd:+el.dataset.v});if(r&&r.ok){ODA.d[sh.mid]=r;sh.side="H";sh.reply=null;toast("Maç sonu odasına iletildi");odaRender(true);odaBottom()}else{toast(r&&r.error==="dup"?"Bu mesaj zaten iletilmiş":ODA_ERR[r&&r.error]||"İletilemedi");odaPatch()}}catch(_){toast("Bağlantı yok");odaPatch()}break}
    case"odaAssign":{const p=($("#odaTaskP")||{}).value||"",t=$("#odaTask");const v=(t&&t.value||"").trim();if(!p){toast("Önce oyuncu seç");break}if(v.length<2){toast("Görevi yaz");break}const hh=($("#odaTaskH")||{}).value||"";t.value="";$("#odaTaskP").value="";if($("#odaTaskH"))$("#odaTaskH").value="";if(await odaDo("room_set",{p_match:S.sheet.mid,p_patch:{assign:{t:v,p,h:hh}}},true))toast(p===myPid()?"Görev eklendi":"Görev verildi, bildirim gitti");break}
    case"odaTaskDel":await odaDo("room_set",{p_match:S.sheet.mid,p_patch:{deltask:+el.dataset.v}},true);break;
    case"odaAnnT":if(S.sheet){S.sheet.ann=!S.sheet.ann;S.sheet.reply=null;S.sheet.plus=false;odaRender(true);const t=$("#odaTxt");if(t&&S.sheet.ann)try{t.focus()}catch(_){}}break;
    case"odaPinX":if(S.sheet){S.sheet.pinE=false;odaRender(true)}break;
    case"odaNudge":try{const r=await rpc("room_nudge",{p_msg:+id});toast(r&&r.ok?(r.n?r.n+" kişi dürtüldü":"Dürtülecek kimse yok"):r&&r.error==="wait"?"Az önce dürtüldü, 10 dakika bekle":"Yapılamadı")}catch(_){toast("Bağlantı yok")}break;
    case"odaPollT":if(S.sheet){S.sheet.poll=!S.sheet.poll;S.sheet.plus=false;odaRender(true);const q=$("#odaPq");if(q)try{q.focus()}catch(_){}}break;
    case"odaPlus":if(S.sheet){S.sheet.plus=!S.sheet.plus;odaRender(true)}break;
    case"odaGstT":if(S.sheet){S.sheet.gst=!S.sheet.gst;S.sheet.plus=false;S.sheet.gl=null;odaRender(true);if(S.sheet.gst){const mid=S.sheet.mid;try{const r=await rpc("room_guest_list",{p_match:mid});if(S.sheet&&S.sheet.mid===mid&&S.sheet.gst){S.sheet.gl=r&&r.ok?r:{in:[],rows:[]};odaRender(true)}}catch(_){if(S.sheet&&S.sheet.gst){S.sheet.gl={in:[],rows:[]};odaRender(true)}}}}break;
    case"odaGstSet":{if(!S.sheet)break;const mid=S.sheet.mid;const on=!!el.dataset.v;const self=id===myPid();let r=null;try{r=await rpc("room_guest_set",{p_match:mid,p_player:id,p_on:on})}catch(_){}
      if(!r||!r.ok){toast(({var:"Bu oyuncu zaten bir odada misafir",kadro:"Bu oyuncu bu hafta kadroda",uye:"Sadece onaylı üyeler misafir olabilir",dolu:"Bir odaya en fazla 5 misafir alınabilir",guest:"Misafirler bunu yapamaz",closed:"Oda kapalı"})[r&&r.error]||"Yapılamadı");break}
      if(self&&!on){S.sheet=null;ODA.at[mid]=0;delete ODA.d[mid];render(true);odaLoad(mid,true);toast("Odadan çıktın");break}
      toast(on?firstName(nameOf(id))+" odaya misafir alındı":firstName(nameOf(id))+" odadan çıkarıldı");const G=S.sheet.gl;if(G){if(on){G.rows=(G.rows||[]).filter(x=>x!==id);G.in=[...(G.in||[]),id]}else{G.in=(G.in||[]).filter(x=>x!==id);G.rows=[...(G.rows||[]),id]}}odaRender(true);odaLoad(mid,true);break}
    case"odaPollSend":{const q=($("#odaPq")||{}).value||"";const o=[0,1,2].map(i=>(($("#odaPo"+i)||{}).value||"").trim()).filter(Boolean);if(q.trim().length<2||o.length<2){toast("Soru ve en az iki seçenek yaz");break}S.sheet.poll=false;await odaDo("room_poll",{p_match:S.sheet.mid,p_q:q,p_opts:o},true);break}
    case"odaPinT":if(S.sheet){S.sheet.pinE=true;S.sheet.plus=false;odaRender(true);const q=$("#odaPin");if(q)try{q.focus()}catch(_){}}break;
    case"odaPinSave":{const v=($("#odaPin")||{}).value||"";S.sheet.pinE=false;await odaDo("room_set",{p_match:S.sheet.mid,p_patch:{pin:v}},true);break}
    case"betInfo":S.sheet={type:"betInfo"};render(true);break;
    case"betNotes":S.sheet={type:"betNotes",seen:betSeen()};betMarkSeen();render(true);betLoad("notes",null,true);break;
    case"betNoteGo":{const k=el.dataset.v,c=el.dataset.c;if((k==="yorum"||k==="yorum2"||k==="bahset")&&c){S.sheet={type:"betCom",id:c};BET.com=null;render(true);try{const r=await rpc("bet_comments_read",{p_coupon:c});if(r&&r.ok){betComPut(c,r);if(S.sheet&&S.sheet.type==="betCom")render(true)}}catch(_){}break}
      routeGo("iddia/"+((k==="kupon"||k==="tuttu")?"herkes":"kupon")+(c?"/"+c:""));break}
    case"betSlipOpen":S.sheet={type:"betSlip"};render(true);break;
    case"betAmt":BET.amt=el.dataset.v;{const i=$("#betAmt");if(i)i.value=el.dataset.v;const w=$("#betWin");if(w&&BET.slip.length)w.textContent=fJ(Math.round(+el.dataset.v*betOdd()))}break;
    case"betPlace":{const amt=Math.floor(+BET.amt||+($("#betAmt")?.value)||0);if(!BET.slip.length||BET.busy)break;if(amt<10){toast(BET_ERR.min);break}BET.busy=1;render(true);
      try{const r=await rpc("bet_place",{p_match:id,p_legs:BET.slip.map(l=>({k:l.k,s:l.s})),p_stake:amt});
        if(r&&r.ok){toast(`Tahmin yapıldı · olası kazanç ${fJ(Math.round(amt*r.odd))} sikke`);BET.slip=[];if(S.sheet&&S.sheet.type==="betSlip")S.sheet=null;BET.amt="";const me=myPid();BET.at={};betLoad("board",id,1);betLoad("tbl",0,1);if(me)betLoad("list",me,1)}
        else toast(r&&r.error==="max"?`En fazla ${fJ(r.max)} sikke (bakiyenin yarısı)`:BET_ERR[r&&r.error]||"Tahmin yapılamadı")}catch(_){toast("Bağlantı yok, tahmin yapılamadı")}
      BET.busy=0;render(true);break}
    case"betCancel":try{const r=await rpc("bet_cancel",{p_bet:id});if(r&&r.ok){toast("Tahmin geri alındı, sikke iade edildi");BET.at={};const m=betNext();if(m)betLoad("board",m.id,1);betLoad("tbl",0,1);const me=myPid();if(me)betLoad("list",me,1)}else toast(r&&r.error==="closed"?"Geri alma süresi doldu":BET_ERR[r&&r.error]||"Geri alınamadı")}catch(_){toast("Bağlantı yok")}break;
    case"pmX7":S.f.pm.x7k=el.dataset.v;S.f.pm.x7p=null;render(true);break;
    case"pmCopy":{const t=$("#pmCap");if(t){try{await navigator.clipboard.writeText(t.value);toast("Açıklama kopyalandı")}catch(_){t.select();document.execCommand&&document.execCommand("copy");toast("Açıklama kopyalandı")}}break}
    case"pmGo":await pmGo(el.dataset.v);break;
    case"filter":S.filter=el.dataset.v;render(true);break;
    case"cmpOpen":S.sheet={type:"cmp",a:id||S.me||"",b:id&&S.me&&id!==S.me?S.me:""};render(true);break;
    case"cmpPair":S.sheet={type:"cmp",a:el.dataset.a,b:el.dataset.b};render(true);break;
    case"extNew":S.f.ext={id:null,date:ymd(new Date()),opp:"",us:0,them:0,team:[],stats:{},motm:""};S.sheet={type:"ext"};render(true);break;
    case"extEdit":{const m=S.matches.find(x=>x.id===id);if(!m)break;S.f.ext={id:m.id,date:m.date,opp:m.opponent||"",us:+m.score_a||0,them:+m.score_b||0,team:[...(m.team_a||[])],stats:JSON.parse(JSON.stringify(m.stats||{})),motm:m.motm||""};S.sheet={type:"ext"};render(true);break}
    case"extPick":{const f=S.f.ext;const pid=el.dataset.p;if(f.team.includes(pid)){f.team=f.team.filter(x=>x!==pid);delete f.stats[pid];if(f.motm===pid)f.motm=""}else f.team.push(pid);render(true);break}
    case"extSt":{const f=S.f.ext;const o=f.stats[el.dataset.p]||(f.stats[el.dataset.p]={g:0,a:0,og:0});o[el.dataset.k]=clamp((+o[el.dataset.k]||0)+(+el.dataset.d),0,30);
      if(el.dataset.k==="g"){const sum=Object.values(f.stats).reduce((q,x)=>q+(+x.g||0),0);if(sum>f.us)f.us=sum}render(true);break}
    case"extSc":{const f=S.f.ext;f[el.dataset.k]=clamp(f[el.dataset.k]+(+el.dataset.d),0,99);render(true);break}
    case"extSave":{const f=S.f.ext;if(!String(f.opp||"").trim()){toast("Rakip ekibin adını yaz");break}if(!f.team.length){toast("Kadroyu seç");break}
      const stats={};for(const id of f.team){const o=f.stats[id]||{};stats[id]={g:+o.g||0,a:+o.a||0,og:0}}
      const r=await A("admin_save_ext_match",{p_id:f.id,p_date:f.date,p_opponent:f.opp.trim(),p_us:f.us,p_them:f.them,p_team:f.team,p_stats:stats,p_motm:f.motm||null},"Dış maç kaydedildi");
      if(r&&r.ok!==false){S.sheet=null;S.f.ext=null;S.tab="gecmis";if(r.id)S.view=r.id;render(true)}break}
    case"sqMode":S.f.sqMode=!S.f.sqMode;S.f.kmenu=false;render(true);break;
    case"kmenu":S.f.kmenu=!S.f.kmenu;render(true);break;
    case"ksort":S.f.sort=el.dataset.v;render(true);break;
    case"kreset":S.f.sort="ovr";S.f.sq="as";render(true);break;
    case"setSq":{const p=P(id);if(!p)break;const v=!!el.dataset.v;if(!!p.yedek===v)break;p.yedek=v;render(true);await A("admin_set_yedek",{p_id:id,p_yedek:v},p.name+(v?" yedek kadroda":" as kadroda"));break}
    case"sqf":S.f.sq=el.dataset.v;render(true);break;
    case"kview":S.f.kv=el.dataset.v;LS.set("y_kv",S.f.kv);render(true);break;
    case"rkAll":S.f.rkAll=!S.f.rkAll;render(true);break;
    case"back":S.view=null;render(true);window.scrollTo(0,0);break;
    case"mtab":S.f.mtab=el.dataset.v;render(true);break;
    case"seasonStory":stSeason(+id);break;
    case"shareSeason":{if(S.story)stPause(true);await shareSeason(+id);break}
    case"seasonSave":{const L=+(S.f.sLen||sLen());await A("admin_season",{p_len:L,p_close:false},"Sezon ayarı kaydedildi");await load(true);break}
    case"calcReset":{if(!S.f.cReset){S.f.cReset=1;render(true);break}S.f.cReset=0;const r=await A("admin_calc_reset",{p_season:curYr()},"Kartlar yeniden hesaplanıyor");if(r){await load(true);compute();const n=await calcSync();toast(n+" maç yeniden hesaplandı");render(true)}break}
    case"seasonClose":{if(!S.f.sClose){S.f.sClose=1;render(true);break}S.f.sClose=0;await A("admin_season",{p_len:sLen(),p_close:true},"Sezon bitirildi");await load(true);break}
    case"story":S._stChain=false;stOpen(id,0);break;
    case"stDetail":stClose();S.view=id;S.tab="gecmis";render(true);window.scrollTo(0,0);break;
    case"stX":stClose();break;
    case"viewm":S.view=id;S.tab="gecmis";render(true);window.scrollTo(0,0);break;
    case"suggNew":{const o=S.f.sugg;let n;do{n=NAMEP[Math.floor(Math.random()*NAMEP.length)]}while(n===o);S.f.sugg=n;render(true);break}
    case"createMatch":{const sg=sugg();const na=cleanName(S.f.newNameA||"")||sg[0],nb=cleanName(S.f.newNameB||"")||sg[1];
      const r=await A("admin_create_match",{p_date:S.f.newDate||nextDay(+S.settings.day),p_time:S.f.newTime||S.settings.time},"Maç açıldı, şimdi kadroyu kur");if(r&&r.id){await A("admin_set_names",{p_id:r.id,p_a:na,p_b:nb});S.f.newNameA=S.f.newNameB="";TEAM.A=na;TEAM.B=nb;startEditor(r.id,[],[]);S.teams.poolOpen=true;render(true)}break}
    case"perf":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f[el.dataset.s||"sd_"+el.dataset.m];if(!m||!sd)break;sd.perf=sd.perf||{};const pid=el.dataset.p,v=+el.dataset.v;
      if(sd.perf[pid]===v){delete sd.perf[pid]}else{sd.perf[pid]=v}
      S.f.confirmFinish=null;if(sd.events)sdSave(m,sd);render(true);break}
    case"exAdd":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f[el.dataset.s||"sd_"+el.dataset.m];const k=el.dataset.k;const pid=(S.f.exSel||{})[k];if(!m||!sd)break;if(!pid){toast("Önce oyuncuyu seç");break}
      sd[k]=sd[k]||{};sd[k][pid]=(sd[k][pid]||0)+1;S.f.exSel[k]="";S.f.confirmFinish=null;if(sd.events)sdSave(m,sd);render(true);break}
    case"exDel":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f[el.dataset.s||"sd_"+el.dataset.m];const k=el.dataset.k,pid=el.dataset.p;if(!m||!sd||!sd[k])break;
      sd[k][pid]=(sd[k][pid]||0)-1;if(sd[k][pid]<=0)delete sd[k][pid];S.f.confirmFinish=null;if(sd.events)sdSave(m,sd);render(true);break}
    case"trkOpen":{const m=S.matches.find(x=>x.id===id);if(!m)break;const f={};plAll(m).forEach(pid=>{const t=trkOf(m,pid)||{};f[pid]={};TRK.forEach(([k])=>{f[pid][k]=t[k]!=null?String(Math.round(t[k]*10)/10).replace(".",","):""})});S.f.trk=f;S.f.trkOpen=plAll(m).find(pid=>!trkOf(m,pid))||null;S.sheet={type:"trk",mid:id};render(true);break}
    case"trkSave":{const m=S.matches.find(x=>x.id===id);const f=S.f.trk||{};const out={};let bad=null;
      for(const[pid,v]of Object.entries(f)){const o={};for(const[k,l]of TRK){const raw=String(v[k]??"").trim().replace(",",".").replace("%","");if(raw==="")continue;const x=+raw;const lim={rt:10,km:15,hiz:45,spr:200,pas:400,isa:100,pp:150,tk:60,pa:60,dri:60,pt:150}[k];if(!isFinite(x)||x<0||x>lim){bad=nameOf(pid)+": "+l;break}o[k]=Math.round(x*10)/10}if(bad)break;if(Object.keys(o).length)out[pid]=o}
      if(bad){toast("Değeri kontrol et · "+bad);break}
      const n=Object.keys(out).length;const r=await A("admin_track_save",{p_id:id,p_data:out},n?(n<TRK_MIN?n+" oyuncu kaydedildi · yansıması için en az "+TRK_MIN+" gerekir":n+" oyuncunun verisi kaydedildi, notlar güncellendi"):"Saha verileri silindi");if(r){S.sheet=null;S.f.mtab="saha"}render(true);break}
    case"evalOpen":{const m=S.matches.find(x=>x.id===id);if(!m)break;S.f["ev_"+id]=exFrom(m.stats);S.sheet={type:"eval",mid:id};render(true);break}
    case"saveEval":{const m=S.matches.find(x=>x.id===id);const ev=S.f["ev_"+id];if(!m||!ev)break;const pl=plAll(m);const q=perfQuota(pl.length),c=[0,0,0,0];for(const pid of pl){const v=+ev.perf[pid];if(v)c[v-1]++}
      const ex={};for(const pid of pl){const o={};if(ev.perf[pid])o.k=ev.perf[pid];EXK.forEach(k=>{if((ev[k]||{})[pid])o[k]=ev[k][pid]});if(Object.keys(o).length)ex[pid]=o}
      const r=await A("admin_set_extras",{p_id:id,p_extras:ex},"Değerlendirme kaydedildi, kartlar güncellendi");if(r){delete S.f["ev_"+id];S.sheet=null;render(true)}break}
    case"restoreFin":{const r=await A("admin_restore_finished",{p_id:id},"Maç eski haliyle geri kapatıldı");if(r){delete S.f["sd_"+id];LS.del("y_sd_"+id);S.sheet=null;render(true)}break}
    case"setWhen":{const w=S.f["when_"+id]||{};const m=S.matches.find(x=>x.id===id);if(!m)break;const d=w.d||m.date,t=(w.t||m.time||"").slice(0,5);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)){toast("Tarih ve saati kontrol et");break}
      const r=await A("admin_set_when",{p_id:id,p_date:d,p_time:t},"Tarih ve saat güncellendi");if(r)delete S.f["when_"+id];break}
    case"delMatch":if(S.f.delMatch!==id){S.f.delMatch=id;render(true);break}S.f.delMatch=null;if(S.sheet&&S.sheet.type==="mng")S.sheet=null;S.teams=null;S.view=null;delete S.f["sd_"+id];LS.del("y_sd_"+id);await A("admin_archive_match",{p_id:id},"Maç silindi, tüm etkileri geri alındı");break;
    case"copy":{const tx=el.dataset.txt;try{await navigator.clipboard.writeText(tx);toast("Kopyalandı")}catch(_){toast("Kopyalanamadı, metni elle seç")}break}
    case"balance":{const ids=t?[...t.A,...t.B]:[];if(ids.length<4){toast("Önce en az 4 oyuncu seç");break}const r=balanceIds(ids);S.draft=null;startEditor(id,r.A,r.B,t?.fa,t?.fb);render(true);break}
    case"editTeams":{const m=S.matches.find(x=>x.id===id);startEditor(id,m.team_a||[],m.team_b||[],m.form_a,m.form_b,m.lineup_a,m.lineup_b,m.pos_a,m.pos_b);render(true);break}
    case"ligAvg":S.f.ligAvg=el.dataset.v==="1";render(true);break;
    case"kTog":{if(!S.admin||el.disabled)break;const m=S.matches.find(x=>x.id===el.dataset.m);if(!m)break;const v=(m.rsvp||{})[el.dataset.p]==="g"?"n":"g";
      m.rsvp={...(m.rsvp||{}),[el.dataset.p]:v};render(true);const r=await act("rsvp",{p_match:m.id,p_player:el.dataset.p,p_value:v});if(!r){toast("Kaydedilemedi");await load()}break}
    case"autoKadro":{const m=S.matches.find(x=>x.id===id);if(!m)break;const ids=rsvpLists(m).kadro.map(p=>p.id);if(ids.length<4){toast("Önce en az 4 oyuncu işaretle");break}
      const r=balanceIds(ids);S.draft=null;startEditor(id,r.A,r.B);render(true);toast("Dengeli takımlar hazır");break}
    case"manual":{const m=S.matches.find(x=>x.id===id);S.draft=null;if(m.team_a&&m.team_a.length)startEditor(id,m.team_a,m.team_b,m.form_a,m.form_b,m.lineup_a,m.lineup_b,m.pos_a,m.pos_b);else startEditor(id,[],[],t?.fa,t?.fb);S.teams.poolOpen=true;render(true);break}
    case"backRsvp":if(S.f.rsvpAsk!==id){S.f.rsvpAsk=id;render(true);break}S.f.rsvpAsk=null;await A("admin_set_state",{p_id:id,p_state:"kayit"},"Kadro aşaması yeniden açıldı");break;
    case"rsvpNo":S.f.rsvpAsk=null;render(true);break;
    case"fwdTakim":await A("admin_set_state",{p_id:id,p_state:"takim"},"Kadrolar değişmeden geri açıldı");break;
    case"cancelTeams":S.teams=null;render(true);break;
    case"fv":S.fv=el.dataset.v;render(true);break;
    case"tview":t.view=el.dataset.v;t.sel=null;render(true);break;
    case"shareImg":{const m=S.matches.find(x=>x.id===id);if(S.sheet&&S.sheet.type==="share"){S.sheet=null;render(true)}if(m)shareImg(m);break}
    case"setCap":{const s2=t.sel;const k=s2.team.toLowerCase();const pid=s2.kind==="slot"?t["l"+k][s2.idx]:s2.pid;if(!pid)break;
      const was=t["c"+k]===pid;t["c"+k]=was?null:pid;t.sel=null;toast(was?"Kaptanlık kaldırıldı":shortName(nameOf(pid))+" "+TEAM[s2.team]+" kaptanı");render(true);break}
    case"swapBibs":{[t.ca,t.cb]=[t.cb,t.ca];[t.A,t.B]=[t.B,t.A];[t.fa,t.fb]=[t.fb,t.fa];[t.la,t.lb]=[t.lb,t.la];[t.pa,t.pb]=[t.pb,t.pa];t.sel=null;toast("Yelekler değişti");render(true);break}
    case"form":{const k=el.dataset.k.toLowerCase();const r=alignTo(t["l"+k],t["p"+k],el.dataset.f);t["f"+k]=el.dataset.f;t["p"+k]=r.P;t["l"+k]=r.L;t.sel=null;render(true);break}
    case"autoPlace":t.la=autoLineup(t.A,t.fa);t.lb=autoLineup(t.B,t.fb);t.pa=slotsOf(t.fa);t.pb=slotsOf(t.fb);t.sel=null;render(true);break;
    case"poolAdd":{const k=el.dataset.k;if(t.A.includes(id)||t.B.includes(id))break;t[k].push(id);t.view=k;const L=t["l"+k.toLowerCase()];
      if(posOf(P(id))==="KL"&&!L[0])L[0]=id;else{let e2=L.findIndex((x,i)=>i>0&&!x);if(e2<0&&!L[0])e2=0;if(e2>=0)L[e2]=id}render(true);break}
    case"toPool":{const s2=t.sel;const k=s2.team;const L=t["l"+k.toLowerCase()];const pid=s2.kind==="slot"?L[s2.idx]:s2.pid;if(!pid)break;t[k]=t[k].filter(x=>x!==pid);const i=L.indexOf(pid);if(i>=0)L[i]=null;t.sel=null;render(true);break}
    case"slot":tapSlot(el.dataset.k,+el.dataset.i);render(true);break;
    case"bench":tapBench(el.dataset.k,id);render(true);break;
    case"unsel":t.sel=null;render(true);break;
    case"subWith":{const s2=t.sel;if(!s2||s2.kind!=="slot")break;const k=s2.team,o=k==="A"?"B":"A",L=t["l"+k.toLowerCase()],LO=t["l"+o.toLowerCase()];const cur=L[s2.idx];
      if(t[k].includes(id)){const j=L.indexOf(id);if(j>=0){L[j]=cur;L[s2.idx]=id}else L[s2.idx]=id}
      else if(t[o].includes(id)){const j=LO.indexOf(id);t[o]=t[o].filter(x=>x!==id);t[k].push(id);L[s2.idx]=id;
        if(cur){t[k]=t[k].filter(x=>x!==cur);t[o].push(cur);if(j>=0)LO[j]=cur}else if(j>=0)LO[j]=null}
      else{t[k].push(id);L[s2.idx]=id}
      t.sel=null;toast(cur?`${shortName(nameOf(cur))} ⇄ ${shortName(nameOf(id))}`:`${shortName(nameOf(id))} sahaya girdi`);render(true);break}
    case"toBench":{const L=t["l"+t.sel.team.toLowerCase()];L[t.sel.idx]=null;t.sel=null;render(true);break}
    case"moveTeam":{const s2=t.sel;const k=s2.team,o=k==="A"?"B":"A";const L=t["l"+k.toLowerCase()];const pid=s2.kind==="slot"?L[s2.idx]:s2.pid;if(!pid)break;
      t[k]=t[k].filter(x=>x!==pid);t[o].push(pid);const i=L.indexOf(pid);if(i>=0)L[i]=null;const LO=t["l"+o.toLowerCase()];const em=LO.indexOf(null);if(em>=0)LO[em]=pid;t.sel=null;toast(nameOf(pid)+" "+TEAM[o]+" takımına geçti");render(true);break}
    case"saveTeams":{if(!t.A.length||!t.B.length){toast("İki takımda da oyuncu olmalı");break}if(!t.la[0]||!t.lb[0]){toast("İki takıma da kaleci yerleştir");break}
      const r=await A("admin_save_lineup",{p_id:t.mid,p_team_a:t.A,p_team_b:t.B,p_form_a:t.fa,p_form_b:t.fb,p_lineup_a:t.la,p_lineup_b:t.lb,p_pos_a:t.pa,p_pos_b:t.pb});if(r){const c=capsOf(t);await A("admin_set_captains",{p_id:t.mid,p_cap_a:c.A,p_cap_b:c.B},"Kadrolar kaydedildi");S.teams=null;render(true)}break}
    case"draftStart":S.teams=null;S.draft={mid:id,selA:"",selB:""};render(true);break;
    case"draftCancel":stopTimer();S.draft=null;render(true);break;
    case"draftGo":{const d=S.draft;d.capA=d.selA;d.capB=d.selB;d.A=[d.capA];d.B=[d.capB];d.turn=Math.random()<.5?"A":"B";toast(nameOf(d.turn==="A"?d.capA:d.capB)+" yazı turayı kazandı, ilk o seçiyor");d.deadline=Date.now()+20000;startTimer();render(true);break}
    case"dpick":dpick(id);break;
    case"draftDone":{stopTimer();const d=S.draft;startEditor(d.mid,d.A,d.B);S.teams.ca=d.capA;S.teams.cb=d.capB;S.draft=null;render(true);break}
    case"gStart":{const sd=S.f["sd_"+el.dataset.m];if(!sd)break;S.f.stOwn=false;sd.step={ph:"scorer",side:el.dataset.side};render(true);break}
    case"mngOpen":{S.sheet={type:"mng",mid:id};render(true);break}
    case"stTab":{S.f.stTab=el.dataset.v;const sd=Object.values(S.f).find(x=>x&&x.step);if(sd)sd.step=null;render(true);const sh=$(".sheet");if(sh)sh.scrollTop=0;break}
    case"gEdit":{const sd=S.f["sd_"+el.dataset.m];if(!sd)break;sd.step={ph:"assist",i:+el.dataset.i};render(true);break}
    case"gBack":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f["sd_"+el.dataset.m];if(!sd||!m)break;if(sd.step&&sd.step.fresh&&sd.undo.length){const u=JSON.parse(sd.undo.pop());Object.assign(sd,{events:u.events,a:u.a,b:u.b,manual:u.manual,touched:u.touched});toast("Gol iptal edildi")}sd.step=null;sdSave(m,sd);render(true);break}
    case"awPick":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f["sd_"+el.dataset.m];if(!sd||!m)break;const k=el.dataset.k,pid=el.dataset.p;snap(sd,{motm:"Maçın Adamı",gol:"Haftanın Golü",fiy:"Fiyasko"}[k]);sd[k]=sd[k]===pid?"":pid;S.f.confirmFinish=null;sdSave(m,sd);render(true);break}
    case"exTap":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f[el.dataset.s||"sd_"+el.dataset.m];const k=el.dataset.k,pid=el.dataset.p;if(!m||!sd)break;sd[k]=sd[k]||{};sd[k][pid]=(sd[k][pid]||0)+(+el.dataset.d);if(sd[k][pid]<=0)delete sd[k][pid];S.f.confirmFinish=null;if(sd.events)sdSave(m,sd);render(true);break}
    case"gCancel":{const sd=S.f["sd_"+el.dataset.m];if(sd){sd.step=null;render(true)}break}
    case"gScorer":case"gOwn":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f["sd_"+el.dataset.m];if(!sd||!m)break;const pid=el.dataset.p;
      if(a==="gScorer"){snap(sd,shortName(nameOf(pid))+" golü");sd.events.push({t:"g",g:pid,a:null});sd.step={ph:"assist",i:sd.events.length-1,fresh:true}}
      else{snap(sd,shortName(nameOf(pid))+" kendi kalesine");sd.events.push({t:"og",p:pid});sd.step=null;toast(shortName(nameOf(pid))+" kendi kalesine")}
      syncScore(m,sd);S.f.confirmFinish=null;sdSave(m,sd);render(true);break}
    case"gAssist":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f["sd_"+el.dataset.m];if(!sd||!sd.step)break;const e=sd.events[sd.step.i];if(e&&!sd.step.fresh)snap(sd,"asist değişikliği");S.f.confirmFinish=null;if(e){e.pk=!!el.dataset.pk;e.a=e.pk?null:(el.dataset.p||null)}sd.step=null;
      toast(e?("⚽ "+shortName(nameOf(e.g))+(e.pk?" · penaltı golü":e.a?" · asist "+shortName(nameOf(e.a)):"")):"");sdSave(m,sd);render(true);break}
    case"evPk":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f["sd_"+el.dataset.m];if(!sd||!m)break;const e=sd.events[+el.dataset.i];if(!e||e.t!=="g")break;
      snap(sd,"penaltı işareti");e.pk=!e.pk;if(e.pk)e.a=null;S.f.confirmFinish=null;sdSave(m,sd);render(true);break}
    case"evDel":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f["sd_"+el.dataset.m];if(!sd)break;const i=+el.dataset.i;const e=sd.events[i];if(!e)break;
      snap(sd,evLabel(e)+" silindi");sd.events.splice(i,1);sd.step=null;syncScore(m,sd);S.f.confirmFinish=null;sdSave(m,sd);render(true);break}
    case"undo":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f["sd_"+el.dataset.m];if(!sd||!sd.undo.length)break;const u=JSON.parse(sd.undo.pop());
      Object.assign(sd,{events:u.events,a:u.a,b:u.b,manual:u.manual,touched:u.touched,motm:u.motm,gol:u.gol||"",fiy:u.fiy||"",step:null});S.f.confirmFinish=null;sdSave(m,sd);toast("Geri alındı: "+u.l);render(true);break}
    case"draftDel":{if(S.f.delDraft!==id){S.f.delDraft=id;render(true);setTimeout(()=>{if(S.f.delDraft===id){S.f.delDraft=null;render()}},4000);break}
      S.f.delDraft=null;delete S.f["sd_"+id];LS.del("y_sd_"+id);S.f.confirmFinish=null;const m=S.matches.find(x=>x.id===id);if(S.sheet&&S.sheet.type==="stats"&&m)sdOf(m);toast("Taslak silindi");render(true);break}
    case"statSheet":{const m=S.matches.find(x=>x.id===id);if(m){sdOf(m);S.f.stTab="gol";S.sheet={type:"stats",mid:id};render(true)}break}
    case"zeroScore":{const m=S.matches.find(x=>x.id===id);const sd=S.f["sd_"+id];if(!sd)break;snap(sd,"0–0");sd.a=0;sd.b=0;sd.touched=true;sd.manual=true;sdSave(m,sd);render(true);break}
    case"sc":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f["sd_"+el.dataset.m];if(!sd)break;snap(sd,"skor değişikliği");sd.touched=true;sd.manual=true;sd[el.dataset.side]=clamp(sd[el.dataset.side]+(+el.dataset.d),0,60);S.f.confirmFinish=null;sdSave(m,sd);render(true);break}
    case"fillScore":{const m=S.matches.find(x=>x.id===id);const sd=S.f["sd_"+id];if(!sd)break;snap(sd,"skor düzeltme");sd.manual=false;sd.touched=true;syncScore(m,sd);sdSave(m,sd);render(true);break}
    case"voteOpen":{const m=S.matches.find(x=>x.id===id);const voter=el.dataset.v;if(!m||!voter)break;let v={};
      {const vs0=S.vst[id];if(vs0&&((voter===myPid()&&vs0.mine)||(Array.isArray(vs0.voters)&&vs0.voters.includes(voter)))){toast("Oy verildi, değiştirilemez");break}}
      if(voter===myPid()&&S.vst[id]&&S.vst[id].mine)v={...S.vst[id].mine};
      let motm="",fiy="";
      if(voter!==myPid()&&S.admin){const r=await A("admin_votes",{p_match:id});if(r){for(const x of r.rows||[])if(x.f===voter)v[x.t]=x.v;const pk=(r.picks||[]).find(x=>x.f===voter);if(pk){motm=pk.m||"";fiy=pk.y||""}}}
      else if(S.admin&&!(S.vst[id]&&S.vst[id].mine)){const r=await A("admin_votes",{p_match:id});if(r)for(const x of r.rows||[])if(x.f===voter)v[x.t]=x.v}if(voter===myPid()&&S.vst[id]&&S.vst[id].pick){motm=S.vst[id].pick.motm||"";fiy=S.vst[id].pick.fiy||""}
      const all=voteList(m,voter);const first=all.findIndex(x=>!v[x]);S.f.vt={mid:id,voter,v,motm,fiy,i:first<0?0:first,son:first<0&&all.length>0};S.sheet={type:"vote",mid:id};render(true);break}
    case"vPick":{const vt=S.f.vt;const m=vt&&S.matches.find(x=>x.id===vt.mid);if(!vt||!m)break;const p=el.dataset.p,k=+el.dataset.v;vt.v[p]=k;if(vt.motm===p&&k!==1)vt.motm="";if(vt.fiy===p&&k!==4)vt.fiy="";
      render(true);break}
    case"vNext":{const vt=S.f.vt;const m=vt&&S.matches.find(x=>x.id===vt.mid);if(!vt||!m)break;const all=voteList(m,vt.voter);if(all.every(x=>vt.v[x]))vt.son=true;else if(vt.i<all.length-1)vt.i++;else{const q=all.findIndex(x=>!vt.v[x]);if(q>=0)vt.i=q}render(true);break}
    case"vBack":{const vt=S.f.vt;const m=vt&&S.matches.find(x=>x.id===vt.mid);if(!vt||!m)break;if(vt.son){vt.son=false;vt.i=voteList(m,vt.voter).length-1}else if(vt.i>0)vt.i--;render(true);break}
    case"vMotm":{const vt=S.f.vt;if(!vt)break;vt.motm=vt.motm===el.dataset.p?"":el.dataset.p;render(true);break}
    case"vFiy":{const vt=S.f.vt;if(!vt)break;vt.fiy=vt.fiy===el.dataset.p?"":el.dataset.p;render(true);break}
    case"vSend":{const vt=S.f.vt;if(!vt)break;const r=await act("vote_submit",{p_match:vt.mid,p_voter:vt.voter,p_votes:vt.v,p_motm:vt.motm||null,p_fiy:vt.fiy||null},"Oyların kaydedildi");if(r){S.f.vt=null;S.sheet=null;await vsLoad(vt.mid,true);render(true)}break}
    case"vDet":{const r=await A("admin_votes",{p_match:id});if(!r)break;S.f.vd={mid:id,rows:r.rows||[],dir:"f",sel:plAll(S.matches.find(x=>x.id===id)||{}).includes(myPid())?myPid():null};S.sheet={type:"vdet",mid:id};render(true);break}
    case"vdDir":if(S.f.vd){S.f.vd.dir=el.dataset.v;render(true)}break;
    case"vdSel":if(S.f.vd){S.f.vd.sel=el.dataset.p;render(true)}break;
    case"vClose":{const m=S.matches.find(x=>x.id===id);if(!m)break;if(S.f.vClose!==id){S.f.vClose=id;render(true);break}await voteClose(m);break}
    case"vReopen":{if(S.f.vReopen!==id){S.f.vReopen=id;render(true);break}S.f.vReopen=null;const r=await A("admin_vote_reopen",{p_match:id},"Oylama yeniden açıldı");if(r){delete S.vst[id];render(true)}break}
    case"finish":{if(S.f.confirmFinish!==id){S.f.confirmFinish=id;render(true);break}S.f.confirmFinish=null;
      const sd=S.f["sd_"+id];const m=S.matches.find(x=>x.id===id);const so=statsOf(sd);const stats={};for(const pid of plAll(m)){const o=so[pid]||{};stats[pid]={g:+o.g||0,a:+o.a||0,og:+o.og||0};if(+o.pg)stats[pid].pg=+o.pg;if(+o.k)stats[pid].k=+o.k;EXK.forEach(k=>{if(+o[k])stats[pid][k]=+o[k]})}
      if(vOn(m))for(const pid in stats){delete stats[pid].k;const k=+(m.stats||{})[pid]?.k;if(k)stats[pid].k=k}
      if(!sd.touched){toast("Önce skoru gir");break}
      {const pl0=plAll(m);const q=perfQuota(pl0.length),c=[0,0,0,0];for(const pid of pl0){const v=+(sd.perf||{})[pid];if(v)c[v-1]++}
}
      const pl=new Set(plAll(m));const links=sd.events.filter(e=>e.t==="g"&&pl.has(e.g)).map(x=>x.pk?{g:x.g,a:null,pk:true}:{g:x.g,a:x.a&&pl.has(x.a)&&sideOf(m,x.a)===sideOf(m,x.g)?x.a:null});
      const r=await A("admin_finish_match_v3",{p_id:id,p_score_a:sd.a,p_score_b:sd.b,p_stats:stats,p_motm:sd.motm||null,p_links:links});
      const sc=new Set(links.map(x=>x.g));const wasFin=m.state==="bitti";if(r)await A("admin_set_awards",{p_id:id,p_gol:sd.gol&&sc.has(sd.gol)?sd.gol:null,p_fiy:sd.fiy&&pl.has(sd.fiy)?sd.fiy:null},wasFin?"Maç güncellendi, kartlar yeniden hesaplandı":vPend(m)?"Skor kaydedildi, oylama açıldı":"Maç bitti, kartlar güncellendi");if(r){delete S.f["sd_"+id];LS.del("y_sd_"+id);S.sheet=null;await load(true);compute();await notesSync(id);const m2=S.matches.find(x=>x.id===id);if(!wasFin&&m2&&vPend(m2)){window.scrollTo(0,0);render(true)}else if(!wasFin){window.scrollTo(0,0);confetti();setTimeout(()=>{if(S.sheet)return;S.f.pm={tab:"mac",item:"skor",fmt:"post",mid:id};S.sheet={type:"pm"};render(true);toast("Maç sonucunu paylaş")},1800)}}break}
    case"reopen":{const m=S.matches.find(x=>x.id===id);if(!m)break;S.f.confReopen=null;delete S.f["sd_"+id];LS.del("y_sd_"+id);sdOf(m);S.f.stTab="gol";S.f.confirmFinish=null;S.sheet={type:"stats",mid:id};render(true);break}
    case"stType":S.f.st.type=el.dataset.v;render(true);break;
    case"stOpen":S.f.stOpen=!S.f.stOpen;S.f.st=null;render(true);break;
    case"peditOpen":S.f.ed=null;S.f.phPrev=null;S.f.delP=null;S.sheet={type:"pedit",id:S.sheet.id};render(true);{const sh=document.querySelector(".sheet");if(sh)sh.scrollTop=0}break;
    case"pback":S.sheet={type:"player",id:S.sheet.id};render(true);break;
    case"edSq":S.f.ed.yedek=el.dataset.v;render(true);break;
    case"mePos":S.f.mePos=el.dataset.v;document.querySelectorAll(".mepos button").forEach(b=>b.classList.toggle("on",b.dataset.v===S.f.mePos));meFilter($("#meQ")?.value||"");break;
    case"prOpen":S.f.prOpen=el.dataset.v;render(true);break;
    case"iaG":S.f.iaG=el.dataset.v;render(true);break;
    case"agTab":S.f.agT=el.dataset.v;render(true);break;
    case"atStep":{const inp=document.querySelector(`input[data-attr="${el.dataset.p}"][data-k="${el.dataset.k}"]`);if(inp){inp.value=clamp((+inp.value||30)+(+el.dataset.d),30,95);inp.dispatchEvent(new Event("input",{bubbles:true}))}break}
    case"saveStatus":{const p=P(S.sheet.id);const sf=S.f.st;await act("set_status",{p_player:p.id,p_type:sf.type,p_until:sf.type==="hazir"?null:(sf.until||null),p_note:sf.type==="hazir"?"":(sf.note||"")},"Durum güncellendi");S.f.st=null;S.f.stOpen=false;render(true);break}
    case"saveCard":{const p=P(S.sheet.id);const a2=S.f.ed;if(!String(a2.name||"").trim()){toast("Ad boş olamaz");break}
      const ok=await A("admin_save_player_v2",{p_id:p.id,p_name:a2.name.trim(),p_pos:a2.pos,p_epos:a2.epos,p_alt:a2.alt||"",p_attrs:cleanAttrs(a2.pos,a2.attrs)},"Kart güncellendi");
      {const ag=String(a2.age??"").trim();const nv=ag===""?null:+ag;const cur=p.age!=null?p.age:null;
        if(ok&&nv!==cur){if(nv!=null&&(!Number.isInteger(nv)||nv<10||nv>80))toast("Yaş 10 ile 80 arasında olmalı");else await A("admin_set_age",{p_id:p.id,p_age:nv},"Yaş kaydedildi")}}
      if(ok&&!!a2.yedek!==!!p.yedek)await A("admin_set_yedek",{p_id:p.id,p_yedek:!!a2.yedek},a2.yedek?"Yedek kadroya alındı":"As kadroya alındı");S.f.ed=null;if(ok)S.sheet={type:"player",id:p.id};render(true);break}
    case"delPlayer":{const p=P(S.sheet.id);if(S.f.delP!==p.id){S.f.delP=p.id;render(true);break}const r=await A("admin_archive_player",{p_id:p.id},"Oyuncu kadrodan çıkarıldı");if(r){S.sheet=null;render(true)}break}
    case"atVote":{const v=S.f.atVote||(S.seasonVotes.find(x=>x.voter===S.me)||{}).target;if(!v){toast("Bir oyuncu seç");break}await act("season_vote",{p_year:new Date().getFullYear(),p_voter:S.me,p_target:v},"Altın Top oyun kaydedildi");break}
    case"phUse":await phSave(false);break;
    case"phCancel":S.f.phPrev=null;render(true);break;
    case"repAsk":if(S.sheet){S.sheet.rep=String(S.sheet.rep)===String(el.dataset.v)?null:(el.dataset.v||null);modPatch()}break;
    case"repSend":{let r=null;try{r=await rpc("report_add",{p_kind:el.dataset.k,p_ref:el.dataset.ref||null,p_target:id||null,p_reason:el.dataset.v,p_snap:el.dataset.s||null})}catch(_){}
      toast(r&&r.ok?"Şikâyetin yöneticiye iletildi":r&&r.error==="limit"?"Bugün çok fazla şikâyet gönderdin":"Gönderilemedi, tekrar dene");if(r&&r.ok&&S.sheet){S.sheet.rep=null;S.sheet.sel=null}modPatch();break}
    case"blkSet":{let r=null;try{r=await rpc("block_set",{p_player:id,p_on:el.dataset.v==="1"})}catch(_){}
      if(r&&r.ok){if(S.mem)S.mem.blocks=r.blocks||[];if(S.sheet){S.sheet.rep=null;S.sheet.sel=null}toast(el.dataset.v==="1"?"Engellendi: mesajları ve yorumları artık görünmez":"Engel kaldırıldı")}else toast("Yapılamadı, tekrar dene");modPatch();break}
    case"repClose":{let r=null;try{r=await rpc("report_close",{p_id:+el.dataset.v})}catch(_){}
      if(r&&r.ok){S.reps=(S.reps||[]).filter(x=>String(x.id)!==el.dataset.v);if(S.mem)S.mem.reports=S.reps.length;toast("Şikâyet kapatıldı")}else toast("Kapatılamadı, tekrar dene");render(true);break}
    case"kfrT":LS.set("y_kfr",kfrOn()?"0":"1");render(true);break;
    case"mailCopy":try{await navigator.clipboard.writeText("yelek.destek@gmail.com");toast("Adres kopyalandı")}catch(_){toast("yelek.destek@gmail.com")}break;
    case"delLogo":{const r=await A("admin_set_logo",{p_data:""},"Logo kaldırıldı");if(r){S.logo="";S.logoV=0;S.settings.logo_v=(+S.settings.logo_v||0)+1;idbSet("lg","");phdRender();render(true)}break}
    case"delPhoto":{const r=await A("admin_set_photo",{p_id:id,p_data:""},"Fotoğraf kaldırıldı");if(r){delete S.photos[id];render(true)}break}
    case"rulesSheet":S.sheet={type:"rules"};render(true);break;
  }
});
function tapSlot(k,i){const t=S.teams;const L=t["l"+k.toLowerCase()];const s=t.sel;
  if(!s){t.sel={kind:"slot",team:k,idx:i};return}
  if(s.team!==k){t.sel={kind:"slot",team:k,idx:i};return}
  if(s.kind==="slot"){if(s.idx!==i){const a1=L[s.idx],b1=L[i];[L[s.idx],L[i]]=[L[i],L[s.idx]];if(a1&&b1)toast(`${shortName(nameOf(a1))} ⇄ ${shortName(nameOf(b1))}`)}t.sel=null;return}
  L[i]=s.pid;t.sel=null}
function tapBench(k,pid){const t=S.teams;const s=t.sel;
  if(s&&s.kind==="slot"&&s.team===k){t["l"+k.toLowerCase()][s.idx]=pid;t.sel=null;return}
  t.sel=(s&&s.kind==="bench"&&s.pid===pid)?null:{kind:"bench",team:k,pid}}
/* fotoğraf: arka planı telefonda sil, baş-omuz hizala (model ilk kullanımda iner) */
const PHC={p:null};
function phLib(){return PHC.p||(PHC.p=(async()=>{
  if(!window.ort)await new Promise((ok,no)=>{const s=document.createElement("script");s.src="vendor/ort/ort.wasm.min.js";s.onload=ok;s.onerror=()=>no(new Error("lib"));document.head.appendChild(s)});
  ort.env.wasm.wasmPaths=new URL("vendor/ort/",location.href).href;ort.env.wasm.numThreads=1;
  return ort.InferenceSession.create(new URL("vendor/ort/u2netp.onnx",location.href).href,{executionProviders:["wasm"]})})().catch(e=>{PHC.p=null;throw e}))}
async function phCut(img){
  const ses=await phLib(),N=320,iw=img.naturalWidth||img.width,ih=img.naturalHeight||img.height,k=Math.min(1,900/Math.max(iw,ih)),W=Math.round(iw*k),H=Math.round(ih*k);
  const wc=document.createElement("canvas");wc.width=W;wc.height=H;const wx=wc.getContext("2d");wx.imageSmoothingQuality="high";wx.drawImage(img,0,0,W,H);
  const sc=document.createElement("canvas");sc.width=sc.height=N;const sx=sc.getContext("2d",{willReadFrequently:true});sx.imageSmoothingQuality="high";sx.drawImage(wc,0,0,N,N);
  const px=sx.getImageData(0,0,N,N).data,f=new Float32Array(3*N*N);let mx=1;for(let i=0;i<px.length;i+=4)mx=Math.max(mx,px[i],px[i+1],px[i+2]);
  const mu=[.485,.456,.406],sd=[.229,.224,.225];for(let i=0,p=0;i<N*N;i++,p+=4)for(let c=0;c<3;c++)f[c*N*N+i]=(px[p+c]/mx-mu[c])/sd[c];
  const out=await ses.run({[ses.inputNames[0]]:new ort.Tensor("float32",f,[1,3,N,N])}),o=out[ses.outputNames[0]].data;
  let lo=1e9,hi=-1e9;for(let i=0;i<N*N;i++){if(o[i]<lo)lo=o[i];if(o[i]>hi)hi=o[i]}
  const md=sx.createImageData(N,N),a=new Float32Array(N*N);
  for(let i=0;i<N*N;i++){let v=(o[i]-lo)/((hi-lo)||1);v=Math.max(0,Math.min(1,(v-.3)/.55));a[i]=v;md.data[i*4+3]=Math.round(v*255)}
  sx.putImageData(md,0,0);wx.globalCompositeOperation="destination-in";wx.drawImage(sc,0,0,W,H);wx.globalCompositeOperation="source-over";
  /* baş: üstten tara; en geniş yer baş, daralan yer boyun, yeniden genişleyen yer omuz */
  const rx=W/N,ry=H/N,R=[];let y0=-1,y1=-1,bl=N,br=0,tot=0;
  for(let y=0;y<N;y++){let n=0,s=0;for(let x=0;x<N;x++)if(a[y*N+x]>.5){n++;s+=x;if(x<bl)bl=x;if(x>br)br=x}R.push({n,c:n?s/n:0});tot+=n;if(n>=3){if(y0<0)y0=y;y1=y}}
  if(y0<0||tot<N*N*.02)throw new Error("bos");
  let peak=0,py=y0,val=1e9,vy=-1,found=false;
  for(let y=y0;y<=y1;y++){const w=R[y].n*rx;
    if(vy<0&&w>=peak){peak=w;py=y}
    else if(w<peak*.93||vy>=0){if(w<val){val=w;vy=y}if(w>Math.max(val*1.3,peak*1.08)){found=true;break}}}
  const hh=found?(vy-y0)*ry:0;let hw,cx;
  if(found&&hh>peak*.8&&hh<peak*2.2){hw=peak;let s=0,n=0;for(let y=y0;y<=vy;y++){s+=R[y].c*R[y].n;n+=R[y].n}cx=s/n*rx}
  else{hw=(br-bl+1)*rx*.45;cx=(bl+br+1)/2*rx}
  const OW=256,OH=320,c=document.createElement("canvas");c.width=OW;c.height=OH;const g=c.getContext("2d");g.imageSmoothingQuality="high";
  const z=OW*.47/hw,ty=24-y0*ry*z;g.drawImage(wc,OW/2-cx*z,ty,W*z,H*z);
  const fe=Math.min(288,Math.floor(ty+y1*ry*z)),gr=g.createLinearGradient(0,fe-70,0,fe);gr.addColorStop(0,"rgba(0,0,0,1)");gr.addColorStop(1,"rgba(0,0,0,0)");
  g.globalCompositeOperation="destination-in";g.fillStyle=gr;g.fillRect(0,0,OW,OH);
  let d=c.toDataURL("image/webp",.9);if(!/^data:image\/webp/.test(d))d=c.toDataURL("image/png");
  if(d.length>=240000){const c2=document.createElement("canvas");c2.width=192;c2.height=240;c2.getContext("2d").drawImage(c,0,0,192,240);d=c2.toDataURL("image/png")}
  return d}
async function photoData(file){
  const url=URL.createObjectURL(file);
  try{const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error("img"));i.src=url});
    const W=320,H=400,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
    const r=Math.max(W/img.naturalWidth,H/img.naturalHeight),w=img.naturalWidth*r,h=img.naturalHeight*r;
    x.fillStyle="#fff";x.fillRect(0,0,W,H);x.drawImage(img,(W-w)/2,Math.min(0,(H-h)*.3),w,h);
    let q=.85,d=c.toDataURL("image/jpeg",q);while(d.length>150000&&q>.4){q-=.1;d=c.toDataURL("image/jpeg",q)}return d}
  finally{URL.revokeObjectURL(url)}
}
async function uploadPhoto(id,file){
  if(!/^image\//.test(file.type||"image/")){toast("Lütfen bir fotoğraf seç");return}
  S.f.phPrev=null;S.f.phBusy=true;render(true);
  try{const url=URL.createObjectURL(file);let d="";
    try{const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=()=>rej(new Error("img"));i.src=url});d=await phCut(img)}
    catch(e){console.warn(e)}finally{URL.revokeObjectURL(url)}
    if(d)S.f.phPrev={id,d,file};
    else{const raw=await photoData(file);const r=await A("admin_set_photo",{p_id:id,p_data:raw},"Arka plan silinemedi, fotoğraf olduğu gibi yüklendi");if(r)S.photos[id]=raw}}
  catch(_){toast("Fotoğraf okunamadı, başka bir fotoğraf dene")}
  S.f.phBusy=false;render(true);
}
async function phSave(raw){const v=S.f.phPrev;if(!v||S.f.phBusy)return;S.f.phBusy=true;render(true);
  try{const d=raw?await photoData(v.file):v.d;const r=await A("admin_set_photo",{p_id:v.id,p_data:d},"Fotoğraf yüklendi");if(r){S.photos[v.id]=d;S.f.phPrev=null}}
  catch(_){toast("Fotoğraf yüklenemedi, tekrar dene")}
  S.f.phBusy=false;render(true)}
function cleanAttrs(pos,a){const o={};for(const[k,,,subs]of attrSet(pos)){for(const[sk]of subs)o[k+"_"+sk]=clamp(subVal(a,k,sk),30,95);o[k]=mainVal(o,k,pos)}return o}
document.addEventListener("submit",async e=>{
  const f=e.target.closest("[data-form]");if(!f)return;e.preventDefault();const kind=f.dataset.form;
  if(kind==="otpSend"){const o=S.f.otp||(S.f.otp={});const em=String(o.email||"").trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){toast("Geçerli bir e-posta yaz");return}
    if(o.busy)return;o.busy=true;o.email=em;render(true);const sb=await authStart();
    try{if(!sb)throw 0;const{error}=await sb.auth.signInWithOtp({email:em,options:{shouldCreateUser:true,emailRedirectTo:location.origin+location.pathname}});if(error)throw error;o.sent=true;o.code="";LS.set("y_auth","1");toast("Kod gönderildi")}
    catch(e){toast(/rate|limit|seconds/i.test(e&&e.message||"")?"Çok sık denedin, biraz bekleyip tekrar dene":"Kod gönderilemedi, tekrar dene")}finally{o.busy=false;render(true)}return}
  if(kind==="otpVerify"){const o=S.f.otp||{};const code=String(o.code||"").replace(/\D/g,"");if(code.length<6){toast("Kodu yaz");return}
    if(o.busy)return;o.busy=true;render(true);const sb=await authStart();
    try{if(!sb)throw 0;const{data,error}=await sb.auth.verifyOtp({email:o.email,token:code,type:"email"});if(error||!data.session)throw error||0;
      S.f.otp={email:"",code:"",sent:false};if(S.sheet&&(S.sheet.type==="login"||S.sheet.type==="inapp"))S.sheet=null;S.session=data.session;sessionBackup(data.session);await afterAuth()}
    catch(e){toast(/expired/i.test(e&&e.message||"")?"Kodun süresi dolmuş, yeni kod iste":"Kod yanlış, tekrar dene")}finally{o.busy=false;render(true)}return}
  if(kind==="tcode"){const code=String(S.f.tcode||"").trim().toLowerCase();if(!code){toast("Takım kodunu yaz");return}
    try{const t=await rpc("team_by_code",{p_code:code});if(t&&t.id){LS.set("y_int","katil");S.f.tcode="";teamGo(t.id)}else toast("Bu kodla takım bulunamadı")}catch(_){toast("Takım bulunamadı")}return}
  if(kind==="addPlayer"){const ap=S.f.ap;const name=String(ap.name||"").trim();if(!name){toast("Ad gir");return}
    const r=await A("admin_save_player_v2",{p_id:null,p_name:name,p_pos:ap.pos,p_epos:ap.epos,p_alt:ap.alt||"",p_attrs:cleanAttrs(ap.pos,ap.attrs)},name+" kadroya eklendi");
    if(r&&r.id&&ap.yedek)await A("admin_set_yedek",{p_id:r.id,p_yedek:true});
    if(r){S.f.ap={name:"",pos:ap.pos,epos:ap.epos,alt:"",yedek:ap.yedek||"",attrs:{}};render(true);setTimeout(()=>$("#apName")?.focus(),0)}}
  if(kind==="extGuest"){const f=S.f.ext;const name=String(S.f.extGuest||"").trim().replace(/\s+/g," ");if(!f||!name){toast("Misafirin adını yaz");return}
    const r=await A("admin_add_guest",{p_name:name},name+" misafir olarak kadroya eklendi");
    if(r&&r.id){f.team.push(r.id);(f.newG||(f.newG=[])).push(r.id);S.f.extGuest="";render(true)}}
  if(kind==="addGuest"){const t=S.teams;const name=String(S.f.guestName||"").trim();if(!t||!name){toast("Misafirin adını yaz");return}
    const k=t.view||"A";const r=await A("admin_add_guest",{p_name:name},name+" "+TEAM[k]+" takımına eklendi");
    if(r&&r.id){t[k].push(r.id);const L=t["l"+k.toLowerCase()];const e2=L.findIndex((x,i)=>i>0&&!x);if(e2>=0)L[e2]=r.id;S.f.guestName="";render(true)}}
  if(kind==="teamNew"){const f=S.f.tn||{};if(!String(f.name||"").trim()){toast("Takım adını yaz");return}if(S.f.tnBusy)return;S.f.tnBusy=true;render(true);
    try{const r=await rpc("create_team",{p_name:f.name,p_field:f.field||"",p_day:+f.day||1,p_time:f.time||"21:00",p_ig:f.ig||""});
      if(r&&r.ok){if(r.pending){S.f.tnSent=f.name;S.f.tn=null;S.myTeams=null;return}LS.set("y_hos","");toast("Takım kuruldu");teamGo(r.id,r.slug);return}
      toast(r&&r.error==="limit"?"En fazla 3 takım kurabilirsin":"Takım kurulamadı")}catch(_){toast("Takım kurulamadı")}finally{S.f.tnBusy=false;render(true)}}
  if(kind==="settings"){const s=S.f.set;await A("admin_save_settings_v2",{p_group:s.group_name,p_field:s.field_name,p_day:+s.day,p_time:s.time||"21:00",p_team_a:cleanName(s.team_a_name)||"Yelekliler",p_team_b:cleanName(s.team_b_name)||"Yeleksizler"},"Ayarlar kaydedildi");S.f.set=null;render(true)}
});
function setPath(path,v){const ks=path.split(".");let o=S.f;for(let i=0;i<ks.length-1;i++)o=o[ks[i]]||(o[ks[i]]={});o[ks[ks.length-1]]=v}
document.addEventListener("input",e=>{const t=e.target;
  if(t.id==="meQ"){meFilter(t.value);return}
  if(t.id==="clQ"){S.f.clq=t.value;const r=document.getElementById("clR");if(r)r.innerHTML=pickRows();return}
  if(t.id==="hubQ"){S.f.hq=t.value;const r=document.getElementById("hubR");if(r)r.innerHTML=hubResults();return}
  if(t.id==="betAmt"){BET.amt=t.value;const w=$("#betWin");if(w&&BET.slip.length)w.textContent=fJ(Math.round((+t.value||0)*betOdd()));return}
  if(t.dataset.bind)setPath(t.dataset.bind,t.value);
  if(t.dataset.attr){const pre=t.dataset.attr,k=t.dataset.k;const obj=S.f[pre];if(!obj)return;const v=clamp(+t.value||30,30,95);obj.attrs[k]=v;
    document.querySelectorAll(`[data-attr="${pre}"][data-k="${k}"]`).forEach(x=>{if(x!==t)x.value=v});const mk=k.split("_")[0];const me=$("#"+pre+"_m_"+mk);if(me)me.textContent=mainVal(obj.attrs,mk,obj.pos);const o=$("#"+pre+"_ovr");if(o)o.textContent=baseOf({pos:obj.pos,epos:obj.epos,attrs:obj.attrs});document.querySelectorAll(`[data-attrbar="${pre}"][data-k="${k}"]`).forEach(b=>b.style.width=Math.round((v-30)/65*100)+"%")}
});
document.addEventListener("change",e=>{const t=e.target;
  if(t.dataset.bind){setPath(t.dataset.bind,t.value);const bd=t.dataset.bind;
    if(bd==="ap.epos"||bd==="ed.epos"){const o=S.f[bd.slice(0,2)];o.pos=GROUP_POS[EPOS[o.epos][0]];if(o.alt===o.epos)o.alt=""}
    if(bd.startsWith("pm.")){render(true);return}
    if(["sort","wrapP","ap.epos","ed.epos","newDate","newTime","ext.motm","ext.date"].includes(bd)||bd.startsWith("when_"))render(true);return}
  if(t.dataset.cmp&&S.sheet&&S.sheet.type==="cmp"){S.sheet[t.dataset.cmp]=t.value;render(true);return}
  if(t.dataset.vote){const k="v_"+t.dataset.m;(S.f[k]||(S.f[k]={}))[t.dataset.vote]=t.value;return}
  if(t.dataset.logo&&t.files&&t.files[0]){uploadLogo(t.files[0]);t.value="";return}
  if(t.dataset.photo&&t.files&&t.files[0]){uploadPhoto(t.dataset.photo,t.files[0]);t.value="";return}
  if(t.dataset.actChange==="sahaK"){S.f.sahaK=t.value;render(true);return}
  if(t.dataset.actChange==="yr"){S.yr=t.value==="all"?"all":+t.value;S.f.ptab=S.f.ptab;S.view=null;render(true);return}
  if(t.dataset.actChange==="cap"&&S.draft){S.draft["sel"+t.dataset.k]=t.value;render(true)}
  if(t.dataset.actChange==="evA"){const m=S.matches.find(x=>x.id===t.dataset.m);const sd=S.f["sd_"+t.dataset.m];const e=sd&&sd.events[+t.dataset.i];if(e){snap(sd,"asist değişikliği");e.a=t.value||null;S.f.confirmFinish=null;sdSave(m,sd);render(true)}return}
  if(t.dataset.actChange==="aw"){const m=S.matches.find(x=>x.id===t.dataset.m);const sd=S.f["sd_"+t.dataset.m];if(sd){snap(sd,t.dataset.k==="gol"?"Haftanın Golü":"Fiyasko");sd[t.dataset.k]=t.value;sdSave(m,sd);render(true)}return}
  if(t.dataset.actChange==="awR"){const m=S.matches.find(x=>x.id===t.dataset.m);if(m){const g=t.dataset.k==="gol"?(t.value||null):(m.gol_id||null),f=t.dataset.k==="fiy"?(t.value||null):(m.fiy_id||null);A("admin_set_awards",{p_id:m.id,p_gol:g,p_fiy:f},"Kaydedildi")}return}
  if(t.dataset.actChange==="motm"){const m=S.matches.find(x=>x.id===t.dataset.m);const sd=S.f["sd_"+t.dataset.m];if(sd){snap(sd,"Maçın Adamı");sd.motm=t.value;S.f.confirmFinish=null;sdSave(m,sd);render(true)}}
});
document.addEventListener("toggle",e=>{const d=e.target;if(!d.dataset)return;if(d.dataset.actToggle)S.f[d.dataset.actToggle]=d.open;if(d.dataset.actToggleTeam&&S.teams)S.teams[d.dataset.actToggleTeam]=d.open},true);
document.addEventListener("focusout",()=>{setTimeout(()=>{if(S.pending&&!isEditing())render()},0)});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&S.sheet){S.sheet=null;render(true)}});
// yeni sürüm varsa (ana ekran uygulaması dahil) sayfayı taze yükle
async function newVer(){try{const r=await fetch("./index.html?t="+Date.now(),{cache:"no-store"});if(!r.ok)return false;
  const v=((await r.text()).match(/const APP_V="(\w+)"/)||[])[1];
  if(v&&v!=="dev"&&APP_V!=="dev"&&v!==APP_V){location.replace(location.pathname+"?v="+v+(S._r0&&Date.now()-S._r0t<30000?"#"+S._r0:location.hash));return true}}catch(_){}return false}
/* değişiklik var mı? sunucudan tek bir sayı sorulur, değiştiyse veri indirilir */
async function revCheck(force){if(TID===0||!S.loaded||S._rc)return;S._rc=true;
  try{const r=await rpc("team_rev",{});if(!r){if(force)load();return}if(!S.rev||r.r!==S.rev.r||force){S.rev=r;await load()}}catch(_){}finally{S._rc=false}}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){newVer().then(n=>{if(!n){revCheck();wakeSync()}})}});
setInterval(()=>{if(document.visibilityState==="visible"&&!S.teams&&!S.draft&&!S.sheet)revCheck()},30000);

/* Sahada sürükle-bırak */
let DRAG=null,SUPPRESS=false;
document.addEventListener("pointerdown",e=>{const tok=e.target.closest(".field.edit .tok,.field.edit .tc,.field.edit .tcard");if(!tok||!S.teams)return;if(e.pointerType==="mouse")e.preventDefault();
  const fld=tok.closest(".field");DRAG={tok,k:tok.dataset.k,i:+tok.dataset.i,mode:fld.dataset.mode,sx:e.clientX,sy:e.clientY,f:fld.getBoundingClientRect(),moved:false,id:e.pointerId}});
document.addEventListener("pointermove",e=>{if(!DRAG||e.pointerId!==DRAG.id)return;const d=DRAG;
  if(!d.moved&&Math.hypot(e.clientX-d.sx,e.clientY-d.sy)<7)return;
  if(!d.moved){d.moved=true;d.tok.classList.add("dragging");try{d.tok.setPointerCapture(e.pointerId)}catch(_){}}
  e.preventDefault();const l=clamp((e.clientX-d.f.left)/d.f.width*100,8,92);let tp=clamp((e.clientY-d.f.top)/d.f.height*100,5,95);
  if(d.mode==="both")tp=d.k==="A"?clamp(tp,52,95):clamp(tp,5,48);d.tok.style.left=l+"%";d.tok.style.top=tp+"%";d.l=l;d.t=tp},{passive:false});
function endDrag(e){if(!DRAG||(e&&e.pointerId!==DRAG.id))return;const d=DRAG;DRAG=null;if(!d.moved)return;SUPPRESS=true;setTimeout(()=>SUPPRESS=false,50);
  const t=S.teams;if(!t||d.l==null){render(true);return}
  const u=d.mode==="both"?unpos2(d.k,d.l,d.t):{x:d.l,y:(95-d.t)/.88};const x=Math.round(clamp(u.x,4,96)),y=Math.round(clamp(u.y,2,100));
  t["p"+d.k.toLowerCase()][d.i]=[x,y,roleFromY(d.i,y)];t.sel=null;render(true)}
document.addEventListener("pointerup",endDrag);document.addEventListener("pointercancel",endDrag);
document.addEventListener("click",e=>{if(SUPPRESS){e.stopImmediatePropagation();e.preventDefault()}},true);

/* Dizilişi görsel olarak paylaş */
function rr(x,X,Y,w,h,r){x.beginPath();x.moveTo(X+r,Y);x.arcTo(X+w,Y,X+w,Y+h,r);x.arcTo(X+w,Y+h,X,Y+h,r);x.arcTo(X,Y+h,X,Y,r);x.arcTo(X,Y,X+w,Y,r);x.closePath()}
// ===== Story görselleri (1080×1920) =====
function confetti(n){if(matchMedia("(prefers-reduced-motion: reduce)").matches)return;const c=document.createElement("canvas");c.className="cfx";const W=c.width=innerWidth*devicePixelRatio,H=c.height=innerHeight*devicePixelRatio;document.body.appendChild(c);const x=c.getContext("2d");
  const cols=["#C6F432","#00E676","#8B6CFF","#B7A6FF","#F1F5F9"];const ps=Array.from({length:n||140},()=>({x:W/2+(Math.random()-.5)*W*.3,y:H*.32,vx:(Math.random()-.5)*W*.022,vy:-Math.random()*H*.02-H*.006,r:(6+Math.random()*8)*devicePixelRatio,a:Math.random()*6,va:(Math.random()-.5)*.3,c:cols[Math.random()*5|0],s:Math.random()<.3}));
  const t0=performance.now();(function f(t){const k=(t-t0)/2600;x.clearRect(0,0,W,H);for(const p of ps){p.vy+=H*.0006;p.vx*=.99;p.x+=p.vx;p.y+=p.vy;p.a+=p.va;x.save();x.globalAlpha=Math.max(0,1-k);x.translate(p.x,p.y);x.rotate(p.a);x.fillStyle=p.c;
    if(p.s){x.beginPath();for(let i=0;i<5;i++){const q=i*1.2566-1.5708;x.lineTo(Math.cos(q)*p.r,Math.sin(q)*p.r);x.lineTo(Math.cos(q+.628)*p.r*.45,Math.sin(q+.628)*p.r*.45)}x.fill()}else x.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);x.restore()}
    if(k<1)requestAnimationFrame(f);else c.remove()})(t0)}
function shareCanvas(c,fname,title){c.toBlob(async blob=>{if(!blob){toast("Görsel oluşturulamadı");return}
    const file=new File([blob],fname,{type:"image/png"});
    try{if(navigator.canShare&&navigator.canShare({files:[file]})){await navigator.share({files:[file],title});return}}catch(err){if(err&&err.name==="AbortError")return}
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=fname;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);toast("Görsel indirildi")},"image/png")}
const loadImg=src=>new Promise(r=>{if(!src)return r(null);const im=new Image();im.onload=()=>r(im);im.onerror=()=>r(null);im.src=src});
function fitFont(x,txt,max,min,weight,fam,w){let f=max;x.font=`${weight} ${f}px ${fam}`;while(f>min&&x.measureText(txt).width>w){f-=2;x.font=`${weight} ${f}px ${fam}`}return f}
const NOTE_COL=v=>v>=8?"#00A35B":v>=7?"#5BBF2E":v>=6.5?"#F2B800":v>=6?"#F28C00":"#E90052";
const NOTE_TX=v=>v<6?"#FFFFFF":"#120A2A";
/* Paylaşım görselleri: Gece Stadı dili. Koyu zemin, stadyum ışığı, buzlu cam kartlar, gece sahası, parlayan rozetler */
const SD='"Inter Tight",Inter,system-ui,sans-serif',SF='Inter,system-ui,sans-serif';
const C_INK="#FFFFFF",C_DK="#FFFFFF",C_MUT="#A99CD6",C_BG="#120A2A",C_TB="#5FE3F5",C_TA="#FF3EA5",C_V="#FF3EA5",C_CARD="#1E1442",C_CARD2="#2C2060",C_LINE="#3A2C78";
const tcol=k=>k==="A"?C_TA:C_TB;
async function fontsOk(){try{await Promise.race([Promise.all([document.fonts.load('900 40px "Inter Tight"'),document.fonts.load('800 40px "Inter Tight"'),document.fonts.load('700 30px Inter'),document.fonts.ready]),new Promise(r=>setTimeout(r,1000))])}catch(_){}}
function storyBase(x,W,H){x.fillStyle=C_BG;x.fillRect(0,0,W,H);
  const BH=x.__bh||600;{const gl=x.createRadialGradient(W*.15,0,10,W*.15,0,W*1.1);gl.addColorStop(0,"rgba(123,63,242,.55)");gl.addColorStop(1,"rgba(123,63,242,0)");x.fillStyle=gl;x.fillRect(0,0,W,H)}const g=x.createLinearGradient(0,0,W*.6,BH);g.addColorStop(0,"#7B3FF2");g.addColorStop(.6,"#3A1A9E");g.addColorStop(1,"#24105E");x.fillStyle=g;rr(x,0,-80,W,BH+80,64);x.fill();
  x.save();x.globalAlpha=.05;x.fillStyle="#fff";for(const[px,w]of[[W*.55,120],[W*.72,60],[W*.86,140]]){x.beginPath();x.moveTo(px,-80);x.lineTo(px+w,-80);x.lineTo(px+w-260,BH);x.lineTo(px-260,BH);x.closePath();x.fill()}x.restore();
  x.textAlign="center";x.textBaseline="alphabetic"}
function cSticker(x,k,c,cx,cy,sz,rot){const d=DI[k];if(!d)return;const b=new Path2D(d[0]||d[1]);x.save();x.translate(cx,cy);x.rotate((rot||-8)*Math.PI/180);x.scale(sz/24,sz/24);x.translate(-12,-12);x.lineCap="round";x.lineJoin="round";
  x.fillStyle="#fff";x.strokeStyle="#fff";x.lineWidth=5.5;x.fill(b);x.stroke(b);if(d[0]){x.fillStyle=DC[c]||c;x.strokeStyle="#120A2A";x.lineWidth=1.6;x.fill(b);x.stroke(b)}if(d[1]){x.strokeStyle="#120A2A";x.lineWidth=1.6;x.stroke(new Path2D(d[1]))}x.restore()}
function cHead(x,W,h,label,meta){
  x.save();rr(x,0,-60,W,h+60,56);x.clip();x.strokeStyle="rgba(255,255,255,.06)";x.lineWidth=4;x.beginPath();x.arc(W/2,h,300,Math.PI,0);x.stroke();x.beginPath();x.moveTo(0,h-2);x.lineTo(W,h-2);x.stroke();
  const g=x.createRadialGradient(W/2,h,20,W/2,h,700);g.addColorStop(0,"rgba(255,62,165,.16)");g.addColorStop(1,"rgba(255,62,165,0)");x.fillStyle=g;x.fillRect(0,0,W,h);x.restore();
  x.save();x.shadowColor="rgba(55,0,60,.25)";x.shadowBlur=14;rr(x,60,58,64,64,16);x.fillStyle="#fff";x.fill();x.restore();x.save();x.translate(60,58);x.fillStyle="#37003C";x.fill(new Path2D("M32 8.8l18.8 6v15.2c0 12.5-8.3 20.8-18.8 25.8C21.5 50.8 13.2 42.5 13.2 30V14.8z"));x.strokeStyle="#fff";x.lineWidth=4.8;x.lineCap="round";x.lineJoin="round";x.stroke(new Path2D("M23.2 22l8.8 11.5 8.8-11.5M32 33.5v12"));x.fillStyle="#00FF85";x.beginPath();x.arc(32,16,2,0,Math.PI*2);x.fill();x.restore();
  x.textAlign="left";x.fillStyle="#fff";x.font=`900 44px ${SD}`;x.fillText("YELEK",142,106);
  if(label){x.font=`800 26px ${SF}`;const w=x.measureText(label).width+44;rr(x,W-60-w,64,w,52,26);x.fillStyle="#FF3EA5";x.fill();x.fillStyle="#fff";x.textAlign="center";x.fillText(label,W-60-w/2,99);
    {const t=label.toLocaleLowerCase("tr");const m=YP_IC.find(q=>q[0].test(t))||[0,"top","pink"];cSticker(x,m[1],m[1]==="top"?"gold":m[2]==="pink"?"gold":m[2],W-60-w-44,90,72,-8)}}
  if(meta){x.textAlign="left";x.fillStyle="rgba(255,255,255,.9)";x.font=`600 30px ${SF}`;x.fillText(meta,60,192,W-120)}
  x.textAlign="center"}
function cCard(x,X,Y,w,h,r,fill,stroke){x.save();x.shadowColor="rgba(0,0,0,.35)";x.shadowBlur=30;x.shadowOffsetY=10;rr(x,X,Y,w,h,r||32);x.fillStyle=fill==="#F3EEFF"?C_CARD2:(fill||C_CARD);x.fill();x.restore();rr(x,X,Y,w,h,r||32);x.lineWidth=stroke?4:2;x.strokeStyle=stroke||C_CARD2;x.stroke()}
function storyFoot(x,W,H){x.textAlign="center";x.fillStyle="#8C7FC0";x.font=`600 26px ${SF}`;x.fillText(location.host+location.pathname,W/2,H-46)}
function noteBadge(x,v,cx,cy,fs,motm){x.font=`900 ${fs}px ${SD}`;const t=(motm?"★":"")+fN(v);const w=Math.max(fs*2.2,x.measureText(t).width+fs*.9),h=fs*1.5;x.save();x.shadowColor=NOTE_COL(v);x.shadowBlur=fs*.7;rr(x,cx-w/2,cy-h/2,w,h,h*.28);x.fillStyle=NOTE_COL(v);x.fill();x.restore();if(motm){rr(x,cx-w/2,cy-h/2,w,h,h*.28);x.lineWidth=Math.max(3,fs*.09);x.strokeStyle="#fff";x.stroke()}x.fillStyle=NOTE_TX(v);x.textAlign="center";x.textBaseline="middle";x.fillText(t,cx,cy+fs*.04);x.textBaseline="alphabetic";return w}
function drawAv(x,id,cx,cy,R,team,im){x.save();x.shadowColor=team==="B"?"rgba(95,227,245,.6)":team==="A"?"rgba(255,62,165,.6)":"rgba(0,0,0,.45)";x.shadowBlur=R*.6;x.beginPath();x.arc(cx,cy,R+Math.max(3,R*.07),0,Math.PI*2);x.fillStyle=team==="B"?C_TB:team==="A"?C_TA:"rgba(255,255,255,.9)";x.fill();x.restore();
  x.beginPath();x.arc(cx,cy,R,0,Math.PI*2);const ag=x.createLinearGradient(cx-R,cy-R,cx+R,cy+R);ag.addColorStop(0,"#7B3FF2");ag.addColorStop(1,"#24105E");x.fillStyle=ag;x.fill();
  x.save();x.beginPath();x.arc(cx,cy,R,0,Math.PI*2);x.clip();
  if(im){const pS=R*2,sc=Math.max(pS/im.width,pS/im.height);x.drawImage(im,cx-R+(pS-im.width*sc)/2,cy-R-(im.height*sc-pS)*.2,im.width*sc,im.height*sc)}
  else{x.fillStyle="#fff";x.font=`900 ${Math.round(R*.7)}px ${SD}`;x.textAlign="center";x.textBaseline="middle";x.fillText(initials(nameOf(id)),cx,cy+2)}
  x.restore();x.textBaseline="alphabetic"}
function cPitch(x,px,py,pw,ph){x.save();x.shadowColor="rgba(0,0,0,.4)";x.shadowBlur=40;x.shadowOffsetY=12;rr(x,px,py,pw,ph,32);const g=x.createLinearGradient(0,py,0,py+ph);g.addColorStop(0,"#2A1B66");g.addColorStop(1,"#1E1442");x.fillStyle=g;x.fill();x.restore();
  x.save();rr(x,px,py,pw,ph,32);x.clip();
  x.strokeStyle="rgba(255,255,255,.2)";x.lineWidth=4;const sx=pw/68,sy=ph/100;const R=(a,b,w,h)=>x.strokeRect(px+a*sx,py+b*sy,w*sx,h*sy);
  R(3,3,62,94);R(17,3,34,13);R(26,3,16,5);R(17,84,34,13);R(26,92,16,5);x.beginPath();x.moveTo(px+3*sx,py+50*sy);x.lineTo(px+65*sx,py+50*sy);x.stroke();
  x.beginPath();x.ellipse(px+34*sx,py+50*sy,7*sx,7*sx,0,0,Math.PI*2);x.stroke();x.fillStyle="rgba(255,255,255,.3)";x.beginPath();x.arc(px+34*sx,py+50*sy,6,0,Math.PI*2);x.fill();rr(x,px,py,pw,ph,32);x.lineWidth=2;x.strokeStyle=C_LINE;x.stroke();x.restore()}
const evTxt=o=>{o=o||{};const pg=Math.min(+o.pg||0,+o.g||0);const g=(+o.g||0)-pg;const t=[];if(g)t.push(g+" gol");if(pg)t.push(pg+" penaltı golü");if(+o.a)t.push(o.a+" asist");if(+o.cl)t.push("çizgiden çıkardı");if(+o.ps)t.push("penaltı kurtardı");if(+o.og)t.push("kendi kalesine");return t.join(" · ")};
async function shareStory(m,kind){await fontsOk();
  const W=1080,H=1920,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const inf=S.mInfo[m.id]||{pts:{}};const st=m.stats||{};const sa=+m.score_a||0,sb=+m.score_b||0;
  const meta=`${fmtDate(m.date)}${S.settings.field_name?" · "+S.settings.field_name:""}`;const nA=nmOf(m,"A"),nB=nmOf(m,"B");
  const IMS={};await Promise.all(plAll(m).map(async id=>{IMS[id]=await loadImg(photoOf(id))}));
  x.__bh=kind==="res"?780:600;storyBase(x,W,H);
  if(kind==="res"){
    cHead(x,W,760,"MAÇ SONUCU",meta);
    x.textAlign="center";x.fillStyle="#fff";fitFont(x,nA,58,32,900,SD,W/2-140);x.fillText(nA,W/4+20,350);fitFont(x,nB,58,32,900,SD,W/2-140);x.fillText(nB,W*3/4-20,350);
    rr(x,W/4-20,374,80,10,5);x.fillStyle=C_TA;x.fill();rr(x,W*3/4-60,374,80,10,5);x.fillStyle=C_TB;x.fill();
    x.font=`900 280px ${SD}`;x.textAlign="right";x.fillStyle=sa>=sb?"#fff":"rgba(255,255,255,.5)";x.fillText(String(sa),W/2-50,640);x.textAlign="left";x.fillStyle=sb>=sa?"#fff":"rgba(255,255,255,.5)";x.fillText(String(sb),W/2+50,640);
    rr(x,W/2-22,540,44,14,7);x.fillStyle="rgba(255,255,255,.7)";x.fill();
    x.textAlign="center";x.font=`800 32px ${SF}`;x.fillStyle="#fff";x.fillText(sa===sb?"Berabere":(sa>sb?nA:nB)+" kazandı",W/2,712);
    // oyuncular: iki sütun, nota göre sıralı
    const cy0=800,rowH=94;const n=Math.max(plOf(m,"A").length,plOf(m,"B").length);const ch=96+n*rowH+20;cCard(x,40,cy0,W-80,ch,36);
    x.fillStyle="rgba(255,255,255,.1)";x.fillRect(W/2-1,cy0+30,2,ch-60);
    const col=(k,X0)=>{const ids=plOf(m,k).slice().sort((a,b)=>((inf.pts[b]||{}).pts||0)-((inf.pts[a]||{}).pts||0));
      x.textAlign="left";x.fillStyle=C_INK;x.font=`900 34px ${SD}`;x.fillText(nmOf(m,k),X0,cy0+64,360);rr(x,X0,cy0+78,64,7,4);x.fillStyle=tcol(k);x.fill();
      let y=cy0+96;for(const id of ids){const r=inf.pts[id];drawAv(x,id,X0+34,y+rowH/2,32,k,IMS[id]);
        x.textAlign="left";x.fillStyle=C_INK;x.font=`700 29px ${SF}`;x.fillText(shortName(nameOf(id)),X0+84,y+rowH/2-4,260);
        x.fillStyle=C_MUT;x.font=`500 23px ${SF}`;x.fillText(evTxt(st[id])||(r?ROLE_NAME[r.role]:""),X0+84,y+rowH/2+28,270);
        if(r)noteBadge(x,r.pts,X0+410,y+rowH/2,30,inf.motm===id);y+=rowH}};
    col("A",70);col("B",W/2+24);
    const mo=inf.motm;if(mo){const r=inf.pts[mo];const y0=cy0+ch+30;cCard(x,40,y0,W-80,180,36,"#F3EEFF",C_V);
      drawAv(x,mo,130,y0+90,58,r?r.side:null,IMS[mo]);
      x.textAlign="left";x.fillStyle=C_V;x.font=`800 26px ${SF}`;x.fillText("★ MAÇIN ADAMI",224,y0+70);x.fillStyle=C_INK;fitFont(x,nameOf(mo),54,32,900,SD,560);x.fillText(nameOf(mo),224,y0+126);
      if(r)noteBadge(x,r.pts,W-130,y0+90,48,false)}
  }else{
    const mo=inf.motm;if(!mo){toast("Maçın Adamı seçilmemiş");return}const r=inf.pts[mo];const p=P(mo);
    cHead(x,W,980,"MAÇIN ADAMI",meta);
    const fw=560,fx=(W-fw)/2,fy=250,fh=fw*1000/700;
    const gl=x.createRadialGradient(W/2,fy+fh/2,60,W/2,fy+fh/2,520);gl.addColorStop(0,"rgba(255,62,165,.35)");gl.addColorStop(1,"rgba(255,62,165,0)");x.fillStyle=gl;x.fillRect(0,fy-60,W,700);
    if(p)await drawFut(x,p,fx,fy,fw,{border:"#7B3FF2",noTrend:true});
    if(r)noteBadge(x,r.pts,fx+fw-20,fy+14,66,false);
    const k=r?r.side:sideOf(m,mo);x.textAlign="center";x.fillStyle=C_INK;x.font=`700 34px ${SF}`;x.fillText(`${p?EPOS[eposOf(p)][1]:""}${k?" · "+nmOf(m,k):""}`,W/2,fy+fh+80);
    const o=st[mo]||{};const kl=r&&r.role==="KL";const boxes=[[kl?"YENİLEN":"GOL",kl?(r.op):(+o.g||0)],["ASİST",+o.a||0],["NOT",r?fN(r.pts):"–"],["KART",ovrOf(mo)]];
    const bw=216,bg=20,bx0=(W-(bw*4+bg*3))/2,by=fy+fh+120;
    boxes.forEach(([l,v],i)=>{const X=bx0+i*(bw+bg);if(i===0){cCard(x,X,by,bw,170,28,"#F3EEFF",C_V)}else cCard(x,X,by,bw,170,28);x.textAlign="center";x.fillStyle=C_MUT;x.font=`800 24px ${SF}`;x.fillText(l,X+bw/2,by+52);x.fillStyle=i===0?C_V:C_INK;x.font=`900 80px ${SD}`;x.fillText(String(v),X+bw/2,by+138)});
    const yS=by+220;cCard(x,60,yS,W-120,130,32);x.textAlign="center";const sT=`${nA}   ${sa} – ${sb}   ${nB}`;fitFont(x,sT,52,28,900,SD,W-260);x.fillStyle=C_INK;x.fillText(sT,W/2,yS+84);
    const tw=x.measureText(sT).width;x.beginPath();x.arc(W/2-tw/2-30,yS+66,11,0,Math.PI*2);x.fillStyle=tcol("A");x.fill();x.beginPath();x.arc(W/2+tw/2+30,yS+66,11,0,Math.PI*2);x.fillStyle=C_TB;x.fill();
    const aw=[inf.gol?["Haftanın Golü",shortName(nameOf(inf.gol))]:null,inf.fiy?["Fiyasko",shortName(nameOf(inf.fiy))]:null].filter(Boolean);
    if(aw.length){x.font=`600 28px ${SF}`;x.fillStyle=C_MUT;x.fillText(aw.map(([a,b])=>a+": "+b).join("   ·   "),W/2,yS+200)}
  }
  storyFoot(x,W,H);shareCanvas(c,kind==="motm"?"macin-adami.png":"mac-sonucu.png",kind==="motm"?"Maçın Adamı":"Maç sonucu");
}
async function shareImg(m){await fontsOk();
  const W=1080,H=1920,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");x.__bh=420;storyBase(x,W,H);
  const fin=mDone(m);const NI=fin?S.mInfo[m.id]:null;const sa=+m.score_a||0,sb=+m.score_b||0;
  cHead(x,W,400,fin?"MAÇ KADROSU":"KADROLAR",`${fmtDate(m.date)}${m.time?" · "+m.time:""}${S.settings.field_name?" · "+S.settings.field_name:""}`);
  const nA=nmOf(m,"A"),nB=nmOf(m,"B");const A0=m.team_a||[],B0=m.team_b||[];
  x.textAlign="right";x.fillStyle="#fff";fitFont(x,nA,64,34,900,SD,W/2-140);x.fillText(nA,W/2-70,290);x.textAlign="left";fitFont(x,nB,64,34,900,SD,W/2-140);x.fillText(nB,W/2+70,290);
  x.textAlign="center";x.font=`900 ${fin?56:44}px ${SD}`;x.fillStyle=fin?"#fff":"rgba(255,255,255,.55)";x.fillText(fin?`${sa}–${sb}`:"vs",W/2,286);
  x.font=`600 26px ${SF}`;x.fillStyle="rgba(255,255,255,.88)";x.textAlign="right";x.fillText(`${formText(formOf(m,"A"),posArr(m,"A"))} · ort. ${sumAvg(A0)}`,W/2-70,340);x.textAlign="left";x.fillText(`${formText(formOf(m,"B"),posArr(m,"B"))} · ort. ${sumAvg(B0)}`,W/2+70,340);
  rr(x,W/2-70-80,356,80,8,4);x.fillStyle=C_TA;x.fill();rr(x,W/2+70,356,80,8,4);x.fillStyle=C_TB;x.fill();
  const ph=1380,pw=Math.round(ph*68/140),px=Math.round((W-pw)/2),py=410;cPitch(x,px,py,pw,ph);
  const pa=posArr(m,"A"),pb=posArr(m,"B"),la=pad7(lineupOf(m,"A"),A0),lb=pad7(lineupOf(m,"B"),B0);
  const TT=layout("both",pa,pb,la,lb,true),IM={};await Promise.all(TT.filter(T=>T.id).map(async T=>{IM[T.id]=await loadImg(photoOf(T.id))}));
  const cw=Math.round(pw*.165),chh=Math.round(cw*74/56),k=cw/56;
  for(const T of TT){if(!T.id)continue;const cx=px+T.l/100*pw,cy=py+T.t/100*ph;const p=P(T.id);
    const X=cx-cw/2,Y=cy-chh/2,rad=10*k,nbH=16*k;
    // kart zemini (takım rengi)
    x.save();x.shadowColor="rgba(31,10,50,.35)";x.shadowBlur=22;x.shadowOffsetY=8;rr(x,X,Y,cw,chh,rad);
    const g=x.createLinearGradient(X,Y,X+cw*.45,Y+chh);if(T.k==="A"){g.addColorStop(0,"#FF3EA5");g.addColorStop(.8,"#7B3FF2")}else{g.addColorStop(0,"#5FE3F5");g.addColorStop(.8,"#3A1A9E")}
    x.fillStyle=g;x.fill();x.restore();
    // fotoğraf: sağ altta, şeridin üstünde, kartın üstünden taşabilir
    const im=IM[T.id];const aH=chh-nbH;const piW=cw*.72,piH=aH*1.18;
    x.save();x.beginPath();x.rect(X-4,Y-60,cw+8,aH+60);x.clip();
    if(im){const sc=Math.min(piW/im.width,piH/im.height);const dw=im.width*sc,dh=im.height*sc;x.shadowColor="rgba(0,0,0,.35)";x.shadowBlur=8;x.shadowOffsetY=2;x.drawImage(im,X+cw-dw-(piW-dw)/2,Y+aH-dh,dw,dh)}
    else{x.fillStyle="rgba(255,255,255,.3)";x.font=`800 ${Math.round(22*k)}px ${SD}`;x.textAlign="right";x.fillText(initials(nameOf(T.id)),X+cw-10*k,Y+aH-6*k)}
    x.restore();
    // isim şeridi
    x.save();rr(x,X,Y,cw,chh,rad);x.clip();x.fillStyle="#120A2A";x.fillRect(X,Y+chh-nbH,cw,nbH);x.fillStyle=tcol(T.k);x.fillRect(X,Y+chh-3*k,cw,3*k);x.restore();
    const nm=shortName(nameOf(T.id));x.textAlign="center";x.textBaseline="middle";x.fillStyle="#fff";fitFont(x,nm,Math.round(9.5*k),12,800,SF,cw-10);x.fillText(nm,cx,Y+chh-nbH/2-1);
    // reyting ve mevki (sol üst)
    const ov=p?.guest?"MİS":String(ovrOf(T.id));x.textAlign="left";x.textBaseline="top";x.save();x.shadowColor="rgba(0,0,0,.85)";x.shadowBlur=10;x.fillStyle="#fff";x.font=`900 ${Math.round(16*k)}px ${SD}`;x.fillText(ov,X+4*k,Y+4*k);
    x.font=`800 ${Math.round(7.5*k)}px ${SF}`;x.fillText(T.ep,X+5*k,Y+21*k);x.restore();x.textBaseline="alphabetic";
    // maç notu (bitti ise) sağ üst
    const r=NI&&NI.pts[T.id];if(r)noteBadge(x,r.pts,X+cw-2,Y+4,22,NI.motm===T.id);
    // kaptan
    if((T.k==="A"?m.cap_a:m.cap_b)===T.id){const ccx=X+(4+7)*k,ccy=Y+(31+7)*k;x.save();x.shadowColor="rgba(0,0,0,.35)";x.shadowBlur=6;x.beginPath();x.arc(ccx,ccy,7*k,0,Math.PI*2);x.fillStyle="#FFD400";x.fill();x.restore();x.fillStyle="#37003C";x.font=`900 ${Math.round(8.3*k)}px ${SF}`;x.textAlign="center";x.textBaseline="middle";x.fillText("C",ccx,ccy+1);x.textBaseline="alphabetic"}}
  const bench=[...A0.filter(id=>!la.includes(id)),...B0.filter(id=>!lb.includes(id))];
  x.textAlign="center";x.fillStyle=C_MUT;x.font=`600 26px ${SF}`;if(bench.length)x.fillText("Yedek: "+bench.map(id=>shortName(nameOf(id))).join(", "),W/2,py+ph+40,W-120);
  storyFoot(x,W,H);shareCanvas(c,"kadrolar.png","Kadrolar");
}
function drawPhoto(x,im,X,Y,w,h,r){x.save();rr(x,X,Y,w,h,r);x.clip();if(im){const sc=Math.max(w/im.width,h/im.height);x.drawImage(im,X+(w-im.width*sc)/2,Y+(h-im.height*sc)*.2,im.width*sc,im.height*sc)}x.restore()}
const TIER_COL={t1:["#FFD400","#B4570A","#2A1300"],t2:["#FF3EA5","#7B3FF2","#FFFFFF"],t3:["#7B3FF2","#3A1A9E","#FFFFFF"],t4:["#3A2C78","#22164A","#FFFFFF"]};

// büyük FUT kartı (700×1000 taban ölçü, cw'ye göre ölçeklenir)
async function drawFut(x,p,cx,cy,cw,opt){opt=opt||{};const f=cw/700,cw0=700,ch=1000;const s=S.stats[p.id]||{ovr:baseOf(p),attrs:p.attrs||{}};const o=s.ovr;const[c1,c2,tx]=TIER_COL[p.guest?"t4":tierOf(o)];const tw=opt.tw;
  const im=await loadImg(photoOf(p.id));x.save();x.translate(cx,cy);x.scale(f,f);
  const gr=x.createLinearGradient(0,0,cw0,ch);gr.addColorStop(0,c1);gr.addColorStop(1,c2);rr(x,0,0,cw0,ch,56);x.fillStyle=gr;x.fill();
  x.save();rr(x,0,0,cw0,ch,56);x.clip();const sh=x.createRadialGradient(cw0*.3,0,10,cw0*.3,0,cw0*.9);sh.addColorStop(0,"rgba(255,255,255,.45)");sh.addColorStop(1,"rgba(255,255,255,0)");x.fillStyle=sh;x.fillRect(0,0,cw0,ch);
  x.strokeStyle="rgba(255,255,255,.18)";x.lineWidth=10;for(let i=-4;i<10;i++){x.beginPath();x.moveTo(cw0*.55+i*34,40);x.lineTo(cw0*.55+i*34-160,640);x.stroke()}
  const pw=430,ph=540;if(im){drawPhoto(x,im,cw0-pw-40,60,pw,ph,0);const fd=x.createLinearGradient(0,60+ph*.7,0,60+ph);fd.addColorStop(0,"rgba(0,0,0,0)");fd.addColorStop(1,c2);x.fillStyle=fd;x.fillRect(cw0-pw-40,60+ph*.7,pw,ph*.3+2)}
  else{x.fillStyle=tx;x.globalAlpha=.35;x.font=`900 170px ${SD}`;x.textAlign="center";x.textBaseline="alphabetic";x.fillText(initials(p.name),cw0-pw/2-20,400);x.globalAlpha=1}
  x.restore();const border=opt.border||(s.lastO>0?"#00E676":tw?"#7B3FF2":"rgba(255,255,255,.4)");rr(x,0,0,cw0,ch,56);x.lineWidth=opt.border||s.lastO>0||tw?8:3;x.strokeStyle=border;x.stroke();
  x.textBaseline="alphabetic";x.fillStyle=tx;x.textAlign="center";x.font=`900 190px ${SD}`;x.fillText(p.guest?"MİS":String(o),150,230);x.font=`900 56px ${SD}`;x.fillText(opt.ep||eposOf(p),150,300);
  if(s.lastO&&!opt.noTrend){x.font=`900 44px ${SD}`;x.fillStyle=s.lastO>0?"#0A8A45":"#C8372D";x.fillText((s.lastO>0?"▲":"▼")+Math.abs(s.lastO),150,365)}
  if(tw){x.font=`900 34px ${SD}`;const t="HAFTANIN TAKIMI";const w=x.measureText(t).width+30;rr(x,150-w/2,400,w,50,12);x.fillStyle="#FF3EA5";x.fill();x.fillStyle="#fff";x.fillText(t,150,437)}
  x.fillStyle=tx;fitFont(x,up(shortName(p.name)),84,48,900,SD,cw0-80);x.fillText(up(shortName(p.name)),cw0/2,690);
  x.globalAlpha=.3;x.fillRect(60,720,cw0-120,3);x.globalAlpha=1;
  attrSet(p.pos).forEach(([k,l],i)=>{const col=i%2,row=i/2|0;const X=70+col*(cw0/2-20),Y=800+row*80;const v=+(s.attrs?.[k])||0;
    x.textAlign="left";x.fillStyle=tx;x.font=`900 52px ${SD}`;x.fillText(String(v||"–"),X,Y);x.font=`800 30px ${SF}`;x.fillText(l,X+88,Y-4);
    x.globalAlpha=.2;rr(x,X,Y+14,cw0/2-110,6,3);x.fill();x.globalAlpha=.75;rr(x,X,Y+14,(cw0/2-110)*Math.min(1,v/100),6,3);x.fill();x.globalAlpha=1});
  x.restore();return ch*f}
async function storyCard(p){await fontsOk();
  const W=1080,H=1920,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");
  const s=S.stats[p.id]||{ovr:baseOf(p),attrs:p.attrs||{}};const tw=lastTotw().includes(p.id);
  storyBase(x,W,H);cHead(x,W,900,"OYUNCU KARTI",`${S.settings.group_name||""}${S.settings.group_name?" · ":""}${fmtShort(new Date().toISOString().slice(0,10))}`);
  const cw=660,ch=cw*1000/700,cx=(W-cw)/2,cy=250;
  const gl=x.createRadialGradient(W/2,cy+ch/2,80,W/2,cy+ch/2,600);gl.addColorStop(0,tw?"rgba(255,62,165,.42)":"rgba(255,62,165,.22)");gl.addColorStop(1,"rgba(255,62,165,0)");x.fillStyle=gl;x.fillRect(0,cy-60,W,720);
  await drawFut(x,p,cx,cy,cw,{tw});
  const boxes=[["MAÇ",s.games||0],["GOL",s.goals||0],["ASİST",s.ast||0],["ORT. NOT",fN(s.avgPts)]];const bw=216,bgp=20,bx0=(W-(bw*4+bgp*3))/2,by=cy+ch+60;
  boxes.forEach(([l,v],i)=>{const X=bx0+i*(bw+bgp);cCard(x,X,by,bw,170,28);x.textAlign="center";x.fillStyle=C_MUT;x.font=`800 24px ${SF}`;x.fillText(l,X+bw/2,by+52);x.fillStyle=i===1?C_V:C_INK;x.font=`900 80px ${SD}`;x.fillText(String(v),X+bw/2,by+138)});
  if(s.genX!=null){x.textAlign="center";x.fillStyle=C_INK;x.font=`800 34px ${SF}`;x.fillText(`Reyting ${s.ovr}${s.motm?` · ${s.motm}× Maçın Adamı`:""}${tw?" · Haftanın Takımı":""}`,W/2,by+250)}
  storyFoot(x,W,H);shareCanvas(c,"yelek-kart.png","Oyuncu kartı");
}
async function storyTotw(m){await fontsOk();
  const inf=S.mInfo[m.id]||{pts:{},totw:[]};const ids=(inf.totw||[]).slice(0,7);if(!ids.length){toast("Haftanın takımı henüz yok");return}
  const W=1080,H=1920,c=document.createElement("canvas");c.width=W;c.height=H;const x=c.getContext("2d");storyBase(x,W,H);
  const sa=+m.score_a||0,sb=+m.score_b||0;cHead(x,W,330,"HAFTANIN TAKIMI",fmtDate(m.date));
  x.textAlign="left";x.fillStyle="#fff";const sT=`${nmOf(m,"A")} ${sa}–${sb} ${nmOf(m,"B")}`;fitFont(x,sT,56,30,900,SD,W-120);x.fillText(sT,60,280);
  const ims=await Promise.all(ids.map(id=>loadImg(photoOf(id))));
  const rowH=184,gap=16,y0=380;
  ids.forEach((id,i)=>{const Y=y0+i*(rowH+gap),r=inf.pts[id]||{};const k=r.side||sideOf(m,id);const mo=inf.motm===id;
    cCard(x,50,Y,W-100,rowH,32,mo?"#F3EEFF":null,mo?C_V:null);
    drawAv(x,id,150,Y+rowH/2,58,k,ims[i]);
    const p=P(id);x.textAlign="left";x.fillStyle=C_INK;fitFont(x,nameOf(id),52,30,900,SD,520);x.fillText(nameOf(id),250,Y+84);
    const o=(m.stats||{})[id]||{};const ev=[];if(+o.g)ev.push(o.g+" gol");if(+o.a)ev.push(o.a+" asist");if(r.role==="KL")ev.push((r.op??"")+" yenilen");
    x.fillStyle=C_MUT;x.font=`600 28px ${SF}`;x.fillText(`${r.role==="KL"?"Kaleci":p?EPOS[eposOf(p)][1]:""}${ev.length?" · "+ev.join(", "):""}${mo?" · ★ Maçın Adamı":""}`,250,Y+132,540);
    if(r.pts!=null)noteBadge(x,r.pts,W-140,Y+rowH/2,48,false)});
  storyFoot(x,W,H);shareCanvas(c,"haftanin-takimi.png","Haftanın Takımı");
}

/* Draft zamanlayıcı */
function startTimer(){stopTimer();S.tick=setInterval(()=>{const d=S.draft;if(!d||!d.deadline)return stopTimer();const left=Math.ceil((d.deadline-Date.now())/1000);const el=$("#dtimer");if(el)el.textContent=Math.max(0,left);
  if(left<=0){const m=S.matches.find(x=>x.id===d.mid);const pool=rsvpLists(m).kadro.map(p=>p.id).filter(id=>!d.A.includes(id)&&!d.B.includes(id)).sort((a,b)=>genOf(b)-genOf(a));if(pool[0]){toast("Süre doldu, en yüksek reytingli seçildi");dpick(pool[0])}}},250)}
function stopTimer(){clearInterval(S.tick);S.tick=null}
function dpick(id){const d=S.draft;if(!d)return;(d.turn==="A"?d.A:d.B).push(id);d.turn=d.turn==="A"?"B":"A";d.deadline=Date.now()+20000;
  const m=S.matches.find(x=>x.id===d.mid);if(!rsvpLists(m).kadro.some(p=>!d.A.includes(p.id)&&!d.B.includes(p.id)))stopTimer();render(true)}

setTimeout(async()=>{ // betiğin tamamı yüklendikten sonra başla (sonradan tanımlanan sabitler hazır olsun)
  // takım linki (?t=slug): takımı bul, telefonda hatırla, adres çubuğundan temizle
  {const q=new URLSearchParams(location.search);const sl=q.get("t");
    if(sl){S.viaLink=true;LS.set("y_int",q.has("katil")?"katil":"takip");q.delete("katil");try{const t=await rpc("team_by_slug",{p_slug:sl});if(t&&t.id){if(t.id!==TID){cacheClear();TID=t.id;LS.set("y_team",String(t.id));LS.del("y_me");S.me=""}}else S.badTeam=true}catch(_){}
      q.delete("t");history.replaceState(null,"",location.pathname+(q.toString()?"?"+q:"")+location.hash)}}
  cacheLoad();
  render(true);photosLoadCache();
  newVer();
  const ap=authInit();// giriş kütüphanesi veriyle aynı anda yüklensin
  await load();
  await ap;pushInit().then(()=>render(true));
  if(S.badTeam)toast("Takım linki geçersiz ya da takım kapatılmış");
  if(S.loaded&&!S.me&&!S.session&&!gated()&&S.players.length&&!LS.get("y_asked")){LS.set("y_asked","1");S.sheet={type:"me"};render(true)}
document.addEventListener("keydown",e=>{if(e.key==="Enter"&&e.target&&(e.target.id==="betComTxt"||e.target.id==="odaTxt")&&!e.shiftKey&&!("ontouchstart"in window)){e.preventDefault();const b=document.querySelector(".oda-send");if(b)b.click()}});
},0);

// tahmin oranları için kadro reytingleri: yönetici cihazı hesaplayıp sunucuya yazar
async function betRateSync(){if(!S.admin||S.fol||S._brs)return;const m=betNext();if(!m||matchTs(m)<=Date.now())return;
  const av=k=>{const L=plOf(m,k).filter(id=>P(id));return L.length?L.reduce((t,id)=>t+ovrOf(id),0)/L.length:null};const ra=av("A"),rb=av("B");if(ra==null||rb==null)return;
  const r0=m.bet_r||{};if(Math.abs((+r0.ra||0)-ra)<.3&&Math.abs((+r0.rb||0)-rb)<.3)return;S._brs=1;
  try{const r=await rpc("bet_rate",{p_match:m.id,p_ra:+ra.toFixed(1),p_rb:+rb.toFixed(1)});if(r&&r.ok){m.bet_r={ra:+ra.toFixed(1),rb:+rb.toFixed(1)};delete BET.board[m.id];delete BET.at["board"+m.id];if(S.tab==="iddia")render(true)}}catch(_){}S._brs=0}
// ===== TAHMİN: sembolik sikkeyle maç tahminleri (iç adı "iddia") =====
const BET={feed:null,board:{},tbl:null,lists:{},kings:null,week:{},slip:[],amt:"",busy:0,at:{}};
const fJ=n=>(Math.round(+n||0)).toLocaleString("tr-TR");
const fO=n=>(+n).toFixed(2).replace(".",",");
const betNext=()=>S.matches.filter(m=>!m.archived&&!isExt(m)&&m.state==="takim").sort((a,b)=>matchTs(a)-matchTs(b))[0];
const betGrp=k=>["sonuc","fark","hnd"].includes(k)?"sonuc":["aralik","t95","t125","t155","iki6"].includes(k)?"toplam":k.includes(":")?"p:"+k.split(":")[1]:k;
function betSk(bd){const c=BET.sk;if(c&&c.a>=0&&c.b>=0)return{a:c.a,b:c.b};return{a:Math.round(+bd.la||6),b:Math.round(+bd.lb||6)}}
function betSkCard(m,bd){if(!bd.skor)return"";const c=betSk(bd);const v=c.a+"-"+c.b;const od=(bd.skor[c.a]||[])[c.b];if(!od)return"";const on=BET.slip.some(l=>l.k==="skor"&&l.s===v);const pp=betPopPct(bd,"skor",v);const dis=bd.open?"":" disabled";
  const st=(t,n)=>`<div class="bsk-t"><span class="t${t.toUpperCase()}">${esc(nmOf(m,t.toUpperCase()))}</span><div class="bsk-s"><button data-act="betSk" data-t="${t}" data-d="-1" aria-label="${esc(nmOf(m,t.toUpperCase()))} golünü azalt"${dis||(n<=0?" disabled":"")}>−</button><b class="num" aria-live="polite">${n}</b><button data-act="betSk" data-t="${t}" data-d="1" aria-label="${esc(nmOf(m,t.toUpperCase()))} golünü artır"${dis||(n>=20?" disabled":"")}>+</button></div></div>`;
  return `<section class="card bmk bsk"><h3>Skor tahmini</h3><div class="bsk-r">${st("a",c.a)}${st("b",c.b)}</div>
    <div class="bo n1"><button class="${on?"on":""}"${dis} data-act="betPick" data-k="skor" data-v="${v}" data-l="Skor tahmini · ${c.a}–${c.b}" data-o="${od}" aria-pressed="${on}"><span>${c.a}–${c.b} biter${pp?`<em class="bpop">%${pp} oynadı</em>`:""}</span><b class="num">${fO(od)}</b></button></div>
    <p class="bhint">${dIcon("simsek","gold",16)}<span>Skoru tam bilirsen tutar. Maç sonucu, handikap ve toplam gol seçimleriyle aynı tahmine girmez; oyuncu seçimleriyle girer.</span></p></section>`}
const betOdd=()=>Math.min(999,BET.slip.reduce((t,l)=>t*l.odd,1));
// oturum anahtarı süresi dolmak üzereyse önce tazele (ilk açılışta tahmin verisi takılmasın)
async function freshAuth(){const e=S.session?.expires_at;if(!e||e*1000-Date.now()>60000||!AUTH.sb)return;await refreshOnce()}
async function betLoad(k,arg,force,tries){const key=k+(arg||"");if(!force&&BET.at[key]&&Date.now()-BET.at[key]<60000)return;if(BET.at[key]===-1)return;BET.at[key]=-1;
  let ok=false;try{await freshAuth();let r;if(k==="board"){r=await rpc("bet_board",{p_match:arg});if(r&&r.ok)BET.board[arg]=r}
    else if(k==="tbl"){r=await rpc("bet_table",{p_week:(betNext()||{}).date||null});if(r&&r.ok)BET.tbl=r}
    else if(k==="kings"){r=await rpc("bet_kings",{});if(r&&r.ok)BET.kings=r.rows}
    else if(k==="week"){r=await rpc("bet_week",{p_match:arg});if(r&&r.ok)BET.week[arg]=r}
    else if(k==="list"){r=await rpc("bet_list",{p_player:arg});if(r&&r.ok)BET.lists[arg]=r}
    else if(k==="feed"){r=await rpc("bet_feed",{});if(r&&r.ok)BET.feed=r}
    else if(k==="notes"){r=await rpc("bet_notes",{});if(r&&r.ok)BET.notes=r.rows||[]}
    ok=!!(r&&r.ok);BET.at[key]=ok?Date.now():0}catch(_){BET.at[key]=0}
  if(!ok&&(tries||0)<4){setTimeout(()=>betLoad(k,arg,true,(tries||0)+1),800*((tries||0)+1));return}
  betSave();
  if(S.tab==="iddia"||S.tab==="ben"||(S.sheet&&S.sheet.type==="pm"))render(true)}
const BET_ERR={age:"Tahmin 18 yaş ve üzeri için",closed:"Tahminler kapandı",own:"Kendi adına tahmin yapamazsın",min:"En az 10 sikke oynayabilirsin",bal:"Bakiyen yetmiyor",auth:"Önce giriş yapmalısın",market:"Bu seçenek artık yok",grp:"Bu iki seçim aynı tahmine konamaz",legs:"Bir tahmine en fazla 4 seçim"};
const BET_UNDO=5*60000,BET_CLOSE=3600000;
const betCanUndo=b=>b.at&&Date.now()<Date.parse(b.at)+BET_UNDO&&(!b.d||Date.now()<betKick(b.m)-BET_CLOSE);
const betKick=mid=>{const m=S.matches.find(x=>x.id===mid);return m?matchTs(m):Infinity};
// geri alma süresi dolunca düğme kendiliğinden kaybolsun
setInterval(()=>{if(S.tab==="iddia"&&(S.f.bt||"oyna")==="kupon"&&!S.sheet){const me=myPid();const L=me&&BET.lists[me];if(L&&L.rows.some(b=>b.z==="acik"&&b.at&&Date.now()-Date.parse(b.at)<BET_UNDO+60000))render(true)}},30000);
const BET_ST={acik:["Açık",""],kazandi:["Kazandı","ok"],kaybetti:["Kaybetti","bad"],iade:["İade","mid"]};
function betRankW(T){return (T&&T.wrows||[]).filter(r=>P(r.p)&&(r.n>0||r.open>0)).sort((a,b)=>b.net-a.net||b.won-a.won||(b.best||0)-(a.best||0)||nameOf(a.p).localeCompare(nameOf(b.p),"tr"))}
function betMon(d){const x=parseYmd(String(d).slice(0,10));x.setDate(x.getDate()-((x.getDay()+6)%7));return x.getFullYear()+"-"+String(x.getMonth()+1).padStart(2,"0")+"-"+String(x.getDate()).padStart(2,"0")}
function betWkLabel(wk){if(!wk)return"Bu hafta";const w=betMon(wk);const sz=BET.tbl&&BET.tbl.season;
  const W=[...new Set(S.matches.filter(m=>!isExt(m)&&!m.archived&&m.date&&(m.season==null||!sz||m.season===sz)).map(m=>betMon(m.date)))].filter(x=>x<=w);if(!W.includes(w))W.push(w);
  return W.length+". Hafta"}
function betRankHtml(R,me,sub,wk){const op=S.f.betOpen;const inW=b=>{if(!wk)return true;const d=String(b.d||"").slice(0,10),a=String(wk).slice(0,10);const e=parseYmd(a);e.setDate(e.getDate()+6);const z=e.getFullYear()+"-"+String(e.getMonth()+1).padStart(2,"0")+"-"+String(e.getDate()).padStart(2,"0");return d>=a&&d<=z};
  return `<ol class="card brk">${R.map((r,i)=>{const o=op===r.p;if(o)betLoad("list",r.p);const L=BET.lists[r.p];const LR=L?L.rows.filter(inW):[];
    return `<li class="${r.p===me?"me":""}"><button class="br" data-act="tog1" data-k="betOpen" data-v="${o?"":esc(r.p)}" aria-expanded="${o}"><span class="br-k num">${i===0&&r.net>0?dIcon("kupa","gold",20):i+1}</span>${avatar(P(r.p),"sm")}<span class="br-n"><b>${esc(nameOf(r.p))}${betBadges(r.p).map(x=>`<i class="bbg" title="${esc(x[1])}">${x[0]}</i>`).join("")}</b><small>${sub(r)}</small></span><b class="br-v num ${r.net<0?"neg":r.net>0?"pos":""}">${r.n?(r.net>0?"+":"")+fJ(r.net):"–"}</b></button>
      ${o?`<div class="br-d">${r.p!==me?`<div class="br-a"><button class="chip${betFollows().includes(r.p)?" on":""}" data-act="betFollow" data-id="${esc(r.p)}">${betFollows().includes(r.p)?"Takip ediliyor":"Takip et"}</button></div>`:""}${betBadges(r.p).length?`<div class="bbgl">${betBadges(r.p).map(x=>`<span>${x[0]} ${esc(x[1])}</span>`).join("")}</div>`:""}${!L?`<p class="muted small">Yükleniyor…</p>`:LR.length?`<ul class="bkl">${LR.map(b=>betRow(b,false)).join("")}</ul>`:`<p class="muted small">Görünen tahmin yok.</p>`}</div>`:""}</li>`}).join("")}</ol>`}
function betRank(T){return (T&&T.rows||[]).filter(r=>P(r.p)&&(r.n>0||r.open>0)).sort((a,b)=>b.net-a.net||b.won-a.won||(b.best||0)-(a.best||0)||nameOf(a.p).localeCompare(nameOf(b.p),"tr"))}
function betSeen(){try{return +localStorage.getItem("y_bn_"+TID)||0}catch(_){return 0}}
function betMarkSeen(){const N=BET.notes||[];const mx=N.reduce((a,n)=>Math.max(a,+n.id||0),0);if(mx)try{localStorage.setItem("y_bn_"+TID,String(mx))}catch(_){}}
function betUnread(){const sn=betSeen();return (BET.notes||[]).filter(n=>+n.id>sn).length}
function betBell(){const n=betUnread();return `<button class="bj-b" data-act="betNotes" aria-label="Bildirimler${n?`, ${n} yeni`:""}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.6 2H4.4z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>${n?`<b class="num">${n>9?"9+":n}</b>`:""}</button>`}
function betNoteTxt(n){const nm=`<b>${esc(shortName(nameOf(n.a)))}</b>`,q=n.b?`<q>${esc(n.b)}</q>`:"";
  return ({kupon:`${nm} tahmin yaptı <span>${esc(n.b||"")}</span>`,tuttu:`${nm} tahminini tutturdu 🎉 <span>${esc(n.b||"")}</span>`,kazandi:`Tahminin tuttu 🎉 <span>${esc(n.b||"")}</span>`,kaybetti:`Tahminin yattı <span>${esc(n.b||"")}</span>`,
    tepki:n.e==="down"?`${nm} tahminini beğenmedi`:`${nm} tahminini beğendi`,yorum:`${nm} tahminine yorum yaptı ${q}`,yorum2:`${nm} yorumladığın tahmine yazdı ${q}`,bahset:`${nm} bir yorumda senden bahsetti ${q}`})[n.k]||esc(n.b||"")}
function sheetBetNotes(){const N=BET.notes;const sn=S.sheet.seen||0;
  const ic=n=>n.k==="kazandi"?`<span class="bn-ic ok">${dIcon("tuttu","green",22)}</span>`:n.k==="kaybetti"?`<span class="bn-ic bad">${dIcon("yatti","red",22)}</span>`:avatar(P(n.a)||{id:n.a,name:"?"},"sm");
  return `<div class="ch"><div><div class="eyebrow">Tahmin</div><h2>Bildirimler</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
  ${!N?`<p class="muted">Yükleniyor…</p>`:N.length?`<ul class="bn">${N.map(n=>`<li><button class="${+n.id>sn?"new":""}" data-act="betNoteGo" data-v="${esc(n.k)}" data-c="${esc(n.c||"")}">${ic(n)}<span class="bn-t">${betNoteTxt(n)}${(c=>c&&["tepki","yorum","yorum2","bahset","kazandi","kaybetti"].includes(n.k)?`<i class="bn-c">${esc(betCTitle(c))}</i>`:"")(betFind(n.c))}<time>${betAgo(n.t)}</time></span></button></li>`).join("")}</ul>`:`<div class="bcm-e">${dIcon("zil","gold",30)}<b>Henüz bildirim yok</b><span>Tahmin, tepki ve yorumlar burada görünür.</span></div>`}`}
// ===== Soyunma odası: takıma özel sohbet, taktik, görevler =====
const ODA={d:{},at:{}};const ODA_ERR={closed:"Oda kapalı",cap:"Bunu kaptan ya da yönetici yapabilir",slow:"Biraz yavaş, çok hızlı yazıyorsun",value:"Eksik ya da hatalı",auth:"Önce giriş yapmalısın"};
function odaLoad(mid,force){if(!mid||!myPid())return;const t=ODA.at[mid]||0;if(t===-1||(!force&&Date.now()-t<15000))return;ODA.at[mid]=-1;
  rpc("room_get",{p_match:mid}).then(r=>{ODA.at[mid]=Date.now();if(r&&r.ok)odaPut(mid,r)}).catch(()=>{ODA.at[mid]=Date.now()-9000})}
function odaPut(mid,r){const o=JSON.stringify(ODA.d[mid]||null),n=JSON.stringify(r);ODA.d[mid]=r;if(o===n)return;
  if(S.sheet&&S.sheet.type==="oda"&&S.sheet.mid===mid){odaSeen(mid);odaRender();odaSeenSrv(mid);odaReadSrv(mid)}
  else{const c=document.getElementById("odaCard"),m=S.matches.find(x=>x.id===mid);if(c&&m)c.outerHTML=odaCard(m)}odaFab()}
function odaSeenSrv(mid){const d0=ODA.d[mid],me=myPid();const d=d0&&d0.after?d0.H:d0;if(!d||!d.open||!d.msgs||!me)return;if(!d.msgs.some(x=>x.k==="duyuru"&&!(x.sn||[]).includes(me)))return;if(ODA.sn===mid+":"+d.msgs.length)return;ODA.sn=mid+":"+d.msgs.length;rpc("room_seen",{p_match:mid}).then(r=>{if(r&&r.ok)odaPut(mid,r)}).catch(()=>{})}
function odaReadSrv(mid){const d=ODA.d[mid],me=myPid();if(d&&d.after){const H=d.H;if(!H||!me||document.visibilityState!=="visible"||!(S.sheet&&S.sheet.type==="oda"&&odaSide(d)==="H"))return;const mx=H.msgs.reduce((a,x)=>Math.max(a,+x.id||0),0);if(!mx||+((H.rd||{})[me]||0)>=mx||ODA.rdS===mid+":"+mx)return;ODA.rdS=mid+":"+mx;rpc("room_hread",{p_match:mid,p_id:mx}).then(r=>{if(r&&r.ok)odaPut(mid,r)}).catch(()=>{ODA.rdS=null});return}
  if(!d||!d.open||d.after||!d.msgs||!me||document.visibilityState!=="visible")return;const mx=d.msgs.reduce((a,x)=>Math.max(a,+x.id||0),0);if(!mx||+((d.rd||{})[me]||0)>=mx)return;if(ODA.rdS===mid+":"+mx)return;ODA.rdS=mid+":"+mx;rpc("room_read",{p_match:mid,p_id:mx}).then(r=>{if(r&&r.ok)odaPut(mid,r)}).catch(()=>{ODA.rdS=null})}
function odaTipOff(){if(LS.get("y_oda_tip"))return;LS.set("y_oda_tip","1");const e=document.getElementById("odaTip");if(e)e.remove()}
const ODA_TK={c:'<svg class="oda-tk1" viewBox="0 0 16 12" aria-hidden="true"><path d="M1.500 6.500 5 10l7-8.500"/></svg>',d:'<svg viewBox="0 0 22 12" aria-hidden="true"><path d="M1.500 6.500 5 10l7-8.500M9.500 8.500 11 10l7-8.500"/></svg>'};
function odaTick(c,x){const o=odaOthers(c);if(!o.length||x.tmp)return"";const rd=c.d.rd||{};const n=o.filter(i=>+(rd[i]||0)>=+x.id).length;return `<i class="oda-rt${n===o.length?" all":""}" role="img" aria-label="${n===o.length?"Herkes gördü":n?n+" kişi gördü":"Gönderildi"}">${n?ODA_TK.d:ODA_TK.c}</i>`}
function odaOthers(c){return [...new Set([...c.team,...((c.d.guests||[]).filter(i=>P(i)))])].filter(i=>i!==c.me)}
function odaSeenBy(c,x){const o=odaOthers(c);if(!o.length)return"";const rd=c.d.rd||{};const y=o.filter(i=>+(rd[i]||0)>=+x.id),n=o.filter(i=>!y.includes(i));const nm=L=>L.map(i=>esc(firstName(nameOf(i)))).join(", ");return `<div class="oda-rd">${!n.length?"<span><b>Herkes gördü</b></span>":!y.length?"<span>Henüz kimse görmedi</span>":`<span><b>Gören:</b> ${nm(y)}</span><span><b>Görmeyen:</b> ${nm(n)}</span>`}</div>`}
const MN_I={fw:'<path d="m15 7 5 5-5 5M20 12H10a6 6 0 0 0-6 6"/>',re:'<path d="M9 7 4 12l5 5M4 12h10a6 6 0 0 1 6 6"/>',cp:'<rect x="9" y="9" width="11" height="11" rx="2.500"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',at:'<circle cx="12" cy="12" r="4"/><path d="M16 12v1.500a2.500 2.500 0 0 0 5 0V12a9 9 0 1 0-3.500 7.100"/>',ed:'<path d="M4 20h4L19 9l-4-4L4 16v4zM13.500 6.500l4 4"/>',del:'<path d="M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13M10 11v5M14 11v5"/>',inf:'<path d="M2 12.500 6 16.500l7-9M11 15l1.500 1.500 8-9"/>',rp:'<path d="M5 21V4h11l-1.500 4L16 12H5"/>',blk:'<circle cx="12" cy="12" r="9"/><path d="m5.700 5.700 12.600 12.600"/>'};
const mnI=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MN_I[k]}</svg>`;
// basılı tutunca açılan menü ve sola çekince açılan okundu bilgisi: mesajın yanında, ekranın üstünde çizilir
function odaMenuDraw(){const old=document.getElementById("odaMenu");const sh=S.sheet,T=sh&&sh.type;let x=null,mine=false,h="",inf=false,id=null;const it=(act,ic,t,ex,cls)=>`<button class="kbkeep${cls?" "+cls:""}" data-act="${act}" ${ex}>${mnI(ic)}<span>${t}</span></button>`;
  const nfo=(y,n,none)=>{const li=L=>L.map(i=>`<li>${pFace(i)}<span>${esc(nameOf(i))}</span></li>`).join("");return `<div class="oda-nf"><b>Okundu bilgisi</b>${y.length?`<small>Gören · ${y.length}</small><ul>${li(y)}</ul>`:""}${n.length?`<small>Görmeyen · ${n.length}</small><ul class="no">${li(n)}</ul>`:""}${!y.length&&!n.length?`<small>${none}</small>`:""}</div>`};
  if(T==="oda"){const c=odaCtx();const ok=c&&c.tab==="sohbet";inf=ok&&c.chat&&sh.sel==null&&sh.info!=null;id=ok?(sh.sel!=null?sh.sel:sh.info):null;x=id!=null?odaMsgOf(c.d,id):null;
    if(x){mine=x.p===c.me;
      if(inf){const o=odaOthers(c),rd=c.d.rd||{};const y=o.filter(i=>+(rd[i]||0)>=+x.id);h=nfo(y,o.filter(i=>!y.includes(i)),"Odada başka kimse yok")}
      else if(!c.live)h=((x.k==="msg"||x.k==="quick"||x.k==="duyuru")&&c.d0.H?it("odaFwd","fw","Maç sonu odasına ilet",`data-v="${x.id}"`):"")+it("odaCopy","cp","Kopyala",`data-v="${x.id}"`);
      else if(String(sh.rep)===String(x.id))h=`<div class="oda-mrp">${repBtns("mesaj",x.id,x.p,x.b)}</div>`;
      else h=`<div class="oda-mrx"><button class="kbkeep${x.ml===1?" on":""}" data-act="odaLike" data-id="${x.id}" data-v="1" aria-label="Beğen">${lIc("begen")}</button><button class="kbkeep${x.ml===-1?" on dn":""}" data-act="odaLike" data-id="${x.id}" data-v="-1" aria-label="Beğenme">${lIc("begenme")}</button></div>`
        +it("odaReply","re","Yanıtla",`data-v="${x.id}"`)+it("odaCopy","cp","Kopyala",`data-v="${x.id}"`)
        +(mine?it("odaInfo","inf","Okundu bilgisi",`data-v="${x.id}"`):"")+(mine&&x.k==="msg"&&Date.now()-Date.parse(x.t)<3e5?it("odaEdit","ed","Düzenle",`data-v="${x.id}"`):"")
        +(mine||S.admin?it("odaDel","del","Sil",`data-v="${x.id}"`,"dng"):"")}}
  else if(T==="betCom"&&BET.com&&BET.com.id===sh.id){inf=sh.sel==null&&sh.info!=null;id=sh.sel!=null?sh.sel:sh.info;x=id!=null?BET.com.rows.find(r=>String(r.id)===String(id)&&!r.tmp):null;
    if(x){const me=myPid();mine=x.p===me;const v=esc(x.id);
      if(inf){const o=betComOthers();const y=[...new Set([...o,...Object.keys(BET.com.rd||{})])].filter(i=>i!==me&&P(i)&&betComSaw(i,x));h=nfo(y,o.filter(i=>!y.includes(i)),"Henüz kimse görmedi")}
      else h=it("betComReply","re","Yanıtla",`data-v="${v}"`)+it("betComCopy","cp","Kopyala",`data-v="${v}"`)+(mine?it("betComInfo","inf","Okundu bilgisi",`data-v="${v}"`):"")+(mine||S.admin?it("betComDel","del","Sil",`data-v="${v}"`,"dng"):"")}}
  const b=x&&[...document.querySelectorAll("#odaMsgs .oda-b[data-v]")].find(e=>e.dataset.v===String(id));
  if(!b){if(old)old.remove();if(sh&&(T==="oda"||T==="betCom")&&id!=null){sh.sel=null;sh.info=null}return}
  const E=old||document.body.appendChild(Object.assign(document.createElement("div"),{id:"odaMenu"}));
  E.innerHTML=`<button class="oda-mbg" data-act="odaSelX" aria-label="Menüyü kapat"></button><i class="oda-mhl" aria-hidden="true"></i><div class="oda-mn" role="menu">${h}</div>`;
  const r=b.getBoundingClientRect(),M=E.querySelector(".oda-mn"),H=E.querySelector(".oda-mhl");const vw=innerWidth,vh=(window.visualViewport&&visualViewport.height)||innerHeight;
  H.style.cssText=`left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border-radius:${getComputedStyle(b).borderRadius}`;
  const w=M.offsetWidth,hh=M.offsetHeight;let top=r.bottom+8;if(top+hh>vh-12)top=r.top-8-hh;if(top<56)top=Math.max(56,vh-hh-12);let left=mine?r.right-w:r.left;left=Math.max(12,Math.min(vw-w-12,left));M.style.left=left+"px";M.style.top=top+"px"}
function odaSide(d){const s=S.sheet&&S.sheet.type==="oda"&&S.sheet.side;return s&&d[s]?s:d.H?"H":d.side||"A"}
function odaRoom(d){return d&&d.after?d[odaSide(d)]:d}
const odaHMsgs=d=>d&&d.after?((d.H&&d.H.msgs)||[]):(d&&d.msgs)||[];
function odaSeen(mid){const d0=ODA.d[mid];const d={msgs:odaHMsgs(d0)};if(!d0||!d.msgs.length)return;const mx=d.msgs.reduce((a,x)=>Math.max(a,+x.id||0),0);if(mx)LS.set("y_oda_"+mid,String(mx))}
function odaUnread(mid){const d0=ODA.d[mid];const d={msgs:odaHMsgs(d0)};if(!d0)return 0;const sn=+LS.get("y_oda_"+mid)||0,me=myPid();return d.msgs.filter(x=>+x.id>sn&&x.p!==me&&x.k!=="sys").length}
// soyunma odası: Maç simgesinde okunmamış noktası
function odaCur(){if(!S.session||!isMember()||S.fol||!myPid())return null;const ok=m=>!isExt(m)&&!m.archived;
  return S.matches.find(m=>ok(m)&&m.state==="takim")||S.matches.find(m=>ok(m)&&m.state==="bitti"&&Date.now()<odaKapan(m))||null}
function odaFab(){const m=odaCur();const d=m&&ODA.d[m.id];if(m)odaLoad(m.id);const un=m&&d&&(d.open||d.after)?odaUnread(m.id):0;
  const nb=document.querySelector('#navIn button[data-tab="mac"]');if(nb)nb.classList.toggle("bdot",S.tab!=="mac"&&(un>0||(S.tab!=="iddia"&&isMember()&&betUnread()>0)))}
setInterval(()=>{if(document.visibilityState!=="visible"||(S.sheet&&S.sheet.type==="oda"))return;const m=odaCur();if(m)odaLoad(m.id,true)},30000);
function odaCard(m){if(!m||!myPid()||isExt(m)||m.archived)return"";const fin=m.state==="bitti";
  if(m.state!=="takim"&&!(fin&&Date.now()<odaKapan(m)))return"";
  odaLoad(m.id);const d=ODA.d[m.id];const M=esc(m.id);const ic=`<span class="oda-ci">${lIc("yorum")}</span>`;
  if(!d)return fin?"":`<div id="odaCard"></div>`;
  if(d.after){const H=((d.H||{}).msgs||[]).filter(x=>x.p&&!isBlk(x.p));const lv=H[H.length-1];const wr=[...new Set(H.map(x=>x.p).reverse())];const un=odaUnread(m.id);
    return `<div id="odaCard"><button class="oda-c od2 oda-A" data-act="odaOpen" data-id="${M}"><span class="od2-h">${ic}<span class="od2-t"><b>Maç sonu sohbeti</b><small>Herkes yazabilir</small></span>${wr.length?`<span class="od2-av">${wr.slice(0,3).map(id=>pFace(id)).join("")}</span>`:""}${un?`<em class="num">${un>9?"9+":un}</em>`:""}</span>
    <span class="od2-f"><span class="od2-m">${lv?`<b>${esc(firstName(nameOf(lv.p)))}:</b> ${esc(temiz(lv.b))}`:"Maç bitti, söz sizde."}</span><span class="od2-go">Sohbete gir</span></span></button></div>`}
  if(!d.open)return `<div id="odaCard"></div>`;
  const sd=d.side,ot=sd==="A"?"B":"A";const last=[...d.msgs].reverse().find(x=>x.k!=="sys");const un=odaUnread(m.id);
  const W=d.msgs.filter(x=>x.k!=="sys"&&x.p&&!isBlk(x.p));const lastV=W[W.length-1];const wr=[...new Set(W.map(x=>x.p).reverse())];
  return `<div id="odaCard"><button class="oda-c od2 oda-${sd}" data-act="odaOpen" data-id="${M}"><span class="od2-h">${ic}<span class="od2-t"><b>Soyunma odası</b><small>${esc(nmOf(m,sd))} · ${wr.length?wr.length+" kişi yazdı":"sadece takımın görür"}</small></span>${wr.length?`<span class="od2-av">${wr.slice(0,3).map(id=>pFace(id)).join("")}</span>`:""}${un?`<em class="num">${un>9?"9+":un}</em>`:""}</span>
    <span class="od2-f"><span class="od2-m">${lastV?`<b>${esc(firstName(nameOf(lastV.p)))}:</b> ${esc(temiz(lastV.b))}`:"Henüz mesaj yok. İlk mesajı sen yaz."}</span><span class="od2-go">Odaya gir</span></span></button>
    </div>`}
function odaPos(m,sd,tac){const ids=plOf(m,sd).filter(id=>P(id));const G={KL:[],DF:[],OS:[],FV:[]};const PG={Defans:"DF","Orta saha":"OS",Forvet:"FV",Kaleci:"KL",DF:"DF",OS:"OS",FV:"FV",KL:"KL"};
  ids.forEach(id=>{const p=P(id);let g="OS";try{g=(p.epos&&EPOS[p.epos]?EPOS[p.epos][0]:PG[p.pos]||(EPOS[eposOf(p)]||[])[0])||"OS"}catch(_){}(G[g]||G.OS).push(id)});
  const Y={KL:86,DF:66,OS:44,FV:20};const out={};for(const g in G)G[g].forEach((id,i)=>{out[id]=tac&&tac[id]?tac[id]:[Math.round((i+1)/(G[g].length+1)*100),Y[g]]});return out}
function odaRender(full){if(!full&&odaPatch())return;const keep={};document.querySelectorAll("#sheetBody [data-kp]").forEach(e=>keep[e.id]=e.value);const act=document.activeElement&&document.activeElement.id;render(true);
  for(const k in keep){const e=document.getElementById(k);if(e)e.value=keep[k]}odaGrow(document.getElementById("odaTxt"));if(act){const e=document.getElementById(act);if(e&&e.dataset.kp!=null&&e.tagName!=="SELECT")try{e.focus({preventScroll:true})}catch(_){}}odaBottom()}
function odaBottom(){const b=document.getElementById("odaMsgs");if(!b)return;const n=document.getElementById("odaNw");if(S.sheet&&S.sheet.nwP&&n){S.sheet.nwP=false;b.scrollTop=Math.max(0,n.offsetTop-b.offsetTop-8)}else if(!(S.sheet&&S.sheet.nwP&&S.sheet.from!=null&&!ODA.d[S.sheet.mid]))b.scrollTop=b.scrollHeight;odaDnUpd()}
async function odaDo(fn,args,full){const mid=S.sheet&&S.sheet.mid;try{const r=await rpc(fn,args);if(r&&r.ok){ODA.d[mid]=r;odaSeen(mid);odaRender(full);return true}toast(ODA_ERR[r&&r.error]||"Yapılamadı")}catch(_){toast("Bağlantı yok")}return false}
function odaMsgOf(d,id){return (d.msgs||[]).find(x=>+x.id===+id)}
function odaRakip(m,sd,d,cap,live){const ot=sd==="A"?"B":"A";const R=plOf(m,ot).filter(id=>P(id)),O=plOf(m,sd).filter(id=>P(id));if(!R.length)return `<p class="muted">Rakip kadro henüz belli değil.</p>`;
  const st=id=>S.stats[id]||{};const avg=L=>L.length?L.reduce((t,id)=>t+ovrOf(id),0)/L.length:0;const ao=avg(O),ar=avg(R);const df=ao-ar;
  const top=(f,min)=>{const x=R.slice().sort((a,b)=>f(b)-f(a))[0];return x&&f(x)>(min||0)?x:null};
  const gol=top(id=>+st(id).goals||0),ast=top(id=>+st(id).ast||0),form=top(id=>st(id).games>=2?+st(id).avgPts||0:0),weak=R.slice().sort((a,b)=>ovrOf(a)-ovrOf(b))[0];
  const row=(l,id,v)=>id?`<div><small>${l}</small><b>${esc(shortName(nameOf(id)))}</b><em class="num">${v}</em></div>`:"";
  let h=`<section class="oda-rp"><div class="oda-pw"><span><b class="num">${fN(ao)}</b><small>${esc(nmOf(m,sd))}</small></span><i>${Math.abs(df)<.5?"Güçler denk":df>0?"Kâğıt üstünde öndesiniz":"Kâğıt üstünde rakip önde"}</i><span><b class="num">${fN(ar)}</b><small>${esc(nmOf(m,ot))}</small></span></div>
    <div class="oda-rr">${row("En golcü",gol,gol?(st(gol).goals)+" gol":"")}${row("Pasör",ast,ast?(st(ast).ast)+" asist":"")}${row("Formda",form,form?"not "+fN(st(form).avgPts):"")}${row("En zayıf halka",weak,weak?"reyting "+ovrOf(weak):"")}</div></section>`;
  const pos=odaPos(m,ot,{});const sh=S.sheet;const AT=[["hiz","Hız"],["sut","Şut"],["pas","Pas"],["dri","Dribling"],["def","Defans"],["fiz","Fizik"]];const at=id=>(P(id)&&P(id).attrs)||{};
  h+=`<h3 class="oda-t">Rakip diziliş</h3><div class="oda-fd oda-fr">${Object.entries(pos).map(([id,[x,y]])=>{const w=(d.marks||{})[id];return `<button class="oda-tk${sh.mk===id?" on":""}" style="left:${x}%;top:${100-y}%" data-act="odaMk" data-v="${esc(id)}" aria-label="${esc(nameOf(id))}">${avatar(P(id),"sm")}<small>${esc(firstName(nameOf(id)))}</small>${w?`<em>${esc(firstName(nameOf(w)))}</em>`:""}</button>`}).join("")}</div>`;
  h+=`<h3 class="oda-t">Adam paylaşımı</h3><ul class="oda-mk">${R.slice().sort((a,b)=>(b===sh.mkTop)-(a===sh.mkTop)||ovrOf(b)-ovrOf(a)).map(id=>{const w=(d.marks||{})[id];const nt=(d.notes||{})[id];const op=sh.mk===id;const vs=w||myPid();
    return `<li class="${op?"op":""}" id="mk-${esc(id)}"><div class="oda-mr"><button class="oda-mb" data-act="odaMk" data-v="${esc(id)}" aria-expanded="${op}">${avatar(P(id),"sm")}<span><b>${esc(shortName(nameOf(id)))}</b><small>${ovrOf(id)} · ${+st(id).goals||0} gol · ${+st(id).ast||0} asist</small>${nt?`<i>“${esc(nt)}”</i>`:""}</span></button>${cap?`<select data-oda-mark="${esc(id)}" aria-label="${esc(nameOf(id))} kimde"><option value="">Boşta</option>${O.map(o=>`<option value="${esc(o)}"${w===o?" selected":""}>${esc(shortName(nameOf(o)))}</option>`).join("")}</select>`:`<em class="${w?"on":""}">${w?(w===myPid()?"Sende":esc(shortName(nameOf(w)))):"Boşta"}</em>`}</div>
      ${op?`<div class="oda-vs"><div class="oda-vh"><b>${esc(firstName(nameOf(id)))}</b><span>Eşleşme</span><b>${vs===myPid()?"Sen":esc(firstName(nameOf(vs)))}</b></div>${AT.map(([k,l])=>{const a=+at(id)[k]||0,b=+at(vs)[k]||0;return `<div class="oda-vr"><b class="num${a>b?" w":""}">${a||"–"}</b><span><i class="l" style="width:${Math.min(100,a)}%"></i></span><small>${l}</small><span><i style="width:${Math.min(100,b)}%"></i></span><b class="num${b>a?" w":""}">${b||"–"}</b></div>`}).join("")}
        ${live?`<div class="oda-f"><input id="odaNt" data-kp maxlength="140" value="${esc(nt||"")}" placeholder="Not ekle (ör. sola kaçıyor)" aria-label="${esc(nameOf(id))} için not"><button class="btn sm" data-act="odaNote" data-v="${esc(id)}">Kaydet</button></div><p class="muted small oda-n">Not takımda kalır; bu oyuncu sonraki maçlarda rakip olunca yine görünür. Kendisi göremez.</p>`:""}</div>`:""}</li>`}).join("")}</ul>${cap?`<p class="muted small oda-n">Bir rakibi takım arkadaşına verince ona bildirim gider.</p>`:""}`;
  return h}
function odaCtx(){const sh=S.sheet;if(!sh||sh.type!=="oda")return null;const m=S.matches.find(x=>x.id===sh.mid),d0=ODA.d[sh.mid];if(!m||!d0||(!d0.after&&!d0.open))return null;
  const d=odaRoom(d0),sd=d0.after?odaSide(d0):d.side,me=myPid(),isH=sd==="H",live=!d0.after||isH;return{sh,m,d0,d,live,isH,chat:live,sd,me,cap:live&&!isH&&d.cap,tab:!isH&&["rakip","gorev"].includes(sh.tab)?sh.tab:"sohbet",capId:isH?null:sd==="A"?m.cap_a:m.cap_b,team:(isH?plAll(m):plOf(m,sd)).filter(i=>P(i)),myAt:"@"+firstName(nameOf(me)).toLocaleLowerCase("tr")}}
const odaHM=t=>{try{return new Date(t).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}catch(_){return""}};
function odaMsgsHtml(c){const{sh,d,live,chat,isH,m,me,team,capId,myAt}=c;const M=d.msgs.filter(x=>x.k!=="score");if(!M.length)return `<li class="sys">${isH?"Maç bitti, söz sizde. İlk mesajı sen yaz.":live?"Henüz mesaj yok. İlk mesajı sen yaz.":"Bu odada kimse yazmamış."}</li>`;
  const from=sh.from;const nw=chat&&from!=null?M.filter(x=>+x.id>from&&x.p!==me&&x.k!=="sys"):[];const nwId=nw.length?nw[0].id:null;
  let prev=null,blkP=false;return M.map(x=>{const dv=nwId!=null&&x.id===nwId?`<li class="nw" id="odaNw"><span>${nw.length} yeni mesaj</span></li>`:"";return dv+(()=>{const mine=x.p===me;const nm=mine?"Sen":esc(shortName(nameOf(x.p)));const sel=String(sh.sel)===String(x.id);const grp=prev&&prev.k!=="sys"&&prev.k!=="poll"&&prev.k!=="duyuru"&&prev.p===x.p&&(x.k==="msg"||x.k==="quick");prev=x;
    if(x.k==="sys")return `<li class="sys">${esc(x.b)}</li>`;
    if(!mine&&isBlk(x.p)){prev=null;const f=!blkP;blkP=true;return f?`<li class="sys">Engellediğin bir oyuncunun mesajları gizlendi</li>`:""}blkP=false;
    if(x.k==="poll"){const tot=Object.values(x.v||{}).reduce((a,b)=>a+b,0);const mis=live?team.filter(i=>!(x.vp||[]).includes(i)):[];return `<li class="poll"><div class="oda-p"><span class="oda-h"><b>${esc(x.b)}</b>${live&&(mine||S.admin)?`<button class="oda-x" data-act="odaDel" data-v="${x.id}" aria-label="Anketi sil">Sil</button>`:""}</span><small>${nm} · anket · ${tot} oy · ${odaHM(x.t)}</small>${(x.o||[]).map((o,i)=>{const n=(x.v||{})[i]||0;return `<button class="${x.my===i?"on":""}"${live?"":" disabled"} data-act="odaVote" data-id="${x.id}" data-v="${i}" aria-pressed="${x.my===i}"><i style="width:${tot?Math.round(n/tot*100):0}%"></i><span>${esc(o)}</span><em class="num">${n}</em></button>`}).join("")}${mis.length?`<div class="oda-ng"><span>Cevap vermeyen: ${mis.map(i=>esc(firstName(nameOf(i)))).join(", ")}</span><button data-act="odaNudge" data-id="${x.id}">Dürt</button></div>`:""}</div></li>`}
    if(x.k==="duyuru"){const sn=x.sn||[];const mis=team.filter(i=>!sn.includes(i));return `<li class="poll"><div class="oda-dy"><span class="oda-h">${dIcon("duduk","gold",20)}<b>Duyuru · ${nm}</b><time>${odaHM(x.t)}</time>${live&&(mine||S.admin)?`<button class="oda-x" data-act="odaDel" data-v="${x.id}" aria-label="Duyuruyu sil">Sil</button>`:""}</span><p>${esc(x.b)}</p><div class="oda-ng"><span>${mis.length?`Görmeyen: ${mis.map(i=>esc(firstName(nameOf(i)))).join(", ")}`:"Herkes gördü"}</span>${live&&mis.length?`<button data-act="odaNudge" data-id="${x.id}">Dürt</button>`:""}</div></div></li>`}
    const rp=x.r&&odaMsgOf(d,x.r);const bl=x.b.toLocaleLowerCase("tr");const at=!mine&&(bl.includes(myAt)||bl.includes("@herkes"));const isC=x.p&&x.p===capId;const isG=x.p&&(d.guests||[]).includes(x.p);
    const lk=(x.up||x.dn)?`<span class="oda-lk">${x.up?`<i class="${x.ml===1?"on":""}">${lIc("begen")}${x.up}</i>`:""}${x.dn?`<i class="dn${x.ml===-1?" on":""}">${lIc("begenme")}${x.dn}</i>`:""}</span>`:"";
    return `<li class="${mine?"me":""}${grp?" g":""}${at?" at":""}${sel?" sel":""}${isC?" cap":""}${x.tmp?" tmp":""}">${mine?"":(grp?`<span class="oda-sp"></span>`:avatar(P(x.p)||{id:x.p,name:"?"},"sm"))}<div class="oda-bw"><div class="oda-b"${!x.tmp?` data-act="odaSel" data-v="${x.id}" role="button" tabindex="0" aria-expanded="${sel}"`:""}>${!grp&&(!mine||isC||isG)?`<span class="oda-h">${isC?`<i class="oda-cb" title="Kaptan" aria-label="Kaptan">K</i>`:""}<b>${nm}</b>${isC?`<em>Kaptan</em>`:""}${isG?`<em class="gs">Misafir</em>`:""}</span>`:""}${rp?`<q>${esc(shortName(nameOf(rp.p)))}: ${esc(isBlk(rp.p)?"…":temiz(rp.b))}</q>`:""}${x.fw?`<q class="oda-fw">İletildi · ${esc(shortName(nameOf(x.fw.p)))} · ${esc(nmOf(m,x.fw.s==="B"?"B":"A"))} odası</q>`:""}<p>${esc(temiz(x.b))}<time>${x.ed?"düzenlendi · ":""}${odaHM(x.t)}${mine?odaTick(c,x):""}</time></p></div>${lk}
      </div></li>`})()}).join("")}
function odaReplyHtml(c){if(c.sh.edit)return `<div class="oda-rb ed"><span><small>Mesajı düzenliyorsun</small>Gönderince eskisinin yerine geçer</span><button class="kbkeep" data-act="odaEditX" aria-label="Düzenlemeden vazgeç">×</button></div>`;const rp=c.sh.reply&&odaMsgOf(c.d,c.sh.reply);return rp?`<div class="oda-rb"><span><small>Yanıtlanan</small>${esc(shortName(nameOf(rp.p)))}: ${esc(rp.b)}</span><button class="kbkeep" data-act="odaReply" data-v="" aria-label="Yanıtı kaldır">×</button></div>`:""}
function odaPinHtml(c){return c.d.pin?`<div class="oda-pin">${dIcon("yildiz","gold",18)}<span>${esc(c.d.pin)}</span></div>`:""}
function odaTyHtml(c){return"";const T=(c.d.ty||[]).filter(i=>P(i));if(!c.live||!T.length)return"";const n=T.slice(0,2).map(i=>esc(firstName(nameOf(i)))).join(" ve ");return `<span><i></i><i></i><i></i></span>${n}${T.length>2?" ve diğerleri":""} yazıyor…`}
function odaDnUpd(){const L=document.getElementById("odaMsgs"),b=document.getElementById("odaDn");if(!L||!b)return;const near=L.scrollHeight-L.scrollTop-L.clientHeight<90;if(near&&S.sheet)S.sheet.dn=0;b.hidden=near;const n=(S.sheet&&S.sheet.dn)||0;b.lastElementChild.textContent=n?(n>9?"9+":n):"";b.classList.toggle("n",n>0)}
function odaPatch(){const c=odaCtx();const L=document.getElementById("odaMsgs");if(!c||!L||c.tab!=="sohbet")return false;
  const near=L.scrollHeight-L.scrollTop-L.clientHeight<90,st=L.scrollTop;const cnt=c.d.msgs.filter(x=>x.p!==c.me&&x.k!=="sys").length;if(c.sh.cnt!=null&&cnt>c.sh.cnt&&!near)c.sh.dn=(c.sh.dn||0)+(cnt-c.sh.cnt);c.sh.cnt=cnt;
  L.innerHTML=odaMsgsHtml(c);const nwE=document.getElementById("odaNw");if(c.sh.nwP&&nwE){c.sh.nwP=false;L.scrollTop=Math.max(0,nwE.offsetTop-L.offsetTop-8)}else L.scrollTop=near?L.scrollHeight:st;
  const r=document.getElementById("odaRb");if(r)r.innerHTML=odaReplyHtml(c);const p=document.getElementById("odaPinW");if(p)p.innerHTML=odaPinHtml(c);const ty=document.getElementById("odaTy");if(ty)ty.innerHTML=odaTyHtml(c);odaDnUpd();odaMenuDraw();return true}
document.addEventListener("scroll",e=>{if(e.target&&e.target.id==="odaMsgs")odaDnUpd()},true);
function odaGrow(t){if(!t)return;t.style.height="auto";t.style.height=Math.min(t.scrollHeight,116)+"px"}
function sheetOda(){const sh=S.sheet,m=S.matches.find(x=>x.id===sh.mid),d0=ODA.d[sh.mid];
  const hd=(t,s,x)=>`<div class="oda-hd"><button class="oda-bk" data-act="close" aria-label="Geri"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><div><b>${t}</b>${s?`<small>${s}</small>`:""}</div>${x||""}</div>`;
  if(!m||!d0)return `<div class="oda">${hd("Soyunma odası","Yükleniyor…")}<div class="oda-sc"></div></div>`;
  if(d0.guest&&sh.tab&&sh.tab!=="sohbet")sh.tab="sohbet";
  const c=odaCtx();if(!c)return `<div class="oda">${hd("Soyunma odası","Oda kapalı")}<div class="oda-sc"><p class="muted">Oda kadrolar açıklanınca açılır ve yalnızca o maçta oynayanlara görünür.</p></div></div>`;
  const{d,live,sd,me,cap,tab,team,isH}=c;const kp=odaKapan(m)-Date.now()<864e5?"bu gece":"yarın gece";
  let h=`<div class="oda oda-${isH?"X":sd}">${hd(isH?"Maç sonu":esc(nmOf(m,sd)),isH?`Herkes yazabilir · ${kp} kapanır`:live?(d.guest?"Misafirsin · sadece sohbet":""):`Sadece okunur · ${kp} kapanır`,live?`<button class="oda-mu${d.mute?" on":""}" data-act="odaMute" aria-pressed="${!!d.mute}" aria-label="${d.mute?"Bildirimleri aç":"Sessize al"}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l1.6 2H4.4z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>${d.mute?`<path d="M4 4l16 16"/>`:""}</svg></button>`:"")}`;
  if(d0.after)h+=`<div class="mzseg oda-sd" role="group" aria-label="Oda">${[...(d0.H?["H"]:[]),"A","B"].map(k=>`<button data-act="odaSide" data-v="${k}" class="${sd===k?"on":""}" aria-pressed="${sd===k}">${k==="H"?"Maç sonu":esc(nmOf(m,k))}</button>`).join("")}</div>`;
  if(!d.guest&&!isH)h+=`<div class="mzseg oda-tb" role="tablist">${[["sohbet","Sohbet"],["rakip","Rakip"],["gorev","Görevler"]].map(([k,l])=>`<button role="tab" data-act="odaTab" data-v="${k}" class="${tab===k?"on":""}" aria-selected="${tab===k}">${l}</button>`).join("")}</div>`;
  if(tab==="sohbet"){
    h+=`<div id="odaPinW">${odaPinHtml(c)}</div>`;
    if(!live&&!isH){const best=d.msgs.filter(x=>x.up>0&&(x.k==="msg"||x.k==="quick")).sort((a,b)=>b.up-a.up)[0];if(best)h+=`<div class="oda-best">${dIcon("begen","gold",20)}<span><small>En çok beğenilen · ${best.up} beğeni</small><b>${esc(shortName(nameOf(best.p)))}:</b> ${esc(best.b)}</span></div>`}
    h+=`<div class="oda-mw"><ul class="oda-m" id="odaMsgs">${odaMsgsHtml(c)}</ul><button id="odaDn" class="oda-dn" data-act="odaDown" aria-label="En alta in" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg><b class="num"></b></button></div><div id="odaTy" class="oda-ty">${odaTyHtml(c)}</div>`;
    if(!live)h+=`<p class="oda-ro">Bu oda sadece okunur. Bir mesaja basılı tutup maç sonu odasına iletebilirsin.</p>`;
    if(live){h+=`<div class="oda-cmp">`;
      if(sh.pinE&&cap)h+=`<div class="oda-pf"><input id="odaPin" data-kp maxlength="140" value="${esc(d.pin||"")}" placeholder="Sabit mesaj (boş bırakırsan kalkar)" aria-label="Sabit mesaj"><div class="oda-pa"><button class="btn sm" data-act="odaPinX">Vazgeç</button><button class="btn primary sm" data-act="odaPinSave">Kaydet</button></div></div>`;
      else if(sh.poll)h+=`<div class="oda-pf"><input id="odaPq" data-kp maxlength="120" placeholder="Soru (ör. Maçtan sonra nereye?)" aria-label="Anket sorusu">${[0,1,2].map(i=>`<input id="odaPo${i}" data-kp maxlength="40" placeholder="${i+1}. seçenek${i===2?" (isteğe bağlı)":""}" aria-label="${i+1}. seçenek">`).join("")}<div class="oda-pa"><button class="btn sm" data-act="odaPollT">Vazgeç</button><button class="btn primary sm" data-act="odaPollSend">Anketi aç</button></div></div>`;
      else if(sh.gst&&!d.guest){const G=sh.gl;const row=(id,on)=>{const p=P(id);return p?`<button class="oda-gr" data-act="odaGstSet" data-id="${esc(id)}" data-v="${on?"":"1"}">${avatar(p,"sm")}<b>${esc(p.name)}</b><span>${on?"Çıkar":"Ekle"}</span></button>`:""};
        h+=`<div class="oda-pf oda-gp"><div class="oda-gh"><b>Misafir ekle</b><small>Bu hafta kadroda olmayan üyeler. Misafir sadece sohbeti görür ve yazar; rakip notlarını ve görevleri görmez.</small></div>${!G?`<p class="muted small">Yükleniyor…</p>`:`${(G.in||[]).length?`<span class="oda-gl">Odadaki misafirler</span>${G.in.map(id=>row(id,true)).join("")}`:""}${(G.rows||[]).length?`<span class="oda-gl">Eklenebilecekler</span><div class="oda-gs2">${G.rows.slice().sort((a,b)=>nameOf(a).localeCompare(nameOf(b),"tr")).map(id=>row(id,false)).join("")}</div>`:`<p class="muted small">${(G.in||[]).length?"Eklenebilecek başka üye yok.":"Kadro dışında onaylı üye yok."}</p>`}`}<div class="oda-pa"><button class="btn sm" data-act="odaGstT">Kapat</button></div></div>`}
      else h+=`${LS.get("y_oda_tip")?"":`<p class="oda-tip" id="odaTip"><span>Sağa çek: yanıtla. Kendi mesajını sola çek: kim gördü. Basılı tut: seçenekler.</span><button class="kbkeep" data-act="odaTipX" aria-label="İpucunu kapat">×</button></p>`}<div id="odaRb">${odaReplyHtml(c)}</div>${sh.plus?`<div class="oda-pm">${d.guest?`<button data-act="odaGstSet" data-id="${esc(me)}" data-v="">${dIcon("degis","pink",20)}Odadan çık</button>`:`<button data-act="odaPollT">${dIcon("grafik","cyan",20)}Anket aç</button><button data-act="odaAnnT">${dIcon("duduk","gold",20)}Duyuru yap</button>${cap?`<button data-act="odaPinT">${dIcon("yildiz","gold",20)}Sabit mesaj</button>`:""}${isH?"":`<button data-act="odaGstT">${dIcon("kisi","green",20)}Misafir ekle</button>`}`}</div>`:""}
        ${sh.ann?`<p class="oda-an">${dIcon("duduk","gold",18)}<span>Duyuru: herkese ayrı bildirim gider, kimin gördüğü görünür.</span><button class="kbkeep" data-act="odaAnnT" aria-label="Duyurudan vazgeç">×</button></p>`:""}
        <div id="odaAtL" class="oda-al"></div><div class="oda-cr"><button class="oda-pl${sh.plus?" on":""}" data-act="odaPlus" aria-label="${d.guest?"Oda seçenekleri":isH?"Anket, duyuru":"Anket, duyuru, misafir ekle"}" aria-expanded="${!!sh.plus}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button><textarea id="odaTxt" data-kp rows="1" maxlength="300" placeholder="${sh.ann?"Duyurunu yaz":"Mesaj"}" aria-label="Mesaj" autocomplete="off"></textarea><button class="oda-send kbkeep" data-act="odaSend" aria-label="Gönder"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12 20 4l-6 16-3-7-7-1z"/></svg></button></div>`;
      h+=`</div>`}
  }else if(tab==="rakip"){h+=`<div class="oda-sc">${odaRakip(m,sd,d,cap,live)}</div>`
  }else{const T=d.tasks||[];
    h+=`<div class="oda-sc">${T.length?`<ul class="oda-g">${T.map((t,i)=>`<li>${t.p&&P(t.p)?avatar(P(t.p),"sm"):""}<span><b>${t.p===me?"Sen":esc(shortName(nameOf(t.p)))}${t.h?`<i>${t.h}. yarı</i>`:""}</b><small>${esc(t.t)}</small></span>${t.p===me&&live?`<button class="oda-ok${t.ok?" on":""}" data-act="odaDone" data-v="${i}" aria-pressed="${!!t.ok}">${t.ok?"✓ Tamam":"Tamam"}</button>`:t.ok?`<em class="oda-okl">✓ Tamam</em>`:""}${cap?`<button class="oda-gx" data-act="odaTaskDel" data-v="${i}" aria-label="Görevi sil">×</button>`:""}</li>`).join("")}</ul>`:`<div class="bcm-e">${dIcon("kalkan","gold",30)}<b>Henüz görev yok</b><span>${cap?"Bir oyuncu seç, görevini yaz. Ona bildirim gider.":"Kaptan görev verince burada görünür."}</span></div>`}
      ${cap?`<div class="oda-gf"><label class="f" for="odaTaskP">Kime<select id="odaTaskP" data-kp><option value="">Oyuncu seç</option>${team.map(id=>`<option value="${esc(id)}">${esc(nameOf(id))}</option>`).join("")}</select></label><label class="f" for="odaTask">Görev<input id="odaTask" data-kp maxlength="60" placeholder="ör. Eren'i tut, kornerleri at"></label><div class="oda-q oda-tq">${["Korner","Serbest vuruş","Penaltı"].map(x=>`<button data-act="odaTaskQ" data-v="${x}">${x}</button>`).join("")}</div><label class="f" for="odaTaskH">Ne zaman<select id="odaTaskH" data-kp><option value="">Bütün maç</option><option value="1">1. yarı</option><option value="2">2. yarı</option></select></label><button class="btn primary" data-act="odaAssign">Görev ver</button></div>`:""}</div>`}
  return h+`</div>`}
document.addEventListener("change",e=>{const t=e.target;if(t&&t.dataset&&t.dataset.odaMark&&S.sheet&&S.sheet.type==="oda")odaDo("room_set",{p_match:S.sheet.mid,p_patch:{mark:{r:t.dataset.odaMark,p:t.value||""}}},true)});
function odaAtList(t){const L=document.getElementById("odaAtL");if(!L)return;const c=odaCtx();const m=t&&/(^|\s)@([^\s@]*)$/.exec(t.value.slice(0,t.selectionStart??t.value.length));if(!c||!m){L.innerHTML="";return}
  const q=m[2].toLocaleLowerCase("tr");const R=c.team.filter(i=>i!==c.me&&(!q||nameOf(i).toLocaleLowerCase("tr").split(/\s+/).some(w=>w.startsWith(q))));
  const hk=c.team.length>1&&"herkes".startsWith(q)?`<button class="kbkeep" data-act="odaAtPick" data-v="*"><i class="oda-hk" aria-hidden="true">@</i><span>herkes<small>Takımdaki herkese bildirim gider</small></span></button>`:"";
  L.innerHTML=hk+R.map(i=>`<button class="kbkeep" data-act="odaAtPick" data-v="${esc(i)}">${avatar(P(i),"sm")}<span>${esc(nameOf(i))}</span></button>`).join("")}
// tahmin yorumlarında @ ile kişi etiketleme: takımdaki herkes seçilebilir
function betAtList(t){const L=document.getElementById("betAtL");if(!L)return;const me=myPid();const m=t&&/(^|\s)@([^\s@]*)$/.exec(t.value.slice(0,t.selectionStart??t.value.length));if(!m){L.innerHTML="";return}
  const q=m[2].toLocaleLowerCase("tr");const R=S.players.filter(p=>!p.guest&&!p.archived&&p.id!==me&&(!q||p.name.toLocaleLowerCase("tr").split(/\s+/).some(w=>w.startsWith(q)))).sort((a,b)=>a.name.localeCompare(b.name,"tr")).slice(0,30);
  const hk="herkes".startsWith(q)?`<button class="kbkeep" data-act="betAtPick" data-v="*"><i class="oda-hk" aria-hidden="true">@</i><span>herkes<small>Takımdaki herkese bildirim gider</small></span></button>`:"";
  L.innerHTML=hk+R.map(p=>`<button class="kbkeep" data-act="betAtPick" data-v="${esc(p.id)}">${avatar(p,"sm")}<span>${esc(p.name)}</span></button>`).join("")}
document.addEventListener("input",e=>{if(e.target&&e.target.id==="odaTxt"){odaGrow(e.target);odaAtList(e.target)}else if(e.target&&e.target.id==="betComTxt"){odaGrow(e.target);betAtList(e.target)}});
// klavye açıkken düğmeye basınca klavye kapanmasın
document.addEventListener("mousedown",e=>{if(e.target.closest&&e.target.closest(".kbkeep"))e.preventDefault()},true);
// sohbet ve yorum hareketleri: sağa çek = yanıtla, sola çek (kendi mesajın) = okundu bilgisi, basılı tut = menü
{let g=null;const B=t=>t&&t.closest&&t.closest("#odaMsgs .oda-b[data-act='odaSel'],#odaMsgs .oda-b[data-act='betComSel']");const live=()=>S.sheet&&(S.sheet.type==="oda"||S.sheet.type==="betCom");
  document.addEventListener("touchstart",e=>{ODA.tch=Date.now();ODA.lp=false;if(g){clearTimeout(g.tm);g=null}const b=e.touches.length===1&&B(e.target);if(!b)return;const t=e.touches[0];
    g={w:b.closest(".oda-bw"),me:!!b.closest("li.me"),x:t.clientX,y:t.clientY,dx:0,mode:0,dir:0,id:b.dataset.v};g.tm=setTimeout(()=>{if(!g||g.mode||!live())return;g.mode=3;ODA.lp=true;S.sheet.info=null;S.sheet.rep=null;S.sheet.sel=g.id;try{navigator.vibrate&&navigator.vibrate(12)}catch(_){}odaTipOff();chatPatch()},430)},{passive:true,capture:true});
  document.addEventListener("touchmove",e=>{if(!g||g.mode>=2)return;const t=e.touches[0],dx=t.clientX-g.x,dy=t.clientY-g.y;
    if(!g.mode){if(Math.abs(dx)<10&&Math.abs(dy)<10)return;clearTimeout(g.tm);const hz=Math.abs(dx)>Math.abs(dy)*1.6;if(hz&&dx>=10&&g.x>24){g.mode=1;g.dir=1;g.w.classList.add("odsw")}else if(hz&&dx<=-10&&g.me){g.mode=1;g.dir=-1;g.w.classList.add("odsw","odsl")}else{g.mode=2;return}}
    if(e.cancelable)e.preventDefault();g.dx=Math.max(0,Math.min(84,dx*g.dir));g.w.style.transform="translateX("+(g.dx*g.dir)+"px)";g.w.classList.toggle("odgo",g.dx>=56)},{passive:false,capture:true});
  const end=()=>{if(!g)return;clearTimeout(g.tm);const o=g;g=null;if(o.mode!==1)return;ODA.lp=true;o.w.style.transform="";o.w.classList.remove("odsw","odsl","odgo");
    if(o.dx<56||!live())return;if(S.sheet.type==="oda"){const c=odaCtx();if(!c||!c.chat)return}odaTipOff();try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}const bc=S.sheet.type==="betCom";
    if(o.dir===1){S.sheet.reply=bc?o.id:+o.id;S.sheet.sel=null;S.sheet.info=null;chatPatch();const t=$(bc?"#betComTxt":"#odaTxt");try{t&&t.focus()}catch(_){}}else{S.sheet.sel=null;S.sheet.info=o.id;chatPatch()}};
  document.addEventListener("touchend",end,{capture:true,passive:true});document.addEventListener("touchcancel",end,{capture:true,passive:true});
  document.addEventListener("contextmenu",e=>{if(B(e.target))e.preventDefault()},true)}
document.addEventListener("touchend",e=>{const b=e.target.closest&&e.target.closest(".kbkeep");if(b&&document.activeElement&&/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)){e.preventDefault();b.click()}},{capture:true,passive:false});
setInterval(()=>{if(S.sheet&&S.sheet.type==="oda"&&document.visibilityState==="visible")odaLoad(S.sheet.mid,true)},6000);
// klavye açılınca alttan açılan pencere görünen alana sığsın (iOS pencereyi yukarı itip bozuyordu)
// üst güvenli alan (saat ve pil satırı) bir kez ölçülür; klavye açıkken sistem bu değeri sıfır verebildiği için sabit tutulur
{const satM=()=>{if(document.body.classList.contains("kb"))return;const p=document.createElement("div");p.style.cssText="position:fixed;top:0;left:0;height:env(safe-area-inset-top,0px);width:1px;visibility:hidden";document.body.appendChild(p);const h=p.getBoundingClientRect().height;p.remove();const cur=parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--sat"))||0;if(h>0||!cur)document.documentElement.style.setProperty("--sat",Math.max(h,0)+"px")};
  setTimeout(satM,0);addEventListener("orientationchange",()=>setTimeout(satM,400));addEventListener("pageshow",()=>setTimeout(satM,50))}
const KB={ios:!!window.__ios||/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1),open:0,full:0,hold:0,want:false,hedef:null};
{const m=/^(\d+)\/(\d+)$/.exec(LS.get("y_kbh")||"");if(m&&+m[2]===Math.round(screen.height))KB.open=+m[1]}
const kbYazi=t=>!!t&&(t.tagName==="TEXTAREA"||(t.tagName==="INPUT"&&["text","number","search","tel",""].includes((t.getAttribute("type")||"").toLowerCase())));
// klavye açılıp kapanırken pencereyi klavyeyle aynı anda, yumuşak bir geçişle boyutlandırır (sistem ölçüyü ancak geçiş bitince bildirir)
function kbGit(ac){if(!KB.ios||!window.visualViewport)return;const bg=document.querySelector("#modal .sheet-bg");if(!bg)return;const on=document.body.classList.contains("kb");if(ac===KB.want&&Date.now()<KB.hold)return;if(ac===on&&!(Date.now()<KB.hold))return;
  const full=KB.full||Math.round(visualViewport.height);const hedef=ac?(KB.open&&KB.open<full*.8?KB.open:Math.round(full*.6)):full;const b=document.getElementById("odaMsgs");const dip=b&&b.scrollHeight-b.scrollTop-b.clientHeight<90;
  KB.want=ac;KB.hold=Date.now()+900;document.body.classList.toggle("kbs",ac);if(!ac)document.body.classList.add("kbk");
  bg.style.top="0px";bg.style.bottom="auto";if(!bg.style.height)bg.style.height=Math.round(bg.getBoundingClientRect().height)+"px";void bg.offsetHeight;bg.style.height=hedef+"px";
  const t0=Date.now();const tik=()=>{if(dip&&b.isConnected)b.scrollTop=b.scrollHeight;if(Date.now()-t0<380)requestAnimationFrame(tik)};requestAnimationFrame(tik);
  clearTimeout(KB.tm);KB.tm=setTimeout(()=>{KB.hold=0;document.body.classList.remove("kbk");if(KB.fix)KB.fix()},950)}
if(window.visualViewport){let kbT=0;const show=()=>{const a=document.activeElement;if(!a||!/^(INPUT|TEXTAREA)$/.test(a.tagName))return;if(a.id==="odaTxt"){odaBottom();return}if(a.id==="betComTxt"){odaBottom();return}try{a.scrollIntoView({block:"center"})}catch(_){}};
  const vvFix=()=>{const v=visualViewport;const kb=v.height<innerHeight*.78;document.documentElement.style.setProperty("--vvh",Math.round(v.height)+"px");const was=document.body.classList.contains("kb");document.body.classList.toggle("kb",kb);
    const tam=S.sheet&&(S.sheet.type==="oda"||S.sheet.type==="betCom");if(tam&&(v.offsetTop>1||scrollY>1)&&(vvFix.n=(vvFix.n||0)+1)<=4){try{window.scrollTo(0,0)}catch(_){}}
    if(kb){KB.open=Math.round(v.height);LS.set("y_kbh",String(KB.open)+"/"+Math.round(screen.height))}else KB.full=Math.round(v.height);
    const bek=Date.now()<KB.hold&&kb!==KB.want;if(!bek&&kb===KB.want)KB.hold=0;if(!kb&&!bek)document.body.classList.remove("kbs","kbk");
    const bg=document.querySelector("#modal .sheet-bg");if(bg&&!bek){if(kb||tam){bg.style.top=Math.round(v.offsetTop)+"px";bg.style.height=Math.round(v.height)+"px";bg.style.bottom="auto"}else{bg.style.top=bg.style.height=bg.style.bottom=""}}
    if(kb){clearTimeout(kbT);kbT=setTimeout(show,was?40:120)}};
  KB.fix=vvFix;visualViewport.addEventListener("resize",vvFix);visualViewport.addEventListener("scroll",vvFix);
  document.addEventListener("focusin",e=>{if(/^(INPUT|TEXTAREA)$/.test(e.target.tagName||"")){vvFix.n=0;if(kbYazi(e.target)&&e.target.closest("#modal"))kbGit(true);setTimeout(vvFix,60);setTimeout(()=>{vvFix();show()},380)}});
  document.addEventListener("focusout",()=>{setTimeout(()=>{const a=document.activeElement;if(!a||!/^(INPUT|TEXTAREA)$/.test(a.tagName))kbGit(false)},0);setTimeout(vvFix,120)});
  // iOS: yazı alanına dokununca klavye, ekranın tepesindeki görünmez bir alan üzerinden açılır; böylece sistem sayfayı yukarı itmez,
  // pencere klavyeyle birlikte tek harekette kısalır. Klavye yerleşince asıl alana geçilir.
  if(KB.ios){let mv=0;const px=document.createElement("input");px.id="kbpx";px.setAttribute("aria-hidden","true");px.tabIndex=-1;px.autocomplete="off";px.style.cssText="position:fixed;top:0;left:0;width:2px;height:2px;opacity:0;border:0;padding:0;margin:0;font-size:16px;background:none;color:transparent;caret-color:transparent;pointer-events:none;z-index:-1";document.body.appendChild(px);
    px.addEventListener("input",()=>{const t=KB.hedef;if(!t||!t.isConnected){px.value="";return}const v=px.value;px.value="";if(!v)return;t.value+=v;t.dispatchEvent(new Event("input",{bubbles:true}))});
    document.addEventListener("touchstart",()=>{mv=0},{passive:true,capture:true});document.addEventListener("touchmove",()=>{mv=1},{passive:true,capture:true});
    document.addEventListener("touchend",e=>{const t=e.target;if(mv||!t||!t.closest||!kbYazi(t)||!t.closest("#modal .sheet")||t.disabled||t.readOnly)return;const a=document.activeElement;if(a===t)return;
      if(a&&a!==px&&/^(INPUT|TEXTAREA)$/.test(a.tagName))return; // klavye zaten açık: sistem kendi geçişini yapar
      e.preventDefault();KB.hedef=t;px.inputMode=t.inputMode||(t.type==="number"?"decimal":"text");px.setAttribute("enterkeyhint",t.getAttribute("enterkeyhint")||"");px.autocapitalize=t.tagName==="TEXTAREA"?"sentences":(t.autocapitalize||"off");
      try{px.focus({preventScroll:true})}catch(_){px.focus()}kbGit(true);
      const gec=()=>{if(!t.isConnected||document.activeElement!==px)return;try{t.focus({preventScroll:true})}catch(_){t.focus()}try{const n=t.value.length;t.setSelectionRange(n,n)}catch(_){}};setTimeout(gec,330);setTimeout(gec,700)},{passive:false,capture:true})}}

const lIc=k=>{const d=DI[k]||["",""];return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d[0]?`<path d="${d[0]}"/>`:""}${d[1]?`<path d="${d[1]}"/>`:""}</svg>`};
function betHead(b,L,kb){const l0=L[0]||{};const lab=String(l0.l||"");const i=lab.indexOf(" · ");const mk=kb?"Kombine":i>0?lab.slice(0,i):"Tahmin";const sel=kb?`${L.length} seçim`:i>0?lab.slice(i+3):lab;
  const pid=!kb&&String(l0.k||"").includes(":")?String(l0.k).split(":")[1]:null;const pp=pid&&P(pid);
  const ic=pp?`<span class="bk-ic av">${avatar(pp,"sm")}</span>`:`<span class="bk-ic">${dIcon(kb?"kombine":"skor12",kb?"gold":"cyan",24)}</span>`;
  const meta=fmtShort(b.d)+(b.sa!=null&&b.z!=="acik"?` · skor ${b.sa}–${b.sb}`:"");
  return `${ic}<span class="bk-t"><small class="bk-e">${esc(mk)}</small><b>${esc(sel)}</b><small>${meta}</small></span>`}
function betRow(b,mine,who){const[z,c]=BET_ST[b.z]||["",""];const win=b.z==="kazandi"?b.py:b.z==="acik"?Math.round(b.st*b.odd):b.z==="iade"?b.st:0;const L=b.legs||[];const kb=L.length>1;
  const wl=b.z==="kazandi"?"Kazandı":b.z==="kaybetti"?"Kaybetti":b.z==="iade"?"İade":"Olası kazanç";
  return `<li class="bk ${c}" id="bk-${esc(b.id)}">${who&&P(b.p)?`<span class="bk-w">${avatar(P(b.p),"sm")}<b>${esc(nameOf(b.p))}</b></span>`:""}
  <div class="bk-h2"><b>${["","Tekli","İkili","Üçlü","Dörtlü"][L.length]||"Kombine"} tahmin · oran <span class="num">${fO(b.odd)}</span></b><span class="bk-z ${c}">${z}</span></div>
  <ul class="bk-l2">${L.map(l=>`<li class="${kb?(BET_ST[l.z]||[])[1]||"":""}">${esc(l.l)}</li>`).join("")}</ul>
  <div class="bk-f2"><span><span class="num">${fJ(b.st)}</span> sikke ${mine?"oynadın":"oynadı"}<small>${fmtShort(b.d)}${b.sa!=null&&b.z!=="acik"?` · skor ${b.sa}–${b.sb}`:""}</small></span>${b.z==="acik"?`<span class="bk-p2"><small>Tutarsa</small><b class="num">${fJ(win)}</b></span>`:b.z==="kazandi"?`<span class="bk-p2 pos"><b class="num">+${fJ(b.py-b.st)}</b></span>`:b.z==="kaybetti"?`<span class="bk-p2 neg"><b class="num">−${fJ(b.st)}</b></span>`:`<span class="bk-p2"><small>İade</small><b class="num">${fJ(b.st)}</b></span>`}</div>
  <div class="bk-r">${mine&&(b.z==="acik"||b.z==="kazandi")?`<button class="bk-b" data-act="betShare" data-id="${esc(b.id)}" data-v="${b.z}" data-m="${esc(b.m)}" aria-label="Tahmini paylaş"><span>Paylaş</span></button>`:""}<button class="bk-b" data-act="betCom" data-id="${esc(b.id)}" aria-label="Yorumlar${b.nc?", "+b.nc:""}"><span>Yorum${b.nc?" · "+b.nc:""}</span></button>${[["up","begen","Beğen"],["down","begenme","Beğenme"]].map(([e,ic,l])=>{const n=(b.re||{})[e]||0;const my=(b.my||[]).includes(e);return `<button class="bk-b ${e}${my?" on":""}" data-act="betReact" data-id="${esc(b.id)}" data-v="${e}" aria-pressed="${my}" aria-label="${l}${n?", "+n:""}">${lIc(ic)}${n?`<span class="num">${n}</span>`:""}</button>`}).join("")}</div>
  ${who&&b.p!==myPid()&&b.z==="acik"&&betCopyOk(b)?`<button class="bk-cp" data-act="betCopy" data-id="${esc(b.id)}">${dIcon("kombine","gold",18)}Ben de oynarım</button>`:""}
  ${mine&&b.z==="acik"&&betCanUndo(b)?`<button class="bk-x" data-act="betCancel" data-id="${esc(b.id)}" aria-label="Tahmini geri al">Geri al · ${Math.max(1,Math.ceil((Date.parse(b.at)+BET_UNDO-Date.now())/60000))} dk</button>`:""}</li>`}
function betPlayers(m,bd){const me=myPid();const P2=bd.players||[];if(!P2.length)return"";
  const sel=S.f.bpl&&P2.some(x=>x.p===S.f.bpl)?S.f.bpl:(P2.find(x=>x.p!==me)||P2[0]).p;const cur=P2.find(x=>x.p===sel);
  const chip=x=>`<button class="${x.p===sel?"on":""}${x.x?" me":""}" data-act="tog1" data-k="bpl" data-v="${esc(x.p)}" aria-pressed="${x.p===sel}">${avatar(P(x.p)||{id:x.p,name:"?"},"sm")}<span>${esc(shortName(nameOf(x.p)))}</span>${x.r?`<em>${x.r}</em>`:""}</button>`;
  return `<section class="card bmk bpm"><h3>Oyuncu tahminleri</h3>
    ${["A","B"].map(k=>`<div class="bpt"><span class="bpt-h t${k}">${esc(nmOf(m,k))}</span><div class="bpc" data-ks="bpc${k}">${P2.filter(x=>x.side===k).sort((a,b)=>"KLDFOSFV".indexOf(a.r||"OS")-"KLDFOSFV".indexOf(b.r||"OS")).map(chip).join("")}</div></div>`).join("")}
    ${cur&&betPHint(cur.p)?`<p class="bhint">${dIcon("simsek","gold",16)}<span>${esc(betPHint(cur.p))}</span></p>`:""}
    ${cur?(cur.x?`<p class="muted small">Kendi adına tahmin yapamazsın. Başka bir oyuncu seç.</p>`:`<div class="bo n2">${cur.o.map(o=>{const on=BET.slip.some(l=>l.k===o.k);
      return `<button class="${on?"on":""}" ${!bd.open?"disabled":""} data-act="betPick" data-k="${esc(o.k)}" data-v="e" data-l="${esc(nameOf(cur.p)+" · "+o.l)}" data-o="${o.odd}" aria-pressed="${on}"><span>${esc(o.l)}${betPopPct(bd,o.k,"e")?`<em class="bpop">%${betPopPct(bd,o.k,"e")} oynadı</em>`:""}</span><b class="num">${fO(o.odd)}</b></button>`}).join("")}</div>`):""}</section>`}
function betSlip(m,sum){if(!BET.slip.length)return"";const mx=sum?Math.max(0,sum.bal):0;const hf=Math.max(10,Math.floor(mx/20)*10);const a=BET.amt;const od=betOdd();const kb=BET.slip.length>1;
  return `<div class="bslip"><div class="bs-h"><span><small>${kb?`Kombine tahmin · ${BET.slip.length} seçim`:"Tahminin"}</small>${kb?"":`<b>${esc(BET.slip[0].l)}</b>`}</span><b class="num bs-o">${fO(od)}</b><button class="bs-x" data-act="betClear" aria-label="Tahmini temizle">×</button></div>
    ${kb?`<ul class="bs-l">${BET.slip.map(l=>`<li><span>${esc(l.l)}</span><b class="num">${fO(l.odd)}</b><button data-act="betPick" data-k="${esc(l.k)}" data-v="${esc(l.s)}" aria-label="Seçimi çıkar">×</button></li>`).join("")}</ul>`:""}
    <div class="bs-r"><label class="bs-i"><span>Sikke</span><input id="betAmt" type="number" inputmode="numeric" min="10" max="${mx}" step="10" value="${esc(a)}" placeholder="10–${fJ(mx)}"></label>
    <div class="bs-q">${[100,500].filter(v=>v<mx/2).map(v=>`<button data-act="betAmt" data-v="${v}">${v}</button>`).join("")}${mx>=20?`<button data-act="betAmt" data-v="${hf}">Yarısı</button>`:""}<button data-act="betAmt" data-v="${mx}">Hepsi</button></div></div>
    <div class="bs-f"><span>Olası kazanç <b class="num" id="betWin">${fJ(Math.round((+a||0)*od))}</b></span><button class="btn primary" data-act="betPlace" data-id="${esc(m.id)}"${BET.busy?" disabled":""}>Oyna</button></div>
    ${BET.slip.length<4?`<p class="bs-n">Kombine için başka bir tahmin daha seçebilirsin (en fazla 4). Hepsi tutarsa oranlar çarpılır.</p>`:""}</div>`}
// Tahmin 18 yaş altına kapalı: bilgi sunucudan gelir (doğum yılı diğer üyelere açılmaz)
const tahminYok=()=>!!(S.mem&&S.mem.minor);
function viewIddia(){
  if(isMember()&&tahminYok())return `<div class="iddia"><div class="card emp2">${empIc("kupa","gold")}<h3>Tahmin 18 yaş ve üzeri için</h3><p>Tahmin oyunu 18 yaşından küçük oyunculara kapalıdır. Maçlar, oylama, kartlar ve soyunma odası sana açık.</p></div></div>`;
  if(!isMember())return `<div class="iddia"><div class="card emp2">${empIc("kupa","gold")}<p>Tahmin oyununa katılmak için takıma üye olarak giriş yapmalısın.</p></div></div>`;
  const me=myPid();const m=betNext();if(m)betLoad("board",m.id);betLoad("tbl");if(me)betLoad("list",me);
  const bd=m&&BET.board[m.id];const row=BET.tbl&&me?(BET.tbl.wrows||[]).find(r=>r.p===me):null;const sum=(bd&&bd.sum)||row;
  const tab=S.f.bt||"oyna";
  let h=`<div class="iddia"><header class="bjh"><button class="oda-bk" data-act="tab" data-tab="mac" aria-label="Bu hafta ekranına dön"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><h1>Tahmin</h1>${betBell()}<button class="bj-i" data-act="betInfo" aria-label="Sikke ve kurallar"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.2"/><path d="M12 11v5.5"/><circle cx="12" cy="7.6" r=".9" fill="currentColor" stroke="none"/></svg></button><button class="bjh-v" data-act="betInfo" aria-label="Bu haftaki bakiyen ${sum?fJ(sum.bal):""} sikke"><b class="num">${sum?fJ(sum.bal):"…"}</b><small>Sikke</small></button></header>`;
  const t3=tab==="herkes"?"kupon":tab;
  h+=`<div class="mtabs bt" role="tablist">${[["oyna","Oyna"],["kupon","Tahminler"],["sira","Sıralama"]].map(([k,l])=>`<button role="tab" aria-selected="${t3===k}" class="${t3===k?"on":""}" data-act="tog1" data-k="bt" data-v="${k}">${l}</button>`).join("")}</div>`;
  if(t3==="kupon")h+=`<div class="bxh bx2">${[["kupon","Benim"],["herkes","Arkadaşlar"]].map(([k,l])=>`<button class="chip${tab===k?" on":""}" data-act="tog1" data-k="bt" data-v="${k}">${l}</button>`).join("")}</div>`;
  if(tab==="oyna"){
    if(!m)h+=`<div class="card emp2">${empIc("takvim","cyan")}<p>Sıradaki maçın kadroları açıklanınca tahminler açılır.</p></div>`;
    else if(!bd)h+=`<div class="card"><p class="muted">Oranlar yükleniyor…</p></div>`;
    else{const t=matchTs(m);
      h+=`<section class="bm"><div class="bm-t"><span class="tA">${esc(nmOf(m,"A"))}</span><i>vs</i><span class="tB">${esc(nmOf(m,"B"))}</span></div>
        <div class="bm-m"><span>${dIcon("takvim","cyan",18)}${GKISA[new Date(t).getDay()]} ${fmtShort(m.date)} · ${esc(String(m.time||"").slice(0,5))}</span><span class="${bd.open?"op":"cl"}">${dIcon("duduk",bd.open?"gold":"pink",18)}${bd.open?`Kapanış ${new Date(t-BET_CLOSE).toLocaleTimeString("tr-TR",{hour:"2-digit",minute:"2-digit"})}`:"Tahminler kapandı"}</span></div></section>`;
      h+=betDaily(m,bd);
      h+=bd.markets.map(k=>{const hi=betHint(k.k,m);return `<section class="card bmk"><h3>${esc(k.t)}</h3><div class="bo n${k.o.length}">${k.o.map(o=>{const on=BET.slip.some(l=>l.k===k.k&&l.s===o.s);const pp=betPopPct(bd,k.k,o.s);
        return `<button class="${on?"on":""}" ${!bd.open?"disabled":""} data-act="betPick" data-k="${esc(k.k)}" data-v="${esc(o.s)}" data-l="${esc(k.t+" · "+o.l)}" data-o="${o.odd}" aria-pressed="${on}"><span>${esc(o.l)}${pp?`<em class="bpop">%${pp} oynadı</em>`:""}</span><b class="num">${fO(o.odd)}</b></button>`}).join("")}</div>${hi?`<p class="bhint">${dIcon("simsek","gold",16)}<span>${esc(hi)}</span></p>`:""}</section>${k.k==="hnd"?betSkCard(m,bd):""}`}).join("");
      h+=betPlayers(m,bd);
      if(bd.open&&BET.slip.length)h+=`<button class="bbar" data-act="betSlipOpen"><span><small>${BET.slip.length>1?`${BET.slip.length} seçim · oran ${fO(betOdd())}`:`Tek tahmin · oran ${fO(betOdd())}`}</small><b>${BET.slip.length>1?BET.slip.map(l=>esc(l.l.split(" · ").pop())).join(" + "):esc(BET.slip[0].l)}</b></span><i>Tahmin yap</i></button>`}}
  else if(tab==="kupon"){const L=me&&BET.lists[me];
    if(!L)h+=`<div class="card"><p class="muted">Yükleniyor…</p></div>`;
    else if(!L.rows.length)h+=`<div class="card emp2">${empIc("bilet","green")}<p>Bu sezon henüz tahmin yapmadın.</p></div>`;
    else h+=`<ul class="card bkl">${L.rows.map(b=>betRow(b,true)).join("")}</ul>`}
  else if(tab==="herkes"){betLoad("feed");const F=BET.feed;
    if(!F)h+=`<div class="card"><p class="muted">Yükleniyor…</p></div>`;
    else{const fo=false;const R=F.rows.filter(b=>b.p!==me&&(!fo||(F.f||[]).includes(b.p)));
      h+=R.length?`<ul class="card bkl">${R.map(b=>betRow(b,false,true)).join("")}</ul>`:`<div class="card emp2">${empIc("kombine","gold")}<p>Henüz görünen arkadaş tahmini yok.</p></div>`}}
  else{const T=BET.tbl;betLoad("feed");const rs=S.f.brs==="sezon"?"sezon":"hafta";
    h+=`<div class="mzseg brs" role="group" aria-label="Sıralama">${[["hafta","Bu hafta"],["sezon","Sezon"]].map(([k,l])=>`<button data-act="tog1" data-k="brs" data-v="${k}" class="${rs===k?"on":""}" aria-pressed="${rs===k}">${l}</button>`).join("")}</div>`;
    if(rs==="hafta"&&BET.kral&&P(BET.kral.p))h+=`<button class="krb" data-act="kralOpen">${KRL_TAC}<span><small>Geçen haftanın kralı · ödülü: yelek giymiyor</small><b>${esc(nameOf(BET.kral.p))}</b></span><em class="num">+${fJ(BET.kral.net)}</em><i aria-hidden="true">›</i></button>`;
    if(!T)h+=`<div class="card"><p class="muted">Yükleniyor…</p></div>`;
    else if(rs==="hafta"){const R=betRankW(T);const W=(T.wrows||[]);const nz=W.filter(r=>P(r.p)&&!(r.n>0||r.open>0)).length;
      h+=`<p class="kro">${KRL_TAC}<span><b>Bu haftanın ödülü</b>Haftayı lider bitiren, gelecek maçta yelek giymez.</span></p>`;
      h+=R.length?betRankHtml(R,me,r=>`${fJ(r.bal)} sikke · ${r.won}/${r.n} tuttu${r.open?` · ${fJ(r.open)} açıkta`:""}`,T.wk):`<div class="card emp2">${empIc("podyum","gold")}<p>Bu haftanın yarışı ilk tahminle başlar. İlk tahmini sen yap.</p></div>`;
      if(nz&&R.length)h+=`<p class="muted small bxn">${nz} kişi bu hafta henüz tahmin yapmadı.</p>`;}
    else{const R=betRank(T);const nz=T.rows.filter(r=>P(r.p)&&!(r.n>0||r.open>0)).length;
      h+=R.length?betRankHtml(R,me,r=>`${r.won}/${r.n} tuttu${r.open?` · ${fJ(r.open)} açıkta`:""}`,null):`<div class="card emp2">${empIc("podyum","gold")}<p>Sezon yarışı ilk tahminle açılır. İlk tahmini sen yap.</p></div>`;
      if(nz&&R.length)h+=`<p class="muted small bxn">${nz} kişi henüz tahmin yapmadı; ilk tahminleriyle sıralamaya girerler.</p>`;
}}
  return h+`</div>`}
function sheetBetInfo(){const me=myPid();const m=betNext();const bd=m&&BET.board[m.id];const row=BET.tbl&&me?(BET.tbl.wrows||[]).find(r=>r.p===me):null;const sum=(bd&&bd.sum)||row;
  const R=sum?[["Başlangıç",sum.start||5000,"Her hafta herkese"],["Maç primi",sum.oyn||0,"Geçen maçtan: oynadıysan 200 · notun çok iyi +300, iyi +200, orta +100 · maçın adamı +300"],["Oy verme",sum.oy||0,"Geçen maçta oy verdiysen +200"],...(sum.kurt?[["Kurtarma",sum.kurt,"Bakiye 100'ün altına düşünce"]]:[]),["Tahminler",sum.net,"Net kazanç ya da kayıp"],["Açık tahminde",-sum.open,"Maç bitince sonuçlanır"]]:[];
  const K=[["kombine","gold","Bir tahmine 1–4 seçim koyarsın. Birden fazlaysa kombine olur, oranlar çarpılır, hepsi tutarsa kazanırsın."],["simsek","gold","Handikap: bir takıma kâğıt üstünde gol avansı verilir. \"-1,5\" yazan takım en az 2 farkla kazanırsa tutar. \"+1,5\" yazan takım kazanır, berabere kalır ya da 1 farkla kaybederse tutar. 2,5'te bu sınır 3 fark olur."],["yildiz","gold","Skor tahmini: iki takımın golünü seçersin, skor tam tutarsa kazanırsın. Oranı yüksektir."],["kombine","cyan","Aynı şeyi iki kez oynatmamak için bazı seçimler birlikte konamaz: maç sonucu, handikap ve fark birbirleriyle; skor tahmini ise oyuncu seçimleri dışındaki hiçbir seçimle aynı tahmine girmez."],["takvim","cyan","Tahminler kadrolar açıklanınca açılır, maçtan 1 saat önce kapanır. Yaptığın tahmini ilk 5 dakika içinde geri alabilirsin."],["kalkan","green","Bir tahmine en az 10 sikke oynanır, üst sınır yok: istersen bütün haftalık bakiyeni tek tahmine koyabilirsin. Kendi adına oyuncu tahmini yapılamaz."],["podyum","gold","Her hafta ayrı bir yarış: pazartesi herkes 5.000 sikkeyle başlar, kalan sikke ertesi haftaya geçmez. Haftalık sıralama o haftanın tahmin kazancına göre. Bütün haftaların tahmin kazançları sezon yarışında toplanır. Sıralamaya sadece tahmin yapanlar girer."],["kupa","gold","Haftanın bütün tahminleri sonuçlanınca en çok kazanan haftanın tahmin kralı ilan edilir. Ödülü: bir sonraki maçta yelek giymez."],["yildiz","pink","Maç primi ve oy bonusu maçtan sonra gelir, bir sonraki haftanın 5.000 sikkesine eklenir; ikisi birlikte haftada en fazla 1.000 sikke eder. Sıralamayı etkilemez, sadece oynayacak sikken artar."]];
  return `<div class="ch"><div><div class="eyebrow">Tahmin</div><h2>Sikke ve kurallar</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
  ${sum?`<div class="bif">${R.map(([l,v,d])=>`<div class="bif-r"><span><b>${l}</b><small>${d}</small></span><em class="num ${v<0?"neg":""}">${v>0&&l!=="Başlangıç"?"+":""}${fJ(v)}</em></div>`).join("")}<div class="bif-r t"><span><b>Bu haftaki bakiyen</b></span><em class="num">${fJ(sum.bal)}</em></div></div>`:""}
  <div class="bdef"><label><span>Varsayılan tahmin tutarı</span><input id="betDef" type="number" inputmode="numeric" min="10" step="10" value="${esc(betDefAmt())}" placeholder="Boş"></label><button class="btn sm" data-act="betDefAmt">Kaydet</button></div>
  <ul class="bik">${K.map(([ic,c,t])=>`<li>${dIcon(ic,c,26)}<span>${t}</span></li>`).join("")}</ul><p class="muted small" style="margin:10px 0 0">Para yok, bahis değil; sikke temsilidir. Tahmin oyunu 18 yaş ve üzeri oyunculara açıktır.</p>
  <section class="bil"><h3>Sikke tamamen temsilidir</h3>
    <p>Sikke, yalnızca eğlence için kullanılan sanal bir puandır. Gerçek para değildir, herhangi bir parasal değeri yoktur.</p>
    <ul><li>Sikke satın alınamaz, satılamaz, başkasına devredilemez ve paraya çevrilemez.</li>
    <li>Tahmin oyununa katılmak ücretsizdir; hiçbir aşamada ödeme istenmez.</li>
    <li>Kazanılan sikkelerin karşılığında para, hediye ya da parasal değeri olan herhangi bir ödül verilmez. Haftanın tahmin kralının tek kazancı, bir sonraki maçta yelek giymemektir.</li>
    <li>Bu oyun bir bahis, şans oyunu ya da kumar hizmeti değildir. Tahminler arkadaşlar arasında sıralama ve sohbet konusu olsun diye vardır.</li></ul>
    <p>Sikkeler her hafta başında yenilenir ve uygulama dışında hiçbir yerde geçerli değildir.</p></section>`}
// tahmin verisini cihazda sakla: sekme ilk açılışta da anında dolu gelsin
function betSave(){try{const m=betNext();const me=myPid();localStorage.setItem("y_bet_"+(TID),JSON.stringify({b:m&&BET.board[m.id]?{[m.id]:BET.board[m.id]}:{},t:BET.tbl,l:me&&BET.lists[me]?{[me]:BET.lists[me]}:{},k:BET.kings}))}catch(_){}}
function betRestore(){try{const d=JSON.parse(localStorage.getItem("y_bet_"+(TID))||"null");if(!d)return;Object.assign(BET.board,d.b||{});if(!BET.tbl)BET.tbl=d.t||null;Object.assign(BET.lists,d.l||{});if(!BET.kings)BET.kings=d.k||null}catch(_){}}
// uygulama açılınca arka planda yükle
const kralSeen=()=>{try{if(BET.kral)LS.set("y_kral_"+TID,BET.kral.wk)}catch(_){}};
// ödül: haftanın tahmin kralı, bir sonraki haftanın maçında yelek giymez
function yelekMuaf(m){const k=BET.kral;if(!k||!k.wk||!m||!P(k.p))return null;const d=parseYmd(String(k.wk).slice(0,10));d.setDate(d.getDate()+7);const w=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");return betMon(m.date)===w?k.p:null}
function muafKart(m){if(!isMember()||S.fol)return"";const id=yelekMuaf(m);if(!id||!plAll(m).includes(id))return"";const me=id===myPid();
  return `<button class="ymf" data-act="kralOpen">${KRL_TAC}<span><b>${me?"Bu maçta yelek giymiyorsun":esc(firstName(nameOf(id)))+" bu maçta yelek giymiyor"}</b><small>Geçen haftanın tahmin kralının ödülü</small></span><i aria-hidden="true">›</i></button>`}
function kralLoad(open){return rpc("bet_kral",{}).then(r=>{if(!r||!r.ok)return;BET.kral=r.wk&&P(r.p)?r:null;if(!BET.kral)return;
  if(open||(LS.get("y_kral_"+TID)!==BET.kral.wk&&!S.sheet&&!S._route&&!S.story)){S.sheet={type:"kral"};render(true)}else if(S.tab==="iddia"||S.tab==="mac")render(true)}).catch(()=>{})}
const KRL_TAC='<svg class="krl-tac" viewBox="0 0 64 40" aria-hidden="true"><path d="M6 34 2 10l16 12L32 3l14 19 16-12-4 24z" fill="#FFD400" stroke="#B8860B" stroke-width="2.5" stroke-linejoin="round"/><circle cx="32" cy="3.5" r="3.5" fill="#FF3EA5"/><circle cx="2.5" cy="10" r="2.5" fill="#12C46B"/><circle cx="61.5" cy="10" r="2.5" fill="#12C46B"/></svg>';
function sheetKral(){const k=BET.kral;if(!k)return"";const T=(k.top||[]).filter(r=>P(r.p));const w=T.find(r=>r.p===k.p)||{p:k.p,net:k.net,n:0,won:0};const ph=photoOf(w.p);const me=myPid()===w.p;
  const C=["#FFD400","#12C46B","#FF3EA5","#3EC6FF","#B9A8FF"];const cf=Array.from({length:22},(_,i)=>`<i style="left:${(i*37+11)%100}%;background:${C[i%5]};animation-delay:${((i*53)%24)/10}s;animation-duration:${2.6+((i*29)%14)/10}s"></i>`).join("");
  const rest=T.filter(r=>r.p!==k.p).slice(0,2);
  return `<div class="krl"><div class="krl-cf" aria-hidden="true">${cf}</div><div class="eyebrow">Haftalık tahmin yarışı</div>
  <div class="krl-av">${KRL_TAC}${ph?`<img src="${esc(ph)}" alt="">`:`<span>${esc(initials(nameOf(w.p)))}</span>`}</div>
  <h2>${esc(nameOf(w.p))}</h2><p class="krl-t">${me?"Bu haftanın tahmin kralı sensin!":"Haftanın tahmin kralı"}</p>
  <div class="krl-n num">+${fJ(k.net)}<small>sikke kazanç</small></div><p class="krl-o"><b>Ödül</b>${me?"Gelecek maçta yelek giymiyorsun":"Gelecek maçta yelek giymiyor"}</p>${w.n?`<p class="muted small">${w.n} tahmininden ${w.won} tanesi tuttu</p>`:""}
  ${rest.length?`<ol class="krl-l">${rest.map((r,i)=>`<li><b>${i+2}</b><span>${esc(shortName(nameOf(r.p)))}</span><em class="num ${r.net<0?"neg":""}">${r.net>0?"+":""}${fJ(r.net)}</em></li>`).join("")}</ol>`:""}
  <div class="krl-b"><button class="btn" data-act="kralShare">${ICON.share||""} Paylaş</button><button class="btn primary" data-act="kralOk">Tamam</button></div></div>`}
function ypThafta(){if(!isMember())return null;const k=BET.kral;if(!k){kralLoad();return null}const L=(k.top||[]).filter(r=>P(r.p)).slice(0,3);if(!L.length)return null;
  const html=ypPost({c:"t",ey:"Haftalık yarış · Tahmin",ti:"Haftanın tahmin kralı",hero:ypPod(L.map(r=>({id:r.p,v:(r.net>0?"+":"")+fJ(r.net),l:"sikke · "+r.won+"/"+r.n+" tuttu"}))),pn:`<div class="yp-odl"><b>Ödül</b><span>${esc(firstName(nameOf(k.p)))} gelecek maçta yelek giymiyor</span></div>`,ft:"Her hafta 5.000 sikkeyle yeni yarış"});
  return{html,cap:`Haftanın tahmin kralı: ${nameOf(k.p)} 👑 +${fJ(k.net)} sikke\nÖdülü: gelecek maçta yelek giymiyor\n${L.map((r,i)=>(i+1)+". "+nameOf(r.p)+" "+(r.net>0?"+":"")+fJ(r.net)).join("\n")}\n${HT()} #tahmin`,name:"haftanin-tahmin-krali"}}
function betPrefetch(){if(!isMember()||S.fol)return;betRestore();kralLoad();const m=betNext();if(m)betLoad("board",m.id);betLoad("tbl");betLoad("feed");betLoad("notes");const me=myPid();if(me)betLoad("list",me)}
function betFind(id){if(!id)return null;const L=[BET.feed,...Object.values(BET.lists||{})];for(const x of L){const c=x&&x.rows&&x.rows.find(r=>r.id===id);if(c)return c}return null}
function betMini(id){const c=betFind(id);if(!c){betLoad("feed");return""}const L=c.legs||[];const [z,cl]=BET_ST[c.z]||["",""];
  return `<div class="bmini">${P(c.p)?avatar(P(c.p),"sm"):""}<span><b>${esc(shortName(nameOf(c.p)))} · ${L.length>1?"Kombine · "+L.length+" seçim":esc(L[0]?.l||"Tahmin")}</b>${L.length>1?`<small>${L.map(l=>esc(l.l)).join(" + ")}</small>`:""}<small>${fJ(c.st)} sikke · oran ${fO(c.odd)}</small></span><em class="bk-z ${cl}">${z}</em></div>`}
function betAgo(t){const d=(Date.now()-Date.parse(t))/60000;if(!(d>=0)||d<1)return"az önce";if(d<60)return Math.floor(d)+" dk";if(d<1440)return Math.floor(d/60)+" sa";return Math.floor(d/1440)+" gün"}
function betComPut(id,r){BET.com={id,rows:r.rows||[],rd:r.rd||{},own:r.own||null}}
function betComReadSrv(id){const C=BET.com,me=myPid();if(!C||C.id!==id||!me||document.visibilityState!=="visible"||!C.rows.length)return;const last=C.rows[C.rows.length-1];if(last.tmp)return;const mine=Date.parse((C.rd||{})[me]||0)||0;if(mine>=Date.parse(last.at))return;if(BET.rdS===id+":"+last.id)return;BET.rdS=id+":"+last.id;rpc("bet_comments_read",{p_coupon:id}).then(r=>{if(r&&r.ok&&BET.com&&BET.com.id===id&&!(S.sheet&&S.sheet.busy)){betComPut(id,r);betComPatch()}}).catch(()=>{BET.rdS=null})}
const chatPatch=()=>S.sheet&&S.sheet.type==="betCom"?betComPatch():odaPatch();
function betComOthers(){const C=BET.com,me=myPid();if(!C)return[];return [...new Set([C.own,...C.rows.map(r=>r.p)])].filter(i=>i&&i!==me&&P(i))}
function betComSaw(i,c){const t=BET.com&&(BET.com.rd||{})[i];return !!t&&Date.parse(t)>=Date.parse(c.at)}
function betComTick(c){if(c.tmp)return"";const me=myPid(),o=betComOthers();const n=o.filter(i=>betComSaw(i,c)).length;const any=n||Object.keys((BET.com&&BET.com.rd)||{}).some(i=>i!==me&&betComSaw(i,c));const all=o.length>0&&n===o.length;return `<i class="oda-rt${all?" all":""}" role="img" aria-label="${all?"Yazışanların hepsi gördü":any?"Görenler var":"Gönderildi"}">${any?ODA_TK.d:ODA_TK.c}</i>`}
function betComReplyHtml(){const sh=S.sheet,rp=sh&&sh.reply&&BET.com&&BET.com.rows.find(r=>String(r.id)===String(sh.reply));return rp?`<div class="oda-rb"><span><small>Yanıtlanan</small>${esc(shortName(nameOf(rp.p)))}: ${esc(temiz(rp.b))}</span><button class="kbkeep" data-act="betComReply" data-v="" aria-label="Yanıtı kaldır">×</button></div>`:""}
function betComMsgs(){const sh=S.sheet,C=BET.com&&BET.com.id===sh.id?BET.com.rows:null,me=myPid();if(!C)return `<li class="sys">Yükleniyor…</li>`;if(!C.length)return `<li class="sys">Henüz yorum yok. İlk yorumu sen yaz.</li>`;
  const myAt=me?"@"+firstName(nameOf(me)).toLocaleLowerCase("tr"):null;
  let prev=null,blkP=false;return C.map(c=>{const mine=c.p===me;if(!mine&&isBlk(c.p)){prev=null;const f=!blkP;blkP=true;return f?`<li class="sys">Engellediğin bir oyuncunun yorumları gizlendi</li>`:""}blkP=false;const grp=prev&&prev.p===c.p&&!c.r;prev=c;const sel=String(sh.sel)===String(c.id);const can=!c.tmp&&isMember();const bl=String(c.b||"").toLocaleLowerCase("tr");const at=!mine&&((myAt&&bl.includes(myAt))||bl.includes("@herkes"));
    const rp=c.r&&C.find(r=>String(r.id)===String(c.r));
    return `<li class="${mine?"me":""}${at?" at":""}${grp?" g":""}${sel?" sel":""}${c.tmp?" tmp":""}">${mine?"":(grp?`<span class="oda-sp"></span>`:avatar(P(c.p)||{id:c.p,name:"?"},"sm"))}<div class="oda-bw"><div class="oda-b"${can?` data-act="betComSel" data-v="${esc(c.id)}" role="button" tabindex="0" aria-expanded="${sel}"`:""}>${!grp&&!mine?`<span class="oda-h"><b>${esc(shortName(nameOf(c.p)))}</b></span>`:""}${rp?`<q>${esc(shortName(nameOf(rp.p)))}: ${esc(isBlk(rp.p)?"…":temiz(rp.b))}</q>`:""}<p>${esc(temiz(c.b))}<time>${odaHM(c.at)}${mine?betComTick(c):""}</time></p></div></div></li>`}).join("")}
function betComPatch(){const L=document.getElementById("odaMsgs");if(!L||!S.sheet||S.sheet.type!=="betCom")return false;const near=L.scrollHeight-L.scrollTop-L.clientHeight<90,st=L.scrollTop;L.innerHTML=betComMsgs();L.scrollTop=near?L.scrollHeight:st;const rb=document.getElementById("betRb");if(rb)rb.innerHTML=betComReplyHtml();odaDnUpd();odaMenuDraw();return true}
function sheetBetCom(){const id=S.sheet.id;const c=betFind(id);
  return `<div class="oda oda-T"><div class="oda-hd"><button class="oda-bk" data-act="close" aria-label="Geri"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><div><b>Yorumlar</b></div></div>${betMini(id)}
    <div class="oda-mw"><ul class="oda-m" id="odaMsgs">${betComMsgs()}</ul><button id="odaDn" class="oda-dn" data-act="odaDown" aria-label="En alta in" hidden><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg><b class="num"></b></button></div>
    <div class="oda-cmp">${LS.get("y_oda_tip")?"":`<p class="oda-tip" id="odaTip"><span>Sağa çek: yanıtla. Kendi yorumunu sola çek: kim gördü. Basılı tut: seçenekler.</span><button class="kbkeep" data-act="odaTipX" aria-label="İpucunu kapat">×</button></p>`}<div id="betRb">${betComReplyHtml()}</div><div id="betAtL" class="oda-al"></div><div class="oda-cr"><textarea id="betComTxt" data-kp rows="1" maxlength="140" placeholder="Yorum yaz · @ ile etiketle" aria-label="Yorum" autocomplete="off"></textarea><button class="oda-send kbkeep" data-act="betComSend" data-id="${esc(id)}" aria-label="Gönder"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12 20 4l-6 16-3-7-7-1z"/></svg></button></div></div></div>`}
setInterval(()=>{const sh=S.sheet;if(!sh||sh.type!=="betCom"||document.visibilityState!=="visible"||sh.busy)return;const id=sh.id;rpc("bet_comments",{p_coupon:id}).then(r=>{if(r&&r.ok&&S.sheet&&S.sheet.type==="betCom"&&S.sheet.id===id&&!S.sheet.busy&&JSON.stringify([r.rows,r.rd])!==JSON.stringify([(BET.com&&BET.com.rows)||null,(BET.com&&BET.com.rd)||null])){betComPut(id,r);betComPatch();betComReadSrv(id)}}).catch(()=>{})},6000);
// Ben sayfasındaki küçük tahmin kartı
function betBenCard(){if(!isMember()||tahminYok())return"";const me=myPid();if(!me)return"";betLoad("tbl");betLoad("feed");const T=BET.tbl;if(!T)return"";
  const W=betRankW(T),R=betRank(T);const wi=W.findIndex(r=>r.p===me),si=R.findIndex(r=>r.p===me);const w=(T.wrows||[]).find(r=>r.p===me);const sr=R[si];
  const t=wi>=0?`Bu hafta ${wi+1}. sıra`:"Bu hafta tahmin yok";const sub=`${w?fJ(w.bal)+" sikke":""}${si>=0?` · sezonda ${si+1}.`:""}`;const net=wi>=0?W[wi].net:null;
  return `<button class="card bben" data-act="tab" data-tab="iddia">${dIcon("bilet","green",26)}<span><b>Tahmin · ${t} ${betBadges(me).map(x=>`<i class="bbg" title="${esc(x[1])}">${x[0]}</i>`).join("")}</b><small>${sub||"ilk tahminini yap, yarışa gir"}</small></span>${net!=null?`<em class="num ${net<0?"neg":net>0?"pos":""}">${net>0?"+":""}${fJ(net)}</em>`:""}</button>`}
// ---- uygulamaya uygun seçim menüsü: telefonun kendi açılır listesi yerine ----
(()=>{let pop=null,src=null,tx=0,ty=0,tsel=null,lastTouch=0;
  const close=()=>{if(!pop)return;pop.remove();pop=null;const s=src;src=null;if(Date.now()-lastTouch<1500)return;/* dokunmatik: odağı seçime geri verme, iOS kendi listesini açıyor */try{s&&s.focus({preventScroll:true})}catch(_){}};
  document.addEventListener("focusin",e=>{if(e.target&&e.target.tagName==="SELECT"&&("ontouchstart"in window)&&!pop)try{e.target.blur()}catch(_){}},true);
  const open=sel=>{if(sel.disabled)return;close();src=sel;
    const box=(sel.closest(".yrsel,.cv-s,.mzsel,.pe-r,label.f")||sel).getBoundingClientRect();
    const opts=[...sel.querySelectorAll("option,optgroup")];
    const html=opts.map(o=>o.tagName==="OPTGROUP"?`<span class="cselg">${esc(o.label)}</span>`:`<button type="button" role="option" aria-selected="${o.selected}" class="${o.selected?"on":""}" data-v="${esc(o.value)}"${o.disabled?" disabled":""}><span>${esc(o.textContent)}</span>${o.selected?'<i aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></i>':""}</button>`).join("");
    pop=document.createElement("div");pop.className="csel-w";
    pop.innerHTML=`<button type="button" class="csel-x" aria-label="Kapat" tabindex="-1"></button><div class="csel" role="listbox" aria-label="${esc(sel.getAttribute("aria-label")||sel.closest("label")?.firstChild?.textContent?.trim()||"Seç")}">${html}</div>`;
    document.body.appendChild(pop);const m=pop.querySelector(".csel");
    const vw=innerWidth,vh=innerHeight,w=Math.min(vw-24,Math.max(box.width,240));m.style.width=w+"px";
    m.style.left=Math.max(12,Math.min(box.left,vw-12-w))+"px";
    const below=vh-box.bottom-16,above=box.top-16,mh=Math.min(m.scrollHeight,420);
    if(below>=Math.min(mh,260)||below>=above){m.style.top=(box.bottom+6)+"px";m.style.maxHeight=Math.max(160,below-80)+"px"}
    else{m.style.bottom=(vh-box.top+6)+"px";m.style.maxHeight=Math.max(160,above)+"px"}
    const on=m.querySelector("button.on");if(on)on.scrollIntoView({block:"center"});(on||m.querySelector("button"))?.focus({preventScroll:true});
    pop.addEventListener("click",e=>{const b=e.target.closest(".csel button");if(!b){close();return}if(b.disabled)return;const s=src;
      if(s.value!==b.dataset.v){s.value=b.dataset.v;close();s.dispatchEvent(new Event("input",{bubbles:true}));s.dispatchEvent(new Event("change",{bubbles:true}))}else close()});
    pop.addEventListener("keydown",e=>{const bs=[...m.querySelectorAll("button:not([disabled])")];const i=bs.indexOf(document.activeElement);
      if(e.key==="Escape"){e.preventDefault();close()}else if(e.key==="ArrowDown"){e.preventDefault();bs[Math.min(bs.length-1,i+1)]?.focus()}else if(e.key==="ArrowUp"){e.preventDefault();bs[Math.max(0,i-1)]?.focus()}})};
  const selOf=t=>t.closest?.("select")||(t.closest?.("label")?.querySelector("select"))||null;
  document.addEventListener("touchstart",e=>{lastTouch=Date.now();const s=selOf(e.target);tsel=s;if(s){tx=e.touches[0].clientX;ty=e.touches[0].clientY}},{capture:true,passive:true});
  document.addEventListener("touchend",e=>{lastTouch=Date.now();const s=tsel;tsel=null;if(!s||selOf(e.target)!==s)return;const t=e.changedTouches[0];if(Math.abs(t.clientX-tx)>10||Math.abs(t.clientY-ty)>10)return;e.preventDefault();open(s)},{capture:true,passive:false});
  document.addEventListener("mousedown",e=>{if(Date.now()-lastTouch<800)return;const s=selOf(e.target);if(!s||e.button)return;e.preventDefault();open(s)},true);
  document.addEventListener("click",e=>{const s=selOf(e.target);if(s&&e.target.tagName!=="SELECT")e.preventDefault()},true);
  document.addEventListener("keydown",e=>{const s=e.target;if(s.tagName==="SELECT"&&[" ","Enter","ArrowDown","ArrowUp"].includes(e.key)&&!e.altKey){e.preventDefault();open(s)}},true);
  addEventListener("resize",close);document.addEventListener("scroll",e=>{if(pop&&!pop.contains(e.target))close()},true);})();
})();
