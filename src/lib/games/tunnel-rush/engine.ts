export const TUNNEL_RUSH_GAME_ID = "tunnel-rush" as const;

export const LANE_COUNT = 3;
export const LANE_X = [-2.2, 0, 2.2] as const;
export const PLAYER_Z = 4;
export const SPEED_START = 14;
export const SPEED_GAIN = 0.35;
export const SPAWN_EVERY = 0.85;

export type Obstacle = {
  id: number;
  lane: number;
  z: number;
};

export type Phase = "ready" | "playing" | "lost";

export type TunnelRushState = {
  lane: number;
  obstacles: Obstacle[];
  score: number;
  speed: number;
  sinceSpawn: number;
  nextId: number;
  phase: Phase;
  distance: number;
};

export function createInitialState(): TunnelRushState {
  return {
    lane: 1,
    obstacles: [],
    score: 0,
    speed: SPEED_START,
    sinceSpawn: 0,
    nextId: 1,
    phase: "ready",
    distance: 0,
  };
}

export function start(): TunnelRushState {
  return { ...createInitialState(), phase: "playing" };
}

export function moveLane(
  state: TunnelRushState,
  delta: -1 | 1,
): TunnelRushState {
  if (state.phase !== "playing" && state.phase !== "ready") return state;
  const lane = Math.max(0, Math.min(LANE_COUNT - 1, state.lane + delta));
  return { ...state, lane };
}

export function step(state: TunnelRushState, dt: number): TunnelRushState {
  if (state.phase !== "playing") return state;

  let {
    obstacles,
    score,
    speed,
    sinceSpawn,
    nextId,
    distance,
    lane,
  } = state;

  distance += speed * dt;
  score = Math.floor(distance / 8);
  speed = SPEED_START + score * SPEED_GAIN;
  sinceSpawn += dt;

  obstacles = obstacles
    .map((o) => ({ ...o, z: o.z + speed * dt }))
    .filter((o) => o.z < PLAYER_Z + 6);

  if (sinceSpawn >= Math.max(0.45, SPAWN_EVERY - score * 0.012)) {
    sinceSpawn = 0;
    // Prefer blocking current / adjacent lanes
    const lanePick = Math.floor(Math.random() * LANE_COUNT);
    obstacles.push({ id: nextId++, lane: lanePick, z: -28 });
    if (Math.random() < 0.35) {
      let other = Math.floor(Math.random() * LANE_COUNT);
      if (other === lanePick) other = (other + 1) % LANE_COUNT;
      obstacles.push({ id: nextId++, lane: other, z: -28 });
    }
  }

  for (const o of obstacles) {
    if (o.lane === lane && Math.abs(o.z - PLAYER_Z) < 1.1) {
      return {
        ...state,
        obstacles,
        score,
        speed,
        sinceSpawn,
        nextId,
        distance,
        phase: "lost",
      };
    }
  }

  return {
    ...state,
    obstacles,
    score,
    speed,
    sinceSpawn,
    nextId,
    distance,
  };
}
