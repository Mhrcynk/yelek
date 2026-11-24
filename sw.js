/* Yelek servis çalışanı: bildirimler + anında açılış.
   Sayfa ve sürümlü dosyalar (app.js?v=…, app.css?v=…) önce telefondaki kopyadan açılır; sayfanın yenisi arka planda indirilir.
   Uygulama yeni sürümü fark edince ?v=… ile yeniden yükler; o yükleme her zaman internetten gelir. */
const C="yelek-v2";
const LIB="vendor/supabase-2.117.3.js";
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.add(new URL(LIB,self.registration.scope).href)).catch(()=>{}))});
self.addEventListener("activate",e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==C)await caches.delete(k);await self.clients.claim()})()));
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  if(u.origin!==location.origin)return;// Supabase vb. dış istekler: dokunma
  const PAGE=new URL("./",self.registration.scope).href;
  // sürümlü kütüphane, yazı tipleri ve ikonlar değişmez: önce telefondaki kopya
  if(/\/vendor\/|\/fonts\/|\/icon[-.]/.test(u.pathname)){e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(r.url.split("?")[0]);if(hit)return hit;const res=await fetch(r);if(res&&res.ok)c.put(r.url.split("?")[0],res.clone());return res}));return}
  const page=r.mode==="navigate";
  // sürüm numaralı uygulama dosyaları: aynı sürüm hiç değişmez, önce telefondaki kopya. Yeni sürüm gelince eskisi silinir.
  if(!page&&u.searchParams.has("v")&&/\.(js|css)$/.test(u.pathname)){e.respondWith((async()=>{const c=await caches.open(C);const hit=await c.match(r.url);if(hit)return hit;
      const res=await fetch(r);if(res&&res.ok){await c.put(r.url,res.clone());const base=r.url.split("?")[0];for(const k of await c.keys())if(k.url!==r.url&&k.url.split("?")[0]===base)c.delete(k)}return res})());return}
  // sayfa: kopya varsa hemen o açılır, yenisi arka planda indirilir. Sürüm yenilemesi (?v=…) her zaman internetten.
  if(page&&!u.searchParams.has("v")){e.respondWith((async()=>{const c=await caches.open(C);const hit=await c.match(PAGE);
      const net=fetch(r).then(res=>{if(res&&res.ok)c.put(PAGE,res.clone());return res});
      if(hit){e.waitUntil(net.catch(()=>{}));return hit}return net})());return}
  const key=page||/\/index\.html$/.test(u.pathname)?PAGE:r.url.split("?")[0];
  e.respondWith((async()=>{const c=await caches.open(C);
    try{const net=fetch(r);const res=await (page?Promise.race([net,new Promise((_,j)=>setTimeout(()=>j("t"),4000))]):net);
      if(res&&res.ok)c.put(key,res.clone());return res}
    catch(_){const hit=await c.match(key);if(hit)return hit;return fetch(r)}})())});
self.addEventListener("push",e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){d={title:"Yelek",body:e.data&&e.data.text()}}
  e.waitUntil(self.registration.showNotification(d.title||"Yelek",{body:d.body||"",tag:d.tag,icon:"icon-192.png",badge:"icon-192.png",data:{url:d.url||"./"}}))});
self.addEventListener("notificationclick",e=>{e.notification.close();const url=new URL((e.notification.data&&e.notification.data.url)||"./",self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{for(const c of cs){if(c.url.startsWith(self.registration.scope)&&"focus"in c){const same=c.url.split("#")[0].split("?")[0]===url.split("#")[0].split("?")[0]&&(new URL(c.url).searchParams.get("t")||"")===(new URL(url).searchParams.get("t")||"");if(same)c.postMessage({t:"nav",url});else if(c.navigate)c.navigate(url).catch(()=>{});return c.focus()}}return self.clients.openWindow(url)}))});
