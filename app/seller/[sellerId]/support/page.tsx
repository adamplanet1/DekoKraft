import SellerSectionPlaceholder from "../../components/SellerSectionPlaceholder";

export default async function SellerSupportPage({ params }: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await params;
  return <SellerSectionPlaceholder sellerId={sellerId} section="support" />;
}
