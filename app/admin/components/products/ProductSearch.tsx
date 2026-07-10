"use client";

type SearchLang = "ar" | "en" | "de" | "fr";

type ProductSearchProps = {
  lang: SearchLang;
  value: string;
  onChange: (value: string) => void;
};

const placeholders: Record<SearchLang, string> = {
  ar: "ابحث عن منتج",
  en: "Search products...",
  de: "Produkte suchen...",
  fr: "Rechercher des produits...",
};

export default function ProductSearch({
  lang,
  value,
  onChange,
}: ProductSearchProps) {
  const placeholder = placeholders[lang];

  return (
    <label className="dkProductSearch">
      <span className="dkProductSearchIcon" aria-hidden="true">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10.75 18.5a7.75 7.75 0 1 1 0-15.5 7.75 7.75 0 0 1 0 15.5ZM16.25 16.25 21 21"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </span>

      <input
        type="search"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
