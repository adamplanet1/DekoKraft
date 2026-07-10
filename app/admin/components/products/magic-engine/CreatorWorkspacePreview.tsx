import CreatorTodayFocusCard from "./CreatorTodayFocusCard";
import LearningCard from "./LearningCard";
import OpportunityCard from "./OpportunityCard";
import ProjectProgressCard from "./ProjectProgressCard";
import StudioHealthCard from "./StudioHealthCard";
import {
  AssistantSection,
  MagicEngineHeader,
  MagicEngineSectionTitle,
  MagicEngineStatusStrip,
  QuickActionsSection,
  RecentActivityCard,
  WorkspaceOverviewSection,
} from ".";
import { magicEngineTranslations, type Lang } from "../../../config/translations";

export default function CreatorWorkspacePreview({ lang }: { lang: Lang }) {
  const text = magicEngineTranslations[lang];
  return (
    <div className="space-y-4">
      <MagicEngineHeader text={text.header} />
      <MagicEngineSectionTitle
        title={text.workspace.title}
        description={text.workspace.description}
      />
      <QuickActionsSection text={text.quickActions} />
      <MagicEngineStatusStrip items={text.statusItems} />
      <AssistantSection text={text.assistant} />
      <WorkspaceOverviewSection text={text} />
      <CreatorTodayFocusCard text={text.focus} />
      <ProjectProgressCard text={text.projects} />
      <OpportunityCard text={text.opportunity} />
      <StudioHealthCard text={text.studioHealth} />
      <LearningCard text={text.learning} />
      <RecentActivityCard text={text.recentActivity} />
    </div>
  );
}
