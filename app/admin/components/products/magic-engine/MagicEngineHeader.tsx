import type { MagicEngineWorkspaceText } from "../../../config/magicEngineTranslations";

export default function MagicEngineHeader({ text }: { text: MagicEngineWorkspaceText["header"] }) {
  return (
    <header className="rounded-lg border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">
            {text.title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {text.description}
          </p>
        </div>

        <span className="inline-flex w-fit items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-700">
          {text.badge}
        </span>
      </div>
    </header>
  );
}
