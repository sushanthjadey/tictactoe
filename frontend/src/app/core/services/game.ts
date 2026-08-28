import {
  Injectable,
  inject
} from '@angular/core';

import {
  HttpClient
} from '@angular/common/http';

import {
  map,
  Observable
} from 'rxjs';

import {
  CreateGameRequest,
  GameMode,
  GameState,
  MoveRequest,
  Player,
  Scoreboard
} from '../../models/game.model';


@Injectable({
  providedIn: 'root'
})
export class GameService {

  private readonly http =
    inject(HttpClient);

  private readonly apiUrl =
    'http://localhost:5171/api';


  // ==========================================
  // CREATE GAME
  // ==========================================

  createGame(
    mode: GameMode
  ): Observable<GameState> {

    const modeValue =
      mode === 'TwoPlayer'
        ? 0
        : 1;

    const request:
      CreateGameRequest = {
        mode: modeValue
      };

    console.log(
      'Create game request:',
      request
    );

    return this.http
      .post<any>(
        `${this.apiUrl}/games`,
        request
      )
      .pipe(
        map(response =>
          this.mapGameState(response)
        )
      );
  }


  // ==========================================
  // GET GAME
  // ==========================================

  getGame(
    gameId: string
  ): Observable<GameState> {

    return this.http
      .get<any>(
        `${this.apiUrl}/games/${gameId}`
      )
      .pipe(
        map(response =>
          this.mapGameState(response)
        )
      );
  }


  // ==========================================
  // MAKE MOVE
  // ==========================================

  makeMove(
    gameId: string,
    player: Player,
    row: number,
    column: number
  ): Observable<GameState> {

    const request:
      MoveRequest = {
        player,
        row,
        column
      };

    return this.http
      .post<any>(
        `${this.apiUrl}/games/${gameId}/moves`,
        request
      )
      .pipe(
        map(response =>
          this.mapGameState(response)
        )
      );
  }


  // ==========================================
  // UNDO
  // ==========================================

  undo(
    gameId: string
  ): Observable<GameState> {

    return this.http
      .post<any>(
        `${this.apiUrl}/games/${gameId}/undo`,
        {}
      )
      .pipe(
        map(response =>
          this.mapGameState(response)
        )
      );
  }


  // ==========================================
  // RESET GAME
  // ==========================================

  resetGame(
    gameId: string
  ): Observable<GameState> {

    return this.http
      .post<any>(
        `${this.apiUrl}/games/${gameId}/reset`,
        {}
      )
      .pipe(
        map(response =>
          this.mapGameState(response)
        )
      );
  }


  // ==========================================
  // SCOREBOARD
  // ==========================================

  getScoreboard() {

    return this.http.get<Scoreboard>(
      `${this.apiUrl}/scoreboard`
    );

  }


  resetScoreboard() {

    return this.http.post<Scoreboard>(
      `${this.apiUrl}/scoreboard/reset`,
      {}
    );

  }


  // ==========================================
  // API → FRONTEND MAPPING
  // ==========================================

  private mapGameState(
    response: any
  ): GameState {

    return {

      gameId:
        response.gameId,

      board:
        response.board,

      currentPlayer:
        response.currentPlayer,

      mode:
        this.mapGameMode(
          response.mode
        ),

      status:
        this.mapGameStatus(
          response.status
        ),

      winner:
        response.winner,

      winningCells:
        response.winningCells ?? [],

      moveHistory:
        response.moveHistory ?? []

    };

  }


  private mapGameMode(
    mode: number
  ): GameMode {

    switch (mode) {

      case 0:
        return 'TwoPlayer';

      case 1:
        return 'Computer';

      default:
        throw new Error(
          `Unknown game mode: ${mode}`
        );

    }

  }


  private mapGameStatus(
    status: number
  ): GameState['status'] {

    switch (status) {

      case 0:
        return 'InProgress';

      case 1:
        return 'Won';

      case 2:
        return 'Draw';

      default:
        throw new Error(
          `Unknown game status: ${status}`
        );

    }

  }

}