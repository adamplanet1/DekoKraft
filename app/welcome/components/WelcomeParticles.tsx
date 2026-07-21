import type { CSSProperties } from "react";

type ParticleStyle = CSSProperties & {
  "--particle-x": string;
  "--particle-y": string;
  "--particle-dx": string;
  "--particle-dy": string;
  "--particle-size": string;
  "--particle-delay": string;
  "--particle-color": string;
};

const PARTICLE_COLORS = ["#ffffff", "#f7dda0", "#b9dcff"] as const;

const PARTICLES = Array.from({ length: 30 }, (_, index) => {
  const edge = index % 4;
  const spread = 7 + ((index * 17) % 86);
  const x = edge === 1 ? 96 : edge === 3 ? 4 : spread;
  const y = edge === 0 ? 5 : edge === 2 ? 95 : spread;
  const dx = edge === 1 ? 50 + (index % 5) * 9 : edge === 3 ? -50 - (index % 5) * 9 : (index % 2 ? 1 : -1) * (22 + (index % 6) * 8);
  const dy = edge === 0 ? -48 - (index % 5) * 10 : edge === 2 ? 48 + (index % 5) * 10 : (index % 2 ? 1 : -1) * (20 + (index % 6) * 7);

  return {
    x,
    y,
    dx,
    dy,
    size: 3 + (index % 5),
    delay: (index % 8) * 0.045,
    color: PARTICLE_COLORS[index % PARTICLE_COLORS.length],
  };
});

export default function WelcomeParticles() {
  return (
    <div className="welcomeParticles" aria-hidden="true">
      {PARTICLES.map((particle, index) => {
        const style: ParticleStyle = {
          "--particle-x": `${particle.x}%`,
          "--particle-y": `${particle.y}%`,
          "--particle-dx": `${particle.dx}px`,
          "--particle-dy": `${particle.dy}px`,
          "--particle-size": `${particle.size}px`,
          "--particle-delay": `${particle.delay}s`,
          "--particle-color": particle.color,
        };

        return <span key={index} className="welcomeParticle" style={style} />;
      })}
    </div>
  );
}
