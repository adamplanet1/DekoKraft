import SellerSectionPlaceholder from "../../components/SellerSectionPlaceholder";

export default async function SellerCustomersPage({ params }: PageProps<"/seller/[sellerId]/customers">) {
  const { sellerId } = await params;
  return <SellerSectionPlaceholder sellerId={sellerId} section="customers" />;
}
