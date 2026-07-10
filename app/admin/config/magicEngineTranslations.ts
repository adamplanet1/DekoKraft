import type { Lang } from "../../../locales";

export type MagicEngineWorkspaceText = {
  header: { title: string; description: string; badge: string };
  workspace: { title: string; description: string };
  quickActions: { title: string; primary: string; secondary: string[] };
  statusItems: { label: string; value: string }[];
  assistant: {
    eyebrow: string;
    title: string;
    description: string;
    suggestions: string[];
    action: string;
  };
  overview: { title: string; description: string };
  readiness: {
    eyebrow: string;
    title: string;
    description: string;
    badge: string;
    items: string[];
  };
  focus: {
    eyebrow: string;
    title: string;
    description: string;
    items: string[];
    action: string;
  };
  projects: { title: string; description: string; names: string[] };
  opportunity: {
    eyebrow: string;
    title: string;
    description: string;
    points: string[];
    action: string;
  };
  studioHealth: {
    eyebrow: string;
    title: string;
    description: string;
    badge: string;
    indicators: string[];
  };
  learning: {
    eyebrow: string;
    title: string;
    description: string;
    tips: string[];
    action: string;
  };
  recentActivity: {
    eyebrow: string;
    title: string;
    description: string;
    items: string[];
  };
  creator: {
    stepTitles: Record<string, string>;
    stepDescriptions: Record<string, string>;
    none: string;
    current: string;
    previous: string;
    next: string;
    configurationSummary: string;
    complete: string;
    yes: string;
    no: string;
    decision: string;
    status: string;
    summary: string;
    pricing: string;
    visiblePrice: string;
    minimumPrice: string;
    available: string;
    completed: string;
    locked: string;
    ready: string;
    blocked: string;
    waiting: string;
    configurationReady: string;
    configurationBlocked: string;
    configurationSummaryTemplate: string;
    pricingSummaryTemplate: string;
  };
};

export const magicEngineTranslations: Record<Lang, MagicEngineWorkspaceText> = {
  ar: {
    header: { title: "محرك Magic", description: "مساحة إنشاء المنتجات بالذكاء الاصطناعي", badge: "معاينة" },
    workspace: { title: "مساحة المبدع", description: "إدارة إنشاء المنتجات، ومراجعة التقدم، ومراقبة نشاط محرك Magic." },
    quickActions: { title: "إجراءات سريعة", primary: "منتج جديد", secondary: ["استيراد", "تصدير", "مساعدة AI", "معاينة"] },
    statusItems: [{ label: "المحرك", value: "جاهز" }, { label: "الوصفات", value: "متزامنة" }, { label: "الحارس", value: "نشط" }, { label: "السوق", value: "يراقب" }],
    assistant: { eyebrow: "إرشاد Magic", title: "مساعد الذكاء الاصطناعي", description: "احصل على إرشاد أثناء إنشاء المنتجات والوصفات وعروض السوق.", suggestions: ["تحسين وصف المنتج", "اقتراح استراتيجية تسعير", "فحص جاهزية السوق"], action: "اسأل المساعد" },
    overview: { title: "نظرة عامة على مساحة العمل", description: "راجع تركيز اليوم، وتقدم المشاريع، والفرص، وصحة الاستوديو، والتعلم، والنشاط الأخير." },
    readiness: { eyebrow: "مساحة Magic", title: "جاهزية مساحة العمل", description: "مساحة العمل جاهزة لإنشاء المنتجات.", badge: "جاهز", items: ["بيانات المنتج جاهزة", "الوصفات متزامنة", "الحارس نشط", "السوق يراقب"] },
    focus: { eyebrow: "لوحة المبدع", title: "صباح الخير، أيها المبدع", description: "إليك أهم الأشياء التي تستحق المراجعة اليوم قبل فتح مساحة العمل.", items: ["طلبات جاهزة للشحن", "منتج يحتاج صورًا", "فرصة في السوق", "مراجعة عميل جديدة"], action: "فتح مساحة المبدع" },
    projects: { title: "المشاريع النشطة", description: "تابع مشاريع المبدع المتجهة نحو الجاهزية للسوق.", names: ["علبة خاتم", "علبة مجوهرات", "علبة ذكريات"] },
    opportunity: { eyebrow: "رؤية السوق", title: "فرصة في السوق", description: "العملاء يظهرون اهتمامًا بعلب الهدايا الخشبية المخصصة.", points: ["إضافة خيار النقش", "تقديم تغليف هدايا", "إنشاء حزمة صغيرة"], action: "عرض الفرصة" },
    studioHealth: { eyebrow: "استوديو المبدع", title: "صحة الاستوديو", description: "مساحة المبدع في حالة جيدة.", badge: "صحي", indicators: ["الجودة", "التسليم", "المراجعات", "النمو"] },
    learning: { eyebrow: "تعلم المبدع", title: "نصيحة تعليمية", description: "صور المنتج الأفضل تزيد ثقة العملاء وتحسن التحويل.", tips: ["استخدم خلفية نظيفة", "اعرض المنتج من عدة زوايا", "أضف صورة استخدام واقعية"], action: "فتح مركز التعلم" },
    recentActivity: { eyebrow: "مساحة المبدع", title: "النشاط الأخير", description: "تابع آخر التحديثات في مساحة المبدع.", items: ["تم إنشاء وصفة منتج جديدة", "تم اجتياز تحقق الوصفة", "تم اكتشاف فرصة في السوق", "تم تحديث صحة الاستوديو"] },
    creator: { stepTitles: { "choose-sample": "اختيار النموذج", configuration: "الإعدادات", decoration: "الزخرفة", preview: "المعاينة", price: "السعر", "customer-offer": "عرض العميل", production: "الإنتاج", "confirm-order": "تأكيد الطلب" }, stepDescriptions: { "choose-sample": "{sample} هو نموذج البداية الحالي.", configuration: "{dimensions}، مادة {material}، والكمية {quantity}.", decoration: "الزخرفة مضبوطة كقيمة افتراضية بدون نص مخصص.", preview: "معاينة إنتاج العلبة الخشبية جاهزة كمسودة.", price: "السعر الظاهر هو {price} {currency}.", "customer-offer": "عرض العميل في حالة {status} ولم يتم إرسال عرض بعد.", production: "حزمة التصنيع في حالة {status} للورشة.", "confirm-order": "الطلب في حالة {status} والدفع والإنتاج لم يبدآ بعد." }, none: "لا يوجد", current: "الحالي", previous: "السابق", next: "التالي", configurationSummary: "ملخص الإعدادات", complete: "مكتمل", yes: "نعم", no: "لا", decision: "القرار", status: "الحالة", summary: "الملخص", pricing: "التسعير", visiblePrice: "السعر الظاهر", minimumPrice: "الحد الأدنى", available: "متاح", completed: "مكتمل", locked: "مغلق", ready: "جاهز", blocked: "محجوب", waiting: "بانتظار", configurationReady: "الإعدادات مكتملة وجاهزة للخطوة التالية.", configurationBlocked: "الإعدادات غير مكتملة، لذلك القرار محجوب.", configurationSummaryTemplate: "{count} خيارات، مادة {material}، زخرفة {decoration}، الكمية {quantity}.", pricingSummaryTemplate: "السعر الظاهر: {visible} {currency}. الحد الأدنى: {minimum} {currency}." },
  },
  de: {
    header: { title: "Magic Engine", description: "KI-gestützter Arbeitsbereich zur Produkterstellung", badge: "Vorschau" },
    workspace: { title: "Creator-Arbeitsbereich", description: "Produkte erstellen, Fortschritte prüfen und die Aktivität der Magic Engine überwachen." },
    quickActions: { title: "Schnellaktionen", primary: "Neues Produkt", secondary: ["Importieren", "Exportieren", "KI-Hilfe", "Vorschau"] },
    statusItems: [{ label: "Engine", value: "Bereit" }, { label: "Rezepte", value: "Synchronisiert" }, { label: "Wächter", value: "Aktiv" }, { label: "Markt", value: "Überwacht" }],
    assistant: { eyebrow: "Magic-Beratung", title: "KI-Assistent", description: "Erhalten Sie Unterstützung beim Erstellen von Produkten, Rezepten und Marktangeboten.", suggestions: ["Produktbeschreibung verbessern", "Preisstrategie vorschlagen", "Marktreife prüfen"], action: "Assistenten fragen" },
    overview: { title: "Arbeitsbereich im Überblick", description: "Prüfen Sie den heutigen Fokus, Projektfortschritte, Chancen, Studiozustand, Lerninhalte und letzte Aktivitäten." },
    readiness: { eyebrow: "Magic-Arbeitsbereich", title: "Bereitschaft des Arbeitsbereichs", description: "Der Arbeitsbereich ist bereit für die Produkterstellung.", badge: "Bereit", items: ["Produktdaten sind bereit", "Rezepte sind synchronisiert", "Wächter ist aktiv", "Markt wird überwacht"] },
    focus: { eyebrow: "Creator-Dashboard", title: "Guten Morgen, Creator", description: "Das sind die wichtigsten Punkte, die Sie heute vor dem Öffnen des Arbeitsbereichs prüfen sollten.", items: ["Versandbereite Bestellungen", "Produkt benötigt Bilder", "Marktchance", "Neue Kundenbewertung"], action: "Creator-Arbeitsbereich öffnen" },
    projects: { title: "Aktive Projekte", description: "Verfolgen Sie Creator-Projekte auf dem Weg zur Marktreife.", names: ["Ringbox", "Schmuckbox", "Erinnerungsbox"] },
    opportunity: { eyebrow: "Markteinblick", title: "Marktchance", description: "Kunden zeigen Interesse an personalisierten Geschenkboxen aus Holz.", points: ["Gravuroption hinzufügen", "Geschenkverpackung anbieten", "Kleines Set erstellen"], action: "Chance anzeigen" },
    studioHealth: { eyebrow: "Creator-Studio", title: "Studiozustand", description: "Der Creator-Arbeitsbereich ist in gutem Zustand.", badge: "Gesund", indicators: ["Qualität", "Lieferung", "Bewertungen", "Wachstum"] },
    learning: { eyebrow: "Creator-Lernen", title: "Lerntipp", description: "Bessere Produktbilder stärken das Kundenvertrauen und erhöhen die Conversion.", tips: ["Sauberen Hintergrund verwenden", "Produkt aus mehreren Blickwinkeln zeigen", "Realistisches Anwendungsbild hinzufügen"], action: "Lernzentrum öffnen" },
    recentActivity: { eyebrow: "Creator-Arbeitsbereich", title: "Letzte Aktivität", description: "Verfolgen Sie die neuesten Aktualisierungen im Creator-Arbeitsbereich.", items: ["Neues Produktrezept erstellt", "Rezeptprüfung bestanden", "Marktchance erkannt", "Studiozustand aktualisiert"] },
    creator: { stepTitles: { "choose-sample": "Muster auswählen", configuration: "Konfiguration", decoration: "Dekoration", preview: "Vorschau", price: "Preis", "customer-offer": "Kundenangebot", production: "Produktion", "confirm-order": "Bestellung bestätigen" }, stepDescriptions: { "choose-sample": "{sample} ist das aktuelle Startmuster.", configuration: "{dimensions}, Material {material}, Menge {quantity}.", decoration: "Die Dekoration ist als Standardwert ohne eigenen Text festgelegt.", preview: "Die Produktionsvorschau der Holzbox liegt als Entwurf vor.", price: "Der angezeigte Preis beträgt {price} {currency}.", "customer-offer": "Das Kundenangebot hat den Status {status}; es wurde noch kein Angebot versendet.", production: "Das Fertigungspaket hat für die Werkstatt den Status {status}.", "confirm-order": "Die Bestellung hat den Status {status}; Zahlung und Produktion haben noch nicht begonnen." }, none: "Keine", current: "Aktuell", previous: "Zurück", next: "Weiter", configurationSummary: "Konfigurationsübersicht", complete: "Vollständig", yes: "Ja", no: "Nein", decision: "Entscheidung", status: "Status", summary: "Zusammenfassung", pricing: "Preisgestaltung", visiblePrice: "Angezeigter Preis", minimumPrice: "Mindestpreis", available: "Verfügbar", completed: "Abgeschlossen", locked: "Gesperrt", ready: "Bereit", blocked: "Blockiert", waiting: "Ausstehend", configurationReady: "Die Konfiguration ist vollständig und bereit für den nächsten Schritt.", configurationBlocked: "Die Konfiguration ist unvollständig; die Entscheidung ist daher blockiert.", configurationSummaryTemplate: "{count} Optionen, Material {material}, Dekoration {decoration}, Menge {quantity}.", pricingSummaryTemplate: "Angezeigter Preis: {visible} {currency}. Mindestpreis: {minimum} {currency}." },
  },
  en: {
    header: { title: "Magic Engine", description: "AI-powered product creation workspace", badge: "Preview" },
    workspace: { title: "Creator workspace", description: "Create products, review progress, and monitor Magic Engine activity." },
    quickActions: { title: "Quick actions", primary: "New product", secondary: ["Import", "Export", "AI help", "Preview"] },
    statusItems: [{ label: "Engine", value: "Ready" }, { label: "Recipes", value: "Synced" }, { label: "Guardian", value: "Active" }, { label: "Market", value: "Monitoring" }],
    assistant: { eyebrow: "Magic guidance", title: "AI assistant", description: "Get guidance while creating products, recipes, and market offers.", suggestions: ["Improve product description", "Suggest a pricing strategy", "Check market readiness"], action: "Ask the assistant" },
    overview: { title: "Workspace overview", description: "Review today's focus, project progress, opportunities, studio health, learning, and recent activity." },
    readiness: { eyebrow: "Magic workspace", title: "Workspace readiness", description: "The workspace is ready for product creation.", badge: "Ready", items: ["Product data is ready", "Recipes are synced", "Guardian is active", "Market is monitoring"] },
    focus: { eyebrow: "Creator dashboard", title: "Good morning, creator", description: "Here are the most important items to review today before opening the workspace.", items: ["Orders ready to ship", "Product needs images", "Market opportunity", "New customer review"], action: "Open creator workspace" },
    projects: { title: "Active projects", description: "Track creator projects moving toward market readiness.", names: ["Ring box", "Jewelry box", "Keepsake box"] },
    opportunity: { eyebrow: "Market insight", title: "Market opportunity", description: "Customers are showing interest in personalized wooden gift boxes.", points: ["Add an engraving option", "Offer gift wrapping", "Create a small bundle"], action: "View opportunity" },
    studioHealth: { eyebrow: "Creator studio", title: "Studio health", description: "The creator workspace is in good condition.", badge: "Healthy", indicators: ["Quality", "Delivery", "Reviews", "Growth"] },
    learning: { eyebrow: "Creator learning", title: "Learning tip", description: "Better product images increase customer confidence and improve conversion.", tips: ["Use a clean background", "Show the product from several angles", "Add a realistic lifestyle image"], action: "Open learning center" },
    recentActivity: { eyebrow: "Creator workspace", title: "Recent activity", description: "Follow the latest updates in the creator workspace.", items: ["New product recipe created", "Recipe validation passed", "Market opportunity detected", "Studio health updated"] },
    creator: { stepTitles: { "choose-sample": "Choose sample", configuration: "Configuration", decoration: "Decoration", preview: "Preview", price: "Price", "customer-offer": "Customer offer", production: "Production", "confirm-order": "Confirm order" }, stepDescriptions: { "choose-sample": "{sample} is the current starting sample.", configuration: "{dimensions}, material {material}, quantity {quantity}.", decoration: "Decoration is set to its default value without custom text.", preview: "The wooden box production preview is ready as a draft.", price: "The visible price is {price} {currency}.", "customer-offer": "The customer offer is {status}; no offer has been sent yet.", production: "The manufacturing package is {status} for the workshop.", "confirm-order": "The order is {status}; payment and production have not started." }, none: "None", current: "Current", previous: "Previous", next: "Next", configurationSummary: "Configuration summary", complete: "Complete", yes: "Yes", no: "No", decision: "Decision", status: "Status", summary: "Summary", pricing: "Pricing", visiblePrice: "Visible price", minimumPrice: "Minimum price", available: "Available", completed: "Completed", locked: "Locked", ready: "Ready", blocked: "Blocked", waiting: "Waiting", configurationReady: "The configuration is complete and ready for the next step.", configurationBlocked: "The configuration is incomplete, so the decision is blocked.", configurationSummaryTemplate: "{count} options, material {material}, decoration {decoration}, quantity {quantity}.", pricingSummaryTemplate: "Visible price: {visible} {currency}. Minimum price: {minimum} {currency}." },
  },
  fr: {
    header: { title: "Magic Engine", description: "Espace de création de produits assisté par IA", badge: "Aperçu" },
    workspace: { title: "Espace créateur", description: "Créez des produits, examinez la progression et surveillez l’activité de Magic Engine." },
    quickActions: { title: "Actions rapides", primary: "Nouveau produit", secondary: ["Importer", "Exporter", "Aide IA", "Aperçu"] },
    statusItems: [{ label: "Moteur", value: "Prêt" }, { label: "Recettes", value: "Synchronisées" }, { label: "Gardien", value: "Actif" }, { label: "Marché", value: "Surveillé" }],
    assistant: { eyebrow: "Conseils Magic", title: "Assistant IA", description: "Obtenez de l’aide lors de la création de produits, de recettes et d’offres commerciales.", suggestions: ["Améliorer la description du produit", "Suggérer une stratégie tarifaire", "Vérifier la préparation au marché"], action: "Interroger l’assistant" },
    overview: { title: "Vue d’ensemble de l’espace de travail", description: "Consultez les priorités du jour, l’avancement des projets, les opportunités, la santé du studio, l’apprentissage et l’activité récente." },
    readiness: { eyebrow: "Espace Magic", title: "Préparation de l’espace de travail", description: "L’espace de travail est prêt pour la création de produits.", badge: "Prêt", items: ["Les données produit sont prêtes", "Les recettes sont synchronisées", "Le gardien est actif", "Le marché est surveillé"] },
    focus: { eyebrow: "Tableau de bord créateur", title: "Bonjour, créateur", description: "Voici les éléments les plus importants à vérifier aujourd’hui avant d’ouvrir l’espace de travail.", items: ["Commandes prêtes à être expédiées", "Produit nécessitant des images", "Opportunité de marché", "Nouvel avis client"], action: "Ouvrir l’espace créateur" },
    projects: { title: "Projets actifs", description: "Suivez les projets du créateur qui progressent vers leur mise sur le marché.", names: ["Boîte à bague", "Boîte à bijoux", "Boîte à souvenirs"] },
    opportunity: { eyebrow: "Analyse du marché", title: "Opportunité de marché", description: "Les clients s’intéressent aux coffrets cadeaux en bois personnalisés.", points: ["Ajouter une option de gravure", "Proposer un emballage cadeau", "Créer un petit lot"], action: "Voir l’opportunité" },
    studioHealth: { eyebrow: "Studio créateur", title: "Santé du studio", description: "L’espace créateur est en bon état.", badge: "Sain", indicators: ["Qualité", "Livraison", "Avis", "Croissance"] },
    learning: { eyebrow: "Apprentissage créateur", title: "Conseil pédagogique", description: "De meilleures images produit renforcent la confiance des clients et améliorent la conversion.", tips: ["Utiliser un arrière-plan propre", "Montrer le produit sous plusieurs angles", "Ajouter une image d’utilisation réaliste"], action: "Ouvrir le centre d’apprentissage" },
    recentActivity: { eyebrow: "Espace créateur", title: "Activité récente", description: "Suivez les dernières mises à jour de l’espace créateur.", items: ["Nouvelle recette produit créée", "Validation de la recette réussie", "Opportunité de marché détectée", "Santé du studio mise à jour"] },
    creator: { stepTitles: { "choose-sample": "Choisir un modèle", configuration: "Configuration", decoration: "Décoration", preview: "Aperçu", price: "Prix", "customer-offer": "Offre client", production: "Production", "confirm-order": "Confirmer la commande" }, stepDescriptions: { "choose-sample": "{sample} est le modèle de départ actuel.", configuration: "{dimensions}, matériau {material}, quantité {quantity}.", decoration: "La décoration utilise sa valeur par défaut sans texte personnalisé.", preview: "L’aperçu de production de la boîte en bois est prêt comme brouillon.", price: "Le prix affiché est de {price} {currency}.", "customer-offer": "L’offre client a le statut {status} ; aucune offre n’a encore été envoyée.", production: "Le dossier de fabrication a le statut {status} pour l’atelier.", "confirm-order": "La commande a le statut {status} ; le paiement et la production n’ont pas commencé." }, none: "Aucun", current: "Actuel", previous: "Précédent", next: "Suivant", configurationSummary: "Résumé de la configuration", complete: "Terminé", yes: "Oui", no: "Non", decision: "Décision", status: "Statut", summary: "Résumé", pricing: "Tarification", visiblePrice: "Prix affiché", minimumPrice: "Prix minimum", available: "Disponible", completed: "Terminé", locked: "Verrouillé", ready: "Prêt", blocked: "Bloqué", waiting: "En attente", configurationReady: "La configuration est terminée et prête pour l’étape suivante.", configurationBlocked: "La configuration est incomplète ; la décision est donc bloquée.", configurationSummaryTemplate: "{count} options, matériau {material}, décoration {decoration}, quantité {quantity}.", pricingSummaryTemplate: "Prix affiché : {visible} {currency}. Prix minimum : {minimum} {currency}." },
  },
};
