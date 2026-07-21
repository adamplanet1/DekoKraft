"use client";

import { Box, FileBox, FileImage, Upload } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useLanguage } from "../../../components/LanguageProvider";
import { DkGlassPanel } from "../../../components/ui";
import ComingSoonPanel from "../../components/ComingSoonPanel";
import StudioPageShell from "../../components/StudioPageShell";
import StudioTabs from "../../components/StudioTabs";
import StudioToolCard from "../../components/StudioToolCard";

type ThreeDTab = "upload" | "analysis" | "dna" | "repair" | "printability" | "compare" | "echo";
const TABS: ThreeDTab[] = ["upload", "analysis", "dna", "repair", "printability", "compare", "echo"];
const DNA_FIELDS = ["shapeType", "dimensions", "volume", "surfaceArea", "symmetry", "curves", "edges", "cavities", "wallThickness", "missingParts", "complexity", "repairability", "printability", "echoScore"];

export default function DekoBrain3DForm() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<ThreeDTab>("upload");
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
    <StudioPageShell title={t("studio.threeD.title")} description={t("studio.threeD.description")} status="development">
      <div className="smartStudioWorkspace">
        <StudioTabs tabs={TABS.map((id) => ({ id, label: t(`studio.threeD.tabs.${id}`) }))} activeTab={activeTab} onChange={(tab) => setActiveTab(tab as ThreeDTab)} ariaLabel={t("studio.threeD.title")} />

        {activeTab === "upload" && (
          <DkGlassPanel as="section" strength="subtle" className="smartStudioPanel">
            <div className="smartStudioSectionHeading"><div><h2>{t("studio.threeD.upload.title")}</h2><p>{t("studio.threeD.upload.description")}</p></div></div>
            <div className="smartStudioDropzone" onDragOver={(event) => event.preventDefault()} onDrop={handleDrop}>
              <Upload size={34} aria-hidden="true" />
              <p>{selectedFileName ? `${t("studio.common.selectedFile")}: ${selectedFileName}` : t("studio.common.noFile")}</p>
            </div>
            <input ref={fileInputRef} className="smartStudioHiddenInput" type="file" onChange={readFileName} />
            <div className="smartStudioUploadGrid">
              <StudioToolCard icon={<FileImage size={24} />} label={t("studio.threeD.upload.images")} onClick={() => chooseFile("image/*")} />
              <StudioToolCard icon={<FileBox size={24} />} label={t("studio.threeD.upload.stl")} onClick={() => chooseFile(".stl")} />
              <StudioToolCard icon={<Box size={24} />} label={t("studio.threeD.upload.obj")} onClick={() => chooseFile(".obj")} />
              <StudioToolCard icon={<Box size={24} />} label={t("studio.threeD.upload.ply")} onClick={() => chooseFile(".ply")} />
            </div>
            <p className="smartStudioDevelopmentNote">{t("studio.threeD.development")}</p>
          </DkGlassPanel>
        )}

        {activeTab === "dna" && (
          <DkGlassPanel as="section" strength="subtle" className="smartStudioPanel">
            <div className="smartStudioSectionHeading"><div><h2>{t("studio.threeD.dna.title")}</h2><p>{t("studio.threeD.dna.description")}</p></div></div>
            <div className="smartStudioDnaGrid">
              {DNA_FIELDS.map((field) => <article key={field} className="smartStudioDnaField"><strong>{t(`studio.threeD.dna.fields.${field}`)}</strong><span>{t("studio.common.waiting")}</span></article>)}
            </div>
          </DkGlassPanel>
        )}

        {activeTab !== "upload" && activeTab !== "dna" && <ComingSoonPanel title={t(`studio.threeD.tabs.${activeTab}`)} description={t("studio.threeD.development")} icon={<Box size={30} />} />}
      </div>
    </StudioPageShell>
  );
}
