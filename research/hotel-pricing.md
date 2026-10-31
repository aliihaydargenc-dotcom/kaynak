# HotelCompare: çok kaynaklı gün içi fiyat izleme

**İnceleme:** 2026-11-01 · **Canlı durum:** Mevcut üretim fiyat API'sine
ve kaynak koduna erişim doğrulanmadı. Bu araştırma yeni canlı
fiyat veya acente erişimi elde edildiği anlamına gelmez.

## Kaynak ve kısıt matrisi

| Kaynak | Getirebilir | Erişim | Gerçek sınır |
| --- | --- | --- | --- |
| SerpApi Google Hotels | Google Hotels mülk/OTA listeleri | Mevcut anahtar ve kota | 1 saat cache; `no_cache=true` yeni sorgu sayısı tüketebilir. |
| ETS / Tatilbudur / Jolly | İzinli sayfa/API üzerinden oda teklifleri | Site bazlı doğrulama gerekir | Seçici/oturum/şartlar değişebilir, eşit koşullar şart. |
| Booking Demand API | Konaklama ve kampanyalı fiyatlar | Onaylı partner erişimi | Partner konfigürasyonuna ve rate limit'e bağlı. |
| Expedia Rapid | Room availability + Shopping + Price Check | Onaylı partner | Herkese sınırsız ücretsiz API değil. |
| Google Hotel Center | Otel/OTA fiyat **sağlama** akışı | Fiyat yayımlayan partner | Anonim toplu otel fiyat çekme API'si değildir. |

Resmî referanslar:

1. [SerpApi Google Hotels API](https://serpapi.com/google-hotels-api)
2. [SerpApi Google Hotels Property Details](https://serpapi.com/google-hotels-property-details)
3. [Booking.com Demand API rate limits](https://developers.booking.com/demand/docs/development-guide/rate-limiting)
4. [Expedia Rapid Shopping](https://developers.expediagroup.com/rapid/lodging/shopping/about-shopping-api)
5. [Expedia Rapid Documentation](https://developers.expediagroup.com/rapid/lodging)
6. [Google Hotel Prices Data Feeds](https://developers.google.com/hotels/hotel-prices/dev-guide/data-feeds)

**Tek bir uygun anahtar tüm acentelerin güvenilir canlı teklifini garanti
etmez.** "Tüm OTA verisi, her dakika ve sonsuza dek bedava" yaklaşımı için
doğrulanmış, izinli bir servis bulunmadı. Ücretsiz yazılım ve mevcut
API kotalarını verimli kullanmak mümkün; veri edinimi ayrı bir konudur.

## Gün içi değişimi saptama

Her izleme profilinin sabit anahtarı:
`otel_id + kaynak + giriş/çıkış + yetişkin + çocuk yaşları + oda sayısı +
oda adı + pansiyon + iptal + ödeme + tutar kapsamı + vergi kapsamı +
para birimi`. Oda ayrıntısı bilinmeyen kaynaklar `listing` olarak
işaretlenir ve **indicative_listing** güven seviyesinde gösterilir.

Kaynak yanıtı geldiğinde:

1. Aynı parametreleri taşıyan doğrulanabilir teklifi normalize et.
2. Kaynak URL/teklif zamanını ve gösterilen tutarın neyi kapsadığını kaydet.
3. Son örnekle aynı `Europe/Istanbul` gününde karşılaştır.
4. Tutar değiştiyse (TL bazında 1 kuruş veya daha fazla) artış/azalış olayı yaz.
5. Daha eski zaman damgası, tekrar eden snapshot veya başka oda/acente için
   yanlış alarm üretme.
6. Uyarıyı mobil/masaüstü panelde zaman, fiyat, kaynak ve güven seviyesiyle
   göster; bildirim gönderimi daha sonra kullanıcı izniyle bağlanabilir.

`hotelcompare-serpapi/rate_watch/monitor.py` içinde bu çekirdek
uygulanmıştır. `tests/test_rate_watch.py` aynı gün, farklı oda/acente,
zaman sınırı, stale/duplicate ve çocuk yaşları senaryolarını sınar.

## Kota tasarrufu ve veri kaynağı çeşitlendirme

SerpApi'yi tek mülkün `property_token` değeriyle sorgulamak mülk
eşleştirme riskini azaltır; Google Hotels API'nin `prices` ve
`featured_prices` alanları kaynak adlarını taşıyabilir. Ancak tek
mülk görünümü tüm acentelerin toplam fiyatlarını garanti etmez.

İlk aşamada saatlik veya 2 saatlik planlı örnekleme ve **sorgu bütçesi**
kullan. Yanıtın `search_metadata.status` ve `search_metadata.id`
alanlarını, önbellek yaşını, kaynak adını, API başarı/429/timeout
durumunu sakla. Fiyatı bilmediğimiz durumda `unavailable` ile
`not_observed` ayrımını koru. Aynı offer için tek endpoint'i çok sık
sorgulamak doğruluğu veya kapsama alanını artırmaz.

Kaynak adaptörleri ayrı modüller olmalı:
`SerpApiAdapter`, `ApprovedOTAAdapter`, `ManualImportAdapter`.
Her biri yukarıdaki ortak teklif şemasına dönüşmeli.
Kaynak izinlerini veya bot korumalarını aşan çözüm planlanmadı.

## Entegrasyon önkoşulu

GitHub'daki `hotelcompare-serpapi` deposu yalnızca README içerdiği
için üretim fiyat sorgulama akışı değiştirilmedi. Çalışan kaynak dosyaları
gelince normalizasyon adımı API yanıtı üzerine bağlanır; izleme kayıtları
üretimde kalıcı PostgreSQL/Supabase'e taşınır. SQLite yerel MVP içindir.
Gerçek fiyat bildirimleri **ilk iki başarılı ve aynı koşullu fiyat örneği
görülmeden** oluşmaz.
