import VideoBackground from "../../src/components/VideoBackground";
import AdminShell from "./components/AdminShell";

export default function AdminPage() {
  return (
    <div className="admin-video-page dk-studio-page">
      <VideoBackground src="/videos/backgrounds/creator-bg.mp4" />
      <div className="admin-video-overlay dk-video-overlay" aria-hidden="true" />
      <div className="admin-video-content dk-studio-content">
        <AdminShell />
      </div>
    </div>
  );
}
