import type { MagicEngineWorkspaceText } from "../../../config/magicEngineTranslations";

const healthScores = [92, 88, 96, 74];

export default function StudioHealthCard({ text }: { text: MagicEngineWorkspaceText["studioHealth"] }) {
  const healthIndicators = text.indicators.map((label, index) => ({ label, score: healthScores[index] }));
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {text.eyebrow}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            {text.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {text.description}
          </p>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {text.badge}
        </span>
      </div>

      <div className="grid gap-4">
        {healthIndicators.map((indicator) => (
          <div key={indicator.label}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-800">
                {indicator.label}
              </span>
              <span className="text-sm font-semibold text-slate-600">
                {indicator.score}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-600"
                style={{ width: `${indicator.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
