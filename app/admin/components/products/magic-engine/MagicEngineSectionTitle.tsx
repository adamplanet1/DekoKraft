interface MagicEngineSectionTitleProps {
  title: string;
  description?: string;
}

export default function MagicEngineSectionTitle({
  title,
  description,
}: MagicEngineSectionTitleProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      {description ? (
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      ) : null}
    </div>
  );
}
