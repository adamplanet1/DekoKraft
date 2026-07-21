import PublicPageShell from "../components/PublicPageShell";
import MarketplaceShowcase from "../components/home-v2/MarketplaceShowcase";
import LatestProducts from "../components/home-v2/LatestProducts";

export default function MarketPage() {
  return (
    <PublicPageShell showNotificationBar>
      <main className="homeV2Main" id="marketplace">
        <MarketplaceShowcase />
        <LatestProducts />
      </main>
    </PublicPageShell>
  );
}
