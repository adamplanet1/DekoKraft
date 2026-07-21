export type MissionStep = {
  readonly id: string;
  readonly title: string;
  readonly completed: boolean;
};

export type MissionStatus = "draft" | "active" | "completed";

export type Mission = {
  readonly id: string;
  readonly title: string;
  readonly goal: string;
  readonly status: MissionStatus;
  readonly progress: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly steps: readonly MissionStep[];
};
