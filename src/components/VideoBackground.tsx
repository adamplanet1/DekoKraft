"use client";

type VideoBackgroundProps = {
  src: string;
};

export default function VideoBackground({ src }: VideoBackgroundProps) {
  return (
    <video
      className="admin-background-video dk-video-background"
      aria-hidden="true"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      onError={(event) => {
        console.error(
          "DekoKraft background video failed",
          event.currentTarget.error,
        );
      }}
      onLoadedData={() => {
        console.log("DekoKraft background video loaded");
      }}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
