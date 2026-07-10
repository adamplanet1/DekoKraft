const focusItems = [
  "طلبات جاهزة للشحن",
  "منتج يحتاج صورًا",
  "فرصة في السوق",
  "مراجعة عميل جديدة",
];

export default function CreatorTodayFocusCard() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-slate-500">لوحة المبدع</p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">
          صباح الخير، أيها المبدع
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          إليك أهم الأشياء التي تستحق المراجعة اليوم قبل فتح مساحة العمل.
        </p>
      </div>

      <div className="grid gap-3">
        {focusItems.map((item, index) => (
          <div
            key={item}
            className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-slate-800">{item}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        فتح مساحة المبدع
      </button>
    </section>
  );
}
