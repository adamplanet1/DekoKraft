"use client";

type FilterLang = "ar" | "en" | "de" | "fr";

type ProductFiltersProps = {
  lang: FilterLang;
  category: string;
  status: string;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

const filterText: Record<
  FilterLang,
  {
    categoryLabel: string;
    categoryPlaceholder: string;
    statusLabel: string;
    statusPlaceholder: string;
    active: string;
    draft: string;
    archived: string;
  }
> = {
  ar: {
    categoryLabel: "التصنيف",
    categoryPlaceholder: "كل التصنيفات",
    statusLabel: "الحالة",
    statusPlaceholder: "كل الحالات",
    active: "نشط",
    draft: "مسودة",
    archived: "مؤرشف",
  },
  en: {
    categoryLabel: "Category",
    categoryPlaceholder: "All categories",
    statusLabel: "Status",
    statusPlaceholder: "All statuses",
    active: "Active",
    draft: "Draft",
    archived: "Archived",
  },
  de: {
    categoryLabel: "Kategorie",
    categoryPlaceholder: "Alle Kategorien",
    statusLabel: "Status",
    statusPlaceholder: "Alle Status",
    active: "Aktiv",
    draft: "Entwurf",
    archived: "Archiviert",
  },
  fr: {
    categoryLabel: "Categorie",
    categoryPlaceholder: "Toutes les categories",
    statusLabel: "Statut",
    statusPlaceholder: "Tous les statuts",
    active: "Actif",
    draft: "Brouillon",
    archived: "Archive",
  },
};

const statusOptions = ["active", "draft", "archived"] as const;

export default function ProductFilters({
  lang,
  category,
  status,
  onCategoryChange,
  onStatusChange,
}: ProductFiltersProps) {
  const text = filterText[lang];

  return (
    <div className="dkProductFilters">
      <label className="dkProductFilterField">
        <span>{text.categoryLabel}</span>
        <select
          value={category}
          aria-label={text.categoryLabel}
          onChange={(event) => onCategoryChange(event.target.value)}
        >
          <option value="">{text.categoryPlaceholder}</option>
          {category && <option value={category}>{category}</option>}
        </select>
      </label>

      <label className="dkProductFilterField">
        <span>{text.statusLabel}</span>
        <select
          value={status}
          aria-label={text.statusLabel}
          onChange={(event) => onStatusChange(event.target.value)}
        >
          <option value="">{text.statusPlaceholder}</option>
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {text[option]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
