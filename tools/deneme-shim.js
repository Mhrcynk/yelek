/* Yelek deneme sürümü: sunucuya hiç bağlanmaz. Temsili oyuncular ve maçlar bu cihazda üretilir, işlemler bu cihazda saklanır. */
(function(){
const LSK="yd_db",DAY=864e5;const ls=window.localStorage;const VER=(window.YD_REAL?"g":"t")+"3";try{if(ls.getItem("yd_v")!==VER){Object.keys(ls).forEach(k=>ls.removeItem(k));ls.setItem("yd_v",VER)}}catch(_){}
const uid=i=>"00000000-0000-4000-8000-"+String(i).padStart(12,"0");
const ymd=d=>d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
let seed=11;const rnd=()=>{seed=(seed*9301+49297)%233280;return seed/233280};const ri=(a,b)=>a+Math.floor(rnd()*(b-a+1));const pick=a=>a[Math.floor(rnd()*a.length)];
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const AD=[["Kaan Yıldız","Forvet"],["Burak Demir","Orta saha"],["Serkan Toprak","Defans"],["Onur Aksoy","Defans"],["Mert Kaya","Orta saha"],["Cem Bulut","Kaleci"],["Deniz Öztürk","Orta saha"],["Emre Sönmez","Forvet"],["Tolga Çelik","Defans"],["Volkan Erdem","Orta saha"],["Hakan Güneş","Forvet"],["Barış Nalbant","Kaleci"],["Ozan Fidan","Defans"],["Uğur Polat","Orta saha"],["Sinan Kurt","Forvet"],["Arda Yalçın","Orta saha"]];
const RL=window.YD_REAL||null;const ME=RL?RL.me:uid(5);// "sen"
function attrs(pos){const a={};const k=pos==="Kaleci"?["dal","ref","ell","ayk","poz","hiz"]:["hiz","sut","pas","dri","def","fiz"];for(const x of k)a[x]=ri(58,84);return a}
function lineup(ids){const gk=ids.filter(id=>P0[id].pos==="Kaleci");const rest=ids.filter(id=>!gk.includes(id));return [gk[0]||rest.shift(),...rest]}
let P0={};
function teams(pl){const gks=pl.filter(id=>P0[id].pos==="Kaleci");const out=shuf(pl.filter(id=>!gks.includes(id)));const A=[gks[0],...out.slice(0,6)],B=[gks[1],...out.slice(6,12)];return[A,B]}
function finish(m,pl){const[A,B]=[m.team_a,m.team_b];const sa=ri(3,11),sb=ri(3,11);m.score_a=sa;m.score_b=sb;const st={};
  const give=(T,n)=>{const sh=T.slice(1);const at=sh.filter(id=>P0[id].pos!=="Defans");for(let i=0;i<n;i++){const s=pick(at.length&&rnd()<.7?at:sh);(st[s]=st[s]||{g:0,a:0}).g++;if(rnd()<.6){const a=pick(T.filter(x=>x!==s));(st[a]=st[a]||{g:0,a:0}).a++}}};give(A,sa);give(B,sb);
  for(const id of [...A,...B])st[id]=st[id]||{g:0,a:0};for(const T of [A,B]){if(rnd()<.35)st[T[0]].ps=1;if(rnd()<.35)st[pick(T.slice(1))].cl=1;if(rnd()<.25)st[pick(T.slice(1))].pm=1;if(rnd()<.25)st[pick(T.slice(1))].pen=1}m.stats=st;const tr={};for(const id of [...A,...B])tr[id]={km:+(3+rnd()*2.6).toFixed(1),pas:ri(8,30),hiz:+(22+rnd()*8).toFixed(1),spr:ri(2,14),isa:ri(62,95),tk:ri(2,12),pa:ri(1,14),dri:ri(0,8),pp:ri(0,6),pt:ri(0,6)};m.track=tr;
  const sc=id=>(st[id].g*3+st[id].a*2+rnd()*3);const all=[...A,...B].sort((x,y)=>sc(y)-sc(x));m.motm=all[0];m.gol_id=Object.keys(st).find(id=>st[id].g>0)||null;m.fiy_id=all[all.length-1];
  m.state="bitti";m.finished_at=new Date(Date.parse(m.date)+22*36e5).toISOString()}
const act=()=>Object.keys(P0).filter(id=>!P0[id].archived&&!P0[id].guest);
function mkMatch(k,date,state){const pl=shuf(act()).filter(id=>P0[id].pos!=="Kaleci").slice(0,12);const gks=act().filter(id=>P0[id].pos==="Kaleci");const ids=[...gks,...pl];
  if(!ids.includes(ME))ids[ids.length-1]=ME;const[A,B]=teams(ids);
  const m={id:uid(500+k),date,time:"21:00",state,kind:"ic",archived:false,season:1,rsvp:{},rsvp_at:{},late:{},team_a:A,team_b:B,form_a:"2-3-1",form_b:"2-3-1",lineup_a:lineup(A),lineup_b:lineup(B),pos_a:null,pos_b:null,
    score_a:null,score_b:null,stats:{},votes:{},motm:null,cap_a:A[1],cap_b:B[1],preds:{},links:null,gol_id:null,fiy_id:null,tac_a:null,tac_b:null,opponent:null,name_a:"Kırmızılar",name_b:"Maviler",created_at:date+"T10:00:00Z",finished_at:null,notes:null,vote_on:false,track:null};
  if(state==="bitti")finish(m);return m}
function genReal(){seed=11;const players=RL.players.map(p=>({id:p.id,name:p.name,pos:p.pos,no:p.no||"",attrs:p.attrs||{},status:{type:p.st||"hazir"},status_log:[],created_at:p.c,archived:!!p.ar,photo_v:0,guest:!!p.g,epos:p.epos,alt_pos:p.alt,yedek:!!p.y,by:p.by}));
  P0={};players.forEach(p=>P0[p.id]=p);const matches=RL.matches.map(m=>Object.assign({rsvp:{},rsvp_at:{},late:{},votes:{},preds:{},links:null,tac_a:null,tac_b:null,opponent:null,created_at:m.date+"T10:00:00Z",finished_at:m.state==="bitti"?m.date+"T22:00:00Z":null,notes:null,vote_on:false,archived:false},JSON.parse(JSON.stringify(m))));
  D={players,matches,fz:[],k:6};matches.filter(m=>m.state==="bitti").forEach(m=>otherFz(m,true));return D}
function gen(){if(RL)return genReal();seed=11;const players=AD.map(([n,pos],i)=>({id:uid(i+1),name:n,pos,no:String(i+1),attrs:attrs(pos),status:{type:"hazir"},status_log:[],created_at:"2026-09-01T00:00:00Z",archived:false,photo_v:0,guest:false,epos:null,alt_pos:null,yedek:false}));
  P0={};players.forEach(p=>P0[p.id]=p);const today=new Date();today.setHours(12,0,0,0);const matches=[];
  for(let i=5;i>=1;i--)matches.push(mkMatch(i,ymd(new Date(today-i*7*DAY+DAY)),"bitti"));
  matches.push(mkMatch(6,ymd(new Date(+today+DAY)),"takim"));
  D={players,matches,fz:[],k:6};matches.filter(m=>m.state==="bitti").forEach(m=>otherFz(m,true));return D}
function db(){try{const d=JSON.parse(ls.getItem(LSK)||"null");if(d&&d.players){P0={};d.players.forEach(p=>P0[p.id]=p);return d}}catch(_){}const d=gen();save(d);return d}
function save(d){try{ls.setItem(LSK,JSON.stringify(d))}catch(_){}}
var D;D=db();
// oturum: sahte hesap
const SES={access_token:"deneme",refresh_token:"deneme",expires_at:Math.floor(Date.now()/1000)+365*86400,user:{id:"deneme-kullanici",email:"deneme@yelek"}};
try{ls.setItem("y_auth",JSON.stringify(SES));ls.setItem("y_team","1");ls.setItem("y_asked","1");ls.setItem("y_hos","1");ls.setItem("y_kur","3|0");ls.setItem("y_me",ME)}catch(_){}
window.supabase={createClient:()=>({auth:{getSession:async()=>({data:{session:SES}}),onAuthStateChange(){return{data:{subscription:{unsubscribe(){}}}}},setSession:async()=>({data:{session:SES}}),signOut:async()=>({error:null}),signInWithOAuth:async()=>({error:null}),refreshSession:async()=>({data:{session:SES}})}})};
const TN=RL?RL.s.g+" · Deneme":"Deneme FC";const open=()=>D.matches.find(m=>m.state==="takim");const fins=()=>D.matches.filter(m=>m.state==="bitti").sort((a,b)=>a.date<b.date?-1:1);
const mts=m=>Date.parse(m.date+"T"+m.time+":00");
const mon=s=>{const d=new Date(s+"T12:00:00");const w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return ymd(d)};
function fzJson(){const me=ME;const rows=D.fz.filter(r=>{const m=D.matches.find(x=>x.id===r.m);return m&&(r.p===me||mts(m)<=Date.now()||m.state==="bitti")});const n={},who={};D.fz.forEach(r=>{n[r.m]=(n[r.m]||0)+1;(who[r.m]=who[r.m]||[]).push(r.p)});return{ok:true,rows,n,who}}
function kings(){const L=fins();const lm=L[L.length-1];if(!lm)return[];const pl=[...lm.team_a,...lm.team_b].filter(x=>x!==ME);const a=pl[2],b=pl[5],c=pl[8];return[{m:lm.id,p:a,top:[{p:a,w:3,l:0,n:3},{p:b,w:2,l:1,n:3},{p:c,w:1,l:1,n:2}],pick:null,pm:null}]}
function betKral(){const L=fins();const lm=L[L.length-1];if(!lm)return{ok:true};const pl=[...lm.team_a,...lm.team_b].filter(x=>x!==ME);return{ok:true,wk:mon(lm.date),p:pl[4],net:4350,top:[{p:pl[4],net:4350,n:4,won:3},{p:pl[1],net:2100,n:3,won:2},{p:ME,net:800,n:2,won:1}]}}
const RPC={
  my_membership:()=>({status:"onayli",role:"uye",player_id:ME}),team_rev:()=>({r:D.k,p:D.k}),player_ages:()=>D.players.map((p,i)=>({id:p.id,age:p.by?2026-p.by:(RL?null:24+((i*7)%17))})).filter(x=>x.age!=null),
  my_teams:()=>[{id:1,name:TN,slug:"deneme",tag:"uye"}],my_follows:()=>[],teams_hub:()=>({mine:[{id:1,name:TN,slug:"deneme",tag:"uye"}],all:[]}),
  fantasy_list:()=>{const m=open();if(m&&!D.fz.some(r=>r.m===m.id&&r.p!==ME)){otherFz(m);save(D)}return fzJson()},
  fantasy_save:a=>{const m=open();if(!m||m.id!==a.p_match||Date.now()>=mts(m))return{ok:false,error:"closed"};if(!a.p_picks||a.p_picks.length!==5)return{ok:false,error:"sayi"};
    D.fz=D.fz.filter(r=>!(r.m===m.id&&r.p===ME));D.fz.push({m:m.id,p:ME,picks:a.p_picks,cap:a.p_cap,prices:a.p_prices,budget:a.p_budget});save(D);return fzJson()},
  duel_list:()=>({ok:true,rows:[],kings:kings()}),bet_kral:()=>betKral(),
  usage_hit:()=>({ok:true}),log_error:()=>null,push_prefs_get:()=>({ok:true,off:[],quiet:false})};
const json=(o,st)=>new Response(JSON.stringify(o),{status:st||200,headers:{"Content-Type":"application/json"}});
const of=window.fetch.bind(window);
window.fetch=async(u,o)=>{const url=typeof u==="string"?u:u.url;if(!/supabase\.co/.test(url))return of(u,o);
  const r=url.split("/rest/v1/")[1]||"";
  if(r.startsWith("rpc/")){const fn=r.slice(4).split("?")[0];let a={};try{a=JSON.parse(o&&o.body||"{}")}catch(_){}
    if(RPC[fn])return json(RPC[fn](a));return json({ok:false,error:"deneme"})}
  const t=r.split("?")[0];
  if(t==="settings")return json([{id:1,logo_v:0,group_name:TN,field_name:RL?RL.s.f:"Deneme Saha",day:RL?RL.s.d:new Date(Date.now()+DAY).getDay(),time:"21:00",team_a_name:RL?RL.s.a:"Kırmızılar",team_b_name:RL?RL.s.b:"Maviler",season_len:8,season_closed:0,gate:true,slug:"deneme",followable:false}]);
  if(t==="players")return json(D.players);if(t==="matches")return json(D.matches.slice().sort((a,b)=>a.date<b.date?1:-1));
  return json([])};
// deneme paneli
function otherFz(m,me){const pool=[...m.team_a,...m.team_b];const gks=[m.lineup_a[0],m.lineup_b[0]];const others=D.players.filter(p=>!p.archived&&!p.guest).map(p=>p.id).filter(id=>id!==ME);
  (me?[ME,...shuf(others).slice(0,7)]:shuf(others).slice(0,7)).forEach(p=>{const gk=pick(gks);const out=shuf(pool.filter(x=>!gks.includes(x)));const L=[];let na=m.team_a.includes(gk)?1:0,nb=1-na;const rl=x=>{const sd=m.team_a.includes(x)?"a":"b";const i=m["lineup_"+sd].indexOf(x);const ps=m["pos_"+sd];return ps&&ps[i]?ps[i][2]:"OS"};
    for(const need of ["DF","OS","FV",null])for(const x of out){if(L.length>=4||L.includes(x))continue;if(need&&rl(x)!==need)continue;const a=m.team_a.includes(x);if(a&&na>=3||!a&&nb>=3)continue;L.push(x);a?na++:nb++;if(need)break}
    const picks=[gk,...L];D.fz.push({m:m.id,p,picks,cap:pick(L),prices:picks.map(()=>5),budget:40})})}
// sayfayı yenilemeden uygulamaya yeni veriyi yükle (deneme sayfası cihaza kayıt tutamayabilir)
async function tazele(msg){save(D);try{await window.__YD('(async()=>{S.sheet=null;S.view=null;S.f.fz=null;FZ.at=0;DU.at=0;S.tab="mac";S.f.bht="";await load(true);fzLoad(true);duLoad(true);render(true)})()');scrollTo(0,0)}catch(e){console.error("YD tazele",e&&e.message);location.reload()}if(msg)alert0(msg)}
const ACT={
  bitir(){const m=open();if(!m){alert0("Açık maç yok, önce yeni hafta aç");return}if(!D.fz.some(r=>r.m===m.id&&r.p!==ME))otherFz(m);seed=Date.now()%233280;finish(m);m.date=ymd(new Date(Date.now()-DAY));D.k++;tazele("Maç bitti. Oyunlar → Fantezi Kadro")},
  baslat(){const m=open();if(!m){alert0("Açık maç yok");return}m.date=ymd(new Date(Date.now()-DAY));if(!D.fz.some(r=>r.m===m.id&&r.p!==ME))otherFz(m);D.k++;tazele("Maç başladı, kadrolar kilitlendi")},
  hafta(){if(open()){alert0("Zaten açık bir maç var");return}const n=++D.k;seed=Date.now()%233280;D.matches.push(mkMatch(n+10,ymd(new Date(Date.now()+DAY)),"takim"));tazele("Yeni hafta açıldı")},
  sifirla(){try{Object.keys(ls).forEach(k=>{if(k!=="yd_v")ls.removeItem(k)})}catch(_){}D=gen();tazele("Baştan başladı")}};
function alert0(t){try{if(window.__YD){window.__YD("toast("+JSON.stringify(t)+")");return}}catch(_){}const e=document.getElementById("ydMsg");if(e){e.textContent=t;setTimeout(()=>e.textContent="",2500)}}
addEventListener("DOMContentLoaded",()=>{const b=document.createElement("div");b.id="yd";b.innerHTML=`<button id="ydT" aria-expanded="false">Deneme</button><div id="ydP" hidden><b>Deneme sürümü</b><small>Hiçbir şey sunucuya gitmez. Sıra: Oyunlar → Fantezi Kadro'da kadronu kur → burada "Maçı bitir" → Oyunlar → Fantezi Kadro'da puanına bak.</small>
  <button data-yd="baslat">Maçı başlat (kadrolar kilitlenir)</button><button data-yd="bitir">Maçı bitir (rastgele skor)</button><button data-yd="hafta">Yeni hafta aç</button><button data-yd="sifirla">Baştan başla</button><span id="ydMsg"></span></div>`;document.body.appendChild(b);
  const P=b.querySelector("#ydP"),T=b.querySelector("#ydT");T.onclick=()=>{P.hidden=!P.hidden;T.setAttribute("aria-expanded",String(!P.hidden))};b.querySelectorAll("[data-yd]").forEach(x=>x.onclick=()=>{ACT[x.dataset.yd]();setTimeout(()=>{P.hidden=true;T.setAttribute("aria-expanded","false")},1800)})});
})();
