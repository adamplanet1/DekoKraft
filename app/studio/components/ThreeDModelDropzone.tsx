"use client";

import { Box, Upload } from "lucide-react";
import type { ChangeEvent, DragEvent, RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";

type ThreeDModelDropzoneProps = {
  inputRef: RefObject<HTMLInputElement | null>;
  file: File | null;
  isDragging: boolean;
  errorMessage: string;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onDrop: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnter: (event: DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: DragEvent<HTMLDivElement>) => void;
  onChoose: () => void;
};

export default function ThreeDModelDropzone({
  inputRef,
  file,
  isDragging,
  errorMessage,
  onFileChange,
  onDrop,
  onDragEnter,
  onDragLeave,
  onChoose,
}: ThreeDModelDropzoneProps) {
  const { t } = useLanguage();

  return (
    <div
      className={`threeDModelDropzone${isDragging ? " threeDModelDropzone--dragging" : ""}${file ? " threeDModelDropzone--loaded" : ""}`}
      onDragEnter={onDragEnter}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".stl,.obj,.3mf,.ply,.glb,.gltf,model/stl,model/obj,model/3mf,model/gltf-binary,model/gltf+json"
        onChange={onFileChange}
      />
      {file ? (
        <div className="threeDModelDropzone__loaded">
          <div className="threeDModelDropzone__cube"><Box size={74} strokeWidth={1.2} aria-hidden="true" /></div>
          <strong>{file.name}</strong>
          <p>{t("studio.threeDWorkspace.viewerUnavailable")}</p>
          <button type="button" onClick={onChoose}><Upload size={18} aria-hidden="true" />{t("studio.threeDWorkspace.importModel")}</button>
        </div>
      ) : (
        <div className="threeDModelDropzone__empty">
          <span aria-hidden="true">📦</span>
          <strong>{t("studio.threeDWorkspace.dropTitle")}</strong>
          <small>{t("studio.threeDWorkspace.orChoose")}</small>
          <button type="button" onClick={onChoose}>{t("studio.threeDWorkspace.importModel")}</button>
          <p>{t("studio.threeDWorkspace.supportedFormats")}</p>
        </div>
      )}
      {errorMessage && <p className="threeDModelDropzone__error" role="alert">{errorMessage}</p>}
    </div>
  );
}
