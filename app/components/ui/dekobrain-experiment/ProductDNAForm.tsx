"use client";

import { ImagePlus, Sparkles } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { useLanguage } from "../../LanguageProvider";

export type ProductDNADraft = {
  productName: string;
  productType: string;
  description: string;
  imageName: string;
  imageUrl: string;
  material: string;
  color: string;
  dimensions: string;
  usage: string;
  style: string;
};

type Props = {
  value: ProductDNADraft;
  onChange: (value: ProductDNADraft) => void;
  onAnalyze: () => void;
};

const fields: Array<keyof Omit<ProductDNADraft, "imageName" | "imageUrl">> = [
  "productName", "productType", "description", "material", "color", "dimensions", "usage", "style",
];

export default function ProductDNAForm({ value, onChange, onAnalyze }: Props) {
  const { t } = useLanguage();
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (key: keyof ProductDNADraft, next: string) => onChange({ ...value, [key]: next });
  const selectImage = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange({ ...value, imageName: file.name, imageUrl: reader.result });
    };
    reader.readAsDataURL(file);
  };

  return (
    <form className="dkBrainExperimentForm" onSubmit={(event) => { event.preventDefault(); onAnalyze(); }}>
      <div className="dkBrainExperimentForm__grid">
        {fields.map((field) => (
          <label key={field} className={field === "description" ? "is-wide" : undefined}>
            <span>{t(`admin.brainCenter.experiment.fields.${field}`)}</span>
            {field === "description" ? (
              <textarea value={value[field]} rows={3} onChange={(event) => update(field, event.target.value)} />
            ) : (
              <input value={value[field]} onChange={(event) => update(field, event.target.value)} />
            )}
          </label>
        ))}
        <div className="dkBrainExperimentForm__image is-wide">
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => selectImage(event.target.files?.[0])} />
          <button type="button" onClick={() => fileRef.current?.click()}>
            {value.imageUrl ? <Image src={value.imageUrl} alt="" width={72} height={72} unoptimized /> : <ImagePlus aria-hidden="true" />}
            <span>{value.imageName || t("admin.brainCenter.experiment.fields.image")}</span>
          </button>
        </div>
      </div>
      <button type="submit" className="dkBrainExperimentPrimary"><Sparkles aria-hidden="true" />{t("admin.brainCenter.experiment.analyze")}</button>
    </form>
  );
}
