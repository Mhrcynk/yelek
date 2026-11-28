module.exports=async({E})=>{console.log("SAC",await E(`(()=>{const me=myPid(),opps=S.players.filter(p=>p.id!==me&&!p.archived).map(p=>p.id).slice(0,11);
 const sq=[ultMy(),...opps.map(o=>ultRakipKadro(o))].filter(L=>L&&[0,1,2,3,4,5,6].every(q=>L[q])).map(L=>ultSnap(L));const TK=["dengeli","hucum","savunma","kontra","pres"];
 const T={mac:0,olay:0,kendinePas:0,kirmiziliOynadi:0,kirmiziliMucadele:0,kirmiziliSavundu:0,cikanOynadi:0,kaleciKapti:0,kaleciBaski:0,kornerAyniKisi:0,ayniDkCokGol:0,penKaleci:0,ustUsteAyniOlay:0,ayniOyuncuUstUste3:0,golSonrasiAyniDkGol:0,kirmiziErken:0,degisenKirmizili:0,ornek:[]};
 const not=(k,x)=>{T[k]++;if(T.ornek.length<8)T.ornek.push(k+": "+x)};
 for(let i=0;i<sq.length;i++)for(let j=0;j<sq.length;j++){if(i===j)continue;for(let s=0;s<3;s++){const A=JSON.parse(JSON.stringify(sq[i])),B=JSON.parse(JSON.stringify(sq[j]));const LA=ultFromSnap(A),LB=ultFromSnap(B);
   const don=sq[(i+2)%sq.length===j?(i+3)%sq.length:(i+2)%sq.length].c.find(c=>c&&!A.c.some(q=>q&&q.pid===c.pid));if(don){const c=JSON.parse(JSON.stringify(don));delete c.type;LA.yd=[c]}
   LA.kr=[{t:TK[(i+s)%5]},{s:[4+(s%3),0]}];LB.kr=[{t:TK[(j+s+2)%5]},{}];
   const P=ultPlan(LA,LB,"sc"+i+"_"+j+"_"+s);T.mac++;const red=P.ev.find(e=>e.fx==="kirmizi"),out={a:{},b:{}};let son=null,ayni=0,dkG={};
   if(red&&red.dk<8)T.kirmiziErken++;
   for(const e of P.ev){const k=e.us?"a":"b",o=e.us?"b":"a";const rd=(side,jj,dk)=>red&&((red.us?"a":"b")===side)&&red.j===jj&&dk>red.dk;
    if(e.fx==="deg"){out[k][e.j]=e.dk;if(rd(k,e.j,e.dk))not("degisenKirmizili","dk"+e.dk);continue}
    if(e.fx==="muc"){if(rd(k,e.j,e.dk))not("kirmiziliMucadele","dk"+e.dk);continue}
    if(e.fx){if(e.fx!=="kirmizi"&&e.fx!=="tak"&&rd(k,e.j,e.dk))not("kirmiziliOynadi",e.fx+" dk"+e.dk);continue}
    T.olay++;const Pp=e.path;for(let q=1;q<Pp.length;q++)if(Pp[q]===Pp[q-1])not("kendinePas",e.kind+" "+Pp.join(">"));
    if(Pp.some(q=>rd(k,q,e.dk)))not("kirmiziliOynadi",e.kind+" dk"+e.dk);
    if(e.df!=null&&rd(o,e.df,e.dk))not("kirmiziliSavundu","dk"+e.dk);
    if(e.lost&&e.lost.j===0&&e.lost.how!=="ara")not("kaleciKapti",e.lost.how+" "+e.kind);if(e.df===0)not("kaleciBaski",e.kind);
    if(e.lost&&rd(o,e.lost.j,e.dk))not("kirmiziliSavundu","kapma dk"+e.dk);
    if(e.kind==="kor"&&Pp.length>1&&Pp[0]===Pp[Pp.length-1])not("kornerAyniKisi",Pp.join(">"));
    if(e.kind==="pen"&&Pp[Pp.length-1]===0)not("penKaleci","");
    if(e.goal){dkG[e.dk]=(dkG[e.dk]||0)+1;if(dkG[e.dk]===3)not("ayniDkCokGol","dk"+e.dk)}
    const sh=k+Pp[Pp.length-1];if(sh===son){ayni++;if(ayni===2)T.ayniOyuncuUstUste3++}else{son=sh;ayni=0}}}}
 return JSON.stringify(T)})()`))};
