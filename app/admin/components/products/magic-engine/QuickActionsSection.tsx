import {
  MagicEngineActionBar,
  MagicEngineSectionTitle,
} from "./index";

export default function QuickActionsSection() {
  return (
    <section className="space-y-4">
      <MagicEngineSectionTitle title="إجراءات سريعة" />
      <MagicEngineActionBar />
    </section>
  );
}
