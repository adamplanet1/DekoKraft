import type { MagicEngineWorkspaceText } from "../../../config/magicEngineTranslations";

export default function WorkspaceReadinessCard({ text }: { text: MagicEngineWorkspaceText["readiness"] }) {
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

      <div className="grid gap-3">
        {text.items.map((item, index) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-sm font-semibold text-emerald-700">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-slate-800">{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
