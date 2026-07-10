import { MagicEngineAssistantPanel } from "./index";
import type { MagicEngineWorkspaceText } from "../../../config/magicEngineTranslations";

export default function AssistantSection({ text }: { text: MagicEngineWorkspaceText["assistant"] }) {
  return (
    <section className="space-y-4">
      <MagicEngineAssistantPanel text={text} />
    </section>
  );
}
