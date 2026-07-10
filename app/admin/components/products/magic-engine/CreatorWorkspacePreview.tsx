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

export default function CreatorWorkspacePreview() {
  return (
    <div className="space-y-4">
      <MagicEngineHeader />
      <MagicEngineSectionTitle
        title="مساحة المبدع"
        description="إدارة إنشاء المنتجات، ومراجعة التقدم، ومراقبة نشاط محرك Magic."
      />
      <QuickActionsSection />
      <MagicEngineStatusStrip />
      <AssistantSection />
      <WorkspaceOverviewSection />
      <CreatorTodayFocusCard />
      <ProjectProgressCard />
      <OpportunityCard />
      <StudioHealthCard />
      <LearningCard />
      <RecentActivityCard />
    </div>
  );
}
