import type { DekoBrainAdvisorCopy } from "../../config/dekoBrainAdvisorTranslations";
import type { AdvisorDecision } from "../../types/dekobrain";

export default function DekoBrainAdvisorCard({ copy, decision, onNextAction }: {
  copy: DekoBrainAdvisorCopy;
  decision: AdvisorDecision;
  onNextAction: () => void;
}) {
  const actionLabel = decision.nextAction === "useAsIs" ? copy.useAsIs : copy.improvements[decision.nextAction];
  return (
    <section className={`dkBrainAdvisorCard ${decision.verdict}`}>
      <div className="dkBrainAdvisorHeader">
        <div><span>11</span><h2>{copy.advisorTitle}</h2><p>{copy.advisorSubtitle}</p></div>
        <div className="dkBrainAdvisorScore"><strong>{decision.score}</strong><span>{copy.readinessScore}</span></div>
      </div>
      <div className="dkBrainAdvisorVerdict">{copy.verdicts[decision.verdict]}</div>
      <div className="dkBrainAdvisorColumns">
        <div><h3>{copy.why}</h3><ul>{decision.reasons.map((reason) => <li key={reason}>{copy.reasons[reason]}</li>)}</ul></div>
        <div><h3>{copy.strengthsTitle}</h3><ul>{decision.strengths.map((strength) => <li key={strength}>✓ {copy.strengths[strength]}</li>)}</ul></div>
        <div><h3>{copy.improvementsTitle}</h3>{decision.improvements.length ? <ul>{decision.improvements.map((improvement) => <li key={improvement}>{copy.improvements[improvement]}</li>)}</ul> : <p>✓ {copy.verdicts.ready}</p>}</div>
        <div><h3>{copy.usesTitle}</h3><ul>{decision.recommendedUses.map((use) => <li key={use}>{copy.uses[use]}</li>)}</ul></div>
      </div>
      <button type="button" className="dkBrainAdvisorAction" onClick={onNextAction}>{actionLabel}</button>
      <p className="dkBrainAdvisorDisclaimer">ⓘ {copy.advisorDisclaimer}</p>
    </section>
  );
}

