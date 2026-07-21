"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { DkButton, DkGlassPanel } from "../../components/ui";
import { useLanguage } from "../../components/LanguageProvider";
import type { SellerProduct } from "../../data/sellerProducts";
import { loadStoredSellerProducts } from "../lib/sellerProductStorage";
import { sellerOwnsProduct } from "../lib/sellerAccess";
import { getSellerProfile } from "../lib/sellers";
import { useSellerSession } from "./SellerSessionProvider";

export default function SellerDashboard({ sellerId }: { sellerId: string }) {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const seller = getSellerProfile(sellerId);
  const { currentSeller } = useSellerSession();
  const { t } = useLanguage();

  useEffect(() => {
    const load = () => {
      setProducts(
        loadStoredSellerProducts().filter((product) => sellerOwnsProduct(sellerId, product)),
      );
    };
    load();
    window.addEventListener("seller-products-change", load);
    return () => window.removeEventListener("seller-products-change", load);
  }, [sellerId]);

  const summary = useMemo(() => {
    const scores = products.flatMap((product) =>
      product.dekoBrain?.echoScore == null ? [] : [product.dekoBrain.echoScore],
    );
    const stats: ReadonlyArray<{ label: string; value: number | string }> = [
      { label: t("seller.productCount"), value: products.length },
      { label: t("seller.published"), value: products.filter((product) => product.status === "published").length },
      { label: t("seller.drafts"), value: products.filter((product) => product.status === "draft").length },
      { label: t("seller.underReview"), value: products.filter((product) => product.status === "review").length },
      { label: t("seller.lowStock"), value: products.filter((product) => product.stock < 3).length },
      {
        label: t("seller.averageEcho"),
        value: scores.length
          ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length)
          : "—",
      },
    ];
    const attention = products.filter(
      (product) =>
        (product.dekoBrain?.echoScore ?? 100) < 60 ||
        product.stock < 3 ||
        Boolean(product.dekoBrain?.warnings?.length) ||
        product.status === "rejected",
    );
    return { stats, attention };
  }, [products, t]);

  return (
    <main className="sellerPage sellerStudioDashboard">
      <DkGlassPanel as="header" strength="normal" className="sellerDashboardHero">
        <div>
          <span>{seller.storeName}</span>
          <h1>{t("seller.studioTitle")}</h1>
          <p>{t("seller.welcome", { name: seller.name })}</p>
        </div>
        <div>
          <DkButton href={`/seller/${sellerId}/products/new`} size="md" variant="primary">
            {t("seller.addProduct")}
          </DkButton>
          <DkButton href={`/seller/${sellerId}/studio`} size="md" variant="glass">
            {t("seller.openStudio")}
          </DkButton>
          {currentSeller && (
            <a href={`/store/${currentSeller.store.storeSlug}`} target="_blank" rel="noreferrer">
              {t("seller.previewStore")}
            </a>
          )}
        </div>
      </DkGlassPanel>

      <section className="sellerStats" aria-label={t("seller.statsLabel")}>
        {summary.stats.map((item) => (
          <DkGlassPanel as="article" strength="subtle" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </DkGlassPanel>
        ))}
      </section>

      <DkGlassPanel as="section" strength="normal" className="sellerAttention">
        <header>
          <div>
            <span>{t("seller.smartReview")}</span>
            <h2>{t("seller.attentionTitle")}</h2>
          </div>
          <DkButton href={`/seller/${sellerId}/products`} size="sm" variant="transparent">
            {t("seller.viewAllProducts")}
          </DkButton>
        </header>
        <div>
          {summary.attention.map((product) => {
            const image = product.images.find((item) => item.isMain) ?? product.images[0];
            return (
              <DkButton
                key={product.id}
                href={`/seller/${sellerId}/products/${product.id}`}
                className="sellerAttentionItem"
                variant="transparent"
              >
                {image && <Image src={image.url} alt={image.alt} width={72} height={72} />}
                <span className="sellerAttentionCopy">
                  <strong>{product.title}</strong>
                  <span>
                    {product.stock < 3 ? `${t("seller.lowStock")} · ` : ""}
                    Echo {product.dekoBrain?.echoScore ?? "—"}
                  </span>
                </span>
              </DkButton>
            );
          })}
          {!summary.attention.length && <p>{t("seller.noAttention")}</p>}
        </div>
      </DkGlassPanel>
    </main>
  );
}
