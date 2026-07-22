"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import EchoImageStudio from "./components/EchoImageStudio";
import { WorkspaceProvider } from "./engine/WorkspaceContext";

type StudioBounds = { x: number; y: number; width: number; height: number };
type ResizeDirection = "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

const STORAGE_KEY = "dekokraft-studio-window-bounds-v2";
const SAFE_MARGIN = 12;
const DEFAULT_SIZE = { width: 1180, height: 820 };

const resizeHandles: Array<{ direction: ResizeDirection; label: string }> = [
  { direction: "top", label: "تغيير حجم النافذة من الأعلى" },
  { direction: "bottom", label: "تغيير حجم النافذة من الأسفل" },
  { direction: "left", label: "تغيير حجم النافذة من اليسار" },
  { direction: "right", label: "تغيير حجم النافذة من اليمين" },
  { direction: "top-left", label: "تغيير حجم النافذة من الزاوية العلوية اليسرى" },
  { direction: "top-right", label: "تغيير حجم النافذة من الزاوية العلوية اليمنى" },
  { direction: "bottom-left", label: "تغيير حجم النافذة من الزاوية السفلية اليسرى" },
  { direction: "bottom-right", label: "تغيير حجم النافذة من الزاوية السفلية اليمنى" },
];

function clampBounds(bounds: StudioBounds): StudioBounds {
  const availableWidth = Math.max(300, window.innerWidth - SAFE_MARGIN * 2);
  const availableHeight = Math.max(360, window.innerHeight - SAFE_MARGIN * 2);
  const minWidth = Math.min(820, availableWidth);
  const minHeight = Math.min(560, availableHeight);
  const width = Math.min(Math.max(bounds.width, minWidth), availableWidth);
  const height = Math.min(Math.max(bounds.height, minHeight), availableHeight);
  return {
    width,
    height,
    x: Math.min(Math.max(bounds.x, SAFE_MARGIN), window.innerWidth - SAFE_MARGIN - width),
    y: Math.min(Math.max(bounds.y, SAFE_MARGIN), window.innerHeight - SAFE_MARGIN - height),
  };
}

function centeredBounds(): StudioBounds {
  const width = Math.min(DEFAULT_SIZE.width, window.innerWidth - SAFE_MARGIN * 2);
  const height = Math.min(DEFAULT_SIZE.height, window.innerHeight - SAFE_MARGIN * 2);
  return clampBounds({
    width,
    height,
    x: (window.innerWidth - width) / 2,
    y: (window.innerHeight - height) / 2,
  });
}

export default function ImageStudioPage() {
  const router = useRouter();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [bounds, setBounds] = useState<StudioBounds>({ x: SAFE_MARGIN, y: SAFE_MARGIN, ...DEFAULT_SIZE });
  const restoreBoundsRef = useRef<StudioBounds | null>(null);
  const resizeStart = useRef<{ pointerId: number; direction: ResizeDirection; x: number; y: number; bounds: StudioBounds } | null>(null);

  const persistBounds = (nextBounds: StudioBounds) => {
    setBounds(nextBounds);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextBounds));
  };

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        persistBounds(clampBounds(JSON.parse(saved) as StudioBounds));
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
        persistBounds(centeredBounds());
      }
    } else {
      persistBounds(centeredBounds());
    }

    const handleViewportResize = () => {
      if (!isMaximized) setBounds((current) => clampBounds(current));
    };
    window.addEventListener("resize", handleViewportResize);
    return () => window.removeEventListener("resize", handleViewportResize);
  }, [isMaximized]);

  useEffect(() => {
    document.body.classList.toggle("studioWindowIsResizing", isResizing);
    return () => document.body.classList.remove("studioWindowIsResizing");
  }, [isResizing]);

  const handleResizeStart = (direction: ResizeDirection, event: PointerEvent<HTMLButtonElement>) => {
    if (isMaximized) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeStart.current = { pointerId: event.pointerId, direction, x: event.clientX, y: event.clientY, bounds };
    setIsResizing(true);
  };

  const handleResizeMove = (event: PointerEvent<HTMLButtonElement>) => {
    const start = resizeStart.current;
    if (!start || start.pointerId !== event.pointerId || isMaximized) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const fromLeft = start.direction.includes("left");
    const fromRight = start.direction.includes("right");
    const fromTop = start.direction.includes("top");
    const fromBottom = start.direction.includes("bottom");
    const right = start.bounds.x + start.bounds.width;
    const bottom = start.bounds.y + start.bounds.height;
    const rawWidth = start.bounds.width + (fromRight ? dx : 0) - (fromLeft ? dx : 0);
    const rawHeight = start.bounds.height + (fromBottom ? dy : 0) - (fromTop ? dy : 0);
    const sized = clampBounds({
      x: fromLeft ? start.bounds.x + dx : start.bounds.x,
      y: fromTop ? start.bounds.y + dy : start.bounds.y,
      width: rawWidth,
      height: rawHeight,
    });
    const nextBounds = clampBounds({
      ...sized,
      x: fromLeft ? right - sized.width : sized.x,
      y: fromTop ? bottom - sized.height : sized.y,
    });
    persistBounds(nextBounds);
  };

  const handleResizeEnd = () => {
    resizeStart.current = null;
    setIsResizing(false);
  };

  const maximize = () => {
    restoreBoundsRef.current = bounds;
    setIsMaximized(true);
  };

  const restore = () => {
    if (restoreBoundsRef.current) persistBounds(clampBounds(restoreBoundsRef.current));
    setIsMaximized(false);
  };

  const dialogStyle = isMaximized ? undefined : ({
    "--studio-window-width": `${bounds.width}px`,
    "--studio-window-height": `${bounds.height}px`,
    "--studio-window-left": `${bounds.x}px`,
    "--studio-window-top": `${bounds.y}px`,
  } as CSSProperties);

  return (
    <main className={`creativeStudiosOverlay${isResizing ? " creativeStudiosOverlay--resizing" : ""}`} dir="rtl">
      <section
        className={`creativeStudiosDialog${isMaximized ? " creativeStudiosDialog--echoImageMaximized" : ""}`}
        aria-label="معالجة الصور"
        style={dialogStyle}
      >
        <WorkspaceProvider initialWorkspace="image">
          <EchoImageStudio
            isMaximized={isMaximized}
            onMaximize={maximize}
            onRestore={restore}
            onBack={() => router.push("/")}
            onCloseStudio={() => router.push("/")}
          />
        </WorkspaceProvider>
        {!isMaximized && resizeHandles.map(({ direction, label }) => (
          <button
            key={direction}
            type="button"
            className={`creativeStudiosDialog__resizeHandle creativeStudiosDialog__resizeHandle--${direction}`}
            aria-label={label}
            title={label}
            onPointerDown={(event) => handleResizeStart(direction, event)}
            onPointerMove={handleResizeMove}
            onPointerUp={handleResizeEnd}
            onPointerCancel={handleResizeEnd}
            onLostPointerCapture={handleResizeEnd}
          />
        ))}
      </section>
    </main>
  );
}
