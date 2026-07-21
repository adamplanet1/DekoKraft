import { readRecoveryManifest, readRecoveryPoint } from "../../../../../../lib/dekorebuild/storage";
import { withDekoRebuildAdmin } from "../../_shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withDekoRebuildAdmin(async () => {
    const { id } = await params;
    const point = readRecoveryPoint(id);
    const manifest = readRecoveryManifest(point.manifestReference);
    return { point, manifest: { ...manifest, entries: manifest.entries.slice(0, 2000) }, truncated: manifest.entries.length > 2000 };
  });
}
