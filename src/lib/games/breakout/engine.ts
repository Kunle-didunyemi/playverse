export const BREAKOUT_GAME_ID = "breakout" as const;

export const W = 400;
export const H = 520;
export const PADDLE_W = 78;
export const PADDLE_H = 12;
export const BALL_R = 7;
export const BRICK_ROWS = 5;
export const BRICK_COLS = 8;
export const BRICK_H = 16;
export const BRICK_GAP = 4;
export const BRICK_TOP = 56;

export type Brick = {
  x: number;
  y: number;
  w: number;
  h: number;
  alive: boolean;
  color: string;
  points: number;
};

export type BreakoutPhase = "ready" | "playing" | "won" | "lost";

export type BreakoutState = {
  paddleX: number;
  ballX: number;
  ballY: number;
  vx: number;
  vy: number;
  bricks: Brick[];
  score: number;
  lives: number;
  phase: BreakoutPhase;
};

const COLORS = ["#22d3ee", "#a78bfa", "#f472b6", "#fbbf24", "#34d399"];

function makeBricks(): Brick[] {
  const totalGap = BRICK_GAP * (BRICK_COLS + 1);
  const brickW = (W - totalGap) / BRICK_COLS;
  const bricks: Brick[] = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: BRICK_GAP + c * (brickW + BRICK_GAP),
        y: BRICK_TOP + r * (BRICK_H + BRICK_GAP),
        w: brickW,
        h: BRICK_H,
        alive: true,
        color: COLORS[r % COLORS.length]!,
        points: (BRICK_ROWS - r) * 10,
      });
    }
  }
  return bricks;
}

export function createInitialState(): BreakoutState {
  const paddleX = (W - PADDLE_W) / 2;
  return {
    paddleX,
    ballX: W / 2,
    ballY: H - 60,
    vx: 0,
    vy: 0,
    bricks: makeBricks(),
    score: 0,
    lives: 3,
    phase: "ready",
  };
}

export function launch(state: BreakoutState): BreakoutState {
  if (state.phase !== "ready" && state.phase !== "playing") return state;
  if (state.vx !== 0 || state.vy !== 0) {
    return { ...state, phase: "playing" };
  }
  const angle = (-Math.PI / 4) * (0.7 + Math.random() * 0.6);
  const speed = 5.2;
  return {
    ...state,
    phase: "playing",
    vx: Math.cos(angle) * speed * (Math.random() > 0.5 ? 1 : -1),
    vy: -Math.abs(Math.sin(angle) * speed),
  };
}

export function setPaddle(state: BreakoutState, x: number): BreakoutState {
  const paddleX = Math.max(0, Math.min(W - PADDLE_W, x));
  if (state.phase === "ready" && state.vx === 0) {
    return {
      ...state,
      paddleX,
      ballX: paddleX + PADDLE_W / 2,
    };
  }
  return { ...state, paddleX };
}

function resetBall(state: BreakoutState): BreakoutState {
  return {
    ...state,
    ballX: state.paddleX + PADDLE_W / 2,
    ballY: H - 60,
    vx: 0,
    vy: 0,
    phase: "ready",
  };
}

export function step(state: BreakoutState, dt: number): BreakoutState {
  if (state.phase !== "playing") return state;
  if (state.vx === 0 && state.vy === 0) return state;

  const scale = dt * 60;
  let { ballX, ballY, vx, vy, paddleX, bricks, score, lives } = state;

  ballX += vx * scale;
  ballY += vy * scale;

  if (ballX < BALL_R) {
    ballX = BALL_R;
    vx = Math.abs(vx);
  } else if (ballX > W - BALL_R) {
    ballX = W - BALL_R;
    vx = -Math.abs(vx);
  }
  if (ballY < BALL_R) {
    ballY = BALL_R;
    vy = Math.abs(vy);
  }

  const paddleY = H - 28;
  if (
    vy > 0 &&
    ballY + BALL_R >= paddleY &&
    ballY - BALL_R <= paddleY + PADDLE_H &&
    ballX >= paddleX - BALL_R &&
    ballX <= paddleX + PADDLE_W + BALL_R
  ) {
    ballY = paddleY - BALL_R;
    const hit = (ballX - (paddleX + PADDLE_W / 2)) / (PADDLE_W / 2);
    const angle = hit * 1.1;
    const speed = Math.min(8.5, Math.hypot(vx, vy) * 1.03 + 0.05);
    vx = Math.sin(angle) * speed;
    vy = -Math.abs(Math.cos(angle) * speed);
  }

  let hitBrick = false;
  bricks = bricks.map((b) => {
    if (!b.alive || hitBrick) return b;
    if (
      ballX + BALL_R > b.x &&
      ballX - BALL_R < b.x + b.w &&
      ballY + BALL_R > b.y &&
      ballY - BALL_R < b.y + b.h
    ) {
      hitBrick = true;
      score += b.points;
      const overlapL = ballX + BALL_R - b.x;
      const overlapR = b.x + b.w - (ballX - BALL_R);
      const overlapT = ballY + BALL_R - b.y;
      const overlapB = b.y + b.h - (ballY - BALL_R);
      const minX = Math.min(overlapL, overlapR);
      const minY = Math.min(overlapT, overlapB);
      if (minX < minY) vx *= -1;
      else vy *= -1;
      return { ...b, alive: false };
    }
    return b;
  });

  if (bricks.every((b) => !b.alive)) {
    return {
      ...state,
      ballX,
      ballY,
      vx: 0,
      vy: 0,
      bricks,
      score: score + lives * 100,
      phase: "won",
    };
  }

  if (ballY > H + BALL_R * 2) {
    lives -= 1;
    if (lives <= 0) {
      return {
        ...state,
        ballX,
        ballY,
        vx: 0,
        vy: 0,
        bricks,
        score,
        lives: 0,
        phase: "lost",
      };
    }
    return resetBall({
      ...state,
      bricks,
      score,
      lives,
    });
  }

  return { ...state, ballX, ballY, vx, vy, bricks, score, lives };
}
