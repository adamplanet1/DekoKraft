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
  initialAnchorRef?: RefObject<HTMLElement | null>;
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
const PANEL_EDGE_GAP = 12;

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export default function FloatingStudioPanel({
  panelId,
  title,
  icon,
  boundaryRef,
  initialAnchorRef,
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
  const [bounds, setBounds] = useState<PanelBounds>({ x: PANEL_EDGE_GAP, y: PANEL_EDGE_GAP, ...initialSize });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [zIndex, setZIndex] = useState(81);

  const focusPanel = () => setZIndex(++highestPanelLayer);

  const clampBounds = useCallback((candidate: PanelBounds): PanelBounds => {
    const boundary = boundaryRef.current;
    if (!boundary) return candidate;
    const boundaryWidth = boundary.clientWidth;
    const boundaryHeight = boundary.clientHeight;
    const availableWidth = Math.max(0, boundaryWidth - PANEL_EDGE_GAP * 2);
    const availableHeight = Math.max(0, boundaryHeight - PANEL_EDGE_GAP * 2);
    const effectiveMinWidth = Math.min(minWidth, availableWidth);
    const effectiveMinHeight = Math.min(minHeight, availableHeight);
    const maximumWidth = Math.max(effectiveMinWidth, Math.min(availableWidth, boundaryWidth * maxWidthRatio));
    const maximumHeight = Math.max(effectiveMinHeight, Math.min(availableHeight, boundaryHeight * maxHeightRatio));
    const width = Math.min(Math.max(candidate.width, effectiveMinWidth), maximumWidth);
    const height = Math.min(Math.max(candidate.height, effectiveMinHeight), maximumHeight);
    const maximumX = Math.max(PANEL_EDGE_GAP, boundaryWidth - width - PANEL_EDGE_GAP);
    const maximumY = Math.max(PANEL_EDGE_GAP, boundaryHeight - height - PANEL_EDGE_GAP);
    return {
      width,
      height,
      x: clamp(candidate.x, PANEL_EDGE_GAP, maximumX),
      y: clamp(candidate.y, PANEL_EDGE_GAP, maximumY),
    };
  }, [boundaryRef, maxHeightRatio, maxWidthRatio, minHeight, minWidth]);

  const clampMeasuredPanel = useCallback(() => {
    const boundary = boundaryRef.current;
    const panel = panelRef.current;
    if (!boundary || !panel) return;

    const boundaryRect = boundary.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const localX = panelRect.left - boundaryRect.left;
    const localY = panelRect.top - boundaryRect.top;
    const maximumX = Math.max(PANEL_EDGE_GAP, boundaryRect.width - panelRect.width - PANEL_EDGE_GAP);
    const maximumY = Math.max(PANEL_EDGE_GAP, boundaryRect.height - panelRect.height - PANEL_EDGE_GAP);
    const measuredX = clamp(localX, PANEL_EDGE_GAP, maximumX);
    const measuredY = clamp(localY, PANEL_EDGE_GAP, maximumY);

    setBounds((current) => {
      const next = clampBounds({
        ...current,
        x: current.x + measuredX - localX,
        y: current.y + measuredY - localY,
      });
      return next.x === current.x
        && next.y === current.y
        && next.width === current.width
        && next.height === current.height
        ? current
        : next;
    });
  }, [boundaryRef, clampBounds]);

  const defaultBounds = useCallback((): PanelBounds => {
    const boundary = boundaryRef.current;
    const boundaryWidth = boundary?.clientWidth ?? initialSize.width + PANEL_EDGE_GAP * 2;
    const anchor = initialAnchorRef?.current;
    if (boundary && anchor) {
      const boundaryRect = boundary.getBoundingClientRect();
      const anchorRect = anchor.getBoundingClientRect();
      return clampBounds({
        x: anchorRect.left - boundaryRect.left + PANEL_EDGE_GAP,
        y: anchorRect.top - boundaryRect.top + PANEL_EDGE_GAP,
        width: initialSize.width,
        height: initialSize.height,
      });
    }
    const x = initialSide === "right" ? boundaryWidth - initialSize.width - PANEL_EDGE_GAP : PANEL_EDGE_GAP;
    return clampBounds({ x, y: PANEL_EDGE_GAP, width: initialSize.width, height: initialSize.height });
  }, [boundaryRef, clampBounds, initialAnchorRef, initialSide, initialSize.height, initialSize.width]);

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
    const panel = panelRef.current;
    const observer = boundary && typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(() => {
          setBounds((current) => clampBounds(current));
          window.requestAnimationFrame(clampMeasuredPanel);
        })
      : null;
    if (boundary) observer?.observe(boundary);
    if (panel) observer?.observe(panel);
    const openingFrame = window.requestAnimationFrame(clampMeasuredPanel);
    const clampOnViewportResize = () => {
      setBounds((current) => clampBounds(current));
      window.requestAnimationFrame(clampMeasuredPanel);
    };
    window.addEventListener("resize", clampOnViewportResize);
    return () => {
      window.cancelAnimationFrame(openingFrame);
      observer?.disconnect();
      window.removeEventListener("resize", clampOnViewportResize);
    };
  }, [boundaryRef, clampBounds, clampMeasuredPanel, defaultBounds, storageKey]);

  useEffect(() => {
    if (!isReady) return;
    const frame = window.requestAnimationFrame(clampMeasuredPanel);
    return () => window.cancelAnimationFrame(frame);
  }, [clampMeasuredPanel, isCollapsed, isReady]);

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
    window.requestAnimationFrame(clampMeasuredPanel);
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
