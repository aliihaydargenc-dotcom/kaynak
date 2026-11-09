# Codex görevi — Flappy Evolution oyun kaynak kodu

**Hazırlık tarihi:** 9 Kasım 2026. **Durum:** Sonraki aşamada uygulanacak talimat. Bu belge oyun geliştirmesini veya repo oluşturmayı kendiliğinden başlatmaz. Mevcut görev yalnız `aliihaydargenc-dotcom/kaynak` araştırma dosyaları ve README bağlantılarıdır; oyun kodu ve Vercel yayını bu hazırlığın dışında kalır.

## 1. Görev sözleşmesi

Sonraki aşama açıkça başlatıldığında bağımsız **`aliihaydargenc-dotcom/flappy-evolution`** reposunda mobil öncelikli, iki modlu oyunun gerçek kaynak kodunu hazırla. Varsa mevcut repo ve yerel değişikliklerini incele; boş/üzerine yazılabilir olduğunu varsayma. `kaynak` reposunu oyun uygulamasına dönüştürme, `mola-app` projesini değiştirme. Yeni repo oluşturma ve uzak Git işlemleri sonraki talebin kapsamına göre yapılır; bu belgedeki plan mevcut oturumda uygulanmaz.

Önce şu belgeleri sırayla oku:

1. [flappy-evolution.md](flappy-evolution.md): 4 dünya, 20 bölüm, iki mod, yıldız/ödül ve kozmetik kuralları.
2. [flappy-references.md](flappy-references.md): sabit commit'ler, lisanslar, gerçek kod haritası ve mevcut kusurlar.
3. [flappy-architecture.md](flappy-architecture.md): ortak çekirdek, mobil alan, kayıt ve PWA sözleşmesi.

Başlangıç kaynak commit'i: `voyvodka/FlappyBirdGame@9117cfe268940acef8fc10ba0cff8e758a5d7209`. Phaser tam **3.90.0**, TypeScript **5.9.3**, Vite **7.3.1**. Bu sürümler korunmadan güncel şablon veya motor master'ı çekilmez. Referansın AGENTS.md dosyasını oku; yeni repo talimatlarını ürünün iki modu ve servis içermeyen kapsamıyla uyumlu yaz. Kaynak AGENTS'teki eski marka/analytics/global skor kuralları yeni ürün hedefinin önüne geçmez.

**Değişmezler:** Mevcut Bird/Arcade fiziğini temel al; uçuşu yeniden yazma. Tek oyun, iki mod, tek PlayScene/çarpışma çekirdeği. Portre 480×854 mantıksal alan. Özgün grafik/ses. Yerel ilerleme. İlk sürümde Redis, veritabanı, kullanıcı hesabı, global skor, ücretli servis ve analitik yok. UI/UX Pro Max kuralları uygulanır. Deploy için ayrıca sonraki kullanıcı talimatı gerekir.

## 2. Aşama A — kaynağı sabitle ve çalışma tabanını kanıtla

**İş:** Kaynağı commit SHA ile ayrı referans checkout'ta incele. Yeni repoya gerekli frontend dosyalarını ve lisans bildirimlerini kontrollü taşı. `Bird.ts`, `PlayScene.ts`, `GameConfig.ts`, constants/types, DifficultyDirector, Boot/Menu, AudioSystem, ProceduralAssets ve CSS/input davranışını birlikte değerlendir. Gereksiz dosyaları veya sırları toplu kopyalama.

İlk olarak referansın kendi Yarn sürümünü/Node gereksinimini kaydet, lockfile ile bağımlılıkları kur; build ve tip kontrolünü çalıştır. Referansı local ortamda başlat; bir uçuş/çarpışma/tekrar denemeyi gözle. Bağımsız API olmadan açılış ve oyunun durumunu raporla; uzak skor hatası çalışır uçuşla aynı şey değildir. Bu hazırlıkta runtime testi yapılmadığı için önceki bir başarı varsayımına dayanma.

Şu baseline kanıtlarını kaydet: gravity=1650, flap=430, world gravity=0; kuş başlangıç pozisyonu ve hitbox; ilk boru zamanı 450 ms; en az 5 geçiş; yakın geçiş/jeton hesabı; çarpışma ve restart. Kontrollü koşuda sabit input zamanları ve gözlenen kuş y/velocity değerlerini kaydet. Sonraki mod çalışması bunlarla karşılaştırılacak; RNG kontrolü yalnız engel tekrar üretimi içindir, physics simülasyonunun bit düzeyinde tüm cihazlarda deterministik olduğu iddia edilmez.

**Kabul:** Referans sürümleri ve kaynak dosya kökenleri kayıtlı; mevcut uçuş derlenip tarayıcıda gözlenmiş. Bozuk taban varsa hatayı somutlaştır; fizik yeniden yazımıyla gizleme. Henüz Macera/ekonomi ekleme.

## 3. Aşama B — servissiz bağımsız temel

**İş:** Yeni frontend'den ScoreService, score session/chunk/submit ve telemetry akışlarını kaldır. Menüden kullanıcı adı/global sıralama; main'den analytics, speed-insights ve beacon kodlarını çıkar. `api/`, Redis/KV bağımlılıkları ve servis env dosyaları yeni ürüne alınmaz. Yerel rekor kalır. Varsa dependency temizliğinden sonra tek Yarn lockfile'ı yenile; Phaser sürümünü `3.90.0` olarak tam sabitle.

Sade `dev`, `build`, `preview`, `typecheck` komutlarını tanımla. `build` tip kontrolünü de çalıştırsın veya CI'da açık ayrı kapı bulunsun. Örneğin Yarn Classic seçilmişse ilk install `yarn install --frozen-lockfile`; desteklenen Yarn sürümü yeni repo `packageManager`/dokümanında sabitlenir. Farklı major Yarn için karşılık gelen immutable kurulum seçilir; iki farklı lockfile üretme.

**Kabul:** Ağ kaydı oyunun yalnız aynı origin statik dosyalarını istediğini gösterir. `/api/score`, telemetry, Redis veya analytics isteği yok. Ağ tamamen kapatıldığında zaten yüklenmiş oyun döngüsü çalışır. Uçuş baseline'ı korunur. Tip kontrolü ve build geçer; sadece “endpoint hatası yakalanıyor” olması servissiz kabul için yeterli değildir.

## 4. Aşama C — ortak koşu ve mobil input

**İş:** `RunRequest`, summary ve fazları mimarideki gibi tanımla. Bird ve manuel RectangleToRectangle çarpışmasını koruyarak `PlayScene` içine mode/level girişi ekle. Sonsuz'da DifficultyDirector çalışır; Macera sabit profille beslenecek. `passedGates`, `pickupCoins`, `bonusCoins` ayrı tutulur.

Ölüm sonrası `updatePipes` içinden ödül kazanma kusurunu gider; çarpışmalı karede yeni skor/coin/win yok. Sonucu tek `finishRun` yolunda dondur. Spawn/hareket mantığını yalnız ihtiyaç duyulan sınırlarda ortak ObstacleSystem'e çıkar. UI dokunuşunun flap'e yayılmasını önle; keyboard repeat filtrele; SHUTDOWN'da listener/timer/tween temizliğini doğrula.

480×854 alan, FIT/CENTER_BOTH, safe-area ve `100dvh` kabuk kur. Pause/blur/visibility ile fizik, spawn, rüzgâr ve aktif süre birlikte durur. Dönüşte manuel devam ve geri sayım ekle. Fullscreen/portrait API desteklenmezse oyun çalışmayı sürdürür. Biriken delta'yı dönüşte uygulama.

**Kabul:** Aynı input dizisi temel uçuşla uyumlu; fizik sabitleri değişmedi. 360 px ekranda taşma ve çentik altında kontrol yok. Tek tap tek flap, pause tap'i flap değil; restart'ı 10 kez tekrarlamak input/audio/timer sayısını artırmıyor. Ölüm sonrası skor/coin sabit, bitiş aynı kare çarpışmasında kayıp.

## 5. Aşama D — Macera: 4 dünya ve 20 bölüm

**İş:** Tasarımdaki 20 satırı veri kataloğu olarak tanımla; kimlik, dünya, sıra, gate hedefi, hız, açıklık, spawn aralığı, hareket düzeni, coin hedefi, ilk geçiş ödülü ve seed alanlarını doğrula. Tekrarlanan ID/dünya/sıra, eksik seviye ve erişilemez coin hedefi için anlamlı katalog testleri ekle.

Seeded RNG'yi yalnız üretim/faz seçim sınırına enjekte et. Aynı seed ve aynı aktif oyun zamanı aynı engel düzenini üretmeli; sinüs zamanı `scene.time.now` gibi pause öncesi/sonrası atlayan duvar saati yerine aktif koşu zamanı kullanmalı. İlk merkezin 360, sonraki farkların ±70 ve hareket dahil güvenli sınırların tasarımla uyumunu doğrula.

WorldMap, bölüm kilidi, kilit nedeni, 0..3 yıldız, sonraki bölüm ve tekrar dene akışını ekle. Macera'da sonsuz zorluk eğrisi devre dışıdır. Dünya 4 rüzgârını uyarı ve kontrollü kuvvetle ekle. Yeni engine mekaniği veya boss fiziği icat etme.

**Kabul:** Dört dünyanın her biri 5 bölüm içerir; toplam 20, yıldız üst sınırı 60. 1-1 açık, önceki başarı olmadan ileri bölüm başlatılamıyor. Bölüm sonu gate sayısıyla belirleniyor; near-miss bonusu hedefi erken bitirmiyor. Finalden sonra üretim duruyor. 2/3 yıldız eşikleri testle, tüm 20 bölümün tamamlanabilirliği insan oyun testiyle doğrulanıyor. Otomatik test fixture'ı gerçek oyuncu başarısının yerine raporlanmıyor.

## 6. Aşama E — ilerleme, ekonomi ve kayıt

**İş:** SaveManager'ı sürümlü yeni anahtarla genişlet; unknown doğrulama, storage read/write hataları, taze defaults ve güvenli fallback ekle. Eski Ultra Flappy kaydını otomatik göç ettirme veya silme. Bilinmeyen ileri şema üzerine yazma. Cüzdan/XP/yıldız/karakter/iz/ayar/rekor tek zarf içinde olsun.

ProgressionService tasarım formüllerini aynen uygulasın: yeni yıldız başına 25 XP; ilk bölüm ödülü bir kez; Sonsuz koşu XP'si `min(100, 2*passedGates)`; kayıpta jetonlar korunur; dünya ödülü ve evrim kozmetiktir. Koşu snapshot'ı ve `runId` üzerinden tek-seferlik ödül işle. Satın alma sahiplik+bakiye kontrolünden geçer. Kilitli/bilinmeyen seçili görünüm güvenli başlangıç görünümüne döner.

**Zorunlu test senaryoları:** Boş/bozuk/null JSON; negatif, NaN/sonsuz ve yanlış tipli veriler; geçersiz skin/level; storage get/set exception; başarısız yazmada oturum devamı; tekrar sonuç çağrısında ödül yok; 3→1 yıldız tekrarında kayıp/XP yok; ilk geçiş bonusu tekrar yok; yeni yıldız farkı kadar XP; yetersiz bakiye/tekrar satın alma; mod rekorlarının ayrılığı; reload sonrası ayar/ilerleme; başka sekme değişimi; ileri şemayı koruma. Bunlar fixture ile iş kuralını sınar; her getter için aynalama testi yazma.

**Kabul:** İki mod aynı cüzdan/karakterleri kullanır, rekorları ayrı tutar; sonuç çift işlenmez. Kaydı engellenen tarayıcıda oyun çökmüyor ve oturumluk kayıt mesajı görünür. Sayfa yenilemek yalnız aktif koşuyu kaybettirir; son tamamlanan ilerleme kalır.

## 7. Aşama F — özgün kimlik ve UI/UX Pro Max

**İş:** UI/UX Pro Max becerisini ve ilgili mobil/erişilebilirlik kurallarını oku. Yeni ürün için becerinin `--design-system` akışını mevcutsa `mobile arcade game playful` gibi tek niyetli sorguyla çalıştır; sonucun ürünle uyumunu kontrol et. Phaser stack'i veri kümesinde yoksa varmış gibi gösterme. Araç yoksa erişilebilirlik/dokunma/safe-area genel kurallarını fallback diye açıkça etiketle. Uygun olmayan landing page/CTA önerilerini oyun ekranına taşımama kararını kaydet.

Yeni repoda oyun tasarım sistemini üret ve koru; mevcut dosya varsa önce oku. 4 dünya, en az başlangıç+4 dünya karakter görünümü, izler, arayüz ikonları ve PWA ikonları için özgün asset üret. ProceduralAssets/AudioSystem üretim yardımcıları uyarlanabilir; özgün çizim, renk, karakter formu ve ses tarifleri oluştur. Kopyalanmış görsele yalnız tint uygulamak özgün ürün grafiği sayılmaz. Sprite boyutları ve anchor değişiminin `getHitbox()` etkisini debug overlay ile denetle.

HTML menü/sonuç/ayar/gardırop kontrolleri 48×48 CSS px, ≥8 px aralık, belirgin focus ve erişilebilir adlara sahip olsun. Kontrast, dinamik arka plan üzerinde de ölçülsün. Ses kapatma ve reduced-motion ayarı saklansın; dekoratif shake/parçacık/paralaks azaltılsın, gameplay tepkisi gecikmesin. Audio gain/listener lifecycle'ı sahne geçişlerinde kapatılsın. Harici font yerine ilk tabanda sistem fontu kullan; ek font/ikon varsa lisansını kaydet.

**Kabul:** Ultra Flappy marka/asset kimliği ve lisanssız örnek asset yok. Her yeni varlık için üretim/kaynak kaydı var. Dört dünya görsel olarak ayrışıyor; aynı hitbox ve fizik korunuyor. Mobil görünür hedef boyutu, klavye, odak, kontrast, mute ve reduced-motion kontrolleri geçiyor. Tam ekran okuyucu gameplay uygunluğu kanıtlanmadan iddia edilmiyor.

## 8. Aşama G — PWA ve yayınlanabilir statik çıktı

**İş:** Özgün manifest ve normal/maskable ikonları hazırla. Production SW build manifest'iyle tüm gerekli dünya/karakter/ses dosyalarını cache'le. Menüde ancak cache tamamlanınca offline hazır göster. İlk açılış internet gereksinimini açık anlat. Güncelleme aktif uçuşu kesmesin; bekleyen SW menüde kullanıcı eylemiyle devreye girsin. Sadece uygulamanın kendi cache önekini temizle; localStorage ilerlemesi korunmalı.

Vercel için yalnız hazırlık dosyaları/dokümanı: Vite, Node 22.x, build komutu, `dist/`, HTML/SW revalidation ve hash'li asset cache başlıkları. Vercel projesi oluşturma, hesap bağlama, deployment veya domain işlemi yapma. Ürün kodu hazır olmak yayın izni anlamına gelmez.

**Kabul:** Production preview'da ilk online yükleme → offline reload → iki mod → bölüm bitirme → kayıt → tekrar reload çalışıyor. Yeni build beklerken aktif koşu kesilmiyor, kullanıcı güncellemesi tek reload yapıyor, eski asset/cache geçişi tutarlı ve ilerleme korunuyor. PWA olmayan normal tarayıcı modu da kullanılabilir; Android Chrome ve iOS Safari/standalone kurulum farkları test edilir.

## 9. Aşama H — doğrulama ve kaynak kod teslimi

Her aşamada küçük anlamlı commit hazırla; yeni sorumluluk/kural eklenince ilgili testleri çalıştır. İlk sürümde şu kapılar tamamlanmalıdır:

| Kontrol | Kanıt |
| --- | --- |
| Sürüm/lisans | `phaser@3.90.0` tek motor; tek lockfile; THIRD_PARTY_NOTICES ve tam lisans metinleri; asset köken listesi |
| Statik doğrulama | Temiz kurulumda typecheck ve production build çıktısı |
| İş kuralları | Katalog, yıldız/XP/ödül, satın alma, kayıt hata/göç/idempotency test sonuçları |
| İki mod | Macera kazan/kaybet/sonraki bölüm ve Sonsuz skor/jeton/çarpışma/restart tarayıcı senaryoları |
| Mobil ve lifecycle | 360×640, 390×844, 430×932, 768×1024, 844×390; 30/60/120 Hz; pause/blur, input tekrarı, audio, cleanup |
| Offline/güncelleme | SW kurulum, offline reload, iki mod, kayıt ve bekleyen güncelleme senaryosu |
| Servis yokluğu | Network kaydında API/Redis/analytics/harici font veya CDN bağımlılığı yok |
| Denge/performance | 20 bölüm insan testi; ölçülen FPS/frame süreleri ve cihaz bilgisi; sonuçları uydurmadan açık kalan kusurlar |

Final tesliminde çalışan yerel komutları, dosya ağacını, test raporunu, ekran görüntülerini, bilinen sınırları ve kaynak commit bilgisini yaz. Uzak Git işlemleri talep edilmişse ilgili commit/repo bağlantısını raporla. **Yayın yapılmadığını açıkça belirt.** “Tüm testler geçti” ifadesi yalnız gerçekten çalıştırılan ve geçen kontroller için kullanılabilir; oyun kalitesi/runtime uygunluğu yalnız tip kontrolünden çıkarılamaz.

## 10. Sonraki aşama için kısa başlangıç komutu

> `kaynak/research/flappy-{evolution,references,architecture,codex-task}.md` belgelerini oku. Bağımsız `flappy-evolution` reposunda Aşama A'dan başlayarak Phaser 3.90.0 + TypeScript + Vite oyun kaynak kodunu hazırla. Ultra Flappy'nin mevcut fiziğini koru; Macera ve Sonsuz Uçuş'u tek çekirdekte uygula. 4 dünya/20 bölüm, yerel ilerleme, özgün grafik/ses ve offline PWA'yı tamamla. Redis, DB, global skor, ücretli servis ve telemetry ekleme. Aşama kabul kapılarını kanıtla; Vercel'e yayın yapma.
