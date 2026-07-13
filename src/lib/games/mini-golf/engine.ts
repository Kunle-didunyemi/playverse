export const MINI_GOLF_GAME_ID = "minigolf" as const;

export const BALL_RADIUS = 0.18;
export const HOLE_RADIUS = 0.28;
export const FRICTION = 0.982;
export const MAX_SPEED = 14;
export const STOP_SPEED = 0.12;
export const MAX_POWER = 11;
export const MAX_STROKES_PER_HOLE = 8;

export type Vec2 = { x: number; z: number };

export type Wall = {
  x: number;
  z: number;
  w: number;
  d: number;
};

export type HoleDef = {
  id: number;
  name: string;
  par: number;
  halfW: number;
  halfD: number;
  walls: Wall[];
  tee: Vec2;
  cup: Vec2;
};

export type Phase =
  | "ready"
  | "aiming"
  | "rolling"
  | "hole_done"
  | "course_done"
  | "hole_fail";

export type MiniGolfState = {
  holeIndex: number;
  ball: Vec2;
  vel: Vec2;
  aimAngle: number;
  power: number;
  charging: boolean;
  strokes: number;
  totalStrokes: number;
  score: number;
  phase: Phase;
};

export const HOLES: HoleDef[] = [
  {
    id: 1,
    name: "Opening Drive",
    par: 2,
    halfW: 5,
    halfD: 3.2,
    tee: { x: -3.8, z: 0 },
    cup: { x: 3.8, z: 0 },
    walls: [],
  },
  {
    id: 2,
    name: "Dogleg",
    par: 3,
    halfW: 5.5,
    halfD: 4.5,
    tee: { x: -4.2, z: -3 },
    cup: { x: 4.2, z: 3 },
    walls: [
      { x: -0.5, z: -0.8, w: 0.35, d: 5.2 },
      { x: 1.8, z: 1.5, w: 3.5, d: 0.35 },
    ],
  },
  {
    id: 3,
    name: "S-Curve",
    par: 3,
    halfW: 5,
    halfD: 5,
    tee: { x: -3.6, z: -3.6 },
    cup: { x: 3.6, z: 3.6 },
    walls: [
      { x: -1.2, z: -1.8, w: 5.5, d: 0.35 },
      { x: 1.2, z: 0.4, w: 5.5, d: 0.35 },
      { x: -1.2, z: 2.6, w: 5.5, d: 0.35 },
    ],
  },
  {
    id: 4,
    name: "Bunkers",
    par: 4,
    halfW: 6,
    halfD: 5,
    tee: { x: -4.8, z: -3.5 },
    cup: { x: 4.8, z: 3.5 },
    walls: [
      { x: -2, z: -1, w: 0.4, d: 4.5 },
      { x: 0.5, z: 1.2, w: 0.4, d: 4.8 },
      { x: 3, z: -0.5, w: 0.4, d: 4 },
      { x: -3.5, z: 2, w: 2.8, d: 0.35 },
      { x: 2.2, z: -2.5, w: 2.5, d: 0.35 },
    ],
  },
  {
    id: 5,
    name: "Switchbacks",
    par: 4,
    halfW: 6.5,
    halfD: 5.5,
    tee: { x: -5.2, z: -4 },
    cup: { x: 5.2, z: 4 },
    walls: [
      { x: -2.5, z: -1.5, w: 0.35, d: 5.5 },
      { x: 0, z: 1.8, w: 0.35, d: 5.5 },
      { x: 2.8, z: -1, w: 0.35, d: 5 },
      { x: -4, z: 1.5, w: 2.8, d: 0.35 },
      { x: 1.5, z: -3.2, w: 3.5, d: 0.35 },
      { x: 4, z: 2.2, w: 2.5, d: 0.35 },
    ],
  },
  {
    id: 6,
    name: "Narrow Gate",
    par: 3,
    halfW: 6,
    halfD: 4.2,
    tee: { x: -4.8, z: 0 },
    cup: { x: 4.8, z: 0 },
    walls: [
      { x: -1.5, z: 1.6, w: 0.35, d: 2.4 },
      { x: -1.5, z: -1.6, w: 0.35, d: 2.4 },
      { x: 1.2, z: 1.8, w: 0.35, d: 2.2 },
      { x: 1.2, z: -1.8, w: 0.35, d: 2.2 },
      { x: 0, z: 0, w: 2.2, d: 0.35 },
    ],
  },
  {
    id: 7,
    name: "Spiral",
    par: 4,
    halfW: 6.5,
    halfD: 6,
    tee: { x: -5, z: -4.5 },
    cup: { x: 0.4, z: 0.2 },
    walls: [
      { x: -2.8, z: -2.2, w: 5.5, d: 0.35 },
      { x: 2.2, z: -0.4, w: 0.35, d: 5.2 },
      { x: -0.2, z: 2.4, w: 5.8, d: 0.35 },
      { x: -2.6, z: 0.6, w: 0.35, d: 3.6 },
      { x: 0.8, z: -2.8, w: 2.8, d: 0.35 },
    ],
  },
  {
    id: 8,
    name: "Crossroads",
    par: 4,
    halfW: 7,
    halfD: 5.5,
    tee: { x: -5.6, z: -4 },
    cup: { x: 5.6, z: 4 },
    walls: [
      { x: -2, z: 0, w: 0.35, d: 6 },
      { x: 2, z: 0, w: 0.35, d: 6 },
      { x: 0, z: -2.2, w: 3.2, d: 0.35 },
      { x: 0, z: 2.2, w: 3.2, d: 0.35 },
      { x: -4.2, z: 1.5, w: 2.4, d: 0.35 },
      { x: 4.2, z: -1.5, w: 2.4, d: 0.35 },
    ],
  },
  {
    id: 9,
    name: "Gauntlet",
    par: 5,
    halfW: 7,
    halfD: 6,
    tee: { x: -5.8, z: -4.8 },
    cup: { x: 5.8, z: 4.8 },
    walls: [
      { x: -3.5, z: -2.5, w: 0.35, d: 4.5 },
      { x: -1.2, z: 0.5, w: 0.35, d: 6 },
      { x: 1.5, z: -0.8, w: 0.35, d: 6 },
      { x: 4, z: 1.5, w: 0.35, d: 5 },
      { x: -4.5, z: 1.2, w: 2.2, d: 0.35 },
      { x: -0.2, z: -3.5, w: 3.5, d: 0.35 },
      { x: 2.8, z: 3.2, w: 3.2, d: 0.35 },
      { x: 0.2, z: 1.8, w: 2.4, d: 0.35 },
    ],
  },
  {
    id: 10,
    name: "Final Green",
    par: 5,
    halfW: 7.5,
    halfD: 6.5,
    tee: { x: -6.2, z: -5.2 },
    cup: { x: 6.2, z: 5.2 },
    walls: [
      { x: -4, z: -2, w: 0.35, d: 6.5 },
      { x: -1.2, z: 2, w: 0.35, d: 6.5 },
      { x: 1.8, z: -1.5, w: 0.35, d: 6.5 },
      { x: 4.5, z: 1.8, w: 0.35, d: 6 },
      { x: -5.2, z: 2.5, w: 2.6, d: 0.35 },
      { x: -2.6, z: -4.2, w: 3.2, d: 0.35 },
      { x: 0.4, z: 0.2, w: 2.8, d: 0.35 },
      { x: 3.2, z: -3.5, w: 3, d: 0.35 },
      { x: 5.5, z: 3.2, w: 2.4, d: 0.35 },
      { x: 0.3, z: 4.5, w: 4, d: 0.35 },
    ],
  },
];

export function currentHole(state: Pick<MiniGolfState, "holeIndex">): HoleDef {
  return HOLES[state.holeIndex] ?? HOLES[HOLES.length - 1]!;
}

export function createInitialState(): MiniGolfState {
  const hole = HOLES[0]!;
  return {
    holeIndex: 0,
    ball: { ...hole.tee },
    vel: { x: 0, z: 0 },
    aimAngle: 0,
    power: 0,
    charging: false,
    strokes: 0,
    totalStrokes: 0,
    score: 0,
    phase: "ready",
  };
}

export function beginHole(state: MiniGolfState): MiniGolfState {
  const hole = currentHole(state);
  return {
    ...state,
    ball: { ...hole.tee },
    vel: { x: 0, z: 0 },
    aimAngle: Math.atan2(hole.cup.z - hole.tee.z, hole.cup.x - hole.tee.x),
    power: 0,
    charging: false,
    strokes: 0,
    phase: "aiming",
  };
}

export function startCourse(state: MiniGolfState): MiniGolfState {
  return beginHole({ ...state, phase: "ready" });
}

/** Higher is better for leaderboard. */
export function holePoints(par: number, strokes: number): number {
  if (strokes <= 0) return 0;
  const relative = par - strokes;
  let pts = 120 + relative * 60;
  if (strokes === 1) pts += 180;
  return Math.max(25, pts);
}

export function advanceHole(state: MiniGolfState): MiniGolfState {
  const next = state.holeIndex + 1;
  if (next >= HOLES.length) {
    return { ...state, phase: "course_done" };
  }
  return beginHole({ ...state, holeIndex: next });
}

function resolveCircleAabb(
  px: number,
  pz: number,
  r: number,
  wall: Wall,
): { pos: Vec2; hitX: boolean; hitZ: boolean } {
  const halfW = wall.w / 2;
  const halfD = wall.d / 2;
  const closestX = Math.max(wall.x - halfW, Math.min(px, wall.x + halfW));
  const closestZ = Math.max(wall.z - halfD, Math.min(pz, wall.z + halfD));
  const dx = px - closestX;
  const dz = pz - closestZ;
  const distSq = dx * dx + dz * dz;
  if (distSq >= r * r || distSq === 0) {
    return { pos: { x: px, z: pz }, hitX: false, hitZ: false };
  }
  const dist = Math.sqrt(distSq);
  const push = (r - dist) / dist;
  const nx = dx * push;
  const nz = dz * push;
  return {
    pos: { x: px + nx, z: pz + nz },
    hitX: Math.abs(nx) >= Math.abs(nz),
    hitZ: Math.abs(nz) > Math.abs(nx),
  };
}

function collideWalls(
  pos: Vec2,
  vel: Vec2,
  hole: HoleDef,
): { pos: Vec2; vel: Vec2 } {
  let { x, z } = pos;
  let vx = vel.x;
  let vz = vel.z;
  for (const wall of hole.walls) {
    const { pos: next, hitX, hitZ } = resolveCircleAabb(x, z, BALL_RADIUS, wall);
    if (hitX) vx *= -0.55;
    if (hitZ) vz *= -0.55;
    x = next.x;
    z = next.z;
  }
  // Soft border bounce so the ball stays on the green
  const margin = BALL_RADIUS + 0.05;
  if (x < -hole.halfW + margin) {
    x = -hole.halfW + margin;
    vx = Math.abs(vx) * 0.55;
  } else if (x > hole.halfW - margin) {
    x = hole.halfW - margin;
    vx = -Math.abs(vx) * 0.55;
  }
  if (z < -hole.halfD + margin) {
    z = -hole.halfD + margin;
    vz = Math.abs(vz) * 0.55;
  } else if (z > hole.halfD - margin) {
    z = hole.halfD - margin;
    vz = -Math.abs(vz) * 0.55;
  }
  return { pos: { x, z }, vel: { x: vx, z: vz } };
}

function inCup(pos: Vec2, vel: Vec2, hole: HoleDef): boolean {
  const dist = Math.hypot(pos.x - hole.cup.x, pos.z - hole.cup.z);
  const speed = Math.hypot(vel.x, vel.z);
  // Fast balls skip over; slow ones drop in when over the cup.
  if (dist < HOLE_RADIUS * 0.95 && speed < 4.5) return true;
  if (dist < HOLE_RADIUS * 0.55 && speed < 7) return true;
  return false;
}

export function rotateAim(state: MiniGolfState, delta: number): MiniGolfState {
  if (state.phase !== "aiming") return state;
  return { ...state, aimAngle: state.aimAngle + delta };
}

export function setAimAngle(state: MiniGolfState, angle: number): MiniGolfState {
  if (state.phase !== "aiming") return state;
  return { ...state, aimAngle: angle };
}

export function beginCharge(state: MiniGolfState): MiniGolfState {
  if (state.phase !== "aiming") return state;
  return { ...state, charging: true, power: 0.15 };
}

export function updateCharge(state: MiniGolfState, dt: number): MiniGolfState {
  if (!state.charging || state.phase !== "aiming") return state;
  const power = Math.min(MAX_POWER, state.power + dt * 7);
  return { ...state, power };
}

export function releasePutt(state: MiniGolfState): MiniGolfState {
  if (state.phase !== "aiming" || state.power < 0.12) {
    return { ...state, charging: false, power: 0 };
  }
  const speed = state.power;
  return {
    ...state,
    charging: false,
    power: 0,
    strokes: state.strokes + 1,
    totalStrokes: state.totalStrokes + 1,
    vel: {
      x: Math.cos(state.aimAngle) * speed,
      z: Math.sin(state.aimAngle) * speed,
    },
    phase: "rolling",
  };
}

export function stepRolling(state: MiniGolfState, dt: number): MiniGolfState {
  if (state.phase !== "rolling") return state;

  const hole = currentHole(state);
  let vel = {
    x: state.vel.x * Math.pow(FRICTION, dt * 60),
    z: state.vel.z * Math.pow(FRICTION, dt * 60),
  };
  const speed = Math.hypot(vel.x, vel.z);
  if (speed > MAX_SPEED) {
    const s = MAX_SPEED / speed;
    vel = { x: vel.x * s, z: vel.z * s };
  }

  let ball = {
    x: state.ball.x + vel.x * dt,
    z: state.ball.z + vel.z * dt,
  };

  const collided = collideWalls(ball, vel, hole);
  ball = collided.pos;
  vel = collided.vel;

  if (inCup(ball, vel, hole)) {
    const gained = holePoints(hole.par, state.strokes);
    return {
      ...state,
      ball: { ...hole.cup },
      vel: { x: 0, z: 0 },
      score: state.score + gained,
      phase: state.holeIndex >= HOLES.length - 1 ? "course_done" : "hole_done",
    };
  }

  if (Math.hypot(vel.x, vel.z) < STOP_SPEED) {
    if (state.strokes >= MAX_STROKES_PER_HOLE) {
      return {
        ...state,
        ball,
        vel: { x: 0, z: 0 },
        phase: "hole_fail",
      };
    }
    return {
      ...state,
      ball,
      vel: { x: 0, z: 0 },
      power: 0,
      charging: false,
      phase: "aiming",
    };
  }

  return { ...state, ball, vel };
}

export function retryHole(state: MiniGolfState): MiniGolfState {
  return beginHole(state);
}

export function skipFailedHole(state: MiniGolfState): MiniGolfState {
  // Small consolation points so a failed hole doesn't wipe the run
  const hole = currentHole(state);
  const score = state.score + 15;
  if (state.holeIndex >= HOLES.length - 1) {
    return { ...state, score, phase: "course_done" };
  }
  return beginHole({ ...state, score, holeIndex: state.holeIndex + 1 });
}
