"use client";

import { Download, Eye, RotateCcw, Scissors, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import VideoPreview from "./VideoPreview";
import VideoTimeline from "./VideoTimeline";
import VideoTrimPanel from "./VideoTrimPanel";

const MIN_SEGMENT_DURATION = 0.1;
const SUPPORTED_VIDEO_TYPES = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export function formatVideoTime(seconds: number) {
  const safeSeconds = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const minutes = Math.floor(safeSeconds / 60);
  const wholeSeconds = Math.floor(safeSeconds % 60);
  const milliseconds = Math.floor((safeSeconds % 1) * 1000);
  return `${String(minutes).padStart(2, "0")}:${String(wholeSeconds).padStart(2, "0")}.${String(milliseconds).padStart(3, "0")}`;
}

function formatFileSize(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";
  const megabytes = bytes / (1024 * 1024);
  return megabytes >= 1 ? `${megabytes.toFixed(2)} MB` : `${(bytes / 1024).toFixed(1)} KB`;
}

type VideoProcessingWorkspaceProps = {
  filterValue: string;
  isComparing: boolean;
};

export default function VideoProcessingWorkspace({ filterValue, isComparing }: VideoProcessingWorkspaceProps) {
  const { direction, t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isPreviewingSelection, setIsPreviewingSelection] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => () => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
  }, [videoUrl]);

  const pauseVideo = useCallback(() => {
    videoRef.current?.pause();
    setIsPlaying(false);
    setIsPreviewingSelection(false);
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (!SUPPORTED_VIDEO_TYPES.has(nextFile.type)) {
      setErrorMessage(t("studio.videoWorkspace.invalidFile"));
      event.target.value = "";
      return;
    }

    pauseVideo();
    setFile(nextFile);
    setVideoUrl(URL.createObjectURL(nextFile));
    setDuration(0);
    setCurrentTime(0);
    setTrimStart(0);
    setTrimEnd(0);
    setMessage("");
    setErrorMessage("");
  };

  const handleLoadedMetadata = () => {
    const nextDuration = videoRef.current?.duration ?? 0;
    if (!Number.isFinite(nextDuration) || nextDuration <= 0) return;
    setDuration(nextDuration);
    setCurrentTime(0);
    setTrimStart(0);
    setTrimEnd(nextDuration);
    setErrorMessage("");
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Math.min(video.currentTime, duration || video.currentTime);
    setCurrentTime(nextTime);

    if (isPreviewingSelection && nextTime >= trimEnd - 0.015) {
      video.pause();
      video.currentTime = trimEnd;
      setCurrentTime(trimEnd);
      setIsPreviewingSelection(false);
    }
  };

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    const safeTime = Math.min(Math.max(time, 0), duration);
    if (video) video.currentTime = safeTime;
    setCurrentTime(safeTime);
    setIsPreviewingSelection(false);
  }, [duration]);

  const togglePlay = async () => {
    const video = videoRef.current;
    if (!video) return;
    setIsPreviewingSelection(false);
    if (video.paused) {
      if (video.currentTime >= duration) seekTo(0);
      try {
        await video.play();
      } catch {
        setIsPlaying(false);
      }
    } else {
      video.pause();
    }
  };

  const previewSelection = async () => {
    const video = videoRef.current;
    if (!video || trimEnd - trimStart < MIN_SEGMENT_DURATION) return;
    video.currentTime = trimStart;
    setCurrentTime(trimStart);
    setIsPreviewingSelection(true);
    setMessage("");
    try {
      await video.play();
    } catch {
      setIsPreviewingSelection(false);
    }
  };

  const resetSelection = () => {
    pauseVideo();
    setTrimStart(0);
    setTrimEnd(duration);
    seekTo(0);
    setMessage("");
  };

  const updateTrimStart = (value: number) => {
    const nextValue = Math.min(Math.max(0, value), Math.max(0, trimEnd - MIN_SEGMENT_DURATION));
    setTrimStart(nextValue);
    seekTo(nextValue);
    setMessage("");
  };

  const updateTrimEnd = (value: number) => {
    const nextValue = Math.max(Math.min(duration, value), Math.min(duration, trimStart + MIN_SEGMENT_DURATION));
    setTrimEnd(nextValue);
    seekTo(nextValue);
    setMessage("");
  };

  const requestFullscreen = () => {
    void previewRef.current?.requestFullscreen?.();
  };

  const hasVideo = Boolean(file && videoUrl && duration >= MIN_SEGMENT_DURATION);

  return (
    <section className="videoProcessingWorkspace" dir={direction} aria-labelledby="video-processing-workspace-title">
      <aside className="videoProcessingWorkspace__sidebar">
        <h2 id="video-processing-workspace-title">{t("studio.videoWorkspace.title")}</h2>
        <VideoTrimPanel
          duration={duration}
          trimStart={trimStart}
          trimEnd={trimEnd}
          file={file}
          errorMessage={errorMessage}
          formatTime={formatVideoTime}
          formatFileSize={formatFileSize}
          onFileChange={handleFileChange}
          onTrimStartChange={updateTrimStart}
          onTrimEndChange={updateTrimEnd}
        />
      </aside>

      <div className="videoProcessingWorkspace__editor">
        <VideoPreview
          videoRef={videoRef}
          previewRef={previewRef}
          videoUrl={videoUrl}
          fileName={file?.name || t("studio.videoWorkspace.title")}
          isPlaying={isPlaying}
          isMuted={isMuted}
          filterValue={filterValue}
          isComparing={isComparing}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => { setIsPlaying(false); setIsPreviewingSelection(false); }}
          onError={() => setErrorMessage(t("studio.videoWorkspace.invalidFile"))}
          onTogglePlay={() => void togglePlay()}
          onSkipBack={() => seekTo(currentTime - 5)}
          onSkipForward={() => seekTo(currentTime + 5)}
          onToggleMute={() => setIsMuted((current) => !current)}
          onFullscreen={requestFullscreen}
        />

        <VideoTimeline
          duration={duration}
          currentTime={currentTime}
          trimStart={trimStart}
          trimEnd={trimEnd}
          disabled={!hasVideo}
          formatTime={formatVideoTime}
          onSeek={seekTo}
        />

        <div className="videoWorkspaceCommandBar" aria-label={t("studio.videoWorkspace.commands")}>
          <button type="button" disabled={!hasVideo} onClick={() => setMessage(t("studio.videoWorkspace.selectionPrepared"))}>
            <Scissors size={18} aria-hidden="true" />{t("studio.videoWorkspace.trimSelected")}
          </button>
          <button type="button" disabled={!hasVideo} onClick={() => setMessage(t("studio.videoWorkspace.deletePending"))}>
            <Trash2 size={18} aria-hidden="true" />{t("studio.videoWorkspace.deleteSelected")}
          </button>
          <button type="button" disabled={!hasVideo} onClick={resetSelection}>
            <RotateCcw size={18} aria-hidden="true" />{t("studio.videoWorkspace.resetSelection")}
          </button>
          <button type="button" disabled={!hasVideo} onClick={() => void previewSelection()}>
            <Eye size={18} aria-hidden="true" />{t("studio.videoWorkspace.previewSelection")}
          </button>
          <button type="button" disabled title={t("studio.videoWorkspace.exportEnginePreparing")}>
            <Download size={18} aria-hidden="true" />{t("studio.videoWorkspace.exportVideo")}
          </button>
        </div>

        <div className="videoWorkspaceStatus" aria-live="polite">
          <span>{t("studio.videoWorkspace.exportEnginePreparing")}</span>
          {message && <strong>{message}</strong>}
        </div>
      </div>
    </section>
  );
}
