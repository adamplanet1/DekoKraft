import type { FormEvent } from "react";

export default function SmartEditComposer({ value, placeholder, sendLabel, disabled, onChange, onSubmit }: {
  value: string; placeholder: string; sendLabel: string; disabled: boolean; onChange: (value: string) => void; onSubmit: () => void;
}) {
  const submit = (event: FormEvent) => { event.preventDefault(); if (!disabled && value.trim()) onSubmit(); };
  return <form className="smartEditComposer" onSubmit={submit}>
    <textarea value={value} onChange={(event) => onChange(event.currentTarget.value)} placeholder={placeholder} disabled={disabled} rows={3} />
    <button type="submit" disabled={disabled || !value.trim()}>{sendLabel}</button>
  </form>;
}
