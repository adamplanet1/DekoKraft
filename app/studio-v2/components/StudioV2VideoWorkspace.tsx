"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Film, Pause, Play, Search, Upload } from "lucide-react";

export default function StudioV2VideoWorkspace() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(100);

  return (
    <section className="studioV2VideoWorkspace" aria-labelledby="studio-v2-video-title">
      <div className="studioV2VideoPreview">
        <Film aria-hidden="true" />
        <h2 id="studio-v2-video-title">مساحة معالجة الفيديو</h2>
        <p>ارفع مقطع فيديو للبدء</p>
        <label className="studioV2PrimaryButton">
          <Upload aria-hidden="true" />
          اختيار فيديو
          <input type="file" accept="video/*" />
        </label>
      </div>

      <div className="studioV2Transport" aria-label="أدوات تشغيل الفيديو">
        <button type="button" aria-label="الإطار السابق" disabled><ChevronRight aria-hidden="true" /></button>
        <button type="button" className="studioV2TransportPlay" aria-label={isPlaying ? "إيقاف مؤقت" : "تشغيل"} onClick={() => setIsPlaying((playing) => !playing)}>
          {isPlaying ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
        </button>
        <button type="button" aria-label="الإطار التالي" disabled><ChevronLeft aria-hidden="true" /></button>
        <output>00:00 / 00:00</output>
      </div>

      <div className="studioV2Timeline">
        <header>
          <strong>المخطط الزمني</strong>
          <label>
            <Search aria-hidden="true" />
            <input type="range" min="60" max="140" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} aria-label="تكبير المخطط الزمني" />
            <output>{zoom}%</output>
          </label>
        </header>
        <div className="studioV2TimelineRuler"><span className="studioV2Playhead" /></div>
        <div className="studioV2ClipLane"><span>مسار الفيديو</span><div>لا يوجد مقطع</div></div>
      </div>
    </section>
  );
}
