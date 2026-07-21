"use client";

import {
  AlignCenter,
  Circle,
  CircleEllipsis,
  Combine,
  Eraser,
  FlipHorizontal2,
  GalleryHorizontal,
  Heart,
  Hexagon,
  Minus,
  MousePointer2,
  PaintBucket,
  Pencil,
  Pipette,
  RectangleHorizontal,
  RotateCw,
  Shapes,
  Sparkles,
  Spline,
  Square,
  Star,
  Triangle,
  Type,
  Ungroup,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../../components/LanguageProvider";
import { DkButton, DkGlassPanel } from "../../../components/ui";
import StudioPageShell from "../../components/StudioPageShell";
import StudioTabs from "../../components/StudioTabs";
import StudioToolCard from "../../components/StudioToolCard";

type LaserTab = "drawing" | "vectors" | "settings" | "dna" | "echo";

const DRAWING_TOOLS: Array<{ key: string; icon: LucideIcon }> = [
  { key: "select", icon: MousePointer2 }, { key: "line", icon: Minus },
  { key: "rectangle", icon: RectangleHorizontal }, { key: "square", icon: Square },
  { key: "circle", icon: Circle }, { key: "ellipse", icon: CircleEllipsis },
  { key: "triangle", icon: Triangle }, { key: "polygon", icon: Hexagon },
  { key: "star", icon: Star }, { key: "heart", icon: Heart },
  { key: "curve", icon: Spline }, { key: "pen", icon: Pencil },
  { key: "eraser", icon: Eraser }, { key: "text", icon: Type },
  { key: "fill", icon: PaintBucket }, { key: "eyedropper", icon: Pipette },
];

const VECTOR_OPERATIONS: Array<{ key: string; icon: LucideIcon }> = [
  { key: "union", icon: Combine }, { key: "difference", icon: Shapes },
  { key: "intersect", icon: GalleryHorizontal }, { key: "weld", icon: Combine },
  { key: "offset", icon: Square }, { key: "editNodes", icon: Spline },
  { key: "breakApart", icon: Ungroup }, { key: "group", icon: Combine },
  { key: "ungroup", icon: Ungroup }, { key: "align", icon: AlignCenter },
  { key: "distribute", icon: GalleryHorizontal }, { key: "mirror", icon: FlipHorizontal2 },
  { key: "rotate", icon: RotateCw },
];

const DNA_FIELDS = ["accuracy", "pathSafety", "cutability", "weakParts", "workTime", "materialUse", "burnRisk", "echoScore"];
const MAGIC_SHAPES = ["square", "rectangle", "circle", "hexagon", "star", "heart", "flower", "leaf", "butterfly", "puzzle", "box", "house", "namePlate", "frame", "ringBox", "candleBox", "fingerJoint"];
const MAGIC_ICONS = ["□", "▭", "○", "⬡", "☆", "♡", "✿", "🍃", "🦋", "🧩", "▣", "⌂", "▱", "▢", "💍", "🕯️", "⚙"];

export default function DekoLaserStudio() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<LaserTab>("drawing");
  const [isMagicOpen, setIsMagicOpen] = useState(false);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [echoPrompt, setEchoPrompt] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const magicTriggerRef = useRef<HTMLButtonElement>(null);

  const tabs = (["drawing", "vectors", "settings", "dna", "echo"] as LaserTab[]).map((id) => ({
    id,
    label: t(`studio.laser.tabs.${id}`),
  }));

  useEffect(() => {
    if (!isMagicOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMagicOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      magicTriggerRef.current?.focus();
    };
  }, [isMagicOpen]);

  const showPlaceholder = (message = t("studio.common.comingSoonMessage")) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2800);
  };

  return (
    <StudioPageShell
      title={t("studio.laser.title")}
      description={t("studio.laser.description")}
      status="development"
    >
      <div className="smartStudioWorkspace">
        <StudioTabs
          tabs={tabs}
          activeTab={activeTab}
          onChange={(tab) => setActiveTab(tab as LaserTab)}
          ariaLabel={t("studio.laser.title")}
        />

        {activeTab === "drawing" && (
          <DkGlassPanel as="section" strength="subtle" className="smartStudioPanel">
            <div className="smartStudioSectionHeading">
              <div><h2>{t("studio.laser.sections.drawingTitle")}</h2><p>{t("studio.laser.sections.drawingDescription")}</p></div>
              <DkButton
                variant="primary"
                size="sm"
                icon={<Sparkles size={18} />}
                onClick={(event) => {
                  magicTriggerRef.current = event.currentTarget as HTMLButtonElement;
                  setIsMagicOpen(true);
                }}
              >
                {t("studio.laser.sections.magicShapes")}
              </DkButton>
            </div>
            <div className="smartStudioToolGrid">
              {DRAWING_TOOLS.map(({ key, icon: Icon }) => (
                <StudioToolCard key={key} icon={<Icon size={23} />} label={t(`studio.laser.tools.${key}`)} onClick={() => showPlaceholder()} />
              ))}
            </div>
          </DkGlassPanel>
        )}

        {activeTab === "vectors" && (
          <DkGlassPanel as="section" strength="subtle" className="smartStudioPanel">
            <div className="smartStudioSectionHeading"><div><h2>{t("studio.laser.sections.vectorsTitle")}</h2><p>{t("studio.laser.sections.vectorsDescription")}</p></div></div>
            <div className="smartStudioToolGrid">
              {VECTOR_OPERATIONS.map(({ key, icon: Icon }) => (
                <StudioToolCard key={key} icon={<Icon size={23} />} label={t(`studio.laser.vectors.${key}`)} onClick={() => showPlaceholder()} />
              ))}
            </div>
          </DkGlassPanel>
        )}

        {activeTab === "settings" && (
          <DkGlassPanel as="section" strength="subtle" className="smartStudioPanel">
            <div className="smartStudioSectionHeading"><div><h2>{t("studio.laser.sections.settingsTitle")}</h2><p>{t("studio.laser.sections.settingsDescription")}</p></div></div>
            <div className="smartStudioFormGrid">
              <label><span>{t("studio.laser.settings.operation")}</span><select defaultValue="cut"><option value="cut">{t("studio.laser.settings.cut")}</option><option value="engrave">{t("studio.laser.settings.engrave")}</option><option value="score">{t("studio.laser.settings.score")}</option><option value="fill">{t("studio.laser.settings.fill")}</option></select></label>
              <label><span>{t("studio.laser.settings.speed")}</span><input type="number" min="0" defaultValue="20" /></label>
              <label><span>{t("studio.laser.settings.power")}</span><input type="number" min="0" max="100" defaultValue="60" /></label>
              <label><span>{t("studio.laser.settings.passes")}</span><input type="number" min="1" defaultValue="1" /></label>
              <label><span>{t("studio.laser.settings.airAssist")}</span><select defaultValue="on"><option value="on">{t("studio.laser.settings.on")}</option><option value="off">{t("studio.laser.settings.off")}</option></select></label>
              <label><span>{t("studio.laser.settings.kerf")}</span><input type="number" min="0" step="0.01" defaultValue="0.15" /></label>
              <label><span>{t("studio.laser.settings.material")}</span><input type="text" /></label>
              <label><span>{t("studio.laser.settings.thickness")}</span><input type="number" min="0" step="0.1" defaultValue="3" /></label>
              <label className="smartStudioFormField--wide"><span>{t("studio.laser.settings.workspace")}</span><input type="text" inputMode="numeric" placeholder="600 × 400 mm" /></label>
            </div>
          </DkGlassPanel>
        )}

        {activeTab === "dna" && (
          <DkGlassPanel as="section" strength="subtle" className="smartStudioPanel">
            <div className="smartStudioSectionHeading"><div><h2>{t("studio.laser.sections.dnaTitle")}</h2><p>{t("studio.laser.dna.intro")}</p></div></div>
            <div className="smartStudioDnaGrid">
              {DNA_FIELDS.map((field) => <article key={field} className="smartStudioDnaField"><strong>{t(`studio.laser.dna.fields.${field}`)}</strong><span>{t("studio.common.waiting")}</span></article>)}
            </div>
          </DkGlassPanel>
        )}

        {activeTab === "echo" && (
          <DkGlassPanel as="section" strength="subtle" className="smartStudioPanel">
            <div className="smartStudioSectionHeading"><div><h2>{t("studio.laser.sections.echoTitle")}</h2><p>{t("studio.laser.echo.description")}</p></div></div>
            <div className="smartStudioEchoExamples"><strong>{t("studio.laser.echo.examplesTitle")}</strong><ul>{[1, 2, 3, 4, 5].map((number) => <li key={number}>{t(`studio.laser.echo.example${number}`)}</li>)}</ul></div>
            <div className="smartStudioPrompt"><textarea value={echoPrompt} onChange={(event) => setEchoPrompt(event.target.value)} placeholder={t("studio.laser.echo.placeholder")} /><DkButton variant="primary" onClick={() => showPlaceholder(t("studio.common.featureUnavailable"))}>{t("studio.laser.echo.generate")}</DkButton></div>
          </DkGlassPanel>
        )}

        {notice && <p className="smartStudioNotice" role="status">{notice}</p>}
      </div>

      {isMagicOpen && (
        <div className="smartStudioModalOverlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsMagicOpen(false); }}>
          <div ref={dialogRef} className="smartStudioModal" role="dialog" aria-modal="true" aria-labelledby="magic-shapes-title" tabIndex={-1}>
            <button type="button" className="smartStudioModal__close" aria-label={t("buttons.close")} onClick={() => setIsMagicOpen(false)}><X size={22} /></button>
            <header><h2 id="magic-shapes-title">{t("studio.laser.magic.title")}</h2><p>{t("studio.laser.magic.description")}</p></header>
            <div className="smartStudioMagicGrid">
              {MAGIC_SHAPES.map((shape, index) => <StudioToolCard key={shape} icon={MAGIC_ICONS[index]} label={t(`studio.laser.magic.shapes.${shape}`)} selected={selectedShape === shape} onClick={() => setSelectedShape(shape)} />)}
            </div>
            <div className="smartStudioModal__footer">
              <p>{t("studio.laser.magic.selected")}: <strong>{selectedShape ? t(`studio.laser.magic.shapes.${selectedShape}`) : t("studio.common.waiting")}</strong></p>
              <DkButton variant="primary" disabled={!selectedShape} onClick={() => showPlaceholder(t("studio.laser.magic.message"))}>{t("studio.laser.magic.add")}</DkButton>
            </div>
          </div>
        </div>
      )}
    </StudioPageShell>
  );
}
