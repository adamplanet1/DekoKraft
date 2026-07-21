"use client";

import { useRef, useState } from "react";
import { EchoKernel, type Mission } from "../kernel/EchoKernel";

export default function EchoPage() {
  const [idea, setIdea] = useState("");
  const [missions, setMissions] = useState<Mission[]>(() => EchoKernel.getAllMissions());
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const ideaInputRef = useRef<HTMLTextAreaElement>(null);
  const continueStepRef = useRef<HTMLButtonElement>(null);
  const selectedMission = missions.find((mission) => mission.id === selectedMissionId) ?? missions[0] ?? null;
  const continueStepId = selectedMission?.steps.find((step) => !step.completed)?.id
    ?? selectedMission?.steps[0]?.id;
  const progressPercent = selectedMission
    ? Math.round((selectedMission.progress / selectedMission.steps.length) * 100)
    : 0;

  function refreshMissions() {
    setMissions(EchoKernel.getAllMissions());
  }

  function handleCreateMission() {
    const result = EchoKernel.createMission(idea);
    if (!result.ok) return;
    refreshMissions();
    setSelectedMissionId(result.mission.id);
    setIdea("");
    ideaInputRef.current?.focus();
  }

  function handleToggleStep(stepId: string) {
    if (!selectedMission) return;
    EchoKernel.updateMission(selectedMission.id, stepId);
    refreshMissions();
  }

  function handleDeleteMission() {
    if (!selectedMission) return;
    EchoKernel.deleteMission(selectedMission.id);
    const remainingMissions = EchoKernel.getAllMissions();
    setMissions(remainingMissions);
    setSelectedMissionId(remainingMissions[0]?.id ?? null);
  }

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "1100px",
        margin: "0 auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Echo Prototype</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))",
          gap: "24px",
          alignItems: "stretch",
          marginTop: "24px",
        }}
      >
        <section
          aria-labelledby="mission-list-title"
          style={{ padding: "24px", border: "1px solid #d1d5db", borderRadius: "12px", minWidth: 0 }}
        >
          <h2 id="mission-list-title">Mission List</h2>

          <textarea
            ref={ideaInputRef}
            aria-label="Idea"
            placeholder="Enter your idea..."
            value={idea}
            onChange={(event) => setIdea(event.target.value)}
            style={{ width: "100%", minHeight: "120px", padding: "12px", boxSizing: "border-box" }}
          />

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "12px" }}>
            <button
              type="button"
              onClick={handleCreateMission}
              disabled={!idea.trim()}
              style={{ padding: "10px 16px", cursor: idea.trim() ? "pointer" : "not-allowed" }}
            >
              Create Mission
            </button>
            <button
              type="button"
              onClick={handleDeleteMission}
              disabled={!selectedMission}
              style={{ padding: "10px 16px", cursor: selectedMission ? "pointer" : "not-allowed" }}
            >
              Delete Mission
            </button>
          </div>

          {missions.length > 0 ? (
            <ul style={{ display: "grid", gap: "10px", padding: 0, listStyle: "none" }}>
              {missions.map((mission) => (
                <li key={mission.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedMissionId(mission.id)}
                    aria-pressed={mission.id === selectedMission.id}
                    style={{
                      display: "grid",
                      gap: "6px",
                      width: "100%",
                      padding: "14px",
                      border: mission.id === selectedMission.id ? "2px solid #2563eb" : "1px solid #d1d5db",
                      borderRadius: "10px",
                      background: mission.id === selectedMission.id ? "#eff6ff" : "transparent",
                      textAlign: "start",
                      cursor: "pointer",
                    }}
                  >
                    <strong>{mission.title}</strong>
                    <span>Status: {mission.status}</span>
                    <span>Progress: {mission.progress}/{mission.steps.length}</span>
                    <span>Steps: {mission.steps.length}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No missions yet.<br />Create your first mission to begin.</p>
          )}
        </section>

        <section
          aria-labelledby={selectedMission ? "mission-title" : "mission-details-title"}
          style={{
            padding: "24px",
            border: "1px solid #d1d5db",
            borderRadius: "12px",
            minWidth: 0,
          }}
        >
          {selectedMission ? (
            <>
              <h2 id="mission-title">{selectedMission.title}</h2>
              <p><strong>Goal:</strong> {selectedMission.goal}</p>
              <p><strong>Current Status:</strong> {selectedMission.status}</p>
              <p><strong>Progress:</strong> {progressPercent}%</p>
              <p><strong>Completed Steps:</strong> {selectedMission.progress}</p>
              <p><strong>Total Steps:</strong> {selectedMission.steps.length}</p>
              <button
                type="button"
                onClick={() => continueStepRef.current?.focus()}
                style={{ padding: "10px 16px", cursor: "pointer" }}
              >
                Continue Mission
              </button>
              <ol style={{ display: "grid", gap: "8px", paddingInlineStart: "24px" }}>
                {selectedMission.steps.map((step) => (
                  <li key={step.id}>
                    <button
                      ref={step.id === continueStepId ? continueStepRef : undefined}
                      type="button"
                      onClick={() => handleToggleStep(step.id)}
                      aria-pressed={step.completed}
                    >
                      {step.completed ? "✓ " : ""}{step.title}
                    </button>
                  </li>
                ))}
              </ol>
            </>
          ) : (
            <>
              <h2 id="mission-details-title">Mission Details</h2>
              <p>No missions yet.<br />Create your first mission to begin.</p>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
