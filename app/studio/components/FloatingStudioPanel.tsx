"use client";

import { GripVertical, Minus, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type PointerEvent, type ReactNode, type RefObject } from "react";

type PanelBounds = { x: number; y: number; width: number; height: number };
type ResizeEdge = "top" | "bottom" | "left" | "right" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

type FloatingStudioPanelProps = {
  panelId: string;
  title: string;
  icon: ReactNode;
  boundaryRef: RefObject<HTMLDivElement | null>;
  storageKey: string;
  initialSize: { width: number; height: number };
  initialSide: "left" | "right";
  minWidth: number;
  minHeight: number;
  maxWidthRatio: number;
  maxHeightRatio: number;
  onClose: () => void;
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
  className?: string;
  children: ReactNode;
};

let highestPanelLayer = 80;
const SAFE_GAP = 10;
const SAFE_TOP = 72;

export default function FloatingStudioPanel({
  panelId,
  title,
  icon,
  boundaryRef,
  storageKey,
  initialSize,
  initialSide,
  minWidth,
  minHeight,
  maxWidthRatio,
  maxHeightRatio,
  onClose,
  closeButtonRef,
  className = "",
  children,
}: FloatingStudioPanelProps) {
  const panelRef = useRef<HTMLElement>(null);
  const skipInitialPersistRef = useRef(true);
  const interactionRef = useRef<{
    pointerId: number;
    kind: "drag" | "resize";
    edge?: ResizeEdge;
    x: number;
    y: number;
    bounds: PanelBounds;
  } | null>(null);
  const [bounds, setBounds] = useState<PanelBounds>({ x: SAFE_GAP, y: SAFE_TOP, ...initialSize });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [zIndex, setZIndex] = useState(81);

  const focusPanel = () => setZIndex(++highestPanelLayer);

  const clampBounds = useCallback((candidate: PanelBounds): PanelBounds => {
    const boundary = boundaryRef.current;
    if (!boundary) return candidate;
    const boundaryRect = boundary.getBoundingClientRect();
    const availableWidth = Math.max(180, boundaryRect.width - SAFE_GAP * 2);
    const availableHeight = Math.max(180, boundaryRect.height - SAFE_TOP - SAFE_GAP);
    const effectiveMinWidth = Math.min(minWidth, availableWidth);
    const effectiveMinHeight = Math.min(minHeight, availableHeight);
    const maximumWidth = Math.max(effectiveMinWidth, Math.min(availableWidth, boundaryRect.width * maxWidthRatio));
    const maximumHeight = Math.max(effectiveMinHeight, Math.min(availableHeight, boundaryRect.height * maxHeightRatio));
    const width = Math.min(Math.max(candidate.width, effectiveMinWidth), maximumWidth);
    const height = Math.min(Math.max(candidate.height, effectiveMinHeight), maximumHeight);
    return {
      width,
      height,
      x: Math.min(Math.max(candidate.x, SAFE_GAP), boundaryRect.width - width - SAFE_GAP),
      y: Math.min(Math.max(candidate.y, SAFE_TOP), boundaryRect.height - height - SAFE_GAP),
    };
  }, [boundaryRef, maxHeightRatio, maxWidthRatio, minHeight, minWidth]);

  const defaultBounds = useCallback((): PanelBounds => {
    const boundaryWidth = boundaryRef.current?.getBoundingClientRect().width ?? initialSize.width + SAFE_GAP * 2;
    const x = initialSide === "right" ? boundaryWidth - initialSize.width - SAFE_GAP : SAFE_GAP;
    return clampBounds({ x, y: SAFE_TOP, width: initialSize.width, height: initialSize.height });
  }, [boundaryRef, clampBounds, initialSide, initialSize.height, initialSize.width]);

  useEffect(() => {
    let next = defaultBounds();
    const stored = sessionStorage.getItem(storageKey);
    if (stored) {
      try {
        next = clampBounds(JSON.parse(stored) as PanelBounds);
      } catch {
        sessionStorage.removeItem(storageKey);
      }
    }
    setBounds(next);
    setIsReady(true);

    const boundary = boundaryRef.current;
    const observer = boundary && typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => setBounds((current) => clampBounds(current)))
      : null;
    if (boundary) observer?.observe(boundary);
    const clampOnViewportResize = () => setBounds((current) => clampBounds(current));
    window.addEventListener("resize", clampOnViewportResize);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", clampOnViewportResize);
    };
  }, [boundaryRef, clampBounds, defaultBounds, storageKey]);

  useEffect(() => {
    if (skipInitialPersistRef.current) {
      skipInitialPersistRef.current = false;
      return;
    }
    sessionStorage.setItem(storageKey, JSON.stringify(bounds));
  }, [bounds, storageKey]);

  const startInteraction = (
    event: PointerEvent<HTMLElement>,
    kind: "drag" | "resize",
    edge?: ResizeEdge,
  ) => {
    if (event.button !== 0) return;
    if (kind === "drag" && (event.target as HTMLElement).closest("button")) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    interactionRef.current = { pointerId: event.pointerId, kind, edge, x: event.clientX, y: event.clientY, bounds };
    setIsInteracting(true);
    focusPanel();
  };

  const moveInteraction = (event: PointerEvent<HTMLElement>) => {
    const start = interactionRef.current;
    if (!start || start.pointerId !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (start.kind === "drag") {
      setBounds(clampBounds({ ...start.bounds, x: start.bounds.x + dx, y: start.bounds.y + dy }));
      return;
    }
    const edge = start.edge ?? "bottom-right";
    const fromLeft = edge.includes("left");
    const fromRight = edge.includes("right");
    const fromTop = edge.includes("top");
    const fromBottom = edge.includes("bottom");
    const right = start.bounds.x + start.bounds.width;
    const bottom = start.bounds.y + start.bounds.height;
    const resized = clampBounds({
      x: fromLeft ? start.bounds.x + dx : start.bounds.x,
      y: fromTop ? start.bounds.y + dy : start.bounds.y,
      width: start.bounds.width + (fromRight ? dx : 0) - (fromLeft ? dx : 0),
      height: start.bounds.height + (fromBottom ? dy : 0) - (fromTop ? dy : 0),
    });
    setBounds(clampBounds({
      ...resized,
      x: fromLeft ? right - resized.width : resized.x,
      y: fromTop ? bottom - resized.height : resized.y,
    }));
  };

  const stopInteraction = (event: PointerEvent<HTMLElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    interactionRef.current = null;
    setIsInteracting(false);
  };

  const startDrag = (event: PointerEvent<HTMLElement>) => startInteraction(event, "drag");
  const startResize = (event: PointerEvent<HTMLButtonElement>) => {
    startInteraction(event, "resize", event.currentTarget.dataset.edge as ResizeEdge);
  };

  const restoreDefault = () => {
    setIsCollapsed(false);
    setBounds(defaultBounds());
    focusPanel();
  };

  const resizeEdges: ResizeEdge[] = ["top", "bottom", "left", "right", "top-left", "top-right", "bottom-left", "bottom-right"];

  return (
    <aside
      ref={panelRef}
      id={panelId}
      className={`floatingStudioPanel${isCollapsed ? " floatingStudioPanel--collapsed" : ""}${isInteracting ? " floatingStudioPanel--interacting" : ""}${className ? ` ${className}` : ""}`}
      style={{ left: bounds.x, top: bounds.y, width: bounds.width, height: isCollapsed ? 48 : bounds.height, zIndex, visibility: isReady ? "visible" : "hidden" }}
      onPointerDown={focusPanel}
      aria-label={title}
      dir="rtl"
    >
      <header
        className="floatingStudioPanel__header"
        onPointerDown={startDrag}
        onPointerMove={moveInteraction}
        onPointerUp={stopInteraction}
        onPointerCancel={stopInteraction}
      >
        <span className="floatingStudioPanel__drag"><GripVertical size={17} aria-hidden="true" /></span>
        <strong>{icon}{title}</strong>
        <div className="floatingStudioPanel__actions">
          <button type="button" aria-label={isCollapsed ? "توسيع اللوحة" : "طي اللوحة"} title={isCollapsed ? "توسيع" : "طي"} onClick={() => setIsCollapsed((current) => !current)}><Minus size={16} aria-hidden="true" /></button>
          <button type="button" aria-label="استعادة الحجم والموقع الافتراضي" title="استعادة الحجم" onClick={restoreDefault}><RotateCcw size={16} aria-hidden="true" /></button>
          <button ref={closeButtonRef} type="button" aria-label="إغلاق اللوحة" title="إغلاق" onClick={onClose}><X size={16} aria-hidden="true" /></button>
        </div>
      </header>
      {!isCollapsed && <div className="floatingStudioPanel__content">{children}</div>}
      {!isCollapsed && resizeEdges.map((edge) => (
        <button
          key={edge}
          type="button"
          className={`floatingStudioPanel__resize floatingStudioPanel__resize--${edge}`}
          data-edge={edge}
          aria-label={`تغيير حجم اللوحة من ${edge}`}
          tabIndex={-1}
          onPointerDown={startResize}
          onPointerMove={moveInteraction}
          onPointerUp={stopInteraction}
          onPointerCancel={stopInteraction}
        />
      ))}
    </aside>
  );
}
