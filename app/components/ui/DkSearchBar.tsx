"use client";

import { useState, type FormEvent } from "react";

export type DkSearchBarProps = {
  label: string;
  placeholder: string;
  initialValue?: string;
  onSearch?: (value: string) => void;
  className?: string;
};

export default function DkSearchBar({
  label,
  placeholder,
  initialValue = "",
  onSearch,
  className,
}: DkSearchBarProps) {
  const [value, setValue] = useState(initialValue);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch?.(value.trim());
  }

  return (
    <form
      className={className ? `dk-search-bar ${className}` : "dk-search-bar"}
      role="search"
      onSubmit={handleSubmit}
    >
      <svg className="dk-search-bar__icon publicHeaderControlIcon" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="6.5" />
        <path d="m16 16 4 4" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
    </form>
  );
}
