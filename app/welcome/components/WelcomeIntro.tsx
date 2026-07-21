import { DkButton } from "../../components/ui";
import WelcomeParticles from "./WelcomeParticles";

type WelcomeIntroProps = {
  title: string;
  tagline: string;
  skipLabel: string;
  onComplete: () => void;
};

export default function WelcomeIntro({
  title,
  tagline,
  skipLabel,
  onComplete,
}: WelcomeIntroProps) {
  return (
    <div className="welcomeIntro" role="dialog" aria-modal="true" aria-labelledby="welcome-intro-title">
      <WelcomeParticles />
      <div className="welcomeIntroBook" onAnimationEnd={onComplete}>
        <strong className="welcomeIntroBrand">DekoKraft</strong>
        <h2 id="welcome-intro-title">{title}</h2>
        <p>{tagline}</p>
      </div>
      <DkButton
        className="welcomeIntroSkip"
        size="sm"
        variant="glass"
        onClick={onComplete}
      >
        {skipLabel}
      </DkButton>
    </div>
  );
}
