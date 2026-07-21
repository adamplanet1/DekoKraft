import { publicPath } from "../../lib/publicPath.ts";

const unavailableMessage = "هذه الوظيفة تحتاج إلى خادم DekoKraft ولا تتوفر في نسخة GitHub Pages الثابتة.";

export function isStudioServerApiAvailable(): boolean {
  return process.env.NEXT_PUBLIC_STUDIO_SERVER_API !== "false";
}

export function studioServerApiUrl(path: string): string {
  return publicPath(path);
}

export async function studioServerFetch(path: string, init?: RequestInit): Promise<Response> {
  if (!isStudioServerApiAvailable()) {
    return Response.json(
      { success: false, status: "failed", message: unavailableMessage },
      { status: 503 },
    );
  }

  return fetch(studioServerApiUrl(path), init);
}
