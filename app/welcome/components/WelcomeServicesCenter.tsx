"use client";

import {
  CircleHelp,
  CreditCard,
  Info,
  Lightbulb,
  Mail,
  PackageCheck,
  ShieldCheck,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";
import { routes } from "../../config/routes";
import { DkCreatorButton, DkGlassPanel } from "../../components/ui";

type ServiceItem = {
  key:
    | "about"
    | "privacy"
    | "dataProtection"
    | "payment"
    | "shipping"
    | "faq"
    | "contact"
    | "suggestFeature";
  href: string;
  icon: LucideIcon;
};

const SERVICE_ITEMS: ServiceItem[] = [
  { key: "about", href: routes.info("about"), icon: Info },
  { key: "privacy", href: routes.info("privacy"), icon: ShieldCheck },
  { key: "dataProtection", href: routes.info("data-protection"), icon: PackageCheck },
  { key: "payment", href: routes.info("payment"), icon: CreditCard },
  { key: "shipping", href: routes.info("shipping"), icon: Truck },
  { key: "faq", href: routes.info("faq"), icon: CircleHelp },
  { key: "contact", href: routes.info("contact"), icon: Mail },
  { key: "suggestFeature", href: routes.info("suggestions"), icon: Lightbulb },
];

export const WELCOME_SERVICES_CENTER_ID = "dekokraft-services-information-center";

export default function WelcomeServicesCenter() {
  const { direction, t } = useLanguage();

  return (
    <section
      id={WELCOME_SERVICES_CENTER_ID}
      className="welcomeServicesCenter"
      aria-labelledby="welcome-services-center-title"
      dir={direction}
    >
      <DkGlassPanel as="div" strength="subtle" className="welcomeServicesCenterPanel">
        <header className="welcomeServicesCenterHeader">
          <h2 id="welcome-services-center-title">{t("servicesCenter.title")}</h2>
          <p>{t("servicesCenter.description")}</p>
        </header>

        <nav
          className="welcomeServicesCenterGrid"
          aria-label={t("servicesCenter.navigationLabel")}
        >
          {SERVICE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <DkCreatorButton
                key={item.key}
                className="welcomeServicesCenterCard"
                href={item.href}
                icon={<Icon aria-hidden="true" />}
                label={t(`servicesCenter.${item.key}`)}
              />
            );
          })}
        </nav>
      </DkGlassPanel>
    </section>
  );
}
