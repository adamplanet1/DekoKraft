"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import { useSellerSession } from "./SellerSessionProvider";

export default function SellerAccountHeader({ sellerId }: { sellerId: string }) {
  const { currentSeller, logoutSeller } = useSellerSession();
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const value = sessionStorage.getItem("seller_route_message");
    if (value) {
      setNotice(value);
      sessionStorage.removeItem("seller_route_message");
    }
  }, []);

  if (!currentSeller) return null;

  return <>{notice && <p className="sellerRouteNotice">{notice}</p>}<header className="sellerAccountHeader"><div className="sellerAccountIdentity">{currentSeller.store.logoUrl ? <Image src={currentSeller.store.logoUrl} alt="" width={44} height={44} /> : <span>{currentSeller.store.storeName.slice(0, 2)}</span>}<div><strong>{currentSeller.store.storeName}</strong><small>{currentSeller.ownerName}</small></div></div><div className="sellerAccountMeta"><span className={`sellerAccountStatus sellerAccountStatus--${currentSeller.status}`}>{t(`seller.status.${currentSeller.status}`)}</span><span>{currentSeller.plan}</span><a href={`/store/${currentSeller.store.storeSlug}`} target="_blank" rel="noreferrer">{t("seller.previewStore")}</a><button onClick={logoutSeller}>{t("seller.logout")}</button><button onClick={() => setOpen((value) => !value)} aria-expanded={open}>{t("toolbar.account")} ▾</button>{open && <div className="sellerAccountMenu"><Link href={`/seller/${sellerId}/profile`}>{t("seller.profile")}</Link><Link href={`/seller/${sellerId}/settings/store`}>{t("seller.storeSettings")}</Link><button onClick={logoutSeller}>{t("seller.logout")}</button></div>}</div></header></>;
}
