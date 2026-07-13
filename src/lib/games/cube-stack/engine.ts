export const CUBE_STACK_GAME_ID = "cube-stack" as const;

export const BASE_SIZE = 3.2;
export const SLAB_HEIGHT = 0.55;
export const START_SPEED = 3.2;
export const SPEED_GAIN = 0.12;

export type Slab = {
  x: number;
  z: number;
  w: number;
  d: number;
  y: number;
  color: string;
};

export type Phase = "ready" | "playing" | "lost";

export type CubeStackState = {
  stack: Slab[];
  moving: Slab;
  axis: "x" | "z";
  dir: 1 | -1;
  speed: number;
  score: number;
  phase: Phase;
};

const COLORS = [
  "#22d3ee",
  "#a78bfa",
  "#f472b6",
  "#fbbf24",
  "#34d399",
  "#fb7185",
  "#818cf8",
];

function colorFor(i: number): string {
  return COLORS[i % COLORS.length]!;
}

export function createInitialState(): CubeStackState {
  const base: Slab = {
    x: 0,
    z: 0,
    w: BASE_SIZE,
    d: BASE_SIZE,
    y: 0,
    color: colorFor(0),
  };
  return {
    stack: [base],
    moving: {
      x: -4.5,
      z: 0,
      w: BASE_SIZE,
      d: BASE_SIZE,
      y: SLAB_HEIGHT,
      color: colorFor(1),
    },
    axis: "x",
    dir: 1,
    speed: START_SPEED,
    score: 0,
    phase: "ready",
  };
}

export function start(state: CubeStackState): CubeStackState {
  return { ...createInitialState(), phase: "playing" };
}

export function tickMoving(state: CubeStackState, dt: number): CubeStackState {
  if (state.phase !== "playing") return state;
  const moving = { ...state.moving };
  const limit = 4.8;
  if (state.axis === "x") {
    moving.x += state.dir * state.speed * dt;
    if (moving.x > limit) {
      moving.x = limit;
      return { ...state, moving, dir: -1 };
    }
    if (moving.x < -limit) {
      moving.x = -limit;
      return { ...state, moving, dir: 1 };
    }
  } else {
    moving.z += state.dir * state.speed * dt;
    if (moving.z > limit) {
      moving.z = limit;
      return { ...state, moving, dir: -1 };
    }
    if (moving.z < -limit) {
      moving.z = -limit;
      return { ...state, moving, dir: 1 };
    }
  }
  return { ...state, moving };
}

export function drop(state: CubeStackState): CubeStackState {
  if (state.phase !== "playing") return state;
  const top = state.stack[state.stack.length - 1]!;
  const m = state.moving;

  let x = m.x;
  let z = m.z;
  let w = m.w;
  let d = m.d;

  if (state.axis === "x") {
    const left = Math.max(top.x - top.w / 2, m.x - m.w / 2);
    const right = Math.min(top.x + top.w / 2, m.x + m.w / 2);
    w = right - left;
    if (w <= 0.12) {
      return { ...state, phase: "lost" };
    }
    x = (left + right) / 2;
    z = top.z;
    d = top.d;
  } else {
    const near = Math.max(top.z - top.d / 2, m.z - m.d / 2);
    const far = Math.min(top.z + top.d / 2, m.z + m.d / 2);
    d = far - near;
    if (d <= 0.12) {
      return { ...state, phase: "lost" };
    }
    z = (near + far) / 2;
    x = top.x;
    w = top.w;
  }

  const placed: Slab = {
    x,
    z,
    w,
    d,
    y: m.y,
    color: m.color,
  };
  const stack = [...state.stack, placed];
  const score = state.score + 1;
  const nextAxis = state.axis === "x" ? "z" : "x";
  const y = m.y + SLAB_HEIGHT;
  const moving: Slab = {
    x: nextAxis === "x" ? -4.5 : x,
    z: nextAxis === "z" ? -4.5 : z,
    w,
    d,
    y,
    color: colorFor(score + 1),
  };

  return {
    ...state,
    stack,
    moving,
    axis: nextAxis,
    dir: 1,
    speed: START_SPEED + score * SPEED_GAIN,
    score,
  };
}
