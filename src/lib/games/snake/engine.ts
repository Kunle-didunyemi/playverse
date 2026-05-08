export type Direction = "up" | "down" | "left" | "right";

export interface Point {
  x: number;
  y: number;
}

export interface SnakeState {
  snake: Point[];
  food: Point;
  direction: Direction;
  nextDirection: Direction;
  score: number;
  gameOver: boolean;
  speed: number;
}

export const GRID_SIZE = 20;
export const INITIAL_SPEED = 150;
const SPEED_INCREMENT = 2;
const MIN_SPEED = 60;

function randomFoodPosition(snake: Point[]): Point {
  const occupied = new Set(snake.map((p) => `${p.x},${p.y}`));
  const candidates: Point[] = [];
  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!occupied.has(`${x},${y}`)) candidates.push({ x, y });
    }
  }
  if (candidates.length === 0) return { x: -1, y: -1 };
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export function createInitialState(): SnakeState {
  const center = Math.floor(GRID_SIZE / 2);
  const snake: Point[] = [
    { x: center, y: center },
    { x: center - 1, y: center },
    { x: center - 2, y: center },
  ];
  return {
    snake,
    food: randomFoodPosition(snake),
    direction: "right",
    nextDirection: "right",
    score: 0,
    gameOver: false,
    speed: INITIAL_SPEED,
  };
}

const OPPOSITE: Record<Direction, Direction> = {
  up: "down",
  down: "up",
  left: "right",
  right: "left",
};

export function changeDirection(state: SnakeState, dir: Direction): SnakeState {
  if (OPPOSITE[dir] === state.direction) return state;
  return { ...state, nextDirection: dir };
}

export function tick(state: SnakeState): SnakeState {
  if (state.gameOver) return state;

  const direction = state.nextDirection;
  const head = state.snake[0];

  const delta: Record<Direction, Point> = {
    up: { x: 0, y: -1 },
    down: { x: 0, y: 1 },
    left: { x: -1, y: 0 },
    right: { x: 1, y: 0 },
  };

  const d = delta[direction];
  const newHead: Point = { x: head.x + d.x, y: head.y + d.y };

  if (
    newHead.x < 0 ||
    newHead.x >= GRID_SIZE ||
    newHead.y < 0 ||
    newHead.y >= GRID_SIZE
  ) {
    return { ...state, direction, gameOver: true };
  }

  const hitSelf = state.snake.some(
    (p, i) => i > 0 && p.x === newHead.x && p.y === newHead.y
  );
  if (hitSelf) {
    return { ...state, direction, gameOver: true };
  }

  const ate = newHead.x === state.food.x && newHead.y === state.food.y;
  const newSnake = [newHead, ...state.snake];
  if (!ate) newSnake.pop();

  const newScore = ate ? state.score + 10 : state.score;
  const newSpeed = ate
    ? Math.max(MIN_SPEED, state.speed - SPEED_INCREMENT)
    : state.speed;
  const newFood = ate ? randomFoodPosition(newSnake) : state.food;

  return {
    snake: newSnake,
    food: newFood,
    direction,
    nextDirection: direction,
    score: newScore,
    gameOver: false,
    speed: newSpeed,
  };
}
