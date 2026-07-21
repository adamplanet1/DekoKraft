import type { SpecificationField } from "./CategoryDraftStore";
import type { SmartProductSpecifications } from "./SmartEditLearningStore";
import ProductDimensionFields from "./ProductDimensionFields";
import type { SpecificationLabels } from "./ProductSpecificationsCard";

export default function DynamicSpecificationFields({ fields, value, labels, yes, no, onChange }: {
  fields: SpecificationField[]; value: SmartProductSpecifications; labels: SpecificationLabels; yes: string; no: string;
  onChange: (value: SmartProductSpecifications) => void;
}) {
  return <div className="smartEditSpecificationTable">
    {fields.map((field) => <div className={`specificationRow${field === "dimensions" ? " specificationRow--dimensions" : ""}`} key={field}>
      <span className="specificationLabel">{labels[field]}</span>
      <div className="specificationValue">
        {field === "dimensions" ? <ProductDimensionFields value={value.dimensions} labels={{ length: labels.dimensionLength, width: labels.dimensionWidth, height: labels.dimensionHeight, unit: labels.dimensionUnit }} onChange={(dimensions) => onChange({ ...value, dimensions })} />
          : field === "hasWick" ? <select value={value.hasWick ? "yes" : "no"} onChange={(event) => onChange({ ...value, hasWick: event.currentTarget.value === "yes" })}><option value="yes">{yes}</option><option value="no">{no}</option></select>
            : field === "background" ? <select value={value.background} onChange={(event) => onChange({ ...value, background: event.currentTarget.value })}><option value="light">{value.background || "light"}</option><option value="white">white</option><option value="transparent">transparent</option><option value="dark">dark</option></select>
              : <input type="text" value={String(value[field] ?? "")} onChange={(event) => onChange({ ...value, [field]: event.currentTarget.value })} />}
      </div>
    </div>)}
    <div className="specificationRow specificationRow--notes"><span className="specificationLabel">{labels.notes}</span><div className="specificationValue"><textarea value={value.notes} onChange={(event) => onChange({ ...value, notes: event.currentTarget.value })} /></div></div>
  </div>;
}
