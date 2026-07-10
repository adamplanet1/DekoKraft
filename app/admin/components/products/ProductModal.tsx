"use client";

import {
  type ChangeEvent,
  type DragEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { type Lang } from "../../config/translations";
import { buildLocalProductDraft } from "../../magic-engine/productEngine";
import {
  AutoFixPlanCard,
  CreatorWorkspacePreview,
  EstimatedTimeCard,
  MagicConfidenceCard,
  MagicCreatorSkeleton,
  MagicDashboard,
  MagicProgressCard,
  MagicRecommendationsCard,
  MarketPotentialCard,
  NextBestActionCard,
  OverallStatusCard,
  ProductHealthCard,
  PublishChecklistCard,
  PublishStatusCards,
} from "./magic-engine";
import {
  type AudienceReasonId,
  type AutoFixStatus,
  type BusinessRecommendationId,
  type BusinessRecommendationReasonId,
  type CompetitionLevel,
  type CompetitionReasonId,
  type DemandReasonId,
  buildMagicEnginePreviewState,
  type EstimatedTimeToPublishId,
  type FastSaleChance,
  type FastSaleReasonId,
  type MagicConfidenceLevel,
  type MarketAudienceId,
  type MarketDemandLevel,
  type MarketMarketplaceId,
  type MarketOpportunitySummaryId,
  type MarketingChannelId,
  type MarketingChannelReasonId,
  type MarketingTipId,
  type MarketingTipReasonId,
  type MarketplaceReasonId,
  type NextBestActionId,
  type PricingReasonId,
  type ProductHealthLevel,
  type PublishChecklistItemId,
  type RecommendationId,
  type RecommendationPriority,
} from "./magicEnginePreview";

type ProductModalProps = {
  open: boolean;
  onClose: () => void;
  lang: Lang;
};

type ImageRole =
  | ""
  | "main"
  | "gallery"
  | "colorGroup"
  | "aiReference"
  | "catalog"
  | "social";

type ProductTypeOption =
  | "educationalGame"
  | "woodenPuzzle"
  | "memoryGame"
  | "chessGame"
  | "customInstitutionalOrder"
  | "digitalFile"
  | "giftBox";

type TargetAudienceOption =
  | "children"
  | "autismCenter"
  | "school"
  | "kindergarten"
  | "specialEducation"
  | "family";

type EducationalSkillOption =
  | "memory"
  | "focus"
  | "matching"
  | "numbers"
  | "language"
  | "visualPerception"
  | "fineMotorSkills"
  | "logicalThinking";

type ProductionStatusOption =
  | "notStarted"
  | "inProduction"
  | "ready"
  | "paused";

type ManagedImage = {
  id: string;
  preview: string;
  role: ImageRole;
};

type AnalysisField =
  | "suggestedProductName"
  | "category"
  | "material"
  | "scent"
  | "dimensions"
  | "availableColors"
  | "suggestedKeywords"
  | "shortDescription"
  | "seoTitle"
  | "seoDescription"
  | "urlSlug"
  | "imageAltText";

type ProductCardField =
  | "productName"
  | "category"
  | "materials"
  | "scent"
  | "colors"
  | "price"
  | "shortDescription"
  | "seoTitle"
  | "seoDescription"
  | "urlSlug"
  | "imageAltText"
  | "tags";

type BlueprintSection =
  | "productIdentity"
  | "productDetails"
  | "marketing"
  | "seo"
  | "store";

type BlueprintField =
  | "productName"
  | "category"
  | "collection"
  | "productType"
  | "materials"
  | "dimensions"
  | "weight"
  | "scent"
  | "availableColors"
  | "shortDescription"
  | "longDescription"
  | "highlights"
  | "benefits"
  | "seoTitle"
  | "seoDescription"
  | "urlSlug"
  | "suggestedKeywords"
  | "imageAltText"
  | "tags"
  | "displayPriority"
  | "suggestedGalleryOrder";

type EngineStep =
  | "images"
  | "specifications"
  | "productUnderstanding"
  | "productCard"
  | "productBlueprint"
  | "productContent"
  | "seo"
  | "aiImages"
  | "readyToPublish";

type EngineStatus = "ready" | "waiting" | "notStarted";

const modalText: Record<
  Lang,
  {
    title: string;
    productName: string;
    category: string;
    productType: string;
    productTypePlaceholder: string;
    productTypes: Record<ProductTypeOption, string>;
    targetAudience: string;
    targetAudiencePlaceholder: string;
    targetAudiences: Record<TargetAudienceOption, string>;
    educationalSkills: string;
    educationalSkillsHelp: string;
    educationalSkillOptions: Record<EducationalSkillOption, string>;
    basicInformationSection: string;
    basicInformationHelp: string;
    educationalClassificationSection: string;
    educationalClassificationHelp: string;
    productDnaSection: string;
    sku: string;
    productCode: string;
    productVersion: string;
    manufacturingSection: string;
    manufacturingSectionHelp: string;
    material: string;
    thickness: string;
    dimensions: string;
    productionCountry: string;
    factoryLocation: string;
    inventorySection: string;
    inventorySectionHelp: string;
    stockQuantity: string;
    minimumStockAlert: string;
    productionStatus: string;
    productionStatusPlaceholder: string;
    productionStatuses: Record<ProductionStatusOption, string>;
    pricingPreparationSection: string;
    pricingPreparationSectionHelp: string;
    baseCost: string;
    suggestedPrice: string;
    institutionPrice: string;
    wholesalePrice: string;
    futureBarcodeSection: string;
    futureBarcodeSectionHelp: string;
    barcodeQrCode: string;
    barcodeQrCodeFutureNote: string;
    price: string;
    status: string;
    statusPlaceholder: string;
    active: string;
    draft: string;
    archived: string;
    productDescription: string;
    productDescriptionHelp: string;
    productDescriptionPlaceholder: string;
    analyzeSpecifications: string;
    analysisTitle: string;
    analysisConfidence: string;
    analysisPlaceholder: string;
    analysisFields: Record<AnalysisField, string>;
    buildProductCard: string;
    productCardPlaceholder: string;
    productCardFields: Record<ProductCardField, string>;
    generateBlueprint: string;
    blueprintPlaceholder: string;
    blueprintSections: Record<BlueprintSection, string>;
    blueprintFields: Record<BlueprintField, string>;
    engineTitle: string;
    engineSteps: Record<EngineStep, string>;
    engineStatuses: Record<EngineStatus, string>;
    enginePreviewStatuses: Record<EngineStatus, string>;
    magicEnginePreview: string;
    magicWebSummary: string;
    magicWebSummaryReadyTitle: string;
    magicWebSummaryReadyMessage: string;
    magicWebSummaryInProgressTitle: string;
    magicWebSummaryInProgressMessage: string;
    magicProgress: string;
    magicProgressHelp: string;
    productHealth: string;
    productHealthLevels: Record<ProductHealthLevel, string>;
    productHealthSummary: string;
    magicConfidence: string;
    magicConfidenceLabels: Record<MagicConfidenceLevel, string>;
    completionScore: string;
    estimatedTimeToPublish: string;
    estimatedTimeToPublishItems: Record<
      EstimatedTimeToPublishId,
      {
        time: string;
        explanation: string;
      }
    >;
    marketPotential: string;
    marketPotentialLabels: {
      opportunitySummary: string;
      marketingTip: string;
      marketingTipReason: string;
      marketingChannel: string;
      marketingChannelConfidence: string;
      marketingChannelWhy: string;
      competitionLevel: string;
      differentiationScore: string;
      competitionConfidence: string;
      competitionWhy: string;
      businessRecommendation: string;
      businessRecommendationConfidence: string;
      businessRecommendationWhy: string;
      magicScore: string;
      expectedDemand: string;
      primaryAudience: string;
      secondaryAudiences: string;
      predictionConfidence: string;
      why: string;
      bestMarketplace: string;
      alternativeMarketplaces: string;
      marketplaceConfidence: string;
      marketplaceWhy: string;
      recommendedPrice: string;
      aggressivePrice: string;
      premiumPrice: string;
      wholesalePrice: string;
      pricingConfidence: string;
      pricingWhy: string;
      demandConfidence: string;
      demandWhy: string;
      fastSaleConfidence: string;
      fastSaleWhy: string;
      chanceOfFastSale: string;
    };
    marketDemandLevels: Record<MarketDemandLevel, string>;
    marketAudiences: Record<MarketAudienceId, string>;
    audienceReasons: Record<AudienceReasonId, string>;
    demandReasons: Record<DemandReasonId, string>;
    marketMarketplaces: Record<MarketMarketplaceId, string>;
    marketplaceReasons: Record<MarketplaceReasonId, string>;
    pricingReasons: Record<PricingReasonId, string>;
    fastSaleChances: Record<FastSaleChance, string>;
    fastSaleReasons: Record<FastSaleReasonId, string>;
    marketOpportunitySummaries: Record<MarketOpportunitySummaryId, string>;
    marketingChannels: Record<MarketingChannelId, string>;
    marketingChannelReasons: Record<MarketingChannelReasonId, string>;
    competitionLevels: Record<CompetitionLevel, string>;
    competitionReasons: Record<CompetitionReasonId, string>;
    businessRecommendations: Record<BusinessRecommendationId, string>;
    businessRecommendationReasons: Record<BusinessRecommendationReasonId, string>;
    marketingTips: Record<MarketingTipId, string>;
    marketingTipReasons: Record<MarketingTipReasonId, string>;
    addPriceFirst: string;
    publishProgress: string;
    publishProgressHelp: string;
    publishChecklist: string;
    publishChecklistItems: Record<PublishChecklistItemId, string>;
    publishChecklistStatuses: {
      passed: string;
      pending: string;
    };
    publishDecision: string;
    publishReadyLabel: string;
    publishNotReadyLabel: string;
    publishReadyReason: string;
    publishMissingReason: string;
    publishSafety: string;
    publishSafetyCanPublish: string;
    publishSafetyBlocked: string;
    publishWarningTitle: string;
    publishWarningMessage: string;
    publishProduct: string;
    publishProductHelp: string;
    finalGateTitle: string;
    finalGateOpen: string;
    finalGateClosed: string;
    finalStampComplete: string;
    finalStampWaiting: string;
    publishCelebration: string;
    publishReadyBadge: string;
    publishNotReadyBadge: string;
    magicRecommendations: string;
    recommendationPriorities: Record<RecommendationPriority, string>;
    recommendations: Record<
      RecommendationId,
      {
        title: string;
        description: string;
      }
    >;
    autoFixPlan: string;
    autoFixStatuses: Record<AutoFixStatus, string>;
    autoFixPlanActions: Record<
      NextBestActionId,
      {
        label: string;
        description: string;
      }
    >;
    previewIcons: {
      passed: string;
      waiting: string;
      blocked: string;
      warning: string;
    };
    overallStatusTitle: string;
    overallStatusReady: string;
    overallStatusWaiting: string;
    nextBestActionTitle: string;
    nextBestActions: Record<
      NextBestActionId,
      {
        message: string;
        priority: RecommendationPriority;
      }
    >;
    rerunMagicEngine: string;
    rerunMagicEngineHelp: string;
    selectedColorsCount: string;
    uploadedImagesCount: string;
    completedSteps: string;
    waitingSteps: string;
    notStartedSteps: string;
    colors: string;
    chooseColors: string;
    customColor: string;
    customColorRequest: string;
    customColorRequestPlaceholder: string;
    images: string;
    imageHelp: string;
    uploadImages: string;
    imageRole: string;
    noImageRole: string;
    roles: Record<Exclude<ImageRole, "">, string>;
    cancel: string;
    save: string;
  }
> = {
  ar: {
    title: "إضافة منتج",
    productName: "اسم المنتج",
    category: "القسم",
    productType: "نوع المنتج",
    productTypePlaceholder: "اختر نوع المنتج",
    productTypes: {
      educationalGame: "لعبة تعليمية",
      woodenPuzzle: "لغز خشبي",
      memoryGame: "لعبة ذاكرة",
      chessGame: "لعبة شطرنج",
      customInstitutionalOrder: "طلب مؤسسي مخصص",
      digitalFile: "ملف رقمي",
      giftBox: "علبة هدايا",
    },
    targetAudience: "الجمهور المستهدف",
    targetAudiencePlaceholder: "اختر الجمهور المستهدف",
    targetAudiences: {
      children: "الأطفال",
      autismCenter: "مركز توحد",
      school: "مدرسة",
      kindergarten: "روضة أطفال",
      specialEducation: "تعليم خاص",
      family: "العائلة",
    },
    educationalSkills: "المهارات التعليمية",
    educationalSkillsHelp:
      "اختر المهارات التي يدعمها المنتج التعليمي أو التصنيعي.",
    educationalSkillOptions: {
      memory: "الذاكرة",
      focus: "التركيز",
      matching: "المطابقة",
      numbers: "الأرقام",
      language: "اللغة",
      visualPerception: "الإدراك البصري",
      fineMotorSkills: "المهارات الحركية الدقيقة",
      logicalThinking: "التفكير المنطقي",
    },
    basicInformationSection: "المعلومات الأساسية",
    basicInformationHelp:
      "عرّف المنتج بوضوح قبل ربطه بالتصنيع والمخزون والسعر.",
    educationalClassificationSection: "التصنيف التعليمي",
    educationalClassificationHelp:
      "حدد نوع المنتج والجمهور والمهارات التعليمية التي يدعمها.",
    productDnaSection: "هوية المنتج",
    sku: "SKU",
    productCode: "كود المنتج",
    productVersion: "إصدار المنتج",
    manufacturingSection: "بيانات التصنيع",
    manufacturingSectionHelp:
      "أضف بيانات المواد والأبعاد ومكان الإنتاج للتحضير للتصنيع.",
    material: "المادة",
    thickness: "السماكة",
    dimensions: "الأبعاد",
    productionCountry: "بلد الإنتاج",
    factoryLocation: "موقع المصنع",
    inventorySection: "المخزون",
    inventorySectionHelp:
      "تتبع الكمية والتنبيهات وحالة الإنتاج بدون ربط قاعدة بيانات الآن.",
    stockQuantity: "كمية المخزون",
    minimumStockAlert: "حد التنبيه الأدنى",
    productionStatus: "حالة الإنتاج",
    productionStatusPlaceholder: "اختر حالة الإنتاج",
    productionStatuses: {
      notStarted: "لم يبدأ",
      inProduction: "قيد الإنتاج",
      ready: "جاهز",
      paused: "متوقف مؤقتًا",
    },
    pricingPreparationSection: "تحضير التسعير",
    pricingPreparationSectionHelp:
      "حضّر تكاليف وأسعار البيع للمؤسسات والجملة قبل ربط الحسابات لاحقًا.",
    baseCost: "التكلفة الأساسية",
    suggestedPrice: "السعر المقترح",
    institutionPrice: "سعر المؤسسات",
    wholesalePrice: "سعر الجملة",
    futureBarcodeSection: "Barcode / QR مستقبلاً",
    futureBarcodeSectionHelp:
      "ملاحظة تحضيرية لمسح المنتج والمخزون والأسعار في الإصدارات القادمة.",
    barcodeQrCode: "دعم Barcode / QR Code",
    barcodeQrCodeFutureNote:
      "سيتم إضافة دعم Barcode / QR Code لاحقًا لمسح كود المنتج والسعر والتصنيف والمخزون.",
    price: "السعر",
    status: "الحالة",
    statusPlaceholder: "اختر الحالة",
    active: "نشط",
    draft: "مسودة",
    archived: "مؤرشف",
    productDescription: "وصف المنتج الذكي",
    productDescriptionHelp:
      "اكتب مواصفات المنتج بلغة طبيعية مثل المواد، المقاس، الاستخدام، الرائحة أو التفاصيل المهمة.",
    productDescriptionPlaceholder:
      "مثال: شمعة صويا معطرة بلون وردي، مناسبة للهدايا، بحجم متوسط وعلبة فاخرة...",
    analyzeSpecifications: "✨ تحليل المواصفات",
    analysisTitle: "🧠 فهم المنتج",
    analysisConfidence: "نسبة الثقة: سيتم حسابها لاحقًا",
    analysisPlaceholder: "سيتم توليده بالذكاء الاصطناعي",
    analysisFields: {
      suggestedProductName: "اسم المنتج المقترح",
      category: "التصنيف",
      material: "المادة",
      scent: "الرائحة",
      dimensions: "الأبعاد",
      availableColors: "الألوان المتاحة",
      suggestedKeywords: "الكلمات المفتاحية المقترحة",
      shortDescription: "وصف قصير",
      seoTitle: "عنوان SEO",
      seoDescription: "وصف SEO",
      urlSlug: "رابط URL",
      imageAltText: "النص البديل للصورة",
    },
    buildProductCard: "✨ إنشاء بطاقة المنتج",
    productCardPlaceholder: "سيتم إنشاؤه لاحقًا",
    productCardFields: {
      productName: "اسم المنتج",
      category: "التصنيف",
      materials: "المواد",
      scent: "الرائحة",
      colors: "الألوان",
      price: "السعر",
      shortDescription: "وصف قصير",
      seoTitle: "عنوان SEO",
      seoDescription: "وصف SEO",
      urlSlug: "رابط URL",
      imageAltText: "النص البديل للصورة",
      tags: "الوسوم",
    },
    generateBlueprint: "✨ إنشاء مخطط المنتج",
    blueprintPlaceholder: "سيتم إنشاؤه لاحقًا",
    blueprintSections: {
      productIdentity: "هوية المنتج",
      productDetails: "تفاصيل المنتج",
      marketing: "التسويق",
      seo: "SEO",
      store: "المتجر",
    },
    blueprintFields: {
      productName: "اسم المنتج",
      category: "التصنيف",
      collection: "المجموعة",
      productType: "نوع المنتج",
      materials: "المواد",
      dimensions: "الأبعاد",
      weight: "الوزن",
      scent: "الرائحة",
      availableColors: "الألوان المتاحة",
      shortDescription: "وصف قصير",
      longDescription: "وصف طويل",
      highlights: "النقاط البارزة",
      benefits: "الفوائد",
      seoTitle: "عنوان SEO",
      seoDescription: "وصف SEO",
      urlSlug: "رابط URL",
      suggestedKeywords: "الكلمات المفتاحية المقترحة",
      imageAltText: "النص البديل للصورة",
      tags: "الوسوم",
      displayPriority: "أولوية العرض",
      suggestedGalleryOrder: "ترتيب المعرض المقترح",
    },
    engineTitle: "محرك المنتج الذكي",
    engineSteps: {
      images: "الصور",
      specifications: "المواصفات",
      productUnderstanding: "فهم المنتج",
      productCard: "بطاقة المنتج",
      productBlueprint: "مخطط المنتج",
      productContent: "محتوى المنتج",
      seo: "SEO",
      aiImages: "صور الذكاء الاصطناعي",
      readyToPublish: "جاهز للنشر",
    },
    engineStatuses: {
      ready: "جاهز",
      waiting: "بانتظار",
      notStarted: "لم يبدأ",
    },
    enginePreviewStatuses: {
      ready: "مكتمل",
      waiting: "بانتظار",
      notStarted: "لم يبدأ",
    },
    magicEnginePreview: "معاينة محرك Magic",
    magicWebSummary: "ملخص Magic Web",
    magicWebSummaryReadyTitle: "Magic Web جاهز",
    magicWebSummaryReadyMessage: "المنتج جاهز للنشر.",
    magicWebSummaryInProgressTitle: "Magic Web قيد الإنجاز",
    magicWebSummaryInProgressMessage: "أكمل الخطوات الناقصة قبل النشر.",
    magicProgress: "تقدم Magic",
    magicProgressHelp: "اكتمل {completed} من {total} خطوات Magic.",
    productHealth: "صحة المنتج",
    productHealthLevels: {
      weak: "ضعيف",
      fair: "متوسط",
      good: "جيد",
      excellent: "ممتاز",
    },
    productHealthSummary:
      "صحة المنتج المحلية {level} بدرجة {score} من 100.",
    magicConfidence: "ثقة Magic",
    magicConfidenceLabels: {
      low: "منخفضة",
      medium: "متوسطة",
      high: "عالية",
      veryHigh: "عالية جدًا",
    },
    completionScore: "درجة الإكمال",
    estimatedTimeToPublish: "الوقت المتوقع للنشر",
    estimatedTimeToPublishItems: {
      ready: {
        time: "أقل من دقيقة",
        explanation: "كل فحوصات النشر الأساسية مكتملة.",
      },
      oneSmallItem: {
        time: "حوالي دقيقتين",
        explanation: "توجد خطوة صغيرة واحدة متبقية قبل المراجعة النهائية.",
      },
      mediumItems: {
        time: "حوالي 5 دقائق",
        explanation: "توجد بعض الخطوات المتوسطة لإكمال بيانات المنتج.",
      },
      severalItems: {
        time: "حوالي 10 دقائق",
        explanation: "توجد عدة حقول أو صور تحتاج إلى الإكمال.",
      },
      almostEmpty: {
        time: "حوالي 15 دقيقة أو أكثر",
        explanation: "المنتج شبه فارغ ويحتاج إلى إدخال البيانات الأساسية والصور.",
      },
    },
    marketPotential: "إمكانات السوق",
    marketPotentialLabels: {
      opportunitySummary: "ملخص فرصة السوق",
      marketingTip: "نصيحة تسويقية",
      marketingTipReason: "سبب النصيحة",
      marketingChannel: "قناة التسويق",
      marketingChannelConfidence: "ثقة القناة",
      marketingChannelWhy: "لماذا هذه القناة؟",
      competitionLevel: "مستوى المنافسة",
      differentiationScore: "درجة التميز",
      competitionConfidence: "ثقة المنافسة",
      competitionWhy: "لماذا هذه المنافسة؟",
      businessRecommendation: "توصية العمل",
      businessRecommendationConfidence: "ثقة التوصية",
      businessRecommendationWhy: "لماذا هذه التوصية؟",
      magicScore: "درجة Magic",
      expectedDemand: "الطلب المتوقع",
      primaryAudience: "الجمهور الأساسي",
      secondaryAudiences: "جماهير ثانوية",
      predictionConfidence: "ثقة التوقع",
      why: "لماذا؟",
      bestMarketplace: "أفضل سوق",
      alternativeMarketplaces: "أسواق بديلة",
      marketplaceConfidence: "ثقة السوق",
      marketplaceWhy: "لماذا هذا السوق؟",
      recommendedPrice: "السعر المقترح",
      aggressivePrice: "السعر التنافسي",
      premiumPrice: "السعر الممتاز",
      wholesalePrice: "سعر الجملة",
      pricingConfidence: "ثقة التسعير",
      pricingWhy: "لماذا هذا السعر؟",
      demandConfidence: "ثقة الطلب",
      demandWhy: "لماذا هذا الطلب؟",
      fastSaleConfidence: "ثقة البيع السريع",
      fastSaleWhy: "لماذا البيع السريع؟",
      chanceOfFastSale: "فرصة البيع السريع",
    },
    marketDemandLevels: {
      low: "منخفض",
      medium: "متوسط",
      high: "مرتفع",
      "very-high": "مرتفع جدًا",
    },
    marketAudiences: {
      "general-buyers": "المشترون العامون",
      "gift-buyers": "متسوقو الهدايا",
      parents: "الآباء والأمهات",
      teachers: "المعلمون",
      students: "الطلاب",
      "diy-makers": "صناع الأعمال اليدوية",
      hobbyists: "الهواة",
      collectors: "الجامعون",
      "home-decor": "محبو ديكور المنزل",
      wedding: "متسوقو حفلات الزفاف",
      repair: "مشترو الإصلاح",
      workshop: "أصحاب الورش",
      "small-business": "أصحاب الأعمال الصغيرة",
      artists: "الفنانون",
      "pet-lovers": "محبو الحيوانات الأليفة",
      "seasonal-buyers": "المتسوقون الموسميون",
    },
    audienceReasons: {
      "handmade-product": "منتج مصنوع يدويًا",
      "gift-category": "فئة الهدايا",
      "decorative-keywords": "تم رصد كلمات زخرفية",
      "educational-purpose": "تم رصد غرض تعليمي",
      "craft-keywords": "تم رصد كلمات حرفية",
      "tool-keywords": "تم رصد كلمات أدوات أو ورشة",
      "repair-keywords": "تم رصد كلمات إصلاح",
      "wedding-keywords": "تم رصد كلمات زفاف",
      "pet-keywords": "تم رصد كلمات للحيوانات الأليفة",
      "seasonal-keywords": "تم رصد كلمات موسمية",
      "business-keywords": "تم رصد كلمات للأعمال الصغيرة",
      "collector-keywords": "تم رصد كلمات للجامعين",
      "price-signal": "السعر يدعم هذا الجمهور",
      "general-match": "تطابق عام مع المنتج",
    },
    demandReasons: {
      "strong-product-health": "صحة المنتج قوية",
      "weak-product-health": "صحة المنتج منخفضة",
      "audience-confidence": "ثقة الجمهور مرتفعة",
      "marketplace-confidence": "ثقة السوق مرتفعة",
      "pricing-confidence": "ثقة التسعير مرتفعة",
      "price-missing": "السعر غير موجود",
      "image-ready": "الصور جاهزة",
      "image-missing": "الصور غير مكتملة",
      "seasonal-keywords": "تم رصد كلمات موسمية",
      "gift-keywords": "تم رصد كلمات هدايا",
      "decor-keywords": "تم رصد كلمات ديكور",
      "repair-keywords": "تم رصد كلمات إصلاح",
      "education-keywords": "تم رصد كلمات تعليمية",
    },
    marketMarketplaces: {
      etsy: "Etsy",
      ebay: "eBay",
      "amazon-handmade": "Amazon Handmade",
      kleinanzeigen: "Kleinanzeigen",
      "facebook-marketplace": "Facebook Marketplace",
      instagram: "Instagram",
      pinterest: "Pinterest",
      "local-marketplace": "سوق محلي",
      "own-shop": "المتجر الخاص",
    },
    marketplaceReasons: {
      "handmade-market-fit": "مناسب لأسواق المنتجات اليدوية",
      "decor-market-fit": "مناسب لفئات الديكور والهدايا",
      "repair-market-fit": "مناسب لقطع الإصلاح والأدوات",
      "visual-market-fit": "منتج بصري مناسب للمنصات الاجتماعية",
      "local-simple-product": "منتج بسيط أو منخفض السعر مناسب للبيع المحلي",
      "brand-ready-product": "المنتج جاهز نسبيًا لبناء علامة تجارية",
      "incomplete-product": "المنتج غير مكتمل ويفضل سوق محلي مبدئيًا",
      "audience-market-fit": "الجمهور المتوقع يناسب هذا السوق",
      "price-market-fit": "السعر يدعم هذا السوق",
    },
    pricingReasons: {
      "current-price-used": "تم استخدام السعر الحالي كأساس",
      "premium-supported": "الفئة تدعم سعرًا ممتازًا",
      "repair-practical-pricing": "قطع الإصلاح تحتاج تسعيرًا عمليًا",
      "low-health-confidence": "صحة المنتج المنخفضة تقلل الثقة",
      "marketplace-fit": "السوق المختار يدعم هذا التسعير",
      "audience-fit": "الجمهور المتوقع يدعم هذا التسعير",
      "missing-price": "أضف السعر أولاً",
    },
    fastSaleChances: {
      low: "منخفضة",
      medium: "متوسطة",
      high: "عالية",
      "very-high": "عالية جدًا",
    },
    fastSaleReasons: {
      "publish-ready": "المنتج جاهز للنشر",
      "not-publish-ready": "المنتج غير جاهز للنشر",
      "strong-demand": "الطلب المتوقع قوي",
      "weak-demand": "الطلب المتوقع ضعيف",
      "marketplace-confidence": "ثقة السوق مرتفعة",
      "pricing-confidence": "ثقة التسعير مرتفعة",
      "image-ready": "الصور جاهزة",
      "image-missing": "الصور غير مكتملة",
      "price-present": "السعر موجود",
      "price-missing": "السعر غير موجود",
      "gift-decor-keywords": "تم رصد كلمات هدايا أو ديكور",
      "repair-keywords": "تم رصد كلمات إصلاح",
      "education-keywords": "تم رصد كلمات تعليمية",
      "strong-product-health": "صحة المنتج قوية",
      "weak-product-health": "صحة المنتج منخفضة",
    },
    marketOpportunitySummaries: {
      "strong-opportunity":
        "فرصة قوية لـ {audience} على {marketplace} مع احتمال بيع سريع {fastSaleChance}.",
      "moderate-opportunity":
        "فرصة متوسطة؛ حسّن صور المنتج والتسعير قبل النشر.",
      "low-opportunity":
        "فرصة منخفضة حتى تكتمل أساسيات المنتج الناقصة.",
    },
    marketingChannels: {
      "instagram-reels": "Instagram Reels",
      pinterest: "Pinterest",
      "facebook-groups": "مجموعات Facebook",
      "facebook-marketplace": "Facebook Marketplace",
      "etsy-search": "بحث Etsy",
      "ebay-search": "بحث eBay",
      whatsapp: "WhatsApp",
      "own-shop-content": "محتوى المتجر الخاص",
      "local-community": "المجتمع المحلي",
    },
    marketingChannelReasons: {
      "visual-product": "المنتج بصري ويناسب المحتوى القصير.",
      "repair-search": "المنتج يعتمد على بحث واضح لحالة الإصلاح.",
      "education-community": "الجمهور التعليمي يتفاعل داخل المجتمعات.",
      "local-simple-product": "المنتج مناسب للبيع المحلي أو المباشر.",
      "own-shop-ready": "المنتج قوي بما يكفي لمحتوى المتجر الخاص.",
      "etsy-marketplace-fit": "السوق المتوقع يعتمد على البحث داخل Etsy.",
      "direct-local-sharing": "المشاركة المباشرة مناسبة كبداية.",
    },
    competitionLevels: {
      low: "منخفض",
      medium: "متوسط",
      high: "مرتفع",
    },
    competitionReasons: {
      "personalization-detected": "تم رصد تخصيص أو أسماء.",
      "handmade-differentiation": "الطابع اليدوي يزيد التميز.",
      "repair-part-niche": "منتج إصلاح أو قطعة بديلة أكثر تخصصًا.",
      "educational-niche": "الاستخدام التعليمي يجعل الجمهور أوضح.",
      "decorative-common": "منتجات الديكور عادةً أكثر منافسة.",
      "customizable-option": "خيارات التخصيص ترفع التميز.",
      "niche-keywords": "تم رصد كلمات متخصصة.",
      "broad-category": "الفئة عامة ولا تظهر إشارات تميز كافية.",
    },
    businessRecommendations: {
      "publish-now": "انشر الآن",
      "improve-product-first": "حسّن المنتج أولًا",
      "add-price-first": "أضف السعر أولًا",
      "improve-images-first": "حسّن الصور أولًا",
      "focus-on-etsy": "ركّز على Etsy",
      "focus-on-ebay": "ركّز على eBay",
      "focus-on-instagram": "ركّز على Instagram",
      "lower-price": "خفّض السعر",
      "premium-positioning": "استخدم تموضعًا ممتازًا",
      "niche-positioning": "استخدم تموضعًا متخصصًا",
    },
    businessRecommendationReasons: {
      "missing-price": "السعر مطلوب قبل اتخاذ قرار العمل.",
      "image-readiness": "الصور أو الصورة الرئيسية تحتاج إلى تحسين.",
      "strong-demand": "الطلب والبيع السريع يظهران فرصة قوية.",
      "weak-market-readiness": "جاهزية السوق تحتاج إلى تحسين قبل النشر.",
      "marketplace-fit": "السوق المتوقع مناسب لهذا المنتج.",
      "repair-market-fit": "منتجات الإصلاح تناسب أسواق البحث العملي.",
      "visual-channel-fit": "المنتج بصري ويناسب القنوات الاجتماعية.",
      "pricing-pressure": "المنافسة تضغط على السعر.",
      "premium-fit": "إشارات التميز تدعم تموضعًا ممتازًا.",
      "niche-advantage": "التخصص يمنح المنتج ميزة أوضح.",
    },
    marketingTips: {
      "add-basics-first": "أضف السعر والصورة الرئيسية قبل التسويق.",
      "gift-lifestyle-photos": "اعرض المنتج كفكرة هدية مع 3 صور نمط حياة.",
      "repair-use-case": "اعرض حالة الإصلاح بوضوح واذكر القطع المتوافقة.",
      "pinterest-home-decor": "استخدم صورًا بأسلوب Pinterest واستهدف محبي ديكور المنزل.",
      "education-classroom": "اعرض طريقة استخدام المنتج في التعليم أو الفصل.",
      "marketplace-story": "اكتب قصة قصيرة تناسب السوق والجمهور المتوقع.",
      "premium-brand-story": "اعرض المنتج بقصة علامة تجارية وصور عالية الجودة.",
    },
    marketingTipReasons: {
      "missing-price-or-image": "التسويق يحتاج السعر والصورة الرئيسية أولاً.",
      "gift-audience": "الجمهور المتوقع يهتم بالهدايا أو الشراء السريع.",
      "repair-audience": "الجمهور يحتاج رؤية حالة الاستخدام والإصلاح.",
      "visual-marketplace": "السوق المختار يعتمد على الصور القوية.",
      "education-audience": "الجمهور المتوقع تعليمي.",
      "marketplace-match": "النصيحة تطابق السوق والجمهور المتوقع.",
      "premium-opportunity": "المنتج قوي بما يكفي لعرض مميز.",
    },
    addPriceFirst: "أضف السعر أولاً",
    publishProgress: "تقدم النشر",
    publishProgressHelp: "اكتمل {passed} من {total} عناصر فحص النشر.",
    publishChecklist: "قائمة فحص النشر",
    publishChecklistItems: {
      "has-product-name": "اسم المنتج موجود",
      "has-category": "التصنيف موجود",
      "has-price": "السعر موجود",
      "has-description": "الوصف موجود",
      "has-at-least-one-image": "توجد صورة واحدة على الأقل",
      "has-main-image": "الصورة الرئيسية موجودة",
      "product-health-is-good": "صحة المنتج جيدة",
      "no-high-priority-recommendations": "لا توجد توصيات عالية الأولوية",
    },
    publishChecklistStatuses: {
      passed: "مكتمل",
      pending: "بانتظار",
    },
    publishDecision: "قرار النشر",
    publishReadyLabel: "جاهز للنشر",
    publishNotReadyLabel: "ليس جاهزًا بعد",
    publishReadyReason: "تم اجتياز كل عناصر فحص النشر.",
    publishMissingReason: "أول عنصر ناقص: {itemLabel}",
    publishSafety: "أمان النشر",
    publishSafetyCanPublish: "يمكن المتابعة إلى النشر.",
    publishSafetyBlocked: "النشر متوقف حتى تكتمل المتطلبات.",
    publishWarningTitle: "تحذير النشر",
    publishWarningMessage: "لا تنشر المنتج قبل إكمال العناصر الناقصة.",
    publishProduct: "نشر المنتج",
    publishProductHelp: "هذا زر تجريبي فقط، لا يتم النشر فعليًا الآن.",
    finalGateTitle: "البوابة النهائية",
    finalGateOpen: "البوابة النهائية مفتوحة.",
    finalGateClosed: "البوابة النهائية مغلقة حتى يكتمل المنتج.",
    finalStampComplete: "✅ Magic Web مكتمل",
    finalStampWaiting: "⏳ Magic Web ينتظر الإكمال",
    publishCelebration: "🎉 المنتج جاهز للظهور في المتجر.",
    publishReadyBadge: "✅ جاهز للنشر",
    publishNotReadyBadge: "⏳ غير جاهز بعد",
    magicRecommendations: "توصيات Magic",
    recommendationPriorities: {
      high: "عالية",
      medium: "متوسطة",
      low: "منخفضة",
    },
    recommendations: {
      "no-images-uploaded": {
        title: "لم يتم رفع صور.",
        description: "ارفع صورة منتج واحدة على الأقل قبل النشر.",
      },
      "add-main-product-image": {
        title: "أضف صورة رئيسية واحدة على الأقل للمنتج.",
        description: "حدد إحدى الصور المرفوعة كصورة المنتج الرئيسية.",
      },
      "description-too-short": {
        title: "الوصف قصير جدًا.",
        description: "أضف المزيد من مواصفات المنتج لتحسين المسودة.",
      },
      "missing-category": {
        title: "المنتج بلا تصنيف.",
        description: "اختر تصنيفًا حتى يمكن تنظيم المنتج.",
      },
      "missing-price": {
        title: "المنتج بلا سعر.",
        description: "أضف سعرًا قبل أن يصبح المنتج جاهزًا للبيع.",
      },
      "more-gallery-images": {
        title: "يوصى بإضافة المزيد من صور المعرض.",
        description: "أضف أو حدد المزيد من الصور كصور معرض.",
      },
      "add-seo-keywords": {
        title: "أضف كلمات SEO المفتاحية.",
        description: "ستساعد كلمات SEO المفتاحية في تجهيز المنتج للبحث.",
      },
      "add-image-alt-text": {
        title: "أضف النص البديل للصورة.",
        description: "النص البديل للصورة يحسن الوصول وجاهزية SEO.",
      },
      "product-card-ready": {
        title: "بطاقة المنتج جاهزة.",
        description: "تحتوي المسودة المحلية على بيانات كافية لمعاينة بطاقة المنتج.",
      },
      "product-can-be-published": {
        title: "يمكن نشر المنتج.",
        description: "تحتوي المسودة المحلية على الحد الأدنى من إشارات الجاهزية للنشر.",
      },
      "product-health-below-good": {
        title: "حسّن جودة المنتج قبل النشر.",
        description: "ارفع صحة المنتج إلى جيد أو ممتاز قبل المراجعة النهائية.",
      },
      "ready-for-final-review": {
        title: "المنتج جاهز للمراجعة النهائية.",
        description: "اكتملت الحقول المطلوبة ويمكن مراجعة المنتج قبل النشر.",
      },
    },
    autoFixPlan: "خطة الإصلاح التلقائي",
    autoFixStatuses: {
      suggested: "مقترح",
      notAvailable: "غير متاح",
    },
    autoFixPlanActions: {
      "add-product-name": {
        label: "أضف اسم المنتج يدويًا",
        description: "اكتب اسمًا واضحًا للمنتج حتى تكتمل بياناته الأساسية.",
      },
      "choose-category": {
        label: "اختر التصنيف يدويًا",
        description: "حدد التصنيف المناسب لتنظيم المنتج في المتجر.",
      },
      "improve-description": {
        label: "حسّن الوصف",
        description: "أضف وصفًا أطول يتضمن تفاصيل المنتج المهمة.",
      },
      "add-price": {
        label: "أضف السعر",
        description: "أدخل سعر المنتج قبل المتابعة إلى المراجعة النهائية.",
      },
      "upload-product-image": {
        label: "ارفع صورة المنتج",
        description: "أضف صورة واحدة على الأقل لعرض المنتج بوضوح.",
      },
      "select-main-image": {
        label: "حدد صورة كصورة رئيسية",
        description: "اختر إحدى الصور المرفوعة لتكون الصورة الرئيسية.",
      },
      "improve-product-details": {
        label: "أكمل تفاصيل المنتج",
        description: "أكمل البيانات والصور المطلوبة لرفع صحة المنتج.",
      },
      "ready-for-final-review": {
        label: "جاهز للمراجعة النهائية",
        description: "لا توجد خطوات إصلاح مطلوبة حاليًا.",
      },
    },
    previewIcons: {
      passed: "✅",
      waiting: "⏳",
      blocked: "⛔",
      warning: "⚠️",
    },
    overallStatusTitle: "الحالة النهائية",
    overallStatusReady: "✅ جميع فحوصات Magic اكتملت والمنتج جاهز.",
    overallStatusWaiting: "⏳ ما زالت هناك خطوات مطلوبة قبل النشر.",
    nextBestActionTitle: "أفضل إجراء تالٍ",
    nextBestActions: {
      "add-product-name": {
        message: "أضف اسم المنتج للمتابعة.",
        priority: "high",
      },
      "choose-category": {
        message: "اختر تصنيف المنتج.",
        priority: "high",
      },
      "improve-description": {
        message: "حسّن وصف المنتج وأضف تفاصيل كافية.",
        priority: "medium",
      },
      "add-price": {
        message: "أضف سعر المنتج.",
        priority: "high",
      },
      "upload-product-image": {
        message: "ارفع صورة واحدة على الأقل للمنتج.",
        priority: "high",
      },
      "select-main-image": {
        message: "حدد صورة رئيسية للمنتج.",
        priority: "high",
      },
      "improve-product-details": {
        message: "حسّن تفاصيل المنتج لرفع صحة المنتج إلى جيد.",
        priority: "medium",
      },
      "ready-for-final-review": {
        message: "المنتج جاهز للمراجعة النهائية.",
        priority: "low",
      },
    },
    rerunMagicEngine: "إعادة تشغيل محرك Magic",
    rerunMagicEngineHelp: "يعيد حساب حالة الخطوات من البيانات الحالية.",
    selectedColorsCount: "عدد الألوان المختارة",
    uploadedImagesCount: "عدد الصور المرفوعة",
    completedSteps: "الخطوات المكتملة",
    waitingSteps: "الخطوات المنتظرة",
    notStartedSteps: "الخطوات التي لم تبدأ",
    colors: "الألوان",
    chooseColors: "اختر الألوان",
    customColor: "لون مخصص",
    customColorRequest: "طلب لون خاص",
    customColorRequestPlaceholder: "مثال: لون مطابق لعينة العميل أو درجة محددة",
    images: "الصور",
    imageHelp: "اختر من 3 إلى 4 صور",
    uploadImages: "رفع الصور",
    imageRole: "دور الصورة",
    noImageRole: "بدون دور",
    roles: {
      main: "الصورة الرئيسية",
      gallery: "صورة المعرض",
      colorGroup: "صورة مجموعة ألوان",
      aiReference: "صورة مرجعية للذكاء الاصطناعي",
      catalog: "صورة الكتالوج",
      social: "صورة وسائل التواصل",
    },
    cancel: "إلغاء",
    save: "حفظ",
  },
  en: {
    title: "Add Product",
    productName: "Product name",
    category: "Category",
    productType: "Product type",
    productTypePlaceholder: "Select product type",
    productTypes: {
      educationalGame: "Educational Game",
      woodenPuzzle: "Wooden Puzzle",
      memoryGame: "Memory Game",
      chessGame: "Chess Game",
      customInstitutionalOrder: "Custom Institutional Order",
      digitalFile: "Digital File",
      giftBox: "Gift Box",
    },
    targetAudience: "Target audience",
    targetAudiencePlaceholder: "Select target audience",
    targetAudiences: {
      children: "Children",
      autismCenter: "Autism Center",
      school: "School",
      kindergarten: "Kindergarten",
      specialEducation: "Special Education",
      family: "Family",
    },
    educationalSkills: "Educational skills",
    educationalSkillsHelp:
      "Select the skills supported by this educational or manufacturing product.",
    educationalSkillOptions: {
      memory: "Memory",
      focus: "Focus",
      matching: "Matching",
      numbers: "Numbers",
      language: "Language",
      visualPerception: "Visual Perception",
      fineMotorSkills: "Fine Motor Skills",
      logicalThinking: "Logical Thinking",
    },
    basicInformationSection: "Basic Information",
    basicInformationHelp:
      "Define the product clearly before connecting manufacturing, inventory, and pricing.",
    educationalClassificationSection: "Educational Classification",
    educationalClassificationHelp:
      "Set the product type, audience, and educational skills this product supports.",
    productDnaSection: "Product DNA",
    sku: "SKU",
    productCode: "Product Code",
    productVersion: "Product Version",
    manufacturingSection: "Manufacturing",
    manufacturingSectionHelp:
      "Add material, dimensions, and production location details for future manufacturing.",
    material: "Material",
    thickness: "Thickness",
    dimensions: "Dimensions",
    productionCountry: "Production Country",
    factoryLocation: "Factory Location",
    inventorySection: "Inventory",
    inventorySectionHelp:
      "Prepare stock quantity, alerts, and production status without database changes.",
    stockQuantity: "Stock Quantity",
    minimumStockAlert: "Minimum Stock Alert",
    productionStatus: "Production Status",
    productionStatusPlaceholder: "Select production status",
    productionStatuses: {
      notStarted: "Not Started",
      inProduction: "In Production",
      ready: "Ready",
      paused: "Paused",
    },
    pricingPreparationSection: "Pricing Preparation",
    pricingPreparationSectionHelp:
      "Prepare cost and selling prices for retail, institutions, and wholesale.",
    baseCost: "Base Cost",
    suggestedPrice: "Suggested Price",
    institutionPrice: "Institution Price",
    wholesalePrice: "Wholesale Price",
    futureBarcodeSection: "Future Barcode / QR",
    futureBarcodeSectionHelp:
      "Preparation note for scanning product code, stock, pricing, and category later.",
    barcodeQrCode: "Barcode / QR Code Support",
    barcodeQrCodeFutureNote:
      "Barcode / QR Code support will be added later for scanning product code, price, category, and stock.",
    price: "Price",
    status: "Status",
    statusPlaceholder: "Select status",
    active: "Active",
    draft: "Draft",
    archived: "Archived",
    productDescription: "Smart product description",
    productDescriptionHelp:
      "Write product specifications in natural language, such as materials, size, usage, scent, or important details.",
    productDescriptionPlaceholder:
      "Example: Pink scented soy candle, gift-ready, medium size, premium box...",
    analyzeSpecifications: "✨ Analyze Specifications",
    analysisTitle: "🧠 Product Understanding",
    analysisConfidence: "Confidence: will be calculated later",
    analysisPlaceholder: "Will be generated by AI",
    analysisFields: {
      suggestedProductName: "Suggested Product Name",
      category: "Category",
      material: "Material",
      scent: "Scent",
      dimensions: "Dimensions",
      availableColors: "Available Colors",
      suggestedKeywords: "Suggested Keywords",
      shortDescription: "Short Description",
      seoTitle: "SEO Title",
      seoDescription: "SEO Description",
      urlSlug: "URL Slug",
      imageAltText: "Image ALT Text",
    },
    buildProductCard: "✨ Build Product Card",
    productCardPlaceholder: "Will be created later",
    productCardFields: {
      productName: "Product Name",
      category: "Category",
      materials: "Materials",
      scent: "Scent",
      colors: "Colors",
      price: "Price",
      shortDescription: "Short Description",
      seoTitle: "SEO Title",
      seoDescription: "SEO Description",
      urlSlug: "URL Slug",
      imageAltText: "Image ALT Text",
      tags: "Tags",
    },
    generateBlueprint: "✨ Generate Product Blueprint",
    blueprintPlaceholder: "Will be created later",
    blueprintSections: {
      productIdentity: "Product Identity",
      productDetails: "Product Details",
      marketing: "Marketing",
      seo: "SEO",
      store: "Store",
    },
    blueprintFields: {
      productName: "Product Name",
      category: "Category",
      collection: "Collection",
      productType: "Product Type",
      materials: "Materials",
      dimensions: "Dimensions",
      weight: "Weight",
      scent: "Scent",
      availableColors: "Available Colors",
      shortDescription: "Short Description",
      longDescription: "Long Description",
      highlights: "Highlights",
      benefits: "Benefits",
      seoTitle: "SEO Title",
      seoDescription: "SEO Description",
      urlSlug: "URL Slug",
      suggestedKeywords: "Suggested Keywords",
      imageAltText: "Image ALT Text",
      tags: "Tags",
      displayPriority: "Display Priority",
      suggestedGalleryOrder: "Suggested Gallery Order",
    },
    engineTitle: "Smart Product Engine",
    engineSteps: {
      images: "Images",
      specifications: "Specifications",
      productUnderstanding: "Product Understanding",
      productCard: "Product Card",
      productBlueprint: "Product Blueprint",
      productContent: "Product Content",
      seo: "SEO",
      aiImages: "AI Images",
      readyToPublish: "Ready to Publish",
    },
    engineStatuses: {
      ready: "Ready",
      waiting: "Waiting",
      notStarted: "Not started",
    },
    enginePreviewStatuses: {
      ready: "Completed",
      waiting: "Waiting",
      notStarted: "Not started",
    },
    magicEnginePreview: "Magic Engine Preview",
    magicWebSummary: "Magic Web Summary",
    magicWebSummaryReadyTitle: "Magic Web Ready",
    magicWebSummaryReadyMessage: "Product is ready for publishing.",
    magicWebSummaryInProgressTitle: "Magic Web In Progress",
    magicWebSummaryInProgressMessage:
      "Complete the missing steps before publishing.",
    magicProgress: "Magic Progress",
    magicProgressHelp: "{completed} of {total} Magic steps completed.",
    productHealth: "Product Health",
    productHealthLevels: {
      weak: "Weak",
      fair: "Fair",
      good: "Good",
      excellent: "Excellent",
    },
    productHealthSummary:
      "Local product health is {level} with a score of {score}/100.",
    magicConfidence: "Magic Confidence",
    magicConfidenceLabels: {
      low: "Low",
      medium: "Medium",
      high: "High",
      veryHigh: "Very High",
    },
    completionScore: "Completion Score",
    estimatedTimeToPublish: "Estimated Time to Publish",
    estimatedTimeToPublishItems: {
      ready: {
        time: "Less than 1 minute",
        explanation: "All core publish checks are complete.",
      },
      oneSmallItem: {
        time: "About 2 minutes",
        explanation: "One small step remains before final review.",
      },
      mediumItems: {
        time: "About 5 minutes",
        explanation: "A few medium steps are needed to complete the product.",
      },
      severalItems: {
        time: "About 10 minutes",
        explanation: "Several fields or images still need completion.",
      },
      almostEmpty: {
        time: "About 15+ minutes",
        explanation:
          "The product is almost empty and needs core details and images.",
      },
    },
    marketPotential: "Market Potential",
    marketPotentialLabels: {
      opportunitySummary: "Market Opportunity Summary",
      marketingTip: "Marketing Tip",
      marketingTipReason: "Tip Reason",
      marketingChannel: "Marketing Channel",
      marketingChannelConfidence: "Channel Confidence",
      marketingChannelWhy: "Why this channel?",
      competitionLevel: "Competition Level",
      differentiationScore: "Differentiation Score",
      competitionConfidence: "Competition Confidence",
      competitionWhy: "Why this competition?",
      businessRecommendation: "Business Recommendation",
      businessRecommendationConfidence: "Recommendation Confidence",
      businessRecommendationWhy: "Why this recommendation?",
      magicScore: "Magic Score",
      expectedDemand: "Expected Demand",
      primaryAudience: "Primary Audience",
      secondaryAudiences: "Secondary Audiences",
      predictionConfidence: "Prediction Confidence",
      why: "Why?",
      bestMarketplace: "Best Marketplace",
      alternativeMarketplaces: "Alternative Marketplaces",
      marketplaceConfidence: "Marketplace Confidence",
      marketplaceWhy: "Why this marketplace?",
      recommendedPrice: "Recommended Price",
      aggressivePrice: "Aggressive Price",
      premiumPrice: "Premium Price",
      wholesalePrice: "Wholesale Price",
      pricingConfidence: "Pricing Confidence",
      pricingWhy: "Why this price?",
      demandConfidence: "Demand Confidence",
      demandWhy: "Why this demand?",
      fastSaleConfidence: "Fast Sale Confidence",
      fastSaleWhy: "Why fast sale?",
      chanceOfFastSale: "Chance of Fast Sale",
    },
    marketDemandLevels: {
      low: "Low",
      medium: "Medium",
      high: "High",
      "very-high": "Very High",
    },
    marketAudiences: {
      "general-buyers": "General buyers",
      "gift-buyers": "Gift buyers",
      parents: "Parents",
      teachers: "Teachers",
      students: "Students",
      "diy-makers": "DIY makers",
      hobbyists: "Hobbyists",
      collectors: "Collectors",
      "home-decor": "Home decor buyers",
      wedding: "Wedding shoppers",
      repair: "Repair buyers",
      workshop: "Workshop buyers",
      "small-business": "Small business owners",
      artists: "Artists",
      "pet-lovers": "Pet lovers",
      "seasonal-buyers": "Seasonal buyers",
    },
    audienceReasons: {
      "handmade-product": "Handmade product",
      "gift-category": "Gift category",
      "decorative-keywords": "Decorative keywords detected",
      "educational-purpose": "Educational purpose detected",
      "craft-keywords": "Craft keywords detected",
      "tool-keywords": "Tool or workshop keywords detected",
      "repair-keywords": "Repair keywords detected",
      "wedding-keywords": "Wedding keywords detected",
      "pet-keywords": "Pet keywords detected",
      "seasonal-keywords": "Seasonal keywords detected",
      "business-keywords": "Small business keywords detected",
      "collector-keywords": "Collector keywords detected",
      "price-signal": "Price supports this audience",
      "general-match": "General product match",
    },
    demandReasons: {
      "strong-product-health": "Strong Product Health",
      "weak-product-health": "Weak Product Health",
      "audience-confidence": "High audience confidence",
      "marketplace-confidence": "High marketplace confidence",
      "pricing-confidence": "High pricing confidence",
      "price-missing": "Price is missing",
      "image-ready": "Images are ready",
      "image-missing": "Images are incomplete",
      "seasonal-keywords": "Seasonal keywords detected",
      "gift-keywords": "Gift keywords detected",
      "decor-keywords": "Decor keywords detected",
      "repair-keywords": "Repair keywords detected",
      "education-keywords": "Education keywords detected",
    },
    marketMarketplaces: {
      etsy: "Etsy",
      ebay: "eBay",
      "amazon-handmade": "Amazon Handmade",
      kleinanzeigen: "Kleinanzeigen",
      "facebook-marketplace": "Facebook Marketplace",
      instagram: "Instagram",
      pinterest: "Pinterest",
      "local-marketplace": "Local marketplace",
      "own-shop": "Own shop",
    },
    marketplaceReasons: {
      "handmade-market-fit": "Fits handmade marketplaces",
      "decor-market-fit": "Fits decor and gift categories",
      "repair-market-fit": "Fits repair parts and tools",
      "visual-market-fit": "Visual product fit for social platforms",
      "local-simple-product": "Simple or low-price product fits local selling",
      "brand-ready-product": "Product is strong enough for a branded shop",
      "incomplete-product": "Incomplete product fits local marketplace first",
      "audience-market-fit": "Predicted audience fits this marketplace",
      "price-market-fit": "Price supports this marketplace",
    },
    pricingReasons: {
      "current-price-used": "Current price used as the base",
      "premium-supported": "Category can support premium pricing",
      "repair-practical-pricing": "Repair parts favor practical pricing",
      "low-health-confidence": "Low Product Health reduces confidence",
      "marketplace-fit": "Selected marketplace supports this pricing",
      "audience-fit": "Predicted audience supports this pricing",
      "missing-price": "Add price first",
    },
    fastSaleChances: {
      low: "Low",
      medium: "Medium",
      high: "High",
      "very-high": "Very High",
    },
    fastSaleReasons: {
      "publish-ready": "Product is ready to publish",
      "not-publish-ready": "Product is not ready to publish",
      "strong-demand": "Expected demand is strong",
      "weak-demand": "Expected demand is weak",
      "marketplace-confidence": "High marketplace confidence",
      "pricing-confidence": "High pricing confidence",
      "image-ready": "Images are ready",
      "image-missing": "Images are incomplete",
      "price-present": "Price is present",
      "price-missing": "Price is missing",
      "gift-decor-keywords": "Gift or decor keywords detected",
      "repair-keywords": "Repair keywords detected",
      "education-keywords": "Education keywords detected",
      "strong-product-health": "Strong Product Health",
      "weak-product-health": "Weak Product Health",
    },
    marketOpportunitySummaries: {
      "strong-opportunity":
        "Strong opportunity for {audience} on {marketplace} with {fastSaleChance} fast-sale potential.",
      "moderate-opportunity":
        "Moderate opportunity; improve product images and pricing before publishing.",
      "low-opportunity":
        "Low opportunity until missing product basics are completed.",
    },
    marketingChannels: {
      "instagram-reels": "Instagram Reels",
      pinterest: "Pinterest",
      "facebook-groups": "Facebook Groups",
      "facebook-marketplace": "Facebook Marketplace",
      "etsy-search": "Etsy Search",
      "ebay-search": "eBay Search",
      whatsapp: "WhatsApp",
      "own-shop-content": "Own Shop Content",
      "local-community": "Local Community",
    },
    marketingChannelReasons: {
      "visual-product": "The product is visual and fits short-form content.",
      "repair-search": "The product depends on clear repair search intent.",
      "education-community": "Educational audiences engage well in communities.",
      "local-simple-product": "The product fits local or direct selling.",
      "own-shop-ready": "The product is strong enough for own-shop content.",
      "etsy-marketplace-fit": "The predicted marketplace benefits from Etsy search.",
      "direct-local-sharing": "Direct local sharing is a practical starting point.",
    },
    competitionLevels: {
      low: "Low",
      medium: "Medium",
      high: "High",
    },
    competitionReasons: {
      "personalization-detected": "Personalization or names were detected.",
      "handmade-differentiation": "Handmade signals improve differentiation.",
      "repair-part-niche": "Repair or replacement use makes the product more specific.",
      "educational-niche": "Educational use creates a clearer audience.",
      "decorative-common": "Decor products usually face broader competition.",
      "customizable-option": "Customizable options improve differentiation.",
      "niche-keywords": "Niche keywords were detected.",
      "broad-category": "The category is broad without strong differentiation signals.",
    },
    businessRecommendations: {
      "publish-now": "Publish now",
      "improve-product-first": "Improve product first",
      "add-price-first": "Add price first",
      "improve-images-first": "Improve images first",
      "focus-on-etsy": "Focus on Etsy",
      "focus-on-ebay": "Focus on eBay",
      "focus-on-instagram": "Focus on Instagram",
      "lower-price": "Lower price",
      "premium-positioning": "Use premium positioning",
      "niche-positioning": "Use niche positioning",
    },
    businessRecommendationReasons: {
      "missing-price": "Price is required before a business decision.",
      "image-readiness": "Images or the main image need improvement.",
      "strong-demand": "Demand and fast-sale signals show a strong opportunity.",
      "weak-market-readiness": "Market readiness should improve before publishing.",
      "marketplace-fit": "The predicted marketplace fits this product.",
      "repair-market-fit": "Repair products fit practical search marketplaces.",
      "visual-channel-fit": "The product is visual and fits social channels.",
      "pricing-pressure": "Competition creates pricing pressure.",
      "premium-fit": "Differentiation signals support premium positioning.",
      "niche-advantage": "Niche signals give the product a clearer advantage.",
    },
    marketingTips: {
      "add-basics-first": "Add price and main image before marketing.",
      "gift-lifestyle-photos": "Post this product as a gift idea with 3 lifestyle photos.",
      "repair-use-case": "Show the repair use case clearly and list compatible parts.",
      "pinterest-home-decor": "Use Pinterest-style photos and target home decor buyers.",
      "education-classroom": "Show how this product works for learning or classrooms.",
      "marketplace-story": "Write a short story tailored to the marketplace and audience.",
      "premium-brand-story": "Present this with a brand story and polished product photos.",
    },
    marketingTipReasons: {
      "missing-price-or-image": "Marketing needs a price and main image first.",
      "gift-audience": "The predicted audience is gift-oriented or fast-sale ready.",
      "repair-audience": "This audience needs a clear use case and compatibility details.",
      "visual-marketplace": "The selected marketplace rewards strong visuals.",
      "education-audience": "The predicted audience has an educational use case.",
      "marketplace-match": "The tip matches the predicted marketplace and audience.",
      "premium-opportunity": "The product is strong enough for a premium presentation.",
    },
    addPriceFirst: "Add price first",
    publishProgress: "Publish Progress",
    publishProgressHelp: "{passed} of {total} publish checks completed.",
    publishChecklist: "Publish Checklist",
    publishChecklistItems: {
      "has-product-name": "Has product name",
      "has-category": "Has category",
      "has-price": "Has price",
      "has-description": "Has description",
      "has-at-least-one-image": "Has at least one image",
      "has-main-image": "Has main image",
      "product-health-is-good": "Product health is good",
      "no-high-priority-recommendations": "No high priority recommendations",
    },
    publishChecklistStatuses: {
      passed: "Passed",
      pending: "Pending",
    },
    publishDecision: "Publish Decision",
    publishReadyLabel: "Ready to publish",
    publishNotReadyLabel: "Not ready yet",
    publishReadyReason: "All checklist items passed.",
    publishMissingReason: "First missing item: {itemLabel}",
    publishSafety: "Publish Safety",
    publishSafetyCanPublish: "You can proceed to publish.",
    publishSafetyBlocked: "Publishing is blocked until requirements are complete.",
    publishWarningTitle: "Publish Warning",
    publishWarningMessage: "Do not publish before completing the missing items.",
    publishProduct: "Publish Product",
    publishProductHelp: "This is a demo button only. Nothing is published yet.",
    finalGateTitle: "Final Gate",
    finalGateOpen: "Final gate is open.",
    finalGateClosed: "Final gate is closed until the product is complete.",
    finalStampComplete: "✅ Magic Web Complete",
    finalStampWaiting: "⏳ Magic Web waiting for completion",
    publishCelebration: "🎉 The product is ready to appear in the store.",
    publishReadyBadge: "✅ Ready to publish",
    publishNotReadyBadge: "⏳ Not ready yet",
    magicRecommendations: "Magic Recommendations",
    recommendationPriorities: {
      high: "High",
      medium: "Medium",
      low: "Low",
    },
    recommendations: {
      "no-images-uploaded": {
        title: "No images uploaded.",
        description: "Upload at least one product image before publishing.",
      },
      "add-main-product-image": {
        title: "Add at least one Main product image.",
        description: "Mark one uploaded image as the main product image.",
      },
      "description-too-short": {
        title: "Description is too short.",
        description: "Add more product specifications to improve the draft.",
      },
      "missing-category": {
        title: "Product has no category.",
        description: "Choose a category so the product can be organized.",
      },
      "missing-price": {
        title: "Product has no price.",
        description: "Add a price before this product is ready to sell.",
      },
      "more-gallery-images": {
        title: "More gallery images are recommended.",
        description: "Add or mark more images as gallery images.",
      },
      "add-seo-keywords": {
        title: "Add SEO keywords.",
        description: "SEO keywords will help prepare this product for search.",
      },
      "add-image-alt-text": {
        title: "Add image ALT text.",
        description: "Image ALT text improves accessibility and SEO readiness.",
      },
      "product-card-ready": {
        title: "Product card is ready.",
        description:
          "The local draft has enough data for a product card preview.",
      },
      "product-can-be-published": {
        title: "Product can be published.",
        description: "The local draft has the minimum publish-ready signals.",
      },
      "product-health-below-good": {
        title: "Improve product quality before publishing.",
        description:
          "Raise Product Health to Good or Excellent before final review.",
      },
      "ready-for-final-review": {
        title: "Product is ready for final review.",
        description:
          "All required fields are complete and the product can be reviewed before publishing.",
      },
    },
    autoFixPlan: "Auto Fix Plan",
    autoFixStatuses: {
      suggested: "Suggested",
      notAvailable: "Not available",
    },
    autoFixPlanActions: {
      "add-product-name": {
        label: "Add product name manually",
        description: "Enter a clear product name so the core details are complete.",
      },
      "choose-category": {
        label: "Choose category manually",
        description: "Select the right category to organize the product in the store.",
      },
      "improve-description": {
        label: "Improve description",
        description: "Add a longer description with the important product details.",
      },
      "add-price": {
        label: "Add price",
        description: "Enter the product price before final review.",
      },
      "upload-product-image": {
        label: "Upload product image",
        description: "Add at least one image so the product can be shown clearly.",
      },
      "select-main-image": {
        label: "Mark one image as main",
        description: "Choose one uploaded image as the main product image.",
      },
      "improve-product-details": {
        label: "Complete product details",
        description: "Complete the required fields and images to raise Product Health.",
      },
      "ready-for-final-review": {
        label: "Ready for final review",
        description: "No fix steps are required right now.",
      },
    },
    previewIcons: {
      passed: "✅",
      waiting: "⏳",
      blocked: "⛔",
      warning: "⚠️",
    },
    overallStatusTitle: "Overall Status",
    overallStatusReady:
      "✅ All Magic checks are complete and the product is ready.",
    overallStatusWaiting:
      "⏳ There are still required steps before publishing.",
    nextBestActionTitle: "Next Best Action",
    nextBestActions: {
      "add-product-name": {
        message: "Add the product name to continue.",
        priority: "high",
      },
      "choose-category": {
        message: "Choose a product category.",
        priority: "high",
      },
      "improve-description": {
        message: "Improve the product description with enough detail.",
        priority: "medium",
      },
      "add-price": {
        message: "Add a product price.",
        priority: "high",
      },
      "upload-product-image": {
        message: "Upload at least one product image.",
        priority: "high",
      },
      "select-main-image": {
        message: "Select a main product image.",
        priority: "high",
      },
      "improve-product-details": {
        message: "Improve product details to raise Product Health to Good.",
        priority: "medium",
      },
      "ready-for-final-review": {
        message: "Product is ready for final review.",
        priority: "low",
      },
    },
    rerunMagicEngine: "Re-run Magic Engine",
    rerunMagicEngineHelp: "Recalculates step statuses from current fields.",
    selectedColorsCount: "Selected colors count",
    uploadedImagesCount: "Uploaded images count",
    completedSteps: "Completed steps",
    waitingSteps: "Waiting steps",
    notStartedSteps: "Not started steps",
    colors: "Colors",
    chooseColors: "Choose colors",
    customColor: "Custom color",
    customColorRequest: "Custom color request",
    customColorRequestPlaceholder: "Example: match a customer sample or a specific shade",
    images: "Images",
    imageHelp: "Choose 3 to 4 images",
    uploadImages: "Upload images",
    imageRole: "Image role",
    noImageRole: "No role",
    roles: {
      main: "Main product image",
      gallery: "Gallery image",
      colorGroup: "Color group image",
      aiReference: "AI reference image",
      catalog: "Catalog image",
      social: "Social media image",
    },
    cancel: "Cancel",
    save: "Save",
  },
  de: {
    title: "Produkt hinzufügen",
    productName: "Produktname",
    category: "Kategorie",
    productType: "Produkttyp",
    productTypePlaceholder: "Produkttyp auswählen",
    productTypes: {
      educationalGame: "Lernspiel",
      woodenPuzzle: "Holzpuzzle",
      memoryGame: "Memory-Spiel",
      chessGame: "Schachspiel",
      customInstitutionalOrder: "Individueller institutioneller Auftrag",
      digitalFile: "Digitale Datei",
      giftBox: "Geschenkbox",
    },
    targetAudience: "Zielgruppe",
    targetAudiencePlaceholder: "Zielgruppe auswählen",
    targetAudiences: {
      children: "Kinder",
      autismCenter: "Autismuszentrum",
      school: "Schule",
      kindergarten: "Kindergarten",
      specialEducation: "Sonderpädagogik",
      family: "Familie",
    },
    educationalSkills: "Lernfähigkeiten",
    educationalSkillsHelp:
      "Wählen Sie die Fähigkeiten aus, die dieses Bildungs- oder Fertigungsprodukt unterstützt.",
    educationalSkillOptions: {
      memory: "Gedächtnis",
      focus: "Fokus",
      matching: "Zuordnung",
      numbers: "Zahlen",
      language: "Sprache",
      visualPerception: "Visuelle Wahrnehmung",
      fineMotorSkills: "Feinmotorik",
      logicalThinking: "Logisches Denken",
    },
    basicInformationSection: "Grundinformationen",
    basicInformationHelp:
      "Definieren Sie das Produkt klar, bevor Fertigung, Lagerbestand und Preise verbunden werden.",
    educationalClassificationSection: "Bildungsklassifizierung",
    educationalClassificationHelp:
      "Legen Sie Produkttyp, Zielgruppe und unterstützte Lernfähigkeiten fest.",
    productDnaSection: "Produkt-DNA",
    sku: "SKU",
    productCode: "Produktcode",
    productVersion: "Produktversion",
    manufacturingSection: "Fertigung",
    manufacturingSectionHelp:
      "Erfassen Sie Material, Abmessungen und Produktionsort für die spätere Fertigung.",
    material: "Material",
    thickness: "Stärke",
    dimensions: "Abmessungen",
    productionCountry: "Produktionsland",
    factoryLocation: "Fabrikstandort",
    inventorySection: "Lagerbestand",
    inventorySectionHelp:
      "Bereiten Sie Bestand, Warnungen und Produktionsstatus ohne Datenbankänderungen vor.",
    stockQuantity: "Lagerbestand",
    minimumStockAlert: "Mindestbestand-Warnung",
    productionStatus: "Produktionsstatus",
    productionStatusPlaceholder: "Produktionsstatus auswählen",
    productionStatuses: {
      notStarted: "Nicht gestartet",
      inProduction: "In Produktion",
      ready: "Bereit",
      paused: "Pausiert",
    },
    pricingPreparationSection: "Preisvorbereitung",
    pricingPreparationSectionHelp:
      "Bereiten Sie Kosten und Verkaufspreise für Einzelhandel, Institutionen und Großhandel vor.",
    baseCost: "Basiskosten",
    suggestedPrice: "Vorgeschlagener Preis",
    institutionPrice: "Preis für Institutionen",
    wholesalePrice: "Großhandelspreis",
    futureBarcodeSection: "Zukünftiger Barcode / QR",
    futureBarcodeSectionHelp:
      "Vorbereitungsnotiz für späteres Scannen von Produktcode, Bestand, Preis und Kategorie.",
    barcodeQrCode: "Barcode-/QR-Code-Unterstützung",
    barcodeQrCodeFutureNote:
      "Barcode-/QR-Code-Unterstützung wird später für das Scannen von Produktcode, Preis, Kategorie und Lagerbestand hinzugefügt.",
    price: "Preis",
    status: "Status",
    statusPlaceholder: "Status auswählen",
    active: "Aktiv",
    draft: "Entwurf",
    archived: "Archiviert",
    productDescription: "Intelligente Produktbeschreibung",
    productDescriptionHelp:
      "Schreiben Sie Produktspezifikationen in natürlicher Sprache, z. B. Material, Größe, Nutzung, Duft oder wichtige Details.",
    productDescriptionPlaceholder:
      "Beispiel: Rosa Duftkerze aus Sojawachs, als Geschenk geeignet, mittlere Größe, hochwertige Box...",
    analyzeSpecifications: "✨ Spezifikationen analysieren",
    analysisTitle: "🧠 Produktverständnis",
    analysisConfidence: "Vertrauen: wird später berechnet",
    analysisPlaceholder: "Wird von KI generiert",
    analysisFields: {
      suggestedProductName: "Vorgeschlagener Produktname",
      category: "Kategorie",
      material: "Material",
      scent: "Duft",
      dimensions: "Abmessungen",
      availableColors: "Verfügbare Farben",
      suggestedKeywords: "Vorgeschlagene Keywords",
      shortDescription: "Kurzbeschreibung",
      seoTitle: "SEO-Titel",
      seoDescription: "SEO-Beschreibung",
      urlSlug: "URL-Slug",
      imageAltText: "Bild-ALT-Text",
    },
    buildProductCard: "✨ Produktkarte erstellen",
    productCardPlaceholder: "Wird später erstellt",
    productCardFields: {
      productName: "Produktname",
      category: "Kategorie",
      materials: "Materialien",
      scent: "Duft",
      colors: "Farben",
      price: "Preis",
      shortDescription: "Kurzbeschreibung",
      seoTitle: "SEO-Titel",
      seoDescription: "SEO-Beschreibung",
      urlSlug: "URL-Slug",
      imageAltText: "Bild-ALT-Text",
      tags: "Tags",
    },
    generateBlueprint: "✨ Produktplan erstellen",
    blueprintPlaceholder: "Wird später erstellt",
    blueprintSections: {
      productIdentity: "Produktidentität",
      productDetails: "Produktdetails",
      marketing: "Marketing",
      seo: "SEO",
      store: "Shop",
    },
    blueprintFields: {
      productName: "Produktname",
      category: "Kategorie",
      collection: "Kollektion",
      productType: "Produkttyp",
      materials: "Materialien",
      dimensions: "Abmessungen",
      weight: "Gewicht",
      scent: "Duft",
      availableColors: "Verfügbare Farben",
      shortDescription: "Kurzbeschreibung",
      longDescription: "Lange Beschreibung",
      highlights: "Highlights",
      benefits: "Vorteile",
      seoTitle: "SEO-Titel",
      seoDescription: "SEO-Beschreibung",
      urlSlug: "URL-Slug",
      suggestedKeywords: "Vorgeschlagene Keywords",
      imageAltText: "Bild-ALT-Text",
      tags: "Tags",
      displayPriority: "Anzeigepriorität",
      suggestedGalleryOrder: "Vorgeschlagene Galerie-Reihenfolge",
    },
    engineTitle: "Smart Product Engine",
    engineSteps: {
      images: "Bilder",
      specifications: "Spezifikationen",
      productUnderstanding: "Produktverständnis",
      productCard: "Produktkarte",
      productBlueprint: "Produktplan",
      productContent: "Produktinhalt",
      seo: "SEO",
      aiImages: "KI-Bilder",
      readyToPublish: "Bereit zur Veröffentlichung",
    },
    engineStatuses: {
      ready: "Bereit",
      waiting: "Wartet",
      notStarted: "Nicht gestartet",
    },
    enginePreviewStatuses: {
      ready: "Abgeschlossen",
      waiting: "Wartet",
      notStarted: "Nicht gestartet",
    },
    magicEnginePreview: "Magic Engine Vorschau",
    magicWebSummary: "Magic Web Zusammenfassung",
    magicWebSummaryReadyTitle: "Magic Web bereit",
    magicWebSummaryReadyMessage: "Das Produkt ist bereit zur Veröffentlichung.",
    magicWebSummaryInProgressTitle: "Magic Web in Arbeit",
    magicWebSummaryInProgressMessage:
      "Schließe die fehlenden Schritte vor der Veröffentlichung ab.",
    magicProgress: "Magic Fortschritt",
    magicProgressHelp:
      "{completed} von {total} Magic-Schritten abgeschlossen.",
    productHealth: "Produktstatus",
    productHealthLevels: {
      weak: "Schwach",
      fair: "Mittel",
      good: "Gut",
      excellent: "Ausgezeichnet",
    },
    productHealthSummary:
      "Der lokale Produktstatus ist {level} mit {score} von 100 Punkten.",
    magicConfidence: "Magic-Vertrauen",
    magicConfidenceLabels: {
      low: "Niedrig",
      medium: "Mittel",
      high: "Hoch",
      veryHigh: "Sehr hoch",
    },
    completionScore: "Abschlusswert",
    estimatedTimeToPublish: "Geschätzte Zeit bis zur Veröffentlichung",
    estimatedTimeToPublishItems: {
      ready: {
        time: "Weniger als 1 Minute",
        explanation: "Alle zentralen Veröffentlichungsprüfungen sind vollständig.",
      },
      oneSmallItem: {
        time: "Etwa 2 Minuten",
        explanation: "Ein kleiner Schritt bleibt vor der finalen Prüfung.",
      },
      mediumItems: {
        time: "Etwa 5 Minuten",
        explanation: "Einige mittlere Schritte sind nötig, um das Produkt zu vervollständigen.",
      },
      severalItems: {
        time: "Etwa 10 Minuten",
        explanation: "Mehrere Felder oder Bilder müssen noch ergänzt werden.",
      },
      almostEmpty: {
        time: "Etwa 15+ Minuten",
        explanation:
          "Das Produkt ist fast leer und benötigt Kerndaten sowie Bilder.",
      },
    },
    marketPotential: "Marktpotenzial",
    marketPotentialLabels: {
      opportunitySummary: "Marktchancen-Zusammenfassung",
      marketingTip: "Marketing-Tipp",
      marketingTipReason: "Grund für den Tipp",
      marketingChannel: "Marketing-Kanal",
      marketingChannelConfidence: "Kanal-Sicherheit",
      marketingChannelWhy: "Warum dieser Kanal?",
      competitionLevel: "Wettbewerbsniveau",
      differentiationScore: "Differenzierungswert",
      competitionConfidence: "Wettbewerbs-Sicherheit",
      competitionWhy: "Warum dieser Wettbewerb?",
      businessRecommendation: "Geschäftsempfehlung",
      businessRecommendationConfidence: "Empfehlungs-Sicherheit",
      businessRecommendationWhy: "Warum diese Empfehlung?",
      magicScore: "Magic-Wert",
      expectedDemand: "Erwartete Nachfrage",
      primaryAudience: "Primäre Zielgruppe",
      secondaryAudiences: "Sekundäre Zielgruppen",
      predictionConfidence: "Vorhersage-Sicherheit",
      why: "Warum?",
      bestMarketplace: "Bester Marktplatz",
      alternativeMarketplaces: "Alternative Marktplätze",
      marketplaceConfidence: "Marktplatz-Sicherheit",
      marketplaceWhy: "Warum dieser Marktplatz?",
      recommendedPrice: "Empfohlener Preis",
      aggressivePrice: "Aggressiver Preis",
      premiumPrice: "Premium-Preis",
      wholesalePrice: "Großhandelspreis",
      pricingConfidence: "Preis-Sicherheit",
      pricingWhy: "Warum dieser Preis?",
      demandConfidence: "Nachfrage-Sicherheit",
      demandWhy: "Warum diese Nachfrage?",
      fastSaleConfidence: "Schnellverkauf-Sicherheit",
      fastSaleWhy: "Warum schneller Verkauf?",
      chanceOfFastSale: "Chance auf schnellen Verkauf",
    },
    marketDemandLevels: {
      low: "Niedrig",
      medium: "Mittel",
      high: "Hoch",
      "very-high": "Sehr hoch",
    },
    marketAudiences: {
      "general-buyers": "Allgemeine Käufer",
      "gift-buyers": "Geschenkkäufer",
      parents: "Eltern",
      teachers: "Lehrkräfte",
      students: "Schüler und Studierende",
      "diy-makers": "DIY-Maker",
      hobbyists: "Hobbyisten",
      collectors: "Sammler",
      "home-decor": "Käufer von Wohn-Deko",
      wedding: "Hochzeitskäufer",
      repair: "Reparaturkäufer",
      workshop: "Werkstattkäufer",
      "small-business": "Kleinunternehmer",
      artists: "Künstler",
      "pet-lovers": "Tierliebhaber",
      "seasonal-buyers": "Saisonale Käufer",
    },
    audienceReasons: {
      "handmade-product": "Handgemachtes Produkt",
      "gift-category": "Geschenkkategorie",
      "decorative-keywords": "Dekorative Keywords erkannt",
      "educational-purpose": "Bildungszweck erkannt",
      "craft-keywords": "Bastel-Keywords erkannt",
      "tool-keywords": "Werkzeug- oder Werkstatt-Keywords erkannt",
      "repair-keywords": "Reparatur-Keywords erkannt",
      "wedding-keywords": "Hochzeits-Keywords erkannt",
      "pet-keywords": "Haustier-Keywords erkannt",
      "seasonal-keywords": "Saisonale Keywords erkannt",
      "business-keywords": "Kleinunternehmer-Keywords erkannt",
      "collector-keywords": "Sammler-Keywords erkannt",
      "price-signal": "Der Preis unterstützt diese Zielgruppe",
      "general-match": "Allgemeine Produktübereinstimmung",
    },
    demandReasons: {
      "strong-product-health": "Starker Produktstatus",
      "weak-product-health": "Schwacher Produktstatus",
      "audience-confidence": "Hohe Zielgruppen-Sicherheit",
      "marketplace-confidence": "Hohe Marktplatz-Sicherheit",
      "pricing-confidence": "Hohe Preis-Sicherheit",
      "price-missing": "Preis fehlt",
      "image-ready": "Bilder sind bereit",
      "image-missing": "Bilder sind unvollständig",
      "seasonal-keywords": "Saisonale Keywords erkannt",
      "gift-keywords": "Geschenk-Keywords erkannt",
      "decor-keywords": "Deko-Keywords erkannt",
      "repair-keywords": "Reparatur-Keywords erkannt",
      "education-keywords": "Bildungs-Keywords erkannt",
    },
    marketMarketplaces: {
      etsy: "Etsy",
      ebay: "eBay",
      "amazon-handmade": "Amazon Handmade",
      kleinanzeigen: "Kleinanzeigen",
      "facebook-marketplace": "Facebook Marketplace",
      instagram: "Instagram",
      pinterest: "Pinterest",
      "local-marketplace": "Lokaler Marktplatz",
      "own-shop": "Eigener Shop",
    },
    marketplaceReasons: {
      "handmade-market-fit": "Passt zu Handmade-Marktplätzen",
      "decor-market-fit": "Passt zu Deko- und Geschenk-Kategorien",
      "repair-market-fit": "Passt zu Reparaturteilen und Werkzeugen",
      "visual-market-fit": "Visuelles Produkt passt zu Social-Plattformen",
      "local-simple-product": "Einfaches oder günstiges Produkt passt lokal",
      "brand-ready-product": "Produkt ist stark genug für einen eigenen Shop",
      "incomplete-product": "Unvollständiges Produkt passt zuerst lokal",
      "audience-market-fit": "Vorhergesagte Zielgruppe passt zum Marktplatz",
      "price-market-fit": "Der Preis unterstützt diesen Marktplatz",
    },
    pricingReasons: {
      "current-price-used": "Aktueller Preis als Basis verwendet",
      "premium-supported": "Kategorie unterstützt Premium-Preise",
      "repair-practical-pricing": "Reparaturteile bevorzugen praktische Preise",
      "low-health-confidence": "Niedriger Produktstatus reduziert Sicherheit",
      "marketplace-fit": "Gewählter Marktplatz unterstützt diesen Preis",
      "audience-fit": "Vorhergesagte Zielgruppe unterstützt diesen Preis",
      "missing-price": "Zuerst Preis hinzufügen",
    },
    fastSaleChances: {
      low: "Niedrig",
      medium: "Mittel",
      high: "Hoch",
      "very-high": "Sehr hoch",
    },
    fastSaleReasons: {
      "publish-ready": "Produkt ist veröffentlichungsbereit",
      "not-publish-ready": "Produkt ist nicht veröffentlichungsbereit",
      "strong-demand": "Erwartete Nachfrage ist stark",
      "weak-demand": "Erwartete Nachfrage ist schwach",
      "marketplace-confidence": "Hohe Marktplatz-Sicherheit",
      "pricing-confidence": "Hohe Preis-Sicherheit",
      "image-ready": "Bilder sind bereit",
      "image-missing": "Bilder sind unvollständig",
      "price-present": "Preis ist vorhanden",
      "price-missing": "Preis fehlt",
      "gift-decor-keywords": "Geschenk- oder Deko-Keywords erkannt",
      "repair-keywords": "Reparatur-Keywords erkannt",
      "education-keywords": "Bildungs-Keywords erkannt",
      "strong-product-health": "Starker Produktstatus",
      "weak-product-health": "Schwacher Produktstatus",
    },
    marketOpportunitySummaries: {
      "strong-opportunity":
        "Starke Chance für {audience} auf {marketplace} mit {fastSaleChance} Schnellverkaufspotenzial.",
      "moderate-opportunity":
        "Mittlere Chance; verbessere Produktbilder und Preisgestaltung vor der Veröffentlichung.",
      "low-opportunity":
        "Geringe Chance, bis fehlende Produktgrundlagen abgeschlossen sind.",
    },
    marketingChannels: {
      "instagram-reels": "Instagram Reels",
      pinterest: "Pinterest",
      "facebook-groups": "Facebook-Gruppen",
      "facebook-marketplace": "Facebook Marketplace",
      "etsy-search": "Etsy-Suche",
      "ebay-search": "eBay-Suche",
      whatsapp: "WhatsApp",
      "own-shop-content": "Eigener Shop Content",
      "local-community": "Lokale Community",
    },
    marketingChannelReasons: {
      "visual-product": "Das Produkt ist visuell und passt zu Kurzvideo-Content.",
      "repair-search": "Das Produkt hängt von klarer Reparatur-Suchabsicht ab.",
      "education-community": "Bildungszielgruppen reagieren gut in Communities.",
      "local-simple-product": "Das Produkt passt zu lokalem oder direktem Verkauf.",
      "own-shop-ready": "Das Produkt ist stark genug für eigenen Shop-Content.",
      "etsy-marketplace-fit": "Der vorhergesagte Marktplatz profitiert von Etsy-Suche.",
      "direct-local-sharing": "Direktes lokales Teilen ist ein praktischer Startpunkt.",
    },
    competitionLevels: {
      low: "Niedrig",
      medium: "Mittel",
      high: "Hoch",
    },
    competitionReasons: {
      "personalization-detected": "Personalisierung oder Namen wurden erkannt.",
      "handmade-differentiation": "Handmade-Signale verbessern die Differenzierung.",
      "repair-part-niche": "Reparatur- oder Ersatzteilnutzung macht das Produkt spezieller.",
      "educational-niche": "Bildungsnutzung schafft eine klarere Zielgruppe.",
      "decorative-common": "Deko-Produkte haben meist breiteren Wettbewerb.",
      "customizable-option": "Anpassbare Optionen verbessern die Differenzierung.",
      "niche-keywords": "Nischen-Keywords wurden erkannt.",
      "broad-category": "Die Kategorie ist breit und zeigt wenig Differenzierung.",
    },
    businessRecommendations: {
      "publish-now": "Jetzt veröffentlichen",
      "improve-product-first": "Produkt zuerst verbessern",
      "add-price-first": "Preis zuerst hinzufügen",
      "improve-images-first": "Bilder zuerst verbessern",
      "focus-on-etsy": "Auf Etsy fokussieren",
      "focus-on-ebay": "Auf eBay fokussieren",
      "focus-on-instagram": "Auf Instagram fokussieren",
      "lower-price": "Preis senken",
      "premium-positioning": "Premium-Positionierung nutzen",
      "niche-positioning": "Nischen-Positionierung nutzen",
    },
    businessRecommendationReasons: {
      "missing-price": "Ein Preis ist vor der Geschäftsentscheidung nötig.",
      "image-readiness": "Bilder oder Hauptbild müssen verbessert werden.",
      "strong-demand": "Nachfrage und Schnellverkauf zeigen eine starke Chance.",
      "weak-market-readiness": "Die Marktreife sollte vor der Veröffentlichung steigen.",
      "marketplace-fit": "Der vorhergesagte Marktplatz passt zu diesem Produkt.",
      "repair-market-fit": "Reparaturprodukte passen zu praktischen Suchmarktplätzen.",
      "visual-channel-fit": "Das Produkt ist visuell und passt zu Social Channels.",
      "pricing-pressure": "Der Wettbewerb erzeugt Preisdruck.",
      "premium-fit": "Differenzierungssignale stützen Premium-Positionierung.",
      "niche-advantage": "Nischensignale geben dem Produkt einen klareren Vorteil.",
    },
    marketingTips: {
      "add-basics-first": "Füge Preis und Hauptbild vor dem Marketing hinzu.",
      "gift-lifestyle-photos": "Positioniere das Produkt als Geschenkidee mit 3 Lifestyle-Fotos.",
      "repair-use-case": "Zeige den Reparatur-Anwendungsfall klar und liste kompatible Teile.",
      "pinterest-home-decor": "Nutze Pinterest-artige Fotos und ziele auf Wohn-Deko-Käufer.",
      "education-classroom": "Zeige, wie das Produkt beim Lernen oder im Unterricht funktioniert.",
      "marketplace-story": "Schreibe eine kurze Story passend zu Marktplatz und Zielgruppe.",
      "premium-brand-story": "Präsentiere es mit Markengeschichte und polierten Produktfotos.",
    },
    marketingTipReasons: {
      "missing-price-or-image": "Marketing braucht zuerst Preis und Hauptbild.",
      "gift-audience": "Die vorhergesagte Zielgruppe ist geschenk- oder schnellkauf-orientiert.",
      "repair-audience": "Diese Zielgruppe braucht Anwendungsfall und Kompatibilitätsdetails.",
      "visual-marketplace": "Der gewählte Marktplatz belohnt starke Bilder.",
      "education-audience": "Die vorhergesagte Zielgruppe hat einen Bildungsnutzen.",
      "marketplace-match": "Der Tipp passt zu Marktplatz und Zielgruppe.",
      "premium-opportunity": "Das Produkt ist stark genug für eine Premium-Präsentation.",
    },
    addPriceFirst: "Zuerst Preis hinzufügen",
    publishProgress: "Veröffentlichungsfortschritt",
    publishProgressHelp:
      "{passed} von {total} Veröffentlichungsprüfungen abgeschlossen.",
    publishChecklist: "Veröffentlichungs-Checkliste",
    publishChecklistItems: {
      "has-product-name": "Produktname vorhanden",
      "has-category": "Kategorie vorhanden",
      "has-price": "Preis vorhanden",
      "has-description": "Beschreibung vorhanden",
      "has-at-least-one-image": "Mindestens ein Bild vorhanden",
      "has-main-image": "Hauptbild vorhanden",
      "product-health-is-good": "Produktstatus ist gut",
      "no-high-priority-recommendations":
        "Keine Empfehlungen mit hoher Priorität",
    },
    publishChecklistStatuses: {
      passed: "Bestanden",
      pending: "Ausstehend",
    },
    publishDecision: "Veröffentlichungsentscheidung",
    publishReadyLabel: "Bereit zur Veröffentlichung",
    publishNotReadyLabel: "Noch nicht bereit",
    publishReadyReason: "Alle Veröffentlichungsprüfungen wurden bestanden.",
    publishMissingReason: "Erstes fehlendes Element: {itemLabel}",
    publishSafety: "Veröffentlichungssicherheit",
    publishSafetyCanPublish:
      "Du kannst mit der Veröffentlichung fortfahren.",
    publishSafetyBlocked:
      "Die Veröffentlichung ist blockiert, bis die Anforderungen erfüllt sind.",
    publishWarningTitle: "Veröffentlichungswarnung",
    publishWarningMessage:
      "Nicht veröffentlichen, bevor die fehlenden Elemente abgeschlossen sind.",
    publishProduct: "Produkt veröffentlichen",
    publishProductHelp:
      "Dies ist nur ein Demo-Button. Es wird noch nichts veröffentlicht.",
    finalGateTitle: "Finales Tor",
    finalGateOpen: "Das finale Tor ist offen.",
    finalGateClosed:
      "Das finale Tor bleibt geschlossen, bis das Produkt vollständig ist.",
    finalStampComplete: "✅ Magic Web vollständig",
    finalStampWaiting: "⏳ Magic Web wartet auf Fertigstellung",
    publishCelebration: "🎉 Das Produkt ist bereit, im Shop zu erscheinen.",
    publishReadyBadge: "✅ Bereit zur Veröffentlichung",
    publishNotReadyBadge: "⏳ Noch nicht bereit",
    magicRecommendations: "Magic Empfehlungen",
    recommendationPriorities: {
      high: "Hoch",
      medium: "Mittel",
      low: "Niedrig",
    },
    recommendations: {
      "no-images-uploaded": {
        title: "Keine Bilder hochgeladen.",
        description: "Lade vor der Veröffentlichung mindestens ein Produktbild hoch.",
      },
      "add-main-product-image": {
        title: "Füge mindestens ein Hauptproduktbild hinzu.",
        description: "Markiere ein hochgeladenes Bild als Hauptproduktbild.",
      },
      "description-too-short": {
        title: "Die Beschreibung ist zu kurz.",
        description: "Füge weitere Produktspezifikationen hinzu, um den Entwurf zu verbessern.",
      },
      "missing-category": {
        title: "Das Produkt hat keine Kategorie.",
        description: "Wähle eine Kategorie, damit das Produkt organisiert werden kann.",
      },
      "missing-price": {
        title: "Das Produkt hat keinen Preis.",
        description: "Füge einen Preis hinzu, bevor das Produkt verkaufsbereit ist.",
      },
      "more-gallery-images": {
        title: "Weitere Galeriebilder werden empfohlen.",
        description: "Füge weitere Bilder hinzu oder markiere sie als Galeriebilder.",
      },
      "add-seo-keywords": {
        title: "Füge SEO-Keywords hinzu.",
        description: "SEO-Keywords helfen, dieses Produkt für die Suche vorzubereiten.",
      },
      "add-image-alt-text": {
        title: "Füge Bild-ALT-Text hinzu.",
        description: "Bild-ALT-Text verbessert Barrierefreiheit und SEO-Bereitschaft.",
      },
      "product-card-ready": {
        title: "Die Produktkarte ist bereit.",
        description:
          "Der lokale Entwurf enthält genug Daten für eine Produktkartenvorschau.",
      },
      "product-can-be-published": {
        title: "Das Produkt kann veröffentlicht werden.",
        description:
          "Der lokale Entwurf enthält die minimalen Signale für die Veröffentlichungsbereitschaft.",
      },
      "product-health-below-good": {
        title: "Verbessere die Produktqualität vor der Veröffentlichung.",
        description:
          "Erhöhe den Produktstatus vor der finalen Prüfung auf Gut oder Ausgezeichnet.",
      },
      "ready-for-final-review": {
        title: "Das Produkt ist bereit für die finale Prüfung.",
        description:
          "Alle Pflichtfelder sind vollständig und das Produkt kann vor der Veröffentlichung geprüft werden.",
      },
    },
    autoFixPlan: "Auto-Fix-Plan",
    autoFixStatuses: {
      suggested: "Vorgeschlagen",
      notAvailable: "Nicht verfügbar",
    },
    autoFixPlanActions: {
      "add-product-name": {
        label: "Produktnamen manuell hinzufügen",
        description:
          "Gib einen klaren Produktnamen ein, damit die Kerndaten vollständig sind.",
      },
      "choose-category": {
        label: "Kategorie manuell wählen",
        description: "Wähle die passende Kategorie, um das Produkt im Shop zu organisieren.",
      },
      "improve-description": {
        label: "Beschreibung verbessern",
        description: "Füge eine längere Beschreibung mit wichtigen Produktdetails hinzu.",
      },
      "add-price": {
        label: "Preis hinzufügen",
        description: "Gib den Produktpreis vor der finalen Prüfung ein.",
      },
      "upload-product-image": {
        label: "Produktbild hochladen",
        description: "Füge mindestens ein Bild hinzu, damit das Produkt klar gezeigt wird.",
      },
      "select-main-image": {
        label: "Ein Bild als Hauptbild markieren",
        description: "Wähle ein hochgeladenes Bild als Hauptproduktbild.",
      },
      "improve-product-details": {
        label: "Produktdetails vervollständigen",
        description:
          "Vervollständige die erforderlichen Felder und Bilder, um den Produktstatus zu erhöhen.",
      },
      "ready-for-final-review": {
        label: "Bereit für die finale Prüfung",
        description: "Derzeit sind keine Fix-Schritte erforderlich.",
      },
    },
    previewIcons: {
      passed: "✅",
      waiting: "⏳",
      blocked: "⛔",
      warning: "⚠️",
    },
    overallStatusTitle: "Gesamtstatus",
    overallStatusReady:
      "✅ Alle Magic-Prüfungen sind abgeschlossen und das Produkt ist bereit.",
    overallStatusWaiting:
      "⏳ Vor der Veröffentlichung sind noch Schritte erforderlich.",
    nextBestActionTitle: "Nächste beste Aktion",
    nextBestActions: {
      "add-product-name": {
        message: "Füge den Produktnamen hinzu, um fortzufahren.",
        priority: "high",
      },
      "choose-category": {
        message: "Wähle eine Produktkategorie.",
        priority: "high",
      },
      "improve-description": {
        message: "Verbessere die Produktbeschreibung mit genug Details.",
        priority: "medium",
      },
      "add-price": {
        message: "Füge einen Produktpreis hinzu.",
        priority: "high",
      },
      "upload-product-image": {
        message: "Lade mindestens ein Produktbild hoch.",
        priority: "high",
      },
      "select-main-image": {
        message: "Wähle ein Hauptproduktbild aus.",
        priority: "high",
      },
      "improve-product-details": {
        message: "Verbessere die Produktdetails, um den Produktstatus auf Gut zu erhöhen.",
        priority: "medium",
      },
      "ready-for-final-review": {
        message: "Das Produkt ist bereit für die finale Prüfung.",
        priority: "low",
      },
    },
    rerunMagicEngine: "Magic Engine erneut ausführen",
    rerunMagicEngineHelp:
      "Berechnet die Schrittzustände aus den aktuellen Feldern neu.",
    selectedColorsCount: "Ausgewählte Farben",
    uploadedImagesCount: "Hochgeladene Bilder",
    completedSteps: "Abgeschlossene Schritte",
    waitingSteps: "Wartende Schritte",
    notStartedSteps: "Nicht gestartete Schritte",
    colors: "Farben",
    chooseColors: "Farben auswählen",
    customColor: "Eigene Farbe",
    customColorRequest: "Sonderfarbwunsch",
    customColorRequestPlaceholder:
      "Beispiel: Kundenmuster oder bestimmten Farbton treffen",
    images: "Bilder",
    imageHelp: "Wählen Sie 3 bis 4 Bilder",
    uploadImages: "Bilder hochladen",
    imageRole: "Bildrolle",
    noImageRole: "Keine Rolle",
    roles: {
      main: "Hauptproduktbild",
      gallery: "Galeriebild",
      colorGroup: "Farbgruppenbild",
      aiReference: "KI-Referenzbild",
      catalog: "Katalogbild",
      social: "Social-Media-Bild",
    },
    cancel: "Abbrechen",
    save: "Speichern",
  },
  fr: {
    title: "Ajouter un produit",
    productName: "Nom du produit",
    category: "Categorie",
    productType: "Type de produit",
    productTypePlaceholder: "Choisir le type de produit",
    productTypes: {
      educationalGame: "Jeu éducatif",
      woodenPuzzle: "Puzzle en bois",
      memoryGame: "Jeu de mémoire",
      chessGame: "Jeu d'échecs",
      customInstitutionalOrder: "Commande institutionnelle personnalisée",
      digitalFile: "Fichier numérique",
      giftBox: "Boîte cadeau",
    },
    targetAudience: "Audience cible",
    targetAudiencePlaceholder: "Choisir l'audience cible",
    targetAudiences: {
      children: "Enfants",
      autismCenter: "Centre d'autisme",
      school: "École",
      kindergarten: "Maternelle",
      specialEducation: "Éducation spécialisée",
      family: "Famille",
    },
    educationalSkills: "Compétences éducatives",
    educationalSkillsHelp:
      "Sélectionnez les compétences soutenues par ce produit éducatif ou manufacturé.",
    educationalSkillOptions: {
      memory: "Mémoire",
      focus: "Concentration",
      matching: "Association",
      numbers: "Nombres",
      language: "Langage",
      visualPerception: "Perception visuelle",
      fineMotorSkills: "Motricité fine",
      logicalThinking: "Pensée logique",
    },
    basicInformationSection: "Informations de base",
    basicInformationHelp:
      "Définissez clairement le produit avant de relier fabrication, inventaire et prix.",
    educationalClassificationSection: "Classification éducative",
    educationalClassificationHelp:
      "Définissez le type de produit, l'audience et les compétences éducatives prises en charge.",
    productDnaSection: "ADN du produit",
    sku: "SKU",
    productCode: "Code produit",
    productVersion: "Version du produit",
    manufacturingSection: "Fabrication",
    manufacturingSectionHelp:
      "Ajoutez les matières, dimensions et lieux de production pour préparer la fabrication.",
    material: "Matière",
    thickness: "Épaisseur",
    dimensions: "Dimensions",
    productionCountry: "Pays de production",
    factoryLocation: "Emplacement de l'usine",
    inventorySection: "Inventaire",
    inventorySectionHelp:
      "Préparez les quantités, alertes et statuts de production sans changer la base de données.",
    stockQuantity: "Quantité en stock",
    minimumStockAlert: "Alerte de stock minimum",
    productionStatus: "Statut de production",
    productionStatusPlaceholder: "Choisir le statut de production",
    productionStatuses: {
      notStarted: "Non commencé",
      inProduction: "En production",
      ready: "Prêt",
      paused: "En pause",
    },
    pricingPreparationSection: "Préparation des prix",
    pricingPreparationSectionHelp:
      "Préparez les coûts et prix de vente pour le détail, les institutions et le gros.",
    baseCost: "Coût de base",
    suggestedPrice: "Prix suggéré",
    institutionPrice: "Prix institution",
    wholesalePrice: "Prix de gros",
    futureBarcodeSection: "Futur Barcode / QR",
    futureBarcodeSectionHelp:
      "Note de préparation pour scanner plus tard le code produit, le stock, le prix et la catégorie.",
    barcodeQrCode: "Support Barcode / QR Code",
    barcodeQrCodeFutureNote:
      "Le support Barcode / QR Code sera ajouté plus tard pour scanner le code produit, le prix, la catégorie et le stock.",
    price: "Prix",
    status: "Statut",
    statusPlaceholder: "Choisir un statut",
    active: "Actif",
    draft: "Brouillon",
    archived: "Archive",
    productDescription: "Description intelligente du produit",
    productDescriptionHelp:
      "Redigez les specifications du produit en langage naturel, comme les matieres, la taille, l'utilisation, le parfum ou les details importants.",
    productDescriptionPlaceholder:
      "Exemple : bougie parfumee rose en cire de soja, ideale pour cadeau, taille moyenne, boite premium...",
    analyzeSpecifications: "✨ Analyser les spécifications",
    analysisTitle: "🧠 Compréhension du produit",
    analysisConfidence: "Confiance : sera calculée plus tard",
    analysisPlaceholder: "Sera généré par l’IA",
    analysisFields: {
      suggestedProductName: "Nom de produit suggere",
      category: "Categorie",
      material: "Matiere",
      scent: "Parfum",
      dimensions: "Dimensions",
      availableColors: "Couleurs disponibles",
      suggestedKeywords: "Mots-cles suggeres",
      shortDescription: "Description courte",
      seoTitle: "Titre SEO",
      seoDescription: "Description SEO",
      urlSlug: "Slug URL",
      imageAltText: "Texte ALT de l'image",
    },
    buildProductCard: "✨ Créer la fiche produit",
    productCardPlaceholder: "Sera créé plus tard",
    productCardFields: {
      productName: "Nom du produit",
      category: "Categorie",
      materials: "Matieres",
      scent: "Parfum",
      colors: "Couleurs",
      price: "Prix",
      shortDescription: "Description courte",
      seoTitle: "Titre SEO",
      seoDescription: "Description SEO",
      urlSlug: "Slug URL",
      imageAltText: "Texte ALT de l'image",
      tags: "Tags",
    },
    generateBlueprint: "✨ Générer la fiche complète",
    blueprintPlaceholder: "Sera créé plus tard",
    blueprintSections: {
      productIdentity: "Identite du produit",
      productDetails: "Details du produit",
      marketing: "Marketing",
      seo: "SEO",
      store: "Boutique",
    },
    blueprintFields: {
      productName: "Nom du produit",
      category: "Categorie",
      collection: "Collection",
      productType: "Type de produit",
      materials: "Matieres",
      dimensions: "Dimensions",
      weight: "Poids",
      scent: "Parfum",
      availableColors: "Couleurs disponibles",
      shortDescription: "Description courte",
      longDescription: "Description longue",
      highlights: "Points forts",
      benefits: "Avantages",
      seoTitle: "Titre SEO",
      seoDescription: "Description SEO",
      urlSlug: "Slug URL",
      suggestedKeywords: "Mots-cles suggeres",
      imageAltText: "Texte ALT de l'image",
      tags: "Tags",
      displayPriority: "Priorite d'affichage",
      suggestedGalleryOrder: "Ordre de galerie suggere",
    },
    engineTitle: "Moteur de produit intelligent",
    engineSteps: {
      images: "Images",
      specifications: "Specifications",
      productUnderstanding: "Compréhension du produit",
      productCard: "Fiche produit",
      productBlueprint: "Fiche complète",
      productContent: "Contenu produit",
      seo: "SEO",
      aiImages: "Images IA",
      readyToPublish: "Prêt à publier",
    },
    engineStatuses: {
      ready: "Prêt",
      waiting: "En attente",
      notStarted: "Non commencé",
    },
    enginePreviewStatuses: {
      ready: "Terminé",
      waiting: "En attente",
      notStarted: "Non commencé",
    },
    magicEnginePreview: "Aperçu Magic Engine",
    magicWebSummary: "Résumé Magic Web",
    magicWebSummaryReadyTitle: "Magic Web prêt",
    magicWebSummaryReadyMessage: "Le produit est prêt à être publié.",
    magicWebSummaryInProgressTitle: "Magic Web en cours",
    magicWebSummaryInProgressMessage:
      "Complétez les étapes manquantes avant la publication.",
    magicProgress: "Progression Magic",
    magicProgressHelp: "{completed} sur {total} étapes Magic terminées.",
    productHealth: "Santé du produit",
    productHealthLevels: {
      weak: "Faible",
      fair: "Moyenne",
      good: "Bonne",
      excellent: "Excellente",
    },
    productHealthSummary:
      "La santé locale du produit est {level} avec un score de {score}/100.",
    magicConfidence: "Confiance Magic",
    magicConfidenceLabels: {
      low: "Faible",
      medium: "Moyenne",
      high: "Élevée",
      veryHigh: "Très élevée",
    },
    completionScore: "Score d’achèvement",
    estimatedTimeToPublish: "Temps estimé avant publication",
    estimatedTimeToPublishItems: {
      ready: {
        time: "Moins d’une minute",
        explanation: "Toutes les vérifications principales de publication sont complètes.",
      },
      oneSmallItem: {
        time: "Environ 2 minutes",
        explanation: "Une petite étape reste avant la revue finale.",
      },
      mediumItems: {
        time: "Environ 5 minutes",
        explanation: "Quelques étapes moyennes sont nécessaires pour compléter le produit.",
      },
      severalItems: {
        time: "Environ 10 minutes",
        explanation: "Plusieurs champs ou images doivent encore être complétés.",
      },
      almostEmpty: {
        time: "Environ 15 min ou plus",
        explanation:
          "Le produit est presque vide et nécessite les informations principales et des images.",
      },
    },
    marketPotential: "Potentiel du marché",
    marketPotentialLabels: {
      opportunitySummary: "Résumé de l’opportunité marché",
      marketingTip: "Conseil marketing",
      marketingTipReason: "Raison du conseil",
      marketingChannel: "Canal marketing",
      marketingChannelConfidence: "Confiance du canal",
      marketingChannelWhy: "Pourquoi ce canal ?",
      competitionLevel: "Niveau de concurrence",
      differentiationScore: "Score de différenciation",
      competitionConfidence: "Confiance concurrence",
      competitionWhy: "Pourquoi cette concurrence ?",
      businessRecommendation: "Recommandation business",
      businessRecommendationConfidence: "Confiance de recommandation",
      businessRecommendationWhy: "Pourquoi cette recommandation ?",
      magicScore: "Score Magic",
      expectedDemand: "Demande attendue",
      primaryAudience: "Audience principale",
      secondaryAudiences: "Audiences secondaires",
      predictionConfidence: "Confiance de prédiction",
      why: "Pourquoi ?",
      bestMarketplace: "Meilleure place de marché",
      alternativeMarketplaces: "Places de marché alternatives",
      marketplaceConfidence: "Confiance marketplace",
      marketplaceWhy: "Pourquoi cette marketplace ?",
      recommendedPrice: "Prix recommandé",
      aggressivePrice: "Prix agressif",
      premiumPrice: "Prix premium",
      wholesalePrice: "Prix de gros",
      pricingConfidence: "Confiance de prix",
      pricingWhy: "Pourquoi ce prix ?",
      demandConfidence: "Confiance de demande",
      demandWhy: "Pourquoi cette demande ?",
      fastSaleConfidence: "Confiance de vente rapide",
      fastSaleWhy: "Pourquoi vente rapide ?",
      chanceOfFastSale: "Chance de vente rapide",
    },
    marketDemandLevels: {
      low: "Faible",
      medium: "Moyenne",
      high: "Élevée",
      "very-high": "Très élevée",
    },
    marketAudiences: {
      "general-buyers": "Acheteurs généraux",
      "gift-buyers": "Acheteurs de cadeaux",
      parents: "Parents",
      teachers: "Enseignants",
      students: "Étudiants",
      "diy-makers": "Créateurs DIY",
      hobbyists: "Passionnés",
      collectors: "Collectionneurs",
      "home-decor": "Acheteurs de décoration intérieure",
      wedding: "Acheteurs mariage",
      repair: "Acheteurs réparation",
      workshop: "Acheteurs atelier",
      "small-business": "Petites entreprises",
      artists: "Artistes",
      "pet-lovers": "Amoureux des animaux",
      "seasonal-buyers": "Acheteurs saisonniers",
    },
    audienceReasons: {
      "handmade-product": "Produit fait main",
      "gift-category": "Catégorie cadeau",
      "decorative-keywords": "Mots-clés décoratifs détectés",
      "educational-purpose": "Objectif éducatif détecté",
      "craft-keywords": "Mots-clés créatifs détectés",
      "tool-keywords": "Mots-clés outil ou atelier détectés",
      "repair-keywords": "Mots-clés réparation détectés",
      "wedding-keywords": "Mots-clés mariage détectés",
      "pet-keywords": "Mots-clés animaux détectés",
      "seasonal-keywords": "Mots-clés saisonniers détectés",
      "business-keywords": "Mots-clés petite entreprise détectés",
      "collector-keywords": "Mots-clés collection détectés",
      "price-signal": "Le prix soutient cette audience",
      "general-match": "Correspondance générale du produit",
    },
    demandReasons: {
      "strong-product-health": "Santé produit forte",
      "weak-product-health": "Santé produit faible",
      "audience-confidence": "Confiance d’audience élevée",
      "marketplace-confidence": "Confiance marketplace élevée",
      "pricing-confidence": "Confiance de prix élevée",
      "price-missing": "Le prix est manquant",
      "image-ready": "Les images sont prêtes",
      "image-missing": "Les images sont incomplètes",
      "seasonal-keywords": "Mots-clés saisonniers détectés",
      "gift-keywords": "Mots-clés cadeau détectés",
      "decor-keywords": "Mots-clés décoration détectés",
      "repair-keywords": "Mots-clés réparation détectés",
      "education-keywords": "Mots-clés éducatifs détectés",
    },
    marketMarketplaces: {
      etsy: "Etsy",
      ebay: "eBay",
      "amazon-handmade": "Amazon Handmade",
      kleinanzeigen: "Kleinanzeigen",
      "facebook-marketplace": "Facebook Marketplace",
      instagram: "Instagram",
      pinterest: "Pinterest",
      "local-marketplace": "Place de marché locale",
      "own-shop": "Boutique propre",
    },
    marketplaceReasons: {
      "handmade-market-fit": "Adapté aux marketplaces faites main",
      "decor-market-fit": "Adapté aux catégories décoration et cadeau",
      "repair-market-fit": "Adapté aux pièces de réparation et outils",
      "visual-market-fit": "Produit visuel adapté aux plateformes sociales",
      "local-simple-product": "Produit simple ou peu cher adapté à la vente locale",
      "brand-ready-product": "Produit assez solide pour une boutique de marque",
      "incomplete-product": "Produit incomplet adapté d’abord au marché local",
      "audience-market-fit": "L’audience prédite correspond à cette marketplace",
      "price-market-fit": "Le prix soutient cette marketplace",
    },
    pricingReasons: {
      "current-price-used": "Prix actuel utilisé comme base",
      "premium-supported": "La catégorie peut soutenir un prix premium",
      "repair-practical-pricing": "Les pièces de réparation favorisent un prix pratique",
      "low-health-confidence": "Une faible santé produit réduit la confiance",
      "marketplace-fit": "La marketplace choisie soutient ce prix",
      "audience-fit": "L’audience prédite soutient ce prix",
      "missing-price": "Ajoutez d’abord le prix",
    },
    fastSaleChances: {
      low: "Faible",
      medium: "Moyenne",
      high: "Élevée",
      "very-high": "Très élevée",
    },
    fastSaleReasons: {
      "publish-ready": "Le produit est prêt à publier",
      "not-publish-ready": "Le produit n’est pas prêt à publier",
      "strong-demand": "La demande attendue est forte",
      "weak-demand": "La demande attendue est faible",
      "marketplace-confidence": "Confiance marketplace élevée",
      "pricing-confidence": "Confiance de prix élevée",
      "image-ready": "Les images sont prêtes",
      "image-missing": "Les images sont incomplètes",
      "price-present": "Le prix est présent",
      "price-missing": "Le prix est manquant",
      "gift-decor-keywords": "Mots-clés cadeau ou décoration détectés",
      "repair-keywords": "Mots-clés réparation détectés",
      "education-keywords": "Mots-clés éducatifs détectés",
      "strong-product-health": "Santé produit forte",
      "weak-product-health": "Santé produit faible",
    },
    marketOpportunitySummaries: {
      "strong-opportunity":
        "Forte opportunité pour {audience} sur {marketplace} avec un potentiel de vente rapide {fastSaleChance}.",
      "moderate-opportunity":
        "Opportunité modérée ; améliorez les images produit et le prix avant publication.",
      "low-opportunity":
        "Faible opportunité tant que les bases manquantes du produit ne sont pas complétées.",
    },
    marketingChannels: {
      "instagram-reels": "Instagram Reels",
      pinterest: "Pinterest",
      "facebook-groups": "Groupes Facebook",
      "facebook-marketplace": "Facebook Marketplace",
      "etsy-search": "Recherche Etsy",
      "ebay-search": "Recherche eBay",
      whatsapp: "WhatsApp",
      "own-shop-content": "Contenu boutique propre",
      "local-community": "Communauté locale",
    },
    marketingChannelReasons: {
      "visual-product": "Le produit est visuel et adapté aux contenus courts.",
      "repair-search": "Le produit dépend d’une intention claire de recherche réparation.",
      "education-community": "Les audiences éducatives réagissent bien dans les communautés.",
      "local-simple-product": "Le produit convient à la vente locale ou directe.",
      "own-shop-ready": "Le produit est assez fort pour du contenu boutique propre.",
      "etsy-marketplace-fit": "La marketplace prédite bénéficie de la recherche Etsy.",
      "direct-local-sharing": "Le partage local direct est un point de départ pratique.",
    },
    competitionLevels: {
      low: "Faible",
      medium: "Moyen",
      high: "Élevé",
    },
    competitionReasons: {
      "personalization-detected": "Personnalisation ou noms détectés.",
      "handmade-differentiation": "Les signaux faits main améliorent la différenciation.",
      "repair-part-niche": "L’usage réparation ou pièce de remplacement rend le produit plus spécifique.",
      "educational-niche": "L’usage éducatif crée une audience plus claire.",
      "decorative-common": "Les produits déco ont souvent une concurrence plus large.",
      "customizable-option": "Les options personnalisables améliorent la différenciation.",
      "niche-keywords": "Mots-clés de niche détectés.",
      "broad-category": "La catégorie est large sans signaux forts de différenciation.",
    },
    businessRecommendations: {
      "publish-now": "Publier maintenant",
      "improve-product-first": "Améliorer le produit d’abord",
      "add-price-first": "Ajouter le prix d’abord",
      "improve-images-first": "Améliorer les images d’abord",
      "focus-on-etsy": "Se concentrer sur Etsy",
      "focus-on-ebay": "Se concentrer sur eBay",
      "focus-on-instagram": "Se concentrer sur Instagram",
      "lower-price": "Baisser le prix",
      "premium-positioning": "Utiliser un positionnement premium",
      "niche-positioning": "Utiliser un positionnement de niche",
    },
    businessRecommendationReasons: {
      "missing-price": "Le prix est nécessaire avant une décision business.",
      "image-readiness": "Les images ou l’image principale doivent être améliorées.",
      "strong-demand": "La demande et la vente rapide indiquent une forte opportunité.",
      "weak-market-readiness": "La préparation marché doit être améliorée avant publication.",
      "marketplace-fit": "La marketplace prédite convient à ce produit.",
      "repair-market-fit": "Les produits de réparation conviennent aux marketplaces de recherche pratique.",
      "visual-channel-fit": "Le produit est visuel et adapté aux canaux sociaux.",
      "pricing-pressure": "La concurrence crée une pression sur le prix.",
      "premium-fit": "Les signaux de différenciation soutiennent un positionnement premium.",
      "niche-advantage": "Les signaux de niche donnent un avantage plus clair au produit.",
    },
    marketingTips: {
      "add-basics-first": "Ajoutez le prix et l’image principale avant le marketing.",
      "gift-lifestyle-photos": "Présentez ce produit comme idée cadeau avec 3 photos lifestyle.",
      "repair-use-case": "Montrez clairement le cas de réparation et listez les pièces compatibles.",
      "pinterest-home-decor": "Utilisez des photos style Pinterest et ciblez les acheteurs déco.",
      "education-classroom": "Montrez comment ce produit sert à l’apprentissage ou en classe.",
      "marketplace-story": "Rédigez une courte histoire adaptée à la marketplace et à l’audience.",
      "premium-brand-story": "Présentez-le avec une histoire de marque et des photos soignées.",
    },
    marketingTipReasons: {
      "missing-price-or-image": "Le marketing nécessite d’abord un prix et une image principale.",
      "gift-audience": "L’audience prédite est orientée cadeau ou vente rapide.",
      "repair-audience": "Cette audience a besoin d’un cas d’usage et de compatibilités clairs.",
      "visual-marketplace": "La marketplace choisie valorise les visuels forts.",
      "education-audience": "L’audience prédite a un usage éducatif.",
      "marketplace-match": "Le conseil correspond à la marketplace et à l’audience.",
      "premium-opportunity": "Le produit est assez fort pour une présentation premium.",
    },
    addPriceFirst: "Ajoutez d’abord le prix",
    publishProgress: "Progression de publication",
    publishProgressHelp:
      "{passed} sur {total} vérifications de publication terminées.",
    publishChecklist: "Liste de publication",
    publishChecklistItems: {
      "has-product-name": "Nom du produit présent",
      "has-category": "Catégorie présente",
      "has-price": "Prix présent",
      "has-description": "Description présente",
      "has-at-least-one-image": "Au moins une image présente",
      "has-main-image": "Image principale présente",
      "product-health-is-good": "La santé du produit est bonne",
      "no-high-priority-recommendations":
        "Aucune recommandation de haute priorité",
    },
    publishChecklistStatuses: {
      passed: "Réussi",
      pending: "En attente",
    },
    publishDecision: "Décision de publication",
    publishReadyLabel: "Prêt à publier",
    publishNotReadyLabel: "Pas encore prêt",
    publishReadyReason: "Toutes les vérifications de publication sont réussies.",
    publishMissingReason: "Premier élément manquant : {itemLabel}",
    publishSafety: "Sécurité de publication",
    publishSafetyCanPublish: "Vous pouvez procéder à la publication.",
    publishSafetyBlocked:
      "La publication est bloquée jusqu’à ce que les exigences soient complètes.",
    publishWarningTitle: "Avertissement de publication",
    publishWarningMessage:
      "Ne publiez pas avant de compléter les éléments manquants.",
    publishProduct: "Publier le produit",
    publishProductHelp:
      "Ceci est seulement un bouton de démonstration. Rien n’est encore publié.",
    finalGateTitle: "Porte finale",
    finalGateOpen: "La porte finale est ouverte.",
    finalGateClosed:
      "La porte finale reste fermée jusqu’à ce que le produit soit complet.",
    finalStampComplete: "✅ Magic Web terminé",
    finalStampWaiting: "⏳ Magic Web attend la finalisation",
    publishCelebration: "🎉 Le produit est prêt à apparaître dans la boutique.",
    publishReadyBadge: "✅ Prêt à publier",
    publishNotReadyBadge: "⏳ Pas encore prêt",
    magicRecommendations: "Recommandations Magic",
    recommendationPriorities: {
      high: "Haute",
      medium: "Moyenne",
      low: "Basse",
    },
    recommendations: {
      "no-images-uploaded": {
        title: "Aucune image importée.",
        description: "Importez au moins une image produit avant la publication.",
      },
      "add-main-product-image": {
        title: "Ajoutez au moins une image principale du produit.",
        description: "Marquez une image importée comme image principale du produit.",
      },
      "description-too-short": {
        title: "La description est trop courte.",
        description: "Ajoutez plus de spécifications produit pour améliorer le brouillon.",
      },
      "missing-category": {
        title: "Le produit n’a pas de catégorie.",
        description: "Choisissez une catégorie afin que le produit puisse être organisé.",
      },
      "missing-price": {
        title: "Le produit n’a pas de prix.",
        description: "Ajoutez un prix avant que ce produit soit prêt à vendre.",
      },
      "more-gallery-images": {
        title: "Plus d’images de galerie sont recommandées.",
        description: "Ajoutez ou marquez plus d’images comme images de galerie.",
      },
      "add-seo-keywords": {
        title: "Ajoutez des mots-clés SEO.",
        description: "Les mots-clés SEO aideront à préparer ce produit pour la recherche.",
      },
      "add-image-alt-text": {
        title: "Ajoutez le texte ALT de l’image.",
        description: "Le texte ALT améliore l’accessibilité et la préparation SEO.",
      },
      "product-card-ready": {
        title: "La fiche produit est prête.",
        description:
          "Le brouillon local contient assez de données pour un aperçu de fiche produit.",
      },
      "product-can-be-published": {
        title: "Le produit peut être publié.",
        description:
          "Le brouillon local possède les signaux minimums de publication.",
      },
      "product-health-below-good": {
        title: "Améliorez la qualité du produit avant la publication.",
        description:
          "Faites passer la santé du produit à Bonne ou Excellente avant la revue finale.",
      },
      "ready-for-final-review": {
        title: "Le produit est prêt pour la revue finale.",
        description:
          "Tous les champs requis sont complets et le produit peut être revu avant publication.",
      },
    },
    autoFixPlan: "Plan de correction automatique",
    autoFixStatuses: {
      suggested: "Suggéré",
      notAvailable: "Non disponible",
    },
    autoFixPlanActions: {
      "add-product-name": {
        label: "Ajouter le nom du produit manuellement",
        description:
          "Saisissez un nom de produit clair afin que les informations principales soient complètes.",
      },
      "choose-category": {
        label: "Choisir une catégorie manuellement",
        description: "Sélectionnez la bonne catégorie pour organiser le produit dans la boutique.",
      },
      "improve-description": {
        label: "Améliorer la description",
        description: "Ajoutez une description plus longue avec les détails importants du produit.",
      },
      "add-price": {
        label: "Ajouter le prix",
        description: "Saisissez le prix du produit avant la revue finale.",
      },
      "upload-product-image": {
        label: "Importer une image produit",
        description: "Ajoutez au moins une image pour afficher clairement le produit.",
      },
      "select-main-image": {
        label: "Marquer une image comme principale",
        description: "Choisissez une image importée comme image principale du produit.",
      },
      "improve-product-details": {
        label: "Compléter les détails du produit",
        description:
          "Complétez les champs et images requis pour améliorer la santé du produit.",
      },
      "ready-for-final-review": {
        label: "Prêt pour la revue finale",
        description: "Aucune étape de correction n’est requise pour le moment.",
      },
    },
    previewIcons: {
      passed: "✅",
      waiting: "⏳",
      blocked: "⛔",
      warning: "⚠️",
    },
    overallStatusTitle: "Statut global",
    overallStatusReady:
      "✅ Toutes les vérifications Magic sont terminées et le produit est prêt.",
    overallStatusWaiting:
      "⏳ Des étapes sont encore nécessaires avant la publication.",
    nextBestActionTitle: "Meilleure action suivante",
    nextBestActions: {
      "add-product-name": {
        message: "Ajoutez le nom du produit pour continuer.",
        priority: "high",
      },
      "choose-category": {
        message: "Choisissez une catégorie de produit.",
        priority: "high",
      },
      "improve-description": {
        message: "Améliorez la description du produit avec assez de détails.",
        priority: "medium",
      },
      "add-price": {
        message: "Ajoutez un prix produit.",
        priority: "high",
      },
      "upload-product-image": {
        message: "Importez au moins une image produit.",
        priority: "high",
      },
      "select-main-image": {
        message: "Sélectionnez une image principale du produit.",
        priority: "high",
      },
      "improve-product-details": {
        message: "Améliorez les détails du produit pour porter la santé du produit à Bonne.",
        priority: "medium",
      },
      "ready-for-final-review": {
        message: "Le produit est prêt pour la revue finale.",
        priority: "low",
      },
    },
    rerunMagicEngine: "Relancer Magic Engine",
    rerunMagicEngineHelp:
      "Recalcule les statuts des étapes à partir des champs actuels.",
    selectedColorsCount: "Nombre de couleurs sélectionnées",
    uploadedImagesCount: "Nombre d'images importées",
    completedSteps: "Étapes terminées",
    waitingSteps: "Étapes en attente",
    notStartedSteps: "Étapes non commencées",
    colors: "Couleurs",
    chooseColors: "Choisir les couleurs",
    customColor: "Couleur personnalisée",
    customColorRequest: "Demande de couleur speciale",
    customColorRequestPlaceholder:
      "Exemple : correspondre a un echantillon client ou une teinte precise",
    images: "Images",
    imageHelp: "Choisissez 3 à 4 images",
    uploadImages: "Importer des images",
    imageRole: "Role de l'image",
    noImageRole: "Aucun role",
    roles: {
      main: "Image principale du produit",
      gallery: "Image de galerie",
      colorGroup: "Image de groupe couleur",
      aiReference: "Image reference IA",
      catalog: "Image catalogue",
      social: "Image reseaux sociaux",
    },
    cancel: "Annuler",
    save: "Enregistrer",
  },
};

const colorOptions = [
  "#f8fafc",
  "#111827",
  "#d93d3d",
  "#f59e0b",
  "#2f9e44",
  "#2563eb",
  "#8b5cf6",
  "#ec4899",
];

const productTypeOptions: ProductTypeOption[] = [
  "educationalGame",
  "woodenPuzzle",
  "memoryGame",
  "chessGame",
  "customInstitutionalOrder",
  "digitalFile",
  "giftBox",
];

const targetAudienceOptions: TargetAudienceOption[] = [
  "children",
  "autismCenter",
  "school",
  "kindergarten",
  "specialEducation",
  "family",
];

const educationalSkillOptions: EducationalSkillOption[] = [
  "memory",
  "focus",
  "matching",
  "numbers",
  "language",
  "visualPerception",
  "fineMotorSkills",
  "logicalThinking",
];

const productionStatusOptions: ProductionStatusOption[] = [
  "notStarted",
  "inProduction",
  "ready",
  "paused",
];

const imageRoles: Array<Exclude<ImageRole, "">> = [
  "main",
  "gallery",
  "colorGroup",
  "aiReference",
  "catalog",
  "social",
];

const analysisFields: AnalysisField[] = [
  "suggestedProductName",
  "category",
  "material",
  "scent",
  "dimensions",
  "availableColors",
  "suggestedKeywords",
  "shortDescription",
  "seoTitle",
  "seoDescription",
  "urlSlug",
  "imageAltText",
];

const productCardFields: ProductCardField[] = [
  "productName",
  "category",
  "materials",
  "scent",
  "colors",
  "price",
  "shortDescription",
  "seoTitle",
  "seoDescription",
  "urlSlug",
  "imageAltText",
  "tags",
];

const blueprintSections: Array<{
  id: BlueprintSection;
  fields: BlueprintField[];
}> = [
  {
    id: "productIdentity",
    fields: ["productName", "category", "collection", "productType"],
  },
  {
    id: "productDetails",
    fields: ["materials", "dimensions", "weight", "scent", "availableColors"],
  },
  {
    id: "marketing",
    fields: ["shortDescription", "longDescription", "highlights", "benefits"],
  },
  {
    id: "seo",
    fields: [
      "seoTitle",
      "seoDescription",
      "urlSlug",
      "suggestedKeywords",
      "imageAltText",
    ],
  },
  {
    id: "store",
    fields: ["tags", "displayPriority", "suggestedGalleryOrder"],
  },
];

const engineSteps: EngineStep[] = [
  "images",
  "specifications",
  "productUnderstanding",
  "productCard",
  "productBlueprint",
  "productContent",
  "seo",
  "aiImages",
  "readyToPublish",
];

export default function ProductModal({
  open,
  onClose,
  lang,
}: ProductModalProps) {
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [isColorPanelOpen, setIsColorPanelOpen] = useState(false);
  const [productName, setProductName] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productType, setProductType] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [educationalSkills, setEducationalSkills] = useState<
    EducationalSkillOption[]
  >([]);
  const [sku, setSku] = useState("");
  const [productCode, setProductCode] = useState("");
  const [productVersion, setProductVersion] = useState("");
  const [material, setMaterial] = useState("");
  const [thickness, setThickness] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [productionCountry, setProductionCountry] = useState("");
  const [factoryLocation, setFactoryLocation] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [minimumStockAlert, setMinimumStockAlert] = useState("");
  const [manufacturingProductionStatus, setManufacturingProductionStatus] =
    useState("");
  const [baseCost, setBaseCost] = useState("");
  const [suggestedPrice, setSuggestedPrice] = useState("");
  const [institutionPrice, setInstitutionPrice] = useState("");
  const [wholesalePrice, setWholesalePrice] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productStatus, setProductStatus] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [showAnalysisPreview, setShowAnalysisPreview] = useState(false);
  const [showProductCardPreview, setShowProductCardPreview] = useState(false);
  const [showBlueprintPreview, setShowBlueprintPreview] = useState(false);
  const [magicEngineRefreshKey, setMagicEngineRefreshKey] = useState(0);
  const [customColorRequest, setCustomColorRequest] = useState("");
  const [managedImages, setManagedImages] = useState<ManagedImage[]>([]);
  const draggedImageIndex = useRef<number | null>(null);
  const imagePreviewUrls = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      imagePreviewUrls.current.forEach((preview) =>
        URL.revokeObjectURL(preview)
      );
    };
  }, []);

  if (!open) {
    return null;
  }

  const text = modalText[lang];
  const magicEngineResult = buildLocalProductDraft({
    name: productName,
    category: productCategory,
    description: productDescription,
    colors: availableColors,
    images: managedImages,
    status: productStatus || "draft",
  });
  const {
    autoFixPlanActions,
    completionScore,
    completionScoreColor,
    estimatedTimeToPublishId,
    firstFailedPublishChecklistItem,
    isPublishReady,
    magicConfidenceLevel,
    magicConfidenceScore,
    magicRecommendations,
    marketPotential,
    nextBestActionId,
    productHealthLevel: productHealthLevelId,
    productHealthScore,
    publishChecklistItems,
    publishChecklistProgress,
  } = buildMagicEnginePreviewState({
    productName,
    productCategory,
    productPrice,
    productDescription,
    images: managedImages,
  });
  const productHealthLevel = text.productHealthLevels[productHealthLevelId];
  const magicConfidenceLabel =
    text.magicConfidenceLabels[magicConfidenceLevel];
  const estimatedTimeToPublish =
    text.estimatedTimeToPublishItems[estimatedTimeToPublishId];
  const firstFailedPublishChecklistLabel = firstFailedPublishChecklistItem
    ? text.publishChecklistItems[firstFailedPublishChecklistItem.id]
    : "";
  const magicWebSummaryTitle = isPublishReady
    ? text.magicWebSummaryReadyTitle
    : text.magicWebSummaryInProgressTitle;
  const magicWebSummaryMessage = isPublishReady
    ? text.magicWebSummaryReadyMessage
    : text.magicWebSummaryInProgressMessage;
  const productHealthSummary = text.productHealthSummary
    .replace("{level}", productHealthLevel)
    .replace("{score}", String(productHealthScore));
  const marketOpportunitySummary =
    text.marketOpportunitySummaries[marketPotential.opportunitySummary]
      .replace(
        "{audience}",
        text.marketAudiences[marketPotential.audiencePrediction.primaryAudience]
      )
      .replace(
        "{marketplace}",
        text.marketMarketplaces[
          marketPotential.marketplacePrediction.bestMarketplace
        ]
      )
      .replace(
        "{fastSaleChance}",
        text.fastSaleChances[marketPotential.fastSalePrediction.chance]
      );
  const magicDashboardItems = [
    {
      icon: "◆",
      title: text.productHealth,
      value: `${productHealthLevel} · ${productHealthScore}%`,
    },
    {
      icon: "✦",
      title: text.magicConfidence,
      value: `${magicConfidenceLabel} · ${magicConfidenceScore}%`,
    },
    {
      icon: "▣",
      title: text.publishProgress,
      value: `${publishChecklistProgress.percentage}%`,
    },
    {
      icon: "◷",
      title: text.estimatedTimeToPublish,
      value: estimatedTimeToPublish.time,
    },
    {
      icon: isPublishReady
        ? text.previewIcons.passed
        : text.previewIcons.waiting,
      title: text.overallStatusTitle,
      value: isPublishReady ? text.publishReadyBadge : text.publishNotReadyBadge,
    },
  ];
  const nextBestAction = text.nextBestActions[nextBestActionId];
  const nextBestActionTone =
    nextBestAction.priority === "high"
      ? {
          background: "#fef2f2",
          border: "1px solid #fecaca",
          boxShadow: "inset 4px 0 0 #dc2626",
          color: "#991b1b",
        }
      : nextBestAction.priority === "medium"
        ? {
            background: "#fffbeb",
            border: "1px solid #fde68a",
            boxShadow: "inset 4px 0 0 #d97706",
            color: "#92400e",
          }
        : {
            background: "#ecfdf5",
            border: "1px solid #bbf7d0",
            boxShadow: "inset 4px 0 0 #16a34a",
            color: "#166534",
          };
  const publishReadinessLabel = isPublishReady
    ? text.publishReadyLabel
    : text.publishNotReadyLabel;
  const publishReadinessReason = isPublishReady
    ? text.publishReadyReason
    : text.publishMissingReason.replace(
        "{itemLabel}",
        firstFailedPublishChecklistLabel
      );
  const engineStatusByStep: Record<EngineStep, EngineStatus> = {
    images: managedImages.length > 0 ? "ready" : "waiting",
    specifications: productDescription.trim() ? "ready" : "waiting",
    productUnderstanding: showAnalysisPreview ? "ready" : "notStarted",
    productCard: showProductCardPreview ? "ready" : "notStarted",
    productBlueprint: showBlueprintPreview ? "ready" : "notStarted",
    productContent: showBlueprintPreview ? "waiting" : "notStarted",
    seo: showBlueprintPreview ? "waiting" : "notStarted",
    aiImages: managedImages.some((image) => image.role === "aiReference")
      ? "waiting"
      : "notStarted",
    readyToPublish:
      showAnalysisPreview && showProductCardPreview && showBlueprintPreview
        ? "waiting"
        : "notStarted",
  };

  function toggleColor(color: string) {
    setAvailableColors((current) =>
      current.includes(color)
        ? current.filter((item) => item !== color)
        : [...current, color]
    );
  }

  function addCustomColor(color: string) {
    setAvailableColors((current) =>
      current.includes(color) ? current : [...current, color]
    );
  }

  function toggleEducationalSkill(skill: EducationalSkillOption) {
    setEducationalSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill]
    );
  }

  function handleImagesChange(event: ChangeEvent<HTMLInputElement>) {
    imagePreviewUrls.current.forEach((preview) => URL.revokeObjectURL(preview));

    const files = Array.from(event.target.files || []).slice(0, 4);
    const nextImages = files.map((file, index) => {
      const preview = URL.createObjectURL(file);

      return {
        id: `${file.name}-${file.lastModified}-${index}`,
        preview,
        role: "" as ImageRole,
      };
    });

    imagePreviewUrls.current = nextImages.map((image) => image.preview);
    setManagedImages(nextImages);
  }

  function updateImageRole(imageId: string, role: ImageRole) {
    setManagedImages((current) =>
      current.map((image) => {
        if (role === "main" && image.id !== imageId && image.role === "main") {
          return { ...image, role: "" };
        }

        if (image.id !== imageId) {
          return image;
        }

        return { ...image, role };
      })
    );
  }

  function handleImageDragStart(index: number) {
    draggedImageIndex.current = index;
  }

  function handleImageDrop(
    event: DragEvent<HTMLDivElement>,
    targetIndex: number
  ) {
    event.preventDefault();

    const sourceIndex = draggedImageIndex.current;
    draggedImageIndex.current = null;

    if (sourceIndex === null || sourceIndex === targetIndex) {
      return;
    }

    setManagedImages((current) => {
      const nextImages = [...current];
      const [draggedImage] = nextImages.splice(sourceIndex, 1);

      if (!draggedImage) {
        return current;
      }

      nextImages.splice(targetIndex, 0, draggedImage);
      return nextImages;
    });
  }

  return (
    <div className="dkProductModalOverlay" role="presentation">
      <div
        className="dkProductModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
        dir={lang === "ar" ? "rtl" : "ltr"}
      >
        <h2 id="product-modal-title">{text.title}</h2>

        <form
          className="dkProductModalForm"
          onSubmit={(event) => event.preventDefault()}
        >
          <section className="dkProductModalSection">
            <div className="dkProductModalSectionHeader">
              <h3>{text.basicInformationSection}</h3>
              <p>{text.basicInformationHelp}</p>
            </div>

            <label>
              <span>{text.productName}</span>
              <input
                type="text"
                name="productName"
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
              />
            </label>

            <label>
              <span>{text.category}</span>
              <input
                type="text"
                name="category"
                value={productCategory}
                onChange={(event) => setProductCategory(event.target.value)}
              />
            </label>

            <label>
              <span>{text.sku}</span>
              <input
                type="text"
                name="sku"
                value={sku}
                onChange={(event) => setSku(event.target.value)}
              />
            </label>

            <label>
              <span>{text.productCode}</span>
              <input
                type="text"
                name="productCode"
                value={productCode}
                onChange={(event) => setProductCode(event.target.value)}
              />
            </label>

            <label>
              <span>{text.productVersion}</span>
              <input
                type="text"
                name="productVersion"
                value={productVersion}
                onChange={(event) => setProductVersion(event.target.value)}
              />
            </label>

            <label>
              <span>{text.status}</span>
              <select
                name="status"
                value={productStatus}
                onChange={(event) => setProductStatus(event.target.value)}
              >
                <option value="" disabled>
                  {text.statusPlaceholder}
                </option>
                <option value="active">{text.active}</option>
                <option value="draft">{text.draft}</option>
                <option value="archived">{text.archived}</option>
              </select>
            </label>

            <label>
              <span>{text.productDescription}</span>
              <p>{text.productDescriptionHelp}</p>
              <textarea
                name="productDescription"
                value={productDescription}
                placeholder={text.productDescriptionPlaceholder}
                onChange={(event) => setProductDescription(event.target.value)}
              />
            </label>
          </section>

          <section className="dkProductModalSection">
            <div className="dkProductModalSectionHeader">
              <h3>{text.educationalClassificationSection}</h3>
              <p>{text.educationalClassificationHelp}</p>
            </div>

            <label>
              <span>{text.productType}</span>
              <select
                name="productType"
                value={productType}
                onChange={(event) => setProductType(event.target.value)}
              >
                <option value="" disabled>
                  {text.productTypePlaceholder}
                </option>
                {productTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {text.productTypes[option]}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>{text.targetAudience}</span>
              <select
                name="targetAudience"
                value={targetAudience}
                onChange={(event) => setTargetAudience(event.target.value)}
              >
                <option value="" disabled>
                  {text.targetAudiencePlaceholder}
                </option>
                {targetAudienceOptions.map((option) => (
                  <option key={option} value={option}>
                    {text.targetAudiences[option]}
                  </option>
                ))}
              </select>
            </label>

            <div className="dkProductModalField">
              <span>{text.educationalSkills}</span>
              <p>{text.educationalSkillsHelp}</p>
              <div className="dkProductOptionGrid">
                {educationalSkillOptions.map((skill) => (
                  <label key={skill} className="dkProductCheckboxOption">
                    <input
                      type="checkbox"
                      checked={educationalSkills.includes(skill)}
                      onChange={() => toggleEducationalSkill(skill)}
                    />
                    <span>{text.educationalSkillOptions[skill]}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          <section className="dkProductModalSection">
            <div className="dkProductModalSectionHeader">
              <h3>{text.manufacturingSection}</h3>
              <p>{text.manufacturingSectionHelp}</p>
            </div>

            <label>
              <span>{text.material}</span>
              <input
                type="text"
                name="material"
                value={material}
                onChange={(event) => setMaterial(event.target.value)}
              />
            </label>

            <label>
              <span>{text.thickness}</span>
              <input
                type="text"
                name="thickness"
                value={thickness}
                onChange={(event) => setThickness(event.target.value)}
              />
            </label>

            <label>
              <span>{text.dimensions}</span>
              <input
                type="text"
                name="dimensions"
                value={dimensions}
                onChange={(event) => setDimensions(event.target.value)}
              />
            </label>

            <label>
              <span>{text.productionCountry}</span>
              <input
                type="text"
                name="productionCountry"
                value={productionCountry}
                onChange={(event) => setProductionCountry(event.target.value)}
              />
            </label>

            <label>
              <span>{text.factoryLocation}</span>
              <input
                type="text"
                name="factoryLocation"
                value={factoryLocation}
                onChange={(event) => setFactoryLocation(event.target.value)}
              />
            </label>
          </section>

          <section className="dkProductModalSection">
            <div className="dkProductModalSectionHeader">
              <h3>{text.inventorySection}</h3>
              <p>{text.inventorySectionHelp}</p>
            </div>

            <label>
              <span>{text.stockQuantity}</span>
              <input
                type="number"
                name="stockQuantity"
                min="0"
                step="1"
                value={stockQuantity}
                onChange={(event) => setStockQuantity(event.target.value)}
              />
            </label>

            <label>
              <span>{text.minimumStockAlert}</span>
              <input
                type="number"
                name="minimumStockAlert"
                min="0"
                step="1"
                value={minimumStockAlert}
                onChange={(event) => setMinimumStockAlert(event.target.value)}
              />
            </label>

            <label>
              <span>{text.productionStatus}</span>
              <select
                name="productionStatus"
                value={manufacturingProductionStatus}
                onChange={(event) =>
                  setManufacturingProductionStatus(event.target.value)
                }
              >
                <option value="" disabled>
                  {text.productionStatusPlaceholder}
                </option>
                {productionStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {text.productionStatuses[status]}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="dkProductModalSection">
            <div className="dkProductModalSectionHeader">
              <h3>{text.pricingPreparationSection}</h3>
              <p>{text.pricingPreparationSectionHelp}</p>
            </div>

            <label>
              <span>{text.price}</span>
              <input
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={productPrice}
                onChange={(event) => setProductPrice(event.target.value)}
              />
            </label>

            <label>
              <span>{text.baseCost}</span>
              <input
                type="number"
                name="baseCost"
                min="0"
                step="0.01"
                value={baseCost}
                onChange={(event) => setBaseCost(event.target.value)}
              />
            </label>

            <label>
              <span>{text.suggestedPrice}</span>
              <input
                type="number"
                name="suggestedPrice"
                min="0"
                step="0.01"
                value={suggestedPrice}
                onChange={(event) => setSuggestedPrice(event.target.value)}
              />
            </label>

            <label>
              <span>{text.institutionPrice}</span>
              <input
                type="number"
                name="institutionPrice"
                min="0"
                step="0.01"
                value={institutionPrice}
                onChange={(event) => setInstitutionPrice(event.target.value)}
              />
            </label>

            <label>
              <span>{text.wholesalePrice}</span>
              <input
                type="number"
                name="wholesalePrice"
                min="0"
                step="0.01"
                value={wholesalePrice}
                onChange={(event) => setWholesalePrice(event.target.value)}
              />
            </label>
          </section>

          <section className="dkProductModalSection">
            <div className="dkProductModalSectionHeader">
              <h3>{text.futureBarcodeSection}</h3>
              <p>{text.futureBarcodeSectionHelp}</p>
            </div>

            <label>
              <span>{text.barcodeQrCode}</span>
              <textarea
                name="barcodeQrCodeFutureNote"
                value={text.barcodeQrCodeFutureNote}
                readOnly
              />
            </label>
          </section>

          <section className="dkProductEnginePanel">
            <h3>{text.engineTitle}</h3>
            <div className="dkProductEngineSteps">
              {engineSteps.map((step, index) => {
                const stepStatus = engineStatusByStep[step];

                return (
                  <div
                    key={step}
                    className={`dkProductEngineStep ${stepStatus}`}
                  >
                    <span className="dkProductEngineIndex">{index + 1}</span>
                    <div>
                      <strong>{text.engineSteps[step]}</strong>
                      <span>{text.engineStatuses[stepStatus]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="mb-4 space-y-4">
            <CreatorWorkspacePreview lang={lang} />
          </div>

          <div className="dkProductCardPreview">
            <div className="dkProductAnalysisHeader">
              <h3>{text.magicEnginePreview}</h3>
              <p>{text.rerunMagicEngineHelp}</p>
            </div>

            <button
              type="button"
              className="dkProductAnalyzeButton"
              onClick={() => setMagicEngineRefreshKey((current) => current + 1)}
            >
              {text.rerunMagicEngine}
            </button>

            <MagicCreatorSkeleton lang={lang} />

            <MagicDashboard
              completionScore={completionScore}
              completionScoreColor={completionScoreColor}
              completionScoreLabel={text.completionScore}
              dashboardItems={magicDashboardItems}
            />

            <div className="dkProductAnalysisHeader">
              <h3>{text.magicWebSummary}</h3>
            </div>

            <div className="dkProductCardPreviewGrid">
              <div className="dkProductCardPreviewItem">
                <strong>{magicWebSummaryTitle}</strong>
                <p>{magicWebSummaryMessage}</p>
              </div>
            </div>

            <ProductHealthCard
              levelLabel={productHealthLevel}
              score={productHealthScore}
              summary={productHealthSummary}
              title={text.productHealth}
            />

            <MagicConfidenceCard
              levelLabel={magicConfidenceLabel}
              percentage={magicConfidenceScore}
              title={text.magicConfidence}
            />

            <EstimatedTimeCard
              explanation={estimatedTimeToPublish.explanation}
              time={estimatedTimeToPublish.time}
              title={text.estimatedTimeToPublish}
            />

            <MarketPotentialCard
              aggressivePrice={
                marketPotential.pricingPrediction.aggressivePrice ||
                text.addPriceFirst
              }
              alternativeMarketplaceLabels={
                marketPotential.marketplacePrediction.alternativeMarketplaces
                  .length > 0
                  ? marketPotential.marketplacePrediction.alternativeMarketplaces.map(
                      (marketplace) => text.marketMarketplaces[marketplace]
                    )
                  : [
                      text.marketMarketplaces[
                        marketPotential.marketplacePrediction.bestMarketplace
                      ],
                    ]
              }
              bestMarketplaceLabel={
                text.marketMarketplaces[
                  marketPotential.marketplacePrediction.bestMarketplace
                ]
              }
              businessRecommendationConfidence={
                marketPotential.businessRecommendation.confidence
              }
              businessRecommendationLabel={
                text.businessRecommendations[
                  marketPotential.businessRecommendation.recommendation
                ]
              }
              businessRecommendationReasons={marketPotential.businessRecommendation.reasons.map(
                (reason) => text.businessRecommendationReasons[reason]
              )}
              chanceOfFastSaleLabel={
                text.fastSaleChances[marketPotential.fastSalePrediction.chance]
              }
              competitionConfidence={
                marketPotential.competitionPrediction.confidence
              }
              competitionLevelLabel={
                text.competitionLevels[
                  marketPotential.competitionPrediction.competitionLevel
                ]
              }
              competitionReasons={marketPotential.competitionPrediction.reasons.map(
                (reason) => text.competitionReasons[reason]
              )}
              demandConfidence={
                marketPotential.demandPrediction.demandConfidence
              }
              demandReasons={marketPotential.demandPrediction.reasons.map(
                (reason) => text.demandReasons[reason]
              )}
              differentiationScore={
                marketPotential.competitionPrediction.differentiationScore
              }
              expectedDemandLabel={
                text.marketDemandLevels[
                  marketPotential.demandPrediction.demandLevel
                ]
              }
              fastSaleConfidence={
                marketPotential.fastSalePrediction.confidence
              }
              fastSaleReasons={marketPotential.fastSalePrediction.reasons.map(
                (reason) => text.fastSaleReasons[reason]
              )}
              labels={text.marketPotentialLabels}
              magicScore={marketPotential.magicScore}
              marketingTip={text.marketingTips[marketPotential.marketingTip.tip]}
              marketingTipReason={
                text.marketingTipReasons[marketPotential.marketingTip.reason]
              }
              marketingChannel={
                text.marketingChannels[
                  marketPotential.marketingChannel.channel
                ]
              }
              marketingChannelConfidence={
                marketPotential.marketingChannel.confidence
              }
              marketingChannelReason={
                text.marketingChannelReasons[
                  marketPotential.marketingChannel.reason
                ]
              }
              marketplaceConfidence={
                marketPotential.marketplacePrediction.confidence
              }
              marketplaceReasons={marketPotential.marketplacePrediction.reasons.map(
                (reason) => text.marketplaceReasons[reason]
              )}
              opportunitySummary={marketOpportunitySummary}
              premiumPrice={
                marketPotential.pricingPrediction.premiumPrice ||
                text.addPriceFirst
              }
              pricingConfidence={
                marketPotential.pricingPrediction.pricingConfidence
              }
              pricingReasons={marketPotential.pricingPrediction.reasons.map(
                (reason) => text.pricingReasons[reason]
              )}
              predictionConfidence={
                marketPotential.audiencePrediction.confidence
              }
              primaryAudienceLabel={
                text.marketAudiences[
                  marketPotential.audiencePrediction.primaryAudience
                ]
              }
              reasons={marketPotential.audiencePrediction.reasons.map(
                (reason) => text.audienceReasons[reason]
              )}
              recommendedPrice={
                marketPotential.pricingPrediction.recommendedPrice ||
                text.addPriceFirst
              }
              secondaryAudienceLabels={
                marketPotential.audiencePrediction.secondaryAudiences.length > 0
                  ? marketPotential.audiencePrediction.secondaryAudiences.map(
                      (audience) => text.marketAudiences[audience]
                    )
                  : [
                      text.marketAudiences[
                        marketPotential.audiencePrediction.primaryAudience
                      ],
                    ]
              }
              title={text.marketPotential}
              wholesalePrice={
                marketPotential.pricingPrediction.wholesalePrice ||
                text.addPriceFirst
              }
            />

            <MagicProgressCard
              completed={magicEngineResult.completionProgress.completed}
              helpText={text.magicProgressHelp
                .replace(
                  "{completed}",
                  String(magicEngineResult.completionProgress.completed)
                )
                .replace(
                  "{total}",
                  String(magicEngineResult.completionProgress.total)
                )}
              percentage={magicEngineResult.completionProgress.percentage}
              title={text.magicProgress}
              total={magicEngineResult.completionProgress.total}
            />

            <div className="dkProductEngineSteps" key={magicEngineRefreshKey}>
              {magicEngineResult.steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`dkProductEngineStep ${step.status}`}
                >
                  <span className="dkProductEngineIndex">{index + 1}</span>
                  <div>
                    <strong>{step.title[lang]}</strong>
                    <span>{text.enginePreviewStatuses[step.status]}</span>
                    <p>{step.description[lang]}</p>
                  </div>
                </div>
              ))}
            </div>

            <PublishChecklistCard
              itemLabels={text.publishChecklistItems}
              items={publishChecklistItems}
              statusLabels={text.publishChecklistStatuses}
              title={text.publishChecklist}
            />

            <MagicProgressCard
              completed={publishChecklistProgress.passed}
              helpText={text.publishProgressHelp
                .replace("{passed}", String(publishChecklistProgress.passed))
                .replace("{total}", String(publishChecklistProgress.total))}
              percentage={publishChecklistProgress.percentage}
              title={text.publishProgress}
              total={publishChecklistProgress.total}
            />

            <PublishStatusCards
              finalGateClosed={text.finalGateClosed}
              finalGateOpen={text.finalGateOpen}
              finalGateTitle={text.finalGateTitle}
              finalStampComplete={text.finalStampComplete}
              finalStampWaiting={text.finalStampWaiting}
              isPublishReady={isPublishReady}
              previewIcons={text.previewIcons}
              publishCelebration={text.publishCelebration}
              publishDecisionTitle={text.publishDecision}
              publishNotReadyBadge={text.publishNotReadyBadge}
              publishProduct={text.publishProduct}
              publishProductHelp={text.publishProductHelp}
              publishReadinessLabel={publishReadinessLabel}
              publishReadinessReason={publishReadinessReason}
              publishReadyBadge={text.publishReadyBadge}
              publishSafetyBlocked={text.publishSafetyBlocked}
              publishSafetyCanPublish={text.publishSafetyCanPublish}
              publishSafetyTitle={text.publishSafety}
              publishWarningMessage={text.publishWarningMessage}
              publishWarningTitle={text.publishWarningTitle}
            />

            <MagicRecommendationsCard
              priorities={text.recommendationPriorities}
              recommendations={magicRecommendations}
              recommendationText={text.recommendations}
              title={text.magicRecommendations}
            />

            <AutoFixPlanCard
              actionText={text.autoFixPlanActions}
              actions={autoFixPlanActions}
              statusLabels={text.autoFixStatuses}
              title={text.autoFixPlan}
            />

            <OverallStatusCard
              message={
                isPublishReady
                  ? text.overallStatusReady
                  : text.overallStatusWaiting
              }
              title={text.overallStatusTitle}
            />

            <NextBestActionCard
              message={nextBestAction.message}
              priorityLabel={
                text.recommendationPriorities[nextBestAction.priority]
              }
              title={text.nextBestActionTitle}
              tone={nextBestActionTone}
            />
          </div>

          <div className="dkProductAnalysisBox">
            <button
              type="button"
              className="dkProductAnalyzeButton"
              onClick={() => setShowAnalysisPreview(true)}
            >
              {text.analyzeSpecifications}
            </button>

            {showAnalysisPreview && (
              <div className="dkProductAnalysisPreview">
                <div className="dkProductAnalysisHeader">
                  <h3>{text.analysisTitle}</h3>
                  <p>{text.analysisConfidence}</p>
                </div>

                <div className="dkProductAnalysisGrid">
                  {analysisFields.map((field) => (
                    <div key={field} className="dkProductAnalysisItem">
                      <span className="dkProductAnalysisIcon" aria-hidden="true">
                        ✓
                      </span>
                      <div>
                        <span>{text.analysisFields[field]}</span>
                        <strong>{text.analysisPlaceholder}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="dkProductCardBuilder">
            <button
              type="button"
              className="dkProductBuildCardButton"
              onClick={() => setShowProductCardPreview(true)}
            >
              {text.buildProductCard}
            </button>

            {showProductCardPreview && (
              <div className="dkProductCardPreview">
                <div className="dkProductCardPreviewGrid">
                  {productCardFields.map((field) => (
                    <div key={field} className="dkProductCardPreviewItem">
                      <span>{text.productCardFields[field]}</span>
                      <strong>{text.productCardPlaceholder}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="dkProductBlueprintBuilder">
            <button
              type="button"
              className="dkProductBlueprintButton"
              onClick={() => setShowBlueprintPreview(true)}
            >
              {text.generateBlueprint}
            </button>

            {showBlueprintPreview && (
              <div className="dkProductBlueprintPreview">
                {blueprintSections.map((section) => (
                  <section key={section.id} className="dkProductBlueprintSection">
                    <h3>✓ {text.blueprintSections[section.id]}</h3>
                    <div className="dkProductBlueprintGrid">
                      {section.fields.map((field) => (
                        <div key={field} className="dkProductBlueprintItem">
                          <span>{text.blueprintFields[field]}</span>
                          <strong>{text.blueprintPlaceholder}</strong>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>

          <div className="dkProductModalField">
            <span>{text.colors}</span>
            <div className="dkProductColorPicker">
              <button
                type="button"
                className="dkProductColorField"
                aria-expanded={isColorPanelOpen}
                onClick={() => setIsColorPanelOpen((current) => !current)}
              >
                {availableColors.length > 0 ? (
                  <span className="dkProductSelectedColors">
                    {availableColors.map((color) => (
                      <span
                        key={color}
                        className="dkProductSelectedColor"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </span>
                ) : (
                  <span className="dkProductColorPlaceholder">
                    {text.chooseColors}
                  </span>
                )}
              </button>

              {isColorPanelOpen && (
                <div className="dkProductColorPanel">
                  <div className="dkProductColorSwatches">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={
                          availableColors.includes(color)
                            ? "dkProductColorSwatch active"
                            : "dkProductColorSwatch"
                        }
                        style={{ backgroundColor: color }}
                        aria-label={color}
                        aria-pressed={availableColors.includes(color)}
                        onClick={() => toggleColor(color)}
                      />
                    ))}
                  </div>

                  <label className="dkProductNativeColor">
                    <span>{text.customColor}</span>
                    <input
                      type="color"
                      defaultValue="#2457ff"
                      onChange={(event) => addCustomColor(event.target.value)}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>

          <label>
            <span>{text.customColorRequest}</span>
            <input
              type="text"
              name="customColorRequest"
              value={customColorRequest}
              placeholder={text.customColorRequestPlaceholder}
              onChange={(event) => setCustomColorRequest(event.target.value)}
            />
          </label>

          <div className="dkProductModalField">
            <span>{text.images}</span>
            <p>{text.imageHelp}</p>

            <label className="dkProductImageUpload">
              {text.uploadImages}
              <input
                type="file"
                name="images"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
              />
            </label>

            <div className="dkProductImagePreviewGrid">
              {[0, 1, 2, 3].map((index) => {
                const image = managedImages[index];
                const roleLabel = image?.role
                  ? text.roles[image.role]
                  : text.noImageRole;

                return (
                  <div
                    key={image?.id || index}
                    className={
                      image
                        ? "dkProductImagePreview hasImage"
                        : "dkProductImagePreview"
                    }
                    draggable={Boolean(image)}
                    onDragStart={() => handleImageDragStart(index)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleImageDrop(event, index)}
                  >
                    {image ? (
                      <>
                        <span className="dkProductImageRoleBadge">
                          {roleLabel}
                        </span>
                        <select
                          value={image.role}
                          aria-label={text.imageRole}
                          className="dkProductImageRoleSelect"
                          onChange={(event) =>
                            updateImageRole(
                              image.id,
                              event.target.value as ImageRole
                            )
                          }
                        >
                          <option value="">{text.noImageRole}</option>
                          {imageRoles.map((role) => (
                            <option key={role} value={role}>
                              {text.roles[role]}
                            </option>
                          ))}
                        </select>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.preview} alt="" />
                      </>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="dkProductModalActions">
            <button type="button" onClick={onClose}>
              {text.cancel}
            </button>
            <button type="submit" className="dkProductModalSave">
              {text.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
