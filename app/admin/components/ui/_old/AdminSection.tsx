export default function AdminSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="adminSection">
      <h2>{title}</h2>
      <div className="adminSectionBody">{children}</div>
    </section>
  );
}