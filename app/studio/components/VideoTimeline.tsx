"use client";

import { useLanguage } from "../../components/LanguageProvider";

type VideoTimelineProps = {
  duration: number;
  currentTime: number;
  trimStart: number;
  trimEnd: number;
  disabled: boolean;
  formatTime: (seconds: number) => string;
  onSeek: (time: number) => void;
};

function percentage(value: number, duration: number) {
  if (!Number.isFinite(duration) || duration <= 0) return 0;
  return Math.min(100, Math.max(0, (value / duration) * 100));
}

export default function VideoTimeline({ duration, currentTime, trimStart, trimEnd, disabled, formatTime, onSeek }: VideoTimelineProps) {
  const { t } = useLanguage();
  const startPercent = percentage(trimStart, duration);
  const endPercent = percentage(trimEnd, duration);
  const currentPercent = percentage(currentTime, duration);

  return (
    <section className="videoTimeline" aria-labelledby="video-workspace-timeline-title">
      <header>
        <strong id="video-workspace-timeline-title">{t("studio.videoWorkspace.timeline")}</strong>
        <output>{formatTime(currentTime)} / {formatTime(duration)}</output>
      </header>
      <div className="videoTimeline__track">
        <div className="videoTimeline__selection" style={{ insetInlineStart: `${startPercent}%`, width: `${Math.max(0, endPercent - startPercent)}%` }} />
        <span className="videoTimeline__trimHandle videoTimeline__trimHandle--start" style={{ insetInlineStart: `${startPercent}%` }} aria-hidden="true" />
        <span className="videoTimeline__trimHandle videoTimeline__trimHandle--end" style={{ insetInlineStart: `${endPercent}%` }} aria-hidden="true" />
        <span className="videoTimeline__playhead" style={{ insetInlineStart: `${currentPercent}%` }} aria-hidden="true" />
        <input
          type="range"
          min={0}
          max={Math.max(duration, 0.1)}
          step={0.01}
          value={Math.min(currentTime, Math.max(duration, 0.1))}
          disabled={disabled}
          aria-label={t("studio.videoWorkspace.currentTime")}
          onChange={(event) => onSeek(Number(event.target.value))}
        />
      </div>
    </section>
  );
}
