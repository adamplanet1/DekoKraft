import {
  CreatorTodayFocusCard,
  LearningCard,
  MagicEngineSectionTitle,
  OpportunityCard,
  ProjectProgressCard,
  RecentActivityCard,
  StudioHealthCard,
  WorkspaceReadinessCard,
} from "./index";
import type { MagicEngineWorkspaceText } from "../../../config/magicEngineTranslations";

export default function WorkspaceOverviewSection({ text }: { text: MagicEngineWorkspaceText }) {
  return (
    <section className="space-y-4">
      <MagicEngineSectionTitle
        title={text.overview.title}
        description={text.overview.description}
      />
      <WorkspaceReadinessCard text={text.readiness} />
      <CreatorTodayFocusCard text={text.focus} />
      <ProjectProgressCard text={text.projects} />
      <OpportunityCard text={text.opportunity} />
      <StudioHealthCard text={text.studioHealth} />
      <LearningCard text={text.learning} />
      <RecentActivityCard text={text.recentActivity} />
    </section>
  );
}
