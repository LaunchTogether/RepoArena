export type Locale = "en" | "tr";

export type LocaleMessages = {
  documentTitle: string;
  language: {
    label: string;
    english: string;
    turkish: string;
  };
  theme: {
    switchToLight: string;
    switchToDark: string;
    light: string;
    dark: string;
  };
  header: {
    home: string;
    status: string;
    publicRepositories: string;
    method: string;
  };
  landing: {
    eyebrow: string;
    title: string;
    titleEmphasis: string;
    description: string;
    formKicker: string;
    formNote: string;
    example: string;
    repositoryA: string;
    repositoryB: string;
    publicOnly: string;
    compare: string;
    opening: string;
    preparing: string;
    invalidFirst: string;
    invalidSecond: string;
    invalidFormat: string;
    methodKicker: string;
    methodTitle: string;
    methodSteps: Array<{ title: string; description: string }>;
    metricsKicker: string;
    metricsTitle: string;
    metrics: Array<{ title: string; description: string }>;
    exampleKicker: string;
    exampleDescription: string;
    openExample: string;
  };
  comparison: {
    analysisKicker: string;
    analysisTitle: string;
    analysisLabel: string;
    stages: string[];
    errorKicker: string;
    retry: string;
    invalidUrlTitle: string;
    invalidUrlDetail: string;
    routeErrorTitle: string;
    routeErrorDetail: string;
    topLive: string;
    topPreview: string;
    generatedNow: string;
    sampleData: string;
    overview: string;
    noDescription: string;
    stars: string;
    forks: string;
    issues: string;
    language: string;
    scoreKicker: string;
    scoreTitle: string;
    winner: string;
    tied: string;
    categoriesKicker: string;
    categoriesTitle: string;
    categoryLabels: Record<string, string>;
    leadsBy: (repository: string, difference: number) => string;
    evenlyMatched: string;
    reasonEvidence: (category: string) => string;
    decisionKicker: string;
    decisionLead: (repository: string) => string;
    closeDecision: string;
    decisionDetail: (winner: string, winnerLead: string, otherLead: string) => string;
    closeDetail: string;
    fallbackErrorTitle: string;
    fallbackErrorDetail: string;
    requestErrorTitle: string;
    requestErrorDetail: string;
  };
  report: {
    intentKicker: string;
    intentTitle: string;
    intentLabel: string;
    intents: Record<string, string>;
    evidenceOverview: string;
    deliveryEvidence: string;
    scoreEvidence: string;
    coverageKicker: string;
    coverageTitle: string;
    coverageCount: (available: number, total: number) => string;
    coverageComplete: string;
    coveragePartial: string;
    generated: string;
    sourcePolicy: string;
    sourcePolicyValue: string;
    viewSources: string;
    githubSource: string;
    driversKicker: string;
    driversTitle: string;
    noDrivers: string;
    leads: (repository: string) => string;
    copyLink: string;
    linkCopied: string;
    copyFailed: string;
    unavailable: string;
    neutralEvidence: string;
  };
};

export const messages: Record<Locale, LocaleMessages> = {
  en: {
    documentTitle: "RepoArena — Compare GitHub Repositories",
    language: { label: "Language", english: "English", turkish: "Türkçe" },
    theme: { switchToLight: "Switch to light theme", switchToDark: "Switch to dark theme", light: "Light", dark: "Dark" },
    header: { home: "RepoArena home", status: "Product status", publicRepositories: "Public repositories", method: "Method" },
    landing: {
      eyebrow: "Engineering signals, made comparable", title: "Which repository", titleEmphasis: "wins?",
      description: "Compare GitHub repositories using real engineering metrics — not just stars.",
      formKicker: "Repository comparison", formNote: "Two public repositories. One evidence-based read.", example: "Try React vs Vue",
      repositoryA: "Repository A", repositoryB: "Repository B", publicOnly: "Public repositories only", compare: "Compare repositories",
      opening: "Opening analysis", preparing: "Preparing comparison route…", invalidFirst: "Enter the first GitHub repository URL.", invalidSecond: "Enter the second GitHub repository URL.", invalidFormat: "Use github.com/owner/repository or owner/repository.",
      methodKicker: "The method", methodTitle: "A decision trail, not a popularity contest.",
      methodSteps: [
        { title: "Name the contenders", description: "Paste two public GitHub repositories. Short owner/repo notation also works." },
        { title: "Read the engineering signals", description: "Activity, maintenance, community, documentation, and project standards are weighed independently." },
        { title: "Choose with context", description: "See category wins, raw signals, and the gap behind the final score." },
      ],
      metricsKicker: "What gets measured", metricsTitle: "The parts that make a repository dependable.",
      metrics: [
        { title: "Activity", description: "Commit and release cadence" }, { title: "Maintenance", description: "Issue and pull request hygiene" },
        { title: "Community", description: "Contributor and collaboration signals" }, { title: "Documentation", description: "Readme and project guidance" },
        { title: "Project health", description: "Standards, automation, and care" },
      ],
      exampleKicker: "Live comparison", exampleDescription: "See a live GitHub API comparison with the same evidence and scoring pipeline used by the form.", openExample: "Open live comparison",
    },
    comparison: {
      analysisKicker: "Analysis in progress", analysisTitle: "Reading the repository signals.", analysisLabel: "Repository analysis in progress", stages: ["Repository metadata", "Activity and maintenance signals", "Community and project health", "Calculating scores"],
      errorKicker: "Comparison unavailable", retry: "Start another comparison", invalidUrlTitle: "This comparison URL is invalid.", invalidUrlDetail: "Use the comparison form to choose two public GitHub repositories.", routeErrorTitle: "The comparison could not be displayed.", routeErrorDetail: "Refresh the page or return to the repository form and try again.",
      topLive: "Live GitHub analysis", topPreview: "Preview result", generatedNow: "generated from current repository data", sampleData: "sample scoring data", overview: "Repository overview", noDescription: "No repository description is available.", stars: "Stars", forks: "Forks", issues: "Issues", language: "Language",
      scoreKicker: "RepoArena score", scoreTitle: "The overall read", winner: "Winner", tied: "No overall winner — the scores are tied.", categoriesKicker: "Category scorecards", categoriesTitle: "Where the difference comes from.",
      categoryLabels: { activity: "Activity", maintenance: "Maintenance", community: "Community", codebase: "Codebase health", documentation: "Documentation", popularity: "Popularity", health: "Project health" },
      leadsBy: (repository, difference) => `${repository} leads by ${difference}`, evenlyMatched: "Evenly matched", reasonEvidence: (category) => `${category} evidence`,
      decisionKicker: "Decision note", decisionLead: (repository) => `Why ${repository} leads`, closeDecision: "A close comparison", decisionDetail: (winner, winnerLead, otherLead) => `${winner} comes out ahead on ${winnerLead}. The opposing repository still leads in ${otherLead}.`, closeDetail: "Neither repository separates itself on the overall score; inspect individual categories to decide what matters for your context.",
      fallbackErrorTitle: "We could not compare these repositories.", fallbackErrorDetail: "Repository data could not be loaded. Please try again.", requestErrorTitle: "The comparison request could not be completed.", requestErrorDetail: "Check your connection and try the comparison again.",
    },
    report: {
      intentKicker: "Decision context", intentTitle: "Read the same evidence for your goal.", intentLabel: "Comparison intent", intents: { general: "General assessment", adopting_library: "Adopting a library", contributing: "Contributing", reference_project: "Reference project" }, evidenceOverview: "Comparison evidence overview", deliveryEvidence: "Repository delivery evidence", scoreEvidence: "Score evidence",
      coverageKicker: "Evidence coverage", coverageTitle: "How complete is this read?", coverageCount: (available, total) => `${available} of ${total} evidence signals retrieved`, coverageComplete: "All requested signals were retrieved. Scores use only available evidence.", coveragePartial: "Some signals could not be retrieved. Scores use only available evidence.", generated: "Generated", sourcePolicy: "Source policy", sourcePolicyValue: "Public GitHub metadata only", viewSources: "View evidence sources", githubSource: "GitHub source",
      driversKicker: "Decision drivers", driversTitle: "What drives this result", noDrivers: "No decisive difference emerged from the retrieved evidence.", leads: (repository) => `${repository} leads`, copyLink: "Copy comparison link", linkCopied: "Link copied", copyFailed: "Your browser could not copy the link. Copy the address from the browser instead.", unavailable: "Unavailable", neutralEvidence: "Unavailable evidence is neutral. No score penalty.",
    },
  },
  tr: {
    documentTitle: "RepoArena — GitHub Depolarını Karşılaştır",
    language: { label: "Dil", english: "İngilizce", turkish: "Türkçe" },
    theme: { switchToLight: "Açık temaya geç", switchToDark: "Koyu temaya geç", light: "Açık", dark: "Koyu" },
    header: { home: "RepoArena ana sayfa", status: "Ürün durumu", publicRepositories: "Herkese açık depolar", method: "Yöntem" },
    landing: {
      eyebrow: "Mühendislik sinyalleri, karşılaştırılabilir hale geldi", title: "Hangi depo", titleEmphasis: "kazanır?", description: "GitHub depolarını yalnızca yıldızlarla değil, gerçek mühendislik metrikleriyle karşılaştırın.",
      formKicker: "Depo karşılaştırması", formNote: "İki herkese açık depo. Kanıta dayalı tek okuma.", example: "React ve Vue’yu dene", repositoryA: "Depo A", repositoryB: "Depo B", publicOnly: "Yalnızca herkese açık depolar", compare: "Depoları karşılaştır", opening: "Analiz açılıyor", preparing: "Karşılaştırma rotası hazırlanıyor…", invalidFirst: "İlk GitHub depo URL’sini girin.", invalidSecond: "İkinci GitHub depo URL’sini girin.", invalidFormat: "github.com/sahip/depo veya sahip/depo biçimini kullanın.",
      methodKicker: "Yöntem", methodTitle: "Popülerlik yarışması değil, karar izi.", methodSteps: [
        { title: "Adayları belirleyin", description: "İki herkese açık GitHub deposunu yapıştırın. Kısa sahip/depo biçimi de çalışır." },
        { title: "Mühendislik sinyallerini okuyun", description: "Aktivite, bakım, topluluk, dokümantasyon ve proje standartları bağımsız olarak değerlendirilir." },
        { title: "Bağlamla karar verin", description: "Kategori kazançlarını, ham sinyalleri ve nihai skor farkını görün." },
      ],
      metricsKicker: "Neler ölçülür", metricsTitle: "Bir depoyu güvenilir kılan parçalar.", metrics: [
        { title: "Aktivite", description: "Commit ve sürüm ritmi" }, { title: "Bakım", description: "Issue ve pull request düzeni" }, { title: "Topluluk", description: "Katkıcı ve iş birliği sinyalleri" }, { title: "Dokümantasyon", description: "Readme ve proje rehberliği" }, { title: "Proje sağlığı", description: "Standartlar, otomasyon ve özen" },
      ],
      exampleKicker: "Canlı karşılaştırma", exampleDescription: "Formun kullandığı kanıt ve puanlama hattıyla canlı bir GitHub API karşılaştırmasını görün.", openExample: "Canlı karşılaştırmayı aç",
    },
    comparison: {
      analysisKicker: "Analiz sürüyor", analysisTitle: "Depo sinyalleri okunuyor.", analysisLabel: "Depo analizi sürüyor", stages: ["Depo metaverisi", "Aktivite ve bakım sinyalleri", "Topluluk ve proje sağlığı", "Skorlar hesaplanıyor"],
      errorKicker: "Karşılaştırma kullanılamıyor", retry: "Yeni bir karşılaştırma başlat", invalidUrlTitle: "Bu karşılaştırma URL’si geçersiz.", invalidUrlDetail: "İki herkese açık GitHub deposu seçmek için karşılaştırma formunu kullanın.", routeErrorTitle: "Karşılaştırma görüntülenemedi.", routeErrorDetail: "Sayfayı yenileyin veya depo formuna dönüp yeniden deneyin.", topLive: "Canlı GitHub analizi", topPreview: "Önizleme sonucu", generatedNow: "güncel depo verilerinden üretildi", sampleData: "örnek puanlama verisi", overview: "Depo özeti", noDescription: "Bu depo için açıklama yok.", stars: "Yıldızlar", forks: "Fork’lar", issues: "Issue’lar", language: "Dil",
      scoreKicker: "RepoArena skoru", scoreTitle: "Genel değerlendirme", winner: "Kazanan", tied: "Genel kazanan yok — skorlar eşit.", categoriesKicker: "Kategori kartları", categoriesTitle: "Farkın geldiği yer.", categoryLabels: { activity: "Aktivite", maintenance: "Bakım", community: "Topluluk", codebase: "Kod tabanı sağlığı", documentation: "Dokümantasyon", popularity: "Popülerlik", health: "Proje sağlığı" }, leadsBy: (repository, difference) => `${repository} ${difference} puan önde`, evenlyMatched: "Eşit seviyede", reasonEvidence: (category) => `${category} kanıtı`, decisionKicker: "Karar notu", decisionLead: (repository) => `${repository} neden önde`, closeDecision: "Yakın bir karşılaştırma", decisionDetail: (winner, winnerLead, otherLead) => `${winner}, ${winnerLead} alanında öne çıkıyor. Karşı depo ise ${otherLead} alanında hâlâ önde.`, closeDetail: "Hiçbir depo genel skorda belirgin biçimde ayrışmıyor; sizin bağlamınız için önemli kategorileri inceleyin.", fallbackErrorTitle: "Bu depoları karşılaştıramadık.", fallbackErrorDetail: "Depo verisi yüklenemedi. Lütfen yeniden deneyin.", requestErrorTitle: "Karşılaştırma isteği tamamlanamadı.", requestErrorDetail: "Bağlantınızı kontrol edip karşılaştırmayı yeniden deneyin.",
    },
    report: {
      intentKicker: "Karar bağlamı", intentTitle: "Aynı kanıtı hedefiniz için okuyun.", intentLabel: "Karşılaştırma amacı", intents: { general: "Genel değerlendirme", adopting_library: "Bir kütüphane edinmek", contributing: "Katkı sunmak", reference_project: "Referans proje" }, evidenceOverview: "Karşılaştırma kanıt özeti", deliveryEvidence: "Depo teslimat kanıtı", scoreEvidence: "Skor kanıtı", coverageKicker: "Kanıt kapsamı", coverageTitle: "Bu okuma ne kadar tamamlandı?", coverageCount: (available, total) => `${available}/${total} kanıt sinyali alındı`, coverageComplete: "İstenen tüm sinyaller alındı. Skorlar yalnızca mevcut kanıtları kullanır.", coveragePartial: "Bazı sinyaller alınamadı. Skorlar yalnızca mevcut kanıtları kullanır.", generated: "Üretildi", sourcePolicy: "Kaynak politikası", sourcePolicyValue: "Yalnızca herkese açık GitHub metaverisi", viewSources: "Kanıt kaynaklarını görüntüle", githubSource: "GitHub kaynağı", driversKicker: "Karar etkenleri", driversTitle: "Bu sonucu ne belirliyor", noDrivers: "Alınan kanıtta belirleyici bir fark oluşmadı.", leads: (repository) => `${repository} önde`, copyLink: "Karşılaştırma bağlantısını kopyala", linkCopied: "Bağlantı kopyalandı", copyFailed: "Tarayıcınız bağlantıyı kopyalayamadı. Bunun yerine adres çubuğundaki bağlantıyı kopyalayın.", unavailable: "Kullanılamıyor", neutralEvidence: "Kullanılamayan kanıt nötrdür. Skora ceza uygulanmaz.",
    },
  },
};
