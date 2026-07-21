"use client";

import { FileImage, Layers3, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useLanguage } from "../../../components/LanguageProvider";
import { DkGlassPanel } from "../../../components/ui";
import ComingSoonPanel from "../../components/ComingSoonPanel";
import StudioPageShell from "../../components/StudioPageShell";
import StudioTabs from "../../components/StudioTabs";
import StudioToolCard from "../../components/StudioToolCard";

type EmbroideryTab = "upload" | "analysis" | "dna" | "stitches" | "fabric" | "quality" | "echo";
const TABS: EmbroideryTab[] = ["upload", "analysis", "dna", "stitches", "fabric", "quality", "echo"];
const DNA_FIELDS = ["colors", "fabricType", "threadType", "satin", "fill", "singleRun", "density", "direction", "underlay", "startEnd", "jumps", "trim", "stackRisk", "tearRisk", "duration", "stitchCount", "echoScore"];

export default function DekoBrainEmbroidery() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<EmbroideryTab>("upload");
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const chooseFile = (accept: string) => {
    if (!fileInputRef.current) return;
    fileInputRef.current.accept = accept;
    fileInputRef.current.click();
  };

  const readFileName = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFileName(event.target.files?.[0]?.name ?? "");
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setSelectedFileName(event.dataTransfer.files?.[0]?.name ?? "");
  };

  return (
    <StudioPageShell title={t("studio.embroidery.title")} description={t("studio.embroidery.description")} status="development">
      <div className="smartStudioWorkspace">
        <StudioTabs tabs={TABS.map((id) => ({ id, label: t(`studio.embroidery.tabs.${id}`) }))} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as EmbroideryTab)} ariaLabel={t("studio.embroidery.title")} />

        {activeTab === "upload" && (
          <DkGlassPanel as="section" strength="subtle" className="smartStudioPanel">
            <div className="smartStudioSectionHeading"><div><h2>{t("studio.embroidery.upload.title")}</h2><p>{t("studio.embroidery.upload.description")}</p></div></div>
            <div className="smartStudioDropzone" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
              <Upload size={34} aria-hidden="true" />
              <p>{selectedFileName ? `${t("studio.common.selectedFile")}: ${selectedFileName}` : t("studio.common.noFile")}</p>
            </div>
            <input ref={fileInputRef} className="smartStudioHiddenInput" type="file" onChange={readFileName} />
            <div className="smartStudioUploadGrid smartStudioUploadGrid--compact">
              <StudioToolCard icon={<FileImage size={24} />} label={t("studio.embroidery.upload.images")} onClick={() => chooseFile("image/*")} />
              <StudioToolCard icon={<Layers3 size={24} />} label={t("studio.embroidery.upload.design")} onClick={() => chooseFile(".dst,.pes,.jef,.exp,.vp3,.svg")} />
            </div>
            <p className="smartStudioDevelopmentNote">{t("studio.embroidery.development")}</p>
          </DkGlassPanel>
        )}

        {activeTab === "dna" && (
          <DkGlassPanel as="section" strength="subtle" className="smartStudioPanel">
            <div className="smartStudioSectionHeading"><div><h2>{t("studio.embroidery.dna.title")}</h2><p>{t("studio.embroidery.dna.description")}</p></div></div>
            <div className="smartStudioDnaGrid">
              {DNA_FIELDS.map((field) => <article key={field} className="smartStudioDnaField"><strong>{t(`studio.embroidery.dna.fields.${field}`)}</strong><span>{t("studio.common.waiting")}</span></article>)}
            </div>
          </DkGlassPanel>
        )}

        {activeTab !== "upload" && activeTab !== "dna" && <ComingSoonPanel title={t(`studio.embroidery.tabs.${activeTab}`)} description={t("studio.embroidery.development")} icon={<Layers3 size={30} />} />}
      </div>
    </StudioPageShell>
  );
}
