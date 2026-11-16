# Yelek

Halı saha ekibi için oyuncu reyting kartları ve maç takibi.

- Oyuncu kartları: hız, şut, pas, top sürme, savunma, fizik (kaleciler için plonjon, elle oyun, ayakla oyun, refleks, hız, pozisyon alma)
- Her maç sonunda girilen gol, asist ve skora göre kart reytingi artar ya da düşer
- Sakatlık, hastalık, izin gibi durumlar kartta görünür; maça gelinmeyen her hafta reyting yarım puan düşer
- 7'li takımlar için dizilişler (2-3-1, 3-2-1, 2-1-2-1, 2-2-2, 3-1-2, 1-3-2, 3-3) ve saha üzerinde kadro yerleştirme
- Dengeli takım kurma ve kaptan draftı
- EA tarzı mevkiler (SNT, SĞK, MOO, STP…) ve her oyuncuya bir alternatif mevki
- Maçın Adamı (yönetici seçer), reyting sıralaması ve sezon listeleri
- Sezon krallık tabloları, haftalık reyting sıralaması ve oyuncuya özel yıl özeti

## Nasıl çalışır

Veriler Supabase'te tutulur. Giriş Google hesabıyla yapılır; takıma katılmak isteyen kendi kartını seçer, yönetici onaylar. Uygulama kilitliyken giriş yapmamış ziyaretçiler sadece vitrin sayfasını görür. Yöneticilik Google hesabına bağlıdır, şifre yoktur.

Sayfa GitHub Pages üzerinden yayınlanır.

## Dosyalar

- `index.html`: sayfa iskeleti ve sürüm numarası (`APP_V`)
- `app.css`: bütün görünüm
- `app.js`: bütün uygulama kodu
- `sw.js`: bildirimler ve internet yokken açılış
- `gizlilik.html`: gizlilik metni
- `tests/smoke.js`: her ekranın hatasız açıldığını kontrol eden test
- `tools/surum.sh`: yeni sürüm numarası verir

## Değişiklik yaparken

1. Değişikliği yap.
2. `node tests/smoke.js` ile kontrol et (Playwright gerekir). Test uydurma verilerle çalışır, gerçek veriye dokunmaz.
3. `tools/surum.sh` ile sürümü artır; telefonlar yeni sürümü bu sayede alır.

## Dış yedek

`.github/workflows/yedek.yml` her salı bütün veriyi Supabase dışına alır (Actions → "Haftalık dış yedek" → Artifacts, 90 gün).
Dosya şifrelidir. Açmak için (Mac terminali):

```
openssl enc -d -aes-256-cbc -pbkdf2 -iter 200000 -in yelek-yedek-TARİH.json.gz.enc -out yedek.json.gz -pass pass:ANAHTAR && gunzip yedek.json.gz
```

ANAHTAR, GitHub'daki `YELEK_YEDEK_ANAHTAR` gizli değeridir; kaybolursa yedekler açılamaz, bir kopyasını şifre yöneticinde sakla.

## Testler

```
node tests/smoke.js    # her ekran hatasız açılıyor mu
node tests/clicks.js   # ana akışlar: pencereler, geri sayım, kondisyon, linkler, platform, görünüm, takımlar, rehber, takip modu
node tests/paylasim.js # 30 paylaşım şablonu: üst üste binme ve taşma kontrolü (--shots klasör ile ekran görüntüsü)
node tests/acilis.js   # açılışta veri gecikmesi ve oturum (geçerli / süresi dolmuş)
```
