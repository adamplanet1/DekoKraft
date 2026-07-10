import { MagicEngineStatusStrip } from "./index";
import type { MagicEngineWorkspaceText } from "../../../config/magicEngineTranslations";

export default function SystemStatusSection({ items }: { items: MagicEngineWorkspaceText["statusItems"] }) {
  return (
    <section className="space-y-4">
      <MagicEngineStatusStrip items={items} />
    </section>
  );
}
