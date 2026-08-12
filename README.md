# RepoArena

<p align="center">
  <strong>GitHub depolarını yıldız sayısının ötesindeki gerçek mühendislik sinyalleriyle karşılaştırın.</strong>
</p>

<p align="center">
  <a href="#hızlı-başlangıç">Başlangıç</a> ·
  <a href="#nasıl-çalışır">Nasıl çalışır?</a> ·
  <a href="#rapor-kapsamı">Rapor kapsamı</a> ·
  <a href="#mimari">Mimari</a> ·
  <a href="#ekip-ve-görev-dağılımı">Ekip</a>
</p>

<p align="center">
  <img alt="Next.js" src="https://img.shields.io/badge/Next.js-16-111111?logo=next.js&logoColor=white" />
  <img alt="React" src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white" />
  <img alt="GitHub API" src="https://img.shields.io/badge/GitHub-REST_API-181717?logo=github&logoColor=white" />
</p>

![RepoArena koyu tema ana sayfa — iki açık GitHub deposunu karşılaştırmak için giriş alanları ve mühendislik odaklı hero bölümü](./public/readme/landing-page-dark.jpg)

## Ürün fikri

RepoArena, iki açık GitHub deposunu yan yana okuyup teknik karar vermeyi kolaylaştıran bir karşılaştırma aracı. Yıldız, fork veya tek bir son-commit tarihi yerine; aktivite, bakım, topluluk, dokümantasyon, kod tabanı sağlığı ve proje standartlarını birlikte değerlendirir.

Sonuç, tek bir puanla sınırlı değildir: kazananı etkileyen kategorileri, ham kanıtları, veri kapsamasını ve karar bağlamına göre öne çıkan sinyalleri görünür kılar.

> Sadece açık GitHub depoları analiz edilir. Varsayılan akış issue/PR metni, commit içeriği veya kişisel verileri saklamaz; yalnızca sayısal ve tarihsel agregaları kullanır.

## Arayüz

RepoArena, koyu temayı önceleyen; açık temayı da destekleyen, geliştirici araçlarına yakın ama sade bir bilgi hiyerarşisine sahiptir. Büyük serif başlıklar, teknik ayrıntılarda monospace yazı ve sınırlı sıcak turuncu vurgu; karar sinyallerini öne çıkarır.

| Koyu tema | Açık tema |
| --- | --- |
| ![RepoArena koyu tema görünümü](./public/readme/landing-page-dark.jpg) | ![RepoArena açık tema görünümü](./public/readme/landing-page.jpg) |

Görseller, bu depodaki üretim derlemesinden alınmış gerçek ekran görüntüleridir.

## Nasıl çalışır?

1. İki açık depo adresi girilir. Tam GitHub URL'si ya da `owner/repository` kısa biçimi kabul edilir.
2. Sunucu, GitHub REST API üzerinden depo metadatasını ve rapor sinyallerini toplar.
3. RepoArena her depo için yedi kategoride açıklanabilir puan üretir.
4. Aynı veriler; kanıt kapsamı, aktivite, yayın ritmi, issue/PR akışı, CI, teknoloji dağılımı ve proje sağlığı panellerinde karşılaştırılır.
5. Kullanıcı, değerlendirme bağlamını seçebilir: genel analiz, kütüphane seçimi, katkı yapma veya referans proje incelemesi.

Örnek canlı rota:

```text
/compare/facebook/react/vs/vuejs/core
```

## Rapor kapsamı

### Puanlama kategorileri

| Kategori | Ağırlık | İncelenen örnek sinyaller |
| --- | ---: | --- |
| Aktivite | %20 | Güncellik, geliştirme hareketi |
| Bakım | %20 | Arşiv durumu, issue/PR bakımı |
| Topluluk | %15 | Katkı rehberleri, katılım sinyalleri |
| Kod tabanı sağlığı | %15 | Dil, konu, proje yapısı |
| Dokümantasyon | %15 | README, lisans, katkı yönergeleri |
| Popülerlik | %5 | Yıldız, fork ve erişim sinyalleri |
| Proje sağlığı | %10 | Otomasyon, standartlar ve güvence dosyaları |

### Kaynaklı kanıt panelleri

- Community Health: GitHub sağlık yüzdesi ile issue ve pull request şablonları.
- Aktivite: son 7/30/90 gün commit hacmi, yıllık aktif hafta ve trend.
- Yayın ritmi: son kararlı sürüm, son 12 ay yayın sayısı ve ortalama aralık.
- İş akışı: issue kapanışları, merge edilen PR'lar ve medyan süreler.
- GitHub Actions: son tamamlanan iş akışlarının başarı oranı. Haricî CI araçları için nötr kalır.
- Teknoloji görünümü: GitHub'ın byte temelli dil dağılımı.
- Katkı yoğunluğu: aktif katkıcı sayısı ve tek katkıcıya yoğunlaşma oranı.
- Proje sağlık listesi: güvenlik politikası, changelog, test, CI, lockfile, Docker ve lint yapılandırması.

Her ikincil sinyal `available`, `unknown`, `not_configured` veya `not_applicable` olarak modellenir. Veri yokluğu puanı sıfıra çekmez ve arayüzde ceza gibi sunulmaz.

> **Puan ve kanıt ayrımı:** CI başarı oranı, yayın ritmi, katkıcı yoğunluğu ve benzeri ayrıntılar şu an kaynaklı rapor kanıtı olarak gösterilir; yedi ana kategori puanını doğrudan değiştirmez. Bir sinyalin puana katılması için ağırlığı, eşiği ve eksik veri davranışı ayrıca tanımlanıp test edilmelidir.

## Hızlı başlangıç

### Gereksinimler

- Node.js `>=22`
- npm
- GitHub API limitini yükseltmek için isteğe bağlı kişisel erişim token'ı

### Kurulum

```bash
git clone https://github.com/LaunchTogether/RepoArena.git
cd RepoArena
npm install
cp .env.example .env.local
npm run dev
```

Ardından [http://127.0.0.1:3000](http://127.0.0.1:3000) adresini açın.

### Ortam değişkenleri

```bash
# Sunucu tarafında kullanılır; tarayıcıya gönderilmez.
GITHUB_TOKEN=

# Yerel geliştirme ve mutlak bağlantılar için.
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Henüz etkin olmayan hesap geçmişi / OAuth sınırı için ayrılmış alanlar.
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

GitHub token'ı zorunlu değildir; ancak anonim GitHub API sınırına daha hızlı ulaşılabilir. Token yalnızca sunucu tarafında okunur; commit edilmez ve istemciye sızdırılmaz.

`NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` alanları, ileride gerçek OAuth ve kayıtlı karşılaştırma geçmişi bağlandığında kullanılır. Bu entegrasyon yapılandırılana kadar hesap geçmişi görünmez; sahte bir geçmiş üretilmez.

## Dağıtım

Depoda Netlify için [`netlify.toml`](./netlify.toml) bulunur; build komutu `npm run build`, yayın çıktısı `.next` olarak tanımlıdır. Netlify projesinde aşağıdaki ortam değişkenlerini tanımlayın:

```text
GITHUB_TOKEN=isteğe_bağlı_sunucu_tarafı_token
NEXT_PUBLIC_APP_URL=https://alan-adiniz.example
```

`GITHUB_TOKEN` zorunlu değildir, ancak canlı trafik için GitHub API limitini anlamlı biçimde yükseltir. Token'ı yalnızca Netlify ortam değişkeni olarak ekleyin; istemci koduna, README örneklerine veya Git geçmişine yazmayın.

## Komutlar ve kalite kontrolleri

```bash
npm run dev        # Yerel geliştirme sunucusu
npm run test       # Vitest test paketi
npm run lint       # ESLint
npx tsc --noEmit   # Strict TypeScript kontrolü
npm run build      # Production Next.js derlemesi
npm run start      # Production sunucusunu başlatır
```

## Mimari

```text
src/
├── app/
│   ├── api/compare/route.ts       # Zod doğrulamalı karşılaştırma endpoint'i
│   ├── compare/[...slug]/         # Paylaşılabilir karşılaştırma rotası
│   └── page.tsx                   # Landing page
├── components/
│   ├── landing/                   # Form, tema ve ürün anlatımı
│   ├── comparison/                # Yükleme, hata, skor ve kategori görünümü
│   └── report/                    # Kaynaklı kanıt panelleri
├── lib/
│   ├── github/                    # URL ayrıştırma, REST istemcisi ve TTL cache
│   ├── scoring/                   # Puan ağırlıkları, kategoriler ve gerekçeler
│   └── report/                    # İçgörü ve paylaşılabilir rota üretimi
└── types/comparison.ts            # UI ile API arasındaki ortak sözleşme
```

### Veri ve hata politikası

- İlk depo metadatası zorunludur; depo bulunamadığında, özel olduğunda veya rate limit dolduğunda kullanıcıya eyleme dönük tipli hata döner.
- İkincil GitHub sorguları paralel yürür; başarılı sonuçlar süreç belleğinde 15 dakika önbelleğe alınır. Sunucu yeniden başladığında bu kısa süreli önbellek sıfırlanır.
- GitHub'ın henüz hazırlamadığı istatistikler `unknown` olarak gösterilir.
- Paylaşım bağlantısı yalnızca iki depo ve seçilen karar amacını taşır; rapor gövdesi veya kimlik bilgisi URL'ye yazılmaz.

## Ekip ve görev dağılımı

RepoArena iki bağımsız çalışma hattıyla geliştirildi. Ortak tip sözleşmesi üzerinden ilerlemek, arayüz ve veri hattı arasındaki merge çakışmalarını azalttı.

| Alan | Sorumlu | Teslimler |
| --- | --- | --- |
| Ürün deneyimi ve tasarım sistemi | **Kutluhan** | Next.js/Tailwind temel kurulumu, koyu/açık tema, görsel tokenlar ve responsive yapı |
| Landing ve kullanıcı akışı | **Kutluhan** | URL formu, örnek karşılaştırma, yükleme ve hata deneyimleri |
| Karşılaştırma ve rapor arayüzü | **Kutluhan** | Skor kartları, kategori battle görünümü, kanıt panelleri, paylaşım ve erişilebilirlik |
| GitHub veri hattı | **Gökcan** | URL ayrıştırma, sunucu tarafı REST istemcisi, rate-limit ve hata eşlemesi |
| Puanlama ve karşılaştırma API'si | **Gökcan** | Normalizasyon, açıklanabilir kategori puanları, `POST /api/compare`, ortak tip sözleşmesinin backend başlangıcı ve testler |
| Entegrasyon | **Kutluhan + Gökcan** | `ComparisonResult` değişikliklerinin ortak kararı, API sözleşmesi, canlı GitHub doğrulaması, UI–backend uyumu ve release kontrolleri |

### İşbirliği ilkeleri

- UI, GitHub yanıtını doğrudan tüketmez; yalnızca `ComparisonResult` sözleşmesini kullanır.
- Tip değişiklikleri önce `src/types/comparison.ts` üzerinde netleşir.
- Gizli anahtarlar sadece sunucuda ortam değişkeni olarak tutulur.
- Yeni kanıt sinyalleri, tanımlı puan ağırlığı ve eksik veri davranışı olmadan skoru yapay olarak değiştirmez.

## Yol haritası

- Gerçek Supabase + GitHub OAuth ile kayıtlı karşılaştırmalar ve favoriler.
- Sahip onaylı güvenlik, Dependabot ve trafik görünümü.
- Dal koruması ve ek proje standartlarının kaynaklı rapora eklenmesi.
- Netlify/Vercel üretim dağıtımı ve ortam değişkeni yönetimi.

## Katkı

Issue veya pull request açmadan önce kalite kontrollerini çalıştırın:

```bash
npm run lint
npm run test
npx tsc --noEmit
npm run build
```

Kod ve teknik yorumlar İngilizce; ürün dokümantasyonu ve iş akışı notları Türkçe tutulur.

---

<p align="center">RepoArena · Engineering signals, made comparable.</p>
