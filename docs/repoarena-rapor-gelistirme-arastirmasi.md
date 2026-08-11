# RepoArena Raporunu Geliştirme Araştırması

Tarih: 12 Ağustos 2026
Kapsam: yalnızca açık GitHub depoları ve GitHub'ın resmî REST/GraphQL dokümantasyonu.

## Mevcut Raporun Boşlukları

Mevcut veri sözleşmesi; yıldız, fork, açık issue, birincil dil, konu etiketleri, lisans, README, CONTRIBUTING ve CODE_OF_CONDUCT gibi temel sinyalleri içeriyor. Community Profile isteği halihazırda yapılıyor; ancak GitHub'ın kendi `health_percentage` alanı ile `ISSUE_TEMPLATE` ve `PULL_REQUEST_TEMPLATE` tespitleri sonuca taşınmıyor. Aktivite de yalnızca son push/güncelleme tarihinin varlığıyla temsil ediliyor.

Bu nedenle sonraki sürümde puanı yapay biçimde büyütmek yerine, her sinyali ayrı bir "kanıt" alanında göstermek; veri yoksa bunu `bilinmiyor` olarak sunmak ve karar bağlamını (açık kaynak katkısı, ürün olgunluğu, ekip sürdürülebilirliği) ayırmak daha güvenilir olur.

## Önerilen Ekler

| Öncelik | Metrik | Neden karar için değerli? | GitHub verisi ve API | Sınır, gizlilik, uygulama eforu |
| --- | --- | --- | --- | --- |
| P0 | **Community Health ayrıntısı**: GitHub `health_percentage`, issue ve PR şablonu varlığı | Katkı sürecinin ne kadar yönlendirilmiş olduğunu doğrudan gösterir. GitHub, bu yüzdeyi önerilen topluluk dosyalarının bulunma oranı olarak tanımlar. | [`GET /repos/{owner}/{repo}/community/profile`](https://docs.github.com/en/rest/metrics/community). Aynı yanıt README, lisans, code of conduct, CONTRIBUTING, issue ve PR şablonlarını içerir. | Public depolarda anonime açıktır; private için `Contents: read` gerekir. GitHub yüzdesi aynen gösterilmeli, ek öznel sağlık puanı üretilmemeli. **S** |
| P0 | **GitHub Actions güvenilirliği**: son 20 tamamlanmış run başarı oranı, son başarısız çalışma ve son çalıştırma zamanı | Ana dalın otomatik doğrulanıp doğrulanmadığı ve güncel CI sinyalini gösterir. | [`GET /repos/{owner}/{repo}/actions/runs?status=completed&per_page=20`](https://docs.github.com/en/rest/actions/workflow-runs); gerekirse iş akışı listesi için [`/actions/workflows`](https://docs.github.com/en/rest/actions/workflows). | Yalnızca GitHub Actions'ı ölçer; haricî CI kullanan bir depoya "CI yok" denmemeli, "GitHub Actions verisi yok" denmeli. Public depolar anonime açıktır. Run/commit mesajlarını saklamadan yalnız agregayı göster. **M** |
| P0 | **Sürümleme ve dağıtım olgunluğu**: son stable release, son 12 ay release sayısı, yayın aralığı, prerelease oranı | Paket/kütüphane seçerken bakım ve sürümleme disiplinine dair somut sinyal verir. | [`GET /repos/{owner}/{repo}/releases?per_page=100`](https://docs.github.com/en/rest/releases/releases), `published_at`, `prerelease`, `draft` ve asset alanları. | API normal Git tag'lerini değil, release oluşturulmuş tag'leri döndürür. Draft sürümler ziyaretçiye görünmediği için skora katılmamalı. Public depolar anonime açıktır. **S/M** |
| P1 | **İş/issue sağlığı**: son 90 gün açılan gerçek issue'larda açık backlog, etiketli/atanmış oranı ve medyan kapanış süresi | Destek ve bakım taleplerinin yönetilip yönetilmediğini gösterir. | [`GET /repos/{owner}/{repo}/issues?state=all&since=...&per_page=100`](https://docs.github.com/en/rest/issues/issues). Yanıttaki `pull_request` alanı olan kayıtlar filtrelenmeli. | GitHub REST API'si pull request'leri de issue olarak kabul eder. Depo issue kullanmıyorsa puan düşürmek yerine "yeterli issue verisi yok" gösterilmeli. Yüksek hacimde sayfalama sınırı nedeniyle pencere açıkça yazılmalı. **M** |
| P1 | **Commit ivmesi**: son 52 hafta aktif hafta oranı, son 4 hafta / önceki 4 hafta trendi | Tek bir son-push tarihinden daha anlamlı şekilde süreklilik ve güncel geliştirme temposunu gösterir. | [`GET /repos/{owner}/{repo}/stats/commit_activity`](https://docs.github.com/en/rest/metrics/statistics) veya sınırlı pencere için [`GET /repos/{owner}/{repo}/commits?since=...`](https://docs.github.com/en/rest/commits/commits). | İstatistik üretimi geçici `202` dönebilir; kullanıcıyı bekletmek yerine "GitHub istatistiği hazırlanıyor" durumu sunulmalı. Commit sayısı kalite ölçüsü değildir. **M** |
| P1 | **PR akışı**: son 90 günde merge edilen PR sayısı ve medyan merge süresi | İnceleme/entegrasyon sürecinin akışını ve dış katkıların ne kadar hızlı kabul edildiğini gösterir. | REST [`List pull requests`](https://docs.github.com/en/rest/pulls/pulls) veya tek GraphQL sorgusunda repository `pullRequests` bağlantısından `createdAt`, `mergedAt`, `state`. GitHub şeması [GraphQL Reference](https://docs.github.com/en/graphql/reference) içinde tanımlıdır. | Şablon/tek geliştiricili projelerde PR süreci kullanılmayabilir; değer `uygulanamaz` olabilmeli. Başlıklar, kişiler veya içerik saklanmamalı; sadece zaman farkı agregası tutulmalı. **M/L** |
| P2 | **Dil dağılımı ve teknoloji odağı**: ilk dil ve ilk üç dilin byte payı | "Birincil dil" bilgisini, monorepo ya da çoklu teknoloji yapısını gizlemeden açıklar. | [`GET /repos/{owner}/{repo}/languages`](https://docs.github.com/en/rest/repos/repos#list-repository-languages); GitHub her dil için kod byte sayısını verir. | Byte büyüklüğü test, üretilmiş veya vendor dosyalarını yansıtabilir; bu bir kalite/performance puanı olmamalı. Public depolar anonime açıktır. **S** |
| P2 | **Bakımcı yoğunlaşması**: son 52 haftada ilk 1/3 katkıcının commit payı, aktif katkıcı sayısı | Tek kişiye bağımlılık ve ekibin sürdürülebilirliği konusunda temkinli bir sinyal üretir. | [`GET /repos/{owner}/{repo}/stats/contributors`](https://docs.github.com/en/rest/metrics/statistics). | GitHub istatistiği `202` dönebilir ve çok büyük geçmişlerde sınırlıdır. Buna "bus factor" denmemeli; sadece katkı yoğunlaşması denmeli. İsimleri göstermek ya da saklamak yerine yalnız agregalar kullanılmalı. **M** |
| P2 | **Ana dal koruması**: varsayılan dalın protected durumu; izin varsa required checks/review korumaları | Üretim dalına doğrudan değişiklik riskini ve kalite kapısını gösterir. | [`GET /repos/{owner}/{repo}/branches`](https://docs.github.com/en/rest/branches/branches) yanıtındaki `protected`; daha ayrıntı için [branch protection uçları](https://docs.github.com/en/rest/branches/branch-protection). | Daha ayrıntılı kural bilgisi erişim/plan koşullarına bağlı olabilir. Koruma yokluğu tek başına kötü kalite değildir; görünür bir güvence sinyali olarak sunulmalı. **M** |

## Ayrı, Sahip Onaylı Mod Olarak Değerlendirilecekler

| Metrik | Değer | Neden varsayılan rapora eklenmemeli? | API ve efor |
| --- | --- | --- | --- |
| SBOM/dependency yüzeyi | Paket ekosistemleri, lisanslar ve bağımlılık envanteri sayesinde tedarik zinciri resmi verir. | SBOM ayrıntılı bağımlılık bilgisidir; sunucuda token gerektirebilir. Tam belge saklanmamalı, yalnız gerekli agregalar kısa süreli cache'lenmeli. | [`Generate an SBOM`](https://docs.github.com/en/rest/dependency-graph/sboms), **L** |
| Dependabot / secret scanning uyarıları | Açık kritik/yüksek bağımlılık uyarıları ve güvenlik görünürlüğü sunar. | Güvenlik bağlamı ve erişim izinleri hassastır; yalnızca depo sahibinin bağladığı token ile açık onay sonrası, ayrı bir owner-only görünümünde sunulmalı. | [Dependabot alerts](https://docs.github.com/en/rest/dependabot/alerts), [secret scanning alerts](https://docs.github.com/en/rest/secret-scanning/secret-scanning), **M/L** |
| Trafik verisi | Son 14 gün views, clones, popüler referrer/path ürün ilgisini gösterir. | Kamuya açık karşılaştırma puanına girmemeli; ticari açıdan hassas ve push erişimi gerektirir. | [Repository traffic](https://docs.github.com/en/repositories/viewing-activity-and-data-for-your-repository/viewing-traffic-to-a-repository), **M** |

## Uygulama İlkeleri

1. **Skor ile kanıtı ayırın.** CI, release ve issue metrikleri önce raporda kaynaklı kanıt olarak yer almalı. Skora alınacaklarsa ağırlık ve eşik kullanıcıya görünür olmalı.
2. **Veri yoksa sıfır puan vermeyin.** `not configured`, `not applicable`, `permission unavailable` ve `rate limited` sonuçları birbirinden ayrılmalı.
3. **İçeriği değil agregayı işleyin.** Issue/PR başlığı, gövdesi, yorumlar, kişi adı ve e-posta toplanmamalı; tarih, durum ve sayım yeterlidir.
4. **İstek bütçesini yönetin.** İki depo için başlangıç seti 4–6 ek REST çağrısı getirir. GitHub public verilerde anonim istekleri IP başına saatte 60, kimlik doğrulanmış istekleri saatte 5.000 ile sınırlar; ayrıca ikincil eşzamanlılık ve nokta limitleri vardır. Yanıtlardaki `x-ratelimit-*` başlıkları dikkate alınmalı, istekler paralel ama sınırlı yapılmalı ve 10–30 dakikalık TTL cache uygulanmalıdır. Kaynak: [GitHub REST rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api).
5. **Güvenlik verisini opt-in yapın.** Token yalnız sunucuda tutulmalı; istemciye hiçbir token, ham alert veya hassas kod/dependency belgesi gönderilmemeli.

## Önerilen v2 Sırası

1. Community Health ayrıntısı — mevcut istekteki kullanılmayan alanları taşır, en düşük risk/efor.
2. GitHub Actions güvenilirliği — canlı bakım kalitesinin en anlaşılır sinyali.
3. Release cadence — ürün/kütüphane olgunluğunu görünür kılar.
4. Issue sağlığı ve commit ivmesi — bakımın tepki ve süreklilik boyutunu tamamlar.
5. PR akışı, dil dağılımı ve katkı yoğunlaşması — kararın bağlamına göre açılabilen ileri kanıtlar.

Bu sıra, GitHub'ın public-community profile yaklaşımıyla uyumludur: GitHub; README, CODE_OF_CONDUCT, LICENSE ve CONTRIBUTING gibi önerilen dosyaları, katkı yapmak isteyenlerin proje sağlığını değerlendirmesi için sunar. Kaynak: [About community profiles for public repositories](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories).
