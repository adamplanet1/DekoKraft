"use client";

export default function StudioV2VideoSettings() {
  return (
    <section className="studioV2ContextSettings" aria-labelledby="studio-v2-video-settings-title">
      <header><span>معالجة الفيديو</span><h2 id="studio-v2-video-settings-title">خصائص الفيديو</h2></header>
      <div className="studioV2ContextSettingsScroll">
        <section><h3>خصائص الفيديو</h3><dl><div><dt>الدقة</dt><dd>1920 × 1080</dd></div><div><dt>نسبة الإطار</dt><dd>16:9</dd></div><div><dt>مدة الفيديو</dt><dd>00:00</dd></div></dl></section>
        <section><h3>الصوت</h3><label>مستوى الصوت<input type="range" min="0" max="100" defaultValue="100" /></label></section>
        <section><h3>السرعة</h3><label>سرعة التشغيل<select defaultValue="1"><option value=".5">0.5×</option><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label></section>
        <section><h3>التصدير</h3><button type="button" disabled>تصدير الفيديو — قيد الربط</button></section>
      </div>
    </section>
  );
}
