const statusItems = [
  { label: "المحرك", value: "جاهز" },
  { label: "الوصفات", value: "متزامنة" },
  { label: "الحارس", value: "نشط" },
  { label: "السوق", value: "يراقب" },
];

export default function MagicEngineStatusStrip() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {statusItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"
          >
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {item.label}
            </span>
            <span className="text-sm font-semibold text-slate-900">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
