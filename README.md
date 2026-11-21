# Yelek

Halı saha ekibi için oyuncu reyting kartları ve maç takibi.

- Oyuncu kartları: hız, şut, pas, top sürme, savunma, fizik (kaleciler için plonjon, elle oyun, ayakla oyun, refleks, hız, pozisyon alma)
- Her maç sonunda girilen gol, asist ve skora göre kart reytingi artar ya da düşer
- Sakatlık, hastalık, izin gibi durumlar kartta görünür; maça gelmeyenin kartı değişmez
- Biten maçın puanları kesinleşir (maç kaydına yazılır); kurallar değişse de geçmiş aynı kalır, yönetici isterse sezonu yeniden hesaplatır
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
- `tests/`: otomatik testler (aşağıda)
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
node tests/oylama.js  # oyuncu oylaması: maç 1 saat sonra biter, kota, kapanış dağılımı, sonuç ekranı
node tests/acilis.js   # açılışta veri gecikmesi ve oturum (geçerli / süresi dolmuş)
node tests/motor.js    # puan motoru: olaylar doğru özelliğe, bir maçta tek yön, donmuş maçlar değişmez
node tests/okunur.js   # 19 ekranda küçük yazı, düşük kontrast, küçük dokunma alanı
```

## Tahmin oyunu
Sembolik jetonla maç tahmini (gerçek para yok). Veritabanında `private.coupons` (kuponlar) ve `private.bets` (kupondaki seçimler) tutulur; bakiye `private.bet_sum` ile maç maç hesaplanır (5.000 başlangıç, maç başına +100 harçlık, oynayana +50, oy verene +25, 100'ün altına düşene kurtarma). Oranlar `private.bet_markets` / `private.bet_pmarkets` ile sunucuda hesaplanır: takımın gol ortalaması, oyuncuların gol/asist hızı ve yöneticinin cihazından yazılan kadro reytingleri (`bet_rate`). Maç bitince `bet_settle` tetikleyicisi kuponları sonuçlandırır ve tutanlara bildirim gönderir. İstemci fonksiyonları: `bet_board`, `bet_place`, `bet_cancel`, `bet_table`, `bet_list`, `bet_kings`, `bet_week`.
