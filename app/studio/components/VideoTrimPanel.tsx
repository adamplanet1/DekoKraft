"use client";

import { Film, Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import { useLanguage } from "../../components/LanguageProvider";

type VideoTrimPanelProps = {
  duration: number;
  trimStart: number;
  trimEnd: number;
  file: File | null;
  errorMessage: string;
  formatTime: (seconds: number) => string;
  formatFileSize: (bytes: number) => string;
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onTrimStartChange: (value: number) => void;
  onTrimEndChange: (value: number) => void;
};

export default function VideoTrimPanel(props: VideoTrimPanelProps) {
  const { t } = useLanguage();
  const hasVideo = Boolean(props.file && props.duration >= 0.1);

  return (
    <details className="videoTrimPanel" open>
      <summary><Film size={18} aria-hidden="true" />{t("studio.videoWorkspace.tools")}</summary>
      <div className="videoTrimPanel__content">
        <label className="videoTrimPanel__upload">
          <Upload size={20} aria-hidden="true" />
          <strong>{t("studio.videoWorkspace.uploadVideo")}</strong>
          <span>{t("studio.videoWorkspace.uploadHint")}</span>
          <input type="file" accept="video/mp4,video/webm,video/quicktime" onChange={props.onFileChange} />
        </label>

        {props.errorMessage && <p className="videoTrimPanel__error" role="alert">{props.errorMessage}</p>}

        <label className="videoTrimPanel__range">
          <span><strong>{t("studio.videoWorkspace.trimStart")}</strong><output>{props.formatTime(props.trimStart)}</output></span>
          <input
            type="range"
            min={0}
            max={Math.max(0, props.trimEnd - 0.1)}
            step={0.01}
            value={props.trimStart}
            disabled={!hasVideo}
            onChange={(event) => props.onTrimStartChange(Number(event.target.value))}
          />
        </label>

        <label className="videoTrimPanel__range">
          <span><strong>{t("studio.videoWorkspace.trimEnd")}</strong><output>{props.formatTime(props.trimEnd)}</output></span>
          <input
            type="range"
            min={Math.min(props.duration, props.trimStart + 0.1)}
            max={Math.max(props.duration, 0.1)}
            step={0.01}
            value={props.trimEnd}
            disabled={!hasVideo}
            onChange={(event) => props.onTrimEndChange(Number(event.target.value))}
          />
        </label>

        <dl className="videoTrimPanel__info">
          <div><dt>{t("studio.videoWorkspace.duration")}</dt><dd>{props.formatTime(props.duration)}</dd></div>
          <div><dt>{t("studio.videoWorkspace.trimStart")}</dt><dd>{props.formatTime(props.trimStart)}</dd></div>
          <div><dt>{t("studio.videoWorkspace.trimEnd")}</dt><dd>{props.formatTime(props.trimEnd)}</dd></div>
          <div><dt>{t("studio.videoWorkspace.result")}</dt><dd>{props.formatTime(Math.max(0, props.trimEnd - props.trimStart))}</dd></div>
          <div><dt>{t("studio.videoWorkspace.fileName")}</dt><dd>{props.file?.name || "—"}</dd></div>
          <div><dt>{t("studio.videoWorkspace.fileSize")}</dt><dd>{props.file ? props.formatFileSize(props.file.size) : "—"}</dd></div>
          <div><dt>{t("studio.videoWorkspace.fileType")}</dt><dd>{props.file?.type || "—"}</dd></div>
        </dl>
      </div>
    </details>
  );
}
