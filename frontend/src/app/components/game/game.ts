import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { GameMode, GameState, Scoreboard } from '../../models/game.model';
import { GameService } from '../../core/services/game';
import { BoardComponent } from '../board/board';
import { StatusComponent } from '../status/status';
import { MoveHistoryComponent } from '../move-history/move-history';
import { Scoreboard as ScoreboardComponent } from '../scoreboard/scoreboard';

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [
    BoardComponent,
    StatusComponent,
    MoveHistoryComponent,
    ScoreboardComponent
  ],
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
    this.createGame();
    this.loadScoreboard();
  }

  selectMode(mode: GameMode): void {
    if (this.isMakingMove) {
      return;
    }
    this.selectedMode = mode;
    this.createGame();
  }

  createGame(): void {
    this.errorMessage = '';
    this.gameService.createGame(this.selectedMode).subscribe({
      next: (game: GameState) => {
        this.game = game;
        this.changeDetector.detectChanges();
      },
      error: (error: any) => {
        console.error('Create game failed:', error);
        this.errorMessage = error?.error?.message ?? 'Unable to create game.';
        this.changeDetector.detectChanges();
      }
    });
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

    const board = [...this.game.board];
    board[index] = player;

    this.game = {
      ...this.game,
      board
    };

    this.changeDetector.detectChanges();

    this.gameService.makeMove(gameId, player, row, column).subscribe({
      next: (game: GameState) => {
        this.game = game;
        this.isMakingMove = false;
        this.changeDetector.detectChanges();

        if (game.status === 'Won' || game.status === 'Draw') {
          this.loadScoreboard();
        }
      },
      error: (error: any) => {
        console.error('MOVE FAILED:', error);
        this.isMakingMove = false;

        this.gameService.getGame(gameId).subscribe({
          next: (game: GameState) => {
            this.game = game;
            this.changeDetector.detectChanges();
          }
        });

        this.errorMessage = error?.error?.message ?? 'Unable to make move.';
        this.changeDetector.detectChanges();
      }
    });
  }

  resetGame(): void {
    if (!this.game || this.isResetting) {
      return;
    }

    this.isResetting = true;
    this.errorMessage = '';

    this.gameService.resetGame(this.game.gameId).subscribe({
      next: (game: GameState) => {
        this.game = game;
        this.isResetting = false;
        this.changeDetector.detectChanges();
      },
      error: (error: any) => {
        console.error('RESET GAME FAILED:', error);
        this.errorMessage = error?.error?.message ?? 'Unable to reset game.';
        this.isResetting = false;
        this.changeDetector.detectChanges();
      }
    });
  }

  undo(): void {
    if (!this.game || this.isMakingMove) {
      return;
    }

    if (this.game.moveHistory.length === 0) {
      return;
    }

    this.errorMessage = '';

    this.gameService.undo(this.game.gameId).subscribe({
      next: (game: GameState) => {
        this.game = game;
        this.changeDetector.detectChanges();
      },
      error: (error: any) => {
        console.error('UNDO FAILED:', error);
        this.errorMessage = error?.error?.message ?? 'Unable to undo move.';
        this.changeDetector.detectChanges();
      }
    });
  }

  loadScoreboard(): void {
    this.gameService.getScoreboard().subscribe({
      next: (scoreboard: Scoreboard) => {
        this.scoreboard = scoreboard;
        this.changeDetector.detectChanges();
      },
      error: (error: any) => {
        console.error('LOAD SCOREBOARD FAILED:', error);
        this.changeDetector.detectChanges();
      }
    });
  }

  resetScoreboard(): void {
    this.gameService.resetScoreboard().subscribe({
      next: (scoreboard: Scoreboard) => {
        this.scoreboard = scoreboard;
        this.changeDetector.detectChanges();
      },
      error: (error: any) => {
        console.error('RESET SCOREBOARD FAILED:', error);
        this.changeDetector.detectChanges();
      }
    });
  }
}