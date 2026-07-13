export const BALL_ROLLER_GAME_ID = "ball-roller" as const;

export const BALL_RADIUS = 0.32;
export const GOAL_RADIUS = 0.55;
export const MAX_TILT = 0.42;
export const TILT_ACCEL = 18;
export const FRICTION = 0.988;
export const MAX_SPEED = 9;
export const START_LIVES = 3;

export type Vec2 = { x: number; z: number };

/** Wall as an axis-aligned box on the floor (center + size). */
export type Wall = {
  x: number;
  z: number;
  w: number;
  d: number;
};

export type LevelDef = {
  id: number;
  name: string;
  /** Floor half-extents from center (total size = 2 * half). */
  halfW: number;
  halfD: number;
  walls: Wall[];
  start: Vec2;
  goal: Vec2;
  timeLimit: number;
};

export type Phase = "ready" | "playing" | "won_level" | "won_game" | "lost";

export type BallRollerState = {
  levelIndex: number;
  ball: Vec2;
  vel: Vec2;
  tilt: Vec2;
  lives: number;
  score: number;
  timeLeft: number;
  phase: Phase;
};

export const LEVELS: LevelDef[] = [
  {
    id: 1,
    name: "First Roll",
    halfW: 6,
    halfD: 4,
    start: { x: -4.5, z: 0 },
    goal: { x: 4.5, z: 0 },
    timeLimit: 45,
    walls: [
      { x: 0, z: 1.6, w: 6, d: 0.35 },
      { x: 0, z: -1.6, w: 6, d: 0.35 },
    ],
  },
  {
    id: 2,
    name: "Corner Cut",
    halfW: 6,
    halfD: 5,
    start: { x: -4.5, z: -3.5 },
    goal: { x: 4.5, z: 3.5 },
    timeLimit: 50,
    walls: [
      { x: -1.5, z: -1.2, w: 0.4, d: 5 },
      { x: 1.5, z: 1.2, w: 0.4, d: 5 },
      { x: 0, z: 0, w: 2.2, d: 0.4 },
    ],
  },
  {
    id: 3,
    name: "Zigzag",
    halfW: 5.5,
    halfD: 5.5,
    start: { x: -4, z: -4 },
    goal: { x: 4, z: 4 },
    timeLimit: 55,
    walls: [
      { x: -1.5, z: -2.5, w: 6, d: 0.35 },
      { x: 1.5, z: 0, w: 6, d: 0.35 },
      { x: -1.5, z: 2.5, w: 6, d: 0.35 },
    ],
  },
  {
    id: 4,
    name: "Chambers",
    halfW: 6.5,
    halfD: 5.5,
    start: { x: -5, z: -4 },
    goal: { x: 5, z: 4 },
    timeLimit: 60,
    walls: [
      { x: -2.5, z: -1.5, w: 0.35, d: 5 },
      { x: 0, z: 1.5, w: 0.35, d: 5 },
      { x: 2.5, z: -1, w: 0.35, d: 4.5 },
      { x: -4, z: 1.5, w: 2.5, d: 0.35 },
      { x: 4, z: -1.5, w: 2.5, d: 0.35 },
    ],
  },
  {
    id: 5,
    name: "Labyrinth",
    halfW: 7,
    halfD: 6,
    start: { x: -5.5, z: -4.5 },
    goal: { x: 5.5, z: 4.5 },
    timeLimit: 75,
    walls: [
      { x: -3, z: -2, w: 0.35, d: 5.5 },
      { x: 0, z: 2, w: 0.35, d: 5.5 },
      { x: 3, z: -1.5, w: 0.35, d: 5 },
      { x: -1.5, z: -4, w: 4, d: 0.35 },
      { x: 1.5, z: 0, w: 4, d: 0.35 },
      { x: -1.5, z: 4, w: 4, d: 0.35 },
      { x: 4.5, z: -3, w: 2.5, d: 0.35 },
    ],
  },
];

export function currentLevel(
  state: Pick<BallRollerState, "levelIndex">,
): LevelDef {
  return LEVELS[state.levelIndex] ?? LEVELS[LEVELS.length - 1]!;
}

export function createInitialState(): BallRollerState {
  const level = LEVELS[0]!;
  return {
    levelIndex: 0,
    ball: { ...level.start },
    vel: { x: 0, z: 0 },
    tilt: { x: 0, z: 0 },
    lives: START_LIVES,
    score: 0,
    timeLeft: level.timeLimit,
    phase: "ready",
  };
}

export function resetLevel(state: BallRollerState): BallRollerState {
  const level = currentLevel(state);
  return {
    ...state,
    ball: { ...level.start },
    vel: { x: 0, z: 0 },
    tilt: { x: 0, z: 0 },
    timeLeft: level.timeLimit,
    phase: "playing",
  };
}

export function startOrResume(state: BallRollerState): BallRollerState {
  if (state.phase === "ready" || state.phase === "won_level") {
    return { ...state, phase: "playing" };
  }
  return state;
}

export function advanceLevel(state: BallRollerState): BallRollerState {
  const next = state.levelIndex + 1;
  if (next >= LEVELS.length) {
    return { ...state, phase: "won_game" };
  }
  const level = LEVELS[next]!;
  return {
    ...state,
    levelIndex: next,
    ball: { ...level.start },
    vel: { x: 0, z: 0 },
    tilt: { x: 0, z: 0 },
    timeLeft: level.timeLimit,
    phase: "playing",
  };
}

/** Score for clearing a level: base + leftover time. */
export function levelClearPoints(level: LevelDef, timeLeft: number): number {
  return 200 + level.id * 80 + Math.floor(timeLeft * 4);
}

export function clampTilt(v: number): number {
  return Math.max(-MAX_TILT, Math.min(MAX_TILT, v));
}

function resolveCircleAabb(
  px: number,
  pz: number,
  r: number,
  wall: Wall,
): Vec2 {
  const halfW = wall.w / 2;
  const halfD = wall.d / 2;
  const closestX = Math.max(wall.x - halfW, Math.min(px, wall.x + halfW));
  const closestZ = Math.max(wall.z - halfD, Math.min(pz, wall.z + halfD));
  const dx = px - closestX;
  const dz = pz - closestZ;
  const distSq = dx * dx + dz * dz;
  if (distSq >= r * r || distSq === 0) return { x: px, z: pz };

  const dist = Math.sqrt(distSq);
  const push = (r - dist) / dist;
  return { x: px + dx * push, z: pz + dz * push };
}

function collideWalls(pos: Vec2, level: LevelDef): Vec2 {
  let { x, z } = pos;
  for (const wall of level.walls) {
    const next = resolveCircleAabb(x, z, BALL_RADIUS, wall);
    x = next.x;
    z = next.z;
  }
  return { x, z };
}

function offPlatform(pos: Vec2, level: LevelDef): boolean {
  const margin = BALL_RADIUS * 0.35;
  return (
    Math.abs(pos.x) > level.halfW + margin ||
    Math.abs(pos.z) > level.halfD + margin
  );
}

function reachedGoal(pos: Vec2, vel: Vec2, level: LevelDef): boolean {
  const dx = pos.x - level.goal.x;
  const dz = pos.z - level.goal.z;
  const dist = Math.hypot(dx, dz);
  const speed = Math.hypot(vel.x, vel.z);
  return dist < GOAL_RADIUS * 0.85 && speed < 3.2;
}

export type TiltInput = { x: number; z: number };

/**
 * Advance simulation by `dt` seconds.
 * `tiltTarget` is desired platform tilt from player input (−1..1 mapped outside).
 */
export function step(
  state: BallRollerState,
  dt: number,
  tiltTarget: TiltInput,
): BallRollerState {
  if (state.phase !== "playing") return state;

  const level = currentLevel(state);
  const tiltLerp = 1 - Math.exp(-10 * dt);
  const tilt = {
    x: state.tilt.x + (clampTilt(tiltTarget.x) - state.tilt.x) * tiltLerp,
    z: state.tilt.z + (clampTilt(tiltTarget.z) - state.tilt.z) * tiltLerp,
  };

  let vel = {
    x: state.vel.x + tilt.x * TILT_ACCEL * dt,
    z: state.vel.z + tilt.z * TILT_ACCEL * dt,
  };
  vel.x *= FRICTION;
  vel.z *= FRICTION;
  const speed = Math.hypot(vel.x, vel.z);
  if (speed > MAX_SPEED) {
    const s = MAX_SPEED / speed;
    vel = { x: vel.x * s, z: vel.z * s };
  }

  let ball = {
    x: state.ball.x + vel.x * dt,
    z: state.ball.z + vel.z * dt,
  };
  const resolved = collideWalls(ball, level);
  if (resolved.x !== ball.x) vel.x *= -0.25;
  if (resolved.z !== ball.z) vel.z *= -0.25;
  ball = resolved;

  const timeLeft = Math.max(0, state.timeLeft - dt);

  if (offPlatform(ball, level) || timeLeft <= 0) {
    const lives = state.lives - 1;
    if (lives <= 0) {
      return {
        ...state,
        ball,
        vel: { x: 0, z: 0 },
        tilt,
        lives: 0,
        timeLeft,
        phase: "lost",
      };
    }
    return resetLevel({
      ...state,
      lives,
      tilt: { x: 0, z: 0 },
    });
  }

  if (reachedGoal(ball, vel, level)) {
    const gained = levelClearPoints(level, timeLeft);
    const score = state.score + gained;
    const isLast = state.levelIndex >= LEVELS.length - 1;
    return {
      ...state,
      ball,
      vel: { x: 0, z: 0 },
      tilt,
      score,
      timeLeft,
      phase: isLast ? "won_game" : "won_level",
    };
  }

  return { ...state, ball, vel, tilt, timeLeft };
}
