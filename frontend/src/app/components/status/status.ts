import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { GameStatus, Player } from '../../models/game.model';

@Component({
  selector: 'app-status',
  standalone: true,
  templateUrl: './status.html',
  styleUrl: './status.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusComponent {
  readonly status = input.required<GameStatus>();
  readonly currentPlayer = input<Player | null>(null);
  readonly winner = input<Player | null>(null);
}