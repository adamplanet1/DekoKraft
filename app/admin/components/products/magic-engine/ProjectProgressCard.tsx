const projects = [
  {
    name: "علبة خاتم",
    progress: 80,
  },
  {
    name: "علبة مجوهرات",
    progress: 55,
  },
  {
    name: "علبة ذكريات",
    progress: 30,
  },
];

export default function ProjectProgressCard() {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-xl font-semibold text-slate-950">
          المشاريع النشطة
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          تابع مشاريع المبدع المتجهة نحو الجاهزية للسوق.
        </p>
      </div>

      <div className="grid gap-4">
        {projects.map((project) => (
          <div key={project.name}>
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-slate-800">
                {project.name}
              </span>
              <span className="text-sm font-semibold text-slate-600">
                {project.progress}%
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
