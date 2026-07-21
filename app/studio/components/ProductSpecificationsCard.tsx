import type { SpecificationField } from "./CategoryDraftStore";
import DynamicSpecificationFields from "./DynamicSpecificationFields";
import type { SmartProductSpecifications } from "./SmartEditLearningStore";

export type SpecificationLabels = Record<Exclude<SpecificationField, "dimensions">, string> & {
  dimensions: string;
  dimensionLength: string;
  dimensionWidth: string;
  dimensionHeight: string;
  dimensionUnit: string;
};

export default function ProductSpecificationsCard({ specifications, fields, labels, yes, no, onChange }: {
  specifications: SmartProductSpecifications;
  fields: SpecificationField[];
  labels: SpecificationLabels;
  yes: string;
  no: string;
  onChange: (value: SmartProductSpecifications) => void;
}) {
  return <section className="smartEditSpecificationsCard"><DynamicSpecificationFields fields={fields} value={specifications} labels={labels} yes={yes} no={no} onChange={onChange} /></section>;
}
