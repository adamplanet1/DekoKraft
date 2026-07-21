import VideoBackground from "../../../src/components/VideoBackground";
import AdminStudioHub from "../components/AdminStudioHub";

export default function StudioPage() {
  return (
    <main className="studioVideoPage dk-studio-page">
      <VideoBackground src="/videos/backgrounds/creator-bg.mp4" />
      <div className="admin-video-overlay dk-video-overlay" aria-hidden="true" />
      <div className="studioVideoPageContent dk-studio-content">
        <AdminStudioHub />
      </div>
    </main>
  );
}
