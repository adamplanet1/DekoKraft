import { redirect } from "next/navigation";
import { routes } from "../../../config/routes";

export default async function SellerMediaPage({ params }: PageProps<"/seller/[sellerId]/media">) {
  const { sellerId } = await params;
  redirect(routes.smartEdit({ participantId: sellerId, sellerId }));
}
