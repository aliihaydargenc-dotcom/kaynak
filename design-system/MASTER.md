# Kaynak Research Hub · Arayüz sistemi

**Kaynak:** Yerel UI/UX Pro Max `search.py --design-system`,
2026-11-01. Çıktı `Event Management` için canlı mor
`#7C3AED` ve açık `#FAF5FF` zemin önerdi. Kaynak paneli
bilgi yoğun olduğu için kullanımı daha sakin editoryal tipografiye
uyarladık; tasarım kararları ürünün çalışma amacına göredir.

| Token | Değer |
| --- | --- |
| brand | `#6D28D9` |
| brand-darker | `#4C1D95` |
| foreground | `#1C1641` |
| secondary | `#584F73` |
| background | `#F8F7FC` |
| surface | `#FFFFFF` |
| border | `#E9E4F5` |
| radius | 16 / 24 px |
| spacing | 4/8 px ölçeği |
| focus ring | 3 px net görünür halka |

İçerik önceliği: başlık → sonuç/kapsam → kaynak arama → kanıt
etiketi → resmî doküman bağlantısı. Kart üzerinde uydurma puan,
canlı sorgu, derecelendirme ve teknoloji verisi gösterme.

**Erişilebilirlik:** 44×44 px dokunma alanı, belirgin odak,
görünür form etiketleri, arama sonuçları için `aria-live`, her
bağlantıda açıklayıcı metin, hiçbir görevin yalnızca hover ile
yapılmaması, `prefers-reduced-motion` için animasyon kapatılması.

**Responsive:** 360–767 px tek sütun ve yatay kaydırmasız içerik;
768 px iki kart; 1100 px üç kart. Mobilde filtreler satır kırar,
bilgi kanıtları saklanmaz. Bu repo araştırma kütüphanesidir:
gösterişli hero animasyonu veya gerçek veri algısı yaratacak
örnek fiyat gösterimi kullanılmaz.
