import {
  MagicEngineActionBar,
  MagicEngineSectionTitle,
} from "./index";
import type { MagicEngineWorkspaceText } from "../../../config/magicEngineTranslations";

export default function QuickActionsSection({ text }: { text: MagicEngineWorkspaceText["quickActions"] }) {
  return (
    <section className="space-y-4">
      <MagicEngineSectionTitle title={text.title} />
      <MagicEngineActionBar text={text} />
    </section>
  );
}
