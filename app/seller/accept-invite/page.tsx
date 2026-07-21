import { Suspense } from "react";
import LocalizedText from "../../components/LocalizedText";
import "../seller.css";
import SellerInviteAcceptance from "../components/SellerInviteAcceptance";

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <main className="sellerGuardLoading">
          <LocalizedText textKey="register.inviteLoading" />
        </main>
      }
    >
      <SellerInviteAcceptance />
    </Suspense>
  );
}
