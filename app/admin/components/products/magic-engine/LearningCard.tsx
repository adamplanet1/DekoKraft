const learningTips = [
  "استخدم خلفية نظيفة",
  "اعرض المنتج من عدة زوايا",
  "أضف صورة استخدام واقعية",
];

export default function LearningCard() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <p className="text-sm font-medium text-slate-500">
          تعلم المبدع
        </p>
        <h2 className="mt-1 text-xl font-semibold text-slate-950">
          نصيحة تعليمية
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          صور المنتج الأفضل تزيد ثقة العملاء وتحسن التحويل.
        </p>
      </div>

      <div className="grid gap-3">
        {learningTips.map((tip, index) => (
          <div
            key={tip}
            className="flex items-center gap-3 rounded-md border border-slate-100 bg-slate-50 px-3 py-3"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-indigo-700">
              {index + 1}
            </span>
            <span className="text-sm font-medium text-slate-800">{tip}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        فتح مركز التعلم
      </button>
    </section>
  );
}
