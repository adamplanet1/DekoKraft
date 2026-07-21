"use client";

export type StudioTab = {
  id: string;
  label: string;
};

type StudioTabsProps = {
  tabs: StudioTab[];
  activeTab: string;
  onChange: (tabId: string) => void;
  ariaLabel: string;
};

export default function StudioTabs({ tabs, activeTab, onChange, ariaLabel }: StudioTabsProps) {
  return (
    <div className="smartStudioTabsScroller">
      <div className="smartStudioTabs" role="tablist" aria-label={ariaLabel}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className="smartStudioTab"
            role="tab"
            aria-selected={activeTab === tab.id}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
