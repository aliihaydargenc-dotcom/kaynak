# Flappy Evolution — doğrulanmış teknik referanslar

**İnceleme tarihi:** 9 Kasım 2026. GitHub API üzerinden erişilen commit'ler, dosya içerikleri ve lisans metinleri incelendi. Bu görevde referans oyun derlenmedi veya oynatılmadı; “çalışan temel” kullanıcının seçtiği mevcut projeyi belirtir. Çalışma doğrulaması sonraki aşamanın ilk kabul kapısıdır.

İlişkili belgeler: [tasarım](flappy-evolution.md), [mimari](flappy-architecture.md), [Codex görevi](flappy-codex-task.md).

## 1. Kaynak ve sürüm matrisi

Tablodaki commit bağlantıları inceleme anını sabitler. Varsayılan dal ve README açıklaması tek başına sürüm kanıtı sayılmaz.

| Kaynak | İncelenen commit / sürüm | Doğrulanan lisans | Karar |
| --- | --- | --- | --- |
| [voyvodka/FlappyBirdGame](https://github.com/voyvodka/FlappyBirdGame) | [9117cfe268940acef8fc10ba0cff8e758a5d7209](https://github.com/voyvodka/FlappyBirdGame/tree/9117cfe268940acef8fc10ba0cff8e758a5d7209); `ultra-flappy-web` 1.0.1 | [MIT, ©2026 Samet Özkan](https://github.com/voyvodka/FlappyBirdGame/blob/9117cfe268940acef8fc10ba0cff8e758a5d7209/LICENSE) | Birincil oyun temeli; fizik ve mevcut uçuş döngüsü buradan |
| [phaserjs/phaser](https://github.com/phaserjs/phaser) | [master: 02d8931b626d9764c133cbb3fbf99966c03c757c](https://github.com/phaserjs/phaser/tree/02d8931b626d9764c133cbb3fbf99966c03c757c), package 4.2.1 | [MIT](https://github.com/phaserjs/phaser/blob/02d8931b626d9764c133cbb3fbf99966c03c757c/LICENSE.md) | Güncel master doğrudan kullanılmayacak |
| Phaser 3 sabit referansı | [v3.90.0 → a9965625f49cf366584f454556b039e06e8adad6](https://github.com/phaserjs/phaser/tree/a9965625f49cf366584f454556b039e06e8adad6); package 3.90.0, Tsugumi | [MIT, ©2024 Richard Davey, Phaser Studio Inc.](https://github.com/phaserjs/phaser/blob/a9965625f49cf366584f454556b039e06e8adad6/LICENSE.md) | İlk sürüm motoru **tam olarak 3.90.0** |
| [phaserjs/examples](https://github.com/phaserjs/examples) | [eb87db8355861ae222d0c5cd13aae54c2d7d72ae](https://github.com/phaserjs/examples/tree/eb87db8355861ae222d0c5cd13aae54c2d7d72ae); README artık Phaser 4 diyor | [README: kod MIT; asset'ler bu izne dahil değil](https://github.com/phaserjs/examples/blob/eb87db8355861ae222d0c5cd13aae54c2d7d72ae/README.md); GitHub lisans alanı boş | Yalnız incelenen 3.86 arşiv örüntüleri, 3.90 testi sonrası; örnek asset kopyalama yok |
| [phaserjs/template-vite-ts](https://github.com/phaserjs/template-vite-ts) | [d1d7d58acfcf47f97642bcb8b4967071b85f8db9](https://github.com/phaserjs/template-vite-ts/tree/d1d7d58acfcf47f97642bcb8b4967071b85f8db9); template 1.4.0, bağımlılık **Phaser 4.0.0** | [MIT, ©2025 Phaser Studio Inc.](https://github.com/phaserjs/template-vite-ts/blob/d1d7d58acfcf47f97642bcb8b4967071b85f8db9/LICENSE) | Klasör/build yaklaşımı referansı; doğrudan scaffold yapılmayacak |
| [aliihaydargenc-dotcom/mola-app](https://github.com/aliihaydargenc-dotcom/mola-app) | [f4ec62b21fcdd40916bf32d14085a865dba58887](https://github.com/aliihaydargenc-dotcom/mola-app/tree/f4ec62b21fcdd40916bf32d14085a865dba58887); package 0.2.0 | Kök LICENSE ve package lisans alanı yok; alt oyun lisansları ayrı | Özel repo, bağlı yetkiyle incelendi. Mobil/PWA/UX örüntüsü; genel yeniden dağıtım lisansı varsayılmaz |

Ultra Flappy'nin [package.json](https://github.com/voyvodka/FlappyBirdGame/blob/9117cfe268940acef8fc10ba0cff8e758a5d7209/package.json) aralıkları `phaser:^3.90.0`, TypeScript `^5.9.3`, Vite `^7.3.1`; [yarn.lock](https://github.com/voyvodka/FlappyBirdGame/blob/9117cfe268940acef8fc10ba0cff8e758a5d7209/yarn.lock) çözümlemeleri sırasıyla **3.90.0 / 5.9.3 / 7.3.1**. Kaynak Yarn kullanır. Yeni repo bu sürümler ve tek `yarn.lock` ile başlar. Güncel şablonun açıklaması “Phaser 3” kalsa da package bağımlılığı 4.0.0'dır; açıklama yanıltıcıdır.

## 2. Ultra Flappy Horizon kod haritası

Aşağıdaki yollar [9117cfe kaynak ağacına](https://github.com/voyvodka/FlappyBirdGame/tree/9117cfe268940acef8fc10ba0cff8e758a5d7209/src/game) göredir. İsimler mevcut gerçek sınıf ve metotlardır.

| Yol / sembol | Mevcut davranış | Aktarım kararı |
| --- | --- | --- |
| `constants.ts` | 480×854; zemin 104; boru 96×520; gravity 1650, flap 430; 4 tint skin, skor eşikleri 0/25/55/95 | Fizik/sahne ölçülerini koru; skin/başarı ürün kurallarını yeni tasarıma uyarla |
| `GameConfig.ts` | `Phaser.AUTO`, Arcade world gravity (0,0), FIT/CENTER_BOTH, Boot/Menu/Play | Phaser 3 yapılandırmasını temel al; dikey alanı CSS ile güvenli alana yerleştir |
| `entities/Bird.ts` → `flap`, `setGameplayGravity`, `pushVertical` | Arcade Sprite; `setVelocityY(-power)`; gravity kuş gövdesinde; rüzgâr hıza eklenir | Uçuş entegrasyonunu ve input→flap yolunu koru; ikinci fizik motoru ekleme |
| `Bird.ts` → `updateBird`, `getHitbox` | 3 texture, 85 ms kare değişimi; `clamp(vy×0.06,-24,85)`, açı lerp 0.15; görsel bounds üzerinden daraltılmış dikdörtgen | Animasyon akışını koru; özgün kareler aynı mantıksal boyuta uysun; görünür debug hitbox ile kontrol et |
| `scenes/PlayScene.ts` → `create`, `bindInput`, `startRun` | `ready → playing → dead → results`; ilk girişte flap; pointer/SPACE/UP; SHUTDOWN'da handler temizliği | Ortak PlayScene'i genişlet; mode/level sözleşmesi ve pause/won durumlarını ekle |
| `spawnPipePair`, `pickVariant`, `applyPairLayout` | Sağdan x=620; merkez 120..630; açıklık −14/+18 rastgele, clamp 126..280; static/sway/pulse; sinüs hareketi; pulse ±24 | Sonsuz'da temel davranışı koru; Macera'da config ve seeded dizilerle üret; iki ayrı üretici kopyası yapma |
| `updatePipes`, `destroyPair` | `x -= speed × delta/1000`; `scored` ile tek geçiş; x<bird.x−24 skoru; x<−180 nesneleri yok et | Hareket/temizlik örüntüsü korunur; hayatta olmayan koşuda ödülü engelle |
| `checkCollisions` | `Bird.getHitbox()` ile manuel `RectangleToRectangle`; tavan top≤4, zemin bottom≥742; boru içe alınmış dikdörtgenleri | İlk aktarımda aynen koru; Arcade collider ile değiştirme |
| `handleScorePass`, `intersectsCoin` | +1 geçiş; merkezden hesaplanan clearance<18 ise +1 skor/+1 jeton; fiziksel jetonun daraltılmış görsel bounds'u | `passedGates`, `pickupCoins`, `bonusCoins`, skor ayrı tutulur; Macera bitişi skora bağlanmaz |
| `systems/DifficultyDirector.ts` | Skor ve geçen aktif zamandan intensity; hız/açıklık/gecikme ve olay olasılıklarını lineer değiştirir | Sonsuz'da koru; Macera sabit bölüm profili kullanır |
| `updateWind`, `scrollBackground`, `updateTrail`, `spawnImpactBurst` | Dikey hız itkisi, çok katmanlı TileSprite paralaksı, tween parçacıkları ve çarpışma efekti | Ortak sistemler; reduced-motion dekoratif hareketi azaltır; rüzgâr uyarısı Macera için eklenir |
| `systems/ProceduralAssets.ts`, `BootScene.ts` | Canvas ile kuş 72×64/3 kare, boru, UI, jeton ve arka plan texture'ları üretir; Boot'ta hazırlanır | Üretim tekniği yararlı; yeni çizimler ve ürün kimliği hazırlanır |
| `systems/AudioSystem.ts` | Web Audio oscillator/gain zarflarıyla flap/score/coin/hit/unlock; ilk etkileşimde context resume | Sentez tekniği uyarlanabilir; yeni ses tarifleri, kalıcı ses ayarı ve dispose eklenir |
| `data/SaveManager.ts` | `ultra_flappy_save_v1`; rekor, cüzdan, skin, başarı, ilk 10 yerel skor; JSON merge ve bazı dizi kontrolleri | Genişlet ve doğrulamayı güçlendir; sürümleme/idempotent sonuç işleme ekle |
| `scenes/MenuScene.ts` | Skin seçimi, yerel/global skor, kullanıcı adı prompt'u | Menü akışı ve skin önizleme fikri; global skor/kullanıcı adı kaldırılır; iki mod ve bölüm haritası eklenir |

### Korunacak somut kod davranışları

```text
Bird.flap: body.setVelocityY(-430)
Bird gravity: world y=0, body y=1650
Pipe motion: pair.x -= activeDifficulty.speed * deltaMs / 1000
Collision: Phaser.Geom.Intersects.RectangleToRectangle(birdRect, pipeRect)
Single pass: !pair.scored && pair.x < bird.x - 24
```

Bu özet yeni bir fizik implementasyonu değildir. Gerçek aktarımda kaynak dosyalar ve telif bildirimi korunarak küçük değişiklikler yapılır.

### İncelemede görülen sınırlar ve gerekli düzeltmeler

1. Arcade body'si 38×30, offset (16,17) olsa da ölüm kontrolü **bu body ile yapılmaz**; `getBounds()` tabanlı `getHitbox()` kullanılır. Rotasyon ve yeni görsel boyutu bu dikdörtgeni etkileyebilir. Body ölçüsünü çarpışma ölçüsü diye raporlamak yanlıştır.
2. `update` içinde `dead` dalı `updatePipes` çağırır; bu metot skor ve jeton artırabilir. Sonuç snapshot'ı ölüm anında sabitlenmeli; dekoratif hareket ödül üretmemelidir. Ayrıca kaynak karede ödül çarpışmadan önce hesaplanır; yeni ortak akışta çarpışma önceliği açıkça test edilmelidir.
3. `SaveManager.load` içindeki `getItem` try bloğunun dışında; `save` içindeki `setItem` korumasız. Sayısal alanlar tümüyle doğrulanmıyor; varsayılan nesnenin sığ kopyaları dizi paylaşabilir. Storage erişimi/parse/yazma korunmalı, yeni varsayılanlar her seferinde üretilmelidir.
4. `pair.coin.angle += 2.3` ve kuş açı lerp'i kare hızına bağlı görsel davranışlardır; fizik değişikliği sayılmadan ayrı incelenir. Ani delta/sekme dönüşünde boru sıçraması ve manuel çarpışmada atlama testi gerekir. Pause/resume eklenmesi fizik sabitlerini değiştirmeyi gerektirmez.
5. `AudioSystem` sahne başına gain node yaratıyor; scene restart'ta bağlantı ve listener ömrü ele alınmalı. Global skor kaldırılırken yalnız endpoint dosyalarını silmek yeterli değildir: Menu/Play/main import ve callback'leri temizlenmelidir.

## 3. İlk sürüme alınmayacak ağ ve servisler

`src/game/network/ScoreService.ts`, `api/score/*`, `api/_lib/scoreSecurity.ts`, `api/telemetry/client-error.ts`; PlayScene'in score session/chunk/submit alanları, MenuScene global sıralama ve kullanıcı adı, `src/main.ts` analytics/speed-insights/beacon kodları alınmaz.

`redis`, `@vercel/kv`, `@vercel/analytics`, `@vercel/speed-insights` bağımlılıkları ve servis env ihtiyaçları yeni repoda bulunmaz. `SCORE_SIGNING_SECRET`, Redis URL/token ve sunucu skor doğrulaması yerel oyun için gerekli değildir. Kaynağın sunucu güvenliğini zayıflatmak yerine bu ürün kapsamına sunucu bileşeni taşınmaz. Sonsuz Uçuş rekoru cihaz içi ve değiştirilebilir bir kayıttır; global anti-cheat iddiası yoktur.

## 4. Phaser örnekleri ve şablon: uyumluluk kapısı

İncelenen üç **3.86 arşiv** örneği aşağıdadır. Bunlar Phaser 3.90 üzerinde bu görevde çalıştırılmadı; sürüm uyumu yalnız kaynak/API düzeyinde adaydır.

| Sabit kaynak | Yararlanılacak örüntü | Sınır |
| --- | --- | --- |
| [FIT ve otomatik merkezleme](https://github.com/phaserjs/examples/blob/eb87db8355861ae222d0c5cd13aae54c2d7d72ae/public/3.86/src/scalemanager/fit%20with%20auto%20center.js) | `Scale.FIT`, `CENTER_BOTH`, sabit mantıksal alan | Örneğin 800×600 alanı ve görseli taşınmaz |
| [Arcade gravity](https://github.com/phaserjs/examples/blob/eb87db8355861ae222d0c5cd13aae54c2d7d72ae/public/3.86/src/physics/arcade/gravity.js) | Dünya ve gövde yerçekiminin toplamı; allowGravity | Kaynak oyunun world=0/body=1650 ayrımı korunur; örnek sayıları alınmaz |
| [Sprite sheet animasyonu](https://github.com/phaserjs/examples/blob/eb87db8355861ae222d0c5cd13aae54c2d7d72ae/public/3.86/src/animation/create%20animation%20from%20sprite%20sheet.js) | İleride özgün atlas kullanılırsa `anims.create` ve frame tanımları | İlk aktarımda mevcut 85 ms texture akışı yeterlidir; brawler/grid asset alınmaz |

Örnekler harici CDN'den asset yükler; bu URL'ler yeni oyuna taşınmaz. Varsayılan `public/src` ve labs'ın varsayılan dev motoru Phaser 4'tür. 3.86 arşivindeki her dosya da otomatik olarak 3.90 uyumlu kabul edilmez. Yeni örüntü ancak 3.90 tip kontrolü, build, tarayıcı smoke ve hedef davranış testi geçerse kullanılabilir. Phaser 4 renderer/filter/shader kodu bu ilk sürüme alınmaz.

Resmî template'in `src/game/main.ts`, `src/game/scenes/Game.ts`, `vite/config.prod.mjs` dosyaları incelendi: sahne ayrımı ve Phaser bundle ayırma fikri yararlı; 1024×768 sahne ölçüsü mobil için uygun değil. `dev/build` script'leri `log.js` de çalıştırıyor; yeni oyun mevcut Ultra Flappy'nin sade Vite script'leriyle başlamalı. Güncel template package'ı kurulup üstüne Phaser 3 dosyaları yapıştırılmamalıdır.

## 5. mola-app ve UI/UX Pro Max

İncelenen `mola-app` package'ında Phaser bağımlılığı yok; oyun listesinde Flappy bulunmuyor. Dolayısıyla bu repo Ultra Flappy Horizon kaynağı değil, mobil kabuk ve PWA referansıdır. Üçüncü taraf kaynak kod veya özel veri bu dokümanlara kopyalanmadı.

| Sabit kaynak | Bulgular ve kullanım |
| --- | --- |
| [GamesView.tsx](https://github.com/aliihaydargenc-dotcom/mola-app/blob/f4ec62b21fcdd40916bf32d14085a865dba58887/src/components/GamesView.tsx) | Erişilebilir buton adları, geri dönüşte odak restorasyonu, opsiyonel fullscreen/orientation hata yakalama. React/iframe katmanı bu oyuna taşınmaz; bağımsız tek Phaser uygulaması kurulur. |
| [public/sw.js](https://github.com/aliihaydargenc-dotcom/mola-app/blob/f4ec62b21fcdd40916bf32d14085a865dba58887/public/sw.js) | Build kimlikli önbellek, aynı origin kapsamı ve eski cache temizleme örüntüsü. Otomatik skipWaiting aktif uçuşta uygulanmayacak. |
| [manifest](https://github.com/aliihaydargenc-dotcom/mola-app/blob/f4ec62b21fcdd40916bf32d14085a865dba58887/public/manifest.webmanifest) | Standalone ve normal/maskable ikon ayrımı. Oyunda yeni kimlik, ikon ve portrait gerekir. |
| [THIRD_PARTY.md](https://github.com/aliihaydargenc-dotcom/mola-app/blob/f4ec62b21fcdd40916bf32d14085a865dba58887/public/games/THIRD_PARTY.md) | Alt oyunların ayrı lisans ve commit takibi. Bu lisanslar mola-app'in tümünü kapsamaz. |
| [UI/UX Pro Max SKILL.md](https://github.com/aliihaydargenc-dotcom/mola-app/blob/f4ec62b21fcdd40916bf32d14085a865dba58887/.agents/skills/ui-ux-pro-max/SKILL.md) ve [pro-rules](https://github.com/aliihaydargenc-dotcom/mola-app/blob/f4ec62b21fcdd40916bf32d14085a865dba58887/.agents/skills/ui-ux-pro-max/references/pro-rules.md) | Kontrast, odak, dokunma hedefi, safe-area, reduced-motion, tutarlı ikon ve etkileşim. Beceri altındaki [MIT bildirimi](https://github.com/aliihaydargenc-dotcom/mola-app/blob/f4ec62b21fcdd40916bf32d14085a865dba58887/.agents/skills/ui-ux-pro-max/LICENSE) ©2024 Next Level Builder. |

Bu hazırlıkta UI/UX Pro Max'in okunan genel kuralları uygulanabilir kabul kriterlerine dönüştürüldü; `search.py --design-system` çalıştırılmadı ve oyun için üretilmiş tasarım sistemi çıktısı varmış gibi sunulmadı. Molabi'nin mevcut sosyal uygulama paleti/landing düzeni de oyunun tasarım sistemi sayılmaz. Yeni repo aşamasında oyun odaklı tasarım sorgusu ve manuel uygunluk kontrolü yapılacak. Mevcut [Kaynak tasarım kuralları](../design-system/MASTER.md) de 44 px hedef, odak ve azaltılmış hareket için yardımcı referanstır.

## 6. Lisans ve asset uygulama kararı

MIT kod uyarlamasında özgün telif ve tam izin/garanti reddi metni dağıtıma dahil edilir. Yeni repoda `THIRD_PARTY_NOTICES.md` kaynağı, commit'i, alınan dosyaları ve değişiklikleri listeler; `licenses/` altında ilgili MIT metinleri, build çıktısında erişilebilir lisans bildirimleri bulunur. Yalnız bir URL vermek tam MIT bildirimini korumanın yerine geçmez. Araştırma dosyaları lisanslı üçüncü taraf kodun toplu kopyası değildir.

Phaser örneklerinin README'si asset'lerin MIT kapsamında olmadığını ve bazılarının eski ticari oyunlardan geldiğini açıkça belirtir. Bu görseller, sprite sheet'ler, müzikler ve sesler kullanılmaz. Ultra Flappy'nin procedural çizim/sentez yaklaşımı teknik olarak uyarlanabilir, ancak ürün grafik ve sesleri yeni üretilecektir. Üçüncü taraf font/ikon eklenirse kendi lisansı ve atıf koşulu ayrıca kaydedilir; ilk tabanda sistem fontu tercih edilir.

`mola-app` kökünde genel bir açık kaynak lisansı doğrulanmadı. Repo sahibinin erişimi/ürün yetkisi, diğer üçüncü taraf alt içeriklerin izinlerini genişletmez. Bu hazırlıkta davranış ve mimari fikirler referans alınır; doğrudan özel uygulama kodu dağıtılmaz. Bu ayrım oyun implementasyonuna da aktarılmalıdır.
