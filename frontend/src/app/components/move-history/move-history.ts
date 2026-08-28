import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Move } from '../../models/game.model';

@Component({
  selector: 'app-move-history',
  standalone: true,
  templateUrl: './move-history.html',
  styleUrl: './move-history.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MoveHistoryComponent {
  readonly moves = input.required<Move[]>();
  readonly undoClicked = output<void>();

  onUndo(): void {
    this.undoClicked.emit();
  }
}