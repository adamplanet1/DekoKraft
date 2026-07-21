"use client";

import { Film } from "lucide-react";
import type { RefObject } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import VideoControls from "./VideoControls";

type VideoPreviewProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  previewRef: RefObject<HTMLDivElement | null>;
  videoUrl: string | null;
  fileName: string;
  isPlaying: boolean;
  isMuted: boolean;
  filterValue: string;
  isComparing: boolean;
  onLoadedMetadata: () => void;
  onTimeUpdate: () => void;
  onPlay: () => void;
  onPause: () => void;
  onEnded: () => void;
  onError: () => void;
  onTogglePlay: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onToggleMute: () => void;
  onFullscreen: () => void;
};

export default function VideoPreview({
  videoRef,
  previewRef,
  videoUrl,
  fileName,
  isPlaying,
  isMuted,
  filterValue,
  isComparing,
  onLoadedMetadata,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  onError,
  onTogglePlay,
  onSkipBack,
  onSkipForward,
  onToggleMute,
  onFullscreen,
}: VideoPreviewProps) {
  const { t } = useLanguage();

  return (
    <section ref={previewRef} className="videoWorkspacePreview" aria-label={t("studio.videoWorkspace.title")}>
      <div className="videoWorkspacePreview__screen">
        {videoUrl ? (
          <video
            ref={videoRef}
            src={videoUrl}
            aria-label={fileName}
            controls={false}
            playsInline
            muted={isMuted}
            preload="metadata"
            style={{ filter: isComparing ? "none" : filterValue }}
            onLoadedMetadata={onLoadedMetadata}
            onDurationChange={onLoadedMetadata}
            onTimeUpdate={onTimeUpdate}
            onPlay={onPlay}
            onPause={onPause}
            onEnded={onEnded}
            onError={onError}
          />
        ) : (
          <div className="videoWorkspacePreview__empty">
            <Film size={44} aria-hidden="true" />
            <p>{t("studio.videoWorkspace.noVideo")}</p>
          </div>
        )}
      </div>
      <VideoControls
        disabled={!videoUrl}
        isPlaying={isPlaying}
        isMuted={isMuted}
        onTogglePlay={onTogglePlay}
        onSkipBack={onSkipBack}
        onSkipForward={onSkipForward}
        onToggleMute={onToggleMute}
        onFullscreen={onFullscreen}
      />
    </section>
  );
}
