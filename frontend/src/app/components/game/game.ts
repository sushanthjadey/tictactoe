import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { GameMode, GameState, Scoreboard } from '../../models/game.model';
import { GameService } from '../../core/services/game';


@Component({
  selector: 'app-game',
  standalone: true,
  templateUrl: './game.html',
  styleUrl: './game.scss'
})
export class Game implements OnInit {
  private readonly gameService = inject(GameService);
  private readonly changeDetector = inject(ChangeDetectorRef);

  game: GameState | null = null;
  selectedMode: GameMode = 'TwoPlayer';
  scoreboard: Scoreboard = {
    xWins: 0,
    oWins: 0,
    draws: 0
  };
  errorMessage = '';
  isMakingMove = false;
  isResetting = false;

  ngOnInit(): void {
    console.log('Game component initialized');
    this.createGame();
    this.loadScoreboard();
  }

  createGame(): void {
    console.log('1. createGame() called');
    console.log('2. Selected mode:', this.selectedMode);

    this.errorMessage = '';

    this.gameService.createGame(this.selectedMode).subscribe({
      next: game => {
        console.log('3. API SUCCESS');
        console.log('4. Game returned:', game);

        this.game = game;

        console.log('5. this.game:', this.game);

        this.changeDetector.detectChanges();
      },
      error: error => {
        console.error('Create game failed:', error);
        console.error('Status:', error.status);
        console.error('Response:', error.error);

        this.errorMessage =
          error?.error?.message ??
          'Unable to create game.';

        this.changeDetector.detectChanges();
      }
    });
  }

  selectMode(mode: GameMode): void {
    this.selectedMode = mode;
    this.createGame();
  }

onCellClicked(index: number): void {
  if (!this.game || this.isMakingMove) {
    return;
  }

  if (this.game.status !== 'InProgress') {
    return;
  }

  if (this.game.board[index] !== '') {
    return;
  }

  const gameId = this.game.gameId;
  const player = this.game.currentPlayer;
  const row = Math.floor(index / 3);
  const column = index % 3;

  this.isMakingMove = true;

  // Immediate UI update on single click
  const board = [...this.game.board];
  board[index] = player;

  this.game = {
    ...this.game,
    board
  };

  this.changeDetector.detectChanges();

  this.gameService
    .makeMove(gameId, player, row, column)
    .subscribe({
      next: game => {
        this.game = game;
        this.isMakingMove = false;

        this.changeDetector.detectChanges();

        if (
          game.status === 'Won' ||
          game.status === 'Draw'
        ) {
          this.loadScoreboard();
        }
      },
      error: error => {
        console.error('MOVE FAILED:', error);

        this.isMakingMove = false;

        this.gameService
          .getGame(gameId)
          .subscribe({
            next: game => {
              this.game = game;
              this.changeDetector.detectChanges();
            }
          });

        this.errorMessage =
          error?.error?.message ??
          'Unable to make move.';

        this.changeDetector.detectChanges();
      }
    });
}

  resetGame(): void {
    if (!this.game) {
      return;
    }

    if (this.isResetting) {
      return;
    }

    console.log('Resetting game:', this.game.gameId);

    this.isResetting = true;
    this.errorMessage = '';

    this.gameService
      .resetGame(this.game.gameId)
      .subscribe({
        next: game => {
          console.log('GAME RESET SUCCESS:', game);

          this.game = game;
          this.isResetting = false;

          this.changeDetector.detectChanges();
        },
        error: error => {
          console.error('RESET GAME FAILED:', error);
          console.error('Status:', error.status);
          console.error('Response:', error.error);

          this.errorMessage =
            error?.error?.message ??
            'Unable to reset game.';

          this.isResetting = false;

          this.changeDetector.detectChanges();
        }
      });
  }

  undo(): void {
    if (!this.game) {
      return;
    }

    if (this.isMakingMove) {
      return;
    }

    this.errorMessage = '';

    this.gameService
      .undo(this.game.gameId)
      .subscribe({
        next: game => {
          console.log('UNDO SUCCESS:', game);

          this.game = game;
          this.changeDetector.detectChanges();
        },
        error: error => {
          console.error('UNDO FAILED:', error);
          console.error('Status:', error.status);
          console.error('Response:', error.error);

          this.errorMessage =
            error?.error?.message ??
            'Unable to undo move.';

          this.changeDetector.detectChanges();
        }
      });
  }

  loadScoreboard(): void {
    this.gameService.getScoreboard().subscribe({
      next: scoreboard => {
        console.log('SCOREBOARD:', scoreboard);

        this.scoreboard = scoreboard;

        this.changeDetector.detectChanges();
      },
      error: error => {
        console.error('LOAD SCOREBOARD FAILED:', error);
        console.error('Status:', error.status);
        console.error('Response:', error.error);

        this.changeDetector.detectChanges();
      }
    });
  }

  resetScoreboard(): void {
    this.gameService.resetScoreboard().subscribe({
      next: scoreboard => {
        console.log('SCOREBOARD RESET:', scoreboard);

        this.scoreboard = scoreboard;

        this.changeDetector.detectChanges();
      },
      error: error => {
        console.error('RESET SCOREBOARD FAILED:', error);
        console.error('Status:', error.status);
        console.error('Response:', error.error);

        this.changeDetector.detectChanges();
      }
    });
  }
}