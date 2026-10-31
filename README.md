# Kaynak — kanıta dayalı yazılım araştırma kütüphanesi

**Tarih:** 1 Kasım 2026 · **Durum:** İlk kullanılabilir sürüm.

Bu depo, etkinlik/operasyon yönetimi ve otel fiyat izleme sistemleri için incelenmiş
resmî dokümanları, REA ile yapılan **herkese açık** tarayıcı gözlemlerini, mevcut
GitHub projelerinin kod analizini, tasarım kurallarını ve uygulanabilir teknik
kararları tek yerde tutar. Bir üretim uygulaması ya da canlı fiyat kaynağı değildir.

## Çalıştır

Python 3.11+:

```powershell
python -m http.server 8765
```

Ardından http://localhost:8765/web/ adresine girin. Kaynak kartları
`data/sources.json` dosyasından beslenir. Kataloğu denetlemek için
`python scripts/validate_catalog.py` komutunu çalıştırın.

Tarayıcı kontrolleri için Playwright Python paketi ve Microsoft Edge
(veya Playwright Chromium) gerekir. `python scripts/browser_smoke.py`
komutu 360/768/1440 px üzerinde kartlar, filtreler, arama, bağlantılar,
konsol hataları ve yatay taşmayı test eder. Ekran görüntüleri
varsayılan olarak Git dışında `work/browser/` altına yazılır.

Resmî kaynak bağlantılarının o andaki HTTP erişilebilirlik durumunu ayrı
raporlamak için `python scripts/check_source_health.py --output source-health.json`
komutunu kullanın. Bu kontrol API yetkisini, güncel fiyatı veya üretim
sorgularının başarısını doğrulamaz. Rapor zaman damgalıdır; eski raporu
canlı sağlık durumu gibi yorumlamayın. Özel GitHub depoları anonim HTTP
isteklerine 404 dönebilir; bu yanıt tek başına deponun silindiğini kanıtlamaz.

## İçerik

| Yol | İçerik |
| --- | --- |
| [research/event-systems.md](research/event-systems.md) | Eventbrite, pretix, Whova, Cvent; akış/teknoloji bulguları |
| [research/hotel-pricing.md](research/hotel-pricing.md) | Çok acenteli veri toplama, SerpApi sınırlamaları, fiyat kıyası |
| [research/workspace-audit.md](research/workspace-audit.md) | EVENTRA, HotelCompare ve rate-collector repo denetimi |
| [research/implementation-roadmap.md](research/implementation-roadmap.md) | Önceliklendirilmiş geliştirme ve doğrulama adımları |
| [design-system/MASTER.md](design-system/MASTER.md) | UI/UX Pro Max ile türetilmiş arayüz kuralları |
| [data/sources.json](data/sources.json) | Kaynakların doğrulanabilir, makine-okunur kataloğu |
| [data/rea-evidence.json](data/rea-evidence.json) | REA kayıtlarının kimlik, SHA-256 ve olay sayısı içeren özeti; ham kayıtlar depo dışında |
| [web/](web/) | Mobil ve masaüstü kaynak araştırma paneli |

## Yerelde kurulan araçlar

- **REA:** `rea-agents`; Codex MCP kaydı yenilendi. Tarayıcı analizi için
  `node >=22.23.4` veya `>=24.22.1` gerekli.
- **Deep Research:** `dzhng/deep-research` kodu ve bağımlılıkları ayrı
  `work/deep-research` klasöründe. Çalışması için Firecrawl ile LLM
  erişimi gerekir; API anahtarı olmadan araştırma motoru çalıştırılmadı.
- **UI/UX Pro Max:** `ui-ux-pro-max-cli` kuruldu; Codex ve genel agent
  becerisi olarak etkinleştirildi. Bu panelde tasarım çıktıları uygulandı.

Üçüncü taraf araç kaynaklarını bu depoya kopyalamıyoruz; resmî sürümler yerel
ortamda kuruluyor, araştırma sonuçları ve kendi dosyalarımız Git'e giriyor.

## Kanıt disiplini

Her sonuç **resmî dokümana**, **kendi depomuzdaki kaynak koda** veya
**REA gözleminin kanıt kimliğine** dayanmalıdır. Bir siteye yapılan
herkese açık ziyaret onun kapalı yönetim panelini veya sunucu altyapısını
açığa çıkarmaz. Gözlenmeyen teknolojiler tahmin olarak etiketlenmelidir.
Fiyat kaynağı erişilemiyorsa başarılı sorgu veya güncel teklif uydurulmaz.
