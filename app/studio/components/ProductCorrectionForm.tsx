import type { ChangeEvent, FormEvent } from "react";
import type { SmartProductSpecifications } from "./SmartEditLearningStore";

type Labels = Record<keyof SmartProductSpecifications, string> & { yes: string; no: string; submit: string; cancel: string };

export default function ProductCorrectionForm({ value, labels, onChange, onSubmit, onCancel }: {
  value: SmartProductSpecifications;
  labels: Labels;
  onChange: (value: SmartProductSpecifications) => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const update = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const key = event.currentTarget.name as keyof SmartProductSpecifications;
    onChange({ ...value, [key]: event.currentTarget.type === "checkbox" ? (event.currentTarget as HTMLInputElement).checked : event.currentTarget.value });
  };
  const submit = (event: FormEvent) => { event.preventDefault(); onSubmit(); };
  return (
    <form className="smartEditCorrectionForm" onSubmit={submit}>
      {(Object.keys(value) as (keyof SmartProductSpecifications)[]).filter((key) => key !== "hasWick").map((key) => (
        <label key={key}>{labels[key]}
          {key === "notes" ? <textarea name={key} value={String(value[key])} onChange={update} /> : <input name={key} value={String(value[key])} onChange={update} />}
        </label>
      ))}
      <label className="smartEditCorrectionForm__check"><input type="checkbox" name="hasWick" checked={value.hasWick} onChange={update} /> {labels.hasWick}</label>
      <div className="smartEditChat__actions"><button type="submit">{labels.submit}</button><button type="button" onClick={onCancel}>{labels.cancel}</button></div>
    </form>
  );
}
