"use client";

import {
  BarChart3,
  Bot,
  Boxes,
  CircleDollarSign,
  ExternalLink,
  ImageIcon,
  LifeBuoy,
  Package,
  Plus,
  ReceiptText,
  Settings,
  ShoppingBag,
  UserRound,
  Users,
  WandSparkles,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { DkBrand, DkButton, DkGlassPanel } from "../../components/ui";
import { publicPath } from "../../lib/publicPath";
import { useLanguage } from "../../components/LanguageProvider";
import { routes } from "../../config/routes";
import { getEffectiveSellers } from "../lib/sellerAccountStorage";
import { useSellerSession } from "./SellerSessionProvider";

export default function SellerSidebar({
  sellerId,
  isOpen,
  onNavigate,
}: {
  sellerId: string;
  isOpen: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const { currentSeller, switchSellerForTesting } = useSellerSession();
  const { t } = useLanguage();
  const store = currentSeller?.store;
  const activeSellers = getEffectiveSellers().filter((seller) => seller.status === "active");
  const base = `/seller/${sellerId}`;
  const mainItems = [
    { label: t("seller.products"), href: `${base}/products`, icon: <Package /> },
    { label: t("seller.orders"), href: `${base}/orders`, icon: <ShoppingBag /> },
    { label: t("seller.customers"), href: routes.seller.customers(sellerId), icon: <Users /> },
    { label: t("seller.analytics"), href: routes.seller.analytics(sellerId), icon: <BarChart3 /> },
    { label: t("seller.media"), href: routes.smartEdit({ participantId: sellerId, sellerId }), icon: <ImageIcon /> },
    { label: t("seller.earnings"), href: routes.seller.earnings(sellerId), icon: <CircleDollarSign /> },
    { label: t("seller.settings"), href: `${base}/settings/store`, icon: <Settings /> },
    { label: t("seller.studio"), href: `${base}/studio`, icon: <WandSparkles /> },
    { label: t("seller.aiCost"), href: routes.seller.aiCost(sellerId), icon: <Bot /> },
    { label: t("seller.invoices"), href: routes.seller.invoices(sellerId), icon: <ReceiptText /> },
    { label: t("seller.inventory"), href: routes.seller.inventory(sellerId), icon: <Boxes /> },
    { label: t("seller.support"), href: routes.seller.support(sellerId), icon: <LifeBuoy /> },
  ];

  return (
    <DkGlassPanel
      as="aside"
      strength="subtle"
      className={`sellerSidebar dk-sidebar-panel${isOpen ? " mobileOpen" : ""}`}
      aria-label={t("seller.studioTitle")}
    >
      <DkBrand
        className="sellerSidebarBrand"
        name={store?.storeName ?? "DekoKraft"}
        subtitle={t("seller.studioTitle")}
        mediaSrc={publicPath("/logo-dekokraft-600.webp")}
        mediaType="image"
        mediaAlt="DekoKraft"
      />

      <nav id="seller-navigation" aria-label={t("seller.navigationLabel")}>
        {mainItems.map((item) => (
          <DkButton
            key={item.label}
            href={item.href}
            icon={item.icon}
            size="md"
            variant="transparent"
            active={Boolean(item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`)))}
            disabled={!item.href}
            title={!item.href ? t("seller.preparing") : item.label}
            onClick={onNavigate}
          >
            {item.label}
          </DkButton>
        ))}
      </nav>

      <div className="sellerSidebarSecondary">
        <DkButton href={`${base}/products/new`} icon={<Plus />} size="sm" variant="subtle" onClick={onNavigate}>
          {t("seller.addProduct")}
        </DkButton>
        <DkButton href={`${base}/profile`} icon={<UserRound />} size="sm" variant="subtle" onClick={onNavigate}>
          {t("seller.profile")}
        </DkButton>
        {store && (
          <a href={`/store/${store.storeSlug}`} target="_blank" rel="noreferrer">
            <ExternalLink aria-hidden="true" />
            {t("seller.previewStore")}
          </a>
        )}
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="sellerDevSwitch">
          <span>Development only</span>
          <label>
            {t("seller.developmentSwitch")}
            <select
              value={sellerId}
              onChange={(event) => switchSellerForTesting(event.target.value)}
            >
              {activeSellers.map((seller) => (
                <option key={seller.id} value={seller.id}>
                  {seller.id} — {seller.store.storeName}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <DkButton className="sellerBackLink" href="/home" size="sm" variant="transparent">
        {t("seller.backToSite")}
      </DkButton>
    </DkGlassPanel>
  );
}
