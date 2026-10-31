# Uygulama yol haritası ve kabul koşulları

## P0 — mevcut tamamlananlar

- REA CLI kuruldu; Codex MCP kaydı tazelendi; Node 24.22.1
  kullanılarak iki anonim tarayıcı senaryosu çalıştırıldı.
- Open Deep Research deposu klonlandı, `npm ci` tamamlandı.
  Firecrawl ve model anahtarı henüz yok; model tabanlı araştırma
  sorguları **çalıştırılmadı**.
- UI/UX Pro Max CLI ve Codex becerisi kuruldu; öneri/UX kuralları
  kaynak paneli arayüzüne uygulandı.
- EVENTRA, HotelCompare ve Hotel Rate Collector kod ağaçları
  kontrol edildi; modül farkları dokümante edildi.
- HotelCompare altında SQLite fiyat geçmişi ve gün içi alarm
  normalizasyonu, birim testleriyle hazırlandı.

## P1 — veri kaynağı bağlama

1. Canlıda kullanılan HotelCompare kaynak klasörünü Git reposuna
   **eksiksiz** aktar, API sırlarını ortam değişkenlerinde tut.
2. Bir otelin kalıcı `hotel_id` ve SerpApi `property_token`
   eşleşmesini onayla; her sorguda yeniden otel seçtirme.
3. Mevcut SerpApi yanıtlarındaki gerçekten mevcut `prices`,
   `featured_prices` ve tüm fiyat kapsamı alanlarını normalize et.
   Oda/iptal koşulları yoksa `indicative_listing` etiketini göster.
4. İzin verilen ikinci kaynağı `hotel-rate-collector` ile doğrula;
   kaynağa özel adaptör, test ve kullanım koşulu kontrolü yap.
5. Kalıcı fiyat geçmişini Supabase/PostgreSQL'e taşı; planlı sorgu
   için kota alarmı, kaynak hata oranı ve data freshness raporu ekle.

**Kabul:** Aynı otel, 2 yetişkin, aynı tarih, aynı odada bir kaynak
110.250 → 109.000 TRY gösterdiğinde, aynı gün tek yeni alarm ve
doğru güven seviyesi; başka oda veya kaynak fiyatı yanlış alarm
üretmez. Veri gelmeyen zaman aralığı ayrı "ölçülemedi" olarak görünür.

## P2 — etkinlik operasyonlarının iyileştirilmesi

1. EVENTRA görev onayı, çakışma, taşıma/geri alma ve bildirim
   teslimini doğrulanmış uçtan uca senaryolara bağla.
2. Mobil ana görünümde "Bugün", "Benim görevlerim", "Değişenler"
   ayrımını netleştir; masaüstünde planlama/finans detayı kalsın.
3. Tenant, kullanıcı rolü ve outbox ile gerçek veri izolasyonunu test et.
4. Rapor altyapısında etkinlik, katılım, maliyet, zamanında görev,
   gecikmiş bildirim ve yeniden planlama KPI'ları oluştur.

**Kabul:** Bir personelin iki görevi hareket–dönüş aralığında
çakışıyorsa sunucu engeller; görev güncellemesi aynı mobil cihaza
yalnızca bir mantıksal bildirim olayı olarak yansır.

## P3 — araştırma kalitesi

Yeni kaynaklar için URL, tarih, kapsam, doğrudan gözlem/doküman/yorum
ayrımı kaydedilir. Belirsiz çıkarımlar "test gerekli" statüsünde
kalır. Deep Research API anahtarları edinilmeden gerçek otonom
araştırma çalıştırılmış gibi raporlanmaz.
