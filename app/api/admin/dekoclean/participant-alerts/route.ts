import { readAdminEscalations } from "../../../../../lib/dekoclean/participant/store";
import { withDekoCleanAdmin } from "../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() { return withDekoCleanAdmin(async () => ({ alerts: readAdminEscalations().slice(-200).reverse() })); }
