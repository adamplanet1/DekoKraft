"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLocalizedValue } from "../../../locales";
import { useLanguage } from "../../components/LanguageProvider";
import type { SellerAccount } from "../../data/sellers";
import type { SellerProduct } from "../../data/sellerProducts";
import { sellerOwnsProduct } from "../../seller/lib/sellerAccess";
import { getEffectiveSellers } from "../../seller/lib/sellerAccountStorage";
import { loadStoredSellerProducts } from "../../seller/lib/sellerProductStorage";

export default function Storefront({ storeSlug }: { storeSlug: string }) {
  const { lang, direction, t } = useLanguage();
  const [seller, setSeller] = useState<SellerAccount | null>(null);
  const [products, setProducts] = useState<SellerProduct[]>([]);

  useEffect(() => {
    const current = getEffectiveSellers().find((item) => item.store.storeSlug === storeSlug) ?? null;
    setSeller(current);
    setProducts(current ? loadStoredSellerProducts().filter((product) => sellerOwnsProduct(current.id, product) && product.status === "published") : []);
  }, [storeSlug]);

  if (!seller) {
    return (
      <main className="storefront" dir={direction}>
        <section className="storefrontEmpty">
          <h1>{t("market.storeNotFound")}</h1>
          <Link href="/home">{t("market.backHome")}</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="storefront" dir={direction}>
      <section className="storefrontHero">
        {seller.store.bannerUrl ? <Image src={seller.store.bannerUrl} alt="" fill priority sizes="100vw" /> : <div className="storefrontBannerFallback" />}
        <div className="storefrontIdentity">
          {seller.store.logoUrl ? <Image src={seller.store.logoUrl} alt={t("market.logoAlt", { name: seller.store.storeName })} width={112} height={112} /> : <span>DK</span>}
          <div>
            <h1>{seller.store.storeName}</h1>
            <p>{seller.store.description ?? seller.store.shortDescription}</p>
            <small>{seller.store.city}، {seller.store.country}</small>
          </div>
        </div>
      </section>
      <section className="storefrontMeta">
        <div><strong>{t("market.languages")}</strong><span>{seller.store.languages.map((language) => language.toUpperCase()).join(" · ")}</span></div>
        <div><strong>{t("market.storeCategories")}</strong><span>{seller.store.categories.join(" · ")}</span></div>
      </section>
      <section className="storefrontProducts">
        <header><span>{t("market.fromStore")}</span><h2>{t("market.publishedProducts")}</h2></header>
        <div>
          {products.map((product) => {
            const image = product.images.find((item) => item.isMain) ?? product.images[0];
            return (
              <article key={product.id}>
                {image ? <div><Image src={image.url} alt={image.alt} fill sizes="(max-width: 700px) 100vw, 320px" /></div> : <div className="storefrontProductFallback">DK</div>}
                <h3>{getLocalizedValue(product.title, lang)}</h3>
                <p>{getLocalizedValue(product.shortDescription, lang)}</p>
                <strong>{product.price.toFixed(2)} €</strong>
              </article>
            );
          })}
          {!products.length && <p>{t("market.noPublishedProducts")}</p>}
        </div>
      </section>
    </main>
  );
}
