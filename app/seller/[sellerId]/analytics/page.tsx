import SellerSectionPlaceholder from "../../components/SellerSectionPlaceholder";

export default async function SellerAnalyticsPage({ params }: PageProps<"/seller/[sellerId]/analytics">) {
  const { sellerId } = await params;
  return <SellerSectionPlaceholder sellerId={sellerId} section="analytics" />;
}
