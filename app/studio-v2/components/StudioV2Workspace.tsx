"use client";

import { ImagePlus, Library, Lightbulb, Mail, Upload } from "lucide-react";
import StudioV2SmartEdit from "./StudioV2SmartEdit";
import StudioV23DWorkspace from "./StudioV23DWorkspace";
import StudioV2VideoWorkspace from "./StudioV2VideoWorkspace";
import { studioV2Activities, type StudioV2ActivityId } from "./studioV2Activities";

type StudioV2WorkspaceProps = {
  activeActivity: StudioV2ActivityId;
  smartEditOpen: boolean;
  onSmartEditToggle: () => void;
};

export default function StudioV2Workspace({
  activeActivity,
  smartEditOpen,
  onSmartEditToggle,
}: StudioV2WorkspaceProps) {
  const activity = studioV2Activities.find((item) => item.id === activeActivity) ?? studioV2Activities[0];
  const Icon = activity.icon;

  const content = activeActivity === "welcome" ? (
    <section className="studioV2Welcome">
      <div className="studioV2WelcomeIcon"><ImagePlus aria-hidden="true" /></div>
      <h2>مرحبًا بكم في Echo Studio v2</h2>
      <p>يمكنكم من هنا اختيار النشاط المناسب والبدء في إنشاء ومعالجة أفكاركم داخل بيئة واضحة ومستقرة.</p>
      <div className="studioV2WelcomeActions">
        <label className="studioV2PrimaryButton">
          <Upload aria-hidden="true" />
          اختيار صورة
          <input type="file" accept="image/*" />
        </label>
        <button type="button" className="studioV2SecondaryButton">
          <Library aria-hidden="true" />
          مكتبة الموقع
        </button>
      </div>
    </section>
  ) : activeActivity === "image" ? (
    <section className="studioV2UploadCanvas" aria-label="مساحة رفع الصورة">
      <ImagePlus aria-hidden="true" />
      <h2>معالجة الصور</h2>
      <p>اختر صورة لبدء المعالجة وضبط الإضاءة والألوان والتفاصيل.</p>
      <label className="studioV2PrimaryButton">
        <Upload aria-hidden="true" />
        اختيار صورة
        <input type="file" accept="image/*" />
      </label>
    </section>
  ) : activeActivity === "video" ? (
    <StudioV2VideoWorkspace />
  ) : activeActivity === "threeD" ? (
    <StudioV23DWorkspace />
  ) : activeActivity === "suggestion" ? (
    <section className="studioV2ActivityPlaceholder">
      <Lightbulb aria-hidden="true" />
      <h2>اقتراح نشاط جديد</h2>
      <p>أرسل لنا فكرتك عن نشاط أو أداة ترغب في إضافتها إلى Echo Studio v2.</p>
      <a className="studioV2PrimaryButton" href="mailto:?subject=اقتراح نشاط جديد لـ Echo Studio v2">
        <Mail aria-hidden="true" />
        إرسال الاقتراح
      </a>
    </section>
  ) : (
    <section className="studioV2ActivityPlaceholder">
      <Icon aria-hidden="true" />
      <h2>{activity.label}</h2>
      <p>{activity.description}. سيتم ربط الوظائف الحالية بهذه المساحة في مرحلة لاحقة.</p>
      <span>قيد الربط</span>
    </section>
  );

  return (
    <section className="studioV2WorkspaceCard">
      <div className="studioV2WorkspaceCanvas">
        <div className="studioV2WorkspaceContent">{content}</div>
        {activeActivity === "image" && <div className="studioV2SmartEditDock">
          <StudioV2SmartEdit open={smartEditOpen} onToggle={onSmartEditToggle} />
        </div>}
      </div>
    </section>
  );
}
