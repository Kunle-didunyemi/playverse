export const TARGET_GALLERY_GAME_ID = "target-gallery" as const;

export const ROUND_SECONDS = 45;
export const MAX_TARGETS = 6;

export type Target = {
  id: number;
  x: number;
  y: number;
  z: number;
  r: number;
  color: string;
  points: number;
  born: number;
};

export type Phase = "ready" | "playing" | "won";

export type TargetGalleryState = {
  targets: Target[];
  score: number;
  hits: number;
  shots: number;
  timeLeft: number;
  nextId: number;
  sinceSpawn: number;
  phase: Phase;
};

const COLORS = ["#f472b6", "#22d3ee", "#a78bfa", "#fbbf24", "#34d399"];

function randomTarget(id: number, now: number): Target {
  const r = 0.35 + Math.random() * 0.35;
  return {
    id,
    x: (Math.random() - 0.5) * 7,
    y: 0.6 + Math.random() * 3.2,
    z: -4 - Math.random() * 8,
    r,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    points: Math.round(40 + (1.1 - r) * 80),
    born: now,
  };
}

export function createInitialState(): TargetGalleryState {
  return {
    targets: [],
    score: 0,
    hits: 0,
    shots: 0,
    timeLeft: ROUND_SECONDS,
    nextId: 1,
    sinceSpawn: 0,
    phase: "ready",
  };
}

export function start(): TargetGalleryState {
  const base = createInitialState();
  const targets = [
    randomTarget(1, 0),
    randomTarget(2, 0),
    randomTarget(3, 0),
  ];
  return {
    ...base,
    phase: "playing",
    targets,
    nextId: 4,
  };
}

export function step(state: TargetGalleryState, dt: number): TargetGalleryState {
  if (state.phase !== "playing") return state;

  let { timeLeft, targets, sinceSpawn, nextId } = state;
  timeLeft = Math.max(0, timeLeft - dt);
  sinceSpawn += dt;

  // bob targets slightly via born time handled in scene; expire old ones
  const now = ROUND_SECONDS - timeLeft;
  targets = targets.filter((t) => now - t.born < 7);

  if (targets.length < MAX_TARGETS && sinceSpawn > 0.7) {
    sinceSpawn = 0;
    targets = [...targets, randomTarget(nextId++, now)];
  }

  if (timeLeft <= 0) {
    return {
      ...state,
      timeLeft: 0,
      targets,
      sinceSpawn,
      nextId,
      phase: "won",
      score: state.score + state.hits * 5,
    };
  }

  return { ...state, timeLeft, targets, sinceSpawn, nextId };
}

export function shoot(
  state: TargetGalleryState,
  targetId: number | null,
): TargetGalleryState {
  if (state.phase !== "playing") return state;
  const shots = state.shots + 1;
  if (targetId === null) {
    return { ...state, shots };
  }
  const hit = state.targets.find((t) => t.id === targetId);
  if (!hit) return { ...state, shots };
  return {
    ...state,
    shots,
    hits: state.hits + 1,
    score: state.score + hit.points,
    targets: state.targets.filter((t) => t.id !== targetId),
  };
}
