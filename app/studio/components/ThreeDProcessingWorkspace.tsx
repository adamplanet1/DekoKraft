"use client";

import { Download } from "lucide-react";
import { useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import ThreeDModelDropzone from "./ThreeDModelDropzone";
import ThreeDModelInfo from "./ThreeDModelInfo";
import ThreeDToolsPanel from "./ThreeDToolsPanel";
import { analyzeModelFile, type ModelMetrics } from "./threeDModelAnalysis";

const SUPPORTED_EXTENSIONS = new Set(["stl", "obj", "3mf", "ply", "glb", "gltf"]);
const EMPTY_METRICS: ModelMetrics = { vertices: null, polygons: null, volume: null, dimensions: null };

export default function ThreeDProcessingWorkspace() {
  const { direction, t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [metrics, setMetrics] = useState<ModelMetrics>(EMPTY_METRICS);
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const importFile = async (nextFile: File) => {
    const extension = nextFile.name.split(".").pop()?.toLowerCase() ?? "";
    if (!SUPPORTED_EXTENSIONS.has(extension)) {
      setErrorMessage(t("studio.threeDWorkspace.invalidFormat"));
      return;
    }
    setFile(nextFile);
    setMetrics(EMPTY_METRICS);
    setErrorMessage("");
    setMessage(t("studio.threeDWorkspace.imported"));
    try {
      setMetrics(await analyzeModelFile(nextFile));
    } catch {
      setMetrics(EMPTY_METRICS);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (nextFile) void importFile(nextFile);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) void importFile(nextFile);
  };

  const showEnginePlaceholder = () => setMessage(t("studio.threeDWorkspace.enginePending"));

  return (
    <section className="threeDProcessingWorkspace" dir={direction} aria-labelledby="three-d-processing-title">
      <h2 id="three-d-processing-title">{t("studio.threeDWorkspace.title")}</h2>
      <div className="threeDProcessingWorkspace__body">
        <ThreeDToolsPanel inputRef={inputRef} disabled={!file} onPlaceholderAction={showEnginePlaceholder} />
        <ThreeDModelDropzone
          inputRef={inputRef}
          file={file}
          isDragging={isDragging}
          errorMessage={errorMessage}
          onFileChange={handleFileChange}
          onDrop={handleDrop}
          onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragLeave={(event) => {
            const relatedTarget = event.relatedTarget;
            if (!(relatedTarget instanceof Node) || !event.currentTarget.contains(relatedTarget)) setIsDragging(false);
          }}
          onChoose={() => inputRef.current?.click()}
        />
        <ThreeDModelInfo file={file} metrics={metrics} />
      </div>
      <footer className="threeDExportBar">
        <button type="button" disabled={!file} onClick={showEnginePlaceholder}><Download size={18} aria-hidden="true" />{t("studio.threeDWorkspace.saveStl")}</button>
        <button type="button" disabled={!file} onClick={showEnginePlaceholder}><Download size={18} aria-hidden="true" />{t("studio.threeDWorkspace.exportObj")}</button>
        <button type="button" disabled={!file} onClick={showEnginePlaceholder}><Download size={18} aria-hidden="true" />{t("studio.threeDWorkspace.export3mf")}</button>
      </footer>
      <p className="threeDWorkspaceStatus" aria-live="polite">{message}</p>
    </section>
  );
}
