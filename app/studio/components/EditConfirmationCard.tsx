export default function EditConfirmationCard({ message, confirmLabel, editLabel, rejectLabel, onConfirm, onEdit, onReject }: {
  message: string; confirmLabel: string; editLabel: string; rejectLabel: string; onConfirm: () => void; onEdit: () => void; onReject: () => void;
}) {
  return <section className="smartEditConfirmationCard"><p>{message}</p><div className="smartEditChat__actions">
    <button type="button" onClick={onConfirm}>{confirmLabel}</button>
    <button type="button" onClick={onEdit}>{editLabel}</button>
    <button type="button" onClick={onReject}>{rejectLabel}</button>
  </div></section>;
}
