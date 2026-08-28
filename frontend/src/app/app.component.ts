import { ChangeDetectionStrategy, Component} from '@angular/core';
import { Game } from './components/game/game';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Game],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {}