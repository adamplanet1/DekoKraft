"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "../../components/LanguageProvider";
import { getEffectiveSeller, setSellerStatus } from "../lib/sellerAccountStorage";
import { saveSellerSession } from "../lib/sellerSession";

export default function SellerInviteAcceptance() {
  const params = useSearchParams();
  const router = useRouter();
  const { direction, t } = useLanguage();
  const sellerId = params.get("sellerId") ?? "";
  const seller = getEffectiveSeller(sellerId);

  if (!seller) {
    return (
      <main className="sellerLoginPage" dir={direction}>
        <section className="sellerLoginCard"><h1>{t("register.inviteNotFound")}</h1></section>
      </main>
    );
  }

  const accept = () => {
    setSellerStatus(seller.id, "active");
    saveSellerSession({ sellerId: seller.id, participantId: seller.id, role: "participant", email: seller.email, loggedInAt: new Date().toISOString() });
    router.replace(`/seller/${seller.id}`);
  };

  return (
    <main className="sellerLoginPage" dir={direction}>
      <section className="sellerLoginCard">
        <span className="sellerLoginLogo">DK</span>
        <h1>{t("register.inviteTitle")}</h1>
        <dl className="sellerFacts">
          <div><dt>{t("register.sellerName")}</dt><dd>{seller.ownerName}</dd></div>
          <div><dt>{t("register.storeName")}</dt><dd>{seller.store.storeName}</dd></div>
          <div><dt>{t("register.email")}</dt><dd>{seller.email}</dd></div>
        </dl>
        <button className="sellerPrimary" onClick={accept}>{t("register.acceptInvite")}</button>
      </section>
    </main>
  );
}
