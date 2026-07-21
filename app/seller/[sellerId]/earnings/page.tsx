import SellerSectionPlaceholder from "../../components/SellerSectionPlaceholder";

export default async function SellerEarningsPage({ params }: PageProps<"/seller/[sellerId]/earnings">) {
  const { sellerId } = await params;
  return <SellerSectionPlaceholder sellerId={sellerId} section="earnings" />;
}
