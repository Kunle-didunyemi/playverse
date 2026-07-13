export const SKY_DASH_GAME_ID = "sky-dash" as const;

export const W = 360;
export const H = 520;
export const BIRD_X = 90;
export const BIRD_R = 14;
export const GRAVITY = 1650;
export const FLAP = -420;
export const PIPE_W = 58;
export const PIPE_GAP = 148;
export const PIPE_SPEED = 160;
export const PIPE_EVERY = 1.55;

export type Pipe = {
  x: number;
  gapY: number;
  scored: boolean;
};

export type SkyPhase = "ready" | "playing" | "lost";

export type SkyDashState = {
  y: number;
  vy: number;
  pipes: Pipe[];
  score: number;
  phase: SkyPhase;
  elapsed: number;
  sincePipe: number;
};

export function createInitialState(): SkyDashState {
  return {
    y: H / 2,
    vy: 0,
    pipes: [],
    score: 0,
    phase: "ready",
    elapsed: 0,
    sincePipe: 0,
  };
}

export function start(state: SkyDashState): SkyDashState {
  return {
    ...createInitialState(),
    phase: "playing",
    y: H / 2,
    vy: FLAP * 0.55,
  };
}

export function flap(state: SkyDashState): SkyDashState {
  if (state.phase === "ready") return start(state);
  if (state.phase !== "playing") return state;
  return { ...state, vy: FLAP };
}

function spawnPipe(x: number): Pipe {
  const margin = 70;
  const gapY = margin + Math.random() * (H - PIPE_GAP - margin * 2);
  return { x, gapY, scored: false };
}

export function step(state: SkyDashState, dt: number): SkyDashState {
  if (state.phase !== "playing") return state;

  let { y, vy, pipes, score, elapsed, sincePipe } = state;
  elapsed += dt;
  sincePipe += dt;
  vy += GRAVITY * dt;
  y += vy * dt;

  const speed = PIPE_SPEED + Math.min(80, score * 3);
  pipes = pipes
    .map((p) => ({ ...p, x: p.x - speed * dt }))
    .filter((p) => p.x > -PIPE_W - 10);

  if (sincePipe >= PIPE_EVERY) {
    sincePipe = 0;
    pipes.push(spawnPipe(W + 20));
  }

  // score when passing pipe
  pipes = pipes.map((p) => {
    if (!p.scored && p.x + PIPE_W < BIRD_X - BIRD_R) {
      score += 1;
      return { ...p, scored: true };
    }
    return p;
  });

  // collisions
  if (y - BIRD_R < 0 || y + BIRD_R > H) {
    return { ...state, y, vy: 0, pipes, score, elapsed, sincePipe, phase: "lost" };
  }

  for (const p of pipes) {
    const inX =
      BIRD_X + BIRD_R > p.x && BIRD_X - BIRD_R < p.x + PIPE_W;
    if (!inX) continue;
    const top = p.gapY;
    const bottom = p.gapY + PIPE_GAP;
    if (y - BIRD_R < top || y + BIRD_R > bottom) {
      return {
        ...state,
        y,
        vy: 0,
        pipes,
        score,
        elapsed,
        sincePipe,
        phase: "lost",
      };
    }
  }

  return { ...state, y, vy, pipes, score, elapsed, sincePipe };
}
