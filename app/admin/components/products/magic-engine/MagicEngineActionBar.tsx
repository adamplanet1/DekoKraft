const secondaryActions = ["استيراد", "تصدير", "مساعدة AI", "معاينة"];

export default function MagicEngineActionBar() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          منتج جديد
        </button>

        <div className="flex flex-wrap gap-2">
          {secondaryActions.map((action) => (
            <button
              key={action}
              type="button"
              className="rounded-md border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
