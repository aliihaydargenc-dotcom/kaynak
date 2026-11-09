# Flappy Evolution — oyun tasarımı

**Tarih:** 9 Kasım 2026. **Durum:** İlk sürüm için uygulanabilir tasarım önerisi; oyun henüz geliştirilmedi veya oynanarak dengelenmedi.

Teknik dayanak: [referans incelemesi](flappy-references.md), [mimari](flappy-architecture.md), [geliştirme görevi](flappy-codex-task.md). Aşağıdaki dünya, bölüm ve ekonomi değerleri yeni ürün kararlarıdır; referans oyunda mevcut özellikler olarak yorumlanmamalıdır.

## 1. Ürün ve temel döngü

Flappy Evolution, tek uygulamada **Macera** ve **Sonsuz Uçuş** sunan, dikey mobil öncelikli bir Phaser 3 oyunudur. Oyuncu dokunarak yükselir, engelleri geçer, yıldız ve kozmetik kazanır. Tekrar denemek ücretsiz ve sınırsızdır. Hesap, enerji, reklamla devam, ödeme, çevrimiçi sıralama ve günlük bağlantı zorunluluğu yoktur.

Ana menü → mod seçimi → Macera için dünya/bölüm seçimi veya Sonsuz Uçuş → hazır ekranı → ilk dokunuşla uçuş → başarı/çarpışma → sonuç → tekrar dene, sonraki bölüm veya menü. Gardırop ve ayarlar menüden erişilir. Her iki mod ilk açılışta kullanılabilir; yalnızca Macera bölümleri sırayla açılır.

Uçuş temeli Ultra Flappy Horizon'dan alınır: 480×854 mantıksal alan, kuş x=144, başlangıç y=392,84, yerçekimi 1650 px/s², kanat darbesi dikey hızı −430 px/s yapar. Zemin yüksekliği 104 px. Karakter, dünya, XP ve kozmetik bu değerleri değiştirmez. Dokunma, SPACE ve yukarı ok aynı aksiyonu tetikler; basılı tuşun repeat olayı fazladan darbe üretmez.

## 2. Macera: dört dünya, toplam 20 bölüm

Her dünyada 5 bölüm vardır. Bölüm kazanmak için tabloda belirtilen **engel çifti geçiş sayısına** ulaşmak gerekir. `score` yakın geçiş bonusu içerebildiğinden bitiş koşulu olamaz. Tek çarpışma denemeyi bitirir; can veya kontrol noktası yoktur. Final engeliyle aynı karede çarpışma varsa kayıp önceliklidir.

| Dünya | Görsel ve ses yönü | Öğretilen beceri | Dünya tamamlama ödülü |
| --- | --- | --- | --- |
| 1 — Filiz Vadisi | Özgün yeşil bitkiler, gün doğumu, yumuşak kısa tonlar | Dokunma ritmi, sabit açıklıklar | Filiz karakter görünümü |
| 2 — Kumul Geçidi | Özgün kumtaşı kemerleri, sıcak renkler, kuru perküsif tonlar | Kontrollü yükselip alçalan açıklık (`sway`) | Kumul karakter görünümü |
| 3 — Kristal Zirve | Özgün kristal sütunlar, soğuk palet, parlak sentez tonları | Daralıp genişleyen açıklık (`pulse`) | Kristal karakter görünümü |
| 4 — Yıldız Yolu | Özgün gök adaları, koyu zemin, uzay hissi veren sentez | Önceden bildirilen hafif rüzgâr ve birleşik düzenler | Nova karakter görünümü ve final rozeti |

### Bölüm tablosu

Hız px/s, açıklık px, üretim aralığı ms cinsindendir. Değerler bölüm boyunca sabittir; Macera'da Sonsuz Uçuş'un zamana bağlı zorluk artışı kullanılmaz. Hareketli engellerin ayrıntıları tablonun altındadır. İlk geçiş ödülü yalnızca bir kez verilir.

| ID | Bölüm | Geçiş hedefi | Hız | Temel açıklık | Üretim aralığı | Düzen | 2. yıldız için jeton | İlk geçiş jetonu |
| --- | --- | ---: | ---: | ---: | ---: | --- | ---: | ---: |
| 1-1 | İlk Kanat | 8 | 210 | 260 | 1650 | Sabit | 2 | 20 |
| 1-2 | Yaprak Arası | 10 | 210 | 254 | 1650 | Sabit | 2 | 20 |
| 1-3 | Dere Kıvrımı | 12 | 220 | 248 | 1600 | Sabit | 3 | 20 |
| 1-4 | Yüksek Dallar | 14 | 220 | 242 | 1600 | Sabit | 3 | 20 |
| 1-5 | Vadi Kapısı | 16 | 230 | 236 | 1550 | Sabit final | 4 | 20 |
| 2-1 | Kum Ritmi | 14 | 230 | 240 | 1550 | Her 4. engel sway | 3 | 30 |
| 2-2 | Eski Kemer | 16 | 240 | 236 | 1500 | Her 4. engel sway | 4 | 30 |
| 2-3 | Serap | 18 | 240 | 232 | 1500 | Her 3. engel sway | 4 | 30 |
| 2-4 | Kanyon | 20 | 250 | 228 | 1450 | Her 3. engel sway | 5 | 30 |
| 2-5 | Kumul Kapısı | 22 | 250 | 224 | 1450 | Her 2. engel sway | 5 | 30 |
| 3-1 | Kristal Eşik | 18 | 250 | 232 | 1450 | Her 4. engel pulse | 4 | 40 |
| 3-2 | Buz Nefesi | 20 | 260 | 228 | 1400 | Her 3. engel pulse | 5 | 40 |
| 3-3 | Yankı | 22 | 260 | 224 | 1400 | Her 3. pulse, diğer her 4. sway | 5 | 40 |
| 3-4 | Zirve Yolu | 24 | 270 | 220 | 1350 | Her 2. engel pulse | 6 | 40 |
| 3-5 | Kristal Taç | 26 | 270 | 216 | 1350 | Her 2. pulse, kalan her 3. sway | 6 | 40 |
| 4-1 | Yörünge | 24 | 270 | 228 | 1350 | Sabit + hafif rüzgâr | 6 | 50 |
| 4-2 | Meteor Yolu | 26 | 280 | 224 | 1300 | Her 4. sway + rüzgâr | 6 | 50 |
| 4-3 | Yıldız Akımı | 28 | 280 | 220 | 1300 | Her 4. pulse + rüzgâr | 7 | 50 |
| 4-4 | Ufuk Çizgisi | 30 | 290 | 216 | 1250 | Her 2. pulse, kalan her 3. sway + rüzgâr | 7 | 50 |
| 4-5 | Evrim Kapısı | 34 | 300 | 212 | 1250 | Her 2. pulse, kalan her 3. sway + rüzgâr | 8 | 50 |

Engel numarası 1'den başlar. Bir engel iki kurala uyarsa `pulse` önceliklidir; tek engelde iki hareket uygulanmaz. `sway` genliği 20 px, açısal frekansı 0,9 rad/s; `pulse` açıklık genliği 24 px, açısal frekansı 0,9 rad/s. Fazlar bölüm seed'inden gelir. Macera'da açıklığa rastgele −14/+18 eklenmez.

Her bölüm sabit `seed = "adventure:<ID>:v1"` kullanır. Merkezler ilk engelde 360 px'ten başlar; sonraki merkezler önceki merkezden en çok ±70 px değişir. Hareketin tamamında üst açıklık kenarı ≥120, alt açıklık kenarı ≤630 kalacak şekilde sınırlandırılır. Jeton her çift numaralı engelin merkezinde bulunur; böylece hedefe kadar `floor(hedef/2)` jeton vardır ve ikinci yıldız eşiği erişilebilirdir. Görsel jeton toplama ile near-miss bonus jetonu ayrı sayaçtır.

Dünya 4'te ilk rüzgâr aktif uçuşun 10. saniyesinde, devamı 12 saniyede bir başlar. Her olaydan 1 saniye önce yön oku ve yazı gösterilir. Etki 1,8 saniye sürer, kuvvet sırayla −120/+120 px/s² olur; uygulama mevcut `pushVertical(force * delta / 1000)` yolundan geçer. Duraklatmada süre ilerlemez. Bu, kaynaktaki ±390'a kadar rastgele rüzgârdan bilinçli bir Macera uyarlamasıdır.

### Yıldız ve bölüm açma kuralları

1. **1 yıldız:** Hedef engel sayısına çarpmadan ulaş. Başarısız deneme 0 yıldızdır.
2. **2 yıldız:** Bitir ve tablodaki kadar fiziksel jeton topla. Near-miss bonusu bu hedefe sayılmaz.
3. **3 yıldız:** İkinci yıldızı kazan ve tüm engel geçişlerinde kuş merkezinin açıklık merkezine uzaklığı ≤40 px olsun. HUD'daki “Kusursuz rota” durumu ilk ihlalde kapanır; başka ceza verilmez.
4. Bir bölümde en az 1 yıldız sonraki bölümü açar. Dünya sonu bir sonraki dünyanın ilk bölümünü açar. Yıldız toplamıyla ek kilit yoktur; üst sınır 60 yıldızdır.
5. `bestStars = max(eski, yeni)`; düşük yıldızlı tekrarlar ilerlemeyi düşürmez. Başarı anında uçuş ve üretim durur; yeni dokunuş yalnızca sonuç aksiyonuna gider.

## 3. Sonsuz Uçuş

Sonsuz Uçuş'un hedefi yerel en iyi skoru geçmektir; bölüm bitişi yoktur. İlk sürümde Filiz Vadisi teması kullanılır. Dünya kilitleri bu modu engellemez. Karakter ve kozmetikler iki modda ortaktır. Macera rekorları Sonsuz Uçuş rekor tablosuna karışmaz.

Kaynağın `DifficultyDirector` eğrisi korunur: `intensity = clamp(0.68 × clamp(score/90) + 0.32 × clamp(activeSeconds/150))`; hız 210→410, açıklık 242→136, üretim aralığı 1650→910. Sway olasılığı 0,16→0,45; pulse 0,07→0,28; jeton 0,46→0,58; rüzgâr 0,05→0,34. İlk üretim beklemesi 450 ms'dir. Rastgele açıklık ve rüzgâr kaynak davranışıyla başlar; erişilemez düzen sorunu saptanırsa ayrı ve ölçümlü dengeleme değişikliği yapılır.

Her engel çifti bir kez +1 skor verir. Kaynaktaki `clearance < 18` yakın geçişi +1 skor ve +1 bonus jeton verir; toplanan fiziksel jeton +1 cüzdan jetonudur. Yakın geçişin mevcut ölçümü kuş merkezini esas alır; ilk aktarımda sessizce yeniden tanımlanmaz. Yalnızca hayattayken gerçekleşen geçiş/toplama ödüllendirilir. Ölüm animasyonu veya sonuç ekranında skor artmaz. Yerel en iyi skor ve son en yüksek 10 skor tutulur; aynı skorlu farklı koşular ayrı kayıttır.

## 4. Ekonomi, evrim ve kalıcılık

**Evrim fiziksel güç artışı değil görsel gelişimdir.** Başlangıç karakteri Kıvılcım ücretsizdir. Dört dünya görünümü ilgili dünyanın 5. bölümünü bitirince açılır. XP seviyesi aynı karakterin rozet/iz görünümünü değiştirir: 0–499 Yavru, 500–1499 Gezgin, 1500–2999 Usta, ≥3000 Efsane. Hitbox ve uçuş tüm görünümlerde aynıdır.

| Kaynak/harcama | Kural | Tekrar davranışı |
| --- | --- | --- |
| Fiziksel jeton | Toplanan her jeton +1 | Her biten koşuda/denemede bir kez; kayıpta da korunur |
| Yakın geçiş jetonu | Kaynakta olduğu gibi +1 | Macera'da cüzdana girer, yıldız jetonuna girmez |
| İlk Macera başarısı | Bölüm tablosundaki 20/30/40/50 jeton | Bölüm başına yalnız bir kez |
| Yıldız XP'si | Her yeni en iyi yıldız için 25 XP | `25 × max(0, yeniYıldız − eskiYıldız)`; toplam Macera yıldız XP'si en fazla 1500 |
| Sonsuz Uçuş XP'si | `min(100, 2 × passedGates)` | Her tamamlanan benzersiz koşuda bir kez; tekrar koşarak kazanılabilir |
| Kozmetik izler | Yaprak 100, Kum 250, Yıldız 500 jeton | Her biri bir kez satın alınır; bakiye yetersizse satın alma yok |

Macera kaybında yıldız, ilk geçiş ödülü ve XP verilmez; fiziksel ve bonus jetonlar korunur. Sonsuz Uçuş kaybı normal koşu bitişidir. Near-miss ek puanı XP geçiş sayısını artırmaz. Dünya açılışı ve karakter ödülü ilk başarı ile aynı kayıt işleminde hesaplanır. İlk geçiş bonuslarının tümü toplam 700 jetondur.

`runId` ile tek sonuç yalnız bir kez işlenir; çift tıklama, yeniden çizim, sahne geçişi ve geç çalışan callback ödülü çoğaltamaz. Tek kayıt zarfı; cüzdan, XP, yıldızlar, açılan karakterler, kozmetik sahipliği, seçili görünüm, ayarlar ve yerel rekorları birlikte saklar. Tarayıcı kapanması/yenileme aktif koşuyu iptal eder; son tamamlanan kayıt korunur, yarım koşuya ödül yoktur. Sekme gizlenirse oyun duraklatılır; dönüşte otomatik başlamaz.

İlerleme aynı cihazın aynı tarayıcı profili ve origin'inde tutulur. Tarayıcı verisini silmek ilerlemeyi siler; bulut eşitleme ve cihazlar arası devam ilk sürümde yoktur. Depolama engellenirse bellek üzerinde oyun sürer, “İlerleme bu oturumda saklanıyor” mesajı görünür. Teknik şema ve göç sınırları [mimaride](flappy-architecture.md) tanımlıdır.

## 5. Mobil deneyim ve özgün üretim

UI/UX Pro Max'in erişilebilirlik, dokunma, güvenli alan ve hareket kuralları uygulanır; kaynak ve kabul ölçütleri [mimaride](flappy-architecture.md). Menüde iki belirgin mod kartı; haritada dünya adı, bölüm numarası, yıldız ve kilit nedeni; sonuçta kazanılan ödül ve tek baskın tekrar/sonraki bölüm aksiyonu bulunur. Kilit yalnız renkle anlatılmaz. Başlangıç öğreticisi “Dokun: yüksel / Bırak: alçal” metniyle kısa tutulur.

Dört dünya için yeni arka planlar, engel çizimleri ve karakter kareleri; yeni sentez ses tarifleri veya hakları belgelenmiş özgün sesler üretilir. Kaynak oyunun markası, kuş çizimleri, ikonları ve ses melodileri ürün kimliği olarak kullanılmaz. Kaynak üretim yardımcıları öğrenme/teknik uyarlama için korunabilir; türetilen kodun MIT bildirimi korunur. Sprite değişiminde hitbox eşlemesi ayrıca doğrulanır.

Bu değerler ilk dengeleme tabanıdır. 20 bölümün tamamlanabilirliği, yıldız hedeflerinin adilliği ve son dünya rüzgârı gerçek mobil oyun testiyle doğrulanmadan “dengeli” kabul edilmez.
