# Gökcan — RepoArena Phase 1 Görevleri

Bu dosya, RepoArena'nın veri ve puanlama hattı için bağımsız çalışma sözleşmesidir. Arayüz bileşenleri benim hattımdadır; bu nedenle GitHub API verisini UI biçimine bağlayan React bileşenleri yazma.

## Hedef

İki açık GitHub deposunu güvenli biçimde doğrulayan, gerçek verilerini sunucu tarafında toplayan ve her depoya açıklanabilir 0–100 puan veren `POST /api/compare` endpoint'ini teslim etmek.

## Teslim Sırası

### 1. Ortak tip sözleşmesini oluştur

Dosya: `src/types/comparison.ts`

- `RepositoryRef`: `owner`, `name`, `fullName`, `url`
- `RepositorySummary`: depo adı, açıklama, avatar, yıldız, fork, açık issue, varsayılan branch, arşiv durumu ve güncellenme tarihi
- `RepositoryMetrics`: Phase 1'de puanlamaya giren ham metrikler
- `RepositoryScores`: `activity`, `maintenance`, `community`, `codebase`, `documentation`, `popularity`, `health`, `overall`; her alan `number`
- `ScoreReason`: `kind: 'positive' | 'negative'`, `label`, `value?`
- `ComparisonResult`: iki depo, skorları, kategori gerekçeleri, genel kazanan ve oluşturulma zamanı
- `CompareErrorCode`: `INVALID_REPOSITORY_URL`, `REPOSITORY_NOT_FOUND`, `PRIVATE_REPOSITORY`, `GITHUB_RATE_LIMITED`, `GITHUB_DATA_UNAVAILABLE`

Bu sözleşmeyi bitirdikten sonra bana bildir. UI yalnızca bu modelleri tüketecek.

### 2. Depo adresini ayrıştır ve doğrula

Dosya: `src/lib/github/parser.ts`

- Kabul et: `https://github.com/owner/repository`, sonundaki `/`, `.git` eki ve kısa biçim `owner/repository`.
- Reddet: farklı hostlar, eksik owner/repository, boş değer, ekstra yol bölümleri, sorgu parametresi veya hash içeren adresler.
- Hata fırlatıldığında, kullanıcıya gösterilebilen `INVALID_REPOSITORY_URL` kodunu ve hatalı girdiyi açıkça taşısın.
- Birim testleri: geçerli tam/kısa URL, `.git`, yanlış host, boş giriş, tek segment ve fazla yol segmenti.

### 3. Sunucu tarafı GitHub istemcisini yaz

Dosyalar: `src/lib/github/client.ts`, `src/lib/github/repositories.ts`

- GitHub REST API'ye yalnızca sunucudan eriş.
- Token varsa `GITHUB_TOKEN` ortam değişkeninden oku; istemciye asla geçirilmeyecek.
- Repository metadata ve community profile çağrılarını tek servis altında topla.
- 404 yanıtını `REPOSITORY_NOT_FOUND`, 401/403 private erişim sorununu `PRIVATE_REPOSITORY`, rate-limit başlıklarıyla gelen 403/429 yanıtını `GITHUB_RATE_LIMITED` olarak eşle.
- Rate-limit için `X-RateLimit-Reset` değerini dönüştürerek hata ayrıntısına ekle.
- Eksik metriklerde uydurma veri üretme; tanımlı `null` değer kullan ve puanlama katmanına geçir.

### 4. Phase 1 normalizasyonu ve puanlama motorunu yaz

Dosyalar: `src/lib/scoring/config.ts`, `src/lib/scoring/calculate-repository-score.ts`, `src/lib/scoring/index.ts`

- Ağırlıkları tek `config.ts` dosyasında tanımla: activity %20, maintenance %20, community %15, codebase %15, documentation %15, popularity %5, health %10.
- Her kategori 0–100 arasında bağımsız bir skor üretmeli; yıldız sayısı tek başına kazananı belirlememeli.
- Tüm giriş değerlerini sınırla ve her kategorinin, eksik veya olağandışı GitHub verisinde bile geçerli sonlu sayı döndürmesini sağla.
- Her kategori için iki veya daha fazla gerçek metriğe dayalı `ScoreReason` üret.
- `overall`, ağırlıklı skorların yuvarlanmış toplamı olsun; aralık dışına çıkmasın.
- Birim testleri: alt/üst sınır, eksik değerler, arşivlenmiş depo cezası, yıldızların tek başına sonucu belirlememesi, genel puanın ağırlıklarla tutarlılığı.

### 5. Karşılaştırma endpoint'ini oluştur

Dosya: `src/app/api/compare/route.ts`

- Gövde: `{ "repoA": string, "repoB": string }`.
- Zod ile gövdeyi doğrula; ayrıştırıcıdan sonra iki depoyu paralel çağır.
- Her depoyu normalize et, ayrı ayrı puanla ve `ComparisonResult` döndür.
- Kazananı genel puandan belirle; eşitlikte `winner: null` dön.
- Hataları tipli hata kodları ve kullanıcı eylemine dönük mesajla döndür; ham GitHub hata gövdesini istemciye sızdırma.
- Testler: başarılı `facebook/react`–`vuejs/core` akışı için servisleri taklit ederek sözleşme testi, geçersiz giriş, bulunamayan depo ve rate limit.

## Kabul Kriterleri

- UI için tek stabil veri giriş noktası `POST /api/compare` olur.
- GitHub token'ı tarayıcı paketine veya API yanıtlarına girmez.
- Her `RepositoryScores` alanı sonlu ve 0–100 arasıdır.
- Hata yanıtı, kullanıcıya ne olduğunu ve ne yapabileceğini söyler.
- `npm run lint`, ilgili test komutları ve `npm run build` başarılıdır.

## Benimle Entegrasyon Protokolü

1. Önce `src/types/comparison.ts` sözleşmesini tamamla ve paylaş.
2. Endpoint'in örnek başarılı/hatalı JSON yanıtlarını bu dosyaya veya PR açıklamasına ekle.
3. UI'nın ihtiyacı olan yeni alan için tipi önce değiştir; endpoint ve testleri aynı değişiklikte güncelle.
4. `src/components/**`, landing sayfası ya da karşılaştırma sayfasında değişiklik yapma.
