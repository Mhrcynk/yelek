(function(){
"use strict";
/* ================= Bağlantı ================= */
const SB_URL="https://tnjpxwxfqbhfxsphbqhq.supabase.co";
const SB_KEY="sb_publishable_ATJ8lPaPBzZEj-4k7Z5Ztw_YGevQCS3";
async function sbGet(path){const r=await fetch(SB_URL+"/rest/v1/"+path,{headers:{apikey:SB_KEY,Accept:"application/json",...authHdr()}});if(!r.ok)throw new Error("HTTP "+r.status);return r.json()}
async function rpc(fn,args){
  const r=await fetch(SB_URL+"/rest/v1/rpc/"+fn,{method:"POST",headers:{apikey:SB_KEY,"Content-Type":"application/json",Accept:"application/json",...authHdr()},body:JSON.stringify(args||{})});
  let body=null;try{body=await r.json()}catch(_){}
  if(!r.ok)throw new Error((body&&body.message)||("HTTP "+r.status));return body;
}

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
const DEF_SET={group_name:"Salı Ekibi",field_name:"",day:2,time:"21:00"};
const TABS=[["gecmis","Fikstür","gecmis"],["lig","Lig","lig"],["mac","Maç","mac"],["kartlar","Oyuncular","kart"],["ben","Ben","ben"]];

const sv=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICON_GRID='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/></svg>',ICON_LIST='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2" fill="currentColor"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor"/><circle cx="4.5" cy="18" r="1.2" fill="currentColor"/></svg>',ICON_DOTS='<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>',ICON_SRCH='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>',ICON={
  mac:sv('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M12 5v14"/><circle cx="12" cy="12" r="2.5"/>'),
  gecmis:sv('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16M8 14h3M8 17h6"/>'),
  kart:sv('<rect x="5" y="3" width="14" height="18" rx="2.5"/><path d="M9 16h6"/><path d="m12 6.5 1.1 2.2 2.4.3-1.7 1.7.4 2.4-2.2-1.1-2.2 1.1.4-2.4-1.7-1.7 2.4-.3z"/>'),
  sezon:sv('<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8 20h8"/>'),
  kural:sv('<path d="M6 4h10a3 3 0 0 1 3 3v13H9a3 3 0 0 1-3-3z"/><path d="M10 9h5M10 13h5"/>'),
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
{const old={hafta:"mac",oyuncular:"kartlar",kurallar:"ayarlar"};let t=LS.get("y_tab");t=old[t]||t;if(TABS.some(x=>x[0]===t))S.tab=t;
 const h=location.hash.slice(1);const hh=old[h]||h;if(TABS.some(x=>x[0]===hh))S.tab=hh;else if(hh==="uyeler"){S.tab="ayarlar";S.f=S.f||{};S.f.setp="uyeler"}}

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
const fin=()=>S.matches.filter(m=>m.state==="bitti"&&!isExt(m)).sort((a,b)=>matchTs(a)-matchTs(b));
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
setInterval(tickCd,1000);

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
function gyOrt(){const F=S.matches.filter(m=>m.state==="bitti"&&!isExt(m));let t=0;for(const m of F)t+=(+m.score_a||0)+(+m.score_b||0);
  return Math.round((t+NOTE.gyOrt*NOTE.gyOnc)/(F.length*2+NOTE.gyOnc)*10)/10}
// maç içi denge: maçın not ortalaması 7'ye oturur, değerlendirme notun aralığını belirler, eşik maçın ortalama kart seviyesine göre
function matchNotes(m,motm,gol,fiy,lvF){const pl=plAll(m);const R={};for(const id of pl){const r=matchPoints(m,id,motm,gol,fiy,lvF?lvF(id):undefined);if(r)R[id]=r}
  const ids=Object.keys(R);if(!ids.length)return R;
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
const ENG={step:2,cap:8,decay:.05,maxGen:.3,motmGen:.5};
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
  if(g){ga("sut_bit",ENG.step*Math.min(g,3),g+" gol");if(role==="FV")ga("sut_poz",ENG.step,"gol attı");if(g>=3)ga("sut_guc",ENG.step,"hat-trick")}
  else if(role==="FV"){add("sut_bit",-ENG.step,"gol yok");if(ctx.fvDry>=3)add("sut_poz",-ENG.step,ctx.fvDry+" maçtır gol yok")}
  if(a){ga("pas_kis",ENG.step*Math.min(a,2),a+" asist");if(a>=2)ga("pas_viz",ENG.step,"2+ asist");if(role==="KL")ga("ayk_pas",ENG.step,"asist")}
  if(g&&a)ga("dri_kon",ENG.step,"gol + asist");
  if(+st.cl)add(role==="KL"?"ref_yak":"def_bil",ENG.step*(+st.cl),"çizgiden çıkardı");
  if(+st.pen)add(role==="KL"?"poz_bir":"def_mud",-ENG.step*(+st.pen),"penaltı yaptırdı");
  if(+st.pm)add(role==="KL"?"ayk_pas":"sut_bit",-ENG.step*(+st.pm),"penaltı kaçırdı");
  if(+st.ps)add(role==="KL"?"dal_kos":"def_bil",ENG.step*(+st.ps),"penaltı kurtardı");
  // defans kartında şut/pas ağırlığı düşük: gol katkısı savunmacının ana özelliklerine yazılır
  const gk=g+a;if((posOf(p)==="DF"||eposOf(p)==="DOS")&&gk){const w=gk+" gol katkısı";ga("pas_viz",ENG.step,w);if(g)ga("sut_guc",ENG.step,w);ga(/^S[ĞL]B$/.test(eposOf(p))?"hiz_spr":"fiz_agr",ENG.step*Math.min(gk,2),w)}
  if(role==="OS"&&!g&&!a&&ctx.osDry>=2)add("pas_viz",-ENG.step,ctx.osDry+" maçtır katkı yok");
  const b=concBand(op);
  if(role==="DF"){if(b==="iyi+"){add("def_bil",ENG.step,op+" gol yedi");add("def_kes",ENG.step,op+" gol yedi")}else if(b==="iyi")add("def_bil",ENG.step,op+" gol yedi");
    else if(b==="kötü")add("def_bil",-ENG.step,op+" gol yedi");else if(b==="kötü+"){add("def_bil",-ENG.step,op+" gol yedi");add("def_mud",-ENG.step,op+" gol yedi")}}
  if(role==="KL"){if(b==="iyi+"){add("ref_ref",ENG.step,op+" gol yedi");add("poz_yer",ENG.step,op+" gol yedi")}else if(b==="iyi")add("ref_ref",ENG.step,op+" gol yedi");
    else if(b==="kötü")add("poz_yer",-ENG.step,op+" gol yedi");else if(b==="kötü+"){add("ref_ref",-ENG.step,op+" gol yedi");add("dal_uza",-ENG.step,op+" gol yedi")}}
  if(og)add(role==="KL"?"poz_yer":"def_bil",-ENG.step*og,"kendi kalesine");
  const my=r.side==="A"?+m.score_a||0:+m.score_b||0;
  if(r.res==="G")add(MENTAL[role],ENG.step,"galibiyet");else if(r.res==="M"&&op-my>=5)add(MENTAL[role],-ENG.step,(op-my)+" farklı yenilgi");
  // Maçın Adamı: pozisyondan bağımsız GEN'e sabit +motmGen, kartın en ağırlıklı ana özelliğine yazılır
  if(ctx.motm){const set=attrSet(p.pos);let ep=eposOf(p);if((ep==="KL")!==(p.pos==="Kaleci"))ep=DEF_EPOS[p.pos]||"MO";const w=W[ep];
    const top=set.reduce((b,x)=>(w[x[0]]??0)>(w[b[0]]??0)?x:b,set[0]);const t=set.reduce((q,[k])=>q+(w[k]??0),0)||1;
    for(const[sk]of top[3])add(top[0]+"_"+sk,ENG.motmGen*t/(w[top[0]]||1),"Maçın Adamı")}
  if(ctx.att>0&&ctx.att%4===0)add(p.pos==="Kaleci"?"hiz_cab":"fiz_day",ENG.step,ctx.att+" maç üst üste geldi");
  return ch}
// maç notunu karta çevir: GEN değişimi = (not − 6,5) × 0,4; değişim maçta yapılan işin özelliklerine dağıtılır
function noteSpread(p,cur,ch,D){if(Math.abs(D)<.005)return[];
  const imp=L=>{const c={...cur};for(const[k,v]of L)c[k]=c[k]+v;return genF(p,c)-genF(p,cur)};
  let L=ch.filter(([k,v])=>k in cur&&Math.sign(v)===Math.sign(D)),I=L.length?imp(L):0;
  if(!L.length||I*D<=1e-6){const set=attrSet(p.pos);let ep=eposOf(p);if((ep==="KL")!==(p.pos==="Kaleci"))ep=DEF_EPOS[p.pos]||"MO";const w=W[ep];
    const top=set.reduce((b,x)=>(w[x[0]]??0)>(w[b[0]]??0)?x:b,set[0]);L=top[3].map(([sk])=>[top[0]+"_"+sk,Math.sign(D),"maç notu"]);I=imp(L)}
  return I?L.map(([k,v,why])=>[k,v*D/I,why]):[]}
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
      ch=ch.filter(x=>x[0] in DL);const before=gen;const g0=genF(p,curOf());const nD=r?clamp((r.pts-(r.esik??lvEsik(r.lv??NOTE.ref)))*NOTE.kat,-NOTE.katMax,NOTE.katMax):0;if(r)ch=noteSpread(p,curOf(),ch,nD);const DL0={...DL};
      const req={};for(const[k,v]of ch){req[k]=(req[k]||0)+v;DL[k]=clamp(DL[k]+v,-ENG.cap,ENG.cap)}
      let ng=genF(p,curOf());
      if(r){const rest=g0+nD-ng;if(Math.abs(rest)>.01){for(const k of KS)DL[k]=clamp(DL[k]+rest,-ENG.cap,ENG.cap);ng=genF(p,curOf())}}
      else{const lim=ENG.maxGen;if(Math.abs(ng-before)>lim){const f=lim/Math.abs(ng-before);for(const k of KS)DL[k]=DL0[k]+(DL[k]-DL0[k])*f;ng=genF(p,curOf())}}
      ch=Object.keys(req).map(k=>{const v=Math.round((DL[k]-DL0[k])*10)/10;return v?[k,v]:Math.abs(req[k])>=.05?[k,0,req[k]>0?"tavan":"taban"]:null}).filter(Boolean);
      gen=clamp(ng,40,99);ovr=flo(gen);
      hist.push({m,d:Math.round((gen-before)*10)/10,od:ovr-flo(before),ovr,gx:gen,ch,...line});series.push(ovr);
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
  try{const yr=new Date().getFullYear();
    const[st,pl,ms,sv2,ag]=await Promise.all([sbGet("settings?id=eq.1&select=*"),sbGet("players?select=id,name,pos,no,attrs,status,status_log,created_at,archived,photo_v,guest,epos,alt_pos,yedek&order=created_at.asc"),
      sbGet("matches?select=*&archived=eq.false&order=date.desc&limit=400"),sbGet("season_votes?select=*&year=eq."+yr),rpc("player_ages",{}).catch(()=>[])]);
    {const am={};(Array.isArray(ag)?ag:[]).forEach(r=>am[r.id]=r.age);pl.forEach(p=>{if(am[p.id]!=null)p.age=am[p.id]})}
    const sig=JSON.stringify([st,pl,ms,sv2]);const same=S.loaded&&!S.err&&!S.offline&&sig===S.sig;S.sig=sig;
    applyData(st,pl,ms,sv2);S.offline=0;
    const pv=pl.map(p=>p.id+":"+(p.photo_v||0)).join(",");if(pv!==S.pv&&pl.some(p=>p.photo_v)){try{const ph=await sbGet("player_photos?select=player_id,data");S.photos={};ph.forEach(r=>S.photos[r.player_id]=r.data);S.pv=pv}catch(_){}}
    cacheSave(st,pl,ms,sv2);
    // arka plan yenilemesinde veri değişmediyse ekranı yeniden çizme (açık bölümler kapanmasın)
    if(same&&!force)return;
  }catch(e){console.error(e);if(S.loaded){if(!S.offline&&S.cacheAt)S.offline=S.cacheAt;if(!force){render(true);return}}else S.err="Verilere ulaşılamadı. İnternet bağlantını kontrol edip sayfayı yenile."}
  render();setTimeout(notesSync,800);
}
/* son veriyi telefonda sakla: zayıf internette uygulama yine açılsın */
function applyData(st,pl,ms,sv2){S.settings={...DEF_SET,...(st[0]||{})};S.gate=!!S.settings.gate;TEAM.A=cleanName(S.settings.team_a_name)||"Yelekliler";TEAM.B=cleanName(S.settings.team_b_name)||"Yeleksizler";S.all=pl;S.players=pl.filter(p=>!p.archived&&!p.guest);S.guests=pl.filter(p=>p.guest&&!p.archived);S.matches=ms;S.seasonVotes=sv2;S.loaded=true;S.err=null;
  {const om=openMatch();if(om){if(cleanName(om.name_a||""))TEAM.A=cleanName(om.name_a);if(cleanName(om.name_b||""))TEAM.B=cleanName(om.name_b)}}}
function cacheSave(st,pl,ms,sv2){
  if(!pl.length){LS.del("y_cache");LS.del("y_cph");return}// kilitli ve üye değil: hiçbir şey saklama
  const at=Date.now();S.cacheAt=at;
  try{localStorage.setItem("y_cache",JSON.stringify({v:1,at,st,pl,ms,sv2,mem:S.mem||null}))}catch(_){LS.del("y_cache")}
  try{if(S.pv&&LS.get("y_cpv")!==S.pv){localStorage.setItem("y_cph",JSON.stringify(S.photos));LS.set("y_cpv",S.pv)}}catch(_){LS.del("y_cph");LS.del("y_cpv")}}
function cacheLoad(){try{const c=JSON.parse(localStorage.getItem("y_cache")||"null");if(!c||c.v!==1||!c.pl||!c.pl.length)return false;
  applyData(c.st,c.pl,c.ms,c.sv2);S.cacheAt=c.at;S.sig=JSON.stringify([c.st,c.pl,c.ms,c.sv2]);
  if(c.mem&&!S.mem)S.mem=c.mem;if(S.mem&&S.mem.role==="yonetici"&&S.mem.status==="onayli")S.admin=true;
  try{const ph=JSON.parse(localStorage.getItem("y_cph")||"null");if(ph){S.photos=ph;S.pv=LS.get("y_cpv")}}catch(_){}
  return true}catch(_){return false}}
function cacheClear(){LS.del("y_cache");LS.del("y_cph");LS.del("y_cpv");S.cacheAt=0}
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
async function notesSync(){setTimeout(photoFixRun,2500);if(!S.admin||S._ns)return;S._ns=true;
  try{for(const m of S.matches){if(m.state!=="bitti"||m.notes||m.kind==="ext")continue;const inf=S.mInfo[m.id];if(!inf||!inf.pts)continue;
    const n={};for(const[id,r]of Object.entries(inf.pts)){if(r&&isFinite(r.pts))n[id]={n:Math.round(r.pts*10)/10}}
    if(!Object.keys(n).length)continue;try{const r=await rpc("admin_set_notes",{p_pin:S.pin||"",p_id:m.id,p_notes:n});if(r&&r.ok)m.notes=n}catch(_){}}}
  finally{S._ns=false}}
async function act(fn,args,okMsg){
  try{const r=await rpc(fn,args);
    if(r&&r.ok===false){
      if(r.error==="pin"||r.error==="locked"){toast("Bu işlem için yönetici hesabıyla giriş yapmalısın");if(0)toast(r.error==="locked"?"":"Yönetici şifresi geçersiz, tekrar giriş yap.")}
      else toast({closed:"Bu işlem için süre doldu ya da maç kapandı.",not_played:"Bu maçta oynamadığın için oy veremezsin.",self:"Kendine oy veremezsin.",short:"Yeni şifre en az 6 karakter olmalı."}[r.error]||"İşlem yapılamadı.");
      await load(true);return null}
    if(okMsg)toast(okMsg);await load(true);return r||{ok:true};
  }catch(e){console.error(e);toast("Kaydedilemedi. Bağlantını kontrol et.");return null}
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
function goTab(t,fromNav){if(t===S.tab)return;const idx=x=>TABS.findIndex(y=>y[0]===(x==="sezon"?"lig":x));
  const dir=S.tab==="sezon"&&t==="lig"?"r":S.tab==="lig"&&t==="sezon"?"r":(idx(t)<0||idx(S.tab)<0)?"r":(idx(t)>=idx(S.tab)?"r":"l");
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
  return `<label class="yrsel"><span>${y==="all"?"Tüm zamanlar":"Sezon "+y}</span><i>${CHVD}</i><select data-act-change="yr" aria-label="Sezon seç">${L.map(x=>`<option value="${x}"${x===y?" selected":""}>Sezon ${x}${seasonDone(x)?"":" (devam ediyor)"}</option>`).join("")}<option value="all"${y==="all"?" selected":""}>Tüm zamanlar</option></select></label>`}
function seasonProg(){const y=selYr();if(y==="all")return"";const n=seasonCount(y),L=sLen(),done=seasonDone(y);const fin2=!done&&n>=L-2;
  return `<div class="sprog"><div class="sprt"><b>${done?"Sezon tamamlandı":`Hafta ${n}/${L}`}</b>${fin2?'<span class="sfin">Final haftaları</span>':""}</div><span class="sbar"><i style="width:${Math.min(100,Math.round((done?L:n)/L*100))}%"></i></span></div>`}
const PHD={gecmis:["Fikstür",1],lig:["Lig",1],kartlar:["Oyuncular",0],sezon:["Lig",1],ben:["Ben",0],kurallar:["Puanlama",0],ayarlar:[null,0]};
function phdRender(){const el=$("#phd");if(!el)return;const t=S.tab;let c=PHD[t];
  if(t==="gecmis"&&S.view)c=null;if(typeof gated==="function"&&gated())c=null;if(t==="ayarlar")c=[S.f.setp&&SUBT[S.f.setp]?SUBT[S.f.setp]:"Ayarlar",0];
  if(!S.loaded||!c){el.hidden=true;el.innerHTML="";document.body.classList.remove("hasphd","phout");$("#tt").textContent="";return}
  el.hidden=false;document.body.classList.add("hasphd");$("#tt").textContent=c[0];
  const me=null;
  el.innerHTML=`<div class="wrap"><h1>${c[0]}</h1>${c[1]?`<div class="phsr">${yrSel()}${seasonProg()}</div>`:me?`<span class="phsub">${esc(me.name)}</span>`:""}</div>`;
  if(!S._phIO&&"IntersectionObserver"in window){S._phIO=new IntersectionObserver(es=>{for(const e of es)document.body.classList.toggle("phout",!e.isIntersecting)},{rootMargin:"-60px 0px 0px 0px"});S._phIO.observe(el)}}
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
const YP={g:{FV:1,OS:1.25,DF:1.5,KL:1.5},a:{FV:.5,OS:.75,DF:1,KL:1}};
// kaleci ve defansın gol yeme puanı: maç notundaki aralığın aynısı (sezon ortalamasına göre), eksiler sayılmaz
const ypSav=(role,op,avg)=>{if(role!=="KL"&&role!=="DF"||op==null)return 0;const d=op-avg;for(const[lim,v]of NOTE.savunma)if(d<=lim)return Math.max(0,v[role]||0);return 0};
const fP=v=>String(+(+v).toFixed(2)).replace(".",",");
function yelekRace(F){const pl={};
  const gA=gyOrt();F.forEach((m,mi)=>{const inf=S.mInfo[m.id];if(!inf)return;const by={};
    for(const[id,r]of Object.entries(inf.pts||{})){if(!r||!P(id)||P(id).guest)continue;(by[r.role]=by[r.role]||[]).push([id,r])}
    for(const[role,L]of Object.entries(by)){L.sort((a,b)=>b[1].pts-a[1].pts);const bon={};let i=0;
      while(i<L.length&&i<3){let j=i;while(j+1<L.length&&L[j+1][1].pts===L[i][1].pts)j++;for(let k=i;k<=j;k++)if(L[k][1].pts>=6)bon[L[k][0]]=[3,2,1][i];i=j+1}
      for(const[id,r]of L){const o=pl[id]=pl[id]||{id,tot:0,n:0,m:{},rc:{}};
        const p=(bon[id]||0)+(r.g||0)*(YP.g[role]||0)+(r.a||0)*(YP.a[role]||0)+ypSav(role,r.op,gA);
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
function posRaceHtml(F){const YR=yelekRace(F);const card=raceCardsBase(F);const rows=POS_AW.map(([k,t,ic])=>card(k,t,ic,YR[k]||[])).join("");
  return rows?`<div class="tsx"><h2>Mevki yarışları</h2></div><div class="boards">${rows}</div>`:""}
function yelekAll(F){const YR=yelekRace(F);return Object.values(YR).flat().sort((a,b)=>b.tot-a.tot||a.n-b.n||nameOf(a.id).localeCompare(nameOf(b.id),"tr"))}
function mvpHtml(F){const L=yelekAll(F).filter(o=>o.tot>0);if(!L.length)return"";
  const top=L.slice(0,3);const ord=top.length===3?[1,0,2]:top.map((_,i)=>i);
  const pod=`<div class="mvpod">${ord.map(i=>{const o=top[i];const p=P(o.id);return p?`<div class="mvc r${i+1}"><span class="mvr">${i+1}</span><div class="mvf"><div class="mvi">${card(p)}</div></div><b class="num">${fP(o.tot)}</b><small>puan</small></div>`:""}).join("")}</div>`;
  return `<div class="boards mvpb"><section class="card tsb"><h3 class="tsh">⭐ Sezonun oyuncusu</h3>${pod}</section></div>`}
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
  it.push(b("cmpOpen",ICON.scale,"Karşılaştır",""));
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
      el.classList.remove("loading");el.classList.add("done");await new Promise(r=>setTimeout(r,800));back(420);busy=false}
    else if(d)back(300)})})();
function render(force){
  if(!force&&isEditing()){S.pending=true;return}
  S.pending=false;compute();
  const s=S.settings;
  
  $("#admPill").hidden=true;{const gb=$("#gearBtn");if(gb){gb.classList.toggle("adm",!!S.admin);gb.hidden=!S.admin}}
  {const gb=$("#gearBtn");if(gb){const k="ayar";if(gb.dataset.k!==k){gb.innerHTML=ICON.ayar;gb.dataset.k=k;gb.setAttribute("aria-label","Ayarlar");gb.title="Ayarlar"}gb.classList.toggle("on",S.tab==="ayarlar")}}
  const me=P(S.me);const mb=$("#meBtn");
  if(me){mb.className="meBtn";mb.innerHTML=`${avatar(me,"sm")}<span>${esc(firstName(me.name))}</span>`;mb.setAttribute("aria-label","Ben: "+me.name+". Değiştir")}
  else{mb.className="meBtn ask";mb.textContent="Kimsin?";mb.removeAttribute("aria-label")}
  {const ni=$("#navIn");if(!ni.firstChild)ni.innerHTML=TABS.map(([k,l,ic])=>`<button data-tab="${k}"><span class="ic">${ic==="lig"?LIG_SVG:ICON[ic]}</span><span class="tl">${l}</span></button>`).join("");
    const cur=S.tab==="sezon"?"lig":S.tab;ni.querySelectorAll("button").forEach(b=>{if(b.dataset.tab===cur)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current")});navInd()}
  document.body.classList.toggle("gated",gated());
  let h="";if(S.err)h+=`<div class="note warn">${esc(S.err)}</div>`;
  if(S.offline&&S.loaded)h+=`<button class="offl" data-act="retry">${SI.bulut}<span><b>İnternet yok</b> · son güncelleme ${new Date(S.offline).toDateString()===new Date().toDateString()?hhmm(S.offline):fmtShort(new Date(S.offline).toISOString().slice(0,10))+" "+hhmm(S.offline)}</span><i>Yenile</i></button>`;
  if(!S.loaded&&!S.err)h+=`<div class="skl"><i class="sk h"></i><i class="sk"></i><i class="sk"></i><i class="sk s"></i></div><div class="skl"><i class="sk"></i><i class="sk"></i><i class="sk s"></i></div>`;
  else if(S.loaded&&gated()&&!AUTH.ready&&LS.get("y_auth"))h+=`<div class="skl"><i class="sk h"></i><i class="sk"></i><i class="sk"></i><i class="sk s"></i></div>`;
  else if(S.loaded&&gated())h+=viewVitrin();
  else if(S.loaded)h+=(S.tab==="mac"?pushAsk():"")+({mac:viewMac,gecmis:viewGecmis,ben:viewBen,kartlar:viewKartlar,lig:viewLig,sezon:viewSezon,kurallar:viewKurallar,ayarlar:viewAyarlar}[S.tab]||viewMac)();
  const v=$("#view");const tabI=t=>TABS.findIndex(x=>x[0]===(t==="sezon"?"lig":t));const chg=S._tab!==undefined&&S._tab!==S.tab;const dir=tabI(S.tab)>=tabI(S._tab)?"r":"l";S._tab=S.tab;
  keepOpen(v,()=>{v.innerHTML=h});v.removeAttribute("aria-busy");phdRender();qkRender();
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
function renderSheet(){
  const host=$("#modal");const html=S.sheet?sheetHtml():"";
  if(!html){S.sheet=null;if(host.firstChild){host.innerHTML="";document.body.classList.remove("lock")}return}
  let body=$("#sheetBody");
  if(!body){host.innerHTML=`<div class="sheet-bg" data-act="closeBg"><div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div><div id="sheetBody"></div></div></div>`;body=$("#sheetBody");document.body.classList.add("lock")}
  keepOpen(body,()=>{body.innerHTML=html});
}
/* ================= Paylaşım merkezi ================= */
const IGH="@abilerkardeslerfc";
const canPM=()=>true;
const IG_SVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';
const IGLOGO=`<svg viewBox="0 0 512 512"><path d="M256 70l150 48v122c0 100-66 166-150 206C172 406 106 340 106 240V118z" fill="#37003C" stroke="#fff" stroke-width="18"/><path d="M186 176l70 92 70-92M256 268v96" fill="none" stroke="#fff" stroke-width="38" stroke-linecap="round" stroke-linejoin="round"/><circle cx="256" cy="128" r="16" fill="#00FF85"/></svg>`;
const igWeek=m=>{if(!m||m.season==null)return"";const L=fin().filter(x=>+x.season===+m.season).sort((a,b)=>matchTs(a)-matchTs(b));const i=L.findIndex(x=>x.id===m.id);return i>=0?"HAFTA "+(i+1):""};
const igWm=t=>`<div class="igwm"><span>${IGLOGO}${IGH}</span><span>${esc(t||"")}</span></div>`;
const igAv=(id,cls="")=>{const ph=photoOf(id);const p=P(id);return `<span class="igav ${tierOf(ovrOf(id))} ${cls}">${ph?`<img src="${esc(ph)}" alt="">`:esc(initials(p?p.name:"?"))}</span>`};
const igDate=d=>{const x=new Date(d+"T12:00:00");return x.getDate()+" "+["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"][x.getMonth()]};
/* ===== Paylaşım merkezi: haber kartı şablonları (300×375 gönderi, 300×533 hikâye) ===== */
const TRU=s=>String(s||"").toLocaleUpperCase("tr");
const hkHd=(t,max)=>{const n=[...String(t)].length;const sz=Math.min(max||42,Math.floor(540/Math.max(1,n)));return `<div class="hkhd" style="font-size:${sz}px">${esc(TRU(t))}</div>`};
const hkPh=(id,cls)=>{const ph=photoOf(id);return ph?`<img class="hkcut ${cls||""}" src="${esc(ph)}" alt="">`:`<div class="hkcut hknoph ${cls||""}">${SILH}</div>`};
const hkCr=(m,k,sz)=>crest(nmOf(m,k),k,sz||20,nmOf(m,k==="A"?"B":"A"));
const hkSc=m=>`${hkCr(m,"A")}<b>${+m.score_a||0}</b><em></em><b>${+m.score_b||0}</b>${hkCr(m,"B")}`;
// skor tabelası: iki kaptanın fotoğrafı, takım adı ve skor (kaptan yoksa arma)
const hkCap=(m,k)=>{const id=k==="A"?m.cap_a:m.cap_b;const ok=id&&P(id);const ph=ok&&photoOf(id);
  return `<div class="hksc"><div class="hkcp${ok?"":" cr"}">${ok?`<div class="hkcpi">${ph?`<img src="${esc(ph)}" alt="">`:`<span>${esc(initials(nameOf(id)))}</span>`}</div>`:hkCr(m,k,40)}${ok?`<i>${hkCr(m,k,15)}</i>`:""}</div><b>${esc(TRU(nmOf(m,k)))}</b>${ok?`<small>KPT · ${esc(TRU(shortName(nameOf(id))))}</small>`:""}</div>`};
const hkSB=(m,mid)=>`<div class="hksb">${hkCap(m,"A")}${mid||`<div class="hkss"><b>${+m.score_a||0}</b><em></em><b>${+m.score_b||0}</b></div>`}${hkCap(m,"B")}</div>`;
const hkSt=L=>`<div class="hkst">${L.map(([v,l,c])=>`<div class="${c||""}"><strong>${v}</strong><small>${esc(TRU(l))}</small></div>`).join("")}</div>`;
const hkNm=id=>{const a=ageOf(P(id));return `<b class="hknm">${esc(TRU(nameOf(id)))}${a!=null?`<span>(${a})</span>`:""}</b>`};
const hkFt=r=>`<div class="hkft"><span>${IGLOGO}${IGH}</span><span>${esc(TRU(r||""))}</span></div>`;
const HKR='<div class="hkrays"><i></i><i></i><i></i><i></i></div>';
function hkPost(o){return `<div class="hk ${o.c||""}${/tall/.test(o.pnC||"")?" pt":""}">${HKR}${o.tag?`<div class="hktag">${esc(o.tag)}</div>`:""}${hkHd(o.hd,o.max)}${o.body||""}${o.chip?`<div class="hkchip ${o.chipC||""}">${o.chip}</div>`:""}${o.pn?`<div class="hkpn ${o.pnC||""}">${o.pn}</div>`:""}${hkFt(o.ft)}</div>`}
const hkSeason=()=>{const yr=curYr();return{yr,F:fin().filter(m=>+m.season===+yr).sort((a,b)=>matchTs(a)-matchTs(b))}};
const hkNoteCls=v=>"hk"+noteCls(v);
const hkMatchFt=m=>igDate(m.date)+(igWeek(m)?" · "+igWeek(m):"");
const hkMates=(L,cls)=>`<div class="hktw ${cls||""}">${L.map(r=>`<div class="hktr">${r.map(x=>`<div class="hktp"><div class="hktph">${photoOf(x.id)?`<img src="${esc(photoOf(x.id))}" alt="">`:`<span>${esc(initials(nameOf(x.id)))}</span>`}</div>${x.v!=null?`<em class="${x.c||""}">${x.v}</em>`:""}<b>${esc(TRU(shortName(nameOf(x.id))))}</b></div>`).join("")}</div>`).join("")}</div>`;
const hkCol=(head,rows)=>`<div class="hkkc"><div class="hkkh">${head}</div>${rows.map(([p,n,v,c])=>`<div class="hkkr"><i>${esc(p)}</i><b>${n}</b>${v!=null?`<em class="${c||""}">${v}</em>`:""}</div>`).join("")}</div>`;
const lineRows=(m,k)=>{const ps=posArr(m,k),L=lineupOf(m,k),T=plOf(m,k);const O={KL:0,DF:1,OS:2,FV:3};
  const r=L.length?L.map((id,i)=>id?[id,i===0?"KL":slotPos(ps[i][0],ps[i][1],ps[i][2])]:null).filter(Boolean):T.map(id=>[id,eposOf(P(id))||""]);
  return r.sort((x,y)=>(O[EPOS[x[1]]?.[0]]??9)-(O[EPOS[y[1]]?.[0]]??9))};

/* --- maç --- */
function hkScore(m){const inf=S.mInfo[m.id]||{pts:{}};const a=+m.score_a||0,b=+m.score_b||0;const nA=nmOf(m,"A"),nB=nmOf(m,"B");
  const sc=k=>plOf(m,k).map(id=>[id,+(m.stats||{})[id]?.g||0]).filter(x=>x[1]>0).sort((x,y)=>y[1]-x[1]).map(([id,g])=>esc(shortName(nameOf(id)))+(g>1?" "+g:""));
  const hd=a===b?"Berabere":(Math.abs(a-b)>=4?(a>b?nA:nB)+" fark attı":(a>b?nA:nB)+" kazandı");const mo=inf.motm,r=mo&&inf.pts[mo];
  const cA=m.cap_a&&P(m.cap_a)?m.cap_a:null,cB=m.cap_b&&P(m.cap_b)?m.cap_b:null;
  const body=cA&&cB?hkPh(cA,"duo l")+hkPh(cB,"duo r"):cA||cB?hkPh(cA||cB):mo?hkPh(mo):"";
  const html=hkPost({hd,body,chip:hkSc(m),chipC:"big",pnC:"tall",
    pn:`<div class="hkvs"><div><b>${esc(TRU(nA))}</b>${cA?`<small>KPT · ${esc(TRU(shortName(nameOf(cA))))}</small>`:""}<p>${sc("A").map(x=>`<span class="nw">${x}</span>`).join(" · ")||"–"}</p></div><div><b>${esc(TRU(nB))}</b>${cB?`<small>KPT · ${esc(TRU(shortName(nameOf(cB))))}</small>`:""}<p>${sc("B").map(x=>`<span class="nw">${x}</span>`).join(" · ")||"–"}</p></div></div>${mo?`<div class="hkmini">★ Maçın adamı: ${esc(nameOf(mo))}${r?" · "+fN(r.pts):""}</div>`:""}`,ft:hkMatchFt(m)});
  const gl=[...sc("A"),...sc("B")].join(" · ");
  const cap=`${igDate(m.date)} · ${nA} ${a}–${b} ${nB} ${a===b?"🤝":"🔥"}\n${mo?nameOf(mo)+" maçın adamı ⭐\n":""}${gl?"⚽ "+gl+"\n":""}#abilerkardeslerfc #halısaha #yelek`;
  return{html,cap,name:"mac-sonucu-"+m.date}}
function hkTotw(m){const inf=S.mInfo[m.id]||{pts:{}};const T=inf.totw||[];if(!T.length)return null;const fk=T.form||"2-3-1",sl=T.slot||{};
  const row=r=>T.filter(id=>(sl[id]||inf.pts[id]?.role)===r).map(id=>{const v=inf.pts[id]?.pts;return{id,v:(inf.motm===id?"★":"")+fN(v),c:inf.motm===id?"s":v<6.5?"o":""}});
  const rows=["FV","OS","DF","KL"].map(row).filter(r=>r.length);
  const html=hkPost({hd:"Haftanın takımı",body:hkMates(rows),ft:fk+" · "+hkMatchFt(m)});
  const by=r=>T.filter(id=>(sl[id]||inf.pts[id]?.role)===r).map(id=>shortName(nameOf(id))+" "+fN(inf.pts[id].pts)).join(", ");
  const cap=`Haftanın takımı · ${igDate(m.date)} · ${fk} 🟩\n🧤 ${by("KL")}\n🛡️ ${by("DF")}\n🎯 ${by("OS")}\n⚡ ${by("FV")}\n#abilerkardeslerfc #haftanıntakımı #halısaha`;
  return{html,cap,name:"haftanin-takimi-"+m.date}}
function hkLineup(m){const inf=S.mInfo[m.id]||{pts:{}};
  const col=k=>hkCol(`${hkCr(m,k,14)}<b>${esc(TRU(nmOf(m,k)))}</b><small>${esc(formLabel(formOf(m,k),posArr(m,k)))}</small>`,lineRows(m,k).map(([id,ep])=>{const r=inf.pts[id];return[ep,esc(shortName(nameOf(id)))+(inf.motm===id?" ★":""),r?fN(r.pts):null,r?hkNoteCls(r.pts):""]}));
  const html=hkPost({hd:"Not karnesi",body:hkSB(m)+`<div class="hkkw sb">${col("A")}${col("B")}</div>`,ft:hkMatchFt(m)});
  const ln=k=>plOf(m,k).map(id=>shortName(nameOf(id))).join(", ");
  const cap=`${igDate(m.date)} not karnesi 📝\n${nmOf(m,"A")}: ${ln("A")}\n${nmOf(m,"B")}: ${ln("B")}\n#abilerkardeslerfc #halısaha`;
  return{html,cap,name:"not-karnesi-"+m.date}}
const hkMG=(m,id)=>{const s=(m.stats||{})[id]||{};return{g:+s.g||0,a:+s.a||0}};
const hkGA=(m,id)=>{const{g,a}=hkMG(m,id);return g?[g+" gol","Bu maçta"]:a?[a+" asist","Bu maçta"]:[TRU(ROLE_NAME[S.mInfo[m.id]?.pts[id]?.role]||""),"Mevki"]};
function hkMotm(m){const inf=S.mInfo[m.id]||{pts:{}};const id=inf.motm;if(!id)return null;const r=inf.pts[id];
  const html=hkPost({hd:"Maçın adamı",body:hkPh(id),chip:hkSc(m),pn:hkNm(id)+hkSt([hkGA(m,id),[r?fN(r.pts):"–","Maç notu"]]),ft:hkMatchFt(m)});
  return{html,cap:`Maçın adamı: ${nameOf(id)} ⭐\n${igDate(m.date)} · ${nmOf(m,"A")} ${m.score_a}–${m.score_b} ${nmOf(m,"B")}${r?" · not "+fN(r.pts):""}\n#abilerkardeslerfc #maçınadamı #halısaha`,name:"macin-adami-"+m.date}}
function hkFiy(m){const inf=S.mInfo[m.id]||{pts:{}};const id=inf.fiy;if(!id)return null;const r=inf.pts[id];
  const html=hkPost({c:"fy",hd:"Haftanın fiyaskosu",max:34,body:hkPh(id),chip:hkSc(m),pn:hkNm(id)+hkSt([[r?fN(r.pts):"–","Maç notu"],[String((S.stats[id]?.fiy)||1),"Fiyasko sayısı"]]),ft:hkMatchFt(m)});
  return{html,cap:`Haftanın fiyaskosu… ${nameOf(id)} 🙈\nGelecek hafta rövanş var!\n#abilerkardeslerfc #fiyasko #halısaha`,name:"fiyasko-"+m.date}}
function hkGoal(m){const inf=S.mInfo[m.id]||{pts:{}};const id=inf.gol;if(!id)return null;const{g}=hkMG(m,id);
  const yr=+m.season;let sg=0;fin().filter(x=>+x.season===yr).forEach(x=>sg+=+(x.stats||{})[id]?.g||0);
  const as=[...new Set((m.links||[]).filter(x=>x&&x.g===id&&x.a&&P(x.a)).map(x=>x.a))];
  const html=hkPost({hd:"Haftanın golü",body:hkPh(id),chip:hkSc(m),pn:hkNm(id)+hkSt([[String(g||1),"Bu maçta gol"],[String(sg||g||1),"Sezonda gol"]])+(as.length?`<div class="hkmini">Asist: ${as.map(a=>esc(shortName(nameOf(a)))).join(", ")}</div>`:""),pnC:as.length?"tall":"",ft:hkMatchFt(m)});
  return{html,cap:`Haftanın golü ${nameOf(id)}'den ⚽🔥\n${igDate(m.date)}\n#abilerkardeslerfc #haftanıngolü #halısaha`,name:"haftanin-golu-"+m.date}}

/* --- maç önü --- */
const hkNext=()=>S.matches.filter(m=>m.state!=="bitti"&&!isExt(m)&&(m.team_a||[]).length&&(m.team_b||[]).length).sort((a,b)=>matchTs(a)-matchTs(b))[0];
const hkWhen=m=>igDate(m.date)+(m.time?" · "+String(m.time).slice(0,5):"");
function hkPreLine(m){const col=k=>hkCol(`${hkCr(m,k,14)}<b>${esc(TRU(nmOf(m,k)))}</b><small>${esc(formLabel(formOf(m,k),posArr(m,k)))}</small>`,lineRows(m,k).map(([id,ep])=>[ep,esc(shortName(nameOf(id))),P(id)?.guest?"MİS":String(ovrOf(id)),"hkov"]));
  const mid=`<div class="hkwhen"><b>${esc(TRU(igDate(m.date)))}</b>${m.time?`<strong>${esc(String(m.time).slice(0,5))}</strong>`:""}<small>${esc(TRU(GUNLER[parseYmd(m.date).getDay()]+(S.settings.field_name?" · "+S.settings.field_name:"")))}</small></div>`;
  const html=hkPost({hd:"Kadrolar açıklandı",max:34,body:hkSB(m,mid)+`<div class="hkkw sb">${col("A")}${col("B")}</div>`,ft:"Maç günü"});
  const ln=k=>plOf(m,k).map(id=>shortName(nameOf(id))).join(", ");
  return{html,cap:`Kadrolar belli oldu! ${hkWhen(m)} 📣\n${nmOf(m,"A")}: ${ln("A")}\n${nmOf(m,"B")}: ${ln("B")}\nSizce kim kazanır? 👇\n#abilerkardeslerfc #halısaha`,name:"kadrolar-aciklandi-"+m.date}}
const hkForm5=id=>{const H=(S.stats[id]?.hist||[]).filter(h=>h.r).slice(-5);return H.length?H.reduce((a,h)=>a+h.r.pts,0)/H.length:null};
function hkDuel(m){const best=k=>plOf(m,k).filter(id=>P(id)&&!P(id).guest).sort((a,b)=>ovrOf(b)-ovrOf(a))[0];const a=best("A"),b=best("B");if(!a||!b)return null;
  const col=(id,k)=>`<div><b>${esc(TRU(shortName(nameOf(id))))}</b><p>${ovrOf(id)} reyting · ${fM(mvOf(id))}<br>Son 5 maç ort. ${fN(hkForm5(id))}</p></div>`;
  const html=hkPost({hd:"Kritik eşleşme",max:38,body:hkPh(a,"duo l")+hkPh(b,"duo r"),chip:`${hkCr(m,"A")}<span>VS</span>${hkCr(m,"B")}`,pnC:"tall",pn:`<div class="hkvs">${col(a,"A")}${col(b,"B")}</div>`,ft:hkWhen(m)});
  return{html,cap:`Kritik eşleşme ⚔️ ${nameOf(a)} vs ${nameOf(b)}\n${hkWhen(m)} · Sizce kim fark yaratır?\n#abilerkardeslerfc #halısaha`,name:"kritik-esleme-"+m.date}}
function hkOut(){const L=S.players.filter(p=>!p.guest&&!p.archived&&UNAVAIL.includes(stOf(p)));if(!L.length)return null;
  const rows=[];for(let i=0;i<Math.min(L.length,8);i+=4)rows.push(L.slice(i,i+4).map(p=>({id:p.id,v:STATUS[stOf(p)].flag,c:"o"})));
  const html=hkPost({c:"inj",hd:"Kadro dışı",body:L.length===1?hkPh(L[0].id):L.length===2?hkPh(L[0].id,"duo l")+hkPh(L[1].id,"duo r"):hkMates(rows,"mid"),pn:`<div class="hkmini big">${L.map(p=>esc(shortName(p.name))+" · "+esc(STATUS[stOf(p)].label)+(p.status?.until?" · "+fmtShort(p.status.until)+"'e kadar":"")).join("<br>")}</div>`,ft:"Bu hafta"});
  return{html,cap:`Bu hafta kadroda olmayanlar 🚑\n${L.map(p=>p.name+" ("+STATUS[stOf(p)].label.toLowerCase()+")").join("\n")}\nGeçmiş olsun! 💜\n#abilerkardeslerfc #halısaha`,name:"kadro-disi"}}

/* --- oyuncu --- */
function hkCard(p){const s=S.stats[p.id]||{};const o=ovrOf(p.id);const{yr,F}=hkSeason();let g=0,a=0,n=0;F.forEach(m=>{const r=S.mInfo[m.id]?.pts?.[p.id];if(r){n++;g+=r.g||0;a+=r.a||0}});
  const lt=ligTable(F);const li=lt.findIndex(x=>x.id===p.id);const age=ageOf(p);
  const html=hkPost({hd:p.name,max:38,body:hkPh(p.id),chip:`<b>${o}</b><span class="hkps">${esc(eposOf(p))}</span>`,chipC:"big",pnC:"tall",
    pn:hkSt([[fM(mvOf(p.id)),"Piyasa değeri"],[age!=null?String(age):"–","Yaş"],[li>=0?(li+1)+".":"–","Ligde"]])+`<div class="hkmini">Sezon ${yr} · ${n} maç${g?" · "+g+" gol":""}${a?" · "+a+" asist":""}</div>`,ft:"Sezon "+yr});
  return{html,cap:`Kartını tanı: ${p.name} 🃏\n${o} reyting · ${fM(mvOf(p.id))}\n#abilerkardeslerfc #halısaha #yelek`,name:"kart-"+p.name}}
function hkValue(p){const m=mvInfo(p.id);if(!m)return null;const d=m.prev!=null?Math.round((m.v-m.prev)*10)/10:0;
  const up=d>0,dn=d<0;const html=hkPost({c:up?"up":dn?"inj":"",hd:up?"Değeri arttı":dn?"Değeri düştü":"Piyasa değeri",body:hkPh(p.id),chip:d?`${up?"▲":"▼"} ${fM(Math.abs(d))}`:fM(m.v),pn:hkNm(p.id)+hkSt([[fM(m.v),"Piyasa değeri"],[String(ovrOf(p.id)),"Reyting"]]),ft:igWeek(lastFinM())});
  return{html,cap:`${p.name} · ${fM(m.v)}${d?` (${up?"▲":"▼"} ${fM(Math.abs(d))})`:""} 📈\n#abilerkardeslerfc #transfer #halısaha`,name:"deger-"+p.name}}
function hkStreak(p){const st=S.stats[p.id]?.streak;if(!st)return null;const s=S.stats[p.id]||{};
  const html=hkPost({c:st.hot?"":"cold",hd:st.hot?"Seri sürüyor":"Kötü seri",body:hkPh(p.id),chip:esc(TRU(st.t)),chipC:"sm",pn:hkNm(p.id)+hkSt([[fN(hkForm5(p.id)),"Son 5 maç ort."],[String(ovrOf(p.id)),"Reyting"]]),ft:igWeek(lastFinM())});
  return{html,cap:`${p.name}: ${st.t} ${st.hot?"🔥":"🥶"}\n#abilerkardeslerfc #halısaha`,name:"seri-"+p.name}}
function hkBadges(p){const B=(S.stats[p.id]?.badges||[]).filter(b=>!b.shame);if(!B.length)return null;
  const html=hkPost({hd:"Rozetler",body:hkPh(p.id),chip:B.length+" rozet",pnC:"tall",pn:hkNm(p.id)+`<div class="hkbd">${B.slice(0,4).map(b=>`<span><i>${esc(b.i)}</i><b>${esc(b.t)}</b><small>${esc(b.d)}</small></span>`).join("")}</div>`,ft:"Sezon "+curYr()});
  return{html,cap:`${p.name}'in rozetleri 🏅\n${B.map(b=>b.t+" ("+b.d+")").join("\n")}\n#abilerkardeslerfc #halısaha`,name:"rozetler-"+p.name}}
function hkCaptain(p){const L=fin().filter(m=>m.cap_a===p.id||m.cap_b===p.id);if(!L.length)return null;const o={G:0,B:0,M:0};
  L.forEach(m=>{const k=m.cap_a===p.id?"A":"B";const my=k==="A"?+m.score_a:+m.score_b,op=k==="A"?+m.score_b:+m.score_a;o[my>op?"G":my<op?"M":"B"]++});
  const html=hkPost({hd:"Kaptan",body:hkPh(p.id),chip:"© "+L.length+" maç",pn:hkNm(p.id)+hkSt([[String(o.G),"Galibiyet"],[String(o.B),"Beraberlik"],[String(o.M),"Mağlubiyet"]]),ft:"Kaptanlık karnesi"});
  return{html,cap:`Kaptan ${p.name} © ${L.length} maçta ${o.G}G ${o.B}B ${o.M}M\n#abilerkardeslerfc #halısaha`,name:"kaptan-"+p.name}}
function hkStatus(p){const st=stOf(p);if(st==="hazir"||st==="belirsiz")return null;const X=STATUS[st];const hd={sakat:"Sakatlandı",hasta:"Hasta",izinli:"İzinde",yogun:"İş yoğun"}[st]||X.label;
  const html=hkPost({c:"inj",hd,body:hkPh(p.id),chip:`✚ ${esc(TRU(X.label))}`,pn:hkNm(p.id)+hkSt([[fM(mvOf(p.id)),"Piyasa değeri"],[p.status?.until?fmtShort(p.status.until):"Belirsiz","Dönüş"]]),ft:"Kadro haberi"});
  return{html,cap:`${p.name} · ${X.label.toLowerCase()}${p.status?.until?", "+fmtShort(p.status.until)+"'e kadar yok":""} 🚑\nGeçmiş olsun! 💜\n#abilerkardeslerfc #halısaha`,name:"durum-"+p.name}}
function hkH2H(p,q){if(!q||q.id===p.id)return null;const{F}=hkSeason();
  const agg=id=>{let n=0,g=0,a=0,s=0;F.forEach(m=>{const r=S.mInfo[m.id]?.pts?.[id];if(r){n++;g+=r.g||0;a+=r.a||0;s+=r.pts}});return{n,g,a,av:n?s/n:null}};const A=agg(p.id),B=agg(q.id);
  const rw=(l,x,y,w)=>`<div class="hkcr2"><b class="${w>0?"w":""}">${x}</b><span>${esc(TRU(l))}</span><b class="${w<0?"w":""}">${y}</b></div>`;const cmp=(x,y)=>(x??-1)-(y??-1);
  const html=hkPost({hd:"Kafa kafaya",body:hkPh(p.id,"duo l")+hkPh(q.id,"duo r"),chip:"<span>VS</span>",pnC:"cmp",
    pn:`<div class="hkcrh"><b>${esc(TRU(shortName(p.name)))}</b><b>${esc(TRU(shortName(q.name)))}</b></div>${rw("Reyting",ovrOf(p.id),ovrOf(q.id),cmp(ovrOf(p.id),ovrOf(q.id)))}${rw("Değer",fM(mvOf(p.id)),fM(mvOf(q.id)),cmp(mvOf(p.id),mvOf(q.id)))}${rw("Gol",A.g,B.g,cmp(A.g,B.g))}${rw("Asist",A.a,B.a,cmp(A.a,B.a))}${rw("Not ort.",fN(A.av),fN(B.av),cmp(A.av,B.av))}`,ft:"Sezon "+curYr()});
  return{html,cap:`Kafa kafaya ⚔️ ${p.name} mi ${q.name} mi?\nYorumlara yaz 👇\n#abilerkardeslerfc #halısaha`,name:"kafa-kafaya"}}

/* --- sezon --- */
function hkMvp(){const{yr,F}=hkSeason();const L=yelekAll(F).filter(o=>o.tot>0);if(!L.length)return null;const t=L.slice(0,3);
  const html=hkPost({hd:F.length>=sLen()?"Sezonun oyuncusu":"Zirve yarışı",max:38,body:(t[1]?hkPh(t[1].id,"side l"):"")+(t[2]?hkPh(t[2].id,"side r"):"")+hkPh(t[0].id),chip:"Sezonun oyuncusu yarışı",chipC:"sm",
    pn:`<div class="hkst3">${[1,0,2].filter(i=>t[i]).map(i=>`<div class="${i===0?"ld":""}"><strong>${fP(t[i].tot)}</strong><small>${i+1} · ${esc(TRU(shortName(nameOf(t[i].id))))}</small></div>`).join("")}</div>`,ft:"Hafta "+F.length+"/"+sLen()});
  return{html,cap:`Sezonun oyuncusu yarışı · Hafta ${F.length} 🏆\n${t.map((o,i)=>(i+1)+". "+nameOf(o.id)+" "+fP(o.tot)).join("\n")}\n#abilerkardeslerfc #halısaha`,name:"zirve-yarisi"}}
function hkMarket(){const L=S.players.filter(p=>!p.guest&&!p.archived).map(p=>{const m=mvInfo(p.id);return m&&m.prev!=null?{p,v:m.v,d:Math.round((m.v-m.prev)*10)/10}:null}).filter(x=>x&&x.d>0).sort((a,b)=>b.d-a.d).slice(0,3);
  if(!L.length)return null;const tot=S.players.filter(p=>!p.guest&&!p.archived).reduce((a,p)=>a+mvOf(p.id),0);
  const html=hkPost({c:"up",hd:"Değeri artanlar",max:38,body:hkPh(L[0].p.id),chip:`▲ ${fM(L[0].d)}`,pnC:"tall",
    pn:`<div class="hkls">${L.map((x,i)=>`<div><b>${i+1} · ${esc(TRU(x.p.name))}</b><span>${fM(x.v)} <em>▲ ${fN1(x.d)}</em></span></div>`).join("")}</div><div class="hkmini">Kadronun toplam değeri ${fM(tot)}</div>`,ft:igWeek(lastFinM())});
  return{html,cap:`Transfer piyasası 📈\n${L.map(x=>x.p.name+" "+fM(x.v)+" (▲ "+fM(x.d)+")").join("\n")}\n#abilerkardeslerfc #transfer #halısaha`,name:"transfer-piyasasi"}}
function hkRiser(){const L=S.players.filter(p=>!p.guest&&!p.archived).map(p=>{const s=S.stats[p.id];const b=s?.series?.[0];return b!=null?{p,b:Math.round(b),o:ovrOf(p.id)}:null}).filter(x=>x&&x.o-x.b>0).sort((a,b)=>(b.o-b.b)-(a.o-a.b)||b.o-a.o);if(!L.length)return null;const x=L[0];
  const html=hkPost({c:"up",hd:"Yükselen yıldız",max:38,body:hkPh(x.p.id),chip:`<b>${x.b}</b><span class="hkar">→</span><b>${x.o}</b>`,chipC:"big",pn:hkNm(x.p.id)+hkSt([["+"+(x.o-x.b),"Reyting artışı"],[String(S.stats[x.p.id]?.games||0),"Maç"]]),ft:"Sezon "+curYr()});
  return{html,cap:`Yükselen yıldız: ${x.p.name} ⬆️ ${x.b} → ${x.o}\n#abilerkardeslerfc #halısaha`,name:"yukselen-yildiz"}}
function hkMonth(){const lm=lastFinM();if(!lm)return null;const k=lm.date.slice(0,7);const F=fin().filter(m=>m.date.slice(0,7)===k).sort((a,b)=>matchTs(a)-matchTs(b));const L=yelekAll(F).filter(o=>o.tot>0);if(!L.length)return null;
  const o=L[0];const ay=["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"][+k.slice(5,7)-1];let g=0,a=0;F.forEach(m=>{const r=S.mInfo[m.id]?.pts?.[o.id];if(r){g+=r.g||0;a+=r.a||0}});
  const html=hkPost({hd:ay+" ayının oyuncusu",max:36,body:hkPh(o.id),chip:F.length+" maç · "+fP(o.tot)+" puan",chipC:"sm",pn:hkNm(o.id)+hkSt([[String(g),"Gol"],[String(a),"Asist"],[String(o.n),"Maç"]]),ft:ay+" "+k.slice(0,4)});
  return{html,cap:`${ay} ayının oyuncusu: ${nameOf(o.id)} 🌟\n#abilerkardeslerfc #ayınoyuncusu #halısaha`,name:"ayin-oyuncusu-"+k}}
function hkDuo(){const{F}=hkSeason();const ids=S.players.filter(p=>!p.guest&&!p.archived).map(p=>p.id);let best=null;
  for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++){let n=0,W=0,D=0;F.forEach(m=>{for(const k of["A","B"]){const T=plOf(m,k);if(T.includes(ids[i])&&T.includes(ids[j])){n++;const my=k==="A"?+m.score_a:+m.score_b,op=k==="A"?+m.score_b:+m.score_a;if(my>op)W++;else if(my===op)D++}}});
    if(n>=2){const sc=(W+D*.5)/n;if(!best||sc>best.sc||(sc===best.sc&&n>best.n))best={a:ids[i],b:ids[j],n,W,D,L:n-W-D,sc}}}
  if(!best)return null;const du=Object.entries(S.duo||{}).filter(([k])=>k.split(">").every(id=>P(id)&&!P(id).guest)).sort((x,y)=>y[1]-x[1])[0];
  const html=hkPost({hd:"En iyi ikili",body:hkPh(best.a,"duo l")+hkPh(best.b,"duo r"),chip:`%${Math.round(best.W/best.n*100)} galibiyet`,chipC:"sm",pnC:du?"tall":"",
    pn:`<b class="hknm">${esc(TRU(shortName(nameOf(best.a))))} + ${esc(TRU(shortName(nameOf(best.b))))}</b>${hkSt([[String(best.n),"Birlikte maç"],[best.W+"-"+best.D+"-"+best.L,"G-B-M"]])}${du?`<div class="hkmini">En golcü ikili: ${esc(shortName(nameOf(du[0].split(">")[0])))} → ${esc(shortName(nameOf(du[0].split(">")[1])))} · ${du[1]} gol</div>`:""}`,ft:"Sezon "+curYr()});
  return{html,cap:`En iyi ikili 🤝 ${nameOf(best.a)} & ${nameOf(best.b)}\nBirlikte ${best.n} maç, ${best.W} galibiyet\n#abilerkardeslerfc #halısaha`,name:"en-iyi-ikili"}}
function hkLoyal(){const{F}=hkSeason();if(!F.length)return null;const c={};F.forEach(m=>plAll(m).forEach(id=>{if(P(id)&&!P(id).guest&&!P(id).archived)c[id]=(c[id]||0)+1}));
  const E=Object.entries(c).sort((a,b)=>b[1]-a[1]);const full=E.filter(x=>x[1]===F.length);const L=(full.length?full:E.slice(0,4)).slice(0,8);
  const rows=[];for(let i=0;i<L.length;i+=4)rows.push(L.slice(i,i+4).map(([id,n])=>({id,v:n+"/"+F.length})));
  const html=hkPost({hd:full.length?"Hiç kaçırmadı":"En istikrarlılar",body:hkMates(rows,"mid"),pn:`<div class="hkmini big">${full.length?F.length+" maçın hepsine gelen "+full.length+" oyuncu":"Sezonun en çok gelenleri"}${(full.length?full:[]).length>8?"<br>"+full.slice(8).map(([id])=>esc(shortName(nameOf(id)))).join(", ")+" de her maçtaydı":""}</div>`,ft:"Hafta "+F.length+"/"+sLen()});
  return{html,cap:`${full.length?"Hiç maç kaçırmayanlar":"En istikrarlılar"} 💪\n${L.map(([id])=>nameOf(id)).join(", ")}\n#abilerkardeslerfc #halısaha`,name:"devamlilik"}}
function hkMid(){const{yr,F}=hkSeason();if(F.length<3)return null;const lt=ligTable(F);const ag=yrAgg(F);const mv=yelekAll(F).filter(o=>o.tot>0)[0];
  const rows=[["Lider",lt[0]&&lt[0].id,lt[0]?lt[0].p+" puan":""],["Gol kralı",ag.g?.id,ag.g?ag.g.v+" gol":""],["Asist kralı",ag.a?.id,ag.a?ag.a.v+" asist":""],["Sezonun oyuncusu",mv?.id,mv?fP(mv.tot)+" puan":""]].filter(r=>r[1]);
  const html=hkPost({hd:"Ara karne",body:mv?hkPh(mv.id):"",pnC:"tall",pn:`<div class="hkls">${rows.map(([l,id,v])=>`<div><b>${esc(TRU(l))} · ${esc(TRU(shortName(nameOf(id))))}</b><span>${esc(v)}</span></div>`).join("")}</div>`,ft:"Sezon "+yr+" · Hafta "+F.length+"/"+sLen()});
  return{html,cap:`Sezon ${yr} ara karnesi 📊\n${rows.map(([l,id,v])=>l+": "+nameOf(id)+" ("+v+")").join("\n")}\n#abilerkardeslerfc #halısaha`,name:"ara-karne"}}
function hkPosRace(k){const{F}=hkSeason();const R=yelekRace(F)[k]||[];const L=R.filter(o=>o.tot>0).slice(0,3);if(!L.length)return null;const aw=POS_AW.find(x=>x[0]===k);
  const hd={FV:"Sezonun forveti",OS:"Sezonun orta sahası",DF:"Sezonun defansı",KL:"Altın eldiven"}[k];
  const html=hkPost({hd,max:38,body:(L[1]?hkPh(L[1].id,"side l"):"")+(L[2]?hkPh(L[2].id,"side r"):"")+hkPh(L[0].id),chip:esc(TRU(aw[3]))+" yarışı",chipC:"sm",
    pn:`<div class="hkst3">${[1,0,2].filter(i=>L[i]).map(i=>`<div class="${i===0?"ld":""}"><strong>${fP(L[i].tot)}</strong><small>${i+1} · ${esc(TRU(shortName(nameOf(L[i].id))))}</small></div>`).join("")}</div>`,ft:"Hafta "+F.length+"/"+sLen()});
  return{html,cap:`${hd} yarışı ${aw[2]}\n${L.map((o,i)=>(i+1)+". "+nameOf(o.id)+" "+fP(o.tot)).join("\n")}\n#abilerkardeslerfc #halısaha`,name:"yaris-"+k}}
function hkFinal(){const n=[...seasonsAll()].reverse().find(x=>seasonDone(x));if(n==null)return null;const w=seasonAwards(n);if(!w||!w.champ)return null;
  const rows=[["Gol kralı",w.g?.id,w.g?w.g.v+" gol":""],["Asist kralı",w.a?.id,w.a?w.a.v+" asist":""],["Sezonun oyuncusu",w.mvp?.id,w.mvp?fP(w.mvp.tot)+" puan":""],["Altın eldiven",w.pos?.KL?.id,w.pos?.KL?fP(w.pos.KL.tot)+" puan":""]].filter(r=>r[1]);
  const html=hkPost({hd:"Şampiyon",body:hkPh(w.champ.id),chip:`🏆 Sezon ${n} · ${w.champ.p} puan`,chipC:"sm",pnC:"tall",pn:hkNm(w.champ.id)+`<div class="hkls">${rows.map(([l,id,v])=>`<div><b>${esc(TRU(l))} · ${esc(TRU(shortName(nameOf(id))))}</b><span>${esc(v)}</span></div>`).join("")}</div>`,ft:"Sezon "+n+" finali"});
  return{html,cap:`Sezon ${n} şampiyonu: ${nameOf(w.champ.id)} 🏆\n${rows.map(([l,id,v])=>l+": "+nameOf(id)).join("\n")}\n#abilerkardeslerfc #şampiyon #halısaha`,name:"sezon-"+n+"-finali"}}

const PM_ITEMS={
  once:[["kadro","Kadrolar açıklandı"],["duel","Kritik eşleşme"],["out","Kadro dışı"]],
  mac:[["skor","Maç sonucu"],["motm","Maçın adamı"],["totw","Haftanın takımı"],["gol","Haftanın golü"],["fiy","Fiyasko"],["kadro","Not karnesi"]],
  oyuncu:[["kart","Kartını tanı"],["deger","Piyasa değeri"],["seri","Seri"],["rozet","Rozetler"],["kaptan","Kaptanlık"],["durum","Sakatlık / durum"],["h2h","Kafa kafaya"]],
  sezon:[["mvp","Zirve yarışı"],["piyasa","Değeri artanlar"],["yildiz","Yükselen yıldız"],["ay","Ayın oyuncusu"],["ikili","En iyi ikili"],["sadik","Hiç kaçırmayanlar"],["karne","Ara karne"],["yaris","Mevki yarışı"],["final","Sezon finali"]]};
const PM_EMPTY={once:"Sıradaki maçın takımları henüz kurulmadı.",out:"Şu an sakat, hasta ya da izinli oyuncu yok.",seri:"Bu oyuncunun şu an süren bir serisi yok.",rozet:"Bu oyuncunun henüz rozeti yok.",kaptan:"Bu oyuncu henüz kaptanlık yapmadı.",durum:"Bu oyuncu şu an hazır görünüyor; durumu sakat, hasta ya da izinli yapılınca bu gönderi açılır.",h2h:"Karşılaştırmak için ikinci bir oyuncu seç.",karne:"Ara karne en az 3 maç oynandıktan sonra hazırlanır.",final:"Sezon finali, sezon bitince hazırlanır."};
function pmPlayers(){return S.players.filter(p=>!p.guest&&!p.archived).sort((a,b)=>a.name.localeCompare(b.name,"tr"))}
function igBuild(){const f=S.f.pm||(S.f.pm={tab:"mac",fmt:"post"});const ms=fin().slice().sort((a,b)=>matchTs(b)-matchTs(a));const m=S.matches.find(x=>x.id===f.mid&&x.state==="bitti")||ms[0];
  const k=f.item||PM_ITEMS[f.tab][0][0];
  if(f.tab==="mac"){if(!m)return null;return({skor:hkScore,motm:hkMotm,totw:hkTotw,gol:hkGoal,fiy:hkFiy,kadro:hkLineup}[k]||hkScore)(m)}
  if(f.tab==="once"){if(k==="out")return hkOut();const n=hkNext();if(!n)return null;return k==="duel"?hkDuel(n):hkPreLine(n)}
  if(f.tab==="oyuncu"){const p=P(f.pid||S.me)||pmPlayers()[0];if(!p)return null;
    if(k==="h2h"){const q=P(f.pid2)||pmPlayers().filter(x=>x.id!==p.id&&posOf(x)===posOf(p)).sort((a,b)=>ovrOf(b.id)-ovrOf(a.id))[0];return hkH2H(p,q)}
    return({kart:hkCard,deger:hkValue,seri:hkStreak,rozet:hkBadges,kaptan:hkCaptain,durum:hkStatus}[k]||hkCard)(p)}
  if(f.tab==="sezon"){if(k==="yaris")return hkPosRace(f.race||"FV");return({mvp:hkMvp,piyasa:hkMarket,yildiz:hkRiser,ay:hkMonth,ikili:hkDuo,sadik:hkLoyal,karne:hkMid,final:hkFinal}[k]||hkMvp)()}
  return null}
const igFrame=(x,fmt)=>fmt==="story"?`<div class="hkstory"><div class="hksth">${IGLOGO}<b>ABİLER KARDEŞLER FC</b></div>${x.html}</div>`:x.html;
function sheetPM(){if(!canPM())return"";const f=S.f.pm||(S.f.pm={tab:"mac",fmt:"post"});if(!PM_ITEMS[f.tab])f.tab="mac";const ms=fin().slice().sort((a,b)=>matchTs(b)-matchTs(a));
  const tabs=[["once","Maç önü"],["mac","Maç"],["oyuncu","Oyuncu"],["sezon","Sezon"]];const items=PM_ITEMS[f.tab];
  const it=f.item&&items.some(x=>x[0]===f.item)?f.item:items[0][0];f.item=it;
  const pOpt=(sel,ex)=>pmPlayers().filter(p=>p.id!==ex).map(p=>`<option value="${esc(p.id)}"${p.id===sel?" selected":""}>${esc(p.name)}</option>`).join("");
  let sel="";if(f.tab==="mac"){const mid=f.mid||(ms[0]&&ms[0].id);sel=`<select class="pmsel" data-bind="pm.mid" aria-label="Maç">${ms.map(m=>`<option value="${esc(m.id)}"${m.id===mid?" selected":""}>${fmtShort(m.date)} · ${esc(nmOf(m,"A"))} ${m.score_a}–${m.score_b} ${esc(nmOf(m,"B"))}</option>`).join("")}</select>`}
  if(f.tab==="oyuncu"){const pid=f.pid||S.me||pmPlayers()[0]?.id;sel=`<select class="pmsel" data-bind="pm.pid" aria-label="Oyuncu">${pOpt(pid)}</select>`;
    if(it==="h2h"){const p=P(pid);const q2=f.pid2||pmPlayers().filter(x=>x.id!==pid&&p&&posOf(x)===posOf(p)).sort((a,b)=>ovrOf(b.id)-ovrOf(a.id))[0]?.id;sel+=`<select class="pmsel" data-bind="pm.pid2" aria-label="Rakip oyuncu">${pOpt(q2,pid)}</select>`}}
  if(f.tab==="sezon"&&it==="yaris")sel=`<div class="vtog pmr">${[["FV","Forvet"],["OS","Orta saha"],["DF","Defans"],["KL","Kaleci"]].map(([k,l])=>`<button data-act="pmRace" data-v="${k}" class="${(f.race||"FV")===k?"on":""}">${l}</button>`).join("")}</div>`;
  if(f.tab==="once"){const n=hkNext();sel=n?`<p class="muted small" style="margin:0 0 10px">Sıradaki maç: ${fmtShort(n.date)} · ${esc(nmOf(n,"A"))} – ${esc(nmOf(n,"B"))}</p>`:""}
  const x=igBuild();const emp=PM_EMPTY[it]||(f.tab==="once"&&it!=="out"?PM_EMPTY.once:"Bunun için henüz yeterli veri yok.");
  return `<div class="ch"><div><div class="eyebrow">${IGH}</div><h2>Paylaşım merkezi</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
   <div class="vtog pmt">${tabs.map(([k,l])=>`<button data-act="pmTab" data-v="${k}" class="${f.tab===k?"on":""}">${l}</button>`).join("")}</div>${sel}
   <div class="pmi">${items.map(([k,l])=>`<button data-act="pmItem" data-v="${k}" class="${it===k?"on":""}">${l}</button>`).join("")}</div>
   ${x?`<div class="vtog pmf"><button data-act="pmFmt" data-v="post" class="${f.fmt!=="story"?"on":""}">Gönderi 4:5</button><button data-act="pmFmt" data-v="story" class="${f.fmt==="story"?"on":""}">Hikâye 9:16</button></div>
   <div class="pmprev" id="pmPrev">${igFrame(x,f.fmt)}</div>
   <div class="pmcap"><div class="pmch"><span>AÇIKLAMA</span><button class="btn sm ghost" data-act="pmCopy">Kopyala</button></div><textarea id="pmCap" rows="4" readonly>${esc(x.cap)}</textarea></div>
   <div class="row" style="gap:8px"><button class="btn block" data-act="pmGo" data-v="save">Kaydet</button><button class="btn primary block" data-act="pmGo" data-v="share">${IG_SVG} Paylaş</button></div>`
   :`<p class="muted small pmemp">${esc(emp)}</p>`}`}
let _h2c=null;const h2c=()=>_h2c||(_h2c=new Promise((ok,no)=>{if(window.html2canvas)return ok(window.html2canvas);const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";s.onload=()=>ok(window.html2canvas);s.onerror=()=>{_h2c=null;no(new Error("yüklenemedi"))};document.head.appendChild(s)}));
function trUp(root){const L=[...root.querySelectorAll("*")].filter(e=>getComputedStyle(e).textTransform==="uppercase");L.forEach(e=>{for(const n of e.childNodes)if(n.nodeType===3)n.nodeValue=n.nodeValue.toLocaleUpperCase("tr")});L.forEach(e=>e.style.textTransform="none")}
async function pmGo(mode){const x=igBuild();if(!x)return;const f=S.f.pm;toast("Görsel hazırlanıyor…");
  let h;try{h=await h2c()}catch(_){toast("Görsel aracı yüklenemedi, bağlantını kontrol et");return}
  const box=document.createElement("div");box.className="igrender";box.innerHTML=igFrame(x,f.fmt);document.body.appendChild(box);
  try{await document.fonts?.ready;const el=box.firstElementChild;trUp(el);const c=await h(el,{scale:1080/el.offsetWidth,backgroundColor:null,useCORS:true,logging:false});
    const fn="abilerkardeslerfc-"+x.name+(f.fmt==="story"?"-hikaye":"")+".png";
    if(mode==="save"){c.toBlob(b=>{if(!b){toast("Görsel oluşturulamadı");return}const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download=fn;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),5000);toast("Görsel kaydedildi")},"image/png")}
    else shareCanvas(c,fn,"Abiler Kardeşler FC")}catch(e){toast("Görsel oluşturulamadı")}finally{box.remove()}}

function sheetShare(){const m=S.matches.find(x=>x.id===S.sheet.mid);if(!m)return"";return inM(m,()=>{const M=esc(m.id);const done=m.state==="bitti";const inf=S.mInfo[m.id]||{};
  const it=(act,ic,t,d)=>`<button class="shi" data-act="${act}" data-id="${M}"><span class="shic">${ic}</span><span class="sht"><b>${t}</b><small>${d}</small></span><span class="shx">›</span></button>`;
  return `<div class="ch"><div><div class="eyebrow">${fmtShort(m.date)} · ${esc(TEAM.A)} – ${esc(TEAM.B)}</div><h2>Paylaş</h2></div><button class="btn sm" data-act="close">Kapat</button></div><div class="shl">
    ${done?it("storyRes","⚽","Maç sonucu","Skor, gol atanlar ve Maçın Adamı"):""}
    ${done&&inf.motm?it("storyMotm","★","Maçın Adamı","Büyük fotoğraf, not ve istatistikler"):""}
    ${done&&inf.totw&&inf.totw.length?it("storyTotw","XI","Haftanın Takımı","En iyi 7 oyuncu ve notları"):""}
    ${(m.team_a||[]).length?it("shareImg","▦","Kadro ve diziliş","İki takım sahada"):""}</div>`})}
function sheetHtml(){const em=S.sheet&&S.sheet.type==="eval"&&S.matches.find(x=>x.id===S.sheet.mid);return em?inM(em,_sheetHtml):_sheetHtml()}
function _sheetHtml(){const t=S.sheet.type;if(t==="eval"){const m=S.matches.find(x=>x.id===S.sheet.mid);const ev=m&&S.f["ev_"+m.id];if(!m||!S.admin||!ev)return"";
    return `<div class="ch"><div><div class="eyebrow">Maç değerlendirmesi · ${fmtShort(m.date)}</div><h2>${TEAM.A} ${m.score_a} – ${m.score_b} ${TEAM.B}</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
      <p class="muted small">Gol, asist ve skor değişmez; sadece değerlendirme, penaltı ve çizgiden çıkarma kaydedilir.</p>${perfBlock(m,ev,"ev_"+m.id)}
      <button class="btn primary block" data-act="saveEval" data-id="${esc(m.id)}">${ICON.check} Kaydet, kartları güncelle</button>`}
  if(t==="mng"){const m=S.matches.find(x=>x.id===S.sheet.mid);if(!m||!S.admin)return"";const M=esc(m.id);
    return `<div class="ch"><div><div class="eyebrow">Yönetici · ${fmtShort(m.date)}</div><h2>${esc(nmOf(m,"A"))} ${m.score_a} – ${m.score_b} ${esc(nmOf(m,"B"))}</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
      ${namesForm(m)}
      <div class="mngl"><button class="btn block" data-act="evalOpen" data-id="${M}">Değerlendirmeyi düzenle<small>çok iyi / iyi / orta / kötü, penaltı, çizgi</small></button>
      <button class="btn block" data-act="reopen" data-id="${M}">Skoru, golleri ve ödülleri düzelt<small>maç kayıt ekranı açılır, kaydedince kartlar yeniden hesaplanır</small></button>
      <button class="btn block ghost danger" data-act="delMatch" data-id="${M}">${S.f.delMatch===m.id?"Silmek için tekrar bas":"Maçı sil"}</button></div>`}
  if(t==="stats"){const m=S.matches.find(x=>x.id===S.sheet.mid);return m&&S.admin&&(m.state==="takim"||m.state==="bitti")?inM(m,()=>statEntry(m)):""}
  if(t==="rules")return `<div class="ch"><h2>Puanlama</h2><button class="btn sm" data-act="close">Kapat</button></div>`+viewKurallar(true);
  if(t==="share")return sheetShare();if(t==="pm")return sheetPM();
  return t==="hos"?sheetHos():t==="login"?sheetLogin():t==="player"?sheetPlayer():t==="me"?(isMember()&&!S.admin?"":sheetMe()):t==="add"?sheetAdd():t==="cmp"?sheetCmp():t==="ext"?sheetExt():""}

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
const lastFinM=()=>S.matches.filter(x=>x.state==="bitti"&&!isExt(x)).sort((a,b)=>matchTs(b)-matchTs(a))[0];
const lastTotw=()=>{const m=lastFinM();return m&&S.mInfo[m.id]?S.mInfo[m.id].totw||[]:[]};
function card(p,big){
  const s=S.stats[p.id]||{ovr:baseOf(p),attrs:p.attrs||{},lastD:0};const st=stOf(p);const o=s.ovr;
  const tr=s.lastO>0?`<span class="trend up">▲${s.lastO}</span>`:s.lastO<0?`<span class="trend down">▼${-s.lastO}</span>`:`<span class="trend">&nbsp;</span>`;
  const at=attrSet(p.pos).map(([k,l])=>{const dd=s.attrD?.[k]||0;const av=+(s.attrs?.[k])||0;return `<span style="--v:${Math.max(0,Math.min(100,av))}"><b>${s.attrs?.[k]??"–"}</b>${l}${dd?`<i class="ad ${dd>0?"up":"dn"}">${dd>0?"▲":"▼"}</i>`:""}</span>`}).join("");const ph=photoOf(p.id);
  const x=STATUS[st];const flag=st!=="hazir"?`<span class="flag ${x.cls==="bad"?"":x.cls}">${x.cls==="bad"?"✚ ":""}${x.flag}</span>`:"";
  const tw=lastTotw().includes(p.id);const chp=reigningChamp()===p.id;const cls=(s.lastO>0?" rise":s.lastO<0?" fall":"")+(tw?" totw":"")+(chp?" champ":"")+(!big&&S.me===p.id?" me":"")+(big?anim("fb_"+p.id)+(s.lastO>0&&!ANIM.has("pop_"+p.id)?(ANIM.add("pop_"+p.id)," pop"):""):"");
  return `<button class="fut ${tierOf(o)}${UNAVAIL.includes(st)?" out":""}${big?" big":""}${cls}" ${big?'tabindex="-1"':`data-act="open" data-id="${esc(p.id)}"`} aria-label="${esc(p.name)} kartı, reyting ${o}">
    <span class="face"><span class="tl"><span class="ovr num">${o}</span><span class="ps">${eposOf(p)}</span>${tr}${p.guest?"":p.yedek?'<span class="sq">YEDEK</span>':'<span class="sq as">AS</span>'}</span>
    ${chp?'<span class="chb" title="Son şampiyon">🏆</span>':""}<span class="stripe"></span>${tw?'<span class="xi">XI</span>':""}<span class="pic">${ph?`<img src="${esc(ph)}" alt="">`:SIL}</span><span class="nm">${esc(up(shortName(p.name)))}</span><span class="at">${at}</span>${BALL}</span>${flag}</button>`;
}
function stChip(p){const st=stOf(p);if(st==="hazir")return"";const x=STATUS[st];const u=p.status?.until?" · "+fmtShort(p.status.until)+"'e kadar":"";return`<span class="chip ${x.cls}"><span class="dot"></span>${x.label}${u}</span>`}

/* ================= Maç sekmesi ================= */
const openMatch=()=>S.matches.filter(m=>m.state!=="bitti"&&!isExt(m)).sort((a,b)=>matchTs(a)-matchTs(b))[0];
function viewMac(){
  if(!S.players.length)return `<section class="card"><div class="empty"><h3>Önce kadroyu kur</h3><p>${S.admin?"Kartlar sekmesinden oyuncuları ekle.":"Yönetici oyuncuları ekleyince maçlar burada görünür."}</p>${S.admin?'<button class="btn primary" data-act="tab" data-tab="kartlar">Oyuncu ekle</button>':""}</div></section>`;
  const om=openMatch();let h=om?hero(om)+matchBody(om):(S.admin?createHero():noMatchHero());
  return h;
}
function lastCard(m,...r){return inM(m,()=>_lastCard(m,...r))}
function _lastCard(m){const inf=S.mInfo[m.id]||{pts:{}};const sa=+m.score_a||0,sb=+m.score_b||0;const M=esc(m.id);const mo=inf.motm;const r=mo&&inf.pts[mo];
  return `<section class="card lastc"><div class="ch"><div><div class="eyebrow">Son maç · ${fmtShort(m.date)}</div></div><button class="btn sm" data-act="viewm" data-id="${M}">Maç detayı ›</button></div>
    <button class="lcs" data-act="viewm" data-id="${M}"><span class="lt${sa>sb?" win":""}"><span class="bibdot"></span>${esc(TEAM.A)}</span><b class="num">${sa} - ${sb}</b><span class="lt${sb>sa?" win":""}"><span class="nobib"></span>${esc(TEAM.B)}</span></button>
    ${mo?`<div class="lcm"><span class="muted small">★ Maçın Adamı</span><b>${esc(nameOf(mo))}</b>${r?`<span class="nt ${noteCls(r.pts)}">${fN(r.pts)}</span>`:""}</div>`:""}
    </section>`}
function extRes(m){const a=+m.score_a||0,b=+m.score_b||0;return a>b?"G":a<b?"M":"B"}
function rivalCard(E){if(!E.length)return"";const t={};for(const m of E){const k=(m.opponent||"Rakip").trim();const o=t[k]||(t[k]={n:0,G:0,B:0,M:0,at:0,ye:0,last:null});o.n++;o[extRes(m)]++;o.at+=+m.score_a||0;o.ye+=+m.score_b||0;o.last=m.date}
  const all={G:0,B:0,M:0};E.forEach(m=>all[extRes(m)]++);
  return `<section class="card"><div class="ch"><h2>Rakiplere karşı</h2><span class="rec"><span class="g">${all.G}G</span><span class="b">${all.B}B</span><span class="m">${all.M}M</span></span></div>
    <div class="scroll-x"><table class="tbl"><thead><tr><th>Rakip</th><th>Maç</th><th>G-B-M</th><th>Gol</th></tr></thead><tbody>${Object.entries(t).sort((x,y)=>y[1].n-x[1].n).map(([k,o])=>`<tr><td><b>${esc(k)}</b></td><td>${o.n}</td><td>${o.G}-${o.B}-${o.M}</td><td>${o.at}–${o.ye}</td></tr>`).join("")}</tbody></table></div></section>`}
function extPanel(m){const st=m.stats||{};const T=m.team_a||[];const us=+m.score_a||0,them=+m.score_b||0;const r=extRes(m);
  const sc=T.filter(id=>+st[id]?.g).sort((x,y)=>st[y].g-st[x].g).map(id=>`${esc(nameOf(id))}${+st[id].g>1?" ×"+st[id].g:""}`).join(", ");
  const as=T.filter(id=>+st[id]?.a).sort((x,y)=>st[y].a-st[x].a).map(id=>`${esc(nameOf(id))}${+st[id].a>1?" ×"+st[id].a:""}`).join(", ");
  return `<section class="card"><div class="ch"><div><div class="eyebrow">Dış maç</div><h2>${fmtDate(m.date)}</h2></div>${S.admin?`<div class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn ghost sm" data-act="extEdit" data-id="${esc(m.id)}">Düzelt</button><button class="btn ghost sm danger" data-act="delMatch" data-id="${esc(m.id)}">${S.f.delMatch===m.id?"Emin misin?":"Sil"}</button></div>`:""}</div>
    <div class="sb"><div class="t${us>them?" win":""}"><span class="tn">${esc(S.settings.group_name)}</span><span class="sc num">${us}</span></div><span class="dash">–</span><div class="t${them>us?" win":""}"><span class="tn">${esc(m.opponent||"Rakip")}</span><span class="sc num">${them}</span></div></div>
    <div class="awards"><div class="aw motm"><span>Maçın Adamı</span><b>${m.motm?esc(shortName(nameOf(m.motm))):"—"}</b></div><div class="aw"><span>Sonuç</span><b>${r==="G"?"Galibiyet":r==="M"?"Mağlubiyet":"Beraberlik"}</b></div></div>
    ${sc?`<div><span class="eyebrow">Goller</span><p>${sc}</p></div>`:""}${as?`<div><span class="eyebrow">Asistler</span><p>${as}</p></div>`:""}
    <div><span class="eyebrow">Kadro · ${T.length} kişi</span><div class="bench" style="margin-top:6px">${T.map(id=>`<button class="tp" data-act="open" data-id="${esc(id)}"><span class="n">${esc(nameOf(id))}</span><span class="small muted">${P(id)&&!P(id).guest?eposOf(P(id)):"MİS"}</span></button>`).join("")}</div></div></section>`}
function viewGecmis(){
  const F=[...fin(),...extFin()].filter(inYr).sort((a,b)=>matchTs(b)-matchTs(a));const E=extFin();
  if(S.view){const vm=F.find(m=>m.id===S.view);if(vm){const i=F.indexOf(vm);
    return `<div class="row" style="justify-content:space-between"><button class="btn ghost sm" data-act="back">${ICON.back} Fikstür</button><span class="row" style="gap:6px">${F[i+1]?`<button class="btn sm" data-act="viewm" data-id="${esc(F[i+1].id)}" aria-label="Önceki maç">‹ Önceki</button>`:""}${F[i-1]?`<button class="btn sm" data-act="viewm" data-id="${esc(F[i-1].id)}" aria-label="Sonraki maç">Sonraki ›</button>`:""}</span></div>`+(isExt(vm)?extPanel(vm):resultPanel(vm))}}
  let h=`${S.admin?`<div class="ph kph"><button class="btn sm primary" data-act="extNew" style="margin-left:auto">${ICON.plus} Dış maç</button></div>`:""}`;
  h+=rivalCard(E);
  // fikstür hikâye şeridi kaldırıldı; maç hikâyesi yalnızca maç detayında
  if(!F.length&&!openMatch())return h+`<section class="card"><div class="empty"><h3>İlk düdük bekleniyor</h3><p>İlk maçı gir, kartlar uyansın. Oynanan her maç burada birikir.</p></div></section>`;
  const om=openMatch();let cur="";h+=`<div class="glist">`;
  if(om){const d=parseYmd(om.date);const t0=new Date();t0.setHours(0,0,0,0);const dd=Math.round((d-t0)/864e5);
    const left=dd<=0?"Bugün":dd===1?"Yarın":dd+" gün kaldı";const wk=Math.min(seasonCount(curYr())+1,sLen());
    const cap=k=>{const id=k==="A"?om.cap_a:om.cap_b;const ok=id&&P(id);const ph=ok&&photoOf(id);
      return `<span class="btkt"><span class="btkc">${ok?(ph?`<img src="${esc(ph)}" alt="">`:`<i>${esc(initials(nameOf(id)))}</i>`):crest(nmOf(om,k),k,52,nmOf(om,k==="A"?"B":"A"))}</span><b>${esc(nmOf(om,k))}</b>${ok?`<small>KPT · ${esc(shortName(nameOf(id)))}</small>`:""}</span>`};
    const side=om.state!=="kayit"&&S.me&&playSide(om,S.me);
    const info=om.state==="kayit"?"Kadrolar henüz açıklanmadı":side?`Kadrolar belli · Takımın ${esc(nmOf(om,side))}`:"Kadrolar belli";
    h+=`<div class="gm">Sıradaki maç</div><button class="bltk" data-act="tab" data-tab="mac"><span class="btkh"><span>Hafta ${wk}</span><span>${esc(S.settings.field_name||"")}</span></span>
      <span class="btkm">${cap("A")}<span class="btkv"><small>${GKISA[d.getDay()]} ${d.getDate()} ${AYLAR[d.getMonth()].slice(0,3).toLocaleUpperCase("tr")}</small><b>${esc(String(om.time||"").slice(0,5))}</b></span>${cap("B")}</span>
      <span class="btkf"><span>${info}</span><em>${left}</em></span></button>`}
  for(const m of F){const d=parseYmd(m.date);const mk=AYLAR[d.getMonth()]+" "+d.getFullYear();if(mk!==cur){h+=`<div class="gm">${mk}</div>`;cur=mk}
    const i=S.mInfo[m.id]||{};const sa=+m.score_a||0,sb=+m.score_b||0;const st=m.stats||{};const ext=isExt(m);
    const sc=k=>(k==="A"?m.team_a:m.team_b||[]).filter(id=>+st[id]?.g).map(id=>firstName(nameOf(id))+(+st[id].g>1?" ×"+st[id].g:"")).join(", ");
    const me=S.me&&playSide(m,S.me);const myRes=me?((me==="A"?sa-sb:sb-sa)>0?"G":(me==="A"?sa-sb:sb-sa)<0?"M":"B"):"";
    const nA=ext?esc(S.settings.group_name):`<span class="bibdot"></span>${esc(nmOf(m,"A"))}`,nB=ext?esc(m.opponent||"Rakip"):`<span class="nobib"></span>${esc(nmOf(m,"B"))}`;
    const motm=ext?m.motm:i.motm;
    const nA2=ext?esc(S.settings.group_name):esc(nmOf(m,"A")),nB2=ext?esc(m.opponent||"Rakip"):esc(nmOf(m,"B"));
    const tr=(k,n,v,w)=>`<span class="frr${w?" w":""}">${ext?(k==="A"?`<span class="frx">${IGLOGO}</span>`:`<span class="frx o"></span>`):crest(nmOf(m,k),k,20,nmOf(m,k==="A"?"B":"A"))}<span class="frn">${n}</span><b class="num">${v}</b></span>`;
    h+=`<button class="frs ${myRes||"none"}${ext?" ext":""}" data-act="viewm" data-id="${esc(m.id)}"><span class="frd"><b>${d.getDate()}</b><small>${GKISA[d.getDay()]}</small></span>
      <span class="frt">${ext?`<span class="xchip">Dış maç</span>`:""}${tr("A",nA2,sa,sa>=sb)}${tr("B",nB2,sb,sb>=sa)}</span>${myRes?`<span class="frp ${myRes}">${{G:"Galibiyet",B:"Berabere",M:"Mağlubiyet"}[myRes]}</span>`:`<span class="frp none" aria-hidden="true"></span>`}</button>`}
  return h+`</div>`}
function sheetExt(){if(!S.admin)return"";const f=S.f.ext;if(!f)return"";const ps=[...S.players,...S.guests];const opps=[...new Set(extFin().map(m=>m.opponent).filter(Boolean))];
  const inT=id=>f.team.includes(id);const stp2=(id,k,l)=>{const v=(f.stats[id]||{})[k]||0;return `<span class="stp${v?" on":""}"><label>${l}</label><button data-act="extSt" data-p="${esc(id)}" data-k="${k}" data-d="-1" aria-label="${l} azalt">−</button><b>${v}</b><button data-act="extSt" data-p="${esc(id)}" data-k="${k}" data-d="1" aria-label="${l} artır">+</button></span>`};
  return `<div class="ch"><div><div class="eyebrow">Dış maç</div><h2>${f.id?"Maçı düzelt":"Dış maç ekle"}</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
    <div class="grid2"><label class="f" for="exDate">Tarih<input id="exDate" type="date" data-bind="ext.date" value="${esc(f.date)}"></label>
    <label class="f" for="exOpp">Rakip ekip<input id="exOpp" type="text" maxlength="40" list="oppList" data-bind="ext.opp" value="${esc(f.opp)}" placeholder="Örn. Muhasebe FC" autocomplete="off"><datalist id="oppList">${opps.map(o=>`<option value="${esc(o)}">`).join("")}</datalist></label></div>
    <div class="scoreEdit"><div class="se"><span class="tn">${esc(S.settings.group_name)}</span><span class="big num">${f.us}</span><span class="pm"><button class="rnd" data-act="extSc" data-k="us" data-d="-1" aria-label="Skoru azalt">−</button><button class="rnd" data-act="extSc" data-k="us" data-d="1" aria-label="Skoru artır">+</button></span></div><span class="dash">–</span>
      <div class="se"><span class="tn">${esc(f.opp||"Rakip")}</span><span class="big num">${f.them}</span><span class="pm"><button class="rnd" data-act="extSc" data-k="them" data-d="-1" aria-label="Rakip skorunu azalt">−</button><button class="rnd" data-act="extSc" data-k="them" data-d="1" aria-label="Rakip skorunu artır">+</button></span></div></div>
    <div><span class="eyebrow">Kadro · ${f.team.length} kişi</span><div class="chipsP" style="margin-top:8px">${ps.slice().sort((a,b)=>byPos(a.id,b.id)).map(p=>`<button class="pk${inT(p.id)?" on":""}" data-act="extPick" data-p="${esc(p.id)}">${avatar(p,"xs")}<span>${esc(shortName(p.name))}</span></button>`).join("")}</div></div>
    ${f.team.length?`<div class="tblock"><span class="eyebrow">Gol ve asist</span>${f.team.map(id=>`<div class="srow"><div class="who"><b>${esc(nameOf(id))}</b></div><div class="steps">${stp2(id,"g","GOL")}${stp2(id,"a","AST")}</div></div>`).join("")}</div>`:""}
    <label class="f" for="exMotm">★ Maçın Adamı<select id="exMotm" data-bind="ext.motm"><option value="">Seçilmedi</option>${f.team.map(id=>`<option value="${esc(id)}"${f.motm===id?" selected":""}>${esc(nameOf(id))}</option>`).join("")}</select></label>
    <button class="btn primary block" data-act="extSave">${ICON.check} Kaydet</button>`}
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
function noMatchHero(){return `<section class="bh"><span class="bh-ey">Sıradaki maç</span><h1 class="bh-when">Yakında</h1><div class="bh-chips"><span>Maç henüz açılmadı</span></div></section>`}
function createHero(){const d=S.f.newDate||nextDay(+S.settings.day);
  return `<section class="bh">${bhWhen(d,S.f.newTime||S.settings.time,'<span class="on">Yeni maç</span>')}<div class="bh-form">
    <div class="grid2"><label class="f" for="nmDate">Tarih<input type="date" id="nmDate" data-bind="newDate" value="${esc(d)}"></label>
    <label class="f" for="nmTime">Saat${timeSel("nmTime","newTime",S.f.newTime||S.settings.time)}</label></div>
    <div class="grid2"><label class="f" for="nmA"><span><i class="bibdot"></i> 1. takımın adı</span><input type="text" id="nmA" maxlength="20" data-bind="newNameA" value="${esc(S.f.newNameA||"")}" placeholder="Örn. Eriş Gücü"></label>
    <label class="f" for="nmB"><span><i class="nobib"></i> 2. takımın adı</span><input type="text" id="nmB" maxlength="20" data-bind="newNameB" value="${esc(S.f.newNameB||"")}" placeholder="Örn. Emiş Gücü"></label></div>
    <button class="btn primary block" data-act="createMatch">${ICON.plus} Maçı aç</button></div></section>`}
function bhWhen(date,time,extra){const d=parseYmd(date);const fld=S.settings.field_name;const dw=dayWord(date);
  return `<span class="bh-ey">Sıradaki maç</span><h1 class="bh-when">${dw||GUNLER[d.getDay()]}<br>${esc(time||"")}</h1>
  <div class="bh-chips">${extra||""}<span>${d.getDate()} ${AYLAR[d.getMonth()]}</span>${fld?`<span>${esc(fld)}</span>`:""}</div>`}
const bhTeam=k=>`<div class="bh-t ${k.toLowerCase()}"><span class="bh-c" aria-hidden="true">${esc((TEAM[k]||"?").trim().charAt(0).toLocaleUpperCase("tr"))}</span><b>${esc(TEAM[k])}</b></div>`;
const sbFs=t=>{const w=Math.max(...String(t||"").split(/\s+/).map(x=>x.length));return w<=5?"2.4rem":w<=7?"1.95rem":w<=9?"1.6rem":"1.3rem"};
const mafFs=t=>{const n=String(t||"").length;return n<=8?"1.35rem":n<=12?"1.15rem":"1rem"};
function hero(om){
  const A=om.team_a||[],B=om.team_b||[];const has=A.length&&B.length;const d=parseYmd(om.date);const fld=S.settings.field_name;const dw=dayWord(om.date);
  const avA=has?sumAvg(A):0,avB=has?sumAvg(B):0;const pA=has?Math.round(100/(1+Math.pow(10,-(avA-avB)/15))):50;
  const me=S.me&&(A.includes(S.me)?"A":B.includes(S.me)?"B":"");let meRow="";
  if(me){const L=pad7(lineupOf(om,me),me==="A"?A:B),PS=posArr(om,me);const i=L.indexOf(S.me);const ep=i<0?"":i===0?"KL":slotPos(PS[i][0],PS[i][1],PS[i][2]);
    meRow=`<div class="sbme">${crest(TEAM[me],me,30)}<span><b>Takımın: ${esc(TEAM[me])}</b><small>${i<0?"Yedek":esc(EPOS[ep]?.[1]||ep)}${(me==="A"?om.cap_a:om.cap_b)===S.me?" · Kaptan":""}</small></span></div>`}
  const t0=new Date();t0.setHours(0,0,0,0);const dd=Math.round((d-t0)/864e5);const left=dd<0?"":dd===0?"BUGÜN":dd===1?"YARIN":dd+" GÜN KALDI";
  const wk=Math.min(seasonCount(curYr())+1,sLen());const fav=has&&pA!==50?(pA>50?TEAM.A:TEAM.B):"";
  const cap=k=>{const id=k==="A"?om.cap_a:om.cap_b;const ok=id&&P(id);const ph=ok&&photoOf(id);
    return `<div class="maft"><span class="mafcap${ok?"":" cr"}">${ok?(ph?`<img src="${esc(ph)}" alt="">`:`<i>${esc(initials(nameOf(id)))}</i>`):crest(TEAM[k],k,64,TEAM[k==="A"?"B":"A"])}</span><b style="font-size:${mafFs(TEAM[k])}">${esc(TEAM[k])}</b>${ok?`<small>KPT · ${esc(shortName(nameOf(id)))}</small>`:""}</div>`};
  const meTxt=me?(()=>{const L=pad7(lineupOf(om,me),me==="A"?A:B),PS=posArr(om,me);const i=L.indexOf(S.me);const ep=i<0?"":i===0?"KL":slotPos(PS[i][0],PS[i][1],PS[i][2]);
    return `Takımın ${esc(TEAM[me])} · ${i<0?"Yedek":esc(EPOS[ep]?.[1]||ep)}${(me==="A"?om.cap_a:om.cap_b)===S.me?" · Kaptan":""}`})():"";
  const st=om.state==="kayit"?"Kadro bekleniyor":"Kadro belli";
  return `<section class="maf"><div class="mafh"><span>${GKISA[d.getDay()]} ${d.getDate()} ${AYLAR[d.getMonth()].toLocaleUpperCase("tr")}${fld?" · "+esc(fld).toLocaleUpperCase("tr"):""}</span><span>HAFTA ${wk}</span></div>
    <div class="mafm">${cap("A")}<div class="mafc">${left?`<span>${left}</span>`:""}<b class="num">${esc(String(om.time||"").slice(0,5))}</b></div>${cap("B")}</div>
    <div class="mafb">${has?`<div class="mafbar" role="img" aria-label="Kazanma ihtimali ${esc(TEAM.A)} yüzde ${pA}, ${esc(TEAM.B)} yüzde ${100-pA}"><i style="width:${pA}%"></i><i></i></div>
      <div class="mafs"><span>Güç ${avA} · %${pA}</span><span>${fav?"Favori: "+esc(fav):"Denk maç"}</span><span>%${100-pA} · Güç ${avB}</span></div>`:""}
      <div class="mafme"><span>${meTxt||(om.state==="kayit"?"Kadrolar henüz açıklanmadı":"Bu hafta kadroda değilsin")}</span><em>${st}</em></div></div></section>`;
}
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
  return `<div class="whenf"><span class="eyebrow">Takım isimleri</span><div class="grid2"><label class="f" for="na_${esc(m.id)}"><span><i class="bibdot"></i> 1. takım</span><input type="text" maxlength="20" id="na_${esc(m.id)}" data-bind="${k}.a" value="${esc(a)}" placeholder="1. takım"></label>
    <label class="f" for="nb_${esc(m.id)}"><span><i class="nobib"></i> 2. takım</span><input type="text" maxlength="20" id="nb_${esc(m.id)}" data-bind="${k}.b" value="${esc(b)}" placeholder="2. takım"></label></div>
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
function matchBody(m){
  if(S.admin&&S.draft&&S.draft.mid===m.id)return `<section class="card">${draftPanel(m)}</section>`;
  if(S.admin&&S.teams&&S.teams.mid===m.id)return `<section class="card"><div class="ch"><h2>Kadro kur</h2><span class="chip adm">Yönetici</span></div>${editorPanel(m)}</section>`;
  let h="";
  if(m.state==="kayit"){
    h+=kadroCard(m);
    if(S.admin)h+=`<section class="card admc"><div class="ch"><div><div class="eyebrow">Yönetici</div><h2>Takımları kur</h2></div></div>
      <div class="grid2"><button class="btn primary" data-act="autoKadro" data-id="${esc(m.id)}">Otomatik kur</button><button class="btn" data-act="manual" data-id="${esc(m.id)}">${ICON.hand} Manuel kur</button></div>
      ${adminMore(m,`<button class="btn danger sm" data-act="delMatch" data-id="${esc(m.id)}">${S.f.delMatch===m.id?"Silmek için tekrar bas":"Maçı sil"}</button>`)}</section>`;
  }else{
    h+=`<section class="card"><div class="ch"><h2>Kadrolar</h2></div>${teamsView(m,true)}</section>`;
    h+=preview(m);
    if(S.admin)h+=finishCard(m);
  }
  return h;
}
/* Kadro: yönetici işaretler, oyuncular sadece görür */
function kadroCard(m){const rs=m.rsvp||{};const ps=S.players.filter(p=>!p.guest);const ok=p=>!UNAVAIL.includes(stOf(p));
  const gel=ps.filter(p=>rs[p.id]==="g"&&ok(p));const n=gel.length;const pct=Math.min(100,Math.round(n/CAP*100));const need=CAP-n;
  const head=`<div class="kdh"><b class="kdn num">${n}</b><div class="kdi"><span class="muted small">${need>0?`${CAP} kişilik maç için ${need} kişi daha`:need<0?`${-need} kişi fazla · ilk ${CAP} kişi oynar`:"Kadro tamam"}</span><span class="kdb"><i style="width:${pct}%"></i></span></div></div>`;
  if(!S.admin){const me=S.me&&rs[S.me]==="g";
    return `<section class="card kad"><div class="ch"><h2>Kadro kuruluyor</h2></div>${head}
      ${n?`<div class="kdf">${gel.slice(0,12).map(p=>avatar(p)).join("")}${n>12?`<span class="av more">+${n-12}</span>`:""}</div>`:""}
      ${S.me?`<div class="kdme${me?" on":""}">${me?"✓ Kadrodasın":"Henüz kadroda değilsin"}</div>`:""}</section>`}
  const order=[...ps].sort((a,b)=>(ok(b)-ok(a))||((rs[b.id]==="g")-(rs[a.id]==="g"))||a.name.localeCompare(b.name,"tr"));
  return `<section class="card kad"><div class="ch"><div><div class="eyebrow">Yönetici</div><h2>Kadro</h2></div></div>${head}
    <div class="kdl">${order.map(p=>{const on=rs[p.id]==="g";const av=ok(p);const st=STATUS[stOf(p)];
      return `<button class="kdr${on?" on":""}${av?"":" out"}" data-act="kTog" data-m="${esc(m.id)}" data-p="${esc(p.id)}" aria-pressed="${on}" ${av?"":"disabled"}>${avatar(p)}<span class="kdnm"><b>${esc(p.name)}</b><small>${esc(eposOf(p))} · ${ovrOf(p.id)}${p.yedek?" · yedek kadro":""}</small></span>${av?"<span></span>":`<span class="chip bad">${esc(st?st.label:"")}</span>`}<i class="kdc">${on?"✓":""}</i></button>`}).join("")}</div></section>`}
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
  if(!id)return `<button class="${cls} ${kc} empty${xc}" style="${st}" ${act} aria-label="Boş ${EPOS[T.ep][1]} yeri"><span class="pa">+</span><span class="tnm">Boş</span><i class="tps">${T.ep}</i></button>`;
  const p=P(id),o=ovrOf(id),ph=photoOf(id);
  const r=notes&&notes.pts[id];const nt=r?`<i class="nt ${noteCls(r.pts)}${notes.motm===id?" motm":""}" aria-label="Maç notu ${fN(r.pts)}">${notes.motm===id?"★":""}${fN(r.pts)}</i>`:"";
  const cap=caps&&caps[T.k]===id?'<i class="cap" aria-label="Kaptan">C</i>':"";const ov=p?.guest?"MİS":o;
  const img=`<span class="pi">${ph?`<img src="${esc(ph)}" alt="">`:SILH}</span>`;
  const lab=`aria-label="${esc(nameOf(id))}, ${EPOS[T.ep][1]}, reyting ${ov}${r?", not "+fN(r.pts):""}"`;
  const badge=`<b class="tov num">${ov}</b>`+nt;
  return `<button class="${cls} ${kc}${xc}" style="${st}" ${act} ${lab}><span class="pa">${img}${cap}${badge}</span><span class="tnm">${esc(shortName(nameOf(id)))}</span><i class="tps">${T.ep}</i></button>`}
function fieldHtml(mode,pa,pb,la,lb,editable,sel,caps,notes){
  return `<div class="field ${mode==="both"?"both":"single"} cards${editable?" edit":""}" data-mode="${mode}">${fieldSvg()}${layout(mode,pa,pb,la,lb,true).map(T=>T.id||editable?cardTok(T,mode,caps,notes,editable,sel):"").join("")}</div>`;
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
  const la=pad7(lineupOf(m,"A"),A),lb=pad7(lineupOf(m,"B"),B);const mode=S.fv||"both";const NI=m.state==="bitti"&&!isExt(m)?S.mInfo?.[m.id]:null;
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
  const poolRow=id=>{const p=P(id);return `<div class="pl">${avatarO(p)}<div class="pi"><b>${esc(p.name)}</b><span>${esc(posLabel(p))}${stChip(p)}</span></div><span class="row" style="gap:6px;flex-wrap:nowrap"><button class="btn sm" data-act="poolAdd" data-k="A" data-id="${esc(id)}" aria-label="${esc(p.name)} Yeleklilere">${dot("A")}A</button><button class="btn sm" data-act="poolAdd" data-k="B" data-id="${esc(id)}" aria-label="${esc(p.name)} Yeleksizlere">${dot("B")}B</button></span></div>`};
  return `<details class="pool-box"${t.poolOpen!==false?" open":""} data-act-toggle-team="poolOpen"><summary>Oyuncu seç · ${t.A.length+t.B.length}/${CAP} kişi seçildi</summary><div class="list">
     ${poolK.length?`<div class="grp">Oyuncular</div>${poolK.map(poolRow).join("")}`:`<p class="muted small" style="padding:8px 0">Bütün oyuncular takımlara dağıtıldı.</p>`}
     ${poolO.length?`<details><summary class="small">Sakat, hasta ya da izinde (${poolO.length})</summary>${poolO.map(poolRow).join("")}</details>`:""}
     ${poolG.length?`<div class="grp">Önceki misafirler</div>${poolG.map(poolRow).join("")}`:""}
     <div class="grp">Misafir ekle</div>
     <form data-form="addGuest" class="guestf"><input id="guestName" type="text" maxlength="40" placeholder="Misafirin adı" autocomplete="off" data-bind="guestName" value="${esc(S.f.guestName||"")}"><button class="btn sm" type="submit">${dot(k)}${esc(TEAM[k])} · ekle</button></form>
     </div></details>
   ${viewSeg(k,"tview",false)}
   <div class="lineup">${fieldHtml(k,t.pa,t.pb,t.la,t.lb,true,t.sel,capsOf(t))}
   <div style="display:grid;gap:12px;align-content:start;min-width:0">
     ${t.sel?subPanel(t,selName,selHasPlayer)
       :``}
     <div class="side"><h3>${dot(k)}${TEAM[k]} · ${t[k].length} kişi · ${esc(formText(t["f"+lk],t["p"+lk]))}</h3>${fp}</div>
     <div class="side"><span class="eyebrow">Yedekler</span><div class="bench">${benchBtns}</div></div>
   </div></div>
   ${strengthHtml(t.A,t.B,t.la,t.pa,t.lb,t.pb)}
   <button class="btn primary block" data-act="saveTeams">${ICON.check} Kadroları kaydet</button>
   <div class="btns2"><button class="btn sm" data-act="autoPlace">Otomatik yerleştir</button><button class="btn sm" data-act="swapBibs">Yelekleri değiştir</button></div>
   <div class="btns2"><button class="btn sm" data-act="balance" data-id="${esc(m.id)}" ${t.A.length+t.B.length<4?"disabled":""}>Dengeli dağıt</button><button class="btn ghost sm" data-act="cancelTeams">Vazgeç</button></div>`;
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
  if(sv&&Array.isArray(sv.events))return S.f[k]={...exFrom({}),...sv,undo:sv.undo||[],step:null};
  const sd={a:+m.score_a||0,b:+m.score_b||0,touched:m.score_a!=null,manual:false,motm:m.motm||"",gol:m.gol_id||"",fiy:m.fiy_id||"",events:eventsFrom(m),...exFrom(m.stats),undo:[],step:null};
  const[ga,gb]=goalSums(m,sd);if(m.score_a!=null&&(ga!==sd.a||gb!==sd.b))sd.manual=true;return S.f[k]=sd}
function sdSave(m,sd){try{LS.set("y_sd_"+m.id,JSON.stringify({a:sd.a,b:sd.b,touched:sd.touched,manual:sd.manual,motm:sd.motm,gol:sd.gol||"",fiy:sd.fiy||"",events:sd.events,perf:sd.perf||{},pen:sd.pen||{},cl:sd.cl||{},pm:sd.pm||{},ps:sd.ps||{},undo:sd.undo.slice(-25)}))}catch(_){}}
function syncScore(m,sd){if(sd.manual)return;const[a,b]=goalSums(m,sd);sd.a=a;sd.b=b;if(a||b)sd.touched=true}
function snap(sd,label){sd.undo.push(JSON.stringify({l:label,events:sd.events,a:sd.a,b:sd.b,manual:sd.manual,touched:sd.touched,motm:sd.motm,gol:sd.gol||"",fiy:sd.fiy||""}));if(sd.undo.length>40)sd.undo.shift()}
const hasDraft=m=>{const sd=S.f["sd_"+m.id];if(sd)return sd.touched||sd.events.length||sd.motm;return !!LS.get("y_sd_"+m.id)};
const evLabel=e=>e.t==="g"?shortName(nameOf(e.g))+" golü":e.t==="og"?shortName(nameOf(e.p))+" kendi kalesine":shortName(nameOf(e.p))+" asisti";
function finishCard(m){
  const draft=hasDraft(m);const sd=draft?sdOf(m):null;
  const reo=m.finished_at&&m.score_a!=null&&m.score_b!=null;
  return `<section class="card admc"><div class="ch"><div><div class="eyebrow">Yönetici</div><h2>Maç sonu</h2></div></div>
    ${reo?`<div class="note warn">Bu maç düzeltme için açıldı. Tekrar bitirilene kadar sonuçları kartlara ve tablolara sayılmıyor; veriler duruyor. <button class="btn sm" data-act="restoreFin" data-id="${esc(m.id)}" style="margin-top:8px">Değişiklik yapmadan geri kapat</button></div>`:""}
    
    ${draft?`<div class="note">Kaydedilmemiş taslak: <b>${TEAM.A} ${sd.a} – ${sd.b} ${TEAM.B}</b> · ${sd.events.length} kayıt</div>`:""}
    <button class="btn primary block" data-act="statSheet" data-id="${esc(m.id)}">${ICON.check} ${draft?"Girişe devam et":"Skoru ve golleri gir"}</button>
    ${adminMore(m,`<button class="btn sm" data-act="editTeams" data-id="${esc(m.id)}">${ICON.hand} Kadroları değiştir</button><button class="btn sm" data-act="backRsvp" data-id="${esc(m.id)}">Kadro aşamasına dön</button>${draft?`<button class="btn sm danger" data-act="draftDel" data-id="${esc(m.id)}">${S.f.delDraft===m.id?"Taslağı silmek için tekrar bas":"Taslağı sil"}</button>`:""}<button class="btn danger sm" data-act="delMatch" data-id="${esc(m.id)}">${S.f.delMatch===m.id?"Silmek için tekrar bas":"Maçı sil"}</button>`)}</section>`;
}
function ptile(id,act,M,on,extra,cls){const p=P(id);return `<button class="pt${on?" on":""}${cls?" "+cls:""}" data-act="${act}" data-m="${M}" data-p="${esc(id)}"${extra||""} aria-pressed="${!!on}">${p?avatar(p,"xs"):`<span class="av xs">?</span>`}<b>${esc(shortName(nameOf(id)))}</b></button>`}
function statEntry(m){
  const sd=sdOf(m);const st=statsOf(sd);const M=esc(m.id);const tab=S.f.stTab||"gol";
  const[gA,gB]=goalSums(m,sd);const mism=sd.touched&&sd.manual&&(gA!==sd.a||gB!==sd.b);const conf=S.f.confirmFinish===m.id;
  const team=k=>plOf(m,k);const pl=plAll(m);const step=sd.step;
  const nPerf=pl.filter(id=>(sd.perf||{})[id]).length;const nAw=[sd.motm,sd.gol,sd.fiy].filter(Boolean).length;
  const tabs=[["gol","Goller",sd.events.filter(e=>e.t!=="a").length||""],["odul","Ödüller",nAw?nAw+"/3":""],["deg","Değerlendirme",nPerf?nPerf+"/"+pl.length:""]];
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
    body=`<div class="aws"><div class="awh"><b>★ Maçın Adamı</b><span class="muted small">+${fN(NOTE.motm)} not${sd.motm?" · "+esc(shortName(nameOf(sd.motm))):""}</span></div>${byT("motm")}</div>
      <div class="aws"><div class="awh"><b>⚽ Haftanın Golü</b><span class="muted small">${sd.gol?esc(shortName(nameOf(sd.gol))):"gol atanlardan seç"}</span></div>${scorers.length?`<div class="ptiles c4">${grp("gol",scorers)}</div>`:`<p class="muted small" style="margin:0">Önce golleri gir.</p>`}</div>
      <div class="aws"><div class="awh"><b>🙈 Haftanın Fiyaskosu</b><span class="muted small">${sd.fiy?esc(shortName(nameOf(sd.fiy))):"isteğe bağlı"}</span></div>${byT("fiy")}</div>`}
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
function stp(mid,pid,k,lbl,v){v=+v||0;return `<span class="stp${v?" on":""}"><label>${lbl}</label><button data-act="st" data-m="${esc(mid)}" data-p="${esc(pid)}" data-k="${k}" data-d="-1" aria-label="${lbl} azalt">−</button><b>${v}</b><button data-act="st" data-m="${esc(mid)}" data-p="${esc(pid)}" data-k="${k}" data-d="1" aria-label="${lbl} artır">+</button></span>`}

/* ================= Sonuç ================= */
function resultPanel(m,...r){return inM(m,()=>_resultPanel(m,...r))}
function _resultPanel(m){
  const inf=S.mInfo[m.id]||{pts:{},totw:[]};const pl=plAll(m);const stt=m.stats||{};const M=esc(m.id);
  const scorers=pl.filter(id=>(+stt[id]?.g||0)>0);const sa=+m.score_a||0,sb=+m.score_b||0;
  const tab=S.f.mtab==="deg"?"notlar":(S.f.mtab||"ozet");const T=k=>plOf(m,k);
  const avgN=k=>{const v=T(k).map(id=>inf.pts[id]?.pts).filter(x=>x!=null);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null};
  const mt=Object.values(inf.pts).find(Boolean)?.mt||"";const dot2=k=>crest(k==="A"?TEAM.A:TEAM.B,k,15);
  const d0=parseYmd(m.date);const capOf=k=>{const id=k==="A"?m.cap_a:m.cap_b;const ok=id&&P(id);const ph=ok&&photoOf(id);
    return `<div class="maft${(k==="A"?sa>sb:sb>sa)?" win":""}"><span class="mafcap${ok?"":" cr"}">${ok?(ph?`<img src="${esc(ph)}" alt="">`:`<i>${esc(initials(nameOf(id)))}</i>`):crest(TEAM[k],k,64,TEAM[k==="A"?"B":"A"])}</span><b style="font-size:${mafFs(TEAM[k])}">${esc(TEAM[k])}</b><small>${ok?"KPT · "+esc(shortName(nameOf(id)))+" · ":""}ort. ${fN(avgN(k))}</small></div>`};
  let h=`<section class="maf mres"><div class="mafh"><span>${GKISA[d0.getDay()]} ${d0.getDate()} ${AYLAR[d0.getMonth()].toLocaleUpperCase("tr")}${S.settings.field_name?" · "+esc(S.settings.field_name).toLocaleUpperCase("tr"):""}</span>${S.admin?`<button class="mafbtn" data-act="mngOpen" data-id="${M}">Yönet</button>`:`<span>MAÇ SONU</span>`}</div>
    <div class="mafm">${capOf("A")}<div class="mafc"><span>${esc(mt||(sa===sb?"Beraberlik":"Maç sonu"))}</span><b class="num">${sa}<i>–</i>${sb}</b></div>${capOf("B")}</div>
    </section>
    <section class="card mdet">
    ${S.admin&&S.f.delMatch===m.id?`<div class="note warn">Maç ve kartlara etkisi tamamen silinir.</div>`:""}
    <div class="mtabs" role="tablist">${[["ozet","Özet"],["kadro","Kadro"],["notlar","Notlar"],["ist","İstatistik"]].map(([k,l])=>`<button role="tab" aria-selected="${tab===k}" class="${tab===k?"on":""}" data-act="mtab" data-v="${k}">${l}</button>`).join("")}</div>`;
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
    h+=`<div class="report">${spiker(m,inf)}</div>`;
    if(S.admin){const o=(list,cur)=>`<option value="">Seçilmedi</option>`+list.map(id=>`<option value="${esc(id)}"${cur===id?" selected":""}>${esc(nameOf(id))}</option>`).join("");
      h+=`<details><summary class="small">Ödülleri değiştir <span class="chip warn" style="margin-left:6px">Yönetici</span></summary><div class="grid2" style="margin-top:10px"><label class="f">⚽ Haftanın Golü<select data-act-change="awR" data-k="gol" data-m="${M}">${o(scorers,m.gol_id||"")}</select></label><label class="f">🙈 Haftanın Fiyaskosu<select data-act-change="awR" data-k="fiy" data-m="${M}">${o(pl,m.fiy_id||"")}</select></label></div></details>`}
  }else if(tab==="kadro"){h+=`<div style="display:grid;gap:12px">${teamsView(m)}</div>`}
  else if(tab==="deg"){const any=pl.some(id=>NOTE.perf[+stt[id]?.k]);
    if(!any)h+=`<div class="empty"><h3>Henüz değerlendirme yok</h3><p>Yönetici maçtan sonra oyuncuları çok iyi, iyi, orta ve kötü olarak ayırınca burada görünür.</p>${S.admin?`<button class="btn primary" data-act="evalOpen" data-id="${M}">Değerlendir</button>`:""}</div>`;
    else h+=`<div class="degs">${[1,2,3,4].map(v=>{const ids=pl.filter(id=>+stt[id]?.k===v).sort((a,b)=>(inf.pts[b]?.pts||0)-(inf.pts[a]?.pts||0));
      return `<div class="degc"><div class="degh"><span class="pfc p${v}">${NOTE.perf[v][1]}</span><span class="muted small">${ids.length} kişi · ${NOTE.perf[v][0]?"not "+(NOTE.perf[v][0]>0?"+":"−")+fN(Math.abs(NOTE.perf[v][0])):"notu etkilemez"}</span></div>
        ${ids.map(id=>{const r=inf.pts[id];return `<button class="degr" data-act="open" data-id="${esc(id)}">${P(id)?avatar(P(id),"sm"):""}<span class="degn"><b>${esc(nameOf(id))}</b><span class="muted small">${r?dot2(r.side)+esc(TEAM[r.side])+" · "+ROLE_NAME[r.role]:""}</span></span>${r?`<span class="nt ${noteCls(r.pts)}">${fN(r.pts)}</span>`:""}</button>`}).join("")||'<span class="muted small">—</span>'}</div>`}).join("")}</div>
      ${S.admin?`<button class="btn ghost sm" data-act="evalOpen" data-id="${M}">Değerlendirmeyi düzenle</button>`:""}`}
  else if(tab==="notlar"){
    const ranked=pl.filter(id=>inf.pts[id]).sort((a,b)=>inf.pts[b].pts-inf.pts[a].pts);
    h+=`<div class="nlist">`+ranked.map(id=>{const r=inf.pts[id];const hh=(S.stats[id]?.hist||[]).find(x=>x.m.id===m.id);const od=hh?hh.od||0:0;const chs=hh?chText(hh.ch):"";
      const sub=[r.g?r.g+" gol":"",r.a?r.a+" asist":"",inf.motm===id?"★ Maçın Adamı":"",inf.gol===id?"Haftanın Golü":"",inf.fiy===id?"Fiyasko":""].filter(Boolean).join(" · ");
      return `<details class="nrow"><summary><span class="nrl">${dot2(r.side)}<small>${r.role}</small></span><span class="nrn"><b>${esc(shortName(nameOf(id)))}</b>${NOTE.perf[r.pk]?`<span class="pfc p${r.pk}">${NOTE.perf[r.pk][1]}</span>`:""}${sub?`<small>${sub}</small>`:""}</span>${od?`<span class="nrd ${od>0?"up":"dn"}">${od>0?"▲":"▼"}${Math.abs(od)}</span>`:"<span></span>"}<span class="nt ${noteCls(r.pts)}">${fN(r.pts)}</span></summary>
        <div class="nrb"><div class="nrp">${r.parts.map(([l,v])=>`<span class="${v>0?"pos":"neg"}">${esc(l)} <b>${v>0?"+"+fN(v):"−"+fN(-v)}</b></span>`).join("")||"<span>Ortalama maç</span>"}</div>
        ${(r.g||r.a)&&r.gf&&r.gf!==1?`<p class="muted small">${esc(r.mt||"")}, ${sa+sb} gol: gol/asist ×${String(r.gf).replace(".",",")}</p>`:""}${chs?`<p class="muted small">Karta etkisi: ${chs}</p>`:""}</div></details>`}).join("")+`</div>`+(S.admin?`<button class="btn ghost sm" data-act="evalOpen" data-id="${M}">${pl.some(id=>NOTE.perf[+stt[id]?.k])?"Değerlendirmeyi düzenle":"Oyuncuları değerlendir"}</button>`:"")}
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
  return h+`</section>`;
}
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
    ${gave.length||fed.length?`<div><h3>Paslaşmalar</h3><div class="pafl">${gave.map(x=>`<button class="paf" data-act="cmpPair" data-a="${esc(p.id)}" data-b="${esc(x.b)}"><b>${me}</b><span class="ar"></span><b>${sn(x.b)}</b><em>${x.n} gol</em></button>`).join("")}${fed.map(x=>`<button class="paf" data-act="cmpPair" data-a="${esc(p.id)}" data-b="${esc(x.a)}"><b>${sn(x.a)}</b><span class="ar"></span><b>${me}</b><em>${x.n} gol</em></button>`).join("")}</div></div>`:""}`}
function radar(pa,pb){const set=attrSet(pa.pos);const N=set.length,C=110,Rr=78;const sa=S.stats[pa.id]?.attrs||{},sb=pb?S.stats[pb.id]?.attrs||{}:{};
  const pt=(i,v)=>{const ang=-Math.PI/2+i*2*Math.PI/N;const r=Rr*clamp((v-30)/69,0,1);return[C+r*Math.cos(ang),C+r*Math.sin(ang)]};
  const poly=a=>set.map(([k],i)=>pt(i,+a[k]||30).map(x=>x.toFixed(1)).join(",")).join(" ");
  const rings=[.25,.5,.75,1].map(f=>`<polygon points="${set.map((_,i)=>{const ang=-Math.PI/2+i*2*Math.PI/N;return (C+Rr*f*Math.cos(ang)).toFixed(1)+","+(C+Rr*f*Math.sin(ang)).toFixed(1)}).join(" ")}" fill="none" stroke="var(--line2)"/>`).join("");
  const labels=set.map(([k,l],i)=>{const ang=-Math.PI/2+i*2*Math.PI/N;const x=C+(Rr+18)*Math.cos(ang),y=C+(Rr+18)*Math.sin(ang);return `<text x="${x.toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="middle">${l}</text>`}).join("");
  return `<svg class="radar" viewBox="0 0 220 220" role="img" aria-label="Özellik karşılaştırması">${rings}${labels}<polygon points="${poly(sa)}" fill="rgba(198,244,50,.25)" stroke="#C6F432" stroke-width="2"/>${pb?`<polygon points="${poly(sb)}" fill="rgba(139,108,255,.25)" stroke="#8B6CFF" stroke-width="2"/>`:""}</svg>`}
function sheetCmp(){const c=S.sheet;const pa=P(c.a),pb=P(c.b);
  const sel=(k,v)=>`<select data-cmp="${k}" aria-label="${k==="a"?"Birinci":"İkinci"} oyuncu"><option value="">Oyuncu seç</option>${S.players.filter(q=>!q.guest&&(S.stats[q.id]?.games||0)>0).map(q=>`<option value="${esc(q.id)}"${v===q.id?" selected":""}>${esc(q.name)}</option>`).join("")}</select>`;
  let h=`<div class="ch"><h2>Karşılaştır</h2><button class="btn sm" data-act="close">Kapat</button></div><div class="grid2 cmpsel"><div><span class="bibdot"></span>${sel("a",c.a)}</div><div><span class="nobib"></span>${sel("b",c.b)}</div></div>`;
  if(!pa||!pb)return h+``;
  const A=S.stats[pa.id]||{},B=S.stats[pb.id]||{};const same=(pa.pos==="Kaleci")===(pb.pos==="Kaleci");
  const tile=(q,k)=>{const ph=photoOf(q.id);return `<button class="cmh cmh${k}" data-act="open" data-id="${esc(q.id)}"><span class="cmhp">${ph?`<img src="${esc(ph)}" alt="">`:`<span>${esc(initials(q.name))}</span>`}</span><b>${esc(q.name)}</b><span class="cmhk"><b class="num">${ovrOf(q.id)}</b><small>${eposOf(q)}</small></span></button>`};
  h+=`<div class="cmhh">${tile(pa,"A")}<span class="cmvs">VS</span>${tile(pb,"B")}</div>`;
  h+=same?`<div style="display:grid;justify-items:center">${radar(pa,pb)}<div class="row small"><span><span class="bibdot"></span>${esc(firstName(pa.name))}</span><span><span class="nobib"></span>${esc(firstName(pb.name))}</span></div></div>`:`<p class="muted small">Biri kaleci olduğu için özellikler aynı grafikte karşılaştırılamıyor.</p>`;
  const row=(l,x,y,lowBetter,fmt)=>{const f=fmt||(v=>v??"–");const bx=x!=null&&y!=null&&(lowBetter?x<y:x>y),by=x!=null&&y!=null&&(lowBetter?y<x:y>x);const mx=Math.max(Math.abs(x||0),Math.abs(y||0))||1;
    return `<div class="cr cr2"><b class="num${bx?" hi a":""}">${f(x)}</b><span>${l}</span><b class="num${by?" hi b":""}">${f(y)}</b><span class="crbar"><span class="h l"><i class="a" style="width:${Math.round(Math.abs(x||0)/mx*100)}%"></i></span><span class="h r"><i class="b" style="width:${Math.round(Math.abs(y||0)/mx*100)}%"></i></span></span></div>`};
  const pct=s=>s.games?Math.round(s.W/s.games*100):null;
  h+=`<div class="cmpt">${row("Reyting",A.ovr,B.ovr)}${row("Maç",A.games||0,B.games||0)}${row("Gol",A.goals||0,B.goals||0)}${row("Asist",A.ast||0,B.ast||0)}${row("Gol + asist",(A.goals||0)+(A.ast||0),(B.goals||0)+(B.ast||0))}${row("Galibiyet",A.W||0,B.W||0)}${row("Kazanma",pct(A),pct(B),false,v=>v==null?"–":"%"+v)}${row("Ort. not",A.avgPts!=null?+A.avgPts.toFixed(1):null,B.avgPts!=null?+B.avgPts.toFixed(1):null)}${row("Maçın Adamı",A.motm||0,B.motm||0)}${row("Devam",A.att!=null?Math.round(A.att*100):null,B.att!=null?Math.round(B.att*100):null,false,v=>v==null?"–":"%"+v)}</div>`;
  const v=vsOf(pa.id,pb.id),t=togOf(pa.id,pb.id);
  h+=`<div class="grid2"><div class="aw"><span>Karşı karşıya</span>${v.n?`<b class="num">${v.a} – ${v.d} – ${v.b}</b><span class="muted small" style="text-transform:none;letter-spacing:0">${v.n} maç · ${v.a>v.b?esc(firstName(pa.name))+" önde":v.b>v.a?esc(firstName(pb.name))+" önde":"eşitlik"}</span>`:'<span class="muted small" style="text-transform:none;letter-spacing:0">Henüz karşılaşmadılar</span>'}</div>
    ${(()=>{const d1=(S.duo||{})[pa.id+">"+pb.id]||0,d2=(S.duo||{})[pb.id+">"+pa.id]||0;return d1||d2?`<div class="aw" style="grid-column:1/-1"><span>Gol–asist</span><b class="num" style="font-size:1rem">${esc(firstName(pa.name))} → ${esc(firstName(pb.name))}: ${d1} · ${esc(firstName(pb.name))} → ${esc(firstName(pa.name))}: ${d2}</b></div>`:""})()}
    <div class="aw"><span>Aynı takımda</span>${t.n?`<b class="num">${t.W}G ${t.D}B ${t.L}M</b><span class="muted small" style="text-transform:none;letter-spacing:0">${t.n} maç · %${Math.round(t.W/t.n*100)} kazanma</span>`:'<span class="muted small" style="text-transform:none;letter-spacing:0">Henüz birlikte oynamadılar</span>'}</div></div>`;
  return h}

/* ================= Tahmin ve maç önü ================= */
const predPts=(pr,m)=>{if(!pr||m.score_a==null)return 0;const a=+m.score_a,b=+m.score_b;if(+pr.a===a&&+pr.b===b)return 3;return Math.sign(+pr.a-+pr.b)===Math.sign(a-b)?1:0};
function predCard(m){const open=Date.now()<matchTs(m)&&m.state!=="bitti";const pr=m.preds||{};const ids=Object.keys(pr).filter(id=>P(id));const me=S.me&&P(S.me)&&!P(S.me).guest?S.me:null;
  let h=`<section class="card"><div class="ch"><div><h2>Skor tahmini</h2></div><span class="chip muted">${ids.length} tahmin</span></div>`;
  if(open){if(!me)h+=`<button class="btn block" data-act="meSheet">Tahmin için kim olduğunu seç</button>`;
    else{const k="pr_"+m.id;const d=S.f[k]||(S.f[k]={a:pr[me]?.a??0,b:pr[me]?.b??0});const st=(side)=>`<div class="pst"><span>${side==="a"?'<span class="bibdot"></span>':'<span class="nobib"></span>'}${esc(TEAM[side.toUpperCase()])}</span><div class="pnum"><button class="rnd" data-act="prS" data-m="${esc(m.id)}" data-side="${side}" data-d="-1" aria-label="Azalt">−</button><b class="num">${d[side]}</b><button class="rnd" data-act="prS" data-m="${esc(m.id)}" data-side="${side}" data-d="1" aria-label="Artır">+</button></div></div>`;
      h+=`<div class="pred">${st("a")}${st("b")}</div><button class="btn primary block" data-act="predict" data-id="${esc(m.id)}">${pr[me]?"Tahminimi güncelle":"Tahminimi gönder"}</button>${pr[me]?`<span class="chip ok" style="justify-self:center"><span class="dot"></span>Tahminin: ${pr[me].a}-${pr[me].b}</span>`:""}`}
    const c={A:0,D:0,B:0};ids.forEach(id=>{const x=pr[id];c[x.a>x.b?"A":x.a<x.b?"B":"D"]++});
    if(ids.length&&S.admin)h+=adminPreds(m,ids);
    if(ids.length)h+=`<p class="muted small">${TEAM.A} kazanır: <b style="color:var(--ink)">${c.A}</b> · Berabere: <b style="color:var(--ink)">${c.D}</b> · ${TEAM.B} kazanır: <b style="color:var(--ink)">${c.B}</b>.</p>`;
  }else if(S.admin&&ids.length){h+=adminPreds(m,ids,true)}else{h+=ids.length?`<div class="hist">${ids.sort((a,b)=>predPts(pr[b],m)-predPts(pr[a],m)).map(id=>{const pts=m.state==="bitti"?predPts(pr[id],m):null;return `<div style="grid-template-columns:minmax(0,1fr) auto auto"><span>${esc(nameOf(id))}</span><span class="num"><b>${pr[id].a}-${pr[id].b}</b></span><span class="delta ${pts===3?"pos":pts===1?"pos":"zero"}">${pts==null?"":pts?"+"+pts:"0"}</span></div>`}).join("")}</div>`:`<p class="muted small">Bu maç için tahmin yapılmadı.</p>`}
  return h+`</section>`}
function adminPreds(m,ids,open){const pr=m.preds||{};
  return `<details class="admp"${open||S.f.admPr===m.id?" open":""} data-act-toggle-pr="${esc(m.id)}"><summary class="small">Kim ne tahmin etti? <span class="chip warn" style="margin-left:6px">Yönetici</span></summary><div class="hist">${ids.sort((a,b)=>nameOf(a).localeCompare(nameOf(b),"tr")).map(id=>`<div style="grid-template-columns:minmax(0,1fr) auto auto auto"><span>${esc(nameOf(id))}</span><b class="num">${pr[id].a}-${pr[id].b}</b><span class="delta ${predPts(pr[id],m)?"pos":"zero"}">${m.state==="bitti"?"+"+predPts(pr[id],m):""}</span><button class="xb" data-act="delPred" data-m="${esc(m.id)}" data-p="${esc(id)}" aria-label="${esc(nameOf(id))} tahminini sil">${S.f.delPr===m.id+id?"✓":ICON.x}</button></div>`).join("")}</div></details>`}
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
    ${recent(T)?(()=>{const r=recent(T);return `<div><span class="eyebrow">Oyuncuların son maçları</span><div class="rec"><span class="g">${r.G}G</span><span class="b">${r.B}B</span><span class="m">${r.M}M</span></div><span class="muted pvs">%${Math.round(r.G/r.n*100)} galibiyet</span></div>`})():""}
    ${chem(T)?`<div><span class="eyebrow">Takım kimyası</span><b class="num pvn">%${chem(T).p}</b></div>`:""}
    ${kp?`<div class="pvk"><span class="eyebrow">Kilit oyuncu</span><button data-act="open" data-id="${esc(kp)}">${esc(nameOf(kp))} <span class="pchip">${eposOf(P(kp))}</span></button></div>`:""}
    ${inForm(T).length?`<div><span class="eyebrow">Formda</span>${inForm(T).map(id=>`<div class="small fm"><span>${esc(shortName(nameOf(id)))}</span><b class="num">${fN(formOf2(id))}</b></div>`).join("")}</div>`:""}
    ${cap(k)&&T.includes(cap(k))?`<div class="small"><span class="capi">C</span>${esc(nameOf(cap(k)))}</div>`:""}</div>`};
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
const oyTabs=v=>`<div class="oyt2" role="tablist" aria-label="Lig">${[["lig","Puan durumu"],["sezon","İstatistikler"]].map(([k,l])=>`<button data-act="tab" data-tab="${k}" role="tab" aria-selected="${v===k}" class="${v===k?"on":""}">${l}</button>`).join("")}</div>`;
function viewKartlar(){
  const sort=S.f.sort||"ovr";const flt=S.filter;
  const kv=S.f.kv||LS.get("y_kv")||"list";
  const sq=S.f.sqMode?"all":(S.f.sq||"as");const nAs=S.players.filter(p=>!p.yedek).length,nYd=S.players.length-nAs;
  let ps=S.players.filter(p=>(sq==="all"||(sq==="yedek"?!!p.yedek:!p.yedek))&&(flt==="all"||flt==="as"||flt==="yedek"||p.pos===flt||(altOf(p)&&GROUP_POS[EPOS[altOf(p)][0]]===flt)));
  ps=[...ps].sort((a,b)=>sort==="mv"?mvOf(b.id)-mvOf(a.id)||genOf(b.id)-genOf(a.id):sort==="isim"?a.name.localeCompare(b.name,"tr"):sort==="form"?(S.stats[b.id]?.form??-1)-(S.stats[a.id]?.form??-1)||(S.stats[b.id]?.lastD||0)-(S.stats[a.id]?.lastD||0)||genOf(b.id)-genOf(a.id):genOf(b.id)-genOf(a.id));
  const mi=(act,l,on,extra)=>`<button role="menuitem" data-act="${act}" ${extra||""}>${l}${on?"<i>✓</i>":""}</button>`;
  let h=`<div class="ktb"><div class="vtog sqt" role="group" aria-label="Kadro">${[["as","As",nAs],["yedek","Yedek",nYd],["all","Tümü",""]].map(([k,l,n])=>`<button data-act="sqf" data-v="${k}" class="${sq===k?"on":""}" aria-pressed="${sq===k}">${l}${n!==""?` <small>${n}</small>`:""}</button>`).join("")}</div>
    <button class="kic" data-act="kview" data-v="${kv==="list"?"grid":"list"}" aria-label="${kv==="list"?"Kart görünümü":"Liste görünümü"}">${kv==="list"?ICON_GRID:ICON_LIST}</button>
    <span class="kmw"><button class="kic" data-act="kmenu" aria-label="Diğer" aria-haspopup="menu" aria-expanded="${!!S.f.kmenu}">${ICON_DOTS}</button>${S.f.kmenu?`<button class="kmx" data-act="kmenu" aria-label="Menüyü kapat" tabindex="-1"></button><div class="kmenu" role="menu"><span class="kml">Sırala</span><div class="kpills" role="group" aria-label="Sırala">${[["ovr","Reyting"],["mv","Değer"],["form","Form"],["isim","İsim"]].map(([k,l])=>`<button data-act="ksort" data-v="${k}" class="${sort===k?"on":""}" aria-pressed="${sort===k}">${l}</button>`).join("")}</div><hr>${mi("cmpOpen","Karşılaştır")}${S.admin?mi("addSheet","Oyuncu ekle")+mi("sqMode","As / yedek seç"):""}</div>`:""}</span></div>
    <div class="chips kchips" role="group" aria-label="Mevkiye göre">${[["all","Tümü"],...POS_KEYS.map(k=>[k,k])].map(([k,l])=>`<button data-act="filter" data-v="${esc(k)}" class="${flt===k||(k==="all"&&(flt==="as"||flt==="yedek"))?"on":""}">${l}</button>`).join("")}</div>`;
  if(S.admin&&S.f.sqMode)h+=`<div class="sqbar"><span><b>As / yedek seçiliyor</b><small>${nAs} as · ${nYd} yedek</small></span><button class="btn sm primary" data-act="sqMode">Bitti</button></div>`;
  if(S.admin&&S.f.sqMode)return h+(ps.length?`<section class="card" style="gap:0">${ps.map(p=>`<div class="sqrow">${avatar(p)}<span class="sqn"><b>${esc(p.name)}</b><span class="muted small">${eposOf(p)} · ${ovrOf(p.id)}</span></span><div class="vtog" role="group" aria-label="${esc(p.name)} kadro"><button data-act="setSq" data-id="${esc(p.id)}" data-v="" class="${p.yedek?"":"on"}" aria-pressed="${!p.yedek}">As</button><button data-act="setSq" data-id="${esc(p.id)}" data-v="1" class="${p.yedek?"on":""}" aria-pressed="${!!p.yedek}">Yedek</button></div></div>`).join("")}</section>`:"");
  h+=ps.length?(kv==="grid"?`<div class="cards">${ps.map(p=>card(p)).join("")}</div>`:`<div class="plist">${ps.map((p,i)=>listRow(p,i+1)).join("")}</div>`):`<section class="card"><div class="empty"><h3>${S.players.length?"Bu mevkide oyuncu yok":"Kadro boş"}</h3><p>${S.admin?"Sağ üstteki düğmeyle oyuncu ekle.":"Yönetici oyuncuları ekleyince kartlar burada görünür."}</p></div></section>`;
  return h;
}
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
      <span class="lsub">${S.f.sort==="mv"&&S.tab==="kartlar"?`<span class="mvt">${fM(mvOf(p.id))}</span>${ageOf(p)!=null?`<span class="muted small">${ageOf(p)} yaş</span>`:""}`:S.f.sort==="form"&&S.tab==="kartlar"?formNotes(s):`<span class="pchip">${eposOf(p)}</span>${altOf(p)?`<span class="pchip alt">${altOf(p)}</span>`:""}${p.guest?"":p.yedek?'<span class="pchip sqc">Yedek</span>':'<span class="pchip sqa">As</span>'}`}${flag}</span></span>
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
function attrInputs(prefix,pos,attrs){
  return `<div class="attrs-grp">${attrSet(pos).map(([k,l,full,subs])=>`<div class="ag"><div class="agh"><b>${l}</b><span>${full}</span><b class="num agv" id="${prefix}_m_${k}">${mainVal(attrs,k,pos)}</b></div><div class="attrs-in">${subs.map(([sk,sl])=>{const v=subVal(attrs,k,sk);const kk=k+"_"+sk;
    return `<label for="${prefix}_${kk}">${sl}<span class="val"><input type="range" min="30" max="95" id="${prefix}_${kk}" data-attr="${prefix}" data-k="${kk}" value="${v}"><input type="number" min="30" max="95" inputmode="numeric" data-attr="${prefix}" data-k="${kk}" value="${v}" aria-label="${sl} değeri"></span></label>`}).join("")}</div></div>`).join("")}</div>`;
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
function viewBen(){return memCard()+_viewBen()+`<button class="btn block ghost" data-act="tab" data-tab="ayarlar">${ICON.ayar} Ayarlar</button>`+verTxt()}
function verTxt(){const v=APP_V;if(!/^\d{12}$/.test(v))return"";const d=new Date(Date.UTC(2000+ +v.slice(0,2),+v.slice(2,4)-1,+v.slice(4,6),+v.slice(6,8),+v.slice(8,10)));const p=n=>String(n).padStart(2,"0");return `<p class="vtx">Sürüm ${p(d.getDate())}.${p(d.getMonth()+1)} ${p(d.getHours())}:${p(d.getMinutes())}</p>`}
function _viewBen(){const p=P(S.me);if(!p)return `<section class="card"><div class="empty"><h3>Kim olduğunu seç</h3><p>Kendi kartını, formunu ve maçlarını görmek için oyuncunu seç.</p><button class="btn primary" data-act="meSheet">Kimsin?</button></div></section>`;
  const s=S.stats[p.id]||{};const om=openMatch();
  let h=`<div class="mehd">${avatar(p)}<div><b>${esc(p.name)}</b><span>${eposOf(p)} · ${EPOS[eposOf(p)][1]}${p.yedek?" · Yedek kadro":""}</span></div>${isMember()&&!S.admin?"":`<button class="btn sm" data-act="meSheet">Değiştir</button>`}</div>`;
  {const yr=curYr();const F=fin().filter(m=>+m.season===+yr);let n=0,g=0,a=0,t=0;
    for(const m of F){const r=S.mInfo[m.id]?.pts?.[p.id];if(!r)continue;n++;g+=r.g||0;a+=r.a||0;t+=r.pts}
    const L=F.length?ligTable(F):[];const li=L.findIndex(o=>o.id===p.id);const rk=li<0?null:li+1;
    const nx=om?(()=>{const d=parseYmd(om.date);const k=om.state!=="kayit"&&sideOf(om,p.id);return `<button class="bsn" data-act="tab" data-tab="mac"><span>Sıradaki maç · ${GKISA[d.getDay()]} ${d.getDate()} ${AYLAR[d.getMonth()].slice(0,3)} ${esc(String(om.time||"").slice(0,5))}</span><b>${om.state==="kayit"?"Kadro bekleniyor":k?"Takımın "+esc(TEAM[k]):"Kadroda değilsin"} ›</b></button>`})():"";
    h+=`<section class="card bsz"><div class="eyebrow">Sezon ${yr} · senin</div><div class="bszg">
      <div><b class="num">${n}</b><small>Maç</small></div><div><b class="num">${g}</b><small>Gol</small></div><div><b class="num">${a}</b><small>Asist</small></div>
      <div><b class="num">${n?fN(t/n):"–"}</b><small>Ort. not</small></div><div><b class="num">${rk?rk+".":"–"}</b><small>Lig sırası</small></div></div>${nx}</section>`}
  if(!s.games)h+=`<section class="card"><div class="empty"><h3>Kartın uykuda</h3><p>İlk maçına çık, kartın uyanır. Notların, formun ve rozetlerin burada birikecek.</p></div></section>`;
  h+=`<section class="card benprof">${sheetPlayer(p.id,true)}</section>`;
  return h}
const trq=t=>String(t||"").toLocaleLowerCase("tr").replace(/[çğıöşü]/g,c=>({ç:"c",ğ:"g",ı:"i",ö:"o",ş:"s",ü:"u"})[c]);
function sheetMe(){
  const ps=[...S.players].sort((a,b)=>a.name.localeCompare(b.name,"tr"));
  if(!ps.length)return `<div class="ch"><div><h2>Sen kimsin?</h2></div></div><p class="muted">Henüz oyuncu eklenmemiş.</p><div class="row"><button class="btn sm" data-act="close">Kapat</button></div>`;
  const om=openMatch(),rs=om?.rsvp||{};const lastId=S.me||LS.get("y_me_last")||"";const used=new Set();
  const row=p=>{used.add(p.id);return `<button class="mer${p.id===S.me?" on":""}" data-act="pickMe" data-id="${esc(p.id)}" data-q="${esc(trq(p.name))}">${avatar(p)}<span class="mern"><b>${esc(p.name)}</b><small>${esc(eposOf(p))}${p.yedek?" · yedek":""}</small></span><span class="o num">${ovrOf(p.id)}</span></button>`};
  const sec=(l,arr)=>arr.length?`<div class="mes"><div class="mel">${l}</div>${arr.map(row).join("")}</div>`:"";
  let h=`<div class="ch"><div><h2>Sen kimsin?</h2></div></div><label class="mesr">${ICON_SRCH}<input id="meQ" type="search" placeholder="İsmini yaz" autocomplete="off" autocapitalize="off" spellcheck="false" aria-label="İsmini ara"></label><div id="meL">`;
  const lp=lastId&&P(lastId);
  if(S.me&&lp){used.add(lp.id);h=h.replace('<label class="mesr">',`<div class="mecur">${avatar(lp)}<span><small>Şu an sen</small><b>${esc(lp.name)}</b></span><button class="btn sm" data-act="pickMe" data-id="">Çıkış</button></div><label class="mesr">`)}
  else if(lp)h+=sec("Bu cihazda son",[lp]);
  if(om)h+=sec("Bu hafta gelenler",ps.filter(p=>rs[p.id]==="g"&&!used.has(p.id)));
  const rest=ps.filter(p=>!used.has(p.id));const G={};rest.forEach(p=>{const L=p.name.trim()[0].toLocaleUpperCase("tr");(G[L]=G[L]||[]).push(p)});
  Object.keys(G).forEach(L=>{h+=sec(L,G[L])});
  h+=`<p class="muted small mee" hidden>Bu isimde oyuncu yok.</p></div><div class="row"><button class="btn sm" data-act="close">Kapat</button></div>`;
  return h}
function meFilter(q){q=trq(q.trim());const L=$("#meL");if(!L)return;let any=0;
  L.querySelectorAll(".mes").forEach(sc=>{let n=0;sc.querySelectorAll(".mer").forEach(b=>{const ok=!q||b.dataset.q.includes(q)||b.dataset.q.split(" ").some(w=>w.startsWith(q));b.hidden=!ok;if(ok)n++});sc.hidden=!n;any+=n});
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
    <div class="pasub"><span class="hd">ALT ÖZELLİKLER · EN İYİ 6</span>${subs.slice(0,6).map(([l,v])=>`<span>${esc(l)} <b class="num">${v}</b></span>`).join("")}</div>
    <details class="padet"><summary>Tüm alt özellikler</summary>${attrDetail(p)}</details></section>`}
function sheetPlayer(pid,inline){
  const p=P(pid||S.sheet.id);if(!p)return"";const s=S.stats[p.id]||{};const st=stOf(p);const canSt=S.admin;
  const sf=S.f.st||(S.f.st={type:st,until:p.status?.until||"",note:p.status?.note||""});
  const ph=photoOf(p.id);const nm=p.name.trim().split(/\s+/);const first=nm.length>1?nm.slice(0,-1).join(" "):"";const last=nm[nm.length-1];
  const tab=S.f.ptab||"genel";const sd=lastSide(p.id);
  let h=`<div class="pph pph${sd}">${inline?"":`<button class="pphx" data-act="close" aria-label="Kapat">${ICON.x}</button>`}
    <div class="pphl"><span class="pphpos">${reigningChamp()===p.id?'<em class="pchmp">🏆 Son şampiyon</em>':""}${EPOS[eposOf(p)][1]}${altOf(p)?" · "+EPOS[altOf(p)][1]:""}</span><h2>${first?`<small>${esc(first)}</small>`:""}${esc(last)}</h2>
      <div class="pphk"><span><b class="num">${ovrOf(p.id)}</b><small>Reyting</small></span><span><b class="num">${fN1(mvOf(p.id))}<i class="mvu">M€</i></b><small>Değer</small></span>${ageOf(p)!=null?`<span><b class="num">${ageOf(p)}</b><small>Yaş</small></span>`:`<span><b>${eposOf(p)}</b><small>Mevki</small></span>`}<span><b class="num">${s.games||0}</b><small>Maç</small></span></div></div>
    <div class="pphp">${ph?`<img src="${esc(ph)}" alt="">`:SILH}</div></div>
    <div class="ptabs" role="tablist" aria-label="Oyuncu">${[["genel","Genel"],["ist","İstatistik"],["mac","Maçlar"]].map(([k,l])=>`<button role="tab" data-act="ptab" data-v="${k}" aria-selected="${tab===k}" class="${tab===k?"on":""}">${l}</button>`).join("")}</div>`;
  if(tab==="ist"){h+=pSeasonHtml(p)+attrRadar(p);return h}
  if(tab==="mac"){h+=`
    <div><h3>Son maçlar</h3>${(s.hist||[]).length?`<div class="patl">${(s.hist||[]).slice(-8).reverse().map(x=>{const inf=S.mInfo[x.m.id]||{};
      if(x.kind!=="oynadi")return `<button class="patm x" data-act="viewm" data-id="${esc(x.m.id)}"><span class="d">${fmtShort(x.m.date)}</span><span class="t">${x.kind==="iptal"?"Son dakika iptal":"Maça gelmedi"}</span></button>`;
      const r=x.r,res=r.res==="G"?"Galibiyet":r.res==="B"?"Beraberlik":"Mağlubiyet";
      const tags=[NOTE.perf[r.pk]?`<i>${NOTE.perf[r.pk][1]} oynadı</i>`:"",inf.motm===p.id?'<i class="st">★ Maçın adamı</i>':"",(inf.totw||[]).includes(p.id)?"<i>Haftanın takımı</i>":"",inf.gol===p.id?"<i>Haftanın golü</i>":"",inf.fiy===p.id?'<i class="dn">Fiyasko</i>':"",x.od?`<i class="${x.od>0?"up":"dn"}">Reyting ${x.od>0?"+":"−"}${Math.abs(x.od)}</i>`:"",...(x.ch||[]).map(([k,v,c])=>`<i class="${v>0?"up":v<0?"dn":""}">${esc(SUBN[k]||k)} ${v?fD(v):c==="tavan"?"zirvede":"dipte"}</i>`)].filter(Boolean).join("");
      return `<button class="patm ${r.res}" data-act="viewm" data-id="${esc(x.m.id)}"><span class="d">${fmtShort(x.m.date)} · ${res}</span><span class="t">${ROLE_NAME[r.role]}<span>${r.g?" · "+r.g+" gol":""}${r.a?" · "+r.a+" asist":""}</span></span>${tags?`<span class="m">${tags}</span>`:""}<span class="n ${noteCls(r.pts)}">${fN(r.pts)}</span></button>`}).join("")}</div>`:'<p class="muted small" style="padding:8px 0">Henüz maç kaydı yok.</p>'}
    </div>
    ${(()=>{const E=extFin().filter(m=>(m.team_a||[]).includes(p.id));if(!E.length)return"";const o={G:0,B:0,M:0};let g=0,a=0;E.forEach(m=>{o[extRes(m)]++;g+=+(m.stats||{})[p.id]?.g||0;a+=+(m.stats||{})[p.id]?.a||0});
      return `<div><h3>Dış maçlar</h3><div class="kv" style="margin-top:8px"><div><span>Maç</span><b>${E.length}</b></div><div><span>G-B-M</span><b style="font-size:1.1rem">${o.G}-${o.B}-${o.M}</b></div><div><span>Gol</span><b>${g}</b></div><div><span>Asist</span><b>${a}</b></div></div></div>`})()}
    ${chemHtml(p)}
    <div><h3>Rozetler</h3><div class="pabd">${(s.badges||[]).map(b=>`<span class="${b.shame?"shame":""}"><i>${esc(b.i)}</i><span><b>${esc(b.t)}</b><small>${esc(b.d)}</small></span></span>`).join("")||'<span class="muted small">Henüz rozet yok.</span>'}</div></div>`;return h}
  h+=`<div class="prof"><div style="display:grid;gap:10px;min-width:0">${trophyCase(p.id)}${mvCard(p)}${rtHist(s)}</div>
    <div style="display:grid;gap:12px;min-width:0">
      <div class="row">${st==="hazir"?'<span class="chip ok"><span class="dot"></span>Hazır</span>':stChip(p)}${s.streak?`<span class="chip ${s.streak.hot?"warn":"info"}">${s.streak.hot?"🔥":"❄️"} ${esc(s.streak.t)}</span>`:""}${p.status?.note?`<span class="muted small">${esc(p.status.note)}</span>`:""}<button class="btn sm" data-act="cmpOpen" data-id="${esc(p.id)}">${ICON.scale} Karşılaştır</button></div>
      ${profStats(p,s,true)}
    </div></div>`;
  if(inline)return h;
  if(canSt)h+=`<div style="display:grid;gap:10px"><h3>Durumu güncelle</h3>
    <div class="statuses">${Object.entries(STATUS).map(([k,v])=>`<button data-act="stType" data-v="${k}" class="${sf.type===k?"on":""}">${v.label}</button>`).join("")}</div>
    ${sf.type!=="hazir"?`<div class="grid2"><label class="f" for="stUntil">Tahmini dönüş<input id="stUntil" type="date" data-bind="st.until" value="${esc(sf.until)}"></label><label class="f" for="stNote">Not<input id="stNote" type="text" maxlength="60" data-bind="st.note" value="${esc(sf.note)}" placeholder="Örn. ayak bileği burkuldu"></label></div>`:""}
    ${UNAVAIL.includes(sf.type)?'':""}
    <button class="btn primary block" data-act="saveStatus">Durumu kaydet</button>
    ${(p.status_log||[]).length?`<details><summary class="small">Durum geçmişi</summary><div class="hist">${p.status_log.slice().reverse().map(e=>`<div style="grid-template-columns:4.4em 1fr"><span class="d">${fmtShort(e.at)}</span><span>${esc(STATUS[e.type]?.label||e.type)}${e.note?" · "+esc(e.note):""}</span></div>`).join("")}</div></details>`:""}</div>`;
  if(S.admin){const ph=photoOf(p.id);
    h+=`<div class="phrow"><span class="av ${tierOf(ovrOf(p.id))}${ph?" hasph":""}">${ph?`<img src="${esc(ph)}" alt="">`:SIL}</span><div style="flex:1;min-width:0"><b>Oyuncu fotoğrafı</b><p class="muted small">${S.f.phBusy?"Yükleniyor…":""}</p></div>
      <label class="btn sm primary" for="phFile">${ph?"Değiştir":"Yükle"}</label><input class="vh" id="phFile" type="file" accept="image/*" data-photo="${esc(p.id)}">${ph?`<button class="btn sm ghost" data-act="delPhoto" data-id="${esc(p.id)}" aria-label="Fotoğrafı kaldır">${ICON.x}</button>`:""}</div>`}
  if(S.admin){const a=S.f.ed||(S.f.ed={name:p.name,pos:p.pos,epos:eposOf(p),alt:altOf(p),yedek:p.yedek?"1":"",attrs:{...(p.attrs||{})}});
    h+=`<details${S.f.edOpen?" open":""} data-act-toggle="edOpen"><summary>Kartı düzenle (yönetici)</summary><div style="display:grid;gap:12px;margin-top:10px">
      <label class="f" for="edName">Ad<input id="edName" type="text" data-bind="ed.name" value="${esc(a.name)}" maxlength="40"></label>
      <div class="grid2"><label class="f" for="edPos">Mevki${posSelect("edPos","ed.epos",a.epos)}</label><label class="f" for="edAlt">Alternatif mevki${posSelect("edAlt","ed.alt",a.alt,true,a.epos)}</label></div>
      ${sqSelect("edSq","ed.yedek",a.yedek)}
      ${attrInputs("ed",a.pos,a.attrs)}
      <span class="muted small">Başlangıç reytingi: <b class="num" id="ed_ovr" style="color:var(--ink)">${baseOf({pos:a.pos,epos:a.epos,attrs:a.attrs})}</b></span>
      <button class="btn primary block" data-act="saveCard">Kaydet</button>
      <button class="btn danger sm" data-act="delPlayer">${S.f.delP===p.id?"Kadrodan çıkarmak için tekrar bas":"Kadrodan çıkar"}</button>
      </div></details>`}
  return h;
}
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
  let h=oyTabs("lig");
  if(!L.length)return h+`<section class="card"><div class="empty"><h3>Henüz biten maç yok</h3><p>İlk maç bitince puan durumu burada oluşur.</p></div></section>`+champWall();
  // geçen haftaya göre sıra değişimi: son maç günü hariç tablo
  const lastD=F.length?F[F.length-1].date:null;const PF=F.filter(m=>m.date!==lastD);const prev=PF.length?ligTable(PF,avg).map(o=>o.id):null;
  const fd=f=>f.slice(-5).map(r=>`<i class="lf ${r}" title="${r==="G"?"Galibiyet":r==="B"?"Beraberlik":"Mağlubiyet"}"></i>`).join("");
  const elg=avg?L.filter(o=>o.n>=2).length:L.length;const nb=elg>=6?elg-3:-1;const MED=["g1","g2","g3"];
  const pt=o=>avg?fN(o.ppm):String(o.p);
  const sy=selYr();let champId=null;if(sy!=="all"&&!avg){const done=seasonDone(sy);const rem=done?0:Math.max(0,sLen()-seasonCount(sy));if(L.length>1&&(done||L.slice(1).every(r=>r.p+3*rem<L[0].p)))champId=L[0].id;
    if(done&&L[0]){const cp=P(L[0].id);h+=`<button class="card sfb" data-act="seasonStory" data-id="${sy}"><span class="sfbi">🏆</span><span><small>Sezon ${sy} şampiyonu</small><b>${esc(cp.name)}</b><span>Sezon özetini izle</span></span><i>${ICON_PLAY}</i></button>`}}

  h+=`<section class="card lig"><div class="lgr lgh"><span>#</span><span>Oyuncu</span><span>O</span><span>G</span><span>B</span><span>M</span><span>AV</span><span>${avg?"P/M":"P"}</span><span class="r">Form</span></div>`+
    L.map((o,i)=>{const p=P(o.id);let mv="";if(prev){const j=prev.indexOf(o.id);const d=j<0?0:j-i;mv=d>0?`<small class="lmv up">▲${d}</small>`:d<0?`<small class="lmv dn">▼${-d}</small>`:""}
      return `<button class="lgr${o.id===S.me?" me":""}${i===nb?" rl":""}${avg&&o.n<2?" few":""}" data-act="open" data-id="${esc(o.id)}" aria-label="${esc(p.name)}: ${i+1}. sıra, ${o.p} puan, averaj ${o.av}"><span class="lrk${i<3?" "+MED[i]:""}"><b>${i+1}</b>${mv}</span><span class="lnm">${avatar(p)}<span>${esc(p.name.length>10?shortName(p.name):p.name)}${o.id===champId?'<em class="chmp" title="Şampiyon">🏆</em>':""}</span></span><span class="num">${o.n}</span><span class="num">${o.G}</span><span class="num">${o.B}</span><span class="num">${o.M}</span><span class="num lav${o.av>0?" pos":o.av<0?" neg":""}">${o.av>0?"+":""}${o.av}</span><b class="num lp">${pt(o)}</b><span class="lfs">${fd(o.f)}</span></button>`}).join("")+`</section>`;
  const cw=champWall();
  return h+cw}
function viewSezon(){
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
  let h=`${oyTabs("sezon")}`;
  if(!F.length)h+=`<section class="card"><div class="empty"><h3>Sezon yeni başlıyor</h3><p>Krallık yarışı boş, ilk golü atan zirveye yerleşir.</p></div></section>`;
  if(F.length)h+=mvpHtml(F);
  if(F.length)h+=`<div class="tsx"><h2>Öne çıkanlar</h2><button class="tsall${S.f.sezAll?" on":""}" data-act="tog" data-k="sezAll">${S.f.sezAll?"Daha az":"Tüm istatistikler"} ${CHV}</button></div><div class="boards">${board("Gol",x=>x.g,x=>x.g,null,false,x=>x.a,null,null)}${board("Asist",x=>x.a,x=>x.a,null,false,x=>x.g,null,null)}</div>`;
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
  if(F.length)h+=posRaceHtml(F);
  if(F.length&&S.f.sezAll)h+=`<div class="boards">${board("Not ortalaması",x=>x.aN,x=>fN(x.aN),x=>x.games>=minG,false,x=>x.games,y=>"gerçek ort. "+fN(y.pts/y.games)+" · "+y.games+" maç")}${board("Haftanın takımı",x=>x.totw,x=>x.totw,null,false,x=>x.pts/x.games)}
    ${board("Galibiyet yüzdesi",x=>x.aW,x=>"%"+Math.round(x.aW*100),x=>x.games>=minG,false,x=>x.games,y=>"gerçek %"+Math.round(y.W/y.games*100)+" · "+y.W+"/"+y.games+" maç")}${board("Galibiyet",x=>x.W,x=>x.W,null,false,x=>x.D)}${board("Sezonun en iyi tek maçı",x=>x.best,x=>fN(x.best))}
    ${board(yr==="all"?"En çok yükselenler":"Sezonun yükselenleri",x=>x.dOvr||0,x=>"+"+x.dOvr)}${board("Kalede maç başı yenen gol",x=>x.aK,x=>fN(x.aK),x=>x.klG>=minK,true,x=>x.klG,y=>"gerçek "+fN(y.klC/y.klG)+" · "+y.klG+" maç kalede")}${board("En çok maç",x=>x.games,x=>x.games,null,false,x=>x.W)}${board("Fiyasko",x=>x.fiy,x=>x.fiy)}</div>`;
  if(K12&&(K12[0]||K12[1])&&S.f.sezAll)h+=`<div class="boards">${K12[0]}${K12[1]}</div>`;
  return h;
}

/* ================= Puanlama ================= */
function viewKurallar(inSheet){
  const n=NOTE;const row=(a,b)=>`<div><span>${a}</span><b>${b}</b></div>`;const f=x=>x>0?"+"+fN(x):x<0?"−"+fN(-x):"0";
  const RL=[["KL","Kaleci"],["DF","Defans"],["DOS","Defansif orta saha"],["OS","Orta saha"],["FV","Forvet"]];
  return `
  <section class="card"><h2>Piyasa değeri</h2><p class="muted small">FC 27'deki oyuncu değerlerinden ayarlandı. Her maçtan sonra güncellenir.</p><div class="rules">${row("Reyting","her reytingin sabit değeri var: 65 = 5 M €, 70 = 9 M €, 75 = 16 M €, 80 = 30 M €, 85 = 47 M €, 90 = 62,6 M €, 100 = 90 M €")}${row("Kaleci","×0,85")}${row("Yaş","15 yaş ×1,2 · 22 yaş ×1,1 · 27 yaş ×1 · 31 yaş ×0,93 · 35+ ×0,85, aralar kademeli")}${row("Form","en az 3 maç oynayanlarda son 5 maçın not ortalaması 7'nin üstündeyse +, altındaysa −; en fazla ±%15")}${row("Devamlılık","en az 5 maç oynandıktan sonra, son 8 maçın katılımına göre en fazla ±%10; yedeklere uygulanmaz")}${row("Kupalar","son sezonun her kupası +%5, daha eskiler +%2")}${row("Taban","en düşük 1 M €")}</div></section>
  <section class="card"><h2>Maç notu</h2><p>Sahada yapılanlar (sonuç, gol, asist, yenilen gol, değerlendirme) toplanır. Sonra <b>maç dengesi</b> uygulanır: maçtaki ortadaki oyuncu ${fN(n.orta)} alacak şekilde herkesin notu aynı miktarda kaydırılır. Böylece notlar şişmez, kim maçın ortalamasının üstünde kim altında net görünür. Not ${fN(n.tavan)}'i geçerse aşan kısım yarı sayılır.</p>
   <p class="muted small">Değerlendirme notun aralığını belirler. Aralığın dışına taşan kısmın dörtte biri sayılır:</p>
   <div class="rules">${[1,2,3,4].map(k=>{const[lo,hi]=n.bant[k];return row(n.perf[k][1],k===1?"en az "+fN(lo):k===4?"en fazla "+fN(hi):fN(lo)+" – "+fN(hi))}).join("")}</div></section>
  <section class="card"><h2>Sonuç</h2><div class="scroll-x"><table class="tbl"><thead><tr><th>Gol farkı</th><th>Kazanan</th><th>Kaybeden</th></tr></thead><tbody>
   ${n.fark.map((x,i)=>`<tr><td>${["0 · beraberlik","1–2 · çekişmeli","3–5 · net","6+ · farklı"][i]}</td><td>${f(x[1])}</td><td>${f(x[2])}</td></tr>`).join("")}</tbody></table></div></section>
  <section class="card"><h2>Gol ve asist</h2><p class="muted small">Oyuncu o maç sahada hangi mevkide oynadıysa ona göre sayılır. Bölgesinden uzak katkı daha değerli.</p>
   <div class="scroll-x"><table class="tbl"><thead><tr><th>Mevki</th><th>Gol</th><th>Asist</th><th>Katkı yok</th></tr></thead><tbody>
   ${RL.map(([k,l])=>`<tr><td>${l}</td><td>${f(n.gol[k])}</td><td>${f(n.asist[k])}</td><td>${n.bos[k]?f(n.bos[k]):"–"}</td></tr>`).join("")}</tbody></table></div>
   <p class="muted small">İlk 3 gol tam, 4. ve 5. gol ×0,6, 6. golden sonrası ×0,3 sayılır. Penaltı golü normal golün yarısıdır. Bol gollü maçta orta saha ve forvetin gol ve asist değeri düşer: maçta 12 gol varsa ×1, 16 gol ×0,75 (en az ×0,7), 10 gol ×1,15 (en fazla).</p></section>
  <section class="card"><h2>Yenilen gol</h2><p class="muted small">Grubun maç başı gol ortalamasına göre bakılır (şu an <b>${fN(gyOrt())}</b>). Ortalamanın altında gol yiyen savunma artı alır, üstünde yiyen eksi.</p><div class="scroll-x"><table class="tbl"><thead><tr><th>Ortalamaya göre</th><th>Kaleci</th><th>Defans</th><th>Def. orta saha</th></tr></thead><tbody>
   ${n.savunma.map(([lim,v],i)=>`<tr><td>${i===0?Math.abs(lim)+"+ az":i===n.savunma.length-1?(n.savunma[i-1][0]+1)+"+ fazla":(()=>{const a=n.savunma[i-1][0]+1,b=lim;const t=x=>x<0?Math.abs(x)+" az":x>0?x+" fazla":"aynı";return a===b?t(a):t(a)+" – "+t(b)})()}</td><td>${f(v.KL)}</td><td>${f(v.DF)}</td><td>${f(v.DOS)}</td></tr>`).join("")}</tbody></table></div><p class="muted small">Kalecinin yediği penaltı golleri yarım gol sayılır.</p></section>
  <section class="card"><h2>Maç değerlendirmesi</h2><p class="muted small">Maç sonunda yönetici oyuncuları değerlendirir. Sınır yok; seçilmeyen oyuncu orta sayılır. Kurtarış sayısı tutulmadığı için kalecide değerlendirme daha ağır sayılır.</p>
   <div class="scroll-x"><table class="tbl"><thead><tr><th></th><th>Saha oyuncusu</th><th>Kaleci</th></tr></thead><tbody>${[1,2,3,4].map(k=>`<tr><td>${n.perf[k][1]}</td><td>${f(n.perf[k][0])}</td><td>${f(n.perfKL[k])}</td></tr>`).join("")}</tbody></table></div>
   <div class="rules">${row("Çizgiden çıkarma","+ forvetin o maçtaki gol değeri")}${row("Penaltı yaptırma","− forvet gol değerinin yarısı")}${row("Penaltı kaçırma","− atsaydı kazanacağı kadar")}${row("Penaltı kurtarma","+ forvetin o maçtaki gol değeri")}</div></section>
  <section class="card"><h2>Herkes için</h2><div class="rules">${row("Maçın Adamı",f(n.motm))}${row("Fiyasko",f(n.fiy)+" (Kötü de seçildiyse "+f(n.fiy*n.fiyKotu)+")")}${row("Kendi kalesine gol",f(n.kk))}</div></section>
  <section class="card"><h2>Kart</h2><p>Eşik notu <b>maçın not ortalamasıdır</b>. Notu bunun üstünde olanın kartı yükselir, altında olanınki düşer: <b>kart değişimi = (not − eşik) × ${String(n.kat).replace(".",",")}</b>, tek maçta en fazla ±${fN(n.katMax)}. Bir maçta yükselenlerle düşenlerin toplamı sıfıra yakındır, reytingler toplu şişmez.</p>
   <p class="muted small">Yüksek kartlı oyuncudan beklenti de yüksektir: maçtaki ortalama karttan her 1 puan yukarıda olan için eşik ${String(n.esikAdim).replace(".",",")} artar, aşağıda olan için azalır.</p></section>
  <section class="card"><h2>Karttaki özellikler</h2><p>Kart değişimi, maçta yapılan işe göre özelliklere dağıtılır: gol bitiriciliğe, asist pasa, defansın gol katkısı vizyon ve şut gücüne, az gol yemek savunmaya ya da reflekse yazılır. Özel bir iş yoksa kartın en önemli özelliği değişir.</p>
   <div class="rules">${row("Maça gelmeyen","kartı değişmez")}${row("Yedek kadrodaki oyuncu","Gelmemek kartı etkilemez")}${row("4 maç üst üste gelmek","Dayanıklılık +2")}${row("Reyting","küsüratlı hesaplanır, kartta tam kısmı görünür (74,99 → 74)")}${row("Bir özellik başlangıçtan en fazla","±8")}${row("Eski maçların etkisi her maç","%5 azalır")}</div>
   <p class="muted small">Haftanın Takımı, form ve ortalamalar da maç notuna göre hesaplanır.</p></section>
  <section class="card"><h2>Sezon ve ödüller</h2><div class="rules">${row("Sezon",sLen()+" maç; puan durumu ve istatistikler her sezon sıfırlanır, reyting devam eder")}${row("Şampiyon","puan durumunda birinci")}${row("Gol ve asist kralı","en çok gol / asist; eşitlikte daha az maçta yapan")}
   ${row("Sezonun oyuncusu","mevki fark etmeksizin sezonda en çok Yelek puanı toplayan")}${row("Mevki ödülleri","Yelek puanı: her maçta mevkinin en iyi 3 notu 3-2-1 puan (6 altı puan almaz); gol forvette +1, orta sahada +1,25, defansta +1,5; asist forvette +0,5, orta sahada +0,75, defans ve kalecide +1; kaleci ve defans, maç notundaki gol yeme aralığına göre puan alır: ortalamanın 3 gol altı kaleci +1,6 / defans +1,3, 1 gol altı +1 / +0,8, ortalama civarı +0,3 / +0,2. Puanın hepsi sezonda en çok oynanan mevkide sayılır")}
   ${row("Düzeltilmiş ortalama","her oyuncuya 3 maç ekip ortalaması eklenmiş gibi hesaplanır; az maçla gelen tek parlak not öne geçemez")}</div></section>`;
}

/* ================= Ayarlar ================= */
/* ===== Giriş, takım üyeliği ve vitrin ===== */
const AUTH={sb:null,ready:false,lib:null};
const authHdr=()=>S.session?.access_token?{Authorization:"Bearer "+S.session.access_token}:{};
const SBJS="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js";
const authLib=()=>AUTH.lib||(AUTH.lib=new Promise((ok,no)=>{if(window.supabase)return ok(window.supabase);const s=document.createElement("script");s.src=SBJS;s.onload=()=>ok(window.supabase);s.onerror=()=>{AUTH.lib=null;no(new Error("lib"))};document.head.appendChild(s)}));
const isMember=()=>S.mem&&S.mem.status==="onayli";
const gated=()=>!!S.gate&&!isMember();
async function authInit(){
  LS.del("y_davet");const need=LS.get("y_auth")||/[?&]code=/.test(location.search)||S.gate;
  if(!need){AUTH.ready=true;return}
  await authStart()}
async function authStart(){
  if(AUTH.sb)return AUTH.sb;
  let lib;try{lib=await authLib()}catch(_){toast("Giriş servisi yüklenemedi, bağlantını kontrol et");return null}
  AUTH.sb=lib.createClient(SB_URL,SB_KEY,{auth:{flowType:"pkce",detectSessionInUrl:true,persistSession:true,autoRefreshToken:true,storageKey:"y_auth"}});
  try{const{data}=await AUTH.sb.auth.getSession();S.session=data.session||null}catch(_){S.session=null}
  AUTH.sb.auth.onAuthStateChange((ev,ses)=>{const was=S.session?.user?.id;S.session=ses||null;if((ses?.user?.id||null)!==(was||null))afterAuth()});
  if(/[?&]code=/.test(location.search))history.replaceState(null,"",location.pathname+location.hash);
  await afterAuth();AUTH.ready=true;return AUTH.sb}
async function afterAuth(){
  const prevMem=S.mem;S.mem=null;
  if(S.session){
    try{S.mem=await rpc("my_membership",{});try{const c=JSON.parse(localStorage.getItem("y_cache")||"null");if(c){c.mem=S.mem;localStorage.setItem("y_cache",JSON.stringify(c))}}catch(_){}}catch(_){S.mem=prevMem}
    if(isMember()){if(S.mem.player_id){S.me=S.mem.player_id;LS.set("y_me",S.me)}
      if(S.mem.role==="yonetici"){S.admin=true;S.pin=S.pin||"";setTimeout(notesSync,1500)}
      if(!LS.get("y_hos")&&!S.sheet)S.sheet={type:"hos"}}
    if(S.sheet&&S.sheet.type==="login")S.sheet=null;if(S.gate&&!isMember()&&!S.vit)vitrinLoad()}
  else S.admin=false;
  await load(true);render(true)}
async function signIn(provider){const sb=await authStart();if(!sb)return;
  const{error}=await sb.auth.signInWithOAuth({provider,options:{redirectTo:location.origin+location.pathname}});
  if(error)toast(provider==="apple"?"Apple ile giriş şu an açık değil":"Google ile giriş şu an açık değil")}
async function signOut(){if(AUTH.sb){try{await AUTH.sb.auth.signOut()}catch(_){}}S.session=null;S.mem=null;S.admin=false;cacheClear();LS.del("y_me");S.me="";render(true);load(true)}
const G_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6a5.1 5.1 0 0 1-2.2 3.4v2.8h3.6c2-1.9 3.2-4.7 3.2-8.3z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.4-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.9A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.7 14c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7H2a11 11 0 0 0 0 9.9z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2 7l3.7 2.9C6.6 7.3 9.1 5.4 12 5.4z"/></svg>';
const APPLE_SVG='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7a4.6 4.6 0 0 0-3.6-2c-1.5-.2-3 .9-3.7.9s-2-.9-3.2-.8a4.8 4.8 0 0 0-4 2.4c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8s1.9.8 3.2.8 2.1-1.2 2.9-2.4a10 10 0 0 0 1.3-2.7c-.1 0-2.3-.9-2.3-3.9zM14 5.4a4.3 4.3 0 0 0 1-3.1 4.4 4.4 0 0 0-2.9 1.5 4.1 4.1 0 0 0-1 3c1.1.1 2.2-.5 2.9-1.4z"/></svg>';
function loginBtns(){return `<div class="lgb"><button class="btn block lgg" data-act="oauth" data-v="google">${G_SVG} Google ile devam et</button></div>`}
function sheetLogin(){
  return `<div class="ch"><div><div class="eyebrow">${IGH}</div><h2>Giriş yap</h2></div><button class="btn sm" data-act="close">Kapat</button></div>
   <p class="muted" style="margin:0 0 14px">Google hesabınla giriş yap, sonra listeden kendi kartını seç. Yönetici onaylayınca kartın hesabına bağlanır.</p>${loginBtns()}
   <p class="muted small" style="margin:14px 0 0">Yalnızca adın, e-postan ve profil fotoğrafın yöneticiye görünür. Şifre tutulmaz.</p>`}
function claimList(){const g=S.gate&&!isMember();if(g){if(!S.vit){vitrinLoad();return[]}return(S.vit.players||[]).map(p=>({id:p.id,n:p.n}))}return S.players.map(p=>({id:p.id,n:p.name}))}
function claimForm(sel,btn){const L=claimList().sort((a,b)=>a.n.localeCompare(b.n,"tr"));const v=S.f.claim||sel||"";
  return `<div class="clm"><label class="f" for="claimSel">Hangisi sensin?<select id="claimSel" data-bind="claim"><option value="">Kartını seç…</option>${L.map(p=>`<option value="${esc(p.id)}"${p.id===v?" selected":""}>${esc(p.n)}</option>`).join("")}</select></label><button class="btn primary sm" data-act="joinReq">${btn}</button></div>`}
function memCard(){if(!S.session)return `<section class="card mcard"><div><b>Hesabınla giriş yap</b><p class="muted small">Kartın hesabına bağlanır, başkası senin adına işlem yapamaz.</p></div><button class="btn primary sm" data-act="loginSheet">Giriş yap</button></section>`;
  const st=S.mem?.status||"yok";const em=esc(S.session.user?.email||"");
  if(st==="bekliyor"){const cl=S.mem.claim;const nm=cl&&(claimList().find(p=>p.id===cl)||{}).n;
    return `<section class="card mcard wait col"><div><b>Onay bekleniyor</b><p class="muted small">${em} hesabıyla ${nm?`<b>${esc(nm)}</b> olarak `:""}katılma isteğin yöneticiye iletildi. Onaylanınca kartın bağlanır ve uygulama açılır.</p></div>${waitPush()}${claimForm(cl,cl?"Değiştir":"Gönder")}<button class="lnk" data-act="signOut">Çıkış yap</button></section>`}
  if(st==="reddedildi")return `<section class="card mcard"><div><b>İsteğin onaylanmadı</b><p class="muted small">Bir yanlışlık olduysa yöneticiyle konuş.</p></div><button class="btn ghost sm" data-act="signOut">Çıkış</button></section>`;
  if(st==="yok")return `<section class="card mcard col"><div><b>Takıma katıl</b><p class="muted small">${em} ile giriş yaptın. Listeden kendi kartını seç, istek yöneticiye gitsin.</p></div>${claimForm("","Katılma isteği gönder")}<button class="lnk" data-act="signOut">Çıkış yap</button></section>`;
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
  const pc=m=>{const cl=m.claim&&P(m.claim);const sel=f["p_"+m.user_id]||m.claim||"";const adm=!!f["r_"+m.user_id];
    return `<div class="mreq"><div class="mrqh">${av(m)}<span class="setx"><b>${esc(m.name||"İsimsiz")}</b><small>${esc(m.email||"")}</small></span></div>
      <p class="mcl">${cl?`Kendini <b>${esc(cl.name)}</b> olarak tanıttı`:"Kart seçmedi, aşağıdan sen bağla"}</p>
      <label class="f">Bağlanacak kart<select data-bind="mem.p_${esc(m.user_id)}">${opt(sel)}</select></label>
      <button class="mrl${adm?" on":""}" data-act="memRole" data-id="${esc(m.user_id)}" role="switch" aria-checked="${adm}"><span><b>Yönetici yap</b><small>Ayarları ve üyeleri yönetebilir</small></span><i class="sw ${adm?"on":""}"><i></i></i></button>
      <div class="btns2"><button class="btn ghost" data-act="memNo" data-id="${esc(m.user_id)}">Reddet</button><button class="btn primary" data-act="memOk" data-id="${esc(m.user_id)}">Onayla</button></div></div>`};
  const or=m=>{const pl=m.player_id&&P(m.player_id);const me=m.user_id===myId;const ask=S.f.memDel===m.user_id;
    return `<div class="setr nolink">${av(m)}<span class="setx"><b>${esc(pl?pl.name:(m.name||m.email))}${m.role==="yonetici"?' <i class="mtag">Yönetici</i>':""}</b><small>${esc(m.email||"")}${pl?"":" · kart bağlı değil"}</small></span>
      ${me?'<span class="mme">Sen</span>':ask?`<button class="btn sm danger" data-act="memNo" data-id="${esc(m.user_id)}">Kaldır</button><button class="btn sm ghost" data-act="memDel" data-id="">Vazgeç</button>`:`<button class="mdel" data-act="memDel" data-id="${esc(m.user_id)}" aria-label="Üyeliği kaldır">${ICON.x}</button>`}</div>`};
  return `${pend.length?`<section class="sgrp"><h3>Bekleyen istekler · ${pend.length}</h3><div class="mreqs">${pend.map(pc).join("")}</div></section>`:""}
    <section class="sgrp"><h3 class="mh3">Onaylı üyeler · ${ok.length}<button class="mref" data-act="memLoad" aria-label="Yenile">${ICON.refresh||"Yenile"}</button></h3><div class="sbox">${ok.map(or).join("")||'<p class="muted small" style="padding:14px;margin:0">Henüz onaylı üye yok.</p>'}</div></section>
    <p class="snote">Linki açan kişi Google ile giriş yapıp kendi kartını seçer, isteği buraya düşer. Sen onaylamadan uygulamayı göremez.</p>`}

/* vitrin: giriş yapmamış ziyaretçiye görünen sayfa */
async function vitrinLoad(){try{S.vit=await rpc("vitrin",{})}catch(_){S.vit=null}render(true)}
function viewVitrin(){const v=S.vit;if(!v){vitrinLoad();return `<div class="vskl"><i></i><i></i><i></i></div>`}
  const N={};(v.players||[]).forEach(p=>N[p.id]=p.n);const M=v.matches||[];const last=M[M.length-1];
  const t={};M.forEach(m=>{for(const[k,ids]of[["a",m.ta||[]],["b",m.tb||[]]]){const my=k==="a"?m.a:m.b,op=k==="a"?m.b:m.a;const r=my>op?"G":my<op?"M":"B";ids.forEach(id=>{if(!N[id])return;const o=t[id]||(t[id]={id,G:0,B:0,M:0,av:0});o[r]++;o.av+=my-op})}});
  const L=Object.values(t).map(o=>({...o,n:o.G+o.B+o.M,p:o.G*3+o.B})).sort((x,y)=>y.p-x.p||y.G-x.G||y.av-x.av||x.n-y.n||N[x.id].localeCompare(N[y.id],"tr"));
  let rk=0,pv=null;L.forEach((o,i)=>{const k=o.p+"|"+o.G+"|"+o.av;if(k!==pv){rk=i+1;pv=k}o.rk=rk});
  const top=L.slice(0,10);
  const sc=(m,k)=>Object.entries(m.g||{}).filter(([id])=>((k==="a"?m.ta:m.tb)||[]).includes(id)&&N[id]).sort((a,b)=>b[1]-a[1]).map(([id,g])=>`<span>${esc(N[id])}${g>1?` <b>×${g}</b>`:""}</span>`).join("")||'<span class="vnone">Gol yok</span>';
  const nA=last?(last.na||TEAM.A):"",nB=last?(last.nb||TEAM.B):"";
  const res=last?(last.a===last.b?"Berabere":(last.a>last.b?nA:nB)+" kazandı"):"";
  const nx=v.next;let dw="";if(nx){dw=dayWord(nx.date);if(!dw){const d=Math.round((parseYmd(nx.date)-new Date().setHours(0,0,0,0))/864e5);if(d>1)dw=d+" gün sonra"}}
  const cta=S.session?memCard():`<section class="card vcard"><button class="btn vgo" data-act="oauth" data-v="google">${G_SVG}<span>Google ile giriş yap</span></button><p class="vnote">Takımdaysan giriş yap, kartını seç. Yönetici onaylayınca her şey açılır.</p></section>`;
  return `<section class="vhero"><div class="vlogo">${IGLOGO}</div><h1>Abiler Kardeşler FC</h1><p>Her hafta halı sahada iki takım.</p>
     <div class="vstats"><span><b>${v.season||"–"}</b>Sezon</span><span><b>${M.length}</b>Maç</span><span><b>${Object.keys(t).length}</b>Oyuncu</span></div>
     <a class="vig" href="https://instagram.com/abilerkardeslerfc" target="_blank" rel="noopener">${IG_SVG}<span>${IGH}</span></a></section>
   ${cta}
   ${last?`<section class="card vlast"><div class="vlh"><span class="eyebrow">Son maç</span><span class="vdate">${fmtShort(last.date)}</span></div>
     <div class="vsc"><div class="vtm">${crest(nA,"A",44,nB)}<b>${esc(nA)}</b></div><div class="vmid"><span class="num"><b>${last.a}</b><i></i><b>${last.b}</b></span><small>${esc(res)}</small></div><div class="vtm">${crest(nB,"B",44,nA)}<b>${esc(nB)}</b></div></div>
     <div class="vgl"><div>${sc(last,"a")}</div><div>${sc(last,"b")}</div></div></section>`:""}
   ${nx?`<section class="card vnext"><div><span class="eyebrow">Sıradaki maç</span><b>${fmtDate(nx.date)}</b></div><span class="vtime">${dw?`<em>${dw}</em>`:""}${nx.time?esc(String(nx.time).slice(0,5)):""}</span></section>`:""}
   ${top.length?`<section class="card vlig"><div class="ch"><h2>Lig tablosu</h2><span class="muted small">Sezon ${v.season} · ${M.length} maç</span></div>
     <div class="vrow vhd"><span>#</span><span>Oyuncu</span><span>O</span><span>G</span><span>B</span><span>M</span><span>P</span></div>
     ${top.map(o=>`<div class="vrow${o.rk<=3?" t"+o.rk:""}"><span><i>${o.rk}</i></span><span class="vnm">${esc(N[o.id])}</span><span>${o.n}</span><span>${o.G}</span><span>${o.B}</span><span>${o.M}</span><span class="vp">${o.p}</span></div>`).join("")}
     ${L.length>10?`<p class="muted small vmore">+${L.length-10} oyuncu daha · tamamı takım içinde</p>`:""}</section>`:""}
   <p class="vfoot"><a href="gizlilik.html">Gizlilik</a><span>·</span><a href="https://instagram.com/abilerkardeslerfc" target="_blank" rel="noopener">${IGH}</a></p>`}


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
async function pushOn(){if(PUSH.st==="ios"){S.f.setp="tel";S.tab="ayarlar";render(true);toast("Önce uygulamayı ana ekrana ekle");return}
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
const pushSub=()=>({acik:"Takımlar ve maç sonuçları"+(S.admin?", katılma istekleri":""),kapali:"Kapalı",red:"İzin kapalı · telefon ayarlarından aç",ios:"Önce ana ekrana eklemelisin",yok:"Bu tarayıcıda desteklenmiyor","?":"…"}[PUSH.st]||"");
function waitPush(){const st=PUSH.st;if(st==="acik")return `<p class="wpush on">${SI.zil} Onaylanınca bildirim gelecek.</p>`;
  if(st==="kapali")return `<button class="btn block wpush" data-act="pushOn">${SI.zil} Onaylanınca bana haber ver</button>`;
  if(st==="ios")return `<p class="wpush">${SI.zil} Onaylanınca haber almak için önce uygulamayı ana ekrana ekle: Paylaş → Ana Ekrana Ekle.</p>`;return""}
function pushRow(){if(!S.session||!isMember())return"";const on=PUSH.st==="acik",can=PUSH.st==="acik"||PUSH.st==="kapali"||PUSH.st==="ios";
  return `<div class="setr nolink"><span class="seti">${SI.zil}</span><span class="setx"><b>Bildirimler</b><small>${pushSub()}</small></span>${can?`<button class="sw ${on?"on":""}" data-act="${on?"pushOff":"pushOn"}" role="switch" aria-checked="${on}" aria-label="Bildirimler" ${PUSH.busy?"disabled":""}><i></i></button>`:""}</div>`}
function pushAsk(){if(!S.session||!isMember()||LS.get("y_pushask")||!(PUSH.st==="kapali"||PUSH.st==="ios"))return"";
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
const SUBT={gecmis:"Değişiklik geçmişi",uyeler:"Üyeler",grup:"Ekip ve saha",sezon:"Sezon",tel:"Telefona ekle",pay:"Takıma gönder",pin:"Yönetici girişi"};
function setSub(k){const url=location.origin+location.pathname;
  let h=`<button class="sback" data-act="setp" data-v="">${ICON.back} Ayarlar</button>`;
  if(k==="uyeler")h+=adminMembers();
  else if(k==="gecmis")h+=adminAudit();
  else if(k==="grup"&&S.admin){const s=S.f.set||(S.f.set={...S.settings});h+=`<section class="card"><form data-form="settings" style="display:grid;gap:12px">
      <label class="f" for="sGroup">Ekip adı<input id="sGroup" type="text" maxlength="40" data-bind="set.group_name" value="${esc(s.group_name)}"></label>
      <label class="f" for="sField">Halı saha adı<input id="sField" type="text" maxlength="60" data-bind="set.field_name" value="${esc(s.field_name)}" placeholder="Örn. Yıldız Halı Saha"></label>
      <div class="grid2"><label class="f" for="sDay">Maç günü<select id="sDay" data-bind="set.day">${GUNLER.map((g,i)=>`<option value="${i}"${+s.day===i?" selected":""}>${g}</option>`).join("")}</select></label>
      <label class="f" for="sTime">Maç saati${timeSel("sTime","set.time",s.time)}</label></div>
      <button class="btn primary block" type="submit">Kaydet</button></form></section>`}
  else if(k==="sezon"&&S.admin){const n=seasonCount(curYr()),L=sLen();h+=`<section class="card szc"><div class="szh"><span class="eyebrow">Şu an</span><b>Sezon ${curYr()}</b><small>${n}/${L} maç oynandı${seasonDone(curYr())?" · tamamlandı":""}</small></div>
      <div class="szd">${Array.from({length:L},(_,i)=>`<i class="${i<n?"on":""}"></i>`).join("")}</div>${seasonDone(curYr())?'<p class="snote" style="margin:0">Bir sonraki maç yeni sezonu başlatır.</p>':""}</section>
    <section class="card" style="display:grid;gap:12px"><label class="f" for="sLen">Bir sezondaki maç sayısı<select id="sLen" data-bind="sLen">${[4,5,6,7,8,9,10,12,14,16].map(n=>`<option value="${n}"${n===+(S.f.sLen||sLen())?" selected":""}>${n} maç</option>`).join("")}</select></label>
      <button class="btn primary block" data-act="seasonSave">Kaydet</button></section>
    ${seasonDone(curYr())||!n?"":`<section class="card szx"><b>Sezonu erken bitir</b><p class="snote" style="margin:0">Oynanan maçlarla sezon kapanır, şampiyon belli olur. Geri alınamaz.</p><button class="btn ghost danger block" data-act="seasonClose">${S.f.sClose?"Emin misin? Sezon "+curYr()+" şimdi bitsin":"Sezonu şimdi bitir"}</button></section>`}`}
  else if(k==="tel")h+=`<p class="snote" style="margin:0 4px 10px">Ana ekrana eklersen uygulama gibi tam ekran açılır.</p><div class="sbox">
    <div class="setr nolink tels"><span class="seti">${SI.tel}</span><span class="setx"><b>iPhone · Safari</b><span>Alttaki <b>Paylaş</b> düğmesine bas, <b>Ana Ekrana Ekle</b>'yi seç.</span></span></div>
    <div class="setr nolink tels"><span class="seti">${SI.tel}</span><span class="setx"><b>Android · Chrome</b><span>Sağ üstteki <b>üç noktaya</b> bas, <b>Ana ekrana ekle</b>'yi seç.</span></span></div></div>`;
  else if(k==="pay")h+=`<section class="card" style="display:grid;gap:12px"><p class="muted small" style="margin:0">Takımdan biri linki açınca Google ile giriş yapar, kendi kartını seçer; sen onaylayınca uygulama açılır.</p>
    <div class="surl"><input type="text" readonly value="${esc(url.replace(/^https?:\/\//,""))}" id="shareUrl" aria-label="Uygulama linki"></div>
    <div class="btns2"><a class="btn wa" href="https://wa.me/?text=${encodeURIComponent("⚽ "+S.settings.group_name+" artık Yelek'te. Kartına ve kadroya buradan bak: "+url)}" target="_blank" rel="noopener">${ICON.wa} WhatsApp</a><button class="btn" data-act="copy" data-txt="${esc(url)}">${ICON.copy} Kopyala</button></div></section>`;
  else if(k==="pin"){h+=`<section class="card"><form data-form="login" style="display:grid;gap:10px"><label class="f" for="pin">Şifre<input id="pin" type="password" autocomplete="current-password" data-bind="pin" value="${esc(S.f.pin||"")}"></label><button class="btn primary block" type="submit">Giriş yap</button></form></section>`}
  return h}
function viewAyarlar(){
  const k=S.f.setp||"";if(k)return setSub(k);
  const adm=S.admin,pend=(S.memList||[]).filter(m=>m.status==="bekliyor").length,okN=(S.memList||[]).filter(m=>m.status==="onayli").length;
  if(adm&&!S.memList&&S.mem?.role==="yonetici")memLoad();
  let h="";
  if(S.session){const u=S.session.user||{};const md=u.user_metadata||{};const p=S.me&&P(S.me);
    h+=`<section class="sacc">${md.avatar_url?`<img src="${esc(md.avatar_url)}" alt="" referrerpolicy="no-referrer">`:`<span class="sav">${esc(initials(md.full_name||u.email||"?"))}</span>`}<span class="setx"><b>${esc(md.full_name||md.name||u.email||"")}</b><small>${esc(u.email||"")}</small><small>${p?esc(p.name)+" kartına bağlı":"Kart bağlı değil"}${S.mem?.role==="yonetici"?' · <i class="mtag">Yönetici</i>':""}</small></span></section>`}
  if(adm&&pend)h+=`<button class="salert" data-act="setp" data-v="uyeler"><b>${pend} katılma isteği</b><span>Onaylamak için dokun</span><i>›</i></button>`;
  if(adm)h+=sgrp("Takım",[
    S.mem?.role==="yonetici"?srow("uyeler",SI.uye,"Üyeler",S.memList?`${okN} onaylı${pend?` · ${pend} bekliyor`:""}`:"Yükleniyor…",pend?`<span class="sbadge">${pend}</span>`:""):"",
    S.mem?.role==="yonetici"?`<div class="setr nolink"><span class="seti">${SI.kilit}</span><span class="setx"><b>Uygulamayı kilitle</b><small>${S.gate?"Sadece onaylı üyeler görür":"Linki bilen herkes görür"}</small></span><button class="sw ${S.gate?"on":""}" data-act="gateSet" data-v="${S.gate?"0":"1"}" role="switch" aria-checked="${S.gate}" aria-label="Uygulamayı kilitle"><i></i></button></div>`:"",
    srow("grup",SI.grup,"Ekip ve saha",`${esc(S.settings.group_name||"")} · ${GUNLER[+S.settings.day]||""} ${esc(S.settings.time||"")}`),
    srow("sezon",SI.sezon,"Sezon",`Sezon ${curYr()} · ${seasonCount(curYr())}/${sLen()} maç`),
    S.mem?.role==="yonetici"?srow("gecmis",SI.gecmis,"Değişiklik geçmişi","Kim neyi ne zaman değiştirdi"):""]);
  h+=sgrp("Uygulama",[
    pushRow(),
    srow("@rulesSheet",SI.kural,"Puanlama kuralları","Not, reyting ve yelek puanı nasıl hesaplanır"),
    srow("tel",SI.tel,"Telefona ekle","Uygulama gibi ana ekrandan aç"),
    srow("pay",SI.pay,"Takıma gönder","WhatsApp ya da link"),
    !S.session?srow("@loginSheet",SI.kilit,"Giriş yap","Google hesabınla"):""]);
  if(S.session)h+=sgrp("",[srow("@signOut",SI.cik,"Çıkış yap","","","danger")]);
  return h+verTxt()}

/* ================= Olaylar ================= */
document.addEventListener("click",async e=>{
  const tb=e.target.closest(".nav button[data-tab]");if(tb){if(tb.dataset.tab===S.tab){window.scrollTo({top:0,behavior:RM?"auto":"smooth"});return}goTab(tb.dataset.tab,true);return}
  const el=e.target.closest("[data-act]");if(!el)return;try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}const a=el.dataset.act;if(a==="closeBg"&&e.target!==el)return;const id=el.dataset.id;const t=S.teams;
  switch(a){
    case"tab":if(el.dataset.tab==="ayarlar")S.f.setp="";goTab(el.dataset.tab);break;
    case"ptab":S.f.ptab=el.dataset.v;render(true);{const sh=document.querySelector(".sheet");if(sh)sh.scrollTop=0}break;
    case"open":S.f.ptab="genel";S.sheet={type:"player",id};S.f.st=null;S.f.ed=null;S.f.delP=null;render(true);break;
    case"meSheet":if(isMember()&&!S.admin){S.tab="ben";S.view=null;render(true);break}if(S.me&&P(S.me)&&S.tab!=="ben"&&el.id==="meBtn"){S.tab="ben";S.view=null;render(true);window.scrollTo(0,0)}else{S.sheet={type:"me"};render(true)}break;
    case"tog":S.f[el.dataset.k]=!S.f[el.dataset.k];render(true);break;
    case"setNames":{const m=S.matches.find(x=>x.id===id);const w=S.f["nm_"+id]||{};const a=cleanName(w.a??m.name_a??""),b=cleanName(w.b??m.name_b??"");if(!a||!b){toast("İki takımın adını da yaz");break}
      const r=await A("admin_set_names",{p_id:id,p_a:a,p_b:b},"Takım isimleri kaydedildi");if(r){delete S.f["nm_"+id];await load(true)}break}
    case"shareMenu":S.sheet={type:"share",mid:id};render(true);break;
    case"storyCard":{const p=P(id);if(p)storyCard(p);break}
    case"storyTotw":{const m=S.matches.find(x=>x.id===id);if(S.sheet&&S.sheet.type==="share"){S.sheet=null;render(true)}if(m)storyTotw(m);break}
    case"storyRes":case"storyMotm":{if(S.story)stPause(true);const m=S.matches.find(x=>x.id===id);if(S.sheet&&S.sheet.type==="share"){S.sheet=null;render(true)}if(m)shareStory(m,a==="storyMotm"?"motm":"res");break}
    case"addSheet":S.sheet={type:"add"};render(true);break;
    case"pickMe":if(!id&&S.me)LS.set("y_me_last",S.me);S.me=id||"";if(S.me){LS.set("y_me",S.me);LS.set("y_me_last",S.me)}if(S.me)LS.set("y_me",S.me);else LS.del("y_me");S.sheet=null;if(S.me){S.tab="ben";S.view=null}else if(S.tab==="ben")S.tab="mac";render(true);if(S.me)toast("Merhaba "+firstName(nameOf(S.me))+"!");break;
    case"close":case"closeBg":if(S.sheet&&S.sheet.type==="hos")LS.set("y_hos","1");S.sheet=null;render(true);break;
    case"hosOk":LS.set("y_hos","1");S.sheet=null;render(true);break;
    case"audLoad":S.audit=null;render(true);break;
    case"oauth":signIn(el.dataset.v);break;
    case"loginSheet":S.sheet={type:"login"};render(true);break;
    case"signOut":signOut();break;
    case"joinReq":{const pid=S.f.claim||S.mem?.claim;if(!pid){toast("Önce kartını seç");break}try{const r=await rpc("request_join",{p_player:pid});if(r&&r.ok){toast("İsteğin yöneticiye gönderildi");S.mem=await rpc("my_membership",{});S.f.claim="";render(true)}else toast("İstek gönderilemedi")}catch(_){toast("İstek gönderilemedi")}break}
    case"gateSet":{const on=el.dataset.v==="1";const r=await act("admin_set_gate",{p_pin:"",p_gate:on},on?"Uygulama kilitlendi":"Kilit kaldırıldı");if(r){S.gate=on;await load(true)}break}
    case"memLoad":S.memList=null;render(true);break;
    case"retry":load(true);break;
    case"pushOn":pushOn();break;
    case"pushOff":pushOff();break;
    case"pushNo":LS.set("y_pushask","1");render(true);break;
    case"memDel":S.f.memDel=id||"";render(true);break;
    case"memRole":{const f=S.f.mem||(S.f.mem={});f["r_"+id]=!f["r_"+id];render(true);break}
    case"setp":S.f.setp=el.dataset.v||"";render(true);window.scrollTo(0,0);break;
    case"memOk":{const f=S.f.mem||{};const pid=f["p_"+id]||(S.memList||[]).find(m=>m.user_id===id)?.claim||null;if(!pid){toast("Önce bağlanacak kartı seç");break}const r=await A("admin_member_decide",{p_user:id,p_status:"onayli",p_player:pid,p_role:f["r_"+id]?"yonetici":"uye"},"Üye onaylandı");if(r&&r.error==="player_taken")toast("Bu kart başka bir hesaba bağlı");memLoad();break}
    case"memNo":{const r=await A("admin_member_decide",{p_user:id,p_status:"reddedildi",p_player:null,p_role:null},"Üyelik kaldırıldı");S.f.memDel="";memLoad();break}
    case"invCopy":{const v=el.dataset.v;try{await navigator.clipboard.writeText(v);toast("Link kopyalandı")}catch(_){toast("Kopyalanamadı, linki elle seç")}break}
    case"pmOpen":S.f.pm=S.f.pm||{tab:"mac",fmt:"post"};S.sheet={type:"pm"};render(true);break;
    case"pmTab":S.f.pm.tab=el.dataset.v;S.f.pm.item=null;render(true);break;
    case"pmItem":S.f.pm.item=el.dataset.v;render(true);break;
    case"pmFmt":S.f.pm.fmt=el.dataset.v;render(true);break;
    case"pmRace":S.f.pm.race=el.dataset.v;render(true);break;
    case"pmCopy":{const t=$("#pmCap");if(t){try{await navigator.clipboard.writeText(t.value);toast("Açıklama kopyalandı")}catch(_){t.select();document.execCommand&&document.execCommand("copy");toast("Açıklama kopyalandı")}}break}
    case"pmGo":await pmGo(el.dataset.v);break;
    case"filter":S.filter=el.dataset.v;render(true);break;
    case"cmpOpen":S.sheet={type:"cmp",a:id||S.me||"",b:id&&S.me&&id!==S.me?S.me:""};render(true);break;
    case"cmpPair":S.sheet={type:"cmp",a:el.dataset.a,b:el.dataset.b};render(true);break;
    case"prS":{const k="pr_"+el.dataset.m;const d=S.f[k];if(!d)break;d[el.dataset.side]=clamp(d[el.dataset.side]+(+el.dataset.d),0,40);render(true);break}
    case"predict":{const d=S.f["pr_"+id];if(!d||!S.me)break;const r=await act("predict",{p_match:id,p_player:S.me,p_a:d.a,p_b:d.b},"Tahminin kaydedildi");if(r)S.f["pr_"+id]=null;break}
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
    case"ksort":S.f.sort=el.dataset.v;S.f.kmenu=false;render(true);break;
    case"setSq":{const p=P(id);if(!p)break;const v=!!el.dataset.v;if(!!p.yedek===v)break;p.yedek=v;render(true);await A("admin_set_yedek",{p_id:id,p_yedek:v},p.name+(v?" yedek kadroda":" as kadroda"));break}
    case"sqf":S.f.sq=el.dataset.v;render(true);break;
    case"kview":S.f.kmenu=false;S.f.kv=el.dataset.v;LS.set("y_kv",S.f.kv);render(true);break;
    case"rkAll":S.f.rkAll=!S.f.rkAll;render(true);break;
    case"back":S.view=null;render(true);window.scrollTo(0,0);break;
    case"mtab":S.f.mtab=el.dataset.v;render(true);break;
    case"seasonStory":stSeason(+id);break;
    case"shareSeason":{if(S.story)stPause(true);await shareSeason(+id);break}
    case"seasonSave":{const L=+(S.f.sLen||sLen());await A("admin_season",{p_len:L,p_close:false},"Sezon ayarı kaydedildi");await load(true);break}
    case"seasonClose":{if(!S.f.sClose){S.f.sClose=1;render(true);break}S.f.sClose=0;await A("admin_season",{p_len:sLen(),p_close:true},"Sezon bitirildi");await load(true);break}
    case"story":S._stChain=false;stOpen(id,0);break;
    case"stDetail":stClose();S.view=id;S.tab="gecmis";render(true);window.scrollTo(0,0);break;
    case"stX":stClose();break;
    case"viewm":S.view=id;S.tab="gecmis";render(true);window.scrollTo(0,0);break;
    case"createMatch":{const na=cleanName(S.f.newNameA||""),nb=cleanName(S.f.newNameB||"");if(!na||!nb){toast("İki takımın adını da yaz");break}
      const r=await A("admin_create_match",{p_date:S.f.newDate||nextDay(+S.settings.day),p_time:S.f.newTime||S.settings.time},"Maç açıldı, şimdi kadroyu kur");if(r&&r.id){await A("admin_set_names",{p_id:r.id,p_a:na,p_b:nb});S.f.newNameA=S.f.newNameB="";TEAM.A=na;TEAM.B=nb;startEditor(r.id,[],[]);S.teams.poolOpen=true;render(true)}break}
    case"perf":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f[el.dataset.s||"sd_"+el.dataset.m];if(!m||!sd)break;sd.perf=sd.perf||{};const pid=el.dataset.p,v=+el.dataset.v;
      if(sd.perf[pid]===v){delete sd.perf[pid]}else{sd.perf[pid]=v}
      S.f.confirmFinish=null;if(sd.events)sdSave(m,sd);render(true);break}
    case"exAdd":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f[el.dataset.s||"sd_"+el.dataset.m];const k=el.dataset.k;const pid=(S.f.exSel||{})[k];if(!m||!sd)break;if(!pid){toast("Önce oyuncuyu seç");break}
      sd[k]=sd[k]||{};sd[k][pid]=(sd[k][pid]||0)+1;S.f.exSel[k]="";S.f.confirmFinish=null;if(sd.events)sdSave(m,sd);render(true);break}
    case"exDel":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f[el.dataset.s||"sd_"+el.dataset.m];const k=el.dataset.k,pid=el.dataset.p;if(!m||!sd||!sd[k])break;
      sd[k][pid]=(sd[k][pid]||0)-1;if(sd[k][pid]<=0)delete sd[k][pid];S.f.confirmFinish=null;if(sd.events)sdSave(m,sd);render(true);break}
    case"evalOpen":{const m=S.matches.find(x=>x.id===id);if(!m)break;S.f["ev_"+id]=exFrom(m.stats);S.sheet={type:"eval",mid:id};render(true);break}
    case"saveEval":{const m=S.matches.find(x=>x.id===id);const ev=S.f["ev_"+id];if(!m||!ev)break;const pl=plAll(m);const q=perfQuota(pl.length),c=[0,0,0,0];for(const pid of pl){const v=+ev.perf[pid];if(v)c[v-1]++}
      const ex={};for(const pid of pl){const o={};if(ev.perf[pid])o.k=ev.perf[pid];EXK.forEach(k=>{if((ev[k]||{})[pid])o[k]=ev[k][pid]});if(Object.keys(o).length)ex[pid]=o}
      const r=await A("admin_set_extras",{p_id:id,p_extras:ex},"Değerlendirme kaydedildi, kartlar güncellendi");if(r){delete S.f["ev_"+id];S.sheet=null;render(true)}break}
    case"restoreFin":{const r=await A("admin_restore_finished",{p_id:id},"Maç eski haliyle geri kapatıldı");if(r){delete S.f["sd_"+id];LS.del("y_sd_"+id);S.sheet=null;render(true)}break}
    case"setWhen":{const w=S.f["when_"+id]||{};const m=S.matches.find(x=>x.id===id);if(!m)break;const d=w.d||m.date,t=(w.t||m.time||"").slice(0,5);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(d)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(t)){toast("Tarih ve saati kontrol et");break}
      const r=await A("admin_set_when",{p_id:id,p_date:d,p_time:t},"Tarih ve saat güncellendi");if(r)delete S.f["when_"+id];break}
    case"delMatch":if(S.f.delMatch!==id){S.f.delMatch=id;render(true);break}S.f.delMatch=null;if(S.sheet&&S.sheet.type==="mng")S.sheet=null;S.teams=null;S.view=null;delete S.f["sd_"+id];LS.del("y_sd_"+id);await A("admin_archive_match",{p_id:id},"Maç silindi, tüm etkileri geri alındı");break;
    case"rsvp":{if(el.disabled)break;const r=await act("rsvp",{p_match:el.dataset.m,p_player:el.dataset.p,p_value:el.dataset.v});if(r)toast(el.dataset.v==="g"?"Görüşürüz sahada!":el.dataset.v==="y"?"Yedek olarak yazıldı":"Gelemiyor olarak işlendi");break}
    case"copy":{const tx=el.dataset.txt;try{await navigator.clipboard.writeText(tx);toast("Kopyalandı")}catch(_){toast("Kopyalanamadı, metni elle seç")}break}
    case"balance":{const ids=t?[...t.A,...t.B]:[];if(ids.length<4){toast("Önce en az 4 oyuncu seç");break}const r=balanceIds(ids);S.draft=null;startEditor(id,r.A,r.B,t?.fa,t?.fb);render(true);break}
    case"editTeams":{const m=S.matches.find(x=>x.id===id);startEditor(id,m.team_a||[],m.team_b||[],m.form_a,m.form_b,m.lineup_a,m.lineup_b,m.pos_a,m.pos_b);render(true);break}
    case"ligAvg":S.f.ligAvg=el.dataset.v==="1";render(true);break;
    case"kTog":{if(!S.admin||el.disabled)break;const m=S.matches.find(x=>x.id===el.dataset.m);if(!m)break;const v=(m.rsvp||{})[el.dataset.p]==="g"?"n":"g";
      m.rsvp={...(m.rsvp||{}),[el.dataset.p]:v};render(true);const r=await act("rsvp",{p_match:m.id,p_player:el.dataset.p,p_value:v});if(!r){toast("Kaydedilemedi");await load()}break}
    case"autoKadro":{const m=S.matches.find(x=>x.id===id);if(!m)break;const ids=rsvpLists(m).kadro.map(p=>p.id);if(ids.length<4){toast("Önce en az 4 oyuncu işaretle");break}
      const r=balanceIds(ids);S.draft=null;startEditor(id,r.A,r.B);render(true);toast("Dengeli takımlar hazır");break}
    case"manual":{const m=S.matches.find(x=>x.id===id);S.draft=null;if(m.team_a&&m.team_a.length)startEditor(id,m.team_a,m.team_b,m.form_a,m.form_b,m.lineup_a,m.lineup_b,m.pos_a,m.pos_b);else startEditor(id,[],[],t?.fa,t?.fb);S.teams.poolOpen=true;render(true);break}
    case"backRsvp":await A("admin_set_state",{p_id:id,p_state:"kayit"},"Kadro aşaması yeniden açıldı");break;
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
    case"delPred":{const k=el.dataset.m+el.dataset.p;S.f.admPr=el.dataset.m;if(S.f.delPr!==k){S.f.delPr=k;render(true);break}S.f.delPr=null;
      const r=await A("admin_del_pred",{p_match:el.dataset.m,p_player:el.dataset.p},nameOf(el.dataset.p)+" tahmini silindi");break}
    case"undo":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f["sd_"+el.dataset.m];if(!sd||!sd.undo.length)break;const u=JSON.parse(sd.undo.pop());
      Object.assign(sd,{events:u.events,a:u.a,b:u.b,manual:u.manual,touched:u.touched,motm:u.motm,gol:u.gol||"",fiy:u.fiy||"",step:null});S.f.confirmFinish=null;sdSave(m,sd);toast("Geri alındı: "+u.l);render(true);break}
    case"draftDel":{if(S.f.delDraft!==id){S.f.delDraft=id;render(true);setTimeout(()=>{if(S.f.delDraft===id){S.f.delDraft=null;render()}},4000);break}
      S.f.delDraft=null;delete S.f["sd_"+id];LS.del("y_sd_"+id);S.f.confirmFinish=null;const m=S.matches.find(x=>x.id===id);if(S.sheet&&S.sheet.type==="stats"&&m)sdOf(m);toast("Taslak silindi");render(true);break}
    case"statSheet":{const m=S.matches.find(x=>x.id===id);if(m){sdOf(m);S.f.stTab="gol";S.sheet={type:"stats",mid:id};render(true)}break}
    case"zeroScore":{const m=S.matches.find(x=>x.id===id);const sd=S.f["sd_"+id];if(!sd)break;snap(sd,"0–0");sd.a=0;sd.b=0;sd.touched=true;sd.manual=true;sdSave(m,sd);render(true);break}
    case"sc":{const m=S.matches.find(x=>x.id===el.dataset.m);const sd=S.f["sd_"+el.dataset.m];if(!sd)break;snap(sd,"skor değişikliği");sd.touched=true;sd.manual=true;sd[el.dataset.side]=clamp(sd[el.dataset.side]+(+el.dataset.d),0,60);S.f.confirmFinish=null;sdSave(m,sd);render(true);break}
    case"fillScore":{const m=S.matches.find(x=>x.id===id);const sd=S.f["sd_"+id];if(!sd)break;snap(sd,"skor düzeltme");sd.manual=false;sd.touched=true;syncScore(m,sd);sdSave(m,sd);render(true);break}
    case"finish":{if(S.f.confirmFinish!==id){S.f.confirmFinish=id;render(true);break}S.f.confirmFinish=null;
      const sd=S.f["sd_"+id];const m=S.matches.find(x=>x.id===id);const so=statsOf(sd);const stats={};for(const pid of plAll(m)){const o=so[pid]||{};stats[pid]={g:+o.g||0,a:+o.a||0,og:+o.og||0};if(+o.pg)stats[pid].pg=+o.pg;if(+o.k)stats[pid].k=+o.k;EXK.forEach(k=>{if(+o[k])stats[pid][k]=+o[k]})}
      if(!sd.touched){toast("Önce skoru gir");break}
      {const pl0=plAll(m);const q=perfQuota(pl0.length),c=[0,0,0,0];for(const pid of pl0){const v=+(sd.perf||{})[pid];if(v)c[v-1]++}
}
      const pl=new Set(plAll(m));const links=sd.events.filter(e=>e.t==="g"&&pl.has(e.g)).map(x=>x.pk?{g:x.g,a:null,pk:true}:{g:x.g,a:x.a&&pl.has(x.a)&&sideOf(m,x.a)===sideOf(m,x.g)?x.a:null});
      const r=await A("admin_finish_match_v3",{p_id:id,p_score_a:sd.a,p_score_b:sd.b,p_stats:stats,p_motm:sd.motm||null,p_links:links});
      const sc=new Set(links.map(x=>x.g));const wasFin=m.state==="bitti";if(r)await A("admin_set_awards",{p_id:id,p_gol:sd.gol&&sc.has(sd.gol)?sd.gol:null,p_fiy:sd.fiy&&pl.has(sd.fiy)?sd.fiy:null},wasFin?"Maç güncellendi, kartlar yeniden hesaplandı":"Maç bitti, kartlar güncellendi");if(r){delete S.f["sd_"+id];LS.del("y_sd_"+id);S.sheet=null;await load(true);if(!wasFin){window.scrollTo(0,0);confetti();setTimeout(()=>{if(S.sheet)return;S.f.pm={tab:"mac",item:"skor",fmt:"post",mid:id};S.sheet={type:"pm"};render(true);toast("Maç sonucunu paylaş")},1800)}}break}
    case"reopen":{const m=S.matches.find(x=>x.id===id);if(!m)break;S.f.confReopen=null;delete S.f["sd_"+id];LS.del("y_sd_"+id);sdOf(m);S.f.stTab="gol";S.f.confirmFinish=null;S.sheet={type:"stats",mid:id};render(true);break}
    case"stType":S.f.st.type=el.dataset.v;render(true);break;
    case"saveStatus":{const p=P(S.sheet.id);const sf=S.f.st;await act("set_status",{p_player:p.id,p_type:sf.type,p_until:sf.type==="hazir"?null:(sf.until||null),p_note:sf.type==="hazir"?"":(sf.note||"")},"Durum güncellendi");S.f.st=null;render(true);break}
    case"saveCard":{const p=P(S.sheet.id);const a2=S.f.ed;if(!String(a2.name||"").trim()){toast("Ad boş olamaz");break}
      const ok=await A("admin_save_player_v2",{p_id:p.id,p_name:a2.name.trim(),p_pos:a2.pos,p_epos:a2.epos,p_alt:a2.alt||"",p_attrs:cleanAttrs(a2.pos,a2.attrs)},"Kart güncellendi");
      if(ok&&!!a2.yedek!==!!p.yedek)await A("admin_set_yedek",{p_id:p.id,p_yedek:!!a2.yedek},a2.yedek?"Yedek kadroya alındı":"As kadroya alındı");S.f.ed=null;render(true);break}
    case"delPlayer":{const p=P(S.sheet.id);if(S.f.delP!==p.id){S.f.delP=p.id;render(true);break}const r=await A("admin_archive_player",{p_id:p.id},"Oyuncu kadrodan çıkarıldı");if(r){S.sheet=null;render(true)}break}
    case"atVote":{const v=S.f.atVote||(S.seasonVotes.find(x=>x.voter===S.me)||{}).target;if(!v){toast("Bir oyuncu seç");break}await act("season_vote",{p_year:new Date().getFullYear(),p_voter:S.me,p_target:v},"Altın Top oyun kaydedildi");break}
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
  S.f.phBusy=true;render(true);
  try{const d=await photoData(file);const r=await A("admin_set_photo",{p_id:id,p_data:d},"Fotoğraf yüklendi");if(r){S.photos[id]=d}}
  catch(_){toast("Fotoğraf okunamadı, başka bir fotoğraf dene")}
  S.f.phBusy=false;render(true);
}
function cleanAttrs(pos,a){const o={};for(const[k,,,subs]of attrSet(pos)){for(const[sk]of subs)o[k+"_"+sk]=clamp(subVal(a,k,sk),30,95);o[k]=mainVal(o,k,pos)}return o}
document.addEventListener("submit",async e=>{
  const f=e.target.closest("[data-form]");if(!f)return;e.preventDefault();const kind=f.dataset.form;
  if(kind==="addPlayer"){const ap=S.f.ap;const name=String(ap.name||"").trim();if(!name){toast("Ad gir");return}
    const r=await A("admin_save_player_v2",{p_id:null,p_name:name,p_pos:ap.pos,p_epos:ap.epos,p_alt:ap.alt||"",p_attrs:cleanAttrs(ap.pos,ap.attrs)},name+" kadroya eklendi");
    if(r&&r.id&&ap.yedek)await A("admin_set_yedek",{p_id:r.id,p_yedek:true});
    if(r){S.f.ap={name:"",pos:ap.pos,epos:ap.epos,alt:"",yedek:ap.yedek||"",attrs:{}};render(true);setTimeout(()=>$("#apName")?.focus(),0)}}
  if(kind==="addGuest"){const t=S.teams;const name=String(S.f.guestName||"").trim();if(!t||!name){toast("Misafirin adını yaz");return}
    const k=t.view||"A";const r=await A("admin_add_guest",{p_name:name},name+" "+TEAM[k]+" takımına eklendi");
    if(r&&r.id){t[k].push(r.id);const L=t["l"+k.toLowerCase()];const e2=L.findIndex((x,i)=>i>0&&!x);if(e2>=0)L[e2]=r.id;S.f.guestName="";render(true)}}
  if(kind==="settings"){const s=S.f.set;await A("admin_save_settings_v2",{p_group:s.group_name,p_field:s.field_name,p_day:+s.day,p_time:s.time||"21:00",p_team_a:cleanName(s.team_a_name)||"Yelekliler",p_team_b:cleanName(s.team_b_name)||"Yeleksizler"},"Ayarlar kaydedildi");S.f.set=null;render(true)}
});
function setPath(path,v){const ks=path.split(".");let o=S.f;for(let i=0;i<ks.length-1;i++)o=o[ks[i]]||(o[ks[i]]={});o[ks[ks.length-1]]=v}
document.addEventListener("input",e=>{const t=e.target;
  if(t.id==="meQ"){meFilter(t.value);return}
  if(t.dataset.bind)setPath(t.dataset.bind,t.value);
  if(t.dataset.attr){const pre=t.dataset.attr,k=t.dataset.k;const obj=S.f[pre];if(!obj)return;const v=clamp(+t.value||30,30,95);obj.attrs[k]=v;
    document.querySelectorAll(`[data-attr="${pre}"][data-k="${k}"]`).forEach(x=>{if(x!==t)x.value=v});const mk=k.split("_")[0];const me=$("#"+pre+"_m_"+mk);if(me)me.textContent=mainVal(obj.attrs,mk,obj.pos);const o=$("#"+pre+"_ovr");if(o)o.textContent=baseOf({pos:obj.pos,epos:obj.epos,attrs:obj.attrs})}
});
document.addEventListener("change",e=>{const t=e.target;
  if(t.dataset.bind){setPath(t.dataset.bind,t.value);const bd=t.dataset.bind;
    if(bd==="ap.epos"||bd==="ed.epos"){const o=S.f[bd.slice(0,2)];o.pos=GROUP_POS[EPOS[o.epos][0]];if(o.alt===o.epos)o.alt=""}
    if(bd.startsWith("pm.")){render(true);return}
    if(["sort","wrapP","ap.epos","ed.epos","newDate","newTime","ext.motm","ext.date"].includes(bd)||bd.startsWith("when_"))render(true);return}
  if(t.dataset.cmp&&S.sheet&&S.sheet.type==="cmp"){S.sheet[t.dataset.cmp]=t.value;render(true);return}
  if(t.dataset.vote){const k="v_"+t.dataset.m;(S.f[k]||(S.f[k]={}))[t.dataset.vote]=t.value;return}
  if(t.dataset.photo&&t.files&&t.files[0]){uploadPhoto(t.dataset.photo,t.files[0]);t.value="";return}
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
  if(v&&v!=="dev"&&APP_V!=="dev"&&v!==APP_V){location.replace(location.pathname+"?v="+v+location.hash);return true}}catch(_){}return false}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){newVer().then(n=>{if(!n){load();wakeSync()}})}});
setInterval(()=>{if(document.visibilityState==="visible"&&!S.teams&&!S.draft&&!S.sheet)load()},25000);

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
const NOTE_TX=v=>v>=6.5&&v<7?"#37003C":"#FFFFFF";
/* Paylaşım görselleri: Gece Stadı dili. Koyu zemin, stadyum ışığı, buzlu cam kartlar, gece sahası, parlayan rozetler */
const SD='"Inter Tight",Inter,system-ui,sans-serif',SF='Inter,system-ui,sans-serif';
const C_INK="#37003C",C_DK="#FFFFFF",C_MUT="#6E5A72",C_BG="#F5F3F8",C_TB="#7B5CFF",C_V="#37003C";
const tcol=k=>k==="A"?"#1F2430":C_TB;
async function fontsOk(){try{await Promise.race([Promise.all([document.fonts.load('900 40px "Inter Tight"'),document.fonts.load('800 40px "Inter Tight"'),document.fonts.load('700 30px Inter'),document.fonts.ready]),new Promise(r=>setTimeout(r,1000))])}catch(_){}}
function storyBase(x,W,H){x.fillStyle=C_BG;x.fillRect(0,0,W,H);
  const BH=x.__bh||600;const g=x.createLinearGradient(0,0,W,BH);g.addColorStop(0,"#7B3FF2");g.addColorStop(.55,"#6A8BF5");g.addColorStop(1,"#5FD8F5");x.fillStyle=g;rr(x,0,-80,W,BH+80,64);x.fill();
  x.save();x.globalAlpha=.12;x.fillStyle="#fff";for(const[px,w]of[[W*.55,120],[W*.72,60],[W*.86,140]]){x.beginPath();x.moveTo(px,-80);x.lineTo(px+w,-80);x.lineTo(px+w-260,BH);x.lineTo(px-260,BH);x.closePath();x.fill()}x.restore();
  x.textAlign="center";x.textBaseline="alphabetic"}
function cHead(x,W,h,label,meta){
  x.save();rr(x,0,-60,W,h+60,56);x.clip();x.strokeStyle="rgba(255,255,255,.06)";x.lineWidth=4;x.beginPath();x.arc(W/2,h,300,Math.PI,0);x.stroke();x.beginPath();x.moveTo(0,h-2);x.lineTo(W,h-2);x.stroke();
  const g=x.createRadialGradient(W/2,h,20,W/2,h,700);g.addColorStop(0,"rgba(198,244,50,.10)");g.addColorStop(1,"rgba(198,244,50,0)");x.fillStyle=g;x.fillRect(0,0,W,h);x.restore();
  x.save();x.shadowColor="rgba(55,0,60,.25)";x.shadowBlur=14;rr(x,60,58,64,64,16);x.fillStyle="#fff";x.fill();x.restore();x.save();x.translate(60,58);x.fillStyle="#37003C";x.fill(new Path2D("M32 8.8l18.8 6v15.2c0 12.5-8.3 20.8-18.8 25.8C21.5 50.8 13.2 42.5 13.2 30V14.8z"));x.strokeStyle="#fff";x.lineWidth=4.8;x.lineCap="round";x.lineJoin="round";x.stroke(new Path2D("M23.2 22l8.8 11.5 8.8-11.5M32 33.5v12"));x.fillStyle="#00FF85";x.beginPath();x.arc(32,16,2,0,Math.PI*2);x.fill();x.restore();
  x.textAlign="left";x.fillStyle="#fff";x.font=`900 44px ${SD}`;x.fillText("YELEK",142,106);
  if(label){x.font=`800 26px ${SF}`;const w=x.measureText(label).width+44;rr(x,W-60-w,64,w,52,26);x.fillStyle="#fff";x.fill();x.fillStyle=C_INK;x.textAlign="center";x.fillText(label,W-60-w/2,99)}
  if(meta){x.textAlign="left";x.fillStyle="rgba(255,255,255,.9)";x.font=`600 30px ${SF}`;x.fillText(meta,60,192,W-120)}
  x.textAlign="center"}
function cCard(x,X,Y,w,h,r,fill,stroke){x.save();x.shadowColor="rgba(55,0,60,.10)";x.shadowBlur=30;x.shadowOffsetY=10;rr(x,X,Y,w,h,r||32);x.fillStyle=fill||"#fff";x.fill();x.restore();rr(x,X,Y,w,h,r||32);x.lineWidth=stroke?4:2;x.strokeStyle=stroke||"#ECE7F0";x.stroke()}
function storyFoot(x,W,H){x.textAlign="center";x.fillStyle="#9B8BA0";x.font=`600 26px ${SF}`;x.fillText(location.host+location.pathname,W/2,H-46)}
function noteBadge(x,v,cx,cy,fs,motm){x.font=`900 ${fs}px ${SD}`;const t=(motm?"★":"")+fN(v);const w=Math.max(fs*2.2,x.measureText(t).width+fs*.9),h=fs*1.5;x.save();x.shadowColor=NOTE_COL(v);x.shadowBlur=fs*.7;rr(x,cx-w/2,cy-h/2,w,h,h*.28);x.fillStyle=NOTE_COL(v);x.fill();x.restore();if(motm){rr(x,cx-w/2,cy-h/2,w,h,h*.28);x.lineWidth=Math.max(3,fs*.09);x.strokeStyle="#fff";x.stroke()}x.fillStyle=NOTE_TX(v);x.textAlign="center";x.textBaseline="middle";x.fillText(t,cx,cy+fs*.04);x.textBaseline="alphabetic";return w}
function drawAv(x,id,cx,cy,R,team,im){x.save();x.shadowColor=team==="B"?"rgba(123,92,255,.9)":"rgba(0,0,0,.45)";x.shadowBlur=team==="B"?R*.8:14;x.beginPath();x.arc(cx,cy,R+Math.max(3,R*.07),0,Math.PI*2);x.fillStyle=team==="B"?"#A08AFF":"rgba(255,255,255,.9)";x.fill();x.restore();
  x.beginPath();x.arc(cx,cy,R,0,Math.PI*2);const ag=x.createLinearGradient(cx-R,cy-R,cx+R,cy+R);if(team==="B"){ag.addColorStop(0,"#A08AFF");ag.addColorStop(1,"#5A3BE0")}else{ag.addColorStop(0,"#2E3446");ag.addColorStop(1,"#10141D")}x.fillStyle=ag;x.fill();
  x.save();x.beginPath();x.arc(cx,cy,R,0,Math.PI*2);x.clip();
  if(im){const pS=R*2,sc=Math.max(pS/im.width,pS/im.height);x.drawImage(im,cx-R+(pS-im.width*sc)/2,cy-R-(im.height*sc-pS)*.2,im.width*sc,im.height*sc)}
  else{x.fillStyle="#fff";x.font=`900 ${Math.round(R*.7)}px ${SD}`;x.textAlign="center";x.textBaseline="middle";x.fillText(initials(nameOf(id)),cx,cy+2)}
  x.restore();x.textBaseline="alphabetic"}
function cPitch(x,px,py,pw,ph){x.save();x.shadowColor="rgba(55,0,60,.14)";x.shadowBlur=40;x.shadowOffsetY=12;rr(x,px,py,pw,ph,32);const g=x.createLinearGradient(0,py,0,py+ph);g.addColorStop(0,"#F1EFFB");g.addColorStop(1,"#E4E2F6");x.fillStyle=g;x.fill();x.restore();
  x.save();rr(x,px,py,pw,ph,32);x.clip();
  x.strokeStyle="#B9B6D3";x.lineWidth=4;const sx=pw/68,sy=ph/100;const R=(a,b,w,h)=>x.strokeRect(px+a*sx,py+b*sy,w*sx,h*sy);
  R(3,3,62,94);R(17,3,34,13);R(26,3,16,5);R(17,84,34,13);R(26,92,16,5);x.beginPath();x.moveTo(px+3*sx,py+50*sy);x.lineTo(px+65*sx,py+50*sy);x.stroke();
  x.beginPath();x.ellipse(px+34*sx,py+50*sy,7*sx,7*sx,0,0,Math.PI*2);x.stroke();x.fillStyle="#B9B6D3";x.beginPath();x.arc(px+34*sx,py+50*sy,6,0,Math.PI*2);x.fill();rr(x,px,py,pw,ph,32);x.lineWidth=2;x.strokeStyle="#DCD8EE";x.stroke();x.restore()}
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
    rr(x,W/4-20,374,80,10,5);x.fillStyle="#fff";x.fill();rr(x,W*3/4-60,374,80,10,5);x.fillStyle=C_TB;x.fill();
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
    cHead(x,W,980,"★ MAÇIN ADAMI",meta);
    const fw=560,fx=(W-fw)/2,fy=250,fh=fw*1000/700;
    const gl=x.createRadialGradient(W/2,fy+fh/2,60,W/2,fy+fh/2,520);gl.addColorStop(0,"rgba(198,244,50,.35)");gl.addColorStop(1,"rgba(198,244,50,0)");x.fillStyle=gl;x.fillRect(0,fy-60,W,700);
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
  const fin=m.state==="bitti";const NI=fin?S.mInfo[m.id]:null;const sa=+m.score_a||0,sb=+m.score_b||0;
  cHead(x,W,400,fin?"MAÇ KADROSU":"KADROLAR",`${fmtDate(m.date)}${m.time?" · "+m.time:""}${S.settings.field_name?" · "+S.settings.field_name:""}`);
  const nA=nmOf(m,"A"),nB=nmOf(m,"B");const A0=m.team_a||[],B0=m.team_b||[];
  x.textAlign="right";x.fillStyle="#fff";fitFont(x,nA,64,34,900,SD,W/2-140);x.fillText(nA,W/2-70,290);x.textAlign="left";fitFont(x,nB,64,34,900,SD,W/2-140);x.fillText(nB,W/2+70,290);
  x.textAlign="center";x.font=`900 ${fin?56:44}px ${SD}`;x.fillStyle=fin?"#fff":"rgba(255,255,255,.55)";x.fillText(fin?`${sa}–${sb}`:"vs",W/2,286);
  x.font=`600 26px ${SF}`;x.fillStyle="rgba(255,255,255,.88)";x.textAlign="right";x.fillText(`${formText(formOf(m,"A"),posArr(m,"A"))} · ort. ${sumAvg(A0)}`,W/2-70,340);x.textAlign="left";x.fillText(`${formText(formOf(m,"B"),posArr(m,"B"))} · ort. ${sumAvg(B0)}`,W/2+70,340);
  rr(x,W/2-70-80,356,80,8,4);x.fillStyle="#fff";x.fill();rr(x,W/2+70,356,80,8,4);x.fillStyle=C_TB;x.fill();
  const ph=1380,pw=Math.round(ph*68/140),px=Math.round((W-pw)/2),py=410;cPitch(x,px,py,pw,ph);
  const pa=posArr(m,"A"),pb=posArr(m,"B"),la=pad7(lineupOf(m,"A"),A0),lb=pad7(lineupOf(m,"B"),B0);
  const TT=layout("both",pa,pb,la,lb,true),IM={};await Promise.all(TT.filter(T=>T.id).map(async T=>{IM[T.id]=await loadImg(photoOf(T.id))}));
  const cw=Math.round(pw*.165),chh=Math.round(cw*74/56),k=cw/56;
  for(const T of TT){if(!T.id)continue;const cx=px+T.l/100*pw,cy=py+T.t/100*ph;const p=P(T.id);
    const X=cx-cw/2,Y=cy-chh/2,rad=10*k,nbH=16*k;
    // kart zemini (takım rengi)
    x.save();x.shadowColor="rgba(31,10,50,.35)";x.shadowBlur=22;x.shadowOffsetY=8;rr(x,X,Y,cw,chh,rad);
    const g=x.createLinearGradient(X,Y,X+cw*.45,Y+chh);if(T.k==="A"){g.addColorStop(0,"#4A5368");g.addColorStop(.7,"#1F2430")}else{g.addColorStop(0,"#9A80FF");g.addColorStop(.75,"#4F2FC4")}
    x.fillStyle=g;x.fill();x.restore();
    // fotoğraf: sağ altta, şeridin üstünde, kartın üstünden taşabilir
    const im=IM[T.id];const aH=chh-nbH;const piW=cw*.72,piH=aH*1.18;
    x.save();x.beginPath();x.rect(X-4,Y-60,cw+8,aH+60);x.clip();
    if(im){const sc=Math.min(piW/im.width,piH/im.height);const dw=im.width*sc,dh=im.height*sc;x.shadowColor="rgba(0,0,0,.35)";x.shadowBlur=8;x.shadowOffsetY=2;x.drawImage(im,X+cw-dw-(piW-dw)/2,Y+aH-dh,dw,dh)}
    else{x.fillStyle="rgba(255,255,255,.3)";x.font=`800 ${Math.round(22*k)}px ${SD}`;x.textAlign="right";x.fillText(initials(nameOf(T.id)),X+cw-10*k,Y+aH-6*k)}
    x.restore();
    // isim şeridi
    x.save();rr(x,X,Y,cw,chh,rad);x.clip();x.fillStyle=T.k==="A"?"#FFFFFF":"#37003C";x.fillRect(X,Y+chh-nbH,cw,nbH);if(T.k==="A"){x.fillStyle="#1F2430";x.fillRect(X,Y+chh-3*k,cw,3*k)}x.restore();
    const nm=shortName(nameOf(T.id));x.textAlign="center";x.textBaseline="middle";x.fillStyle=T.k==="A"?"#1F2430":"#fff";fitFont(x,nm,Math.round(9.5*k),12,800,SF,cw-10);x.fillText(nm,cx,Y+chh-nbH/2+(T.k==="A"?-1:0));
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
const TIER_COL={t1:["#5FD8F5","#9C7BFF","#14001A"],t2:["#8A4DFF","#4A16C9","#FFFFFF"],t3:["#7FA8FF","#3D63E0","#FFFFFF"],t4:["#EDE6F7","#CFC2EC","#37003C"]};

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
  if(tw){x.font=`900 34px ${SD}`;const t="HAFTANIN TAKIMI";const w=x.measureText(t).width+30;rr(x,150-w/2,400,w,50,12);x.fillStyle="#7B3FF2";x.fill();x.fillStyle="#121A00";x.fillText(t,150,437)}
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
  const gl=x.createRadialGradient(W/2,cy+ch/2,80,W/2,cy+ch/2,600);gl.addColorStop(0,tw?"rgba(198,244,50,.42)":"rgba(198,244,50,.22)");gl.addColorStop(1,"rgba(198,244,50,0)");x.fillStyle=gl;x.fillRect(0,cy-60,W,720);
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

cacheLoad();
render(true);
newVer();
load().then(async()=>{
  await authInit();pushInit().then(()=>render(true));
  if(S.loaded&&!S.me&&!S.session&&!gated()&&S.players.length&&!LS.get("y_asked")){LS.set("y_asked","1");S.sheet={type:"me"};render(true)}
});
})();
