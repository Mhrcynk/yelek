# Yelek

Halı saha ekibi için FIFA tarzı oyuncu kartları ve maç takibi.

- Oyuncu kartları: hız, şut, pas, top sürme, savunma, fizik (kaleciler için plonjon, elle oyun, ayakla oyun, refleks, hız, pozisyon alma)
- Her maç sonunda girilen gol, asist ve skora göre kart reytingi artar ya da düşer
- Sakatlık, hastalık, izin gibi durumlar kartta görünür; maça gelinmeyen her hafta reyting 1 düşer
- 7'li takımlar için dizilişler (2-3-1, 3-2-1, 2-1-2-1, 2-2-2, 3-1-2, 1-3-2, 3-3) ve saha üzerinde kadro yerleştirme
- Dengeli takım kurma ve kaptan draftı
- Maçın Adamı, Haftanın Fiyaskosu, Haftanın Golü ve yıl sonu Altın Top oylaması
- Sezon krallık tabloları ve oyuncuya özel yıl özeti

## Nasıl çalışır

Tek bir `index.html` dosyası. Veriler Supabase'te tutulur. Herkes linkle girip katılım bildirebilir, durumunu güncelleyebilir ve oy verebilir. Maç açma, kadro kurma ve istatistik girme yönetici şifresi ister; şifre sayfanın Ayarlar sekmesinden girilir ve değiştirilir.

Sayfa GitHub Pages üzerinden yayınlanır.
