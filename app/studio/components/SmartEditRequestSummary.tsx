export default function SmartEditRequestSummary({ summary, changes = [], protectedItems = [], purpose, aspectRatio, confirmLabel, editLabel, cancelLabel, disabled, busy, onConfirm, onEdit, onCancel }: {
  summary: string; confirmLabel: string; editLabel: string; cancelLabel: string; disabled: boolean; busy: boolean;
  changes?: string[]; protectedItems?: string[]; purpose?: string; aspectRatio?: string;
  onConfirm: () => void; onEdit: () => void; onCancel: () => void;
}) {
  return <section className="smartEditRequestSummary"><strong>Echo</strong><p>{summary}</p><dl>{changes.length > 0 && <div><dt>Changes</dt><dd>{changes.join(" · ")}</dd></div>}{protectedItems.length > 0 && <div><dt>Protected</dt><dd>{protectedItems.join(" · ")}</dd></div>}{purpose && <div><dt>Purpose</dt><dd>{purpose}</dd></div>}{aspectRatio && <div><dt>Ratio</dt><dd>{aspectRatio}</dd></div>}</dl><div className="smartEditChat__actions"><button type="button" disabled={disabled || busy} onClick={onConfirm}>{confirmLabel}</button><button type="button" disabled={busy} onClick={onEdit}>{editLabel}</button><button type="button" disabled={busy} onClick={onCancel}>{cancelLabel}</button></div></section>;
}
