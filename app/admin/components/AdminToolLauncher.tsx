"use client";

import { DkHeroCard } from "../../components/ui";
import {
  adminTools,
  visibleAdminTools,
  type AdminAccessLevel,
  type AdminTool,
} from "../config/adminTools";
import { adminToolsTranslations } from "../config/adminToolsTranslations";
import type { Lang } from "../config/translations";

// TODO: Replace this temporary access level with the real permissions provider.
const currentAccessLevel: AdminAccessLevel = "developer";

type Props = {
  lang: Lang;
  tools?: AdminTool[];
  heading?: boolean;
  filterByAccess?: boolean;
  showNumbers?: boolean;
  compactOverlay?: boolean;
};

export default function AdminToolLauncher({
  lang,
  tools = adminTools,
  heading = true,
  filterByAccess = true,
  showNumbers = false,
  compactOverlay = false,
}: Props) {
  const copy = adminToolsTranslations[lang];
  const displayedTools = filterByAccess
    ? visibleAdminTools(tools, currentAccessLevel)
    : tools.filter((tool) => tool.status !== "hidden");
  const studioLabels: Record<string, string> =
    lang === "ar"
      ? { canva: "مساعد Canva للتصميم 🎨", marketing: "استوديو التسويق الذكي 🧠" }
      : lang === "de"
        ? { canva: "Canva-Designassistent 🎨", marketing: "KI-Marketingstudio 🧠" }
        : lang === "fr"
          ? { canva: "Assistant de conception Canva 🎨", marketing: "Studio marketing IA 🧠" }
          : { canva: "Canva Design Assistant 🎨", marketing: "AI Marketing Studio 🧠" };

  return (
    <section
      className={`dkAdminTools${compactOverlay ? " dkAdminTools--compact" : ""}`}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {heading && (
        <header>
          <h2>{copy.heading}</h2>
          <p>{copy.intro}</p>
        </header>
      )}
      <div className={`dkAdminToolsGrid dk-hero-grid${compactOverlay ? " dk-feature-grid" : ""}`}>
        {displayedTools.map((tool, index) => {
          const key = tool.titleKey.split(".")[0];
          const entry = copy.entries[key] ?? {
            title: studioLabels[key] ?? tool.id,
            description: "",
          };

          return (
            <DkHeroCard
              key={tool.id}
              title={entry.title}
              imageSrc={tool.image}
              imageAlt=""
              href={tool.href}
              priority={index === 0}
              overlay={compactOverlay}
              className={`studioToolCard${compactOverlay ? " dk-feature-card" : ""}`}
            >
              {showNumbers && tool.number && (
                <b className="studioToolNumber" dir="ltr">{tool.number}</b>
              )}
            </DkHeroCard>
          );
        })}
      </div>
    </section>
  );
}
