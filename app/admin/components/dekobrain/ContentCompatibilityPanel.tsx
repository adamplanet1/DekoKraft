import type { DekoBrainAdvisorCopy } from "../../config/dekoBrainAdvisorTranslations";
import type {
  AnalyzedMediaItem,
  CompatibilityOverride,
  ProvisionalCategory,
} from "../../types/dekobrain";

const categories: ProvisionalCategory[] = ["candles", "packaging", "gifts", "children", "decoration", "services", "gypsum-decor", "other"];
const overrides: CompatibilityOverride[] = ["none", "approved", "rejected"];

export default function ContentCompatibilityPanel({
  copy,
  item,
  onCategoryChange,
  onCategoryConfirm,
  onOverrideChange,
}: {
  copy: DekoBrainAdvisorCopy;
  item: AnalyzedMediaItem;
  onCategoryChange: (category: ProvisionalCategory) => void;
  onCategoryConfirm: () => void;
  onOverrideChange: (override: CompatibilityOverride) => void;
}) {
  return (
    <section className="dkBrainPanel dkBrainDecisionInputPanel">
      <div className="dkBrainSectionHeading"><div><span>03</span><h2>{copy.contentTitle}</h2></div></div>
      <div className="dkBrainProvisionalBadge">◇ {copy.provisionalBadge}</div>
      <p>{copy.provisionalExplanation}</p>
      <div className="dkBrainFormGrid">
        <label>
          <span>{copy.categoryLabel}</span>
          <select value={item.provisionalCategory} onChange={(event) => onCategoryChange(event.target.value as ProvisionalCategory)}>
            {categories.map((category) => <option key={category} value={category}>{copy.categories[category]}</option>)}
          </select>
        </label>
        <div className="dkBrainReadout"><span>{copy.categorySource}</span><strong>{copy.categorySources[item.categorySource]}</strong></div>
      </div>
      {item.provisionalCategory === "gypsum-decor" && copy.gypsumDescription && <p className="dkBrainCategoryDescription">{copy.gypsumDescription}</p>}
      <button type="button" className="dkBrainPrimaryAction" onClick={onCategoryConfirm} disabled={item.categoryConfirmed}>
        {item.categoryConfirmed ? `✓ ${copy.confirmed}` : copy.confirmCategory}
      </button>

      <div className="dkBrainCompatibilityBlock">
        <div className="dkBrainSectionHeading"><div><span>04</span><h2>{copy.compatibilityTitle}</h2></div></div>
        <span className={`dkBrainCompatibilityBadge ${item.compatibilityStatus}`}>{copy.compatibility[item.compatibilityStatus]}</span>
        <p>{copy.compatibilityReasons[item.compatibilityStatus]}</p>
        <label>
          <span>{copy.overrideLabel}</span>
          <select value={item.compatibilityOverride} onChange={(event) => onOverrideChange(event.target.value as CompatibilityOverride)}>
            {overrides.map((override) => <option key={override} value={override}>{copy.overrides[override]}</option>)}
          </select>
        </label>
      </div>
    </section>
  );
}
