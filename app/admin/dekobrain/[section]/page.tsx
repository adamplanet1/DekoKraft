import { notFound } from "next/navigation";
import DekoBrainProgressPlaceholder from "../../components/dekobrain/DekoBrainProgressPlaceholder";
import { dkBrainProgressItems } from "../../../components/ui/dkBrainProgressItems";

export function generateStaticParams() {
  return dkBrainProgressItems.map((item) => ({ section: item.slug }));
}

export default async function DekoBrainProgressPage({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;
  const item = dkBrainProgressItems.find((candidate) => candidate.slug === section);

  if (!item) {
    notFound();
  }

  return <DekoBrainProgressPlaceholder section={item.id} />;
}

