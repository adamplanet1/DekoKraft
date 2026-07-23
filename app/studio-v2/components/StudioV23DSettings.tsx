const axes = ["X", "Y", "Z"] as const;

export default function StudioV23DSettings() {
  return (
    <section className="studioV2ContextSettings studioV23DSettings" aria-labelledby="studio-v2-3d-settings-title">
      <header><span>التصميم ثلاثي الأبعاد</span><h2 id="studio-v2-3d-settings-title">المشهد والتحويل</h2></header>
      <div className="studioV2ContextSettingsScroll">
        <section>
          <h3>المشهد</h3>
          <ul className="studioV23DObjectList"><li>Camera</li><li>Light</li><li className="is-active">Object 001</li></ul>
        </section>
        {[
          ["الموضع", 0],
          ["الدوران", 0],
          ["الحجم", 1],
        ].map(([title, value]) => (
          <section key={String(title)}>
            <h3>{title}</h3>
            <div className="studioV23DAxes">
              {axes.map((axis) => <label key={axis}>{axis}<input type="number" defaultValue={Number(value)} step={title === "الدوران" ? 1 : 0.1} /></label>)}
            </div>
          </section>
        ))}
        <section><h3>العرض</h3><label className="studioV2Checkbox"><input type="checkbox" defaultChecked />إظهار شبكة الأرضية</label></section>
        <section><h3>التصدير</h3><button type="button" disabled>تصدير النموذج — قيد الربط</button></section>
      </div>
    </section>
  );
}
