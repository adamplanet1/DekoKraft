import type { MagicEngineWorkspaceText } from "../../../config/magicEngineTranslations";

export default function MagicEngineAssistantPanel({ text }: { text: MagicEngineWorkspaceText["assistant"] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
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

      <div className="grid gap-3">
        {text.suggestions.map((suggestion, index) => (
          <div
            key={suggestion}
            className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-50 text-sm font-semibold text-violet-700">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-slate-800">
              {suggestion}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        {text.action}
      </button>
    </section>
  );
}
