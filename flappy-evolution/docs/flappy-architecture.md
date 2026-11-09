# Flappy Evolution — teknik mimari

**Tarih:** 9 Kasım 2026. **Kapsam:** Gelecekteki bağımsız `flappy-evolution` reposunun ilk sürüm mimarisi. Bu belgede anlatılan oyun dosyaları henüz oluşturulmadı; `kaynak` reposunun mevcut uygulaması değiştirilmez.

Bağlantılar: [oyun ve ekonomi](flappy-evolution.md), [kaynak/sürüm/lisans kanıtları](flappy-references.md), [aşamalı uygulama görevi](flappy-codex-task.md).

## 1. Teknoloji kararları

| Katman | Karar | Gerekçe / sınır |
| --- | --- | --- |
| Oyun motoru | `phaser: 3.90.0` | Ultra Flappy'nin lockfile sürümü; Phaser 4 ile örtük karışım yok |
| Dil | TypeScript `5.9.3`, strict | Referans oyunla uyum; `tsc --noEmit` build'den ayrı zorunlu kontrol |
| Build | Vite `7.3.1`, ESM | Referansın doğrulanmış araç sürümü; ilk aktarımda gereksiz araç yükseltmesi yok |
| Runtime | Node `22.x`, en az `22.12.0` | Vite 7 gereksinimine uygun ortak yerel/CI tabanı; kullanılan kesin patch ve Yarn sürümü yeni repoda kaydedilir |
| Paket yönetimi | Kaynakla aynı Yarn; tek `yarn.lock` | İlk aktarımda paket yöneticisi değişmez; Redis/ağ paketleri çıkarılınca lock yenilenir |
| UI | Phaser oyun alanı + semantik HTML menü/overlay | React veya Next.js gerektirmez; erişilebilir düğmeler/odak yönetimi kolaylaşır |
| Kayıt | Sürümlü tek localStorage zarfı + bellek fallback | Hesap, DB, Redis, senkronizasyon yok |
| Offline | Aynı origin asset'lerini önbellekleyen üretim service worker'ı | İlk başarılı çevrimiçi yükleme ve cache tamamlandıktan sonra iki mod offline |
| İleride barındırma | Vercel statik Vite çıktısı `dist/` | Functions/API, env sırrı ve ücretli servis ihtiyacı yok; bu görevde deploy yok |

Vite dönüştürmesi tip kontrolünün yerine geçmez. Resmî güncel Vite template'i Phaser 4.0.0 kullanıyor; bu nedenle başlangıç Ultra Flappy'nin incelenen commit'inden kontrollü dosya aktarımıdır. Phaser 3 API kaynağı [v3.90.0](https://github.com/phaserjs/phaser/tree/a9965625f49cf366584f454556b039e06e8adad6) olmalıdır. Phaser 4'e geçiş ilk sürüm kapsamı dışındaki ayrı bir migrasyon işidir.

## 2. Sahne ve sorumluluk sınırları

```text
BootScene → MenuScene → WorldMapScene → PlayScene(mode=adventure, levelId)
                     └──────────────→ PlayScene(mode=endless)
MenuScene ↔ Wardrobe / Settings (semantik HTML paneller)
PlayScene ↔ Pause / Results (semantik HTML paneller)
```

Boot özgün asset'leri üretir/yükler, SaveManager kaydı doğrular, menü açılır. MenuScene ve WorldMapScene dekoratif Phaser arka planı sunabilir; etkileşimli kart ve düğmeler HTML katmanında tek kaynaktan üretilir. Sonuç ayrı bir ikinci oyun döngüsü değildir; mevcut PlayScene'in koşu durumu üzerinde overlay'dir.

| Bileşen | Sorumluluk |
| --- | --- |
| `Bird` | Mevcut Arcade hareketi, darbe, canlılık, texture animasyonu, hitbox |
| `PlayScene` | Tek update döngüsü; input, durum geçişi, spawn/hareket/çarpışma ve bitiş sırası |
| `ObstacleSystem` | PlayScene'in mevcut pipe metotlarının küçük adımlarla ayrılması; üretim, yerleşim, temizlik |
| `ModeController` | Macera/Sonsuz profilini ve bitiş/ödül değerlendirmesini verir; kuşa hareket uygulamaz |
| `DifficultyDirector` | Sonsuz Uçuş'un mevcut skor/zaman eğrisi |
| `LevelCatalog` | Tam 4 dünya/20 bölüm, seed, engel ve yıldız hedefi verileri |
| `ProgressionService` | Yıldız farkı, ilk başarı, XP, kozmetik satın alma, karakter açma; saf kurallar |
| `SaveManager` | Unknown veriyi doğrulama, göç, idempotent sonuç kaydı, tek zarfı okuma/yazma |
| `AudioSystem` / `AssetFactory` | Özgün ses/çizim; lifecycle, mute, düşük hareket tercihi |
| `UiBridge` | HTML görünümü ile sahne arasındaki dar komut/olay sözleşmesi; odak ve input önceliği |

Bu isimler hedef ayrımıdır; sırf soyutlama için çalışan PlayScene baştan parçalanmaz. Önce mevcut oynanış taşınır ve doğrulanır; yalnız iki modun gerektirdiği sorumluluklar çıkarılır. İki farklı Bird sınıfı, fizik döngüsü veya çarpışma sistemi oluşturulmaz.

### Ortak veri sözleşmeleri

```ts
type RunRequest =
  | { mode: "adventure"; levelId: string; skinId: string }
  | { mode: "endless"; skinId: string };

type RunPhase = "ready" | "playing" | "paused" | "won" | "dead" | "results";

interface RunSummary {
  runId: string;
  mode: "adventure" | "endless";
  levelId?: string;
  outcome: "won" | "dead";
  score: number;
  passedGates: number;
  pickupCoins: number;
  bonusCoins: number;
  nearMisses: number;
  allPassesCentered: boolean;
  activeDurationMs: number;
}
```

Uygulamada summary de discriminated union ile sıkılaştırılabilir: `endless` için levelId yok, `adventure` için doğrulanmış katalog ID'si zorunlu. `skinId` kayıttaki sahiplik üzerinden doğrulanır; bilinmeyen veya kilitli ID başlangıç görünümüne döner. Bölüm kimliği dışarıdan verilse bile kilidi kontrol edilir.

`ready → playing`; `playing ↔ paused`; `playing → won/dead → results`. `paused` içinden menüye çıkmak koşuyu iptal eder. `won/dead/results` durumunda flap, toplama, skor ve yeniden sonuç üretme yoktur. Sonraki bölüm yeni `runId` ile yeni koşudur. Sonuç ekranı açılırken/replay sırasında eski callback'ler iptal edilir.

### Kare içi işlem sırası

1. Aktif input komutlarını yalnız `playing`/`ready` durumunda işle; UI aksiyonu flap'e yayılmaz.
2. Aktif oyun zamanı, mod profili, engel üretimi/hareketi ve mevcut kuş fiziği aynı koordinat sisteminde ilerler.
3. Aynı karedeki çarpışmayı değerlendir; çarpışma varsa ölüm snapshot'ı al, o kareye ait yeni geçiş/jeton/başarı yazma.
4. Hayatta ise tek-seferlik geçiş ve jeton olaylarını işle; Macera hedefi tamamlanınca `won` snapshot'ı al.
5. Snapshot'ı tek bir `finishRun` yolundan, idempotent kayıtla sonuçlandır. HUD ve dekoratif efektler ödül üretemez.

Phaser Arcade'nin entegrasyon zamanını ikinci bir elle yazılmış kuş entegratörüyle çoğaltma. Yukarıdaki sıra mevcut sahnenin manuel boru/ödül koduna uygulanır; ayrıntılı event sırası Phaser 3.90 tarayıcı testiyle doğrulanır. İlk aktarım baseline'ı ve gerekli “ölümden sonra ödül yok” düzeltmesi ayrı değerlendirilir.

## 3. Dikey mobil alan ve input

Oyun dünyası daima **480×854** kalır. `Scale.FIT` ve `CENTER_BOTH`, görünür kullanılabilir alana sığdırır; ekran genişledi diye engel mesafesi/hız/hitbox değişmez. Dar veya yatay ekranda letterbox olabilir; kırparak avantaj/dezavantaj yaratılmaz. Masaüstünde de portre oyun alanı ortalanır.

HTML kabukta `viewport-fit=cover`, `100dvh` (fallback `100vh`) ve `env(safe-area-inset-*)` kullanılır. Canvas kalan güvenli alanda yer alır; tarayıcı adres çubuğu, çentik ve alt hareket alanı önemli düğmeleri örtmez. `user-scalable=no` kullanılmaz; `touch-action: none` yalnız aktif oyun etkileşim yüzeyine uygulanır. Menü/harita gerektiğinde dikey kayabilir; yatay taşma olmaz.

Ekrandaki input Phaser'ın scale dönüşümünden geçer; CSS koordinatı doğrudan fizik koordinatı sayılmaz. HTML pause, sonuç ve ayar düğmeleri oyunun pointer olayını tetiklemez. Klavye repeat filtrelenir; tek bir dokunuş bir darbedir. Oyun yüzeyi odaklıyken SPACE sayfayı kaydırmaz; menü düğmesindeyken normal klavye aktivasyonu korunur.

Fullscreen ve portrait lock yalnız isteğe bağlı, kullanıcı aksiyonu altında denenir ve başarısızlığı oyunu engellemez. Manifest orientation tek başına tarayıcıyı kilitleme garantisi değildir. Görünürlük kaybı/blur aktif uçuşu duraklatır; physics, spawn, rüzgâr, tween ve aktif süre birlikte durur. Dönüşte “Devam et” + kısa geri sayım vardır; son geri sayım dokunuşu flap olarak sayılmaz. Arka planda geçen zaman zorluk ve XP'ye katılmaz. Geri sayımdan sonra biriken büyük delta simülasyona aktarılmaz.

## 4. Yerel kayıt sözleşmesi

Anahtar: `flappy_evolution_save_v1`. Tek JSON belge, kavramsal şema:

```json
{
  "schemaVersion": 1,
  "revision": 0,
  "updatedAt": "2026-11-09T00:00:00.000Z",
  "wallet": { "coins": 0 },
  "xp": 0,
  "adventure": { "levels": {} },
  "endless": { "bestScore": 0, "topScores": [] },
  "inventory": {
    "skins": ["spark"],
    "trails": ["none"],
    "selectedSkin": "spark",
    "selectedTrail": "none"
  },
  "settings": { "sound": true, "reducedMotion": "system" },
  "processedRunIds": []
}
```

`adventure.levels` katalog ID'si → `{ bestStars: 0..3, bestScore: 0, firstClearClaimed: false }` eşlemesidir; boş harita tüm bölümlerin sıfır ilerleme durumda olduğunu ifade eder. Kilitler ve XP evrim kademesi kayıttan türetilir, çelişebilen ayrı `unlockedWorlds` alanı tutulmaz. Her dünya görünümü ilk dünya başarısında inventory'ye eklenir; tekrar ekleme etkisizdir.

### Okuma, doğrulama, yazma

1. `getItem`, JSON parse ve `setItem` ayrı hataları yakalanan sınırlardır. Girdi `unknown` kabul edilir; null, array, yanlış kök nesne ve bozuk JSON kontrol edilir. Her varsayılan oluşturma yeni nesne/diziler üretir.
2. Sayılar finite, negatif olmayan tamsayı olmalı; cüzdan/XP/toplam skor için 2.147.483.647 doygunluk sınırı uygulanır. Yıldız 0..3, liste ID'leri katalog/izinli küme içinde; seçili kozmetik mutlaka sahip olunan kümede bulunmalıdır. Rekor ilk 10'a, processed run ID listesi son 100'e sınırlandırılır. Aktif oturumun sonuçlandı bayrağı da korunur; uygulama aktif koşuyu yenileme sonrası geri yüklemez.
3. `commitRun` en güncel kaydı yeniden okur, `runId` zaten işlendiyse ödül vermez. Sonuç, ilk geçiş, yıldız farkı, cüzdan ve envanter değişiklikleri önce bellekte tek yeni zarf olarak hesaplanır; tek `setItem` ile yazılır. `revision` artar. Birinci yazı başarılı olmadan ikinci alana ayrı ödül yazılmaz.
4. Yazma başarısızsa geçerli son kayıt silinmez; oturum içi bellek kaydı sürer ve kalıcılık mesajı görünür. Depolama erişimi sonradan düzelirse yalnız en güncel oturum snapshot'ı yazılır; eski koşu ödülleri yeniden oynatılmaz. Hata her karede tekrar gösterilmez.
5. `storage` olayı diğer sekmedeki değişimi bildirir. İlk sürüm aynı origin'de tek aktif koşu hedefler: desteklenen yerde Web Locks ile koşu/satın alma kilidi; başka sekme değişimi saptanırsa mevcut koşuyu duraklat ve yeniden yükleme öner. LocalStorage çok sekmeli işlemler için tam transactional DB değildir; yarışları sıfırladığı iddia edilmez.

Satın alma da aynı manager üzerinden sahiplik+bakiye kontrolü ve tek zarf yazısıyla yapılır. Koşu açılırken aktif `runId`, sonucu aldıktan sonra sealed summary kullanılır. Sahne dışına çıkan eski timer/Promise callback'i aynı sonucu ikinci kez uygulayamaz.

### Göç ve veri sınırları

V1'e eski Ultra Flappy kaydını otomatik aktarım **yoktur**: eski skor/skin modeli değişti ve bağımsız repo başka origin'de olabilir. Tarayıcı başka origin'in localStorage'ını okuyamaz. Eski `ultra_flappy_save_v1` anahtarı silinmez; yeni kayıt temiz başlar. İleride isteğe bağlı import/export ayrı doğrulanan özellik olabilir, ilk sürüme eklenmez.

İleride şema yükseltilirse açık `v1 → v2` fonksiyonu ve fixture testleri gerekir. Bilinmeyen ileri sürümün üstüne yazılmaz; kayıt uyumsuzluğu mesajı ve oturumluk oyun sunulur. Site verisi silinmesi, özel gezinme ve tarayıcı tahliyesi veri kaybına yol açabilir. PWA cache temizleme kodu localStorage'a dokunmaz. Ayarlardaki sıfırlama ancak açık kullanıcı eylemi ve yerel teyit diyaloğu ile yapılır.

## 5. PWA ve Vercel hazırlığı

Yeni manifest: ad `Flappy Evolution`, `id/start_url/scope: "/"`, `display: standalone`, `orientation: portrait`, `lang: tr`; özgün 192/512 ve maskable ikonlar. İlk sürüm `/#/adventure` ve `/#/endless` gibi hash rotaları kullanabilir; mod/level isteği her açılışta kilit doğrulamasından geçer. Server-side SPA rewrite gerekmeyen statik kabuk tercih edilir.

SW yalnız production/HTTPS veya localhost üzerinde kaydolur. Dev ortamında cache kaynaklı eski kod sorunu yaratacak otomatik SW kaydı yapılmaz. Build sırasında oluşan manifest; `index.html`, hash'li JS/CSS, ihtiyaç duyulan tüm dünya görselleri/sesleri ve ikonları içerir. İki modun offline çalışması için gerekli asset'ler hazır olmadan “Çevrimdışı hazır” gösterilmez. Harici CDN/font/analitik çağrısı yoktur. Procedural üretim kullanılıyorsa üretim kodunun önbellekte olması gerekir.

| Kaynak | Cache kararı |
| --- | --- |
| Hash'li JS/CSS/asset | Sürüm önbelleğinde cache-first; ilk yüklemede precache |
| HTML navigasyonu | Online güncellik için network-first; offline aynı build'in kabuğuna fallback |
| `sw.js`, manifest | Güncellemeyi görebilmek için yeniden doğrulama; SW script'i kör cache-first yapılmaz |
| Üçüncü taraf URL / GET dışı / API | İşlenmez; oyunun API isteği zaten bulunmaz |

Yeni SW bekleme durumunda menüde “Güncelleme hazır” gösterir. `skipWaiting` yalnız aktif koşu yokken kullanıcı güncellemeyi seçtiğinde yapılır; kayıt tamamlanır, sonra tek sefer reload edilir. `clients.claim`/`controllerchange` çoklu reload üretmemelidir. Yalnız `flappy-evolution-` önekli eski cache'ler uygun geçişte temizlenir; aynı origin'deki diğer uygulama cache'leri silinmez. Kabuğun ve asset'lerin farklı build sürümlerine ait olması güncelleme testinde ayrıca kontrol edilir.

İleride Vercel projesinde framework Vite, build `yarn build`, output `dist`, Node 22.x seçilir. `sw.js` ve HTML için revalidation, hash'li asset için uzun immutable cache başlıkları hazırlanır. Functions, Redis, DB, env sırrı, ücretli analytics kurulmaz. Plan/kota sınırları yayın zamanında kontrol edilir; sınırsız ücretsiz kapasite vaadi yoktur. **Bu kaynak hazırlığı deploy yetkisi değildir; şu anda Vercel'e istek veya yayın yapılmaz.**

## 6. UI/UX Pro Max'ten uygulanacak tasarım kuralları

Kaynak: [okunan UI/UX Pro Max becerisi](https://github.com/aliihaydargenc-dotcom/mola-app/blob/f4ec62b21fcdd40916bf32d14085a865dba58887/.agents/skills/ui-ux-pro-max/SKILL.md). Aşağıdaki oyun uyarlamaları genel kurallardan türetilmiştir; çalıştırılmış arama motoru çıktısı değildir. Phaser/HTML için doğrulanmış özel bir stack veri kümesi bulunduğu varsayılmaz.

| Alan | Uygulama ve doğrulanabilir kriter |
| --- | --- |
| Dokunma | Hedef en az 48×48 **görünen CSS px**, aralık ≥8 CSS px; FIT küçülmesinde yalnız mantıksal 48 px yeterli sayılmaz |
| Metin ve kontrast | Menü gövde metni en az 16 CSS px; normal metin ≥4,5:1, büyük metin/önemli UI sınırı ≥3:1; hareketli arka plana karşı HUD scrim'i |
| Hiyerarşi | Her panelde tek baskın aksiyon; sonuçta ödül, yıldız ve sonraki hedef açık; kilit ve seçili durum yazı/ikonla da belirtilir |
| Odak ve semantik | HTML button/label, görünür focus ring, klavye erişimi; modal açılışında odak içeride, kapanışında kaynak düğmeye döner; arkadaki kontroller inert |
| Hareket | Menü geri bildirimi yaklaşık 80–150 ms, panel geçişleri bağlama göre 150–300 ms; gameplay flap anlık uygulanır, UI animasyonu fiziği geciktirmez |
| Reduced motion | Sistem tercihi+ayar; kamera shake, yoğun parçacık ve paralaks azaltılır/kapanır; engel hareketi oyun kuralı olarak korunur ve açıkça ayrılır |
| İkon ve varlık | Tek tutarlı özgün SVG seti, emoji navigasyonu yok; oyun sprite'ları raster/atlas olabilir; anlamlı ikonların erişilebilir adı var |
| Güvenli alan | Çentik ve alt gesture alanında CTA/HUD yok; portrait/yatay/standalone/normal tarayıcıda taşma yok; zoom global kapatılmaz |
| Ses ve durum | Mute her yerden erişilir ve kalıcıdır; ses unlock reddi oyunu engellemez; başarı/hata yalnız ses veya renkle bildirilmez |

DOM menüler ve sonuçlar erişilebilir olacak; gerçek zamanlı engel kaçırma oyununun ekran okuyucu ile eşdeğer oynanabilirliği bu hazırlıkta kanıtlanmış değildir. Canvas'ın metin karşılığı, talimat ve sonuç özeti sunulur; her kare skor `aria-live` ile okutulmaz. Bu sınır tüm oyuna doğrulanmamış WCAG uygunluğu iddiası yapılmasını önler.

## 7. Hedef klasör yapısı ve doğrulama

```text
src/main.ts, styles.css
src/game/GameConfig.ts, constants.ts, types.ts
src/game/entities/Bird.ts
src/game/scenes/{BootScene,MenuScene,WorldMapScene,PlayScene}.ts
src/game/systems/{DifficultyDirector,ObstacleSystem,AudioSystem,AssetFactory}.ts
src/game/modes/{AdventureMode,EndlessMode}.ts
src/game/data/{levels,SaveManager,ProgressionService}.ts
src/ui/{UiBridge,menu,results,settings,wardrobe}.ts
public/{manifest.webmanifest,icons/,assets/,licenses/}
scripts/build-sw.mjs
tests/{progression,save,levels}.*
e2e/gameplay.spec.ts
THIRD_PARTY_NOTICES.md
```

Önerilen yapı değişebilir; korunacak esas tek uçuş çekirdeğidir. Hot loop'ta gereksiz DOM güncellemesi/nesne üretimi yapılmaz. Engel ve parçacıklar ekran dışında temizlenir, menüye dönünce input/timer/audio bağlantıları kapatılır. Havuzlama ancak ölçülen darboğaz varsa eklenir.

Doğrulama kapıları: `tsc --noEmit`, production build, anlamlı ilerleme/kayıt testleri, iki mod için tarayıcı uçtan uca test ve gerçek mobil smoke. 360×640, 390×844, 430×932, 768×1024 ve yatay 844×390 kontrol edilir. 30/60/120 Hz giriş tekrarları, blur/resume, restart döngüsü, offline reload ve SW güncellemesi kapsanır. 60 FPS hedefi ve orta sınıf cihaz performansı ölçülür; henüz ölçülmemiş başarı sonucu yazılmaz. Ayrıntılı görev ve teslim kanıtları [Codex talimatında](flappy-codex-task.md).
