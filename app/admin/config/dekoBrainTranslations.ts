import type { Lang } from "./translations";
import type {
  DekoBrainStageStatus,
  MediaCardRatio,
  MediaFit,
  MediaObjectPosition,
  MediaOrientation,
  MediaPreviewRatio,
  MediaQualityWarning,
  MediaItemStatus,
} from "../types/dekobrain";

export interface DekoBrainCopy {
  title: string;
  subtitle: string;
  temporaryNotice: string;
  uploadTitle: string;
  uploadHint: string;
  uploadFormats: string;
  videoFuture: string;
  selectFiles: string;
  errors: {
    unsupported: string;
    tooLarge: string;
    limit: string;
    unreadable: string;
  };
  mediaList: string;
  emptyList: string;
  warningCount: string;
  preview: string;
  previewRatio: string;
  fit: string;
  objectPosition: string;
  ratios: Record<MediaPreviewRatio, string>;
  fits: Record<MediaFit, string>;
  positions: Record<MediaObjectPosition, string>;
  analysis: string;
  fields: {
    filename: string;
    format: string;
    dimensions: string;
    aspectRatio: string;
    orientation: string;
    fileSize: string;
    megapixels: string;
    transparency: string;
    score: string;
    recommendedFit: string;
    recommendedRatio: string;
    responsiveWidths: string;
    warnings: string;
    aiStatus: string;
  };
  orientations: Record<MediaOrientation, string>;
  yes: string;
  no: string;
  unknown: string;
  noWarnings: string;
  warnings: Record<MediaQualityWarning, string>;
  scoreExplanation: string;
  aiFuture: string;
  stagesTitle: string;
  stageNames: string[];
  stageDetails: {
    imported: string;
    safe: string;
    fileWarning: string;
    visionFuture: string;
    relevanceFuture: string;
    dimensionsReady: string;
    cropReady: string;
    backgroundFuture: string;
    conversionUseful: string;
    conversionFuture: string;
    responsiveReady: string;
    studioFuture: string;
    enhancementFuture: string;
  };
  stageStatuses: Record<DekoBrainStageStatus, string>;
  itemStatuses: Record<MediaItemStatus, string>;
  actions: {
    analyze: string;
    useAsIs: string;
    autoEnhance: string;
    smartCrop: string;
    convertWebp: string;
    review: string;
    remove: string;
  };
  futureAction: string;
  suggested: string;
  approvedMessage: string;
  reviewMessage: string;
  dropActive: string;
}

const stageNames = {
  ar: [
    "استيراد الوسائط", "فحص الملف والصيغة", "تحليل محتوى الصورة",
    "التحقق من ارتباطها بنشاط المنصة", "الأبعاد والاتجاه",
    "القص الذكي وإطار العرض", "استخراج المنتج الشفاف",
    "استوديو خلفيات DekoBrain", "التحويل والضغط إلى WebP",
    "إنشاء نسخ المقاسات المختلفة", "رأي DekoBrain",
  ],
  de: [
    "Medienimport", "Dateisicherheit und Format", "Inhaltsanalyse",
    "Relevanz für die Plattform", "Abmessungen und Ausrichtung",
    "Intelligenter Zuschnitt und Rahmen", "Transparente Produktextraktion",
    "DekoBrain Hintergrundstudio", "WebP-Konvertierung und Komprimierung",
    "Responsive Bildvarianten", "DekoBrain Advisor",
  ],
  en: [
    "Media Import", "File Safety and Format", "Content Analysis",
    "Platform Activity Relevance", "Dimensions and Orientation",
    "Smart Crop and Display Frame", "Transparent Product Extraction",
    "DekoBrain Background Studio", "WebP Conversion and Compression",
    "Responsive Image Variants", "DekoBrain Advisor",
  ],
  fr: [
    "Importation des médias", "Sécurité et format du fichier", "Analyse du contenu",
    "Pertinence pour la plateforme", "Dimensions et orientation",
    "Recadrage intelligent et cadre", "Extraction du produit transparent",
    "Studio d’arrière-plan DekoBrain", "Conversion WebP et compression",
    "Variantes responsives", "DekoBrain Advisor",
  ],
};

const commonMappings = {
  ar: {
    ratios: { original: "النسبة الأصلية", "1:1": "مربع 1:1", "4:3": "أفقي 4:3", "3:4": "عمودي 3:4", "16:9": "عريض 16:9" },
    fits: { contain: "احتواء", cover: "تغطية" },
    positions: { center: "الوسط", top: "أعلى", bottom: "أسفل", left: "يسار", right: "يمين" },
    orientations: { square: "مربع", portrait: "عمودي", landscape: "أفقي" },
    stageStatuses: { notStarted: "لم يبدأ", analyzing: "جارٍ التحليل", ready: "جاهز", warning: "تحذير", future: "مرحلة مستقبلية", needsReview: "يحتاج مراجعة" },
    itemStatuses: { analyzing: "جارٍ التحليل", ready: "جاهز", warning: "تحذير", approved: "معتمد محليًا", needsReview: "يحتاج مراجعة" },
    warnings: { lowResolution: "الدقة منخفضة؛ أطول ضلع أقل من 800 بكسل.", compressionSuggested: "حجم الملف أكبر من 5 MB؛ يُنصح بالضغط.", strongCompressionWarning: "حجم الملف أكبر من 10 MB؛ يُنصح بشدة بالضغط.", animatedGif: "تمت قراءة الإطار الأول من GIF فقط في هذه المرحلة." },
  },
  de: {
    ratios: { original: "Originalformat", "1:1": "Quadrat 1:1", "4:3": "Querformat 4:3", "3:4": "Hochformat 3:4", "16:9": "Breit 16:9" },
    fits: { contain: "Einpassen", cover: "Ausfüllen" },
    positions: { center: "Mitte", top: "Oben", bottom: "Unten", left: "Links", right: "Rechts" },
    orientations: { square: "Quadratisch", portrait: "Hochformat", landscape: "Querformat" },
    stageStatuses: { notStarted: "Nicht gestartet", analyzing: "Analyse läuft", ready: "Bereit", warning: "Warnung", future: "Zukünftige Phase", needsReview: "Prüfung nötig" },
    itemStatuses: { analyzing: "Analyse läuft", ready: "Bereit", warning: "Warnung", approved: "Lokal freigegeben", needsReview: "Prüfung nötig" },
    warnings: { lowResolution: "Niedrige Auflösung: Die längste Seite liegt unter 800 px.", compressionSuggested: "Datei über 5 MB: Komprimierung empfohlen.", strongCompressionWarning: "Datei über 10 MB: Starke Komprimierung empfohlen.", animatedGif: "In dieser Phase wird nur das erste GIF-Bild geprüft." },
  },
  en: {
    ratios: { original: "Original ratio", "1:1": "Square 1:1", "4:3": "Landscape 4:3", "3:4": "Portrait 3:4", "16:9": "Wide 16:9" },
    fits: { contain: "Contain", cover: "Cover" },
    positions: { center: "Center", top: "Top", bottom: "Bottom", left: "Left", right: "Right" },
    orientations: { square: "Square", portrait: "Portrait", landscape: "Landscape" },
    stageStatuses: { notStarted: "Not started", analyzing: "Analyzing", ready: "Ready", warning: "Warning", future: "Future phase", needsReview: "Needs review" },
    itemStatuses: { analyzing: "Analyzing", ready: "Ready", warning: "Warning", approved: "Approved locally", needsReview: "Needs review" },
    warnings: { lowResolution: "Low resolution: the longest side is below 800px.", compressionSuggested: "File is above 5 MB; compression is recommended.", strongCompressionWarning: "File is above 10 MB; strong compression is recommended.", animatedGif: "Only the first GIF frame is inspected in this phase." },
  },
  fr: {
    ratios: { original: "Format original", "1:1": "Carré 1:1", "4:3": "Paysage 4:3", "3:4": "Portrait 3:4", "16:9": "Large 16:9" },
    fits: { contain: "Contenir", cover: "Couvrir" },
    positions: { center: "Centre", top: "Haut", bottom: "Bas", left: "Gauche", right: "Droite" },
    orientations: { square: "Carré", portrait: "Portrait", landscape: "Paysage" },
    stageStatuses: { notStarted: "Non démarré", analyzing: "Analyse en cours", ready: "Prêt", warning: "Avertissement", future: "Phase future", needsReview: "À vérifier" },
    itemStatuses: { analyzing: "Analyse en cours", ready: "Prêt", warning: "Avertissement", approved: "Approuvé localement", needsReview: "À vérifier" },
    warnings: { lowResolution: "Faible résolution : le côté le plus long fait moins de 800 px.", compressionSuggested: "Fichier supérieur à 5 Mo : compression recommandée.", strongCompressionWarning: "Fichier supérieur à 10 Mo : forte compression recommandée.", animatedGif: "Seule la première image GIF est inspectée durant cette phase." },
  },
} as const;

export const dekoBrainTranslations: Record<Lang, DekoBrainCopy> = {
  ar: {
    title: "🧠 مستشار DekoBrain", subtitle: "تحليل تقني محلي وشفاف للصور وتجهيزها للعرض على الموقع.", temporaryNotice: "الملفات في هذه المرحلة مؤقتة وستختفي بعد تحديث الصفحة.",
    uploadTitle: "اسحب الصور وأفلتها هنا", uploadHint: "أو انقر لاختيار صور متعددة من جهازك.", uploadFormats: "JPG وJPEG وPNG وWebP وGIF — حتى 20 صورة، و15 MB لكل صورة.", videoFuture: "دعم MP4 وWebM وMOV مخطط لمرحلة لاحقة.", selectFiles: "اختيار الصور", dropActive: "أفلت الصور لبدء التحليل المحلي",
    errors: { unsupported: "الملف {name} غير مدعوم.", tooLarge: "الملف {name} أكبر من 15 MB.", limit: "يمكن الاحتفاظ بحد أقصى 20 صورة.", unreadable: "تعذرت قراءة الصورة {name}." },
    mediaList: "قائمة الوسائط", emptyList: "لم تتم إضافة صور بعد.", warningCount: "{count} تحذير", preview: "معاينة العرض", previewRatio: "نسبة الإطار", fit: "طريقة الملاءمة", objectPosition: "موضع الصورة", analysis: "نتائج التحليل",
    fields: { filename: "اسم الملف", format: "الصيغة", dimensions: "الأبعاد الأصلية", aspectRatio: "نسبة الأبعاد", orientation: "الاتجاه", fileSize: "حجم الملف", megapixels: "الميغابكسل", transparency: "شفافية", score: "درجة الجودة التقنية", recommendedFit: "الملاءمة المقترحة", recommendedRatio: "نسبة البطاقة المقترحة", responsiveWidths: "المقاسات المتجاوبة المقترحة", warnings: "التحذيرات", aiStatus: "حالة الرؤية الذكية" },
    orientations: commonMappings.ar.orientations, ratios: commonMappings.ar.ratios, fits: commonMappings.ar.fits, positions: commonMappings.ar.positions,
    yes: "نعم", no: "لا", unknown: "غير معروف", noWarnings: "لا توجد تحذيرات تقنية.", warnings: commonMappings.ar.warnings,
    scoreExplanation: "تعتمد هذه الدرجة فقط على الدقة وحجم الملف وملاءمة النسبة والصيغة، ولا تقيم الجمال أو ملاءمة المنتج.", aiFuture: "لم يتم تحليل المنتج دلاليًا بعد. سيتم ربط رؤية الذكاء الاصطناعي في مرحلة لاحقة.", stagesTitle: "مراحل DekoBrain الإحدى عشرة", stageNames: stageNames.ar,
    stageDetails: { imported: "تم الاحتفاظ بالملف الأصلي في ذاكرة المتصفح.", safe: "الصيغة والحجم ضمن حدود المرحلة الأولى.", fileWarning: "الملف صالح مع وجود ملاحظة تقنية.", visionFuture: "يتطلب نموذج رؤية حقيقيًا في مرحلة لاحقة.", relevanceFuture: "لم يتم الحكم على ارتباط المحتوى بنشاط المنصة.", dimensionsReady: "تمت قراءة الأبعاد والاتجاه محليًا.", cropReady: "تم اقتراح إطار عرض وملاءمة دون تعديل الأصل.", backgroundFuture: "إزالة الخلفية ومعالجتها غير مفعلة بعد.", conversionUseful: "قد يستفيد JPG/PNG من WebP؛ لم يتم إنشاء ملف جديد.", conversionFuture: "التحويل والضغط غير مفعلين بعد.", responsiveReady: "تم اقتراح 320 و640 و960 و1200 بكسل.", studioFuture: "اعتمد المنتج الشفاف لبدء تركيب الخلفية النهائية.", enhancementFuture: "التحسين الذكي الحقيقي قادم لاحقًا." },
    stageStatuses: commonMappings.ar.stageStatuses, itemStatuses: commonMappings.ar.itemStatuses,
    actions: { analyze: "تحليل الملف", useAsIs: "استخدام كما هي", autoEnhance: "تحسين تلقائي", smartCrop: "قص ذكي", convertWebp: "تحويل إلى WebP", review: "إرسال للمراجعة", remove: "إزالة الملف" }, futureAction: "متاح في مرحلة DekoBrain التالية.", suggested: "القيم المقترحة", approvedMessage: "تم اعتماد الصورة محليًا كما هي.", reviewMessage: "تم وضع الصورة في حالة تحتاج مراجعة.",
  },
  de: {
    title: "🧠 DekoBrain Advisor", subtitle: "Lokale, transparente technische Bildanalyse für die Website-Darstellung.", temporaryNotice: "Dateien sind in dieser Phase temporär und verschwinden nach dem Neuladen.", uploadTitle: "Bilder hierher ziehen", uploadHint: "Oder klicken, um mehrere Bilder auszuwählen.", uploadFormats: "JPG, JPEG, PNG, WebP und GIF — maximal 20 Bilder und 15 MB je Bild.", videoFuture: "MP4-, WebM- und MOV-Unterstützung ist für eine spätere Phase geplant.", selectFiles: "Bilder auswählen", dropActive: "Bilder ablegen, um die lokale Analyse zu starten",
    errors: { unsupported: "Die Datei {name} wird nicht unterstützt.", tooLarge: "Die Datei {name} ist größer als 15 MB.", limit: "Es können höchstens 20 Bilder behalten werden.", unreadable: "Das Bild {name} konnte nicht gelesen werden." },
    mediaList: "Medienliste", emptyList: "Noch keine Bilder hinzugefügt.", warningCount: "{count} Warnungen", preview: "Darstellungsvorschau", previewRatio: "Rahmenformat", fit: "Einpassung", objectPosition: "Bildposition", analysis: "Analyseergebnisse",
    fields: { filename: "Dateiname", format: "Format", dimensions: "Originalabmessungen", aspectRatio: "Seitenverhältnis", orientation: "Ausrichtung", fileSize: "Dateigröße", megapixels: "Megapixel", transparency: "Transparenz", score: "Technischer Qualitätswert", recommendedFit: "Empfohlene Einpassung", recommendedRatio: "Empfohlenes Kartenformat", responsiveWidths: "Empfohlene responsive Breiten", warnings: "Warnungen", aiStatus: "KI-Sichtstatus" },
    orientations: commonMappings.de.orientations, ratios: commonMappings.de.ratios, fits: commonMappings.de.fits, positions: commonMappings.de.positions,
    yes: "Ja", no: "Nein", unknown: "Unbekannt", noWarnings: "Keine technischen Warnungen.", warnings: commonMappings.de.warnings,
    scoreExplanation: "Der Wert berücksichtigt nur Auflösung, Dateigröße, Seitenverhältnis und Format – nicht Gestaltung oder Produkteignung.", aiFuture: "Semantische Produkterkennung wurde noch nicht ausgeführt. KI-Vision folgt in einer späteren Phase.", stagesTitle: "Die elf DekoBrain-Stufen", stageNames: stageNames.de,
    stageDetails: { imported: "Die Originaldatei bleibt im Browserspeicher erhalten.", safe: "Format und Größe liegen innerhalb der Phase-1-Grenzen.", fileWarning: "Gültige Datei mit technischem Hinweis.", visionFuture: "Benötigt in einer späteren Phase ein echtes Vision-Modell.", relevanceFuture: "Die Plattformrelevanz wurde noch nicht beurteilt.", dimensionsReady: "Abmessungen und Ausrichtung wurden lokal gelesen.", cropReady: "Rahmen und Einpassung wurden ohne Änderung des Originals empfohlen.", backgroundFuture: "Hintergrundverarbeitung ist noch nicht aktiv.", conversionUseful: "JPG/PNG könnte von WebP profitieren; keine Datei wurde erzeugt.", conversionFuture: "Konvertierung und Komprimierung sind noch nicht aktiv.", responsiveReady: "320, 640, 960 und 1200 px wurden empfohlen.", studioFuture: "Transparentes Produkt freigeben, um die finale Hintergrundkomposition zu starten.", enhancementFuture: "Echte KI-Verbesserung folgt später." },
    stageStatuses: commonMappings.de.stageStatuses, itemStatuses: commonMappings.de.itemStatuses,
    actions: { analyze: "Datei analysieren", useAsIs: "Unverändert verwenden", autoEnhance: "Automatisch verbessern", smartCrop: "Intelligent zuschneiden", convertWebp: "In WebP umwandeln", review: "Zur Prüfung senden", remove: "Datei entfernen" }, futureAction: "In der nächsten DekoBrain-Phase verfügbar.", suggested: "Empfohlene Werte", approvedMessage: "Das Bild wurde lokal unverändert freigegeben.", reviewMessage: "Das Bild wurde zur Prüfung markiert.",
  },
  en: {
    title: "🧠 DekoBrain Advisor", subtitle: "Local, transparent technical image analysis for website display.", temporaryNotice: "Files in this phase are temporary and will disappear after refreshing the page.", uploadTitle: "Drag and drop images here", uploadHint: "Or click to select multiple images from your device.", uploadFormats: "JPG, JPEG, PNG, WebP and GIF — up to 20 images and 15 MB per image.", videoFuture: "MP4, WebM and MOV support is planned for a later phase.", selectFiles: "Select images", dropActive: "Drop images to start local analysis",
    errors: { unsupported: "The file {name} is unsupported.", tooLarge: "The file {name} is larger than 15 MB.", limit: "A maximum of 20 images can be kept.", unreadable: "The image {name} could not be read." },
    mediaList: "Media list", emptyList: "No images have been added yet.", warningCount: "{count} warnings", preview: "Display preview", previewRatio: "Frame ratio", fit: "Image fit", objectPosition: "Image position", analysis: "Analysis results",
    fields: { filename: "Filename", format: "Format", dimensions: "Original dimensions", aspectRatio: "Aspect ratio", orientation: "Orientation", fileSize: "File size", megapixels: "Megapixels", transparency: "Transparency", score: "Technical quality score", recommendedFit: "Recommended fit", recommendedRatio: "Recommended card ratio", responsiveWidths: "Recommended responsive widths", warnings: "Warnings", aiStatus: "AI vision status" },
    orientations: commonMappings.en.orientations, ratios: commonMappings.en.ratios, fits: commonMappings.en.fits, positions: commonMappings.en.positions,
    yes: "Yes", no: "No", unknown: "Unknown", noWarnings: "No technical warnings.", warnings: commonMappings.en.warnings,
    scoreExplanation: "This score only evaluates resolution, file size, aspect-ratio suitability and file format. It does not judge artistic quality or product suitability.", aiFuture: "Semantic product recognition has not been analyzed yet. AI vision will be connected in a later phase.", stagesTitle: "The eleven DekoBrain stages", stageNames: stageNames.en,
    stageDetails: { imported: "The original file is preserved in browser memory.", safe: "Format and size are within Phase 1 limits.", fileWarning: "The file is valid with a technical warning.", visionFuture: "A real vision model is required in a later phase.", relevanceFuture: "Platform activity relevance has not been judged.", dimensionsReady: "Dimensions and orientation were read locally.", cropReady: "A frame and fit were recommended without modifying the original.", backgroundFuture: "Background processing is not active yet.", conversionUseful: "JPG/PNG may benefit from WebP; no new file was generated.", conversionFuture: "Conversion and compression are not active yet.", responsiveReady: "320, 640, 960 and 1200px were recommended.", studioFuture: "Approve the transparent product to begin the final background composition.", enhancementFuture: "Real AI enhancement will come later." },
    stageStatuses: commonMappings.en.stageStatuses, itemStatuses: commonMappings.en.itemStatuses,
    actions: { analyze: "Analyze file", useAsIs: "Use as is", autoEnhance: "Auto enhance", smartCrop: "Smart crop", convertWebp: "Convert to WebP", review: "Send for review", remove: "Remove file" }, futureAction: "Available in the next DekoBrain phase.", suggested: "Suggested values", approvedMessage: "The image was approved locally as is.", reviewMessage: "The image was marked as needing review.",
  },
  fr: {
    title: "🧠 DekoBrain Advisor", subtitle: "Analyse technique locale et transparente des images pour leur affichage web.", temporaryNotice: "Les fichiers sont temporaires durant cette phase et disparaîtront après actualisation.", uploadTitle: "Glissez-déposez les images ici", uploadHint: "Ou cliquez pour sélectionner plusieurs images.", uploadFormats: "JPG, JPEG, PNG, WebP et GIF — 20 images maximum et 15 Mo par image.", videoFuture: "La prise en charge MP4, WebM et MOV est prévue pour une phase ultérieure.", selectFiles: "Sélectionner des images", dropActive: "Déposez les images pour lancer l’analyse locale",
    errors: { unsupported: "Le fichier {name} n’est pas pris en charge.", tooLarge: "Le fichier {name} dépasse 15 Mo.", limit: "Un maximum de 20 images peut être conservé.", unreadable: "L’image {name} n’a pas pu être lue." },
    mediaList: "Liste des médias", emptyList: "Aucune image ajoutée.", warningCount: "{count} avertissements", preview: "Aperçu d’affichage", previewRatio: "Format du cadre", fit: "Ajustement", objectPosition: "Position de l’image", analysis: "Résultats de l’analyse",
    fields: { filename: "Nom du fichier", format: "Format", dimensions: "Dimensions originales", aspectRatio: "Rapport d’aspect", orientation: "Orientation", fileSize: "Taille du fichier", megapixels: "Mégapixels", transparency: "Transparence", score: "Score de qualité technique", recommendedFit: "Ajustement recommandé", recommendedRatio: "Format de carte recommandé", responsiveWidths: "Largeurs responsives recommandées", warnings: "Avertissements", aiStatus: "État de la vision IA" },
    orientations: commonMappings.fr.orientations, ratios: commonMappings.fr.ratios, fits: commonMappings.fr.fits, positions: commonMappings.fr.positions,
    yes: "Oui", no: "Non", unknown: "Inconnu", noWarnings: "Aucun avertissement technique.", warnings: commonMappings.fr.warnings,
    scoreExplanation: "Ce score évalue uniquement la résolution, la taille, le rapport d’aspect et le format. Il ne juge ni l’esthétique ni la pertinence du produit.", aiFuture: "La reconnaissance sémantique du produit n’a pas encore été effectuée. La vision IA sera connectée ultérieurement.", stagesTitle: "Les onze étapes DekoBrain", stageNames: stageNames.fr,
    stageDetails: { imported: "Le fichier original reste conservé en mémoire du navigateur.", safe: "Le format et la taille respectent les limites de la phase 1.", fileWarning: "Le fichier est valide avec un avertissement technique.", visionFuture: "Un véritable modèle de vision sera requis ultérieurement.", relevanceFuture: "La pertinence pour la plateforme n’a pas été évaluée.", dimensionsReady: "Les dimensions et l’orientation ont été lues localement.", cropReady: "Un cadre et un ajustement sont proposés sans modifier l’original.", backgroundFuture: "Le traitement de l’arrière-plan n’est pas encore actif.", conversionUseful: "JPG/PNG pourrait bénéficier de WebP ; aucun fichier n’a été créé.", conversionFuture: "La conversion et la compression ne sont pas encore actives.", responsiveReady: "320, 640, 960 et 1200 px sont recommandés.", studioFuture: "Validez le produit transparent pour commencer la composition finale.", enhancementFuture: "L’amélioration IA réelle arrivera ultérieurement." },
    stageStatuses: commonMappings.fr.stageStatuses, itemStatuses: commonMappings.fr.itemStatuses,
    actions: { analyze: "Analyser le fichier", useAsIs: "Utiliser tel quel", autoEnhance: "Amélioration automatique", smartCrop: "Recadrage intelligent", convertWebp: "Convertir en WebP", review: "Envoyer en révision", remove: "Supprimer le fichier" }, futureAction: "Disponible dans la prochaine phase DekoBrain.", suggested: "Valeurs proposées", approvedMessage: "L’image a été approuvée localement telle quelle.", reviewMessage: "L’image a été marquée pour révision.",
  },
};

export function interpolateDekoBrainText(template: string, values: Record<string, string | number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, String(value)),
    template
  );
}
