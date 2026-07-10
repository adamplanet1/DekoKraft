import {
  type AutoFixPlanAction,
  type AutoFixStatus,
  type NextBestActionId,
} from "./types";
import { CardGrid, CardItem, SectionHeader } from "./ui";

type AutoFixPlanCardProps = {
  actionText: Record<
    NextBestActionId,
    {
      description: string;
      label: string;
    }
  >;
  actions: AutoFixPlanAction[];
  statusLabels: Record<AutoFixStatus, string>;
  title: string;
};

export function AutoFixPlanCard({
  actionText,
  actions,
  statusLabels,
  title,
}: AutoFixPlanCardProps) {
  return (
    <>
      <SectionHeader title={title} />

      <CardGrid>
        {actions.map((action) => (
          <CardItem key={action.id}>
            <span>{statusLabels[action.status]}</span>
            <strong>{actionText[action.id].label}</strong>
            <p>{actionText[action.id].description}</p>
          </CardItem>
        ))}
      </CardGrid>
    </>
  );
}
