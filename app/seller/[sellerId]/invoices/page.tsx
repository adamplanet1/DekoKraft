import SellerSectionPlaceholder from "../../components/SellerSectionPlaceholder";

export default async function SellerInvoicesPage({ params }: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await params;
  return <SellerSectionPlaceholder sellerId={sellerId} section="invoices" />;
}
