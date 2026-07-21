"use client";

import { Maximize2, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "../../components/LanguageProvider";

type VideoControlsProps = {
  disabled: boolean;
  isPlaying: boolean;
  isMuted: boolean;
  onTogglePlay: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onToggleMute: () => void;
  onFullscreen: () => void;
};

export default function VideoControls({
  disabled,
  isPlaying,
  isMuted,
  onTogglePlay,
  onSkipBack,
  onSkipForward,
  onToggleMute,
  onFullscreen,
}: VideoControlsProps) {
  const { t } = useLanguage();

  return (
    <div className="videoWorkspaceControls" aria-label={t("studio.videoWorkspace.commands")}>
      <button type="button" disabled={disabled} aria-label={isPlaying ? t("studio.videoWorkspace.pause") : t("studio.videoWorkspace.play")} onClick={onTogglePlay}>
        {isPlaying ? <Pause size={19} aria-hidden="true" /> : <Play size={19} aria-hidden="true" />}
      </button>
      <button type="button" disabled={disabled} aria-label={t("studio.videoWorkspace.backFive")} onClick={onSkipBack}>
        <SkipBack size={19} aria-hidden="true" />
      </button>
      <button type="button" disabled={disabled} aria-label={t("studio.videoWorkspace.forwardFive")} onClick={onSkipForward}>
        <SkipForward size={19} aria-hidden="true" />
      </button>
      <button type="button" disabled={disabled} aria-label={isMuted ? t("studio.videoWorkspace.unmute") : t("studio.videoWorkspace.mute")} aria-pressed={isMuted} onClick={onToggleMute}>
        {isMuted ? <VolumeX size={19} aria-hidden="true" /> : <Volume2 size={19} aria-hidden="true" />}
      </button>
      <button type="button" disabled={disabled} aria-label={t("studio.videoWorkspace.fullscreen")} onClick={onFullscreen}>
        <Maximize2 size={19} aria-hidden="true" />
      </button>
    </div>
  );
}
