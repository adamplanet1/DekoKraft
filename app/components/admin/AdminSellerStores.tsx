"use client";

import { Plus } from "lucide-react";
import { useLanguage } from "../LanguageProvider";
import { DkButton, DkGlassPanel } from "../ui";
import { classNames } from "../ui/classNames";
import { adminSellerStores } from "./sellerStoresData";

export type AdminSellerStoresProps = {
  className?: string;
};

export default function AdminSellerStores({ className }: AdminSellerStoresProps) {
  const { t } = useLanguage();

  return (
    <DkGlassPanel
      as="section"
      strength="subtle"
      className={classNames("dk-admin-seller-stores", className)}
      aria-label={t("admin.sellerStores.title")}
    >
      <header className="dk-admin-seller-stores__header">
        <span>{t("admin.sellerStores.eyebrow")}</span>
        <h2>{t("admin.sellerStores.title")}</h2>
        <p>{t("admin.sellerStores.description")}</p>
      </header>

      <div className="dk-admin-seller-stores__grid">
        {adminSellerStores.map((store) => {
          const name = t(`admin.sellerStores.${store.nameKey}`);
          const description = store.descriptionKey
            ? t(`admin.sellerStores.${store.descriptionKey}`)
            : t("admin.sellerStores.storeDescription", { name });

          return (
            <DkGlassPanel as="article" strength="subtle" className="dk-admin-seller-stores__card" key={store.id}>
              <DkButton
                href={store.href}
                variant="transparent"
                className="dk-admin-seller-stores__link"
                icon={<span className="dk-admin-seller-stores__badge">{store.badge}</span>}
                aria-label={`${t("admin.sellerStores.openStore")}: ${name}`}
              >
                <span className="dk-admin-seller-stores__content">
                  <strong>{name}</strong>
                  <span>{description}</span>
                  <small>
                    {t("admin.sellerStores.city")}: {t(`admin.sellerStores.${store.cityKey}`)} · {t("admin.sellerStores.country")}: {t("admin.sellerStores.germany")}
                  </small>
                  <em>{t("admin.sellerStores.openStore")}</em>
                </span>
              </DkButton>
            </DkGlassPanel>
          );
        })}

        <DkGlassPanel as="article" strength="subtle" className="dk-admin-seller-stores__card dk-admin-seller-stores__card--add">
          <DkButton
            href="/admin/sellers/new"
            variant="transparent"
            className="dk-admin-seller-stores__link"
            icon={<Plus className="dk-admin-seller-stores__plus" />}
          >
            <span className="dk-admin-seller-stores__content">
              <strong>{t("admin.sellerStores.addStore")}</strong>
              <span>{t("admin.sellerStores.addStoreDescription")}</span>
            </span>
          </DkButton>
        </DkGlassPanel>
      </div>
    </DkGlassPanel>
  );
}
