# Canlı maç denemeleri (Ultimate)

Gerçek sunucuya bağlanmaz. Uygulamanın deneme sürümü, sayfa içindeki sahte sunucuyla (`sahte-sunucu.js`) iki taraflı canlı maçı, çağrıyı, bekleme odasını ve kayıt yazımını taklit eder.

```sh
# 1) deneme sürümünü üret (ikinci klasör isteğe bağlı: gerçek takım verisi; repoya konmaz)
node tools/deneme.js /tmp/deneme [/tmp/gercek-veri]
# 2) bir adım dosyasını çalıştır (ekran görüntüleri OUT klasörüne)
OUT=/tmp/cikti TF=tests/canli/sahte-sunucu.js STEPS=tests/canli/adim-canli-mac.js node tests/canli/calistir.js /tmp/deneme /tmp/cikti
# yatay telefon boyutu için: VW=844 VH=390 ; video için: VID=/tmp/video
```

| Adım dosyası | Ne dener |
|---|---|
| `adim-canli-mac.js` | Meydan: çağıran ve çağrılan tarafta baştan sona canlı maç, iki karar, kayıt skoru = bağımsız hesap = ekran |
| `adim-saatli-lig.js` | Saatli lig: ikimiz de varız, geç gelen, rakip gelmedi |
| `adim-motor-tarama.js` | Motor taraması: kırmızı kartlı oyuncu, kaleci, aynı dakikada çok gol, üst üste aynı oyuncu |

Sahte sunucudaki yardımcılar: `__setT0(sn)`, `__sifirla(sn)`, `__K` (lig maçı anahtarı), `__OPP` (rakip), `FS` (sahte sunucu durumu: `FS.on` çevrim içi, `FS.mc` maçta, `FS.ak` süren maç, `FS.cg` gelen çağrı, `FS.bot` rakibin davranışı, `FS.evs` yazılan maçlar, `FS.log` çağrılan işlevler).
