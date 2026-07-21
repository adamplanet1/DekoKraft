"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { useRouter } from "next/navigation";
import EchoImageStudio from "./components/EchoImageStudio";
import { WorkspaceProvider } from "./engine/WorkspaceContext";

export default function ImageStudioPage() {
  const router = useRouter();
  const [isMaximized, setIsMaximized] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1180, height: 860 });
  const resizeStart = useRef<{ x: number; y: number; width: number; height: number } | null>(null);

  const clampSize = (width: number, height: number) => {
    const maxWidth = Math.max(300, window.innerWidth - 32);
    const maxHeight = Math.max(480, window.innerHeight - 32);
    return {
      width: Math.min(Math.max(width, Math.min(720, maxWidth)), maxWidth),
      height: Math.min(Math.max(height, Math.min(640, maxHeight)), maxHeight),
    };
  };

  useEffect(() => {
    const saved = sessionStorage.getItem("dekokraft-studio-window-size");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as { width: number; height: number };
        setWindowSize(clampSize(parsed.width, parsed.height));
      } catch {
        sessionStorage.removeItem("dekokraft-studio-window-size");
      }
    } else {
      setWindowSize((current) => clampSize(current.width, current.height));
    }
    const handleViewportResize = () => setWindowSize((current) => clampSize(current.width, current.height));
    window.addEventListener("resize", handleViewportResize);
    return () => window.removeEventListener("resize", handleViewportResize);
  }, []);

  const persistSize = (size: typeof windowSize) => {
    setWindowSize(size);
    sessionStorage.setItem("dekokraft-studio-window-size", JSON.stringify(size));
  };

  const handleResizeStart = (event: PointerEvent<HTMLButtonElement>) => {
    if (isMaximized) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeStart.current = { x: event.clientX, y: event.clientY, ...windowSize };
  };

  const handleResizeMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!resizeStart.current || isMaximized) return;
    persistSize(clampSize(
      resizeStart.current.width + resizeStart.current.x - event.clientX,
      resizeStart.current.height + event.clientY - resizeStart.current.y,
    ));
  };

  const handleResizeEnd = () => {
    resizeStart.current = null;
  };

  const dialogStyle = isMaximized ? undefined : ({
    "--studio-window-width": `${windowSize.width}px`,
    "--studio-window-height": `${windowSize.height}px`,
  } as CSSProperties);

  return (
    <main className="creativeStudiosOverlay" dir="rtl">
      <section
        className={`creativeStudiosDialog${isMaximized ? " creativeStudiosDialog--echoImageMaximized" : ""}`}
        aria-label="معالجة الصور"
        style={dialogStyle}
      >
        <WorkspaceProvider initialWorkspace="image">
          <EchoImageStudio
            isMaximized={isMaximized}
            onMaximize={() => setIsMaximized(true)}
            onRestore={() => setIsMaximized(false)}
            onBack={() => router.push("/")}
            onCloseStudio={() => router.push("/")}
          />
        </WorkspaceProvider>
        {!isMaximized && <button
          type="button"
          className="creativeStudiosDialog__resizeHandle"
          aria-label="تغيير حجم نافذة الاستوديو"
          title="اسحب لتغيير حجم النافذة"
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
        />}
      </section>
    </main>
  );
}
