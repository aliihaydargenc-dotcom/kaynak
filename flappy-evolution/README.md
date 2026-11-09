# Flappy Evolution

Güncel kaynak konumu: [`aliihaydargenc-dotcom/kaynak/flappy-evolution`](https://github.com/aliihaydargenc-dotcom/kaynak/tree/main/flappy-evolution). Bu klasör bağımsız bir Vite uygulamasıdır; `kaynak` reposunun kök uygulamasından ayrı çalışır. Komutlardan önce `cd flappy-evolution` çalıştırın. Canlı oyun: https://flappy-evolution-theta.vercel.app .

Mobil öncelikli özgün Phaser oyunu. **Macera:** 4 dünya / 20 bölüm / 60 yıldız. **Sonsuz Uçuş:** kaynak zorluk eğrisiyle yerel rekor. Ortak uçuş çekirdeği, özgün çizimler/sentez sesler, kozmetik evrim/gardırop, tek zarfta yerel kayıt, offline PWA.

## Çalıştırma

Node **22.x** (geliştirmede 22.23.4), Yarn **1.22.22**. Phaser **3.90.0**, TypeScript **5.9.3**, Vite **7.3.1**.

```sh
corepack enable
corepack prepare yarn@1.22.22 --activate
yarn install --frozen-lockfile
yarn dev
yarn test
yarn test:e2e
yarn build
yarn preview --port 4176
# Preview ayrı terminalde açıkken:
yarn test:pwa
```

Yerel browser testleri `/usr/bin/chromium` kullanır; farklı konum için `CHROMIUM_PATH` ayarla. CI'da `yarn playwright install --with-deps chromium` ile Playwright Chromium kullanılır. `test:pwa`, bekleyen güncelleme fixture'ı için yalnız `dist/` çıktısını değiştirir; ardından yeniden `yarn build` çalıştır.

Dokun / Space / yukarı ok: yüksel. Escape veya Duraklat: dur. Sekme gizlenince otomatik durur; dönüşte Devam et + geri sayım. Fullscreen isteğe bağlıdır. Oyunun ilk açılışı internet ister; menüde **Çevrimdışı hazır** görünmesinden sonra iki mod da offline çalışır.

## Kaynak ve mimari

Temel: `voyvodka/FlappyBirdGame@9117cfe268940acef8fc10ba0cff8e758a5d7209`. Bird Arcade entegrasyonu ve dikdörtgen çarpışması korunur: dünya gravity=0, kuş gravity=1650, flap=-430; alan 480×854. Grafik, ses, ekonomi ve ürün arayüzü yenidir. API, hesap, reklam, telemetry veya harici font yoktur.

```text
src/game/entities/Bird.ts       ortak kaynak fiziği
src/game/scenes/                Boot / Menü / Dünya Haritası / tek PlayScene
src/game/systems/               engel, özgün varlık, ses, sonsuz zorluk
src/game/data/                  20 bölüm, ödüller, doğrulanmış kayıt, sekme kilidi
src/ui/                        semantik HTML ve input sınırı
src/pwa.ts, scripts/build-sw.mjs  offline cache ve kontrollü güncelleme
tests/, e2e/, scripts/check-*.cjs otomatik doğrulama
public/icons/, public/licenses/ özgün ikonlar ve tam lisanslar
docs/evidence/                  aşama raporları ve ekran görüntüleri
```

Kayıt yalnız aynı origin/tarayıcı profiline aittir; bulut eşitlemesi yoktur. Depolama engellenince oturumluk oyun sürer. Sayfa yenilemesi aktif koşuyu iptal eder; tamamlanmış kayıt korunur. Kozmetikler fiziği değiştirmez.

`?debug` hitbox ve yerel tanılama erişimi; `?canvas` alternatif Canvas renderer; `?timer` test ortamında setTimeout kare sürücüsü. Varsayılan normal oyunda Phaser.AUTO ve RAF kullanılır. Otomatik kare fixture'ları gerçek cihazda oyuncu başarısı/FPS kanıtı değildir.

## Durum ve kanıtlar

[Test raporu](docs/evidence/H-report.md), [grafik/ses kökeni](docs/ASSET_PROVENANCE.md), [tasarım sistemi](design-system/MASTER.md), [üçüncü taraf bildirimleri](THIRD_PARTY_NOTICES.md). Tam kaynak gereksinimleri `docs/flappy-*.md` altında saklıdır.

İlk talepte yayın kapsam dışıydı; kullanıcı daha sonra açıkça Vercel yayını istedi. Güncel yayın/commit bilgisi test raporunda tutulur. Telefon/Android/iOS kurulum ve 20 bölüm insan/dengelenme testini kullanıcı yapacak.

## Combat / character upgrade
See [combat design and installed skill references](docs/combat-upgrade.md). Flight HUD redesigned; five increasing character tiers, ZzFX sound synthesis, pooled fireballs, optional cracked walls and two-phase adventure bosses. Tap sky/Space to flap, tap fire or F to shoot. First two characters receive basic fire only during a boss. Existing saves are retained.
