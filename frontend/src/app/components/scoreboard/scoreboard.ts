import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Scoreboard as ScoreboardModel } from '../../models/game.model';

@Component({
  selector: 'app-scoreboard',
  standalone: true,
  templateUrl: './scoreboard.html',
  styleUrl: './scoreboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Scoreboard {
  readonly scoreboard = input.required<ScoreboardModel>();
  readonly resetClicked = output<void>();

  onReset(): void {
    this.resetClicked.emit();
  }
}