export type GameMode =
  | 'TwoPlayer'
  | 'Computer';

export type GameStatus =
  | 'InProgress'
  | 'Won'
  | 'Draw';

export type Player =
  | 'X'
  | 'O';

export interface Move {
  number: number;
  player: Player;
  row: number;
  column: number;
}

export interface GameState {
  gameId: string;
  board: string[];
  currentPlayer: Player;
  mode: GameMode;
  status: GameStatus;
  winner: Player | null;
  winningCells: number[];
  moveHistory: Move[];
}

export interface Scoreboard {
  xWins: number;
  oWins: number;
  draws: number;
}

export interface CreateGameRequest {
  mode: number;
}

export interface MoveRequest {
  player: Player;
  row: number;
  column: number;
}