"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import EchoImageStudio from "./components/EchoImageStudio";
import { WorkspaceProvider } from "./engine/WorkspaceContext";

export default function ImageStudioPage() {
  const router = useRouter();
  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <main className="creativeStudiosOverlay" dir="rtl">
      <section
        className={`creativeStudiosDialog${isMaximized ? " creativeStudiosDialog--echoImageMaximized" : ""}`}
        aria-label="معالجة الصور"
      >
        <WorkspaceProvider initialWorkspace="image">
          <EchoImageStudio
            isMaximized={isMaximized}
            onMaximize={() => setIsMaximized(true)}
            onRestore={() => setIsMaximized(false)}
            onBack={() => router.push("/echo")}
            onCloseStudio={() => router.push("/echo")}
          />
        </WorkspaceProvider>
      </section>
    </main>
  );
}
