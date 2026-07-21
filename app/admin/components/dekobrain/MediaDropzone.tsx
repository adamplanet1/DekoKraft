"use client";

import { useRef, useState, type DragEvent, type KeyboardEvent } from "react";
import type { DekoBrainCopy } from "../../config/dekoBrainTranslations";

type Props = {
  copy: DekoBrainCopy;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
};

export default function MediaDropzone({ copy, disabled, onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function acceptFiles(fileList: FileList | null) {
    if (!fileList || disabled) return;
    onFiles(Array.from(fileList));
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragging(false);
    acceptFiles(event.dataTransfer.files);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      inputRef.current?.click();
    }
  }

  return (
    <div
      className={`dkBrainDropzone ${isDragging ? "dragging" : ""}`}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      onClick={() => inputRef.current?.click()}
      onKeyDown={handleKeyDown}
      onDragEnter={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setIsDragging(false);
        }
      }}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        className="dkBrainFileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        disabled={disabled}
        onChange={(event) => {
          acceptFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <span className="dkBrainDropIcon" aria-hidden="true">🖼️</span>
      <strong>{isDragging ? copy.dropActive : copy.uploadTitle}</strong>
      <p>{copy.uploadHint}</p>
      <span className="dkBrainSelectButton">{copy.selectFiles}</span>
      <small>{copy.uploadFormats}</small>
      <small>{copy.videoFuture}</small>
    </div>
  );
}

