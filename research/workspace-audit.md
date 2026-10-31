# Kendi projelerimiz: kaynak kodu denetimi

**1 Kasım 2026.** Bu çalışma yerel Git clone ve dosya okumaya dayanır;
canlı Vercel arka ucunun tamamının okunabildiği iddia edilmez.

## EVENTRA — `bevisionevent`

Kaynak: [bevisionevent deposu](https://github.com/aliihaydargenc-dotcom/bevisionevent)

- `package.json`: Next.js 16.4.3, React 19.3, TypeScript,
  PostgreSQL (`pg`), Better Auth, Motion, Zod ve Lucide.
- `src/lib/agenda.ts`: zaman aralıklarını hesaplayan ve üst üste gelen
  görevleri farklı sütunlara yerleştiren ajanda algoritması.
- `src/app/api/operations/route.ts`: grup/personel görevleri için
  hareket ve dönüş zamanını içeren çakışma kontrolü.
- `src/lib/push.ts`: Web Push bildirim altyapısı.
- README: masaüstü operasyon ajandası, mobil PWA, maliyet dağılımı,
  grup sorumlusu erişimi ve WhatsApp Business yapılandırması.

**Öneri:** PWA ve bildirimleri yeniden inşa etmeye gerek yok. İlk kalite
çalışması gerçek veriyle görev güncellemesi/iptali, izole tenant sınırları,
mobil hızlı onay, offline mesajı, teslim başarısızlığı/retry ve izin
durumlarının uçtan uca senaryoları olmalı. Kod incelemesinde
gözlenmeyen başarısızlıkları olmuş gibi raporlamıyoruz.

## HotelCompare — `hotelcompare-serpapi`

Kaynak: [hotelcompare-serpapi deposu](https://github.com/aliihaydargenc-dotcom/hotelcompare-serpapi)

Depoda ilk gözlemde yalnızca bir README vardı. README, üretim uygulamasının
tam kaynak kodunun bulunmadığını ve Vercel yüklemesinin Git deposuna
bağlı olmadığını açıkça söylüyor. Bu nedenle üretime otomatik deploy
veya mevcut API koduna doğrudan müdahale yapılamaz.

Eklenen `rate_watch/` fiyat alarm çekirdeği mevcut JSON veri
kaynağına bağlanabilir, ancak gerçek fiyat çekmez.

## Hotel Rate Collector — `hotel-rate-collector`

Kaynak: [hotel-rate-collector deposu](https://github.com/aliihaydargenc-dotcom/hotel-rate-collector)

- `collector.py`: Python + Playwright + SQLAlchemy ile oda
  tekliflerini doğrulanabilir şekilde okumaya yönelik adaptör çekirdeği.
- `targets.example.json`: ETS, Jolly ve Tatilbudur hedefleri
  varsayılan olarak **kapalı** ve otomasyon izni doğrulanmamış.
- `README.md`: `DISPLAYED_NOT_BOOKING_VERIFIED` ve
  `UNCONFIRMED` güven etiketlerini koruyor.
- SerpApi ile sınırlı test/probe kodu mevcut, fakat bir OTA'dan sürekli
  doğrulanmış canlı fiyat üretildiğine ilişkin kanıt yok.

**Entegrasyon:** `Offer` kayıtları aynı fiyat kurgusuna normalize
edilmeli, izinli kaynak ve mevcut bağlantı testinden sonra fiyat alarm
modülüne aktarılmalı. Kaynağın boş olması 'fiyat değişmedi' değildir.

## Geliştirme için karar

Şimdiki `kaynak` deposu uygulama verilerinin ve şifrelerin merkezi
deposu değil; resmî kaynakları, kanıtları, teknik şemaları ve yeniden
kullanılabilir araştırma bilgilerini tutan bir kütüphanedir.
Üretim fiyat geçmişi ayrı korumalı veritabanında tutulmalı.
