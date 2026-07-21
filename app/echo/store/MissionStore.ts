import type { Mission } from "../types/mission.ts";

function cloneMission(mission: Mission): Mission {
  return {
    ...mission,
    steps: mission.steps.map((step) => ({ ...step })),
  };
}

/** In-memory lifetime manager for Mission objects. */
export class MissionStore {
  private readonly missions = new Map<string, Mission>();

  add(mission: Mission): Mission {
    const storedMission = cloneMission(mission);
    this.missions.set(storedMission.id, storedMission);
    return cloneMission(storedMission);
  }

  remove(missionId: string): boolean {
    return this.missions.delete(missionId);
  }

  findById(missionId: string): Mission | null {
    const mission = this.missions.get(missionId);
    return mission ? cloneMission(mission) : null;
  }

  getAll(): Mission[] {
    return [...this.missions.values()].map(cloneMission);
  }

  update(mission: Mission): Mission | null {
    if (!this.missions.has(mission.id)) return null;
    const storedMission = cloneMission(mission);
    this.missions.set(storedMission.id, storedMission);
    return cloneMission(storedMission);
  }
}
