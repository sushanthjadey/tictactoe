import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GameState } from '../../models/game.model';

@Component({
  selector: 'app-board',
  standalone: true,
  templateUrl: './board.html',
  styleUrl: './board.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardComponent {
  readonly game = input.required<GameState>();
  readonly cellClicked = output<number>();

  isWinningCell(index: number): boolean {
    return this.game().winningCells.includes(index);
  }

  isDisabled(index: number): boolean {
    const game = this.game();
    if (game.status !== 'InProgress') {
      return true;
    }
    if (game.board[index] !== '') {
      return true;
    }
    if (game.mode === 'Computer' && game.currentPlayer !== 'X') {
      return true;
    }
    return false;
  }

  onCellClick(index: number): void {
    if (this.isDisabled(index)) {
      return;
    }
    this.cellClicked.emit(index);
  }
}