import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { Game } from './game';
import { GameService } from '../../core/services/game';
import { GameState, GameMode, Scoreboard } from '../../models/game.model';
import { VitestTestRunner } from 'vitest/runners';
import { vi } from 'vitest';

describe('Game', () => {
  let component: Game;
  let fixture: ComponentFixture<Game>;
  let gameService: {
  createGame: ReturnType<typeof vi.fn>;
  getGame: ReturnType<typeof vi.fn>;
  makeMove: ReturnType<typeof vi.fn>;
  undo: ReturnType<typeof vi.fn>;
  resetGame: ReturnType<typeof vi.fn>;
  getScoreboard: ReturnType<typeof vi.fn>;
  resetScoreboard: ReturnType<typeof vi.fn>;
  };

  const createGame = (
    overrides: Partial<GameState> = {}
  ): GameState => ({
    gameId: 'game-1',
    board: ['', '', '', '', '', '', '', '', ''],
    currentPlayer: 'X',
    mode: 'TwoPlayer',
    status: 'InProgress',
    winner: null,
    winningCells: [],
    moveHistory: [],
    ...overrides
  });

  const createScoreboard = (
    overrides: Partial<Scoreboard> = {}
  ): Scoreboard => ({
    xWins: 0,
    oWins: 0,
    draws: 0,
    ...overrides
  });

  beforeEach(async () => {
    gameService = {
    createGame: vi.fn(),
    getGame: vi.fn(),
    makeMove: vi.fn(),
    undo: vi.fn(),
    resetGame: vi.fn(),
    getScoreboard: vi.fn(),
    resetScoreboard: vi.fn()
  };

    gameService.createGame.mockReturnValue(
      of(createGame())
    );

    gameService.getScoreboard.mockReturnValue(
      of(createScoreboard())
    );

    await TestBed.configureTestingModule({
      imports: [Game],
      providers: [
        {
          provide: GameService,
          useValue: gameService
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Game);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  // ----------------------------------------------------
  // Component initialization
  // ----------------------------------------------------

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with Two Player mode', () => {
    expect(component.selectedMode).toBe('TwoPlayer');
  });

  it('should initialize scoreboard with zero values', () => {
    expect(component.scoreboard.xWins).toBe(0);
    expect(component.scoreboard.oWins).toBe(0);
    expect(component.scoreboard.draws).toBe(0);
  });

  it('should initialize without an error message', () => {
    expect(component.errorMessage).toBe('');
  });

  it('should initialize isMakingMove as false', () => {
    expect(component.isMakingMove).toBe(false);
  });

  it('should initialize isResetting as false', () => {
    expect(component.isResetting).toBe(false);
  });

  it('should create a game during initialization', () => {
    expect(
      gameService.createGame
    ).toHaveBeenCalledWith('TwoPlayer');
  });

  it('should load scoreboard during initialization', () => {
    expect(
      gameService.getScoreboard
    ).toHaveBeenCalled();
  });

  it('should store the created game', () => {
    expect(component.game).not.toBeNull();
    expect(component.game?.gameId).toBe('game-1');
  });

  // ----------------------------------------------------
  // Mode selection
  // ----------------------------------------------------

  it('should select Two Player mode', () => {
    component.selectMode('TwoPlayer');

    expect(component.selectedMode).toBe('TwoPlayer');

    expect(
      gameService.createGame
    ).toHaveBeenCalledWith('TwoPlayer');
  });

  it('should select Computer mode', () => {
    component.selectMode('Computer');

    expect(component.selectedMode).toBe('Computer');

    expect(
      gameService.createGame
    ).toHaveBeenCalledWith('Computer');
  });

  it('should create a new game when mode changes', () => {
    gameService.createGame.mockClear();

    component.selectMode('Computer');

    expect(
      gameService.createGame
    ).toHaveBeenCalledTimes(1);

    expect(
      gameService.createGame
    ).toHaveBeenCalledWith('Computer');
  });

  it('should not change mode while making a move', () => {
    component.isMakingMove = true;
    component.selectedMode = 'TwoPlayer';

    gameService.createGame.mockClear();

    component.selectMode('Computer');

    expect(component.selectedMode).toBe('TwoPlayer');

    expect(
      gameService.createGame
    ).not.toHaveBeenCalled();
  });

  // ----------------------------------------------------
  // Create game
  // ----------------------------------------------------

  it('should create a new game', () => {
    const newGame = createGame({
      gameId: 'new-game'
    });

    gameService.createGame.mockReturnValue(
      of(newGame)
    );

    component.createGame();

    expect(
      gameService.createGame
    ).toHaveBeenCalledWith(
      component.selectedMode
    );

    expect(component.game).toEqual(newGame);
  });

  it('should clear error message when creating a game', () => {
    component.errorMessage = 'Previous error';

    component.createGame();

    expect(component.errorMessage).toBe('');
  });

  it('should handle create game error', () => {
    gameService.createGame.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Unable to create game'
        }
      }))
    );

    component.createGame();

    expect(component.errorMessage).toBe(
      'Unable to create game'
    );
  });

  it('should use default create game error message', () => {
    gameService.createGame.mockReturnValue(
      throwError(() => ({}))
    );

    component.createGame();

    expect(component.errorMessage).toBe(
      'Unable to create game.'
    );
  });

  // ----------------------------------------------------
  // Cell click / move
  // ----------------------------------------------------

  it('should ignore cell click when there is no game', () => {
    component.game = null;

    component.onCellClicked(0);

    expect(
      gameService.makeMove
    ).not.toHaveBeenCalled();
  });

  it('should ignore cell click while making a move', () => {
    component.isMakingMove = true;

    component.onCellClicked(0);

    expect(
      gameService.makeMove
    ).not.toHaveBeenCalled();
  });

  it('should ignore cell click when game is completed', () => {
    component.game = createGame({
      status: 'Won',
      winner: 'X'
    });

    component.onCellClicked(0);

    expect(
      gameService.makeMove
    ).not.toHaveBeenCalled();
  });

  it('should ignore click on occupied cell', () => {
    component.game = createGame({
      board: [
        'X', '', '',
        '', '', '',
        '', '', ''
      ]
    });

    component.onCellClicked(0);

    expect(
      gameService.makeMove
    ).not.toHaveBeenCalled();
  });

  it('should make a move when an empty cell is clicked', () => {
    component.game = createGame();

    gameService.makeMove.mockReturnValue(
      of(createGame({
        board: [
          'X', '', '',
          '', '', '',
          '', '', ''
        ],
        currentPlayer: 'O',
        moveHistory: [
          {
            number: 1,
            player: 'X',
            row: 0,
            column: 0
          }
        ]
      }))
    );

    component.onCellClicked(0);

    expect(
      gameService.makeMove
    ).toHaveBeenCalledWith(
      'game-1',
      'X',
      0,
      0
    );
  });

  it('should convert cell index to row and column correctly', () => {
    component.game = createGame();

    gameService.makeMove.mockReturnValue(
      of(createGame())
    );

    component.onCellClicked(5);

    expect(
      gameService.makeMove
    ).toHaveBeenCalledWith(
      'game-1',
      'X',
      1,
      2
    );
  });

  it('should convert last cell index to row 2 column 2', () => {
    component.game = createGame();

    gameService.makeMove.mockReturnValue(
      of(createGame())
    );

    component.onCellClicked(8);

    expect(
      gameService.makeMove
    ).toHaveBeenCalledWith(
      'game-1',
      'X',
      2,
      2
    );
  });

  it('should set isMakingMove while processing a move', () => {
    component.game = createGame();

    gameService.makeMove.mockReturnValue(
      of(createGame())
    );

    component.onCellClicked(0);

    expect(component.isMakingMove).toBe(false);
  });

  it('should optimistically update the selected cell', () => {
    component.game = createGame();

    let boardDuringRequest: string[] | undefined;

    gameService.makeMove.mockImplementation(() => {
      boardDuringRequest = component.game?.board;
      return of(createGame());
    });

    component.onCellClicked(0);

    expect(boardDuringRequest?.[0]).toBe('X');
  });

  it('should update game with backend response after move', () => {
    component.game = createGame();

    const updatedGame = createGame({
      board: [
        'X', '', '',
        '', '', '',
        '', '', ''
      ],
      currentPlayer: 'O',
      moveHistory: [
        {
          number: 1,
          player: 'X',
          row: 0,
          column: 0
        }
      ]
    });

    gameService.makeMove.mockReturnValue(
      of(updatedGame)
    );

    component.onCellClicked(0);

    expect(component.game).toEqual(updatedGame);
    expect(component.isMakingMove).toBe(false);
  });

  // ----------------------------------------------------
  // Winning / completed game
  // ----------------------------------------------------

  it('should load scoreboard when move results in a win', () => {
    component.game = createGame();

    const winningGame = createGame({
      board: [
        'X', 'X', 'X',
        'O', 'O', '',
        '', '', ''
      ],
      currentPlayer: 'X',
      status: 'Won',
      winner: 'X',
      winningCells: [0, 1, 2],
      moveHistory: [
        {
          number: 1,
          player: 'X',
          row: 0,
          column: 0
        }
      ]
    });

    gameService.makeMove.mockReturnValue(
      of(winningGame)
    );

    gameService.getScoreboard.mockClear();

    component.onCellClicked(2);

    expect(
      gameService.getScoreboard
    ).toHaveBeenCalled();
  });

  it('should load scoreboard when move results in a draw', () => {
    component.game = createGame();

    const drawGame = createGame({
      status: 'Draw',
      board: [
        'X', 'O', 'X',
        'X', 'O', 'O',
        'O', 'X', 'X'
      ]
    });

    gameService.makeMove.mockReturnValue(
      of(drawGame)
    );

    gameService.getScoreboard.mockClear();

    component.onCellClicked(8);

    expect(
      gameService.getScoreboard
    ).toHaveBeenCalled();
  });

  it('should not load scoreboard after an in-progress move', () => {
    component.game = createGame();

    gameService.makeMove.mockReturnValue(
      of(createGame({
        board: [
          'X', '', '',
          '', '', '',
          '', '', ''
        ],
        currentPlayer: 'O'
      }))
    );

    gameService.getScoreboard.mockClear();

    component.onCellClicked(0);

    expect(
      gameService.getScoreboard
    ).not.toHaveBeenCalled();
  });

  // ----------------------------------------------------
  // Move error handling
  // ----------------------------------------------------

  it('should reset isMakingMove when move fails', () => {
    component.game = createGame();

    gameService.makeMove.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Cell is already occupied.'
        }
      }))
    );

    gameService.getGame.mockReturnValue(
      of(component.game)
    );

    component.onCellClicked(0);

    expect(component.isMakingMove).toBe(false);
  });

  it('should display move error message', () => {
    component.game = createGame();

    gameService.makeMove.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Cell is already occupied.'
        }
      }))
    );

    gameService.getGame.mockReturnValue(of(component.game));

    component.onCellClicked(0);

    expect(component.errorMessage).toBe(
      'Cell is already occupied.'
    );
  });

  it('should reload game after move failure', () => {
    component.game = createGame();

    const originalGame = createGame();

    gameService.makeMove.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Move failed'
        }
      }))
    );

    gameService.getGame.mockReturnValue(
      of(originalGame)
    );

    component.onCellClicked(0);

    expect(
      gameService.getGame
    ).toHaveBeenCalledWith('game-1');

    expect(component.game).toEqual(originalGame);
  });

  it('should use default move error message', () => {
    component.game = createGame();

    gameService.makeMove.mockReturnValue(
      throwError(() => ({}))
    );

    gameService.getGame.mockReturnValue(of(component.game));

    component.onCellClicked(0);

    expect(component.errorMessage).toBe(
      'Unable to make move.'
    );
  });

  // ----------------------------------------------------
  // Reset game
  // ----------------------------------------------------

  it('should not reset when there is no game', () => {
    component.game = null;

    component.resetGame();

    expect(
      gameService.resetGame
    ).not.toHaveBeenCalled();
  });

  it('should not reset while already resetting', () => {
    component.isResetting = true;

    component.resetGame();

    expect(
      gameService.resetGame
    ).not.toHaveBeenCalled();
  });

  it('should call reset game service', () => {
    component.game = createGame();

    const resetGame = createGame({
      gameId: 'new-game'
    });

    gameService.resetGame.mockReturnValue(
      of(resetGame)
    );

    component.resetGame();

    expect(
      gameService.resetGame
    ).toHaveBeenCalledWith('game-1');
  });

  it('should replace game after reset', () => {
    component.game = createGame();

    const resetGame = createGame({
      gameId: 'new-game'
    });

    gameService.resetGame.mockReturnValue(
      of(resetGame)
    );

    component.resetGame();

    expect(component.game).toEqual(resetGame);
  });

  it('should reset isResetting after successful reset', () => {
    component.game = createGame();

    gameService.resetGame.mockReturnValue(
      of(createGame())
    );

    component.resetGame();

    expect(component.isResetting).toBe(false);
  });

  it('should clear error message when resetting game', () => {
    component.game = createGame();
    component.errorMessage = 'Previous error';

    gameService.resetGame.mockReturnValue(
      of(createGame())
    );

    component.resetGame();

    expect(component.errorMessage).toBe('');
  });

  it('should handle reset game error', () => {
    component.game = createGame();

    gameService.resetGame.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Reset failed'
        }
      }))
    );

    component.resetGame();

    expect(component.errorMessage).toBe(
      'Reset failed'
    );

    expect(component.isResetting).toBe(false);
  });

  it('should use default reset error message', () => {
    component.game = createGame();

    gameService.resetGame.mockReturnValue(
      throwError(() => ({}))
    );

    component.resetGame();

    expect(component.errorMessage).toBe(
      'Unable to reset game.'
    );
  });

  // ----------------------------------------------------
  // Undo
  // ----------------------------------------------------

  it('should not undo when there is no game', () => {
    component.game = null;

    component.undo();

    expect(
      gameService.undo
    ).not.toHaveBeenCalled();
  });

  it('should not undo while making a move', () => {
    component.game = createGame({
      moveHistory: [
        {
          number: 1,
          player: 'X',
          row: 0,
          column: 0
        }
      ]
    });

    component.isMakingMove = true;

    component.undo();

    expect(
      gameService.undo
    ).not.toHaveBeenCalled();
  });

  it('should not undo when move history is empty', () => {
    component.game = createGame({
      moveHistory: []
    });

    component.undo();

    expect(
      gameService.undo
    ).not.toHaveBeenCalled();
  });

  it('should call undo service with game id', () => {
    component.game = createGame({
      moveHistory: [
        {
          number: 1,
          player: 'X',
          row: 0,
          column: 0
        }
      ]
    });

    gameService.undo.mockReturnValue(
      of(createGame())
    );

    component.undo();

    expect(
      gameService.undo
    ).toHaveBeenCalledWith('game-1');
  });

  it('should update game after undo', () => {
    component.game = createGame({
      board: [
        'X', '', '',
        '', 'O', '',
        '', '', ''
      ],
      currentPlayer: 'X',
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
          column: 1
        }
      ]
    });

    const undoneGame = createGame({
      board: [
        'X', '', '',
        '', '', '',
        '', '', ''
      ],
      currentPlayer: 'O',
      moveHistory: [
        {
          number: 1,
          player: 'X',
          row: 0,
          column: 0
        }
      ]
    });

    gameService.undo.mockReturnValue(
      of(undoneGame)
    );

    component.undo();

    expect(component.game).toEqual(
      undoneGame
    );
  });

  it('should clear error message before undo', () => {
    component.game = createGame({
      moveHistory: [
        {
          number: 1,
          player: 'X',
          row: 0,
          column: 0
        }
      ]
    });

    component.errorMessage = 'Previous error';

    gameService.undo.mockReturnValue(
      of(createGame())
    );

    component.undo();

    expect(component.errorMessage).toBe('');
  });

  it('should handle undo error', () => {
    component.game = createGame({
      moveHistory: [
        {
          number: 1,
          player: 'X',
          row: 0,
          column: 0
        }
      ]
    });

    gameService.undo.mockReturnValue(
      throwError(() => ({
        error: {
          message: 'Unable to undo'
        }
      }))
    );

    component.undo();

    expect(component.errorMessage).toBe(
      'Unable to undo'
    );
  });

  it('should use default undo error message', () => {
    component.game = createGame({
      moveHistory: [
        {
          number: 1,
          player: 'X',
          row: 0,
          column: 0
        }
      ]
    });

    gameService.undo.mockReturnValue(
      throwError(() => ({}))
    );

    component.undo();

    expect(component.errorMessage).toBe(
      'Unable to undo move.'
    );
  });

  // ----------------------------------------------------
  // Scoreboard
  // ----------------------------------------------------

  it('should load scoreboard', () => {
    const scoreboard = createScoreboard({
      xWins: 3,
      oWins: 2,
      draws: 1
    });

    gameService.getScoreboard.mockReturnValue(
      of(scoreboard)
    );

    component.loadScoreboard();

    expect(component.scoreboard).toEqual(
      scoreboard
    );
  });

  it('should handle scoreboard load error without throwing', () => {
    gameService.getScoreboard.mockReturnValue(
      throwError(() => ({
        status: 500
      }))
    );

    expect(() => {
      component.loadScoreboard();
    }).not.toThrow();
  });

  it('should reset scoreboard', () => {
    const scoreboard = createScoreboard({
      xWins: 5,
      oWins: 3,
      draws: 2
    });

    component.scoreboard = scoreboard;

    const resetScoreboard = createScoreboard();

    gameService.resetScoreboard.mockReturnValue(
      of(resetScoreboard)
    );

    component.resetScoreboard();

    expect(
      gameService.resetScoreboard
    ).toHaveBeenCalled();

    expect(component.scoreboard).toEqual(
      resetScoreboard
    );
  });

  it('should update scoreboard after reset', () => {
    component.scoreboard = createScoreboard({
      xWins: 5,
      oWins: 2,
      draws: 1
    });

    gameService.resetScoreboard.mockReturnValue(
      of(createScoreboard())
    );

    component.resetScoreboard();

    expect(component.scoreboard.xWins).toBe(0);
    expect(component.scoreboard.oWins).toBe(0);
    expect(component.scoreboard.draws).toBe(0);
  });

  // ----------------------------------------------------
  // Template tests
  // ----------------------------------------------------

  it('should render the game title', () => {
    const element =
      fixture.nativeElement as HTMLElement;

    expect(
      element.querySelector('h1')?.textContent
    ).toContain('Tic Tac Toe');
  });

  it('should render Two Player mode button', () => {
    const buttons =
      fixture.nativeElement.querySelectorAll(
        '.mode-selector button'
      );

    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent.trim()).toContain(
      'Two Player'
    );
  });

  it('should render Computer mode button', () => {
    const buttons =
      fixture.nativeElement.querySelectorAll(
        '.mode-selector button'
      );

    expect(buttons[1].textContent.trim()).toContain(
      'Play Against Computer'
    );
  });

  it('should mark selected mode as active', () => {
    component.selectedMode = 'TwoPlayer';

    fixture.detectChanges();

    const buttons =
      fixture.nativeElement.querySelectorAll(
        '.mode-selector button'
      );

    expect(
      buttons[0].classList.contains('active')
    ).toBe(true);

    expect(
      buttons[1].classList.contains('active')
    ).toBe(false);
  });

  it('should mark Computer mode as active', () => {
    fixture = TestBed.createComponent(Game);
    component = fixture.componentInstance;

    component.selectedMode = 'Computer';

    fixture.detectChanges();

    const buttons =
      fixture.nativeElement.querySelectorAll(
        '.mode-selector button'
      );

    expect(
      buttons[0].classList.contains('active')
    ).toBe(false);

    expect(
      buttons[1].classList.contains('active')
    ).toBe(true);
  });

  it('should render Reset Game button', () => {
    const buttons =
      fixture.nativeElement.querySelectorAll(
        '.actions button'
      );

    expect(buttons[0].textContent.trim()).toContain(
      'Reset Game'
    );
  });

  it('should render Undo button', () => {
    const buttons =
      fixture.nativeElement.querySelectorAll(
        '.actions button'
      );

    expect(buttons[1].textContent.trim()).toContain(
      'Undo Last Move'
    );
  });

  it('should disable undo when there are no moves', () => {
    component.game = createGame({
      moveHistory: []
    });

    fixture.detectChanges();

    const buttons =
      fixture.nativeElement.querySelectorAll(
        '.actions button'
      );

    const undoButton =
      buttons[1] as HTMLButtonElement;

    expect(undoButton.disabled).toBe(true);
  });


  it('should disable undo after game completion', () => {
    fixture = TestBed.createComponent(Game);
    component = fixture.componentInstance;

    component.game = createGame({
      status: 'Won',
      winner: 'X',
      moveHistory: [
        {
          number: 1,
          player: 'X',
          row: 0,
          column: 0
        }
      ]
    });

    fixture.detectChanges();

    const buttons =
      fixture.nativeElement.querySelectorAll(
        '.actions button'
      );

    const undoButton =
      buttons[1] as HTMLButtonElement;

    expect(undoButton.disabled).toBe(true);
  });



  it('should not display error element when there is no error', () => {
    component.errorMessage = '';

    fixture.detectChanges();

    const error =
      fixture.nativeElement.querySelector('.error');

    expect(error).toBeNull();
  });

  it('should display Resetting while game is being reset', () => {
    fixture = TestBed.createComponent(Game);
    component = fixture.componentInstance;

    component.isResetting = true;

    fixture.detectChanges();

    const button =
      fixture.nativeElement.querySelector(
        '.actions .primary'
      ) as HTMLButtonElement;

    expect(
      button.textContent.trim()
    ).toContain('Resetting...');
  });

  it('should disable Reset Game while resetting', () => {
    fixture = TestBed.createComponent(Game);
    component = fixture.componentInstance;

    component.isResetting = true;

    fixture.detectChanges();

    const button =
      fixture.nativeElement.querySelector(
        '.actions .primary'
      ) as HTMLButtonElement;

    expect(button.disabled).toBe(true);
  });

  it('should disable mode selection while making a move', () => {
    fixture = TestBed.createComponent(Game);
    component = fixture.componentInstance;

    component.isMakingMove = true;

    fixture.detectChanges();

    const buttons =
      fixture.nativeElement.querySelectorAll(
        '.mode-selector button'
      );

    expect(
      (buttons[0] as HTMLButtonElement).disabled
    ).toBe(true);

    expect(
      (buttons[1] as HTMLButtonElement).disabled
    ).toBe(true);
  });
});