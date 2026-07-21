import { createLocalStructuredReportConnector } from "../../../../../../lib/dekoradar/securityAlertAdapter";
import { withDekoCleanAdmin } from "../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return withDekoCleanAdmin(async () => {
    const connector = createLocalStructuredReportConnector();
    return { connectors: [{ id: connector.id, label: connector.label, ...(await connector.getStatus()) }] };
  });
}
