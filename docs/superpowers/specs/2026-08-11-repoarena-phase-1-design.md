# RepoArena Phase 1 Design

## Amaç

RepoArena; iki açık GitHub deposunu gerçek mühendislik sinyalleriyle karşılaştıran, her puanın gerekçesini görünür kılan koyu temalı bir developer SaaS uygulaması olacak. Phase 1, ziyaretçinin iki URL girip güvenilir bir karşılaştırma sonucuna ulaşmasını kapsar.

## Kapsam ve Sınırlar

- Dahil: Next.js uygulama iskeleti, iki URL'li landing formu, GitHub doğrulama/veri alma, açıklanabilir skorlar, karşılaştırma ekranı, hata ve analiz durumları.
- Hariç: OAuth, Supabase, kullanıcı geçmişi, favoriler, paylaşım, ileri grafikler, private repository desteği ve AI önerileri.

## Mimari

Arayüz, yalnızca `ComparisonResult` tipini tüketir ve GitHub REST yanıtına doğrudan erişmez. `POST /api/compare`, URL ayrıştırma, GitHub servisleri, normalizasyon ve skorlamayı sunucu tarafında birleştirir. Kategori puanları bağımsız hesaplanır, ağırlıklı genel puana dönüştürülür ve her kategori için metrik tabanlı açıklamalarla döner.

## Görsel Yön

Arayüz "oyun arenası" yerine teknik karar destek yüzeyi gibi davranır: derin kömür zemin, düşük kontrastlı bölücüler, güçlü tipografik hiyerarşi ve depo/metriklerde monospaced yazı kullanır. Ana vurgu, yalnızca eylem, skor ve kategori kazananında kullanılan sıcak turuncudur. Gereksiz yuvarlatılmış kartlardan kaçınılır; sayfa modüler paneller ve hizalanmış veri satırlarıyla düzenlenir.

Landing'in ana unsuru iki depo URL alanı ve aralarındaki VS işaretidir. Karşılaştırma sayfası, iki depoyu ortak eksende karşılaştıran bir üst özet ile başlar; ardından kategori savaşları, skor gerekçeleri ve kazanma özeti gelir. Dar ekranlarda kolonlar önce depo A, VS, depo B sırasına geçer ve ölçümler yatay kaydırma olmadan tek kolonda okunur.

## Bileşenler

- `ComparisonForm`: görünür etiketli iki URL alanı, örnek doldurma eylemi, doğrulama ve gönderim durumları.
- `AnalysisProgress`: analiz adımlarının durumunu gösteren erişilebilir ilerleme listesi.
- `RepositoryHeader`: avatar, tam depo adı, açıklama ve temel sayaçlar.
- `OverallScore`: iki genel puanı, farkı ve kazananı gösterir.
- `CategoryBattle`: iki kategori puanı, açıklayıcı çubuk ve kazanan farkını gösterir.
- `ScoreReasons`: olumlu/olumsuz gerekçeleri metin olarak sunar; yalnız renk kullanmaz.
- `ComparisonError`: hata türüne özel sebep ve kurtarma eylemi sunar.

## Veri Sözleşmesi

Form `repoA` ve `repoB` değerlerini `POST /api/compare` endpoint'ine gönderir. Başarılı yanıtta `ComparisonResult` gelir; form güvenli bir compare rotasına gider ve sayfa sonucu tipli olarak görüntüler. Endpoint hata durumunda kullanıcıya uygun sabit kod, eyleme dönük mesaj ve gerekirse rate-limit sıfırlanma zamanını döndürür.

## Erişilebilirlik ve Hareket

Her alanın görünür etiketi, hata mesajının ilişkili alanla bağlantısı, yeterli kontrast ve görünür focus halkası bulunur. Karşılaştırma durumu `aria-live` ile duyurulur. Animasyonlar yalnızca opacity/transform kullanır, 150–300 ms aralığında kalır ve `prefers-reduced-motion` altında sadeleşir.

## Doğrulama

Gerçek `facebook/react` ve `vuejs/core` ile uçtan uca karşılaştırma çalışır. Geçersiz URL, bulunamayan depo ve GitHub rate-limit hataları kullanıcıya anlaşılır biçimde görünür. Build ve TypeScript denetimi başarılıdır; skor testleri tüm puanların 0–100 aralığında kaldığını doğrular.
