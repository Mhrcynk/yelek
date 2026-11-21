/* Yelek servis çalışanı: bildirimler + internet yokken açılış.
   Sayfa her zaman önce internetten istenir (hep güncel); 4 sn'de gelmezse ya da internet yoksa son kopya açılır. */
const C="yelek-v1";
const LIB="vendor/supabase-2.117.3.js";
self.addEventListener("install",e=>{self.skipWaiting();e.waitUntil(caches.open(C).then(c=>c.add(new URL(LIB,self.registration.scope).href)).catch(()=>{}))});
self.addEventListener("activate",e=>e.waitUntil((async()=>{for(const k of await caches.keys())if(k!==C)await caches.delete(k);await self.clients.claim()})()));
self.addEventListener("fetch",e=>{const r=e.request;if(r.method!=="GET")return;const u=new URL(r.url);
  if(u.origin!==location.origin)return;// Supabase vb. dış istekler: dokunma
  // sürümlü kütüphane ve ikonlar değişmez: önce telefondaki kopya (anında açılış)
  if(/\/vendor\/|\/icon[-.]/.test(u.pathname)){e.respondWith(caches.open(C).then(async c=>{const hit=await c.match(r.url.split("?")[0]);if(hit)return hit;const res=await fetch(r);if(res&&res.ok)c.put(r.url.split("?")[0],res.clone());return res}));return}
  const page=r.mode==="navigate";const key=page?new URL("./",self.registration.scope).href:r.url.split("?")[0];
  e.respondWith((async()=>{const c=await caches.open(C);
    try{const net=fetch(r);const res=await (page?Promise.race([net,new Promise((_,j)=>setTimeout(()=>j("t"),4000))]):net);
      if(res&&res.ok)c.put(key,res.clone());return res}
    catch(_){const hit=await c.match(key);if(hit)return hit;return fetch(r)}})())});
self.addEventListener("push",e=>{let d={};try{d=e.data?e.data.json():{}}catch(_){d={title:"Yelek",body:e.data&&e.data.text()}}
  e.waitUntil(self.registration.showNotification(d.title||"Yelek",{body:d.body||"",tag:d.tag,icon:"icon-192.png",badge:"icon-192.png",data:{url:d.url||"./"}}))});
self.addEventListener("notificationclick",e=>{e.notification.close();const url=new URL((e.notification.data&&e.notification.data.url)||"./",self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(cs=>{for(const c of cs){if(c.url.startsWith(self.registration.scope)&&"focus"in c){const same=c.url.split("#")[0].split("?")[0]===url.split("#")[0].split("?")[0]&&(new URL(c.url).searchParams.get("t")||"")===(new URL(url).searchParams.get("t")||"");if(same)c.postMessage({t:"nav",url});else if(c.navigate)c.navigate(url).catch(()=>{});return c.focus()}}return self.clients.openWindow(url)}))});
