"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { studioV2ImageProcessingTools } from "./studioV2Activities";

type ImageTool = "none" | "removeBackground" | "crop";

const sliders = [
  ["brightness", "السطوع", 100],
  ["contrast", "التباين", 100],
  ["saturation", "التشبع", 100],
  ["grayscale", "التدرج الرمادي", 0],
  ["sepia", "Sepia", 0],
  ["hue", "تدوير درجة اللون", 0],
  ["sharpness", "حدة الصورة", 0],
  ["blur", "الضبابية", 0],
  ["opacity", "الشفافية", 100],
] as const;

export default function StudioV2ImageSettings() {
  const [activeImageTool, setActiveImageTool] = useState<ImageTool>("none");
  const [values, setValues] = useState<Record<string, number>>(
    Object.fromEntries(sliders.map(([id, , value]) => [id, value]))
  );

  const renderSlider = ([id, label]: (typeof sliders)[number]) => (
    <label key={id} className="studioV2Slider">
      <span>{label}<output>{values[id]}</output></span>
      <input
        type="range"
        min="0"
        max={id === "hue" ? 360 : 200}
        value={values[id]}
        onChange={(event) => setValues((current) => ({ ...current, [id]: Number(event.target.value) }))}
      />
    </label>
  );

  return (
    <section className="studioV2SettingsCard" aria-labelledby="studio-v2-settings-title">
      <header>
        <div>
          <span>معالجة الصور</span>
          <h2 id="studio-v2-settings-title">إعدادات الصورة</h2>
        </div>
        <button
          type="button"
          onClick={() => setValues(Object.fromEntries(sliders.map(([id, , value]) => [id, value])))}
        >
          إعادة ضبط
        </button>
      </header>

      <div className="studioV2SettingsScroll">
        <details className="studioV2SettingsGroup">
          <summary>الإضاءة</summary>
          <div>{sliders.slice(0, 2).map(renderSlider)}</div>
        </details>
        <details className="studioV2SettingsGroup">
          <summary>الألوان</summary>
          <div>{sliders.slice(2, 6).map(renderSlider)}</div>
        </details>
        <details className="studioV2SettingsGroup">
          <summary>التفاصيل</summary>
          <div>{sliders.slice(6, 8).map(renderSlider)}</div>
        </details>
        <details className="studioV2SettingsGroup" open>
          <summary>المعالجة</summary>
          <div className="studioV2ImageTools">
            {studioV2ImageProcessingTools.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                className={activeImageTool === id ? "is-active" : ""}
                aria-pressed={activeImageTool === id}
                onClick={() => setActiveImageTool((current) => current === id ? "none" : id)}
              >
                <Icon aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </details>
        <details className="studioV2SettingsGroup">
          <summary>الخلفية</summary>
          <div>
            {renderSlider(sliders[8])}
            <label className="studioV2Color">
              <span>لون الخلفية</span>
              <input type="color" defaultValue="#ffffff" />
            </label>
          </div>
        </details>
        <details className="studioV2SettingsGroup">
          <summary>التصدير</summary>
          <div>
            <div className="studioV2Formats">
              {["PNG", "WebP", "GIF"].map((format) => <button type="button" key={format}>{format}</button>)}
            </div>
            <button type="button" className="studioV2SettingsAction studioV2SettingsDownload">
              <Download aria-hidden="true" />
              تنزيل الصورة
            </button>
          </div>
        </details>
      </div>
    </section>
  );
}
