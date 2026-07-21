import { notFound } from "next/navigation";
import DkRoutePlaceholder from "../../components/platform/DkRoutePlaceholder";

const infoSections = {
  artisans: "welcome.cards.artisans",
  about: "servicesCenter.about",
  comments: "welcome.cards.comments",
  suggestions: "welcome.cards.suggestions",
  services: "welcome.cards.services",
  favorites: "toolbar.favorites",
  cart: "toolbar.cart",
  settings: "toolbar.settings",
  association: "servicesCenter.association",
  shipping: "servicesCenter.shipping",
  payment: "servicesCenter.payment",
  "data-protection": "servicesCenter.dataProtection",
  privacy: "servicesCenter.privacy",
  faq: "servicesCenter.faq",
  contact: "servicesCenter.contact",
  legal: "servicesCenter.legal",
  "future-tool": "servicesCenter.futureTool",
} as const;

export function generateStaticParams() {
  return Object.keys(infoSections).map((section) => ({ section }));
}

export default async function InfoPage({ params }: PageProps<"/info/[section]">) {
  const { section } = await params;
  const titleKey = infoSections[section as keyof typeof infoSections];
  if (!titleKey) notFound();
  return <DkRoutePlaceholder titleKey={titleKey} />;
}
