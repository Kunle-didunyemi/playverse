export type Direction = "up" | "down" | "left" | "right";

export interface Tile {
  id: number;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

export interface GameState {
  tiles: Tile[];
  score: number;
  gameOver: boolean;
  won: boolean;
}

export interface MoveResult {
  tiles: Tile[];
  scoreGained: number;
  moved: boolean;
}

let _nextId = 1;
export function nextId(): number {
  return _nextId++;
}
export function resetIdCounter(): void {
  _nextId = 1;
}

const SIZE = 4;

function emptyPositions(tiles: Tile[]): [number, number][] {
  const occupied = new Set(tiles.map((t) => `${t.row},${t.col}`));
  const positions: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (!occupied.has(`${r},${c}`)) positions.push([r, c]);
    }
  }
  return positions;
}

export function addRandomTile(tiles: Tile[]): Tile[] {
  const empty = emptyPositions(tiles);
  if (empty.length === 0) return tiles;
  const [row, col] = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;
  return [...tiles, { id: nextId(), value, row, col, isNew: true }];
}

export function createInitialTiles(): Tile[] {
  resetIdCounter();
  let tiles: Tile[] = [];
  tiles = addRandomTile(tiles);
  tiles = addRandomTile(tiles);
  return tiles;
}

function tileAt(tiles: Tile[], row: number, col: number): Tile | undefined {
  return tiles.find((t) => t.row === row && t.col === col);
}

function slideLine(line: Tile[], getPos: (index: number) => [number, number]): { tiles: Tile[]; score: number; moved: boolean } {
  const result: Tile[] = [];
  let score = 0;
  let moved = false;
  const filtered = line.filter((t) => t.value !== 0);

  let idx = 0;
  for (let i = 0; i < filtered.length; i++) {
    if (
      i + 1 < filtered.length &&
      filtered[i].value === filtered[i + 1].value
    ) {
      const newValue = filtered[i].value * 2;
      const [row, col] = getPos(idx);
      result.push({
        id: nextId(),
        value: newValue,
        row,
        col,
        isMerged: true,
      });
      score += newValue;
      if (filtered[i].row !== row || filtered[i].col !== col) moved = true;
      if (filtered[i + 1].row !== row || filtered[i + 1].col !== col) moved = true;
      i++;
    } else {
      const [row, col] = getPos(idx);
      if (filtered[i].row !== row || filtered[i].col !== col) moved = true;
      result.push({
        id: filtered[i].id,
        value: filtered[i].value,
        row,
        col,
      });
    }
    idx++;
  }

  return { tiles: result, score, moved };
}

export function move(tiles: Tile[], direction: Direction): MoveResult {
  const cleanTiles = tiles.map((t) => ({
    ...t,
    isNew: false,
    isMerged: false,
  }));

  let allResultTiles: Tile[] = [];
  let totalScore = 0;
  let anyMoved = false;

  for (let i = 0; i < SIZE; i++) {
    let line: Tile[] = [];
    let getPos: (index: number) => [number, number];

    switch (direction) {
      case "left":
        line = [];
        for (let c = 0; c < SIZE; c++) {
          const t = tileAt(cleanTiles, i, c);
          if (t) line.push(t);
        }
        getPos = (idx) => [i, idx];
        break;
      case "right":
        line = [];
        for (let c = SIZE - 1; c >= 0; c--) {
          const t = tileAt(cleanTiles, i, c);
          if (t) line.push(t);
        }
        getPos = (idx) => [i, SIZE - 1 - idx];
        break;
      case "up":
        line = [];
        for (let r = 0; r < SIZE; r++) {
          const t = tileAt(cleanTiles, r, i);
          if (t) line.push(t);
        }
        getPos = (idx) => [idx, i];
        break;
      case "down":
        line = [];
        for (let r = SIZE - 1; r >= 0; r--) {
          const t = tileAt(cleanTiles, r, i);
          if (t) line.push(t);
        }
        getPos = (idx) => [SIZE - 1 - idx, i];
        break;
    }

    const result = slideLine(line, getPos);
    allResultTiles = allResultTiles.concat(result.tiles);
    totalScore += result.score;
    if (result.moved) anyMoved = true;
  }

  return { tiles: allResultTiles, scoreGained: totalScore, moved: anyMoved };
}

export function isGameOver(tiles: Tile[]): boolean {
  if (tiles.length < SIZE * SIZE) return false;
  for (const dir of ["up", "down", "left", "right"] as Direction[]) {
    const { moved } = move(tiles, dir);
    if (moved) return false;
  }
  return true;
}

export function hasWon(tiles: Tile[]): boolean {
  return tiles.some((t) => t.value >= 2048);
}
