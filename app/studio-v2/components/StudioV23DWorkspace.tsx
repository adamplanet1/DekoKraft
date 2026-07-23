import { Box, Hand, Maximize, Move3D, Rotate3D, Upload } from "lucide-react";

const viewTools = [
  { label: "Orbit", icon: Rotate3D },
  { label: "Pan", icon: Hand },
  { label: "Zoom", icon: Maximize },
  { label: "إعادة ضبط العرض", icon: Move3D },
];

export default function StudioV23DWorkspace() {
  return (
    <section className="studioV23DWorkspace" aria-labelledby="studio-v2-3d-title">
      <div className="studioV23DViewport">
        <div className="studioV23DGizmo" aria-hidden="true"><i /><i /><i /></div>
        <div className="studioV23DCube" aria-hidden="true"><Box /></div>
        <div className="studioV23DIntro">
          <h2 id="studio-v2-3d-title">مساحة التصميم ثلاثي الأبعاد</h2>
          <p>STL / OBJ / GLB</p>
          <label className="studioV2PrimaryButton">
            <Upload aria-hidden="true" />
            استيراد نموذج
            <input type="file" accept=".stl,.obj,.glb" />
          </label>
        </div>
      </div>
      <div className="studioV23DViewTools" aria-label="أدوات العرض ثلاثي الأبعاد">
        {viewTools.map(({ label, icon: Icon }) => <button key={label} type="button" aria-label={label}><Icon aria-hidden="true" /><span>{label}</span></button>)}
      </div>
    </section>
  );
}
