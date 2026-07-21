import type { DekoBrainCopy } from "../../config/dekoBrainTranslations";
import type { AnalyzedMediaItem } from "../../types/dekobrain";

export default function MediaList({
  copy,
  items,
  selectedId,
  onSelect,
}: {
  copy: DekoBrainCopy;
  items: AnalyzedMediaItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="dkBrainMediaLibrary" aria-label={copy.mediaList}>
      <div className="dkBrainLibraryHeading">
        <h2>{copy.mediaList}</h2>
        <span>{items.length}/20</span>
      </div>
      {items.length === 0 ? <p className="dkBrainEmptyList">{copy.emptyList}</p> : (
        <div className="dkBrainMediaGrid">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dkBrainMediaItem ${selectedId === item.id ? "active" : ""}`}
              aria-pressed={selectedId === item.id}
              onClick={() => onSelect(item.id)}
            >
              {/* Blob URLs are local previews and cannot use the Next image optimizer. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.previewUrl} alt="" />
              <span className="dkBrainMediaItemText">
                <strong title={item.filename}>{item.filename}</strong>
                <small>{item.width} × {item.height}px</small>
                <small>{copy.warningCount.replace("{count}", String(item.qualityWarnings.length))}</small>
              </span>
              <span className={`dkBrainItemStatus ${item.status}`}>{copy.itemStatuses[item.status]}</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

