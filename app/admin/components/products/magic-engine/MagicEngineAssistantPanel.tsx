const assistantSuggestions = [
  "تحسين وصف المنتج",
  "اقتراح استراتيجية تسعير",
  "فحص جاهزية السوق",
];

export default function MagicEngineAssistantPanel() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-slate-500">
          إرشاد Magic
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">
          مساعد الذكاء الاصطناعي
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          احصل على إرشاد أثناء إنشاء المنتجات والوصفات وعروض السوق.
        </p>
      </div>

      <div className="grid gap-3">
        {assistantSuggestions.map((suggestion, index) => (
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
        اسأل المساعد
      </button>
    </section>
  );
}
