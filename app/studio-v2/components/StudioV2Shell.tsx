"use client";

import { useState } from "react";
import { useLanguage } from "../../components/LanguageProvider";
import StudioV2ActivityBar from "./StudioV2ActivityBar";
import StudioV2Header from "./StudioV2Header";
import StudioV2ImageSettings from "./StudioV2ImageSettings";
import StudioV23DSettings from "./StudioV23DSettings";
import StudioV2VideoSettings from "./StudioV2VideoSettings";
import StudioV2Workspace from "./StudioV2Workspace";
import type { StudioV2ActivityId } from "./studioV2Activities";

export default function StudioV2Shell() {
  const { direction } = useLanguage();
  const [activeActivity, setActiveActivity] = useState<StudioV2ActivityId>("welcome");
  const [smartEditOpen, setSmartEditOpen] = useState(false);
  const settingsPanel = activeActivity === "image"
    ? <StudioV2ImageSettings />
    : activeActivity === "video"
      ? <StudioV2VideoSettings />
      : activeActivity === "threeD"
        ? <StudioV23DSettings />
        : null;
  const showSettings = Boolean(settingsPanel);

  return (
    <div className="studioV2Page" dir={direction}>
      <div className="studioV2Container">
        <StudioV2Header />
        <StudioV2ActivityBar activeActivity={activeActivity} onActivityChange={setActiveActivity} />
        <div className="studioV2Content" data-settings-visible={showSettings}>
          <main className="studioV2Main">
            <StudioV2Workspace
              activeActivity={activeActivity}
              smartEditOpen={smartEditOpen}
              onSmartEditToggle={() => setSmartEditOpen((open) => !open)}
            />
          </main>
          {settingsPanel && (
            <aside className="studioV2SettingsArea">
              {settingsPanel}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
