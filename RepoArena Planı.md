# RepoArena — Phase 1 İş Bölümü

Bu plan, `Project_ RepoArena.md` belgesindeki Phase 1 hedefini iki bağımsız teslim hattına ayırır. Amaç; gerçek GitHub verisini, açıklanabilir puanlamayı ve premium arayüzü birlikte, düşük merge çakışmasıyla teslim etmektir.

## Ürün Sınırı

Phase 1 tamamlandığında ziyaretçi iki açık GitHub deposu girer, gerçek verilerle karşılaştırma başlatır ve her deponun 0–100 arası açıklanabilir RepoArena puanını görür. OAuth, Supabase, geçmiş, favoriler ve gelişmiş grafikler sonraki fazlara kalır.

## Sahiplik Matrisi

| Sorumluluk | Sahibi | Teslim |
| --- | --- | --- |
| Next.js/Tailwind temel kurulumu ve tasarım sistemi | Ben | Uygulama iskeleti ve görsel tokenlar |
| Landing sayfası, URL formu ve analiz yükleme deneyimi | Ben | `/` |
| Karşılaştırma ekranı, skor ve kategori battle bileşenleri | Ben | `/compare/[...slug]` |
| Responsive ve erişilebilir kullanıcı arayüzü | Ben | Klavye, focus ve mobil davranış |
| GitHub URL ayrıştırma ve doğrulama | Gökcan | `src/lib/github/parser.ts` |
| GitHub REST istemcisi ve hata/rate-limit eşlemesi | Gökcan | `src/lib/github/*` |
| Phase 1 normalizasyonu ve puanlama motoru | Gökcan | `src/lib/scoring/*` |
| Gerçek veri karşılaştırma endpoint'i ve testleri | Gökcan | `POST /api/compare` |
| API sözleşmesi ve ortak tipler | Ortak; Gökcan başlatır | `src/types/comparison.ts` |

## Uygulama Sırası

1. **Ortak sözleşme:** Gökcan `ComparisonResult` ve ilişkili modelleri tanımlar. Ben bu tipleri yalnızca tüketirim; GitHub istemci koduna dokunmam.
2. **Paralel geliştirme:** Ben `/` ile `/compare/[...slug]` arayüzünü sözleşmeye uygun örnek veriyle kurarım. Gökcan ayrıştırıcı, istemci, normalizasyon, puanlama ve endpoint'i kurar.
3. **Entegrasyon:** Form, `POST /api/compare` endpoint'ine istek atar. Başarılı yanıtta karşılaştırma rotasına yönlenir; bekleme ve hata durumları kullanıcıya görünür kalır.
4. **Doğrulama:** `facebook/react` ve `vuejs/core` gerçek verisiyle karşılaştırma, puan sınırları, geçersiz URL, bulunamayan depo ve rate-limit hatası test edilir.

## Dosya Sınırları

### Benim hattım

- `src/app/**` içindeki sayfalar, layout ve stil altyapısı
- `src/components/landing/**`
- `src/components/comparison/**`
- `src/components/ui/**`
- Arayüzde kullanılan görsel varlıklar ve erişilebilirlik davranışları

### Gökcan'ın hattı

- `src/lib/github/**`
- `src/lib/scoring/**`
- `src/app/api/compare/route.ts`
- `src/types/comparison.ts`
- GitHub/puanlama testleri

### Ortak dosyalarda çalışma kuralı

- `package.json`, `src/app/layout.tsx`, `src/app/globals.css` değişiklikleri önceden haber verilerek yapılır.
- Tip değişikliği önce `src/types/comparison.ts` içinde tamamlanır; endpoint ve UI aynı isimleri kullanır.
- UI, GitHub API yanıtını doğrudan tüketmez; yalnızca `ComparisonResult` kullanır.
- Gökcan gizli anahtarları yalnızca sunucu tarafında, ortam değişkenlerinden okur.

## Tasarım Kararı

RepoArena, oyunlaştırılmış bir "versus" sitesi değil; teknik karar vermeyi kolaylaştıran koyu temalı bir analiz aracı olacak. Kömür siyahı yüzey, ince gri sınırlar, teknik verilerde monospace yazı ve yalnızca skor/kazanan durumunda ölçülü sıcak turuncu vurgu kullanılacak. Landing sayfasının ana odağı iki depo girişi; karşılaştırma sayfasının ana yapısı ise iki depoyu aynı hizadaki metriklerle kıyaslayan dikey VS ekseni olacak.

## Tamamlanma Ölçütleri

- `npm run build` başarıyla tamamlanır.
- TypeScript hatası kalmaz.
- Form iki gerçek açık depoyu karşılaştırabilir.
- Her puan 0–100 aralığındadır ve gerekçeleri görünürdür.
- Geçersiz URL, bulunamayan depo ve GitHub rate-limit yanıtı açıklayıcı şekilde gösterilir.

## Phase 2'ye Bırakılanlar

Aktivite grafikleri, kapsamlı teknoloji algılama, GitHub OAuth, Supabase, kayıtlı karşılaştırmalar, dashboard, favoriler, paylaşım, SEO ve gelişmiş önbellekleme Phase 2+ kapsamındadır.
