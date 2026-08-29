import {
  TestBed
} from '@angular/core/testing';

import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';

import {
  GameService
} from './game';

import {
  GameMode,
  GameState,
  Scoreboard
} from '../../models/game.model';

import { vi } from 'vitest';

describe('GameService', () => {
  let service: GameService;
  let httpMock: HttpTestingController;

  const apiUrl =
    'http://localhost:5171/api';

  const gameResponse = {
    gameId: 'game-123',
    board: [
      '', '', '',
      '', '', '',
      '', '', ''
    ],
    currentPlayer: 'X',
    mode: 0,
    status: 0,
    winner: null,
    winningCells: [],
    moveHistory: []
  };

  const winningGameResponse = {
    gameId: 'game-123',
    board: [
      'X', 'X', 'X',
      'O', 'O', '',
      '', '', ''
    ],
    currentPlayer: 'X',
    mode: 0,
    status: 1,
    winner: 'X',
    winningCells: [0, 1, 2],
    moveHistory: [
      {
        number: 1,
        player: 'X',
        row: 0,
        column: 0
      },
      {
        number: 2,
        player: 'O',
        row: 1,
        column: 0
      }
    ]
  };

  const scoreboardResponse: Scoreboard = {
    xWins: 3,
    oWins: 2,
    draws: 1
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });

    service = TestBed.inject(
      GameService
    );

    httpMock = TestBed.inject(
      HttpTestingController
    );
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ====================================================
  // CREATE GAME
  // ====================================================

  describe('createGame', () => {

    it('should create a Two Player game', () => {
      service.createGame('TwoPlayer')
        .subscribe(game => {
          expect(game.gameId)
            .toBe('game-123');

          expect(game.mode)
            .toBe('TwoPlayer');

          expect(game.status)
            .toBe('InProgress');

          expect(game.currentPlayer)
            .toBe('X');
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games`
        );

      expect(request.request.method)
        .toBe('POST');

      expect(request.request.body)
        .toEqual({
          mode: 0
        });

      request.flush(
        gameResponse
      );
    });

    it('should create a Computer game', () => {
      service.createGame('Computer')
        .subscribe(game => {
          expect(game.mode)
            .toBe('Computer');

          expect(game.status)
            .toBe('InProgress');
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games`
        );

      expect(request.request.method)
        .toBe('POST');

      expect(request.request.body)
        .toEqual({
          mode: 1
        });

      request.flush({
        ...gameResponse,
        mode: 1
      });
    });

    it('should map backend mode 0 to TwoPlayer', () => {
      service.createGame('TwoPlayer')
        .subscribe(game => {
          expect(game.mode)
            .toBe('TwoPlayer');
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games`
        );

      request.flush({
        ...gameResponse,
        mode: 0
      });
    });

    it('should map backend mode 1 to Computer', () => {
      service.createGame('Computer')
        .subscribe(game => {
          expect(game.mode)
            .toBe('Computer');
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games`
        );

      request.flush({
        ...gameResponse,
        mode: 1
      });
    });

  });

  // ====================================================
  // GET GAME
  // ====================================================

  describe('getGame', () => {

    it('should get game by id', () => {
      service.getGame('game-123')
        .subscribe(game => {
          expect(game.gameId)
            .toBe('game-123');

          expect(game.board.length)
            .toBe(9);

          expect(game.currentPlayer)
            .toBe('X');
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123`
        );

      expect(request.request.method)
        .toBe('GET');

      request.flush(
        gameResponse
      );
    });

    it('should map game response correctly', () => {
      service.getGame('game-123')
        .subscribe(game => {
          expect(game).toEqual({
            gameId: 'game-123',
            board: [
              '', '', '',
              '', '', '',
              '', '', ''
            ],
            currentPlayer: 'X',
            mode: 'TwoPlayer',
            status: 'InProgress',
            winner: null,
            winningCells: [],
            moveHistory: []
          });
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123`
        );

      request.flush(
        gameResponse
      );
    });

  });

  // ====================================================
  // MAKE MOVE
  // ====================================================

  describe('makeMove', () => {

    it('should submit a player move', () => {
      service.makeMove(
        'game-123',
        'X',
        0,
        1
      ).subscribe(game => {
        expect(game.gameId)
          .toBe('game-123');
      });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123/moves`
        );

      expect(request.request.method)
        .toBe('POST');

      expect(request.request.body)
        .toEqual({
          player: 'X',
          row: 0,
          column: 1
        });

      request.flush(
        gameResponse
      );
    });

    it('should submit O move correctly', () => {
      service.makeMove(
        'game-123',
        'O',
        2,
        2
      ).subscribe();

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123/moves`
        );

      expect(request.request.body)
        .toEqual({
          player: 'O',
          row: 2,
          column: 2
        });

      request.flush(
        gameResponse
      );
    });

    it('should map winning game response', () => {
      service.makeMove(
        'game-123',
        'X',
        0,
        2
      ).subscribe(game => {
        expect(game.status)
          .toBe('Won');

        expect(game.winner)
          .toBe('X');

        expect(game.winningCells)
          .toEqual([
            0, 1, 2
          ]);

        expect(game.moveHistory.length)
          .toBe(2);
      });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123/moves`
        );

      request.flush(
        winningGameResponse
      );
    });

  });

  // ====================================================
  // UNDO
  // ====================================================

  describe('undo', () => {

    it('should send POST request to undo game', () => {
      service.undo('game-123')
        .subscribe(game => {
          expect(game.gameId)
            .toBe('game-123');
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123/undo`
        );

      expect(request.request.method)
        .toBe('POST');

      expect(request.request.body)
        .toEqual({});

      request.flush(
        gameResponse
      );
    });

    it('should map undo response correctly', () => {
      service.undo('game-123')
        .subscribe(game => {
          expect(game.mode)
            .toBe('TwoPlayer');

          expect(game.status)
            .toBe('InProgress');

          expect(game.currentPlayer)
            .toBe('X');
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123/undo`
        );

      request.flush(
        gameResponse
      );
    });

  });

  // ====================================================
  // RESET GAME
  // ====================================================

  describe('resetGame', () => {

    it('should send POST request to reset game', () => {
      service.resetGame('game-123')
        .subscribe(game => {
          expect(game.gameId)
            .toBe('game-123');

          expect(game.status)
            .toBe('InProgress');
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123/reset`
        );

      expect(request.request.method)
        .toBe('POST');

      expect(request.request.body)
        .toEqual({});

      request.flush(
        gameResponse
      );
    });

    it('should return a fresh game state after reset', () => {
      const resetResponse = {
        ...gameResponse,
        gameId: 'new-game-456'
      };

      service.resetGame('game-123')
        .subscribe(game => {
          expect(game.gameId)
            .toBe('new-game-456');

          expect(game.board)
            .toEqual([
              '', '', '',
              '', '', '',
              '', '', ''
            ]);

          expect(game.currentPlayer)
            .toBe('X');

          expect(game.moveHistory)
            .toEqual([]);
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123/reset`
        );

      request.flush(
        resetResponse
      );
    });

  });

  // ====================================================
  // SCOREBOARD
  // ====================================================

  describe('getScoreboard', () => {

    it('should get scoreboard', () => {
      service.getScoreboard()
        .subscribe(scoreboard => {
          expect(scoreboard)
            .toEqual(
              scoreboardResponse
            );
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/scoreboard`
        );

      expect(request.request.method)
        .toBe('GET');

      request.flush(
        scoreboardResponse
      );
    });

    it('should return X wins', () => {
      service.getScoreboard()
        .subscribe(scoreboard => {
          expect(scoreboard.xWins)
            .toBe(3);
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/scoreboard`
        );

      request.flush(
        scoreboardResponse
      );
    });

    it('should return O wins', () => {
      service.getScoreboard()
        .subscribe(scoreboard => {
          expect(scoreboard.oWins)
            .toBe(2);
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/scoreboard`
        );

      request.flush(
        scoreboardResponse
      );
    });

    it('should return draws', () => {
      service.getScoreboard()
        .subscribe(scoreboard => {
          expect(scoreboard.draws)
            .toBe(1);
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/scoreboard`
        );

      request.flush(
        scoreboardResponse
      );
    });

  });

  // ====================================================
  // RESET SCOREBOARD
  // ====================================================

  describe('resetScoreboard', () => {

    it('should send POST request to reset scoreboard', () => {
      service.resetScoreboard()
        .subscribe(scoreboard => {
          expect(scoreboard.xWins)
            .toBe(0);

          expect(scoreboard.oWins)
            .toBe(0);

          expect(scoreboard.draws)
            .toBe(0);
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/scoreboard/reset`
        );

      expect(request.request.method)
        .toBe('POST');

      expect(request.request.body)
        .toEqual({});

      request.flush({
        xWins: 0,
        oWins: 0,
        draws: 0
      });
    });

  });

  // ====================================================
  // GAME STATUS MAPPING
  // ====================================================

  describe('game status mapping', () => {

    it('should map status 0 to InProgress', () => {
      service.getGame('game-123')
        .subscribe(game => {
          expect(game.status)
            .toBe('InProgress');
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123`
        );

      request.flush({
        ...gameResponse,
        status: 0
      });
    });

    it('should map status 1 to Won', () => {
      service.getGame('game-123')
        .subscribe(game => {
          expect(game.status)
            .toBe('Won');
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123`
        );

      request.flush({
        ...gameResponse,
        status: 1,
        winner: 'X',
        winningCells: [0, 1, 2]
      });
    });

    it('should map status 2 to Draw', () => {
      service.getGame('game-123')
        .subscribe(game => {
          expect(game.status)
            .toBe('Draw');
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123`
        );

      request.flush({
        ...gameResponse,
        status: 2
      });
    });

  });

  // ====================================================
  // OPTIONAL FIELDS
  // ====================================================

  describe('response defaults', () => {

    it('should default winningCells to empty array when null', () => {
      service.getGame('game-123')
        .subscribe(game => {
          expect(game.winningCells)
            .toEqual([]);
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123`
        );

      request.flush({
        ...gameResponse,
        winningCells: null
      });
    });

    it('should default moveHistory to empty array when null', () => {
      service.getGame('game-123')
        .subscribe(game => {
          expect(game.moveHistory)
            .toEqual([]);
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123`
        );

      request.flush({
        ...gameResponse,
        moveHistory: null
      });
    });

  });

  // ====================================================
  // HTTP ERROR HANDLING
  // ====================================================

  describe('HTTP errors', () => {

    it('should propagate create game HTTP error', () => {
      service.createGame('TwoPlayer')
        .subscribe({
          next: () => {
            throw new Error('Expected an error');
          },
          error: error => {
            expect(error.status)
              .toBe(500);
          }
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games`
        );

      request.flush(
        'Server error',
        {
          status: 500,
          statusText: 'Internal Server Error'
        }
      );
    });

    it('should propagate get game HTTP error', () => {
      service.getGame('missing-game')
        .subscribe({
          next: () => {
            throw new Error('Expected an error');
          },
          error: error => {
            expect(error.status)
              .toBe(404);
          }
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/missing-game`
        );

      request.flush(
        'Game not found',
        {
          status: 404,
          statusText: 'Not Found'
        }
      );
    });

    it('should propagate move HTTP error', () => {
      service.makeMove(
        'game-123',
        'X',
        0,
        0
      ).subscribe({
        next: () => {
          throw new Error('Expected an error');
        },
        error: error => {
          expect(error.status)
            .toBe(400);
        }
      });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123/moves`
        );

      request.flush(
        {
          message: 'Cell is already occupied.'
        },
        {
          status: 400,
          statusText: 'Bad Request'
        }
      );
    });

    it('should propagate undo HTTP error', () => {
      service.undo('game-123')
        .subscribe({
          next: () => {
            throw new Error('Expected an error');
          },
          error: error => {
            expect(error.status)
              .toBe(400);
          }
        });

      const request =
        httpMock.expectOne(
          `${apiUrl}/games/game-123/undo`
        );

      request.flush(
        {
          message: 'No moves to undo.'
        },
        {
          status: 400,
          statusText: 'Bad Request'
        }
      );
    });

  });

});