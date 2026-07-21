export default function DkPageBackground() {
  return (
    <div className="dk-page-background" aria-hidden="true">
      <span className="dk-page-background__gradient" />
      <span className="dk-page-background__glow dk-page-background__glow--start" />
      <span className="dk-page-background__glow dk-page-background__glow--end" />
      <span className="dk-page-background__glass" />
    </div>
  );
}
