import {
  type PublishChecklistItem,
  type PublishChecklistItemId,
} from "./types";
import { CardGrid, CardItem, SectionHeader } from "./ui";

type PublishChecklistCardProps = {
  itemLabels: Record<PublishChecklistItemId, string>;
  items: PublishChecklistItem[];
  statusLabels: {
    passed: string;
    pending: string;
  };
  title: string;
};

export function PublishChecklistCard({
  itemLabels,
  items,
  statusLabels,
  title,
}: PublishChecklistCardProps) {
  return (
    <>
      <SectionHeader title={title} />

      <CardGrid>
        {items.map((item) => (
          <CardItem key={item.id}>
            <span>{item.passed ? statusLabels.passed : statusLabels.pending}</span>
            <strong>{itemLabels[item.id]}</strong>
          </CardItem>
        ))}
      </CardGrid>
    </>
  );
}
