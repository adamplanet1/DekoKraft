"use client";

import { Check, Pencil, X } from "lucide-react";
import { useLanguage } from "../../LanguageProvider";

type Props = {
  request: string;
  suggestion: string;
  isEditing: boolean;
  onRequestChange: (value: string) => void;
  onSuggest: () => void;
  onConfirm: () => void;
  onEdit: () => void;
  onReject: () => void;
};

export default function EchoConfirmationDialog({ request, suggestion, isEditing, onRequestChange, onSuggest, onConfirm, onEdit, onReject }: Props) {
  const { t } = useLanguage();
  return (
    <section className="dkBrainEchoConfirmation">
      <h3>{t("admin.brainCenter.experiment.smartSuggestion")}</h3>
      <textarea value={request} rows={3} onChange={(event) => onRequestChange(event.target.value)} placeholder={t("admin.brainCenter.experiment.requestPlaceholder")} />
      <button type="button" className="dkBrainExperimentSecondary" disabled={!request.trim()} onClick={onSuggest}>{t("admin.brainCenter.experiment.createSuggestion")}</button>
      {suggestion && (
        <div className="dkBrainEchoConfirmation__suggestion">
          <small>{t("admin.brainCenter.experiment.echoUnderstood")}</small>
          <p>{suggestion}</p>
          {isEditing && <p className="dkBrainExperimentNote">{t("admin.brainCenter.experiment.editHint")}</p>}
          <div>
            <button type="button" onClick={onConfirm}><Check aria-hidden="true" />{t("admin.brainCenter.experiment.confirm")}</button>
            <button type="button" onClick={onEdit}><Pencil aria-hidden="true" />{t("admin.brainCenter.experiment.editRequest")}</button>
            <button type="button" onClick={onReject}><X aria-hidden="true" />{t("admin.brainCenter.experiment.reject")}</button>
          </div>
        </div>
      )}
    </section>
  );
}
