"use client";

import { useState } from "react";

type Mission = {
  id: number;
  title: string;
  createdAt: string;
};

export default function EchoPage() {
  const [idea, setIdea] = useState("");
  const [missions, setMissions] = useState<Mission[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(
    null,
  );

  const selectedMission =
    missions.find((mission) => mission.id === selectedMissionId) ?? null;

  function createMission() {
    const cleanIdea = idea.trim();

    if (!cleanIdea) {
      return;
    }

    const newMission: Mission = {
      id: Date.now(),
      title: cleanIdea,
      createdAt: new Date().toLocaleString("ar"),
    };

    setMissions((currentMissions) => [
      newMission,
      ...currentMissions,
    ]);

    setSelectedMissionId(newMission.id);
    setIdea("");
  }

  function deleteMission() {
    if (selectedMissionId === null) {
      return;
    }

    setMissions((currentMissions) =>
      currentMissions.filter(
        (mission) => mission.id !== selectedMissionId,
      ),
    );

    setSelectedMissionId(null);
  }

  return (
    <main
      dir="rtl"
      style={{
        minHeight: "100vh",
        padding: "48px 20px",
        background:
          "linear-gradient(145deg, #f7f5ff 0%, #eef7f7 50%, #f7f1fb 100%)",
        color: "#172033",
      }}
    >
      <section
        style={{
          width: "min(1100px, 100%)",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            marginBottom: "30px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              color: "#6954c6",
              fontWeight: 700,
            }}
          >
            DekoKraft Smart Studios
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "clamp(32px, 5vw, 54px)",
            }}
          >
            Echo Prototype
          </h1>

          <p
            style={{
              margin: "12px auto 0",
              maxWidth: "680px",
              lineHeight: 1.8,
              color: "#586174",
            }}
          >
            حوّل فكرتك إلى مهمة عملية، ثم تابع تفاصيلها وتنفيذها.
          </p>
        </header>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "20px",
          }}
        >
          <section
            style={{
              padding: "24px",
              borderRadius: "24px",
              border: "1px solid rgba(105, 84, 198, 0.18)",
              background: "rgba(255, 255, 255, 0.72)",
              boxShadow: "0 18px 50px rgba(51, 43, 91, 0.08)",
              backdropFilter: "blur(18px)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>قائمة المهام</h2>

            <textarea
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              placeholder="اكتب فكرتك هنا..."
              rows={5}
              style={{
                width: "100%",
                boxSizing: "border-box",
                resize: "vertical",
                padding: "14px",
                borderRadius: "16px",
                border: "1px solid #d8d5e8",
                background: "rgba(255,255,255,0.85)",
                font: "inherit",
                lineHeight: 1.7,
              }}
            />

            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "14px",
              }}
            >
              <button
                type="button"
                onClick={createMission}
                disabled={!idea.trim()}
                style={{
                  flex: 1,
                  padding: "12px",
                  border: 0,
                  borderRadius: "14px",
                  background: "#5946c6",
                  color: "#fff",
                  cursor: idea.trim() ? "pointer" : "not-allowed",
                  opacity: idea.trim() ? 1 : 0.5,
                  font: "inherit",
                  fontWeight: 700,
                }}
              >
                إنشاء مهمة
              </button>

              <button
                type="button"
                onClick={deleteMission}
                disabled={selectedMissionId === null}
                style={{
                  padding: "12px 18px",
                  borderRadius: "14px",
                  border: "1px solid #dccfd8",
                  background: "#fff",
                  cursor:
                    selectedMissionId !== null
                      ? "pointer"
                      : "not-allowed",
                  opacity: selectedMissionId !== null ? 1 : 0.5,
                  font: "inherit",
                }}
              >
                حذف
              </button>
            </div>

            <div style={{ marginTop: "22px" }}>
              {missions.length === 0 ? (
                <p
                  style={{
                    padding: "18px",
                    borderRadius: "14px",
                    background: "rgba(245,243,250,0.9)",
                    color: "#687083",
                    lineHeight: 1.7,
                  }}
                >
                  لا توجد مهام حتى الآن.
                  <br />
                  أنشئ أول مهمة للبدء.
                </p>
              ) : (
                missions.map((mission) => (
                  <button
                    type="button"
                    key={mission.id}
                    onClick={() =>
                      setSelectedMissionId(mission.id)
                    }
                    style={{
                      width: "100%",
                      marginBottom: "10px",
                      padding: "14px",
                      textAlign: "right",
                      borderRadius: "14px",
                      border:
                        selectedMissionId === mission.id
                          ? "2px solid #6954c6"
                          : "1px solid #ddd9e8",
                      background:
                        selectedMissionId === mission.id
                          ? "#f0edff"
                          : "#fff",
                      cursor: "pointer",
                      font: "inherit",
                    }}
                  >
                    {mission.title}
                  </button>
                ))
              )}
            </div>
          </section>

          <section
            style={{
              padding: "24px",
              borderRadius: "24px",
              border: "1px solid rgba(105, 84, 198, 0.18)",
              background: "rgba(255, 255, 255, 0.72)",
              boxShadow: "0 18px 50px rgba(51, 43, 91, 0.08)",
              backdropFilter: "blur(18px)",
            }}
          >
            <h2 style={{ marginTop: 0 }}>تفاصيل المهمة</h2>

            {selectedMission ? (
              <div
                style={{
                  padding: "20px",
                  borderRadius: "16px",
                  background: "rgba(245,243,250,0.9)",
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                  {selectedMission.title}
                </h3>

                <p style={{ color: "#687083" }}>
                  تاريخ الإنشاء: {selectedMission.createdAt}
                </p>

                <p style={{ lineHeight: 1.8 }}>
                  تم إنشاء المهمة بنجاح. ستكون الخطوة التالية
                  تقسيمها إلى خطة قابلة للتنفيذ.
                </p>
              </div>
            ) : (
              <p
                style={{
                  padding: "20px",
                  borderRadius: "16px",
                  background: "rgba(245,243,250,0.9)",
                  color: "#687083",
                  lineHeight: 1.8,
                }}
              >
                لم يتم اختيار مهمة.
                <br />
                أنشئ مهمة جديدة أو اختر واحدة من القائمة.
              </p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}