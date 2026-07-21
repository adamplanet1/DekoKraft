import { redirect } from "next/navigation";
import { routes } from "../../config/routes";

export default function ParticipantMediaPage() {
  redirect(routes.smartEdit());
}
