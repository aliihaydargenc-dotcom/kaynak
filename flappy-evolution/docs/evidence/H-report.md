# H — teslim ve test raporu

Tarih: 2026-11-09. Kaynak: voyvodka/FlappyBirdGame@9117cfe268940acef8fc10ba0cff8e758a5d7209. Bağımsız yerel repo: `/workspace/flappy-evolution`. `kaynak` ve diğer mevcut projelerin çalışma ağaçları değiştirilmedi; yalnız scratch altında ayrı referanslar okundu.

## Gerçekten çalıştırılan kontroller

- Upstream Yarn 1.22.22 frozen kurulum, build, tsc: başarılı. Node 22.23.4, Phaser 3.90.0, TypeScript 5.9.3, Vite 7.3.1.
- Kaynak Chromium/Arcade baseline: sabit 500ms flap dizisi, kontrollü sabit engeller, 450ms ilk üretim, beş geçiş, çarpışma/sonuç/restart. `A-baseline.json`: gerçek kuş y/velocity örnekleri ve input zamanları. Sentez 60Hz kare sürücüsü; cihazlar arası bit determinizmi iddiası yok.
- Yeni Bird aynı input ile kaynak y/hız örneklerine 0.0001 toleransta uydu.
- 28 Vitest testi: 20 bölüm/dünya/sıra/seed sınırları, pulse önceliği, güvenli hareket alanı, kilitler; yıldız/XP/ilk ödül/ölüm jetonu/idempotency; sahiplik/bakiye/tekrar satın alma; bozuk/null/yanlış tip/negatif/NaN/sonsuz kayıt; get/set exception ve son snapshot recovery; ileri şema koruma; reload ve dış kayıt değişimi.
- 9 Playwright Chromium testi: ortak gerçek Arcade çekirdeğinde 1-1 kazanma, 1-2 açılış/sonraki bölüm/kayıp/yeniden deneme; çarpışmanın final geçişine önceliği; ölüm sonrası donmuş sayaç ve sonuç; tek tap/keyboard repeat, pause/geri sayım, 10 restart ve tek listener; 360×640, 390×844, 430×932, 768×1024, 844×390 taşma ve 48px kontrol ölçümleri.
- Production preview offline testi: cache tamamlandı → internet kapalı → reload → 1-1 kazanma/4 fiziksel jeton → reload/kilit açılışı → Sonsuz kayıp/sonuç. Harici istek ve page error: 0. `G-offline.json`.
- SW update testi: yeni worker beklerken koşu kimliği korundu; menüden güncelleme tek reload yaptı; başka uygulama cache'i silinmedi. `G-update.json`.
- Metin/surface kontrast çiftleri 4.5:1 üzerinde: `F-contrast.json`. Özgün menü/uçuş görselleri incelendi: `H-menu.png`, `H-flight.png`; gerçek hitbox debug overlay seçeneği mevcut.
- Tek yarn.lock, servissiz dependency ağacı, lisanslar ve asset köken kaydı mevcut. Production build/typecheck başarılı; Phaser'ın 1.2MB ham / yaklaşık 332KB gzip motor chunk'ı Vite boyut uyarısı verir. Bu hata değildir; ilk precache hacmine dahildir.

## Açık sınırlar / kullanıcı testi

Kullanıcı gerçek telefon ve oynanış testlerini üstlendi. Android Chrome / iOS Safari ve standalone kurulum, çentik/OS çubukları, gerçek 30/60/120Hz cihaz girişleri, orta sınıf telefon FPS/frame süreleri, tüm 20 bölümün insan tarafından tamamlanması ve yıldız/rüzgâr dengesi henüz doğrulanmadı. Otomatik pilot/fixture bir insan başarısı veya cihaz performans ölçümü değildir.

Bu Linux tarayıcısında RAF yavaş ilerlediği için otomatik uçuş fixture'ları Canvas + timer veya doğrudan Phaser.headlessStep kullanır. Ürün varsayılanı Phaser.AUTO + RAF'tır. WebGL mobil performansı için kesin 60 FPS iddiası yoktur. Gerçek zamanlı oyunun tam ekran okuyucu eşdeğerliği doğrulanmadı.

## Yayın ve uzak Git

İlk istek Vercel yayını istemiyordu. Kullanıcı sonraki mesajında açıkça “testleri ben tamamlarım … Vercel'de yayına al” talimatı verdi. Bu güncel talimatla yalnız yeni flappy-evolution Vercel projesi oluşturuldu: `prj_ZTo9oXGs3p2vGuIYPksyW2TcvFGb`, ekip `aliihaydargenc-dotcoms-projects`, Node 22.x. Yayın sonucu `deployment.json` dosyasında kaydedilir.

GitHub yeni repo oluşturma engeli: ortamın GitHub API erişimi Forbidden; bağlı GitHub araçları repo oluşturma sunmuyor. Yetkili tarayıcı alternatifi TinyFish bakiye nedeniyle başlayamadı. Repo mevcut değilken push yapılamaz. A–H yerel commit'leri ve Git bundle teslimi hazır; mevcut kaynak reposuna alternatif push yapılmadı.

### Gerçek yayın sonucu

Production **READY**: https://flappy-evolution-theta.vercel.app . Deployment `dpl_GVu1tWTBz4rRqHZHD7hnyp6p5cx3`, kaynak kod commit'i `d7f358c`, build kimliği `af64b9d916f2c923`. Corepack ile Yarn 1.22.22; Node 22.x; Vercel build/typecheck başarılı.
Canlı HTML, SW, manifest ve uygulama JS HTTP 200 doğrulandı; HTML/SW/manifest no-cache, hash'li JS immutable. Bu ortamın outbound proxy'si Vercel URL'lerine doğrudan tarayıcı/curl bağlantısını 403 ile engelliyor; canlı HTTP kontrolleri bağlı Vercel aracıyla yapıldı. Yerel Chromium production testleri bu yüzden canlı interaktif testmiş gibi raporlanmıyor.

GitHub push engeli nedeniyle Vercel'e yalnız gereken kaynak dosyaları doğrudan gönderildi; GitHub otomatik deploy bağlantısı kurulmadı. Sonraki doc commit'leri oyun runtime'ını değiştirmiyor. Yerel komutlar ve testler README'de; kaynak ZIP'i ve bütün A–H commit'lerini koruyan Git bundle çalışma alanı kökünde hazırlanır.


### Kaynak reposuna teslim

Kullanıcının sonraki talimatıyla oyun kaynakları `aliihaydargenc-dotcom/kaynak` reposunun `flappy-evolution/` klasörüne yerleştirildi. Bağımsız repo oluşturma/push engeliyle ilgili yukarıdaki kayıt önceki aşamanın tarihçesidir. Oyun kaynağı `130b418a0b417f03c35306bf06217b02df038e7b` snapshot’ından alındı; `.git`, `node_modules`, `dist` ve geçici test çıktıları kopyalanmadı. Bu taşıma Vercel’de yeni bir deployment oluşturmaz.
