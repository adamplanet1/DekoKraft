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

export default function WorkspaceOverviewSection() {
  return (
    <section className="space-y-4">
      <MagicEngineSectionTitle
        title="نظرة عامة على مساحة العمل"
        description="راجع تركيز اليوم، وتقدم المشاريع، والفرص، وصحة الاستوديو، والتعلم، والنشاط الأخير."
      />
      <WorkspaceReadinessCard />
      <CreatorTodayFocusCard />
      <ProjectProgressCard />
      <OpportunityCard />
      <StudioHealthCard />
      <LearningCard />
      <RecentActivityCard />
    </section>
  );
}
